import {configureStore} from '@reduxjs/toolkit';

import {validate} from '../src/screens/PersonalDataView';
import {
  toApiGender,
  toPickerGender,
} from '../src/screens/PersonalDataView/StatPickerModal';
import {
  MIN_PASSWORD_LENGTH,
  validatePasswordForm,
} from '../src/screens/PersonalDataView/ChangePasswordModal';
import homeReducer, {updateProfile} from '../src/slice/HomeSlice';
import axiosInstance from '../src/axiosConfig';

jest.mock('../src/axiosConfig', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

const mockedPut = axiosInstance.put as jest.Mock;

const makeStore = () => configureStore({reducer: {home: homeReducer}});

describe('validate', () => {
  test('accepts untouched fields', () => {
    expect(validate({})).toEqual({});
  });

  test('rejects an empty name', () => {
    expect(validate({name: '   '})).toEqual({name: 'Name is required'});
  });

  test('rejects a name over 255 characters', () => {
    expect(validate({name: 'a'.repeat(256)})).toEqual({
      name: 'Name is too long',
    });
  });

  test('rejects a malformed email', () => {
    expect(validate({email: 'not-an-email'})).toEqual({
      email: 'Enter a valid email',
    });
  });

  test('accepts a well-formed email', () => {
    expect(validate({email: 'john.updated@example.com'})).toEqual({});
  });

  test('rejects a phone number over 30 characters', () => {
    expect(validate({phone_number: '1'.repeat(31)})).toEqual({
      phone_number: 'Phone number is too long',
    });
  });

  test('accepts a cleared phone number', () => {
    expect(validate({phone_number: ''})).toEqual({});
  });
});

describe('gender mapping', () => {
  test('converts picker codes to the values the endpoint expects', () => {
    expect(toApiGender('m')).toBe('male');
    expect(toApiGender('f')).toBe('female');
  });

  test('is idempotent, so a saved value survives a reopen', () => {
    expect(toApiGender('male')).toBe('male');
    expect(toApiGender('female')).toBe('female');
  });

  test('maps the API value back to the code the picker highlights', () => {
    expect(toPickerGender('male')).toBe('m');
    expect(toPickerGender('female')).toBe('f');
    expect(toPickerGender('')).toBeNull();
  });
});

describe('validatePasswordForm', () => {
  const valid = {
    current_password: 'SecureP@ss123!',
    password: 'NewSecureP@ss456!',
    password_confirmation: 'NewSecureP@ss456!',
  };

  test('accepts a fully filled, matching form', () => {
    expect(validatePasswordForm(valid)).toEqual({});
  });

  test('requires the current password', () => {
    expect(validatePasswordForm({...valid, current_password: ''})).toEqual({
      current_password: 'Current password is required',
    });
  });

  test('rejects a new password shorter than the minimum', () => {
    const errors = validatePasswordForm({
      ...valid,
      password: 'short',
      password_confirmation: 'short',
    });

    expect(errors.password).toBe(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    );
  });

  test('rejects a new password identical to the current one', () => {
    const errors = validatePasswordForm({
      current_password: 'SecureP@ss123!',
      password: 'SecureP@ss123!',
      password_confirmation: 'SecureP@ss123!',
    });

    expect(errors.password).toBe(
      'New password must be different from the current one',
    );
  });

  test('rejects a confirmation that does not match', () => {
    const errors = validatePasswordForm({
      ...valid,
      password_confirmation: 'SomethingElse123!',
    });

    expect(errors.password_confirmation).toBe('Passwords do not match');
  });

  test('requires the confirmation to be filled', () => {
    const errors = validatePasswordForm({...valid, password_confirmation: ''});

    expect(errors.password_confirmation).toBe(
      'Please confirm your new password',
    );
  });
});

describe('updateProfile', () => {
  beforeEach(() => {
    mockedPut.mockReset();
  });

  test('puts only the dirty fields to /auth/profile', async () => {
    mockedPut.mockResolvedValue({data: {success: true, data: {user: {}}}});
    const store = makeStore();

    await store.dispatch(updateProfile({height_cm: 181, gender: 'female'}));

    expect(mockedPut).toHaveBeenCalledWith('/auth/profile', {
      height_cm: 181,
      gender: 'female',
    });
  });

  test('stores the unwrapped profile and clears the saving flag', async () => {
    const user = {id: 42, name: 'John D. Updated', height_cm: 181};
    mockedPut.mockResolvedValue({
      data: {success: true, message: 'ok', data: {user}},
    });
    const store = makeStore();

    await store.dispatch(updateProfile({height_cm: 181}));

    const state = store.getState().home;
    expect(state.profile?.user).toEqual(user);
    expect(state.savingProfile).toBe(false);
  });

  test('sets savingProfile while the request is in flight', async () => {
    let resolvePut: (value: unknown) => void = () => undefined;
    mockedPut.mockReturnValue(
      new Promise(resolve => {
        resolvePut = resolve;
      }),
    );
    const store = makeStore();

    const pending = store.dispatch(updateProfile({age: 31}));
    expect(store.getState().home.savingProfile).toBe(true);

    resolvePut({data: {data: {user: {}}}});
    await pending;

    expect(store.getState().home.savingProfile).toBe(false);
  });

  test('records the error message on failure and leaves the profile alone', async () => {
    // getApiErrorMessage goes through axios.isAxiosError, which checks this flag.
    mockedPut.mockRejectedValue({
      isAxiosError: true,
      response: {data: {message: 'The email has already been taken.'}},
    });
    const store = makeStore();

    await store.dispatch(updateProfile({email: 'taken@example.com'}));

    const state = store.getState().home;
    expect(state.error).toBe('The email has already been taken.');
    expect(state.profile).toBeNull();
    expect(state.savingProfile).toBe(false);
  });
});

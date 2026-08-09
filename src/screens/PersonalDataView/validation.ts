import type {EditableField, ProfileUpdatePayload} from '../../types/home';

// Pure helpers for the personal data screen. Deliberately free of React
// Native and Expo imports so they can be unit tested without loading the
// component tree.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validate = (edits: ProfileUpdatePayload) => {
  const errors: Partial<Record<EditableField, string>> = {};

  if (edits.name !== undefined) {
    if (!edits.name.trim()) {
      errors.name = 'Name is required';
    } else if (edits.name.length > 255) {
      errors.name = 'Name is too long';
    }
  }

  if (edits.email !== undefined) {
    if (!edits.email.trim()) {
      errors.email = 'Email is required';
    } else if (!EMAIL_PATTERN.test(edits.email.trim())) {
      errors.email = 'Enter a valid email';
    } else if (edits.email.length > 255) {
      errors.email = 'Email is too long';
    }
  }

  if (edits.phone_number && edits.phone_number.length > 30) {
    errors.phone_number = 'Phone number is too long';
  }

  return errors;
};

export const MIN_PASSWORD_LENGTH = 8;

export interface PasswordForm {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export type PasswordErrors = Partial<Record<keyof PasswordForm, string>>;

export const EMPTY_PASSWORD_FORM: PasswordForm = {
  current_password: '',
  password: '',
  password_confirmation: '',
};

export const validatePasswordForm = (form: PasswordForm): PasswordErrors => {
  const errors: PasswordErrors = {};

  if (!form.current_password) {
    errors.current_password = 'Current password is required';
  }

  if (!form.password) {
    errors.password = 'New password is required';
  } else if (form.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  } else if (form.password === form.current_password) {
    errors.password = 'New password must be different from the current one';
  }

  if (!form.password_confirmation) {
    errors.password_confirmation = 'Please confirm your new password';
  } else if (form.password && form.password_confirmation !== form.password) {
    errors.password_confirmation = 'Passwords do not match';
  }

  return errors;
};

// GenderPickerCmp speaks 'm' / 'f'; PUT /auth/profile expects 'male' / 'female'.
export const toApiGender = (code: string) => {
  if (code === 'm' || code === 'male') {
    return 'male';
  }

  if (code === 'f' || code === 'female') {
    return 'female';
  }

  return code;
};

export const toPickerGender = (value: number | string) => {
  if (value === 'male' || value === 'm') {
    return 'm';
  }

  if (value === 'female' || value === 'f') {
    return 'f';
  }

  return null;
};

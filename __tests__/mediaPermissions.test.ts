import {Alert, Linking} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {ensureMediaPermission} from '../src/utils/mediaPermissions';

jest.mock('expo-image-picker', () => ({
  getCameraPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  getMediaLibraryPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));

const picker = ImagePicker as jest.Mocked<typeof ImagePicker>;

const status = (granted: boolean, canAskAgain: boolean) =>
  ({granted, canAskAgain, status: granted ? 'granted' : 'denied'}) as never;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
});

describe('ensureMediaPermission', () => {
  it('skips the request when permission is already held', async () => {
    picker.getCameraPermissionsAsync.mockResolvedValue(status(true, true));

    await expect(ensureMediaPermission('camera')).resolves.toBe(true);
    expect(picker.requestCameraPermissionsAsync).not.toHaveBeenCalled();
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('asks the OS when permission has not been decided yet', async () => {
    picker.getCameraPermissionsAsync.mockResolvedValue(status(false, true));
    picker.requestCameraPermissionsAsync.mockResolvedValue(status(true, true));

    await expect(ensureMediaPermission('camera')).resolves.toBe(true);
    expect(picker.requestCameraPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('stays quiet when the user declines the OS prompt but can be asked again', async () => {
    picker.getMediaLibraryPermissionsAsync.mockResolvedValue(status(false, true));
    picker.requestMediaLibraryPermissionsAsync.mockResolvedValue(
      status(false, true),
    );

    await expect(ensureMediaPermission('library')).resolves.toBe(false);
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('offers system settings once the OS will no longer prompt', async () => {
    picker.getCameraPermissionsAsync.mockResolvedValue(status(false, true));
    picker.requestCameraPermissionsAsync.mockResolvedValue(status(false, false));

    await expect(ensureMediaPermission('camera')).resolves.toBe(false);
    expect(Alert.alert).toHaveBeenCalledTimes(1);

    const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
    buttons.find((button: {text: string}) => button.text === 'Open settings').onPress();
    expect(Linking.openSettings).toHaveBeenCalled();
  });

  it('goes straight to settings when permission was already permanently refused', async () => {
    picker.getMediaLibraryPermissionsAsync.mockResolvedValue(status(false, false));

    await expect(ensureMediaPermission('library')).resolves.toBe(false);
    expect(picker.requestMediaLibraryPermissionsAsync).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledTimes(1);
  });
});

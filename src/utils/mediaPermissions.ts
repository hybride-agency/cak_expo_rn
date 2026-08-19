import * as ImagePicker from 'expo-image-picker';
import {Alert, Linking, Platform} from 'react-native';

export type MediaSource = 'camera' | 'library';

const COPY: Record<
  MediaSource,
  {title: string; blocked: string; denied: string}
> = {
  camera: {
    title: 'Camera access needed',
    blocked:
      'CAK Fitness needs your camera to take this photo. Turn on Camera for CAK Fitness in your device settings, then try again.',
    denied: 'CAK Fitness needs your camera to take this photo.',
  },
  library: {
    title: 'Photo access needed',
    blocked:
      'CAK Fitness needs access to your photos to upload one. Turn on Photos for CAK Fitness in your device settings, then try again.',
    denied: 'CAK Fitness needs access to your photos to upload one.',
  },
};

const getStatus = (source: MediaSource) =>
  source === 'camera'
    ? ImagePicker.getCameraPermissionsAsync()
    : ImagePicker.getMediaLibraryPermissionsAsync();

const requestStatus = (source: MediaSource) =>
  source === 'camera'
    ? ImagePicker.requestCameraPermissionsAsync()
    : ImagePicker.requestMediaLibraryPermissionsAsync();

/**
 * Opens the OS settings page for this app. On iOS this deep links straight to
 * the app's own permission screen; on Android it opens app details.
 */
const openSettings = () => {
  void Linking.openSettings().catch(() => undefined);
};

const promptForSettings = (source: MediaSource) => {
  Alert.alert(COPY[source].title, COPY[source].blocked, [
    {text: 'Not now', style: 'cancel'},
    {text: 'Open settings', onPress: openSettings},
  ]);
};

/**
 * Makes sure we hold the permission before opening the picker.
 *
 * Asks the OS once. If the user has already permanently refused (`canAskAgain`
 * is false, which is what iOS reports after the first "Don't Allow" and what
 * Android reports after "Don't ask again"), the system prompt will never appear
 * again, so we offer a route into the settings app instead of silently failing.
 *
 * On web there is no permission to hold: the file input and its `capture`
 * attribute are gated by the browser itself.
 */
export const ensureMediaPermission = async (
  source: MediaSource,
): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return true;
  }

  const current = await getStatus(source);

  if (current.granted) {
    return true;
  }

  if (current.canAskAgain) {
    const requested = await requestStatus(source);

    if (requested.granted) {
      return true;
    }

    // Declining the OS prompt is an answer; only nag about settings once the
    // prompt itself is no longer available.
    if (requested.canAskAgain) {
      return false;
    }
  }

  promptForSettings(source);

  return false;
};

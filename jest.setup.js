// expo-image runs an expo-observe integration at import time. Under jest-expo
// requireOptionalNativeModule('ExpoObserve') resolves to an auto-mock that has
// no getIntegrations(), so importing the package throws. On device the module
// is absent and the integration is skipped. Only Image is used in this app.
// AsyncStorage's native module is absent under Jest; the official mock is
// shipped with the package.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// expo-video reaches for a native class at import time, which Jest has no
// binding for.
jest.mock('expo-video', () => ({
  __esModule: true,
  VideoView: 'VideoView',
  useVideoPlayer: () => ({play: jest.fn(), pause: jest.fn()}),
}));

jest.mock('expo-image', () => {
  const {Image} = require('react-native');

  return {
    __esModule: true,
    Image,
    ImageBackground: Image,
  };
});

// expo-image runs an expo-observe integration at import time. Under jest-expo
// requireOptionalNativeModule('ExpoObserve') resolves to an auto-mock that has
// no getIntegrations(), so importing the package throws. On device the module
// is absent and the integration is skipped. Only Image is used in this app.
jest.mock('expo-image', () => {
  const {Image} = require('react-native');

  return {
    __esModule: true,
    Image,
    ImageBackground: Image,
  };
});

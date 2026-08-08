import type {ConfigContext, ExpoConfig} from 'expo/config';

const googleIosUrlScheme = process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME;

const ralewayFonts = [
  './assets/fonts/Raleway-Black.ttf',
  './assets/fonts/Raleway-BlackItalic.ttf',
  './assets/fonts/Raleway-Bold.ttf',
  './assets/fonts/Raleway-BoldItalic.ttf',
  './assets/fonts/Raleway-ExtraBold.ttf',
  './assets/fonts/Raleway-ExtraBoldItalic.ttf',
  './assets/fonts/Raleway-ExtraLight.ttf',
  './assets/fonts/Raleway-ExtraLightItalic.ttf',
  './assets/fonts/Raleway-Italic.ttf',
  './assets/fonts/Raleway-Light.ttf',
  './assets/fonts/Raleway-LightItalic.ttf',
  './assets/fonts/Raleway-Medium.ttf',
  './assets/fonts/Raleway-MediumItalic.ttf',
  './assets/fonts/Raleway-Regular.ttf',
  './assets/fonts/Raleway-SemiBold.ttf',
  './assets/fonts/Raleway-SemiBoldItalic.ttf',
  './assets/fonts/Raleway-Thin.ttf',
  './assets/fonts/Raleway-ThinItalic.ttf',
];

export default ({config}: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'cak_rn',
  slug: 'cak',
  version: '1.0.0',
  orientation: 'default',
  icon: './assets/images/app-icon.png',
  scheme: 'cak',
  userInterfaceStyle: 'dark',
  runtimeVersion: {policy: 'appVersion'},
  ios: {
    bundleIdentifier: 'com.cakfit',
    buildNumber: '1',
    supportsTablet: false,
    config: {
      usesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.cak_rn',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/images/app-icon.png',
      backgroundColor: '#171717',
    },
    allowBackup: false,
    softwareKeyboardLayoutMode: 'resize',
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    [
      'expo-splash-screen',
      {
        backgroundColor: '#171717',
        image: './assets/images/Logo.png',
        imageWidth: 159,
        resizeMode: 'contain',
      },
    ],
    ['expo-font', {fonts: ralewayFonts}],
    ['expo-secure-store', {configureAndroidBackup: true}],
    ...(googleIosUrlScheme
      ? [
          [
            '@react-native-google-signin/google-signin',
            {iosUrlScheme: googleIosUrlScheme},
          ] as [string, Record<string, string>],
        ]
      : []),
  ],
  extra: {
    eas: {
      projectId: '3fd302df-ffa1-44d3-9f64-e9a5313d7a45',
    },
  },
  owner: 'caklebanons-team',
});

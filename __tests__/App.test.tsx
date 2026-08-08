import React from 'react';
import {render} from '@testing-library/react-native';

import App from '../App';

jest.mock('expo-font', () => ({
  useFonts: () => [true, null],
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn().mockResolvedValue(undefined),
  hideAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/utils/authSession', () => ({
  loadAuthSession: jest.fn().mockResolvedValue(null),
  clearAuthSession: jest.fn().mockResolvedValue(undefined),
  saveAuthSession: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/axiosConfig', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => new Promise(() => undefined)),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(),
    signIn: jest.fn(),
  },
  statusCodes: {},
}));

jest.mock('react-native-gesture-handler', () => {
  const {View} = jest.requireActual('react-native');
  return {GestureHandlerRootView: View};
});

test('renders correctly', async () => {
  const view = await render(<App />);

  expect(view.root).toBeTruthy();
});

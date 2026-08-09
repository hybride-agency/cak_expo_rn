import { Platform } from 'react-native';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
  type ConfigureParams,
} from '@react-native-google-signin/google-signin';
import * as Device from 'expo-device';

import {environment} from '../config/env';

let isConfigured = false;

const configureGoogleSignIn = () => {
  if (isConfigured) {
    return;
  }

  const config: ConfigureParams = {
    scopes: ['email', 'profile'],
    webClientId: environment.googleWebClientId,
    ...(environment.googleIosClientId
      ? {iosClientId: environment.googleIosClientId}
      : {}),
  };

  GoogleSignin.configure(config);
  isConfigured = true;
};

const getDeviceName = async () => {
  return Device.modelName || `${Device.brand || 'Unknown'} device`;
};

export const getGoogleAuthPayload = async () => {
  try {
    if (!environment.googleWebClientId) {
      throw new Error(
        'Google sign-in is not configured. Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID and rebuild the development client.',
      );
    }

    configureGoogleSignIn();

    try {
      // Clear any existing session to force the account picker to show up
      await GoogleSignin.signOut();
    } catch (e) {
      // Ignore errors if not already signed in
    }

    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
    }

    const response = await GoogleSignin.signIn();

    if (!isSuccessResponse(response)) {
      return null;
    }

    const token =
      response.data.idToken ?? (await GoogleSignin.getTokens()).idToken;

    if (!token) {
      throw new Error(
        'Google sign-in did not return an ID token. Verify EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID and the Google OAuth configuration.',
      );
    }

    return {
      token,
      device_name: await getDeviceName(),
    };
  } catch (error) {
    if (
      isErrorWithCode(error) &&
      (error.code === statusCodes.SIGN_IN_CANCELLED ||
        error.code === statusCodes.IN_PROGRESS)
    ) {
      return null;
    }

    throw error;
  }
};

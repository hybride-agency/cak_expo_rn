import * as AppleAuthentication from 'expo-apple-authentication';
import * as Device from 'expo-device';

const getDeviceName = async () => {
  return Device.modelName || `${Device.brand || 'Unknown'} device`;
};

export const getAppleAuthPayload = async () => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      throw new Error('Apple sign-in did not return an identity token.');
    }

    const name = credential.fullName
      ? [credential.fullName.givenName, credential.fullName.familyName]
          .filter(Boolean)
          .join(' ')
          .trim() || undefined
      : undefined;

    return {
      token: credential.identityToken,
      name,
      device_name: await getDeviceName(),
    };
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as {code?: string}).code === 'ERR_REQUEST_CANCELED'
    ) {
      return null;
    }

    throw error;
  }
};

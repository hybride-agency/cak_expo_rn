const DEFAULT_API_BASE_URL = 'https://cak.lft.industries/api';

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, '');

export const environment = {
  apiBaseUrl: trimTrailingSlashes(
    process.env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL,
  ),
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
} as const;

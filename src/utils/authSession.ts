import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {AuthResponse} from '../types/auth';

const AUTH_SESSION_KEY = 'auth_session';
const INSTALL_FLAG_KEY = 'app_has_launched_before';
const OPEN_AUTH_ON_NEXT_LAUNCH_KEY = 'open_auth_on_next_launch';

export interface PersistedAuthSession {
  token: string | null;
  action_plan: string;
  loginUser: AuthResponse | null;
  isLoggedIn: boolean;
  isWelcome?: boolean;
  isQuestion?: boolean;
  isPlan?: boolean;
}

export const mergeAuthResponseWithProfile = (
  authResponse: AuthResponse | null,
  profileResponse: AuthResponse,
  session: Pick<PersistedAuthSession, 'token' | 'action_plan'>,
): AuthResponse => ({
  ...(authResponse ?? {}),
  ...profileResponse,
  data: {
    ...(authResponse?.data ?? {}),
    ...(profileResponse.data ?? {}),
    token: session.token,
    action_plan: session.action_plan,
  },
});

export const saveAuthSession = async (session: PersistedAuthSession) => {
  await SecureStore.setItemAsync(AUTH_SESSION_KEY, JSON.stringify(session), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  });
};

export const loadAuthSession = async (): Promise<PersistedAuthSession | null> => {
  const raw = await SecureStore.getItemAsync(AUTH_SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PersistedAuthSession;
  } catch {
    await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
    return null;
  }
};

export const clearAuthSession = async () => {
  await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
};

export const openAuthOnNextLaunch = async () => {
  await AsyncStorage.setItem(OPEN_AUTH_ON_NEXT_LAUNCH_KEY, 'true');
};

export const consumeOpenAuthOnNextLaunch = async () => {
  const shouldOpenAuth =
    (await AsyncStorage.getItem(OPEN_AUTH_ON_NEXT_LAUNCH_KEY)) === 'true';

  if (shouldOpenAuth) {
    await AsyncStorage.removeItem(OPEN_AUTH_ON_NEXT_LAUNCH_KEY);
  }

  return shouldOpenAuth;
};

// iOS Keychain (what expo-secure-store uses) survives app deletion/reinstall,
// unlike AsyncStorage which lives in the app's data container and gets wiped.
// Use that gap to detect a fresh install and drop any stale Keychain session.
export const clearStaleSessionOnFreshInstall = async () => {
  const hasLaunchedBefore = await AsyncStorage.getItem(INSTALL_FLAG_KEY);

  if (!hasLaunchedBefore) {
    await clearAuthSession();
    await AsyncStorage.setItem(INSTALL_FLAG_KEY, 'true');
  }
};

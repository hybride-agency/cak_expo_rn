import * as SecureStore from 'expo-secure-store';
import type {AuthResponse} from '../types/auth';

const AUTH_SESSION_KEY = 'auth_session';

export interface PersistedAuthSession {
  token: string | null;
  action_plan: string;
  loginUser: AuthResponse | null;
  isLoggedIn: boolean;
  isWelcome?: boolean;
  isQuestion?: boolean;
  isPlan?: boolean;
}

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

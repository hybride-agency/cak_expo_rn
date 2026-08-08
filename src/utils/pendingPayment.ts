import * as SecureStore from 'expo-secure-store';
import type {PendingWhishCheckout} from '../types/payments';

const PENDING_PAYMENT_KEY = 'pending_whish_checkout';

export const savePendingPayment = async (pending: PendingWhishCheckout) => {
  await SecureStore.setItemAsync(PENDING_PAYMENT_KEY, JSON.stringify(pending), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  });
};

export const loadPendingPayment = async (): Promise<PendingWhishCheckout | null> => {
  const raw = await SecureStore.getItemAsync(PENDING_PAYMENT_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PendingWhishCheckout;
  } catch {
    await SecureStore.deleteItemAsync(PENDING_PAYMENT_KEY);
    return null;
  }
};

export const clearPendingPayment = async () => {
  await SecureStore.deleteItemAsync(PENDING_PAYMENT_KEY);
};

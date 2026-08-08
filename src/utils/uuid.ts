import * as Crypto from 'expo-crypto';

export const generateUuid = (): string => Crypto.randomUUID();

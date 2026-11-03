import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'glicare.access-token';

export const sessionStorage = {
  read(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  write(token: string): Promise<void> {
    return SecureStore.setItemAsync(TOKEN_KEY, token, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },
  clear(): Promise<void> {
    return SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};

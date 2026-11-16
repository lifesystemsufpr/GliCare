import * as SecureStore from 'expo-secure-store';

const KEY = 'glicare.theme';

// Preferência de tema neste aparelho. Não é dado sensível.
export const themeStorage = {
  read(): Promise<string | null> {
    return SecureStore.getItemAsync(KEY);
  },
  write(mode: string): Promise<void> {
    return SecureStore.setItemAsync(KEY, mode);
  },
};

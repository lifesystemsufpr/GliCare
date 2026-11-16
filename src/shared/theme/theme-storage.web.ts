const KEY = 'glicare.theme';

// Web: guarda só "light" ou "dark" no localStorage. Nenhum dado da pessoa.
export const themeStorage = {
  async read(): Promise<string | null> {
    try {
      return globalThis.localStorage?.getItem(KEY) ?? null;
    } catch {
      return null;
    }
  },
  async write(mode: string): Promise<void> {
    try {
      globalThis.localStorage?.setItem(KEY, mode);
    } catch {
      // Sem armazenamento (navegação privada): o tema vale só nesta sessão.
    }
  },
};

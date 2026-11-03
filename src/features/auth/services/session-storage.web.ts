// Web: sess?o apenas em mem?ria. Nunca grava JWT em localStorage/sessionStorage.
let memoryToken: string | null = null;
export const sessionStorage = {
  async read(): Promise<string | null> { return memoryToken; },
  async write(token: string): Promise<void> { memoryToken = token; },
  async clear(): Promise<void> { memoryToken = null; },
};

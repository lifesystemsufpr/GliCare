import type { CurrentUser } from './auth-contract';

export type SessionState = {
  user: CurrentUser | null;
  loading: boolean;
  error: string | null;
};
type Storage = {
  read(): Promise<string | null>;
  write(token: string): Promise<void>;
  clear(): Promise<void>;
};
type Dependencies = {
  storage: Storage;
  login(email: string, password: string): Promise<{ accessToken: string }>;
  currentUser(token: string): Promise<CurrentUser>;
  isUnauthorized(error: unknown): boolean;
  message(error: unknown): string;
  setToken(token: string | null): void;
};

// Independente de React e da plataforma: permite testar restauração e corridas.
export class AuthSession {
  private state: SessionState = { user: null, loading: true, error: null };
  private token: string | null = null;
  private generation = 0;
  private listeners = new Set<() => void>();
  private storageQueue: Promise<void> = Promise.resolve();
  private clearPending = false;

  private readonly dependencies: Dependencies;
  constructor(dependencies: Dependencies) { this.dependencies = dependencies; }

  getSnapshot = (): SessionState => this.state;
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };

  private update(state: SessionState) {
    this.state = state;
    this.listeners.forEach((listener) => listener());
  }

  private persist(action: () => Promise<void>): Promise<void> {
    const operation = this.storageQueue.then(action, action);
    this.storageQueue = operation.catch(() => undefined);
    return operation;
  }

  restore = async (): Promise<void> => {
    if (this.clearPending) { await this.signOut(); return; }
    const operation = ++this.generation;
    this.token = null;
    this.dependencies.setToken(null);
    this.update({ user: null, loading: true, error: null });
    try {
      await this.storageQueue;
      const saved = await this.dependencies.storage.read();
      if (operation !== this.generation) return;
      if (!saved) { this.update({ user: null, loading: false, error: null }); return; }
      const user = await this.dependencies.currentUser(saved);
      if (operation !== this.generation) return;
      this.token = saved;
      this.dependencies.setToken(saved);
      this.update({ user, loading: false, error: null });
    } catch (error) {
      if (operation !== this.generation) return;
      if (this.dependencies.isUnauthorized(error)) {
        await this.signOut().catch(() => undefined); // signOut já expõe falha de limpeza.
      } else {
        // Falha de rede não apaga o token; o usuário pode tentar novamente.
        this.update({ user: null, loading: false, error: this.dependencies.message(error) });
      }
    }
  };

  signIn = async (email: string, password: string): Promise<void> => {
    const operation = ++this.generation;
    const result = await this.dependencies.login(email, password);
    const user = await this.dependencies.currentUser(result.accessToken);
    if (operation !== this.generation) return;
    await this.persist(() => this.dependencies.storage.write(result.accessToken));
    if (operation !== this.generation) return;
    this.token = result.accessToken;
    this.dependencies.setToken(this.token);
    this.update({ user, loading: false, error: null });
  };

  signOut = async (): Promise<void> => {
    const operation = ++this.generation;
    this.token = null;
    this.dependencies.setToken(null);
    this.clearPending = true;
    this.update({ user: null, loading: true, error: null });
    try {
      await this.persist(() => this.dependencies.storage.clear());
      if (operation !== this.generation) return;
      this.clearPending = false;
      this.update({ user: null, loading: false, error: null });
    } catch (error) {
      if (operation === this.generation) {
        this.update({ user: null, loading: false,
          error: 'Não foi possível concluir a limpeza da sessão neste aparelho. Tente sair novamente.' });
      }
      throw error;
    }
  };

  invalidate = (requestToken: string): void => {
    if (requestToken === this.token) void this.signOut().catch(() => undefined);
  };

  hasSession = (): boolean => this.token !== null;

  cancelPending = (): void => { this.generation++; };
}

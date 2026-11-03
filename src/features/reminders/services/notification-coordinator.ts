import type { Reminder } from './reminder-contract';

export const NOTIFICATION_PREFIX = 'glicare-reminder:';
export const NOTIFICATION_LIMIT = 60;
export type PlannedNotification = { identifier: string; at: number };
export function notificationPlan(reminders: Reminder[], now: number): PlannedNotification[] {
  return [...new Map(reminders.filter((item) => item.status === 'ATIVO' && Date.parse(item.dataHora) > now)
    .map((item) => [item.id, item])).values()]
    .sort((a, b) => Date.parse(a.dataHora) - Date.parse(b.dataHora) || a.id.localeCompare(b.id))
    .slice(0, NOTIFICATION_LIMIT)
    .map((item) => ({ identifier: `${NOTIFICATION_PREFIX}${encodeURIComponent(item.id)}:${Date.parse(item.dataHora)}`,
      at: Date.parse(item.dataHora) }));
}
export type NotificationPorts = {
  supported: boolean;
  permission(request: boolean): Promise<boolean>;
  readEnabledOwner(): Promise<string | null>;
  writeEnabledOwner(owner: string | null): Promise<void>;
  scheduled(): Promise<string[]>;
  cancel(identifier: string): Promise<void>;
  dismiss(): Promise<void>;
  schedule(item: PlannedNotification): Promise<string>;
  list(): Promise<Reminder[]>;
  now(): number;
};
export type NotificationState = { enabled: boolean; busy: boolean; message: string };

// Serializa as operações nativas; uma troca de sessão invalida respostas em andamento.
export class NotificationCoordinator {
  private owner: string | null = null;
  private initialized = false;
  private generation = 0;
  private queue: Promise<void> = Promise.resolve();
  private listeners = new Set<() => void>();
  private state: NotificationState;
  private readonly ports: NotificationPorts;
  constructor(ports: NotificationPorts) {
    this.ports = ports;
    this.state = { enabled: false, busy: false, message: ports.supported
      ? 'Ative os alertas locais neste aparelho.' : 'Alertas locais disponíveis no aplicativo Android/iOS.' };
  }
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };
  private update(change: Partial<NotificationState>) {
    this.state = { ...this.state, ...change };
    this.listeners.forEach((listener) => listener());
  }
  private run(action: () => Promise<void>): Promise<void> {
    const operation = this.queue.then(async () => {
      this.update({ busy: true });
      try { await action(); }
      catch {
        this.update({ message: 'Não foi possível sincronizar os alertas locais. Tente sincronizar novamente.' });
        throw new Error('Não foi possível sincronizar os alertas locais.');
      } finally { this.update({ busy: false }); }
    });
    this.queue = operation.catch(() => undefined);
    return operation;
  }
  private async clearScheduled() {
    for (const id of await this.ports.scheduled()) {
      if (id.startsWith(NOTIFICATION_PREFIX)) await this.ports.cancel(id);
    }
    await this.ports.dismiss();
  }
  setOwner = (owner: string | null) => {
    if (this.initialized && owner === this.owner) return;
    this.initialized = true;
    this.owner = owner;
    const version = ++this.generation;
    if (!this.ports.supported) return;
    this.update({ enabled: false, message: owner ? 'Verificando alertas deste aparelho…' : 'Alertas suspensos sem sessão validada.' });
    void this.run(async () => {
      await this.clearScheduled();
      if (version !== this.generation || !owner) return;
      await this.reconcile(owner, version);
    }).catch(() => undefined);
  };
  // Usado pelo logout para aguardar também a limpeza dos alertas.
  clearSession = async () => {
    this.setOwner(null);
    if (this.ports.supported) await this.run(() => this.clearScheduled());
  };
  private async reconcile(owner: string, version: number) {
    const valid = () => version === this.generation && owner === this.owner;
    if (await this.ports.readEnabledOwner() !== owner || !valid()) {
      if (valid()) this.update({ enabled: false, message: 'Ative os alertas locais neste aparelho.' });
      return;
    }
    this.update({ enabled: true });
    if (!await this.ports.permission(false)) {
      await this.clearScheduled();
      if (valid()) this.update({ message: 'Permissão de notificações bloqueada. Autorize nos ajustes do aparelho e sincronize.' });
      return;
    }
    if (!valid()) return;
    const reminders = await this.ports.list();
    if (!valid()) return;
    const plan = notificationPlan(reminders, this.ports.now());
    const existing = await this.ports.scheduled();
    if (!valid()) return;
    const desired = new Set(plan.map((item) => item.identifier));
    for (const id of existing) {
      if (!valid()) return;
      if (id.startsWith(NOTIFICATION_PREFIX) && !desired.has(id)) await this.ports.cancel(id);
    }
    for (const item of plan) {
      if (!valid()) return;
      if (!existing.includes(item.identifier) && item.at > this.ports.now()) {
        const id = await this.ports.schedule(item);
        if (!valid()) { await this.ports.cancel(id); return; }
      }
    }
    if (valid()) this.update({ enabled: true,
      message: `${plan.length} alerta(s) programado(s) neste aparelho. Até ${NOTIFICATION_LIMIT} próximos lembretes; sincronize ao abrir o app. O sistema pode atrasar os alertas.` });
  }
  refresh = () => {
    const owner = this.owner, version = this.generation;
    if (!owner || !this.ports.supported) return Promise.resolve();
    return this.run(async () => {
      if (version === this.generation) await this.reconcile(owner, version);
    });
  };
  enable = () => {
    const owner = this.owner, version = this.generation;
    if (!owner || !this.ports.supported) return Promise.resolve();
    return this.run(async () => {
      if (version !== this.generation) return;
      const allowed = await this.ports.permission(true);
      if (version !== this.generation) return;
      if (!allowed) {
        this.update({ enabled: false, message: 'Permissão não concedida. Autorize notificações nos ajustes do aparelho.' });
        return;
      }
      await this.ports.writeEnabledOwner(owner);
      if (version === this.generation) await this.reconcile(owner, version);
    });
  };
  disable = () => {
    const version = ++this.generation;
    this.update({ enabled: false });
    return this.run(async () => {
      await this.ports.writeEnabledOwner(null);
      await this.clearScheduled();
      if (version === this.generation) this.update({ message: 'Alertas locais desativados neste aparelho. Seus lembretes continuam salvos.' });
    });
  };
}

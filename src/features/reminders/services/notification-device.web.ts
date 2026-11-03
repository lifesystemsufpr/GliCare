import type { NotificationPorts } from './notification-coordinator';

// Não importa módulos nativos nem solicita permissões no navegador.
export const notificationDevice: Omit<NotificationPorts, 'list' | 'now'> = {
  supported: false,
  permission: async () => false,
  readEnabledOwner: async () => null,
  writeEnabledOwner: async () => undefined,
  scheduled: async () => [],
  cancel: async () => undefined,
  dismiss: async () => undefined,
  schedule: async () => { throw new Error('Alertas locais indisponíveis na web.'); },
};

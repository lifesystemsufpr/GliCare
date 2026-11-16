import { useThemeColors } from '@/shared/theme';
import { useSyncExternalStore } from 'react';
import { Text, View } from 'react-native';

import { AppButton } from '@/shared/components';
import { localNotificationsSupported, reminderNotifications } from '../services/reminder-notifications';

// Controles dos alertas locais dos lembretes neste aparelho. Usado em
// Lembretes e em Perfil > Notificações, com o mesmo estado.
export function NotificationSettings({ disabled = false }: { disabled?: boolean }) {
  const c = useThemeColors();
  const notifications = useSyncExternalStore(reminderNotifications.subscribe,
    reminderNotifications.getSnapshot, reminderNotifications.getSnapshot);
  return <View style={{ gap: 10 }}>
    <Text style={{ color: c.defaultText }} accessibilityLiveRegion="polite">{notifications.message}</Text>
    {localNotificationsSupported ? <>
      <AppButton title={notifications.enabled ? 'Desativar alertas neste aparelho' : 'Ativar alertas neste aparelho'}
        variant="secondary" disabled={notifications.busy || disabled}
        onPress={() => { void (notifications.enabled ? reminderNotifications.disable() : reminderNotifications.enable()).catch(() => undefined); }} />
      <AppButton title="Sincronizar alertas" variant="secondary" disabled={notifications.busy || disabled}
        onPress={() => { void reminderNotifications.refresh().catch(() => undefined); }} />
    </> : null}
  </View>;
}

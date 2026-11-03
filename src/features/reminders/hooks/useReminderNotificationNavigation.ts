import { useEffect } from 'react';
import { useRootNavigationState, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { NOTIFICATION_PREFIX } from '../services/notification-coordinator';

export function useReminderNotificationNavigation(authenticated: boolean) {
  const router = useRouter();
  const ready = Boolean(useRootNavigationState()?.key);
  useEffect(() => {
    if (!authenticated || !ready) return;
    const open = (response: Notifications.NotificationResponse | null) => {
      if (response?.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER &&
          response.notification.request.identifier.startsWith(NOTIFICATION_PREFIX)) {
        Notifications.clearLastNotificationResponse();
        router.push('/lembretes');
      }
    };
    const subscription = Notifications.addNotificationResponseReceivedListener(open);
    open(Notifications.getLastNotificationResponse());
    return () => subscription.remove();
  }, [authenticated, ready, router]);
}

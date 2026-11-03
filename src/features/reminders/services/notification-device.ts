import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { NOTIFICATION_PREFIX, type NotificationPorts } from './notification-coordinator';

const CHANNEL = 'glicare-reminders';
const OWNER_KEY = 'glicare.notifications-owner';
Notifications.setNotificationHandler({ handleNotification: async () => ({
  shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false,
}) });

export const notificationDevice: Omit<NotificationPorts, 'list' | 'now'> = {
  supported: true,
  async permission(request) {
    const channel = Platform.OS === 'android' ? await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Lembretes', importance: Notifications.AndroidImportance.HIGH,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE, sound: 'default',
    }) : null;
    const result = request ? await Notifications.requestPermissionsAsync() : await Notifications.getPermissionsAsync();
    if (channel?.importance === Notifications.AndroidImportance.NONE) return false;
    return result.granted || result.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  },
  readEnabledOwner: () => SecureStore.getItemAsync(OWNER_KEY),
  writeEnabledOwner: (owner) => owner === null ? SecureStore.deleteItemAsync(OWNER_KEY)
    : SecureStore.setItemAsync(OWNER_KEY, owner, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }),
  scheduled: async () => (await Notifications.getAllScheduledNotificationsAsync()).map((item) => item.identifier),
  cancel: (id) => Notifications.cancelScheduledNotificationAsync(id),
  async dismiss() {
    for (const notification of await Notifications.getPresentedNotificationsAsync()) {
      if (notification.request.identifier.startsWith(NOTIFICATION_PREFIX)) {
        await Notifications.dismissNotificationAsync(notification.request.identifier);
      }
    }
  },
  schedule: (item) => Notifications.scheduleNotificationAsync({
    identifier: item.identifier,
    content: { title: 'GliCare', body: 'Você tem um lembrete. Abra o aplicativo para consultar.', sound: 'default' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(item.at), channelId: CHANNEL },
  }),
};

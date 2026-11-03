import { NotificationCoordinator } from './notification-coordinator';
import { notificationDevice } from './notification-device';
import { subscribeReminderChanges } from './reminder-events';
import { listReminders } from './reminder-service';

export const reminderNotifications = new NotificationCoordinator({
  ...notificationDevice, list: () => listReminders(), now: () => Date.now(),
});
export const localNotificationsSupported = notificationDevice.supported;
subscribeReminderChanges(() => { void reminderNotifications.refresh().catch(() => undefined); });

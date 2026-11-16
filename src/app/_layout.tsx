import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '@/features/auth/hooks/AuthProvider';
import { useReminderNotificationNavigation } from '@/features/reminders/hooks/useReminderNotificationNavigation';

function RootNavigator() {
  const { user } = useAuth();
  useReminderNotificationNavigation(Boolean(user));
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="reset-password" />
      <Stack.Protected guard={Boolean(user)}>
        <Stack.Screen name="(main)" />
      </Stack.Protected>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

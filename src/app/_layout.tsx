import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/features/auth/hooks/AuthProvider';
import { useReminderNotificationNavigation } from '@/features/reminders/hooks/useReminderNotificationNavigation';
import { ThemeProvider, useTheme } from '@/shared/theme';

function RootNavigator() {
  const { user } = useAuth();
  const { mode, colors } = useTheme();
  useReminderNotificationNavigation(Boolean(user));
  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      {/* No claro, o fundo da navegação fica o padrão de antes. */}
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: mode === 'dark' ? { backgroundColor: colors.screen } : undefined,
      }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="termos" />
        <Stack.Screen name="privacidade" />
        <Stack.Protected guard={Boolean(user)}>
          <Stack.Screen name="(main)" />
        </Stack.Protected>
        <Stack.Protected guard={!user}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '@/features/auth/hooks/AuthProvider';

function RootNavigator() {
  const { user } = useAuth();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={Boolean(user)}>
        <Stack.Screen name="(main)" />
        <Stack.Screen name="explore" />
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

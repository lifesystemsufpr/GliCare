import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/features/auth/hooks/AuthProvider';
import { SessionGate } from '@/features/auth/components/SessionGate';

export default function AuthLayout() {
  const { user, loading, sessionError } = useAuth();
  if (loading || sessionError) return <SessionGate />;
  if (user) return <Redirect href="/(main)/home" />;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

import { Redirect } from 'expo-router';
import { useAuth } from '@/features/auth/hooks/AuthProvider';
import { SessionGate } from '@/features/auth/components/SessionGate';

export default function Index() {
  const { user, loading, sessionError } = useAuth();
  if (loading || sessionError) return <SessionGate />;
  return <Redirect href={user ? '/(main)/home' : '/(auth)/login'} />;
}

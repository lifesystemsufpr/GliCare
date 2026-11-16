import { ActivityIndicator, Text, View } from 'react-native';
import { useAuth } from '../hooks/AuthProvider';
import { AppButton } from '@/shared/components';
import { useThemeColors } from '@/shared/theme';

export function SessionGate() {
  const { loading, sessionError, retrySession, signOut } = useAuth();
  const c = useThemeColors();
  return <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 16 }}>
    {loading ? <ActivityIndicator accessibilityLabel="Validando sessão" /> : <>
      <Text accessibilityRole="alert" style={{ color: c.defaultText }}>{sessionError}</Text>
      <AppButton title="Tentar novamente" onPress={() => void retrySession()} />
      <AppButton title="Voltar ao login" variant="secondary" onPress={() => void signOut().catch(() => undefined)} />
    </>}
  </View>;
}

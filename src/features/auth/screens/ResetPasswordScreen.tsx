import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { clearInitialURL, useLinkingURL } from 'expo-linking';
import { Text, View } from 'react-native';
import { AppButton, AppInput, PasswordInput, ScreenContainer } from '@/shared/components';
import { useThemeColors } from '@/shared/theme';
import { errorMessage } from '@/shared/api/errors';
import { useAuth } from '../hooks/AuthProvider';
import { PasswordRules } from '../components/PasswordRules';
import { recoveryTokenFromLink } from '../services/recovery-contract';
import { confirmPasswordReset } from '../services/recovery-service';

export function ResetPasswordScreen() {
  const c = useThemeColors();
  const link = useLinkingURL();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);
  const seenLink = useRef<string | null>(null);
  const busy = useRef(false);
  const { signOut } = useAuth();
  useEffect(() => {
    if (!link || seenLink.current === link || complete) return;
    seenLink.current = link;
    const received = recoveryTokenFromLink(link);
    if (received) {
      setToken(received);
      clearInitialURL();
      if (typeof window !== 'undefined' && window.history) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  }, [link, complete]);
  async function submit() {
    if (busy.current || complete) return;
    busy.current = true; setSaving(true); setError('');
    try {
      await confirmPasswordReset(token, password, confirmation);
      setComplete(true); setPassword(''); setConfirmation(''); setToken('');
      await signOut();
    } catch (cause) { setError(errorMessage(cause)); }
    finally { busy.current = false; setSaving(false); }
  }
  async function login() {
    if (busy.current) return;
    busy.current = true; setSaving(true); setError('');
    try { await signOut(); router.replace('/(auth)/login'); }
    catch (cause) { setError(errorMessage(cause)); }
    finally { busy.current = false; setSaving(false); }
  }
  async function requestAgain() {
    if (busy.current) return;
    busy.current = true; setSaving(true); setError('');
    try { await signOut(); router.replace('/(auth)/forgot-password'); }
    catch (cause) { setError(errorMessage(cause)); }
    finally { busy.current = false; setSaving(false); }
  }
  return <ScreenContainer scrollable><View style={{ gap: 16, paddingVertical: 30 }}>
    <Text style={{ fontSize: 26, fontWeight: '700', color: c.primary }}>Redefinir senha</Text>
    {complete ? <Text style={{ color: c.defaultText }}>Senha redefinida com sucesso. Entre novamente com a nova senha.</Text> : <>
      <Text style={{ color: c.defaultText }}>Abra o link recebido ou cole o código do e-mail abaixo.</Text>
      <AppInput label="Código de recuperação" value={token} onChangeText={setToken} secureTextEntry
        autoCapitalize="none" autoCorrect={false} maxLength={512} editable={!saving} />
      <PasswordInput label="Nova senha" value={password} onChangeText={setPassword} maxLength={72} editable={!saving} />
      <PasswordInput label="Confirmar nova senha" value={confirmation} onChangeText={setConfirmation} maxLength={72} editable={!saving} />
      <PasswordRules password={password} />
      <AppButton title="Redefinir senha" onPress={submit} loading={saving} />
      <AppButton title="Solicitar novo código" variant="secondary" disabled={saving}
        onPress={requestAgain} />
    </>}
    {error ? <Text accessibilityRole="alert" style={{ color: c.error }}>{error}</Text> : null}
    <AppButton title="Voltar ao login" variant="secondary" onPress={login} disabled={saving} />
  </View></ScreenContainer>;
}

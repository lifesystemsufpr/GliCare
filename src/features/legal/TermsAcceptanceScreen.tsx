import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/features/auth/hooks/AuthProvider';
import { acceptTermsRequest } from '@/features/auth/services/auth-service';
import { errorMessage } from '@/shared/api/errors';
import { AppButton, ScreenContainer } from '@/shared/components';
import { makeStyles, useThemeColors } from '@/shared/theme';

export function TermsAcceptanceScreen() {
  const styles = useStyles();
  const c = useThemeColors();
  const { setUser, signOut } = useAuth();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const busy = useRef(false);

  async function handleAccept() {
    if (!acceptedTerms || busy.current) return;
    busy.current = true;
    setSubmitting(true);
    setError('');
    try {
      const updated = await acceptTermsRequest();
      setUser(updated);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        <Text style={styles.title}>Termos de Uso e Política de Privacidade</Text>
        <Text style={styles.description}>
          Para continuar usando o GliCare, leia e aceite os Termos de Uso e a Política de Privacidade.
        </Text>
        <View style={styles.termsRow}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: acceptedTerms }}
            accessibilityLabel="Aceito os Termos de Uso e a Política de Privacidade"
            onPress={() => setAcceptedTerms((checked) => !checked)}
            style={styles.checkbox}
          >
            {acceptedTerms ? <Ionicons name="checkmark" size={18} color={c.primary} /> : null}
          </Pressable>
          <Text style={styles.termsText}>
            Li e aceito os{' '}
            <Text accessibilityRole="link" style={styles.termsLink} onPress={() => router.push('/termos' as Href)}>
              Termos de Uso
            </Text>{' '}
            e a{' '}
            <Text accessibilityRole="link" style={styles.termsLink} onPress={() => router.push('/privacidade' as Href)}>
              Política de Privacidade
            </Text>
          </Text>
        </View>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <AppButton
          title="Aceitar e continuar"
          onPress={() => void handleAccept()}
          loading={submitting}
          disabled={!acceptedTerms || submitting}
        />
        <AppButton
          title="Sair"
          variant="secondary"
          disabled={submitting}
          onPress={() => void signOut().catch(() => undefined)}
        />
      </View>
    </ScreenContainer>
  );
}

const useStyles = makeStyles((c) => StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 16,
  },
  title: {
    color: c.defaultText,
    fontSize: 24,
    fontWeight: '700',
  },
  description: {
    color: c.defaultText,
    fontSize: 15,
    lineHeight: 22,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: c.primary,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsText: {
    flex: 1,
    color: c.defaultText,
  },
  termsLink: {
    color: c.primary,
    textDecorationLine: 'underline',
  },
  error: {
    color: c.error,
  },
}));

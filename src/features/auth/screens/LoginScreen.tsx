import { makeStyles, useThemeColors, useLogoSource } from '@/shared/theme';
import { useRef, useState } from 'react';
import { useAuth } from '../hooks/AuthProvider';
import { errorMessage } from '@/shared/api/errors';

import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import {
  AppButton,
  AppInput,
  PasswordInput,
  ScreenContainer,
} from '../../../shared/components';

import { spacing, typography } from '../../../shared/theme';

export function LoginScreen() {
  const styles = useStyles();
  const c = useThemeColors();
  const logoSource = useLogoSource();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const busy = useRef(false);
  const { signIn } = useAuth();

  async function handleLogin() {
    if (busy.current) return;
    setError('');
    if (!email.trim() || !password) { setError('Informe seu e-mail e sua senha.'); return; }
    busy.current = true;
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  }

function handleForgotPassword() {
  router.push('/forgot-password');
}

function handleCreateAccount() {
  router.push('/register');
}

  return (
    <ScreenContainer>
      <View style={styles.container}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Image
  source={logoSource}
  style={styles.logoImage}
  resizeMode="contain"
/>

<Text style={styles.title}>
  GliCare
</Text>

<Text style={styles.subtitle}>
  Acesse sua conta e acompanhe sua rotina de cuidados.
</Text>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          <AppInput
            label="E-mail"
            placeholder="seu@email.com"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
        />

          <PasswordInput
            label="Senha"
            placeholder="Digite sua senha"
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            onPress={handleForgotPassword}
            style={styles.forgotPasswordButton}
          >
            <Text style={styles.forgotPasswordText}>
              Esqueci minha senha
            </Text>
          </Pressable>

          <View style={styles.buttons}>
            {error ? <Text accessibilityRole="alert" style={{ color: c.error, marginBottom: 12 }}>{error}</Text> : null}
            <AppButton
              title="Entrar"
              onPress={handleLogin}
              loading={submitting}
            />

            <AppButton
              title="Criar Conta"
              variant="secondary"
              onPress={handleCreateAccount}
              disabled={submitting}
              style={styles.createAccountButton}
            />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const useStyles = makeStyles((c) => StyleSheet.create({
  container: {
    flex: 1,

    justifyContent: 'center',

    paddingVertical: spacing.xl,
  },

  header: {
    alignItems: 'center',

    marginBottom: spacing.xl,
  },

logoImage: {
  width: 92,
  height: 92,

  marginBottom: spacing.md,
},

title: {
  color: c.primary,

  fontSize: typography.sizes.xl,
  fontWeight: typography.weights.bold,

  textAlign: 'center',
},

subtitle: {
  color: c.textSecondary,

  fontSize: typography.sizes.sm,
  lineHeight: 20,

  textAlign: 'center',

  maxWidth: 280,

  marginTop: spacing.xs,
},

  form: {
    width: '100%',
  },

  forgotPasswordButton: {
    alignSelf: 'flex-end',

    marginTop: -spacing.sm,
    marginBottom: spacing.md,

    paddingVertical: spacing.xs,
  },

  forgotPasswordText: {
    color: c.primary,

    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },

  buttons: {
    width: '100%',
    marginTop: spacing.md,
  },

  createAccountButton: {
    marginTop: spacing.sm,
  },
}));

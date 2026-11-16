import { makeStyles, useThemeColors } from '@/shared/theme';
import { useRef, useState } from 'react';
import { requestPasswordRecovery } from '../services/recovery-service';
import { RECOVERY_MESSAGE } from '../services/recovery-contract';
import { errorMessage } from '@/shared/api/errors';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  AppButton,
  AppInput,
  ScreenContainer,
} from '../../../shared/components';

import { spacing, typography } from '../../../shared/theme';

export function ForgotPasswordScreen() {
  const styles = useStyles();
  const c = useThemeColors();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const busy = useRef(false);
  const [email, setEmail] =
    useState('');

  async function handleRecoverPassword() {
    if (busy.current) return;
    busy.current = true; setSending(true); setError(''); setSent(false);
    try { await requestPasswordRecovery(email); setSent(true); }
    catch (cause) { setError(errorMessage(cause)); }
    finally { busy.current = false; setSending(false); }
  }

function handleBackToLogin() {
  router.replace('/login');
}

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <View
            style={
              styles.logoContainer
            }
          >
            <Ionicons
              name="medical-outline"
              size={28}
              color={c.onPrimary}
            />
          </View>

          <Text style={styles.title}>
            GliCare
          </Text>

          <Text
            style={styles.subtitle}
          >
            Recupere o acesso à sua
            conta
          </Text>
        </View>

        <View
          style={
            styles.illustration
          }
        >
          <View
            style={
              styles.envelopeContainer
            }
          >
            <Ionicons
              name="mail-outline"
              size={54}
              color={
                c.textSecondary
              }
            />

            <View
              style={
                styles.lockContainer
              }
            >
              <Ionicons
                name="lock-closed"
                size={16}
                color={c.onPrimary}
              />
            </View>
          </View>
        </View>

        <Text
          style={
            styles.description
          }
        >
          Digite o e-mail da sua
          conta que enviaremos um link
          para redefinir sua senha.
        </Text>

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
  editable={!sending}
/>

<View style={styles.recoveryButton}>
  <AppButton
    title="Enviar link de recuperação"
    onPress={handleRecoverPassword}
    loading={sending}
  />
</View>

          {sent ? <Text style={{ color: c.defaultText }} accessibilityRole="alert">{RECOVERY_MESSAGE}</Text> : null}
          {error ? <Text accessibilityRole="alert" style={{ color: c.error }}>{error}</Text> : null}
          <AppButton title="Já tenho o código" variant="secondary" disabled={sending}
            onPress={() => router.push('/reset-password')} />

          <AppButton
            title="Voltar para o login"
            disabled={sending}
            variant="secondary"
            onPress={
              handleBackToLogin
            }
            style={
              styles.backButton
            }
          />
        </View>

        <View style={styles.footer}>
          <Text
            style={
              styles.footerText
            }
          >
            Lembrou sua senha?
          </Text>

          <Pressable
            onPress={
              handleBackToLogin
            }
          >
            <Text
              style={
                styles.loginLink
              }
            >
              Fazer login
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const useStyles = makeStyles((c) => StyleSheet.create({
    container: {
      flex: 1,

      justifyContent:
        'center',

      paddingVertical:
        spacing.xl,
    },

    header: {
      alignItems: 'center',

      marginBottom:
        spacing.lg,
    },

    logoContainer: {
      width: 60,
      height: 60,

      borderRadius: 30,

      alignItems: 'center',
      justifyContent:
        'center',

      backgroundColor:
        c.primary,

      marginBottom:
        spacing.md,
    },

    title: {
      color: c.primary,

      fontSize:
        typography.sizes.xl,

      fontWeight:
        typography.weights.bold,

      textAlign: 'center',
    },

    subtitle: {
      color:
        c.textSecondary,

      fontSize:
        typography.sizes.sm,

      textAlign: 'center',

      marginTop: spacing.xs,
    },

    illustration: {
      alignItems: 'center',

      marginVertical:
        spacing.lg,
    },

    envelopeContainer: {
      width: 100,
      height: 100,

      borderRadius: 50,

      alignItems: 'center',
      justifyContent:
        'center',

      backgroundColor:
        c.blueTintAlt,
    },

    lockContainer: {
      position: 'absolute',

      right: 4,
      bottom: 8,

      width: 32,
      height: 32,

      borderRadius: 16,

      alignItems: 'center',
      justifyContent:
        'center',

      backgroundColor:
        c.primary,
    },

    description: {
      color:
        c.textSecondary,

      fontSize:
        typography.sizes.sm,

      lineHeight: 20,

      textAlign: 'center',

      marginBottom:
        spacing.lg,

      paddingHorizontal:
        spacing.md,
    },

    form: {
      width: '100%',
    },

    backButton: {
      marginTop: spacing.sm,
    },

    footer: {
      alignItems: 'center',

      marginTop: spacing.xl,
    },

    footerText: {
      color:
        c.textSecondary,

      fontSize:
        typography.sizes.xs,
    },

    loginLink: {
      color: c.primary,

      fontSize:
        typography.sizes.xs,

      fontWeight:
        typography.weights
          .semibold,

      marginTop: spacing.xs,
    },
    recoveryButton: {
  marginTop: spacing.md,
},
  }));

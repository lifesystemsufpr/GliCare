import { makeStyles, useThemeColors } from '@/shared/theme';
import { useRef, useState } from 'react';
import { registerRequest } from '../services/auth-service';
import { errorMessage } from '@/shared/api/errors';

import {
  Alert,
  Image,
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
  PasswordInput,
  ScreenContainer,
} from '../../../shared/components';

import { spacing, typography } from '../../../shared/theme';

import { PasswordRules } from '../components/PasswordRules';

export function RegisterScreen() {
  const styles = useStyles();
  const c = useThemeColors();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);
  const busy = useRef(false);
  const [name, setName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  async function handleRegister() {
    if (busy.current || registered) return;
    busy.current = true;
    setSubmitting(true);
    setError('');
    try {
      await registerRequest({ name, email, password, confirmPassword });
      setRegistered(true);
      setPassword('');
      setConfirmPassword('');
      router.replace('/(auth)/login');
      Alert.alert('Conta criada', 'Entre com seu e-mail e sua senha. Depois, complete seus dados de saúde no Perfil.');
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  }

function handleLogin() {
  router.replace('/login');
}

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>
        {/* Cabeçalho */}

        <View style={styles.topBar}>
          <Pressable
            onPress={handleLogin}
            hitSlop={10}
          >
            <Ionicons
  name="arrow-back"
  size={24}
  color={c.text}
/>
          </Pressable>

          <Text
            style={
              styles.topBarTitle
            }
          >
            Cadastro
          </Text>

          <View
            style={
              styles.topBarSpace
            }
          />
        </View>

        <View style={styles.header}>
          <Image
  source={require('../../../../assets/images/logo.png')}
  style={styles.logoImage}
  resizeMode="contain"
/>

<Text style={styles.title}>
  GliCare
</Text>

<Text style={styles.subtitle}>
  Crie sua conta e comece a cuidar da sua rotina.
</Text>
        </View>

        {/* Dados básicos */}

        <AppInput
          label="Nome completo"
          placeholder="Seu nome"
          icon="person-outline"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

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

        <PasswordInput
          label="Confirmar senha"
          placeholder="Confirme sua senha"
          value={confirmPassword}
          onChangeText={
            setConfirmPassword
          }
        />

        <PasswordRules
          password={password}
        />

        {/* Ações */}

        {error ? <Text accessibilityRole="alert" style={{ color: c.error, marginBottom: 12 }}>{error}</Text> : null}
        <AppButton
          title="Criar Conta"
          onPress={handleRegister}
          loading={submitting}
          disabled={registered}
        />

        <AppButton
          title="Já tenho conta"
          variant="secondary"
          onPress={handleLogin}
          disabled={submitting}
          style={
            styles.loginButton
          }
        />

      </View>
    </ScreenContainer>
  );
}

const useStyles = makeStyles((c) => StyleSheet.create({
    container: {
      width: '100%',

      paddingTop: spacing.sm,
    },

    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',

      marginBottom: spacing.lg,
    },

    topBarTitle: {
      color: c.text,

      fontSize:
        typography.sizes.md,

      fontWeight:
        typography.weights
          .semibold,
    },

    topBarSpace: {
      width: 24,
    },

    header: {
      alignItems: 'center',

      marginBottom:
        spacing.xl,
    },

    logoImage: {
  width: 82,
  height: 82,

  marginBottom: spacing.sm,
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

    measurementsRow: {
      flexDirection: 'row',

      gap: spacing.md,
    },

    measurement: {
      flex: 1,
    },

    loginButton: {
      marginTop: spacing.sm,
    },
    emergencyCard: {
  width: '100%',

  backgroundColor: c.blueTintLight,

  borderWidth: 1,
  borderColor: c.blueBorderSoft,
  borderRadius: 16,

  padding: spacing.md,

  marginTop: spacing.sm,
  marginBottom: spacing.xl,
},

sectionTitle: {
  color: c.text,

  fontSize: typography.sizes.md,
  fontWeight: typography.weights.semibold,
},

sectionDescription: {
  color: c.textSecondary,

  fontSize: typography.sizes.xs,
  lineHeight: 17,

  marginTop: spacing.xs,
},
  }));

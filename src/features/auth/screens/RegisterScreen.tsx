import { useRef, useState } from 'react';
import { registerRequest } from '../services/auth-service';
import { formatBirthDateInput } from '../services/auth-contract';
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

import {
  colors,
  spacing,
  typography,
} from '../../../shared/theme';

import {
  DiabetesType,
  DiabetesTypeSelector,
} from '../components/DiabetesTypeSelector';

import { PasswordRules } from '../components/PasswordRules';

export function RegisterScreen() {
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

  const [birthDate, setBirthDate] =
    useState('');

  const [height, setHeight] =
    useState('');

  const [weight, setWeight] =
    useState('');

  const [
    diabetesType,
    setDiabetesType,
  ] =
    useState<DiabetesType | null>(
      null,
    );

  const [
    emergencyName,
    setEmergencyName,
  ] = useState('');

  const [
    emergencyRelation,
    setEmergencyRelation,
  ] = useState('');

  const [
    emergencyPhone,
    setEmergencyPhone,
  ] = useState('');

  async function handleRegister() {
    if (busy.current || registered) return;
    busy.current = true;
    setSubmitting(true);
    setError('');
    try {
      await registerRequest({ name, email, password, confirmPassword, birthDate,
        height, weight, diabetesType, emergencyName, emergencyRelation, emergencyPhone });
      setRegistered(true);
      setPassword('');
      setConfirmPassword('');
      router.replace('/(auth)/login');
      Alert.alert('Conta criada', 'Cadastro concluído. Entre com seu e-mail e sua senha.');
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
  color={colors.text}
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

        {/* Dados pessoais */}

        <AppInput
          label="Data de nascimento"
          placeholder="dd/mm/aaaa"
          icon="calendar-outline"
          value={birthDate}
          onChangeText={(value) => setBirthDate(formatBirthDateInput(value))}
          keyboardType="numeric"
          maxLength={10}
        />

        <View
          style={
            styles.measurementsRow
          }
        >
          <View
            style={
              styles.measurement
            }
          >
            <AppInput
              label="Altura"
              placeholder="Ex.: 1,70 m"
              value={height}
              onChangeText={
                setHeight
              }
              keyboardType="decimal-pad"
            />
          </View>

          <View
            style={
              styles.measurement
            }
          >
            <AppInput
              label="Peso"
              placeholder="Ex.: 70 kg"
              value={weight}
              onChangeText={
                setWeight
              }
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <DiabetesTypeSelector
          value={diabetesType}
          onChange={
            setDiabetesType
          }
        />

        {/* Emergência */}

        <View style={styles.emergencyCard}>
  <View style={styles.emergencyHeader}>
    <View style={styles.emergencyIcon}>
      <Ionicons
        name="call"
        size={18}
        color={colors.primary}
      />
    </View>

    <View style={styles.emergencyHeaderText}>
      <Text style={styles.sectionTitle}>
        Contato de emergência
      </Text>

      <Text style={styles.sectionDescription}>
        Informe alguém que possa ser contatado em caso de necessidade.
      </Text>
    </View>
  </View>

  <AppInput
    label="Nome"
    placeholder="Ex.: Maria"
    icon="person-outline"
    value={emergencyName}
    onChangeText={setEmergencyName}
    autoCapitalize="words"
  />

  <AppInput
    label="Relação"
    placeholder="Ex.: Mãe"
    icon="people-outline"
    value={emergencyRelation}
    onChangeText={setEmergencyRelation}
    autoCapitalize="words"
  />

  <AppInput
    label="Número de telefone"
    placeholder="(00) 00000-0000"
    icon="call-outline"
    value={emergencyPhone}
    onChangeText={setEmergencyPhone}
    keyboardType="phone-pad"
  />
</View>

        {/* Ações */}

        {error ? <Text accessibilityRole="alert" style={{ color: colors.error, marginBottom: 12 }}>{error}</Text> : null}
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

const styles =
  StyleSheet.create({
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
      color: colors.text,

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
      color: colors.primary,

      fontSize:
        typography.sizes.xl,

      fontWeight:
        typography.weights.bold,

      textAlign: 'center',
    },

    subtitle: {
      color:
        colors.textSecondary,

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

  backgroundColor: '#F5FAFE',

  borderWidth: 1,
  borderColor: '#D8EAF7',
  borderRadius: 16,

  padding: spacing.md,

  marginTop: spacing.sm,
  marginBottom: spacing.xl,
},

emergencyHeader: {
  flexDirection: 'row',
  alignItems: 'flex-start',

  marginBottom: spacing.lg,
},

emergencyIcon: {
  width: 36,
  height: 36,

  borderRadius: 18,

  alignItems: 'center',
  justifyContent: 'center',

  backgroundColor: '#E4F2FC',

  marginRight: spacing.sm,
},

emergencyHeaderText: {
  flex: 1,
},

sectionTitle: {
  color: colors.text,

  fontSize: typography.sizes.md,
  fontWeight: typography.weights.semibold,
},

sectionDescription: {
  color: colors.textSecondary,

  fontSize: typography.sizes.xs,
  lineHeight: 17,

  marginTop: spacing.xs,
},
  });

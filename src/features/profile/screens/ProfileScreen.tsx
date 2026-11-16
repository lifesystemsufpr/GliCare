import { contentWidth } from '@/shared/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Alert,
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { colors } from '@/shared/theme';
import { useAuth } from '@/features/auth/hooks/AuthProvider';
import { errorMessage } from '@/shared/api/errors';
import { DiabetesCard } from '../components/DiabetesCard';
import { EmergencyContactCard } from '../components/EmergencyContactCard';
import { ProfileCard } from '../components/ProfileCard';
import { SettingsCard } from '../components/SettingsCard';
import { ProfileEditForm } from '../components/ProfileEditForm';
import { AppButton } from '@/shared/components';
import { getProfile } from '../services/profile-service';
import { diabetesLabels, profileToForm, type Profile } from '../services/profile-contract';

export function ProfileScreen() {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState(false);
  const [retry, setRetry] = useState(0);
  useFocusEffect(useCallback(() => {
    if (editing) return;
    const controller = new AbortController();
    setLoading(true);
    setLoadError('');
    void getProfile(controller.signal).then((data) => {
      if (!controller.signal.aborted) setProfile(data);
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) { setProfile(null); setLoadError(errorMessage(error)); }
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [editing, retry]));
  async function handleLogout() {
    try { await signOut(); }
    catch (error) { Alert.alert('Não foi possível limpar a sessão salva', errorMessage(error)); }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.brandIcon}>
            <Ionicons
              name="medical"
              size={16}
              color={colors.primary}
            />
          </View>

          <Text style={styles.brandText}>
            Meu Perfil
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.notificationButton,
            pressed && styles.notificationButtonPressed,
          ]}
          onPress={() => router.push('/lembretes')}
          hitSlop={12}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={colors.text}
          />
        </Pressable>
      </View>

      {loading ? <ActivityIndicator accessibilityLabel="Carregando perfil" color={colors.primary} /> : loadError ? <>
        <Text accessibilityRole="alert" style={{ color: colors.error }}>{loadError}</Text>
        <AppButton title="Tentar novamente" onPress={() => setRetry((value) => value + 1)} />
      </> : profile ? editing ? <ProfileEditForm initial={profile}
        onSaved={(saved) => { setProfile(saved); setEditing(false); Alert.alert('Perfil atualizado', 'Suas alterações foram salvas.'); }}
        onCancel={() => setEditing(false)} /> : <>
        <ProfileCard name={profile.nome} age={profile.idade} weight={profile.pesoKg}
          height={profile.alturaCm == null ? null : profile.alturaCm / 100} />
        <Text>Data de nascimento: {profileToForm(profile).birthDate || 'Não informada'}</Text>
        <DiabetesCard type={profile.tipoDiabetes ? diabetesLabels[profile.tipoDiabetes] : 'Não informado'} />
        {profile.contatoEmergencia ? <EmergencyContactCard
          name={profile.contatoEmergencia.nome ?? 'Não informado'}
          relationship={profile.contatoEmergencia.relacao ?? 'Não informada'}
          phone={profile.contatoEmergencia.telefone ?? 'Não informado'} /> : <Text>Contato de emergência não informado.</Text>}
        <AppButton title="Editar perfil" onPress={() => setEditing(true)} />
        <AppButton title="Atualizar perfil" variant="secondary" onPress={() => setRetry((value) => value + 1)} />
      </> : null}

      <SettingsCard />

      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && styles.logoutPressed,
        ]}
        onPress={handleLogout}
      >
        <Ionicons
          name="log-out-outline"
          size={19}
          color="#DC2626"
        />

        <Text style={styles.logoutText}>
          Sair da Conta
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },

  content: {
    ...contentWidth,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 150,
    gap: 14,
  },

  header: {
    width: '100%',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 4,
  },

  brand: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 10,
  },

  brandIcon: {
    width: 34,
    height: 34,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 17,

    backgroundColor: '#EEF2FF',
  },

  brandText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },

  notificationButton: {
    width: 44,
    height: 44,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 22,
  },

  notificationButtonPressed: {
    backgroundColor: '#F3F4F6',
  },

  logoutButton: {
    height: 52,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 8,

    marginTop: 2,

    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,

    backgroundColor: '#FFFFFF',
  },

  logoutPressed: {
    backgroundColor: '#FEF2F2',
  },

  logoutText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#DC2626',
  },
});

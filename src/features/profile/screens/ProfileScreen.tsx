import { contentWidth } from '@/shared/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Alert,
    ActivityIndicator,
    Modal,
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
import { ProfileCard } from '../components/ProfileCard';
import { ProfileEditForm } from '../components/ProfileEditForm';
import { AppButton } from '@/shared/components';
import { deleteAccount, getProfile } from '../services/profile-service';
import { diabetesLabels, profileToForm, type Profile } from '../services/profile-contract';

export function ProfileScreen() {
  const { signOut, setProfileComplete } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState(false);
  const [retry, setRetry] = useState(0);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
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
  async function handleDeleteAccount() {
    if (deleting) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteAccount();
    } catch (error) {
      setDeleteError(errorMessage(error));
      setDeleting(false);
      return;
    }
    // Conta excluída: encerra a sessão pelo fluxo de logout (limpa token e
    // alertas locais dos lembretes) e volta ao login.
    setConfirmingDelete(false);
    await handleLogout();
  }
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
        onSaved={(saved) => { setProfile(saved); setEditing(false); if (typeof saved.perfilCompleto === 'boolean') setProfileComplete(saved.perfilCompleto); Alert.alert('Perfil atualizado', 'Suas alterações foram salvas.'); }}
        onCancel={() => setEditing(false)} /> : <>
        {profile.perfilCompleto === false ? <View style={styles.incomplete}>
          <Text style={styles.incompleteTitle}>Complete seu perfil</Text>
          <Text>Informe data de nascimento, tipo de diabetes, altura e peso para registrar glicemia e insulina e ver seus relatórios.</Text>
          <AppButton title="Completar perfil" onPress={() => setEditing(true)} />
        </View> : null}
        <ProfileCard name={profile.nome} age={profile.idade} weight={profile.pesoKg}
          birthDate={profileToForm(profile).birthDate}
          height={profile.alturaCm == null ? null : profile.alturaCm / 100} />
        <DiabetesCard type={profile.tipoDiabetes ? diabetesLabels[profile.tipoDiabetes] : 'Não informado'} />
        <View style={styles.actions}>
          <AppButton title="Editar perfil" onPress={() => setEditing(true)} />
          <AppButton title="Recarregar dados" variant="secondary" onPress={() => setRetry((value) => value + 1)} />
        </View>
      </> : null}

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

      <Pressable
        style={({ pressed }) => [styles.deleteButton, pressed && styles.logoutPressed]}
        onPress={() => { setDeleteError(''); setConfirmingDelete(true); }}
        accessibilityRole="button"
      >
        <Text style={styles.deleteText}>Excluir minha conta</Text>
      </Pressable>

      <Modal visible={confirmingDelete} transparent animationType="fade"
        onRequestClose={() => { if (!deleting) setConfirmingDelete(false); }}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Excluir sua conta?</Text>
            <Text style={styles.modalText}>
              Seu perfil, glicemias, aplicações de insulina e lembretes serão apagados. Essa ação não pode ser desfeita.
            </Text>
            {deleteError ? <Text accessibilityRole="alert" style={{ color: colors.error }}>{deleteError}</Text> : null}
            <Pressable
              style={({ pressed }) => [styles.modalDanger, (pressed || deleting) && styles.logoutPressed]}
              onPress={() => void handleDeleteAccount()}
              disabled={deleting}
              accessibilityRole="button"
            >
              {deleting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.modalDangerText}>Excluir conta</Text>}
            </Pressable>
            <AppButton title="Cancelar" variant="secondary" disabled={deleting} onPress={() => setConfirmingDelete(false)} />
          </View>
        </View>
      </Modal>
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

  incomplete: {
    gap: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#93C5FD',
    backgroundColor: '#EFF6FF',
  },

  incompleteTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },

  actions: {
    gap: 12,
    marginTop: 4,
  },

  deleteButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },

  deleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B91C1C',
    textDecorationLine: 'underline',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    padding: 24,
  },

  modalCard: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    gap: 16,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },

  modalText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },

  modalDanger: {
    minHeight: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B91C1C',
  },

  modalDangerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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

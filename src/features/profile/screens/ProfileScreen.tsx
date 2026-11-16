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
      if (controller.signal.aborted) return;
      setProfile(data);
      // Mantém a sessão em dia se o perfil foi completado em outro aparelho.
      if (typeof data.perfilCompleto === 'boolean') setProfileComplete(data.perfilCompleto);
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) { setProfile(null); setLoadError(errorMessage(error)); }
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [editing, retry, setProfileComplete]));
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

      <View style={styles.settings}>
        <Text style={styles.settingsTitle}>Configurações</Text>
        <Pressable
          style={({ pressed }) => [styles.settingsItem, pressed && styles.logoutPressed]}
          onPress={() => router.push('/notificacoes')}
          accessibilityRole="button"
        >
          <Ionicons name="notifications-outline" size={19} color={colors.text} />
          <Text style={styles.settingsText}>Notificações</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

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
          color={colors.error}
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
              {deleting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.modalDangerText}>Excluir conta</Text>}
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
    backgroundColor: colors.screen,
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

    backgroundColor: colors.indigo50,
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
    backgroundColor: colors.gray100,
  },

  incomplete: {
    gap: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.blue300,
    backgroundColor: colors.blue50,
  },

  incompleteTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },

  settings: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 10,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },

  settingsTitle: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    backgroundColor: colors.screen,
  },

  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },

  settingsText: {
    flex: 1,
    fontSize: 15,
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
    color: colors.danger,
    textDecorationLine: 'underline',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: 24,
  },

  modalCard: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: colors.white,
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
    backgroundColor: colors.danger,
  },

  modalDangerText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },

  logoutButton: {
    height: 52,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 8,

    marginTop: 2,

    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: 10,

    backgroundColor: colors.white,
  },

  logoutPressed: {
    backgroundColor: colors.dangerSoft,
  },

  logoutText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.error,
  },
});

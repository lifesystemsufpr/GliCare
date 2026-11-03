import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/shared/theme';
import { AppButton } from '@/shared/components';
import { errorMessage } from '@/shared/api/errors';
import { ReminderCard } from '../components/ReminderCard';
import { ReminderFormModal } from '../components/ReminderFormModal';
import { reminderToForm, type Reminder, type ReminderForm } from '../services/reminder-contract';
import { createReminder, deleteReminder, listReminders, setReminderActive, updateReminder } from '../services/reminder-service';
import { localNotificationsSupported, reminderNotifications } from '../services/reminder-notifications';

export function RemindersScreen() {
  const notifications = useSyncExternalStore(reminderNotifications.subscribe,
    reminderNotifications.getSnapshot, reminderNotifications.getSnapshot);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Reminder | null>(null);
  const initialData = useMemo(() => editingReminder ? reminderToForm(editingReminder) : undefined, [editingReminder]);

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError('');
    void listReminders(controller.signal).then((data) => {
      if (!controller.signal.aborted) setReminders(data);
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) { setReminders([]); setLoadError(errorMessage(cause)); }
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [revision]));

  async function mutate(action: () => Promise<void>) {
    if (busyRef.current) throw new Error('Aguarde a operação em andamento.');
    busyRef.current = true;
    setBusy(true);
    setActionError('');
    try { await action(); }
    finally { busyRef.current = false; setBusy(false); }
  }
  function openCreate() {
    if (busyRef.current) return;
    setEditingReminder(null);
    setModalVisible(true);
  }
  function closeModal() {
    if (busyRef.current) return;
    setModalVisible(false);
    setEditingReminder(null);
  }
  async function save(form: ReminderForm) {
    await mutate(async () => {
      if (editingReminder) await updateReminder(editingReminder, form);
      else await createReminder(form);
      setModalVisible(false);
      setEditingReminder(null);
      setRevision((value) => value + 1);
    });
  }
  async function toggle(reminder: Reminder) {
    try {
      await mutate(async () => {
        const saved = await setReminderActive(reminder.id, reminder.status !== 'ATIVO');
        setReminders((items) => items.map((item) => item.id === saved.id ? saved : item));
      });
    } catch (cause) { setActionError(errorMessage(cause)); }
  }
  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await mutate(async () => {
        await deleteReminder(pendingDelete.id);
        setReminders((items) => items.filter((item) => item.id !== pendingDelete.id));
        setPendingDelete(null);
      });
    } catch (cause) { setActionError(errorMessage(cause)); }
  }
  const disabled = loading || busy;
  return <View style={styles.container}>
    <View style={styles.header}>
      <Pressable style={styles.headerButton} onPress={() => router.back()} accessibilityLabel="Voltar">
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </Pressable>
      <Text style={styles.headerTitle}>Lembretes</Text>
      <View style={styles.headerSpacer} />
    </View>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Todos os lembretes</Text>
      <Text>Lembretes para data e hora específicas.</Text>
      <View style={{ gap: 10, marginVertical: 16 }}>
        <Text accessibilityLiveRegion="polite">{notifications.message}</Text>
        {localNotificationsSupported ? <>
          <AppButton title={notifications.enabled ? 'Desativar alertas neste aparelho' : 'Ativar alertas neste aparelho'}
            variant="secondary" disabled={notifications.busy || busy}
            onPress={() => { void (notifications.enabled ? reminderNotifications.disable() : reminderNotifications.enable()).catch(() => undefined); }} />
          <AppButton title="Sincronizar alertas" variant="secondary" disabled={notifications.busy || busy}
            onPress={() => { void reminderNotifications.refresh().catch(() => undefined); }} />
        </> : null}
      </View>
      {loading ? <ActivityIndicator accessibilityLabel="Carregando lembretes" color={colors.primary} /> : loadError ?
        <Text accessibilityRole="alert" style={{ color: colors.error }}>{loadError}</Text> :
        <View style={styles.remindersList}>
          {reminders.length === 0 ? <Text>Nenhum lembrete cadastrado.</Text> : reminders.map((reminder) => {
            const form = reminderToForm(reminder);
            return <ReminderCard key={reminder.id} time={form.time} date={form.date} title={reminder.titulo}
              active={reminder.status === 'ATIVO'} disabled={disabled}
              onToggle={() => void toggle(reminder)}
              onEdit={() => { if (!busyRef.current) { setEditingReminder(reminder); setModalVisible(true); } }}
              onDelete={() => { if (!busyRef.current) { setActionError(''); setPendingDelete(reminder); } }} />;
          })}
        </View>}
      {actionError && !pendingDelete ? <Text accessibilityRole="alert" style={{ color: colors.error }}>{actionError}</Text> : null}
      {busy ? <ActivityIndicator accessibilityLabel="Atualizando lembrete" color={colors.primary} /> : null}
      <AppButton title="Atualizar lista" variant="secondary" disabled={disabled} onPress={() => { setActionError(''); setRevision((value) => value + 1); void reminderNotifications.refresh().catch(() => undefined); }} />
      <AppButton title="Adicionar lembrete" disabled={disabled} onPress={openCreate} />
    </ScrollView>
    <ReminderFormModal visible={modalVisible} mode={editingReminder ? 'edit' : 'create'}
      initialData={initialData} onClose={closeModal} onSave={save} />
    <Modal visible={Boolean(pendingDelete)} transparent animationType="fade"
      onRequestClose={() => { if (!busyRef.current) setPendingDelete(null); }}>
      <View style={{ flex: 1, backgroundColor: '#00000066', justifyContent: 'center', padding: 24 }}>
        <View style={{ backgroundColor: '#FFFFFF', padding: 24, borderRadius: 16, gap: 16 }}>
          <Text style={styles.sectionTitle}>Excluir lembrete?</Text>
          <Text>{pendingDelete?.titulo}</Text>
          {actionError ? <Text accessibilityRole="alert" style={{ color: colors.error }}>{actionError}</Text> : null}
          <AppButton title="Confirmar exclusão" loading={busy} onPress={confirmDelete} />
          <AppButton title="Cancelar" variant="secondary" disabled={busy} onPress={() => setPendingDelete(null)} />
        </View>
      </View>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },

  header: {
    minHeight: 64,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 16,
    paddingTop: 8,

    backgroundColor: '#FFFFFF',

    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  headerButton: {
    width: 40,
    height: 40,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 20,
  },

  headerButtonPressed: {
    backgroundColor: '#F3F4F6',
  },

  headerTitle: {
    flex: 1,

    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },

  headerSpacer: {
    width: 40,
    height: 40,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 140,
  },

  sectionTitle: {
    marginBottom: 14,

    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },

  remindersList: {
    gap: 12,
  },

  addButton: {
    width: '100%',
    height: 50,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 8,

    marginTop: 24,

    borderRadius: 10,

    backgroundColor: colors.primary,
  },

  addButtonPressed: {
    opacity: 0.85,
  },

  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

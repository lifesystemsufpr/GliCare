import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { errorMessage } from '@/shared/api/errors';
import { formatBirthDateInput } from '@/features/auth/services/auth-contract';
import { formatTimeInput, localDate, type ReminderForm } from '../services/reminder-contract';
import {
  Modal,
  ScrollView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { makeStyles, useThemeColors } from '@/shared/theme';

type ReminderFormModalProps = {
  visible: boolean;
  mode: 'create' | 'edit';
  initialData?: ReminderForm;
  onClose: () => void;
  onSave: (data: ReminderForm) => Promise<void>;
};

export function ReminderFormModal({
  visible,
  mode,
  initialData,
  onClose,
  onSave,
}: ReminderFormModalProps) {
  const styles = useStyles();
  const c = useThemeColors();
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const busy = useRef(false);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setTitle(initialData?.title ?? '');
    setTime(initialData?.time ?? '');
    setDate(initialData?.date ?? localDate(new Date()));
    setError('');
  }, [visible, initialData]);

  async function handleSave() {
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    setError('');
    try { await onSave({ title, date, time }); }
    catch (cause) { setError(errorMessage(cause)); }
    finally { busy.current = false; setSaving(false); }
  }
  function close() { if (!busy.current) onClose(); }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <View style={styles.overlay}>
        <ScrollView style={[styles.modal, { maxHeight: '90%' }]} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>
              {mode === 'create'
                ? 'Adicionar Lembrete'
                : 'Editar Lembrete'}
            </Text>

            <Pressable
              style={styles.closeButton}
              onPress={close}
              disabled={saving}
            >
              <Ionicons
                name="close"
                size={23}
                color={c.text}
              />
            </Pressable>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Título
            </Text>

            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: Medir glicemia"
              placeholderTextColor={c.gray400}
              maxLength={150}
              editable={!saving}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Data</Text>
            <TextInput style={styles.input} value={date}
              onChangeText={(value) => setDate(formatBirthDateInput(value))}
              placeholder="dd/mm/aaaa" keyboardType="numeric" maxLength={10} editable={!saving} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>
              Horário
            </Text>

            <TextInput
              style={styles.input}
              value={time}
              onChangeText={(value) => setTime(formatTimeInput(value))}
              placeholder="Ex: 08:00"
              placeholderTextColor={c.gray400}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
              editable={!saving}
            />
          </View>

          {error ? <Text accessibilityRole="alert" style={{ color: c.error }}>{error}</Text> : null}
          <View style={styles.actions}>
            <Pressable
              style={styles.cancelButton}
              onPress={close}
              disabled={saving}
            >
              <Text style={styles.cancelText}>
                Cancelar
              </Text>
            </Pressable>

            <Pressable
              style={styles.saveButton}
              onPress={handleSave}
              disabled={saving}
              accessibilityState={{ disabled: saving, busy: saving }}
            >
              <Text style={styles.saveText}>
                {saving ? 'Salvando...' : mode === 'create'
                  ? 'Adicionar'
                  : 'Salvar'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const useStyles = makeStyles((c) => StyleSheet.create({
  overlay: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 20,

    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },

  modal: {
    width: '100%',
    maxWidth: 420,

    padding: 20,

    borderRadius: 14,

    backgroundColor: c.white,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 20,
  },

  title: {
    flex: 1,

    fontSize: 19,
    fontWeight: '700',
    color: c.text,
  },

  closeButton: {
    width: 36,
    height: 36,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 18,
  },

  field: {
    marginBottom: 16,
  },

  label: {
    marginBottom: 6,

    fontSize: 13,
    fontWeight: '600',
    color: c.text,
  },

  input: {
    width: '100%',
    height: 48,

    paddingHorizontal: 12,

    borderWidth: 1,
    borderColor: c.gray300,
    borderRadius: 8,

    fontSize: 14,
    color: c.text,

    backgroundColor: c.white,
  },

  actions: {
    flexDirection: 'row',

    gap: 10,

    marginTop: 6,
  },

  cancelButton: {
    flex: 1,
    height: 46,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,
    borderColor: c.gray300,
    borderRadius: 8,

    backgroundColor: c.white,
  },

  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: c.text,
  },

  saveButton: {
    flex: 1,
    height: 46,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 8,

    backgroundColor: c.primary,
  },

  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: c.onPrimary,
  },
}));

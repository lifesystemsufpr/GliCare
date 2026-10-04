import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '@/shared/theme';

type ReminderFormData = {
  title: string;
  time: string;
};

type ReminderFormModalProps = {
  visible: boolean;
  mode: 'create' | 'edit';
  initialData?: ReminderFormData;
  onClose: () => void;
  onSave: (data: ReminderFormData) => void;
};

export function ReminderFormModal({
  visible,
  mode,
  initialData,
  onClose,
  onSave,
}: ReminderFormModalProps) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    if (!visible) {
      return;
    }

    setTitle(initialData?.title ?? '');
    setTime(initialData?.time ?? '');
  }, [visible, initialData]);

  function handleSave() {
    const formattedTitle = title.trim();
    const formattedTime = time.trim();

    if (!formattedTitle || !formattedTime) {
      return;
    }

    onSave({
      title: formattedTitle,
      time: formattedTime,
    });
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {mode === 'create'
                ? 'Adicionar Lembrete'
                : 'Editar Lembrete'}
            </Text>

            <Pressable
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons
                name="close"
                size={23}
                color={colors.text}
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
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Horário
            </Text>

            <TextInput
              style={styles.input}
              value={time}
              onChangeText={setTime}
              placeholder="Ex: 08:00"
              placeholderTextColor="#9CA3AF"
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />
          </View>

          <View style={styles.actions}>
            <Pressable
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>
                Cancelar
              </Text>
            </Pressable>

            <Pressable
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveText}>
                {mode === 'create'
                  ? 'Adicionar'
                  : 'Salvar'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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

    backgroundColor: '#FFFFFF',
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
    color: colors.text,
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
    color: colors.text,
  },

  input: {
    width: '100%',
    height: 48,

    paddingHorizontal: 12,

    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,

    fontSize: 14,
    color: colors.text,

    backgroundColor: '#FFFFFF',
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
    borderColor: '#D1D5DB',
    borderRadius: 8,

    backgroundColor: '#FFFFFF',
  },

  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },

  saveButton: {
    flex: 1,
    height: 46,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 8,

    backgroundColor: colors.primary,
  },

  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
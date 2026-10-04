import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { colors } from '@/shared/theme';

import { ReminderCard } from '../components/ReminderCard';
import { ReminderFormModal } from '../components/ReminderFormModal';

type Reminder = {
  id: number;
  time: string;
  title: string;
  active: boolean;
};

const initialReminders: Reminder[] = [
  {
    id: 1,
    time: '07:00',
    title: 'Medir Glicemia - Jejum',
    active: true,
  },
  {
    id: 2,
    time: '08:00',
    title: 'Tomar Insulina Basal',
    active: true,
  },
  {
    id: 3,
    time: '12:30',
    title: 'Almoço',
    active: false,
  },
];

export function RemindersScreen() {
  const [reminders, setReminders] =
    useState<Reminder[]>(initialReminders);

  const [modalVisible, setModalVisible] =
    useState(false);

  const [editingReminder, setEditingReminder] =
    useState<Reminder | null>(null);

  function handleToggle(id: number) {
    setReminders((currentReminders) =>
      currentReminders.map((reminder) =>
        reminder.id === id
          ? {
              ...reminder,
              active: !reminder.active,
            }
          : reminder,
      ),
    );
  }

  function handleOpenCreate() {
    setEditingReminder(null);
    setModalVisible(true);
  }

  function handleOpenEdit(reminder: Reminder) {
    setEditingReminder(reminder);
    setModalVisible(true);
  }

  function handleCloseModal() {
    setModalVisible(false);
    setEditingReminder(null);
  }

  function handleSave(data: {
    title: string;
    time: string;
  }) {
    if (editingReminder) {
      setReminders((currentReminders) =>
        currentReminders.map((reminder) =>
          reminder.id === editingReminder.id
            ? {
                ...reminder,
                title: data.title,
                time: data.time,
              }
            : reminder,
        ),
      );
    } else {
      const newReminder: Reminder = {
        id: Date.now(),
        title: data.title,
        time: data.time,
        active: true,
      };

      setReminders((currentReminders) => [
        ...currentReminders,
        newReminder,
      ]);
    }

    handleCloseModal();
  }

  function handleDelete(reminder: Reminder) {
    Alert.alert(
      'Excluir lembrete?',
      `Tem certeza que deseja excluir "${reminder.title}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setReminders((currentReminders) =>
              currentReminders.filter(
                (item) => item.id !== reminder.id,
              ),
            );
          },
        },
      ],
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.headerButtonPressed,
          ]}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={colors.text}
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Lembretes
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>
          Hoje
        </Text>

        <View style={styles.remindersList}>
          {reminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              time={reminder.time}
              title={reminder.title}
              active={reminder.active}
              onToggle={() =>
                handleToggle(reminder.id)
              }
              onEdit={() =>
                handleOpenEdit(reminder)
              }
              onDelete={() =>
                handleDelete(reminder)
              }
            />
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
          ]}
          onPress={handleOpenCreate}
        >
          <Ionicons
            name="add"
            size={20}
            color="#FFFFFF"
          />

          <Text style={styles.addButtonText}>
            Adicionar Lembrete
          </Text>
        </Pressable>
      </ScrollView>

      <ReminderFormModal
        visible={modalVisible}
        mode={
          editingReminder
            ? 'edit'
            : 'create'
        }
        initialData={
          editingReminder
            ? {
                title: editingReminder.title,
                time: editingReminder.time,
              }
            : undefined
        }
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </View>
  );
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
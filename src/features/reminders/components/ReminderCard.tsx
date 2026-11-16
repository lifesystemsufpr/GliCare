import { Ionicons } from '@expo/vector-icons';
import {
    Pressable,
    StyleSheet,
    Switch,
    Text,
    View,
} from 'react-native';

import { makeStyles, useThemeColors } from '@/shared/theme';

type ReminderCardProps = {
  time: string;
  title: string;
  active: boolean;
  date: string;
  disabled?: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function ReminderCard({
  time,
  title,
  active,
  date,
  disabled = false,
  onToggle,
  onEdit,
  onDelete,
}: ReminderCardProps) {
  const styles = useStyles();
  const c = useThemeColors();
  return (
    <View
      style={[
        styles.card,
        !active && styles.cardInactive,
      ]}
    >
      <View style={styles.mainRow}>
        <View style={styles.content}>
          <Text
            style={[
              styles.time,
              !active && styles.inactiveText,
            ]}
          >
            {time}
          </Text>
          <Text style={{ color: c.defaultText }}>{date}</Text>

          <Text
            style={[
              styles.title,
              !active && styles.inactiveText,
            ]}
          >
            {title}
          </Text>
        </View>

        <Switch
          value={active}
          onValueChange={onToggle}
          disabled={disabled}
          trackColor={{
            false: c.gray300,
            true: c.blue300,
          }}
          thumbColor={
            active
              ? c.primary
              : c.white
          }
          {...({ activeThumbColor: c.primary } as object)}
        />
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionPressed,
          ]}
          onPress={onEdit}
          disabled={disabled}
        >
          <Ionicons
            name="create-outline"
            size={19}
            color={c.primary}
          />

          <Text style={styles.editText}>
            Editar
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionPressed,
          ]}
          onPress={onDelete}
          disabled={disabled}
        >
          <Ionicons
            name="trash-outline"
            size={19}
            color={c.error}
          />

          <Text style={styles.deleteText}>
            Excluir
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const useStyles = makeStyles((c) => StyleSheet.create({
  card: {
    width: '100%',

    paddingHorizontal: 16,
    paddingVertical: 14,

    borderWidth: 1,
    borderColor: c.gray200,
    borderRadius: 12,

    backgroundColor: c.white,

    elevation: 1,

    shadowColor: c.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },

  cardInactive: {
    backgroundColor: c.gray50,
  },

  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  content: {
    flex: 1,
    minWidth: 0,

    marginRight: 12,
  },

  time: {
    marginBottom: 4,

    fontSize: 16,
    fontWeight: '700',
    color: c.primary,
  },

  title: {
    fontSize: 14,
    fontWeight: '500',
    color: c.text,
  },

  inactiveText: {
    color: c.textSecondary,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',

    gap: 8,

    marginTop: 12,
    paddingTop: 10,

    borderTopWidth: 1,
    borderTopColor: c.gray100,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 5,

    paddingHorizontal: 8,
    paddingVertical: 5,

    borderRadius: 6,
  },

  actionPressed: {
    backgroundColor: c.gray100,
  },

  editText: {
    fontSize: 12,
    fontWeight: '500',
    color: c.primary,
  },

  deleteText: {
    fontSize: 12,
    fontWeight: '500',
    color: c.error,
  },
}));

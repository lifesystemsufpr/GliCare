import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/shared/theme';

interface ReminderCardProps {
  time: string;
  title: string;
}

export function ReminderCard({
  time,
  title,
}: ReminderCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Ionicons
          name="alarm-outline"
          size={13}
          color={colors.primary}
        />
        <Text style={styles.title}>Próximo Lembrete</Text>
      </View>

      <Text style={styles.time}>{time}</Text>

      <Text style={styles.description}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 135,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CFE6F7',
    elevation: 2,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

title: {
  flex: 1,
  fontSize: 12,
  fontWeight: '700',
  color: colors.primary,
},

time: {
  marginTop: 16,
  fontSize: 27,
  fontWeight: '500',
  color: '#111111',
},

description: {
  marginTop: 4,
  fontSize: 11,
  lineHeight: 15,
  color: '#4B5563',
},
});
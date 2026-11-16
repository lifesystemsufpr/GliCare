import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { makeStyles, useThemeColors } from '@/shared/theme';

interface ReminderCardProps {
  time: string;
  title: string;
  date?: string;
}

export function ReminderCard({
  time,
  title,
  date,
}: ReminderCardProps) {
  const styles = useStyles();
  const c = useThemeColors();
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Ionicons
          name="alarm-outline"
          size={13}
          color={c.primary}
        />
        <Text style={styles.title}>Próximo Lembrete</Text>
      </View>

      <Text style={styles.time}>{time}</Text>
      {date ? <Text style={{ fontSize: 11, color: c.gray600 }}>{date}</Text> : null}

      <Text style={styles.description}>
        {title}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((c) => StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 135,
    padding: 16,
    backgroundColor: c.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.blueBorder,
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
  color: c.primary,
},

time: {
  marginTop: 16,
  fontSize: 27,
  fontWeight: '500',
  color: c.ink,
},

description: {
  marginTop: 4,
  fontSize: 11,
  lineHeight: 15,
  color: c.gray600,
},
}));

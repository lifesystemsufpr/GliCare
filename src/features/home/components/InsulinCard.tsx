import { formatNumber } from '@/shared/format';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { makeStyles, useThemeColors } from '@/shared/theme';

interface InsulinCardProps {
  dose: number | null;
  type: string;
  appliedAt: string;
}

export function InsulinCard({
  dose,
  type,
  appliedAt,
}: InsulinCardProps) {
  const styles = useStyles();
  const c = useThemeColors();
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Ionicons
          name="medical"
          size={12}
          color={c.primary}
        />
        <Text style={styles.title}>Última Insulina</Text>
      </View>

      <View style={styles.valueRow}>
        <Text style={styles.value}>{dose == null ? '—' : formatNumber(dose)}</Text>
        <Text style={styles.unit}>UI</Text>
      </View>

      <Text style={styles.type}>{type}</Text>
      <Text style={styles.date}>{appliedAt}</Text>
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
    borderColor: c.neutralSoftAlt,
    elevation: 2,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

title: {
  fontSize: 12,
  fontWeight: '700',
  color: c.primary,
},

valueRow: {
  flexDirection: 'row',
  alignItems: 'baseline',
  marginTop: 16,
},

value: {
  fontSize: 27,
  fontWeight: '700',
  color: c.ink,
},

unit: {
  marginLeft: 4,
  fontSize: 11,
  color: c.gray500,
},

type: {
  marginTop: 3,
  fontSize: 12,
  color: c.ink,
},

date: {
  marginTop: 5,
  fontSize: 10,
  color: c.gray500,
},
}));

import { formatNumber } from '@/shared/format';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/shared/theme';

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
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Ionicons
          name="medical"
          size={12}
          color={colors.primary}
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

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 135,
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutralSoftAlt,
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
  color: colors.primary,
},

valueRow: {
  flexDirection: 'row',
  alignItems: 'baseline',
  marginTop: 16,
},

value: {
  fontSize: 27,
  fontWeight: '700',
  color: colors.ink,
},

unit: {
  marginLeft: 4,
  fontSize: 11,
  color: colors.gray500,
},

type: {
  marginTop: 3,
  fontSize: 12,
  color: colors.ink,
},

date: {
  marginTop: 5,
  fontSize: 10,
  color: colors.gray500,
},
});

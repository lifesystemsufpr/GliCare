import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/shared/theme';

interface DailySummaryProps {
  glucoseRegistered: boolean;
  insulinRegistered: boolean;
}

function SummaryRow({
  label,
  completed,
}: {
  label: string;
  completed: boolean;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View
          style={[
            styles.iconCircle,
            !completed && styles.pendingCircle,
          ]}
        >
          <Ionicons
            name={completed ? 'checkmark' : 'time-outline'}
            size={11}
            color={completed ? '#15803D' : '#6B7280'}
          />
        </View>

        <Text style={styles.label}>{label}</Text>
      </View>

      <Text
        style={[
          styles.status,
          !completed && styles.pendingStatus,
        ]}
      >
        {completed ? 'Concluído' : 'Pendente'}
      </Text>
    </View>
  );
}

export function DailySummary({
  glucoseRegistered,
  insulinRegistered,
}: DailySummaryProps) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Resumo Diário</Text>

      <View style={styles.card}>
        <SummaryRow
          label="Glicemia"
          completed={glucoseRegistered}
        />

        <View style={styles.divider} />

        <SummaryRow
          label="Insulina"
          completed={insulinRegistered}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginBottom: 12,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F1F1',
    overflow: 'hidden',
  },

  row: {
    height: 58,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF7ED',
  },

  pendingCircle: {
    backgroundColor: '#F1F1F1',
  },

  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222222',
  },

  status: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803D',
  },

  pendingStatus: {
    color: '#6B7280',
  },

  divider: {
    height: 1,
    marginHorizontal: 12,
    backgroundColor: '#F1F1F1',
  },
});
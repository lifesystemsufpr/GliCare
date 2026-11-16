import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { makeStyles, useThemeColors } from '@/shared/theme';

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
  const styles = useStyles();
  const c = useThemeColors();
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
            color={completed ? c.success : c.gray500}
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
        {completed ? 'Registrado hoje' : 'Sem registro hoje'}
      </Text>
    </View>
  );
}

export function DailySummary({
  glucoseRegistered,
  insulinRegistered,
}: DailySummaryProps) {
  const styles = useStyles();
  return (
    <View>
      <Text style={styles.sectionTitle}>Registros de hoje</Text>

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

const useStyles = makeStyles((c) => StyleSheet.create({
  sectionTitle: {
    marginBottom: 12,
    fontSize: 20,
    fontWeight: '600',
    color: c.text,
  },

  card: {
    backgroundColor: c.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.neutralSoft,
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
    backgroundColor: c.successSoft,
  },

  pendingCircle: {
    backgroundColor: c.neutralSoft,
  },

  label: {
    fontSize: 14,
    fontWeight: '500',
    color: c.inkSoft,
  },

  status: {
    fontSize: 11,
    fontWeight: '600',
    color: c.success,
  },

  pendingStatus: {
    color: c.gray500,
  },

  divider: {
    height: 1,
    marginHorizontal: 12,
    backgroundColor: c.neutralSoft,
  },
}));

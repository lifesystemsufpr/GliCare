import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/shared/theme';

interface GlucoseCardProps {
  value: number | null;
  status: 'NORMAL' | 'ALTA' | 'BAIXA' | null;
  measuredAt: string;
}

export function GlucoseCard({
  value,
  status,
  measuredAt,
}: GlucoseCardProps) {
  const statusText = status ? { NORMAL: 'Normal', ALTA: 'Alta', BAIXA: 'Baixa' }[status] : 'Sem registro';
  const statusColor = status === 'NORMAL' ? colors.success : status ? colors.warning : colors.gray500;
  return (
    <View style={styles.card}>
      {/* Gota decorativa no fundo */}
      <Ionicons
        name="water-outline"
        size={72}
        color={colors.watermark}
        style={styles.watermark}
      />

      {/* Cabeçalho */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons
            name="water"
            size={17}
            color={colors.primary}
          />

          <Text style={styles.title}>
            Última Glicemia
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: status === 'NORMAL' ? colors.successSoft : status ? colors.warningSoft : colors.gray100 }]}>
          <Ionicons
            name={status === 'NORMAL' ? 'checkmark-circle-outline' : 'information-circle-outline'}
            size={13}
            color={statusColor}
          />

          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusText}
          </Text>
        </View>
      </View>

      {/* Valor */}
      <View style={styles.valueRow}>
        <Text style={styles.value}>
          {value ?? '—'}
        </Text>

        <Text style={styles.unit}>
          mg/dL
        </Text>
      </View>

      {/* Horário da medição */}
      <Text style={styles.date}>
        {measuredAt}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    overflow: 'hidden',

    minHeight: 145,
    padding: 18,

    backgroundColor: colors.white,

    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,

    elevation: 2,

    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,

    paddingHorizontal: 9,
    paddingVertical: 5,

    borderRadius: 12,
    backgroundColor: colors.successSoft,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.success,
  },

  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 18,
  },

  value: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '700',
    color: colors.ink,
  },

  unit: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray500,
  },

  date: {
    marginTop: 3,
    fontSize: 11,
    color: colors.gray500,
  },

  watermark: {
    position: 'absolute',
    right: -8,
    bottom: -10,
  },
});

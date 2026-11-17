import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { makeStyles, useThemeColors } from '@/shared/theme';
import {
  HOME_HYPO_PAST, HOME_HYPO_RECENT, isRecentReading,
} from '@/features/glucose/services/hypoglycemia-warning';

interface GlucoseCardProps {
  value: number | null;
  status: 'NORMAL' | 'ALTA' | 'BAIXA' | null;
  measuredAt: string;
  hipoglicemiaNivel2: boolean;
  // Data da medição (ISO), para não tratar um registro antigo como urgente.
  measuredAtIso: string | null;
}

export function GlucoseCard({
  value,
  status,
  measuredAt,
  hipoglicemiaNivel2,
  measuredAtIso,
}: GlucoseCardProps) {
  const recent = measuredAtIso ? isRecentReading(measuredAtIso) : false;
  const styles = useStyles();
  const c = useThemeColors();
  const statusText = status ? { NORMAL: 'Normal', ALTA: 'Alta', BAIXA: 'Baixa' }[status] : 'Sem registro';
  const statusColor = status === 'NORMAL' ? c.success : status ? c.warning : c.gray500;
  return (
    <View style={styles.card}>
      {/* Gota decorativa no fundo */}
      <Ionicons
        name="water-outline"
        size={72}
        color={c.watermark}
        style={styles.watermark}
      />

      {/* Cabeçalho */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons
            name="water"
            size={17}
            color={c.primary}
          />

          <Text style={styles.title}>
            Última Glicemia
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: status === 'NORMAL' ? c.successSoft : status ? c.warningSoft : c.gray100 }]}>
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

      {hipoglicemiaNivel2 ? <Text accessibilityRole="alert" style={styles.warning}>{recent ? HOME_HYPO_RECENT : HOME_HYPO_PAST}</Text> : null}
      {/* Horário da medição */}
      <Text style={styles.date}>
        {measuredAt}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((c) => StyleSheet.create({
  card: {
    position: 'relative',
    overflow: 'hidden',

    minHeight: 145,
    padding: 18,

    backgroundColor: c.white,

    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.gray200,

    elevation: 2,

    shadowColor: c.black,
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
    color: c.primary,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,

    paddingHorizontal: 9,
    paddingVertical: 5,

    borderRadius: 12,
    backgroundColor: c.successSoft,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: c.success,
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
    color: c.ink,
  },

  unit: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '500',
    color: c.gray500,
  },

  warning: { color: c.danger, marginTop: 8 },
  date: {
    marginTop: 3,
    fontSize: 11,
    color: c.gray500,
  },

  watermark: {
    position: 'absolute',
    right: -8,
    bottom: -10,
  },
}));

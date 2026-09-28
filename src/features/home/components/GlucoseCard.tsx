import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/shared/theme';

interface GlucoseCardProps {
  value: number;
  status: string;
  measuredAt: string;
}

export function GlucoseCard({
  value,
  status,
  measuredAt,
}: GlucoseCardProps) {
  return (
    <View style={styles.card}>
      {/* Gota decorativa no fundo */}
      <Ionicons
        name="water-outline"
        size={72}
        color="#F1F3F5"
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

        <View style={styles.statusBadge}>
          <Ionicons
            name="checkmark-circle-outline"
            size={13}
            color="#15803D"
          />

          <Text style={styles.statusText}>
            {status}
          </Text>
        </View>
      </View>

      {/* Valor */}
      <View style={styles.valueRow}>
        <Text style={styles.value}>
          {value}
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

    backgroundColor: '#FFFFFF',

    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',

    elevation: 2,

    shadowColor: '#000000',
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
    backgroundColor: '#EAF7ED',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803D',
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
    color: '#111111',
  },

  unit: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },

  date: {
    marginTop: 3,
    fontSize: 11,
    color: '#6B7280',
  },

  watermark: {
    position: 'absolute',
    right: -8,
    bottom: -10,
  },
});
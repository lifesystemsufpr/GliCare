import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { colors } from '@/shared/theme';

export type MeasurementMoment =
  | 'fasting'
  | 'beforeBreakfast'
  | 'afterBreakfast'
  | 'beforeLunch'
  | 'afterLunch'
  | 'beforeDinner'
  | 'afterDinner';

interface MeasurementMomentSelectorProps {
  value: MeasurementMoment;
  onChange: (value: MeasurementMoment) => void;
}

const moments: {
  label: string;
  value: MeasurementMoment;
}[] = [
  { label: 'Jejum', value: 'fasting' },
  { label: 'Antes do Café', value: 'beforeBreakfast' },
  { label: 'Após o Café', value: 'afterBreakfast' },
  { label: 'Antes do Almoço', value: 'beforeLunch' },
  { label: 'Após o Almoço', value: 'afterLunch' },
  { label: 'Antes do Jantar', value: 'beforeDinner' },
  { label: 'Após o Jantar', value: 'afterDinner' },
];

export function MeasurementMomentSelector({
  value,
  onChange,
}: MeasurementMomentSelectorProps) {
  return (
    <View style={styles.container}>
      {moments.map((moment) => {
        const selected = value === moment.value;

        return (
          <Pressable
            key={moment.value}
            onPress={() => onChange(moment.value)}
            style={[
              styles.chip,
              selected && styles.selectedChip,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                selected && styles.selectedChipText,
              ]}
            >
              {moment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  chip: {
    paddingHorizontal: 13,
    paddingVertical: 9,

    borderRadius: 20,

    backgroundColor: '#F3F4F6',

    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  selectedChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },

  selectedChipText: {
    color: '#FFFFFF',
  },
});
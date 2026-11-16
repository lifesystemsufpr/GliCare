import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { makeStyles } from '@/shared/theme';

import type { MeasurementMoment } from '../services/glucose-contract';
export type { MeasurementMoment } from '../services/glucose-contract';

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
  const styles = useStyles();
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

const useStyles = makeStyles((c) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  chip: {
    paddingHorizontal: 13,
    paddingVertical: 9,

    borderRadius: 20,

    backgroundColor: c.gray100,

    borderWidth: 1,
    borderColor: c.gray200,
  },

  selectedChip: {
    backgroundColor: c.primary,
    borderColor: c.primary,
  },

  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: c.gray700,
  },

  selectedChipText: {
    color: c.onPrimary,
  },
}));

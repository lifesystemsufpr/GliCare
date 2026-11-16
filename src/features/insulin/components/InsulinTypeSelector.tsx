import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/shared/theme';

import type { InsulinType } from '../services/insulin-contract';
export type { InsulinType } from '../services/insulin-contract';

interface InsulinTypeSelectorProps {
  value: InsulinType | null;
  onChange: (value: InsulinType) => void;
}

const insulinTypes: {
  label: string;
  value: InsulinType;
}[] = [
  { label: 'Rápida', value: 'rapid' },
  { label: 'Regular', value: 'regular' },
  { label: 'NPH', value: 'nph' },
  { label: 'Longa duração', value: 'longActing' },
];

export function InsulinTypeSelector({
  value,
  onChange,
}: InsulinTypeSelectorProps) {
  return (
    <View style={styles.container}>
      {insulinTypes.map((type) => {
        const selected = value === type.value;

        return (
          <Pressable
            key={type.value}
            onPress={() => onChange(type.value)}
            style={[
              styles.option,
              selected && styles.selectedOption,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                selected && styles.selectedOptionText,
              ]}
            >
              {type.label}
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
    gap: 6,
    width: '100%',
  },

  option: {
    flex: 1,
    minHeight: 38,
    paddingHorizontal: 4,
    paddingVertical: 8,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.gray100,
  },

  selectedOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  optionText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.gray700,
    textAlign: 'center',
  },

  selectedOptionText: {
    color: colors.white,
  },
});

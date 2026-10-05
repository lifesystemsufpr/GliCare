import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/shared/theme';

export type InsulinType =
  | 'rapid'
  | 'regular'
  | 'nph'
  | 'longActing'

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
    borderColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
  },

  selectedOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  optionText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },

  selectedOptionText: {
    color: '#FFFFFF',
  },
});
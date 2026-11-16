import { Pressable, StyleSheet, Text, View } from 'react-native';

import { makeStyles } from '@/shared/theme';

import { insulinTypeLabels, type InsulinType } from '../services/insulin-contract';
export type { InsulinType } from '../services/insulin-contract';

interface InsulinTypeSelectorProps {
  value: InsulinType | null;
  onChange: (value: InsulinType) => void;
}

const insulinTypes = Object.entries(insulinTypeLabels) as [InsulinType, string][];

export function InsulinTypeSelector({
  value,
  onChange,
}: InsulinTypeSelectorProps) {
  const styles = useStyles();
  return (
    <View style={styles.container}>
      {insulinTypes.map(([type, label]) => {
        const selected = value === type;

        return (
          <Pressable
            key={type}
            onPress={() => onChange(type)}
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
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((c) => StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 6,
    width: '100%',
  },

  option: {
    minHeight: 44,
    paddingHorizontal: 4,
    paddingVertical: 8,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 20,
    borderWidth: 1,
    borderColor: c.gray200,
    backgroundColor: c.gray100,
  },

  selectedOption: {
    borderColor: c.primary,
    backgroundColor: c.primary,
  },

  optionText: {
    fontSize: 13,
    fontWeight: '500',
    color: c.gray700,
    textAlign: 'center',
  },

  selectedOptionText: {
    color: c.onPrimary,
  },
}));

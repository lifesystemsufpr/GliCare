import { makeStyles } from '@/shared/theme';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { spacing, typography } from '../../../shared/theme';

export type DiabetesType =
  | 'type1'
  | 'type2'
  | 'other';

type DiabetesTypeSelectorProps = {
  value: DiabetesType | null;

  onChange: (
    value: DiabetesType,
  ) => void;
};

const options: {
  label: string;
  value: DiabetesType;
}[] = [
  {
    label: 'Tipo 1',
    value: 'type1',
  },
  {
    label: 'Tipo 2',
    value: 'type2',
  },
  {
    label: 'Outro',
    value: 'other',
  },
];

export function DiabetesTypeSelector({
  value,
  onChange,
}: DiabetesTypeSelectorProps) {
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Tipo de diabetes
      </Text>

      <View style={styles.options}>
        {options.map((option) => {
          const selected =
            value === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() =>
                onChange(option.value)
              }
              style={[
                styles.option,

                selected &&
                  styles.selectedOption,
              ]}
            >
              <Text
                style={[
                  styles.optionText,

                  selected &&
                    styles.selectedOptionText,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const useStyles = makeStyles((c) => StyleSheet.create({
  container: {
    width: '100%',

    marginBottom: spacing.md,
  },

  label: {
    color: c.text,

    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,

    marginBottom: spacing.sm,
  },

  options: {
    flexDirection: 'row',

    gap: spacing.sm,
  },

  option: {
    flex: 1,

    minHeight: 42,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,
    borderColor: c.primary,
    borderRadius: 21,

    backgroundColor: c.background,
  },

  selectedOption: {
    backgroundColor: c.primary,
  },

  optionText: {
    color: c.primary,

    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },

  selectedOptionText: {
    color: c.onPrimary,
  },
}));
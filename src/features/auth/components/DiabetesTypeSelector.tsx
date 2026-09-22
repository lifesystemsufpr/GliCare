import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  colors,
  spacing,
  typography,
} from '../../../shared/theme';

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

const styles = StyleSheet.create({
  container: {
    width: '100%',

    marginBottom: spacing.md,
  },

  label: {
    color: colors.text,

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
    borderColor: colors.primary,
    borderRadius: 21,

    backgroundColor: colors.background,
  },

  selectedOption: {
    backgroundColor: colors.primary,
  },

  optionText: {
    color: colors.primary,

    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },

  selectedOptionText: {
    color: colors.white,
  },
});
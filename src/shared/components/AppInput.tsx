import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme';

type AppInputProps = TextInputProps & {
  label: string;
  error?: string;

  icon?: keyof typeof Ionicons.glyphMap;
};

export function AppInput({
  label,
  error,
  icon,
  style,
  ...rest
}: AppInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
      </Text>

      <View
        style={[
          styles.inputContainer,
          error ? styles.inputError : undefined,
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={18}
            color={colors.textSecondary}
            style={styles.icon}
          />
        ) : null}

        <TextInput
          style={[
            styles.input,
            style,
          ]}
          placeholderTextColor={colors.textSecondary}
          {...rest}
        />
      </View>

      {error ? (
        <Text style={styles.errorText}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',

    marginBottom: 16,
  },

  label: {
    color: colors.text,

    fontSize: 14,
    fontWeight: '500',

    marginBottom: 6,
  },

  inputContainer: {
    width: '100%',
    minHeight: 48,

    flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,

    backgroundColor: colors.surface,
  },

  icon: {
    marginLeft: 14,
  },

  input: {
    flex: 1,

    minHeight: 48,

    paddingHorizontal: 12,

    color: colors.text,

    fontSize: 16,
  },

  inputError: {
    borderColor: colors.error,
  },

  errorText: {
    color: colors.error,

    fontSize: 12,

    marginTop: 4,
  },
});
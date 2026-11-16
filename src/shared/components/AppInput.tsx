import { makeStyles, useThemeColors } from '@/shared/theme';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

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
  const styles = useStyles();
  const c = useThemeColors();
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
            color={c.textSecondary}
            style={styles.icon}
          />
        ) : null}

        <TextInput
          style={[
            styles.input,
            style,
          ]}
          placeholderTextColor={c.textSecondary}
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

const useStyles = makeStyles((c) => StyleSheet.create({
  container: {
    width: '100%',

    marginBottom: 16,
  },

  label: {
    color: c.text,

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
    borderColor: c.border,
    borderRadius: 8,

    backgroundColor: c.surface,
  },

  icon: {
    marginLeft: 14,
  },

  input: {
    flex: 1,

    minHeight: 48,

    paddingHorizontal: 12,

    color: c.text,

    fontSize: 16,
  },

  inputError: {
    borderColor: c.error,
  },

  errorText: {
    color: c.error,

    fontSize: 12,

    marginTop: 4,
  },
}));
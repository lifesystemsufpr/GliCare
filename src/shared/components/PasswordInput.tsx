import { makeStyles, useThemeColors } from '@/shared/theme';
import { useState } from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

type PasswordInputProps = TextInputProps & {
  label: string;
  error?: string;
};

export function PasswordInput({
  label,
  error,
  style,
  ...rest
}: PasswordInputProps) {
  const styles = useStyles();
  const c = useThemeColors();
  const [isPasswordVisible, setIsPasswordVisible] =
    useState(false);

  function togglePasswordVisibility() {
    setIsPasswordVisible((previousValue) => !previousValue);
  }

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
        <Ionicons
          name="lock-closed-outline"
          size={18}
          color={c.textSecondary}
          style={styles.leftIcon}
        />

        <TextInput
          style={[
            styles.input,
            style,
          ]}
          secureTextEntry={!isPasswordVisible}
          placeholderTextColor={c.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          {...rest}
        />

        <Pressable
          onPress={togglePasswordVisibility}
          style={styles.eyeButton}
          hitSlop={10}
        >
          <Ionicons
            name={
              isPasswordVisible
                ? 'eye-off-outline'
                : 'eye-outline'
            }
            size={20}
            color={c.textSecondary}
          />
        </Pressable>
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
    minHeight: 48,

    flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 8,

    backgroundColor: c.surface,
  },

  leftIcon: {
    marginLeft: 14,
  },

  input: {
    flex: 1,

    minHeight: 48,

    paddingHorizontal: 12,

    color: c.text,

    fontSize: 16,
  },

  eyeButton: {
    minHeight: 48,

    justifyContent: 'center',

    paddingHorizontal: 14,
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
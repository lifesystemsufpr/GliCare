import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import { colors } from '../theme';

type AppButtonProps = {
  title: string;
  onPress: () => void;

  variant?: 'primary' | 'secondary';

  disabled?: boolean;
  loading?: boolean;

  style?: ViewStyle;
};

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,

        variant === 'primary'
          ? styles.primaryButton
          : styles.secondaryButton,

        pressed && !isDisabled && styles.pressed,

        isDisabled && styles.disabled,

        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    minHeight: 48,

    borderRadius: 24,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 24,
  },

  primaryButton: {
    backgroundColor: colors.primary,
  },

  secondaryButton: {
    backgroundColor: colors.secondary,
  },

  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  pressed: {
    opacity: 0.8,
  },

  disabled: {
    opacity: 0.5,
  },
});
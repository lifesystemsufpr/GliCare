import { makeStyles, useThemeColors } from '@/shared/theme';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

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
  const styles = useStyles();
  const c = useThemeColors();
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
        <ActivityIndicator color={variant === 'secondary' ? c.onSecondary : c.onPrimary} />
      ) : (
        <Text style={[styles.text, variant === 'secondary' && styles.secondaryText]}>{title}</Text>
      )}
    </Pressable>
  );
}

const useStyles = makeStyles((c) => StyleSheet.create({
  button: {
    width: '100%',
    minHeight: 48,

    borderRadius: 24,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 24,
  },

  primaryButton: {
    backgroundColor: c.primary,
  },

  secondaryButton: {
    backgroundColor: c.secondary,
  },

  text: {
    color: c.onPrimary,
    fontSize: 16,
    fontWeight: '600',
  },

  secondaryText: {
    color: c.onSecondary,
  },

  pressed: {
    opacity: 0.8,
  },

  disabled: {
    opacity: 0.5,
  },
}));
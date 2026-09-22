import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  colors,
  spacing,
  typography,
} from '../../../shared/theme';

type PasswordRulesProps = {
  password: string;
};

export function PasswordRules({
  password,
}: PasswordRulesProps) {
  const hasMinimumLength =
    password.length >= 8;

  const hasLetter =
    /[A-Za-z]/.test(password);

  const hasNumber =
    /\d/.test(password);

  const hasLettersAndNumbers =
    hasLetter && hasNumber;

  return (
    <View style={styles.container}>
      <Rule
        valid={hasMinimumLength}
        text="A senha deve ter pelo menos 8 caracteres"
      />

      <Rule
        valid={hasLettersAndNumbers}
        text="A senha deve conter letras e números"
      />
    </View>
  );
}

type RuleProps = {
  valid: boolean;
  text: string;
};

function Rule({
  valid,
  text,
}: RuleProps) {
  return (
    <View style={styles.rule}>
      <Ionicons
        name={
          valid
            ? 'checkmark-circle'
            : 'ellipse-outline'
        }
        size={14}
        color={
          valid
            ? colors.primary
            : colors.textSecondary
        }
      />

      <Text
        style={[
          styles.ruleText,

          valid && styles.validText,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },

  rule: {
    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: spacing.xs,
  },

  ruleText: {
    color: colors.textSecondary,

    fontSize: typography.sizes.xs,

    marginLeft: spacing.sm,
  },

  validText: {
    color: colors.primary,
  },
});
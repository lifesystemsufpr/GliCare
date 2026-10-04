import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Pressable,
    StyleSheet,
    Switch,
    Text,
    View,
} from 'react-native';

import { colors } from '@/shared/theme';

export function SettingsCard() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Configurações
      </Text>

      {/* Tema Escuro */}

      <View style={styles.option}>
        <View style={styles.optionContent}>
          <Ionicons
            name="moon-outline"
            size={19}
            color={colors.text}
          />

          <Text
            style={styles.optionText}
            numberOfLines={1}
          >
            Tema Escuro
          </Text>
        </View>

        <View style={styles.actionContainer}>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{
              false: '#D1D5DB',
              true: '#93C5FD',
            }}
            thumbColor={
              darkMode
                ? colors.primary
                : '#FFFFFF'
            }
          />
        </View>
      </View>

      {/* Notificações */}

      <Pressable style={styles.option}>
        <View style={styles.optionContent}>
          <Ionicons
            name="notifications-outline"
            size={19}
            color={colors.text}
          />

          <Text
            style={styles.optionText}
            numberOfLines={1}
          >
            Notificações
          </Text>
        </View>

        <View style={styles.actionContainer}>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.textSecondary}
          />
        </View>
      </Pressable>

      {/* Privacidade */}

      <Pressable style={styles.option}>
        <View style={styles.optionContent}>
          <Ionicons
            name="shield-checkmark-outline"
            size={19}
            color={colors.text}
          />

          <Text
            style={styles.optionText}
            numberOfLines={1}
          >
            Privacidade
          </Text>
        </View>

        <View style={styles.actionContainer}>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.textSecondary}
          />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',

    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,

    backgroundColor: '#FFFFFF',

    elevation: 1,
  },

  title: {
    paddingHorizontal: 14,
    paddingVertical: 12,

    fontSize: 17,
    fontWeight: '600',
    color: colors.text,

    backgroundColor: '#FAFAFA',
  },

  option: {
    width: '100%',
    minHeight: 54,

    flexDirection: 'row',
    alignItems: 'center',

    paddingLeft: 14,
    paddingRight: 10,

    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  optionContent: {
    flex: 1,
    minWidth: 0,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 10,
  },

  optionText: {
    flex: 1,

    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
  },

  actionContainer: {
    width: 52,

    alignItems: 'flex-end',
    justifyContent: 'center',

    marginLeft: 8,
  },
});
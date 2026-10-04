import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { colors } from '@/shared/theme';

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Dashboard
      </Text>

      <Text style={styles.subtitle}>
        Visão geral dos seus dados de saúde.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,

    backgroundColor: '#FAFAFA',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },

  subtitle: {
    marginTop: 5,

    fontSize: 13,
    color: colors.textSecondary,
  },
});
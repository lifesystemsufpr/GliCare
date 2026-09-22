import {
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ScreenContainer } from '../../../shared/components';

import {
  colors,
  spacing,
  typography,
} from '../../../shared/theme';

export function SplashScreen() {
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Image
  source={require('../../../../assets/images/logo.png')}
  style={styles.logoImage}
  resizeMode="contain"
/>

        <Text style={styles.title}>
          GliCare
        </Text>

        <Text style={styles.subtitle}>
          Seu cuidado diário em um só lugar.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: spacing.lg,
  },

  logoImage: {
  width: 140,
  height: 140,

  marginBottom: spacing.lg,
},

  title: {
    color: colors.text,

    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,

    textAlign: 'center',
  },

  subtitle: {
    color: colors.textSecondary,

    fontSize: typography.sizes.sm,

    textAlign: 'center',

    marginTop: spacing.sm,
  },
});
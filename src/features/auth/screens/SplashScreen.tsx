import { makeStyles } from '@/shared/theme';
import {
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ScreenContainer } from '../../../shared/components';

import { spacing, typography } from '../../../shared/theme';

export function SplashScreen() {
  const styles = useStyles();
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

const useStyles = makeStyles((c) => StyleSheet.create({
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
    color: c.text,

    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,

    textAlign: 'center',
  },

  subtitle: {
    color: c.textSecondary,

    fontSize: typography.sizes.sm,

    textAlign: 'center',

    marginTop: spacing.sm,
  },
}));
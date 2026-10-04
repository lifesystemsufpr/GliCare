import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/shared/theme';

interface ProfileCardProps {
  name: string;
  age: number;
  weight: number;
  height: number;
}

export function ProfileCard({
  name,
  age,
  weight,
  height,
}: ProfileCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Ionicons
          name="person-outline"
          size={34}
          color={colors.primary}
        />
      </View>

      <Text style={styles.name}>
        {name}
      </Text>

      <Text style={styles.age}>
        {age} anos
      </Text>

      <View style={styles.infoRow}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>
            Peso
          </Text>

          <Text
            style={styles.infoValue}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {`${weight} kg`}
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>
            Altura
          </Text>

          <Text
            style={styles.infoValue}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {`${height.toFixed(2)} m`}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    alignItems: 'center',

    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,

    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,

    backgroundColor: '#FFFFFF',

    elevation: 1,
  },

  avatar: {
    width: 72,
    height: 72,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 12,

    borderRadius: 36,

    backgroundColor: '#EEF2FF',

    borderWidth: 2,
    borderColor: '#E0E7FF',
  },

  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },

  age: {
    marginTop: 4,

    fontSize: 12,
    color: colors.textSecondary,
  },

  infoRow: {
    alignSelf: 'stretch',

    flexDirection: 'row',

    gap: 10,

    marginTop: 16,
  },

  infoBox: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 12,
    paddingVertical: 12,

    borderRadius: 8,

    backgroundColor: '#F3F4F6',
  },

  infoLabel: {
    marginBottom: 4,

    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
  },

  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
});
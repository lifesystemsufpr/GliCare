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

      <Text style={styles.name}>{name}</Text>

      <Text style={styles.age}>
        {age} anos
      </Text>

      <View style={styles.infoRow}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>
            Peso
          </Text>

          <View style={styles.valueRow}>
            <Text style={styles.infoValue}>
              {weight}
            </Text>

            <Text style={styles.unit}>
              kg
            </Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>
            Altura
          </Text>

          <View style={styles.valueRow}>
            <Text style={styles.infoValue}>
              {height.toFixed(2)}
            </Text>

            <Text style={styles.unit}>
              m
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
  width: '100%',
  flexDirection: 'row',
  gap: 10,
  marginTop: 16,
},

infoBox: {
  flex: 1,
  minWidth: 0,

  alignItems: 'center',
  justifyContent: 'center',

  paddingHorizontal: 8,
  paddingVertical: 12,

  borderRadius: 8,
  backgroundColor: '#F3F4F6',
},

infoLabel: {
  width: '100%',

  marginBottom: 4,

  fontSize: 11,
  color: colors.textSecondary,
  textAlign: 'center',
},

infoValue: {
  width: '100%',

  fontSize: 15,
  fontWeight: '600',
  color: colors.text,
  textAlign: 'center',
},

  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  unit: {
    marginLeft: 2,

    fontSize: 11,
    color: colors.textSecondary,
  },
});
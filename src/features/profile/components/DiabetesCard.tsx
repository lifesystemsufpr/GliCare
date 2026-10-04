import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/shared/theme';

interface DiabetesCardProps {
  type: string;
}

export function DiabetesCard({
  type,
}: DiabetesCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons
          name="medical-outline"
          size={20}
          color="#FFFFFF"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>
          Tipo de Diabetes
        </Text>

        <Text style={styles.value}>
          {type}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',

    padding: 14,

    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,

    backgroundColor: '#FFFFFF',

    elevation: 1,
  },

  iconContainer: {
    width: 38,
    height: 38,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,

    borderRadius: 19,

    backgroundColor: colors.primary,
  },

  content: {
    flex: 1,
  },

  label: {
    fontSize: 11,
    color: colors.textSecondary,
  },

  value: {
    marginTop: 3,

    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
});
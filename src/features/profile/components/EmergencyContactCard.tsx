import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/shared/theme';

interface EmergencyContactCardProps {
  name: string;
  relationship: string;
  phone: string;
}

export function EmergencyContactCard({
  name,
  relationship,
  phone,
}: EmergencyContactCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons
          name="medical"
          size={18}
          color="#DC2626"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>
          Contato de Emergência
        </Text>

        <Text style={styles.name}>
          {name} ({relationship})
        </Text>

        <Text style={styles.phone}>
          {phone}
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

    backgroundColor: '#FEE2E2',
  },

  content: {
    flex: 1,
  },

  label: {
    fontSize: 11,
    color: colors.textSecondary,
  },

  name: {
    marginTop: 3,

    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },

  phone: {
    marginTop: 2,

    fontSize: 12,
    color: colors.textSecondary,
  },
});
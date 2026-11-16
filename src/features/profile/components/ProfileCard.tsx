import { formatNumber } from '@/shared/format';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { makeStyles, useThemeColors } from '@/shared/theme';

interface ProfileCardProps {
  name: string;
  age: number | null;
  birthDate?: string;
  weight: number | null;
  height: number | null;
}

export function ProfileCard({
  name,
  age,
  birthDate,
  weight,
  height,
}: ProfileCardProps) {
  const styles = useStyles();
  const c = useThemeColors();
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Ionicons
          name="person-outline"
          size={34}
          color={c.primary}
        />
      </View>

      <Text style={styles.name}>
        {name}
      </Text>

      <Text style={styles.age}>
        {age == null ? 'Idade não informada' : `${age} anos`}
      </Text>

      <Text style={styles.age}>
        {birthDate ? `Nascimento: ${birthDate}` : 'Data de nascimento não informada'}
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
            {weight == null ? 'Não informado' : `${formatNumber(weight, 2)} kg`}
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
            {height == null ? 'Não informada' : `${height.toLocaleString('pt-BR', { maximumFractionDigits: 4 })} m`}
          </Text>
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles((c) => StyleSheet.create({
  card: {
    width: '100%',
    alignItems: 'center',

    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,

    borderWidth: 1,
    borderColor: c.gray200,
    borderRadius: 12,

    backgroundColor: c.white,

    elevation: 1,
  },

  avatar: {
    width: 72,
    height: 72,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 12,

    borderRadius: 36,

    backgroundColor: c.indigo50,

    borderWidth: 2,
    borderColor: c.indigo100,
  },

  name: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: c.text,
  },

  age: {
    marginTop: 4,

    fontSize: 12,
    color: c.textSecondary,
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

    backgroundColor: c.gray100,
  },

  infoLabel: {
    marginBottom: 4,

    fontSize: 11,
    fontWeight: '500',
    color: c.textSecondary,
    textAlign: 'center',
  },

  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: c.text,
    textAlign: 'center',
  },
}));

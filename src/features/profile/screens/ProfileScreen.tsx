import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { colors } from '@/shared/theme';
import { DiabetesCard } from '../components/DiabetesCard';
import { EmergencyContactCard } from '../components/EmergencyContactCard';
import { ProfileCard } from '../components/ProfileCard';
import { SettingsCard } from '../components/SettingsCard';

const mockProfile = {
  name: 'Ana Silva',
  age: 34,
  weight: 68,
  height: 1.65,
  diabetesType: 'Tipo 1',

  emergencyContact: {
    name: 'Carlos Silva',
    relationship: 'Marido',
    phone: '(11) 98765-4321',
  },
};

export function ProfileScreen() {
  function handleLogout() {
    Alert.alert(
      'Sair da conta',
      'A funcionalidade de logout será integrada posteriormente.',
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.brandIcon}>
            <Ionicons
              name="medical"
              size={16}
              color={colors.primary}
            />
          </View>

          <Text style={styles.brandText}>
            Meu Perfil
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.notificationButton,
            pressed && styles.notificationButtonPressed,
          ]}
          onPress={() => router.push('/lembretes')}
          hitSlop={12}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={colors.text}
          />
        </Pressable>
      </View>

      <ProfileCard
        name={mockProfile.name}
        age={mockProfile.age}
        weight={mockProfile.weight}
        height={mockProfile.height}
      />

      <DiabetesCard
        type={mockProfile.diabetesType}
      />

      <EmergencyContactCard
        name={mockProfile.emergencyContact.name}
        relationship={
          mockProfile.emergencyContact.relationship
        }
        phone={mockProfile.emergencyContact.phone}
      />

      <SettingsCard />

      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && styles.logoutPressed,
        ]}
        onPress={handleLogout}
      >
        <Ionicons
          name="log-out-outline"
          size={19}
          color="#DC2626"
        />

        <Text style={styles.logoutText}>
          Sair da Conta
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 150,
    gap: 14,
  },

  header: {
    width: '100%',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 4,
  },

  brand: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 10,
  },

  brandIcon: {
    width: 34,
    height: 34,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 17,

    backgroundColor: '#EEF2FF',
  },

  brandText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },

  notificationButton: {
    width: 44,
    height: 44,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 22,
  },

  notificationButtonPressed: {
    backgroundColor: '#F3F4F6',
  },

  logoutButton: {
    height: 52,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 8,

    marginTop: 2,

    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,

    backgroundColor: '#FFFFFF',
  },

  logoutPressed: {
    backgroundColor: '#FEF2F2',
  },

  logoutText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#DC2626',
  },
});
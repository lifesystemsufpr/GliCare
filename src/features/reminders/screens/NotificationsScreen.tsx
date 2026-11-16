import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/shared/components';
import { colors, contentWidth } from '@/shared/theme';
import { NotificationSettings } from '../components/NotificationSettings';

// Aberta pelo Perfil. O voltar vai direto ao Perfil porque, entre abas,
// router.back() leva à primeira aba (Início).
export function NotificationsScreen() {
  return <View style={styles.container}>
    <View style={styles.header}>
      <Pressable style={styles.headerButton} onPress={() => router.navigate('/perfil')} accessibilityLabel="Voltar">
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </Pressable>
      <Text style={styles.headerTitle}>Notificações</Text>
      <View style={styles.headerButton} />
    </View>
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Alertas dos lembretes</Text>
        <Text style={styles.text}>
          O aparelho avisa na data e hora de cada lembrete ativo. Os alertas valem só neste aparelho e
          precisam da permissão de notificações do sistema.
        </Text>
        <NotificationSettings />
      </View>
      <AppButton title="Ver lembretes" variant="secondary" onPress={() => router.push('/lembretes')} />
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.screen },
  header: {
    minHeight: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray200,
  },
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: colors.text, textAlign: 'center' },
  content: { ...contentWidth, padding: 20, gap: 16 },
  card: {
    gap: 12, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.gray200,
    backgroundColor: colors.white,
  },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  text: { fontSize: 14, lineHeight: 20, color: colors.text },
});

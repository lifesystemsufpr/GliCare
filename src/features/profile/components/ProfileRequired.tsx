import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/features/auth/hooks/AuthProvider';
import { AppButton } from '@/shared/components';
import { makeStyles, contentWidth } from '@/shared/theme';

// Com o perfil incompleto, a API responde 403 (PERFIL_INCOMPLETO) em
// glicemia, insulina, lembretes, dashboard e relatórios. Em vez de mostrar o
// erro, a tela pede para completar o perfil. Sem a informação (API antiga),
// a tela abre normalmente.
export function ProfileRequired({ children }: { children: ReactNode }) {
  const styles = useStyles();
  const { user } = useAuth();
  if (user?.perfilCompleto !== false) return <>{children}</>;
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Complete seu perfil</Text>
        <Text style={styles.text}>
          Para usar esta área, informe sua data de nascimento, o tipo de diabetes, a altura e o peso no Perfil.
        </Text>
        <AppButton title="Completar perfil" onPress={() => router.push('/perfil')} />
      </View>
    </View>
  );
}

const useStyles = makeStyles((c) => StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: c.screen,
  },
  card: {
    ...contentWidth,
    gap: 14,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.gray200,
    backgroundColor: c.white,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: c.text,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: c.text,
  },
}));

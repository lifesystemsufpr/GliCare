import { colors } from '@/shared/theme';
import { formatDateTime } from '@/shared/format';
import { contentWidth } from '@/shared/theme';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/features/auth/hooks/AuthProvider';
import { AppButton } from '@/shared/components';
import { errorMessage } from '@/shared/api/errors';
import { DailySummary } from '../components/DailySummary';
import { GlucoseCard } from '../components/GlucoseCard';
import { HomeHeader } from '../components/HomeHeader';
import { InsulinCard } from '../components/InsulinCard';
import { ReminderCard } from '../components/ReminderCard';
import { WeeklyGlucoseChart } from '../components/WeeklyGlucoseChart';
import { loadHomeSources } from '../services/home-service';
import { buildHomeSummary, homeNeedsReload, type HomeSources, type HomeSummary } from '../services/home-model';

export function HomeScreen() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    let sources: HomeSources | null = null;
    let loadedAt = new Date();
    let reloading = false;
    setLoading(true);
    setSummary(null);
    setError('');
    const load = () => loadHomeSources(controller.signal).then((data) => {
      if (controller.signal.aborted) return;
      const result = buildHomeSummary(data);
      sources = data;
      loadedAt = new Date();
      setSummary(result);
    });
    void load().catch((cause: unknown) => {
      if (!controller.signal.aborted) setError(errorMessage(cause));
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    // A cada minuto reavalia o resumo já carregado e, se ele ficou velho
    // (virada do dia ou lembrete que passou), consulta a API de novo em
    // segundo plano, mantendo o que já está na tela se a consulta falhar.
    const clock = setInterval(() => {
      if (!sources) return;
      setSummary(buildHomeSummary(sources));
      if (!reloading && homeNeedsReload(sources, loadedAt)) {
        reloading = true;
        void load().catch(() => undefined).finally(() => { reloading = false; });
      }
    }, 60000);
    return () => { controller.abort(); clearInterval(clock); };
  }, [revision]));
  const glucose = summary?.lastGlucose;
  const insulin = summary?.lastInsulin;
  const reminder = summary?.nextReminder;
  return <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <HomeHeader userName={user?.nome ?? ''} onPressNotifications={() => router.push('/lembretes')} />
    {user?.perfilCompleto === false ? <View style={styles.incomplete}>
      <Text style={styles.incompleteTitle}>Complete seu perfil</Text>
      <Text>Faltam seus dados de saúde. Depois disso, você pode registrar glicemia e insulina.</Text>
      <AppButton title="Completar perfil" onPress={() => router.push('/perfil')} />
    </View> : null}
    {loading ? <ActivityIndicator accessibilityLabel="Carregando resumo da rotina" /> : error ?
      <Text accessibilityRole="alert" style={{ color: colors.danger }}>{error}</Text> : summary ? <>
      <GlucoseCard value={glucose?.valor ?? null} status={glucose?.status ?? null}
        measuredAt={glucose ? formatDateTime(glucose.dataHora) : 'Nenhuma medição registrada.'} />
      <View style={styles.cardsRow}>
        <InsulinCard dose={insulin?.doseUi ?? null} type={insulin?.tipo ?? 'Nenhuma aplicação registrada.'}
          appliedAt={insulin ? formatDateTime(insulin.dataHora) : ''} />
        <ReminderCard time={reminder ? new Date(reminder.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'}
          date={reminder ? new Date(reminder.dataHora).toLocaleDateString('pt-BR') : ''}
          title={reminder?.titulo ?? 'Nenhum lembrete ativo futuro.'} />
      </View>
      <DailySummary glucoseRegistered={summary.glucoseToday} insulinRegistered={summary.insulinToday} />
      <WeeklyGlucoseChart data={summary.weekly} />
    </> : null}
    <AppButton title={error ? 'Tentar novamente' : 'Atualizar resumo'} variant="secondary" disabled={loading}
      onPress={() => setRevision((value) => value + 1)} />
  </ScrollView>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screen,
  },

  content: {
    ...contentWidth,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 36,
    gap: 20,
  },

  incomplete: {
    gap: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.blue300,
    backgroundColor: colors.blue50,
  },

  incompleteTitle: {
    fontSize: 16,
    fontWeight: '700',
  },

  cardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
});

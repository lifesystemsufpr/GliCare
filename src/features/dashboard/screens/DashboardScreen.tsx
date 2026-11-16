import { formatNumber } from '@/shared/format';
import { contentWidth } from '@/shared/theme';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton, AppInput } from '@/shared/components';
import { colors } from '@/shared/theme';
import { errorMessage } from '@/shared/api/errors';
import { formatBirthDateInput } from '@/features/auth/services/auth-contract';
import { DailyGlucoseChart } from '../components/DailyGlucoseChart';
import { loadDashboard } from '../services/dashboard-service';
import { buildDashboard, displayDay, periodDays, periodInput, presetPeriod, type DashboardSummary, type Period } from '../services/dashboard-model';

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={styles.metric}><Text>{label}</Text><Text style={styles.value}>{value}</Text></View>;
}

export function DashboardScreen() {
  const [period, setPeriod] = useState<Period>(() => presetPeriod(7));
  const [selected, setSelected] = useState<7 | 30 | 90 | 'custom'>(7);
  const [start, setStart] = useState(() => displayDay(period.start));
  const [end, setEnd] = useState(() => displayDay(period.end));
  const [filterError, setFilterError] = useState('');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    setLoading(true);
    setSummary(null);
    setError('');
    void loadDashboard(controller.signal).then((sources) => {
      if (!controller.signal.aborted) setSummary(buildDashboard(sources, period));
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) setError(errorMessage(cause));
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [period, revision]));

  function choose(days: 7 | 30 | 90) {
    const next = presetPeriod(days);
    setStart(displayDay(next.start)); setEnd(displayDay(next.end));
    setSelected(days); setFilterError(''); setSummary(null); setLoading(true); setPeriod(next);
  }
  function apply() {
    try {
      const next = { start: periodInput(start), end: periodInput(end) };
      periodDays(next);
      setSelected('custom'); setFilterError(''); setSummary(null); setLoading(true); setPeriod(next);
    } catch (cause) { setFilterError(errorMessage(cause)); }
  }
  const labels = { BAIXA: 'Baixa', NORMAL: 'Normal', ALTA: 'Alta' } as const;
  const measure = (value: number | null) => value == null ? '—' : value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  return <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Text style={styles.heading}>Dashboard</Text>
    <Text>Resumo dos registros no período selecionado.</Text>
    <View style={styles.presets}>{([7, 30, 90] as const).map((days) => <View key={days} style={{ flex: 1 }}>
      <AppButton title={`${days} dias`} variant={selected === days ? 'primary' : 'secondary'} onPress={() => choose(days)} />
    </View>)}</View>
    <Text style={styles.subheading}>Período aplicado: {displayDay(period.start)} a {displayDay(period.end)}</Text>
    {loading ? <ActivityIndicator accessibilityLabel="Carregando indicadores" color={colors.primary} /> : error ?
      <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : summary ? <>
      <View style={styles.metrics}>
        <Metric label="Medições de glicemia" value={String(summary.measurements)} />
        <Metric label="Aplicações de insulina" value={String(summary.applications)} />
        <Metric label="Média (mg/dL)" value={measure(summary.mean)} />
        <Metric label="Mínimo / máximo (mg/dL)" value={`${measure(summary.min)} / ${measure(summary.max)}`} />
      </View>
      {summary.measurements === 0 ? <Text>Nenhuma medição de glicemia neste período.</Text> : null}
      <View style={styles.filter}>
        <Text style={styles.subheading}>Classificação das medições</Text>
        <Text>Percentuais sobre a quantidade de medições; não representam duração.</Text>
        {summary.distribution.map((item) => <View key={item.status} style={{ gap: 5 }}>
          <Text>{labels[item.status]}: {item.count} · {item.percentage == null ? '—' : formatNumber(item.percentage) + '%'}</Text>
          <View style={{ height: 8, backgroundColor: '#E2E8F0', borderRadius: 4 }}>
            <View style={{ height: 8, width: `${item.percentage ?? 0}%`, backgroundColor: colors.primary, borderRadius: 4 }} />
          </View>
        </View>)}
      </View>
      <DailyGlucoseChart data={summary.daily} />
    </> : null}
    <View style={styles.filter}>
      <Text style={styles.subheading}>Período personalizado</Text>
      <Text>Até 366 dias, incluindo as datas inicial e final.</Text>
      <AppInput label="Data inicial" value={start} onChangeText={(value) => setStart(formatBirthDateInput(value))}
        placeholder="dd/mm/aaaa" keyboardType="numeric" maxLength={10} />
      <AppInput label="Data final" value={end} onChangeText={(value) => setEnd(formatBirthDateInput(value))}
        placeholder="dd/mm/aaaa" keyboardType="numeric" maxLength={10} />
      {filterError ? <Text accessibilityRole="alert" style={styles.error}>{filterError}</Text> : null}
      <AppButton title="Aplicar período" onPress={apply} />
    </View>
    <AppButton title={error ? 'Tentar novamente' : 'Atualizar indicadores'} variant="secondary" disabled={loading}
      onPress={() => setRevision((value) => value + 1)} />
  </ScrollView>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { ...contentWidth, padding: 20, paddingBottom: 40, gap: 16 },
  heading: { fontSize: 26, fontWeight: '700', color: colors.text },
  subheading: { fontSize: 17, fontWeight: '600', color: colors.text },
  presets: { flexDirection: 'row', gap: 8 },
  filter: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, gap: 12 },
  metrics: { gap: 12 },
  metric: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, gap: 6 },
  value: { fontSize: 24, fontWeight: '700', color: colors.primary },
  error: { color: colors.error },
});

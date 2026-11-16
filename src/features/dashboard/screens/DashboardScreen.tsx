import { formatDateTime, formatNumber } from '@/shared/format';
import { contentWidth } from '@/shared/theme';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton, AppInput } from '@/shared/components';
import { colors } from '@/shared/theme';
import { errorMessage } from '@/shared/api/errors';
import { formatBirthDateInput } from '@/features/auth/services/auth-contract';
import { loadDashboard } from '../services/dashboard-service';
import { displayDay, periodDays, periodInput, presetPeriod, type DashboardSummary, type Period } from '../services/dashboard-model';

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
    void loadDashboard(period, controller.signal).then((data) => {
      if (!controller.signal.aborted) setSummary(data);
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
        <Metric label="Aplicações de insulina" value={`${summary.applications} · ${formatNumber(summary.insulinTotal)} UI no total`} />
        <Metric label="Média (mg/dL)" value={measure(summary.mean)} />
        <Metric label="Mínimo / máximo (mg/dL)" value={`${measure(summary.min?.value ?? null)} / ${measure(summary.max?.value ?? null)}`} />
      </View>
      {summary.min && summary.max ? <Text style={styles.note}>
        Mínimo em {formatDateTime(summary.min.at)} ({summary.min.moment}). Máximo em {formatDateTime(summary.max.at)} ({summary.max.moment}).
      </Text> : null}
      {summary.measurements === 0 ? <Text>Nenhuma medição de glicemia neste período.</Text> : <>
        <View style={styles.filter}>
          <Text style={styles.subheading}>Faixas das medições</Text>
          <Text>Percentual das medições em cada faixa (mg/dL). Não representa tempo.</Text>
          {summary.bands.map((band) => <View key={band.key} style={{ gap: 5 }}>
            <Text>{band.label}: {band.count} · {band.percentage == null ? '—' : formatNumber(band.percentage) + '%'}</Text>
            <View style={styles.track}>
              <View style={[styles.bar, { width: `${band.percentage ?? 0}%` }, band.key === 'muitoBaixa' && styles.barAlert]} />
            </View>
          </View>)}
        </View>
        <View style={styles.filter}>
          <Text style={styles.subheading}>Média por momento do dia</Text>
          {summary.byMoment.map((item) => <View key={item.moment} style={styles.row}>
            <Text style={{ flex: 1 }}>{item.moment}</Text>
            <Text style={styles.rowValue}>{measure(item.mean)} mg/dL</Text>
            <Text style={styles.rowCount}>{item.count} {item.count === 1 ? 'medição' : 'medições'}</Text>
          </View>)}
        </View>
      </>}
      <View style={styles.filter}>
        <Text style={styles.subheading}>Insulina por dia</Text>
        {summary.insulinDaily.length === 0 ? <Text>Nenhuma aplicação de insulina neste período.</Text> :
          summary.insulinDaily.map((day) => <View key={day.date} style={styles.row}>
            <Text style={{ flex: 1 }}>{day.label}</Text>
            <Text style={styles.rowValue}>{formatNumber(day.totalUi)} UI</Text>
            <Text style={styles.rowCount}>{day.count} {day.count === 1 ? 'aplicação' : 'aplicações'}</Text>
          </View>)}
      </View>
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
  container: { flex: 1, backgroundColor: colors.screen },
  content: { ...contentWidth, padding: 20, paddingBottom: 40, gap: 16 },
  heading: { fontSize: 26, fontWeight: '700', color: colors.text },
  subheading: { fontSize: 17, fontWeight: '600', color: colors.text },
  presets: { flexDirection: 'row', gap: 8 },
  filter: { backgroundColor: colors.white, borderRadius: 12, padding: 16, gap: 12 },
  metrics: { gap: 12 },
  metric: { backgroundColor: colors.white, borderRadius: 12, padding: 16, gap: 6 },
  value: { fontSize: 24, fontWeight: '700', color: colors.primary },
  error: { color: colors.error },
  note: { color: colors.textSecondary, fontSize: 13 },
  track: { height: 8, backgroundColor: colors.slate200, borderRadius: 4 },
  bar: { height: 8, backgroundColor: colors.primary, borderRadius: 4 },
  barAlert: { backgroundColor: colors.error },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  rowValue: { width: 96, textAlign: 'right', fontWeight: '600', color: colors.text },
  rowCount: { width: 92, textAlign: 'right', color: colors.textSecondary, fontSize: 13 },
});

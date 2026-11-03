import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, Platform, ScrollView, Text, View } from 'react-native';
import { AppButton, AppInput } from '@/shared/components';
import { colors } from '@/shared/theme';
import { errorMessage } from '@/shared/api/errors';
import { useAuth } from '@/features/auth/hooks/AuthProvider';
import { formatBirthDateInput } from '@/features/auth/services/auth-contract';
import { displayDay, periodDays, periodInput, presetPeriod, type Period } from '@/features/dashboard/services/dashboard-model';
import { loadReport } from '../services/report-service';
import { reportHtml } from '../services/report-html';
import { exportReport } from '../services/report-export';
import type { Report } from '../services/report-model';

export function ReportsScreen() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>(() => presetPeriod(30));
  const [start, setStart] = useState(() => displayDay(period.start));
  const [end, setEnd] = useState(() => displayDay(period.end));
  const [filterError, setFilterError] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportError, setExportError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [revision, setRevision] = useState(0);
  const [visible, setVisible] = useState(20);
  const busy = useRef(false);
  const exportAbort = useRef<AbortController | null>(null);
  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    setLoading(true); setReport(null); setError(''); setExportError(''); setVisible(20);
    void loadReport(period, controller.signal).then((data) => {
      if (!controller.signal.aborted) setReport(data);
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) setError(errorMessage(cause));
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => { controller.abort(); exportAbort.current?.abort(); };
  }, [period, revision]));
  function choose(days: 7 | 30 | 90) {
    if (busy.current) return;
    const next = presetPeriod(days);
    setStart(displayDay(next.start)); setEnd(displayDay(next.end));
    setFilterError(''); setReport(null); setLoading(true); setPeriod(next);
  }
  function apply() {
    if (busy.current) return;
    try {
      const next = { start: periodInput(start), end: periodInput(end) }; periodDays(next);
      setFilterError(''); setReport(null); setLoading(true); setPeriod(next);
    } catch (cause) { setFilterError(errorMessage(cause)); }
  }
  async function share() {
    if (!report || !user || busy.current) return;
    busy.current = true; setExporting(true); setExportError('');
    const controller = new AbortController(); exportAbort.current = controller;
    try { await exportReport(reportHtml(report, user.nome), controller.signal); }
    catch (cause) { if (!controller.signal.aborted) setExportError(errorMessage(cause)); }
    finally { busy.current = false; setExporting(false); exportAbort.current = null; }
  }
  return <ScrollView style={{ flex: 1, backgroundColor: '#FAFAFA' }} contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
    <Text style={{ fontSize: 26, fontWeight: '700', color: colors.text }}>Relatórios</Text>
    <Text>Consulte e exporte glicemias e aplicações de insulina.</Text>
    <View style={{ flexDirection: 'row', gap: 8 }}>{([7, 30, 90] as const).map((days) => <View key={days} style={{ flex: 1 }}>
      <AppButton title={`${days} dias`} variant="secondary" disabled={exporting} onPress={() => choose(days)} />
    </View>)}</View>
    <View style={{ backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, gap: 8 }}>
      <Text>Período personalizado · até 366 dias</Text>
      <AppInput label="Data inicial" value={start} onChangeText={(value) => setStart(formatBirthDateInput(value))} maxLength={10} keyboardType="numeric" editable={!exporting} />
      <AppInput label="Data final" value={end} onChangeText={(value) => setEnd(formatBirthDateInput(value))} maxLength={10} keyboardType="numeric" editable={!exporting} />
      {filterError ? <Text accessibilityRole="alert" style={{ color: colors.error }}>{filterError}</Text> : null}
      <AppButton title="Aplicar período" disabled={exporting} onPress={apply} />
    </View>
    <Text>Período aplicado: {displayDay(period.start)} a {displayDay(period.end)}</Text>
    {loading ? <ActivityIndicator accessibilityLabel="Carregando relatório" /> : error ? <Text accessibilityRole="alert" style={{ color: colors.error }}>{error}</Text> : report ? <>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>{report.summary.measurements} medições · {report.summary.applications} aplicações</Text>
      <Text>O PDF inclui todos os registros e observações deste período.</Text>
      <AppButton title={Platform.OS === 'web' ? 'Imprimir / salvar PDF' : 'Gerar e compartilhar PDF'} loading={exporting} onPress={share} />
      {exportError ? <Text accessibilityRole="alert" style={{ color: colors.error }}>{exportError}</Text> : null}
      {report.rows.length === 0 ? <Text>Nenhum registro no período selecionado.</Text> : report.rows.slice(0, visible).map((row) => <View key={row.id} style={{ padding: 16, gap: 5, backgroundColor: '#FFFFFF', borderRadius: 12 }}>
        <Text style={{ fontSize: 17, fontWeight: '600' }}>{row.kind} · {row.value}</Text>
        <Text>{new Date(row.occurredAt).toLocaleString('pt-BR')}</Text><Text>{row.detail}</Text>
        {row.notes ? <Text>{row.notes}</Text> : null}
      </View>)}
      {report.rows.length > visible ? <AppButton title="Mostrar mais registros" variant="secondary" onPress={() => setVisible((value) => value + 20)} /> : null}
    </> : null}
    <AppButton title={error ? 'Tentar novamente' : 'Atualizar relatório'} variant="secondary" disabled={loading || exporting}
      onPress={() => setRevision((value) => value + 1)} />
  </ScrollView>;
}

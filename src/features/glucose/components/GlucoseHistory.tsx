import { formatDateTime, glucoseStatusLabels } from '@/shared/format';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/shared/components';
import { errorMessage } from '@/shared/api/errors';
import { colors } from '@/shared/theme';
import { listGlucose } from '../services/glucose-service';
import { momentLabels, type GlucoseRecord } from '../services/glucose-contract';

export function GlucoseHistory({ revision }: { revision: number }) {
  const [records, setRecords] = useState<GlucoseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [visible, setVisible] = useState(20);

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setRecords([]);
    setVisible(20);
    void listGlucose(controller.signal).then((data) => {
      if (!controller.signal.aborted) setRecords(data);
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) setError(errorMessage(cause));
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [revision, retry]));

  return <View style={styles.container}>
    <Text style={styles.heading}>Histórico de glicemia</Text>
    {loading ? <ActivityIndicator accessibilityLabel="Carregando histórico" color={colors.primary} /> : error ? <>
      <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
      <AppButton title="Tentar novamente" onPress={() => setRetry((value) => value + 1)} />
    </> : <>
      {records.length === 0 ? <Text>Nenhuma medição registrada.</Text> : records.slice(0, visible).map((record) => (
        <View key={record.id} style={styles.card}>
          <Text style={styles.value}>{record.valor} mg/dL</Text>
          <Text>{momentLabels[record.momento] ?? record.momento} · {glucoseStatusLabels[record.status] ?? record.status}</Text>
          <Text>{formatDateTime(record.dataHora)}</Text>
          {record.observacao ? <Text>{record.observacao}</Text> : null}
        </View>
      ))}
      {records.length > visible ? <AppButton title="Mostrar mais registros" variant="secondary" onPress={() => setVisible((value) => value + 20)} /> : null}
      <AppButton title="Atualizar histórico" variant="secondary" onPress={() => setRetry((value) => value + 1)} />
    </>}
  </View>;
}

const styles = StyleSheet.create({
  container: { marginTop: 28, gap: 12 },
  heading: { fontSize: 20, fontWeight: '700', color: colors.text },
  card: { padding: 16, gap: 5, backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.gray200 },
  value: { fontSize: 19, fontWeight: '600', color: colors.text },
  error: { color: colors.error },
});

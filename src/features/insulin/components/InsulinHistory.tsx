import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/shared/components';
import { errorMessage } from '@/shared/api/errors';
import { colors } from '@/shared/theme';
import { listInsulin } from '../services/insulin-service';
import { siteLabels, type InsulinRecord } from '../services/insulin-contract';

export function InsulinHistory({ revision }: { revision: number }) {
  const [records, setRecords] = useState<InsulinRecord[]>([]);
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
    void listInsulin(controller.signal).then((data) => {
      if (!controller.signal.aborted) setRecords(data);
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) setError(errorMessage(cause));
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [revision, retry]));

  return <View style={styles.container}>
    <Text style={styles.heading}>Histórico de aplicações</Text>
    {loading ? <ActivityIndicator accessibilityLabel="Carregando histórico de insulina" color={colors.primary} /> : error ? <>
      <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
      <AppButton title="Tentar novamente" onPress={() => setRetry((value) => value + 1)} />
    </> : <>
      {records.length === 0 ? <Text>Nenhuma aplicação registrada.</Text> : records.slice(0, visible).map((record) => (
        <View key={record.id} style={styles.card}>
          <Text style={styles.value}>{record.doseUi} UI · {record.tipo}</Text>
          <Text>{record.localAplicacao ? siteLabels[record.localAplicacao] ?? record.localAplicacao : 'Local não informado'}</Text>
          <Text>{new Date(record.dataHora).toLocaleString('pt-BR')}</Text>
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
  card: { padding: 16, gap: 5, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  value: { fontSize: 19, fontWeight: '600', color: colors.text },
  error: { color: colors.error },
});

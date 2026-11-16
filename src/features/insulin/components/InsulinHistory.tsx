import { formatDateTime, formatNumber } from '@/shared/format';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/shared/components';
import { errorMessage } from '@/shared/api/errors';
import { makeStyles, useThemeColors } from '@/shared/theme';
import { listInsulin } from '../services/insulin-service';
import { siteLabels, type InsulinRecord } from '../services/insulin-contract';

export function InsulinHistory({ revision }: { revision: number }) {
  const styles = useStyles();
  const c = useThemeColors();
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
    {loading ? <ActivityIndicator accessibilityLabel="Carregando histórico de insulina" color={c.primary} /> : error ? <>
      <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
      <AppButton title="Tentar novamente" onPress={() => setRetry((value) => value + 1)} />
    </> : <>
      {records.length === 0 ? <Text style={{ color: c.defaultText }}>Nenhuma aplicação registrada.</Text> : records.slice(0, visible).map((record) => (
        <View key={record.id} style={styles.card}>
          <Text style={styles.value}>{formatNumber(record.doseUi)} UI · {record.tipo}</Text>
          <Text style={{ color: c.defaultText }}>{record.localAplicacao ? siteLabels[record.localAplicacao] ?? record.localAplicacao : 'Local não informado'}</Text>
          <Text style={{ color: c.defaultText }}>{formatDateTime(record.dataHora)}</Text>
          {record.observacao ? <Text style={{ color: c.defaultText }}>{record.observacao}</Text> : null}
        </View>
      ))}
      {records.length > visible ? <AppButton title="Mostrar mais registros" variant="secondary" onPress={() => setVisible((value) => value + 20)} /> : null}
      <AppButton title="Atualizar histórico" variant="secondary" onPress={() => setRetry((value) => value + 1)} />
    </>}
  </View>;
}

const useStyles = makeStyles((c) => StyleSheet.create({
  container: { marginTop: 28, gap: 12 },
  heading: { fontSize: 20, fontWeight: '700', color: c.text },
  card: { padding: 16, gap: 5, backgroundColor: c.white, borderRadius: 12, borderWidth: 1, borderColor: c.gray200 },
  value: { fontSize: 19, fontWeight: '600', color: c.text },
  error: { color: c.error },
}));

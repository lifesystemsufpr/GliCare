import { formatNumber } from '@/shared/format';
import { ScrollView, Text, View } from 'react-native';
import { colors } from '@/shared/theme';
import type { DailyGlucose } from '../services/dashboard-model';

export function DailyGlucoseChart({ data }: { data: DailyGlucose[] }) {
  const maximum = Math.max(100, ...data.map((point) => point.mean ?? 0));
  const ceiling = Math.ceil(maximum / 50) * 50;
  return <View style={{ gap: 10, padding: 16, backgroundColor: '#FFFFFF', borderRadius: 12 }}>
    <Text style={{ fontSize: 18, fontWeight: '600' }}>Média diária de glicemia</Text>
    <Text style={{ color: colors.textSecondary }}>mg/dL · escala de 0 a {ceiling} · — sem medições</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <View style={{ flexDirection: 'row' }}>
        {data.map((point) => <View key={point.date} style={{ width: 54, alignItems: 'center' }}
          accessible accessibilityLabel={`${point.label}: ${point.mean == null ? 'sem medições' : formatNumber(point.mean) + ' mg/dL, ' + point.count + ' medições'}`}>
          <View style={{ height: 100, width: '100%', borderBottomWidth: 1, borderBottomColor: '#CBD5E1' }}>
            {point.mean == null ? null : <View style={{ position: 'absolute', bottom: point.mean / ceiling * 90,
              alignSelf: 'center', width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary }} />}
          </View>
          <Text style={{ fontSize: 11 }}>{point.label}</Text>
          <Text style={{ fontSize: 11 }}>{point.mean == null ? '—' : formatNumber(point.mean)}</Text>
        </View>)}
      </View>
    </ScrollView>
    <Text style={{ fontSize: 12, color: colors.textSecondary }}>Deslize para consultar todos os dias. Dias sem dados não recebem valor zero.</Text>
  </View>;
}

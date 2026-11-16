import { ScrollView, Text, View } from 'react-native';

import { formatNumber } from '@/shared/format';
import { colors } from '@/shared/theme';
import type { Reading } from '../services/dashboard-model';

// Cada medição do período em ordem cronológica, como a API entrega
// (glicemiaAoLongoDoDia). Nada é agregado no aparelho.
export function GlucoseReadingsChart({ data }: { data: Reading[] }) {
  const maximum = Math.max(200, ...data.map((point) => point.value));
  const ceiling = Math.ceil(maximum / 50) * 50;
  const bottom = (value: number) => (value / ceiling) * 110;
  return <View style={{ gap: 10, padding: 16, backgroundColor: colors.white, borderRadius: 12 }}>
    <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text }}>Glicemias no período</Text>
    <Text style={{ color: colors.textSecondary }}>
      mg/dL · escala de 0 a {ceiling} · faixa de 70 a 180 em destaque
    </Text>
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <View style={{ flexDirection: 'row' }}>
        {data.map((point, index) => <View key={point.at + index} style={{ width: 44, alignItems: 'center' }}
          accessible accessibilityLabel={`${point.label}, ${point.moment}: ${formatNumber(point.value)} mg/dL`}>
          <View style={{ height: 120, width: '100%', borderBottomWidth: 1, borderBottomColor: colors.slate300 }}>
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: bottom(70),
              height: bottom(180) - bottom(70), backgroundColor: colors.successSoft }} />
            <View style={{ position: 'absolute', bottom: bottom(point.value) - 4, alignSelf: 'center', width: 8, height: 8,
              borderRadius: 4, backgroundColor: point.value < 54 ? colors.error : colors.primary }} />
          </View>
          <Text style={{ fontSize: 10, color: colors.textSecondary }}>{point.label}</Text>
          <Text style={{ fontSize: 11, color: colors.text }}>{formatNumber(point.value)}</Text>
        </View>)}
      </View>
    </ScrollView>
    <Text style={{ fontSize: 12, color: colors.textSecondary }}>Deslize para ver todas as medições.</Text>
  </View>;
}

import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/shared/theme';
import { chartScale, type WeeklyPoint } from '../services/home-model';

interface WeeklyGlucoseChartProps {
  data: WeeklyPoint[];
}

export function WeeklyGlucoseChart({
  data,
}: WeeklyGlucoseChartProps) {
  const { min: chartMin, max: chartMax } = chartScale(data);

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Últimos 7 dias</Text>
      </View>
      <Text style={{ fontSize: 12, marginBottom: 8, color: colors.gray600 }}>Última medição de cada dia · mg/dL · — sem registro</Text>

      <View style={styles.card}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ height: 100, justifyContent: 'space-between', marginRight: 8 }}>
            <Text style={styles.axisLabel}>{chartMax}</Text>
            <Text style={styles.axisLabel}>{chartMax / 2}</Text>
            <Text style={styles.axisLabel}>{chartMin}</Text>
          </View>
        <View style={styles.chart}>
          {data.map((item) => {
            const normalized = Math.max(
              0,
              Math.min(
                1,
                ((item.value ?? chartMin) - chartMin) / (chartMax - chartMin),
              ),
            );

            return (
              <View key={item.date} style={styles.column}>
                <View style={styles.plotArea}>
                  {item.value != null ? <View
                    accessibilityLabel={`${item.day}: ${item.value} mg/dL`}
                    style={[
                      styles.point,
                      {
                         bottom: normalized * 95,
                      },
                    ]}
                  /> : null}
                </View>

                <Text style={styles.day}>{item.day}</Text>
                <Text style={{ fontSize: 10 }}>{item.value ?? '—'}</Text>
              </View>
            );
          })}
        </View>

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
header: {
  marginTop: 2,
  marginBottom: 12,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},

sectionTitle: {
  fontSize: 20,
  fontWeight: '600',
  color: colors.text,
},

details: {
  fontSize: 11,
  fontWeight: '600',
  color: colors.primary,
},

card: {
  position: 'relative',
  height: 190,
  paddingTop: 20,
  paddingRight: 14,
  paddingBottom: 14,
  paddingLeft: 12,
  backgroundColor: colors.white,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.gray200,
},

  chart: {
    flex: 1,
    flexDirection: 'row',
  },

  column: {
    flex: 1,
    alignItems: 'center',
  },

  plotArea: {
    position: 'relative',
    width: '100%',
    height: 100,
  },

  point: {
    position: 'absolute',
    alignSelf: 'center',
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },

  day: {
    marginTop: 3,
    fontSize: 10,
    color: colors.gray500,
  },

  labels: {
    position: 'absolute',
    left: 7,
    top: 13,
    bottom: 23,
    justifyContent: 'space-between',
  },

  axisLabel: {
    fontSize: 10,
    color: colors.gray400,
  },
});

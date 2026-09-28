import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/shared/theme';

interface GlucoseData {
  day: string;
  value: number;
}

interface WeeklyGlucoseChartProps {
  data: GlucoseData[];
}

export function WeeklyGlucoseChart({
  data,
}: WeeklyGlucoseChartProps) {
  const chartMin = 70;
  const chartMax = 140;

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Últimos 7 dias</Text>
        <Text style={styles.details}>Ver detalhes</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.chart}>
          {data.map((item) => {
            const normalized = Math.max(
              0,
              Math.min(
                1,
                (item.value - chartMin) / (chartMax - chartMin),
              ),
            );

            return (
              <View key={item.day} style={styles.column}>
                <View style={styles.plotArea}>
                  <View
                    style={[
                      styles.point,
                      {
                        bottom: normalized * 55,
                      },
                    ]}
                  />
                </View>

                <Text style={styles.day}>{item.day}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.labels}>
          <Text style={styles.axisLabel}>140</Text>
          <Text style={styles.axisLabel}>105</Text>
          <Text style={styles.axisLabel}>70</Text>
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
  height: 180,
  paddingTop: 20,
  paddingRight: 14,
  paddingBottom: 14,
  paddingLeft: 36,
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#E5E7EB',
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
    height: 64,
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
    fontSize: 7,
    color: '#6B7280',
  },

  labels: {
    position: 'absolute',
    left: 7,
    top: 13,
    bottom: 23,
    justifyContent: 'space-between',
  },

  axisLabel: {
    fontSize: 6,
    color: '#9CA3AF',
  },
});
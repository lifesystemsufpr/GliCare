import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Polyline } from "react-native-svg";
import { colors } from "@/shared/theme";

type Point = { label: string; value: number };
export function RecordChart({
  title,
  points,
  unit,
  bars = false,
}: {
  title: string;
  points: Point[];
  unit: string;
  bars?: boolean;
}) {
  const [width, setWidth] = useState(280);
  const height = 160;
  const maximum = Math.max(1, ...points.map((p) => p.value)) * 1.15;
  const x = (i: number) =>
    32 + (i * (width - 48)) / Math.max(1, points.length - 1);
  const y = (value: number) => height - 20 - (value / maximum) * (height - 40);
  return (
    <View
      style={styles.card}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width - 32)}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.unit}>{unit}</Text>
      {points.length === 0 ? (
        <Text>Sem registros no período.</Text>
      ) : bars ? (
        <View style={styles.bars}>
          {points.map((p) => (
            <View key={p.label} style={styles.column}>
              <Text style={styles.value}>{p.value}</Text>
              <View
                style={[styles.bar, { height: (p.value / maximum) * 120 }]}
              />
              <Text style={styles.label}>{p.label}</Text>
            </View>
          ))}
        </View>
      ) : (
        <>
          <Svg
            width={width}
            height={height}
            accessibilityLabel={points
              .map((p) => `${p.label}: ${p.value} ${unit}`)
              .join(", ")}
          >
            {[0, 0.5, 1].map((r) => (
              <Line
                key={r}
                x1={24}
                x2={width}
                y1={y(maximum * r)}
                y2={y(maximum * r)}
                stroke="#E5E7EB"
              />
            ))}
            <Polyline
              points={points.map((p, i) => `${x(i)},${y(p.value)}`).join(" ")}
              fill="none"
              stroke={colors.secondary}
              strokeWidth={3}
            />
            {points.map((p, i) => (
              <Circle
                key={p.label}
                cx={x(i)}
                cy={y(p.value)}
                r={4}
                fill={colors.primary}
              />
            ))}
          </Svg>
          <View style={styles.labels}>
            {points.map((p) => (
              <View key={p.label}>
                <Text style={styles.value}>{p.value}</Text>
                <Text style={styles.label}>{p.label}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  title: { fontSize: 15, fontWeight: "600", color: colors.text },
  unit: { fontSize: 12, color: colors.textSecondary },
  bars: {
    height: 170,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
  },
  column: { alignItems: "center", gap: 6 },
  bar: {
    width: 32,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: "#8DC8F5",
  },
  labels: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 11, color: colors.textSecondary, textAlign: "center" },
  value: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
    textAlign: "center",
  },
});

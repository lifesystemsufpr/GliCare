import { StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/shared/components";
import { RoutineHeader } from "@/shared/components/RoutineHeader";
import {
  demoRecords,
  displayDay,
  recordDay,
  recordTime,
} from "@/shared/data/demoRecords";
import { colors } from "@/shared/theme";
import { RecordChart } from "../components/RecordChart";

export function DashboardScreen() {
  const day = "2026-10-24";
  const glucose = demoRecords
    .filter((r) => r.kind === "glucose" && recordDay(r) === day)
    .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
  const values = glucose.map((r) => r.value);
  const days = [...new Set(demoRecords.map(recordDay))].sort();
  return (
    <ScreenContainer scrollable>
      <View style={styles.content}>
        <RoutineHeader />
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>
          Visão geral dos seus dados de saúde.
        </Text>
        <Text style={styles.notice}>
          Dados demonstrativos · {displayDay(day)}. Não são medições da sua
          conta.
        </Text>
        <View style={styles.metrics}>
          {[
            {
              label: "Média glicemia",
              value: Math.round(
                values.reduce((a, b) => a + b, 0) / values.length,
              ),
            },
            { label: "Maior valor", value: Math.max(...values) },
            { label: "Menor valor", value: Math.min(...values) },
          ].map((m) => (
            <View key={m.label} style={styles.metric}>
              <Text style={styles.subtitle}>{m.label}</Text>
              <Text style={styles.number}>{m.value}</Text>
              <Text style={styles.subtitle}>mg/dL</Text>
            </View>
          ))}
        </View>
        <RecordChart
          title="Glicemia ao longo do dia"
          unit="mg/dL"
          points={glucose.map((r) => ({
            label: recordTime(r),
            value: r.value,
          }))}
        />
        <RecordChart
          title="Insulina total diária"
          unit="UI (unidades de insulina)"
          bars
          points={days.map((d) => ({
            label: displayDay(d).slice(0, 5),
            value: demoRecords
              .filter((r) => r.kind === "insulin" && recordDay(r) === d)
              .reduce((sum, r) => sum + r.value, 0),
          }))}
        />
      </View>
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  content: { paddingTop: 20, gap: 16 },
  title: { fontSize: 24, fontWeight: "700", color: colors.text },
  subtitle: { fontSize: 12, color: colors.textSecondary },
  notice: {
    fontSize: 12,
    color: colors.primary,
    backgroundColor: "#EAF5FC",
    padding: 12,
    borderRadius: 8,
  },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  metric: {
    flexGrow: 1,
    minWidth: 110,
    padding: 14,
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  number: { fontSize: 30, fontWeight: "700", color: colors.primary },
});

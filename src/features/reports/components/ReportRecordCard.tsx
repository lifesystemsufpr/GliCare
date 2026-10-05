import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import {
  HealthRecord,
  recordTime,
  recordTitle,
  recordUnit,
} from "@/shared/data/demoRecords";
import { colors } from "@/shared/theme";
export function ReportRecordCard({ record }: { record: HealthRecord }) {
  const glucose = record.kind === "glucose";
  return (
    <View style={styles.card}>
      <View
        style={[
          styles.icon,
          { backgroundColor: glucose ? "#FEE2E2" : "#DBEAFE" },
        ]}
      >
        <Ionicons
          name={glucose ? "water" : "medical"}
          size={20}
          color={glucose ? "#DC2626" : colors.primary}
        />
      </View>
      <View style={styles.body}>
        <Text style={styles.label}>{recordTitle(record)}</Text>
        <Text style={styles.value}>
          {record.value} <Text style={styles.unit}>{recordUnit(record)}</Text>
        </Text>
      </View>
      <Text numberOfLines={1} style={styles.time}>
        {recordTime(record)}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
  },
  icon: {
    width: 38,
    height: 38,
    flexShrink: 0,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, minWidth: 0, gap: 5 },
  label: { fontSize: 12, color: colors.text },
  value: { fontSize: 20, fontWeight: "700", color: colors.text },
  unit: { fontSize: 12, fontWeight: "400" },
  time: {
    fontSize: 12,
    color: colors.textSecondary,
    minWidth: 48,
    flexShrink: 0,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
});

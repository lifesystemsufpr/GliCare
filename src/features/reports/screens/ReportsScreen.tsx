import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppInput, ScreenContainer } from "@/shared/components";
import { AppDateField } from "@/shared/components/AppDateField";
import { demoRecords, displayDay, recordDay } from "@/shared/data/demoRecords";
import { colors } from "@/shared/theme";
import { ReportRecordCard } from "../components/ReportRecordCard";
import {
  buildReportHtml,
  filterRecords,
  parseDate,
} from "../services/reportData";
import { exportReport } from "../services/exportReport";
export function ReportsScreen() {
  const [query, setQuery] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const startDate = start ? parseDate(start) : null;
  const endDate = end ? parseDate(end) : null;
  const dateError =
    start && !startDate
      ? "Informe a data inicial no formato dd/mm/aaaa."
      : end && !endDate
        ? "Informe a data final no formato dd/mm/aaaa."
        : startDate && endDate && startDate > endDate
          ? "A data inicial deve ser anterior ou igual à final."
          : "";
  const filters = useMemo(
    () => ({ query, kind: "all" as const, start, end }),
    [query, start, end],
  );
  const records = useMemo(
    () => (dateError ? [] : filterRecords(demoRecords, filters)),
    [filters, dateError],
  );
  const days = [...new Set(records.map(recordDay))];
  async function handleExport() {
    setExportError("");
    setExporting(true);
    try {
      await exportReport(buildReportHtml(records, filters));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível gerar o relatório. Tente novamente.";
      setExportError(message);
      if (Platform.OS !== "web")
        Alert.alert("Não foi possível exportar", message);
    } finally {
      setExporting(false);
    }
  }
  return (
    <ScreenContainer scrollable>
      <View style={styles.content}>
        <Text style={styles.title}>Relatórios</Text>
        <Text style={styles.subtitle}>
          Consulte, filtre e compartilhe seus registros.
        </Text>
        <Text style={styles.notice}>
          Dados demonstrativos. Os registros abaixo não são da sua conta.
        </Text>
        <AppInput
          label="Buscar registros"
          icon="search-outline"
          placeholder="Ex.: glicemia, jejum, NPH"
          value={query}
          onChangeText={setQuery}
        />
        <Text style={styles.section}>Período de coleta</Text>
        <View style={styles.row}>
          <View style={styles.field}>
            <AppDateField label="De" value={start} onChange={setStart} />
          </View>
          <View style={styles.field}>
            <AppDateField label="Até" value={end} onChange={setEnd} />
          </View>
        </View>
        {!!dateError && (
          <Text accessibilityRole="alert" style={styles.error}>
            {dateError}
          </Text>
        )}
        <View style={styles.row}>
          {(
            [
              { label: "Gerar PDF", icon: "document-text-outline" },
              { label: "Compartilhar", icon: "share-social-outline" },
            ] as const
          ).map((action) => (
            <Pressable
              key={action.label}
              accessibilityRole="button"
              accessibilityState={{
                disabled: exporting || records.length === 0,
              }}
              disabled={exporting || records.length === 0}
              onPress={handleExport}
              style={[
                styles.action,
                (exporting || records.length === 0) && styles.disabled,
              ]}
            >
              <Ionicons name={action.icon} size={24} color={colors.primary} />
              <Text style={styles.actionLabel}>
                {exporting ? "Gerando…" : action.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.subtitle}>
          {Platform.OS === "web"
            ? "Na janela de impressão, escolha Salvar como PDF."
            : "O PDF abre as opções do dispositivo para salvar ou compartilhar."}
        </Text>
        {!!exportError && (
          <Text accessibilityRole="alert" style={styles.error}>
            {exportError}
          </Text>
        )}
        <Text style={styles.section}>
          {records.length} registros encontrados
        </Text>
        {records.length === 0 && !dateError && (
          <View style={styles.empty}>
            <Ionicons
              name="search-outline"
              size={28}
              color={colors.textSecondary}
            />
            <Text style={styles.subtitle}>
              Nenhum registro corresponde aos filtros.
            </Text>
          </View>
        )}
        {days.map((day) => (
          <View key={day} style={styles.group}>
            <Text style={styles.day}>{displayDay(day)}</Text>
            {records
              .filter((r) => recordDay(r) === day)
              .map((record) => (
                <ReportRecordCard key={record.id} record={record} />
              ))}
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  content: { paddingTop: 20, gap: 14 },
  title: { fontSize: 24, fontWeight: "700", color: colors.text },
  subtitle: { fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
  notice: {
    fontSize: 12,
    color: colors.primary,
    backgroundColor: "#EAF5FC",
    padding: 12,
    borderRadius: 8,
  },
  section: { fontSize: 14, fontWeight: "600", color: colors.text },
  row: { flexDirection: "row", gap: 10 },
  field: { flex: 1 },
  action: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    padding: 20,
    gap: 10,
  },
  actionLabel: { fontSize: 12, color: colors.text },
  disabled: { opacity: 0.4 },
  error: { fontSize: 12, color: colors.error },
  group: { gap: 10, marginTop: 8 },
  day: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  empty: { alignItems: "center", padding: 24, gap: 10 },
});

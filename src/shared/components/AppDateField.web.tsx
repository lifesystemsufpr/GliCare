import { createElement } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { AppDateFieldProps } from "./AppDateField";
import { colors } from "../theme";

export function AppDateField({ label, value, onChange }: AppDateFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {createElement("input", {
        type: "date",
        "aria-label": label,
        value: value ? value.split("/").reverse().join("-") : "",
        onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
          onChange(
            event.target.value
              ? event.target.value.split("-").reverse().join("/")
              : "",
          ),
        style: {
          boxSizing: "border-box",
          width: "100%",
          minWidth: 0,
          minHeight: 48,
          padding: "0 10px",
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
          fontSize: 13,
          color: colors.text,
          backgroundColor: colors.surface,
          fontFamily: "inherit",
        },
      })}
    </View>
  );
}
const styles = StyleSheet.create({
  field: { flex: 1, minWidth: 0, gap: 6 },
  label: { fontSize: 14, fontWeight: "500", color: colors.text },
});

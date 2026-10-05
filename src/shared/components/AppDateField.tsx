import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors } from "../theme";

export type AppDateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function AppDateField({ label, value, onChange }: AppDateFieldProps) {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(new Date());
  function open() {
    const [day, month, year] = value.split("/").map(Number);
    setSelected(value ? new Date(year, month - 1, day) : new Date());
    setVisible(true);
  }
  function confirm(date: Date) {
    onChange(
      `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`,
    );
    setVisible(false);
  }
  const picker = (
    <DateTimePicker
      value={selected}
      mode="date"
      display={Platform.OS === "ios" ? "spinner" : "default"}
      onChange={(event, date) => {
        if (Platform.OS === "android") {
          setVisible(false);
          if (event.type === "set" && date) confirm(date);
        } else if (date) setSelected(date);
      }}
    />
  );
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value || "Selecionar data"}`}
        onPress={open}
      >
        <Text style={[styles.value, !value && styles.placeholder]}>
          {value || "Selecionar data"}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={colors.primary} />
      </Pressable>
      {visible && Platform.OS === "android" && picker}
      {Platform.OS === "ios" && (
        <Modal
          visible={visible}
          transparent
          animationType="fade"
          onRequestClose={() => setVisible(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.dialog}>
              <Text style={styles.label}>{label}</Text>
              {picker}
              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setVisible(false)}
                >
                  <Text style={styles.action}>Cancelar</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => confirm(selected)}
                >
                  <Text style={styles.action}>Confirmar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  field: { gap: 6, flex: 1, minWidth: 0 },
  label: { fontSize: 14, fontWeight: "500", color: colors.text },
  button: {
    minHeight: 48,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  value: { flex: 1, fontSize: 13, color: colors.text },
  placeholder: { color: colors.textSecondary },
  overlay: {
    flex: 1,
    backgroundColor: "#00000066",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  dialog: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
  },
  action: { color: colors.primary, fontSize: 16 },
});

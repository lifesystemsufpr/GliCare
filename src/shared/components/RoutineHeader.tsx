import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

export function RoutineHeader() {
  return (
    <View style={styles.row}>
      <View style={styles.brand}>
        <View style={styles.mark}>
          <Ionicons name="medical" size={16} color={colors.primary} />
        </View>
        <Text style={styles.name}>Minha Rotina{"\n"}Diabética</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir lembretes"
        hitSlop={12}
        onPress={() => router.push("/lembretes")}
      >
        <Ionicons
          name="notifications-outline"
          size={22}
          color={colors.primary}
        />
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  brand: { flexDirection: "row", gap: 10, alignItems: "center" },
  mark: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E8E5F7",
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 15, fontWeight: "700", color: colors.primary },
});

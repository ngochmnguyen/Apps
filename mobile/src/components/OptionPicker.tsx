import { Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  label?: string;
  options: [string, string][];
  value: string;
  onChange: (value: string) => void;
}

export function OptionPicker({ label, options, value, onChange }: Props) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        {options.map(([optValue, optLabel]) => {
          const selected = optValue === value;
          return (
            <Pressable
              key={optValue}
              onPress={() => onChange(optValue)}
              style={[styles.pill, selected && styles.pillSelected]}
            >
              <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{optLabel}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8, color: "#1a1a1a" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  pillSelected: { backgroundColor: "#1a4d2e", borderColor: "#1a4d2e" },
  pillText: { fontSize: 13, color: "#333" },
  pillTextSelected: { color: "#fff", fontWeight: "600" },
});

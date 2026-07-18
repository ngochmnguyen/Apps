import { useEffect, useMemo, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { meta, type Country } from "../api";

interface Props {
  label: string;
  value: string; // country code, "" if unset
  onChange: (code: string) => void;
}

// Countries barely change within a session, so a single module-level cache
// avoids every CountryPicker instance (nationality + residence) refetching
// the same public, unauthenticated list.
let cache: Country[] | null = null;

export function CountryPicker({ label, value, onChange }: Props) {
  const [countries, setCountries] = useState<Country[]>(cache ?? []);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (cache) return;
    meta.countries().then(({ countries: list }) => {
      cache = list;
      setCountries(list);
    });
  }, []);

  const selectedName = countries.find((c) => c.code === value)?.name;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter((c) => c.name.toLowerCase().includes(q));
  }, [countries, query]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.field} onPress={() => setOpen(true)}>
        <Text style={selectedName ? styles.fieldText : styles.placeholder}>
          {selectedName ?? "Select a country"}
        </Text>
      </Pressable>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modal}>
          <TextInput
            style={styles.search}
            placeholder="Search countries"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <Pressable
                style={styles.row}
                onPress={() => {
                  onChange(item.code);
                  setOpen(false);
                  setQuery("");
                }}
              >
                <Text style={styles.rowText}>{item.name}</Text>
              </Pressable>
            )}
          />
          <Pressable style={styles.closeButton} onPress={() => setOpen(false)}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8, color: "#1a1a1a" },
  field: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
  },
  fieldText: { fontSize: 15, color: "#1a1a1a" },
  placeholder: { fontSize: 15, color: "#999" },
  modal: { flex: 1, paddingTop: 60, paddingHorizontal: 16, backgroundColor: "#fff" },
  search: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 12,
  },
  row: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#eee" },
  rowText: { fontSize: 15, color: "#1a1a1a" },
  closeButton: { paddingVertical: 16, alignItems: "center" },
  closeButtonText: { fontSize: 15, color: "#1a4d2e", fontWeight: "600" },
});

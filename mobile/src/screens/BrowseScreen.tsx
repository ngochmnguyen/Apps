import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { opportunities, saved as savedApi } from "../api";
import { OpportunityCard } from "../components/OpportunityCard";
import { OptionPicker } from "../components/OptionPicker";
import { TYPES } from "../constants";
import type { BrowseStackParamList } from "../navigation/types";
import type { Opportunity } from "../types";

type Props = NativeStackScreenProps<BrowseStackParamList, "Browse">;

const TYPE_OPTIONS: [string, string][] = [["", "All types"], ...TYPES];
const URGENCY_OPTIONS: [string, string][] = [
  ["all", "All"],
  ["soon", "Closing soon"],
  ["month", "This month"],
  ["open", "Open"],
  ["rolling", "Rolling"],
];
const REGION_OPTIONS: [string, string][] = [
  ["all", "Anywhere"],
  ["nonconventional", "Non-conventional"],
  ["conventional", "Conventional"],
];

export function BrowseScreen({ navigation }: Props) {
  const [hot, setHot] = useState<Opportunity[]>([]);
  const [results, setResults] = useState<Opportunity[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [urgency, setUrgency] = useState("all");
  const [region, setRegion] = useState<"all" | "nonconventional" | "conventional">("all");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [hotRes, listRes] = await Promise.all([
      opportunities.hot(),
      opportunities.list({
        types: type ? [type] : undefined,
        urgency: urgency as any,
        region,
        search: search || undefined,
      }),
    ]);
    setHot(hotRes.results);
    setResults(listRes.results);
  }, [type, urgency, region, search]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleSave(o: Opportunity) {
    if (o.saved) await savedApi.unsave(o.id);
    else await savedApi.save(o.id);
    load();
  }

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      data={results}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View>
          <Text style={styles.heading}>Voya</Text>

          {hot.length > 0 && (
            <View style={styles.hotSection}>
              <Text style={styles.sectionTitle}>Hot picks</Text>
              {hot.map((o) => (
                <OpportunityCard
                  key={o.id}
                  opportunity={o}
                  onPress={() => navigation.navigate("OpportunityDetail", { opportunity: o })}
                  onToggleSave={() => toggleSave(o)}
                />
              ))}
            </View>
          )}

          <Text style={styles.sectionTitle}>Browse all</Text>
          <TextInput
            style={styles.search}
            placeholder="Search by title, org, destination"
            value={search}
            onChangeText={setSearch}
          />
          <OptionPicker label="Type" options={TYPE_OPTIONS} value={type} onChange={setType} />
          <OptionPicker label="Deadline" options={URGENCY_OPTIONS} value={urgency} onChange={setUrgency} />
          <OptionPicker label="Destination" options={REGION_OPTIONS} value={region} onChange={(v) => setRegion(v as any)} />
        </View>
      }
      renderItem={({ item }) => (
        <OpportunityCard
          opportunity={item}
          onPress={() => navigation.navigate("OpportunityDetail", { opportunity: item })}
          onToggleSave={() => toggleSave(item)}
        />
      )}
      ListEmptyComponent={<Text style={styles.empty}>No opportunities match these filters.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 40 },
  heading: { fontSize: 28, fontWeight: "700", color: "#1a4d2e", marginBottom: 16 },
  hotSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1a1a1a", marginBottom: 10 },
  search: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 12,
  },
  empty: { textAlign: "center", color: "#666", marginTop: 20 },
});

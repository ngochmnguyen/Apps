import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { saved as savedApi, todos as todosApi } from "../api";
import { CHECKLIST_TEMPLATES } from "../constants";
import type { BrowseStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<BrowseStackParamList, "OpportunityDetail">;

const URGENCY_LABELS: Record<string, string> = {
  soon: "Closing soon",
  month: "Closing this month",
  open: "Open",
  rolling: "Rolling admission",
  closed: "Closed",
};

function formatStipend(min: string | null, max: string | null, currency: string | null): string | null {
  if (!min && !max) return null;
  const minN = min ? Number(min) : null;
  const maxN = max ? Number(max) : null;
  const cur = currency ?? "";
  if (minN && maxN && minN !== maxN) return `${cur} ${minN.toLocaleString()}–${maxN.toLocaleString()}`;
  return `${cur} ${(maxN ?? minN)?.toLocaleString()}`;
}

export function OpportunityDetailScreen({ route }: Props) {
  const { opportunity: o } = route.params;
  const [saved, setSaved] = useState(o.saved);
  const [added, setAdded] = useState(false);
  const [busy, setBusy] = useState(false);

  const stipend = formatStipend(o.stipend_min, o.stipend_max, o.currency);
  const checklist = CHECKLIST_TEMPLATES[o.type] ?? [];

  async function toggleSave() {
    setBusy(true);
    try {
      if (saved) await savedApi.unsave(o.id);
      else await savedApi.save(o.id);
      setSaved(!saved);
    } finally {
      setBusy(false);
    }
  }

  async function addToTodoList() {
    setBusy(true);
    try {
      if (!saved) {
        await savedApi.save(o.id);
        setSaved(true);
      }
      await todosApi.bulkCreate(o.id, checklist);
      setAdded(true);
    } finally {
      setBusy(false);
    }
  }

  const coverage = [o.flight && "Flight", o.lodging && "Lodging", o.meals && "Meals"].filter(Boolean).join(", ");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{o.title}</Text>
        <Pressable hitSlop={10} onPress={toggleSave} disabled={busy}>
          <Text style={styles.star}>{saved ? "★" : "☆"}</Text>
        </Pressable>
      </View>
      <Text style={styles.org}>
        {o.org} · {o.dest_name}
      </Text>

      <View style={styles.badgeRow}>
        <Text style={styles.badge}>{URGENCY_LABELS[o.urgency]}</Text>
        {o.deadline && <Text style={styles.meta}>Due {o.deadline}</Text>}
      </View>
      {!o.eligible && o.ineligibleReasons.length > 0 && (
        <Text style={styles.ineligible}>May not match your profile: {o.ineligibleReasons.join(", ")}</Text>
      )}

      <Text style={styles.description}>{o.description}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compensation</Text>
        <Text style={styles.body}>{stipend ?? "Not specified"}</Text>
        {coverage ? <Text style={styles.body}>Covers: {coverage}</Text> : null}
        {o.requires_work_visa && (
          <Text style={styles.body}>Requires a work visa to receive payment{o.visa_note ? ` — ${o.visa_note}` : ""}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <Text style={styles.body}>Duration: {o.duration.replace(/_/g, " ")}</Text>
        <Text style={styles.body}>Effort: {o.effort_label}{o.effort_min ? ` (~${o.effort_min} min)` : ""}</Text>
        {o.english && <Text style={styles.body}>English level required: {o.english.toUpperCase()}</Text>}
        {o.grad_only && <Text style={styles.body}>Grad students only</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What to prepare</Text>
        {checklist.map((item) => (
          <Text key={item} style={styles.checklistItem}>
            • {item}
          </Text>
        ))}
      </View>

      <Pressable style={styles.addTodoButton} onPress={addToTodoList} disabled={busy || added}>
        <Text style={styles.addTodoButtonText}>{added ? "Added ✓" : "+ Add to my to-do list"}</Text>
      </Pressable>

      <Pressable style={styles.sourceButton} onPress={() => Linking.openURL(o.source_url)}>
        <Text style={styles.sourceButtonText}>View source</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60, backgroundColor: "#fff" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { fontSize: 22, fontWeight: "700", color: "#1a1a1a", flex: 1, marginRight: 12 },
  star: { fontSize: 28, color: "#b8860b" },
  org: { fontSize: 14, color: "#666", marginTop: 4 },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 10 },
  badge: { fontSize: 13, fontWeight: "700", color: "#1a4d2e" },
  meta: { fontSize: 13, color: "#666" },
  ineligible: { fontSize: 13, color: "#b00020", marginTop: 8 },
  description: { fontSize: 15, color: "#333", marginTop: 16, lineHeight: 22 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1a1a1a", marginBottom: 6 },
  body: { fontSize: 14, color: "#444", marginBottom: 2 },
  checklistItem: { fontSize: 14, color: "#444", marginBottom: 2 },
  addTodoButton: {
    marginTop: 24,
    backgroundColor: "#1a4d2e",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  addTodoButtonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  sourceButton: { marginTop: 12, alignItems: "center", paddingVertical: 10 },
  sourceButtonText: { color: "#1a4d2e", fontSize: 14, fontWeight: "600" },
});

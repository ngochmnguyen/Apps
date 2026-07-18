import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Opportunity } from "../types";

const URGENCY_LABELS: Record<string, string> = {
  soon: "Closing soon",
  month: "Closing this month",
  open: "Open",
  rolling: "Rolling admission",
  closed: "Closed",
};

const URGENCY_COLORS: Record<string, string> = {
  soon: "#b00020",
  month: "#b8860b",
  open: "#1a4d2e",
  rolling: "#555",
  closed: "#999",
};

function formatStipend(o: Opportunity): string | null {
  if (!o.stipend_min && !o.stipend_max) return null;
  const min = o.stipend_min ? Number(o.stipend_min) : null;
  const max = o.stipend_max ? Number(o.stipend_max) : null;
  const currency = o.currency ?? "";
  if (min && max && min !== max) return `${currency} ${min.toLocaleString()}–${max.toLocaleString()}`;
  return `${currency} ${(max ?? min)?.toLocaleString()}`;
}

interface Props {
  opportunity: Opportunity;
  onPress: () => void;
  onToggleSave: () => void;
}

export function OpportunityCard({ opportunity: o, onPress, onToggleSave }: Props) {
  const stipend = formatStipend(o);
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={2}>
          {o.title}
        </Text>
        <Pressable hitSlop={10} onPress={onToggleSave}>
          <Text style={styles.star}>{o.saved ? "★" : "☆"}</Text>
        </Pressable>
      </View>
      <Text style={styles.org} numberOfLines={1}>
        {o.org} · {o.dest_name}
      </Text>
      <View style={styles.metaRow}>
        <Text style={[styles.badge, { color: URGENCY_COLORS[o.urgency] }]}>{URGENCY_LABELS[o.urgency]}</Text>
        {o.deadline && <Text style={styles.deadline}>Due {o.deadline}</Text>}
      </View>
      {stipend && <Text style={styles.stipend}>{stipend}</Text>}
      {!o.eligible && <Text style={styles.ineligible}>May not match your profile</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { fontSize: 16, fontWeight: "700", color: "#1a1a1a", flex: 1, marginRight: 8 },
  star: { fontSize: 22, color: "#b8860b" },
  org: { fontSize: 13, color: "#666", marginTop: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 10 },
  badge: { fontSize: 12, fontWeight: "700" },
  deadline: { fontSize: 12, color: "#666" },
  stipend: { fontSize: 13, color: "#1a1a1a", marginTop: 6, fontWeight: "600" },
  ineligible: { fontSize: 12, color: "#b00020", marginTop: 6 },
});

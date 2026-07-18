import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { saved as savedApi, todos as todosApi } from "../api";
import { OpportunityCard } from "../components/OpportunityCard";
import { OptionPicker } from "../components/OptionPicker";
import { STATUS_LABELS, VALID_STATUSES } from "../constants";
import type { MyTripsStackParamList } from "../navigation/types";
import type { Opportunity, Todo } from "../types";

type Props = NativeStackScreenProps<MyTripsStackParamList, "MyTripsList">;

const STATUS_OPTIONS: [string, string][] = VALID_STATUSES.map((s) => [s, STATUS_LABELS[s]]);

export function MyTripsScreen({ navigation }: Props) {
  const [savedList, setSavedList] = useState<Opportunity[]>([]);
  const [todoList, setTodoList] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newOpportunityId, setNewOpportunityId] = useState("");

  const load = useCallback(async () => {
    const [savedRes, todosRes] = await Promise.all([savedApi.list(), todosApi.list()]);
    setSavedList(savedRes.results);
    setTodoList(todosRes.results);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const closingSoon = savedList.filter((o) => o.urgency === "soon").length;
  const openTasks = todoList.filter((t) => t.status === "not_started" || t.status === "started").length;

  async function unsave(o: Opportunity) {
    await savedApi.unsave(o.id);
    load();
  }

  async function updateTodoStatus(todo: Todo, status: string) {
    await todosApi.update(todo.id, { status });
    load();
  }

  async function deleteTodo(todo: Todo) {
    await todosApi.remove(todo.id);
    load();
  }

  async function addTask() {
    if (!newTitle.trim()) return;
    await todosApi.create({
      title: newTitle.trim(),
      dueDate: newDueDate.trim() || undefined,
      opportunityId: newOpportunityId || undefined,
    });
    setNewTitle("");
    setNewDueDate("");
    setNewOpportunityId("");
    load();
  }

  const linkedGroups = new Map<string, { title: string; items: Todo[] }>();
  const generalTasks: Todo[] = [];
  for (const t of todoList) {
    if (t.opportunity_id) {
      const group = linkedGroups.get(t.opportunity_id) ?? { title: t.opportunity_title ?? "Saved trip", items: [] };
      group.items.push(t);
      linkedGroups.set(t.opportunity_id, group);
    } else {
      generalTasks.push(t);
    }
  }

  const opportunityOptions: [string, string][] = [
    ["", "General task"],
    ...savedList.map((o) => [o.id, o.title] as [string, string]),
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>My Trips</Text>

      <View style={styles.statsRow}>
        <Stat label="Saved" value={savedList.length} />
        <Stat label="Closing ≤7 days" value={closingSoon} />
        <Stat label="Open tasks" value={openTasks} />
      </View>

      <Text style={styles.sectionTitle}>Saved opportunities</Text>
      {savedList.length === 0 && <Text style={styles.empty}>Nothing saved yet — star a listing to add it here.</Text>}
      {savedList.map((o) => (
        <OpportunityCard
          key={o.id}
          opportunity={o}
          onPress={() => navigation.navigate("OpportunityDetail", { opportunity: o })}
          onToggleSave={() => unsave(o)}
        />
      ))}

      <Text style={styles.sectionTitle}>To-do list</Text>

      {[...linkedGroups.entries()].map(([opportunityId, group]) => (
        <View key={opportunityId} style={styles.todoGroup}>
          <Text style={styles.todoGroupTitle}>{group.title}</Text>
          {group.items.map((t) => (
            <TodoRow key={t.id} todo={t} onStatusChange={(s) => updateTodoStatus(t, s)} onDelete={() => deleteTodo(t)} />
          ))}
        </View>
      ))}

      {generalTasks.length > 0 && (
        <View style={styles.todoGroup}>
          <Text style={styles.todoGroupTitle}>General tasks</Text>
          {generalTasks.map((t) => (
            <TodoRow key={t.id} todo={t} onStatusChange={(s) => updateTodoStatus(t, s)} onDelete={() => deleteTodo(t)} />
          ))}
        </View>
      )}

      <View style={styles.addTaskForm}>
        <Text style={styles.sectionTitle}>Add a task</Text>
        <TextInput style={styles.input} placeholder="Task title" value={newTitle} onChangeText={setNewTitle} />
        <TextInput
          style={styles.input}
          placeholder="Due date (YYYY-MM-DD, optional)"
          value={newDueDate}
          onChangeText={setNewDueDate}
        />
        <OptionPicker label="Link to a saved trip" options={opportunityOptions} value={newOpportunityId} onChange={setNewOpportunityId} />
        <Pressable style={styles.addButton} onPress={addTask} disabled={!newTitle.trim()}>
          <Text style={styles.addButtonText}>Add task</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function TodoRow({
  todo,
  onStatusChange,
  onDelete,
}: {
  todo: Todo;
  onStatusChange: (status: string) => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.todoRow}>
      <View style={styles.todoRowHeader}>
        <Text style={styles.todoTitle}>{todo.title}</Text>
        <Pressable hitSlop={10} onPress={onDelete}>
          <Text style={styles.deleteButton}>×</Text>
        </Pressable>
      </View>
      {todo.due_date && <Text style={styles.dueDate}>Due {todo.due_date}</Text>}
      <OptionPicker options={STATUS_OPTIONS} value={todo.status} onChange={onStatusChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 40, backgroundColor: "#fff" },
  heading: { fontSize: 28, fontWeight: "700", color: "#1a4d2e", marginBottom: 16 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  stat: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 22, fontWeight: "700", color: "#1a1a1a" },
  statLabel: { fontSize: 12, color: "#666", marginTop: 2, textAlign: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1a1a1a", marginTop: 12, marginBottom: 10 },
  empty: { fontSize: 14, color: "#666", marginBottom: 12 },
  todoGroup: { marginBottom: 16 },
  todoGroupTitle: { fontSize: 14, fontWeight: "700", color: "#555", marginBottom: 8 },
  todoRow: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  todoRowHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  todoTitle: { fontSize: 15, color: "#1a1a1a", flex: 1, marginRight: 8 },
  deleteButton: { fontSize: 20, color: "#b00020" },
  dueDate: { fontSize: 12, color: "#666", marginTop: 2, marginBottom: 6 },
  addTaskForm: { marginTop: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#eee" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 12,
  },
  addButton: { backgroundColor: "#1a4d2e", borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  addButtonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});

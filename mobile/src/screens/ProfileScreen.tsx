import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { ApiError } from "../api";
import { CountryPicker } from "../components/CountryPicker";
import { OptionPicker } from "../components/OptionPicker";
import { useAuth } from "../context/AuthContext";
import { CAREER_STAGES, EDUCATION_LEVELS, EMPLOYMENT, ENGLISH } from "../constants";

export function ProfileScreen() {
  const { user, profile, updateProfile, logout } = useAuth();
  const [nationality, setNationality] = useState(profile?.nationality ?? "");
  const [residence, setResidence] = useState(profile?.residence ?? "");
  const [age, setAge] = useState(String(profile?.age ?? ""));
  const [education, setEducation] = useState(profile?.education ?? "");
  const [career, setCareer] = useState(profile?.career ?? "");
  const [employment, setEmployment] = useState(profile?.employment ?? "");
  const [english, setEnglish] = useState(profile?.english ?? "");
  const [disability, setDisability] = useState(profile?.disability ?? false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ageNum = parseInt(age, 10);
  const canSave = nationality && residence && Number.isInteger(ageNum) && ageNum >= 18 && education && career && employment && english;

  async function handleSave() {
    setError(null);
    setSaved(false);
    if (!canSave) {
      setError("Please fill in every field. Age must be 18 or older.");
      return;
    }
    setLoading(true);
    try {
      await updateProfile({ nationality, residence, age: ageNum, education, career, employment, english, disability });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Profile</Text>
      <Text style={styles.email}>{user?.email}</Text>

      {error && <Text style={styles.error}>{error}</Text>}
      {saved && <Text style={styles.success}>Profile updated.</Text>}

      <TextInput style={styles.input} placeholder="Age" value={age} onChangeText={setAge} keyboardType="number-pad" />
      <CountryPicker label="Nationality" value={nationality} onChange={setNationality} />
      <CountryPicker label="Country of residence" value={residence} onChange={setResidence} />
      <OptionPicker label="Education level" options={EDUCATION_LEVELS} value={education} onChange={setEducation} />
      <OptionPicker label="Career stage" options={CAREER_STAGES} value={career} onChange={setCareer} />
      <OptionPicker label="Employment status" options={EMPLOYMENT} value={employment} onChange={setEmployment} />
      <OptionPicker label="English level" options={ENGLISH} value={english} onChange={setEnglish} />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Living with a disability</Text>
        <Switch value={disability} onValueChange={setDisability} />
      </View>

      <Pressable style={styles.saveButton} onPress={handleSave} disabled={loading || !canSave}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save changes</Text>}
      </Pressable>

      <Pressable style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Log out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40, backgroundColor: "#fff" },
  heading: { fontSize: 28, fontWeight: "700", color: "#1a4d2e" },
  email: { fontSize: 14, color: "#666", marginTop: 4, marginBottom: 20 },
  error: { color: "#b00020", marginBottom: 12 },
  success: { color: "#1a4d2e", marginBottom: 12 },
  label: { fontSize: 14, fontWeight: "600", color: "#1a1a1a" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 12,
  },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  saveButton: { backgroundColor: "#1a4d2e", borderRadius: 8, paddingVertical: 14, alignItems: "center" },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  logoutButton: { marginTop: 16, paddingVertical: 14, alignItems: "center" },
  logoutButtonText: { color: "#b00020", fontSize: 15, fontWeight: "600" },
});

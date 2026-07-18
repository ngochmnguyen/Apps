import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { ApiError } from "../api";
import { CountryPicker } from "../components/CountryPicker";
import { OptionPicker } from "../components/OptionPicker";
import { useAuth } from "../context/AuthContext";
import { CAREER_STAGES, EDUCATION_LEVELS, EMPLOYMENT, ENGLISH } from "../constants";
import type { AuthStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Signup">;

export function SignupScreen({ navigation }: Props) {
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nationality, setNationality] = useState("");
  const [residence, setResidence] = useState("");
  const [age, setAge] = useState("");
  const [education, setEducation] = useState("");
  const [career, setCareer] = useState("");
  const [employment, setEmployment] = useState("");
  const [english, setEnglish] = useState("");
  const [disability, setDisability] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ageNum = parseInt(age, 10);
  const canSubmit =
    email.trim() &&
    password.length >= 8 &&
    nationality &&
    residence &&
    Number.isInteger(ageNum) &&
    ageNum >= 18 &&
    education &&
    career &&
    employment &&
    english;

  async function handleSubmit() {
    setError(null);
    if (!canSubmit) {
      setError("Please fill in every field. Age must be 18 or older.");
      return;
    }
    setLoading(true);
    try {
      await signup({
        email: email.trim(),
        password,
        nationality,
        residence,
        age: ageNum,
        education,
        career,
        employment,
        english,
        disability,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create your account</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password (min 8 characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="number-pad"
      />

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

      <Pressable style={styles.button} onPress={handleSubmit} disabled={loading || !canSubmit}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign up</Text>}
      </Pressable>

      <Pressable onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "700", color: "#1a4d2e", marginBottom: 20 },
  error: { color: "#b00020", marginBottom: 12 },
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
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  button: { backgroundColor: "#1a4d2e", borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  link: { color: "#1a4d2e", textAlign: "center", marginTop: 20, fontSize: 14 },
});

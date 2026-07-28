import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ApiError } from "../api";
import { useAuth } from "../context/AuthContext";

// Shown once, before Login/Signup, on a fresh install -- see RootNavigator's
// `!capturedEmail && !user` branch. Only asks for an email; a full account
// (password + profile) is created later via the normal Signup screen, which
// completes this same server-side row instead of creating a duplicate.
export function EmailGateScreen() {
  const { captureEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      await captureEmail(email.trim());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voya</Text>
      <Text style={styles.subtitle}>Pop in your email to get started. No password needed yet -- you can create a full account later.</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoFocus
        keyboardType="email-address"
      />

      <Pressable style={styles.button} onPress={handleSubmit} disabled={loading || !email.trim()}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continue</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 24, backgroundColor: "#fff" },
  title: { fontSize: 32, fontWeight: "700", textAlign: "center", color: "#1a4d2e" },
  subtitle: { fontSize: 15, textAlign: "center", color: "#666", marginTop: 4, marginBottom: 24 },
  error: { color: "#b00020", marginBottom: 12, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#1a4d2e",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { auth, setAuthToken, type SignupPayload } from "../api";
import type { Profile, User } from "../types";

const TOKEN_KEY = "voya_token";
const CAPTURED_EMAIL_KEY = "voya_captured_email";

interface AuthContextValue {
  ready: boolean;
  user: User | null;
  profile: Profile | null;
  capturedEmail: string | null;
  captureEmail: (email: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (payload: Omit<SignupPayload, "email" | "password">) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [capturedEmail, setCapturedEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [stored, storedEmail] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(CAPTURED_EMAIL_KEY),
      ]);
      if (storedEmail) setCapturedEmail(storedEmail);
      if (stored) {
        setAuthToken(stored);
        try {
          const { user: me, profile: myProfile } = await auth.me();
          setUser(me);
          setProfile(myProfile);
        } catch {
          // expired/invalid token -- fall back to logged-out state
          setAuthToken(null);
          await SecureStore.deleteItemAsync(TOKEN_KEY);
        }
      }
      setReady(true);
    })();
  }, []);

  // The pre-signup email gate: captures just an email (no password/profile
  // yet -- see server/src/routes/auth.js POST /capture-email) so the app is
  // usable past the gate before a full account exists. A real signup later
  // completes the same server-side row.
  async function captureEmail(email: string) {
    await auth.captureEmail(email);
    await SecureStore.setItemAsync(CAPTURED_EMAIL_KEY, email);
    setCapturedEmail(email);
  }

  async function persistSession(token: string, sessionUser: User, sessionProfile: Profile) {
    setAuthToken(token);
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    setUser(sessionUser);
    setProfile(sessionProfile);
  }

  async function login(email: string, password: string) {
    const { token, user: sessionUser, profile: sessionProfile } = await auth.login(email, password);
    await persistSession(token, sessionUser, sessionProfile);
  }

  async function signup(payload: SignupPayload) {
    const { token, user: sessionUser, profile: sessionProfile } = await auth.signup(payload);
    await persistSession(token, sessionUser, sessionProfile);
  }

  async function logout() {
    setAuthToken(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setUser(null);
    setProfile(null);
  }

  async function updateProfile(payload: Omit<SignupPayload, "email" | "password">) {
    const { profile: updated } = await auth.updateProfile(payload);
    setProfile(updated);
  }

  return (
    <AuthContext.Provider value={{ ready, user, profile, capturedEmail, captureEmail, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

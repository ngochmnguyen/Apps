import type { Opportunity, Profile, Todo, User } from "./types";

// Expo inlines EXPO_PUBLIC_* env vars at build time. Set EXPO_PUBLIC_API_URL
// in mobile/.env to your machine's LAN IP (e.g. http://192.168.1.23:3001)
// when testing on a physical device or simulator -- "localhost" there means
// the device itself, not your dev machine.
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new ApiError(res.status, body?.error ?? `Request failed (${res.status})`);
  }
  return body as T;
}

export interface SignupPayload {
  email: string;
  password: string;
  nationality: string;
  residence: string;
  age: number;
  education: string;
  career: string;
  employment: string;
  english: string;
  disability: boolean;
}

export interface AuthResponse {
  user: User;
  profile: Profile;
  token: string;
}

export interface Country {
  code: string;
  name: string;
  region: string;
  non_conventional: boolean;
  is_gulf: boolean;
  latitude: number | null;
  longitude: number | null;
}

export const meta = {
  countries: () => request<{ countries: Country[] }>("/api/countries"),
};

export const auth = {
  signup: (payload: SignupPayload) =>
    request<AuthResponse>("/api/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
  login: (email: string, password: string) =>
    request<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: () => request<{ user: User | null; profile: Profile | null }>("/api/auth/me"),
  updateProfile: (payload: Omit<SignupPayload, "email" | "password">) =>
    request<{ profile: Profile }>("/api/auth/profile", { method: "PUT", body: JSON.stringify(payload) }),
};

export interface OpportunityFilters {
  types?: string[];
  fields?: string[];
  region?: "all" | "nonconventional" | "conventional";
  urgency?: "all" | "soon" | "month" | "open" | "rolling" | "closed";
  search?: string;
}

function buildQuery(filters: OpportunityFilters): string {
  const params = new URLSearchParams();
  if (filters.types?.length) params.set("types", filters.types.join(","));
  if (filters.fields?.length) params.set("fields", filters.fields.join(","));
  if (filters.region && filters.region !== "all") params.set("region", filters.region);
  if (filters.urgency && filters.urgency !== "all") params.set("urgency", filters.urgency);
  if (filters.search) params.set("search", filters.search);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const opportunities = {
  hot: () => request<{ results: Opportunity[] }>("/api/opportunities/hot"),
  list: (filters: OpportunityFilters = {}) =>
    request<{ stats: { total: number; eligible: number; closingSoon: number }; results: Opportunity[] }>(
      `/api/opportunities/${buildQuery(filters)}`
    ),
};

export const saved = {
  list: () => request<{ results: Opportunity[] }>("/api/saved/"),
  save: (opportunityId: string) => request<{ ok: true }>(`/api/saved/${opportunityId}`, { method: "POST" }),
  unsave: (opportunityId: string) => request<{ ok: true }>(`/api/saved/${opportunityId}`, { method: "DELETE" }),
};

export const todos = {
  list: () => request<{ results: Todo[] }>("/api/todos/"),
  create: (payload: { title: string; dueDate?: string; opportunityId?: string }) =>
    request<{ todo: Todo }>("/api/todos/", { method: "POST", body: JSON.stringify(payload) }),
  bulkCreate: (opportunityId: string, items: string[]) =>
    request<{ todos: Todo[] }>("/api/todos/bulk", { method: "POST", body: JSON.stringify({ opportunityId, items }) }),
  update: (id: string, payload: { status?: string; title?: string; dueDate?: string }) =>
    request<{ todo: Todo }>(`/api/todos/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  remove: (id: string) => request<{ ok: true }>(`/api/todos/${id}`, { method: "DELETE" }),
};

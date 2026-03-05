import type {
  Session,
  Milestone,
  UseaiConfig,
  StatsResponse,
  HealthResponse,
} from "@useai/types";

const BASE = "/api/local";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error ?? "Unknown error");
  return json.data;
}

export async function fetchSessions(): Promise<Session[]> {
  const data = await get<{ sessions: Session[] }>("/sessions");
  return data.sessions;
}

export async function fetchMilestones(): Promise<Milestone[]> {
  const data = await get<{ milestones: Milestone[] }>("/sessions/milestones");
  return data.milestones;
}

export async function fetchStats(): Promise<StatsResponse> {
  return get<StatsResponse>("/stats");
}

export async function fetchConfig(): Promise<UseaiConfig> {
  const data = await get<{ config: UseaiConfig }>("/config");
  return data.config;
}

export async function patchConfig(
  patch: Partial<UseaiConfig>,
): Promise<UseaiConfig> {
  const res = await fetch(`${BASE}/config`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const json = await res.json();
  return json.data.config;
}

export async function deleteSession(id: string): Promise<void> {
  await fetch(`${BASE}/sessions/${id}`, { method: "DELETE" });
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch("/health");
  return res.json();
}

import type { SessionSeal, SessionEvaluation, Milestone, HealthInfo } from './lib/types.js';

const BASE = '/api/local';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

async function del<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? `${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// ── Adapters (camelCase daemon response → snake_case types) ──────────────────

function toSessionSeal(raw: Record<string, unknown>): SessionSeal {
  const seal: SessionSeal = {
    session_id: raw['promptId'] as string,
    ...(raw['connectionId'] !== undefined && { conversation_id: raw['connectionId'] as string }),
    client: raw['client'] as string,
    task_type: raw['taskType'] as string,
    languages: (raw['languages'] as string[]) ?? [],
    files_touched: (raw['filesTouchedCount'] as number) ?? 0,
    started_at: raw['startedAt'] as string,
    ended_at: raw['endedAt'] as string,
    duration_seconds: (raw['durationMs'] as number) / 1000,
    heartbeat_count: 0,
    record_count: 0,
    chain_start_hash: (raw['prevHash'] as string) ?? '',
    chain_end_hash: (raw['hash'] as string) ?? '',
    seal_signature: (raw['signature'] as string) ?? '',
  };
  if (raw['project'] !== undefined) seal.project = raw['project'] as string;
  if (raw['title'] !== undefined) seal.title = raw['title'] as string;
  if (raw['privateTitle'] !== undefined) seal.private_title = raw['privateTitle'] as string;
  if (raw['prompt'] !== undefined) seal.prompt = raw['prompt'] as string;
  if (raw['model'] !== undefined) seal.model = raw['model'] as string;
  if (raw['evaluation'] !== undefined) seal.evaluation = raw['evaluation'] as SessionEvaluation;
  return seal;
}

function toMilestone(raw: Record<string, unknown>): Milestone {
  const m: Milestone = {
    id: raw['id'] as string,
    session_id: raw['promptId'] as string,
    title: raw['title'] as string,
    category: raw['category'] as string,
    complexity: (raw['complexity'] as string) ?? 'medium',
    duration_minutes: (raw['durationMinutes'] as number) ?? 0,
    languages: (raw['languages'] as string[]) ?? [],
    client: raw['client'] as string,
    created_at: raw['createdAt'] as string,
    published: false,
    published_at: null,
    chain_hash: (raw['chainHash'] as string) ?? '',
  };
  if (raw['privateTitle'] !== undefined) m.private_title = raw['privateTitle'] as string;
  if (raw['project'] !== undefined) m.project = raw['project'] as string;
  return m;
}

// ── Endpoints ────────────────────────────────────────────────────────────────

export async function fetchSessions(days = 7): Promise<SessionSeal[]> {
  const res = await get<{ ok: boolean; data: { sessions: Record<string, unknown>[] } }>(`/sessions?days=${days}`);
  return (res.data?.sessions ?? []).map(toSessionSeal);
}

export async function fetchMilestones(days = 7): Promise<Milestone[]> {
  const res = await get<{ ok: boolean; data: { milestones: Record<string, unknown>[] } }>(`/sessions/milestones?days=${days}`);
  return (res.data?.milestones ?? []).map(toMilestone);
}

export async function fetchHealth(): Promise<HealthInfo> {
  const res = await fetch('/health');
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const raw = await res.json() as Record<string, unknown>;
  return {
    status: raw['status'] as string,
    version: raw['version'] as string,
    active_sessions: (raw['activeSessions'] as number) ?? 0,
    mcp_connections: (raw['mcpConnections'] as number) ?? 0,
    uptime_seconds: (raw['uptimeSeconds'] as number) ?? 0,
  };
}

export function deleteSession(sessionId: string): Promise<unknown> {
  return del(`/sessions/${encodeURIComponent(sessionId)}`);
}

export function deleteConversation(conversationId: string): Promise<unknown> {
  return del(`/conversations/${encodeURIComponent(conversationId)}`);
}

export function deleteMilestone(milestoneId: string): Promise<unknown> {
  return del(`/milestones/${encodeURIComponent(milestoneId)}`);
}

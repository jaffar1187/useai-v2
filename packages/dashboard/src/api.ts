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
    session_id: raw['sessionId'] as string,
    client: raw['client'] as string,
    task_type: raw['taskType'] as string,
    languages: (raw['languages'] as string[]) ?? [],
    files_touched: (raw['filesTouched'] as number) ?? 0,
    started_at: raw['startedAt'] as string,
    ended_at: raw['endedAt'] as string,
    duration_seconds: (raw['durationMs'] as number) / 1000,
    heartbeat_count: (raw['heartbeatCount'] as number) ?? 0,
    record_count: (raw['recordCount'] as number) ?? 0,
    chain_start_hash: (raw['chainStartHash'] as string) ?? '',
    chain_end_hash: (raw['chainEndHash'] as string) ?? '',
    seal_signature: (raw['sealSignature'] as string) ?? '',
  };
  if (raw['conversationId'] !== undefined) seal.conversation_id = raw['conversationId'] as string;
  if (raw['conversationIndex'] !== undefined) seal.conversation_index = raw['conversationIndex'] as number;
  if (raw['project'] !== undefined) seal.project = raw['project'] as string;
  if (raw['title'] !== undefined) seal.title = raw['title'] as string;
  if (raw['prompt'] !== undefined) seal.prompt = raw['prompt'] as string;
  if (raw['promptWordCount'] !== undefined) seal.prompt_word_count = raw['promptWordCount'] as number;
  if (raw['model'] !== undefined) seal.model = raw['model'] as string;
  if (raw['evaluation'] !== undefined) seal.evaluation = raw['evaluation'] as SessionEvaluation;
  return seal;
}

function toMilestone(raw: Record<string, unknown>): Milestone {
  const m: Milestone = {
    id: raw['id'] as string,
    session_id: raw['sessionId'] as string,
    title: raw['title'] as string,
    category: raw['category'] as string,
    complexity: raw['complexity'] as string,
    duration_minutes: (raw['durationMinutes'] as number) ?? 0,
    languages: (raw['languages'] as string[]) ?? [],
    client: raw['client'] as string,
    created_at: raw['createdAt'] as string,
    published: (raw['published'] as boolean) ?? false,
    published_at: (raw['publishedAt'] as string | null) ?? null,
    chain_hash: (raw['chainHash'] as string) ?? '',
  };
  if (raw['privateTitle'] !== undefined) m.private_title = raw['privateTitle'] as string;
  if (raw['project'] !== undefined) m.project = raw['project'] as string;
  return m;
}

// ── Endpoints ────────────────────────────────────────────────────────────────

export async function fetchSessions(): Promise<SessionSeal[]> {
  const raw = await get<Record<string, unknown>[]>('/sessions');
  return raw.map(toSessionSeal);
}

export async function fetchMilestones(): Promise<Milestone[]> {
  const raw = await get<Record<string, unknown>[]>('/milestones');
  return raw.map(toMilestone);
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

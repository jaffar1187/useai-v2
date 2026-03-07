export interface SessionEvaluation {
  prompt_quality: number;
  prompt_quality_reason?: string;
  context_provided: number;
  context_provided_reason?: string;
  task_outcome: 'completed' | 'partial' | 'abandoned' | 'blocked';
  task_outcome_reason?: string;
  iteration_count: number;
  independence_level: number;
  independence_level_reason?: string;
  scope_quality: number;
  scope_quality_reason?: string;
  tools_leveraged: number;
}

export interface SessionSeal {
  session_id: string;
  conversation_id?: string;
  client: string;
  task_type: string;
  languages: string[];
  files_touched: number;
  project?: string;
  title?: string;
  private_title?: string;
  prompt?: string;
  prompt_word_count?: number;
  model?: string;
  evaluation?: SessionEvaluation;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  heartbeat_count: number;
  record_count: number;
  chain_start_hash: string;
  chain_end_hash: string;
  seal_signature: string;
}

export interface Milestone {
  id: string;
  session_id: string;
  title: string;
  private_title?: string;
  project?: string;
  category: string;
  complexity: string;
  duration_minutes: number;
  languages: string[];
  client: string;
  created_at: string;
  published: boolean;
  published_at: string | null;
  chain_hash: string;
}

export interface LocalConfig {
  authenticated: boolean;
  email: string | null;
  username: string | null;
  last_sync_at: string | null;
  auto_sync: boolean;
}

export interface HealthInfo {
  status: string;
  version: string;
  active_sessions: number;
  mcp_connections: number;
  uptime_seconds: number;
}

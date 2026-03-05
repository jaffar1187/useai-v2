import { z } from "zod";

export const TaskTypeSchema = z.enum([
  "feature",
  "bugfix",
  "refactor",
  "test",
  "docs",
  "devops",
  "exploration",
  "other",
]);
export type TaskType = z.infer<typeof TaskTypeSchema>;

export const SessionStatusSchema = z.enum(["active", "sealed", "abandoned"]);
export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export interface Session {
  id: string;
  client: string;
  taskType: TaskType;
  title: string;
  privateTitle?: string;
  startedAt: string;
  endedAt?: string;
  durationMs: number;
  status: SessionStatus;
  score?: SessionScore;
  milestones: string[];
  metadata: Record<string, unknown>;
}

export interface SessionScore {
  overall: number;
  components: Record<string, number>;
  framework: string;
}

export interface Milestone {
  id: string;
  sessionId: string;
  type: string;
  label: string;
  achievedAt: string;
}

import { randomUUID } from "node:crypto";

/** Idle gap threshold: gaps longer than this between heartbeats are counted as idle time. */
export const IDLE_GAP_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export interface PromptContext {
  promptId: string;
  connectionId: string;
  prevHash: string;
  startedAt: Date | null;
  /** Timestamp (ms) of the last heartbeat call. Null if no heartbeat has fired yet. */
  lastActivityTime: number | null;
  /** Accumulated idle ms detected via heartbeat gaps. */
  idleMs: number;
  client: string;
  taskType: string;
  title: string | null;
  privateTitle: string | null;
  project: string | null;
  model: string | null;
  prompt: string | null;
  promptImages: Array<{ type: "image"; description: string }> | null;
}

export function createPromptContext(): PromptContext {
  return {
    promptId: `prompt_${randomUUID()}`,
    connectionId: "",
    prevHash: "0".repeat(64),
    startedAt: null,
    lastActivityTime: null,
    idleMs: 0,
    client: "",
    taskType: "",
    title: null,
    privateTitle: null,
    project: null,
    model: null,
    prompt: null,
    promptImages: null,
  };
}

/**
 * Record activity at the given timestamp (defaults to now).
 * If the gap since the last activity exceeds the idle threshold, the gap is
 * accumulated as idle time. Used by both the heartbeat tool and useai_end.
 */
export function touchActivity(
  ctx: PromptContext,
  now: number = Date.now(),
): void {
  const baseline = ctx.lastActivityTime ?? ctx.startedAt?.getTime() ?? null;
  if (baseline !== null) {
    const gap = now - baseline;
    if (gap > IDLE_GAP_THRESHOLD_MS) {
      ctx.idleMs += gap;
    }
  }
  ctx.lastActivityTime = now;
}

/**
 * Compute honest active duration, excluding idle gaps detected via heartbeat.
 * Falls back to wall-clock duration if no heartbeat was ever called.
 */
export function getActiveDurationMs(
  startedAt: Date,
  lastActivityTime: number | null,
  idleMs: number,
): number {
  if (!lastActivityTime) {
    lastActivityTime = 0;
  }
  return Math.max(0, lastActivityTime - startedAt.getTime() - idleMs);
}

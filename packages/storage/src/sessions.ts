import { join } from "node:path";
import { rename, readFile, readdir } from "node:fs/promises";
import type { Session, Milestone, ChainRecord } from "@useai/types";
import {
  ACTIVE_DIR,
  SEALED_DIR,
  SESSIONS_FILE,
  MILESTONES_FILE,
} from "./paths.js";
import { readJson, writeJson, appendLine, ensureDir } from "./fs.js";

export async function getActiveChainPath(sessionId: string): Promise<string> {
  return join(ACTIVE_DIR, `${sessionId}.jsonl`);
}

export async function getSealedChainPath(sessionId: string): Promise<string> {
  return join(SEALED_DIR, `${sessionId}.jsonl`);
}

export async function appendChainRecord(
  sessionId: string,
  record: ChainRecord,
): Promise<void> {
  const path = await getActiveChainPath(sessionId);
  await appendLine(path, JSON.stringify(record));
}

export async function sealSession(sessionId: string): Promise<void> {
  await ensureDir(SEALED_DIR);
  const from = await getActiveChainPath(sessionId);
  const to = await getSealedChainPath(sessionId);
  await rename(from, to);
}

export async function readChainFile(path: string): Promise<ChainRecord[]> {
  try {
    const raw = await readFile(path, "utf-8");
    return raw
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as ChainRecord);
  } catch {
    return [];
  }
}

export async function listActiveSessions(): Promise<string[]> {
  try {
    const files = await readdir(ACTIVE_DIR);
    return files
      .filter((f) => f.endsWith(".jsonl"))
      .map((f) => f.replace(".jsonl", ""));
  } catch {
    return [];
  }
}

export async function getAllSessions(): Promise<Session[]> {
  return (await readJson<Session[]>(SESSIONS_FILE)) ?? [];
}

export async function saveSession(session: Session): Promise<void> {
  const sessions = await getAllSessions();
  const idx = sessions.findIndex((s) => s.sessionId === session.sessionId);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.push(session);
  }
  await writeJson(SESSIONS_FILE, sessions);
}

export async function deleteSession(sessionId: string): Promise<void> {
  const sessions = await getAllSessions();
  const filtered = sessions.filter((s) => s.sessionId !== sessionId);
  await writeJson(SESSIONS_FILE, filtered);
}

export async function getAllMilestones(): Promise<Milestone[]> {
  return (await readJson<Milestone[]>(MILESTONES_FILE)) ?? [];
}

export async function saveMilestone(milestone: Milestone): Promise<void> {
  const milestones = await getAllMilestones();
  milestones.push(milestone);
  await writeJson(MILESTONES_FILE, milestones);
}

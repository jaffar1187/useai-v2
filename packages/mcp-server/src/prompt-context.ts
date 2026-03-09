import { randomUUID } from "node:crypto";

export interface PromptContext {
  promptId: string;
  connectionId: string;
  prevHash: string;
  startedAt: Date | null;
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

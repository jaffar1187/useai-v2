import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SessionState } from "./session-state.js";
import { sealSession, saveSession } from "@useai/storage";
import { computeSpaceScore } from "@useai/scoring";

/**
 * Register the 3 MCP tools on a server instance.
 * Each server gets its own SessionState (supports multi-session daemon).
 */
export function registerTools(
  server: McpServer,
  getSession: () => SessionState,
): void {
  server.tool(
    "useai_start",
    "Start tracking an AI coding session",
    {
      client: z.string().describe("Name of the AI tool being used"),
      taskType: z.string().optional().describe("Type of task: feature, bugfix, refactor, etc."),
      title: z.string().optional().describe("Short description of the task"),
    },
    async ({ client, taskType, title }) => {
      const session = getSession();
      session.setClient(client);
      session.markStarted();

      await session.writeRecord("session_start", {
        client,
        taskType: taskType ?? "other",
        title: title ?? "",
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Session ${session.sessionId} started. Call useai_end when done.`,
          },
        ],
      };
    },
  );

  server.tool(
    "useai_heartbeat",
    "Keep-alive for long running sessions",
    {},
    async () => {
      const session = getSession();
      await session.writeRecord("heartbeat", {});

      return {
        content: [
          { type: "text" as const, text: "Heartbeat recorded." },
        ],
      };
    },
  );

  server.tool(
    "useai_end",
    "End the current AI coding session",
    {
      completedSuccessfully: z.boolean().optional().describe("Whether the task was completed"),
      summary: z.string().optional().describe("Brief summary of what was done"),
    },
    async ({ completedSuccessfully, summary }) => {
      const session = getSession();
      const startedAt = session.startedAt ?? new Date();
      const endedAt = new Date();
      const durationMs = endedAt.getTime() - startedAt.getTime();

      const score = computeSpaceScore({
        durationMs,
        taskType: "other",
        completedSuccessfully: completedSuccessfully ?? true,
      });

      await session.writeRecord("session_end", {
        summary: summary ?? "",
        completedSuccessfully: completedSuccessfully ?? true,
        durationMs,
      });

      await session.writeRecord("session_seal", { score });

      await sealSession(session.sessionId);

      await saveSession({
        id: session.sessionId,
        client: session.client,
        taskType: "other",
        title: summary ?? "",
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
        durationMs,
        status: "sealed",
        score,
        milestones: [],
        metadata: {},
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Session ${session.sessionId} sealed. Duration: ${Math.round(durationMs / 60000)}min, Score: ${Math.round(score.overall * 100)}%`,
          },
        ],
      };
    },
  );
}

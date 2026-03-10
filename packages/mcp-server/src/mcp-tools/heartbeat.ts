import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { PromptContext } from "../prompt-context.js";
import { touchActivity } from "../prompt-context.js";

export function registerHeartbeatTool(
  server: McpServer,
  ctx: PromptContext,
): void {
  server.registerTool(
    "useai_heartbeat",
    {
      description:
        "Keep-alive signal for active sessions. Call every 4-4.5 minutes while actively working. " +
        "Gaps longer than 5 minutes between heartbeats are automatically counted as idle time " +
        "and excluded from the active session duration.",
    },
    async () => {
      if (!ctx.startedAt) {
        return {
          content: [
            {
              type: "text" as const,
              text: "No active session. Call useai_start first.",
            },
          ],
        };
      }

      const now = Date.now();
      touchActivity(ctx, now);

      const activeDurationMs = Math.max(
        0,
        now - ctx.startedAt.getTime() - ctx.idleMs,
      );
      const activeDurationMin = Math.round(activeDurationMs / 60000);

      return {
        content: [
          {
            type: "text" as const,
            text: `Heartbeat recorded. Active Duration: ${activeDurationMin}min.`,
          },
        ],
      };
    },
  );
}

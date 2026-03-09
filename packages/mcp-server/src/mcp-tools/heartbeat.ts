import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { PromptContext } from "../prompt-context.js";

export function registerHeartbeatTool(
  server: McpServer,
  ctx: PromptContext,
): void {
  server.registerTool(
    "useai_heartbeat",
    {
      description:
        "Keep-alive for long running sessions. Call periodically during long conversations (every 5 minutes).",
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

      const elapsedMs = Date.now() - ctx.startedAt.getTime();
      const elapsedMin = Math.round(elapsedMs / 60000);

      return {
        content: [
          {
            type: "text" as const,
            text: `Heartbeat recorded for session ${ctx.promptId}. Elapsed: ${elapsedMin}min.`,
          },
        ],
      };
    },
  );
}

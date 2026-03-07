import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { PromptContext } from "../prompt-context.js";

export function registerHeartbeatTool(
  server: McpServer,
  _ctx: PromptContext,
): void {
  server.registerTool(
    "useai_heartbeat",
    {
      description:
        "Keep-alive for long running sessions. Call periodically during long conversations (every 10-15 minutes).",
    },
    async () => {
      return {
        content: [{ type: "text" as const, text: "Heartbeat recorded." }],
      };
    },
  );
}

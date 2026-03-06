import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SessionState } from "../session-state.js";

export function registerHeartbeatTool(
  server: McpServer,
  getSession: () => SessionState,
): void {
  server.registerTool(
    "useai_heartbeat",
    {
      description:
        "Keep-alive for long running sessions. Call periodically during long conversations (every 10-15 minutes).",
    },
    async () => {
      const session = getSession();
      await session.writeRecord("heartbeat", {});

      return {
        content: [{ type: "text" as const, text: "Heartbeat recorded." }],
      };
    },
  );
}

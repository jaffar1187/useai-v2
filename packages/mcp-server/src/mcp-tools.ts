import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SessionState } from "./session-state.js";
import { registerStartTool } from "./mcp-tools/start.js";
import { registerHeartbeatTool } from "./mcp-tools/heartbeat.js";
import { registerEndTool } from "./mcp-tools/end.js";

export function registerTools(
  server: McpServer,
  getSession: () => SessionState,
): void {
  registerStartTool(server, getSession);
  registerHeartbeatTool(server, getSession);
  registerEndTool(server, getSession);
}

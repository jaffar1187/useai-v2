import type { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SessionState } from "@useai/mcp-server";

export interface ActiveSession {
  transport: WebStandardStreamableHTTPServerTransport;
  mcpServer: McpServer;
  sessionState: SessionState;
  lastActivity: number;
}

//Mutable map, used to store active sessions
export const sessions = new Map<string, ActiveSession>();

export function sweepOrphanSessions(maxAgeMs: number = 15 * 60 * 1000): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [id, session] of sessions) {
    if (now - session.lastActivity > maxAgeMs) {
      session.transport.close();
      sessions.delete(id);
      cleaned++;
    }
  }

  return cleaned;
}

export function getActiveSessionCount(): number {
  return sessions.size;
}

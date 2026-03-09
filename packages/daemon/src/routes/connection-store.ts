import type { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { PromptContext } from "@useai/mcp-server";

export interface Connection {
  transport: WebStandardStreamableHTTPServerTransport;
  mcpServer: McpServer;
  promptContext: PromptContext;
  lastActivity: number;
}

// Keyed by connectionId (the MCP transport session ID)
export const connections = new Map<string, Connection>();

export function sweepStaleConnections(maxAgeMs: number = 0): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [id, conn] of connections) {
    // Never sweep a connection that has an active prompt in progress
    if (conn.promptContext.startedAt !== null) continue;
    if (now - conn.lastActivity > maxAgeMs) {
      conn.transport.close();
      connections.delete(id);
      cleaned++;
    }
  }

  return cleaned;
}

export function getConnectionCount(): number {
  return connections.size;
}

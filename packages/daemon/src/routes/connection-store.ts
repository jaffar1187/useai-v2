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

export function sweepStaleConnections(maxAgeMs: number = 15 * 60 * 1000): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [id, conn] of connections) {
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

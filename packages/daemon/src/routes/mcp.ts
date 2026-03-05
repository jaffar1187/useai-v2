import { Hono } from "hono";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { registerTools, SessionState } from "@useai/mcp-server";

interface ActiveSession {
  transport: WebStandardStreamableHTTPServerTransport;
  mcpServer: McpServer;
  sessionState: SessionState;
  lastActivity: number;
}

const sessions = new Map<string, ActiveSession>();

export const mcpRoutes = new Hono();

mcpRoutes.all("/", async (c) => {
  const sessionId = c.req.header("mcp-session-id");

  // Existing session — route to its transport
  if (sessionId && sessions.has(sessionId)) {
    const active = sessions.get(sessionId)!;
    active.lastActivity = Date.now();
    const response = await active.transport.handleRequest(c.req.raw);
    return response;
  }

  // DELETE for unknown session
  if (c.req.method === "DELETE" && sessionId) {
    return c.json({ error: "Session not found" }, 404);
  }

  // New session — create transport, MCP server, and session state
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized: (id) => {
      sessions.set(id, {
        transport,
        mcpServer: server,
        sessionState,
        lastActivity: Date.now(),
      });
    },
    onsessionclosed: (id) => {
      sessions.delete(id);
    },
  });

  const sessionState = new SessionState();

  const server = new McpServer({
    name: "useai",
    version: "0.1.0",
  });

  registerTools(server, () => sessionState);

  await server.connect(transport);

  const response = await transport.handleRequest(c.req.raw);
  return response;
});

// Cleanup orphaned sessions (called periodically)
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

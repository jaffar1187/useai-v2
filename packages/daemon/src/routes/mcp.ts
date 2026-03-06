import { Hono } from "hono";
import { sessions } from "./session-store.js";
import { createMcpSession } from "./session-factory.js";

export { sweepOrphanSessions, getActiveSessionCount } from "./session-store.js";

export const mcpRoutes = new Hono();

mcpRoutes.all("/", async (c) => {
  const sessionId = c.req.header("mcp-session-id");

  // Existing session — route to its transport
  if (sessionId && sessions.has(sessionId)) {
    const active = sessions.get(sessionId)!;
    active.lastActivity = Date.now();
    return active.transport.handleRequest(c.req.raw);
  }

  // DELETE for unknown session
  if (c.req.method === "DELETE" && sessionId) {
    return c.json({ error: "Session not found" }, 404);
  }

  // New session
  const transport = await createMcpSession();
  return transport.handleRequest(c.req.raw);
});

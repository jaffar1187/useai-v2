import { Hono } from "hono";
import { connections } from "./connection-store.js";
import { createMcpConnection } from "./connection-factory.js";

export {
  sweepStaleConnections,
  getConnectionCount,
} from "./connection-store.js";

export const mcpRoutes = new Hono();

mcpRoutes.all("/", async (c) => {
  const connectionId = c.req.header("mcp-session-id");

  if (connectionId && connections.has(connectionId)) {
    const conn = connections.get(connectionId)!;
    conn.lastActivity = Date.now();
    return conn.transport.handleRequest(c.req.raw);
  }

  if (c.req.method === "DELETE" && connectionId) {
    return c.json({ error: "Session not found" }, 404);
  }

  const transport = await createMcpConnection();
  return transport.handleRequest(c.req.raw);
});

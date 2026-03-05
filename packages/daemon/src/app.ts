import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { sessionsRoutes } from "./routes/sessions.js";
import { statsRoutes } from "./routes/stats.js";
import { configRoutes } from "./routes/config.js";
import { healthRoutes } from "./routes/health.js";
import { mcpRoutes, sweepOrphanSessions } from "./routes/mcp.js";
import { ensureDir } from "@useai/storage";
import { ACTIVE_DIR, SEALED_DIR, DAEMON_PORT, DAEMON_HOST } from "@useai/storage/paths";

export function createApp(): Hono {
  const app = new Hono();

  app.use("/*", cors({ origin: "*" }));

  // MCP transport endpoint (must be before CORS for SSE)
  app.route("/mcp", mcpRoutes);

  // REST API routes
  app.route("/api/local/sessions", sessionsRoutes);
  app.route("/api/local/stats", statsRoutes);
  app.route("/api/local/config", configRoutes);
  app.route("/", healthRoutes);

  return app;
}

export async function initDataDirs(): Promise<void> {
  await ensureDir(ACTIVE_DIR);
  await ensureDir(SEALED_DIR);
}

export function startOrphanSweep(intervalMs: number = 15 * 60 * 1000): NodeJS.Timeout {
  return setInterval(() => {
    const cleaned = sweepOrphanSessions();
    if (cleaned > 0) {
      console.log(`Swept ${cleaned} orphan session(s)`);
    }
  }, intervalMs);
}

export async function startDaemon(): Promise<void> {
  await initDataDirs();

  const app = createApp();

  serve(
    { fetch: app.fetch, port: DAEMON_PORT, hostname: DAEMON_HOST },
    (info) => {
      console.log(`useai daemon running at http://${info.address}:${info.port}`);
      console.log(`MCP endpoint: http://${info.address}:${info.port}/mcp`);
      console.log(`Dashboard API: http://${info.address}:${info.port}/api/local/`);
    },
  );

  startOrphanSweep();
}

// Run directly
startDaemon();

import { serve } from "@hono/node-server";
import { createApp } from "./router.js";
import { sweepOrphanSessions } from "./routes/mcp.js";
import { ensureDir } from "@useai/storage";
import { ACTIVE_DIR, SEALED_DIR, DAEMON_PORT, DAEMON_HOST } from "@useai/storage/paths";

export async function initDataDirs(): Promise<void> {
  await ensureDir(ACTIVE_DIR);
  await ensureDir(SEALED_DIR);
}

export function startOrphanSweep(intervalMs: number): NodeJS.Timeout {
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
      console.log(`useai daemon running at ${info.address}:${info.port}`);
      console.log(`MCP endpoint: ${info.address}:${info.port}/mcp`);
      console.log(`Dashboard API: ${info.address}:${info.port}/api/local/`);
    },
  );

  startOrphanSweep(15 * 60 * 1000);
}

// Run directly
startDaemon();

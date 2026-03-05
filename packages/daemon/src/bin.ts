import { serve } from "@hono/node-server";
import { createApp, initDataDirs, startOrphanSweep } from "./app.js";
import { DAEMON_PORT, DAEMON_HOST } from "@useai/storage/paths";

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

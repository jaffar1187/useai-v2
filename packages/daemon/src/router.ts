import { Hono } from "hono";
import { cors } from "hono/cors";
import { sessionsRoutes } from "./routes/sessions.js";
import { statsRoutes } from "./routes/stats.js";
import { configRoutes } from "./routes/config.js";
import { healthRoutes } from "./routes/health.js";
import { mcpRoutes } from "./routes/mcp.js";

export function createApp(): Hono {
  const app = new Hono();

  //This is for dashboard API calls, As it runs in browser.
  app.use("/*", cors({ origin: "*" }));

  app.route("/mcp", mcpRoutes);
  app.route("/api/local/sessions", sessionsRoutes);
  app.route("/api/local/stats", statsRoutes);
  app.route("/api/local/config", configRoutes);
  app.route("/", healthRoutes);

  return app;
}

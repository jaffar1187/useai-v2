import { Hono } from "hono";
import type { HealthResponse } from "@useai/types";
import { getActiveSessionCount } from "./mcp.js";

const startTime = Date.now();

export const healthRoutes = new Hono();

healthRoutes.get("/health", (c) => {
  const response: HealthResponse = {
    status: "ok",
    version: "0.1.0",
    uptime: Date.now() - startTime,
    activeSessions: getActiveSessionCount(),
  };

  return c.json(response);
});

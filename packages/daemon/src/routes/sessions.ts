import { Hono } from "hono";
import {
  getAllSessions,
  getAllMilestones,
  deleteSession,
} from "@useai/storage";

export const sessionsRoutes = new Hono();

sessionsRoutes.get("/", async (c) => {
  const sessions = await getAllSessions();
  return c.json({ ok: true, data: { sessions, total: sessions.length } });
});

sessionsRoutes.get("/milestones", async (c) => {
  const milestones = await getAllMilestones();
  return c.json({ ok: true, data: { milestones } });
});

sessionsRoutes.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await deleteSession(id);
  return c.json({ ok: true });
});

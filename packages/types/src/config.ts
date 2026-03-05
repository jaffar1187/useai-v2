import { z } from "zod";

export const UseaiConfigSchema = z.object({
  version: z.number().default(2),
  evaluation: z.object({
    framework: z.string().default("space"),
    capturePrompts: z.boolean().default(false),
    reasonsLevel: z.enum(["none", "summary", "detailed"]).default("summary"),
  }).default({}),
  sync: z.object({
    enabled: z.boolean().default(false),
    autoSync: z.boolean().default(false),
    intervalMinutes: z.number().default(30),
  }).default({}),
  daemon: z.object({
    port: z.number().default(19200),
    idleTimeoutMinutes: z.number().default(30),
    orphanSweepMinutes: z.number().default(15),
  }).default({}),
});

export type UseaiConfig = z.infer<typeof UseaiConfigSchema>;

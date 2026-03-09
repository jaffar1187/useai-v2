import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { buildSessionRecord } from "@useai/crypto";
import { appendSession, getOrCreateKeystore } from "@useai/storage";
import { computeSpaceScore } from "@useai/scoring";
import { TaskTypeSchema, MilestoneCategorySchema, ComplexitySchema } from "@useai/types";
import type { SessionEvaluation, Milestone, Session } from "@useai/types";
import type { PromptContext } from "../prompt-context.js";
import { coerceJsonString } from "./coerce.js";

let privateKey: Buffer | null = null;
async function getPrivateKey(): Promise<Buffer> {
  if (!privateKey) {
    const ks = await getOrCreateKeystore();
    privateKey = ks.privateKey;
  }
  return privateKey;
}

export function registerEndTool(
  server: McpServer,
  ctx: PromptContext,
): void {
  server.registerTool(
    "useai_end",
    {
      description:
        "End the current AI coding session and record milestones. " +
        'Each milestone needs a "title" (generic, no project/file names) and "category". ' +
        "category must be one of: feature, bugfix, refactor, test, docs, setup, deployment, fix, testing, " +
        "documentation, config, analysis, research, investigation, performance, cleanup, chore, security, " +
        "migration, design, devops, other. " +
        'Also provide an "evaluation" object assessing the session: prompt_quality (1-5), context_provided (1-5), ' +
        "task_outcome (completed/partial/abandoned/blocked), iteration_count, independence_level (1-5), " +
        "scope_quality (1-5), and tools_leveraged count. For every scored metric, provide a *_reason field.",
      inputSchema: {
        task_type: TaskTypeSchema.optional().describe(
          "What kind of task was the developer working on?",
        ),
        languages: coerceJsonString(z.array(z.string()))
          .optional()
          .describe('Programming languages used (e.g. ["typescript", "python"])'),
        files_touched_count: coerceJsonString(z.number())
          .optional()
          .describe("Approximate number of files created or modified"),
        milestones: coerceJsonString(
          z.array(
            z.object({
              title: z.string().describe('Generic description — no project names, file paths, or identifying details.'),
              private_title: z.string().optional().describe("Detailed description for private records."),
              category: MilestoneCategorySchema.describe("Type of work: feature, bugfix, refactor, etc."),
              complexity: ComplexitySchema.optional().describe("simple, medium, or complex. Defaults to medium."),
            }),
          ),
        )
          .optional()
          .describe("Array of milestones accomplished in this session."),
        evaluation: coerceJsonString(
          z.object({
            prompt_quality: z.number().min(1).max(5),
            prompt_quality_reason: z.string().optional(),
            context_provided: z.number().min(1).max(5),
            context_provided_reason: z.string().optional(),
            task_outcome: z.enum(["completed", "partial", "abandoned", "blocked"]),
            task_outcome_reason: z.string().optional(),
            iteration_count: z.number().min(1),
            independence_level: z.number().min(1).max(5),
            independence_level_reason: z.string().optional(),
            scope_quality: z.number().min(1).max(5),
            scope_quality_reason: z.string().optional(),
            tools_leveraged: z.number().min(0),
          }),
        )
          .optional()
          .describe("AI-assessed evaluation of this session."),
      },
    },
    async ({ task_type, languages, files_touched_count, milestones: milestonesInput, evaluation }) => {
      if (!ctx.startedAt) {
        return {
          content: [{ type: "text" as const, text: "No active session. Call useai_start first." }],
        };
      }
      const startedAt = ctx.startedAt;
      const endedAt = new Date();
      const durationMs = endedAt.getTime() - startedAt.getTime();
      const sessionEval = evaluation as SessionEvaluation | undefined;

      const score = computeSpaceScore({
        durationMs,
        taskType: task_type ?? ctx.taskType,
        ...(sessionEval && { evaluation: sessionEval }),
      });

      const milestones: Milestone[] = (milestonesInput ?? []).map((m) => ({
        id: `mil_${randomUUID()}`,
        title: m.title,
        category: m.category,
        ...(m.private_title && { privateTitle: m.private_title }),
        ...(m.complexity && { complexity: m.complexity }),
      }));

      const sessionData: Omit<Session, "hash" | "signature"> = {
        promptId: ctx.promptId,
        connectionId: ctx.connectionId,
        prevHash: ctx.prevHash,
        client: ctx.client,
        taskType: task_type ?? ctx.taskType,
        title: ctx.title ?? "",
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
        durationMs,
        score,
        milestones,
        languages: languages ?? [],
        ...(ctx.privateTitle && { privateTitle: ctx.privateTitle }),
        ...(ctx.project && { project: ctx.project }),
        ...(ctx.model && { model: ctx.model }),
        ...(ctx.prompt && { prompt: ctx.prompt }),
        ...(files_touched_count !== undefined && { filesTouchedCount: files_touched_count }),
        ...(sessionEval && { evaluation: sessionEval }),
      };

      const key = await getPrivateKey();
      const { hash, signature } = buildSessionRecord(sessionData, key);
      const fullSession: Session = { ...sessionData, hash, signature };

      await appendSession(fullSession);
      ctx.prevHash = hash;
      ctx.startedAt = null;

      return {
        content: [
          {
            type: "text" as const,
            text: `Session ${ctx.promptId} sealed. Duration: ${Math.round(durationMs / 60000)}min, Score: ${Math.round(score.overall * 100)}%`,
          },
        ],
      };
    },
  );
}

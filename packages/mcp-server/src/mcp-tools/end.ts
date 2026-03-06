import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { sealSession, saveSession, saveMilestone } from "@useai/storage";
import { computeSpaceScore } from "@useai/scoring";
import { TaskTypeSchema, MilestoneCategorySchema, ComplexitySchema } from "@useai/types";
import type { SessionEvaluation, Milestone } from "@useai/types";
import type { SessionState } from "../session-state.js";
import { coerceJsonString } from "./coerce.js";

export function registerEndTool(
  server: McpServer,
  getSession: () => SessionState,
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
              title: z
                .string()
                .describe('Generic description — no project names, file paths, or identifying details. Example: "Implemented user authentication"'),
              private_title: z
                .string()
                .optional()
                .describe("Detailed description for private records. Can include project names and specifics."),
              category: MilestoneCategorySchema.describe(
                "Type of work: feature, bugfix, refactor, test, docs, investigation, etc.",
              ),
              complexity: ComplexitySchema.optional().describe(
                "simple, medium, or complex. Defaults to medium.",
              ),
            }),
          ),
        )
          .optional()
          .describe("Array of milestones accomplished in this session."),
        evaluation: coerceJsonString(
          z.object({
            prompt_quality: z.number().min(1).max(5).describe(
              "How clear and specific was the initial prompt? 1=vague, 5=crystal clear with acceptance criteria",
            ),
            prompt_quality_reason: z.string().optional().describe(
              "Always provide. Explain the score and how the user could improve.",
            ),
            context_provided: z.number().min(1).max(5).describe(
              "Did the user provide relevant context? 1=no context, 5=comprehensive context",
            ),
            context_provided_reason: z.string().optional().describe(
              "Always provide. Explain what context was given or missing.",
            ),
            task_outcome: z
              .enum(["completed", "partial", "abandoned", "blocked"])
              .describe("Was the primary task achieved?"),
            task_outcome_reason: z.string().optional().describe(
              "Always provide. Explain the outcome or what blocked progress.",
            ),
            iteration_count: z.number().min(1).describe("Number of user-to-AI turns in this session"),
            independence_level: z.number().min(1).max(5).describe(
              "How self-directed was the user? 1=needed constant guidance, 5=gave clear spec and let AI execute",
            ),
            independence_level_reason: z.string().optional().describe(
              "Always provide. Explain the level of autonomy.",
            ),
            scope_quality: z.number().min(1).max(5).describe(
              "Was the task well-scoped? 1=vague or impossibly broad, 5=precise and achievable",
            ),
            scope_quality_reason: z.string().optional().describe(
              "Always provide. Explain what was well-defined or too broad.",
            ),
            tools_leveraged: z.number().min(0).describe(
              "Count of distinct AI capabilities used (code gen, debugging, testing, docs, etc.)",
            ),
          }),
        )
          .optional()
          .describe("AI-assessed evaluation of this session. Score honestly based on the actual interaction."),
      },
    },
    async ({ task_type, languages, files_touched_count, milestones: milestonesInput, evaluation }) => {
      const session = getSession();
      const startedAt = session.startedAt ?? new Date();
      const endedAt = new Date();
      const durationMs = endedAt.getTime() - startedAt.getTime();

      // Cast Zod's inferred type to SessionEvaluation (structurally identical, exactOptionalPropertyTypes compat)
      const sessionEval = evaluation as SessionEvaluation | undefined;

      const score = computeSpaceScore({
        durationMs,
        taskType: task_type ?? session.taskType,
        ...(sessionEval && { evaluation: sessionEval }),
      });

      await session.writeRecord("session_end", {
        task_type: task_type ?? session.taskType,
        languages: languages ?? [],
        files_touched_count: files_touched_count ?? 0,
        durationMs,
        evaluation,
      });

      await session.writeRecord("session_seal", { score });

      await sealSession(session.sessionId);

      const now = endedAt.toISOString();
      const savedMilestones: Milestone[] = [];
      for (const m of milestonesInput ?? []) {
        const milestone: Milestone = {
          id: `mil_${randomUUID()}`,
          sessionId: session.sessionId,
          title: m.title,
          category: m.category,
          achievedAt: now,
          ...(m.private_title && { privateTitle: m.private_title }),
          ...(m.complexity && { complexity: m.complexity }),
        };
        await saveMilestone(milestone);
        savedMilestones.push(milestone);
      }

      await saveSession({
        sessionId: session.sessionId,
        client: session.client,
        taskType: task_type ?? session.taskType,
        title: session.title ?? "",
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
        durationMs,
        status: "sealed",
        score,
        milestones: savedMilestones,
        languages: languages ?? [],
        metadata: {},
        ...(session.privateTitle && { privateTitle: session.privateTitle }),
        ...(session.project && { project: session.project }),
        ...(session.model && { model: session.model }),
        ...(files_touched_count !== undefined && { filesTouchedCount: files_touched_count }),
        ...(sessionEval && { evaluation: sessionEval }),
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Session ${session.sessionId} sealed. Duration: ${Math.round(durationMs / 60000)}min, Score: ${Math.round(score.overall * 100)}%`,
          },
        ],
      };
    },
  );
}

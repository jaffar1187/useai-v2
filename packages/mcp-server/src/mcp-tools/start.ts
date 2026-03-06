import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TaskTypeSchema } from "@useai/types";
import type { SessionState } from "../session-state.js";
import { coerceJsonString } from "./coerce.js";

export function registerStartTool(
  server: McpServer,
  getSession: () => SessionState,
): void {
  server.registerTool(
    "useai_start",
    {
      description:
        "Start tracking an AI coding session. Call this at the beginning of every response to a real user message. " +
        'Generate a session title from the user\'s prompt: a generic public "title" (no project/file names) ' +
        'and a detailed "private_title" (can include specifics). ' +
        "task_type must be one of: coding, debugging, testing, planning, reviewing, documenting, learning, " +
        "deployment, devops, research, migration, design, data, security, configuration, code_review, " +
        "investigation, infrastructure, analysis, ops, setup, refactoring, other.",
      inputSchema: {
        client: z
          .string()
          .optional()
          .describe("Name of the AI tool being used (e.g. claude-code, cursor, windsurf)"),
        task_type: TaskTypeSchema.optional().describe(
          "What kind of task is the developer working on?",
        ),
        title: z
          .string()
          .optional()
          .describe('Short public session title. No project names or file paths. Example: "Fix authentication bug"'),
        private_title: z
          .string()
          .optional()
          .describe("Detailed session title for private records. Can include project names and specifics."),
        project: z
          .string()
          .optional()
          .describe('Project name — typically the root directory name of the codebase. Example: "useai", "goodpass"'),
        prompt: z
          .string()
          .optional()
          .describe("The user's full verbatim prompt text. Stored locally for self-review."),
        model: z
          .string()
          .optional()
          .describe('The AI model ID running this session. Example: "claude-sonnet-4-6"'),
        prompt_images: coerceJsonString(
          z.array(
            z.object({
              type: z.literal("image"),
              description: z.string().describe("AI-generated description of the image"),
            }),
          ),
        )
          .optional()
          .describe("Metadata for images attached to the prompt (description only, no binary data)."),
      },
    },
    async ({ client, task_type, title, private_title, project, prompt, model, prompt_images }) => {
      const session = getSession();
      session.setClient(client ?? "unknown");
      session.setTaskType(task_type ?? "other");
      session.setTitle(title ?? null);
      session.setPrivateTitle(private_title ?? null);
      session.setProject(project ?? null);
      session.setModel(model ?? null);
      session.setPrompt(prompt ?? null);
      session.setPromptImages(prompt_images ?? null);
      session.markStarted();

      await session.writeRecord("session_start", {
        client: session.client,
        task_type: session.taskType,
        title: title ?? "",
        private_title: private_title ?? "",
        project: project ?? "",
        model: model ?? "",
        ...(prompt_images && { prompt_image_count: prompt_images.length, prompt_images }),
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Session ${session.sessionId} started. Call useai_end when done.`,
          },
        ],
      };
    },
  );
}

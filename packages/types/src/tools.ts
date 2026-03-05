export interface AiTool {
  id: string;
  name: string;
  color: string;
  icon?: string;
  initials: string;
}

/**
 * Registry of supported AI tools.
 * Add new tools here — all other packages read from this list.
 */
export const AI_TOOLS: Record<string, AiTool> = {
  "claude-code": {
    id: "claude-code",
    name: "Claude Code",
    color: "#D97706",
    initials: "CC",
  },
  cursor: {
    id: "cursor",
    name: "Cursor",
    color: "#8B5CF6",
    initials: "CU",
  },
  windsurf: {
    id: "windsurf",
    name: "Windsurf",
    color: "#06B6D4",
    initials: "WS",
  },
  "vscode-copilot": {
    id: "vscode-copilot",
    name: "VS Code Copilot",
    color: "#2563EB",
    initials: "VS",
  },
  "gemini-cli": {
    id: "gemini-cli",
    name: "Gemini CLI",
    color: "#4285F4",
    initials: "GC",
  },
  unknown: {
    id: "unknown",
    name: "Unknown",
    color: "#6B7280",
    initials: "??",
  },
};

export function resolveToolId(name: string): string {
  const normalized = name.toLowerCase().trim();
  for (const [id, tool] of Object.entries(AI_TOOLS)) {
    if (
      id === normalized ||
      tool.name.toLowerCase() === normalized
    ) {
      return id;
    }
  }
  return "unknown";
}

import { homedir } from "node:os";
import { join } from "node:path";

interface ToolConfig {
  id: string;
  name: string;
  configPath: string;
  rulesPath?: string;
  mcpKey: string;
}

const HOME = homedir();

const TOOL_CONFIGS: Record<string, ToolConfig> = {
  "claude-code": {
    id: "claude-code",
    name: "Claude Code",
    configPath: join(HOME, ".claude", "settings.json"),
    rulesPath: "CLAUDE.md",
    mcpKey: "mcpServers",
  },
  cursor: {
    id: "cursor",
    name: "Cursor",
    configPath: join(HOME, ".cursor", "mcp.json"),
    rulesPath: ".cursorrules",
    mcpKey: "mcpServers",
  },
  windsurf: {
    id: "windsurf",
    name: "Windsurf",
    configPath: join(HOME, ".codeium", "windsurf", "mcp_config.json"),
    rulesPath: ".windsurfrules",
    mcpKey: "mcpServers",
  },
  "vscode-copilot": {
    id: "vscode-copilot",
    name: "VS Code Copilot",
    configPath: join(HOME, ".vscode", "mcp.json"),
    mcpKey: "servers",
  },
};

export function getToolConfig(toolId: string): ToolConfig | null {
  return TOOL_CONFIGS[toolId] ?? null;
}

export function getAllToolConfigs(): ToolConfig[] {
  return Object.values(TOOL_CONFIGS);
}

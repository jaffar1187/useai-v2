import { homedir } from "node:os";
import { join } from "node:path";
import { existsSync } from "node:fs";

export interface ToolConfig {
  id: string;
  name: string;
  configPath: string;
  mcpKey: string;
  instructionsPath?: string;
  instructionsMethod?: "append" | "create";
  detect: () => boolean;
}

const HOME = homedir();
const APP_SUPPORT = join(HOME, "Library", "Application Support");

const TOOL_CONFIGS: Record<string, ToolConfig> = {
  "claude-code": {
    id: "claude-code",
    name: "Claude Code",
    configPath: join(HOME, ".claude.json"),
    mcpKey: "mcpServers",
    instructionsPath: join(HOME, ".claude", "CLAUDE.md"),
    instructionsMethod: "append",
    detect: () => existsSync(join(HOME, ".claude")),
  },
  cursor: {
    id: "cursor",
    name: "Cursor",
    configPath: join(HOME, ".cursor", "mcp.json"),
    mcpKey: "mcpServers",
    instructionsPath: join(HOME, ".cursor", "rules", "useai.mdc"),
    instructionsMethod: "create",
    detect: () => existsSync(join(HOME, ".cursor")),
  },
  windsurf: {
    id: "windsurf",
    name: "Windsurf",
    configPath: join(HOME, ".codeium", "windsurf", "mcp_config.json"),
    mcpKey: "mcpServers",
    instructionsPath: join(HOME, ".codeium", "windsurf", "memories", "global_rules.md"),
    instructionsMethod: "append",
    detect: () => existsSync(join(HOME, ".codeium", "windsurf")),
  },
  "vscode-copilot": {
    id: "vscode-copilot",
    name: "VS Code Copilot",
    configPath: join(HOME, ".vscode", "mcp.json"),
    mcpKey: "servers",
    instructionsPath: join(APP_SUPPORT, "Code", "User", "prompts", "useai.instructions.md"),
    instructionsMethod: "create",
    detect: () => existsSync(join(APP_SUPPORT, "Code")),
  },
  "gemini-cli": {
    id: "gemini-cli",
    name: "Gemini CLI",
    configPath: join(HOME, ".gemini", "settings.json"),
    mcpKey: "mcpServers",
    instructionsPath: join(HOME, ".gemini", "GEMINI.md"),
    instructionsMethod: "append",
    detect: () => existsSync(join(HOME, ".gemini")),
  },
  codex: {
    id: "codex",
    name: "Codex",
    configPath: join(HOME, ".codex", "config.toml"),
    mcpKey: "mcp_servers",
    instructionsPath: join(HOME, ".codex", "AGENTS.md"),
    instructionsMethod: "append",
    detect: () => existsSync(join(HOME, ".codex")),
  },
  cline: {
    id: "cline",
    name: "Cline",
    configPath: join(HOME, "Library", "Application Support", "Code", "User", "globalStorage", "saoudrizwan.claude-dev", "settings", "cline_mcp_settings.json"),
    mcpKey: "mcpServers",
    instructionsPath: join(HOME, "Documents", "Cline", "Rules", "useai.md"),
    instructionsMethod: "create",
    detect: () => existsSync(join(HOME, "Library", "Application Support", "Code", "User", "globalStorage", "saoudrizwan.claude-dev")),
  },
  "roo-code": {
    id: "roo-code",
    name: "Roo Code",
    configPath: join(HOME, "Library", "Application Support", "Code", "User", "globalStorage", "rooveterinaryinc.roo-cline", "settings", "cline_mcp_settings.json"),
    mcpKey: "mcpServers",
    instructionsPath: join(HOME, ".roo", "rules", "useai.md"),
    instructionsMethod: "create",
    detect: () => existsSync(join(HOME, "Library", "Application Support", "Code", "User", "globalStorage", "rooveterinaryinc.roo-cline")),
  },
  opencode: {
    id: "opencode",
    name: "OpenCode",
    configPath: join(HOME, ".config", "opencode", "config.json"),
    mcpKey: "mcpServers",
    instructionsPath: join(HOME, ".config", "opencode", "AGENTS.md"),
    instructionsMethod: "append",
    detect: () => existsSync(join(HOME, ".config", "opencode")),
  },
};

export function getToolConfig(toolId: string): ToolConfig | null {
  return TOOL_CONFIGS[toolId] ?? null;
}

export function getAllToolConfigs(): ToolConfig[] {
  return Object.values(TOOL_CONFIGS);
}

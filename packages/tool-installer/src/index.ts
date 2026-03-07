export { installTool, removeTool, listInstalledTools, isToolConfigured, detectInstalledTools } from "./installer.js";
export { getToolConfig, getAllToolConfigs } from "./configs.js";
export { injectInstructions, removeInstructions, INSTRUCTIONS_TEXT } from "./instructions.js";
export { installClaudeCodeHooks, removeClaudeCodeHooks, isClaudeCodeHooksInstalled } from "./hooks.js";
export type { ToolInstallResult } from "./installer.js";
export type { ToolConfig } from "./configs.js";

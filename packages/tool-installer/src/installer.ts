import { readFile, writeFile, mkdir } from "node:fs/promises";
import { readFileSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import { DAEMON_URL, DAEMON_PROTOCOL } from "@useai/storage/paths";
import { getToolConfig, getAllToolConfigs } from "./configs.js";
import { injectInstructions, removeInstructions } from "./instructions.js";

export interface ToolInstallResult {
  success: boolean;
  toolId: string;
  message: string;
}

export async function installTool(toolId: string): Promise<ToolInstallResult> {
  const config = getToolConfig(toolId);
  if (!config) {
    return { success: false, toolId, message: `Unknown tool: ${toolId}` };
  }

  try {
    await mkdir(dirname(config.configPath), { recursive: true });

    let existing: Record<string, unknown> = {};
    try {
      const raw = await readFile(config.configPath, "utf-8");
      existing = JSON.parse(raw);
    } catch {
      // File doesn't exist yet
    }

    const servers = (existing[config.mcpKey] as Record<string, unknown>) ?? {};

    servers["useai"] = {
      type: DAEMON_PROTOCOL,
      url: `${DAEMON_URL}/mcp`,
    };

    existing[config.mcpKey] = servers;

    await writeFile(
      config.configPath,
      JSON.stringify(existing, null, 2),
      "utf-8",
    );

    if (config.instructionsPath && config.instructionsMethod) {
      injectInstructions(config.instructionsPath, config.instructionsMethod);
    }

    return {
      success: true,
      toolId,
      message: `Installed useai MCP server for ${config.name}`,
    };
  } catch (err) {
    return {
      success: false,
      toolId,
      message: `Failed to install for ${config.name}: ${err}`,
    };
  }
}

export async function removeTool(toolId: string): Promise<ToolInstallResult> {
  const config = getToolConfig(toolId);
  if (!config) {
    return { success: false, toolId, message: `Unknown tool: ${toolId}` };
  }

  try {
    const raw = await readFile(config.configPath, "utf-8");
    const existing = JSON.parse(raw);
    const servers = existing[config.mcpKey] ?? {};
    delete servers["useai"];
    existing[config.mcpKey] = servers;

    await writeFile(
      config.configPath,
      JSON.stringify(existing, null, 2),
      "utf-8",
    );

    if (config.instructionsPath && config.instructionsMethod) {
      removeInstructions(config.instructionsPath, config.instructionsMethod);
    }

    return {
      success: true,
      toolId,
      message: `Removed useai MCP server from ${config.name}`,
    };
  } catch {
    return {
      success: false,
      toolId,
      message: `Config not found for ${config.name}`,
    };
  }
}

export async function listInstalledTools(): Promise<string[]> {
  const installed: string[] = [];

  for (const config of getAllToolConfigs()) {
    try {
      const raw = await readFile(config.configPath, "utf-8");
      const existing = JSON.parse(raw);
      const servers = existing[config.mcpKey] ?? {};
      if (servers["useai"]) {
        installed.push(config.id);
      }
    } catch {
      // Not installed
    }
  }

  return installed;
}

export function isToolConfigured(toolId: string): boolean {
  const config = getToolConfig(toolId);
  if (!config || !existsSync(config.configPath)) return false;
  try {
    const raw = readFileSync(config.configPath, "utf-8");
    const existing = JSON.parse(raw);
    const servers = existing[config.mcpKey] ?? {};
    return !!servers["useai"];
  } catch {
    return false;
  }
}

export function detectInstalledTools(): string[] {
  return getAllToolConfigs()
    .filter((c) => c.detect())
    .map((c) => c.id);
}

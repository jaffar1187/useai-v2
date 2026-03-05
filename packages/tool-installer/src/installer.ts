import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { getToolConfig } from "./configs.js";

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

    const servers =
      (existing[config.mcpKey] as Record<string, unknown>) ?? {};

    servers["useai"] = {
      command: "npx",
      args: ["-y", "@devness/useai@latest"],
    };

    existing[config.mcpKey] = servers;

    await writeFile(
      config.configPath,
      JSON.stringify(existing, null, 2),
      "utf-8",
    );

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
  const { getAllToolConfigs } = await import("./configs.js");

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

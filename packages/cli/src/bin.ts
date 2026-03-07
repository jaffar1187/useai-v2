import { Command } from "commander";
import chalk from "chalk";
import {
  detectInstalledTools,
  isToolConfigured,
  installTool,
  removeTool,
  getAllToolConfigs,
  installClaudeCodeHooks,
  removeClaudeCodeHooks,
  isClaudeCodeHooksInstalled,
} from "@useai/tool-installer";

const program = new Command();

program
  .name("useai")
  .description("Track and improve your AI coding sessions")
  .version("0.1.0");

program
  .command("stats")
  .description("Show session statistics")
  .action(async () => {
    console.log("stats command — coming soon");
  });

program
  .command("serve")
  .description("Start daemon and open dashboard")
  .action(async () => {
    console.log("serve command — coming soon");
  });

program
  .command("setup")
  .description("Set up useai for your AI tools")
  .option("-y, --yes", "Auto-confirm all detected tools without prompting")
  .option("--remove", "Remove useai from all configured tools")
  .action(async (opts) => {
    if (opts.remove) {
      await runRemove();
    } else {
      await runSetup(opts.yes ?? false);
    }
  });

async function runSetup(autoYes: boolean): Promise<void> {
  console.log(chalk.bold("\n  useai setup\n"));
  console.log(chalk.dim("  Scanning for AI tools...\n"));

  const detected = detectInstalledTools();

  if (detected.length === 0) {
    console.log(chalk.red("  No AI tools detected on this machine."));
    console.log(chalk.dim("  Supported: claude-code, cursor, windsurf, vscode-copilot, gemini-cli, codex, cline, roo-code, opencode\n"));
    return;
  }

  const configured = detected.filter((id) => isToolConfigured(id));
  const unconfigured = detected.filter((id) => !isToolConfigured(id));

  console.log(`  Found ${chalk.bold(String(detected.length))} AI tool${detected.length === 1 ? "" : "s"}:\n`);

  for (const id of configured) {
    const name = getAllToolConfigs().find((c) => c.id === id)?.name ?? id;
    console.log(chalk.green(`  ✓ ${name}`) + chalk.dim("  (already configured)"));
  }
  for (const id of unconfigured) {
    const name = getAllToolConfigs().find((c) => c.id === id)?.name ?? id;
    console.log(chalk.dim(`  ○ ${name}`));
  }
  console.log();

  const toInstall = unconfigured.length > 0 ? unconfigured : configured;

  if (unconfigured.length === 0) {
    console.log(chalk.dim("  All detected tools already configured. Re-running to ensure up to date.\n"));
  } else if (!autoYes) {
    const answer = await prompt(`  Install useai for ${toInstall.length} tool${toInstall.length === 1 ? "" : "s"}? (Y/n) `);
    if (answer.toLowerCase() === "n") {
      console.log(chalk.dim("\n  Cancelled.\n"));
      return;
    }
    console.log();
  }

  // Install tools
  for (const id of toInstall) {
    const result = await installTool(id);
    if (result.success) {
      const name = getAllToolConfigs().find((c) => c.id === id)?.name ?? id;
      console.log(chalk.green(`  ✓ ${name}`));
    } else {
      console.log(chalk.red(`  ✗ ${result.message}`));
    }
  }

  // Install Claude Code hooks if claude-code is among detected tools
  if (detected.includes("claude-code")) {
    try {
      const installed = installClaudeCodeHooks();
      if (installed) {
        console.log(chalk.green("  ✓ Claude Code hooks installed (auto-prompt on every message)"));
      } else {
        console.log(chalk.dim("  ✓ Claude Code hooks already installed"));
      }
    } catch {
      console.log(chalk.yellow("  ⚠ Could not install Claude Code hooks"));
    }
  }

  console.log(chalk.bold("\n  Done! Start your AI tool and useai will track every session.\n"));
  console.log(chalk.dim("  Dashboard → http://127.0.0.1:19200\n"));
}

async function runRemove(): Promise<void> {
  console.log(chalk.bold("\n  useai remove\n"));

  const all = getAllToolConfigs();
  const configured = all.filter((c) => isToolConfigured(c.id));

  if (configured.length === 0) {
    console.log(chalk.dim("  useai is not configured in any AI tools.\n"));
  } else {
    for (const config of configured) {
      const result = await removeTool(config.id);
      if (result.success) {
        console.log(chalk.green(`  ✓ Removed from ${config.name}`));
      } else {
        console.log(chalk.red(`  ✗ ${result.message}`));
      }
    }
  }

  if (isClaudeCodeHooksInstalled()) {
    removeClaudeCodeHooks();
    console.log(chalk.green("  ✓ Claude Code hooks removed"));
  }

  console.log(chalk.dim("\n  Done.\n"));
}

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.setEncoding("utf-8");
    process.stdin.once("data", (data) => {
      resolve((data as unknown as string).trim());
      process.stdin.destroy();
    });
  });
}

program.parse();

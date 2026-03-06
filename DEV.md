# Dev Setup

## Build

Build all packages (required before first run):

```bash
pnpm build
```

## Start in Dev Mode

Requires **3 terminals**:

**Terminal 1 — Daemon compiler** (watches for changes):

```bash
cd packages/daemon && pnpm dev
```

**Terminal 2 — Daemon server** (runs the compiled output):

```bash
cd packages/daemon && pnpm start
```

**Terminal 3 — Dashboard** (port 5174):

```bash
cd packages/dashboard && pnpm dev
```

Dashboard: http://localhost:5174
Daemon API: http://127.0.0.1:19200

---

## Claude Code MCP Config

The file `.mcp.json` in the project root tells Claude Code to connect to the local daemon as an MCP server.

```json
{
  "mcpServers": {
    "useai": {
      "type": "http",
      "url": "http://127.0.0.1:19200/mcp"
    }
  }
}
```

To change the daemon URL (e.g. different port), edit `.mcp.json` and restart Claude Code.

The daemon must be running before Claude Code can use the `useai` tools.

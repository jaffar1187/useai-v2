import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { registerTools, SessionState } from "@useai/mcp-server";
import { sessions } from "./session-store.js";

export async function createMcpSession(): Promise<WebStandardStreamableHTTPServerTransport> {
  const sessionState = new SessionState();
  const server = new McpServer({ name: "useai", version: "0.1.0" });

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized: (id) => {
      sessions.set(id, { transport, mcpServer: server, sessionState, lastActivity: Date.now() });
    },
    onsessionclosed: (id) => {
      sessions.delete(id);
    },
  });

  registerTools(server, () => sessionState);
  await server.connect(transport);

  return transport;
}

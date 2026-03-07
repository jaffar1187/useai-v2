import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { registerTools, createPromptContext } from "@useai/mcp-server";
import { connections } from "./connection-store.js";

export async function createMcpConnection(): Promise<WebStandardStreamableHTTPServerTransport> {
  const promptContext = createPromptContext();
  const server = new McpServer({ name: "useai", version: "0.1.0" });

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    //connectionId is only mcp-session-id header.
    onsessioninitialized: (connectionId) => {
      promptContext.connectionId = connectionId;
      //Store it in connections map
      connections.set(connectionId, {
        transport,
        mcpServer: server,
        promptContext,
        lastActivity: Date.now(),
      });
    },
    onsessionclosed: (connectionId) => {
      connections.delete(connectionId);
    },
  });

  registerTools(server, promptContext);

  await server.connect(transport);

  return transport;
}

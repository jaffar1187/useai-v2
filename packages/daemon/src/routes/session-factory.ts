import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { registerTools, SessionState } from "@useai/mcp-server";
//This is a map in which we store mcpSessionId. Each mcpSessionId corresponds to a Claude connection.
import { sessions } from "./session-store.js";

/*Claude opens connection
  → mcpSessionId created (e.g. "f3a9b2c1")       ← one per connection */

/*  User types prompt 1 → useai_start
→ ses_aaaa created, file written              ← one per task
User finishes → useai_end → ses_aaaa sealed

User types prompt 2 → useai_start
→ ses_bbbb created, file written              ← new task, same connection
User finishes → useai_end → ses_bbbb sealed

Claude disconnects → mcpSessionId removed from Map 
*/

export async function createMcpSession(): Promise<WebStandardStreamableHTTPServerTransport> {
  //sessionId is set here by default, which will be used to write to disk
  const sessionState = new SessionState();
  const server = new McpServer({ name: "useai", version: "0.1.0" });

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized: (mcpSessionId) => {
      sessions.set(mcpSessionId, {
        transport,
        mcpServer: server,
        sessionState,
        lastActivity: Date.now(),
      });
    },
    onsessionclosed: (mcpSessionId) => {
      sessions.delete(mcpSessionId);
    },
  });

  registerTools(server, () => sessionState);

  //Handshake req, post cors is processed here and sessionIdGenerator, onsessioninitialized is called, and mcp-session-id is set in headers, The methodName is connect, but actual response is sent after this.
  await server.connect(transport);

  return transport;
}

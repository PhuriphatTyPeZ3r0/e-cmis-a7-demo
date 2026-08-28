import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export async function setupNotebookLmMcpClient() {
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["-y", "notebooklm-mcp-server", "start"],
  });

  const client = new Client(
    {
      name: "ecmis-agent-client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  await client.connect(transport);
  console.log("Connected to NotebookLM MCP Server");
  return client;
}

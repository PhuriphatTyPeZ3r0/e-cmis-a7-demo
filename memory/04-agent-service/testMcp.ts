import { setupNotebookLmMcpClient } from './src/mcpClient.js';

async function run() {
  try {
    const client = await setupNotebookLmMcpClient();
    
    console.log("=== Available Tools ===");
    const toolsResult = await client.listTools();
    console.log(JSON.stringify(toolsResult.tools.map(t => t.name), null, 2));

    console.log("\n=== Notebooks ===");
    const listResult = await client.callTool({
      name: "notebook_list",
      arguments: {}
    });
    console.log(JSON.stringify(listResult, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

run();

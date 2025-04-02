#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { registerQueryEntriesTool } from "./tools/query_entries.js";
import { registerGetEntryTool } from "./tools/get_entry.js";
import { registerGetAssetsTool } from "./tools/get_assets.js";
import { registerGetEntriesTool } from "./tools/get_entries.js";
import { registerGetAssetTool } from "./tools/get_asset.js";
import { registerGetContentTypeTool } from "./tools/get_content_type.js";
import { registerGetContentTypesTool } from "./tools/get_content_types.js";

/**
 * Create an MCP server with capabilities for resources (to list/read notes),
 * tools (to create new notes), and prompts (to summarize notes).
 */
const server = new Server(
  {
    name: "contentful-delivery-mcp",
    version: "0.2.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

// Store all registered tools
const registeredTools: Array<{
  name: string;
  description: string;
  inputSchema: object;
}> = [];

// Store tool handlers
const toolHandlers: { [key: string]: (request: any) => Promise<any> } = {};

// Helper function to register a tool
const registerTool = (tool: {
  name: string;
  description: string;
  inputSchema: object;
}) => {
  registeredTools.push(tool);
};

// Helper function to register a tool handler
const registerToolHandler = (
  name: string,
  handler: (request: any) => Promise<any>
) => {
  toolHandlers[name] = handler;
};

// Register Tools
registerQueryEntriesTool(server, registerTool, registerToolHandler);
registerGetEntryTool(server, registerTool, registerToolHandler);
registerGetAssetsTool(server, registerTool, registerToolHandler);
registerGetEntriesTool(server, registerTool, registerToolHandler);
registerGetAssetTool(server, registerTool, registerToolHandler);
registerGetContentTypeTool(server, registerTool, registerToolHandler);
registerGetContentTypesTool(server, registerTool, registerToolHandler);

// Register MCP standard methods
server.setRequestHandler(
  z.object({ method: z.literal("resources/list") }),
  async () => {
    return { resources: [] };
  }
);

server.setRequestHandler(
  z.object({ method: z.literal("tools/list") }),
  async () => {
    return { tools: registeredTools };
  }
);

// Handle tool execution
server.setRequestHandler(
  z.object({
    method: z.literal("tools/call"),
    params: z
      .object({
        name: z.string(),
      })
      .optional(),
  }),
  async (request) => {
    const toolName = request.params?.name;
    if (!toolName || !toolHandlers[toolName]) {
      throw new Error(`Tool not found: ${toolName}`);
    }
    return await toolHandlers[toolName](request);
  }
);

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});

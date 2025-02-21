import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { client } from "../clients/contentful-client.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

type RegisterTool = (tool: { name: string; description: string; inputSchema: object }) => void;
type RegisterToolHandler = (name: string, handler: (request: any) => Promise<any>) => void;

export function registerGetContentTypesTool(
  server: Server,
  registerTool: RegisterTool,
  registerToolHandler: RegisterToolHandler
) {
  // Register tool metadata
  registerTool({
    name: "get_content_types",
    description: "Get all content types from Contentful",
    inputSchema: {
      type: "object",
      properties: {},
    },
  });

  // Register the tool handler
  registerToolHandler("get_content_types", async (request: any) => {
    try {
      const contentTypes = await client.getContentTypes();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(contentTypes.items, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get content types: ${error}`);
    }
  });
}

import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { client } from "../clients/contentful-client.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

type RegisterTool = (tool: { name: string; description: string; inputSchema: object }) => void;
type RegisterToolHandler = (name: string, handler: (request: any) => Promise<any>) => void;

export function registerGetAssetsTool(
  server: Server,
  registerTool: RegisterTool,
  registerToolHandler: RegisterToolHandler
) {
  // Register tool metadata
  registerTool({
    name: "get_assets",
    description: "Get all assets from Contentful",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of assets to return (default: 100)",
        },
      },
    },
  });

  // Register the tool handler
  registerToolHandler("get_assets", async (request) => {
    const limit = Number(request.params.arguments?.limit) || 100;

    try {
      const assets = await client.getAssets({ limit });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(assets.items, null, 2),
          }
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get assets: ${error}`);
    }
  });
}

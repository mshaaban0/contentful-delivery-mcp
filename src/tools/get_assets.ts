import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { client } from "../clients/contentful-client.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

export function registerGetAssetsTool(server: Server) {
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
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
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
      case "get_assets": {
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
      }
      default:
        throw new Error("Unknown tool");
    }
  });
}

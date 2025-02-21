import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { client } from "../clients/contentful-client.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

type RegisterTool = (tool: { name: string; description: string; inputSchema: object }) => void;
type RegisterToolHandler = (name: string, handler: (request: any) => Promise<any>) => void;

export function registerGetAssetTool(
  server: Server,
  registerTool: RegisterTool,
  registerToolHandler: RegisterToolHandler
) {
  // Register tool metadata
  registerTool({
    name: "get_asset",
    description: "Get a specific Contentful asset by ID",
    inputSchema: {
      type: "object",
      properties: {
        assetId: {
          type: "string",
          description: "The ID of the Contentful asset to retrieve",
        },
      },
      required: ["assetId"],
    },
  });

  // Register the tool handler
  registerToolHandler("get_asset", async (request) => {
    const assetId = String(request.params.arguments?.assetId);
    if (!assetId) {
      throw new Error("Asset ID is required");
    }

    try {
      const asset = await client.getAsset(assetId);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(asset, null, 2),
          }
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get asset ${assetId}: ${error}`);
    }
  });
}

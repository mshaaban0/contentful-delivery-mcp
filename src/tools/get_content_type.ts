import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { client } from "../clients/contentful-client.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

type RegisterTool = (tool: { name: string; description: string; inputSchema: object }) => void;

export function registerGetContentTypeTool(server: Server, registerTool: RegisterTool) {
  // Register tool metadata
  registerTool({
    name: "get_content_type",
    description: "Get a specific Contentful content type by ID",
    inputSchema: {
      type: "object",
      properties: {
        contentTypeId: {
          type: "string",
          description: "The ID of the Contentful content type to retrieve",
        },
      },
      required: ["contentTypeId"],
    },
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
      case "get_content_type": {
        const contentTypeId = String(request.params.arguments?.contentTypeId);
        if (!contentTypeId) {
          throw new Error("Content Type ID is required");
        }

        try {
          const contentType = await client.getContentType(contentTypeId);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(contentType, null, 2),
              }
            ],
          };
        } catch (error) {
          throw new Error(`Failed to get content type ${contentTypeId}: ${error}`);
        }
      }
      default:
        throw new Error("Unknown tool");
    }
  });
}

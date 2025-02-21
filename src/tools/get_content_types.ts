import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { client } from "../clients/contentful-client.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

export function registerGetContentTypesTool(server: Server) {
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "get_content_types",
          description: "Get all content types from Contentful",
          inputSchema: {
            type: "object",
            properties: {
              limit: {
                type: "number",
                description:
                  "Maximum number of content types to return (default: 100)",
              },
            },
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
      case "get_content_types": {
        const limit = Number(request.params.arguments?.limit) || 100;

        try {
          const contentTypes = await client.getContentTypes({
            query: {
              limit,
            },
          });
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
      }
      default:
        throw new Error("Unknown tool");
    }
  });
}

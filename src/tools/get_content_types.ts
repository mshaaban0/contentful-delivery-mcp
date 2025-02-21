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
            properties: {},
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
      case "get_content_types": {

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
      }
      default:
        throw new Error("Unknown tool");
    }
  });
}

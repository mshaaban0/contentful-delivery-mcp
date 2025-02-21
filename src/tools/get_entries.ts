import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { client } from "../clients/contentful-client.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

type RegisterTool = (tool: { name: string; description: string; inputSchema: object }) => void;

export function registerGetEntriesTool(server: Server, registerTool: RegisterTool) {
  // Register tool metadata
  registerTool({
    name: "get_entries",
    description: "Get multiple entries from Contentful with optional filters",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of entries to return (default: 100)",
        },
        contentType: {
          type: "string",
          description: "Filter by content type ID",
        },
      },
    },
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
      case "get_entries": {
        const limit = Number(request.params.arguments?.limit) || 100;
        const contentType = request.params.arguments?.contentType;

        try {
          const query: any = { limit };
          if (contentType) {
            query.content_type = contentType;
          }

          const entries = await client.getEntries(query);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(entries.items, null, 2),
              }
            ],
          };
        } catch (error) {
          throw new Error(`Failed to get entries: ${error}`);
        }
      }
      default:
        throw new Error("Unknown tool");
    }
  });
}

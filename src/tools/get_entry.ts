import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { client } from "../clients/contentful-client.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

export function registerGetEntryTool(server: Server) {
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "get_entry",
          description: "Get a specific Contentful entry by ID",
          inputSchema: {
            type: "object",
            properties: {
              entryId: {
                type: "string",
                description: "The ID of the Contentful entry to retrieve",
              },
            },
            required: ["entryId"],
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
      case "get_entry": {
        const entryId = String(request.params.arguments?.entryId);
        if (!entryId) {
          throw new Error("Entry ID is required");
        }

        try {
          const entry = await client.getEntry(entryId);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(entry, null, 2),
              },
            ],
          };
        } catch (error) {
          throw new Error(`Failed to get entry ${entryId}: ${error}`);
        }
      }
      default:
        throw new Error("Unknown tool");
    }
  });
}

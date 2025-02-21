import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { client } from "../clients/contentful-client.js";

export function registerGetEntryTool(server: Server) {
  server.addTool({
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
    handler: async (params) => {
      const entryId = String(params.entryId);
      
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
    },
  });
}

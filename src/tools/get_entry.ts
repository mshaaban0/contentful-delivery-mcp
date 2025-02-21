import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { client } from "../clients/contentful-client.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { serializeContentfulResponse } from "../utils/contentful-serializer.js";

type RegisterTool = (tool: { name: string; description: string; inputSchema: object }) => void;
type RegisterToolHandler = (name: string, handler: (request: any) => Promise<any>) => void;

export function registerGetEntryTool(
  server: Server,
  registerTool: RegisterTool,
  registerToolHandler: RegisterToolHandler
) {
  // Register tool metadata
  registerTool({
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
  });

  // Register the tool handler
  registerToolHandler("get_entry", async (request) => {
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
            text: serializeContentfulResponse(entry),
          }
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get entry ${entryId}: ${error}`);
    }
  });
}

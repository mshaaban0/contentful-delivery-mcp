import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { client } from "../clients/contentful-client.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { serializeContentfulResponse } from "../utils/contentful-serializer.js";

type RegisterTool = (tool: {
  name: string;
  description: string;
  inputSchema: object;
}) => void;
type RegisterToolHandler = (
  name: string,
  handler: (request: any) => Promise<any>
) => void;

export function registerGetEntriesTool(
  server: Server,
  registerTool: RegisterTool,
  registerToolHandler: RegisterToolHandler
) {
  // Register tool metadata
  registerTool({
    name: "get_entries",
    description: "Get multiple entries from Contentful with optional filters",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of entries to return (default: 50)",
        },
        contentType: {
          type: "string",
          description: "Filter by content type ID",
        },
      },
    },
  });

  // Register the tool handler
  registerToolHandler("get_entries", async (request) => {
    const limit = Number(request.params.arguments?.limit) || 50;
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
            text: serializeContentfulResponse(entries.items),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get entries: ${error}`);
    }
  });
}

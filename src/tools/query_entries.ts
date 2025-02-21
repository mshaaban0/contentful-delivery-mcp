import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { client } from "../clients/contentful-client.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { client } from "../clients/contentful-client.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

type RegisterTool = (tool: { name: string; description: string; inputSchema: object }) => void;

export function registerQueryEntriesTool(server: Server, registerTool: RegisterTool) {
  // Register tool metadata
  registerTool({
    name: "query_entries",
    description: "Query and find content in Contentful delivery API",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Keywords or query value to search for",
        },
      },
    },
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
      case "query_entries": {
        const query = String(request.params.arguments?.query);
        if (!query) {
          throw new Error("Query parameter is required");
        }
        const entries = await client.getEntries({
          query,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(entries.items, null, 2),
            },
          ],
        };
      }
      default:
        throw new Error("Unknown tool");
    }
  });
};


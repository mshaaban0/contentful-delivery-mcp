import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { client as contentfulClient } from "../clients/contentful-client.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

export const registerQueryEntriesTool = async (server: Server) => {
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
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
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
      case "query_entries": {
        const query = String(request.params.arguments?.query);
        if (!query) {
          throw new Error("Query parameter is required");
        }
        const entries = await contentfulClient.getEntries({
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

export async function queryEntries(server: Server) {}

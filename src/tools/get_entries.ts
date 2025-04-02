import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { client, getAllowedContentTypeIds } from "../clients/contentful-client.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { serializeContentfulResponse } from "../utils/contentful-serializer.js";
import { extractContentFromEntries } from "../utils/extract-content-from-entries.js";

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
          description: "Filter by a single content type ID",
        },
        contentTypeIds: {
          type: "array",
          items: {
            type: "string"
          },
          description: "Filter by multiple content type IDs (takes precedence over contentType if both are provided)",
        },
      },
    },
  });

  // Register the tool handler
  registerToolHandler("get_entries", async (request) => {
    const limit = Number(request.params.arguments?.limit) || 50;
    const contentType = request.params.arguments?.contentType;
    const contentTypeIds = request.params.arguments?.contentTypeIds;

    try {
      const query: any = { limit };
      
      // Get allowed content types from environment
      const allowedContentTypes = getAllowedContentTypeIds();
      
      // Handle content type filtering
      if (allowedContentTypes) {
        // Environment variable takes precedence - always filter by allowed content types
        query['sys.contentType.sys.id[in]'] = allowedContentTypes.join(',');
      } else if (contentTypeIds && Array.isArray(contentTypeIds) && contentTypeIds.length > 0) {
        // When filtering by multiple content types, use 'sys.contentType.sys.id[in]' parameter
        query['sys.contentType.sys.id[in]'] = contentTypeIds.join(',');
      } else if (contentType) {
        // Single content type filter (legacy support)
        query.content_type = contentType;
      }

      const entries = await client.getEntries(query);
      const contentTypes = await client.getContentTypes();
      
      // Extract content for the model
      const extractedContent = extractContentFromEntries(entries.items, contentTypes.items);
      
      return {
        content: [
          {
            type: "text",
            text: serializeContentfulResponse(entries.items) + "\n\nExtracted Content:\n" + extractedContent,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get entries: ${error}`);
    }
  });
}

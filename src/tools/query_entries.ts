import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { client, getAllowedContentTypeIds } from "../clients/contentful-client.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { serializeContentfulResponse } from "../utils/contentful-serializer.js";
import { extractContentFromEntries } from "../utils/extract-content-from-entries.js";

type RegisterTool = (tool: { name: string; description: string; inputSchema: object }) => void;
type RegisterToolHandler = (name: string, handler: (request: any) => Promise<any>) => void;

export function registerQueryEntriesTool(
  server: Server,
  registerTool: RegisterTool,
  registerToolHandler: RegisterToolHandler
) {
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
        contentTypeIds: {
          type: "array",
          items: {
            type: "string"
          },
          description: "Optional: Filter search results by content type IDs",
        },
      },
      required: ["query"],
    },
  });

  // Register the tool handler
  registerToolHandler("query_entries", async (request) => {
    const query = String(request.params.arguments?.query);
    if (!query) {
      throw new Error("Query parameter is required");
    }
    
    const contentTypeIds = request.params.arguments?.contentTypeIds;
    
    // Build the query object
    const queryObj: any = { query };
    
    // Get allowed content types from environment
    const allowedContentTypes = getAllowedContentTypeIds();
    
    // Add content type filter
    if (allowedContentTypes) {
      // Environment variable takes precedence - always filter by allowed content types
      queryObj['sys.contentType.sys.id[in]'] = allowedContentTypes.join(',');
    } else if (contentTypeIds && Array.isArray(contentTypeIds) && contentTypeIds.length > 0) {
      // Use content type IDs from request if environment variable not set
      queryObj['sys.contentType.sys.id[in]'] = contentTypeIds.join(',');
    }
    
    const entries = await client.getEntries(queryObj);
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
  });
};


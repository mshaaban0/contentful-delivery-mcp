#!/usr/bin/env node

/**
 * This is a template MCP server that implements a simple notes system.
 * It demonstrates core MCP concepts like resources and tools by allowing:
 * - Listing notes as resources
 * - Reading individual notes
 * - Creating new notes via a tool
 * - Summarizing all notes via a prompt
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { registerQueryEntriesTool } from "./tools/query_entries.js";
import { registerGetEntryTool } from "./tools/get_entry.js";
import { registerGetAssetsTool } from "./tools/get_assets.js";
import { registerGetEntriesTool } from "./tools/get_entries.js";
import { registerGetAssetTool } from "./tools/get_asset.js";
import { registerGetContentTypeTool } from "./tools/get_content_type.js";
import { registerGetContentTypesTool } from "./tools/get_content_types.js";

/**
 * Type alias for a note object.
 */
type Note = { title: string; content: string };

/**
 * Simple in-memory storage for notes.
 * In a real implementation, this would likely be backed by a database.
 */
const notes: { [id: string]: Note } = {
  "1": { title: "First Note", content: "This is note 1" },
  "2": { title: "Second Note", content: "This is note 2" },
};

/**
 * Create an MCP server with capabilities for resources (to list/read notes),
 * tools (to create new notes), and prompts (to summarize notes).
 */
const server = new Server(
  {
    name: "contentful-delivery-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

/**
 * Handler for listing available notes as resources.
 * Each note is exposed as a resource with:
 * - A note:// URI scheme
 * - Plain text MIME type
 * - Human readable name and description (now including the note title)
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: Object.entries(notes).map(([id, note]) => ({
      uri: `note:///${id}`,
      mimeType: "text/plain",
      name: note.title,
      description: `A text note: ${note.title}`,
    })),
  };
});

/**
 * Handler for reading the contents of a specific note.
 * Takes a note:// URI and returns the note content as plain text.
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const url = new URL(request.params.uri);
  const id = url.pathname.replace(/^\//, "");
  const note = notes[id];

  if (!note) {
    throw new Error(`Note ${id} not found`);
  }

  return {
    contents: [
      {
        uri: request.params.uri,
        mimeType: "text/plain",
        text: note.content,
      },
    ],
  };
});

// Store all registered tools
const registeredTools: Array<{
  name: string;
  description: string;
  inputSchema: object;
}> = [];

/**
 * Handler that lists available tools.
 * Combines built-in tools with registered Contentful tools.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const builtInTools = [
    {
      name: "create_note",
      description: "Create a new note",
      inputSchema: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Title of the note",
          },
          content: {
            type: "string",
            description: "Text content of the note",
          },
        },
        required: ["title", "content"],
      },
    },
  ];

  return {
    tools: [...builtInTools, ...registeredTools],
  };
});

// Store tool handlers
const toolHandlers: { [key: string]: (request: any) => Promise<any> } = {};

/**
 * Handler for all tools including create_note and Contentful tools.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  
  if (toolName === "create_note") {
    const title = String(request.params.arguments?.title);
    const content = String(request.params.arguments?.content);
    if (!title || !content) {
      throw new Error("Title and content are required");
    }

    const id = String(Object.keys(notes).length + 1);
    notes[id] = { title, content };

    return {
      content: [
        {
          type: "text",
          text: `Created note ${id}: ${title}`,
        },
      ],
    };
  }

  // Check if we have a handler for this tool
  if (toolHandlers[toolName]) {
    return toolHandlers[toolName](request);
  }

  throw new Error("Unknown tool");
});

/**
 * Handler that lists available prompts.
 * Exposes a single "summarize_notes" prompt that summarizes all notes.
 */
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "summarize_notes",
        description: "Summarize all notes",
      },
    ],
  };
});

/**
 * Handler for the summarize_notes prompt.
 * Returns a prompt that requests summarization of all notes, with the notes' contents embedded as resources.
 */
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  if (request.params.name !== "summarize_notes") {
    throw new Error("Unknown prompt");
  }

  const embeddedNotes = Object.entries(notes).map(([id, note]) => ({
    type: "resource" as const,
    resource: {
      uri: `note:///${id}`,
      mimeType: "text/plain",
      text: note.content,
    },
  }));

  return {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: "Please summarize the following notes:",
        },
      },
      ...embeddedNotes.map((note) => ({
        role: "user" as const,
        content: note,
      })),
      {
        role: "user",
        content: {
          type: "text",
          text: "Provide a concise summary of all the notes above.",
        },
      },
    ],
  };
});

// Helper function to register a tool
const registerTool = (tool: { name: string; description: string; inputSchema: object }) => {
  registeredTools.push(tool);
};

// Helper function to register a tool handler
const registerToolHandler = (name: string, handler: (request: any) => Promise<any>) => {
  toolHandlers[name] = handler;
};

// Register Tools
registerQueryEntriesTool(server, registerTool, registerToolHandler);
registerGetEntryTool(server, registerTool, registerToolHandler);
registerGetAssetsTool(server, registerTool, registerToolHandler);
registerGetEntriesTool(server, registerTool, registerToolHandler);
registerGetAssetTool(server, registerTool, registerToolHandler);
registerGetContentTypeTool(server, registerTool, registerToolHandler);
registerGetContentTypesTool(server, registerTool, registerToolHandler);

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});

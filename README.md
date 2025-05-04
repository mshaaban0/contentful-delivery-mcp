[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/mshaaban0-contentful-delivery-mcp-badge.png)](https://mseep.ai/app/mshaaban0-contentful-delivery-mcp)

# Contentful Delivery MCP Server

A Model Context Protocol (MCP) server that provides seamless access to Contentful's Delivery API through AI assistants. Query and retrieve content entries, assets, and content types using natural language.

<a href="https://glama.ai/mcp/servers/v84ui258n5">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/v84ui258n5/badge" alt="Contentful Delivery Server MCP server" />
</a>

## Quick Start

Install the package in your project:

```bash
npm install @mshaaban0/contentful-delivery-mcp-server
```

Or globally:

```bash
npm install -g @mshaaban0/contentful-delivery-mcp-server
```

Set up your Contentful credentials:

```bash
export CONTENTFUL_SPACE_ID="your_space_id"
export CONTENTFUL_ACCESS_TOKEN="your_access_token"
# Optional: Restrict content to specific content types
export CONTENTFUL_CONTENT_TYPE_IDS="blogPost,article,product"
```

## Features

- Natural language queries to search content
- Retrieve entries by ID or content type
- Asset management
- Content type schema access
- Pagination support
- Rich text content handling

### Available Tools

- `query_entries` - Natural language search across all content
- `get_entry` - Fetch specific entry by ID
- `get_entries` - List entries with filtering
- `get_assets` - Browse all assets
- `get_asset` - Get asset details by ID
- `get_content_type` - View content type schema
- `get_content_types` - List available content types

## Integration with Mastra AI

[Mastra AI](https://mastra.ai) provides seamless integration with this MCP server. Here's how to set it up:

```typescript
import { MastraMCPClient } from "@mastra/mcp";
import { Agent } from "@mastra/core/agent";

// Initialize the MCP client
const contentfulClient = new MastraMCPClient({
  name: "contentful-delivery",
  server: {
    command: "npx",
    args: ["-y", "@mshaaban0/contentful-delivery-mcp-server@latest"],
    env: {
      CONTENTFUL_ACCESS_TOKEN: "your_access_token",
      CONTENTFUL_SPACE_ID: "your_space_id",
      // Optional: Restrict content to specific content types
      CONTENTFUL_CONTENT_TYPE_IDS: "blogPost,article,product"
    }
  }
});

// Create an AI agent with access to Contentful
const assistant = new Agent({
  name: "Content Assistant",
  instructions: `
    You are a helpful assistant with access to our content database.
    Use the available tools to find and provide accurate information.
  `,
  model: "gpt-4",
});

// Connect and register tools
await contentfulClient.connect();
const tools = await contentfulClient.tools();
assistant.__setTools(tools);

// Example usage
const response = await assistant.chat("Find articles about machine learning");
```

## Development

```bash
# Clone the repo
git clone https://github.com/mshaaban0/contentful-delivery-mcp-server.git

# Install dependencies
npm install

# Build
npm run build

# Development with auto-rebuild
npm run watch

# Run the inspector
npm run inspector
```

## Debugging

The MCP Inspector provides a web interface for debugging:

```bash
npm run inspector
```

Visit the provided URL to access the debugging tools.

## Resources

- [Mastra AI Documentation](https://mastra.ai/docs)
- [Contentful API Reference](https://www.contentful.com/developers/docs/references/)
- [MCP Specification](https://github.com/anthropic-labs/model-context-protocol)

## License

MIT
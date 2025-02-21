# Contentful Delivery MCP Server

A Model Context Protocol (MCP) server that provides seamless access to Contentful's Delivery API. This server enables AI assistants to interact with your Contentful content, making it easier to query and retrieve content entries, assets, and content types.

## Installation

You can install the package globally via npm:

```bash
npm install -g @mshaaban0/contentful-delivery-mcp-server
```

## Configuration

Before using the server, you need to set up your Contentful credentials as environment variables:

```bash
export CONTENTFUL_SPACE_ID="your_space_id"
export CONTENTFUL_ACCESS_TOKEN="your_access_token"
```

## Features

### Tools

- `query_entries` - Search for entries using natural language queries
- `get_entry` - Retrieve a specific Contentful entry by ID
- `get_entries` - Get multiple entries with content type filtering
- `get_assets` - List all assets with pagination
- `get_asset` - Retrieve a specific asset by ID
- `get_content_type` - Get content type schema by ID
- `get_content_types` - List all available content types

## Integration with AI Assistants

### Mastra AI

[Mastra AI](https://mastra.ai) is an AI assistant that natively supports MCP. To use this server with Mastra:

1. Install the server globally
2. Add the server configuration to Mastra's settings:

```json
{
  "mcpServers": {
    "contentful-delivery": {
      "command": "contentful-delivery-mcp"
    }
  }
}
```

### Claude Desktop

To use with Claude Desktop, add the server config:

macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "contentful-delivery": {
      "command": "contentful-delivery-mcp"
    }
  }
}
```

## Development

Clone the repository:

```bash
git clone https://github.com/mshaaban0/contentful-delivery-mcp-server.git
cd contentful-delivery-mcp-server
```

Install dependencies:

```bash
npm install
```

Build the server:

```bash
npm run build
```

For development with auto-rebuild:

```bash
npm run watch
```

### Debugging

Use the MCP Inspector for debugging:

```bash
npm run inspector
```

This will provide a URL to access debugging tools in your browser.

## License

MIT

## Links

- [Mastra AI](https://mastra.ai)
- [Contentful](https://www.contentful.com)
- [Model Context Protocol](https://github.com/anthropic-labs/model-context-protocol)

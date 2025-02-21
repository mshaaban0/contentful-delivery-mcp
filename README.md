# Contentful Delivery MCP Server

Contentful MCP Server for Delivery API

This is a TypeScript-based MCP server that implements a simple notes system. It demonstrates core MCP concepts by providing:

- Resources representing text notes with URIs and metadata
- Tools for creating new notes
- Prompts for generating summaries of notes

## Features

### Tools

- `query_entries` - Search for entries by keyword or a query sentence
- `get_entry` - Retrieve a specific Contentful entry by its ID
- `get_entries` - Get multiple entries with optional content type filtering and limits
- `get_assets` - Retrieve all assets from Contentful with optional limit
- `get_asset` - Retrieve a specific Contentful asset by ID
- `get_content_type` - Retrieve a specific content type by ID
- `get_content_types` - Retrieve all content types with optional limit

## Development

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

## Installation

To use with Claude Desktop, add the server config:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "contentful-delivery-mcp-server": {
      "command": "/path/to/contentful-delivery-mcp-server/build/index.js"
    }
  }
}
```

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.

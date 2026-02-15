# Custom Tools

This directory contains custom tool integrations and MCP server configurations.

## Purpose
Extend Claude Code capabilities with custom tools and integrations.

## Tool Types
1. **MCP Servers**: Model Context Protocol servers for specialized functionality
2. **Custom Scripts**: Bash/Python scripts for specific tasks
3. **API Integrations**: External service connections
4. **Utilities**: Helper functions and utilities

## MCP Server Example
```json
{
  "mcpServers": {
    "custom-tool": {
      "command": "node",
      "args": ["./tools/custom-server.js"],
      "env": {
        "API_KEY": "${env:CUSTOM_API_KEY}"
      }
    }
  }
}
```

## Integration
- Add tool configurations to `.claude/config.json`
- Register MCP servers in settings
- Document tool usage and requirements
- Include examples for each tool

## Security
- Never commit API keys or secrets
- Use environment variables
- Validate all external inputs
- Follow least-privilege principle

# Claude Code Agentic Workflows - BizElevate

This workspace is configured for advanced Claude Code agentic workflows and multi-agent coordination.

## Quick Start

1. **Open in VS Code**
   ```bash
   code "C:\Users\Shiju Jabbar\OneDrive\Documents\Shiju\Projects\BizElevate\ClaudeCode"
   ```

2. **Verify Setup**
   - Ensure Claude Code extension is installed
   - Check that `.claude/config.json` exists
   - Review agent configurations in `.claude/agents.json`

3. **Start Using Claude Code**
   - Open the Claude Code panel in VS Code
   - Start a conversation with Claude
   - Claude will automatically use this workspace context

## Directory Structure

- **`.claude/`** - Claude Code configuration files
- **`.vscode/`** - VS Code workspace settings
- **`agents/`** - Custom agent implementations (create as needed)
- **`workflows/`** - Workflow definitions (create as needed)
- **`tools/`** - Custom tool integrations (create as needed)

## Configuration Files

### `.claude/config.json`
Main configuration for Claude Code:
- Agent settings
- Workspace configuration
- Tool and MCP settings
- Agentic workflow parameters

### `.claude/agents.json`
Agent definitions:
- **main**: Primary coordinator agent
- **researcher**: Research and exploration
- **tester**: Testing and validation

### `CLAUDE.md`
Project documentation that provides context to Claude Code agents.

## Features

- ✅ Multi-agent coordination enabled
- ✅ Parallel execution supported (max 3 concurrent agents)
- ✅ MCP integration for VS Code APIs
- ✅ Optimized context management (100k tokens)
- ✅ Auto-exclude common build artifacts

## Next Steps

1. Create your project folders (`agents/`, `workflows/`, `tools/`)
2. Define custom workflows as needed
3. Test agent coordination with simple tasks
4. Scale up to complex multi-agent workflows

## Documentation

- See `CLAUDE.md` for detailed workspace information
- Review `.claude/agents.json` for agent capabilities
- Check `.vscode/settings.json` for VS Code integration

## Support

For Claude Code help:
- Use `/help` command in Claude Code
- Visit: https://github.com/anthropics/claude-code/issues

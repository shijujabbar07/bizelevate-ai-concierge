# Custom Agents

This directory contains custom agent implementations for specialized tasks.

## Purpose
Define custom agents beyond the default configurations in `.claude/agents.json`.

## Structure
Each agent should have:
- Clear role definition
- Specific capabilities
- Tool permissions
- Usage examples

## Example Agent Definition
```json
{
  "id": "custom-agent",
  "name": "Custom Agent",
  "model": "claude-sonnet-4-5",
  "role": "Specialized task execution",
  "tools": {
    "bash": true,
    "textEditor": true
  }
}
```

## Usage
Reference custom agents in your workflows or invoke them directly through Claude Code.

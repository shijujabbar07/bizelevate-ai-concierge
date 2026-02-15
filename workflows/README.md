# Workflows

This directory contains workflow definitions for multi-agent coordination.

## Purpose
Define complex workflows that orchestrate multiple agents to accomplish larger tasks.

## Workflow Components
- **Triggers**: What initiates the workflow
- **Agents**: Which agents participate
- **Tasks**: Sequential or parallel task definitions
- **Outputs**: Expected results

## Example Workflow
```json
{
  "name": "code-review-workflow",
  "description": "Automated code review process",
  "agents": ["researcher", "tester", "main"],
  "steps": [
    {
      "agent": "researcher",
      "task": "analyze-code-changes",
      "parallel": false
    },
    {
      "agent": "tester",
      "task": "run-test-suite",
      "parallel": true
    },
    {
      "agent": "main",
      "task": "generate-review-report",
      "parallel": false,
      "dependsOn": ["analyze-code-changes", "run-test-suite"]
    }
  ]
}
```

## Best Practices
- Keep workflows modular
- Define clear dependencies
- Use parallel execution when possible
- Document expected inputs/outputs

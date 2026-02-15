# Documentation

Minimal documentation. Only what's needed to reuse or sell.

---

## Local Secrets Quickstart

### Committed (safe to push)

| File | Contents |
|------|----------|
| `.mcp.json` | MCP server config with `<PLACEHOLDER>` tokens |
| `.env.example` | Env var names, no values |
| `secrets.schema.json` | JSON Schema for `secrets.local.json` |

### NOT committed (gitignored — you create these locally)

| File | How to create |
|------|--------------|
| `.env` | Copy `.env.example` → `.env`, fill in real values |
| `.mcp.local.json` | Copy `.mcp.json` → `.mcp.local.json`, fill in real keys |
| `secrets.local.json` | Create per `secrets.schema.json`, fill in real keys |

### Where to put real secrets

| Secret | Where it lives at runtime |
|--------|--------------------------|
| VAPI webhook secret | VAPI Dashboard (Assistant → Server URL Secret) + n8n credential (Header Auth) |
| Twilio SID / Auth Token | n8n credential (HTTP Basic Auth) or `.env` for scripts |
| n8n API key | `.mcp.local.json` (for Claude Code n8n-mcp server) |
| OpenAI API key | n8n credential (OpenAI API) |
| Google Sheets OAuth | n8n credential (Google Sheets OAuth2) |

### If secrets were previously committed

All tracked files now use `<PLACEHOLDER>` tokens. If this repo was ever pushed
with real values, **regenerate every affected credential**:

1. VAPI — regenerate Server URL Secret in Dashboard
2. Twilio — rotate Auth Token in Console
3. n8n — delete and recreate API key in Settings → API

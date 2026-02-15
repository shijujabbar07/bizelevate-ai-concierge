# BizElevate Automation Lab

## Project Context

**Business:** BizElevate – AI automation consultancy for SMEs
**Target Market:** Clinics, service businesses, local operators
**Core Product:** AI Concierge solutions

### What We Build
- Inbound call handling
- Missed call recovery
- Appointment request automation
- Appointment change / cancellation intake
- After-hours triage
- FAQ deflection
- Lead capture workflows

### Deployment Model
Solutions are built for **multi-business rollout**:

- **Reusable core** – Shared logic, prompts, workflows, and tools
- **Client configuration** – Business-specific variables (name, hours, services, contacts)
- **Capability enablement** – Features enabled by available tools, not code forks
- **Custom extensions** – Added only when justified by client value

Design for reuse first.
Customise via configuration and tool enablement, **never by branching workflows**.

---

## Architecture Constraints (Non-Negotiable)

This project is **MCP-first by design**.

All external side effects **MUST** be executed via MCP tools.

### Hard Rules
- n8n is used **only** for orchestration, routing, retries, and logging
- n8n **must not** directly call providers such as:
  - Twilio
  - Google Sheets
  - Email services
  - Calendars
  - PMS / CRM APIs
- All such interactions **must be wrapped as MCP tools**
- Claude must not embed provider logic inside workflows

### Purpose of This Constraint
- Enable tiered, sellable product offerings
- Allow provider swaps without workflow changes
- Keep workflows stable as features expand
- Prevent tight coupling to vendors during demos

If a requested feature cannot be expressed as an MCP tool,
**Claude must stop and ask before proceeding**.

---

## MCP Tooling Model

Each MCP tool represents a **sellable capability**, not an implementation detail.

### Core Principles
- Tools are stateless where possible
- Tools accept and return structured JSON
- Tools hide vendor-specific logic
- Tools are idempotent when feasible
- Tool availability = feature gating

### Initial Tool Set (Phase 1 – Concierge Core)

**Starter Tier**
- `intake.save(context)`
- `notify.patient_sms(context)`
- `notify.clinic_summary(context)`

**Optional (internal or tool-based)**
- `triage.classify(context)`

### Future Expansion (Do Not Implement Prematurely)

**Pro Tier**
- `patient.lookup(context)`
- `availability.check(context)`

**Elite Tier**
- `appointment.create(context)`
- `appointment.reschedule(context)`
- `appointment.cancel(context)`
- `forms.send_previsit(context)`
- `followup.review_request(context)`

---

## Workflow Rules for Claude Code

When designing or modifying workflows, Claude **MUST**:

1. Assume MCP tools exist for all side effects
2. Reference tools by **capability name**, not vendor
3. Keep business logic out of n8n where it belongs in tools
4. Avoid shortcuts that bypass MCP for speed
5. Treat tool presence as product tier enforcement

If uncertain whether logic belongs in n8n or MCP:
- Default to MCP
- Ask explicitly before continuing

---

## Workspace Structure

ClaudeCode/
├── .mcp.json              # MCP server template — placeholders only (committed)
├── .mcp.local.json        # Real MCP config with secrets (gitignored)
├── .env.example           # Env var names — no values (committed)
├── .env                   # Real env values (gitignored)
├── secrets.schema.json    # Schema for secrets.local.json (committed)
├── secrets.local.json     # Real secrets file (gitignored)
├── .claude/               # Claude Code configuration
├── agents/                # Custom agent definitions
├── concierge/             # AI Concierge patterns
│   ├── prompts/           # Voice/chat prompts
│   ├── flows/             # n8n workflow exports
│   └── scripts/           # Deployment scripts
├── skills/                # n8n skill overrides / BizElevate-specific skills
├── tools/                 # MCP tool implementations
├── workflows/             # Workflow documentation
├── checklists/            # Pre-deploy, demo, handoff
├── src/                   # Custom code
└── docs/                  # Minimal documentation


---

## Development Principles

### File Operations
- Use absolute paths: `/home/claude/ClaudeCode/[file]`
- Verify file existence before modification
- Keep documentation minimal and outcome-focused

### Agent Coordination
- **Main Agent:** Architecture, workflow design, delivery
- **Researcher Agent:** APIs, feasibility, constraints
- **Tester Agent:** Validation for reusable or client-facing components

Delegate only when it reduces risk or time.

---

## Workflow Documentation

Every workflow must:
- Live in `/workflows/[workflow-name].md`
- Define:
  - Purpose and client value
  - Inputs and outputs
  - Intent paths
  - Happy path
  - 2–3 common failure paths
- Clearly state readiness:
  - **Demo-only**
  - **Pilot**
  - **Client-ready**

Avoid technical detail unless it reduces operational risk.

---

## Native vs Managed Trade-offs

| Choose Native Build | Choose Managed Platform |
|-------------------|------------------------|
| Custom logic required | Standard use case |
| Long-term cost matters | Speed to demo matters |
| Reliability can be owned | Vendor uptime acceptable |
| MCP abstraction needed | Direct integration acceptable (temporary) |

Default to managed platforms for demos.
Introduce native builds only when value is proven.

---

## Code Quality Standards (BizElevate)

- Production quality required **only** for:
  - Reusable MCP tools
  - Client-facing workflows
- Clarity over cleverness
- Comments explain **why**, not **what**
- Tests required only for:
  - Shared tool logic
  - Revenue-impacting execution paths

---

## Technology Stack

### Core Tools
- Claude Code CLI
- MCP (Model Context Protocol)
- n8n (orchestration only)
- Voice platforms (VAPI, Twilio)
- LLMs (Claude, OpenAI)

### Integration Focus
- Webhooks
- SMS / Email
- Calendars (read-first)
- Lightweight queues or CRMs

Avoid full PMS / EMR writes unless explicitly required.

---

## n8n MCP Server (Workflow Management)

The `n8n-mcp` server gives Claude Code direct access to n8n node documentation
and live workflow management via MCP.

> **This is a BUILD tool for Claude Code.**
> It is NOT a replacement for BizElevate capability MCP tools
> (`intake.save`, `notify.patient_sms`, etc.).
> Business side effects still go through BizElevate MCP tools.
> n8n MCP tools manage the orchestration layer only.

### Configuration (`.mcp.json` at project root)

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": ["n8n-mcp"],
      "env": {
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error",
        "DISABLE_CONSOLE_OUTPUT": "true",
        "N8N_API_URL": "https://bizelevate1.app.n8n.cloud",
        "N8N_API_KEY": "<your-api-key>"
      }
    }
  }
}
```

Get your API key from n8n → Settings → API → Create API Key.

> **Local override:** The committed `.mcp.json` contains **placeholders only**.
> Copy it to `.mcp.local.json` (gitignored), fill in real values, and point
> Claude Code at the local file when running locally.
> Never commit real keys to `.mcp.json`.

### Available Tools (20 total)

**Documentation & Discovery (always available, no API key needed)**

| Tool | Purpose |
|------|---------|
| `tools_documentation` | Quick-start guide and per-tool docs |
| `search_nodes` | Find n8n nodes by keyword |
| `get_node` | Get node info, properties, docs, version diffs |
| `validate_node` | Validate a single node configuration |
| `get_template` | Get a workflow template by ID |
| `search_templates` | Search 2,700+ workflow templates |
| `validate_workflow` | Validate a complete workflow JSON |

**Workflow Management (requires `N8N_API_URL` + `N8N_API_KEY`)**

| Tool | Purpose |
|------|---------|
| `n8n_create_workflow` | Create workflow (created inactive) |
| `n8n_get_workflow` | Get workflow by ID |
| `n8n_update_full_workflow` | Full replacement update |
| `n8n_update_partial_workflow` | Incremental diff updates (preferred) |
| `n8n_delete_workflow` | Permanently delete workflow |
| `n8n_list_workflows` | List all workflows |
| `n8n_validate_workflow` | Validate workflow by ID on instance |
| `n8n_autofix_workflow` | Auto-fix common validation errors |
| `n8n_test_workflow` | Trigger test execution |
| `n8n_executions` | Get, list, or delete executions |
| `n8n_health_check` | Check n8n instance connectivity |
| `n8n_workflow_versions` | Version history, rollback, cleanup |
| `n8n_deploy_template` | Deploy a template to the instance |

---

## n8n Skills Library

The `n8n-skills` package provides 7 expert knowledge files that teach Claude
how to use n8n-mcp tools correctly. Skills are context, not tools — they
activate automatically based on query content.

### Installation

```bash
git clone https://github.com/czlonkowski/n8n-skills.git
cp -r n8n-skills/skills/* ~/.claude/skills/
```

Windows:
```powershell
git clone https://github.com/czlonkowski/n8n-skills.git
Copy-Item -Recurse n8n-skills\skills\* $env:USERPROFILE\.claude\skills\
```

### Available Skills

| Skill | Activates When |
|-------|---------------|
| `n8n-mcp-tools-expert` | Searching nodes, managing workflows, using any n8n-mcp tool |
| `n8n-expression-syntax` | Writing `{{ }}` expressions, accessing `$json` variables |
| `n8n-workflow-patterns` | Building new workflows, choosing architecture patterns |
| `n8n-validation-expert` | Validation errors, false positives, fix loops |
| `n8n-node-configuration` | Configuring node operations, property dependencies |
| `n8n-code-javascript` | Writing JavaScript in Code nodes |
| `n8n-code-python` | Writing Python in Code nodes |

---

## How Claude Must Use n8n MCP Tools During Builds

### Workflow Build Sequence

1. `search_nodes` → find the right node types
2. `get_node` → get properties and configuration patterns
3. `n8n_create_workflow` → create the workflow (inactive)
4. `n8n_validate_workflow` → validate by ID
5. `n8n_autofix_workflow` → fix issues if any
6. `n8n_test_workflow` → trigger a test execution
7. Activate manually after verification

For updates, prefer `n8n_update_partial_workflow` over `n8n_update_full_workflow`.

### Two Tool Layers — Do Not Confuse

| Layer | Tools | Purpose |
|-------|-------|---------|
| **Build tools** (n8n-mcp) | `n8n_create_workflow`, `search_nodes`, etc. | Claude uses these to build/manage n8n workflows |
| **Business tools** (BizElevate MCP) | `intake.save`, `notify.patient_sms`, etc. | Workflows call these at runtime for side effects |

Claude builds workflows with n8n-mcp tools.
Those workflows call BizElevate MCP tools at runtime.
These are separate layers. Never substitute one for the other.

### Skill Template Adaptation Checklist

When using n8n templates or skill patterns in BizElevate workflows:

1. **Strip direct provider calls** — Remove any node that calls Twilio, Google Sheets,
   SendGrid, Slack, or any external API directly
2. **Replace with MCP tool references** — Substitute with the matching BizElevate
   MCP tool (`intake.save`, `notify.patient_sms`, `notify.clinic_summary`)
3. **Keep orchestration in n8n** — Routing, retries, IF/Switch, scheduling stay in n8n
4. **Validate the adapted workflow** — Run `n8n_validate_workflow` after changes
5. **Confirm tier alignment** — Check that every MCP tool used is available in the
   target product tier (Starter / Pro / Elite)

---

## Local Secrets Management

**No real secrets in committed files.** All tracked files use `<PLACEHOLDER>` tokens.

### File Layout

| File | Committed? | Purpose |
|------|-----------|---------|
| `.mcp.json` | Yes | MCP server template with placeholders |
| `.mcp.local.json` | **No** (gitignored) | Real MCP config with actual keys |
| `.env.example` | Yes | Lists required env var names |
| `.env` | **No** (gitignored) | Real env values for local use |
| `secrets.schema.json` | Yes | JSON Schema describing `secrets.local.json` |
| `secrets.local.json` | **No** (gitignored) | Runtime secrets (VAPI, Twilio, n8n keys) |

### Required Secrets

| Variable | Where to get it | Where it's used |
|----------|----------------|-----------------|
| `VAPI_WEBHOOK_SECRET` | VAPI Dashboard → Assistant → Server URL Secret | n8n webhook header auth, VAPI config |
| `N8N_API_KEY` | n8n → Settings → API → Create API Key | `.mcp.local.json` for Claude Code n8n-mcp |
| `TWILIO_ACCOUNT_SID` | Twilio Console → Account Info | n8n Twilio SMS node (HTTP Basic Auth user) |
| `TWILIO_AUTH_TOKEN` | Twilio Console → Account Info | n8n Twilio SMS node (HTTP Basic Auth password) |

### If Secrets Were Previously Committed

Secrets have been removed from tracked files and replaced with placeholders.
If this repo was ever pushed with real values, **rotate all affected credentials**:

1. **VAPI:** Dashboard → Assistant → regenerate Server URL Secret
2. **Twilio:** Console → Account → Auth Token → rotate
3. **n8n:** Settings → API → delete and create new API key

---

## Execution Best Practices

### Before Starting Any Task
1. Identify demo or client value
2. Confirm product tier impact
3. Choose simplest viable pattern
4. Proceed without over-design

### During Execution
- Build incrementally
- Validate early
- Keep scope tight
- Prefer shipping over polishing

### After Completion
- Confirm demo readiness
- Document reuse points
- Recommend the next highest-value step

---

## User Preferences

**Communication**
- Direct and concise
- Practical reasoning
- Call out poor ROI or fragility
- Action over theory

**Delivery Bias**
- Demo-ready
- Modular
- Low operational overhead
- Sustainable to sell and support

**Preferred Outputs**
- MCP tool schemas
- n8n workflow exports
- Voice prompts
- Checklists
- Clear recommendations

---

**Last Updated:** 15 Feb 2026 (v4 – n8n MCP Integration)
**Workspace Owner:** BizElevate

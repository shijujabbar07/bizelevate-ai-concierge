# Weekly AI Brief Agent — Build Prompt

This file contains the Claude Code build prompt used to generate
the enterprise workflow JSON. Preserved for reproducibility.

---

## Build Prompt (verbatim)

You are Claude Code acting as a senior n8n workflow engineer for BizElevate.

Goal: Create an ENTERPRISE-ready "Weekly AI Brief Agent" for n8n Cloud.

### Triggers
1. Schedule Trigger: Every Sunday at 6pm AEST (Australia/Brisbane)
2. Manual Trigger: For testing

### Config Node
Single source of truth Set node with:
- dateWindowDays = 7
- maxItemsPerFeed = 25
- maxTotalItems = 150
- tenantId = "BIZELEVATE_INTERNAL"
- notionDatabaseId / slackChannelId (placeholders)
- enableNotion / enableSlack / enableClaudeFallback toggles

### RSS Sources (9 feeds)
TechCrunch AI, The Verge AI, Ars Technica AI, Google AI Blog,
OpenAI Blog, Anthropic Blog, Hugging Face Blog, n8n Blog, Twilio Blog

### Placeholder Nodes
Newsletter intake (IMAP) and X/Twitter API — NoOp with notes.

### Processing Pipeline
1. Merge & Normalize all RSS items to: source, title, url, publishedAt, summary
2. Filter by date window (Config.dateWindowDays)
3. Dedupe using n8n static data (30-day rolling window)
4. Build markdown digest (max 12,000 chars)
5. Call OpenAI gpt-4o (temperature 0.3) with BizElevate business context prompt
6. Parse AI response
7. Deliver to Notion + Slack in parallel (controlled by config toggles)
8. Log run summary to static data

### AI System Prompt
Classification framework: BUSINESS RELEASE / BENCHMARK RELEASE / IRRELEVANT
Output format with sections: What Dropped, What's Relevant, What to Test,
Safe to Ignore, Benchmark vs Business Verdict.

### Delivery
- Notion: HTTP POST to /v1/pages (create page with brief content)
- Slack: HTTP POST chat.postMessage (formatted brief)
- Both controlled by Config toggles

### Constraints
- Placeholder credential IDs only (never hardcode secrets)
- Clean canvas layout: left triggers, middle processing, right delivery
- Node notes where manual setup needed
- Do not run or test the workflow

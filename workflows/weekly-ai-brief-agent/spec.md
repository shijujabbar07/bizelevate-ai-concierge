# Weekly AI Brief Agent — Specification

**Workflow:** BizElevate — Weekly AI Brief Agent (Enterprise)
**Type:** Internal R&D asset (not client-specific)
**Readiness:** Demo-only
**Last Updated:** 2026-02-17

---

## Purpose

Automated weekly AI news digest that filters signal from noise for BizElevate's
tech stack (VAPI, n8n, Twilio, OpenAI, Claude, Google Sheets). Runs every Sunday
at 6pm AEST, delivers a structured brief to Notion and Slack.

---

## Sources (RSS — Active)

| # | Source | Feed URL |
|---|--------|----------|
| 1 | TechCrunch AI | https://techcrunch.com/category/artificial-intelligence/feed/ |
| 2 | The Verge AI | https://www.theverge.com/rss/ai-artificial-intelligence/index.xml |
| 3 | Ars Technica AI | https://feeds.arstechnica.com/arstechnica/ai |
| 4 | Google AI Blog | https://blog.google/technology/ai/rss/ |
| 5 | OpenAI Blog | https://openai.com/blog/rss.xml |
| 6 | Anthropic Blog | https://www.anthropic.com/rss.xml |
| 7 | Hugging Face Blog | https://huggingface.co/blog/feed.xml |
| 8 | n8n Blog | https://blog.n8n.io/rss/ |
| 9 | Twilio Blog | https://www.twilio.com/blog/feed |

## Sources (Placeholder — Future)

**Newsletters (IMAP trigger):**
The Batch, Import AI, TLDR AI, Last Week in AI

**X/Twitter API:**
- High signal: @AndrewYNg, @demishassabis, @gdb, @Thom_Wolf, @jackclarkSF, @karpathy, @emollick
- Secondary: @levelsio, @rryssf_, @kloss_xyz, @EXM7777, @vasuman

---

## Processing Pipeline

1. **Trigger** — Schedule (Sunday 6pm AEST) or Manual
2. **Config** — Single source of truth for all parameters
3. **RSS Intake** — 9 feeds fetched in parallel
4. **Merge & Normalize** — Standardize fields: source, title, url, publishedAt, summary
5. **Filter by Date** — Keep only items within `dateWindowDays` (default 7)
6. **Dedupe** — Static data store, drop items seen in last 30 days
7. **Digest Builder** — Markdown digest, max 12,000 chars
8. **AI Analysis** — OpenAI gpt-4o, temperature 0.3, structured brief output
9. **Delivery** — Parallel: Notion page + Slack message (both toggleable)
10. **Run Summary** — Stats logged to static data

---

## Config Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| dateWindowDays | 7 | How far back to look for items |
| maxItemsPerFeed | 25 | Max items per RSS feed |
| maxTotalItems | 150 | Max items after merge |
| tenantId | BIZELEVATE_INTERNAL | Tenant identifier |
| notionDatabaseId | YOUR_NOTION_DATABASE_ID | Notion DB for briefs |
| slackChannelId | YOUR_SLACK_CHANNEL_ID | Slack channel for briefs |
| enableNotion | true | Toggle Notion delivery |
| enableSlack | true | Toggle Slack delivery |
| enableXPlaceholders | true | Future X/Twitter intake |
| enableNewsletterPlaceholders | true | Future newsletter intake |
| enableClaudeFallback | false | Future Claude API fallback |
| dedupeStore | data | Use n8n static data for dedupe |

---

## AI Classification Framework

Items are classified as:
- **BUSINESS RELEASE** — Directly impacts BizElevate workflows this week
- **BENCHMARK RELEASE** — Interesting but not actionable
- **IRRELEVANT** — Doesn't touch the tech stack

---

## Delivery Targets

| Target | Method | Auth |
|--------|--------|------|
| Notion | HTTP POST to /v1/pages | Bearer token (Notion integration) |
| Slack | HTTP POST chat.postMessage | Bearer token (Slack bot) |

---

## Business Context (Domain-Swappable)

The AI system prompt contains a "YOUR BUSINESS CONTEXT" block describing
BizElevate's stack. To repurpose this workflow for a different business,
swap only that block. Everything else (pipeline, classification framework,
output format) remains stable.

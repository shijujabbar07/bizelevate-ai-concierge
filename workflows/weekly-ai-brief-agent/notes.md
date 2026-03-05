# Weekly AI Brief Agent — Setup Notes

## How to Import

1. Open n8n Cloud (bizelevate1.app.n8n.cloud)
2. Click **+** → **Import from File**
3. Select `n8n/weekly-ai-brief-agent.enterprise.json`
4. Workflow imports as **inactive** — do not activate until setup is complete

---

## Credentials to Create

Create these credentials in n8n before activating:

### 1. OpenAI API Key
- **n8n credential type:** HTTP Header Auth
- **Header Name:** `Authorization`
- **Header Value:** `Bearer sk-your-openai-api-key`
- **Where to get it:** https://platform.openai.com/api-keys
- **Replace in workflow:** `YOUR_OPENAI_CREDENTIAL_ID`
- **Used by node:** "Call OpenAI API"

### 2. Notion Integration Token
- **n8n credential type:** HTTP Header Auth
- **Header Name:** `Authorization`
- **Header Value:** `Bearer ntn_your-notion-token`
- **Where to get it:** https://www.notion.so/my-integrations → Create integration
- **Replace in workflow:** `YOUR_NOTION_CREDENTIAL_ID`
- **Used by node:** "Post to Notion"
- **Additional setup:** Share your target Notion database with the integration

### 3. Slack Bot Token
- **n8n credential type:** HTTP Header Auth
- **Header Name:** `Authorization`
- **Header Value:** `Bearer xoxb-your-slack-bot-token`
- **Where to get it:** https://api.slack.com/apps → Create app → OAuth & Permissions
- **Required scopes:** `chat:write`, `chat:write.public`
- **Replace in workflow:** `YOUR_SLACK_CREDENTIAL_ID`
- **Used by node:** "Post to Slack"

---

## Placeholders to Replace

After import, find-and-replace these values in the workflow:

| Placeholder | Replace With | Where |
|-------------|-------------|-------|
| `YOUR_OPENAI_CREDENTIAL_ID` | Your n8n OpenAI credential ID | Call OpenAI API node → credentials |
| `YOUR_NOTION_CREDENTIAL_ID` | Your n8n Notion credential ID | Post to Notion node → credentials |
| `YOUR_SLACK_CREDENTIAL_ID` | Your n8n Slack credential ID | Post to Slack node → credentials |
| `YOUR_NOTION_DATABASE_ID` | Notion database ID (from URL) | Config node → notionDatabaseId |
| `YOUR_SLACK_CHANNEL_ID` | Slack channel ID (e.g., C0123456789) | Config node → slackChannelId |

**How to find credential IDs in n8n:**
1. Create the credential in n8n
2. Open the credential
3. The ID is in the URL: `credentials/[ID]`
4. Or check Settings → Credentials → click credential → URL contains ID

---

## Notion Database Setup

Create a Notion database with these properties:

| Property | Type |
|----------|------|
| Name | Title (default) |
| Date | Date |
| Status | Select (values: Draft, Published) |
| Type | Select (values: Weekly Brief) |

Share the database with your Notion integration.

---

## Slack Channel Setup

1. Create a channel (e.g., `#ai-brief`) or use an existing one
2. Invite the Slack bot to the channel: `/invite @YourBotName`
3. Get the channel ID: right-click channel → View channel details → scroll to bottom

---

## How to Test

1. Open the workflow in n8n editor
2. Click **Test Workflow** (uses the Manual Trigger path)
3. Check execution log for errors
4. Verify:
   - RSS feeds return items
   - Normalize/Filter/Dedupe produce output
   - OpenAI returns a structured brief
   - Notion page created (if enabled)
   - Slack message posted (if enabled)

---

## How to Activate

1. Complete all credential setup above
2. Replace all placeholders
3. Run a manual test successfully
4. Toggle the workflow to **Active**
5. It will run every Sunday at 6pm AEST automatically

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| RSS feeds return empty | Some feeds may block server IPs; check feed URL in browser first |
| OpenAI timeout | Increase timeout in HTTP Request node options |
| Notion 401 | Check integration token and database sharing |
| Slack 401 | Check bot token scopes and channel membership |
| All items deduped | Clear static data: Settings → Static Data → Clear |
| Date filter removes everything | Check timezone; workflow uses Australia/Brisbane |

---

## Node Versions Used

| Node Type | Version |
|-----------|---------|
| scheduleTrigger | 1.2 |
| manualTrigger | 1 |
| rssFeedRead | 1 |
| set | 3.4 |
| code | 2 |
| httpRequest | 4.2 |
| if | 2 |
| noOp | 1 |

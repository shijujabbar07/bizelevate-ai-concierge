# OpenClaw — Agent Workflows

**Account:** admin@bizelevate.au | **Bot:** @BizElvateBot | **Model:** openai/gpt-4o-mini
**Last Updated:** 2026-04-30

> This page covers daily operations and all reusable agent workflows. For VPS rebuild steps, see **OpenClaw — VPS Setup Guide**.

---

## Daily Start Sequence

### Step A — SSH into the VPS

```bash
ssh clawd@<VPS_IP>
```

> VPS IP is in Hostinger dashboard → VPS → KVM 1. Password in Norton Password Manager under "clawd VPS".

### Step B — Check if gateway is already running

```bash
screen -r openclaw
```

- **Reattaches and you see gateway logs** → already running. Detach: `Ctrl+A` then `D`. Bot is live.
- **"There is no screen to be resumed"** → gateway stopped. Go to Step C.
- **Reattaches and shows a prompt** → screen exists but gateway stopped. Run `openclaw gateway` inside it.

### Step C — Start the gateway (if not running)

```bash
screen -S openclaw
openclaw gateway
```

Wait for:

```
[gateway] listening on ws://127.0.0.1:18789
[telegram] starting provider (@BizElvateBot)
```

Detach: `Ctrl+A` then `D`

### Step D — Test in Telegram

Open @BizElvateBot in Telegram (web.telegram.org, logged in as admin@bizelevate.au) and send `/start`.

Expected reply: "Hey Shiju! I just came online. How can I assist you today?"

---

## Stop the Gateway

```bash
screen -r openclaw
```

Then `Ctrl+C` inside the screen. Expected output:

```
signal SIGINT received
shutting down
```

---

## Configuration Changes

### Change AI Model

```bash
openclaw configure --section model
```

Current: `openai/gpt-4o-mini`. Restart gateway after changing.

### Change Web Search

```bash
openclaw configure --section web
```

Current: Gemini (Google Search). API key stored in config.

Verify web search is working — send to Bizzy in Telegram:
```
What is today's weather in Melbourne, Victoria?
```

### Add or Change Skills

```bash
openclaw configure --section skills
```

| Skill | Key Required | Status | When to Enable |
|-------|-------------|--------|----------------|
| goplaces | GOOGLE_PLACES_API_KEY | Not configured | Enable for clinic prospecting (first priority) |
| notion | NOTION_API_KEY | Not configured | Enable to write research outputs directly to Notion |
| openai-image-gen | OPENAI_API_KEY | Not configured | Enable for marketing content |
| openai-whisper-api | OPENAI_API_KEY | Not configured | Enable for voice transcription |
| nano-banana-pro | GEMINI_API_KEY | Not configured | Gemini model skill |
| sag | ELEVENLABS_API_KEY | Not configured | Enable for voice synthesis |

Restart gateway after adding any skill.

### Change Telegram Bot

```bash
openclaw configure --section telegram
```

Current bot: @BizElvateBot (token stored in config).

---

## Health Check Commands

```bash
openclaw --version        # Confirm install
openclaw configure        # View/update full config
openclaw pairing list     # List approved Telegram users
```

```bash
cat ~/.openclaw/openclaw.json   # Full config including stored API keys
```

---

## Reconnect After Closing SSH

```bash
ssh clawd@<VPS_IP>
screen -r openclaw
```

If you logged in as root by mistake:

```bash
su - clawd
screen -r openclaw
```

---

## Agent Workflow Catalog

Each workflow below is a reusable prompt. Copy into Telegram, fill in the bracketed variables, send to Bizzy.

---

### W-01 — Clinic Prospect Builder

**Purpose:** Sweep a suburb for clinics matching a target specialty. Build prospect list.
**Skill needed:** Works with web search. `goplaces` improves structured output.
**Output:** Paste results into the Prospect Pipeline Notion table or Supabase.

**Prompt:**
```
Search for [dental / physio / chiro / GP] clinics in [suburb], [state] Australia.

For each clinic found, return:
- Business name
- Phone number
- Website URL
- Google review count and star rating
- Whether they have online booking visible on their site (yes / no / unclear)

Return as a numbered list. Target 10–15 results.
```

**Suburbs already searched:**
| Date | Specialty | Suburb/Region | Results captured |
|------|-----------|--------------|-----------------|
| 2026-04 | Dental | (initial market search) | Yes |

---

### W-02 — Lead Enrichment

**Purpose:** Deep research on a single prospect clinic before outreach.
**Skill needed:** Web search only.
**Output:** Paste into the clinic's Notion CRM record or Todoist task description.

**Prompt:**
```
Research [Clinic Name] located in [suburb/address].

Find and return:
- Practice manager or principal dentist name (if publicly visible)
- Email address (if listed on website or directories)
- Full list of services offered
- Whether they have online booking, and which system (HotDoc, Cliniko, HealthEngine, phone-only, other)
- Google review count and star rating
- Any recent reviews (last 12 months) mentioning missed calls, wait times, after-hours issues, or staff responsiveness
- Any signs of growth or expansion (new locations, job ads, recent news)

Summarise pain points that CustomerReach Respond, Answer, or Remind would address.
```

---

### W-03 — Demo Prep Brief

**Purpose:** 1-page brief before a prospect sales call or demo.
**Skill needed:** Web search only.
**Output:** Use in demo script. Paste into Todoist task for the meeting.

**Prompt:**
```
Prepare a 1-page sales demo brief for [Clinic Name] in [suburb].

Structure it as:

**Overview:** Name, location, specialty, size (staff/chairs if estimable), years operating.

**Current Setup:** Booking method, phone system clues, online presence quality.

**Pain Points:** Based on Google reviews and website — what problems are visible (missed calls, wait times, after-hours coverage, no-show language, understaffing signals)?

**BizElevate Fit:**
- CustomerReach Respond: [relevant / not relevant — why]
- CustomerReach Answer: [relevant / not relevant — why]
- CustomerReach Remind: [relevant / not relevant — why]

**Suggested Opening:** One sentence to open the demo call that references something specific to their situation.
```

---

### W-04 — Competitor Intelligence Sweep

**Purpose:** Weekly check on what competitors and adjacent vendors are doing.
**Skill needed:** Web search only.
**Run cadence:** Weekly, Monday morning.

**Prompt:**
```
Search for any announcements, product updates, pricing changes, new features, or case studies published in the last 7 days from these vendors:
- HotDoc (clinic software, Australia)
- HealthEngine (booking platform, Australia)
- AutoMed Systems (practice automation)
- Precedence Health (AI for clinics)
- Any new AI-powered phone or SMS automation product launched for Australian dental or medical clinics

For each vendor with something new: summarise in 2–3 bullet points.
If nothing new found for a vendor: just write "No updates."
```

---

### W-05 — Client Onboarding Research Brief

**Purpose:** Research a new client before configuring their AI concierge.
**Skill needed:** Web search only.
**Output:** Use to pre-fill the client config template (hours, services, staff names, booking system).

**Prompt:**
```
Research [Clinic Name] for AI concierge onboarding configuration.

Find and return:
- Business hours (from website, Google, or both — note if they differ)
- After-hours message or policy (if any visible)
- Full services list
- Staff names visible on the website (dentists, managers, front desk)
- Phone number(s) listed
- Booking system in use (HotDoc, Cliniko, HealthEngine, phone-only, other)
- Emergency or after-hours contact policy (if stated)

Flag anything ambiguous — I'll confirm with the client directly.
```

---

### W-06 — n8n Execution Health Check

**Purpose:** Check if any n8n workflows have failed recently. Alert if so.
**Skill needed:** web_fetch (already enabled). Requires n8n API key.
**Run cadence:** On demand, or daily during active client periods.

**Prompt:**
```
Fetch the n8n execution log from https://bizelevate1.app.n8n.cloud/api/v1/executions?status=error&limit=10

Use the API key from my config (ask me if you don't have it).

For each failed execution: return the workflow name, error message, and time of failure.
If no failures in the last 24 hours, say "All clear."
```

---

## Session Output Handling

Agent outputs from Telegram must land somewhere structured — not left in chat.

| Output type | Where it goes |
|------------|--------------|
| Prospect list (W-01) | Notion Prospect Pipeline table or Supabase |
| Lead enrichment (W-02) | Todoist task description for that clinic |
| Demo brief (W-03) | Todoist task for the meeting + Notion if reusable |
| Competitor sweep (W-04) | Notion Competitive Intel page (create if needed) |
| Onboarding brief (W-05) | Notion client page (create at onboarding) |
| n8n health check (W-06) | Telegram reply only unless failure, then Todoist task |

---

## Skills Enablement Priority

Enable in this order as GTM progresses:

1. **goplaces** — unlocks structured clinic prospecting (W-01). Enable before next prospect sweep.
2. **notion** — lets agent write directly to Notion. Removes manual copy-paste from W-01 to W-05.
3. **openai-image-gen** — enable when content marketing starts.
4. **openai-whisper-api / sag** — enable if voice workflows are needed.

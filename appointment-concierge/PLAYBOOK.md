# BizElevate AI Concierge Delivery Playbook — Appointment Concierge

**Purpose**: Repeatable, engineer-proof playbook for BizElevate AI Concierge builds. Every step is concrete, every prompt is copy-pasteable, every gate is binary pass/fail.

**Project**: Appointment Request Concierge — inbound voice call → data capture → SMS confirmation

**Lifecycle** (6 phases): Architecture + Scope (Phase 0) → n8n Workflow Deployment (Phase 1) → Google Sheets Setup (Phase 2) → VAPI Agent Configuration (Phase 3) → Integration Testing (Phase 4) → Demo Preparation (Phase 5)

---

## Document Rules

- This is a **living document**. Updates are made as change log entries + modified sections (not add-on fragments).
- **Claude Code Mode** = prompts designed to be pasted directly into Claude Code CLI. This is the preferred execution method.
- **Manual Mode** = fallback only, used for VAPI dashboard or Google Sheets setup (no API available).
- Every phase ends with a **Gate** — a binary pass/fail check. Do not proceed to the next phase until the gate passes.
- All API calls use `--ssl-no-revoke` on Windows/bash due to schannel certificate check behaviour.

---

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| v1.0 | 2026-03-01 | Initial playbook — covers full lifecycle from blank state to demo-ready |
| v1.1 | 2026-03-05 | Added Phase 6 (Management App + Supabase). Updated stack, workflow diagram, next capabilities. Reflects v2.1 VAPI prompt (no tools, transcript-only extraction, phone validation). |
| v1.2 | 2026-03-05 | Added `clients` table to Phase 6 Supabase schema. `client_subscriptions` now references `clients.id` via FK. Supports multi-industry rollout. |
| v1.3 | 2026-03-05 | Phase 6.2 implemented. Two Supabase write nodes deployed to n8n (after Phone Valid? on both branches). SQL moved to `supabase/migrations/` and `supabase/seeds/`. Phase 6.2 section updated to reflect actual implementation. |

---

## Scope Boundaries (Read This First)

### What this capability IS

- Inbound phone call handled by VAPI voice agent (Alex, dental/clinic persona)
- Agent collects: patient name, phone number, preferred date/time, reason for visit
- At end of call, VAPI fires `end-of-call-report` webhook to n8n
- n8n: normalises payload → AI Decision Agent classifies urgency (routine / urgent / emergency) → saves row to Google Sheets → sends patient SMS confirmation
- During the call, VAPI can call two tools via n8n webhook: `check_availability` (soft confirmation) and `save_intake` (mid-call capture)
- Patient receives SMS: "Hi [Name], thanks for calling. We received your appointment request for [date/time]. A team member will call you within 2 hours to confirm."
- Staff open Google Sheet to see all captured requests with urgency classification

### What this capability IS NOT

- No real availability lookup (check_availability returns a polite soft response)
- No calendar booking (no `.ics` or calendar API)
- No PMS / EMR integration
- No patient lookup or history
- No staff notification SMS/email (only patient SMS)
- No escalation path for emergency calls (agent verbally advises 000; no automated escalation)
- No deduplication across multiple calls from the same number
- No Slack or Notion logging (those are in the Weekly AI Brief, not this capability)

### Roles

| Role | Who | What they do |
|------|-----|--------------|
| Patient / Caller | Anyone calling the clinic number | Speaks to VAPI agent, receives SMS |
| Clinic Staff | Clinic operator | Opens Google Sheet to see captured requests |
| BizElevate Admin | You | Configures VAPI, n8n, sheets; monitors executions |

---

## Stack Reference

| Layer | Tool | What it does |
|-------|------|-------------|
| Voice Agent | VAPI | Handles the inbound call, collects data, fires webhook |
| Orchestrator | n8n Cloud | Receives webhook, runs Decision Agent, writes sheet, writes audit log, sends SMS |
| AI Classification | OpenAI GPT-4o-mini | Decision Agent classifies urgency, cleans data |
| Operational Store | Google Sheets | Appointment request log — clinic staff view (current) |
| Audit / Reporting Store | Supabase | Multi-capability audit log — powers management app (Phase 6) |
| Management App | TBD (Supabase-native or Next.js) | Client-facing dashboard — call volume, urgency breakdown, SMS status, per-capability |
| SMS | Twilio | Sends patient confirmation SMS |

---

## Live Configuration Reference

| Key | Value |
|-----|-------|
| n8n instance | `https://bizelevate1.app.n8n.cloud` |
| Workflow ID (Concierge) | `HKHwb6mpWdvGcR070E8or` |
| Webhook path | `vapi-appointment` |
| Webhook URL (full) | `https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment` |
| VAPI webhook secret | `bze_vapi_2024_x7k9m2p4q8r1s5t3` |
| Google Sheet ID | `1hUBJx6sq3Yx60JKcBQ3yin-n1xp_Hgh0ANjEwkwPq08` |
| Google Sheet URL | `https://docs.google.com/spreadsheets/d/1hUBJx6sq3Yx60JKcBQ3yin-n1xp_Hgh0ANjEwkwPq08` |
| Twilio From number | `+61485004338` |
| Twilio Account SID | `AC907df5d9b5370eb5dd779a5b77754374` |

### n8n Credential IDs (live instance)

| Credential | ID | What it authenticates |
|-----------|----|-----------------------|
| VAPI Webhook Secret | `Ck4d0aQ25lXWswrJ` | Validates incoming VAPI webhook header |
| Google Sheets OAuth2 | `djBmxfLZ2tr7uYSn` | Writes rows to Google Sheet |
| OpenAI API | `0WYhIRpuxxCXNvs3` | GPT-4o-mini for Decision Agent |
| Twilio Basic Auth | `Vpy229UTG1RYrPP0` | Sends SMS via Twilio API |

---

## File Reference

```
appointment-concierge/
├── PLAYBOOK.md                    ← this document
├── README.md                      ← capability overview
├── n8n/
│   ├── workflow.json              ← source-of-truth workflow (22 nodes, deploy via API)
│   └── SETUP.md                  ← n8n credential + import guide
├── vapi/
│   ├── assistant-config.json      ← REFERENCE ONLY — extract serverUrl, tools, analysisPlan
│   └── SETUP.md                  ← VAPI dashboard config guide
├── google-sheets/
│   ├── SETUP.md                  ← sheet tab + header setup guide
│   └── template.csv              ← 9 column headers ready to paste
└── docs/
    ├── IMPLEMENTATION.md          ← full deployment checklist
    ├── PAYLOAD-CONTRACT.md        ← API contracts for all integrations
    └── TEST-PAYLOADS.md           ← 5 cURL test payloads (routine / urgent / emergency)
```

---

## ⚡ RESUME POINT — Where You Are Now

**Date**: 2026-03-01

**Status**: Phase 4 (Integration Testing) complete via webhook. Ready for Phase 3 (VAPI Config) manual step + Phase 5 (Demo Prep).

**Completed so far**:
- [x] Phase 0: Architecture defined, scope documented
- [x] Phase 1: n8n workflow deployed and active (`HKHwb6mpWdvGcR070E8or`)
  - [x] Twilio SID placeholder replaced with `AC907df5d9b5370eb5dd779a5b77754374`
  - [x] Flatten Decision Output node added (fixes LangChain `output` wrapping bug)
  - [x] Google Sheets `sheetName` fixed from `mode: list` to `mode: id, value: 0`
  - [x] Twilio Basic Auth credential updated with correct auth token
- [x] Phase 2: Google Sheet exists and credential works. **Headers still need to be added to row 1** (manual step).
- [ ] Phase 3: VAPI agent not yet configured. Server URL + secret + tools + analysis plan pending.
- [x] Phase 4 (partial): End-to-end webhook test passed (execution 599 = success). Full VAPI call test pending Phase 3 completion.
- [ ] Phase 5: Demo prep not started.

**Next immediate actions** (in order):
1. Add headers to Google Sheet row 1 (5 min, manual)
2. Configure VAPI assistant (10 min, VAPI dashboard)
3. Make a real test call
4. Clear test data from sheet, run demo

---

# PHASE 0 — Architecture + Scope

**Where**: Claude Code (planning only — no changes)

**Goal**: Confirm the capability design, agree scope, and align on demo acceptance criteria.

### Acceptance criteria for a successful demo

- [ ] VAPI agent answers an inbound call and collects name, phone, date/time, reason
- [ ] A row appears in the Google Sheet within 30 seconds of the call ending
- [ ] Urgency is classified correctly (routine/urgent/emergency)
- [ ] Patient receives an SMS within 60 seconds of the call ending
- [ ] SMS reads: "Hi [FirstName], thanks for calling. We received your appointment request for [date/time]. A team member will call you within 2 hours to confirm. Reply STOP to opt out."

### Architecture decisions (locked)

| Decision | Choice | Reason |
|----------|--------|--------|
| Voice agent | VAPI | Fastest to configure, reliable webhook, structured data extraction |
| Orchestrator | n8n Cloud | BizElevate standard, existing credentials |
| Urgency classification | LangChain Decision Agent (GPT-4o-mini) | AI-native, accurate, low cost (~$0.001 per call) |
| Data store | Google Sheets | Zero setup for clinic staff, familiar, no login required |
| SMS provider | Twilio | Existing account and credential in n8n |
| Auth on webhook | VAPI header secret | Prevents webhook abuse |

### Gate

- [x] Scope boundaries agreed (see above)
- [x] Acceptance criteria defined
- [x] Stack confirmed
- [x] Repository at `appointment-concierge/` created with all reference files

---

# PHASE 1 — n8n Workflow Deployment

**Where**: Claude Code CLI (API push — no manual import)

**Goal**: Deploy the workflow to n8n Cloud with all credentials connected and the workflow active.

### Workflow architecture (current — v2.1, no mid-call tools)

```
VAPI Webhook
  ↓
Route by Message Type
  ├── [tool-calls] → Extract Tool Call → Route Check Availability    (INACTIVE in v2 — tools removed from VAPI assistant)
  │                                          ├── Handle Check Availability → Respond Tool Result
  │                                          └── Route Save Intake
  │                                                  ├── Handle Save Intake (Sheets) → Handle Save Intake Respond → Respond Tool Result
  │                                                  └── Handle Unknown Tool → Respond Tool Result
  └── [other] → Route - End of Call
                    ├── [end-of-call-report] → Normalize VAPI Payload (Code node) → Decision Agent (GPT-4o-mini + transcript)
                    │                           └── Flatten Decision Output → Route by Decision
                    │                                   ├── [process_appointment] → Save to Google Sheets → Phone Valid?
                    │                                   │                                                       ├── [valid]   → Send Patient SMS → Respond Success
                    │                                   │                                                       └── [invalid] → Respond No SMS
                    │                                   └── [acknowledge_only] → Respond Acknowledge
                    └── [other] → Respond Fast Ack
```

> **v2.1 changes from original**: (1) Tools removed from VAPI assistant — tool-call path exists in n8n but is never triggered. (2) Normalize is now a Code node (Set node broke on transcript newlines). (3) Transcript passed to Decision Agent so it can extract patient data without VAPI Analysis Plan. (4) Phone Valid? IF node added — skips SMS if no valid Australian mobile (04XXXXXXXX) was collected, but still writes to Sheets for audit.

### Step 1: Verify workflow is live

**Claude Code prompt:**

```
Check the live n8n workflow status for the Appointment Request Concierge.

Workflow ID: HKHwb6mpWdvGcR070E8or
Instance: https://bizelevate1.app.n8n.cloud

Use curl --ssl-no-revoke with the API key from .mcp.local.json.

Confirm:
- Workflow is active (active: true)
- Node count is 22
- Credentials attached: VAPI Webhook Secret (Ck4d0aQ25lXWswrJ), Google Sheets OAuth2 (djBmxfLZ2tr7uYSn), OpenAI API (0WYhIRpuxxCXNvs3), Twilio Basic Auth (Vpy229UTG1RYrPP0)
- SMS node URL does NOT contain <TWILIO_ACCOUNT_SID> placeholder
- Flatten Decision Output node exists (id: flatten-decision-output)
- Google Sheets sheetName mode is "id" with value "0" (not mode "list")

Report pass/fail for each check.
```

### Step 2: Deploy from local file (if workflow needs to be re-deployed from scratch)

**Claude Code prompt:**

```
Deploy the Appointment Request Concierge workflow to n8n Cloud.

Source file: appointment-concierge/n8n/workflow.json
Instance: https://bizelevate1.app.n8n.cloud
API key: from .mcp.local.json

Steps:
1. Read the workflow.json file
2. Check if workflow HKHwb6mpWdvGcR070E8or exists (GET /api/v1/workflows/HKHwb6mpWdvGcR070E8or)
3. If it exists: PUT the workflow (full replacement)
4. If it does not exist: POST to /api/v1/workflows to create it
5. After deploy: PATCH /api/v1/workflows/{id}/activate to activate it
6. Confirm active: true

Use --ssl-no-revoke on all curl calls.
Report the workflow ID and active status after deployment.
```

### Step 3: Update Twilio credential (if 401 errors on SMS)

**Claude Code prompt:**

```
Update the Twilio Basic Auth credential in n8n with the correct credentials.

Credential ID: Vpy229UTG1RYrPP0
Instance: https://bizelevate1.app.n8n.cloud
API key: from .mcp.local.json

Use PATCH /api/v1/credentials/Vpy229UTG1RYrPP0 with body:
{"data": {"user": "AC907df5d9b5370eb5dd779a5b77754374", "password": "<TWILIO_AUTH_TOKEN from .env>"}}

Use --ssl-no-revoke. Report HTTP status of the PATCH call.
```

### n8n node reference

| Node ID | Name | Purpose |
|---------|------|---------|
| `webhook-vapi` | VAPI Webhook | Entry point — POST /webhook/vapi-appointment, header auth |
| `route-message-type` | Route by Message Type | IF message.type == "tool-calls" |
| `extract-tool-call` | Extract Tool Call | Parses toolCallId, toolName, toolArgs from VAPI payload |
| `route-check-availability` | Route - Check Availability | IF toolName == "check_availability" |
| `handle-check-availability` | Handle Check Availability | Returns soft availability message to VAPI |
| `route-save-intake` | Route - Save Intake | IF toolName == "save_intake" |
| `handle-save-intake` | Handle Save Intake | Appends intake row to Google Sheets (mid-call) |
| `handle-save-intake-respond` | Handle Save Intake Respond | Returns confirmation message to VAPI |
| `handle-unknown-tool` | Handle Unknown Tool | Fallback for unrecognised tool calls |
| `respond-tool-result` | Respond Tool Result | Sends tool response JSON back to VAPI |
| `route-end-of-call` | Route - End of Call | IF message.type == "end-of-call-report" |
| `respond-fast-ack` | Respond Fast Ack | Immediate `{"received": true}` for non-end-of-call messages |
| `normalize-payload` | Normalize VAPI Payload | Set node — extracts structured fields from nested VAPI payload |
| `decision-agent` | Decision Agent | LangChain agent (GPT-4o-mini) — classifies urgency, cleans data |
| `openai-model` | OpenAI Chat Model | GPT-4o-mini, temp 0.1, attached to Decision Agent |
| `output-parser` | Structured Output Parser | JSON schema parser attached to Decision Agent |
| `flatten-decision-output` | Flatten Decision Output | Code node — unwraps `$json.output` from LangChain |
| `route-decision` | Route by Decision | IF action == "process_appointment" |
| `save-to-sheets` | Save to Google Sheets | Appends 9-column row to Sheet gid 0 |
| `send-sms` | Send Patient SMS | POST to Twilio API — sends SMS to patient |
| `respond-success` | Respond Success | Returns `{success: true, urgency: ..., message: ...}` |
| `respond-acknowledge` | Respond Acknowledge | Returns `{success: true, action: "acknowledged"}` for non-appointment events |

### Gate

- [ ] `active: true` confirmed via API
- [ ] 22 nodes confirmed
- [ ] All 4 credentials attached with correct IDs
- [ ] `Flatten Decision Output` node present
- [ ] SMS URL has real Twilio SID (not `<TWILIO_ACCOUNT_SID>`)
- [ ] `sheetName.mode` is `"id"` with `value: "0"`

---

# PHASE 2 — Google Sheets Setup

**Where**: Browser (Google Sheets) — manual only

**Goal**: Ensure the sheet has the correct tab structure and headers so the n8n append operation maps correctly.

### Sheet details

| Field | Value |
|-------|-------|
| Sheet ID | `1hUBJx6sq3Yx60JKcBQ3yin-n1xp_Hgh0ANjEwkwPq08` |
| URL | `https://docs.google.com/spreadsheets/d/1hUBJx6sq3Yx60JKcBQ3yin-n1xp_Hgh0ANjEwkwPq08` |
| Credential in n8n | Google Sheets OAuth2 (`djBmxfLZ2tr7uYSn`) |
| Target tab | First tab (gid 0) — rename it to "Appointments" |

### Step 1: Open the sheet

Go to the URL above. If you get an access error, the Google account in n8n credential `djBmxfLZ2tr7uYSn` must own or have edit access to this sheet.

### Step 2: Rename the tab

Right-click the "Sheet1" tab at the bottom → Rename → type `Appointments` → Enter.

> The n8n node uses `sheetName: {mode: "id", value: "0"}` which targets the **first tab by gid**, not by name. Renaming to "Appointments" is for human readability only — the workflow will work regardless of the tab name.

### Step 3: Add headers to row 1

Click cell A1. Type or paste (use the CSV below) the following headers across row 1:

```
Timestamp | Call ID | Patient Name | Phone | Requested Date/Time | Reason | Urgency | Status | Notes
```

Using the template CSV file (`appointment-concierge/google-sheets/template.csv`):
1. Copy the header row from the CSV
2. Click cell A1 in the sheet
3. Paste

**Column mapping** (how n8n writes each column):

| Column | n8n expression | Example value |
|--------|----------------|---------------|
| A: Timestamp | `$json.timestamp` | `2026-03-01T05:14:35.745Z` |
| B: Call ID | `$json.callId` | `call_abc123` |
| C: Patient Name | `$json.patientName` | `Sarah Johnson` |
| D: Phone | `$json.patientPhone` | `+61412345678` |
| E: Requested Date/Time | `$json.requestedDateTime` | `Tuesday 10am` |
| F: Reason | `$json.reason` | `Annual check-up` |
| G: Urgency | `$json.urgency` | `routine` |
| H: Status | `"new"` (hardcoded) | `new` |
| I: Notes | `""` (empty) | — |

### Step 4: Format the sheet (optional — recommended for demo)

- Freeze row 1: View → Freeze → 1 row
- Bold row 1
- Set column G (Urgency) conditional formatting:
  - `routine` → green background
  - `urgent` → orange background
  - `emergency` → red background

### Gate

- [ ] Sheet accessible at the URL above
- [ ] Tab renamed to "Appointments" (or at minimum, it is the first tab)
- [ ] Row 1 contains all 9 headers in columns A–I
- [ ] Row 1 is frozen (optional but recommended)

---

# PHASE 3 — VAPI Agent Configuration

**Where**: VAPI Dashboard (app.vapi.ai) — manual only

**Goal**: Configure your existing VAPI assistant (Alex) to connect to the n8n webhook for tool calls and end-of-call processing.

> **Important**: Do NOT replace the existing Alex dental assistant system prompt. Only add the webhook configuration, tools, and analysis plan described below.

### Step 1: Open your VAPI assistant

1. Go to `https://app.vapi.ai`
2. Open your existing assistant (Alex / dental clinic persona)

### Step 2: Set Server URL

In the **Server** section of the assistant settings:

| Field | Value |
|-------|-------|
| Server URL | `https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment` |
| Server URL Secret | `bze_vapi_2024_x7k9m2p4q8r1s5t3` |

The secret is sent as the `x-vapi-secret` header on every webhook call. The n8n VAPI Webhook node validates this header.

### Step 3: Set Server Messages

Enable these server message events (uncheck all others if possible):

- [x] `end-of-call-report`

The `end-of-call-report` fires when the call ends and includes the transcript, structured data, and call metadata.

### Step 4: Add Tools

Add two server-side tools. The full schema is in `appointment-concierge/vapi/assistant-config.json` (the `tools` array). Summary:

**Tool 1: `check_availability`**

```json
{
  "type": "function",
  "function": {
    "name": "check_availability",
    "description": "Check if a specific date and time is available for an appointment. Call this when the patient asks about a specific date/time slot.",
    "parameters": {
      "type": "object",
      "properties": {
        "date": { "type": "string", "description": "The requested date (e.g., Monday, March 3rd, next Tuesday)" },
        "time": { "type": "string", "description": "The requested time (e.g., 2pm, morning, afternoon)" }
      },
      "required": ["date", "time"]
    }
  },
  "server": {
    "url": "https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment",
    "secret": "bze_vapi_2024_x7k9m2p4q8r1s5t3"
  }
}
```

**Tool 2: `save_intake`**

```json
{
  "type": "function",
  "function": {
    "name": "save_intake",
    "description": "Save the patient's appointment request details once all information has been collected. Call this after confirming the patient's name, phone, preferred date/time, and reason.",
    "parameters": {
      "type": "object",
      "properties": {
        "patientName": { "type": "string", "description": "Patient's full name" },
        "patientPhone": { "type": "string", "description": "Patient's phone number with country code" },
        "requestedDateTime": { "type": "string", "description": "Preferred appointment date and time" },
        "reason": { "type": "string", "description": "Reason for the appointment visit" }
      },
      "required": ["patientName", "patientPhone"]
    }
  },
  "server": {
    "url": "https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment",
    "secret": "bze_vapi_2024_x7k9m2p4q8r1s5t3"
  }
}
```

### Step 5: Add Analysis Plan (Structured Data Extraction)

Add this in the **Analysis Plan** section of the assistant. This runs after every call and extracts patient data from the transcript — it feeds into the `end-of-call-report` payload.

**Structured Data Prompt:**
```
Extract the following from the call transcript:
- patientName: The caller's full name
- patientPhone: The caller's phone number (digits only, with country code if provided)
- requestedDateTime: The preferred appointment date and time
- reason: The reason for the appointment visit

Return as JSON. Use null for any field not clearly provided.
```

**Structured Data Schema:**
```json
{
  "type": "object",
  "properties": {
    "patientName": { "type": "string" },
    "patientPhone": { "type": "string" },
    "requestedDateTime": { "type": "string" },
    "reason": { "type": "string" }
  }
}
```

**Success Evaluation Prompt:**
```
Evaluate if the call successfully collected: patient name, phone number, preferred date/time, and reason for visit. Return 'success' if all four were collected, 'partial' if some were missing, 'failed' if call was abandoned or unsuccessful.
```

### Step 6: Save and publish

Save the assistant configuration. Changes take effect immediately — no restart required.

### Gate

- [ ] Server URL set to `https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment`
- [ ] Server URL Secret set to `bze_vapi_2024_x7k9m2p4q8r1s5t3`
- [ ] `end-of-call-report` server message enabled
- [ ] `check_availability` tool added with correct schema and server URL
- [ ] `save_intake` tool added with correct schema and server URL
- [ ] Structured Data Prompt added to Analysis Plan
- [ ] Structured Data Schema added to Analysis Plan
- [ ] Configuration saved

---

# PHASE 4 — Integration Testing

**Where**: Claude Code CLI (webhook tests) + VAPI test call

**Goal**: Validate the full end-to-end flow. A row must appear in Google Sheets and the patient must receive an SMS.

### Test A: Webhook test (no VAPI needed)

Send a test `end-of-call-report` payload directly to the webhook.

**Claude Code prompt:**

```
Send a test end-of-call-report payload to the n8n Appointment Request Concierge webhook.

Webhook URL: https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment
VAPI secret header: x-vapi-secret: bze_vapi_2024_x7k9m2p4q8r1s5t3

Payload:
{
  "message": {
    "type": "end-of-call-report",
    "call": {
      "id": "test_webhook_001",
      "status": "ended",
      "customer": { "number": "+61412345678" }
    },
    "transcript": "Patient called to book annual check-up on Tuesday at 10am.",
    "analysis": {
      "structuredData": {
        "patientName": "Sarah Johnson",
        "patientPhone": "+61412345678",
        "requestedDateTime": "Tuesday 10am",
        "reason": "Annual check-up"
      }
    }
  }
}

Use curl --ssl-no-revoke.
Expected response: {"success":true,"action":"process_appointment","urgency":"routine","message":"Appointment request processed, SMS sent",...}

After sending, wait 5 seconds, then check the latest execution:
GET https://bizelevate1.app.n8n.cloud/api/v1/executions?workflowId=HKHwb6mpWdvGcR070E8or&limit=1

Report: response body, HTTP status, execution status (success/error).
```

**Expected response body:**
```json
{
  "success": true,
  "action": "process_appointment",
  "callId": "test_webhook_001",
  "patientName": "Sarah Johnson",
  "urgency": "routine",
  "message": "Appointment request processed, SMS sent",
  "timestamp": "..."
}
```

> **Note on SMS**: The test uses `+61412345678`. Twilio will attempt to deliver to this number. For demo testing, replace with a real Australian mobile you control. If the number is unverified in a Twilio trial account, SMS will fail but the Google Sheets write will succeed — the rest of the flow is still validated.

### Test B: Tool-call test (mid-call flow)

```
Send a test tool-call payload to the n8n webhook to validate the save_intake path.

Webhook URL: https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment
Header: x-vapi-secret: bze_vapi_2024_x7k9m2p4q8r1s5t3

Payload:
{
  "message": {
    "type": "tool-calls",
    "toolCalls": [{
      "id": "tc_test_001",
      "function": {
        "name": "save_intake",
        "arguments": "{\"patientName\":\"James Test\",\"patientPhone\":\"+61499000111\",\"requestedDateTime\":\"Monday 2pm\",\"reason\":\"Tooth pain\"}"
      }
    }],
    "call": {
      "id": "call_tooltest_001",
      "customer": { "number": "+61499000111" }
    }
  }
}

Use curl --ssl-no-revoke.
Expected response: results array with toolCallId and confirmation message.
Report: response body and HTTP status.
```

### Test C: Urgency classification tests

Run all 3 urgency variants using the payloads from `appointment-concierge/docs/TEST-PAYLOADS.md`:

| Test | Reason | Expected Urgency |
|------|--------|-----------------|
| Test 1 | Annual check-up | `routine` |
| Test 2 | Fever and headache | `urgent` |
| Test 3 | Chest pain | `emergency` |

### Test D: Live VAPI call (after Phase 3 complete)

1. Call the VAPI phone number attached to the Alex assistant
2. Speak naturally — give your name, phone, preferred date/time, reason
3. After the call ends, wait ~15 seconds
4. Open the Google Sheet — a new row should appear
5. Check your phone — SMS should arrive within 60 seconds

### Gate

- [ ] Test A: HTTP 200 with `"action":"process_appointment"` response
- [ ] Test A: Execution 599+ is `success` in n8n
- [ ] Test A: Row appears in Google Sheet with correct patient data and urgency
- [ ] Test B: HTTP 200 with tool results array returned
- [ ] Test C: All 3 urgency classifications correct (routine / urgent / emergency)
- [ ] Test D: Live call → sheet row appears → SMS received

---

# PHASE 5 — Demo Preparation

**Where**: Google Sheets + Claude Code (data cleanup)

**Goal**: Clean demo state — clear test data, confirm the demo script, verify everything is ready.

### Step 1: Clear test data from Google Sheet

Open the Google Sheet and manually delete all test rows (rows 2 onwards). Keep row 1 (headers) intact.

Alternatively, use the Google Sheets UI: select rows 2–end → right-click → Delete rows.

### Step 2: Verify clean state

**Claude Code prompt:**

```
Verify the Appointment Request Concierge is ready for demo.

Run these checks:
1. GET https://bizelevate1.app.n8n.cloud/api/v1/workflows/HKHwb6mpWdvGcR070E8or — confirm active: true
2. Send a minimal test payload (type: end-of-call-report, patient: "Demo Test", phone: "+61400000001", datetime: "Monday 9am", reason: "Demo test") to https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment with header x-vapi-secret: bze_vapi_2024_x7k9m2p4q8r1s5t3
3. Check the last execution — confirm status: success
4. Report pass/fail for each check

Use --ssl-no-revoke on all curl calls. API key from .mcp.local.json.
```

After the test row appears in the sheet, delete it manually.

### Step 3: Demo script

**Run time**: ~5 minutes

**Setup** (before demo):
- Open the Google Sheet in a browser tab (keep it visible on a second screen or for screen share)
- Have the VAPI phone number ready to call

**Demo flow**:

1. **Explain the problem** (30 sec): "When a patient calls outside hours or during a busy period, the call is either missed or staff spend time manually taking notes."

2. **Show the sheet** (10 sec): Empty sheet with headers. "This is where captured requests go."

3. **Make the call** (2-3 min): Call the VAPI number. Speak as a patient — give a real name, your mobile number, a date/time, and a reason.

4. **Watch the sheet** (30 sec after hang-up): Refresh the Google Sheet. The row appears. Point out: patient name, phone, AI-classified urgency.

5. **Show the SMS** (20 sec): Show the SMS received on your mobile. "Patient confirmation sent automatically."

6. **Explain what just happened** (60 sec):
   - VAPI handled the call (no staff involved)
   - AI classified the urgency from the conversation
   - Data captured to the sheet in real time
   - Patient already knows staff will call back within 2 hours

7. **What's next** (30 sec): "We can add: staff SMS alert for urgent/emergency calls, missed call recovery, appointment change/cancellation handling."

### Demo talking points

| Claim | Evidence |
|-------|---------|
| Zero staff involvement | No one answered the call — AI handled it end-to-end |
| Accurate data capture | Show sheet row with correct name, phone, reason |
| AI urgency classification | Point to Urgency column — "routine" vs "urgent" vs "emergency" |
| Patient confirmation | Show SMS on phone |
| Works 24/7 | "This fires any time the number rings, whether the clinic is open or not" |
| Scalable | "Same workflow, different VAPI number = different clinic" |

### Gate

- [ ] Google Sheet has only header row (no test data)
- [ ] Latest n8n execution is `success`
- [ ] Workflow is `active: true`
- [ ] Demo script rehearsed
- [ ] VAPI phone number confirmed working
- [ ] Google Sheet URL bookmarked and open
- [ ] Second device ready to receive demo SMS

---

## Troubleshooting Reference

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Webhook returns 401 | VAPI secret header not matching | Verify `x-vapi-secret` value matches `bze_vapi_2024_x7k9m2p4q8r1s5t3` |
| Execution shows `action: "acknowledged"` | LangChain `output` wrapping — Flatten node missing | Re-deploy workflow from `workflow.json` (includes Flatten node) |
| Google Sheets error: "Sheet not found" | `sheetName.mode` is `"list"` not `"id"` | Re-deploy from `workflow.json` (fixed to `mode: "id", value: "0"`) |
| SMS 401 error | Twilio auth token wrong in credential | PATCH credential `Vpy229UTG1RYrPP0` with correct password from `.env` |
| SMS sends but no delivery | Twilio trial account — unverified number | Verify the destination number in Twilio console, or upgrade from trial |
| Google Sheets 429 rate limit | Too many rapid test calls | Wait 60 seconds and retry |
| VAPI doesn't fire end-of-call-report | Server Messages not configured | Enable `end-of-call-report` in VAPI assistant → Server Messages |
| Structured data fields empty | Analysis Plan not configured | Add structuredDataPrompt + structuredDataSchema to VAPI assistant |
| Tool call not received by n8n | Tool server URL wrong in VAPI | Verify both tools use `https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment` |

---

## Known Bugs Found and Fixed

| Bug | Root Cause | Fix Applied |
|-----|-----------|-------------|
| All calls routing to `acknowledge_only` | LangChain Agent wraps output: `{output: {action: ...}}` — IF node checked `$json.action` (empty) | Added `Flatten Decision Output` Code node between Decision Agent and Route by Decision to unwrap |
| SMS fails with 401 | Twilio Basic Auth credential (`Vpy229UTG1RYrPP0`) had incorrect auth token | Updated via `PATCH /api/v1/credentials/Vpy229UTG1RYrPP0` |
| Google Sheets error: "Sheet with ID Appointments not found" | `sheetName.mode: "list"` passes the label text as gid — API rejects it | Changed to `mode: "id", value: "0"` targeting first tab by gid |
| SMS URL rejected by Twilio | `<TWILIO_ACCOUNT_SID>` placeholder still in URL | Replaced with real SID `AC907df5d9b5370eb5dd779a5b77754374` |

---

---

# PHASE 6 — Management App + Supabase Audit Layer

**Where**: Claude Code (Supabase schema + n8n update) + separate app project

**Goal**: Replace the Google Sheet as the client-facing deliverable with a real management dashboard. Every call across all subscribed capabilities is logged to Supabase. The app shows clients what their AI concierge is doing — volume, urgency, SMS status, call outcomes — without them ever opening n8n or a spreadsheet.

**Why this matters for BizElevate**: A blank demo is table stakes. A management app gives clients a daily-use artefact. It creates stickiness, enables multi-capability reporting, and justifies a recurring subscription rather than a one-off project fee.

---

## 6.1 Supabase Project Setup

**Action item for Claude**: Create the Supabase project and run migrations.

Project name: `bizelevate-concierge`
Region: Sydney (`ap-southeast-2`) — closest to AU clients

SQL files are in `supabase/migrations/` and `supabase/seeds/`. Paste each file directly into the Supabase SQL Editor — no markdown, no extra characters.

**Run in order:**

| Step | File | What it creates |
|------|------|-----------------|
| 1 | `supabase/migrations/001_create_clients.sql` | Master client registry |
| 2 | `supabase/migrations/002_create_client_subscriptions.sql` | Capability gating (FK → clients) |
| 3 | `supabase/migrations/003_create_call_logs.sql` | Audit log + indexes |
| 4 | `supabase/seeds/001_demo_client.sql` | Demo client + subscription seed |

### Gate

- [ ] Supabase project `bizelevate-concierge` created
- [ ] `clients` table created and `smile-dental` seed record inserted
- [ ] `call_logs` table created with schema above
- [ ] `client_subscriptions` table created with FK to `clients`
- [ ] Supabase URL and anon/service key saved to `secrets.local.json`

---

## 6.2 n8n Workflow Update — Write to Supabase

**Status: IMPLEMENTED** — deployed to n8n workflow `HKHwb6mpWdvGcR070E8or`.

Two HTTP Request nodes write to `call_logs` after `Phone Valid?`, one per branch:

```
Save to Google Sheets
  → Phone Valid?
      TRUE  → Write to Supabase          (sms_sent=true,  call_status=processed)
                → Send Patient SMS → Respond Success
      FALSE → Write to Supabase — No Phone  (sms_sent=false, call_status=no_phone)
                → Respond No SMS
```

Both nodes use `onError: continueRegularOutput` — the workflow continues if Supabase is not yet configured.

| Supabase column | Value |
|-----------------|-------|
| `capability` | `"appointment_concierge"` (hardcoded) |
| `client_id` | `"smile-dental"` (hardcoded until multi-tenant) |
| `call_id` | `$('Route by Decision').item.json.callId` |
| `patient_name` | `$('Route by Decision').item.json.patientName` |
| `patient_phone` | `$('Route by Decision').item.json.patientPhone` |
| `requested_datetime` | `$('Route by Decision').item.json.requestedDateTime` |
| `reason` | `$('Route by Decision').item.json.reason` |
| `urgency` | `$('Route by Decision').item.json.urgency` |
| `sms_sent` | `true` (SMS branch) / `false` (no-phone branch) |
| `call_status` | `"processed"` (SMS branch) / `"no_phone"` (no-phone branch) |
| `raw_transcript` | `$('Normalize VAPI Payload').item.json.transcript` |

**To activate**: replace `<SUPABASE_URL>` and `<SUPABASE_SERVICE_KEY>` placeholders in the two Supabase nodes with real values from `secrets.local.json`, then push workflow via API.

> **Note**: Google Sheets write is retained for now as the clinic-facing operational view. Supabase is the reporting/audit layer. Both coexist until the management app is live and validated.

---

## 6.3 Management App

**Action item for Claude**: Plan and scaffold the management app once Supabase schema is live and populated.

### What the app shows (MVP)

| View | Content |
|------|---------|
| Dashboard | Calls today / this week, urgency breakdown (routine/urgent/emergency), SMS sent count |
| Call Log | Filterable table of all calls — patient name, time, urgency, SMS status, reason |
| Capability Status | Which capabilities are active for this client |
| Call Detail | Full transcript + extracted data for a single call |

### What the app does NOT show (MVP)

- Booking confirmation or calendar
- Patient history across calls
- Staff management or scheduling
- Any PMS data

### Technology options

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| Supabase Studio (built-in) | Zero build, free | Not client-brandable, no subscription gating | Demo only |
| Next.js + Supabase JS | Full control, brandable, React ecosystem | Build time | Preferred for client delivery |
| Retool / Appsmith | Fast low-code | Not easily white-labelled | Pilot shortcut only |

**Recommended approach**: Start with Supabase Studio to validate the data model during pilot. Build Next.js app when first paying client is confirmed.

### Multi-capability design

The app is capability-aware from day one. When Missed Call Recovery is live:
- A new `capability = 'missed_call'` row type appears in `call_logs`
- The dashboard shows a second section for missed calls
- The client only sees capabilities they have subscribed to (via `client_subscriptions` table)
- No code changes needed — it's data-driven

### Gate (Phase 6 — not blocking demo)

- [ ] Supabase schema live (`call_logs` + `client_subscriptions`)
- [ ] n8n workflow writes to Supabase on every processed call
- [ ] At least 5 real calls visible in Supabase
- [ ] Management app (Supabase Studio or Next.js) accessible and showing correct data
- [ ] Demo client subscription record exists for `appointment_concierge`

---

## Next Capabilities (Post-Demo)

### Status Overview

| Capability | Status | Directory |
|-----------|--------|-----------|
| Appointment Concierge | **LIVE (demo-ready)** | `appointment-concierge/` |
| Missed Call Recovery | **In Development** | `missed-call/` |
| Management App (MVP) | Planned — Phase 6 | `appointment-concierge/PLAYBOOK.md#phase-6` |
| Staff SMS Alert | Planned | — |
| Appointment Change/Cancel | Future | — |
| After-Hours Triage | Future | — |

---

### Missed Call Recovery (BMCR) — In Development

**What it does:** Detects missed calls via Twilio StatusCallback → fires instant SMS text-back → logs to Supabase `call_logs` with `capability='missed_call'`.

**Architecture:**
```
Twilio no-answer → n8n webhook → Filter → Normalize → Phone Valid?
                                                      ↓ YES
                                             Send SMS + Log Supabase
                                                      ↓ NO
                                                  Log Supabase only
```

**Tech:** Twilio (trigger + SMS), n8n (orchestration), Supabase (audit)
**No VAPI required** — outbound SMS only, no AI voice.

**Pricing:**
- v1 flat: $349/mo (same as Appointment Concierge)
- v2 tiered: $299 (≤100 calls), $499 (≤300 calls), custom (enterprise)
- **Bundle:** $599/mo for both capabilities

**Target:** Same client base — 1–3 chair AU dental clinics.
**TAM:** 3,000–4,200 practices (50–60% of ~6,500 AU total).
**Guarantee:** 30-day performance-backed deployment.

**Positioning:** "We turn your missed calls into booked appointments automatically."
Frame as **practice growth**, not automation.

**Integration with Appointment Concierge:**
| Scenario | Capability |
|----------|------------|
| Patient calls during hours, answered | Appointment Concierge (VAPI) |
| Patient calls, no answer / missed | Missed Call Recovery (Twilio SMS) |
| Patient replies to SMS text-back | Route to Appointment Concierge intake (Phase 2) |

**Next build steps:**
1. Build n8n workflow (Claude Code)
2. Configure Twilio StatusCallback on demo number (you)
3. Test end-to-end with real missed call (you)
4. See `missed-call/PLAYBOOK.md` for full detail

---

### Management App (MVP) — Planned

**What it does:** Client-facing dashboard showing all captured calls, SMS sent, urgency breakdown, and missed-call volume. Powered by Supabase data already being written.

**Stack (MVP):** Supabase Studio (no-code) → Next.js/Vercel (v2)
**Scope:** Per-client filtered view of `call_logs`, filterable by `capability` and `created_at`.
**Sells as:** "The foundation layer — clients see their AI working."

---

### Full Capability Roadmap

| Priority | Capability | Complexity | Revenue Impact |
|----------|-----------|-----------|----------------|
| 1 | **Missed Call Recovery** | Low-Medium | Direct ($349/mo per client) |
| 2 | **Management App MVP** | Medium | Retention + upsell |
| 3 | Staff SMS Alert | Low | Upgrade trigger |
| 4 | Appointment Change/Cancel | Medium | Reduces inbound volume |
| 5 | After-Hours Triage | Low | After-hours coverage |
| 6 | Multi-tenant routing | Medium | Scale prerequisite |

> **Product story:** Appointment Concierge + Missed Call Recovery + Management App = the complete "missed no call, booked every patient" pitch. All three together form the sellable v1 product suite.

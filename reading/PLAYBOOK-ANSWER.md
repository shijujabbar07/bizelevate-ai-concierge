# CustomerReach Answer — Capability Playbook

**Capability:** appointment_concierge
**Product Name:** CustomerReach Answer
**Status:** ACTIVE — live at Riverside Dental, end-to-end test pending
**Tier:** Core ($499/mo and above)
**Version:** 2.5

---

## 0. Why This Exists — Business Context

### The problem it solves

A dental receptionist can handle one call at a time. After hours, they handle zero. Every call that hits voicemail after 5:30pm, every call that rings out during lunch, every call on a Sunday — those patients either leave a message nobody returns promptly, or they call the next clinic on Google.

CustomerReach Answer means the phone is always answered. By an AI. In under two seconds.

---

### What this capability does

When a patient calls the CustomerReach Answer number, VAPI's AI voice assistant (Casey) answers immediately. Casey:

- Greets the patient professionally on behalf of the clinic
- Collects: name, callback number, reason for visit (and preferred time if callback intent)
- Detects whether the patient wants to self-serve via a booking link, or needs a callback
- Identifies urgency (routine, urgent, emergency)
- Confirms the details back to the patient
- Closes with the right expectation: booking link offer or callback confirmation
- Ends the call warmly

Within 30 seconds of the call ending, n8n routes based on detected intent:

**Booking intent (routine):**
- Patient receives SMS with the clinic's booking link to self-serve
- SMS includes fallback: "Reply CALL if you'd prefer we ring you"
- Call logged to Supabase

**Callback intent (or no booking link configured):**
- Patient receives SMS confirmation with their preferred callback time
- Clinic owner receives a summary SMS
- Call logged to Supabase

**Emergency (any intent):**
- Immediate owner alert SMS — always a callback path regardless of intent

---

### Which number do patients call?

**Common configurations:**

**After-hours line (recommended first deployment):**
The Twilio/VAPI number is marketed as the clinic's after-hours booking line. Listed on Google Business Profile, website, and voicemail greeting of main number.
*"For after-hours appointment requests, call 04XX XXX XXX."*

**New patient line:**
A second number listed only for new patients (on ads, Google, website). Existing patients call the main number; new patients reach the AI.

**Full AI receptionist (Option 3 — porting):**
Main clinic number ports to Twilio. VAPI answers all calls during configured hours. Staff answering is configured as a fallback. See the [Respond Playbook](https://www.notion.so/31f2b7aaf2e3810bbfa1c6b9693c42ee) for phone number setup options (Options 1–3 apply here too).

---

### How it actually works — real-life scenarios

**Scenario 1 — After-hours Sunday call:**

> 7:14pm Sunday — James Nguyen Googles "emergency dentist Campsie" and finds Riverside Dental.
> Google Business Profile shows: "After-hours bookings: 0485 004 338"
> James calls. Casey answers in 1.8 seconds.
> Casey: *"Hi, you've reached Riverside Dental's after-hours booking line. I'm Casey — I'll take your details and make sure the team calls you first thing Monday. Can I get your name?"*
> James gives name, number, reason (broken tooth, some pain), preferred callback: Monday 9am.
> Casey confirms everything, ends call warmly.
> 30 seconds later: James receives SMS — *"Hi James, thanks for calling Riverside Dental. We'll call you Monday at 9am — our number is 0485 004 338."*
> Monday 8:55am: Receptionist sees James's intake in dashboard, calls him at 9am as promised.

**Scenario 2 — Busy mid-day, receptionist unavailable:**

> 12:47pm Tuesday — Sarah calls the clinic. Receptionist is with a patient.
> Call forwards to VAPI (via conditional forwarding or timeout routing).
> Casey takes Sarah's intake in under 90 seconds.
> Receptionist returns at 1:15pm, sees Sarah's entry in dashboard, calls her back.

---

### What changes for the clinic

| Before | After |
|--------|-------|
| After-hours calls go to voicemail | Every call answered within 2 seconds |
| Voicemail rarely checked promptly | Structured intake in dashboard |
| Patient calls competitor | Patient gets SMS confirmation and expects callback |
| No record of missed after-hours calls | Every call logged with transcript summary |
| Emergency calls go unnoticed | Emergency triggers immediate owner SMS alert |

---

### Why clinics pay for this

- **Always on** — answers at 2am on Christmas Day
- **No voicemail** — patients get a response, not a beep
- **Structured intake** — receptionist has name, number, reason, time before calling back
- **Emergency detection** — urgent cases flagged immediately
- **No extra staff** — zero labour cost for after-hours coverage

**The pitch:** *"Call this number after hours."* [Call it during demo. Casey answers. Patient gets SMS.] *"That just happened with zero staff involved."*

---

### How it fits with CustomerReach Respond

CustomerReach Answer **answers** calls. CustomerReach Respond is the **safety net** for calls that slip through.

Together they ensure zero patients reach silence. Respond fires automatically if VAPI is unavailable or the call is not routed to it. See the [Respond Playbook](https://www.notion.so/31f2b7aaf2e3810bbfa1c6b9693c42ee) for the complete coverage model.

---

## 1. Architecture

### Flow (Happy Path)
```
Patient calls VAPI number → Casey answers → collects intake →
Casey detects intent (booking vs callback) →
call ends → VAPI fires end-of-call-report webhook →
n8n receives webhook → Decision Agent extracts intent + urgency →
validate phone →
Fetch Client Config (booking_link from clients table) →
Route by Intent:
  booking_intent + booking_link exists → Send Booking Link SMS → log to Supabase
  callback_intent OR no booking_link → Write to Supabase → Send Callback SMS
Emergency → owner alert fires immediately
```

### Trigger
VAPI end-of-call-report webhook fires after every call.
- Webhook URL: `https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment`
- Auth: VAPI webhook secret header
- Payload: full transcript + VAPI summary fields

### n8n Workflow ID
`HKHwb6mpWdvGcR070E8or`

---

## 2. VAPI Configuration

### Assistant: Casey
- **Active prompt:** `appointment-concierge/vapi/prompts/casey-v2-intake-only.md` (v2.5)
- **Knowledge file:** `Riverside Dental FAQ.pdf` attached in VAPI — Casey answers general questions (fees, hours, health funds) from this file first before offering a callback
- **No tools configured** — all data flows via end-of-call-report webhook only
- **Voice:** professional, warm, unhurried
- **End-of-call:** VAPI fires webhook with full transcript

### FAQ Behaviour
Casey attempts to answer general questions from the attached knowledge file.
If the answer is not in the file: *"That's not something I have details on right now — but I can get someone from the team to call you."*
Never deflects without attempting the knowledge file first.

### Data Extraction
Casey collects everything via conversation. n8n's Decision Agent extracts:

| Field | Source |
|-------|--------|
| `patient_name` | First name given during call |
| `patient_phone` | Callback number given during call |
| `preferred_callback` | Day + time slot given during call |
| `reason` | Reason for call in patient's own words |
| `urgency` | Classified as: routine / urgent / emergency |
| `intent` | Classified as: `booking_intent` or `callback_intent` |

---

## 3. n8n Workflow Design

### Workflow: BizElevate Appointment Concierge (ID: `HKHwb6mpWdvGcR070E8or`)

| # | Node | Type | Purpose |
|---|------|------|---------|
| 1 | VAPI Webhook | Webhook | Receive end-of-call-report POST from VAPI |
| 2 | Normalize VAPI Payload | Code | Extract transcript, call metadata, structured data fields |
| 3 | Decision Agent | AI | Extract patient_name, patient_phone, intent, urgency from transcript |
| 4 | Flatten Decision Output | Code | Normalise agent JSON output for downstream nodes |
| 5 | Route by Decision | IF | Pass only `action = process_appointment` calls |
| 6 | Phone Valid? | IF | Check AU phone format regex against patient_phone |
| 7 | Fetch Client Config | HTTP GET | Query `clients` using client_id — returns name, booking_link, owner_phone |
| 8 | Route by Intent | IF | `intent = booking_intent` AND `booking_link` exists → booking path; else → callback path |
| 9 | Send Booking Link SMS | HTTP POST | Twilio SMS — booking link + "reply CALL" fallback |
| 10 | Write to Supabase | HTTP POST | Log to call_logs — callback path only |
| 11 | Send Patient SMS | HTTP POST | Twilio SMS — callback confirmation SMS |
| 12 | Write to Supabase — No Phone | HTTP POST | Log to call_logs — invalid phone path (sms_sent=false) |

> **Note:** Owner summary SMS and emergency alert nodes are pending — tracked in Todoist Sprint Phase 1 Day 2.

### Key Fields from VAPI End-of-Call-Report

| VAPI Field | Maps To | Notes |
|---|---|---|
| `call.phoneNumberId` | `phone_number_map` lookup | Resolves client_id dynamically |
| `transcript` | Decision Agent input | Full conversation text |
| `summary` | `notes` in call_logs | VAPI-generated summary |
| `endedReason` | `call_status` | `customer-ended-call`, `assistant-ended-call`, etc. |

---

## 4. SMS Templates

### Booking Link (intent = booking_intent, booking_link configured)
```
Hi [FirstName], thanks for calling [Clinic]. Here is your booking link so you
can pick a time that works for you: [booking_link].
If you'd prefer we give you a call, just reply CALL. Reply STOP to opt out.
```

### Patient Confirmation — Callback (intent = callback_intent, or no booking link)
```
Hi [FirstName], thanks for calling [Clinic].
Your preferred callback time is [slot].
We'll call you then — our number is [Phone].

– [Clinic Name] Team
```

### Patient Confirmation — After Hours (callback, after hours)
```
Hi [FirstName], thanks for calling [Clinic] after hours.
We'll call you first thing [next weekday] at [slot] — our number is [Phone].

– [Clinic Name] Team
```

### Owner Summary (every call)
```
New appointment request from [FirstName] ([Phone]).
Callback: [slot]. Reason: [reason].
View details: dashboard.bizelevate.app
```

### Emergency Owner Alert (urgency = emergency)
```
URGENT: [PatientName] ([PatientPhone]) called with a possible dental emergency.
Reason: [Reason]. Call them back immediately.
```

---

## 5. Multi-Client Routing

The Answer workflow is fully config-driven. There is no hardcoded client_id.

### How it works

Every VAPI end-of-call-report includes the phone number that was called (`call.phoneNumberId` or the `to` field in the call object). The workflow uses this to look up the client dynamically via `phone_number_map` — the same table used by CustomerReach Respond.

```
VAPI number called: +61485004338
    ↓
phone_number_map lookup (capability = 'appointment_concierge')
    ↓
{ client_id: "riverside-dental", capability: "appointment_concierge" }
    ↓
clients lookup
    ↓
{ name: "Riverside Dental", owner_phone: "...", timezone: "Australia/Sydney" }
```

### Tables involved

| Table | Role |
|-------|------|
| `phone_number_map` | Maps Twilio/VAPI number → client_id + capability |
| `clients` | Stores name, owner_phone, timezone, business_hours |
| `client_subscriptions` | Records which capabilities are enabled per client |

---

## 6. Enabling Answer for a New Client

Use this checklist when adding a new client to CustomerReach Answer. No workflow changes required.

### Prerequisites
- Client row exists in `clients` table
- VAPI assistant configured (or use the shared Casey assistant)
- Twilio number provisioned and pointed at VAPI

### Step 0 — Get the booking link (do this first)

The `clients.booking_link` field drives the self-serve booking path. Choose one:

**Option A — Clinic has their own online booking system**
Get the public booking URL from their existing system (Cliniko, HotDoc, their website, etc.) and use it directly. No setup needed.

**Option B — Clinic has no online booking (set up Calendly)**

1. Log into BizElevate Calendly account (or create a free Calendly account for the clinic)
2. Click **+ Create** → **Event Type** → **One-on-One**
3. Name it: `Dental Appointment — [Clinic Name]`
4. Set duration: 30 minutes (adjust to clinic preference)
5. Set availability: match the clinic's actual business hours
6. Under **Calendar** → connect the clinic owner's Google Calendar (prevents double-booking)
7. Click **Next** → copy the scheduling link (format: `https://calendly.com/clinicname/dental-appointment`)
8. Share the Calendly link with the clinic owner so they can test it and adjust availability

> Calendly free tier supports one event type — sufficient for a single booking type. Calendly Standard ($15/mo) supports multiple event types (new patient, check-up, emergency slot).

Once you have the URL — proceed to Step 1.

---

### Step 1 — Populate client config

```sql
UPDATE clients SET
  owner_phone   = '+61XXXXXXXXXX',
  timezone      = 'Australia/Sydney',
  business_hours = '{"start": 8, "end": 18, "days": [1,2,3,4,5]}'::jsonb,
  booking_link  = 'https://calendly.com/clinicname/dental-appointment'
WHERE id = 'your-client-id';
```

> If `booking_link` is NULL or empty: Casey's post-call SMS will default to the callback confirmation path. The booking link path is silently skipped — no errors.

### Step 2 — Register the VAPI number

```sql
INSERT INTO phone_number_map (phone_number, client_id, capability)
VALUES ('+61XXXXXXXXXX', 'your-client-id', 'appointment_concierge');
```

### Step 3 — Enable the capability

```sql
INSERT INTO client_subscriptions (client_id, capability)
VALUES ('your-client-id', 'appointment_concierge')
ON CONFLICT (client_id, capability) DO NOTHING;
```

### Step 4 — Configure VAPI

In VAPI Dashboard → Phone Numbers → select the number → set server URL to:
`https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment`

### Step 5 — Verify end-to-end

**Test A — Booking intent path** (if `booking_link` is set):
Call the VAPI number. Say you'd like to book an appointment. Give a name and mobile. End the call.
Confirm:
- SMS arrives with the booking link (not a callback message)
- Tapping the link opens the Calendly / booking page
- Row in `call_logs` with `intent = 'booking_intent'`

**Test B — Callback intent path:**
Call again. Mention tooth pain or say you'd prefer a callback. Give a name and mobile. End the call.
Confirm:
- SMS arrives with callback confirmation (not the booking link)
- Row in `call_logs` with `intent = 'callback_intent'`
- Owner SMS received at `clients.owner_phone`
- Row visible in the dashboard with urgency and reason

---

## 7. Build Status

| Component | Status | Notes |
|-----------|--------|-------|
| VAPI Assistant (Casey) | **DEPLOY REQUIRED** | Prompt v2.5 ready — must redeploy to VAPI Dashboard. Model: switch to GPT-4o mini cluster (390ms). |
| n8n workflow — Decision Agent | **LIVE** | intent field extracted from transcript. Workflow pushed and active (29 nodes). |
| n8n workflow — Booking Link branch | **LIVE (credential missing)** | Fetch Client Config + Route by Intent nodes live. Send Booking Link SMS node has no Twilio credential — configure in n8n UI before testing. |
| Supabase call_logs integration | **LIVE** | Credentials injected, logging active |
| Booking link config (clients.booking_link) | **BLOCKER** | NULL in Supabase for riverside-dental. Must set before booking link SMS can fire. `UPDATE clients SET booking_link = '...' WHERE id = 'riverside-dental';` |
| Multi-client routing via phone_number_map | **PENDING** | Workflow hardcoded to riverside-dental fallback. Full multi-client routing is Day 2 sprint work. |
| Patient SMS — callback path | **LIVE** | Fires when intent = callback_intent or booking_link is NULL |
| Patient SMS — booking link path | **BLOCKED** | Blocked by: (1) missing Twilio credential on node, (2) clients.booking_link is NULL |
| Owner summary SMS | **PENDING** | Day 2 sprint task |
| Emergency owner alert | **PENDING** | Day 2 sprint task |
| Business hours detection | **PENDING** | Day 2 sprint task |
| End-to-end real call test (+61 485 004 338) | **BLOCKED** | Talk test cannot test SMS (no real phone number in browser). Must use real mobile. |
| FAQ capability in VAPI prompt | **ACTIVE** | Casey answers from attached knowledge file. Fallback to callback offer if not found. |
| 3 callback time slots in Casey prompt | **PENDING** | Day 1 sprint task |

> Pending items tracked in **Todoist → BizElevate — Sprint Phase 1** (Day 1 + Day 2).

---

## 8. Blockers Before First Demo

> All three must be resolved before a live demo is viable.

| # | Blocker | Action | Owner |
|---|---------|--------|-------|
| 1 | `clients.booking_link` is NULL for riverside-dental | `UPDATE clients SET booking_link = '<calendly_url>' WHERE id = 'riverside-dental';` | Shiju |
| 2 | `Send Booking Link SMS` n8n node has no Twilio credential | n8n UI → open node → add HTTP Basic Auth credential (Twilio SID + Token) → save | Shiju |
| 3 | VAPI model is Groq llama-3.1-8b (poor adherence) | VAPI Dashboard → Model → switch to GPT-4o mini cluster | Shiju |
| 4 | Prompt v2.5 not yet deployed to VAPI Dashboard | Copy `casey-v2-intake-only.md` → paste into VAPI system prompt | Shiju |

> **Note on Talk test:** The VAPI browser Talk test cannot test the SMS flow — it has no real phone number so `{{customer.number}}` is empty and the phone validation step fails. Always test SMS with a real inbound call to `+61 485 004 338`.

---

## 9. The Demo in 90 Seconds

1. Call the CustomerReach Answer demo number: `+61 485 004 338`
2. Casey answers immediately
3. Give a fake name, your mobile number, say "I'd like to book a routine check-up"
4. End call
5. Show the booking link SMS arriving on your phone
6. Show the entry in the Management Dashboard (`dashboard.bizelevate.app`)
7. *"That was zero staff. Fully automated. Patient gets a booking link in under 30 seconds."*

---

## 10. Pricing & Tier

CustomerReach Answer is included from Core tier upwards.
Full pricing with all tier details: [BizElevate Operating Truth](https://www.notion.so/3272b7aaf2e381288dc1fcbafcf1cee0)

| Tier | Capabilities | Price |
|------|-------------|-------|
| **Starter** | Respond only | $199/mo |
| **Core** | Respond + Answer + Dashboard | $499/mo |
| **Growth** | Core + Remind + Review | $799/mo |
| **Practice** | Growth + Recall + Multi-location | $1,299/mo |

Setup fee: $500–$750 one-time. 30-day guarantee: full refund if no measurable improvement in after-hours call handling.

---

## Change Log

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-02-15 | Initial deployment — VAPI + n8n + Google Sheets logging |
| 2.0 | 2026-03-01 | Google Sheets replaced with Supabase logging. Decision Agent added for structured data extraction from transcript. |
| 2.1 | 2026-03-07 | Renamed to CustomerReach Answer. Removed VAPI tools — end-of-call-report webhook only. |
| 2.2 | 2026-03-21 | Playbook restructured: n8n workflow node table added (Section 3), multi-client routing explained (Section 5), client onboarding checklist added (Section 6), build status table added (Section 7), pricing consolidated to single reference, duplicate flow diagrams removed. |
| 2.3 | 2026-03-29 | Booking intent flow added. Casey detects booking vs callback intent during call. Post-call: n8n fetches clients.booking_link and routes to booking link SMS or callback SMS based on intent. Decision Agent updated to extract intent field. Three new n8n nodes added: Fetch Client Config, Route by Intent, Send Booking Link SMS. FAQ behaviour corrected: Casey now attempts to answer general questions from attached knowledge file before offering callback. |
| 2.4 | 2026-03-29 | QA fixes from first Talk test. Mobile number: removed "8 digits after 04" framing — Casey now accepts full 10-digit number and confirms in 4-3-3 groups. Added explicit rule: do not re-ask for information already given in the call. Added call-ending rule: end immediately after closing script, no looping. |
| 2.5 | 2026-03-30 | Prompt restructure based on second Talk test QA. (1) Section 5 removed — reason for visit now collected once in Section 5.3 during intake. (2) Collection order changed: Name → Mobile → Reason → Preferred Time. (3) Preferred time skipped entirely for booking_intent — Casey says "we'll send you a booking link" instead of asking when they want to come in. "next Tuesday" example removed. (4) Confirmation summary is now conditional: booking_intent shows Name + Mobile + Reason only; callback_intent shows all four fields. (5) Caller ID guard added: Casey validates {{customer.number}} before using it — skips to voice entry if empty or not a valid AU mobile. Root cause analysis: booking link SMS not received due to (a) Talk test has no real phone number — use real call to test, (b) clients.booking_link is NULL for riverside-dental — must be set in Supabase, (c) Send Booking Link SMS n8n node has no Twilio credential configured — must be added via n8n UI. |

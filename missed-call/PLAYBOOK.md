# CustomerReach Respond — Capability Playbook

**Capability:** missed_call
**Product Name:** CustomerReach Respond
**Status:** ACTIVE — ready for testing
**Version:** 0.5

---

## 0. Why This Exists — Business Context

### The problem it solves

Think about the last time you called a business, no one answered, and you got silence or voicemail. Did you call back? Most people don't.

For a dental clinic, a missed call that goes cold is a patient who books somewhere else. The clinic never knows it happened. There's no record. No follow-up. Just a ringing phone that nobody answered.

This is the gap that CustomerReach Respond fills.

---

### What this capability does

The moment a call goes unanswered — the phone rings out, no one picks up — the patient receives an SMS within **5–10 seconds**:

> *"Hi, we missed your call at Smile Dental Campsie. We would love to help — call us back on +61 485 004 338 or reply to book an appointment."*

That's it. Simple. Fast. Automatic.

The caller instantly knows the clinic saw their call. They're no longer talking to silence — they have a number to call back, and an open door to reply. The clinic captures the lead before they call a competitor.

Every missed call is also logged to the dashboard: caller number, time, SMS sent, outcome. For the first time, the clinic owner can see exactly how many calls they've been missing.

---

### Which number do patients call? — The Honest Answer

CustomerReach Respond only fires when a missed call passes through **Twilio**. This means the clinic needs at least one Twilio number in their setup. How that fits with their existing phone depends on their situation.

**There are three setup options. Most clinics start with Option 1.**

See **[docs/PHONE-ONBOARDING.md](../docs/PHONE-ONBOARDING.md)** for the complete guide
covering all Australian phone types, step-by-step instructions, objection handling,
and the per-client setup decision tree. Know this document before any sales call.

---

### Option 1 — Dedicated Second Number (Recommended, Zero Friction)

A new Twilio AU number is provisioned. The clinic's existing number is untouched.
The new number is positioned as their *"after-hours line"* or *"new patient booking line"*
and added to their Google Business Profile and website.

- **Go-live time:** Same day
- **Carrier involvement:** None
- **Risk:** Zero
- **Suitable for:** Every first client

---

### Option 2 — Conditional Call Forwarding (Respond on Existing Number)

The clinic keeps their existing number. A forwarding rule is set so that when their
existing line has no answer (~20 seconds), it forwards to the Twilio number. Twilio
plays a brief message and fires the SMS.

On most Australian landlines, this is set by dialling `*62*04XXXXXXXX#` from the phone.
On VoIP systems (3CX, RingCentral, Vonex), it is configured in the admin panel.
Takes 5 minutes. Reversible instantly.

- **Go-live time:** Same day
- **Carrier involvement:** None (self-service)
- **Risk:** Minimal — cancellable with one code
- **Suitable for:** Client 2+ who want Respond on their main number without porting

---

### Option 3 — Number Porting to Twilio (Full Integration)

The clinic's existing number ports to Twilio. Everything runs through one number —
missed call SMS, after-hours AI, time-based routing. Best long-term outcome.

- **Go-live time:** 5–15 business days (ACMA porting process)
- **Carrier involvement:** Yes — carrier must release the number
- **Risk:** Small downtime window during port (schedule for Friday evening)
- **Suitable for:** Established clients who have already seen value and want full integration

---

### How it actually works — real-life scenario

**Option 2 in action — busy Tuesday morning:**

> 9:14am — A new patient calls Smile Dental on 03 9123 4567 (unchanged main number).
> The receptionist is with a patient. The phone rings for 20 seconds. Nobody picks up.
> The landline's forwarding rule kicks in — call forwards to the Twilio number.
> Twilio plays: *"Thanks for calling. We missed your call — we'll send you a text now."*
> 9:14am + 12 seconds — The patient's mobile receives an SMS:
> *"Hi, we missed your call at Smile Dental. We're with patients — reply BOOK and we'll call you right back."*
> The patient's original call was to the clinic's unchanged number. They never knew about Twilio.

**Option 1 in action — after-hours:**

> 7:30pm — A prospective patient Googles "dentist Campsie" and finds Smile Dental.
> Google Business Profile shows two numbers: main (03 9123 4567) and "After-hours bookings" (04XX XXX XXX).
> They call the after-hours number. CustomerReach Answer (VAPI) answers. Alex takes their details.
> Alternatively, if VAPI misses the call: CustomerReach Respond fires an SMS automatically.

---

### What changes for the clinic

| Before | After |
|--------|-------|
| Phone rings, no one answers, patient hangs up | Patient gets SMS within 10 seconds |
| No record of missed calls | Every missed call logged with timestamp |
| Patient calls a competitor | Patient has a direct line back to the clinic |
| Owner has no idea how many calls are missed | Dashboard shows missed-call volume weekly |

---

### Why clinics pay for this

- **Zero effort** — the clinic does nothing. There's no button to press.
- **No new number** — works on their existing phone number
- **No hardware** — nothing to install
- **Immediate ROI** — one recovered patient covers months of subscription
- **Peace of mind** — front desk stops worrying about calls they missed

**The pitch:** *"Every time your phone rings and no one answers, we send that caller an SMS in under 10 seconds. Watch."* [call the number, let it ring out, show SMS arriving]

---

### How it fits with CustomerReach Answer

CustomerReach Respond is the **safety net** underneath CustomerReach Answer. Together, they cover every possible call scenario from a single phone number:

```
Patient calls the clinic number
  │
  ├── During business hours
  │     ├── Staff answers → normal call, no automation
  │     └── No answer (busy, lunch, all lines busy)
  │           └── Respond fires → SMS within 10 seconds
  │
  └── After hours / weekends
        ├── VAPI active → CustomerReach Answer answers
        │     └── Alex takes appointment request → SMS confirmation
        └── VAPI unavailable (rare)
              └── Respond fires as safety net → SMS within 10 seconds
```

**Real-life example with both active — Monday morning at a 2-chair clinic:**

> 8:02am — James calls. Receptionist is setting up. No answer. **Respond fires: SMS in 9 seconds.**
> 8:15am — Sarah calls. Receptionist answers. Normal call. No automation needed.
> 8:31am — Michael calls. Receptionist is with a patient. No answer. **Respond fires: SMS in 8 seconds.**
> 1:07pm — Emma calls during lunch break. No answer. **Respond fires.**
> 6:45pm — David calls after close. VAPI answers. **CustomerReach Answer takes appointment request. SMS sent.**
>
> Result: 4 out of 5 calls that could have been lost → recovered automatically. Zero staff action required for any of them.

**Selling together:** When you demo both, the story becomes:

> *"No matter when your patients call — day, night, busy, or after hours — they always get a response. The AI handles the calls it answers. We handle the calls it misses. You lose zero patients to silence."*

**Bundle price:** $599/mo for CustomerReach Answer + CustomerReach Respond. Each standalone is $349/mo.

---

### The demo in 60 seconds

1. Call the CustomerReach Respond demo number from your mobile
2. Let it ring — do not answer
3. Hang up after 5–6 rings
4. Watch your mobile — SMS arrives within 10 seconds
5. *"That happened automatically. No staff. No delay. The patient knows we saw their call."*

> **Note on demo setup:** CustomerReach Respond works best on a dedicated second number (not the same number as CustomerReach Answer). This lets you demo both independently without the AI intercepting the call first. One Twilio AU number costs ~$2/month.

---

### A second phone number — do you need it?

**For demos:** Yes. You want to show CustomerReach Respond without VAPI intercepting the call. A second number (Respond-only, no AI voice) lets you demo the exact scenario: call rings out, SMS fires.

**For real clients:** Depends on the clinic setup:
- **Single line, VAPI active during hours:** Configure CustomerReach Respond to fire after hours only (via Twilio time-of-day routing). One number, both capabilities.
- **Two lines:** Main line gets the AI (CustomerReach Answer). Overflow/secondary line gets CustomerReach Respond. Cleaner and more resilient.

Most 1–3 chair clinics only have one number. Start with that — after-hours Respond on the same number — and upsell a second line later.

---

## Change Log

| Version | Date | Change |
|---------|------|--------|
| 0.1 | 2026-03-06 | Initial playbook created from CustomerReach Respond Strategy Report |
| 0.2 | 2026-03-07 | n8n workflow built and deployed (ID: W9lssqC5Jvd3nIVo). 7 nodes. JSON saved to `missed-call/n8n/workflow.json`. |
| 0.3 | 2026-03-07 | Supabase credentials injected via API. Workflow activated. n8n folders organised. Ready for demo testing. |
| 0.4 | 2026-03-12 | Architecture hardening. Multi-client routing live via `phone_number_map`. Client config driven from `clients` table. Workflow expanded to 10 nodes. Booking link in SMS. Section 7c added: client onboarding steps. |
| 0.5 | 2026-03-12 | Respond Extensions. SMS Reply Handler workflow added (ID: `q4CYSzFYuYfp1eWa`): detects CALL/CALL ME → sets callback_requested=true. Booking link click tracking via Supabase Edge Function `book`. callLogId pre-generated in Prepare Context for correlation. Section 7d added. |

---

## 1. Capability Overview

### Business Problem
When a dental clinic misses a call, the caller either tries a competitor or never calls back. Silent missed calls are silent lost revenue.

### Solution
Detect every missed call via Twilio → fire an instant, personalised SMS text-back → log to Supabase for reporting.

### Client Value
- No missed call goes unanswered
- Caller feels the clinic responded immediately
- Staff see missed-call volume in reporting
- Reduces front-desk anxiety around missed calls

### Product Positioning
"We turn your missed calls into booked appointments automatically."
Frame as **practice growth**, not automation or tech.

---

## 2. Architecture

### Flow (Happy Path)
```
Caller rings → no answer → Twilio StatusCallback fires →
n8n receives webhook → lookup client from phone_number_map →
fetch client config → build SMS with tracking URL →
validate caller number → send SMS → log to Supabase call_logs
```

### SMS Reply Flow
```
Patient replies CALL or CALL ME →
Twilio inbound SMS webhook fires →
n8n SMS Reply Handler receives POST →
detect intent → lookup most recent call_log by patient_phone →
PATCH call_log: reply_received=true, reply_intent=callback, callback_requested=true
```

### Booking Link Click Flow
```
Patient taps tracking URL in SMS →
Supabase Edge Function `book` receives GET /{callLogId} →
lookup call_log → fetch client booking_link →
PATCH call_log: booking_link_clicked=true →
302 redirect to booking_link
```

### Trigger Mechanism
Twilio StatusCallback fires when a call reaches `CallStatus=no-answer` or `CallStatus=busy`.
- Configured on the Twilio phone number (not on VAPI — no AI voice used here)
- Missed call webhook URL: `https://bizelevate1.app.n8n.cloud/webhook/missed-call`
- SMS reply webhook URL: `https://bizelevate1.app.n8n.cloud/webhook/sms-reply`
- Method: POST (Twilio sends form-encoded body)

### Data Flow
```
Twilio StatusCallback → Normalize → Filter →
  Lookup Client (phone_number_map) →
  Fetch Client Config (clients) →
  Prepare Context (generate callLogId, build tracking URL + SMS) →
  Phone Valid?
    ├── Valid: Write Supabase (with callLogId) → Send SMS (tracking URL)
    └── Invalid: Write Supabase only (no SMS)
```

---

## 3. n8n Workflow Design

### Node Sequence

### Workflow: BizElevate Missed Call Recovery (ID: `W9lssqC5Jvd3nIVo`)

| # | Node | Type | Purpose |
|---|------|------|---------|
| 1 | Missed Call Webhook | Webhook | Receive Twilio StatusCallback |
| 2 | Normalize Twilio Payload | Code | Extract callFrom, callTo, callSid, callStatus |
| 3 | Filter: Missed Calls Only | IF | Pass only `no-answer`, `busy`, `completed`, `canceled`, `failed` |
| 4 | Lookup Client | HTTP GET | Query `phone_number_map` using Twilio `To` — returns client_id + capability |
| 5 | Fetch Client Config | HTTP GET | Query `clients` using client_id — returns name, booking_link, owner_phone, timezone |
| 6 | Prepare Context | Code | Merge call + config; generate `callLogId`; build tracking URL + SMS body |
| 7 | Phone Valid? | IF | Check AU phone format regex against callFrom |
| 8 | Write to Supabase | HTTP POST | Log to call_logs with pre-generated `id` + dynamic client_id (sms_sent=true) |
| 9 | Send SMS | HTTP POST | POST to Twilio SMS API — From=twilioNumber, Body=smsBody (tracking URL embedded) |
| 10 | Write to Supabase — No Phone | HTTP POST | Log to call_logs with pre-generated `id` (sms_sent=false, invalid number path) |

### Workflow: BizElevate SMS Reply Handler (ID: `q4CYSzFYuYfp1eWa`)

| # | Node | Type | Purpose |
|---|------|------|---------|
| 1 | SMS Reply Webhook | Webhook | Receive Twilio inbound SMS POST |
| 2 | Normalize SMS | Code | Extract `from`, `to`, `body`, `msgSid` |
| 3 | Detect Intent | Code | Classify body (`/^call( me)?$/i` → `callback`, else `other`); build update payload |
| 4 | Lookup Call Log | HTTP GET | Find most recent `call_log` with matching `patient_phone` + `sms_sent=true` |
| 5 | Extract Call Log ID | Code | Safe extraction of row ID from Supabase response; returns `[]` if no match (stops execution) |
| 6 | Update Call Log | HTTP PATCH | Set `reply_received=true`, `reply_intent`, `callback_requested` |

### Data Flow (Missed Call Recovery)
```
Twilio StatusCallback → Normalize → Filter →
  Lookup Client (phone_number_map) →
  Fetch Client Config (clients) →
  Prepare Context (generate callLogId + tracking URL + SMS body) →
  Phone Valid?
    ├── Valid: Write Supabase (id=callLogId) → Send SMS (tracking URL in body)
    └── Invalid: Write Supabase (id=callLogId, sms_sent=false)
```

### Key Fields from Twilio StatusCallback

| Twilio Field | Maps To | Notes |
|---|---|---|
| `From` | `patient_phone` | Caller's number |
| `To` | `phone_number_map.phone_number` | Lookup key — resolves client_id dynamically |
| `CallStatus` | Filter condition | `no-answer`, `busy`, etc. |
| `CallSid` | `call_id` | Unique call reference |

### Phone Validation Regex
```
^(\+?614|04)\d{8}$
```
Matches: `0412345678`, `+61412345678`, `61412345678`

---

## 4. SMS Templates

### Default (v1)
```
Hi, we missed your call at [Clinic Name]. We'd love to help —
call us back on [Phone] or reply here to book an appointment.

– [Clinic Name] Team
```

### Urgency Variant (v2 — if AI triage added)
```
Hi, we missed your call at [Clinic Name]. If this is urgent,
please call [Emergency Number] or visit your nearest emergency clinic.
Otherwise, call us back on [Phone] or reply to book.

– [Clinic Name] Team
```

### Owner / Front Desk Notification (fires in parallel with patient SMS)

**During hours:**
```
Missed call from [callerPhone] at [time].
Patient SMS sent. View details: dashboard.bizelevate.app
```

**After hours:**
```
After-hours missed call from [callerPhone] at [time].
Patient SMS sent. View in dashboard: dashboard.bizelevate.app
```

> These go to the clinic owner mobile or front desk number stored in `clients.owner_phone`.
> Purpose: ensures the clinic team is aware in real-time, and drives them to the dashboard
> to take action (call back, mark resolved). Both patient SMS and owner notification fire
> from the same workflow execution — neither depends on the other succeeding.

### WhatsApp Variant (Phase 2)

Same templates, same Twilio API — prefix the `To` number with `whatsapp:`.
Enabled per client via `clients.owner_channel = 'whatsapp'`.
No workflow rebuild required.

---

## 5. Supabase Logging

Uses shared `call_logs` table (see `supabase/migrations/`).

| Field | Value |
|-------|-------|
| `capability` | `missed_call` (from `phone_number_map` lookup — not hardcoded) |
| `client_id` | Resolved dynamically via `phone_number_map` using Twilio `To` field |
| `call_id` | Twilio `CallSid` |
| `patient_phone` | Twilio `From` (caller's number) |
| `call_status` | `missed` |
| `sms_sent` | `true` / `false` |
| `notes` | `CallStatus: {status} \| To: {twilioNumber}` |

Interaction tracking fields (written by the SMS Reply Handler + redirect Edge Function):

| Field | Written when | Workflow |
|-------|-------------|---------|
| `reply_received` | Patient sends any reply to the recovery SMS | SMS Reply Handler |
| `reply_intent` | `callback` (CALL/CALL ME) or `other` | SMS Reply Handler |
| `callback_requested` | Reply was CALL / CALL ME | SMS Reply Handler |
| `booking_link_clicked` | Patient taps the tracking link | Supabase Edge Function `book` |
| `converted` | Staff marks as resulting in a booking | Dashboard (manual) |

**Booking link tracking:** The SMS includes a redirect URL (`/functions/v1/book/{callLogId}`) rather than the raw booking link. The `callLogId` is pre-generated in `Prepare Context` using `crypto.randomUUID()` and written to Supabase as the row `id` — so clicks can always be correlated back to the exact call record.

> **Custom domain:** Currently `book.bizelevate.app` is not yet configured. The tracking URL is the Supabase function URL directly. Once `book.bizelevate.app` is pointed at the Edge Function, update the `TRACKING_BASE` constant in the `Prepare Context` node and re-push the workflow.

---

## 6. Multi-Client Routing — LIVE

The workflow is fully config-driven. There is no hardcoded client_id anywhere in the workflow.

### How it works

Every Twilio StatusCallback includes a `To` field — the Twilio number that was called.
The workflow uses this to look up the client dynamically:

```
Twilio To: +61485034338
    ↓
phone_number_map lookup
    ↓
{ client_id: "acme-dental", capability: "missed_call" }
    ↓
clients lookup
    ↓
{ name: "Acme Dental", booking_link: "...", owner_phone: "..." }
```

### Tables involved

| Table | Role |
|-------|------|
| `phone_number_map` | Maps Twilio number → client_id + capability |
| `clients` | Stores name, booking_link, owner_phone, timezone, business_hours |
| `client_subscriptions` | Records which capabilities are enabled per client |

### Adding a new client — see Section 7c below

---

## 7c. Turning On Respond for an Existing Client

Use this checklist when a client already exists in Supabase and you want to enable CustomerReach Respond for them. No workflow changes required.

### Prerequisites
- Client row exists in `clients` table (id, name, industry)
- Twilio AU number provisioned for the client

---

### Step 1 — Populate client config in Supabase

```sql
UPDATE clients SET
  owner_phone   = '+61XXXXXXXXXX',   -- clinic owner or front-desk mobile
  timezone      = 'Australia/Sydney',
  booking_link  = 'https://...',     -- Calendly or equivalent, or NULL for callback-only SMS
  business_hours = '{"start": 8, "end": 18, "days": [1,2,3,4,5]}'::jsonb
WHERE id = 'your-client-id';
```

If `booking_link` is NULL, the patient SMS will say *"Reply BOOK and we will call you back."*
If set, the SMS will include the booking link automatically.

---

### Step 2 — Register the Twilio number

```sql
INSERT INTO phone_number_map (phone_number, client_id, capability)
VALUES ('+61XXXXXXXXXX', 'your-client-id', 'missed_call');
```

The `phone_number` must exactly match the `To` field Twilio sends in the StatusCallback (E.164 format).

---

### Step 3 — Enable the capability

```sql
INSERT INTO client_subscriptions (client_id, capability)
VALUES ('your-client-id', 'missed_call')
ON CONFLICT (client_id, capability) DO NOTHING;
```

This makes the capability appear as Active in the client's dashboard Capabilities page.

---

### Step 4 — Configure Twilio StatusCallback

In Twilio Console → Phone Numbers → Active Numbers → select the client's number:

| Field | Value |
|-------|-------|
| Status Callback URL | `https://bizelevate1.app.n8n.cloud/webhook/missed-call` |
| Method | HTTP POST |

No workflow change is required — the existing workflow handles all clients.

---

### Step 5 — Verify

Send a test webhook:

```bash
curl -X POST https://bizelevate1.app.n8n.cloud/webhook/missed-call \
  --data "From=0412000001&To=+61XXXXXXXXXX&CallSid=CA-TEST-001&CallStatus=no-answer"
```

Confirm:
- [ ] SMS received on the test mobile
- [ ] SMS body uses the client's name (not another client's)
- [ ] SMS body includes booking link if configured, or BOOK reply prompt if not
- [ ] Row in `call_logs` with correct `client_id` and `capability = 'missed_call'`
- [ ] Row visible in the client's dashboard

---

---

## 7d. Enabling SMS Reply Capture + Booking Click Tracking for a Client

These features are live and active. No code changes required per client — only configuration.

### SMS Reply Capture — What to Configure

The `sms-reply` webhook (`q4CYSzFYuYfp1eWa`) must be **activated in n8n** (toggle on).
Once active, configure the **Twilio number's inbound SMS webhook**:

| Field | Value |
|-------|-------|
| A message comes in — Webhook URL | `https://bizelevate1.app.n8n.cloud/webhook/sms-reply` |
| Method | HTTP POST |

In Twilio Console → Phone Numbers → Active Numbers → select the client's number → Messaging section.

**Detected intents:**
- `CALL` or `CALL ME` (case-insensitive) → sets `reply_intent=callback`, `callback_requested=true`
- Anything else → sets `reply_intent=other`, `reply_received=true` only

**Matching logic:** The SMS Reply Handler looks up the most recent `call_log` row where `patient_phone = SMS From` and `sms_sent = true`. This links the reply to the correct call record without any session state.

---

### Booking Link Click Tracking — What to Configure

No Twilio configuration needed. The tracking redirect is automatically included in the patient SMS whenever `clients.booking_link` is set.

**How it works:**
1. `Prepare Context` generates a UUID (`callLogId`) for the call_log row
2. SMS body contains: `https://gdzpgimyjgfzhnwyojmz.supabase.co/functions/v1/book/{callLogId}`
3. Patient taps the link → Supabase Edge Function `book` runs → sets `booking_link_clicked=true` → 302 to booking URL
4. The call_log row was INSERTed with that same UUID — the click is correlated back automatically

**Custom domain (deferred):** When `book.bizelevate.app` is configured as a Supabase custom domain or proxy, update `TRACKING_BASE` in the `Prepare Context` node and re-push workflow `W9lssqC5Jvd3nIVo`.

---

## 7. Pricing & Product Tiers

CustomerReach Respond is sold as a standalone capability or as part of a bundle. All prices AUD/month.

| Tier | Capabilities Included | Price | Target Clinic |
|------|-----------------------|-------|---------------|
| **Starter** | CustomerReach Respond only | $199/mo | Price-sensitive, single-chair, try before commit |
| **Core** | CustomerReach Respond + CustomerReach Answer + Dashboard | $499/mo | Standard 1–3 chair clinic |
| **Growth** | Core + CustomerReach Remind + CustomerReach Review | $799/mo | Growth-focused, 2–3 chairs, active new patient acquisition |
| **Practice** | Growth + CustomerReach Recall + Multi-location | $1,299/mo | Multi-dentist practice, 4+ chairs |

**Setup fee:** $500–$750 one-time (covers Twilio provisioning, VAPI config, Supabase client setup, handoff).
**Annual discount:** 20% off (equivalent to 2 months free). Reduces churn. Improves cashflow.
**30-day guarantee:** If the clinic doesn't recover more missed calls in 30 days, full refund. De-risks the sale.

### Capability → Tier Mapping

| Capability | Starter | Core | Growth | Practice |
|------------|---------|------|--------|----------|
| CustomerReach Respond | ✓ | ✓ | ✓ | ✓ |
| CustomerReach Answer (AI voice) | — | ✓ | ✓ | ✓ |
| Management Dashboard | — | ✓ | ✓ | ✓ |
| CustomerReach Remind | — | — | ✓ | ✓ |
| CustomerReach Review | — | — | ✓ | ✓ |
| CustomerReach Recall (dormant patients) | — | — | — | ✓ |
| Multi-location support | — | — | — | ✓ |

---

## 7b. Phase 1 Activation Checklist

**n8n Workflow ID:** `W9lssqC5Jvd3nIVo`
**Webhook URL (once active):** `https://bizelevate1.app.n8n.cloud/webhook/missed-call`

### Step 1: Fill Supabase Placeholders

Open the workflow in n8n → edit these 2 nodes:

**"Write to Supabase" and "Write to Supabase — No Phone" nodes:**
| Placeholder | Replace with |
|-------------|-------------|
| `<SUPABASE_URL>` | Your Supabase project URL (from secrets.local.json) |
| `<SUPABASE_SERVICE_KEY>` | Your Supabase service_role key (from secrets.local.json) |

Both nodes need the same values. Update `url`, `apikey` header, and `Authorization` header.

### Step 2: Activate Workflow

Click **Activate** toggle in n8n. Confirm webhook URL is:
`https://bizelevate1.app.n8n.cloud/webhook/missed-call`

### Step 3: Configure Twilio StatusCallback

In Twilio Console → Phone Numbers → Active Numbers → click `+61485004338`:
- Set **Status Callback URL** to: `https://bizelevate1.app.n8n.cloud/webhook/missed-call`
- Method: HTTP POST
- Events: `no-answer`, `busy`, `failed`

### Step 4: Test

Call `+61485004338` from your mobile. Let it ring out. Within 10 seconds you should:
1. Receive SMS: "Hi, we missed your call at Smile Dental Campsie..."
2. See execution in n8n Executions tab
3. See row in Supabase `call_logs` with `capability='missed_call'`, `sms_sent=true`

---

## 8. Demo Script

1. "Let me show you what happens when your clinic misses a call"
2. Call the Twilio demo number from a mobile — let it ring out
3. Show the SMS received on the mobile within 5–10 seconds
4. Show the Supabase log entry (or a simple dashboard)
5. "That's every missed call automatically recovered. No staff action needed."

**Setup time for demo:** <30 minutes from scratch.

---

## 9. Legal (Australia)

| Law | Implication |
|-----|------------|
| Spam Act 2003 | One-to-one direct reply to a missed call is exempt from bulk spam rules |
| Privacy Act 1988 | Don't store caller data beyond what's needed; mention in privacy policy |
| ACMA regulations | Use Twilio AU numbers; no number spoofing |

---

## 10. Build Phases

Phases map directly to product tiers. Phase 1 completion = Starter + Core sellable. Phase 2 = Growth tier. Phase 3 = Practice tier.

---

### Phase 1 — Sell-Ready (Starter + Core tiers)
**Target:** First paying client. All items required before first demo with a prospect.

**Already done:**
- [x] n8n CustomerReach Respond workflow built and deployed — ID: `W9lssqC5Jvd3nIVo` (10 nodes)
- [x] Basic SMS send — dynamic template with client name + booking link (or CALL reply prompt)
- [x] Supabase call_logs integration — credentials injected, workflow active
- [x] CustomerReach Answer VAPI + n8n workflow (v2.1 active)
- [x] Management Dashboard — call logs, urgency, action status (Phase 6.3)
- [x] Multi-client routing via `phone_number_map` — no hardcoded client_id (Slice 3)
- [x] Two-way SMS: CALL / CALL ME reply detection → `callback_requested=true` (SMS Reply Handler — ID: `q4CYSzFYuYfp1eWa`)
- [x] Booking link click tracking — Supabase Edge Function `book`, pre-generated `callLogId` in INSERT

**Remaining (see [checklists/v1-gap-fix-sprint.md](../checklists/v1-gap-fix-sprint.md) for day-by-day detail):**
- [ ] Business hours detection — both Respond and Answer
- [ ] After-hours SMS variant — Respond (different message when clinic is closed)
- [ ] Callback task creation on CALL reply — Respond + dashboard (callback_tasks table exists, not yet written)
- [ ] Daily missed call summary email to clinic owner — Respond
- [ ] Recovery rate + conversion tracking — dashboard funnel widget
- [ ] Answer: Alex offers 3 callback time slots — VAPI prompt
- [ ] Answer: SMS includes specific callback time — n8n template
- [ ] Answer: Emergency owner SMS alert — IF node + Twilio
- [ ] Answer: FAQ capability (5–10 common questions) — VAPI prompt
- [ ] Answer: After-hours tone variant — VAPI prompt
- [ ] Configure Twilio StatusCallback URL on demo number
- [ ] Configure Twilio inbound SMS webhook on demo number (→ sms-reply)
- [ ] ~~Activate SMS Reply Handler workflow in n8n~~ — **DONE** (activated via API)
- [ ] **Booking link URL looks like spam** — configure `book.bizelevate.app` custom domain pointing to the Supabase Edge Function, then update `TRACKING_BASE` constant in `Prepare Context` node and re-push workflow `W9lssqC5Jvd3nIVo`
- [ ] End-to-end test: call rings out → SMS → CALL reply → callback_requested → dashboard

---

### Phase 2 — Growth Tier ($799/mo)
**Target:** Client 2+ onboarding. Justify upsell from Core to Growth.

**New capabilities:**
- [ ] CustomerReach Remind workflow — SMS 24hrs before appointment, confirm/cancel reply handling
- [ ] CustomerReach Review workflow — SMS 2hrs after visit, Google review link
- [ ] CustomerReach Recall workflow (basic) — monthly SMS to patients not seen in 12+ months

**Infrastructure:**
- [x] ~~Multi-client routing — Supabase `phone_number_map` table~~ — **DONE (Slice 1–3)**
- [x] ~~Client config in Supabase — business hours, owner mobile, booking link per client~~ — **DONE (Slice 1–2)**
- [ ] Shared services sub-workflows — `send_sms`, `log_call`, `notify_owner`, `classify_urgency`
- [ ] Router workflow + Workflow Registry table — capability enable/disable per client by tier
- [ ] Upcoming appointments table in dashboard — staff enter upcoming slots for Reminder workflow

**Dashboard:**
- [ ] Callback Queue view — prioritised list, staff action, mark complete
- [ ] Conversion funnel widget — Missed → SMS sent → Replied → Booked
- [ ] Daily digest email to clinic owner — automated, shows yesterday's activity

---

### Phase 3 — Practice Tier ($1,299/mo)
**Target:** Multi-dentist practices, 4+ chairs, multiple locations.

**New capabilities:**
- [ ] CustomerReach Recall v2 — ACMA-compliant opt-out handling, personalised messaging, send scheduling
- [ ] Multi-location support — multiple `client_id` slugs under one practice owner login
- [ ] WhatsApp support — Twilio WhatsApp API as SMS alternative (same workflows, channel swap)

**Architecture:**
- [ ] MCP Server Trigger — expose n8n sub-workflows as AI tools for future voice agent v3
- [ ] Microservice migration — all capabilities call shared services, Router + Registry fully live
- [ ] Automated client onboarding — Supabase row + Twilio provisioning + SMS welcome, triggered by signup

**AI Orchestration (voice agent v3):**
- [ ] Real-time tool calling during VAPI calls — `check_availability`, `book_appointment`
- [ ] Claude as orchestration layer — complex multi-step intents handled by AI, not IF nodes

---

## 11. Integration with CustomerReach Answer

The two capabilities are complementary and sold together as the **Core tier ($499/mo)**:

| Scenario | Capability |
|----------|------------|
| Patient calls during business hours, staff answers | Normal call — no automation |
| Patient calls during business hours, no answer | CustomerReach Respond — SMS within 10 seconds |
| Patient calls after hours | CustomerReach Answer — Alex answers, takes request |
| Patient replies BOOK to Respond SMS | Callback task created, staff actioned via dashboard |
| Answer classifies urgency = emergency | Owner SMS alert fires immediately |

**Core bundle:** $499/mo. The pitch: *"No matter when your patients call — answered, missed, or after hours — they always get a response."*

---

## 12. Current Status & Next Actions

**Current Phase:** Phase 1 — completing gap fixes before first client.
**Sprint doc:** [checklists/v1-gap-fix-sprint.md](../checklists/v1-gap-fix-sprint.md)

| Priority | Action | Phase | Owner |
|----------|--------|-------|-------|
| 1 | Complete all Phase 1 remaining items (see sprint doc) | 1 | Claude Code + You |
| 2 | Configure Twilio StatusCallback on demo number | 1 | You |
| 3 | End-to-end demo test: Respond + Answer + Dashboard | 1 | You |
| 4 | Close first paying client (Starter or Core tier) | 1 | You |
| 5 | Build CustomerReach Remind workflow | 2 | Claude Code |
| 6 | Build CustomerReach Review workflow | 2 | Claude Code |
| 7 | Build shared services sub-workflows + Router + Registry | 2 | Claude Code |
| 8 | Multi-client routing — onboard client 2 in under 30 min | 2 | Claude Code + You |
| 9 | Build CustomerReach Recall + ACMA compliance | 3 | Claude Code |
| 10 | MCP Server Trigger + microservice migration | 3 | Claude Code |

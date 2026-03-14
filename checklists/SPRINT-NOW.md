# V1 Gap Fix Sprint — Pre-First-Client Week

**Goal:** Complete all remaining Phase 1 items before onboarding client 1.
**Duration:** 5 days
**Outcome:** Starter and Core tiers fully sellable. Demo-ready, objection-proof.

> **Phase context:** This sprint completes **Phase 1** of the BizElevate build roadmap.
> See [missed-call/PLAYBOOK.md → Section 10](../missed-call/PLAYBOOK.md) for the full phase definitions and what unlocks in Phase 2 (Growth tier) and Phase 3 (Practice tier).
> Everything built this week maps to the **Starter ($199/mo)** and **Core ($499/mo)** tiers.
> Phase 2 work (Reminder, Review Request, Router/Registry) begins after client 1 is signed.

---

## Day 1 — Concierge VAPI Prompt Updates

> All changes are prompt-only. Zero n8n workflow risk. Test with 3 live calls before moving on.

### Tasks

- [ ] **Alex offers 3 callback time slots**
  Add to prompt after confirming patient details:
  *"Our team can call you back at 9am, 11am, or 2pm today — which suits you best?"*
  Capture chosen slot in the end-of-call summary field.

- [ ] **FAQ capability — 5–10 common questions**
  Add a FAQ section to the VAPI prompt covering:
  - Clinic location and parking
  - Opening hours
  - Health funds accepted (e.g. HBF, Medibank, BUPA, HCF)
  - Payment plans available
  - Emergency / same-day appointments
  - What to bring to first appointment
  - How long appointments take (check-up vs procedure)
  - Whether they bulk bill (if applicable)
  - Child dental benefit scheme

- [ ] **After-hours tone variant**
  Add conditional language to prompt:
  *"We're currently closed but I can take your details and our team will call you first thing [next business day]."*
  Tone should be calm and reassuring, not robotic.

- [ ] **Emergency handling language**
  If patient mentions pain, swelling, broken tooth, emergency:
  *"I'm flagging this as urgent — our team will call you as soon as possible. If this is severe, please call 000 or go to your nearest emergency dentist right away."*

### Verification
- [ ] Call the VAPI number, go through routine booking — confirm 3 slot options are offered
- [ ] Call and ask "do you accept BUPA?" — confirm FAQ response fires
- [ ] Call after hours — confirm after-hours tone plays
- [ ] Call and say "I have severe tooth pain" — confirm emergency language plays

---

## Day 2 — n8n Low-Effort Node Additions (Both Workflows)

> Add nodes to existing workflows. Test each node in isolation before full run-through.

### 2A — Business Hours Detection (Build Once, Use in Both)

- [ ] Create a reusable **Code node** named `Business Hours Check`
  Insert immediately after the Webhook node in BOTH Respond and Answer workflows.

  ```javascript
  const now = new Date();
  const aest = new Date(now.toLocaleString('en-AU', { timeZone: 'Australia/Sydney' }));
  const hour = aest.getHours();
  const day = aest.getDay(); // 0=Sun, 6=Sat

  const isWeekday = day >= 1 && day <= 5;
  const isDuringHours = hour >= 8 && hour < 18; // adjust per client

  return [{
    json: {
      ...($input.item.json),
      business_hours: isWeekday && isDuringHours,
      after_hours: !(isWeekday && isDuringHours),
      day_label: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][day],
      hour_aest: hour
    }
  }];
  ```

- [ ] Verify output: run workflow at current time, confirm `business_hours` and `after_hours` fields are present in output

### 2B — Respond After-Hours SMS Variant

- [ ] Add **IF node** after Business Hours Check: condition = `{{ $json.business_hours }} === true`
- [ ] During-hours SMS template:
  *"Hi, we missed your call at [Clinic]. We're with patients right now — reply BOOK and we'll call you back shortly, or call us on [number]."*
- [ ] After-hours SMS template:
  *"Hi, we missed your call at [Clinic]. We're closed right now — we open at 8:30am [next weekday]. Reply BOOK and we'll call you first thing."*
- [ ] Test: trigger webhook manually during hours → confirm during-hours template fires
- [ ] Test: temporarily set hours condition to force after-hours → confirm after-hours template fires

### 2C — Concierge SMS With Specific Callback Time

- [ ] Update SMS template node to include chosen callback slot from VAPI summary
- [ ] During-hours template:
  *"Hi [FirstName], thanks for calling [Clinic]. Your preferred callback time is [slot]. We'll call you then — our number is [number]."*
- [ ] After-hours template:
  *"Hi [FirstName], thanks for calling [Clinic] after hours. We'll call you first thing tomorrow at [slot] — our number is [number]."*
- [ ] Verify both templates render correctly with test payload

### 2D — Concierge Emergency Owner SMS Alert

- [ ] Add **IF node** after urgency classification: condition = `{{ $json.urgency }} === 'emergency'`
- [ ] Emergency branch: add **HTTP Request node** → Twilio SMS to clinic owner mobile
  Template: *"URGENT: [PatientName] ([PatientPhone]) called with a possible dental emergency. Reason: [Reason]. Call them back immediately."*
- [ ] Normal branch: existing flow unchanged
- [ ] Test: send test webhook payload with `urgency: 'emergency'` → confirm owner SMS fires
- [ ] Test: send payload with `urgency: 'routine'` → confirm owner SMS does NOT fire

### 2E — Respond Owner Notification SMS (CustomerReach Respond)

Every missed call that fires an SMS to the patient should **also** notify the clinic owner or front desk. This drives them to the dashboard and ensures no call is invisible.

- [ ] Add **HTTP Request node** in Respond workflow — runs in parallel with the patient SMS node (not dependent on it)
  - Target: Twilio SMS API → clinic owner mobile number (stored in `clients` table as `owner_phone`)
  - Template (during hours):
    *"Missed call from [callerPhone] at [time]. Patient SMS sent. View details: dashboard.bizelevate.app"*
  - Template (after hours):
    *"After-hours missed call from [callerPhone] at [time]. Patient SMS sent. View in dashboard tomorrow: dashboard.bizelevate.app"*
- [ ] Owner phone number: pull from Supabase `clients` table using `client_id` (requires a Supabase GET node before the SMS node — fetch `clients WHERE id = clientId`)
- [ ] Add `owner_notified` boolean field to the Supabase `call_logs` row (set `true` after owner SMS fires)
- [ ] Test: trigger webhook → confirm patient SMS AND owner SMS both arrive
- [ ] Test: confirm `owner_notified=true` in call_logs row in Supabase

**WhatsApp (Phase 2 upgrade):**
Twilio supports WhatsApp via the same API — just prefix the `To` number with `whatsapp:`.
Owner WhatsApp notification is a drop-in swap: `To: whatsapp:+61XXXXXXXXX`.
No workflow changes needed — just a config toggle in the `clients` table (`owner_channel: 'sms' | 'whatsapp'`).
Hold this for Phase 2 unless a client explicitly asks for WhatsApp.

---

## Day 3 — Two-Way SMS + BOOK/HOURS Reply Flow (CustomerReach Respond)

> New webhook endpoint + new Supabase fields. Test reply handling end-to-end before marking done.

### 3A — Supabase Schema Updates

- [ ] Add columns to `call_logs`:
  ```sql
  ALTER TABLE call_logs
    ADD COLUMN reply_received boolean DEFAULT false,
    ADD COLUMN reply_intent text;  -- 'book' | 'hours' | 'other'
  ```
- [ ] Create `callback_tasks` table:
  ```sql
  CREATE TABLE callback_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id text,
    patient_phone text,
    call_log_id uuid REFERENCES call_logs(id),
    priority text DEFAULT 'normal',   -- 'high' | 'normal'
    status text DEFAULT 'pending',    -- 'pending' | 'completed' | 'no_answer'
    created_at timestamptz DEFAULT now(),
    completed_at timestamptz
  );
  ```
- [ ] Verify migration applied in Supabase dashboard

### 3B — New n8n Workflow: SMS Reply Handler

- [ ] Create new n8n workflow: `sms-reply-handler`
- [ ] Add **Webhook node**: path = `sms-reply`, method = POST
- [ ] Add **Code node**: normalise Twilio SMS body (trim, uppercase for comparison)
- [ ] Add **IF node**: `body.includes('BOOK')`
  - [ ] YES branch:
    - Update `call_logs` row: `reply_received=true`, `reply_intent='book'`
    - Insert `callback_tasks` row: `priority='high'`, `status='pending'`
    - Send SMS to patient: *"Perfect — we've noted your request. Someone will call you back shortly."*
    - Send SMS to clinic owner: *"Callback requested by [phone]. Check your dashboard."*
  - [ ] NO branch → IF node: `body.includes('HOURS')`
    - [ ] YES branch:
      - Fetch client hours from Supabase `clients` table
      - Send SMS: *"Smile Dental is open Mon–Fri 8:30am–5:30pm, Sat 9am–1pm. Call us on [number]."*
    - [ ] NO branch: no action (or generic: *"Reply BOOK to request a callback or HOURS for our opening times."*)

### 3C — Twilio Configuration

- [ ] In Twilio Console: set the SMS webhook for the clinic number to point to `https://bizelevate1.app.n8n.cloud/webhook/sms-reply`
- [ ] Test: text "BOOK" to clinic number → confirm callback task created + owner alerted
- [ ] Test: text "HOURS" → confirm hours SMS returned
- [ ] Test: text random text → confirm no error, graceful fallback

---

## Day 4 — Recovery Rate Tracking + Dashboard Callback Queue

> Database and UI changes. Apply migration first, then update dashboard.

### 4A — Supabase: Conversion Tracking

- [ ] Add `converted` column to `call_logs`:
  ```sql
  ALTER TABLE call_logs ADD COLUMN converted boolean DEFAULT false;
  ```
- [ ] Verify RLS policies still apply correctly to new columns

### 4B — Dashboard: Callback Queue View

- [ ] Add query to `callLogService.ts`: fetch `callback_tasks WHERE status='pending'` ordered by priority DESC, created_at ASC
- [ ] Add Callback Queue page/view to dashboard:
  - Show: patient phone, call time, priority badge (HIGH in red), time elapsed since call
  - Actions: Mark Complete, Mark No Answer
  - Completing a task sets `callback_tasks.status='completed'` and `callback_tasks.completed_at=now()`

### 4C — Dashboard: Conversion Funnel Widget

- [ ] Add funnel widget to dashboard home showing 4 numbers for current week:
  1. Missed Calls (total Respond events)
  2. SMS Sent (`sms_sent=true`)
  3. Replied (`reply_received=true`)
  4. Booked (`converted=true`)
- [ ] Staff can mark `converted=true` from the call log detail view when a booking is confirmed

### 4D — Daily Missed Call Summary Email

- [ ] Create new n8n workflow: `daily-missed-call-summary`
- [ ] Trigger: **Cron node** — 7:30am AEST every weekday
- [ ] Query Supabase: yesterday's call_logs WHERE capability='missed_call'
- [ ] Build summary: total missed, SMS sent count, replies received, bookings confirmed
- [ ] Send email to clinic owner via n8n Email node or Twilio SMS:
  *"Yesterday at [Clinic]: [X] missed calls, [Y] SMS sent, [Z] replied, [W] bookings confirmed."*
- [ ] Test: trigger manually, confirm email/SMS received with correct data

---

## Day 5 — End-to-End Testing + Demo Prep

> Full scenario run-through. Fix anything broken. Prepare demo script.

### 5A — Full Scenario Test Matrix

| Scenario | Expected Result | Pass? |
|----------|----------------|-------|
| Call during hours, no answer | During-hours Respond SMS fires | |
| Call after hours, no answer | After-hours Respond SMS with open time fires | |
| Reply BOOK to Respond SMS | Callback task created, owner alerted, confirmation SMS sent | |
| Reply HOURS to Respond SMS | Hours SMS returned, no task created | |
| VAPI call during hours — routine | SMS with callback slot, logged to Supabase | |
| VAPI call after hours — routine | After-hours SMS with tomorrow callback | |
| VAPI call — emergency urgency | Owner SMS fires immediately, flagged as emergency in dashboard | |
| VAPI call — FAQ question asked | Correct FAQ answer given by Alex | |
| Dashboard callback queue | Pending tasks show, can mark complete | |
| Dashboard funnel widget | Shows correct counts for current week | |
| Daily summary (manual trigger) | Email/SMS received with accurate data | |

### 5B — Demo Script (60-Second Respond Demo)

1. "Call this number from your phone." (clinic demo number)
2. Let it ring — do not answer
3. Hang up after 5–6 rings
4. "Watch your phone." → SMS arrives within 10 seconds
5. Show SMS: during-hours or after-hours variant as appropriate
6. "Now text back BOOK." → within seconds: confirmation SMS arrives
7. Open dashboard: show callback task in queue with HIGH priority
8. "Your receptionist opens this in the morning. Highest priority callbacks are at the top. Nothing falls through the cracks."

### 5C — Demo Script (Concierge Demo)

1. Call VAPI demo number
2. Alex answers — go through routine booking (name, phone, slot preference, reason)
3. Choose "11am" as preferred callback slot
4. Confirm details — end call
5. Show SMS received immediately with specific callback time
6. Open dashboard: show call log with urgency, reason, name populated
7. "Every overnight or lunchtime call is captured, classified, and waiting for your team."

### 5D — Objection Preparation

| Objection | Response |
|-----------|----------|
| "We already have voicemail" | Voicemail requires patients to leave a message and staff to listen. 70% of callers hang up without leaving one. This recovers those calls automatically. |
| "Our receptionist handles callbacks" | This is for the calls that happen when they can't — before hours, after hours, while they're with a patient. It's additive, not a replacement. |
| "How do we know it's working?" | The dashboard shows you exactly: missed calls → SMS sent → replied → booked. You can calculate recovered revenue in 30 seconds. |
| "What if a patient replies with something unexpected?" | Anything that isn't BOOK or HOURS falls through gracefully. No auto-response, no confusion. Staff see the reply in the dashboard. |
| "Does it integrate with our booking system?" | No — deliberately. Nothing touches your clinical systems. It captures the lead and queues it for your team. Simple and safe. |

---

## Done When

- [ ] All Day 1–4 tasks checked off
- [ ] All Day 5 test matrix scenarios pass
- [ ] Demo run-through completed without issues
- [ ] First client conversation booked

## What Comes Next (Phase 2)

Once this sprint is complete and client 1 is signed, Phase 2 begins:

| Next Build | Tier Unlocked | Reference |
|------------|--------------|-----------|
| CustomerReach Remind workflow | Growth ($799/mo) | [PLAYBOOK Phase 2](../missed-call/PLAYBOOK.md) |
| CustomerReach Review workflow | Growth ($799/mo) | [PLAYBOOK Phase 2](../missed-call/PLAYBOOK.md) |
| Shared services sub-workflows + Router | All tiers (infrastructure) | [PLAYBOOK Phase 2](../missed-call/PLAYBOOK.md) |
| Multi-client routing (client 2 onboarding) | Core+ | [PLAYBOOK Phase 2](../missed-call/PLAYBOOK.md) |
| Dashboard: Callback Queue + Funnel widget | Core+ | [PLAYBOOK Phase 2](../missed-call/PLAYBOOK.md) |

---

*Sprint created: 2026-03-10*
*Phase: 1 of 3 — see [missed-call/PLAYBOOK.md](../missed-call/PLAYBOOK.md) for full roadmap*

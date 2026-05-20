# BizElevate Testing Runbook

The single source for how to test. Three modes — pick the one that matches the situation.

| Mode | When to use | Time |
|---|---|---|
| **Pre-demo** | Before showing the product to any prospect | 5 min |
| **Pre-go-live** | Before a client goes live, after any workflow or schema change | 30 min |
| **Full regression** | After major multi-workflow changes or schema migrations | 60 min |

**Test number:** `+61485004338` (demo Twilio number). Never use a real client number for testing.

**Rule:** Never run destructive tests against production data. All testing uses the demo number.

---

## Prerequisites

Before running any mode, confirm:

- [ ] n8n workflows are **ACTIVE** — saved ≠ active, check the toggle:
  - `W9lssqC5Jvd3nIVo` — Missed Call Recovery
  - `q4CYSzFYuYfp1eWa` — SMS Reply Handler
  - `wN3cyY7o0kJhk9DS` — Reminder Scheduler (required for Mode 2 CP-06/07)
  - `inmiGyHTCEP3a2hd` — Reminder Reply Handler (required for Mode 2 CP-07)
- [ ] Supabase is reachable (open dashboard, confirm no outage)
- [ ] Test mobile ready to receive SMS
- [ ] `secrets.local.json` accessible — need `VAPI_WEBHOOK_SECRET` for CP-04/05

---

## Mode 1: Pre-Demo (5 min)

Fire one test, confirm SMS arrives. If it does, the demo is safe to run.

```bash
curl -X POST https://bizelevate1.app.n8n.cloud/webhook/missed-call \
  --data "From=0412000001&To=+61485004338&CallSid=CA-DEMO-CHECK&CallStatus=no-answer"
```

| Check | Where to verify | Expected |
|---|---|---|
| SMS received | Test mobile | Within 10 seconds |
| SMS body | Test mobile | Contains clinic name — no placeholders |
| n8n execution | n8n → Executions tab | Green (success) |

**If this fails:** Do not demo. Check: workflow `W9lssqC5Jvd3nIVo` is active, Twilio StatusCallback is configured on `+61485004338`.

---

## Mode 2: Pre-Go-Live (30 min)

Nine critical path tests. Run in order — some tests build on the previous one.

---

### CP-01: Missed Call → SMS Fires

**If this fails:** Core demo is broken. Nothing works.

```bash
curl -X POST https://bizelevate1.app.n8n.cloud/webhook/missed-call \
  --data "From=0412000001&To=+61485004338&CallSid=CA-CP01&CallStatus=no-answer"
```

| Check | Where | Expected |
|---|---|---|
| SMS received | Test mobile | Within 10 seconds |
| n8n execution | Executions tab | Success |
| `call_logs.sms_sent` | Supabase → call_logs | `true` |
| `call_logs.capability` | Supabase → call_logs | `missed_call` |
| `call_logs.client_id` | Supabase → call_logs | Correct client slug (e.g. `riverside-dental`) |

---

### CP-02: SMS Reply → Callback Flag

**Precondition:** CP-01 complete, SMS received.

Reply **"CALL ME"** to the SMS from CP-01. Wait 5 seconds.

| Check | Where | Expected |
|---|---|---|
| n8n SMS Reply Handler | Executions tab | Success |
| `call_logs.reply_received` | Supabase → call_logs | `true` |
| `call_logs.reply_intent` | Supabase → call_logs | `callback` |
| `call_logs.callback_requested` | Supabase → call_logs | `true` |

**If this fails:** Staff see no callback intent in dashboard — missed follow-ups. Check: `q4CYSzFYuYfp1eWa` active, Twilio inbound SMS webhook set to `.../webhook/sms-reply`.

---

### CP-03: Answered Call → No SMS (Filter Check)

**If this fails:** Every answered call triggers an unwanted "You missed a call" SMS to the patient.

```bash
curl -X POST https://bizelevate1.app.n8n.cloud/webhook/missed-call \
  --data "From=0412000001&To=+61485004338&CallSid=CA-CP03&CallStatus=completed"
```

| Check | Where | Expected |
|---|---|---|
| SMS received | Test mobile | **None** |
| n8n execution | Executions tab | Filtered — SMS node not reached |

---

### CP-04: Appointment Intake → Confirmation SMS

**If this fails:** Appointment concierge captures nothing. No SMS to patient.

Replace `<VAPI_WEBHOOK_SECRET>` with the value from `secrets.local.json`.

```bash
curl -X POST https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment \
  -H "Content-Type: application/json" \
  -H "x-vapi-secret: <VAPI_WEBHOOK_SECRET>" \
  -d '{
    "message": {
      "type": "end-of-call-report",
      "call": {
        "id": "cp-test-004",
        "customer": { "number": "+61412000099" }
      },
      "analysis": {
        "structuredData": {
          "patientName": "CP Test Patient",
          "patientPhone": "+61412000099",
          "requestedDateTime": "Monday 9am",
          "reason": "New patient consultation"
        },
        "successEvaluation": "success"
      }
    }
  }'
```

| Check | Where | Expected |
|---|---|---|
| HTTP response | curl output | `200` |
| n8n execution | Executions tab | Success |
| `call_logs` row | Supabase → call_logs | Row present |
| `call_logs.urgency` | Supabase → call_logs | `routine` |
| SMS received | Test mobile (`+61412000099`) | "Hi CP Test Patient, thanks for calling…" |

---

### CP-05: Invalid VAPI Secret → Rejected

**If this fails:** The webhook accepts unauthenticated requests — security risk.

```bash
curl -X POST https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment \
  -H "Content-Type: application/json" \
  -H "x-vapi-secret: WRONG_SECRET" \
  -d '{"message": {}}'
```

| Check | Where | Expected |
|---|---|---|
| HTTP response | curl output | Non-200 (rejected) |

---

### CP-06: Appointment Reminder → Patient SMS

**If this fails:** Growth tier is unsellable — reminders don't fire.

1. Open dashboard → Appointments → New Appointment
2. Enter: Name = `CP Remind Test`, Mobile = [your real test mobile], Datetime = **now + 3 minutes**
3. Save.

| Check | Where | Expected |
|---|---|---|
| `appointment_reminders` rows | Supabase → appointment_reminders | 2 rows (48h + 2h) |
| 2h row `scheduled_for` | Supabase → appointment_reminders | ≈ appointment_time − 2h (will be in the past or very soon) |

Wait up to **15 minutes** for the scheduler to run (it fires on a schedule).

| Check | Where | Expected |
|---|---|---|
| SMS received | Test mobile | Contains "CP Remind Test" + appointment time |
| `reminder_status` | Supabase → appointment_reminders | `sent` |
| `sent_at` | Supabase → appointment_reminders | Populated |

**If this fails:** Check: `wN3cyY7o0kJhk9DS` active, client has `appointment_reminder` enabled in `client_subscriptions`.

---

### CP-07: CANCEL Reply → Appointment Cancelled + Owner Alert

**Precondition:** CP-06 complete, reminder SMS received.

Reply **"CANCEL"** to the reminder SMS. Wait 5 seconds.

| Check | Where | Expected |
|---|---|---|
| Ack SMS received | Test mobile | "…your appointment has been cancelled…" |
| `appointments.status` | Supabase → appointments | `cancelled` |
| Pending reminder rows | Supabase → appointment_reminders | All set to `reminder_status='cancelled'` |
| Owner alert SMS | Owner mobile | Received — mentions "CP Remind Test" |
| Dashboard appointment | Browser | Shows "Cancelled" |

**If this fails:** Clinic gets no warning when patients cancel. Check: `inmiGyHTCEP3a2hd` active, Twilio inbound SMS webhook configured.

---

### CP-08: Booking Link Click → Tracked

**Precondition:** CP-01 complete, SMS received with booking link.

Copy the booking link from the SMS in CP-01. Open it in a browser.

| Check | Where | Expected |
|---|---|---|
| Browser redirects | Browser | To booking URL — no dead end |
| `call_logs.booking_link_clicked` | Supabase → call_logs | `true` |

**If this fails:** No ROI reporting on booking conversions — hard to justify value to client.

---

### CP-09: Multi-Client Isolation

**If this fails:** Wrong clinic name in patient SMS — data privacy failure.

```bash
curl -X POST https://bizelevate1.app.n8n.cloud/webhook/missed-call \
  --data "From=0412000099&To=+61485004338&CallSid=CA-ISOL-A&CallStatus=no-answer"
```

| Check | Where | Expected |
|---|---|---|
| SMS body | Test mobile | Contains the correct clinic name for this Twilio number |
| `call_logs.client_id` | Supabase → call_logs | Correct client slug — not another client's |

If a second Twilio number is configured for a different client, fire a second request with that `To` number and confirm a different client slug is written.

---

## Mode 3: Full Regression (60 min)

Run all of Mode 2, plus the following additional checks.

**Bad input — no SMS on invalid phone:**
```bash
curl -X POST https://bizelevate1.app.n8n.cloud/webhook/missed-call \
  --data "From=039012345&To=+61485004338&CallSid=CA-INVALID&CallStatus=no-answer"
```
Verify: no SMS sent, `call_logs` row written with `sms_sent=false`.

**Lowercase and padded cancel intent:**
Reply `cancel` (all lowercase) then `CANCEL ` (trailing space) to a reminder SMS.
Both should cancel the appointment — intent detection must be case/whitespace tolerant.

**Emergency urgency alert:**
Send the CP-04 payload but change `reason` to `"severe toothache, can't open mouth"`. Verify: `call_logs.urgency = 'emergency'`, owner alert SMS fires.

**Dashboard CRUD:**
- Create an appointment via UI → confirm row in Supabase
- Update an action status (new → contacted) → confirm in Supabase
- Log in as client A → confirm client B's data is not visible (RLS check)

**Regression frequency:** Run before onboarding a new client, after any schema migration, after any multi-workflow change.

---

## Test Sign-off

| Mode | Run by | Date | Pass/Fail | Notes |
|---|---|---|---|---|
| Pre-demo | | | | |
| Pre-go-live (all 9 CPs) | | | | |
| Full regression | | | | |

---

## Agent Execution Notes

This runbook is structured for manual execution now and agent execution in the future.

Each test provides:
- A literal command (curl or dashboard action)
- Exact table/field checks with expected values
- A failure consequence so the agent knows when to halt vs. continue

When an agent runs this runbook, it should:
1. Run prerequisite checks via n8n MCP (verify workflows active) and Supabase MCP (verify connectivity)
2. Execute each CP test in order, recording pass/fail per check row
3. Stop and report on first P1 failure (CP-01 through CP-05, CP-09) — do not continue pre-go-live with a broken core flow
4. Output a signed-off summary matching the sign-off table above

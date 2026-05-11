# Manual QA Checklist

**Use this before any demo, client go-live, or release.**
Complete each section in order. Do not skip sections.

---

## Pre-Check: Environment Setup

Before running any test:

- [ ] Confirm target environment (dev / preprod / prod)
- [ ] Confirm n8n workflows are **active** (not just saved — check the toggle)
  - [ ] `W9lssqC5Jvd3nIVo` — Missed Call Recovery (ACTIVE?)
  - [ ] `q4CYSzFYuYfp1eWa` — SMS Reply Handler (ACTIVE?)
  - [ ] `wN3cyY7o0kJhk9DS` — Reminder Scheduler (ACTIVE?)
  - [ ] `inmiGyHTCEP3a2hd` — Reminder Reply Handler (ACTIVE?)
- [ ] Confirm Supabase is reachable (open dashboard, check no outage)
- [ ] Have a test mobile number ready to receive SMS
- [ ] Have Supabase call_logs and appointments tables open for verification

---

## Section 1: CustomerReach Respond — Missed Call Recovery

### 1a. Smoke Test (2 min)

```bash
curl -X POST https://bizelevate1.app.n8n.cloud/webhook/missed-call \
  --data "From=0412000001&To=+61485004338&CallSid=CA-SMOKE-001&CallStatus=no-answer"
```

- [ ] n8n execution appears in Executions tab — status: success
- [ ] SMS received on test mobile within 10 seconds
- [ ] SMS contains client name (not placeholder text)
- [ ] SMS contains booking link OR "reply BOOK" text
- [ ] Supabase `call_logs`: new row with `capability='missed_call'`, `sms_sent=true`

### 1b. Reply Capture (3 min)

Reply "CALL ME" to the SMS received above.

- [ ] n8n SMS Reply Handler execution appears — status: success
- [ ] Supabase `call_logs`: `callback_requested=true`, `reply_intent='callback'`

### 1c. Booking Link Click (1 min)

Tap the booking link in the SMS.

- [ ] Redirects to booking page (or returns 302)
- [ ] Supabase `call_logs`: `booking_link_clicked=true`

### 1d. Filter Check — answered call should NOT fire

```bash
curl -X POST https://bizelevate1.app.n8n.cloud/webhook/missed-call \
  --data "From=0412000001&To=+61485004338&CallSid=CA-FILTER-001&CallStatus=completed"
```

- [ ] No SMS received
- [ ] n8n execution: filtered out (no SMS node reached)

---

## Section 2: CustomerReach Answer — Appointment Concierge

### 2a. Routine Intake

```bash
curl -X POST https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment \
  -H "Content-Type: application/json" \
  -H "x-vapi-secret: <VAPI_WEBHOOK_SECRET>" \
  -d '{
    "message": {
      "type": "end-of-call-report",
      "call": {
        "id": "qa-routine-001",
        "customer": { "number": "+61412000001" }
      },
      "analysis": {
        "structuredData": {
          "patientName": "QA Test Patient",
          "patientPhone": "+61412000001",
          "requestedDateTime": "Tuesday 10am",
          "reason": "Annual check-up"
        },
        "successEvaluation": "success"
      }
    }
  }'
```

- [ ] HTTP 200 response
- [ ] n8n execution: success
- [ ] SMS received: "Hi QA Test Patient, thanks for calling..."
- [ ] Supabase `call_logs`: row with `urgency='routine'`

### 2b. Emergency Urgency Path

Fire Test 3 (emergency payload) from [TEST-PAYLOADS.md](../appointment-concierge/docs/TEST-PAYLOADS.md).

- [ ] Urgency classified as `emergency`
- [ ] Owner SMS alert fired (check owner mobile)
- [ ] Supabase row present

### 2c. VAPI Secret Validation

```bash
curl -X POST https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment \
  -H "Content-Type: application/json" \
  -H "x-vapi-secret: WRONG_SECRET" \
  -d '{"message": {}}'
```

- [ ] Request rejected (non-200 response or filtered by n8n auth)

---

## Section 3: CustomerReach Remind — Appointment Reminders

### 3a. Appointment Creation + Reminder Rows

1. Open dashboard → Appointments → Add New
2. Patient: QA Reminder Test, Mobile: [your test mobile], Datetime: 3 minutes from now

- [ ] Appointment row appears in dashboard
- [ ] Supabase `appointment_reminders`: 2 rows created (48h + 2h)
- [ ] 2h row has `scheduled_for` ≈ 1 minute from now (appointment_time minus 2h but appointment is only 3 min away — wait for scheduler)

### 3b. Scheduler Fires SMS

Wait up to 15 minutes for the scheduler to run.

- [ ] SMS received on test mobile with patient name and appointment time
- [ ] Supabase `appointment_reminders`: `reminder_status='sent'`, `sent_at` populated

### 3c. CANCEL Reply

Reply "CANCEL" to the reminder SMS.

- [ ] Ack SMS received ("your appointment has been cancelled...")
- [ ] Supabase `appointments`: `status='cancelled'`
- [ ] Supabase `appointment_reminders`: pending rows set to `reminder_status='cancelled'`
- [ ] Owner alert SMS received

### 3d. Dashboard Reflection

- [ ] Appointment row shows "Cancelled" status
- [ ] Reminder badge shows "Cancelled" for affected rows

---

## Section 4: Dashboard Checks

- [ ] Call logs page loads — data visible for correct client
- [ ] Can update action status on a call log row (new → contacted)
- [ ] Appointments page visible (if Growth tier client)
- [ ] Cannot see other clients' data when logged in as a specific client

---

## Section 5: Demo Readiness Gate

This must pass before any prospect demo:

- [ ] Section 1a complete — missed call SMS fires within 10 seconds
- [ ] Section 2a complete — appointment intake SMS fires correctly
- [ ] SMS body looks professional (correct clinic name, no placeholders, no Supabase URLs visible)
- [ ] Dashboard shows data that was just created in tests
- [ ] No test data left visible that could confuse a demo (or filtered by `qa-` prefix if cleanup needed)

---

## Sign-off

| Section | Tester | Date | Pass/Fail | Notes |
|---------|--------|------|-----------|-------|
| Pre-Check | | | | |
| 1 — Respond | | | | |
| 2 — Answer | | | | |
| 3 — Remind | | | | |
| 4 — Dashboard | | | | |
| 5 — Demo Gate | | | | |

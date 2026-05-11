# Critical Path Test Cases

These are the tests that map directly to revenue and demo outcomes.
Every one must pass before client go-live. Run in order.

---

## CP-01: Missed Call → SMS Recovery (Core Demo Test)

**Capability:** CustomerReach Respond
**Business Risk:** If this fails, the core demo fails and no client signs up
**Precondition:** Workflow `W9lssqC5Jvd3nIVo` active, Twilio StatusCallback configured

### Steps

1. From a mobile phone, call `+61485004338`. Do not answer. Let it ring 5–6 times.
2. Hang up.
3. Wait up to 10 seconds.

### Expected Results

| Check | Expected | Pass? |
|-------|----------|-------|
| SMS arrives on calling mobile | Within 10 seconds | |
| SMS sender shows Twilio number | Yes | |
| SMS body contains clinic name | "Riverside Dental" (or configured name) | |
| SMS contains booking link or BOOK prompt | Yes | |
| n8n execution: status | Success (green) | |
| Supabase call_logs: sms_sent | `true` | |
| Supabase call_logs: capability | `missed_call` | |
| Supabase call_logs: client_id | Correct client slug | |

---

## CP-02: SMS Reply → Callback Flag

**Capability:** CustomerReach Respond — reply capture
**Business Risk:** Staff can't see callback intent in dashboard; missed follow-ups
**Precondition:** CP-01 completed, SMS received, SMS Reply Handler active

### Steps

1. Reply "CALL ME" to the SMS received in CP-01.
2. Wait 5 seconds.

### Expected Results

| Check | Expected | Pass? |
|-------|----------|-------|
| n8n SMS Reply Handler execution | Success | |
| call_logs: reply_received | `true` | |
| call_logs: reply_intent | `callback` | |
| call_logs: callback_requested | `true` | |

---

## CP-03: Appointment Intake → Confirmation SMS

**Capability:** CustomerReach Answer
**Business Risk:** If intake fails, no appointment requests captured from AI calls
**Precondition:** VAPI webhook `vapi-appointment` active

### Steps

Run the following cURL (replace `<VAPI_WEBHOOK_SECRET>` with real value from secrets.local.json):

```bash
curl -X POST https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment \
  -H "Content-Type: application/json" \
  -H "x-vapi-secret: <VAPI_WEBHOOK_SECRET>" \
  -d '{
    "message": {
      "type": "end-of-call-report",
      "call": {
        "id": "cp-test-003",
        "customer": { "number": "+61412000099" }
      },
      "analysis": {
        "structuredData": {
          "patientName": "Critical Path Test",
          "patientPhone": "+61412000099",
          "requestedDateTime": "Monday 9am",
          "reason": "New patient consultation"
        },
        "successEvaluation": "success"
      }
    }
  }'
```

### Expected Results

| Check | Expected | Pass? |
|-------|----------|-------|
| HTTP response | 200 | |
| n8n execution | Success | |
| Supabase call_logs: row created | Yes | |
| Supabase call_logs: urgency | `routine` | |
| SMS sent to +61412000099 | Yes — contains "Critical Path Test" | |

---

## CP-04: Appointment Reminder → Patient SMS

**Capability:** CustomerReach Remind
**Business Risk:** No-show reduction fails; Growth tier is unsellable
**Precondition:** Scheduler workflow `wN3cyY7o0kJhk9DS` active, client subscribed to `appointment_reminder`

### Steps

1. Open dashboard → Appointments → New Appointment
2. Enter: Patient Name = "CP Test Remind", Mobile = [your real mobile], Datetime = now + 3 minutes
3. Save.
4. Verify in Supabase: `appointment_reminders` has 2 rows for this appointment.
5. Wait for scheduler (max 15 min, fires every 15 min).

### Expected Results

| Check | Expected | Pass? |
|-------|----------|-------|
| appointment_reminders rows | 2 rows (48h + 2h) | |
| 2h row scheduled_for | Within 1 minute of appointment - 2h | |
| SMS received | Within 15 minutes | |
| SMS body: patient name | "CP Test Remind" | |
| SMS body: appointment time | Matches what was entered | |
| appointment_reminders: reminder_status | `sent` after SMS | |
| appointment_reminders: sent_at | Populated | |

---

## CP-05: CANCEL Reply → Appointment Cancelled + Owner Alert

**Capability:** CustomerReach Remind — reply handling
**Business Risk:** Cancellations not captured; clinic has empty slot with no warning
**Precondition:** CP-04 completed, reminder SMS received, Reply Handler `inmiGyHTCEP3a2hd` active, Twilio inbound SMS webhook configured

### Steps

1. Reply "CANCEL" to the reminder SMS received in CP-04.
2. Wait 5 seconds.

### Expected Results

| Check | Expected | Pass? |
|-------|----------|-------|
| Ack SMS received | "...your appointment has been cancelled..." | |
| Supabase appointments: status | `cancelled` | |
| Supabase appointment_reminders: pending rows | All set to `reminder_status='cancelled'` | |
| Owner alert SMS | Received on owner_phone ("CP Test Remind cancelled...") | |
| Dashboard: appointment status | Shows "Cancelled" | |

---

## CP-06: Multi-Client Isolation

**Capability:** All
**Business Risk:** Client A receives Client B's SMS; data privacy failure and demo embarrassment
**Precondition:** Two client rows in phone_number_map with different numbers and client_ids

### Steps

```bash
# Fire webhook for Client A's number
curl -X POST https://bizelevate1.app.n8n.cloud/webhook/missed-call \
  --data "From=0412000002&To=+61485004338&CallSid=CA-ISOL-A&CallStatus=no-answer"

# Fire webhook for Client B's number (replace with real second Twilio number if available)
curl -X POST https://bizelevate1.app.n8n.cloud/webhook/missed-call \
  --data "From=0412000003&To=+61485000000&CallSid=CA-ISOL-B&CallStatus=no-answer"
```

### Expected Results

| Check | Expected | Pass? |
|-------|----------|-------|
| SMS for Client A | Contains Client A's name | |
| SMS for Client B | Contains Client B's name (different) | |
| call_logs Client A row: client_id | Client A slug | |
| call_logs Client B row: client_id | Client B slug | |

---

## CP-07: Invalid Phone Number Handling

**Capability:** CustomerReach Respond
**Business Risk:** Workflow crashes on bad input; n8n errors pile up; missed logs
**Precondition:** Workflow active

### Steps

```bash
curl -X POST https://bizelevate1.app.n8n.cloud/webhook/missed-call \
  --data "From=039012345&To=+61485004338&CallSid=CA-INVALID-001&CallStatus=no-answer"
```

### Expected Results

| Check | Expected | Pass? |
|-------|----------|-------|
| n8n execution | Completes (no crash) | |
| SMS sent | **No** — invalid AU mobile | |
| Supabase call_logs: row written | Yes — with sms_sent=false | |
| call_logs: notes | Contains CallStatus and To field | |

---

## CP-08: Booking Link Click Tracking

**Capability:** CustomerReach Respond — conversion tracking
**Business Risk:** No visibility on patient intent; can't report ROI to clients
**Precondition:** CP-01 completed, booking link in SMS, Supabase Edge Function `book` deployed

### Steps

1. Copy the tracking link from the SMS received in CP-01.
2. Open it in a browser.

### Expected Results

| Check | Expected | Pass? |
|-------|----------|-------|
| Browser redirects | To booking URL (or 302) | |
| Supabase call_logs: booking_link_clicked | `true` | |

---

## Summary

| ID | Capability | Critical For |
|----|-----------|-------------|
| CP-01 | Respond — SMS fires | Core demo |
| CP-02 | Respond — reply capture | Dashboard value prop |
| CP-03 | Answer — intake → SMS | Appointment concierge demo |
| CP-04 | Remind — scheduler fires | Growth tier demo |
| CP-05 | Remind — cancel reply | Clinic operations |
| CP-06 | All — multi-client isolation | Client safety |
| CP-07 | Respond — bad input | Reliability |
| CP-08 | Respond — click tracking | ROI reporting |

**All 8 must pass before first client go-live.**

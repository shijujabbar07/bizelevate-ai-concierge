# Test Inventory

**Version:** 1.0
**Date:** 2026-03-21

All test IDs use format: `[CAP]-[TYPE]-[NNN]`
- CAP: RESP (Respond), ANS (Answer), REM (Remind), DB (Dashboard), INT (Integration)
- TYPE: HAPPY, EDGE, ERROR, REG (regression)

---

## CustomerReach Respond — Missed Call Recovery

| ID | Test Name | Type | Method | Priority |
|----|-----------|------|--------|----------|
| RESP-HAPPY-001 | Missed call — valid AU mobile, known Twilio number | Happy | cURL | P1 |
| RESP-HAPPY-002 | Missed call — `no-answer` status fires SMS | Happy | cURL | P1 |
| RESP-HAPPY-003 | Missed call — `busy` status fires SMS | Happy | cURL | P1 |
| RESP-HAPPY-004 | SMS received within 10 seconds | Happy | Live call | P1 |
| RESP-HAPPY-005 | call_logs row written with correct client_id | Happy | SQL verify | P1 |
| RESP-HAPPY-006 | Booking link embedded in SMS when client has booking_link set | Happy | SMS inspect | P1 |
| RESP-HAPPY-007 | Patient replies CALL ME → callback_requested=true in call_logs | Happy | SMS reply | P1 |
| RESP-HAPPY-008 | Patient replies CALL → callback_requested=true in call_logs | Happy | SMS reply | P1 |
| RESP-HAPPY-009 | Booking link click → booking_link_clicked=true, redirects correctly | Happy | Browser | P1 |
| RESP-EDGE-010 | Invalid AU phone (landline format) → no SMS, log still written | Edge | cURL | P2 |
| RESP-EDGE-011 | Unknown `To` number (not in phone_number_map) → workflow fails gracefully | Edge | cURL | P2 |
| RESP-EDGE-012 | `CallStatus=completed` (answered) → filtered out, no SMS | Edge | cURL | P2 |
| RESP-EDGE-013 | `CallStatus=canceled` → filtered out, no SMS | Edge | cURL | P2 |
| RESP-EDGE-014 | Patient with no booking_link → SMS uses BOOK reply prompt | Edge | cURL + SQL | P2 |
| RESP-EDGE-015 | Two missed calls from same number — two separate call_log rows | Edge | cURL x2 | P3 |
| RESP-EDGE-016 | SMS reply with unknown intent → reply_received=true, reply_intent=other | Edge | SMS reply | P3 |
| RESP-ERROR-017 | Twilio send fails (bad number) → log written, sms_sent=false | Error | cURL | P2 |
| RESP-REG-018 | Multi-client: same workflow, two different Twilio numbers → correct SMS body per client | Regression | cURL x2 | P1 |

---

## CustomerReach Answer — Appointment Concierge

| ID | Test Name | Type | Method | Priority |
|----|-----------|------|--------|----------|
| ANS-HAPPY-001 | Routine appointment intake — full data | Happy | Postman | P1 |
| ANS-HAPPY-002 | Urgency classified as `routine` | Happy | Postman | P1 |
| ANS-HAPPY-003 | Urgency classified as `urgent` | Happy | Postman | P1 |
| ANS-HAPPY-004 | Urgency classified as `emergency` | Happy | Postman | P1 |
| ANS-HAPPY-005 | SMS confirmation sent to patient | Happy | Postman | P1 |
| ANS-HAPPY-006 | call_logs row written with capability=appointment_concierge | Happy | SQL verify | P1 |
| ANS-EDGE-007 | Null patientName — fallback to "Unknown Patient" | Edge | Postman | P2 |
| ANS-EDGE-008 | Null patientPhone — falls back to call.customer.number | Edge | Postman | P2 |
| ANS-EDGE-009 | Null requestedDateTime — fallback to "To be confirmed" | Edge | Postman | P2 |
| ANS-EDGE-010 | VAPI secret header missing → webhook rejects request | Edge | Postman | P2 |
| ANS-EDGE-011 | Wrong VAPI secret → webhook rejects request | Edge | Postman | P2 |
| ANS-EDGE-012 | Emergency urgency → owner SMS alert fires | Edge | Postman | P2 |
| ANS-ERROR-013 | Malformed JSON payload → workflow fails gracefully, no crash | Error | Postman | P2 |
| ANS-REG-014 | Re-run all 5 test payloads from TEST-PAYLOADS.md | Regression | Postman | P1 |

---

## CustomerReach Remind — Appointment Reminders

| ID | Test Name | Type | Method | Priority |
|----|-----------|------|--------|----------|
| REM-HAPPY-001 | Create appointment → two reminder rows created automatically | Happy | Dashboard | P1 |
| REM-HAPPY-002 | 48h reminder fires when scheduled_for <= now() | Happy | Dashboard + wait | P1 |
| REM-HAPPY-003 | 2h reminder fires when scheduled_for <= now() | Happy | Dashboard + wait | P1 |
| REM-HAPPY-004 | SMS received with correct patient name and appointment time | Happy | SMS inspect | P1 |
| REM-HAPPY-005 | Patient replies CONFIRM → ack SMS sent | Happy | SMS reply | P1 |
| REM-HAPPY-006 | Patient replies CANCEL → ack SMS + appointment cancelled + owner alerted | Happy | SMS reply | P1 |
| REM-HAPPY-007 | Cancel pending reminder rows when appointment cancelled | Happy | SQL verify | P1 |
| REM-HAPPY-008 | Dashboard shows correct reminder status badges (sent/pending/failed) | Happy | Dashboard | P1 |
| REM-EDGE-009 | Appointment < 48h away → only 2h reminder fires, 48h skipped | Edge | Dashboard | P2 |
| REM-EDGE-010 | Appointment < 2h away → both reminders skipped | Edge | Dashboard | P2 |
| REM-EDGE-011 | Patient sends non-keyword reply → no action, no ack | Edge | SMS reply | P2 |
| REM-EDGE-012 | Appointment cancelled before reminders fire → reminders cancelled | Edge | Dashboard | P2 |
| REM-EDGE-013 | `CANCEL` with trailing space → still detects as cancel intent | Edge | SMS reply | P3 |
| REM-EDGE-014 | `cancel` (lowercase) → still detects as cancel intent | Edge | SMS reply | P3 |
| REM-ERROR-015 | Twilio send fails → reminder_status=failed, failure_reason written | Error | SQL verify | P2 |
| REM-ERROR-016 | No patient mobile on appointment → scheduler skips gracefully | Error | SQL + wait | P2 |
| REM-REG-017 | Full E2E: create appointment → 48h reminder fires → CANCEL reply → owner alert | Regression | All channels | P1 |

---

## Dashboard

| ID | Test Name | Type | Method | Priority |
|----|-----------|------|--------|----------|
| DB-HAPPY-001 | Call logs display for correct client | Happy | Browser | P1 |
| DB-HAPPY-002 | Action status update (new → contacted → resolved) | Happy | Browser | P1 |
| DB-HAPPY-003 | Appointment creation via UI → rows in Supabase | Happy | Browser + SQL | P1 |
| DB-HAPPY-004 | Appointment cancellation via UI → status=cancelled | Happy | Browser + SQL | P1 |
| DB-HAPPY-005 | Reminder status badges reflect Supabase data | Happy | Browser | P1 |
| DB-HAPPY-006 | RLS: client A cannot see client B's data | Happy | SQL | P1 |
| DB-EDGE-007 | Login with invalid credentials → denied | Edge | Browser | P2 |
| DB-EDGE-008 | Expired session → redirect to login | Edge | Browser | P2 |

---

## Integration / Cross-Capability

| ID | Test Name | Type | Method | Priority |
|----|-----------|------|--------|----------|
| INT-HAPPY-001 | Missed call → SMS reply CALL → callback_requested in dashboard | Happy | Full flow | P1 |
| INT-HAPPY-002 | Appointment concierge call → log visible in dashboard with urgency | Happy | Full flow | P1 |
| INT-HAPPY-003 | Appointment reminders visible in dashboard after creation | Happy | Full flow | P1 |
| INT-EDGE-004 | Same Twilio number handles both missed-call and reminder-sms-reply (routing conflict test) | Edge | Config check | P2 |
| INT-REG-005 | Full demo script: missed call → SMS → reply BOOK → dashboard shows row | Regression | Full flow | P1 |

---

## Total Test Count: 58 test cases

| Priority | Count |
|----------|-------|
| P1 | 28 |
| P2 | 24 |
| P3 | 6 |

**Estimated execution time:**
- P1 only: ~45 min
- P1 + P2: ~90 min
- Full suite: ~2 hours

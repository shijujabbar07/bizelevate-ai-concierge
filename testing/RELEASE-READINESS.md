# Release Readiness Checklist

Use this before any client go-live or major product update.
All P1 items must be checked. P2 items must be checked for full client go-live.

---

## Release: __________________

**Date:**
**Environment:** preprod → prod
**Capabilities being released:**
- [ ] CustomerReach Respond
- [ ] CustomerReach Answer
- [ ] CustomerReach Remind
- [ ] Dashboard update
- [ ] Schema migration
- [ ] Other: ___________

---

## Part 1: Schema & Data (P1)

- [ ] All Supabase migrations applied in order (001–014 minimum)
- [ ] `phone_number_map` has entry for client's Twilio number
- [ ] `clients` row has `owner_phone`, `timezone`, `booking_link` populated (or NULL if callback-only)
- [ ] `client_subscriptions` has the correct capabilities enabled for this client
- [ ] Seed data removed or isolated from production tables
- [ ] RLS policies confirmed: client A cannot query client B's data

---

## Part 2: n8n Workflows (P1)

- [ ] Missed Call Recovery (`W9lssqC5Jvd3nIVo`) — **ACTIVE**
- [ ] SMS Reply Handler (`q4CYSzFYuYfp1eWa`) — **ACTIVE**
- [ ] Reminder Scheduler (`wN3cyY7o0kJhk9DS`) — **ACTIVE** (if Remind capability enabled)
- [ ] Reminder Reply Handler (`inmiGyHTCEP3a2hd`) — **ACTIVE** (if Remind capability enabled)
- [ ] No `<PLACEHOLDER>` tokens remaining in any workflow node
- [ ] Supabase URL and service key confirmed real (not dev credentials in prod)
- [ ] Workflows last validated with `n8n_validate_workflow` — no errors

---

## Part 3: Twilio Configuration (P1)

- [ ] Client's Twilio number StatusCallback URL set to `https://bizelevate1.app.n8n.cloud/webhook/missed-call`
- [ ] StatusCallback method: HTTP POST
- [ ] StatusCallback events include: `no-answer`, `busy`, `failed` (or all status events)
- [ ] Inbound SMS webhook set correctly:
  - If Respond only: `https://bizelevate1.app.n8n.cloud/webhook/sms-reply`
  - If Remind only: `https://bizelevate1.app.n8n.cloud/webhook/reminder-sms-reply`
  - If both: **Requires SMS router workflow** (not yet built — flag as blocker)
- [ ] Twilio number in E.164 format (`+61XXXXXXXXXX`) — matches exactly what Supabase has

---

## Part 4: Critical Path Tests (P1)

Run Mode 2 (Pre-Go-Live) from [RUNBOOK.md](RUNBOOK.md). All 9 tests must pass.

- [ ] CP-01: Missed call → SMS fires within 10 seconds
- [ ] CP-02: Reply CALL ME → callback_requested=true
- [ ] CP-03: Answered call → no SMS (filter works)
- [ ] CP-04: Appointment intake → confirmation SMS sent
- [ ] CP-05: Invalid VAPI secret → request rejected
- [ ] CP-06: Reminder scheduler → SMS fires at correct time
- [ ] CP-07: CANCEL reply → appointment cancelled + owner alerted
- [ ] CP-08: Booking link click → booking_link_clicked=true
- [ ] CP-09: Multi-client isolation — correct names in each SMS

---

## Part 5: Dashboard (P2)

- [ ] Dashboard accessible at correct URL for this client
- [ ] Call logs visible with recent test data
- [ ] Action status updates save correctly
- [ ] Appointments page visible (if Growth tier)
- [ ] No other clients' data visible

---

## Part 6: SMS Quality Check (P1)

Send the demo missed call and review the SMS:

- [ ] Clinic name is correct (not "Riverside Dental" if this is a different client)
- [ ] Booking link is correct URL (not another client's link)
- [ ] No raw Supabase URLs visible to the patient (use `book.bizelevate.app` or confirm acceptable)
- [ ] SMS character count — fits in one message (≤160 chars for single SMS)
- [ ] Sender number is the correct Twilio number for this client

---

## Part 7: Security & Secrets (P1)

- [ ] VAPI webhook secret set and validated (`x-vapi-secret` header check works)
- [ ] Supabase service role key not exposed in any committed file
- [ ] `.env`, `.mcp.local.json`, `secrets.local.json` are all in `.gitignore`
- [ ] No real phone numbers in committed test payloads

---

## Part 8: Known Issues Sign-off (P2)

Review [BUG-REPORT.md](BUG-REPORT.md) — Known Active Bugs section.

For each open bug, confirm either:
- Fixed and verified, OR
- Accepted as known risk for this release (with owner noted)

| Bug | Fixed / Accepted | Notes |
|-----|-----------------|-------|
| BUG-001 — Twilio StatusCallback not configured | | |
| BUG-002 — Twilio inbound SMS webhook not set | | |
| BUG-003 — Raw Supabase URL in SMS | | |
| BUG-004 — No business hours detection | | |
| BUG-005 — SMS webhook routing conflict | | |

---

## Release Decision

- [ ] All P1 checks passed
- [ ] P2 checks passed OR risks accepted and documented
- [ ] No new P1 bugs found during testing

**Decision:** GO / NO-GO

**Signed off by:**
**Date:**

# BizElevate Testing Strategy

**Version:** 1.1
**Date:** 2026-03-21
**Scope:** CustomerReach Respond, Answer, Remind + Supabase backend + Dashboard

---

## Guiding Principles

1. **Revenue-risk first** — test what breaks a demo or loses a patient record
2. **Manual-first, automate later** — the stack is webhook + SMS + Supabase; unit tests have limited ROI at this stage
3. **Real calls beat mocks** — use actual cURL/Postman requests against live webhooks, not mock frameworks
4. **Fail fast on integration seams** — most bugs live at Twilio↔n8n↔Supabase boundaries
5. **Demo-gate everything** — nothing goes to a prospect without passing the 5-minute demo test

---

## What We're Testing

| Layer | Component | Priority |
|-------|-----------|----------|
| Webhook intake | Missed Call Recovery (Twilio → n8n) | **P1** |
| Webhook intake | Appointment Concierge (VAPI → n8n) | **P1** |
| Scheduled trigger | Reminder Scheduler (n8n → Twilio) | **P1** |
| SMS delivery | Twilio send + reply capture | **P1** |
| Data persistence | Supabase call_logs, appointments, reminders | **P1** |
| Multi-client routing | phone_number_map lookup | **P2** |
| Dashboard | Supabase Edge Functions + UI actions | **P2** |
| Lead capture | chat-concierge Edge Function | **P3** |
| Research ingestor | Next.js app API routes | **P3** |

---

## Test Levels

### Level 1 — Webhook Smoke Tests (5 min per capability)
Manually fire a curl/Postman request at each live webhook. Confirm n8n execution passes, SMS arrives, Supabase row is written.

**When to run:** Before every demo, after any workflow change.

### Level 2 — Critical Path Tests (30 min)
Full end-to-end flows including reply handling, status transitions, and error paths. Covers the full user journey a clinic would experience.

**When to run:** Before client go-live, after schema migrations, after any multi-workflow change.

### Level 3 — Regression Sweep (60 min)
All test cases in TEST-INVENTORY.md. Manual execution of every capability including edge cases (invalid phone, missing data, wrong CallStatus).

**When to run:** Major releases, before onboarding a new client, weekly during active development.

---

## Testing Approach by Capability

### CustomerReach Respond (Missed Call Recovery)
- **Method:** cURL to `/webhook/missed-call` with Twilio form-encoded payload
- **Verify:** SMS received, call_logs row written with correct client_id, booking link tracking works
- **Key edge cases:** Invalid AU phone, `busy` vs `no-answer` status, unknown Twilio `To` number

### CustomerReach Answer (Appointment Concierge)
- **Method:** cURL/Postman to `/webhook/vapi-appointment` with JSON payload (see `appointment-concierge/docs/TEST-PAYLOADS.md`)
- **Verify:** Urgency classified correctly, call_logs row written, SMS confirmation sent
- **Key edge cases:** Null patientName, null patientPhone, emergency urgency path

### CustomerReach Remind (Appointment Reminders)
- **Method:** Create test appointment 3 minutes in future via dashboard, wait for scheduler
- **Verify:** `appointment_reminders` rows created, SMS fires within 15 min, reply CANCEL/CONFIRM processed
- **Key edge cases:** Appointment < 2h away (skip both), appointment < 48h away (only 2h reminder), failed Twilio send

### Supabase / Data Layer
- **Method:** Direct SQL queries via Supabase dashboard or MCP
- **Verify:** RLS policies enforce client isolation, service role writes succeed, migrations applied in order

### Dashboard (bizelevate-dashboard)
- **Method:** Manual UI walkthrough
- **Verify:** Call logs display, action status updates, appointment CRUD, reminder badge states

---

## What We Are NOT Testing (Yet)

- Automated unit tests for n8n Code nodes (low ROI, workflow JSON is source of truth)
- Load/performance testing (single-clinic scale, not a concern at Phase 1)
- VAPI voice quality testing (external vendor responsibility)
- Research ingestor app (internal tool, not client-facing)
- `book.bizelevate.app` custom domain (not yet configured — use raw Supabase URL)

---

## Test Environments

| Environment | Supabase | n8n Workflows | Twilio | Use For |
|-------------|----------|---------------|--------|---------|
| **Prod** | prod project | live workflows | live numbers | Client verification only — never run destructive tests here |
| **Dev** | *not yet created* | *not yet created* | test number | To be created when first client signs |
| **Preprod** | *not yet created* | *not yet created* | test number | To be created when first client signs |

**Current state:** Only production exists. All Level 1–2 testing uses the demo Twilio number (`+61485004338`) against live production workflows. Dev and preprod environments will be provisioned at first client sign-up to avoid the risk of testing against a client's live data.

**Rule:** Never run destructive tests against production data. Use the demo Twilio number for all Level 1–2 testing. Never use a client's actual number for testing.

---

## Known Gaps

These gaps represent the current distance between demo-ready and client-ready. They overlap with the "What Is NOT Ready Yet" section in the [Operating Truth](https://www.notion.so/3272b7aaf2e381288dc1fcbafcf1cee0) — that document is the single source of sprint status.

| Gap | Risk | When to Fix |
|-----|------|-------------|
| No automated test suite | Medium — manual effort required | Phase 2 |
| No business hours detection | High — SMS fires at 3am | Before first client |
| book.bizelevate.app not configured | Medium — booking link looks like spam | Before first client |
| Twilio webhook not set on demo number | **Critical** — Respond won't fire | Immediately |
| Twilio reminder-sms-reply webhook not set | **Critical** — CANCEL/CONFIRM won't work | Before Growth tier demo |
| SMS reply conflict (sms-reply vs reminder-sms-reply) | Medium — same Twilio number can only have one inbound webhook | Before Growth tier demo |
| Dev + preprod environments don't exist | Medium — all testing against prod | At first client sign |

---

## Sign-off Owners

| Level | Sign-off Required From |
|-------|----------------------|
| Level 1 smoke test | Claude Code (automated via cURL) |
| Level 2 critical path | Shiju (manual check — SMS received, data correct) |
| Level 3 regression + release | Shiju + review of RELEASE-READINESS.md |

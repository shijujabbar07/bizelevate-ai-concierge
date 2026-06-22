# Bug Report Template

Copy this template for each bug found. Save to `testing/bugs/BUG-NNN.md`.

---

## Bug Report: BUG-[NNN]

**Date:** YYYY-MM-DD
**Reported by:**
**Environment:** dev / preprod / prod
**Severity:** P1 (blocks demo/go-live) / P2 (degraded behaviour) / P3 (cosmetic/minor)

---

## Summary

One-line description of what is broken.

---

## Capability / Component

- [ ] CustomerReach Respond (Missed Call Recovery)
- [ ] CustomerReach Answer (Appointment Concierge)
- [ ] CustomerReach Remind (Appointment Reminders)
- [ ] Dashboard
- [ ] Supabase / data layer
- [ ] Integration (multi-capability)
- [ ] Other: ___________

---

## Steps to Reproduce

1.
2.
3.

---

## Expected Behaviour

What should happen.

---

## Actual Behaviour

What actually happened.

---

## Evidence

Paste relevant items:
- n8n execution ID:
- n8n error message:
- Supabase row ID / SQL query result:
- Screenshot or SMS content:
- cURL command used:

---

## Root Cause (if known)

Which node / function / table / field is the source.

---

## Fix Applied

What was changed to fix it. Leave blank until resolved.

---

## Test Confirming Fix

Which test case (from TEST-INVENTORY.md or CRITICAL-PATH-TESTS.md) confirms the fix works.

---

## Status

- [ ] Open
- [ ] In progress
- [ ] Fixed — awaiting verification
- [ ] Closed

---

---

# Bug Severity Guide

| Severity | Definition | Response |
|----------|-----------|----------|
| **P1** | Blocks demo or client go-live. Core flow (SMS not firing, data not written, crash). | Fix before any demo or client work. |
| **P2** | Degraded behaviour. Feature works but with incorrect data, slow, or partial failure. | Fix before client go-live. |
| **P3** | Cosmetic, edge case, or low-frequency issue. No impact on demo or client operations. | Fix in next sprint. |

---

# Known Active Bugs (as of 2026-06-22)

| ID | Severity | Summary | Status |
|----|----------|---------|--------|
| BUG-001 | P1 | Twilio StatusCallback not configured on demo number → Respond never fires | Open |
| BUG-002 | P1 | Twilio inbound SMS webhook not set → CONFIRM/CANCEL not captured | Open |
| BUG-003 | P2 | Booking link uses raw Supabase URL (looks like spam) — `book.bizelevate.app` not configured | Open |
| BUG-004 | P2 | No business hours detection — Respond SMS fires at 3am | Open |
| BUG-005 | P2 | Same Twilio number can only set one inbound SMS webhook (sms-reply vs reminder-sms-reply conflict when both capabilities active) | Open |
| BUG-006 | P1 | Casey (VAPI) re-asks for name and reason already given earlier in the same call, plus a hallucinated non-sequitur line ("welcome to the show"). Live VAPI "First Message" field still asks "Can I get your name please?" (leaked from the abandoned v3.1 draft) while the deployed system prompt is v2.8, which expects its own combined "How can I help you today?" opener — the mismatch confuses the model's turn-tracking. | Open |
| BUG-007 | P2 | Casey promises "We'll send you a booking link by text shortly" but the patient SMS that actually sends is the generic callback message with no link. Root cause: `clients.online_booking_enabled = false` for `riverside-dental` even though `booking_link` is a live Calendly URL — `Route by Intent` requires both fields, so it always falls back to `Send Patient SMS`. | Open |
| BUG-008 | P1 | Reception/owner alert SMS delivery is unverifiable. `Send Reception Alert` (n8n) has `onError: continueRegularOutput`, so a failed Twilio call is silently swallowed. `call_logs.owner_notified` is hardcoded `false` on insert (`Write Floor Record`) and never updated to `true` after the alert actually sends — there is no way to confirm from logs/dashboard whether a clinic ever received its alert. | Open |

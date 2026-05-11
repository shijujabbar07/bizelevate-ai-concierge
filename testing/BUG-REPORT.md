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

# Known Active Bugs (as of 2026-03-21)

| ID | Severity | Summary | Status |
|----|----------|---------|--------|
| BUG-001 | P1 | Twilio StatusCallback not configured on demo number → Respond never fires | Open |
| BUG-002 | P1 | Twilio inbound SMS webhook not set → CONFIRM/CANCEL not captured | Open |
| BUG-003 | P2 | Booking link uses raw Supabase URL (looks like spam) — `book.bizelevate.app` not configured | Open |
| BUG-004 | P2 | No business hours detection — Respond SMS fires at 3am | Open |
| BUG-005 | P2 | Same Twilio number can only set one inbound SMS webhook (sms-reply vs reminder-sms-reply conflict when both capabilities active) | Open |

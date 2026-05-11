# BizElevate — Operating Truth

**Updated: 2026-03-21** — Read this daily. One page. Everything else is reference.

---

## What BizElevate Is

AI automation for dental clinics and small service businesses. We recover missed calls, answer after-hours calls, and reduce no-shows — automatically, with zero staff effort.

---

## How the System Fits Together

```
Patient calls clinic number
  │
  ├── During hours, staff answers → normal call
  ├── During hours, no answer → CustomerReach Respond → SMS in <10 seconds
  ├── After hours → CustomerReach Answer (VAPI/Casey) → intake → SMS confirmation
  └── Appointment booked → CustomerReach Remind → 48h + 2h SMS reminders
```

All three write to the same Supabase database. Everything visible in the dashboard.

---

## What Is Live Today

| Capability | Status | Notes |
|------------|--------|-------|
| CustomerReach Respond | **LIVE** | Riverside Dental. Missed call → SMS in <10 seconds. |
| CustomerReach Answer | **LIVE — end-to-end test pending** | Riverside Dental. VAPI/Casey active. ⚠️ Voice test on +61 485 004 338 not yet confirmed. |
| CustomerReach Remind | **LIVE — Twilio webhook pending** | Schema + n8n workflows deployed and active. Pending: Twilio webhook config + end-to-end test. |
| Management Dashboard | **LIVE** | `dashboard.bizelevate.app`. Multi-client. RLS enforced. |
| Multi-client routing | **LIVE** | `phone_number_map` drives all workflows. Migrations 001–014 on prod. |

---

## What Is NOT Ready Yet

- VAPI voice test on +61 485 004 338 — needs end-to-end confirmation
- Business hours detection in both Respond + Answer workflows
- Owner notification SMS (Respond + Answer)
- After-hours SMS variant for Respond
- Two-way SMS: BOOK / HOURS reply handling
- Dashboard: callback queue view
- Dashboard: conversion funnel widget
- Daily missed call summary email/SMS
- Dev + preprod Supabase environments (create when first client signs)
- Twilio webhook not set on demo number (Respond won't fire without this)
- Twilio `reminder-sms-reply` webhook not configured per client (Remind CONFIRM/CANCEL won't work)
- `book.bizelevate.app` custom domain not configured (booking link looks like spam)
- **First paying client — not yet signed**

> Tasks tracked in **Todoist → BizElevate — Sprint Phase 1** and **BizElevate — Launch Prerequisites**.

---

## Current Sprint

**5-day pre-first-client sprint.** Complete all tasks before booking first prospect call.

| Day | Focus |
|-----|-------|
| Day 1 | VAPI prompt: 3 callback slots, FAQ (9 questions), after-hours tone, emergency language |
| Day 2A | Business Hours Check node — build once, add to both Respond + Answer workflows |
| Day 2B–E | After-hours SMS variant, callback SMS with slot, emergency owner SMS, owner notification |
| Day 3 | Two-way SMS: BOOK → callback task, HOURS → clinic hours SMS |
| Day 4 | Dashboard: callback queue + conversion funnel + daily summary workflow |
| Day 5 | Full end-to-end test matrix — all 11 scenarios. Demo script run-through. |

**Done when:** All Day 5 test matrix scenarios pass + first client conversation booked.

> Sprint tasks and progress tracked in **Todoist → BizElevate — Sprint Phase 1**.

---

## Next Milestone

**Demo-ready → book first client call.**

Once Day 5 test matrix passes: book the first prospect conversation. Lead with the 60-second Respond demo. Show the dashboard. Close on Core ($499/mo) or Starter ($199/mo).

---

## How to Demo (Quick Reference)

**60-second Respond demo:** Call the demo number, let it ring out, hang up. Watch SMS arrive in 10 seconds. Open dashboard — callback task visible. Full script: [CustomerReach Respond Playbook](https://www.notion.so/31f2b7aaf2e3810bbfa1c6b9693c42ee)

**90-second Answer demo:** Call +61 485 004 338. Casey answers. Give name, reason, preferred callback. End call. Show SMS + dashboard entry. Full script: [CustomerReach Answer Playbook](https://www.notion.so/31f2b7aaf2e38143-9fec-cffad5f36a1c)

---

## Pricing (single source of truth)

| Tier | Capabilities | Price |
|------|-------------|-------|
| **Starter** | CustomerReach Respond only | $199/mo |
| **Core** | Respond + Answer + Dashboard | $499/mo |
| **Growth** | Core + Remind + Review | $799/mo |
| **Practice** | Growth + Recall + Multi-location | $1,299/mo |

Setup fee: $500–$750 one-time. 30-day guarantee.

---

## Next Actions

> Current priorities are tracked in **Todoist → BizElevate — Sprint Phase 1** (Day 1 tasks) and **BizElevate — GTM Actions** (This Week section).

---

## Capability Playbooks

| Need | Document |
|------|---------|
| Respond — how it works, onboarding, technical detail | [CustomerReach Respond Playbook](https://www.notion.so/31f2b7aaf2e3810bbfa1c6b9693c42ee) |
| Answer — how it works, VAPI config, onboarding | [CustomerReach Answer Playbook](https://www.notion.so/31f2b7aaf2e381439feccffad5f36a1c) |
| Remind — appointment reminders, schema, onboarding | [CustomerReach Remind Playbook](https://www.notion.so/3252b7aaf2e381598929dffe4ead276f) |
| Testing approach, known gaps, sign-off owners | [Testing Strategy](https://www.notion.so/3292b7aaf2e381c396-43fffe692b024e) |

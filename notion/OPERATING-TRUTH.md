# BizElevate — Operating Truth

**Updated: 2026-05-18** — Read this daily. One page. Everything else is reference.

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

**Riverside Dental is the demo environment.** Casey and all three capabilities are deployed and operational for demo purposes. There is no paying client yet.

| Capability | Status | Notes |
|------------|--------|-------|
| CustomerReach Respond | **LIVE (demo)** | Riverside Dental demo number. Missed call → SMS in <10 seconds. |
| CustomerReach Answer | **LIVE (demo)** | VAPI/Casey active on +61 485 004 338. |
| CustomerReach Remind | **LIVE (demo)** | Schema + n8n workflows deployed. Twilio reminder webhook pending per-client config. |
| Management Dashboard | **LIVE** | `dashboard.bizelevate.app`. Multi-client. RLS enforced. |
| Multi-client routing | **LIVE** | `phone_number_map` drives all workflows. Migrations 001–014 on prod. |

---

## What Is NOT Ready Yet

- Business hours detection in both Respond + Answer workflows
- Owner notification SMS (Respond + Answer)
- After-hours SMS variant for Respond
- Two-way SMS: BOOK / HOURS reply handling
- Dashboard: callback queue view
- Dashboard: conversion funnel widget
- Daily missed call summary email/SMS
- Dev + preprod Supabase environments (create when first client signs)
- Twilio `reminder-sms-reply` webhook not configured per client (Remind CONFIRM/CANCEL won't work)
- **First paying client — not yet signed**

> Tasks tracked in **Todoist → BizElevate — Sprint Phase 1** and **BizElevate — Launch Prerequisites**.

---

## Current Focus

**Demo → First paying client.**

- Riverside Dental is the demo environment — use it to run the pitch
- Demo to family/friend contact is the current gate-check
- After demo lands: book first real prospect call
- Build ROI calculator + objection scripts before that call

---

## Next Milestone

**First paying client.** Run the demo to sharpen the pitch, then book the first real prospect call. Price at Core ($499/mo) + $1,500 setup minimum. Case study comes after first client is live 30 days.

---

## How to Demo (Quick Reference)

**60-second Respond demo:** Call the demo number, let it ring out, hang up. Watch SMS arrive in 10 seconds. Open dashboard — call log visible.

**90-second Answer demo:** Call +61 485 004 338. Casey answers. Give name, reason, preferred callback. End call. Show SMS + dashboard entry.

---

## Pricing (single source of truth)

| Tier | Capabilities | Monthly | Setup Fee |
|------|-------------|---------|-----------|
| **Starter** | Respond only | $199/mo | $1,500 (pilot) |
| **Core** | Respond + Answer + Dashboard | $499/mo | $1,500–$2,500 |
| **Growth** | Core + Remind + Review | $799/mo | $2,500 |
| **Practice** | Growth + Recall + Multi-location | $1,299/mo | $2,500–$5,000 |

30-day guarantee. Pilot client: setup fee negotiable, floor $1,500. Standard from client 2 onward: $2,500.

---

## Next Actions

> Current priorities tracked in **Todoist → BizElevate — Sprint Phase 1** (🔥 Focus Right Now) and **BizElevate — GTM Actions**.

---

## Capability Playbooks

| Need | Document |
|------|---------|
| Respond — how it works, onboarding, technical detail | [CustomerReach Respond Playbook](https://www.notion.so/31f2b7aaf2e3810bbfa1c6b9693c42ee) |
| Answer — how it works, VAPI config, onboarding | [CustomerReach Answer Playbook](https://www.notion.so/31f2b7aaf2e381439feccffad5f36a1c) |
| Remind — appointment reminders, schema, onboarding | [CustomerReach Remind Playbook](https://www.notion.so/3252b7aaf2e381598929dffe4ead276f) |
| Testing approach, known gaps, sign-off owners | [Testing Strategy](https://www.notion.so/3292b7aaf2e381c39643fffe692b024e) |
| GTM gaps, pricing strategy, objection scripts | [GTM Strategy & Actions](https://www.notion.so/3602b7aaf2e38182a642f3cce1d6d7aa) |
| One-page prospect overview | [BizElevate One Pager](https://www.notion.so/3602b7aaf2e3816ebeaadfd1381f91c6) |

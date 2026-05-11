# BizElevate — Quick Finder

**Updated: 2026-03-18** — **Start with [OPERATING-TRUTH.md](./OPERATING-TRUTH.md)** for current status + next actions. This file is the reference index — workflow IDs, ops check, links.

---

## Where We Are Right Now

### Live & Running
- **CustomerReach Respond** — active on Riverside Dental. Missed call → SMS in <10 seconds.
- **CustomerReach Answer** — active on Riverside Dental. VAPI handles inbound calls 24/7.
- **Management Dashboard** — live at `dashboard.bizelevate.app`. Multi-client, RLS enforced.
- **Production Supabase** (`gdzpgimyjgfzhnwyojmz`) — migrations 001–012 applied.
- Multi-client routing via `phone_number_map` — live.
- Google OAuth, RLS, Vercel, custom domain — complete.

### Outstanding — Not Done Yet
- VAPI voice test on +61 485 004 338 — needs end-to-end confirmation
- Business hours detection in n8n workflows — Day 2 sprint task (build once, use in both)
- Owner notification SMS (Respond + Answer) — Day 2 sprint task
- After-hours SMS variant for Respond — Day 2 sprint task
- Two-way SMS: BOOK / HOURS reply handling — Day 3 sprint task
- Callback Queue view in Management Dashboard — Day 4 sprint task
- Conversion funnel widget in dashboard — Day 4 sprint task
- Daily missed call summary email/SMS — Day 4 sprint task
- Dev and preprod Supabase environments — create when first client signs
- First paying client — not yet signed

### Focus Right Now
1. Complete pre-demo sprint (Days 1–5) before first client call — see [05 — Sprint Now](https://www.notion.so/3212b7aaf2e381f885b5f1945c67c1a2)
2. Confirm VAPI voice test end-to-end on the demo number
3. Day 2A (Business Hours Check node) is the most reusable piece — do it first
4. Book the first client conversation once Day 5 test matrix all passes

---

## Open This When...

| Situation | Document |
|-----------|----------|
| Where are we? What's the next step? | [01 — Launch Plan & Status](https://www.notion.so/3212b7aaf2e381cdb726f317ec0c0c1b) |
| What to build this week before the first demo | [05 — Sprint Now (Pre-Demo Week)](https://www.notion.so/3212b7aaf2e381f885b5f1945c67c1a2) |
| Sell or demo CustomerReach Respond (missed call SMS) | [CustomerReach Respond — Capability Playbook](https://www.notion.so/31f2b7aaf2e3810bbfa1c6b9693c42ee) |
| Sell or demo CustomerReach Answer (AI voice concierge) | [CustomerReach Answer — Capability Playbook](https://www.notion.so/31f2b7aaf2e381439feccffad5f36a1c) |
| Sell or demo CustomerReach Remind (appointment reminders) | [CustomerReach Remind — Capability Playbook](https://www.notion.so/3252b7aaf2e381598929dffe4ead276f) |
| Client asks about pricing or what each tier includes | [01 — Launch Plan & Status](https://www.notion.so/3212b7aaf2e381cdb726f317ec0c0c1b) |
| Client asks about phone number setup | [04 — Phone Number Onboarding](https://www.notion.so/3212b7aaf2e381089e15de2ef4033b2e) |
| First client just signed — set up their environment | [06 — First Client Onboarding](https://www.notion.so/3212b7aaf2e381bf92b9c0c4902f4cdc) |
| Pushing any change to production | [07 — Deploy Gates](https://www.notion.so/3212b7aaf2e381d1b690f82bfb07d15c) |
| Changing the database schema | [07 — Deploy Gates](https://www.notion.so/3212b7aaf2e381d1b690f82bfb07d15c) |
| Building or modifying an n8n workflow | [07 — Deploy Gates](https://www.notion.so/3212b7aaf2e381d1b690f82bfb07d15c) |
| Understanding the 3-environment strategy (dev / preprod / prod) | [08 — Environments Strategy](https://www.notion.so/3212b7aaf2e381dfbe3be1d3d5530258) |
| Checking if a sprint task is done or what's next | [05 — Sprint Now (Pre-Demo Week)](https://www.notion.so/3212b7aaf2e381f885b5f1945c67c1a2) |
| A client wants to upgrade to reminder or review features | [CustomerReach Remind — Capability Playbook](https://www.notion.so/3252b7aaf2e381598929dffe4ead276f) |
| GTM strategy gaps, pricing actions, sales prep, content plan | [GTM Strategy Actions](./gtm-strategy-actions.md) |

---

## Weekly Operations Check (Monday morning — 5 minutes)

- [ ] n8n → Executions: any red (failed) executions in the last 7 days?
- [ ] Slack `#bizelevate-ops`: any unresolved error alerts?
- [ ] Supabase → `call_logs`: any unexpected gap in data for active clients?
- [ ] n8n → Workflows: all production workflows still toggled Active?

If anything is red: open n8n → click the failed execution → inspect the error → Retry.

---

## Active Workflows (quick reference)

| Workflow | n8n ID | Webhook |
|----------|--------|---------|
| CustomerReach Answer | `HKHwb6mpWdvGcR070E8or` | `/webhook/vapi-appointment` |
| CustomerReach Respond | `W9lssqC5Jvd3nIVo` | `/webhook/missed-call` |
| SMS Reply Handler | `q4CYSzFYuYfp1eWa` | `/webhook/sms-reply` |
| Error Handler | `jH1zMn2CbFpDX3PY` | — |

---

## Dashboard

- **Live URL:** `https://dashboard.bizelevate.app`
- **Test account (riverside-dental):** `shijugamma@gmail.com`
- **Test account (clyde-north-dental):** `shijubeta@gmail.com`

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        INBOUND CHANNELS                             │
│                                                                     │
│   Phone call ──► VAPI (AI voice)          Missed call ──► Twilio   │
│                       │                                    │        │
│                 end-of-call webhook              missed-call webhook │
└───────────────────────┼────────────────────────────────────┼────────┘
                        │                                    │
                        ▼                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         n8n (Orchestration)                         │
│                                                                     │
│   CustomerReach Answer          CustomerReach Respond               │
│   HKHwb6mpWdvGcR070E8or         W9lssqC5Jvd3nIVo                   │
│                                                                     │
└───────────┬─────────────────────────────────┬───────────────────────┘
            │                                 │
            ▼                                 ▼
┌───────────────────────┐         ┌───────────────────────────────┐
│   Supabase (Database) │         │   Twilio (SMS delivery)       │
│   gdzpgimyjgfzhnwyojmz│         │   Outbound SMS to callers     │
└───────────┬───────────┘         └───────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────────┐
│              Management Dashboard (dashboard.bizelevate.app)      │
│              Vite + React + shadcn/ui — hosted on Vercel          │
└───────────────────────────────────────────────────────────────────┘
```

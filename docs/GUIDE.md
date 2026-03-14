# BizElevate — Quick Finder

Open this first. One table. Go straight to what you need.

---

## Open This When...

| Situation | File |
|-----------|------|
| Where are we? What's the next step? | [LAUNCH.md](../LAUNCH.md) |
| Sell or demo CustomerReach Respond (missed call SMS) | [missed-call/PLAYBOOK.md](../missed-call/PLAYBOOK.md) |
| Sell or demo CustomerReach Answer (AI voice) | [appointment-concierge/PLAYBOOK.md](../appointment-concierge/PLAYBOOK.md) |
| Client asks about phone number setup | [docs/PHONE-ONBOARDING.md](PHONE-ONBOARDING.md) |
| What to build this week before the first demo | [checklists/SPRINT-NOW.md](../checklists/SPRINT-NOW.md) |
| First client just signed — set up their environment | [checklists/CLIENT-ONBOARDING.md](../checklists/CLIENT-ONBOARDING.md) |
| Pushing any change to production | [checklists/DEPLOY-GATES.md](../checklists/DEPLOY-GATES.md) |
| Changing the database schema | [checklists/DEPLOY-GATES.md](../checklists/DEPLOY-GATES.md) |
| Understanding the 3-environment strategy | [supabase/ENVIRONMENTS.md](../supabase/ENVIRONMENTS.md) |

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
- **Test account (smile-dental):** `shijugamma@gmail.com`
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
│   ┌─────────────────────┐       ┌──────────────────────────┐        │
│   │ 1. Parse transcript │       │ 1. Lookup client config  │        │
│   │ 2. Classify intent  │       │    (phone_number_map)    │        │
│   │ 3. Extract patient  │       │ 2. Build SMS + book link │        │
│   │    data             │       │ 3. Log to Supabase       │        │
│   │ 4. Log to Supabase  │       │ 4. Send SMS via Twilio   │        │
│   │ 5. Send SMS         │       └──────────────────────────┘        │
│   └─────────────────────┘              │                            │
│                                  SMS Reply Handler                  │
│                                  q4CYSzFYuYfp1eWa                  │
│                                  (CALL/CALL ME → callback flag)     │
│                                                                     │
│   All workflows ──► Error Handler (jH1zMn2CbFpDX3PY) ──► Slack     │
└───────────┬─────────────────────────────────┬───────────────────────┘
            │                                 │
            ▼                                 ▼
┌───────────────────────┐         ┌───────────────────────────────┐
│   Supabase (Database) │         │   Twilio (SMS delivery)       │
│   gdzpgimyjgfzhnwyojmz│         │   Outbound SMS to callers     │
│                       │         │   and clinic staff            │
│   clients             │         └───────────────────────────────┘
│     └─ client_subs    │
│   phone_number_map    │         ┌───────────────────────────────┐
│   call_logs           │         │   Supabase Edge Function      │
│   callback_tasks      │         │   /functions/v1/book/{id}     │
│   chat_leads          │◄────────│   Tracks booking link clicks  │
│                       │         │   Redirects to booking page   │
│   RLS: per-client     │         └───────────────────────────────┘
│   data isolation      │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────────┐
│              Management Dashboard (dashboard.bizelevate.app)      │
│              Vite + React + shadcn/ui — hosted on Vercel          │
│                                                                   │
│   Google OAuth ──► Supabase Auth ──► user_profiles               │
│                                          │                        │
│                              resolves client_id slug              │
│                                          │                        │
│                              call_logs (filtered by client)       │
│                              Stats, call list, SMS history        │
└───────────────────────────────────────────────────────────────────┘
```

### How Client Config Works

```
Phone number rings
       │
       ▼
n8n looks up phone_number_map
  → finds client_id (e.g. 'smile-dental')
  → reads clients + client_subscriptions
  → determines enabled features, SMS templates, booking URL
       │
       ▼
Workflow runs with client-specific context
(no code changes — config only)
```

### Key Integration Points

| From | To | How |
|------|----|-----|
| VAPI | n8n | HTTP webhook (end-of-call-report) |
| Twilio | n8n | HTTP webhook (missed call / SMS reply) |
| n8n | Supabase | HTTP node → REST API (service role key) |
| n8n | Twilio | HTTP node → Twilio Messages API |
| Dashboard | Supabase | Supabase JS client (anon key + RLS) |
| Booking link | Supabase Edge Function | GET request → redirect |
| n8n errors | Slack | Error Handler workflow → Slack API |

---

## What's Already Done (as of 2026-03-12)

- Google OAuth, RLS, Vercel, custom domain — **complete**
- Production Supabase: `gdzpgimyjgfzhnwyojmz` — 6 migrations applied
- Multi-client routing via `phone_number_map` — **live**
- CustomerReach Respond — **active** (missed call SMS + reply handling + booking link tracking)
- CustomerReach Answer — **active** (VAPI + n8n + Supabase logging)
- Management Dashboard — **live** at `dashboard.bizelevate.app`
- Dev and preprod Supabase projects — **not yet created** (run when first client signs)

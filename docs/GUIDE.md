# BizElevate — Master Navigation

Open this first. Find what you need in one lookup.

---

## By Purpose

### Demo and Sales

| What you need | Where |
|--------------|-------|
| Full product playbook — CustomerReach Respond (missed call SMS) | Notion: CustomerReach Respond Playbook |
| Full product playbook — CustomerReach Answer (AI voice concierge) | Notion: CustomerReach Answer Playbook |
| Full product playbook — CustomerReach Remind (appointment reminders) | Notion: CustomerReach Remind Playbook |
| Pricing, tiers, positioning | Notion: Operating Truth |
| One-page pitch doc | Notion: BizElevate One Pager |
| Phone number setup options for clients | [docs/PHONE-ONBOARDING.md](PHONE-ONBOARDING.md) |

### Client Onboarding (CustomerReach Respond)

| What you need | Where |
|--------------|-------|
| Step-by-step onboarding SOP | [onboarding/RESPOND-ONBOARDING.md](../onboarding/RESPOND-ONBOARDING.md) |
| Input template (fill and hand to Claude) | [onboarding/respond-client-input.md](../onboarding/respond-client-input.md) |
| Decommission or reset a client | [onboarding/RESPOND-DECOMMISSION.md](../onboarding/RESPOND-DECOMMISSION.md) |

### Testing and QA

| What you need | Where |
|--------------|-------|
| How to run end-to-end tests | Notion: Testing Runbook |
| Pre-release quality gates | Notion: Testing Release Readiness |
| Report a bug | Notion: Bug Report Template |
| Test payload examples (JSON) | [appointment-concierge/docs/TEST-PAYLOADS.md](../appointment-concierge/docs/TEST-PAYLOADS.md) |

### Application Architecture

| What you need | Where |
|--------------|-------|
| System architecture overview (this file) | docs/GUIDE.md (below) |
| VAPI to n8n payload contract | [appointment-concierge/docs/PAYLOAD-CONTRACT.md](../appointment-concierge/docs/PAYLOAD-CONTRACT.md) |
| n8n workflow setup and credentials | [docs/WORKFLOW-OPS.md](WORKFLOW-OPS.md) |
| Database environments (URLs, keys, migrations) | [supabase/ENVIRONMENTS.md](../supabase/ENVIRONMENTS.md) |
| Casey voice prompts (VAPI) | [appointment-concierge/vapi/prompts/](../appointment-concierge/vapi/prompts/) |

### Deployment and Operations

| What you need | Where |
|--------------|-------|
| Promote a change to production | [checklists/DEPLOY-GATES.md](../checklists/DEPLOY-GATES.md) |
| Weekly ops check | See below |

### Strategy and GTM

| What you need | Where |
|--------------|-------|
| Go-to-market actions | Notion: GTM Strategy and Actions |
| Operating principles and decision rules | Notion: Operating Truth |

---

## Weekly Ops Check (Monday — 5 minutes)

- [ ] n8n: any failed (red) executions in the last 7 days?
- [ ] Supabase `call_logs`: any unexpected gap in data for active clients?
- [ ] n8n: all production workflows still toggled Active?

If anything is red: open n8n, click the failed execution, inspect the error, retry.

---

## Active Workflows

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
INBOUND CHANNELS

  Phone call ──► VAPI (AI voice)        Missed call ──► Twilio
                     │                                    │
               end-of-call webhook            missed-call webhook
                     │                                    │
                     ▼                                    ▼
              ┌─────────────────────────────────────────────┐
              │              n8n (Orchestration)             │
              │                                             │
              │  CustomerReach Answer    CustomerReach Respond│
              │  HKHwb6mpWdvGcR070E8or   W9lssqC5Jvd3nIVo   │
              │                                             │
              │  1. Parse transcript     1. Lookup client    │
              │  2. Classify intent         (phone_number_map│
              │  3. Extract patient      2. Build SMS + link  │
              │  4. Log to Supabase      3. Log to Supabase  │
              │  5. Send SMS             4. Send SMS          │
              │                                             │
              │         SMS Reply Handler (q4CYSzFYuYfp1eWa) │
              │         CALL/CALL ME → callback_requested    │
              └──────────────┬──────────────────────────────┘
                             │
               ┌─────────────┴──────────────┐
               ▼                            ▼
  Supabase (gdzpgimyjgfzhnwyojmz)       Twilio (SMS delivery)
  clients                                Outbound to callers
  phone_number_map                       and clinic staff
  call_logs
  client_subscriptions
  user_profiles (RLS: per-client)

               │
               ▼
  dashboard.bizelevate.app (Vite/React/Vercel)
  Google OAuth → Supabase Auth → user_profiles → client_id
  Shows: call_logs filtered per client
```

### How Multi-Client Routing Works

```
Phone number rings
       │
       ▼
n8n looks up phone_number_map using Twilio "To" field
  → finds client_id (e.g. 'riverside-dental')
  → reads clients table: name, owner_phone, booking_link, hours
  → determines enabled capabilities from client_subscriptions
       │
       ▼
Workflow runs with client-specific context
No code changes per client — config only
```

### Key Integration Points

| From | To | How |
|------|----|-----|
| VAPI | n8n | HTTP webhook (end-of-call-report) |
| Twilio | n8n | HTTP webhook (missed call / SMS reply) |
| n8n | Supabase | HTTP node → REST API (service role key) |
| n8n | Twilio | HTTP node → Twilio Messages API |
| Dashboard | Supabase | Supabase JS client (anon key + RLS) |
| Booking link | Supabase Edge Function | GET → 302 redirect to booking URL |

---

## Current Status (as of 2026-05-20)

| Item | Status |
|------|--------|
| CustomerReach Respond | Live — Riverside Dental (demo) |
| CustomerReach Answer | Live — Riverside Dental (demo) |
| Management Dashboard | Live at dashboard.bizelevate.app |
| Multi-client routing | Live |
| SMS reply capture | Live |
| Booking link click tracking | Live |
| First paying client | Not yet signed |
| Dev/preprod environments | Not yet created (create on first client sign) |

# BizElevate — Launch Playbook

**Last Updated:** 2026-03-10
**Stage:** Demo-Ready → First Paying Client

---

## What We're Building

BizElevate sells AI automation to small service businesses — clinics, allied health, trades, salons.

**Two core products:**

| Product | What it does | Price signal |
|---------|-------------|--------------|
| **CustomerReach Respond** | Sends an SMS within 10 seconds of a missed call | $199/month |
| **CustomerReach Answer** | Answers calls 24/7, takes appointment requests | $499/month (Core bundle) |
| **Both together** | Full call handling — in-hours and after-hours | $499/month |

Every product writes to the same Supabase database.
The **Management Dashboard** (`dashboard.bizelevate.app`) gives clients a live view of their ROI.

---

## Current Status — One View

| Track | Status | Notes |
|-------|--------|-------|
| CustomerReach Respond | **LIVE — tested** | Ready to demo and sell |
| CustomerReach Answer | **LIVE — voice test pending** | +61 485 004 338 needs VAPI confirmation |
| Management Dashboard | **LIVE** | `dashboard.bizelevate.app` — multi-client, RLS enforced |
| Supabase schema | **LIVE** | Migrations 001–006 applied to prod |
| n8n error handling | **Pending** | Error workflow not yet created — next build task |
| Dev/Preprod environments | **Not created** | Needed before first paying customer lands |
| First paying customer | **Not yet** | Targeting pilot client after voice test confirmed |

---

## The Sequence That Matters

```
CustomerReach Respond (standalone, simplest demo)
  ↓
CustomerReach Answer (adds inbound call handling)
  ↓
Dashboard (proves ROI — the reason clients keep paying)
```

You can sell Respond without Answer.
You can sell Answer without the Dashboard.
But the Dashboard is what makes both products **sticky**.

A client who can log in and see "14 missed calls recovered this month" is not going to cancel.

---

## Phase 1 — Demo Ready

### CustomerReach Respond ✓ COMPLETE
- [x] Workflow live in n8n (`W9lssqC5Jvd3nIVo`)
- [x] Twilio number +61 485 034 338 configured
- [x] StatusCallback → webhook → SMS → Supabase
- [x] End-to-end tested

**Demo script:** Call +61 485 034 338. Let it ring. SMS arrives in 10 seconds.

### CustomerReach Answer — Voice Test Pending
- [x] VAPI assistant configured (Alex)
- [x] n8n workflow live (`HKHwb6mpWdvGcR070E8or`)
- [x] Supabase write working
- [ ] Confirm +61 485 004 338 imported into VAPI Phone Numbers
- [ ] Test call → transcript → SMS confirmed end-to-end

**Demo script:** Call +61 485 004 338. Speak a request. Show the transcript and confirmation SMS.

### Management Dashboard ✓ COMPLETE
- [x] Live at `https://dashboard.bizelevate.app`
- [x] Google OAuth + Magic Link login working
- [x] Multi-client: each user sees only their client's data (RLS enforced)
- [x] Call log, dashboard stats, urgency breakdown all live
- [x] Two test clients active: `smile-dental` (shijugamma) and `clyde-north-dental` (shijubeta)

**Demo script:** Open `dashboard.bizelevate.app`. Log in as the demo client. Show live call volume, urgency breakdown, recent calls.

---

## Phase 2 — Pilot Client

**Goal:** One real client, live, paying, supported.

### Prerequisites
- [ ] Concierge voice test confirmed (see above)
- [ ] n8n error workflow live (Slack alerts on failure)
- [ ] Dev and preprod environments created (see `checklists/first-customer.md`)
- [ ] Client agreement template drafted (1 page)
- [ ] Onboarding checklist ready (number porting or new number, VAPI config, Supabase client row)
- [ ] Invoice/payment set up (Stripe or similar)

### Target profile
Service business with 50–200 inbound calls/month.
Misses at least 20% (10–40 calls/month).
Each missed call worth $100–$500 in potential revenue.

Dental clinics, physio, chiro, beauty, trades.

---

## Phase 3 — Scale

**Goal:** New client onboarded in under 2 hours.

### Already done
- [x] Multi-tenant dashboard (RLS, dynamic client_id from `user_profiles`)
- [x] Client config in Supabase `clients` table (no per-client workflow forks)
- [x] n8n credential centralised (`Supabase Production` — one key to rotate)

### Still needed
- [ ] VAPI assistant clone script (duplicate Alex per client, inject client config)
- [ ] Automated onboarding: provision Supabase rows, create `user_profiles`, send invite
- [ ] Stripe integration for billing
- [ ] Automated alerts if workflow fails (error workflow — building now)

---

## Immediate Next Steps

**1. Confirm Concierge phone number in VAPI**
VAPI Dashboard → Phone Numbers → check if +61 485 004 338 is listed.
If not: import it (Phone Numbers → Add → Import Twilio Number → enter Account SID + Auth Token).

**2. Build n8n error workflow (in progress)**
Slack alert to `#bizelevate-ops` on any workflow failure.
Retry config on Supabase write nodes.
See `docs/WORKFLOW-OPS.md` for the full spec.

**3. Create dev/preprod environments before first paying customer**
Follow `checklists/first-customer.md` — not urgent until pilot client confirmed.

---

## Capability Playbooks (detail)

| Playbook | Path | When to open |
|----------|------|-------------|
| CustomerReach Respond | `missed-call/PLAYBOOK.md` | Configuring or demoing the missed call SMS product |
| CustomerReach Answer | `appointment-concierge/PLAYBOOK.md` | Configuring or demoing the AI answering service |
| Dashboard | `docs/DASHBOARD-PLAYBOOK.md` | Deploying or extending the management app |
| Workflow Ops | `docs/WORKFLOW-OPS.md` | Error handling, deployment pipeline, recovery |

---

## Domain Plan

| Domain | Use | Status |
|--------|-----|--------|
| `dashboard.bizelevate.app` | Client-facing management dashboard | **Live** |
| `bizelevate.app` | Root — redirects or marketing page | Purchased, unpointed |
| (TBD) | Public marketing site | Not needed for pilot |

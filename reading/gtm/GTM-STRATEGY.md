# BizElevate — GTM Strategy Actions

**Created:** 2026-03-21
**Source:** Mike Scully "Master AI Services" framework review + BizElevate alignment analysis
**Purpose:** Captures strategic gaps and ordered action items to close them

---

## Context

Reviewed the "Master AI Services" cheat sheet (@Mike_Scully_, Feb 2026) against BizElevate's current state.
BizElevate is well-aligned on stack and philosophy. The gaps are in pricing, proof, and pipeline.

---

## What's Already Aligned — Don't Change

- Claude + n8n + VAPI is the correct stack
- Dental clinics as the anchor vertical — stay here, do not broaden yet
- Outcome-based pricing (not hourly) — correct positioning
- Management dashboard as the retention mechanism — keep building this
- CustomerReach product naming and capability tiers — works

---

## Gap 1 — Setup Fee Is Underpriced

**Current:** $500–$750 one-time setup
**Market rate (per framework):** $2,500–$15,000

A dental clinic missing 20 calls/month at $150 average appointment value is losing $3,000/month.
Charging $500 to solve a $36K/year problem is undervaluing the product.

### Actions

> Tracked in **Todoist → BizElevate — GTM Actions → This Week**.

- Build a one-page ROI calculator: inputs (calls/month, miss rate, avg appointment value) → monthly/annual revenue at risk + payback period
- Reprice setup fee to **$1,500 minimum** for pilot client — discounted pilot rate positioning
- Update OPERATING-TRUTH.md pricing table once confirmed
- Target standard setup fee of **$2,500** from client 2 onward

---

## Gap 2 — No Paying Client / No Case Study

The entire sales flywheel depends on a case study. Without one, every sales conversation starts cold.

### Actions

> Tracked in **Todoist → BizElevate — GTM Actions** (This Week + After First Client Live sections).

- Finish the 5-day sprint — do not skip steps
- Confirm VAPI voice test on +61 485 004 338 end-to-end (current blocker)
- Book first prospect call immediately after Day 5 test matrix passes
- Lead every demo with the 60-second Respond demo — not the tech, not the dashboard
- Accept a slightly lower first-client price if needed — getting the case study matters more
- After 30 days live: screenshot dashboard metrics
- Write a one-paragraph case study: "[Clinic] recovered [X] missed calls in 30 days. Revenue recovered: $[Y]. Cost: $499/mo."

---

## Gap 3 — Objection Handling Not Documented

No written scripts for the four most common objections. These will come up on every call.

### Actions

> Sales call script tracked in **Todoist → BizElevate — GTM Actions → This Week** (Create checklists/sales-call.md).

Four objections to document before first prospect call:

| Objection | Response |
|-----------|----------|
| "We already use ChatGPT" | "Using a tool and building a system are different. This runs 24/7 without staff touching it — nothing falls through when they're busy or off." |
| "It's too expensive right now" | "What does one missed appointment cost you? You only need to recover one per month for this to pay for itself. At $199, that's one booking." |
| "We need to think about it" | "Totally fair. How many calls did you miss last week? That number keeps running while you think. When's the right time to stop?" |
| "What if it breaks?" | "The retainer covers that. You're not buying software — you're buying a managed service. We monitor and fix it. That's what you're paying for." |


---

## Gap 4 — No Content / Pipeline Strategy

BizElevate has no inbound pipeline. Fine for pilot phase. Becomes a bottleneck at 3+ clients.

### Actions (post-pilot — do not start before first client is live)

> Tracked in **Todoist → BizElevate — GTM Actions → Post-Pilot Content**.

- **Win Post** — "Dental clinic in [city] recovered [X] missed calls this month with a $199/mo service." LinkedIn. That's your entire content strategy for the next quarter.
- **Story Arc post** — the moment you decided to build this
- **Contrast Post** — before: receptionist manually calls back, calls go to voicemail. After: SMS in 10 seconds, dashboard view.
- **Framework Thread** — "How AI answers your missed calls (and why most clinics are losing $3K/month without knowing it)"

Do not start content until you have one live paying client — fabricated proof is worse than no proof.

---

## Gap 5 — No CRM / Prospect Tracking

No system for tracking sales conversations, follow-ups, or pipeline.

### Actions

> Tracked in **Todoist → BizElevate — GTM Actions → After First Client Live**.

- **Now (0–3 clients):** Use a simple Notion table — name, clinic, date contacted, status, next action
- **At 3+ active prospects:** Evaluate GoHighLevel (CRM + client portal + SMS automation)
- Do not build or buy CRM tooling before you have prospects to track

---

## Revised Pricing Reference

| Tier | Capabilities | Monthly | Setup Fee |
|------|-------------|---------|-----------|
| Starter | Respond only | $199/mo | $1,500 |
| Core | Respond + Answer + Dashboard | $499/mo | $1,500–$2,500 |
| Growth | Core + Remind + Review | $799/mo | $2,500 |
| Practice | Growth + Recall + Multi-location | $1,299/mo | $2,500–$5,000 |

*Pilot client: setup fee negotiable. Floor is $1,500. Frame as discounted pilot rate.*

---

## Ordered Action Sequence

> Full task list with priorities in **Todoist → BizElevate — GTM Actions**.

**This Week:** VAPI voice test → complete sprint → ROI calculator → objection scripts → book first prospect call

**After First Call:** Use ROI calculator, price setup at $1,500 minimum, close on Core ($499) or Starter ($199)

**After First Client Live (30 days):** Screenshot metrics → write Win Post → use as opener for every future sales conversation

**At 3 Clients:** Raise setup fee to $2,500 → add CRM → begin content cadence (one post per client result)

---

## Reference

| Document | Path |
|----------|------|
| Current sprint tasks | `notion/05-sprint-now.md` |
| Operating truth (live status) | `notion/OPERATING-TRUTH.md` |
| Launch playbook | `LAUNCH.md` |
| First client checklist | `checklists/first-customer.md` |
| Client onboarding | `notion/06-client-onboarding.md` |

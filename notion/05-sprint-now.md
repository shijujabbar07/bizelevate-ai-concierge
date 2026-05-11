# V1 Gap Fix Sprint — Pre-First-Client Week

**Goal:** Complete all remaining Phase 1 items before onboarding client 1.
**Duration:** 5 days
**Outcome:** Starter and Core tiers fully sellable. Demo-ready, objection-proof.

> **Tasks tracked in Todoist → BizElevate — Sprint Phase 1.**
> This page is reference only — what each day covers and why.

> **Phase context:** This sprint completes **Phase 1** of the BizElevate build roadmap.
> Everything built this week maps to the **Starter ($199/mo)** and **Core ($499/mo)** tiers.
> Phase 2 work (Reminder, Review Request, Router/Registry) begins after client 1 is signed.

---

## Day 1 — Concierge VAPI Prompt Updates

All changes are prompt-only. Zero n8n workflow risk. Test with 3 live calls before moving on.

- **Casey offers 3 callback time slots** — after confirming patient details, offer 9am / 11am / 2pm. Capture chosen slot in end-of-call summary.
- **FAQ capability** — 5–10 common questions covering: location/parking, opening hours, health funds (HBF, Medibank, BUPA, HCF), payment plans, emergency/same-day, what to bring, appointment length, bulk billing, child dental benefit scheme.
- **After-hours tone variant** — calm and reassuring language when clinic is closed.
- **Emergency handling language** — flag urgency and direct patient to call 000 if severe.

---

## Day 2 — n8n Low-Effort Node Additions (Both Workflows)

Add nodes to existing workflows. Test each node in isolation before full run-through.

- **2A — Business Hours Check** — reusable Code node inserted after Webhook in both Respond and Answer workflows. Outputs `business_hours` and `after_hours` fields.
- **2B — Respond After-Hours SMS Variant** — IF node routes to during-hours or after-hours SMS template.
- **2C — Concierge SMS With Specific Callback Time** — SMS template updated to include chosen slot from VAPI summary.
- **2D — Concierge Emergency Owner SMS Alert** — IF urgency = emergency, immediate Twilio SMS to clinic owner.
- **2E — Respond Owner Notification SMS** — parallel SMS to clinic owner on every missed call. Fetches `owner_phone` from `clients` table.

---

## Day 3 — Two-Way SMS + BOOK/HOURS Reply Flow

New webhook endpoint + new Supabase fields. Test reply handling end-to-end before marking done.

- **3A — Supabase Schema** — add `reply_received`, `reply_intent` to `call_logs`; create `callback_tasks` table.
- **3B — sms-reply-handler workflow** — BOOK branch creates callback task + alerts owner. HOURS branch returns clinic hours. Fallback for anything else.
- **3C — Twilio Configuration** — set inbound SMS webhook to `https://bizelevate1.app.n8n.cloud/webhook/sms-reply`.

---

## Day 4 — Recovery Rate Tracking + Dashboard Callback Queue

Database and UI changes. Apply migration first, then update dashboard.

- **4A** — Add `converted` column to `call_logs`.
- **4B** — Callback Queue page in dashboard: pending tasks, priority badge, mark complete / no answer.
- **4C** — Conversion funnel widget: Missed Calls → SMS Sent → Replied → Booked.
- **4D** — Daily missed call summary workflow: Cron 7:30am AEST weekdays → query yesterday → send summary to owner.

---

## Day 5 — End-to-End Testing + Demo Prep

Full scenario run-through. Fix anything broken. Prepare demo script.

11 test scenarios covering: during/after-hours Respond, BOOK/HOURS reply, VAPI routine/after-hours/emergency/FAQ, dashboard queue and funnel, daily summary trigger.

Demo scripts: 60-second Respond demo and 90-second Concierge demo.

---

## What Comes Next (Phase 2)

Once this sprint is complete and client 1 is signed:

| Next Build | Tier Unlocked |
|------------|--------------|
| CustomerReach Remind workflow | Growth ($799/mo) |
| CustomerReach Review workflow | Growth ($799/mo) |
| Shared services sub-workflows + Router | All tiers (infrastructure) |
| Multi-client routing (client 2 onboarding) | Core+ |
| Dashboard: Callback Queue + Funnel widget | Core+ |

---

*Sprint created: 2026-03-10*
*Phase: 1 of 3 — see [CustomerReach Respond Playbook](https://www.notion.so/31f2b7aaf2e3810bbfa1c6b9693c42ee) for full roadmap*

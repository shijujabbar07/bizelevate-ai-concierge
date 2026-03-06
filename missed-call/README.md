# BizElevate Missed Call Recovery

## Overview

Instant SMS text-back when a clinic misses a call. Detects the missed call via Twilio webhook, fires a personalised SMS to the caller within seconds, and logs every event to Supabase.

**Status:** In Development
**Version:** 0.1 (design)
**Last Updated:** March 2026

---

## What This Does

### Caller Experience
1. Caller rings the clinic — no one answers
2. Within seconds, caller receives an SMS: "Hi, we missed your call at Smile Dental. Reply to book an appointment or call us back on [number]."
3. Caller can reply to book → handled by Appointment Concierge (next phase)

### Clinic Experience
1. Every missed call is captured — no lead lost to silence
2. Supabase `call_logs` records: caller number, time, SMS sent, response
3. Optional: daily summary report of missed-call volume

---

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Caller     │────>│   Twilio     │────>│     n8n      │
│  (Missed)    │     │  (Webhook)   │     │  (Workflow)  │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                          ┌───────────────────────┤
                          │                       │
                          ▼                       ▼
                   ┌──────────────┐       ┌──────────────┐
                   │   Twilio     │       │   Supabase   │
                   │  (SMS out)   │       │  (call_logs) │
                   └──────────────┘       └──────────────┘
```

**Trigger:** Twilio StatusCallback with `CallStatus=no-answer` or `CallStatus=busy`
**No VAPI required** — this is outbound SMS only, no voice AI

---

## File Structure

```
missed-call/
├── twilio/
│   └── SETUP.md          # Twilio webhook config guide
├── n8n/
│   ├── workflow.json     # Importable n8n workflow
│   └── SETUP.md          # n8n setup guide
├── docs/
│   ├── IMPLEMENTATION.md # Step-by-step deployment checklist
│   ├── PAYLOAD-CONTRACT.md # Twilio webhook payload contract
│   └── SMS-TEMPLATES.md  # Default and variant SMS copy
└── README.md             # This file
```

---

## Pricing

| Plan | Volume | Price |
|------|--------|-------|
| Starter (v1) | Unlimited | $349/mo flat |
| Growth (v2) | Up to 100 calls/mo | $299/mo |
| Scale (v2) | Up to 300 calls/mo | $499/mo |
| Enterprise (v2) | 300+ calls | Custom |

**Positioning:** "Practice growth" — turns missed calls into booked appointments.
**Guarantee:** 30-day performance-backed deployment.

---

## Tech Stack

| Component | Service | Purpose |
|-----------|---------|---------|
| Trigger | Twilio | Detect missed calls via StatusCallback |
| Workflow | n8n Cloud | Orchestrate webhook → SMS → log |
| SMS | Twilio | Instant text-back to caller |
| Data Store | Supabase | Audit log (`call_logs`, `capability='missed_call'`) |

---

## Key Metrics

| Metric | Target |
|--------|--------|
| SMS delivery time | <10 seconds from missed call |
| SMS delivery rate | >95% |
| Calls captured (vs voicemail) | 100% |
| Demo setup time | <30 minutes |

---

## Target Market

- 1–3 chair dental clinics in Australia
- TAM: 3,000–4,200 practices (50–60% of ~6,500 total)
- Same client base as Appointment Concierge — upsell or bundle

---

## Reusable Components

### Across Clients
- n8n workflow (swap Twilio numbers + client_id)
- SMS template (swap business name)
- Supabase schema (shared `call_logs` table, `capability='missed_call'`)

### Client-Specific Config
- Twilio phone number
- Business name in SMS copy
- Forwarding number (if clinic wants calls forwarded, not just texted back)

---

## Next Steps

1. **Phase 1:** Build n8n workflow + Twilio StatusCallback config
2. **Phase 2:** Add reply handling → route to Appointment Concierge
3. **Phase 3:** Daily missed-call summary report (Slack/email)
4. **Phase 4:** Multi-client routing (client_id from Twilio number → Supabase lookup)

---

## Support

- **Webhook not firing:** Check Twilio StatusCallback URL; confirm n8n workflow is Active
- **SMS not sending:** Check Twilio credentials; verify caller number format
- **Log missing:** Check Supabase HTTP request node; confirm service_role key is valid

---

**Built by BizElevate** | AI Automation for Healthcare

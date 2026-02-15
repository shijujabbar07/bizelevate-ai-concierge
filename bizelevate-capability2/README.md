# BizElevate Capability 2: Appointment Request Concierge

## Overview

An AI-powered voice assistant that handles inbound appointment requests, classifies urgency, logs to Google Sheets, and confirms via SMS.

**Status:** Demo-Ready
**Version:** 1.0
**Last Updated:** February 2024

---

## What This Does

### Patient Experience
1. Patient calls the clinic number
2. AI assistant greets and collects: name, phone, preferred time, reason
3. Assistant confirms details and sets expectation: "Staff will call within 2 hours"
4. Patient receives SMS confirmation immediately after hanging up

### Staff Experience
1. New appointment request appears in Google Sheet
2. Request includes AI-classified urgency (routine/urgent/emergency)
3. Staff calls patient to confirm actual appointment slot
4. Status updated in sheet (new → contacted → confirmed)

---

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Patient    │────>│    VAPI      │────>│     n8n      │
│   (Phone)    │     │  (Voice AI)  │     │  (Workflow)  │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                     ┌────────────────────────────┼────────────────────────────┐
                     │                            │                            │
                     ▼                            ▼                            ▼
              ┌──────────────┐           ┌──────────────┐            ┌──────────────┐
              │   OpenAI     │           │   Google     │            │   Twilio     │
              │  (Classify)  │           │   Sheets     │            │    (SMS)     │
              └──────────────┘           └──────────────┘            └──────────────┘
```

---

## File Structure

```
bizelevate-capability2/
├── vapi/
│   ├── assistant-config.json    # VAPI assistant settings & prompts
│   └── SETUP.md                 # VAPI configuration guide
├── n8n/
│   ├── workflow.json            # Importable n8n workflow
│   └── SETUP.md                 # n8n setup instructions
├── google-sheets/
│   ├── template.csv             # Sheet column headers
│   └── SETUP.md                 # Google Sheets setup guide
├── docs/
│   ├── IMPLEMENTATION.md        # Step-by-step deployment checklist
│   ├── PAYLOAD-CONTRACT.md      # API contracts & data structures
│   └── TEST-PAYLOADS.md         # 5 test scenarios with JSON
└── README.md                    # This file
```

---

## Quick Start

### Prerequisites
- [ ] n8n Cloud account
- [ ] VAPI account with assistant
- [ ] Google account
- [ ] Twilio account with phone number
- [ ] OpenAI API key

### Deployment Steps

1. **Setup Google Sheet** (5 min)
   - Open your sheet
   - Add headers from `google-sheets/template.csv`
   - Rename tab to "Appointments"

2. **Configure n8n Credentials** (10 min)
   - Create Twilio Basic Auth credential
   - Verify OpenAI credential
   - Verify Google Sheets OAuth

3. **Import n8n Workflow** (5 min)
   - Import `n8n/workflow.json`
   - Connect credentials to nodes
   - Activate workflow

4. **Configure VAPI Webhook** (10 min)
   - Keep your existing Alex system prompt (don't replace it)
   - Add webhook URL and secret
   - Enable structured data extraction
   - Save and test

5. **Validate** (10 min)
   - Send test payload
   - Verify Sheet entry
   - Confirm SMS received

**Full guide:** See [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md)

---

## Configuration Values

| Item | Value |
|------|-------|
| n8n Cloud URL | https://bizelevate1.app.n8n.cloud/ |
| Webhook Path | `/webhook/vapi-appointment` |
| Webhook Secret | `<VAPI_WEBHOOK_SECRET>` |
| Google Sheet ID | `1hUBJx6sq3Yx60JKcBQ3yin-n1xp_Hgh0ANjEwkwPq08` |
| Twilio From Number | +61 485 004 338 |
| Twilio Account SID | <TWILIO_ACCOUNT_SID> |

---

## Tech Stack

| Component | Service | Purpose |
|-----------|---------|---------|
| Voice AI | VAPI | Handle calls, collect info |
| Workflow | n8n Cloud | Orchestrate data flow |
| Urgency AI | OpenAI GPT-3.5 | Classify appointment urgency |
| Data Store | Google Sheets | Log appointment requests |
| SMS | Twilio | Patient confirmation |

---

## Modular Components

This capability is built for reuse:

### Reusable Across Clients
- Voice prompts (customize business name)
- n8n workflow structure (swap Sheet ID)
- SMS templates (customize branding)
- Urgency classification logic

### Client-Specific Config
- Google Sheet ID
- Twilio phone number
- Business name in prompts
- Operating hours

### Extensible For
- Capability 3: Missed Call Recovery
- Capability 4: FAQ Responses
- Staff notifications (Slack/Email)
- CRM integration

---

## Testing Scenarios

| Test | Urgency | Key Validation |
|------|---------|----------------|
| 1. Annual check-up | routine | Happy path |
| 2. Fever & headache | urgent | Urgency classification |
| 3. Chest pain | emergency | Emergency detection |
| 4. Minimal data | routine | Fallback handling |
| 5. Follow-up | routine | Common request type |

See [docs/TEST-PAYLOADS.md](docs/TEST-PAYLOADS.md) for complete payloads.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Call completion rate | >80% |
| Data extraction accuracy | >90% |
| SMS delivery rate | >95% |
| Staff response time | <2 hours |

---

## Demo Script

1. "Let me show you our AI appointment assistant"
2. Call the VAPI number on speaker
3. Complete booking conversation (~2-3 min)
4. Show SMS received on phone
5. Show Google Sheet with new entry + urgency
6. "Staff can now call back to confirm the slot"

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Webhook not triggering | Check workflow is Active; verify secret |
| SMS not sending | Check Twilio credentials; verify phone format |
| Sheet not updating | Re-auth Google; verify sheet name |
| Wrong urgency | Check OpenAI credentials; review prompt |

---

## Next Steps

After successful demo:
1. **Capability 3:** Missed call recovery
2. **Staff alerts:** Add Slack/email for emergencies
3. **Multi-client:** Template for new clinics
4. **Analytics:** Track request volume and types

---

## Support

- **Workflow issues:** Check n8n executions for error details
- **Voice issues:** Review VAPI call logs
- **SMS issues:** Check Twilio console for delivery status

---

**Built by BizElevate** | AI Automation for Healthcare

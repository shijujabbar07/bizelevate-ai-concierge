# Missed Call Recovery — Capability Playbook

**Capability:** missed_call
**Product Name:** BizElevate Missed Call Recovery (BMCR)
**Status:** In Development (design phase)
**Version:** 0.1

---

## Change Log

| Version | Date | Change |
|---------|------|--------|
| 0.1 | 2026-03-06 | Initial playbook created from BMCR Strategy Report |

---

## 1. Capability Overview

### Business Problem
When a dental clinic misses a call, the caller either tries a competitor or never calls back. Silent missed calls are silent lost revenue.

### Solution
Detect every missed call via Twilio → fire an instant, personalised SMS text-back → log to Supabase for reporting.

### Client Value
- No missed call goes unanswered
- Caller feels the clinic responded immediately
- Staff see missed-call volume in reporting
- Reduces front-desk anxiety around missed calls

### Product Positioning
"We turn your missed calls into booked appointments automatically."
Frame as **practice growth**, not automation or tech.

---

## 2. Architecture

### Flow (Happy Path)
```
Caller rings → no answer → Twilio StatusCallback fires →
n8n receives webhook → validate caller number →
n8n sends SMS via Twilio → n8n writes to Supabase call_logs →
n8n responds 200 OK
```

### Trigger Mechanism
Twilio StatusCallback fires when a call reaches `CallStatus=no-answer` or `CallStatus=busy`.
- Configured on the Twilio phone number (not on VAPI — no AI voice used here)
- Webhook URL: `https://bizelevate1.app.n8n.cloud/webhook/missed-call`
- Method: POST (Twilio sends form-encoded body)

### Data Flow
```
Twilio Payload → n8n Normalize → Phone Valid? → Send SMS + Log Supabase
                                              ↓ (invalid)
                                         Log Supabase only (no SMS)
```

---

## 3. n8n Workflow Design

### Node Sequence

| # | Node | Type | Purpose |
|---|------|------|---------|
| 1 | Missed Call Webhook | Webhook | Receive Twilio StatusCallback |
| 2 | Filter: Missed Calls Only | IF | Pass only `no-answer` / `busy` calls |
| 3 | Normalize Twilio Payload | Code | Extract caller number, timestamp, client_id |
| 4 | Phone Valid? | IF | Check AU phone format regex |
| 5 | Send SMS | HTTP Request | POST to Twilio SMS API |
| 6 | Write to Supabase | HTTP Request | POST to call_logs (sms_sent=true) |
| 7 | Write to Supabase — No Phone | HTTP Request | POST to call_logs (sms_sent=false) |
| 8 | Respond 200 | Respond to Webhook | Acknowledge Twilio |

### Key Fields from Twilio StatusCallback

| Twilio Field | Maps To | Notes |
|---|---|---|
| `From` | `patient_phone` | Caller's number |
| `To` | Clinic number | Used to look up client_id |
| `CallStatus` | Filter condition | `no-answer` or `busy` |
| `CallSid` | `call_id` | Unique call reference |
| `Timestamp` | `created_at` | When call occurred |

### Phone Validation Regex
```
^(\+?614|04)\d{8}$
```
Matches: `0412345678`, `+61412345678`, `61412345678`

---

## 4. SMS Templates

### Default (v1)
```
Hi, we missed your call at [Clinic Name]. We'd love to help —
call us back on [Phone] or reply here to book an appointment.

– [Clinic Name] Team
```

### Urgency Variant (v2 — if AI triage added)
```
Hi, we missed your call at [Clinic Name]. If this is urgent,
please call [Emergency Number] or visit your nearest emergency clinic.
Otherwise, call us back on [Phone] or reply to book.

– [Clinic Name] Team
```

---

## 5. Supabase Logging

Uses shared `call_logs` table (see `supabase/migrations/`).

| Field | Value |
|-------|-------|
| `capability` | `missed_call` |
| `client_id` | `smile-dental` (from Twilio number lookup) |
| `call_id` | `{{ $json.CallSid }}` |
| `patient_phone` | `{{ $json.From }}` |
| `call_status` | `missed` |
| `sms_sent` | `true` / `false` |
| `notes` | `CallStatus: {{ $json.CallStatus }}` |

---

## 6. Multi-Client Routing (Phase 2+)

Each client gets their own Twilio number. The `To` field in the webhook identifies which client was called.

Options:
1. **Single workflow, lookup table in Supabase:** `phone_numbers` table maps Twilio number → client_id
2. **One workflow per client:** Simpler to demo, harder to scale
3. **Single workflow, config Set node:** Works for up to ~5 clients hardcoded

**Recommendation for v1:** Hardcode one client per demo. Phase 2: Supabase phone number lookup.

---

## 7. Pricing

| Plan | Target Volume | Price | Notes |
|------|--------------|-------|-------|
| Starter | Unlimited | $349/mo | v1 flat fee, simplest to sell |
| Growth | ≤100 calls/mo | $299/mo | v2 tiered |
| Scale | ≤300 calls/mo | $499/mo | v2 tiered |
| Enterprise | 300+ | Custom | v2 |

**30-day performance-backed guarantee** — if the clinic doesn't capture more missed calls in 30 days, full refund.

---

## 8. Demo Script

1. "Let me show you what happens when your clinic misses a call"
2. Call the Twilio demo number from a mobile — let it ring out
3. Show the SMS received on the mobile within 5–10 seconds
4. Show the Supabase log entry (or a simple dashboard)
5. "That's every missed call automatically recovered. No staff action needed."

**Setup time for demo:** <30 minutes from scratch.

---

## 9. Legal (Australia)

| Law | Implication |
|-----|------------|
| Spam Act 2003 | One-to-one direct reply to a missed call is exempt from bulk spam rules |
| Privacy Act 1988 | Don't store caller data beyond what's needed; mention in privacy policy |
| ACMA regulations | Use Twilio AU numbers; no number spoofing |

---

## 10. Build Phases

### Phase 1 — MVP (Demo-Ready)
- [ ] n8n workflow: Twilio webhook → Filter → SMS → Supabase log
- [ ] SMS template (1 default)
- [ ] Supabase logging (capability=missed_call)
- [ ] Demo tested with real Twilio number

### Phase 2 — Client-Ready
- [ ] Multi-client routing via Supabase phone number lookup
- [ ] Client-specific SMS templates via config
- [ ] Daily summary report (Slack or email)
- [ ] Reply handling → route to Appointment Concierge

### Phase 3 — Scale
- [ ] AI triage: detect urgent keywords in reply → escalate
- [ ] Analytics dashboard (Supabase + Metabase or Notion)
- [ ] Automated client onboarding workflow

---

## 11. Integration with Appointment Concierge

The two capabilities are complementary and designed to be bundled:

| Scenario | Capability |
|----------|------------|
| Patient calls during hours | Appointment Concierge (VAPI handles) |
| Patient calls after hours or missed | Missed Call Recovery (Twilio SMS) |
| Patient replies to SMS | Route to Appointment Concierge intake form or callback |

**Bundle price (v2):** $599/mo for both capabilities.

---

## 12. Next Actions

| Priority | Action | Owner |
|----------|--------|-------|
| 1 | Build n8n workflow (Phase 1) | Claude Code |
| 2 | Configure Twilio StatusCallback on demo number | You |
| 3 | Test end-to-end with real missed call | You |
| 4 | Create lead list (Google Maps scrape — dental clinics AU) | You |
| 5 | Send first cold email batch (300/week target) | You |

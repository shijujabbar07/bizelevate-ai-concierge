# CustomerReach Answer — Capability Playbook

**Capability:** appointment_concierge
**Product Name:** CustomerReach Answer
**Status:** ACTIVE — ready for testing
**Version:** 2.1

---

## 0. Why This Exists — Business Context

### The problem it solves

A dental receptionist can handle one call at a time. After hours, they handle zero. Every call that hits voicemail after 5:30pm, every call that rings out during lunch, every call on a Sunday — those patients either leave a message nobody returns promptly, or they call the next clinic on Google.

CustomerReach Answer means the phone is always answered. By an AI. In under two seconds.

---

### What this capability does

When a patient calls the CustomerReach Answer number, VAPI's AI voice assistant (Alex) answers immediately. Alex:

- Greets the patient professionally on behalf of the clinic
- Explains they've reached after-hours or an automated intake line
- Collects: first name, callback number, preferred callback time, reason for call
- Identifies urgency (routine, urgent, emergency)
- Confirms the details back to the patient
- Ends the call warmly

Within 30 seconds of the call ending:
- The patient receives an SMS confirmation with their callback time
- The clinic owner receives a summary SMS
- The full intake is logged to Supabase and Google Sheets
- Emergency calls trigger an immediate owner alert

---

### Which number do patients call?

See **[docs/PHONE-ONBOARDING.md](../docs/PHONE-ONBOARDING.md)** for the complete setup guide.

**Common configurations:**

**After-hours line (recommended first deployment):**
The Twilio/VAPI number is marketed as the clinic's after-hours booking line. Listed on Google Business Profile, website, and voicemail greeting of main number.
*"For after-hours appointment requests, call 04XX XXX XXX."*

**New patient line:**
A second number listed only for new patients (on ads, Google, website). Existing patients call the main number; new patients reach the AI.

**Full AI receptionist (Option 3 — porting):**
Main clinic number ports to Twilio. VAPI answers all calls during configured hours. Staff answering is configured as a fallback.

---

### How it actually works — real-life scenarios

**Scenario 1 — After-hours Sunday call:**

> 7:14pm Sunday — James Nguyen Googles "emergency dentist Campsie" and finds Smile Dental.
> Google Business Profile shows: "After-hours bookings: 0485 004 338"
> James calls. Alex answers in 1.8 seconds.
> Alex: *"Hi, you've reached Smile Dental's after-hours booking line. I'm Alex — I'll take your details and make sure the team calls you first thing Monday. Can I get your name?"*
> James gives name, number, reason (broken tooth, some pain), preferred callback: Monday 9am.
> Alex confirms everything, ends call warmly.
> 30 seconds later: James receives SMS — *"Hi James, thanks for calling Smile Dental. We'll call you Monday at 9am — our number is 0485 004 338."*
> Monday 8:55am: Receptionist sees James's intake in dashboard, calls him at 9am as promised.

**Scenario 2 — Busy mid-day, receptionist unavailable:**

> 12:47pm Tuesday — Sarah calls the clinic. Receptionist is with a patient.
> Call forwards to VAPI (via conditional forwarding or timeout routing).
> Alex takes Sarah's intake in under 90 seconds.
> Receptionist returns at 1:15pm, sees Sarah's entry in Google Sheets, calls her back.

---

### What changes for the clinic

| Before | After |
|--------|-------|
| After-hours calls go to voicemail | Every call answered within 2 seconds |
| Voicemail rarely checked promptly | Structured intake in Google Sheets + dashboard |
| Patient calls competitor | Patient gets SMS confirmation and expects callback |
| No record of missed after-hours calls | Every call logged with transcript summary |
| Emergency calls go unnoticed | Emergency triggers immediate owner SMS alert |

---

### Why clinics pay for this

- **Always on** — answers at 2am on Christmas Day
- **No voicemail** — patients get a response, not a beep
- **Structured intake** — receptionist has name, number, reason, time before calling back
- **Emergency detection** — urgent cases flagged immediately
- **No extra staff** — zero labour cost for after-hours coverage

**The pitch:** *"Call this number after hours."* [Call it during demo. Alex answers. Patient gets SMS.] *"That just happened with zero staff involved."*

---

### How it fits with CustomerReach Respond

CustomerReach Answer **answers** calls. CustomerReach Respond is the **safety net** for calls that slip through.

```
Patient calls the clinic number
  │
  ├── VAPI active (after hours / overflow configured)
  │     └── Alex answers → intake → SMS confirmation → logged
  │
  └── VAPI unavailable (rare) or call not routed to VAPI
        └── CustomerReach Respond fires → SMS within 10 seconds
```

Together they ensure zero patients reach silence.

---

## 1. Architecture

### Flow (Happy Path)
```
Patient calls VAPI number → Alex answers → collects intake →
call ends → VAPI fires end-of-call-report webhook →
n8n receives webhook → classify urgency → validate phone →
send patient SMS confirmation → send owner summary SMS →
log to Supabase call_logs → log to Google Sheets
```

### Trigger
VAPI end-of-call-report webhook fires after every call.
- Webhook URL: `https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment`
- Auth: VAPI webhook secret header
- Payload: full transcript + VAPI summary fields

### n8n Workflow ID
`HKHwb6mpWdvGcR070E8or`

---

## 2. VAPI Configuration

### Assistant: Alex
- **Active prompt:** `appointment-concierge/vapi/prompts/alex-v2-intake-only.md`
- **No tools configured** — all data flows via end-of-call-report webhook only
- **Voice:** professional, warm, unhurried
- **End-of-call:** VAPI fires webhook with full transcript

### Data Extraction
Alex collects everything via conversation. n8n's Decision Agent extracts:
- `patient_name` — first name
- `patient_phone` — callback number
- `preferred_callback` — day + time slot
- `reason` — reason for call in patient's own words
- `urgency` — routine / urgent / emergency

---

## 3. SMS Templates

### Patient Confirmation (during hours)
```
Hi [FirstName], thanks for calling [Clinic].
Your preferred callback time is [slot].
We'll call you then — our number is [Phone].

– [Clinic Name] Team
```

### Patient Confirmation (after hours)
```
Hi [FirstName], thanks for calling [Clinic] after hours.
We'll call you first thing [next weekday] at [slot] — our number is [Phone].

– [Clinic Name] Team
```

### Owner Summary (every call)
```
New appointment request from [FirstName] ([Phone]).
Callback: [slot]. Reason: [reason].
View details: dashboard.bizelevate.app
```

### Emergency Owner Alert (urgency = emergency)
```
URGENT: [PatientName] ([PatientPhone]) called with a possible dental emergency.
Reason: [Reason]. Call them back immediately.
```

---

## 4. Pricing & Product Tiers

CustomerReach Answer is included from Core tier upwards.

| Tier | Capabilities Included | Price |
|------|-----------------------|-------|
| **Starter** | CustomerReach Respond only | $199/mo |
| **Core** | Respond + Answer + Dashboard | $499/mo |
| **Growth** | Core + Remind + Review | $799/mo |
| **Practice** | Growth + Recall + Multi-location | $1,299/mo |

**Setup fee:** $500–$750 one-time
**30-day guarantee:** Full refund if no measurable improvement in after-hours call handling.

---

## 5. The Demo in 90 Seconds

1. Call the CustomerReach Answer demo number: `+61 485 004 338`
2. Alex answers immediately
3. Give a fake name, your mobile number, any reason
4. End call
5. Show the SMS arriving on your phone
6. Show the entry in Google Sheets / Supabase dashboard
7. *"That was zero staff. Fully automated. The clinic wakes up Monday with a structured list of who called and when to call them back."*

---

## Change Log

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-02-15 | Initial deployment — VAPI + n8n + Google Sheets |
| 2.0 | 2026-03-01 | Supabase logging added. Decision Agent for data extraction. |
| 2.1 | 2026-03-07 | Renamed to CustomerReach Answer. No VAPI tools — end-of-call only. |

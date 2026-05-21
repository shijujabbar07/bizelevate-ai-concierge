# Phone Number Onboarding — Complete Guide

**Applies to:** CustomerReach Respond + CustomerReach Answer
**Last Updated:** 2026-03-10

This document answers every real question a dental clinic will ask about phone numbers
before they sign up. Read this before any sales conversation. Know this cold.

---

## The Core Reality First

**CustomerReach Respond** (missed call SMS) only works if the missed call passes through
Twilio. Twilio is the system that detects the missed call and fires the SMS.

**CustomerReach Answer** (AI voice) works on any Twilio number. VAPI answers calls that
come to a Twilio number.

This means: **at least one Twilio number is always required per client.** The question
is how that number fits into their existing setup.

---

## What Most Clinics Have Today

| Setup | How common | Notes |
|-------|-----------|-------|
| NBN landline (Telstra, Optus, TPG, Aussie BB) | Very common | Supports conditional call forwarding |
| VoIP system (3CX, RingCentral, Vonex, MYNetFone) | Common in newer/larger clinics | Forwarding rules in admin panel |
| Mobile as main business number | Common in 1-chair clinics | Easiest to work with |
| Old PSTN copper landline | Rare, being phased out | Still supports forwarding codes |

---

## The Three Setup Options (Honest Assessment)

---

### Option 1 — Dedicated Second Number (Recommended for First Clients)

**What happens:** The clinic keeps their existing number exactly as-is. We provision a
new Twilio AU number. This new number is used exclusively for CustomerReach services.

**For CustomerReach Answer:** The new number is the AI answering line. Clinic advertises
it as their *"after-hours line"* or *"new patient booking line"*. They add it to their
Google Business Profile, website footer, and any new marketing. Existing patients keep
using the old number. New patients and after-hours callers use the new number.

**For CustomerReach Respond:** Any call that goes to the new Twilio number and is not
answered triggers the missed call SMS. The clinic can forward their existing number to
this new number when busy/no-answer (see Option 2), or simply promote the new number
as the primary contact for new enquiries.

**Pros:**
- Zero changes to existing phone setup
- Live same day — no carrier involvement, no waiting
- Zero risk of downtime
- Easy to demo (we already have demo numbers)
- Can be rolled back instantly

**Cons:**
- Clinic now has two numbers to manage
- Patients who already have the old number won't use the new one
- Google Business Profile needs updating
- Business cards / signage don't reflect the new number (unless they update)

**Cost:** ~$3–6 AUD/month for the Twilio AU number (mobile 04XX or local 02/03/07/08)
+ per-message/per-minute Twilio usage.

**Recommended for:** Every first client. Get them live fast. Prove value. Let them
decide whether to consolidate numbers later.

---

### Option 2 — Conditional Call Forwarding (No Number Change, Respond-Ready)

**What happens:** The clinic keeps their existing number. They set up a forwarding rule:
when their existing number gets no answer (after ~20 seconds), the call forwards to
the Twilio number. Twilio then handles the missed-call SMS. Nothing visible changes
for the clinic or their patients.

**This is how it works:**

```
Patient calls 03 9876 5432 (clinic's main number — unchanged)
    ↓
Clinic's phone rings for ~20 seconds
    ├── Staff answers → normal call, no automation
    └── No answer → call forwards to Twilio number (invisible to caller)
              ↓
         Twilio receives the forwarded call
              ↓
         Twilio plays: "Thanks for calling. We missed your call —
                        we'll send you a text message now. Goodbye."
              ↓
         Twilio hangs up → StatusCallback fires → n8n → SMS to caller
```

**Setting up conditional forwarding in Australia:**

Most Australian phone systems support standard forwarding codes dialled directly
from the phone. These take effect immediately and can be cancelled any time.

| Action | Dial from the clinic's phone |
|--------|------------------------------|
| Forward on no-answer to Twilio number | `*62*04XXXXXXXX#` |
| Forward on busy to Twilio number | `*67*04XXXXXXXX#` |
| Cancel no-answer forward | `##62#` |
| Cancel busy forward | `##67#` |
| Check if forwarding is active | `*#62#` |

Replace `04XXXXXXXX` with the clinic's Twilio number.

**Works on:** Telstra landlines, Optus landlines, most NBN voice services, Vodafone
mobile, Optus mobile, Telstra mobile. Call your carrier to confirm if unsure.

**For VoIP systems (3CX, RingCentral, Vonex, etc.):**
Log into the admin panel → Find "Call Forwarding" or "Overflow" rules → Set
"no-answer forward" to the Twilio number after 20 seconds.

**For MYNETFONE / Aussie Broadband Voice:**
These NBN VoIP providers have a web portal where you can set forwarding rules.
Takes 5 minutes in the portal — no dialling needed.

**Pros:**
- Clinic keeps their existing number — zero change for existing patients
- No number porting required
- No carrier paperwork
- Reversible in 30 seconds (dial ##62# to cancel)
- Missed call SMS works on their main number

**Cons:**
- Requires a brief phone message played by Twilio before hanging up (small change in
  caller experience — callers hear a message instead of silence/voicemail)
- Some VoIP systems need admin access to configure forwarding
- Some NBN providers charge for conditional forwarding (rare, usually free)
- CustomerReach Answer (AI voice) still needs the Twilio number to be a separate
  dedicated line — this option handles Respond only

**Recommended for:** Client 2+ when they want Respond on their existing number
without porting. Also excellent for clinics with VoIP systems that have easy
admin panel access.

---

### Option 3 — Number Porting to Twilio (Full Integration, Best Long-Term)

**What happens:** The clinic's existing phone number is ported from their current
carrier (Telstra, Optus, etc.) to Twilio. The number stays the same — patients
notice nothing. But Twilio now controls all call routing.

Once ported:
- During business hours: Twilio forwards all calls to the clinic's internal phones
- Missed calls: StatusCallback fires automatically → Respond SMS
- After hours: Time-based routing → VAPI → Answer takes the call
- All on ONE number. No second line. No forwarding rules.

**The porting process in Australia:**

| Step | Who does it | Time |
|------|------------|------|
| Submit porting request via Twilio Console | BizElevate | 30 min |
| Carrier verifies details (ABN, account number, address) | Twilio + old carrier | 5–15 business days |
| Port completes — number switches to Twilio | Automatic | Instant, usually overnight |
| Configure Twilio routing (forward to clinic phones, StatusCallback) | BizElevate | 30 min |

**What can go wrong:**
- Porting fails if account details don't exactly match what the carrier has on file
- Downtime risk: small window (~1–2 hours) when number is switching
- Some VOIP providers (especially bundled NBN) can be slow or difficult to port from
- Some clinic owners are nervous about any risk to their main line

**How to mitigate:**
- Do porting on a Friday afternoon — if something goes wrong, clinic is closed anyway
- Test with Option 1 or 2 first — only port after the clinic has seen value
- Keep the clinic's old carrier SIM/service active for the porting window as backup

**Pros:**
- Single number for everything — cleanest experience
- No forwarding rules to manage
- Full Twilio control — time-based routing, after-hours voice, missed call SMS
- Supports the complete CustomerReach bundle on one number

**Cons:**
- 5–15 business day wait
- Requires paperwork and carrier cooperation
- Small risk of disruption during port window
- Some clinics will not want to do this regardless of the upside

**Recommended for:** Client 3+ after they've experienced the product and trust you.
Do NOT recommend this on the first sale — it introduces unnecessary risk and delay.

---

## CustomerReach Answer — Phone Setup Specifically

CustomerReach Answer (AI voice) is always on a **dedicated Twilio number connected to
VAPI**. This is non-negotiable — VAPI must control the number to answer calls.

### How the clinic positions this number to patients:

**Framing 1 — After-hours line (easiest sell)**
> "We have a new after-hours line. When we're closed, call [VAPI number] and our AI
> assistant can take your appointment request. We'll confirm by the next morning."

Updated in:
- Google Business Profile: Add as secondary number labelled "After-hours bookings"
- Website: "After hours? Call [number]"
- Outgoing voicemail on main line: "If this is outside business hours, you can also
  reach us on [VAPI number] for after-hours assistance."

**Framing 2 — New patient booking line (broader reach)**
> "We have a dedicated booking line for new patients. Call [VAPI number] and our
> assistant will take your details. Someone will confirm your appointment time."

Updated in:
- Google Business Profile: Add as "Appointments" phone number
- Website: New patient booking CTA → "Call [number]"
- Any new patient advertising (Google Ads, Facebook)

**Framing 3 — Full AI receptionist (if clinic wants maximum coverage)**
> "All inbound calls go to our AI first. It answers, takes your name and reason for
> call, and our team follows up. You'll always get a response."

This means ALL calls route to the Twilio/VAPI number. Old number either ports or
forwards to Twilio. The AI answers everything. Humans handle callbacks.

---

## The Google Business Profile Update (Critical)

For any new Twilio number to actually receive calls from new patients, the clinic's
Google Business Profile must be updated. This is where 70–80% of new dental patient
searches happen.

**Steps:**
1. Log into [Google Business Profile](https://business.google.com)
2. Select the clinic's listing
3. Click **Edit profile → Contact → Phone**
4. Add the Twilio/VAPI number as an **additional phone number**
   (primary stays as their existing main number)
5. Save — takes 24–48 hours to reflect in search

**For CustomerReach Answer:** Add VAPI number as "Appointments" or "After-hours"
**For CustomerReach Respond:** If using Option 1 (second number), consider updating
the Google listing to note this as the primary new-enquiry number

---

## Onboarding Decision Tree — Which Option for Which Client

```
New client inquiry: "How does the phone setup work?"
│
├── Are they happy to advertise a second number for bookings/after-hours?
│     └── YES → Option 1 (Dedicated second number). Live today.
│
├── Do they want missed calls recovered on their EXISTING main number?
│     ├── Do they have a VoIP system with admin access?
│     │     └── YES → Option 2 (Conditional forwarding from VoIP admin panel)
│     ├── Do they have a landline (Telstra/Optus/NBN)?
│     │     └── YES → Option 2 (Conditional forwarding via *62 code)
│     └── Do they have a mobile as their main business number?
│           └── YES → Option 3 (Port mobile to Twilio) OR Option 1 (second number)
│
└── Do they want everything on ONE number with full time-based routing?
      └── YES → Option 3 (Number porting). Set expectation: 1–2 week wait.
```

---

## Pricing for Twilio Number Provisioning

| Item | Cost | Who pays |
|------|------|----------|
| Twilio AU local number (02/03/07/08) | ~$3 USD/month | Passed to client or absorbed |
| Twilio AU mobile number (04XX) | ~$2 USD/month | Passed to client or absorbed |
| SMS (outbound, AU) | ~$0.04 USD/message | Absorbed in subscription |
| Voice minutes (inbound to Twilio) | ~$0.005 USD/min | Absorbed in subscription |
| Number porting fee | $0 (Twilio doesn't charge) | Free |

**Recommendation:** Include the Twilio number cost in the monthly subscription fee.
At $199–$499/mo, $3–5/month for the number is not worth itemising separately.

---

## Objection Handling — Phone Number Questions

**"I don't want to change my phone number."**
> "You don't have to. Your existing number stays exactly the same. We add one line of
> forwarding so that when your phone isn't answered, we send the caller an SMS
> automatically. Your number doesn't change. Your patients don't notice anything."

**"What if the forwarding breaks and we miss real calls?"**
> "The forwarding is conditional — it only activates when you don't answer. If your
> phone is working normally, nothing changes. And if you ever want to turn it off,
> you dial two codes on your phone and it's gone in 30 seconds."

**"Can we use our existing number with the AI answering?"**
> "Yes, eventually. The cleanest path is to start with a second number for after-hours
> and new-patient bookings — no changes, live today. Once you've seen the value, we
> can look at porting your main number across so everything runs on one line. Most
> clients start with the second number and decide later if they want to consolidate."

**"We're on Telstra — will this work?"**
> "Yes. Telstra landlines and mobiles both support call forwarding. For the landline,
> you just dial a short code on the phone itself — takes 2 minutes. We'll walk you
> through it."

**"How long does it take to get set up?"**
> "If we go with a second number: you can be live today. If you want to use forwarding
> from your existing number: also today — 5 minutes to set up forwarding. If you want
> your existing number fully ported to our system: allow 1–2 weeks for the carrier
> transfer."

**"What happens during number porting — will we lose calls?"**
> "There's a small window (usually a few hours, typically overnight) where the number
> is transitioning between carriers. We schedule porting for a Friday evening so if
> anything delays, you're not losing weekday calls. In practice, most ports complete
> without any interruption."

---

## Messaging Channels — SMS vs WhatsApp

Both CustomerReach Respond (patient SMS) and clinic owner notifications currently use
standard SMS via Twilio. WhatsApp is available via the same Twilio API and is a realistic
upgrade request from some clients.

### Current (Phase 1): SMS only

Standard AU SMS. Works on every mobile, no app required. No opt-in needed for transactional
messages. Delivered immediately.

### Phase 2 option: WhatsApp via Twilio

Twilio supports WhatsApp with the same API call — just prefix the `To` number with `whatsapp:`.
From the workflow perspective, it is a one-character config change per client.

**When to offer WhatsApp:**
- Clinic owner explicitly requests it
- Practice has a large non-English-speaking patient base (WhatsApp is widely used)
- Client is already in the Twilio WhatsApp sandbox and has a verified sender

**Constraints:**
- Requires Twilio WhatsApp Business API approval (~24–48 hours)
- Patient must have WhatsApp installed — SMS has 100% reach, WhatsApp does not
- For owner notifications only (not patient SMS): simpler, no patient consent issue

**Implementation when needed:**
Add `owner_channel` column to `clients` table (`'sms'` | `'whatsapp'`). Workflow reads
channel preference at runtime. No code fork needed.

**Recommendation:** Default to SMS for all Phase 1 clients. Mention WhatsApp as a future
upgrade if the client asks. Do not build it until a client explicitly wants it.

---

## Per-Client Setup Record (fill in for each client)

| Field | Value |
|-------|-------|
| Client name | |
| Existing main number | |
| Existing phone system (Telstra landline / VoIP / mobile) | |
| Setup option chosen (1 / 2 / 3) | |
| Twilio number provisioned | |
| CustomerReach Respond active | Yes / No |
| CustomerReach Answer active | Yes / No |
| VAPI number (if Answer active) | |
| Forwarding configured | Yes / No / N/A |
| Google Business Profile updated | Yes / No |
| Owner/front desk notification number | |
| Owner notification channel | SMS / WhatsApp |
| Go-live date | |

---

*This document is the source of truth for phone setup decisions. Update it when new
carrier quirks or setup patterns are discovered.*

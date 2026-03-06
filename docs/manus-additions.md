# Manus Document Additions — BizElevate Strategy

Paste-ready content for adding to the BMCR Strategy document on Manus.
Two sections to add: AI Concierge and Management App (Foundation Layer).

---

## SECTION: AI Appointment Concierge

### What It Is

The AI Appointment Concierge is an inbound voice agent that answers calls, collects appointment requests, and sends instant SMS confirmations — without any staff involvement.

When a patient calls and the front desk is busy, on hold, or unavailable, the AI agent steps in:

1. Greets the patient professionally ("Hi, you've reached Smile Dental…")
2. Collects their name, phone number, preferred appointment time, and reason for visit
3. Classifies the request as routine, urgent, or emergency
4. Sends the patient an SMS confirmation within seconds of hanging up
5. Logs the request to the clinic's dashboard for staff to action

Staff open their dashboard in the morning to see a clean list of appointment requests, pre-sorted by urgency. No voicemails. No missed follow-ups. No double-handling.

---

### The Problem It Solves

Dental clinics lose appointment requests every day because:

- The phone rings during a procedure and no one answers
- Receptionists take a message but details get lost or misrecorded
- Voicemails go unchecked until the end of the day
- Patients who don't get a timely response call a competitor

The AI Concierge eliminates this. Every inbound call — whether answered by staff or not — results in a structured, logged, SMS-confirmed appointment request.

---

### What Makes It Different

- **No scripts to memorise** — the AI adapts to the patient's language
- **Urgency classification built in** — emergency requests are flagged automatically
- **Works 24/7** — handles after-hours calls the same way
- **No new equipment** — works with the clinic's existing phone number via call forwarding
- **Data goes where staff already look** — Google Sheets or the BizElevate dashboard

---

### How It Works (Technical)

| Component | Role |
|-----------|------|
| VAPI (voice AI) | Handles the phone call, extracts patient data |
| n8n (automation) | Routes data, triggers SMS, writes to dashboard |
| Twilio | Delivers SMS confirmation to the patient |
| OpenAI | Classifies urgency (routine / urgent / emergency) |
| Google Sheets / Supabase | Stores every request for staff to review |

The system runs on BizElevate's cloud infrastructure. Clinics need no software, no servers, no IT support.

---

### Pricing

| Plan | Price | Includes |
|------|-------|---------|
| Starter | $349/mo | Unlimited inbound calls, SMS confirmations, urgency classification, Google Sheets log |
| Pro | $499/mo | Everything in Starter + BizElevate dashboard, priority support |
| Bundle | $599/mo | Concierge + Missed Call Recovery |

**30-day performance guarantee.** If the system doesn't capture more appointment requests in the first 30 days than before, full refund.

---

### Who It's For

**Primary:** 1–3 chair dental clinics in Australia
- Receptionist is also a dental assistant (wears two hats)
- Clinic misses 5–20 calls per week during procedures
- No dedicated phone system or call centre

**Also fits:** GP clinics, allied health practices, specialist rooms — any service business with inbound appointment calls.

---

### Current Status

- **Demo-ready** — live and tested with a real VAPI assistant and n8n workflow
- Capturing: patient name, phone, preferred time, reason, urgency classification
- SMS confirmation: live and delivered in <5 seconds post-call
- Logging: Google Sheets (live) + Supabase audit log (live)
- Ready for first paid client deployment

---

## SECTION: Management App — The Foundation Layer

### What It Is

The BizElevate Management App is the client-facing dashboard that sits on top of every automation we deploy. It gives clinic owners and practice managers a single view of everything happening in their AI-powered practice — without logging into n8n, Supabase, or any technical tool.

This is the foundation layer. Every capability BizElevate deploys feeds data into this app.

---

### Why It Matters

Automation without visibility is hard to sell. Clinic owners want to see the system working.

The Management App answers:
- "How many calls did we capture this week?"
- "How many missed calls did we recover?"
- "What's the urgency breakdown of today's appointment requests?"
- "Did the SMS confirmations go out?"

When an owner can see their AI working in real time, they stay. When they can't, they churn.

The Management App is the retention layer. It's what turns a month-to-month subscription into a long-term partnership.

---

### What It Shows

**Appointment Concierge view:**
- Total calls captured today / this week / this month
- List of all requests (name, phone, preferred time, urgency, SMS sent: yes/no)
- Filter by urgency (emergency first)
- Status column: new → contacted → confirmed (updated by staff)

**Missed Call Recovery view:**
- Total missed calls detected
- SMS text-backs sent
- Response rate (did the caller reply?)
- Recovery rate (did a recovered call convert to an appointment?)

**Combined summary (landing page):**
- Calls handled by AI today
- Missed calls recovered today
- SMS sent today
- Requests awaiting staff follow-up

---

### How It Works (Technical)

The Management App reads directly from the Supabase `call_logs` table — the same table that n8n writes to in real time. Every capability writes to a shared log with a `capability` field that filters the view.

| Layer | Technology |
|-------|-----------|
| Data | Supabase (PostgreSQL) — shared across all capabilities |
| MVP (Phase 1) | Supabase Studio dashboard (no code, zero build time) |
| V1 Product | Next.js + Vercel — clean, branded client portal |
| Authentication | Supabase Auth — per-client login |
| Multi-tenant | `client_id` field on every row — each clinic sees only their data |

---

### Rollout Plan

**Phase 1 — Demo (Now)**
Use Supabase Studio as the "dashboard" for demos. Show raw data in a clean table view. No build time required. Sufficient to prove the concept to first clients.

**Phase 2 — MVP (Month 3–4)**
Build a simple Next.js app on Vercel. Branded with BizElevate + client's clinic name. Supabase as backend. Per-client login. Displays both capability views. Estimated build: 2–3 weeks.

**Phase 3 — Product (Month 6+)**
Self-serve onboarding. Automated client provisioning. In-app billing (Stripe). Transition from consultancy to SaaS. This is the Vertical SaaS phase from the growth roadmap.

---

### Pricing Strategy

The Management App is **not sold separately** in v1. It is included with every capability subscription and becomes the primary retention driver.

In v2+, the app becomes the gateway to the SaaS product:
- Clients log in daily
- New capabilities appear as upgrades in the app
- Upgrade path is visible and clickable — no sales call required

---

### Competitive Advantage

Every competitor (Revenu, DentalEdge, Dentalflo AI) is building capability-specific point solutions. BizElevate's Management App creates a **platform**, not just a tool.

Once a client is on the platform and their staff use the dashboard daily, switching cost is high. The app is the moat.

---

### Current Status

- **Data infrastructure live** — Supabase `call_logs` populated by both Appointment Concierge and Missed Call Recovery workflows
- **Schema designed for multi-tenant** — `client_id` field on every row
- **Supabase Studio** available for demo use immediately
- **Next.js build** planned for Month 3 (post first 2–3 paying clients)

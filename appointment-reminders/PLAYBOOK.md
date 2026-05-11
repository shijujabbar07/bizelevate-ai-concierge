# CustomerReach Remind — Capability Playbook

**Capability:** appointment_reminder
**Product Name:** CustomerReach Remind
**Status:** LIVE — schema applied, workflows deployed and active
**Tier:** Growth ($799/mo)
**Version:** 0.3

---

## 0. Why This Exists — Business Context

### The problem it solves

A patient books an appointment two weeks out. Life gets busy. They forget. They don't cancel — they simply don't show up.

For a dental clinic, a no-show is a dead hour in the chair. The slot cannot be refilled at short notice. The dentist still gets paid. The receptionist still turned up. But the revenue from that appointment is gone.

The Australian dental industry estimates no-show rates between 8–15% for clinics without reminder systems. For a 3-chair clinic with 60 appointments per week, that's 5–9 empty slots per week. At $200 average appointment value, that's $1,000–$1,800 in lost revenue every week — recurring.

CustomerReach Remind eliminates this.

---

### What this capability does

When a staff member adds an appointment to the dashboard, the system automatically schedules two SMS reminders:

- **48 hours before the appointment:** A friendly heads-up. The patient can confirm, cancel, or ignore.
- **2 hours before the appointment:** A final prompt. If they haven't cancelled by now, they almost certainly attend.

The clinic does nothing after entering the appointment. The reminders fire automatically. If a patient replies to cancel, the cancellation is logged and the slot becomes available to fill.

Every reminder sent, every reply received, every cancellation — all logged to the dashboard.

---

### What changes for the clinic

| Before | After |
|--------|-------|
| Receptionist manually calls patients the day before | Zero staff time — reminders fire automatically |
| No-show rate 8–15% | Industry evidence shows reminders reduce no-shows to 2–5% |
| Empty slots known at appointment time | Cancellations arrive 48h or 2h early — slot can be refilled |
| No record of reminder history | Every sent reminder and reply visible in dashboard |
| Staff time spent on reminder calls | Staff time freed for higher-value tasks |

---

### Why clinics pay for this

- **Zero staff effort after appointment entry** — enter the appointment once, system handles it
- **Recoverable ROI** — a single prevented no-show often covers the monthly Growth tier fee
- **Predictable day** — the clinic knows by 7am who is and isn't coming
- **Fillable cancellations** — 48h notice is enough to fill a slot from a waiting list

**The pitch:** *"How many no-shows did you have last month? [Pause.] We send an automatic reminder 48 hours before every appointment. Most clinics cut their no-show rate by two-thirds in the first month."*

---

### How it fits in the Growth tier

CustomerReach Remind is the third capability in the Growth tier ($799/mo), alongside CustomerReach Respond and CustomerReach Answer. Together they cover the full patient communication cycle:

```
New patient calls → CustomerReach Answer (intake) or Respond (missed call recovery)
    ↓
Appointment booked → CustomerReach Remind (automated reminders)
    ↓
Post-visit → CustomerReach Review (review request — Phase 2)
```

Remind is the natural upsell after a clinic has seen value from Respond and Answer. The conversation is:

> *"You're recovering missed calls and answering after-hours calls. Now let's make sure those appointments actually show up."*

---

## 1. Architecture

### Flow (Happy Path)

```
Staff adds appointment to dashboard
  ↓
appointments row created
  ↓
appointment_reminders rows auto-created (48h + 2h, status=pending)
  ↓
n8n Reminder Scheduler runs every 15 minutes
  ↓
Queries appointment_reminders WHERE scheduled_for <= now() AND status IN ('pending','scheduled')
  ↓
For each due row:
  Send SMS to patient → UPDATE reminder_status = 'sent', sent_at = now()
  ↓
  On failure: UPDATE reminder_status = 'failed', failure_reason = error message
  ↓
Patient receives SMS
  ↓
Patient replies CONFIRM / CANCEL
  ↓
n8n Reminder Reply Handler captures reply
  → Send acknowledgement SMS to patient
  → If CANCEL: UPDATE appointments SET status = 'cancelled', cancel pending reminders
  → If CANCEL: Alert clinic owner via SMS
```

### Trigger Mechanism

The Reminder Scheduler is a **scheduled n8n workflow** — not webhook-triggered.

- **Polling interval:** Every 15 minutes (n8n Schedule Trigger node)
- **Query:** `appointment_reminders` table — rows where `scheduled_for <= now()` and `status IN ('pending', 'scheduled')`
- **n8n credential:** Supabase service role key (bypasses RLS)

### Data Flow

```
Supabase: appointment_reminders (due rows, joined with appointments)
  ↓
n8n Reminder Scheduler
  ↓
For each row: Fetch client config → Fetch Twilio number → Build SMS → Send via Twilio
  ↓
UPDATE appointment_reminders SET reminder_status='sent', sent_at=now()
  ↓
(On failure) UPDATE reminder_status='failed', failure_reason='...'
```

### Reminder Scheduling Logic

When a staff member creates an appointment via the dashboard, `appointment_reminders` rows are auto-inserted by `appointmentService.createAppointment()`:

| Reminder | Offset | `scheduled_for` formula |
|---------|--------|------------------------|
| 48h reminder | –48 hours | `appointment_datetime - 48h` |
| 2h reminder | –2 hours | `appointment_datetime - 2h` |

If an appointment is less than 48 hours away when created, the 48h reminder row is inserted with `scheduled_for` in the past — the scheduler will skip it (already past). Only the 2h reminder will fire.

If an appointment is less than 2 hours away, both reminders are skipped automatically.

---

## 2. n8n Workflows

### Workflow 1: Reminder Scheduler

**File:** `appointment-reminders/n8n/workflow-reminder-scheduler.json`
**Purpose:** Poll for due reminders and fire SMS.

| # | Node | Type | Purpose |
|---|------|------|---------|
| 1 | Schedule Trigger | Schedule | Runs every 15 minutes |
| 2 | Fetch Due Reminders | HTTP GET | `appointment_reminders` joined with `appointments` — rows where `scheduled_for <= now()` and `reminder_status IN ('pending','scheduled')` |
| 3 | Any Due? | IF | Stop if result array is empty |
| 4 | Split Reminders | Code | Split array into individual items for per-reminder processing |
| 5 | Fetch Client Config | HTTP GET | `clients` — name, owner_phone, timezone |
| 6 | Fetch Twilio Number | HTTP GET | `phone_number_map` — Twilio FROM number for this client |
| 7 | Build SMS | Code | Compose SMS body (48h or 2h tone variant), validate all data |
| 8 | Send SMS | HTTP POST | Twilio API — From=clinic number, To=patient mobile |
| 9 | Mark Sent | HTTP PATCH | `reminder_status='sent'`, `sent_at=now()` on success |
| 10 | Mark Failed | HTTP PATCH | `reminder_status='failed'`, `failure_reason=error` on Twilio error |

**Error routing:** Node 8 (Send SMS) uses `continueErrorOutput` — success goes to Mark Sent, error goes to Mark Failed.

### Workflow 2: Reminder Reply Handler

**File:** `appointment-reminders/n8n/workflow-reminder-reply.json`
**Purpose:** Handle patient CONFIRM/CANCEL replies to reminder SMS.

| # | Node | Type | Purpose |
|---|------|------|---------|
| 1 | SMS Reply Webhook | Webhook | Receive Twilio inbound SMS at `/reminder-sms-reply` |
| 2 | Normalize SMS | Code | Extract From, To, Body, MessageSid |
| 3 | Detect Intent | Code | `CONFIRM` → confirm; `CANCEL` variants → cancel; other → other |
| 4 | Has Action? | IF | Stop if intent = 'other' |
| 5 | Lookup Appointment | HTTP GET | Most recent active appointment where `mobile = From` |
| 6 | Extract Appointment | Code | Handle array response, validate, stop if no appointment found |
| 7 | Fetch Client Config | HTTP GET | `clients` — name, owner_phone, timezone |
| 8 | Fetch Twilio Number | HTTP GET | `phone_number_map` — FROM number for reply |
| 9 | Build Reply Context | Code | Compose ack SMS (CONFIRM or CANCEL wording), owner alert |
| 10 | Send Acknowledgement SMS | HTTP POST | Twilio — reply to patient |
| 11 | Is Cancel? | IF | Branch on intent |
| 12 | Cancel Appointment | HTTP PATCH | `appointments SET status='cancelled'` |
| 13 | Cancel Pending Reminders | HTTP PATCH | `appointment_reminders SET reminder_status='cancelled'` for pending/scheduled rows |
| 14 | Alert Clinic Owner | HTTP POST | Twilio SMS to `clients.owner_phone` |

### SMS Routing Note

The Reminder Reply Handler uses a **separate webhook path** (`/reminder-sms-reply`) from the existing missed-call SMS Reply Handler (`/sms-reply`). In Twilio, set the inbound SMS webhook URL for the clinic's number to the Reminder Reply Handler URL. If the same number also needs to handle missed-call CALL intent (for CustomerReach Respond), consolidate both into one router workflow (Phase 2 enhancement).

### Key n8n Build Notes

- Both workflows use the **Supabase service role key** — reminder rows are only writable via service role (RLS bypassed for writes).
- Twilio `From` number is resolved from `phone_number_map` by `client_id` — fully config-driven, no hardcoding.
- Batch processing: the scheduler queries up to 50 due reminders per run. At 15-minute intervals, this handles high-volume clinics comfortably.
- Failed reminders surface in the dashboard via `reminder_status='failed'` and `failure_reason` — staff can see what failed and why.

---

## 3. SMS Templates

### 48-Hour Reminder

```
Hi [PatientName], a reminder that you have an appointment at [ClinicName]
on [DayName] [Date] at [Time].

Reply CONFIRM to confirm or CANCEL to cancel.

– [ClinicName] Team
```

### 2-Hour Reminder

```
Hi [PatientName], just a reminder — your appointment at [ClinicName]
is today at [Time].

We'll see you soon. Reply CANCEL if you can no longer make it.

– [ClinicName] Team
```

### Confirmation Acknowledgement

```
Thanks [PatientName], your appointment on [DayName] at [Time] is confirmed.
See you then!

– [ClinicName] Team
```

### Cancellation Acknowledgement

```
Hi [PatientName], your appointment on [DayName] at [Time] has been cancelled.
Please call us to rebook.

– [ClinicName] Team
```

### Clinic Owner Alert (cancellation)

```
[PatientName] cancelled their [Time] appointment on [DayName].
Slot is now available.
```

---

## 4. Supabase Schema

Schema created in **migration 012** — `supabase/migrations/012_add_appointment_reminders.sql`.
`patient_surname` column added in **migration 014** — `supabase/migrations/014_add_patient_surname.sql`.

### `appointments` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | Auto-generated |
| `client_id` | TEXT | FK → clients, drives RLS |
| `patient_name` | TEXT | Required |
| `patient_surname` | TEXT | Optional — added migration 014 |
| `mobile` | TEXT | E.164 format — Twilio `To` |
| `email` | TEXT | Optional — for future email channel |
| `appointment_datetime` | TIMESTAMPTZ | Required — used to compute `scheduled_for` |
| `notes` | TEXT | Optional staff notes |
| `status` | TEXT | active / cancelled / completed |
| `created_by` | TEXT | 'staff' or auth user id |

### `appointment_reminders` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | Auto-generated |
| `appointment_id` | UUID (FK) | Cascades delete with parent appointment |
| `client_id` | TEXT | Denormalised for RLS performance |
| `reminder_type` | TEXT | 48h / 2h |
| `reminder_channel` | TEXT | sms / email / both (default: sms) |
| `scheduled_for` | TIMESTAMPTZ | Computed: appointment_datetime - offset |
| `reminder_status` | TEXT | pending → scheduled → sent / failed / cancelled |
| `sent_at` | TIMESTAMPTZ | Written when SMS confirmed sent |
| `failure_reason` | TEXT | Written on Twilio error |

### RLS Summary

| Actor | Table | Access |
|-------|-------|--------|
| Staff (anon key) | `appointments` | SELECT, INSERT, UPDATE (own client only) |
| Staff (anon key) | `appointment_reminders` | SELECT, INSERT (own client only) |
| n8n (service role) | Both | Full access — bypasses RLS |

### Capability Key

```sql
-- Enable CustomerReach Remind for a client
INSERT INTO client_subscriptions (client_id, capability)
VALUES ('<client-slug>', 'appointment_reminder')
ON CONFLICT (client_id, capability) DO NOTHING;
```

---

## 5. Enabling for a Client

Use this when a client upgrades to Growth tier and CustomerReach Remind needs to be activated.

### Step 1 — Apply migrations to production

Apply migrations 012–014 if not already applied. Via Supabase SQL editor or MCP:

```sql
-- Run the contents of these files in order:
-- supabase/migrations/012_add_appointment_reminders.sql
-- supabase/migrations/013_add_invitations.sql
-- supabase/migrations/014_add_patient_surname.sql
```

### Step 2 — Enable the capability

```sql
INSERT INTO client_subscriptions (client_id, capability)
VALUES ('your-client-id', 'appointment_reminder')
ON CONFLICT (client_id, capability) DO NOTHING;
```

### Step 3 — Verify dashboard access

The Appointments section of the client's dashboard is visible once the subscription is active. Staff can add appointments immediately.

### Step 4 — Deploy the Reminder Scheduler workflow

```
1. Open n8n → Import workflow → appointment-reminders/n8n/workflow-reminder-scheduler.json
2. Replace <SUPABASE_URL> with real Supabase URL
3. Replace <SUPABASE_SERVICE_KEY> with real service role key
4. Save → Validate → Activate
```

### Step 5 — Deploy the Reminder Reply Handler workflow

```
1. Open n8n → Import workflow → appointment-reminders/n8n/workflow-reminder-reply.json
2. Replace <SUPABASE_URL> and <SUPABASE_SERVICE_KEY> placeholders
3. Save → Copy webhook URL (path: /reminder-sms-reply)
4. In Twilio → Phone Numbers → set Messaging webhook URL to this n8n URL
5. Activate workflow
```

### Step 6 — Verify end-to-end

Add a test appointment 3 minutes in the future.
Confirm:
- [ ] `appointment_reminders` rows inserted (48h + 2h) — 48h has past `scheduled_for`, 2h has future
- [ ] Wait for scheduler to fire — 2h reminder fires when `scheduled_for <= now()`
- [ ] SMS received on test mobile
- [ ] `reminder_status` updated to `sent` in Supabase
- [ ] Reminder badge shows 'Sent' in dashboard
- [ ] Reply CANCEL — cancellation ack received, appointment status updated

---

## 6. Dashboard

The dashboard Appointments page (`/reminders` route) is **fully implemented**:

- Staff can create, edit, and cancel appointments
- Patient name (first + last), mobile, email, appointment datetime, notes, and reminder channel are all captured
- Each appointment row shows 48h and 2h reminder status badges (pending / scheduled / sent / failed / cancelled)
- Failed reminders highlighted so staff can see what needs attention
- Active/cancelled/all filter tabs
- Upcoming/past date range filter

**No dashboard changes are required.** The UI is live and connected to real data via `appointmentService.ts`.

---

## 7. Pricing & Tier

| Tier | Capabilities | Price |
|------|-------------|-------|
| Starter | Respond only | $199/mo |
| Core | Respond + Answer + Dashboard | $499/mo |
| **Growth** | **Core + Remind + Review** | **$799/mo** |
| Practice | Growth + Recall + Multi-location | $1,299/mo |

CustomerReach Remind is sold as part of the **Growth tier**. It is not available as a standalone add-on (it requires the Core infrastructure — Twilio, Supabase, dashboard).

**Upsell conversation:** Remind is the most natural upsell after a client has been on Core for 4–8 weeks and is comfortable with the platform. Position it as filling the gap between "recovering missed calls" and "making sure booked appointments happen."

---

## 8. Build Status

| Component | Status | Notes |
|-----------|--------|-------|
| `appointments` table (migration 012) | **LIVE** | Applied to production |
| `appointment_reminders` table (migration 012) | **LIVE** | Applied to production |
| `patient_surname` column (migration 014) | **LIVE** | Applied to production |
| RLS policies | **LIVE** | Applied to production |
| `appointmentService.ts` | **DONE** | Create, update, cancel, delete, list with reminders joined |
| TypeScript types | **DONE** | Appointment, AppointmentReminder, ReminderStatus, etc. |
| Dashboard Appointments page | **DONE** | `/reminders` route — full CRUD + reminder status badges |
| n8n Reminder Scheduler | **ACTIVE** | Workflow ID: `wN3cyY7o0kJhk9DS` — polls every 15 min |
| n8n Reminder Reply Handler | **ACTIVE** | Workflow ID: `inmiGyHTCEP3a2hd` — webhook path: `/reminder-sms-reply` |
| Twilio inbound webhook | **PENDING** | Set each client's number to: `https://bizelevate1.app.n8n.cloud/webhook/reminder-sms-reply` |
| End-to-end test | **PENDING** | Add test appointment, verify SMS fires, test CANCEL reply |

---

## 9. Integration with Other Capabilities

| Capability | Integration Point |
|------------|-----------------|
| CustomerReach Answer | Casey collects appointment requests — in Phase 2, intake can auto-create an appointment row (currently manual entry by staff) |
| CustomerReach Respond | No direct integration — Respond handles missed calls before booking, Remind handles after booking |
| CustomerReach Review | Remind's `completed` appointment status can trigger a review request — natural hand-off |

---

## Change Log

| Version | Date | Change |
|---------|------|--------|
| 0.1 | 2026-03-16 | Initial playbook. Schema complete (migration 012). n8n workflow and dashboard not yet built. |
| 0.2 | 2026-03-18 | Migration 014 (patient_surname). n8n Reminder Scheduler and Reply Handler workflows built. Dashboard and service layer confirmed complete. |
| 0.3 | 2026-03-19 | Full deployment. All schema confirmed live in production. Scheduler (wN3cyY7o0kJhk9DS) and Reply Handler (inmiGyHTCEP3a2hd) deployed and ACTIVE in n8n. Pending: Twilio webhook config + end-to-end test. |

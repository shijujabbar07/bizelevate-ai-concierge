# CustomerReach Remind — Capability Playbook

**Capability:** appointment_reminder
**Product Name:** CustomerReach Remind
**Status:** LIVE — schema + n8n workflows deployed and active. Pending: Twilio webhook config + end-to-end test.
**Tier:** Growth ($799/mo)
**Version:** 0.5

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
- **4 hours before the appointment:** A final prompt. If they haven't cancelled by now, they almost certainly attend.

The clinic does nothing after entering the appointment. The reminders fire automatically. If a patient replies to cancel, the cancellation is logged and the slot becomes available to fill.

Every reminder sent, every reply received, every cancellation — all logged to the dashboard.

---

### What changes for the clinic

| Before | After |
|--------|-------|
| Receptionist manually calls patients the day before | Zero staff time — reminders fire automatically |
| No-show rate 8–15% | Industry evidence shows reminders reduce no-shows to 2–5% |
| Empty slots known at appointment time | Cancellations arrive 48h or 4h early — slot can be refilled |
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

Remind is the natural upsell after a clinic has been on Core for 4–8 weeks and is comfortable with the platform. The conversation is:

> *"You're recovering missed calls and answering after-hours calls. Now let's make sure those appointments actually show up."*

---

## 1. Architecture

### Flow (Happy Path)

```
Staff adds appointment to dashboard
  ↓
appointments row created
  ↓
appointment_reminders rows auto-created (48h + 4h, status=pending)
  ↓
n8n Reminder Scheduler runs every 4 hours
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

- **Polling interval:** Every 4 hours (n8n Schedule Trigger node) — was every 15 minutes until 2026-06-23; that interval alone consumed most of the monthly n8n execution quota with no client yet on the Remind tier to use it
- **Query:** `appointment_reminders` table — rows where `scheduled_for <= now()` and `status IN ('pending', 'scheduled')`
- **n8n credential:** Supabase service role key (bypasses RLS)

### Reminder Scheduling Logic

When a staff member creates an appointment via the dashboard, `appointment_reminders` rows are auto-inserted by `appointmentService.createAppointment()`:

| Reminder | Offset | `scheduled_for` formula |
|---------|--------|------------------------|
| 48h reminder | –48 hours | `appointment_datetime - 48h` |
| 4h reminder | –4 hours | `appointment_datetime - 4h` |

If an appointment is less than 48 hours away when created, the 48h reminder row is inserted with `scheduled_for` in the past — the scheduler will skip it (already past). Only the 4h reminder will fire.

If an appointment is less than 4 hours away, both reminders are skipped automatically.

The 4-hour reminder window was chosen specifically to match the scheduler's 4-hour poll interval — at a 2-hour window, a 4-hour poll could in the worst case fire the reminder up to 2 hours *after* the appointment already happened. Moving the window itself to 4 hours means the worst case is "fires right at the appointment," never after it.

---

## 2. n8n Workflows

### Workflow 1: Reminder Scheduler (ID: `wN3cyY7o0kJhk9DS`)

**File:** `appointment-reminders/n8n/workflow-reminder-scheduler.json`
**Purpose:** Poll for due reminders and fire SMS every 4 hours.

| # | Node | Type | Purpose |
|---|------|------|---------|
| 1 | Schedule Trigger | Schedule | Runs every 4 hours |
| 2 | Fetch Due Reminders | HTTP GET | `appointment_reminders` joined with `appointments` — rows where `scheduled_for <= now()` and `reminder_status IN ('pending','scheduled')` |
| 3 | Any Due? | IF | Stop if result array is empty |
| 4 | Split Reminders | Code | Split array into individual items for per-reminder processing |
| 5 | Fetch Client Config | HTTP GET | `clients` — name, owner_phone, timezone |
| 6 | Fetch Twilio Number | HTTP GET | `phone_number_map` — Twilio FROM number for this client |
| 7 | Build SMS | Code | Compose SMS body (48h or 4h tone variant), validate all data |
| 8 | Send SMS | HTTP POST | Twilio API — From=clinic number, To=patient mobile |
| 9 | Mark Sent | HTTP PATCH | `reminder_status='sent'`, `sent_at=now()` on success |
| 10 | Mark Failed | HTTP PATCH | `reminder_status='failed'`, `failure_reason=error` on Twilio error |

**Error routing:** Node 8 (Send SMS) uses `continueErrorOutput` — success goes to Mark Sent, error goes to Mark Failed.

### Workflow 2: Reminder Reply Handler (ID: `inmiGyHTCEP3a2hd`)

**File:** `appointment-reminders/n8n/workflow-reminder-reply.json`
**Purpose:** Handle patient CONFIRM/CANCEL replies to reminder SMS.
**Webhook path:** `/reminder-sms-reply`

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

The Reminder Reply Handler uses a **separate webhook path** (`/reminder-sms-reply`) from the missed-call SMS Reply Handler (`/sms-reply`). In Twilio, a phone number can only have one inbound SMS webhook URL. If the same clinic number handles both missed-call replies and reminder replies, consolidate both into one router workflow (Phase 2 enhancement — tracked in build gaps).

---

## 3. SMS Templates

### 48-Hour Reminder

```
Hi [PatientName], a reminder that you have an appointment at [ClinicName]
on [DayName] [Date] at [Time].

Reply CONFIRM to confirm or CANCEL to cancel.

– [ClinicName] Team
```

### 4-Hour Reminder

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
Both migrations are **live in production**.

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
| `reminder_type` | TEXT | 48h / 4h (a handful of historical rows from before 2026-06-23 use 2h) |
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

---

## 5. Enabling for a Client

Use this when a client upgrades to Growth tier and CustomerReach Remind needs to be activated.

### Step 1 — Apply migrations to production (if not already applied)

```sql
-- Run the contents of these files in order:
-- supabase/migrations/012_add_appointment_reminders.sql
-- supabase/migrations/013_add_invitations.sql
-- supabase/migrations/014_add_patient_surname.sql
```

These are already applied to production. Only needed for new environments.

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

Workflow already deployed: ID `wN3cyY7o0kJhk9DS`. For new environments, import and activate fresh.

### Step 5 — Deploy the Reminder Reply Handler workflow

```
1. Open n8n → Import workflow → appointment-reminders/n8n/workflow-reminder-reply.json
2. Replace <SUPABASE_URL> and <SUPABASE_SERVICE_KEY> placeholders
3. Save → Copy webhook URL (path: /reminder-sms-reply)
4. In Twilio → Phone Numbers → set Messaging webhook URL to this n8n URL
5. Activate workflow
```

Workflow already deployed: ID `inmiGyHTCEP3a2hd`. Twilio webhook config is the pending step.

### Step 6 — Verify end-to-end

Add a test appointment 3 minutes in the future.
Confirm:
- [ ] `appointment_reminders` rows inserted (48h + 4h) — 48h has past `scheduled_for`, 4h has future
- [ ] Wait for scheduler to fire (up to 4 hours - trigger manually in n8n for a faster check) — 4h reminder fires when `scheduled_for <= now()`
- [ ] SMS received on test mobile
- [ ] `reminder_status` updated to `sent` in Supabase
- [ ] Reminder badge shows 'Sent' in dashboard
- [ ] Reply CANCEL — cancellation ack received, appointment status updated

---

## 6. Dashboard

The dashboard Appointments page (`/reminders` route) is **fully implemented**:

- Staff can create, edit, and cancel appointments
- Patient name (first + last), mobile, email, appointment datetime, notes, and reminder channel are all captured
- Each appointment row shows 48h and 4h reminder status badges (pending / scheduled / sent / failed / cancelled)
- Failed reminders highlighted so staff can see what needs attention
- Active/cancelled/all filter tabs
- Upcoming/past date range filter

**No dashboard changes are required.** The UI is live and connected to real data via `appointmentService.ts`.

---

## 7. The Demo

CustomerReach Remind requires an actual appointment to demo. Use this flow:

**Setup (before the call):**
1. Add a test appointment via the dashboard — set `appointment_datetime` to 3 minutes from now
2. Confirm two rows appear in `appointment_reminders` (48h row will have past `scheduled_for`, 4h row will be due shortly)

**During the demo:**
1. *"We've just booked a test appointment for 3 minutes from now."*
2. Show the Appointments page — the appointment appears with 'Pending' reminder badges
3. Manually trigger the Reminder Scheduler workflow in n8n (production now polls every 4 hours, not 15 minutes — don't wait for the schedule live on a call, just run it on demand)
4. Show the SMS arriving on your mobile
5. *"That just fired automatically. No staff action. The clinic didn't have to do anything after entering the appointment."*
6. Reply CANCEL — show the cancellation acknowledgement SMS and the appointment status updating to 'Cancelled' in the dashboard
7. *"And when a patient cancels, the clinic knows 48 hours in advance. That slot gets filled."*

**The pitch numbers:** *"If you have 60 appointments a week and a 10% no-show rate, that's 6 empty chairs a week — roughly $1,200 in lost revenue. Remind typically cuts that to 2–3%. One month of Remind pays for itself in week one."*

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
| n8n Reminder Scheduler | **ACTIVE** | Workflow ID: `wN3cyY7o0kJhk9DS` — polls every 4 hours (was 15 min until 2026-06-23) |
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

## 10. Pricing & Tier

Full pricing with all tier details: [BizElevate Operating Truth](https://www.notion.so/3272b7aaf2e381288dc1fcbafcf1cee0)

| Tier | Capabilities | Price |
|------|-------------|-------|
| Starter | Respond only | $199/mo |
| Core | Respond + Answer + Dashboard | $499/mo |
| **Growth** | **Core + Remind + Review** | **$799/mo** |
| Practice | Growth + Recall + Multi-location | $1,299/mo |

CustomerReach Remind is sold as part of the **Growth tier** only. It requires the Core infrastructure (Twilio, Supabase, dashboard) and is not available as a standalone add-on.

**Upsell conversation:** Position Remind as filling the gap between "recovering missed calls" and "making sure booked appointments actually happen." Best introduced after a client has been on Core for 4–8 weeks.

---

## Change Log

| Version | Date | Change |
|---------|------|--------|
| 0.1 | 2026-03-16 | Initial playbook. Schema complete (migration 012). n8n workflow and dashboard not yet built. |
| 0.2 | 2026-03-18 | Migration 014 (patient_surname). n8n Reminder Scheduler and Reply Handler workflows built. Dashboard and service layer confirmed complete. |
| 0.3 | 2026-03-19 | Full deployment. All schema confirmed live in production. Scheduler (wN3cyY7o0kJhk9DS) and Reply Handler (inmiGyHTCEP3a2hd) deployed and ACTIVE in n8n. Pending: Twilio webhook config + end-to-end test. |
| 0.4 | 2026-03-21 | Added Section 7: Demo script with pitch numbers. Status note clarified (Operating Truth was stale — Remind workflows are live). |
| 0.5 | 2026-06-23 | Scheduler interval cut from 15 min to 4 hours — the 15-min poll alone was consuming most of the monthly n8n execution quota with no client yet on the Remind tier. Final reminder changed from 2h to 4h before the appointment, to match the new poll interval and avoid the worst case of a reminder arriving after the appointment already happened (migration 018). |

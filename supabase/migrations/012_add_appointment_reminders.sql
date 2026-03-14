-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 012 — Appointment Reminders (CustomerReach Remind)
--
-- Two tables:
--   appointments           — one row per appointment, staff-managed via dashboard
--   appointment_reminders  — one row per reminder event (48h + 2h), system-generated
--
-- The n8n Reminder Scheduler workflow queries appointment_reminders for due rows.
-- Staff interact with appointments only — reminders are created automatically.
--
-- Capability key: 'appointment_reminder'
-- Enable per client: INSERT INTO client_subscriptions (client_id, capability)
--                    VALUES ('<slug>', 'appointment_reminder');
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. appointments ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS appointments (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id            TEXT        NOT NULL,
  patient_name         TEXT        NOT NULL,
  mobile               TEXT        NOT NULL,
  email                TEXT,
  appointment_datetime TIMESTAMPTZ NOT NULL,
  notes                TEXT,
  -- 'active' | 'cancelled' | 'completed'
  status               TEXT        NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active', 'cancelled', 'completed')),
  -- who created the record: 'staff' or auth user id for future attribution
  created_by           TEXT        NOT NULL DEFAULT 'staff',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Primary query pattern: tenant appointments ordered by upcoming datetime
CREATE INDEX IF NOT EXISTS appointments_client_datetime_idx
  ON appointments (client_id, appointment_datetime DESC);

-- ─── 2. appointment_reminders ─────────────────────────────────────────────────
-- One row per reminder event. createAppointment() auto-inserts a '48h' and '2h'
-- row for each new appointment. The n8n scheduler drives status transitions.

CREATE TABLE IF NOT EXISTS appointment_reminders (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id   UUID        NOT NULL REFERENCES appointments (id) ON DELETE CASCADE,
  -- Denormalised for RLS performance — avoids JOIN on every policy check
  client_id        TEXT        NOT NULL,
  -- '48h' | '2h'
  reminder_type    TEXT        NOT NULL CHECK (reminder_type IN ('48h', '2h')),
  -- 'sms' | 'email' | 'both'
  reminder_channel TEXT        NOT NULL DEFAULT 'sms'
                     CHECK (reminder_channel IN ('sms', 'email', 'both')),
  -- When this reminder should fire. Computed on insert: appointment_datetime - offset.
  scheduled_for    TIMESTAMPTZ NOT NULL,
  -- Lifecycle: pending → scheduled → sent | failed | cancelled
  reminder_status  TEXT        NOT NULL DEFAULT 'pending'
                     CHECK (reminder_status IN ('pending', 'scheduled', 'sent', 'failed', 'cancelled')),
  sent_at          TIMESTAMPTZ,
  failure_reason   TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scheduler index — efficient lookup of due reminders
-- Partial: only indexes actionable rows, not terminal states
CREATE INDEX IF NOT EXISTS appt_reminders_due_idx
  ON appointment_reminders (client_id, scheduled_for)
  WHERE reminder_status IN ('pending', 'scheduled');

-- FK lookup — used when cancelling reminders by appointment
CREATE INDEX IF NOT EXISTS appt_reminders_appointment_idx
  ON appointment_reminders (appointment_id);

-- ─── 3. updated_at triggers ──────────────────────────────────────────────────
-- set_updated_at() was first created in migration 011 (chat_leads).
-- Using CREATE OR REPLACE here so this migration is safe to run standalone.

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER appointment_reminders_updated_at
  BEFORE UPDATE ON appointment_reminders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── 4. Row-Level Security ────────────────────────────────────────────────────
-- Pattern: staff (anon key) read/write own client only.
-- n8n scheduler uses service role — bypasses RLS entirely.

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_reminders ENABLE ROW LEVEL SECURITY;

-- Staff: read own client's appointments
CREATE POLICY "Staff can select own appointments"
  ON appointments FOR SELECT
  USING (
    client_id = (
      SELECT client_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- Staff: create appointments for own client only
CREATE POLICY "Staff can insert own appointments"
  ON appointments FOR INSERT
  WITH CHECK (
    client_id = (
      SELECT client_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- Staff: update own appointments (status changes: cancel, complete)
CREATE POLICY "Staff can update own appointments"
  ON appointments FOR UPDATE
  USING (
    client_id = (
      SELECT client_id FROM user_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    client_id = (
      SELECT client_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- Staff: read reminder rows (write is service-role only — n8n scheduler)
CREATE POLICY "Staff can select own reminders"
  ON appointment_reminders FOR SELECT
  USING (
    client_id = (
      SELECT client_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- Staff can insert reminder rows (needed for createAppointment via anon key)
CREATE POLICY "Staff can insert own reminders"
  ON appointment_reminders FOR INSERT
  WITH CHECK (
    client_id = (
      SELECT client_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- Migration: 018_rename_2h_reminder_to_4h
-- Project:   bizelevate-concierge
-- Purpose:   Change the final appointment reminder from 2 hours before to
--            4 hours before. The n8n Reminder Scheduler's poll interval was
--            cut from 15 minutes to 4 hours (cost reduction - it was polling
--            every 15 min with no paying client on the Remind tier yet,
--            consuming most of the monthly n8n execution quota for no
--            output). At a 2-hour reminder window, a 4-hour poll interval
--            could in the worst case fire the reminder up to 2 hours AFTER
--            the appointment already happened. Moving the window itself to
--            4 hours eliminates that risk structurally - worst case becomes
--            "fires right at the appointment", never after it.
-- Depends:   012_add_appointment_reminders

ALTER TABLE appointment_reminders
  DROP CONSTRAINT appointment_reminders_reminder_type_check;

-- '2h' is kept in the allowed set (NOT VALID, not re-validated against
-- existing rows) purely so the one historical sent/completed '2h' row from
-- before this change remains valid - it's no longer used for new reminders.
ALTER TABLE appointment_reminders
  ADD CONSTRAINT appointment_reminders_reminder_type_check
  CHECK (reminder_type IN ('48h', '4h', '2h')) NOT VALID;

COMMENT ON COLUMN appointment_reminders.reminder_type IS
  '48h or 4h before the appointment for new rows. A handful of historical
   rows from before 2026-06-23 use 2h (kept in the allowed set so old
   sent/completed records remain valid - 2h is no longer used for new
   reminders).';

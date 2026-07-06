-- Migration: 019_add_final_reminder_type
-- Project:   bizelevate-concierge
-- Purpose:   Replace the flat 48h/4h offset reminder model with a hybrid
--            batch-based model, to keep n8n execution count flat regardless
--            of appointment volume:
--              - '48h' (unchanged): early "slot-refill" reminder, only
--                created when lead time at booking is >= 7 days. Snapped to
--                the daily batch time at/before the 48h-before mark.
--              - 'final' (new, replaces '4h' for new rows): created for
--                every appointment. Fires at the evening batch the night
--                before, or the morning batch same-day if booked same-day
--                before the morning batch has passed. Renamed from '4h'
--                because it is no longer ~4 hours before the appointment -
--                it can now be anywhere from ~1 to ~30 hours before, so
--                calling it "4h" going forward would misdescribe the timing.
--            The n8n Schedule Trigger moves from a 4-hour poll interval to
--            two fixed daily times (07:00 / 18:00 Australia/Sydney) to
--            match - n8n's Starter plan charges one execution per trigger
--            fire regardless of items processed, so fixed daily batches
--            keep execution count flat as client/appointment volume grows,
--            instead of scaling with poll frequency.
-- Depends:   018_rename_2h_reminder_to_4h

ALTER TABLE appointment_reminders
  DROP CONSTRAINT appointment_reminders_reminder_type_check;

-- '4h' and '2h' are both kept in the allowed set (NOT VALID, not
-- re-validated against existing rows) purely so historical sent/completed
-- rows from before this change remain valid. Neither is used for new rows
-- as of this migration - new final reminders use 'final'.
ALTER TABLE appointment_reminders
  ADD CONSTRAINT appointment_reminders_reminder_type_check
  CHECK (reminder_type IN ('48h', 'final', '4h', '2h')) NOT VALID;

COMMENT ON COLUMN appointment_reminders.reminder_type IS
  '48h (early slot-refill reminder, only for appointments booked >= 7 days
   out, snapped to the daily batch time at/before 48h-before-appointment)
   or final (batch-timed final reminder: evening before, or morning-of for
   same-day bookings) for new rows as of 2026-06-24. Historical rows from
   before this date may use 4h or 2h - both kept in the allowed set so old
   sent/completed records remain valid. Neither 4h nor 2h is used for new
   reminders.';

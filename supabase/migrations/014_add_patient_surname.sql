-- Migration: 014_add_patient_surname
-- Project:   bizelevate-concierge
-- Purpose:   Adds patient_surname column to appointments.
--            The column is referenced in appointmentService.ts and the Appointment type
--            but was omitted from migration 012. Safe to run on existing data — nullable.
-- Depends:   012_add_appointment_reminders

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS patient_surname TEXT;

COMMENT ON COLUMN appointments.patient_surname IS
  'Optional family name. Combined with patient_name for full-name display in dashboard and SMS templates.';

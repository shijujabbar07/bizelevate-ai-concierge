-- Migration: 017_add_answer_flags
-- Project:   bizelevate-concierge
-- Purpose:   Add per-client feature flags for CustomerReach Answer post-call actions.
--            Controls whether n8n sends a reception alert SMS and/or a booking link SMS
--            after every Answer call. Separates reception alert destination from owner_phone
--            so clinics can route patient enquiries to the front desk independently.
-- Depends:   007_extend_clients

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS reception_alert_enabled  boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS reception_alert_number   text,
  ADD COLUMN IF NOT EXISTS online_booking_enabled   boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN clients.reception_alert_enabled IS
  'When true, n8n sends an SMS to reception_alert_number (or owner_phone fallback) after every
   CustomerReach Answer call. Provides real-time notification to front desk. Default: true.';

COMMENT ON COLUMN clients.reception_alert_number IS
  'Mobile number for front-desk/reception SMS alerts from Answer calls. Separate from owner_phone
   so owner and reception can receive different notifications. Falls back to owner_phone if null.';

COMMENT ON COLUMN clients.online_booking_enabled IS
  'When true, n8n sends a booking link SMS to the patient when Casey detects booking_intent.
   Requires booking_link to be non-null. If false or booking_link is null, falls back to
   callback confirmation SMS regardless of detected intent. Default: false.';

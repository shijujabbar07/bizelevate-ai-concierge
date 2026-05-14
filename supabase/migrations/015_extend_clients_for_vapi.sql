-- Migration: 015_extend_clients_for_vapi
-- Project:   bizelevate-concierge
-- Purpose:   Adds agent_name and voice_id to clients table so VAPI assistant
--            config can be hydrated dynamically per clinic at call time.
--            Enables Phase 7: one VAPI assistant template, N clinics, zero
--            per-client VAPI work after onboarding.
-- Depends:   001_initial_schema

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS agent_name TEXT NOT NULL DEFAULT 'Casey',
  ADD COLUMN IF NOT EXISTS voice_id   TEXT NOT NULL DEFAULT '21m00Tcm4TlvDq8ikWAM';

COMMENT ON COLUMN clients.agent_name IS
  'First name the AI agent uses when greeting callers (e.g. Casey, Riley, Jordan). '
  'Per-clinic so two clients can run different agent identities on shared infrastructure.';

COMMENT ON COLUMN clients.voice_id IS
  'ElevenLabs voice ID used for this clinic''s assistant. '
  'Lets each clinic choose male/female/accent without infrastructure changes. '
  'Default: 21m00Tcm4TlvDq8ikWAM (ElevenLabs Rachel).';

-- Backfill existing clients with sensible defaults
UPDATE clients SET agent_name = 'Casey', voice_id = '21m00Tcm4TlvDq8ikWAM'
WHERE agent_name = 'Casey'; -- no-op but explicit for audit trail

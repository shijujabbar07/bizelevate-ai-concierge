-- Seed: 002_client_config
-- Project: bizelevate-concierge
-- Purpose: Populate new config columns on demo client (from migration 007)
--          and insert phone_number_map rows (from migration 008).
--          Enables config-driven workflows — replaces hardcoded client_id and SMS templates.
-- Depends: 001_demo_client, migrations 007 and 008

-- ── 1. Extend demo client with config fields ──────────────────────────────────

-- owner_phone:     Demo number for owner/front-desk SMS alerts.
--                  Replace with real mobile before onboarding a live client.
-- owner_channel:   'sms' — default. Switch to 'whatsapp' per-client when needed.
-- timezone:        Australia/Sydney — correct for Sydney/Melbourne/Canberra/Brisbane (AEST/AEDT).
-- booking_link:    Demo Calendly placeholder. Replace with real URL per client.
-- business_hours:  Mon–Fri 8:00am–6:00pm AEST.
--                  days: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri (matches JS Date.getDay()).

update clients
set
  owner_phone    = '+61400000001',
  owner_channel  = 'sms',
  timezone       = 'Australia/Sydney',
  booking_link   = 'https://calendly.com/smile-dental-campsie',
  business_hours = '{"start": 8, "end": 18, "days": [1, 2, 3, 4, 5]}'::jsonb
where id = 'smile-dental';

-- ── 2. Map Twilio numbers to client + capability ──────────────────────────────

-- +61485034338 → CustomerReach Respond (missed call SMS recovery)
-- +61485004338 → CustomerReach Answer (VAPI AI answering, appointment intake)
--
-- These are the live demo numbers. The `To` field in every Twilio webhook will match
-- one of these numbers. The workflow looks this row up to get client_id dynamically
-- — no hardcoding required.

insert into phone_number_map (phone_number, client_id, capability)
values
  ('+61485034338', 'smile-dental', 'missed_call'),
  ('+61485004338', 'smile-dental', 'appointment_concierge');

-- ── 3. Insert missed_call subscription (Respond capability) ──────────────────

-- The existing seed (001) only inserted appointment_concierge.
-- Add missed_call subscription so both capabilities are reflected in the dashboard.
-- ON CONFLICT guard prevents duplicate if this seed is re-run.

insert into client_subscriptions (client_id, capability)
values ('smile-dental', 'missed_call')
on conflict (client_id, capability) do nothing;

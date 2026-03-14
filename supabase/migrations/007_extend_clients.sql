-- Migration: 007_extend_clients
-- Project:   bizelevate-concierge
-- Purpose:   Add client config fields needed for config-driven workflows
--            and multi-client operation. Replaces hardcoded values in n8n workflows.
-- Depends:   001_create_clients

-- owner_phone:     Mobile number for owner/front-desk SMS alerts (e.g. missed call, emergency)
-- owner_channel:   Delivery channel for owner alerts. 'sms' | 'whatsapp'. Defaults to SMS.
-- timezone:        IANA timezone string. Used by business hours detection in workflows.
-- booking_link:    Optional Calendly (or equivalent) URL included in recovery SMS body.
--                  If null, SMS falls back to callback-request wording.
-- business_hours:  JSON object controlling after-hours detection in n8n.
--                  Shape: { "start": 8, "end": 18, "days": [1,2,3,4,5] }
--                  days: 0=Sun, 1=Mon … 6=Sat. Matches JavaScript Date.getDay() convention.

alter table clients
  add column owner_phone     text,
  add column owner_channel   text not null default 'sms',
  add column timezone        text not null default 'Australia/Sydney',
  add column booking_link    text,
  add column business_hours  jsonb;

comment on column clients.owner_phone is
  'Owner or front-desk mobile for real-time SMS/WhatsApp alerts from workflows.';

comment on column clients.owner_channel is
  'Delivery channel for owner alerts. sms (default) or whatsapp.';

comment on column clients.timezone is
  'IANA timezone string used for business hours calculation. Default: Australia/Sydney.';

comment on column clients.booking_link is
  'Optional booking URL (e.g. Calendly). Included in missed-call SMS when present.';

comment on column clients.business_hours is
  'Business hours config for workflows. Shape: { "start": 8, "end": 18, "days": [1,2,3,4,5] }';

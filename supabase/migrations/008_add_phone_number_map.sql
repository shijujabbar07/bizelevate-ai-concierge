-- Migration: 008_add_phone_number_map
-- Project:   bizelevate-concierge
-- Purpose:   Map Twilio numbers to client_id + capability so that n8n workflows
--            can resolve client context dynamically from the inbound Twilio `To` field.
--            This replaces the hardcoded client_id in both Respond and Answer workflows.
-- Depends:   001_create_clients

-- How it works in a workflow:
--   1. Twilio fires webhook with `To` = the Twilio number the caller dialled
--   2. Workflow does: GET /phone_number_map?phone_number=eq.{To}
--   3. Returns client_id + capability — no hardcoding required
--   4. Workflow then fetches client config: GET /clients?id=eq.{client_id}

create table phone_number_map (
  phone_number   text primary key,           -- Twilio number, E.164 format e.g. '+61485034338'
  client_id      text not null references clients(id),
  capability     text not null,              -- 'missed_call' | 'appointment_concierge'
  created_at     timestamptz default now()
);

comment on table phone_number_map is
  'Maps Twilio phone numbers to a client and capability. Used by n8n workflows to replace hardcoded client_id.';

comment on column phone_number_map.phone_number is
  'E.164 format Twilio number. Must match the To field in Twilio webhook payloads exactly.';

comment on column phone_number_map.capability is
  'Which capability this number serves: missed_call or appointment_concierge.';

-- Index for direct lookup by client (useful for admin queries and RLS)
create index on phone_number_map (client_id);

-- RLS: enable but restrict to own client. Workflows use service role (bypasses RLS).
-- Dashboard staff do not normally need to query this table, but the policy is
-- correct if they ever do (e.g. a future settings page showing provisioned numbers).
alter table phone_number_map enable row level security;

create policy "phone_number_map: select own client"
  on phone_number_map for select
  using (
    client_id = (
      select client_id from user_profiles where user_id = auth.uid()
    )
  );

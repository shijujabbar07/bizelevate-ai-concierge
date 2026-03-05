-- Migration: 003_create_call_logs
-- Project:   bizelevate-concierge
-- Purpose:   Multi-capability audit log — written by n8n on every processed call
-- Depends:   001_create_clients

create table call_logs (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  capability         text not null,
  client_id          text not null,
  call_id            text,
  patient_name       text,
  patient_phone      text,
  requested_datetime text,
  reason             text,
  urgency            text,
  sms_sent           boolean default false,
  call_status        text,
  raw_transcript     text,
  notes              text
);

create index on call_logs (client_id, created_at desc);
create index on call_logs (client_id, capability);

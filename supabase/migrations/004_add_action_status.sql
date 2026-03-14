-- Migration: 004_add_action_status
-- Project:   bizelevate-concierge
-- Purpose:   Staff action tracking on call_logs — written by the dashboard, not n8n
-- Depends:   003_create_call_logs
--
-- action_status is dashboard-only. n8n never writes this field.
-- NULL = unactioned / new (default for all existing and incoming rows)
-- Values: called_back | booked | no_answer | not_proceeding

alter table call_logs
  add column action_status text
    check (action_status in ('called_back', 'booked', 'no_answer', 'not_proceeding'))
    default null;

-- Index to support the priority sort used by the dashboard
-- (nulls-first action_status asc, then urgency asc, then created_at asc)
create index on call_logs (client_id, action_status, urgency, created_at);

comment on column call_logs.action_status is
  'Staff follow-up status. NULL = unactioned. Set by the BizElevate dashboard, not by n8n.';

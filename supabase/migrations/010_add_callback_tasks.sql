-- Migration: 010_add_callback_tasks
-- Project:   bizelevate-concierge
-- Purpose:   Queue of callback tasks created when a patient replies BOOK to a recovery SMS.
--            Written by the sms-reply-handler n8n workflow.
--            Read and actioned by staff via the dashboard Callback Queue view.
-- Depends:   003_create_call_logs

create table callback_tasks (
  id             uuid primary key default gen_random_uuid(),
  client_id      text not null references clients(id),
  patient_phone  text,
  call_log_id    uuid references call_logs(id) on delete set null,
  priority       text not null default 'normal'
                   check (priority in ('high', 'normal')),
  status         text not null default 'pending'
                   check (status in ('pending', 'completed', 'no_answer')),
  created_at     timestamptz not null default now(),
  completed_at   timestamptz
);

comment on table callback_tasks is
  'Callback queue populated when a patient replies BOOK to a missed-call SMS. Actioned by staff via dashboard.';

comment on column callback_tasks.priority is
  'high = patient replied BOOK urgently; normal = standard follow-up. Drives sort order in dashboard queue.';

comment on column callback_tasks.status is
  'pending = awaiting staff action; completed = successfully called back; no_answer = staff tried, no answer.';

comment on column callback_tasks.call_log_id is
  'Optional link to the originating call_logs row. SET NULL on delete so tasks survive log cleanup.';

-- Indexes for the dashboard Callback Queue view
-- Primary queue sort: pending tasks first, high priority before normal, oldest first
create index on callback_tasks (client_id, status, priority, created_at);

-- Quick lookup by originating call log (e.g. to check if a task already exists before inserting)
create index on callback_tasks (call_log_id);

-- RLS
alter table callback_tasks enable row level security;

-- Staff can read their client's callback tasks
create policy "callback_tasks: select own client"
  on callback_tasks for select
  using (
    client_id = (
      select client_id from user_profiles where user_id = auth.uid()
    )
  );

-- Staff can update status and completed_at on their client's tasks
create policy "callback_tasks: update own client"
  on callback_tasks for update
  using (
    client_id = (
      select client_id from user_profiles where user_id = auth.uid()
    )
  )
  with check (
    client_id = (
      select client_id from user_profiles where user_id = auth.uid()
    )
  );

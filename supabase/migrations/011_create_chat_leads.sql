-- 011_create_chat_leads.sql
-- Public website chatbot lead capture table
-- Written via service role from chat-concierge edge function

create table if not exists public.chat_leads (
  id              uuid        default gen_random_uuid() primary key,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null,
  session_id      text        not null unique,
  name            text,
  email           text,
  business_type   text,
  business_name   text,
  message_count   integer     default 0,
  last_message    text,
  source_page     text,
  converted       boolean     default false,  -- true once Calendly booking confirmed
  notes           text
);

-- Update trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger chat_leads_updated_at
  before update on public.chat_leads
  for each row execute function public.set_updated_at();

-- RLS: service role writes, no public reads
alter table public.chat_leads enable row level security;

create policy "service_role_all" on public.chat_leads
  as permissive for all
  to service_role
  using (true)
  with check (true);

-- Index for fast lookups by session
create index if not exists chat_leads_session_idx on public.chat_leads (session_id);
create index if not exists chat_leads_email_idx   on public.chat_leads (email) where email is not null;
create index if not exists chat_leads_created_idx on public.chat_leads (created_at desc);

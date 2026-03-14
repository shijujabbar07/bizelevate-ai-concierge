-- Migration: 006_add_rls_policies
-- Project:   bizelevate-concierge
-- Purpose:   Row-level security on call_logs, clients, client_subscriptions
-- Depends:   005_add_user_profiles
--
-- All policies use user_profiles to resolve the logged-in user's client_id.
-- The n8n workflow MUST use the Supabase service role key to bypass RLS when
-- writing call_logs. The anon/authenticated key is for dashboard reads/updates only.

-- ── call_logs ──────────────────────────────────────────────────────────────────

alter table call_logs enable row level security;

-- Staff can read their client's call logs
create policy "call_logs: select own client"
  on call_logs for select
  using (
    client_id = (
      select client_id from user_profiles where user_id = auth.uid()
    )
  );

-- Staff can update action_status and notes on their client's call logs
create policy "call_logs: update own client"
  on call_logs for update
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

-- ── clients ───────────────────────────────────────────────────────────────────

alter table clients enable row level security;

-- Staff can read their own client record
create policy "clients: select own"
  on clients for select
  using (
    id = (
      select client_id from user_profiles where user_id = auth.uid()
    )
  );

-- ── client_subscriptions ──────────────────────────────────────────────────────

alter table client_subscriptions enable row level security;

-- Staff can read their client's capability subscriptions
create policy "client_subscriptions: select own client"
  on client_subscriptions for select
  using (
    client_id = (
      select client_id from user_profiles where user_id = auth.uid()
    )
  );

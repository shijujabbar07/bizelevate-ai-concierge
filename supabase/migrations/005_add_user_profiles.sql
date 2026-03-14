-- Migration: 005_add_user_profiles
-- Project:   bizelevate-concierge
-- Purpose:   Links Supabase auth users to a client_id for RLS enforcement
-- Depends:   001_create_clients

-- Each authenticated staff member belongs to exactly one client.
-- Rows are inserted manually by a BizElevate admin after provisioning a user
-- in the Supabase Auth dashboard (or via invite).

create table user_profiles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references auth.users(id) on delete cascade,
  client_id  text not null references clients(id),
  created_at timestamptz default now()
);

comment on table user_profiles is
  'Maps auth.users to a client. Required for RLS — every staff login must have a row here.';

comment on column user_profiles.user_id is
  'Foreign key to auth.users. Cascade-deletes this profile when the auth user is deleted.';

comment on column user_profiles.client_id is
  'The client this staff member belongs to. Controls which call_logs they can see.';

-- Users can only read their own profile row
alter table user_profiles enable row level security;

create policy "user_profiles: read own"
  on user_profiles for select
  using (user_id = auth.uid());

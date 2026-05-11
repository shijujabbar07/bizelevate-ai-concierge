-- Migration: 013_add_invitations
-- Project:   bizelevate-concierge
-- Purpose:   Adds is_admin flag to user_profiles and a pending_invitations table
--            to support the invite-based onboarding flow.
-- Depends:   005_add_user_profiles, 001_create_clients

-- ─── 1. Extend user_profiles ──────────────────────────────────────────────────

alter table user_profiles
  add column if not exists is_admin boolean not null default false;

comment on column user_profiles.is_admin is
  'True for BizElevate staff who can invite other users via the Admin panel.';

-- ─── 2. Pending invitations ───────────────────────────────────────────────────

-- Stores invitations created by admins before the invitee has accepted.
-- When a user signs in for the first time and has no user_profiles row,
-- the dashboard checks this table and self-provisions their profile.

create table if not exists pending_invitations (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  client_id   text not null references clients(id),
  invited_by  uuid references auth.users(id) on delete set null,
  invited_at  timestamptz not null default now(),
  accepted_at timestamptz,
  -- Prevent duplicate open invitations for the same email+client
  constraint pending_invitations_email_client_unique unique (email, client_id)
);

comment on table pending_invitations is
  'Admin-created invitations. Consumed by useAuth on first login to provision user_profiles.';

-- ─── 3. RLS on pending_invitations ────────────────────────────────────────────

alter table pending_invitations enable row level security;

-- Invitee can read their own invitation (matched by JWT email claim)
create policy "pending_invitations: read own"
  on pending_invitations for select
  using ((auth.jwt() ->> 'email') = email);

-- Admins can read all invitations (for the Admin panel list)
create policy "pending_invitations: admin read all"
  on pending_invitations for select
  using (
    exists (
      select 1 from user_profiles
      where user_id = auth.uid()
      and is_admin = true
    )
  );

-- Invitee can mark their own invitation as accepted
create policy "pending_invitations: mark own accepted"
  on pending_invitations for update
  using  ((auth.jwt() ->> 'email') = email)
  with check ((auth.jwt() ->> 'email') = email);

-- ─── 4. Allow self-provisioning of user_profiles from an invitation ───────────

-- Users can insert their own profile row only if a matching pending invitation exists.
-- This prevents arbitrary profile creation without an admin invite.
create policy "user_profiles: self-provision from invitation"
  on user_profiles for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from pending_invitations
      where email = (auth.jwt() ->> 'email')
      and accepted_at is null
    )
  );

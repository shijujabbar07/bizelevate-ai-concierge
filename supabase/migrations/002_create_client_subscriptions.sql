-- Migration: 002_create_client_subscriptions
-- Project:   bizelevate-concierge
-- Purpose:   Capability gating per client — references clients(id)
-- Depends:   001_create_clients

create table client_subscriptions (
  id            uuid primary key default gen_random_uuid(),
  client_id     text not null references clients(id),
  capability    text not null,
  active        boolean default true,
  started_at    timestamptz default now(),
  unique (client_id, capability)
);

-- Migration: 001_create_clients
-- Project:   bizelevate-concierge
-- Purpose:   Master client registry — required before client_subscriptions (FK dependency)

create table clients (
  id            text primary key,
  name          text not null,
  industry      text,
  domain        text,
  contact_name  text,
  contact_email text,
  active        boolean default true,
  created_at    timestamptz default now()
);

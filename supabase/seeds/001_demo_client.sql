-- Seed: 001_demo_client
-- Project: bizelevate-concierge
-- Purpose: Demo client record + appointment concierge subscription for testing
-- Run after: all migrations

insert into clients (id, name, industry, contact_name)
values ('smile-dental', 'Smile Dental Campsie', 'dental', 'Demo Client');

insert into client_subscriptions (client_id, capability)
values ('smile-dental', 'appointment_concierge');

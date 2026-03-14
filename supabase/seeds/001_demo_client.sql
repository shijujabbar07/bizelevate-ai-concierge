-- Seed: 001_demo_client
-- Project: bizelevate-concierge
-- Purpose: Demo client record + appointment concierge subscription + sample call_logs for testing
-- Run after: all migrations

insert into clients (id, name, industry, contact_name)
values ('smile-dental', 'Smile Dental Campsie', 'dental', 'Demo Client');

insert into client_subscriptions (client_id, capability)
values ('smile-dental', 'appointment_concierge');

-- Demo call_logs — illustrates all urgency levels and action_status values
-- Timestamps spread across past 7 days for realistic dashboard data
insert into call_logs
  (client_id, capability, call_id, patient_name, patient_phone,
   requested_datetime, reason, urgency, sms_sent, call_status,
   action_status, notes, created_at)
values
  -- Unactioned (action_status NULL) — float to top in priority sort
  ('smile-dental', 'appointment_concierge', 'demo-001',
   'Sarah Johnson', '+61412000001', 'Thursday 10am',
   'Severe toothache, cannot eat', 'emergency', true, 'processed',
   null, null, now() - interval '2 hours'),

  ('smile-dental', 'appointment_concierge', 'demo-002',
   'Michael Chen', '+61412000002', 'Wednesday 2pm',
   'Tooth has been aching for 3 days, getting worse', 'urgent', true, 'processed',
   null, null, now() - interval '5 hours'),

  ('smile-dental', 'appointment_concierge', 'demo-003',
   'Emma Williams', '+61412000003', 'Next Monday anytime',
   'Routine 6-month check-up and clean', 'routine', true, 'processed',
   null, null, now() - interval '1 day'),

  ('smile-dental', 'appointment_concierge', 'demo-008',
   'Liam Wilson', '+61412000008', 'Thursday anytime',
   'Chipped front tooth — no pain', 'routine', true, 'processed',
   null, null, now() - interval '6 hours'),

  -- Actioned rows
  ('smile-dental', 'appointment_concierge', 'demo-004',
   'James Taylor', '+61412000004', 'Tuesday 9am',
   'Broken filling, mild discomfort', 'urgent', true, 'processed',
   'called_back', 'Spoke to patient — booked for Tue 9am with Dr Lee', now() - interval '2 days'),

  ('smile-dental', 'appointment_concierge', 'demo-005',
   'Olivia Brown', '+61412000005', 'Friday afternoon',
   'Annual check-up and X-rays', 'routine', true, 'processed',
   'booked', null, now() - interval '3 days'),

  ('smile-dental', 'appointment_concierge', 'demo-006',
   'Noah Davis', '+61412000006', 'This week',
   'Wisdom tooth pain', 'urgent', false, 'no_phone',
   'no_answer', 'Tried twice — no answer. Will retry tomorrow.', now() - interval '4 days'),

  ('smile-dental', 'appointment_concierge', 'demo-007',
   'Ava Martinez', '+61412000007', 'Monday 11am',
   'Cosmetic consultation — whitening', 'routine', true, 'processed',
   'not_proceeding', 'Patient decided to wait — will call back next month', now() - interval '5 days');

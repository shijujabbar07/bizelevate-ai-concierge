-- Migration: 009_extend_call_logs
-- Project:   bizelevate-concierge
-- Purpose:   Add fields for two-way SMS tracking, owner notification status,
--            booking link click tracking, and conversion tracking.
--            All fields are written by n8n workflows. None are written by the dashboard.
-- Depends:   003_create_call_logs

-- reply_received:       TRUE when Twilio fires an inbound SMS to the sms-reply-handler workflow.
-- reply_intent:         Classified intent of the reply. Values: 'book' | 'hours' | 'other'.
--                       NULL if no reply received.
-- callback_requested:   TRUE when reply_intent='book'. Triggers callback_tasks row creation.
-- owner_notified:       TRUE when the owner/front-desk alert SMS was successfully sent.
-- booking_link_clicked: TRUE when the patient follows the booking link in the SMS.
--                       Written by a future redirect-tracking endpoint; FALSE until then.
-- converted:            TRUE when a staff member marks the call as resulting in a booking.
--                       Set via the dashboard call detail page (manual staff action).

alter table call_logs
  add column reply_received        boolean not null default false,
  add column reply_intent          text,
  add column callback_requested    boolean not null default false,
  add column owner_notified        boolean not null default false,
  add column booking_link_clicked  boolean not null default false,
  add column converted             boolean not null default false;

comment on column call_logs.reply_received is
  'TRUE when the patient replied to the recovery SMS. Written by sms-reply-handler workflow.';

comment on column call_logs.reply_intent is
  'Classified intent of SMS reply: book | hours | other. NULL if no reply.';

comment on column call_logs.callback_requested is
  'TRUE when reply_intent=book. A corresponding callback_tasks row is created by the workflow.';

comment on column call_logs.owner_notified is
  'TRUE when the workflow successfully sent an alert SMS to the clinic owner/front desk.';

comment on column call_logs.booking_link_clicked is
  'TRUE when patient followed the booking link. Written by redirect-tracking endpoint (Phase 2).';

comment on column call_logs.converted is
  'TRUE when staff confirm this call resulted in a booking. Set manually via the dashboard.';

-- Index supporting the conversion funnel query (Missed → SMS → Replied → Booked)
create index on call_logs (client_id, capability, reply_received, converted);

-- Existing RLS policies on call_logs (from migration 006) already cover SELECT and UPDATE
-- for authenticated staff. The new columns are automatically included — no policy changes needed.

# Implementation Checklist — CustomerReach Respond

**Status:** In Development
**Target:** Demo-ready

---

## Pre-requisites

- [ ] Twilio account with AU number
- [ ] n8n Cloud account (bizelevate1.app.n8n.cloud)
- [ ] Supabase project (`bizelevate-concierge`)
- [ ] Supabase migrations run (001, 002, 003 — see `supabase/migrations/`)
- [ ] Demo client seeded (`supabase/seeds/001_demo_client.sql`)

---

## Build Steps

### 1. n8n Workflow (Claude Code builds this)
- [ ] Create workflow via n8n API
- [ ] Webhook node: `POST /webhook/missed-call`
- [ ] Filter node: `CallStatus` in `[no-answer, busy]`
- [ ] Code node: Normalize Twilio payload
- [ ] IF node: Phone Valid?
- [ ] HTTP Request node: Send SMS via Twilio
- [ ] HTTP Request node: Write to Supabase (sms_sent=true)
- [ ] HTTP Request node: Write to Supabase (sms_sent=false, no-phone branch)
- [ ] Respond to Webhook node: 200 OK

### 2. Twilio Configuration (you do this)
- [ ] Go to Twilio Console → Phone Numbers → Active Numbers
- [ ] Select demo number
- [ ] Set StatusCallback URL to n8n webhook URL
- [ ] Set StatusCallback Events: `no-answer`, `busy`, `failed`
- [ ] Save

### 3. Test End-to-End (you do this)
- [ ] Call demo Twilio number from mobile — let it ring out
- [ ] Confirm SMS received within 10 seconds
- [ ] Confirm row in Supabase `call_logs` with `capability='missed_call'`
- [ ] Confirm `sms_sent=true` in log row

---

## Demo Validation

- [ ] End-to-end test passes
- [ ] SMS arrives in <10 seconds
- [ ] Log visible in Supabase
- [ ] Demo script rehearsed (see README)

---

## Client Activation (per new client)

1. Provision new Twilio number for client
2. Update Config node: `clientId`, `clinicName`, `clinicPhone`, `twilioFrom`
3. Configure StatusCallback on new Twilio number
4. Insert client row in Supabase `clients` table
5. Insert subscription row in `client_subscriptions`
6. Test with one real missed call

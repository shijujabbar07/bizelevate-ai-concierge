# First Client Onboarding — Complete Checklist

Run this when the first paying client signs. Work through it in order.

---

## What's Already Done (don't redo these)

| Item | Status | Date |
|------|--------|------|
| Google OAuth + Magic Link auth | Done | 2026-03-09 |
| Supabase RLS — all tables protected | Done | 2026-03-09 |
| Vercel deploy → `dashboard.bizelevate.app` | Done | 2026-03-09 |
| DNS — Porkbun CNAME for `dashboard` subdomain | Done | 2026-03-09 |
| n8n service role credential `Supabase Production` | Done | 2026-03-09 |
| Production Supabase: 6 migrations (001–006) | Done | 2026-03-09 |
| CustomerReach Respond workflow (ID: `W9lssqC5Jvd3nIVo`) | Active | 2026-03-12 |
| CustomerReach Answer workflow (ID: `HKHwb6mpWdvGcR070E8or`) | Active | 2026-03-07 |
| SMS Reply Handler workflow (ID: `q4CYSzFYuYfp1eWa`) | Active | 2026-03-12 |
| Multi-client routing via `phone_number_map` | Done | 2026-03-12 |

---

## Part 1 — One-Time: Create the Dev + Preprod Environments

Run this once, before first client data touches production.

### Phase 1 — Create Supabase dev + preprod projects

- [ ] Go to [supabase.com](https://supabase.com) → New project
- [ ] Create project: `bizelevate-dev` (region: `ap-southeast-2`)
- [ ] Create project: `bizelevate-preprod` (region: `ap-southeast-2`)
- [ ] Record both project URLs in `supabase/ENVIRONMENTS.md`
- [ ] Apply all migrations to **dev** (001 → latest) — paste each file in Supabase SQL editor:
  - `001_create_clients.sql`
  - `002_create_client_subscriptions.sql`
  - `003_create_call_logs.sql`
  - `004_add_action_status.sql`
  - `005_add_user_profiles.sql`
  - `006_add_rls_policies.sql`
  - (any newer migrations in `supabase/migrations/`)
- [ ] Apply same migrations to **preprod**
- [ ] Run seed on **dev** only: paste `supabase/seeds/001_demo_client.sql` in dev SQL editor
- [ ] Verify: tables visible in Supabase Table Editor, seed data present in dev

### Phase 2 — Create dev + staging n8n workflows

Ask Claude to do this. Claude will:
- Duplicate `CustomerReach Answer` → rename to `[DEV] CustomerReach Answer`
- Duplicate to `[STAGING] CustomerReach Answer`
- Update webhook URLs to `-dev` and `-staging` suffix paths
- Update Supabase credentials to point at `bizelevate-dev` / `bizelevate-preprod`
- Repeat for `CustomerReach Respond`

> Confirm production workflows are **unchanged and still active** after this step.

### Phase 3 — Create dev + staging VAPI assistants

- [ ] Log in to [vapi.ai](https://vapi.ai) → Assistants
- [ ] Duplicate the production Alex assistant → rename: `Alex - Dev`
- [ ] Set Server URL on Alex - Dev to: `.../webhook/vapi-appointment-dev`
- [ ] Set a **different** webhook secret for dev (does not have to match prod)
- [ ] Ask Claude to update the `[DEV]` n8n workflow Header Auth credential to use the dev secret
- [ ] Duplicate again → rename: `Alex - Staging`
- [ ] Set Server URL on Alex - Staging to: `.../webhook/vapi-appointment-staging`
- [ ] Verify production Alex assistant is **unchanged**

### Phase 4 — Set up dashboard staging environment (Vercel)

- [ ] Go to [vercel.com](https://vercel.com) → Add New Project → import `bizelevate-dashboard` GitHub repo
- [ ] Set root directory: `bizelevate-dashboard`
- [ ] Set Framework Preset: Vite | Build Command: `npm run build:staging` | Output: `dist`
- [ ] Add environment variables pointing at preprod Supabase:
  | Variable | Value |
  |----------|-------|
  | `VITE_SUPABASE_URL` | `<preprod-url>.supabase.co` |
  | `VITE_SUPABASE_ANON_KEY` | preprod project anon key |
  | `VITE_ENV` | `staging` |
- [ ] Link custom domain: `staging.bizelevate.app`
- [ ] Confirm staging dashboard loads and connects to preprod data

### Phase 5 — Lock production (from this point on)

From this point forward:
- **No direct SQL against production** — all changes via numbered migration files
- **No direct edits to production n8n workflows** — edit `[DEV]` first, test, then promote
- **No direct edits to production VAPI assistant** — test on Alex - Dev first
- Seed scripts are **dev/preprod only** — never run on prod

---

## Part 2 — Per Client: Activate for Each New Client

Run this for every new client, including client 1.

> Before starting: confirm the client's tier (Starter = Respond only, Core = Respond + Answer + Dashboard).
> See pricing in [missed-call/PLAYBOOK.md](../missed-call/PLAYBOOK.md) → Section 7.

### Step 1 — Provision a Twilio number

- [ ] Log in to [Twilio Console](https://console.twilio.com) → Phone Numbers → Buy a Number
- [ ] Select: Australia (AU), Mobile (04XX) or Local (02/03/07/08)
- [ ] Purchase — note the E.164 number (e.g. `+61485XXXXXX`)
- [ ] Cost: ~$2–3 AUD/month — include in subscription fee

### Step 2 — Configure Twilio StatusCallback (for CustomerReach Respond)

- [ ] In Twilio Console → Phone Numbers → Active Numbers → click the new number
- [ ] Scroll to **Voice & Fax** section:
  | Field | Value |
  |-------|-------|
  | A call comes in — Webhook URL | `https://bizelevate1.app.n8n.cloud/webhook/missed-call` |
  | Method | HTTP POST |
  | Status Callback URL | `https://bizelevate1.app.n8n.cloud/webhook/missed-call` |
  | Status Callback Events | `no-answer`, `busy`, `failed` |
- [ ] Scroll to **Messaging** section (for SMS reply capture):
  | Field | Value |
  |-------|-------|
  | A message comes in — Webhook URL | `https://bizelevate1.app.n8n.cloud/webhook/sms-reply` |
  | Method | HTTP POST |
- [ ] Save

### Step 3 — Register the client in Supabase

Open Supabase SQL editor (production project: `gdzpgimyjgfzhnwyojmz`) and run:

**3a — Update client config** (replace values with the actual client data):
```sql
UPDATE clients SET
  owner_phone    = '+61XXXXXXXXXX',         -- clinic owner or front-desk mobile
  timezone       = 'Australia/Sydney',
  booking_link   = 'https://...',           -- Calendly or clinic booking page, or NULL
  business_hours = '{"start": 8, "end": 18, "days": [1,2,3,4,5]}'::jsonb
WHERE id = 'your-client-id';
```

> If `booking_link` is NULL: patient SMS says "Reply BOOK and we'll call you back."
> If set: SMS includes the booking link automatically.

**3b — Register the Twilio number:**
```sql
INSERT INTO phone_number_map (phone_number, client_id, capability)
VALUES ('+61XXXXXXXXXX', 'your-client-id', 'missed_call');
```
The `phone_number` must be E.164 format — match exactly what Twilio sends as the `To` field.

**3c — Enable the capability:**
```sql
INSERT INTO client_subscriptions (client_id, capability)
VALUES ('your-client-id', 'missed_call')
ON CONFLICT (client_id, capability) DO NOTHING;
```
This makes CustomerReach Respond appear as Active in the client's dashboard.

If also activating CustomerReach Answer:
```sql
INSERT INTO client_subscriptions (client_id, capability)
VALUES ('your-client-id', 'appointment_concierge')
ON CONFLICT (client_id, capability) DO NOTHING;
```

### Step 4 — Configure VAPI for CustomerReach Answer (Core tier and above only)

- [ ] Log in to [vapi.ai](https://vapi.ai) → Assistants → duplicate production Alex → rename: `Alex - [ClientName]`
- [ ] In the duplicate assistant, set:
  | Setting | Value |
  |---------|-------|
  | Server URL | `https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment` |
  | Server URL Secret | `<VAPI_WEBHOOK_SECRET>` from `secrets.local.json` |
- [ ] Enable **Structured Data Extraction** in the Analysis section:
  - Extraction prompt:
    ```
    Extract: patientName, patientPhone, requestedDateTime, reason, isNewPatient.
    Return as JSON. Use null for any field not clearly provided.
    ```
  - Schema (see `appointment-concierge/vapi/SETUP.md` for full JSON schema)
- [ ] Ensure Call Recording and Transcription are enabled
- [ ] Assign the client's Twilio number to this VAPI assistant
- [ ] Save and test with a live call

> **Do NOT change:** system prompt, model settings, or voice settings from the original Alex.

### Step 5 — Update Google Business Profile

- [ ] Log in to [Google Business Profile](https://business.google.com) with the clinic's account
- [ ] Select the clinic's listing → Edit profile → Contact → Phone
- [ ] Add the Twilio number as a **secondary** phone number
  - Label: "After-hours bookings" (if Answer) or "New patient enquiries" (if Respond second number)
- [ ] Save — takes 24–48 hours to reflect in Google Search
- [ ] If also using conditional call forwarding (Option 2), confirm forwarding code was dialled:
  - No-answer forward: `*62*04XXXXXXXX#` (from clinic's landline)
  - Cancel any time: `##62#`

> Full phone setup options: see [docs/PHONE-ONBOARDING.md](../docs/PHONE-ONBOARDING.md)

### Step 6 — Provision dashboard access for clinic staff

For each staff member who needs dashboard access:

- [ ] Go to [Supabase Dashboard](https://app.supabase.com) → `gdzpgimyjgfzhnwyojmz` → Authentication → Users
- [ ] Click **Invite user** → enter their email address
- [ ] They receive a Supabase invite — they click the link and set a password (or use Google OAuth)
- [ ] After they accept: their row appears in Authentication → Users — copy their UUID
- [ ] Go to Table Editor → `user_profiles` → Insert row:
  | Field | Value |
  |-------|-------|
  | `user_id` | UUID from auth.users |
  | `client_id` | the client's slug (e.g. `smile-dental`) |
- [ ] Verify: staff member logs in at `dashboard.bizelevate.app` and sees their client's data only

> A user with no `user_profiles` row is authenticated but sees no data. This is by design.

### Step 7 — End-to-end verification

**CustomerReach Respond test:**
```bash
curl --ssl-no-revoke -X POST "https://bizelevate1.app.n8n.cloud/webhook/missed-call" \
  --data "From=0412000001&To=+61XXXXXXXXXX&CallSid=CA-TEST-001&CallStatus=no-answer"
```

- [ ] SMS received on `0412000001` within 10 seconds
- [ ] SMS body uses the client's name (not another client's)
- [ ] SMS includes booking link if configured, or "Reply BOOK" if not
- [ ] Row in `call_logs` with correct `client_id` and `capability = 'missed_call'`
- [ ] Row visible in the client's dashboard

**CustomerReach Answer test (if activated):**
- [ ] Call the VAPI number from a mobile — Alex answers immediately
- [ ] Complete a short test booking (name, number, reason, callback time)
- [ ] SMS confirmation received within 30 seconds of call ending
- [ ] Row in `call_logs` with `capability = 'appointment_concierge'`
- [ ] Row visible in dashboard with urgency classification
- [ ] Remove test rows from `call_logs` if needed

**Dashboard access test:**
- [ ] Staff logs in — sees only their client's data
- [ ] Urgency and action status fields visible and interactive

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| SMS not arriving | Check Twilio Console → SMS logs → confirm `To` number format is correct |
| Wrong clinic name in SMS | Check `clients` table → `name` field for the client |
| n8n execution fails — can't find client | Check `phone_number_map` → `phone_number` must match Twilio `To` exactly (E.164) |
| Dashboard shows no data after login | Check `user_profiles` — row must exist with correct `user_id` and `client_id` |
| VAPI not calling webhook | Check Server URL and Secret in VAPI assistant settings match n8n exactly |
| Google OAuth redirect fails | Add redirect URL to Supabase → Authentication → URL Configuration |
| n8n can't write to Supabase | HTTP nodes must use `Predefined Credential → supabaseApi → Supabase Production` |
| Booking link looks like spam in SMS | Configure `book.bizelevate.app` custom domain pointing to Supabase Edge Function `book` |

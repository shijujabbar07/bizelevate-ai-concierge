# CustomerReach Respond - Client Onboarding SOP

**Product:** CustomerReach Respond (missed-call SMS)
**Time to activate:** ~15 min total (10 min founder, 5 min Claude)

---

## How This Works

Two phases. You go first, then hand off.

**Phase A - You do (10 min):**
1. Buy a Twilio number for the client
2. Fill in the client input document

**Phase B - Claude does (~5 min, fully automated):**
1. Creates the client record in Supabase
2. Maps the Twilio number to the client
3. Enables the missed_call capability
4. Configures Twilio StatusCallback (missed-call webhook)
5. Configures Twilio inbound SMS webhook (reply capture)
6. Runs a live verification test
7. Reports go-live confirmation

No manual SQL. No Twilio UI clicking. No n8n changes. Just the input doc.

---

## Phase A - Founder Steps

### Step 1 - Buy a Twilio AU Number (~5 min)

1. Log in to [Twilio Console](https://console.twilio.com)
2. Go to: Phone Numbers - Buy a Number
3. Select country: **Australia**
4. Type: **Mobile (04XX)** for best SMS deliverability
5. Click Buy - confirm purchase
6. Note the full E.164 number (e.g. `+61485XXXXXX`)

Cost: ~$2-3 AUD/month. Include in client subscription.

> **Option 1 (recommended):** This is a dedicated second number - clinic's existing number is untouched. Add this number to their Google Business Profile as "New patient bookings" or "After-hours line".
>
> **Option 2 (if client wants Respond on their main number):** Also set up conditional call forwarding from their existing line. From the clinic landline, dial `*62*+61485XXXXXX#` (replace with Twilio number). Missed calls forward to Twilio after ~20 seconds. Reversible with `##62#`.

### Step 2 - Fill In The Client Input Document

Copy `onboarding/respond-client-input.md` and fill in all fields.

Paste the completed document to Claude and say:
> **"Onboard this client for CustomerReach Respond."**

---

## Phase B - What Claude Does

Once you paste the completed input document, Claude will:

1. **Supabase - Upsert client record**
   ```sql
   INSERT INTO clients (id, name, industry, owner_phone, timezone, booking_link, business_hours)
   VALUES (...) ON CONFLICT (id) DO UPDATE SET ...;
   ```

2. **Supabase - Register Twilio number**
   ```sql
   INSERT INTO phone_number_map (phone_number, client_id, capability)
   VALUES ('+61XXXXXXXXXX', 'client-id', 'missed_call');
   ```

3. **Supabase - Enable capability**
   ```sql
   INSERT INTO client_subscriptions (client_id, capability)
   VALUES ('client-id', 'missed_call') ON CONFLICT DO NOTHING;
   ```

4. **Twilio API - Set StatusCallback (missed-call trigger)**
   Looks up the PhoneNumberSid for the Twilio number, then POSTS:
   - `StatusCallback` = `https://bizelevate1.app.n8n.cloud/webhook/missed-call`
   - `StatusCallbackMethod` = `POST`

5. **Twilio API - Set inbound SMS webhook (reply capture)**
   Same number, same API call:
   - `SmsUrl` = `https://bizelevate1.app.n8n.cloud/webhook/sms-reply`
   - `SmsMethod` = `POST`

6. **Verification test**
   ```bash
   curl -X POST https://bizelevate1.app.n8n.cloud/webhook/missed-call \
     --data "From=0412000001&To=+61XXXXXXXXXX&CallSid=CA-TEST-001&CallStatus=no-answer"
   ```
   Confirms: SMS sent, correct clinic name, row in call_logs.

7. **Go-live confirmation** - reports what was created and any issues.

---

## Dashboard Access (Optional - After Go-Live)

If the client needs staff logins to the dashboard:

1. Give Claude the staff email addresses
2. Claude will call the Supabase invite API for each
3. Staff receive invite email - they set a password
4. Once they accept: give Claude their confirmed UUIDs and Claude inserts `user_profiles` rows
5. Staff log in at `dashboard.bizelevate.app` and see their data only

> Note: The UUID step requires a second pass after staff accept the invite. This is a Supabase auth constraint - invites are async.

---

## Verification Checklist (Claude confirms these, you spot-check)

- [ ] SMS arrives on test mobile within 10 seconds of simulated missed call
- [ ] SMS body shows the correct clinic name
- [ ] SMS includes booking link (if provided) or "Reply BOOK" prompt (if not)
- [ ] `call_logs` row in Supabase with correct `client_id` and `capability = 'missed_call'`
- [ ] Row visible in the client's dashboard

---

## Troubleshooting Quick Reference

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| SMS not arriving | Twilio StatusCallback not set | Re-run Phase B step 4 |
| Wrong clinic name in SMS | `clients.name` incorrect | UPDATE clients SET name = '...' |
| n8n can't find client | `phone_number_map` phone not in E.164 | Check leading `+61`, no spaces |
| Reply BOOK does nothing | SMS webhook not configured | Re-run Phase B step 5 |
| SMS body missing booking link | `clients.booking_link` is NULL | UPDATE clients SET booking_link = '...' |
| Row in call_logs but wrong client | Duplicate entry in `phone_number_map` | SELECT * FROM phone_number_map WHERE phone_number = '+61...' |

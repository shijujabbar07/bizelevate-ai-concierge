# CustomerReach Respond - Client Decommission SOP

**Use this when:** removing a client from CustomerReach Respond, or resetting a client for re-onboarding/testing.

---

## Two Modes

| Mode | When to use | What it removes |
|------|------------|----------------|
| **Soft decommission** | Testing, pausing service, re-onboarding dry run | Routing + Twilio config only. Client record and call history stay intact. |
| **Full decommission** | Client is leaving, end of contract | Everything - routing, Twilio config, client record fields, dashboard access, call logs archived. |

---

## Soft Decommission (Testing / Re-Onboarding Reset)

Run this before re-testing the onboarding SOP. Takes ~5 min. Fully reversible.

### Step 1 - Remove routing (Supabase)

```sql
-- Stop the workflow finding this client
DELETE FROM phone_number_map
WHERE client_id = 'your-client-id' AND capability = 'missed_call';

-- Remove capability from dashboard
DELETE FROM client_subscriptions
WHERE client_id = 'your-client-id' AND capability = 'missed_call';
```

### Step 2 - Clear Twilio webhooks

Claude will call the Twilio API to remove both webhooks from the number:
- StatusCallback URL cleared (missed-call trigger stops)
- SmsUrl cleared (reply capture stops)

**Tell Claude:** "Clear Twilio webhooks for +61XXXXXXXXXX"

### Step 3 - Verify it's inert

```bash
curl -X POST https://bizelevate1.app.n8n.cloud/webhook/missed-call \
  --data "From=0412000001&To=+61XXXXXXXXXX&CallSid=CA-TEST-001&CallStatus=no-answer"
```

Expected: n8n execution fails at "Lookup Client" with no client found. No SMS sent. This confirms the decommission is clean and the onboarding SOP will start from a blank state.

> **Client record and call_logs are untouched.** Re-onboarding will re-use the existing client row via `INSERT ... ON CONFLICT DO UPDATE`.

---

## Full Decommission (Client Offboarding)

Run this when a paying client ends their subscription. Not reversible without re-onboarding.

### Step 1 - Remove routing and capability

Same as soft decommission Step 1 above.

### Step 2 - Clear Twilio webhooks

Same as soft decommission Step 2 above.

### Step 3 - Remove dashboard access

```sql
-- Remove staff logins (they'll still have auth accounts but see no data)
DELETE FROM user_profiles
WHERE client_id = 'your-client-id';
```

> Auth accounts in Supabase Auth are left in place. They become inert (no `user_profiles` row = no data access). Delete them from Supabase Dashboard > Authentication > Users if required.

### Step 4 - Clear client config fields (optional)

Preserve the row for audit purposes but blank the sensitive fields:

```sql
UPDATE clients SET
  owner_phone    = NULL,
  booking_link   = NULL,
  business_hours = NULL
WHERE id = 'your-client-id';
```

> Leave `name`, `id`, and `industry` intact. `call_logs` rows reference `client_id` - clearing the row lets history remain queryable.

### Step 5 - Release Twilio number (if ending the contract)

- [ ] Log in to [Twilio Console](https://console.twilio.com) - Phone Numbers - Active Numbers
- [ ] Click the client's number - Release Number
- [ ] Confirm - this cannot be undone and the number may be reassigned

> **Don't release during a trial or testing phase.** Releasing and re-buying costs another ~$2-3/mo and may give you a different number.

### Step 6 - Archive call logs (data retention)

By default, call_logs rows are kept indefinitely. If the client requests data deletion:

```sql
-- Check what you're about to delete
SELECT COUNT(*), MIN(created_at), MAX(created_at)
FROM call_logs WHERE client_id = 'your-client-id';

-- Delete only after confirming with client
DELETE FROM call_logs WHERE client_id = 'your-client-id';
```

---

## Re-Onboarding After Soft Decommission

Once soft decommission is verified (Step 3 shows no SMS), run the onboarding SOP normally:

1. Copy `onboarding/respond-client-input.md`
2. Fill in the client details (same Twilio number, same client ID)
3. Paste to Claude: "Onboard this client for CustomerReach Respond."

Claude will `INSERT ... ON CONFLICT DO UPDATE` on the client row (safe to re-run), re-insert phone_number_map and client_subscriptions, and re-configure Twilio webhooks.

---

## Quick Reference - Riverside Dental (Demo Client)

```
Client ID:       riverside-dental
Twilio Number:   +61485004338
```

Soft decommission SQL:
```sql
DELETE FROM phone_number_map WHERE client_id = 'riverside-dental' AND capability = 'missed_call';
DELETE FROM client_subscriptions WHERE client_id = 'riverside-dental' AND capability = 'missed_call';
```

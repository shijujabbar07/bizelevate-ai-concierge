# n8n Setup — Missed Call Recovery

## Prerequisites
- n8n Cloud account (bizelevate1.app.n8n.cloud)
- Twilio Basic Auth credential in n8n
- Supabase service role key

---

## Step 1: Import Workflow

1. Open n8n → Workflows → Import
2. Select `missed-call/n8n/workflow.json`
3. Confirm import

---

## Step 2: Connect Credentials

| Node | Credential | Type |
|------|-----------|------|
| Send SMS | Twilio Basic Auth | `ACCOUNT_SID` / `AUTH_TOKEN` |
| Write to Supabase | HTTP Header Auth | `apikey: <SUPABASE_SERVICE_KEY>` |

---

## Step 3: Update Config Values

In the **Config** Set node, update:

| Variable | Value |
|----------|-------|
| `clientId` | `smile-dental` |
| `clinicName` | `Smile Dental Campsie` |
| `clinicPhone` | `+61485004338` |
| `twilioFrom` | Your Twilio AU number |
| `supabaseUrl` | Your Supabase project URL |

---

## Step 4: Activate

1. Click **Activate** toggle in the top-right
2. Copy the webhook URL shown after activation
3. Paste into Twilio StatusCallback URL (see `twilio/SETUP.md`)

---

## Step 5: Test

Send a test payload via curl or Postman:
```bash
curl -X POST https://bizelevate1.app.n8n.cloud/webhook/missed-call \
  --data "From=0412345678&To=+61485004338&CallSid=CA123&CallStatus=no-answer"
```

Expected result:
- SMS sent to `0412345678`
- Row inserted in Supabase `call_logs`

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Workflow not triggering | Confirm Active; check Twilio StatusCallback URL |
| SMS not sending | Check Twilio credential; verify `From` number format |
| Supabase write failing | Check service_role key; confirm table exists |
| Filter blocking all calls | Confirm `CallStatus` values match filter conditions |

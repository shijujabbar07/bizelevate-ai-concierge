# Twilio Setup — Missed Call Recovery

## Prerequisites
- Twilio account with AU phone number
- n8n workflow imported and activated
- Webhook URL from n8n

---

## Step 1: Get Your Webhook URL

From n8n, the webhook URL will be:
```
https://bizelevate1.app.n8n.cloud/webhook/missed-call
```

---

## Step 2: Configure StatusCallback on Twilio Number

1. Go to **Twilio Console → Phone Numbers → Manage → Active Numbers**
2. Click the clinic's phone number
3. Under **Voice & Fax**, find **"A call comes in"**
4. Set **Status Callback URL** to your n8n webhook URL
5. Set method to **HTTP POST**
6. Set **Status Callback Events** to: `no-answer`, `busy`, `failed`
7. Save

---

## Step 3: Verify

1. Call the Twilio number from a mobile — let it ring out (don't answer)
2. Check n8n Executions — you should see a triggered run
3. Check your mobile for the SMS reply
4. Check Supabase → `call_logs` for a new row with `capability='missed_call'`

---

## Notes

- `CallStatus=no-answer` fires when no one picks up after the timeout
- `CallStatus=busy` fires if the number is engaged
- `CallStatus=failed` fires on technical failures (rare)
- StatusCallback fires *after* the call ends — SMS arrives seconds later

# n8n Workflow Setup Guide

## Overview
Import and configure the Appointment Request Concierge workflow in n8n Cloud.

**Estimated Time:** 15-20 minutes

> **Secrets:** This file uses `<PLACEHOLDER>` tokens. Real values go in n8n
> credential UI or your local `.env` / `secrets.local.json`. See `docs/README.md`
> for the full secrets quickstart.

---

## Prerequisites

- [ ] n8n Cloud account (https://bizelevate1.app.n8n.cloud/)
- [ ] OpenAI API credentials (already in n8n)
- [ ] Google Sheets OAuth configured
- [ ] Twilio credentials ready

---

## Step 1: Import the Workflow

1. Log in to https://bizelevate1.app.n8n.cloud/
2. Click **Workflows** in the left sidebar
3. Click **Add Workflow** → **Import from File**
4. Select `workflow.json` from this folder
5. Click **Import**

---

## Step 2: Configure Credentials

### 2.1 OpenAI Credentials
If not already configured:
1. Go to **Settings** → **Credentials**
2. Click **Add Credential** → **OpenAI API**
3. Enter your OpenAI API key
4. Save as "OpenAI API"

### 2.2 Google Sheets OAuth2
1. Go to **Settings** → **Credentials**
2. Click **Add Credential** → **Google Sheets OAuth2 API**
3. Follow OAuth flow to connect your Google account (admin@bizelevate.au)
4. Save as "Google Sheets OAuth2"

### 2.3 Twilio Basic Auth (Critical)
1. Go to **Settings** → **Credentials**
2. Click **Add Credential** → **HTTP Basic Auth**
3. Configure:
   - **User**: `<TWILIO_ACCOUNT_SID>`
   - **Password**: `<TWILIO_AUTH_TOKEN>`
4. Save as "Twilio Basic Auth"

---

## Step 3: Update Node Credentials

After importing, connect credentials to each node:

### VAPI Webhook Node
1. Click on "VAPI Webhook" node
2. Under **Authentication**, select **Header Auth**
3. Create new Header Auth credential:
   - **Name**: `x-vapi-secret`
   - **Value**: `<VAPI_WEBHOOK_SECRET>`
4. Save

### Classify Urgency Node
1. Click on "Classify Urgency" node
2. Under **Credential**, select your "OpenAI API"
3. Save

### Save to Google Sheets Node
1. Click on "Save to Google Sheets" node
2. Under **Credential**, select your "Google Sheets OAuth2"
3. Verify Document ID: `1hUBJx6sq3Yx60JKcBQ3yin-n1xp_Hgh0ANjEwkwPq08`
4. Verify Sheet Name: `Appointments`
5. Save

### Send Patient SMS Node
1. Click on "Send Patient SMS" node
2. Under **Credential**, select your "Twilio Basic Auth"
3. Verify the URL contains your Account SID
4. Save

---

## Step 4: Activate the Workflow

1. Toggle the **Active** switch in the top right
2. Confirm the workflow is now active
3. Note the webhook URL: `https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment`

---

## Step 5: Test the Webhook

Use the test payloads from `docs/TEST-PAYLOADS.md`:

1. Open a terminal or Postman
2. Send a test POST request to the webhook
3. Check n8n execution history
4. Verify data in Google Sheets
5. Check for SMS delivery (use a real phone number)

---

## Node Reference

| Node | Purpose | Key Config |
|------|---------|------------|
| VAPI Webhook | Receives call data from VAPI | Header auth with secret |
| Extract Call Data | Parses and normalizes data | Fallback logic for missing fields |
| Classify Urgency | AI urgency classification | GPT-3.5-turbo, temp 0.1 |
| Format Urgency | Combines data with urgency | Lowercase urgency output |
| Save to Google Sheets | Logs appointment request | Append to Appointments sheet |
| Send Patient SMS | Confirms receipt to patient | Twilio API |
| Respond to VAPI | Returns success to VAPI | JSON response |

---

## Data Flow

```
VAPI Call Ends
      ↓
Webhook receives POST with call data
      ↓
Extract: patientName, phone, dateTime, reason
      ↓
Classify urgency via OpenAI
      ↓
Save to Google Sheets
      ↓
Send SMS confirmation to patient
      ↓
Return success response to VAPI
```

---

## Troubleshooting

### Webhook Not Triggering
- Verify workflow is **Active**
- Check webhook URL matches VAPI config
- Verify header auth secret matches

### OpenAI Node Failing
- Check API key is valid
- Verify sufficient credits
- Check prompt formatting

### Google Sheets Not Updating
- Re-authenticate OAuth if expired
- Verify Sheet ID is correct
- Check sheet name is exactly "Appointments"
- Ensure column headers match

### SMS Not Sending
- Verify Twilio credentials
- Check phone number format (include country code)
- Verify Twilio account has SMS credits
- Check the "To" number is valid

### General Debugging
1. Open the workflow
2. Click **Executions** tab
3. Find the failed execution
4. Click to see detailed error logs
5. Check input/output of each node

---

## Credential Summary

| Service | Credential Type | Name |
|---------|----------------|------|
| VAPI | Header Auth | x-vapi-secret |
| OpenAI | OpenAI API | OpenAI API |
| Google | OAuth2 | Google Sheets OAuth2 |
| Twilio | HTTP Basic Auth | Twilio Basic Auth |

---

## Next Steps

1. [ ] All credentials configured
2. [ ] Workflow imported and active
3. [ ] Test payload sent successfully
4. [ ] Data appearing in Google Sheets
5. [ ] SMS received on test phone
6. [ ] Ready for VAPI integration

---

**Workflow File:** `workflow.json`

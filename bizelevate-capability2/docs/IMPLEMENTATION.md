# Implementation Checklist

## Overview
Complete step-by-step checklist to deploy the Appointment Request Concierge demo.

**Total Estimated Time:** 30-45 minutes

---

## Pre-Flight Checklist

Before starting, verify you have:

- [ ] Access to n8n Cloud (https://bizelevate1.app.n8n.cloud/)
- [ ] Access to VAPI Dashboard (https://vapi.ai)
- [ ] Access to Google Account (admin@bizelevate.au)
- [ ] Twilio Console access (https://console.twilio.com/)
- [ ] All project files downloaded

**Required Credentials:**
- [ ] Twilio Account SID: `<TWILIO_ACCOUNT_SID>`
- [ ] Twilio Auth Token: `<TWILIO_AUTH_TOKEN>`
- [ ] Google Sheet ID: `1hUBJx6sq3Yx60JKcBQ3yin-n1xp_Hgh0ANjEwkwPq08`
- [ ] Webhook Secret: `<VAPI_WEBHOOK_SECRET>`

---

## Phase 1: Google Sheets Setup
**Time: 5 minutes**

- [ ] 1.1 Open Google Sheet: https://docs.google.com/spreadsheets/d/1hUBJx6sq3Yx60JKcBQ3yin-n1xp_Hgh0ANjEwkwPq08/edit
- [ ] 1.2 Rename sheet tab to: `Appointments`
- [ ] 1.3 Add headers to Row 1 (copy from `google-sheets/template.csv`):
  - Timestamp | Call ID | Patient Name | Phone | Requested Date/Time | Reason | Urgency | Status | Notes
- [ ] 1.4 Freeze header row (View → Freeze → 1 row)
- [ ] 1.5 (Optional) Add conditional formatting for Urgency column

**Success Criteria:** Sheet has 9 headers in Row 1, tab named "Appointments"

---

## Phase 2: n8n Credentials Setup
**Time: 10 minutes**

### 2.1 Create Twilio Basic Auth Credential
- [ ] Go to n8n Settings → Credentials
- [ ] Click Add Credential → HTTP Basic Auth
- [ ] User: `<TWILIO_ACCOUNT_SID>`
- [ ] Password: `<TWILIO_AUTH_TOKEN>`
- [ ] Save as: "Twilio Basic Auth"

### 2.2 Verify OpenAI Credential
- [ ] Confirm OpenAI API credential exists
- [ ] If not, create with your API key

### 2.3 Verify Google Sheets Credential
- [ ] Confirm Google Sheets OAuth2 credential exists
- [ ] If expired, re-authenticate with admin@bizelevate.au

### 2.4 Create Webhook Header Auth
- [ ] Add Credential → Header Auth
- [ ] Name: `x-vapi-secret`
- [ ] Value: `<VAPI_WEBHOOK_SECRET>`
- [ ] Save as: "VAPI Webhook Secret"

**Success Criteria:** 4 credentials configured and saved

---

## Phase 3: Import n8n Workflow
**Time: 5 minutes**

- [ ] 3.1 Go to Workflows in n8n
- [ ] 3.2 Click Add Workflow → Import from File
- [ ] 3.3 Select `n8n/workflow.json`
- [ ] 3.4 Click Import

### Connect Credentials to Nodes:
- [ ] 3.5 VAPI Webhook → Header Auth → "VAPI Webhook Secret"
- [ ] 3.6 Classify Urgency → OpenAI API → "OpenAI API"
- [ ] 3.7 Save to Google Sheets → Google Sheets OAuth2
- [ ] 3.8 Send Patient SMS → HTTP Basic Auth → "Twilio Basic Auth"

- [ ] 3.9 Save the workflow
- [ ] 3.10 Toggle workflow to **Active**

**Success Criteria:** Workflow active, all nodes have green credential indicators

---

## Phase 4: Configure VAPI Webhook
**Time: 10 minutes**

**Important:** Keep your existing Alex system prompt - only configure webhook settings.

- [ ] 4.1 Log in to VAPI Dashboard
- [ ] 4.2 Open your existing assistant (Alex dental assistant)
- [ ] 4.3 **Do NOT change:** System prompt, model settings, voice settings, first/end messages
- [ ] 4.4 Set Server URL: `https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment`
- [ ] 4.5 Set Server URL Secret: `<VAPI_WEBHOOK_SECRET>`
- [ ] 4.6 Enable **Structured Data Extraction** in Analysis section
- [ ] 4.7 Add extraction prompt (see `vapi/SETUP.md` Step 4.2)
- [ ] 4.8 Add extraction schema (see `vapi/SETUP.md` Step 4.3)
- [ ] 4.9 Verify Recording & Transcription are enabled
- [ ] 4.10 Save assistant

**Success Criteria:** VAPI assistant saved with webhook URL, existing Alex prompt unchanged

---

## Phase 5: Testing
**Time: 10 minutes**

### 5.1 Test Webhook Directly
- [ ] Open terminal or Postman
- [ ] Send test payload from `docs/TEST-PAYLOADS.md` (Test 1: Routine)
- [ ] Verify n8n execution shows success
- [ ] Verify row added to Google Sheet
- [ ] Verify SMS received (use your phone number in payload)

### 5.2 Test with VAPI
- [ ] Use VAPI test call feature
- [ ] Complete a full booking conversation
- [ ] Verify webhook triggered
- [ ] Verify Google Sheet updated
- [ ] Verify SMS sent

### 5.3 Test Edge Cases
- [ ] Test with urgent reason (Test 2 payload)
- [ ] Test with emergency reason (Test 3 payload)
- [ ] Test with minimal data (Test 4 payload)

**Success Criteria:** All tests pass, data flows end-to-end

---

## Phase 6: Demo Preparation
**Time: 5 minutes**

- [ ] 6.1 Clear test data from Google Sheet (keep headers)
- [ ] 6.2 Prepare demo script:
  - Call the VAPI number
  - Provide: Name, Phone, Preferred time, Reason
  - Hang up and show SMS received
  - Show Google Sheet with logged request
- [ ] 6.3 Have backup test payloads ready
- [ ] 6.4 Test one more time with clean sheet

**Success Criteria:** Clean sheet, demo script ready, confident in flow

---

## Post-Implementation Checklist

- [ ] Workflow is Active in n8n
- [ ] VAPI assistant is configured and saved
- [ ] Google Sheet has headers
- [ ] All credentials are valid
- [ ] Test call completed successfully
- [ ] SMS delivered
- [ ] Data logged correctly with urgency classification

---

## Quick Reference

| Component | URL/Value |
|-----------|-----------|
| n8n Cloud | https://bizelevate1.app.n8n.cloud/ |
| Webhook URL | https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment |
| Webhook Secret | <VAPI_WEBHOOK_SECRET> |
| Google Sheet | https://docs.google.com/spreadsheets/d/1hUBJx6sq3Yx60JKcBQ3yin-n1xp_Hgh0ANjEwkwPq08/edit |
| Twilio Phone | +61 485 004 338 |
| VAPI Dashboard | https://vapi.ai |

---

## Troubleshooting Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Webhook not triggering | Check workflow is Active; verify header auth |
| SMS not sending | Verify Twilio credentials; check phone format |
| Sheet not updating | Re-auth Google; verify sheet name is "Appointments" |
| Urgency always "routine" | Check OpenAI credentials; verify prompt |
| VAPI not calling webhook | Verify Server URL and Secret match exactly |

---

## Next Steps After Demo

1. Configure for real clinic (update SMS template, voice prompts)
2. Add staff notification (email/Slack when emergency)
3. Connect to real appointment system
4. Add call recording storage
5. Build dashboard for request tracking

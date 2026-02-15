# VAPI Setup Guide

## Overview
Configure your existing VAPI assistant to send appointment data to the n8n workflow.

**Estimated Time:** 10 minutes

**Important:** Keep your existing system prompt (Alex dental assistant). This guide only covers webhook integration settings.

---

## Prerequisites

- [ ] VAPI account with existing assistant (Alex prompt already configured)
- [ ] Access to VAPI Dashboard (https://vapi.ai)
- [ ] n8n workflow deployed and active

---

## Step 1: Access Your VAPI Assistant

1. Log in to https://vapi.ai
2. Navigate to **Assistants** in the left sidebar
3. Click on your existing assistant to edit it

---

## Step 2: Keep Your Existing Configuration

**Do NOT change:**
- Your existing system prompt (Alex dental assistant)
- Model settings
- Voice settings (Maya / ElevenLabs)

Your current prompt already collects all required data:
- Patient name (with spelling confirmation)
- Mobile number
- Appointment type / reason
- Preferred date/time
- New vs existing patient

---

## Step 3: Configure Server URL (Critical)

In the **Server** section:

1. **Server URL**: `https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment`
2. **Server URL Secret**: `<VAPI_WEBHOOK_SECRET>`

⚠️ **Important**: The secret must match exactly what's configured in your n8n webhook node.

---

## Step 4: Configure Analysis Plan (Structured Data Extraction)

In the **Analysis** section, enable structured data extraction so VAPI sends parsed appointment data to n8n.

### 4.1 Enable Structured Data
Toggle ON **Structured Data Extraction**

### 4.2 Add Extraction Prompt
```
Extract the following from the call transcript:
- patientName: The caller's full name (as confirmed/spelled)
- patientPhone: The caller's mobile number (digits only, with country code if provided)
- requestedDateTime: The preferred appointment date and time
- reason: The appointment type or reason for visit
- isNewPatient: true if first visit, false if existing patient

Return as JSON. Use null for any field not clearly provided.
```

### 4.3 Add Schema
```json
{
  "type": "object",
  "properties": {
    "patientName": { "type": "string" },
    "patientPhone": { "type": "string" },
    "requestedDateTime": { "type": "string" },
    "reason": { "type": "string" },
    "isNewPatient": { "type": "boolean" }
  }
}
```

---

## Step 5: Verify Recording & Transcription

Ensure these are enabled (should already be ON):
- [ ] Call Recording
- [ ] Transcription
- [ ] End Call Function (sends data to webhook when call ends)

---

## Step 6: Save and Test

1. Click **Save** to update your assistant
2. Use VAPI's built-in test call feature
3. Verify the webhook is receiving data (check n8n executions)

---

## What You Changed (Summary)

| Setting | Value |
|---------|-------|
| Server URL | `https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment` |
| Server URL Secret | `<VAPI_WEBHOOK_SECRET>` |
| Structured Data | Enabled with extraction prompt |

**What you kept unchanged:**
- System prompt (Alex dental assistant)
- Model settings
- Voice settings (Maya)
- First/End messages

---

## Troubleshooting

### Webhook Not Receiving Data
- Verify Server URL is exactly: `https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment`
- Check Server URL Secret matches n8n configuration
- Ensure n8n workflow is **Active**

### Structured Data Not Extracting
- Verify Analysis Plan is enabled
- Check the extraction prompt is correctly formatted
- Test with a clear, complete conversation

### Data Fields Missing
Your Alex prompt collects data throughout the conversation. If fields are null:
- Patient may not have provided the info
- Extraction prompt may need adjustment
- Check transcript in n8n execution logs

---

## Next Steps

After VAPI is configured:
1. [ ] Test with a real phone call
2. [ ] Verify data appears in Google Sheets
3. [ ] Confirm SMS is received
4. [ ] Run through all test scenarios

---

**Note:** The `assistant-config.json` file contains a reference configuration. Your existing Alex prompt is more comprehensive - keep using it.

# Payload Contract & Data Structures

## Overview
This document defines all data structures and API contracts for the Appointment Request Concierge workflow.

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         APPOINTMENT REQUEST FLOW                             │
└─────────────────────────────────────────────────────────────────────────────┘

  Patient Call                VAPI                        n8n Workflow
       │                       │                               │
       │   Voice Conversation  │                               │
       │──────────────────────>│                               │
       │                       │                               │
       │                       │   POST /webhook/vapi-appointment
       │                       │   (end-of-call-report)        │
       │                       │──────────────────────────────>│
       │                       │                               │
       │                       │                      ┌────────┴────────┐
       │                       │                      │ Extract Data    │
       │                       │                      └────────┬────────┘
       │                       │                               │
       │                       │                      ┌────────┴────────┐
       │                       │                      │ Classify Urgency│
       │                       │                      │    (OpenAI)     │
       │                       │                      └────────┬────────┘
       │                       │                               │
       │                       │                      ┌────────┴────────┐
       │                       │                      │ Save to Sheets  │
       │                       │                      └────────┬────────┘
       │                       │                               │
       │                       │                      ┌────────┴────────┐
       │                       │                      │ Send SMS        │
       │                       │                      │   (Twilio)      │
       │                       │                      └────────┬────────┘
       │                       │                               │
       │   SMS Confirmation    │<──────────────────────────────│
       │<──────────────────────│                               │
       │                       │                               │
       │                       │   { success: true }           │
       │                       │<──────────────────────────────│
       │                       │                               │
```

---

## 1. VAPI → n8n Webhook Payload

### Endpoint
```
POST https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment
```

### Headers
```
Content-Type: application/json
x-vapi-secret: <VAPI_WEBHOOK_SECRET>
```

### Request Body (end-of-call-report)
```json
{
  "message": {
    "type": "end-of-call-report",
    "call": {
      "id": "call_abc123xyz",
      "orgId": "org_xxx",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "endedAt": "2024-01-15T10:33:45.000Z",
      "type": "inboundPhoneCall",
      "status": "ended",
      "endedReason": "customer-ended-call",
      "customer": {
        "number": "+61412345678"
      },
      "metadata": {
        "patientName": "John Smith",
        "patientPhone": "+61412345678",
        "requestedDateTime": "Monday 2pm",
        "reason": "Annual check-up"
      }
    },
    "transcript": "AI: Hello! Thank you for calling...\nUser: Hi, I'd like to book an appointment...",
    "summary": "Patient John Smith called to request an appointment for Monday 2pm for an annual check-up.",
    "analysis": {
      "structuredData": {
        "patientName": "John Smith",
        "patientPhone": "+61412345678",
        "requestedDateTime": "Monday 2pm",
        "reason": "Annual check-up"
      },
      "successEvaluation": "success"
    }
  }
}
```

### Field Locations (Fallback Priority)
| Field | Primary Path | Fallback 1 | Fallback 2 | Default |
|-------|-------------|------------|------------|---------|
| callId | message.call.id | call.id | - | "unknown-" + timestamp |
| patientName | message.analysis.structuredData.patientName | message.call.metadata.patientName | - | "Unknown Patient" |
| patientPhone | message.analysis.structuredData.patientPhone | message.call.customer.number | - | "Unknown" |
| requestedDateTime | message.analysis.structuredData.requestedDateTime | message.call.metadata.requestedDateTime | - | "To be confirmed" |
| reason | message.analysis.structuredData.reason | message.call.metadata.reason | - | "General appointment" |
| transcript | message.transcript | transcript | - | "No transcript available" |

---

## 2. n8n → OpenAI Request

### Endpoint
```
POST https://api.openai.com/v1/chat/completions
```

### Request Body
```json
{
  "model": "gpt-3.5-turbo",
  "temperature": 0.1,
  "max_tokens": 10,
  "messages": [
    {
      "role": "user",
      "content": "You are a medical urgency classifier. Classify the following appointment reason into exactly one category: routine, urgent, or emergency.\n\nClassification Rules:\n- EMERGENCY: severe pain, chest pain, difficulty breathing, heavy bleeding, loss of consciousness, stroke symptoms, severe allergic reaction\n- URGENT: fever, infection signs, moderate pain, worsening symptoms, minor injuries requiring same-day attention\n- ROUTINE: check-ups, follow-ups, vaccinations, preventive care, prescription refills, minor concerns\n\nAppointment Reason: Annual check-up\n\nRespond with ONLY one word: routine, urgent, or emergency"
    }
  ]
}
```

### Response Body
```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "routine"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 1,
    "total_tokens": 151
  }
}
```

### Urgency Classification Rules

| Category | Keywords/Symptoms |
|----------|-------------------|
| **emergency** | severe pain, chest pain, difficulty breathing, heavy bleeding, loss of consciousness, stroke symptoms, severe allergic reaction, heart attack |
| **urgent** | fever, infection, moderate pain, worsening symptoms, minor injuries, swelling, rash spreading, vomiting |
| **routine** | check-up, follow-up, vaccination, preventive care, prescription refill, minor concern, wellness visit |

---

## 3. n8n → Google Sheets Mapping

### Sheet Configuration
- **Document ID**: `1hUBJx6sq3Yx60JKcBQ3yin-n1xp_Hgh0ANjEwkwPq08`
- **Sheet Name**: `Appointments`
- **Operation**: Append Row

### Column Mapping

| Column | Header | Source | Example |
|--------|--------|--------|---------|
| A | Timestamp | `new Date().toISOString()` | 2024-01-15T10:33:45.000Z |
| B | Call ID | `message.call.id` | call_abc123xyz |
| C | Patient Name | structuredData.patientName | John Smith |
| D | Phone | structuredData.patientPhone | +61412345678 |
| E | Requested Date/Time | structuredData.requestedDateTime | Monday 2pm |
| F | Reason | structuredData.reason | Annual check-up |
| G | Urgency | OpenAI classification (lowercase) | routine |
| H | Status | Static value | new |
| I | Notes | Empty | |

---

## 4. n8n → Twilio SMS Request

### Endpoint
```
POST https://api.twilio.com/2010-04-01/Accounts/<TWILIO_ACCOUNT_SID>/Messages.json
```

### Authentication
```
Basic Auth:
  Username: <TWILIO_ACCOUNT_SID>
  Password: <TWILIO_AUTH_TOKEN>
```

### Request Body (Form URL Encoded)
```
From=+61485004338
To=+61412345678
Body=Hi John, thanks for calling. We received your appointment request for Monday 2pm. A team member will call you within 2 hours to confirm. Reply STOP to opt out.
```

### Response Body
```json
{
  "sid": "SMxxxxx",
  "date_created": "Mon, 15 Jan 2024 10:33:50 +0000",
  "date_updated": "Mon, 15 Jan 2024 10:33:50 +0000",
  "date_sent": null,
  "account_sid": "<TWILIO_ACCOUNT_SID>",
  "to": "+61412345678",
  "from": "+61485004338",
  "body": "Hi John, thanks for calling...",
  "status": "queued",
  "direction": "outbound-api"
}
```

### SMS Template Variables
```
Hi {FirstName}, thanks for calling. We received your appointment request for {RequestedDateTime}. A team member will call you within 2 hours to confirm. Reply STOP to opt out.
```

| Variable | Source | Transformation |
|----------|--------|----------------|
| {FirstName} | patientName | `patientName.split(' ')[0]` |
| {RequestedDateTime} | requestedDateTime | As-is |

---

## 5. n8n → VAPI Response

### Response Body
```json
{
  "success": true,
  "callId": "call_abc123xyz",
  "patientName": "John Smith",
  "urgency": "routine",
  "message": "Appointment request processed successfully",
  "timestamp": "2024-01-15T10:33:45.000Z"
}
```

---

## Error Handling

### Webhook Authentication Failed
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or missing x-vapi-secret header"
}
```

### OpenAI Classification Failed
- **Fallback**: Default to "routine" urgency
- **Logging**: Error logged in n8n execution

### Google Sheets Failed
- **Behavior**: Continue to SMS (don't block patient communication)
- **Logging**: Error logged, manual intervention needed

### Twilio SMS Failed
- **Behavior**: Return success to VAPI (call data is logged)
- **Logging**: Error logged, staff can manually contact patient

### Missing Required Fields
| Field | Fallback Value |
|-------|---------------|
| patientName | "Unknown Patient" |
| patientPhone | "Unknown" (SMS skipped) |
| requestedDateTime | "To be confirmed" |
| reason | "General appointment" |

---

## Reusability Notes

### For Future Capabilities

This contract can be adapted for:

1. **Capability 3 (Missed Call Recovery)**
   - Same Google Sheets structure
   - Different VAPI trigger (missed call event)
   - Modified SMS template

2. **Capability 4 (FAQ Bot)**
   - Same webhook structure
   - Add FAQ response logic
   - Skip Sheets/SMS for simple queries

3. **Multi-Client Deployment**
   - Add `clientId` to webhook path
   - Use different Sheet per client
   - Template SMS with client name

### Configuration Points
| Component | Config Location | Change For |
|-----------|-----------------|------------|
| Webhook URL | VAPI + n8n | New capability or client |
| Sheet ID | n8n workflow | New client |
| SMS Template | n8n workflow | Branding/messaging |
| Urgency Rules | OpenAI prompt | Medical specialty |
| Voice Prompt | VAPI config | Branding/flow |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-01-15 | Initial contract |

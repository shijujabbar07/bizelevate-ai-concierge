# Test Payloads

## Overview
5 ready-to-use test payloads for validating the Appointment Request Concierge workflow.

**Important:** Replace `+61412345678` with your real phone number to receive test SMS.

---

## How to Use

### Using cURL
```bash
curl -X POST https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment \
  -H "Content-Type: application/json" \
  -H "x-vapi-secret: <VAPI_WEBHOOK_SECRET>" \
  -d '{...payload...}'
```

### Using Postman
1. Create new POST request
2. URL: `https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment`
3. Headers:
   - `Content-Type: application/json`
   - `x-vapi-secret: <VAPI_WEBHOOK_SECRET>`
4. Body: Raw JSON (copy payload below)
5. Send

### Using Hoppscotch (hopscotch.io)
1. Go to https://hoppscotch.io
2. Set method to **POST**
3. Enter URL: `https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment`
4. Click **Headers** tab and add:
   | Header | Value |
   |--------|-------|
   | Content-Type | application/json |
   | x-vapi-secret | <VAPI_WEBHOOK_SECRET> |
5. Click **Body** tab:
   - Select **Raw**
   - Set content type to **application/json**
   - Paste the test payload JSON
6. Click **Send**
7. Check response in the right panel (should see `{"success": true, ...}`)

### Using n8n Test
1. Open workflow in n8n
2. Click "Test Workflow"
3. Manually trigger with test data

---

## Test 1: Routine Appointment (Annual Check-up)

**Expected Urgency:** `routine`

```json
{
  "message": {
    "type": "end-of-call-report",
    "call": {
      "id": "test_call_routine_001",
      "orgId": "org_bizelevate",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "endedAt": "2024-01-15T10:03:00.000Z",
      "type": "inboundPhoneCall",
      "status": "ended",
      "endedReason": "customer-ended-call",
      "customer": {
        "number": "+61412345678"
      }
    },
    "transcript": "AI: Hello! Thank you for calling. I'm here to help you request an appointment. May I have your full name please?\nUser: Hi, my name is Sarah Johnson.\nAI: Thank you, Sarah. And what's the best phone number to reach you on?\nUser: 0412 345 678\nAI: Got it. Let me confirm - that's 0412 345 678. Is that correct?\nUser: Yes, that's right.\nAI: When would you like to come in? Please share your preferred date and time.\nUser: Next Tuesday morning would be great, around 10am if possible.\nAI: And briefly, what's the reason for your visit today?\nUser: Just my annual check-up, nothing urgent.\nAI: Perfect. I've recorded your appointment request for Tuesday 10am regarding your annual check-up. A staff member will call you within 2 hours to confirm. Is there anything else I can help you with?\nUser: No, that's all. Thank you!\nAI: Thank you for calling. Have a great day!",
    "summary": "Patient Sarah Johnson requested an appointment for Tuesday 10am for an annual check-up.",
    "analysis": {
      "structuredData": {
        "patientName": "Sarah Johnson",
        "patientPhone": "+61412345678",
        "requestedDateTime": "Tuesday 10am",
        "reason": "Annual check-up"
      },
      "successEvaluation": "success"
    }
  }
}
```

**Expected Results:**
- [ ] Urgency classified as "routine"
- [ ] Row added to Google Sheet
- [ ] SMS sent: "Hi Sarah, thanks for calling..."

---

## Test 2: Urgent Appointment (Fever and Headache)

**Expected Urgency:** `urgent`

```json
{
  "message": {
    "type": "end-of-call-report",
    "call": {
      "id": "test_call_urgent_002",
      "orgId": "org_bizelevate",
      "createdAt": "2024-01-15T11:00:00.000Z",
      "endedAt": "2024-01-15T11:04:00.000Z",
      "type": "inboundPhoneCall",
      "status": "ended",
      "endedReason": "customer-ended-call",
      "customer": {
        "number": "+61412345678"
      }
    },
    "transcript": "AI: Hello! Thank you for calling. I'm here to help you request an appointment. May I have your full name please?\nUser: Michael Chen.\nAI: Thank you, Michael. And what's the best phone number to reach you on?\nUser: 0412 345 678\nAI: Got it. When would you like to come in?\nUser: As soon as possible, today if you can.\nAI: And briefly, what's the reason for your visit today?\nUser: I've had a fever since yesterday and a really bad headache. It's getting worse.\nAI: I understand. I've recorded your appointment request for today as soon as possible regarding fever and headache. A staff member will call you within 2 hours to confirm. Given your symptoms, if they worsen significantly, please consider visiting urgent care.\nUser: Okay, thank you.",
    "summary": "Patient Michael Chen needs urgent appointment for fever and worsening headache.",
    "analysis": {
      "structuredData": {
        "patientName": "Michael Chen",
        "patientPhone": "+61412345678",
        "requestedDateTime": "Today ASAP",
        "reason": "Fever since yesterday and bad headache, getting worse"
      },
      "successEvaluation": "success"
    }
  }
}
```

**Expected Results:**
- [ ] Urgency classified as "urgent"
- [ ] Row added to Google Sheet with "urgent" in Urgency column
- [ ] SMS sent to patient

---

## Test 3: Emergency (Chest Pain)

**Expected Urgency:** `emergency`

```json
{
  "message": {
    "type": "end-of-call-report",
    "call": {
      "id": "test_call_emergency_003",
      "orgId": "org_bizelevate",
      "createdAt": "2024-01-15T12:00:00.000Z",
      "endedAt": "2024-01-15T12:02:00.000Z",
      "type": "inboundPhoneCall",
      "status": "ended",
      "endedReason": "customer-ended-call",
      "customer": {
        "number": "+61412345678"
      }
    },
    "transcript": "AI: Hello! Thank you for calling. I'm here to help you request an appointment. May I have your full name please?\nUser: Robert Williams. I need to see someone urgently.\nAI: I understand, Robert. What's happening?\nUser: I've been having chest pain and difficulty breathing for the past hour.\nAI: Robert, chest pain and difficulty breathing can be serious. If you're experiencing these symptoms right now, I strongly recommend calling 000 or going to your nearest emergency department immediately. Would you like me to still record this for a follow-up appointment?\nUser: Yes, please. I'll go to emergency but want a follow-up.\nAI: I've noted your request. Please seek emergency care immediately for your chest pain and breathing difficulty.",
    "summary": "Patient Robert Williams reporting chest pain and difficulty breathing - advised to seek emergency care.",
    "analysis": {
      "structuredData": {
        "patientName": "Robert Williams",
        "patientPhone": "+61412345678",
        "requestedDateTime": "Urgent - after emergency visit",
        "reason": "Chest pain and difficulty breathing for past hour"
      },
      "successEvaluation": "success"
    }
  }
}
```

**Expected Results:**
- [ ] Urgency classified as "emergency"
- [ ] Row added with "emergency" urgency (should show red if conditional formatting applied)
- [ ] SMS sent

---

## Test 4: Minimal Data (Fallback Test)

**Expected Behavior:** Should use fallback values where data is missing

```json
{
  "message": {
    "type": "end-of-call-report",
    "call": {
      "id": "test_call_minimal_004",
      "orgId": "org_bizelevate",
      "createdAt": "2024-01-15T13:00:00.000Z",
      "endedAt": "2024-01-15T13:01:30.000Z",
      "type": "inboundPhoneCall",
      "status": "ended",
      "endedReason": "customer-ended-call",
      "customer": {
        "number": "+61412345678"
      }
    },
    "transcript": "AI: Hello! Thank you for calling.\nUser: Hi, I need an appointment.\nAI: May I have your name?\nUser: [unclear]\nAI: And your phone number?\nUser: You have it from caller ID.\nAI: When would you like to come in?\nUser: Whenever.\nAI: What's the reason for your visit?\nUser: Just need to see the doctor.\n[call disconnected]",
    "summary": "Incomplete call - minimal information collected.",
    "analysis": {
      "structuredData": {
        "patientName": null,
        "patientPhone": null,
        "requestedDateTime": null,
        "reason": "Just need to see the doctor"
      },
      "successEvaluation": "partial"
    }
  }
}
```

**Expected Results:**
- [ ] Patient Name: "Unknown Patient" (fallback)
- [ ] Phone: Uses customer.number from call object (+61412345678)
- [ ] Requested DateTime: "To be confirmed" (fallback)
- [ ] Reason: "Just need to see the doctor"
- [ ] Urgency: "routine" (general request)
- [ ] SMS still sent to caller ID number

---

## Test 5: Follow-up Appointment

**Expected Urgency:** `routine`

```json
{
  "message": {
    "type": "end-of-call-report",
    "call": {
      "id": "test_call_followup_005",
      "orgId": "org_bizelevate",
      "createdAt": "2024-01-15T14:00:00.000Z",
      "endedAt": "2024-01-15T14:03:30.000Z",
      "type": "inboundPhoneCall",
      "status": "ended",
      "endedReason": "customer-ended-call",
      "customer": {
        "number": "+61487654321"
      }
    },
    "transcript": "AI: Hello! Thank you for calling. I'm here to help you request an appointment. May I have your full name please?\nUser: Emily Watson.\nAI: Thank you, Emily. And what's the best phone number to reach you on?\nUser: 0487 654 321\nAI: Got it. Let me confirm - that's 0487 654 321. Is that correct?\nUser: Yes.\nAI: When would you like to come in?\nUser: Dr. Smith asked me to come back in two weeks for a follow-up. So around the 29th?\nAI: And briefly, what's the reason for your visit today?\nUser: Follow-up appointment after my blood test results. Dr. Smith wanted to review them with me.\nAI: Perfect. I've recorded your appointment request for January 29th for a follow-up to review blood test results with Dr. Smith. A staff member will call you within 2 hours to confirm.",
    "summary": "Patient Emily Watson requesting follow-up appointment to review blood test results with Dr. Smith.",
    "analysis": {
      "structuredData": {
        "patientName": "Emily Watson",
        "patientPhone": "+61487654321",
        "requestedDateTime": "January 29th",
        "reason": "Follow-up appointment to review blood test results with Dr. Smith"
      },
      "successEvaluation": "success"
    }
  }
}
```

**Expected Results:**
- [ ] Urgency classified as "routine" (follow-up)
- [ ] Row added to Google Sheet
- [ ] SMS sent to +61487654321: "Hi Emily, thanks for calling..."

---

## Validation Checklist

After running all tests, verify:

### n8n Execution
- [ ] All 5 executions show green (success)
- [ ] No errors in execution logs
- [ ] Response returned to webhook in all cases

### Google Sheets
- [ ] 5 new rows added
- [ ] Urgency column shows: routine, urgent, emergency, routine, routine
- [ ] All timestamps are populated
- [ ] Status column shows "new" for all

### SMS Delivery
- [ ] Received SMS for all tests where phone was provided
- [ ] First name correctly extracted
- [ ] Requested date/time included in message

### Error Handling
- [ ] Test 4 (minimal data) didn't break the workflow
- [ ] Fallback values applied correctly

---

## Quick cURL Commands

### Test 1 - Routine
```bash
curl -X POST https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment \
  -H "Content-Type: application/json" \
  -H "x-vapi-secret: <VAPI_WEBHOOK_SECRET>" \
  -d '{"message":{"type":"end-of-call-report","call":{"id":"test_routine","customer":{"number":"+61412345678"}},"analysis":{"structuredData":{"patientName":"Sarah Johnson","patientPhone":"+61412345678","requestedDateTime":"Tuesday 10am","reason":"Annual check-up"}}}}'
```

### Test 2 - Urgent
```bash
curl -X POST https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment \
  -H "Content-Type: application/json" \
  -H "x-vapi-secret: <VAPI_WEBHOOK_SECRET>" \
  -d '{"message":{"type":"end-of-call-report","call":{"id":"test_urgent","customer":{"number":"+61412345678"}},"analysis":{"structuredData":{"patientName":"Michael Chen","patientPhone":"+61412345678","requestedDateTime":"Today ASAP","reason":"Fever and bad headache getting worse"}}}}'
```

### Test 3 - Emergency
```bash
curl -X POST https://bizelevate1.app.n8n.cloud/webhook/vapi-appointment \
  -H "Content-Type: application/json" \
  -H "x-vapi-secret: <VAPI_WEBHOOK_SECRET>" \
  -d '{"message":{"type":"end-of-call-report","call":{"id":"test_emergency","customer":{"number":"+61412345678"}},"analysis":{"structuredData":{"patientName":"Robert Williams","patientPhone":"+61412345678","requestedDateTime":"Urgent","reason":"Chest pain and difficulty breathing"}}}}'
```

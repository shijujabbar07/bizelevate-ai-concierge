# AI Appointment Setter – Canonical BizElevate Workflow

## Status
Client-ready

## Problem
Clinics miss calls during busy hours, leading to lost bookings and frustrated patients.

## BizElevate Promise
Never miss a call. Capture intent, confirm details, notify staff, and request appointments automatically.

## Happy Path
1. Call received by AI voice agent
2. AI discloses it is an AI assistant
3. Caller intent identified (new, reschedule, cancel)
4. Caller details confirmed
5. Appointment request captured (no live booking)
6. Staff notified via SMS / email
7. Confirmation sent to caller

## Failure Paths
- Caller unclear → fallback to staff callback
- Booking system unavailable → request logged and acknowledged
- Speech recognition fails → repeat once, then escalate

## What This Does NOT Do (Phase 1)
- No live calendar writes
- No PMS / EMR integrations
- No clinical advice

## Tools
- Voice agent (VAPI or Twilio)
- Webhook
- n8n
- SMS / Email

## Demo Narrative
“Even when your clinic is busy, this assistant answers every call, captures intent, and makes sure your staff never miss a booking.”

## Why This Sells
- Immediate value
- Low risk
- No disruption to existing systems

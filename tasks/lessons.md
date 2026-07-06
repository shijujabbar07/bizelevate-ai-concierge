# Lessons

## 2026-07-06 — Verify n8n data shapes from execution data, never from existing expressions

**What happened:** Added a reception-alert gate that copied the existing
`$('Fetch Client Config').item.json[0]?.field` pattern. The gate silently
routed everything to false. n8n's HTTP Request node unwraps a single-row
Supabase array, so item json IS the row object — every `json[0]` reference
in the workflow had been evaluating to undefined for months. The original
reception alert had never actually sent (empty To, Twilio 400, masked by
`onError: continueRegularOutput`).

**Rules:**
1. Before writing any n8n expression that reads another node's output,
   pull a real execution (`/api/v1/executions/{id}?includeData=true`) and
   look at the actual item json shape. Existing expressions in the workflow
   are not evidence they work — they may have been silently failing.
2. Treat `onError: continueRegularOutput` on side-effect nodes (SMS, email)
   as a red flag during review: it hides delivery failures. Check the
   node's execution output for errors even when the run shows "success".
3. After deploying a workflow change, verify with a real execution
   (replay the webhook payload from a past execution), not just by
   inspecting wiring. Wiring can be correct while expressions return
   undefined.

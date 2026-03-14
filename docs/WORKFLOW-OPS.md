# n8n Workflow Operations — Claude Reference

**This file is a Claude Code reference** for workflow architecture and operations patterns.
For weekly monitoring, see [docs/GUIDE.md](GUIDE.md) → Weekly Operations Check.

---

## Guiding Principles

1. **Core write first, side effects second** — Supabase record is the durable log. SMS and notifications follow and are best-effort.
2. **Fail loudly, recover cleanly** — errors go to Slack immediately. Executions are retryable.
3. **Nothing touches prod directly** — all changes flow DEV → STAGING → PROD, validated at each stage.
4. **Workflows are stateless** — no shared state between executions. Each run is independent.
5. **Config in Supabase, logic in n8n** — client-specific values live in the `clients` table.

---

## Active Workflows

| Workflow | n8n ID | Webhook path | Status |
|----------|--------|-------------|--------|
| CustomerReach Answer | `HKHwb6mpWdvGcR070E8or` | `/webhook/vapi-appointment` | Active |
| CustomerReach Respond | `W9lssqC5Jvd3nIVo` | `/webhook/missed-call` | Active |
| SMS Reply Handler | `q4CYSzFYuYfp1eWa` | `/webhook/sms-reply` | Active |
| BizElevate Error Handler | `jH1zMn2CbFpDX3PY` | — | Active (error workflow) |

---

## Error Handling Architecture

Every production workflow has its **Error Workflow** set to `BizElevate Error Handler`.

**Error Handler does:**
1. Receives: workflow name, execution ID, error message, last node
2. Formats a Slack alert
3. Posts to `#bizelevate-ops` (credential: `VurKfpPzTuq3sbP2`)

**Supabase write nodes:** retry 3 times, 30s apart, then fail → Error Handler fires.
**SMS nodes:** do NOT retry — duplicate SMS to a patient is worse than a missed notification.

Execution retention: **30 days** for failed executions (allows manual replay).

---

## Deployment Pipeline

```
[DEV] workflow → [STAGING] workflow → prod workflow
```

All three environments share one n8n instance (`bizelevate1.app.n8n.cloud`). Environment isolation is enforced by workflow name prefixes, credential names, and webhook paths — not by separate infrastructure. This is a **temporary operating model**.

Full naming conventions, credential rules, and promotion checklist: **`supabase/ENVIRONMENTS.md`** — that document is the authoritative reference. This section covers only the operational rules that apply during workflow execution and deployment.

### Environment Webhook URLs

| Capability | DEV | STAGING | PROD |
|------------|-----|---------|------|
| CustomerReach Answer | `.../webhook/vapi-appointment-dev` | `.../webhook/vapi-appointment-staging` | `.../webhook/vapi-appointment` |
| CustomerReach Respond | `.../webhook/missed-call-dev` | `.../webhook/missed-call-staging` | `.../webhook/missed-call` |
| SMS Reply Handler | `.../webhook/sms-reply-dev` | `.../webhook/sms-reply-staging` | `.../webhook/sms-reply` |

### Change Management Rules

| Rule | Detail |
|------|--------|
| No skipping stages | Every change goes DEV → STAGING → PROD. Never promote from DEV directly to prod. |
| Prod edits are risky | Treat any production workflow change as a high-risk operation. See the Hotfix procedure below. |
| Git is source of truth | After any prod promotion, export the workflow JSON from n8n and commit it to Git. |
| Partial updates preferred | Use `n8n_update_partial_workflow` for node-level changes instead of full replacement. |
| Test payloads first | Always send a test payload and confirm the execution succeeded before declaring a promotion done. |
| No hard-coded client values | Client names, phones, hours — all come from the `clients` Supabase table. |
| Active hours caution | During business hours, treat production workflow changes as potentially disruptive — a broken prod workflow means missed calls or failed SMS for a live client. |

---

## Production Deployment Runbook

There are two scenarios: **Feature Promotion** (the normal path) and **Emergency Hotfix** (for production breakage).

---

### Scenario A — Feature Promotion (Normal Path)

Use this when you have built and tested a change in `[DEV]` and want it live in production.

**Step 1 — Verify DEV is green**
- [ ] `[DEV]` workflow passes a manual test execution with no errors
- [ ] Supabase writes land in `bizelevate-dev` (not prod — check the URL in the Supabase credential)
- [ ] SMS output is as expected (Twilio test number or dev number only)

**Step 2 — Apply any Supabase migrations first**

> Schema changes must reach prod **before** the workflow that depends on them. Never activate a prod workflow that references a column or table that does not yet exist.

- [ ] If a migration is needed: apply it to dev → preprod → prod in that order
- [ ] Follow the Migration Promotion Runbook in `supabase/ENVIRONMENTS.md`
- [ ] Confirm the migration is applied to prod before proceeding

**Step 3 — Promote DEV → STAGING**
- [ ] Duplicate the `[DEV]` workflow in the n8n UI
- [ ] Rename: replace `[DEV]` with `[STAGING]`
- [ ] Audit every node: swap all `[DEV] *` credentials for `[STAGING] *` equivalents
- [ ] Update webhook path: replace `-dev` suffix with `-staging`
- [ ] Update the VAPI staging assistant to point at the `-staging` webhook URL (if VAPI-triggered)
- [ ] Run a test execution — confirm Supabase writes go to `bizelevate-preprod`
- [ ] Activate the `[STAGING]` workflow

**Step 4 — Verify STAGING with realistic data**
- [ ] Send a realistic test payload (not just a trivial ping)
- [ ] For CustomerReach Respond: POST to the staging webhook with real-looking `From`, `To`, `CallStatus` fields
- [ ] For CustomerReach Answer: trigger via the VAPI staging assistant and complete a short test call
- [ ] Confirm SMS arrives at the test number with correct content
- [ ] Confirm the `call_logs` row in `bizelevate-preprod` is correct

**Step 5 — Promote STAGING → PROD**

> Only proceed if staging is green. This step touches live infrastructure.

- [ ] **Do NOT deactivate the existing prod workflow yet** — keep it as fallback
- [ ] Duplicate the `[STAGING]` workflow in the n8n UI
- [ ] Rename: remove `[STAGING]` prefix entirely (production workflows have no prefix)
- [ ] Audit every node: swap all `[STAGING] *` credentials for production credentials (`Supabase Production`, `Twilio`, etc.)
- [ ] Update webhook path: remove the `-staging` suffix
- [ ] Point the production VAPI assistant at the production webhook URL — double-check, this is live
- [ ] Set the **Error Workflow** on the new workflow to `BizElevate Error Handler` (`jH1zMn2CbFpDX3PY`)
- [ ] Activate the new prod workflow

**Step 6 — Verify before cutting over**
- [ ] Send a controlled test payload to the prod webhook (use a test phone number you control)
- [ ] Confirm the execution succeeds in n8n
- [ ] Confirm Supabase write lands in `bizelevate-prod` (production project)
- [ ] Confirm SMS arrives with correct content
- [ ] Monitor the next 2–3 real executions in the n8n execution log

**Step 7 — Cut over and clean up**
- [ ] Only now: deactivate the **old** prod workflow
- [ ] Do not delete the old prod workflow — rename it `[ARCHIVED] Workflow Name vYYYY-MM-DD` and leave it inactive for 30 days
- [ ] Export the new prod workflow JSON from n8n and commit it to Git (replace the previous JSON file)

---

### Scenario B — Emergency Hotfix

Use this when a production workflow is broken and cannot wait for a full DEV → STAGING promotion cycle.

**Step 1 — Identify the failure**
- [ ] n8n → Executions → filter by the failing workflow → open the red execution
- [ ] Identify exactly which node failed and why (credential issue, schema mismatch, logic error, etc.)
- [ ] Determine if the fix is safe to apply without a full promotion cycle

**Step 2 — Contain the damage**
- If the prod workflow is actively failing on every execution: deactivate it temporarily to prevent noise in client data and Slack alerts
- If it fails only on edge cases and most executions succeed: leave it active and work quickly

**Step 3 — Build and test the fix in DEV**
- [ ] Duplicate the **production** workflow (not the `[DEV]` copy — use the current broken prod as the base to ensure you're fixing the right version)
- [ ] Rename it: `[DEV] Workflow Name - Hotfix YYYY-MM-DD`
- [ ] Swap all credentials to `[DEV]` equivalents, webhook path to `-dev`
- [ ] Apply the fix
- [ ] Run a test execution — confirm the fix resolves the issue

**Step 4 — Apply fix to production**

Two options — choose based on scope:

*Option A: Targeted node fix (small change, low risk)*
- Use `n8n_update_partial_workflow` via Claude / n8n MCP to update only the affected node(s) in the production workflow
- Verify the execution log — confirm next real execution succeeds
- Do not touch any other nodes

*Option B: Full replacement (larger change or credential swap)*
- Duplicate the hotfix `[DEV]` workflow
- Rename to the production name (no prefix), swap to prod credentials, update webhook path
- Activate it
- Reactivate the old prod workflow if it was deactivated (brief overlap is safe — handle it before cutover)
- Verify with a test payload
- Deactivate the old prod workflow
- Rename the old one `[ARCHIVED] Workflow Name vYYYY-MM-DD`

**Step 5 — Stabilise and backport**
- [ ] Monitor first 3 real executions — confirm clean
- [ ] Export and commit the updated JSON to Git
- [ ] Apply the same fix to the `[DEV]` and `[STAGING]` baseline copies so they don't diverge from prod

---

### Production Deployment Safety Checklist

Use this as a final check before activating any new prod workflow:

- [ ] Old prod workflow is still **active** — fallback available if new one fails
- [ ] All Supabase migrations required by this change are already applied to prod
- [ ] Every node uses **prod credentials** — no `[DEV]` or `[STAGING]` credential anywhere
- [ ] Webhook path has **no** `-dev` or `-staging` suffix
- [ ] VAPI assistant (if applicable) is pointing at the production webhook URL
- [ ] Error Workflow is set to `BizElevate Error Handler` (`jH1zMn2CbFpDX3PY`)
- [ ] Test payload sent — execution succeeded — Supabase write visible in production project
- [ ] It is **not** peak business hours for any live client (avoid promotions during 8am–6pm client timezone if possible)

---

## Recovery Runbook

### Workflow execution failed
1. n8n → Executions → filter by workflow → find the failed execution (red)
2. Click into it — inspect which node failed and why
3. Fix the root cause
4. Click **Retry** on the failed execution

### Supabase unreachable
- Supabase write nodes retry 3× (30s apart) before failing
- Error Handler fires → Slack alert
- Incoming webhooks still accepted (n8n queues them)
- Once Supabase recovers: replay failed executions from n8n UI — no data lost

### SMS failed but Supabase write succeeded
- Call log exists — data is safe
- Do NOT retry the full workflow (will duplicate the Supabase write)
- If critical: manually trigger from Twilio console

### Duplicate webhook received
- Currently creates a duplicate `call_logs` row — harmless for now
- Fix before 5 clients: add `call_sid` column, switch to UPSERT

---

## Tech Debt Register

| Item | Risk | Fix |
|------|------|-----|
| Duplicate rows on webhook retry | Low | Add `call_sid` / `vapi_call_id` column, switch to UPSERT |
| No webhook signature validation | Medium | Add VAPI secret header check + Twilio signature validation |
| Supabase error logging | Low | Add `workflow_errors` table + Error Handler write node |
| Manual weekly monitoring | Medium | Add n8n scheduled check workflow |

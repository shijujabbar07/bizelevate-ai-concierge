# Supabase Environment Strategy

## Overview

Three environments, each a separate Supabase project. No shared infrastructure between them.

| Environment | Purpose | Data | Schema changes | Direct SQL allowed |
|-------------|---------|------|---------------|-------------------|
| **dev**     | Local development, feature work | Seed data only | Any time | Yes |
| **preprod** | Staging / client demos / pre-release validation | Seed data, no real patients | Only after dev verified | Yes, with care |
| **prod**    | Live customer data | Real patient data | Only via numbered migration | **Never manually** |

---

## Supabase Project Registry

| Environment | Project Name | URL | Notes |
|------------|-------------|-----|-------|
| dev | bizelevate-dev | `<dev-url>.supabase.co` | Fill in when created |
| preprod | bizelevate-preprod | `<preprod-url>.supabase.co` | Fill in when created |
| prod | bizelevate-prod | `gdzpgimyjgfzhnwyojmz.supabase.co` | Current live project |

> Update this table whenever a new Supabase project is created.

---

## Migration Numbering Convention

```
migrations/
  001_create_clients.sql
  002_create_client_subscriptions.sql
  003_create_call_logs.sql
  004_add_action_status.sql      ← additive change, backward-safe
  005_...
```

- Always create a **new numbered file** for every schema change
- Never modify a migration that has already been applied to any environment
- Name clearly: `NNN_verb_subject.sql` (e.g. `005_add_rls_policies.sql`)
- Every migration must be **idempotent-safe**: use `IF NOT EXISTS`, `IF EXISTS`, `DO $$ ... $$` guards where possible

---

## Migration Promotion Runbook

### Step 1 — Write and apply to dev

```sql
-- In Supabase SQL editor (dev project)
-- Paste contents of the new migration file
-- Verify: table/column exists, data unaffected
```

- [ ] Migration applied to dev
- [ ] Dashboard tested locally against dev Supabase
- [ ] No regressions in existing queries

### Step 2 — Apply to preprod

```sql
-- In Supabase SQL editor (preprod project)
-- Same SQL as dev — copy exactly, no improvisation
```

- [ ] Migration applied to preprod
- [ ] Dashboard tested against preprod (npm run build:staging + preview)
- [ ] Demo flow tested end-to-end
- [ ] n8n staging workflows tested (if workflow changes required)

### Step 3 — Apply to production

> **Only proceed if preprod is green.**
> Once the first real customer is live, treat every production SQL as irreversible.

```sql
-- In Supabase SQL editor (prod project)
-- Paste the same migration file — never improvise inline
```

- [ ] Confirm preprod tested and signed off
- [ ] Screenshot or note current prod table state before applying
- [ ] Apply migration
- [ ] Verify column/index exists in prod
- [ ] Smoke-test dashboard against prod

---

## Schema Change Rules (post first customer)

| Allowed without review | Requires review |
|-----------------------|----------------|
| `ADD COLUMN ... DEFAULT NULL` | `DROP COLUMN` |
| `CREATE INDEX` | `ALTER COLUMN` type change |
| `CREATE TABLE` | Any `UPDATE`/`DELETE` on existing rows |
| `ADD CONSTRAINT` with check | `DROP TABLE` |

When in doubt: **add, never remove**. Deprecate old columns in code before dropping them from the schema.

---

## Seed Data

Seeds live in `supabase/seeds/` and are **only run on dev and preprod**.

```
supabase/seeds/
  001_demo_client.sql    ← demo client + 8 sample call_logs
```

**Never run seed scripts against production.**
Production data comes exclusively from real n8n workflow executions.

To reset dev or preprod to a clean state:
1. Clear `call_logs` table via Supabase UI (or `TRUNCATE call_logs;`)
2. Re-run seed: paste `001_demo_client.sql` in Supabase SQL editor
3. Check for existing `clients`/`client_subscriptions` rows first (seed uses INSERT, will fail on duplicate)

---

## Other Surfaces — Environment Parity

Each Supabase environment corresponds to matching environments on other surfaces.

| Surface | Dev | Preprod / Staging | Prod |
|---------|-----|-------------------|------|
| **Supabase** | bizelevate-dev | bizelevate-preprod | bizelevate-prod (`gdzpgimyjgfzhnwyojmz`) |
| **Dashboard** | `localhost` (npm run dev) | Staging URL (`build:staging`) | `dashboard.bizelevate.app` |
| **n8n instance** | ⚠️ Shared (`bizelevate1.app.n8n.cloud`) | ⚠️ Shared (same instance) | ⚠️ Shared (same instance) |
| **n8n workflows** | `[DEV] Workflow Name` | `[STAGING] Workflow Name` | `Workflow Name` (no prefix) |
| **n8n credentials** | `[DEV] Supabase`, `[DEV] Twilio`, etc. | `[STAGING] Supabase`, etc. | `Supabase Production`, `Twilio`, etc. |
| **VAPI assistant** | Alex - Dev | Alex - Staging | Alex (prod) |
| **Webhook URLs** | `.../webhook/[capability]-dev` | `.../webhook/[capability]-staging` | `.../webhook/[capability]` |
| **Twilio numbers** | Separate dev number (TBD) or test credentials | Separate staging number (TBD) | +61 485 034 338 (missed call), +61 485 004 338 (concierge) |

> n8n is currently a **shared instance**. Environment isolation is enforced by naming conventions and separate credentials — not by separate infrastructure.
> This is a temporary operating model. See "Target Future State for n8n" below.

---

## n8n Shared-Instance Operating Model (Temporary)

> **This model is temporary.** All three environments currently share one n8n instance: `https://bizelevate1.app.n8n.cloud`.
> Dedicated n8n-dev, n8n-preprod, and n8n-prod instances are the target. See "Target Future State for n8n" below.

### How Environments Are Separated on One Instance

Isolation is achieved through strict naming conventions, not infrastructure:

**Workflow names**
- Dev: `[DEV] Capability Name` (e.g. `[DEV] Missed Call Recovery`)
- Staging: `[STAGING] Capability Name`
- Prod: `Capability Name` — no prefix, unprefixed = production

**Credential names**
- Dev: `[DEV] Supabase`, `[DEV] Twilio`, `[DEV] VAPI Secret`, etc.
- Staging: `[STAGING] Supabase`, `[STAGING] Twilio`, etc.
- Prod: `Supabase Production`, `Twilio`, `VAPI Secret`, etc.
- Rule: never reuse a credential across environments. Create environment-specific credentials even if values differ only by Supabase URL/key.

**Webhook paths**
- Dev: `/webhook/missed-call-dev`, `/webhook/vapi-appointment-dev`
- Staging: `/webhook/missed-call-staging`, `/webhook/vapi-appointment-staging`
- Prod: `/webhook/missed-call`, `/webhook/vapi-appointment`

**VAPI assistants**
- Each environment has its own VAPI assistant pointing at its webhook URL.
- VAPI `Alex - Dev` → dev webhook path
- VAPI `Alex - Staging` → staging webhook path
- VAPI `Alex` (prod) → prod webhook path
- Never change a prod VAPI assistant's webhook URL during dev/staging work.

**Twilio numbers/config**
- Use a separate Twilio number for dev/staging testing where practical.
- If a shared number is unavoidable, route via StatusCallback URL to environment-specific webhook paths.
- Production numbers (+61 485 034 338, +61 485 004 338) must never be pointed at dev or staging webhooks.

### Risks of the Shared-Instance Model

| Risk | Likelihood | Impact |
|------|-----------|--------|
| Editing a prod workflow when intending to edit dev | Medium | High — live client affected |
| Using prod credentials in a dev workflow | Medium | High — writes to production Supabase |
| Dev/staging webhook receiving prod traffic (or vice versa) | Low | High — data loss or duplicate processing |
| Simultaneous edits to related workflows during a release | Medium | Medium — inconsistent state |
| Activating a dev workflow that shares a webhook path with prod | Low | High — double-processing |

### Required Controls for the Shared-Instance Phase

**Before editing any workflow:**
1. Confirm the workflow name prefix matches the intended environment.
2. Never open a prod (unprefixed) workflow for editing without a clear reason.
3. If editing prod, document the change intention before opening the workflow.

**Production workflow edit rules:**
- Test the change in `[DEV]` first. Promote to `[STAGING]`. Only then apply to prod.
- Prod workflow edits during active business hours require extra caution — coordinate with any active client.
- After a prod edit, verify with a controlled test execution before considering it done.
- If a prod workflow is broken and needs an emergency fix: duplicate it as `[DEV] Workflow Name - Hotfix`, fix and test there, then apply the fix to prod.

**Credential selection rules:**
- After creating or duplicating a workflow, immediately audit all nodes for credential assignment.
- Flag any node using `Supabase Production` in a `[DEV]` or `[STAGING]` workflow as a misconfiguration — fix before activating.

**Webhook and VAPI alignment rules:**
- When creating a dev or staging workflow, update ALL webhook-consuming nodes and verify the path ends in `-dev` or `-staging`.
- When creating a dev/staging VAPI assistant, immediately point its server URL at the correct environment webhook path. Do not reuse a prod URL.
- Maintain a webhook URL registry below (update this table as paths are created):

| Capability | Dev webhook | Staging webhook | Prod webhook |
|-----------|------------|----------------|-------------|
| Missed Call Recovery | `/webhook/missed-call-dev` | `/webhook/missed-call-staging` | `/webhook/missed-call` |
| SMS Reply Handler | `/webhook/sms-reply-dev` | `/webhook/sms-reply-staging` | `/webhook/sms-reply` |
| Appointment Concierge | `/webhook/vapi-appointment-dev` | `/webhook/vapi-appointment-staging` | `/webhook/vapi-appointment` |

---

## Promotion Rules

Promotion always flows in one direction: **Dev → Staging → Prod**. Never promote backwards or skip a stage.

### Dev → Staging

1. Dev workflow passes manual test execution with no errors.
2. Supabase writes confirmed against `bizelevate-dev` (correct project).
3. Duplicate the workflow in n8n. Rename: replace `[DEV]` with `[STAGING]`.
4. Update every credential reference: swap `[DEV] *` credentials for `[STAGING] *` equivalents.
5. Update webhook path: replace `-dev` suffix with `-staging`.
6. Point the staging VAPI assistant at the new staging webhook URL (if this workflow is VAPI-triggered).
7. Run a test execution in n8n. Verify Supabase writes land in `bizelevate-preprod`.
8. Activate the `[STAGING]` workflow. The `[DEV]` workflow can remain active in parallel.

### Staging → Prod

> Only proceed if staging is green and has been tested with realistic data.

1. Staging workflow has passed at least one end-to-end test with realistic input (not just happy-path synthetic data).
2. Confirm no schema migration is pending for prod (check `supabase/migrations/` — all files must be applied to prod before workflow promotion).
3. Duplicate the staging workflow. Rename: remove `[STAGING]` prefix entirely.
4. Update every credential reference: swap `[STAGING] *` for prod credentials (`Supabase Production`, etc.).
5. Update webhook path: remove `-staging` suffix.
6. Point the prod VAPI assistant at the prod webhook URL. Double-check — this is live.
7. Activate the new prod workflow.
8. Verify with a controlled test execution (call the number, trigger the webhook manually, etc.).
9. Monitor the first 3 real executions in the n8n execution log.
10. Do **not** deactivate the previous prod workflow until the new one is confirmed stable.

### Rollback

If a promoted prod workflow causes issues:
1. Deactivate the new prod workflow immediately.
2. Reactivate the previous version if it was kept (see step 10 above).
3. File the issue as a `[DEV]` fix before attempting re-promotion.

---

## Target Future State for n8n

The shared-instance model is a pragmatic short-term solution. The target architecture is **three separate n8n instances**:

| Instance | Maps to | When to create |
|----------|---------|---------------|
| `n8n-dev` | Dev environment | When first paying client is onboarded |
| `n8n-preprod` | Preprod / staging | When first paying client is onboarded |
| `n8n-prod` | Production | When first paying client is onboarded (migrate current instance) |

### Benefits of dedicated instances

- No naming-convention discipline required for environment isolation — the URL determines the environment.
- Credentials are instance-scoped by default — no risk of using wrong environment creds.
- Production workflows cannot be accidentally edited during dev work — different login/instance.
- Separate execution histories — prod logs are not polluted by dev test runs.
- Promotion via n8n export/import or API push (`n8n_update_full_workflow`) rather than manual duplication.

### Migration path from shared to dedicated

When ready to split:
1. Create `n8n-prod` as the new production instance.
2. Export all unprefixed (prod) workflows from the shared instance.
3. Import into `n8n-prod`, repoint all prod VAPI assistants and Twilio callbacks.
4. Validate with a test execution on the new instance.
5. Deactivate prod workflows on the shared instance (do not delete — keep for reference 30 days).
6. Rename the shared instance as `n8n-dev` for ongoing development use.
7. Create `n8n-preprod` as a separate staging instance.

> Until this migration happens, all three environments remain on `bizelevate1.app.n8n.cloud`
> and the shared-instance controls above are in effect.

---

## Dashboard Environment Variables (Vercel)

The management dashboard is deployed via Vercel. Each environment needs its own set of env vars pointing at the correct Supabase project.

| Variable | Dev (local `.env`) | Preprod | Prod |
|----------|-------------------|---------|------|
| `VITE_SUPABASE_URL` | `<dev-url>.supabase.co` | `<preprod-url>.supabase.co` | `https://gdzpgimyjgfzhnwyojmz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Dev project anon key | Preprod project anon key | Prod anon key (from Supabase → Project Settings → API) |
| `VITE_ENV` | `development` | `staging` | `production` |

> Each Supabase project generates its own anon key. Never reuse keys across environments.
> The `.env` file is gitignored. Only `.env.example` is committed.

Dashboard repo: `https://github.com/shijujabbar07/bizelevate-dashboard`
Full dashboard architecture and auth details: `docs/DASHBOARD-PLAYBOOK.md`

---

## Current State (as of 2026-03-13)

- **Supabase:** Production only (`gdzpgimyjgfzhnwyojmz`) — dev and preprod projects not yet created
- **Migrations:** 001–006 applied to prod (clients, subscriptions, call_logs, action_status, user_profiles, RLS)
- **Dashboard:** Live at `https://dashboard.bizelevate.app` — multi-client, RLS enforced
- **n8n:** Shared instance (`bizelevate1.app.n8n.cloud`) — **shared-instance operating model in effect**
  - Active prod workflows: Missed Call Recovery (`W9lssqC5Jvd3nIVo`), SMS Reply Handler (`q4CYSzFYuYfp1eWa`), Appointment Concierge (`HKHwb6mpWdvGcR070E8or`)
  - Dev and staging workflows not yet created — operating on prod-only for now
- **First customer:** Not yet landed — direct production SQL and workflow edits currently acceptable but follow controls above

### Next action when first customer lands:
1. Create `bizelevate-dev` and `bizelevate-preprod` Supabase projects
2. Run all migrations 001–006 on each
3. Run seed on dev and preprod only
4. Create dev and staging Vercel deployments for the dashboard with env vars pointing at each project
5. Create dev and staging n8n workflows (duplicate prod workflows, rename with prefix)
6. Create dev and staging VAPI assistants pointing at new webhook URLs
7. Update this registry with real project URLs
8. From that point: no direct production SQL, no direct production workflow edits

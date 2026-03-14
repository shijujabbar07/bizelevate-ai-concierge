# Deploy Gates

Two checklists in one file. Run the right section for what you're doing.

---

## A — Before Any Schema Change

Run every time you change the `call_logs`, `clients`, `client_subscriptions`, `user_profiles`, or `phone_number_map` tables.

### 1. Before writing any SQL

- [ ] Confirm the change is **additive** (new column, new table, new index)
- [ ] If removing or altering anything: confirm it is unused in all code and n8n workflows first
- [ ] Check `supabase/migrations/` for the highest existing number — use the next one

### 2. Write the migration file

- [ ] Create `supabase/migrations/NNN_verb_subject.sql`
  - Use clear naming: `011_add_callback_completed.sql`
- [ ] Add a file header comment: migration number, project name, purpose, dependencies
- [ ] Use `IF NOT EXISTS` / `IF EXISTS` guards where PostgreSQL allows
- [ ] Add `COMMENT ON COLUMN` for any non-obvious field
- [ ] Add a `CHECK` constraint for columns with fixed valid values
- [ ] Add an index if the column is used in `WHERE`, `ORDER BY`, or joins

**Example for a new nullable column:**
```sql
-- Migration: 011_add_example_field
-- Project:   bizelevate-concierge
-- Purpose:   Track X for reporting
-- Depends:   010

ALTER TABLE call_logs
  ADD COLUMN example_field text
    CHECK (example_field IN ('value_a', 'value_b'))
    DEFAULT null;

COMMENT ON COLUMN call_logs.example_field IS 'Description of what this tracks.';
```

### 3. Update TypeScript types (dashboard)

- [ ] Add the field to `CallLog` type in `bizelevate-dashboard/src/types/index.ts`
- [ ] Add any new enum type if needed
- [ ] Update `callLogService.ts` if the field needs to be read, written, or sorted
- [ ] Add badge/display component to `Badges.tsx` if the field is user-visible

### 4. Update seed data (if useful)

- [ ] If the new field adds demo variety: add example values to `supabase/seeds/001_demo_client.sql`
- [ ] Seed must remain runnable on a fresh dev or preprod database

### 5. Apply to dev → preprod → prod

**Dev:**
- [ ] Paste migration SQL in Supabase SQL editor (dev project)
- [ ] Confirm column/index exists in Table Editor
- [ ] Run dashboard locally (`npm run dev`) — no errors, new field works

**Preprod:**
- [ ] Paste same SQL in preprod SQL editor
- [ ] Run `npm run build:staging` and preview — staging build works
- [ ] Test the relevant flow end-to-end

**Prod (only after preprod is green):**
- [ ] Paste same SQL in prod SQL editor (`gdzpgimyjgfzhnwyojmz`)
- [ ] Confirm column/index exists
- [ ] Smoke-test dashboard on prod — no errors
- [ ] Commit the migration file to git

### 6. Update docs cascade

- [ ] `supabase/ENVIRONMENTS.md` — note migration number if significant
- [ ] `appointment-concierge/docs/PAYLOAD-CONTRACT.md` — update if field is written by n8n

---

## B — Before Promoting Any Change to Production

Run before every dev → preprod → prod promotion. Do not skip steps.

### 1. Schema (if applicable)

- [ ] Section A above is complete
- [ ] Migration applied to dev and preprod, both verified

### 2. Dashboard (if changed)

- [ ] Tested locally against dev Supabase (`npm run dev`)
- [ ] No TypeScript errors (`npm run lint`)
- [ ] All pages render without blank screens or console errors
- [ ] New features tested end-to-end
- [ ] Builds succeed:
  - Dev: `npm run build:dev`
  - Staging: `npm run build:staging`
  - Prod: `npm run build`

### 3. n8n workflows (if changed)

- [ ] Changes tested in `[DEV]` workflow first
- [ ] Test payload sent and execution verified in n8n
- [ ] Data lands in Supabase correctly (check `call_logs`)
- [ ] SMS sends correctly (or skips gracefully when phone is missing)
- [ ] Promoted to `[STAGING]` and re-tested before prod

### 4. VAPI assistant (if changed)

- [ ] No changes to Alex's system prompt unless explicitly required
- [ ] If webhook URL changed: VAPI assistant updated and saved
- [ ] If webhook secret rotated: n8n Header Auth credential updated to match
- [ ] Test call completed in VAPI dashboard (not a real patient call)

### 5. Environment config

- [ ] Correct `.env.*` file active for target environment
- [ ] No production credentials in dev/staging builds
- [ ] No dev/staging credentials in prod build

### 6. Final check before prod

- [ ] Preprod is fully green (all above steps passed)
- [ ] At least one real workflow execution tested on preprod
- [ ] Any seed data cleared from preprod if used for demo testing
- [ ] Team notified if change affects live workflows

---

**If any step fails: stop and fix before continuing.**
**Never go to prod if preprod has outstanding issues.**

---

## Schema Change Rules (post first customer)

| Allowed | Requires care |
|---------|--------------|
| `ADD COLUMN ... DEFAULT NULL` | `DROP COLUMN` |
| `CREATE INDEX` | `ALTER COLUMN` type change |
| `CREATE TABLE` | Any `UPDATE`/`DELETE` on existing rows |
| `ADD CONSTRAINT` with check | `DROP TABLE` |

When in doubt: **add, never remove**. Deprecate old columns in code before dropping from schema.

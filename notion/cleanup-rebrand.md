# Smile Dental → Riverside Dental + Alex → Casey — Full Rebrand Cleanup Playbook

**Created:** 2026-05-02
**Updated:** 2026-05-03 — added AI agent rename (Alex → Casey)
**Status:** Ready to execute
**Owner:** CJ
**Estimated time:** 100–130 minutes if no surprises (added ~10 min for agent rename)

---

## 1. Goal

Two parallel rebrands in one cleanup pass:

1. **Clinic brand:** Remove every reference to **Smile Dental** / **smile-dental** / **Smile Dental Campsie** from BizElevate's live infrastructure, repo, prompts, and Notion. Replace with **Riverside Dental** / **riverside-dental**.
2. **AI agent name:** Rename the voice agent from **Alex** to **Casey** across VAPI, n8n SMS templates, repo prompt files, and all docs.

**Why clinic rebrand:** Smile Dental is CJ's personal dentist (he and family are patients). The clinic has not consented to being used as a test brand. Using a real clinic's name in the Casey greeting, SMS sign-offs, and dashboard surfaces is a credibility, professional-ethics, and legal-hygiene problem. Must be cleaned before any prospect demo.

**Why agent rename:** CJ has multiple Amazon Alexa devices in the home office. The word "Alex" is close enough to "Alexa" that calls to the demo number wake up the smart speakers and disrupt every test. Casey was chosen because it's unisex (preserving the original design intent), has zero collision with Alexa/Siri/Cortana/Hey Google/Bixby, and reads naturally in a clinical greeting.

**Non-goals:**
- Renaming the second test client `clyde-north-dental` (already fictional — leave it).
- Changing any phone numbers, workflow IDs, VAPI assistant ID, or Supabase project ID.
- Touching `dashboard.bizelevate.app` UI code (no hardcoded references — all data-driven).
- Renaming the assistant config file in VAPI Dashboard's URL/ID — only the visible name and prompt content.

---

## 2. Brand Decisions

### 2.1 Clinic brand

| Field | Old | New |
|------|-----|-----|
| Display name | `Smile Dental Campsie` | `Riverside Dental` |
| Slug / `client_id` | `smile-dental` | `riverside-dental` |
| Calendly placeholder | `https://calendly.com/smile-dental-campsie` | `https://calendly.com/riverside-dental` |
| SMS sign-off | `– Smile Dental Team` | `– Riverside Dental Team` |

### 2.2 AI agent

| Field | Old | New |
|------|-----|-----|
| Agent name | `Alex` | `Casey` |
| VAPI greeting | `Thank you for calling Smile Dental. You are speaking to Alex.` | `Thank you for calling Riverside Dental. You are speaking to Casey.` |
| Repo prompt files | `appointment-concierge/vapi/prompts/alex-v1-full-booking.md` and `alex-v2-intake-only.md` | `casey-v1-full-booking.md` and `casey-v2-intake-only.md` |
| Internal `_promptFile` references | `vapi/prompts/alex-v2-intake-only.md` | `vapi/prompts/casey-v2-intake-only.md` |

---

## 3. Order of Operations (Don't Reorder)

The order matters — each phase depends on the prior one being clean.

1. **Pre-flight backup** — snapshot Supabase + export n8n workflows + screenshot VAPI prompt.
2. **Supabase rename** — the database is the source of truth that the workflows query at runtime. Rename here first so workflows pick up new values automatically.
3. **VAPI assistant (clinic + agent)** — the greeting and agent identity are read from VAPI at call time, not from n8n. Rename the assistant *and* swap clinic name in one save. Update in the VAPI Dashboard.
4. **n8n workflow JSON cleanup (via n8n-mcp from Claude Code, not manual UI)** — export each in-scope workflow to JSON, run a deterministic find-replace script, push back via `n8n_update_full_workflow`, validate, test-execute. Remove hardcoded `smile-dental` fallbacks (`clientId || 'smile-dental'`) entirely. Fix embedded `Alex` references. Includes 2 orphan workflow archivals and 1 internal workflow (Weekly AI Brief Agent) added to scope.
5. **Repo find-and-replace** — markdown docs, seed files, exported workflow JSON, and the two `alex-v*.md` prompt files (which need to be renamed, not just edited).
6. **Notion sync** — re-push every playbook page so the Notion workspace mirrors the cleaned repo.
7. **Smoke test** — call demo number, confirm new greeting + SMS sign-off + dashboard label.

---

## 3.5 Phase Unlock Matrix

What each phase unlocks. Use this to plan focused day-by-day work — don't start a downstream task until its prerequisite phase is signed off.

| When this phase is **complete** | These tasks become **possible** | These tasks remain **blocked** |
|---|---|---|
| **Phase 0 — Backup** | Safe execution of all subsequent phases (rollback path exists) | Everything below — phases 1–7 cannot start without this |
| **Phase 1 — Supabase rename** | Dashboard demo with correct clinic name; SQL queries return `riverside-dental` rows; Calendly link correct in seed data | Voice testing (VAPI still says Smile Dental + Alex); SMS templates may still sign as Smile Dental Team if n8n untouched |
| **Phase 2 — VAPI (clinic + agent)** | ✅ **Resume voice testing** (Casey doesn't trigger Alexa); record audio snippets for cousin's-wife/classmate preview; resume Day 1 sprint VAPI prompt items from `notion/05-sprint-now.md` | End-to-end SMS demo (n8n still has hardcoded fallbacks); 60-second Respond demo; daily summary email |
| **Phase 3 — n8n cleanup** | ✅ **60-second Respond demo recordable** end-to-end; resume Days 2–4 sprint items (business-hours node, BOOK/HOURS handler, callback queue, daily summary); SMS sign-off correct | 90-second Answer demo (still gated by 4 *separate* Answer blockers — booking_link NULL, Twilio cred, Groq→GPT-4o-mini, prompt v2.5 — see `playbook-answer.md`); first prospect demo |
| **Phase 4 — Repo find-and-replace** | Sharing repo with contractor/advisor/possible technical co-founder; documentation matches reality; Phase 5 sync produces correct Notion content | Phase 5 — Notion sync depends on this |
| **Phase 5 — Notion sync** | Sharing Notion playbooks externally as proof of operational maturity; Notion can be cited as source of truth without embarrassment | Phase 6 smoke test — confirms everything together |
| **Phase 6 — Smoke test (all 6 pass)** | ✅ **Schedule first prospect demo** (cousin's wife discovery call OR year-11 classmate friendly pilot); finalise ROI calculator; write objection scripts; resume any GTM action item | Onboarding client #2 without VAPI surgery (still requires Phase 7) |
| **Phase 12 — Acceptance Gate signed** | Outreach to friendly pilot; first paid client conversation at $1,500 setup floor; demo number can be shared | Multi-client architecture (Phase 7) |
| **Phase 7 — Dynamic VAPI config** | Onboarding client #2 in <30 min (insert clients row + map phone number, zero VAPI work); Practice tier ($1,299/mo) sellable with multi-location credibility; per-clinic agent name + voice ID | — (this is the architectural end state) |

**Reading the matrix:** Each phase's "blocked" column tells you what NOT to start yet. Each phase's "possible" column is the green-light list to feed into Todoist as the phase signs off.

**Critical separation to remember:** The 4 Answer blockers (booking_link NULL, Twilio cred missing, Groq→GPT-4o-mini swap, prompt v2.5 deployment) are **NOT** part of this rebrand. They block the Answer demo regardless of rebrand status. Don't conflate the two — fix Answer blockers as a separate Todoist project after rebrand acceptance.

---

## 4. Phase 0 — Pre-flight Verification (2–5 min)

**Decision recorded 2026-05-03:** Supabase free-tier daily backups are sufficient as a rollback safety net. PIT ($100/mo) is not justified at this stage. Downloadable SQL exports are not available on free tier — but the **Restore** button on each scheduled backup *is* the rollback path. No `pg_dump` step needed.

The risk being absorbed: up to ~24h of database writes could be lost in a worst-case rollback. After a 3.5-week pause with effectively zero live traffic, this is a non-issue. Tolerated.

**Backup folder convention used throughout this playbook:**
`C:\Projects\BizElevate\ClaudeCode\backups\2026-05-03\` (sibling of the `notion/` folder in the repo). Inside it: a `n8n/` subfolder for workflow JSON exports and `vapi-alex-prompt.md` for the VAPI screenshot capture. All file path references in §7 and §11 resolve against this folder.

- [ ] **Create the backup folder** — from a Claude Code session in `C:\Projects\BizElevate\ClaudeCode`, run:
  ```bash
  mkdir -p backups/2026-05-03/n8n
  ```
  PowerShell equivalent if running from a Windows shell: `New-Item -ItemType Directory -Path "backups\2026-05-03\n8n" -Force`.
- [ ] **Add `backups/` to `.gitignore` (if not already)** — but allow `backups/*/n8n/*.json` through, because the n8n JSON exports ARE the audit trail and must be committed. Suggested `.gitignore` lines:
  ```
  backups/**
  !backups/*/n8n/
  !backups/*/n8n/*.json
  ```
  This keeps VAPI screenshots and any other temporary local files out of git, while keeping the n8n workflow snapshots committed.
- [ ] **Supabase — verify the latest daily backup is fresh.** Supabase Dashboard → Database → **Backups** → note the timestamp of the most recent automated entry. If it's older than 24h, abort and investigate before touching anything. The Restore button on this entry is your rollback path (§11).
- [ ] **n8n export — handled inside Phase 3 via MCP.** No manual export step here. See §7.1–§7.2.
- [ ] **VAPI text capture** — VAPI Dashboard → Assistants → Alex → copy the actual *text content* of each field into `C:\Projects\BizElevate\ClaudeCode\backups\2026-05-03\vapi-alex-prompt.md`. Text, not a screenshot — diffable, grep-able, and pasteable straight back into VAPI for rollback without OCR. Use the template in §4.1 below. *This step stays semi-manual because VAPI Dashboard config doesn't have a fully-equivalent read API for all fields; if this changes in future, swap to a programmatic export.*

### 4.1 VAPI snapshot template

Save as `backups/2026-05-03/vapi-alex-prompt.md`. Fill in every field exactly as it appears in VAPI Dashboard. Do **not** paste the `serverUrlSecret` — leave that field as `[REDACTED]`. The `.gitignore` is configured to commit this file (pattern `!backups/*/vapi-*.md`) so it's part of the audit trail.

```markdown
# VAPI Alex Assistant — Pre-Rebrand Snapshot

**Captured:** 2026-05-03
**Captured by:** CJ
**Assistant ID:** [paste from VAPI URL or assistant settings]
**Purpose:** Restore-from point. If rebrand needs rollback, paste each section
below back into the corresponding VAPI Dashboard field exactly as captured.

---

## Assistant Name
Alex

## First Message
Thank you for calling Smile Dental. You are speaking to Alex. How may I help you today?

## End Call Message
Thanks for calling Smile Dental. The team will be in touch shortly. Have a great day.

## Voicemail Message
[paste full voicemail message text, or write `(not set)` if blank]

## System Prompt
```
[paste the entire system prompt here, preserving line breaks and indentation]
```

## Model Configuration
- Provider: [paste — e.g. openai, groq, anthropic]
- Model: [paste — e.g. gpt-4o-mini, llama-3.1-8b-instant]
- Temperature: [paste]
- Max Tokens: [paste]

## Voice Configuration
- Provider: [paste — e.g. 11labs]
- Voice ID: [paste]
- Stability: [paste]
- Similarity Boost: [paste]

## Server URL Configuration
- Server URL: [paste]
- Server URL Secret: [REDACTED — do not paste]
- Server Messages: [paste list — e.g. end-of-call-report, function-call]

## Tools / Functions
[paste list of enabled tools, or `(none)` if none]

## Knowledge Base Files
[paste list of uploaded files by name, or `(none)`]
```

After saving, run `git add backups/2026-05-03/vapi-alex-prompt.md` to stage it for the Phase 0 commit.
- [ ] **Repo branch** — `git checkout -b rebrand-2026-05-03`, `git add .`, `git commit -m "snapshot before Smile→Riverside rebrand: folder + .gitignore"`. All subsequent JSON exports + edits land on this branch for a complete audit trail.

---

## 5. Phase 1 — Supabase Rename (15 min)

The `clients.id` is the FK target for `client_subscriptions`, `phone_number_map`, `call_logs`, `appointments`, `callback_tasks`, and other dependent tables. Renaming the slug requires a single transaction that updates the parent and all children. The `clients.name` rename is independent.

### 5.1 Run in Supabase SQL Editor (one transaction)

```sql
BEGIN;

-- A) Rename the parent row first by inserting a new row with the new id, then
--    repointing all FK rows, then deleting the old parent.
--    This avoids ON UPDATE CASCADE assumptions (migration 001 doesn't define cascade).

-- A1. Create new client row, copying every column from the old one
INSERT INTO clients (id, name, industry, domain, contact_name, contact_email, active,
                     created_at, owner_phone, owner_channel, timezone, booking_link, business_hours)
SELECT 'riverside-dental',
       'Riverside Dental',
       industry,
       domain,
       contact_name,
       contact_email,
       active,
       created_at,
       owner_phone,
       owner_channel,
       timezone,
       'https://calendly.com/riverside-dental',
       business_hours
FROM clients
WHERE id = 'smile-dental';

-- A2. Repoint every FK reference. Add any tables you've created that I missed.
UPDATE client_subscriptions SET client_id = 'riverside-dental' WHERE client_id = 'smile-dental';
UPDATE phone_number_map     SET client_id = 'riverside-dental' WHERE client_id = 'smile-dental';
UPDATE call_logs            SET client_id = 'riverside-dental' WHERE client_id = 'smile-dental';
UPDATE callback_tasks       SET client_id = 'riverside-dental' WHERE client_id = 'smile-dental';
UPDATE appointments         SET client_id = 'riverside-dental' WHERE client_id = 'smile-dental';
UPDATE chat_leads           SET client_id = 'riverside-dental' WHERE client_id = 'smile-dental';
-- If migration 013 (invitations) or 014 (patient_surname) added any client_id column, add UPDATE here.

-- A3. Delete the old parent row last (after all children are repointed)
DELETE FROM clients WHERE id = 'smile-dental';

-- A4. Sanity check — should return 1 row, slug = riverside-dental
SELECT id, name, booking_link FROM clients WHERE id IN ('smile-dental', 'riverside-dental');

COMMIT;
```

If the sanity check returns zero rows or two rows, **don't COMMIT — issue ROLLBACK** and inspect.

### 5.2 If a foreign key constraint blocks step A3

Some tables may reject the DELETE if you missed a child UPDATE. Fix:
```sql
-- Find any remaining smile-dental references
SELECT 'client_subscriptions' AS tbl, COUNT(*) FROM client_subscriptions WHERE client_id='smile-dental'
UNION ALL SELECT 'phone_number_map',  COUNT(*) FROM phone_number_map  WHERE client_id='smile-dental'
UNION ALL SELECT 'call_logs',         COUNT(*) FROM call_logs         WHERE client_id='smile-dental'
UNION ALL SELECT 'callback_tasks',    COUNT(*) FROM callback_tasks    WHERE client_id='smile-dental'
UNION ALL SELECT 'appointments',      COUNT(*) FROM appointments      WHERE client_id='smile-dental'
UNION ALL SELECT 'chat_leads',        COUNT(*) FROM chat_leads        WHERE client_id='smile-dental';
```
Update the offending table, then re-run A3.

### 5.3 RLS sanity check

After the rename, the dashboard login `shijugamma@gmail.com` (mapped to smile-dental in `user_profiles`) needs to be repointed:
```sql
UPDATE user_profiles SET client_id = 'riverside-dental' WHERE client_id = 'smile-dental';
```
Log in as `shijugamma@gmail.com` at `dashboard.bizelevate.app` and confirm you see Riverside Dental's data, not an empty state.

---

## 6. Phase 2 — VAPI Assistant (Clinic + Agent rename, 15 min)

Two changes happen in this phase: the clinic name swap (Smile Dental → Riverside Dental) and the agent name swap (Alex → Casey). Both run through the same VAPI Dashboard surface, so do them together in one save to avoid leaving the assistant in a half-renamed state.

**Important:** Do NOT delete the existing assistant and recreate it. Keep the same VAPI assistant ID — phone routing in Twilio and webhook URLs in n8n are tied to it. Only rename + edit fields.

- [ ] VAPI Dashboard → Assistants → open the existing "Alex" assistant.
- [ ] **Assistant Name field** (top of the page) — `Alex` → `Casey`. Save.
- [ ] **System prompt** — run two find/replace passes in order:
  1. `Smile Dental Campsie` → `Riverside Dental` (longest token first)
  2. `Smile Dental` → `Riverside Dental`
  3. `Alex` → `Casey` (whole-word; if the prompt says "I am Alex" or "You are Alex" or similar, those need to flip)
  Watch for any "Campsie" leftovers after step 1.
- [ ] **First Message** — change to: `Thank you for calling Riverside Dental. You are speaking to Casey. How may I help you today?`
- [ ] **End Call Message** — change to: `Thanks for calling Riverside Dental. The team will be in touch shortly. Have a great day.`
- [ ] **Voicemail Message** (if set) — same clinic + agent swap.
- [ ] **Knowledge base files** (if uploaded) — review each for `Smile Dental` and `Alex` references; re-upload cleaned versions.
- [ ] **Voice ID** — leave the ElevenLabs voice unchanged. The voice doesn't have a gender lock-in; same voice works for Casey.
- [ ] Save → trigger a **VAPI test call** through the dashboard's "Test" button. Listen end-to-end. Verify Casey introduces themselves correctly *and* mentions Riverside Dental, *and* that no Alexa device in the room wakes up.

---

## 7. Phase 3 — n8n Workflow Cleanup via MCP (30 min)

**Updated 2026-05-03:** Method changed from manual UI clicks to **n8n-mcp programmatic update**, run from Claude Code where the n8n-mcp server is already configured per `CLAUDE.md`. Three reasons: auditable (every change committed to git), repeatable (the same script handles client #2's rebrand if needed), reliable (manual Find across 14+ Set nodes per workflow is the most likely place for stray "Smile Dental" references to hide).

Run all of §7.1–§7.5 from a Claude Code session in `C:\Projects\BizElevate\ClaudeCode` with the `.mcp.local.json` config loaded so `n8n_*` tools are live.

### 7.1 Inventory live workflows (1 min)

```
n8n_list_workflows
```

Confirm the **6 in-scope workflows** are all `active: true`. Capture the exact name + ID + active state into the rebrand branch as a starting record:

```bash
mkdir -p backups/2026-05-03/n8n
# Save the list output as a JSON file for the audit trail
```

Expected to match (workflow name on the left, OPERATING-TRUTH ID on the right):

| n8n display name | Expected ID |
|---|---|
| BizElevate Missed Call Recovery | `W9lssqC5Jvd3nIVo` (Respond) |
| BizElevate - Appointment Request Concierge (MCP) | `HKHwb6mpWdvGcR070E8or` (Answer) |
| BizElevate Reminder Scheduler | `wN3cyY7o0kJhk9DS` |
| BizElevate Reminder Reply Handler | `inmiGyHTCEP3a2hd` |
| BizElevate SMS Reply Handler | `q4CYSzFYuYfp1eWa` |
| BizElevate Error Handler | `jH1zMn2CbFpDX3PY` |

If any name → ID mismatch shows up, **stop** and reconcile. Don't rebrand a workflow you can't identify.

Plus **one more in scope** per the orphan triage decision (2026-05-03):

| BizElevate — Weekly AI Brief Agent (Enterprise) | TBD — capture from `n8n_list_workflows` output |

### 7.2 Export each workflow to disk (5 min)

For each of the 7 in-scope workflow IDs, run `n8n_get_workflow` and save the full JSON to disk under the rebrand branch. This is your *real* backup — pure JSON, fully restorable via `n8n_update_full_workflow`.

```
For each workflow_id in [<7 IDs>]:
  result = n8n_get_workflow(id=workflow_id)
  Write result.json to: backups/2026-05-03/n8n/<workflow_name>.before.json
git add backups/2026-05-03/n8n/
git commit -m "Phase 0: pre-rebrand n8n workflow snapshots"
```

The "before" suffix matters — you'll save "after" copies in §7.4 for diff review.

### 7.3 Programmatic find-and-replace on the JSON (10 min)

Use a small Node script in Claude Code (don't do this by hand). Three patterns to fix per workflow:

1. **Hardcoded fallbacks** like `{{ $('Route by Decision').item.json.clientId || 'smile-dental' }}` — **delete the fallback entirely.** Failing loudly is better than silently mis-routing data. Replace with `{{ $('Route by Decision').item.json.clientId }}`.
2. **Hardcoded SMS templates** with `– Smile Dental Team` sign-offs — replace with `– Riverside Dental Team`. Better still: parameterise to `{{ $json.client_name }} Team` so future clients work without code changes (only do this if you're confident `client_name` is already in the data flow).
3. **Embedded `Alex` references** in greetings, end-of-call summaries, and any baked-in messages — replace `Alex` → `Casey`. The Answer workflow JSON alone had ≥8 occurrences in the previous live export.

A starter script (`scripts/rebrand-n8n.mjs`):

```javascript
import fs from 'fs';
import path from 'path';

const REPLACEMENTS = [
  // longest first to avoid partial replacements
  ['Smile Dental Campsie', 'Riverside Dental'],
  ['Smile Dental',         'Riverside Dental'],
  ['smile-dental',         'riverside-dental'],
  ['smile_dental',         'riverside_dental'],
  // word-boundary safe replacements for the agent name
  [/\bAlex\b/g,            'Casey'],
];

// Special pattern: collapse hardcoded fallbacks
const FALLBACK_PATTERN = /\|\|\s*['"]smile-dental['"]/g;

const files = fs.readdirSync('backups/2026-05-03/n8n')
  .filter(f => f.endsWith('.before.json'));

for (const file of files) {
  const inPath  = path.join('backups/2026-05-03/n8n', file);
  const outPath = inPath.replace('.before.json', '.after.json');
  let content = fs.readFileSync(inPath, 'utf8');

  // Remove dangerous fallbacks first
  content = content.replace(FALLBACK_PATTERN, '');

  // Then apply name swaps
  for (const [from, to] of REPLACEMENTS) {
    content = content.replaceAll ? content.replaceAll(from, to)
                                 : content.replace(from instanceof RegExp ? from : new RegExp(from, 'g'), to);
  }

  // Sanity check: must still parse as valid JSON
  JSON.parse(content);

  fs.writeFileSync(outPath, content);
  console.log(`Rebranded: ${file} → ${path.basename(outPath)}`);
}
```

Run it: `node scripts/rebrand-n8n.mjs`. Each file gets a `.after.json` sibling. Eyeball the diff:

```bash
diff backups/2026-05-03/n8n/<name>.before.json backups/2026-05-03/n8n/<name>.after.json | less
```

Expect to see only `Smile Dental → Riverside Dental`, `smile-dental → riverside-dental`, `Alex → Casey`, and the deleted fallbacks. If anything else changed, **stop** — the script has a bug.

### 7.4 Push the cleaned JSON back to n8n (5 min)

For each workflow, push the `.after.json` back via MCP:

```
For each workflow_id, after_json in updates:
  n8n_update_full_workflow(id=workflow_id, workflow=after_json)
  n8n_validate_workflow(id=workflow_id)
  if validation fails:
    stop and inspect — do not auto-fix yet
```

Use `n8n_update_full_workflow` (full replacement) rather than `n8n_update_partial_workflow` for the rebrand pass — the diff is broad enough that the partial approach would generate too many tiny PATCH calls.

### 7.5 Test execution + commit (5 min)

For each updated workflow, trigger a single test execution via MCP:

```
n8n_test_workflow(id=workflow_id)
```

If any execution fails, the validation in §7.4 should have caught it earlier. If a runtime error surfaces here (e.g. SMS template references a column that no longer exists after Phase 1), inspect the failing node and fix in n8n directly, then re-export and re-commit.

Final commit:

```bash
git add backups/2026-05-03/n8n/*.after.json scripts/rebrand-n8n.mjs
git commit -m "Phase 3: n8n workflows rebranded via MCP, all 7 in scope"
```

### 7.6 Orphan workflow triage

Per the 2026-05-03 decision, two suspected-orphan workflows get archived (deactivated + renamed `[ARCHIVED]`, deleted after 30 days if nothing breaks):

```
n8n_list_workflows
# Identify by name, capture IDs:
#   "BizElevate - Appointment Request Concierge"  (no MCP suffix, ~2 months old)
#   "BMCR — Inbound SMS Reply"

For each orphan_id:
  current = n8n_get_workflow(id=orphan_id)
  current.name = '[ARCHIVED 2026-05-03] ' + current.name
  current.active = false
  n8n_update_full_workflow(id=orphan_id, workflow=current)
```

Add a Todoist reminder dated 2026-06-03: *"Delete `[ARCHIVED 2026-05-03]` workflows in n8n if nothing has broken."* Once 30 days pass without an incident, run `n8n_delete_workflow` on each.

**Do not delete on day 1.** Archiving is reversible; deletion is not. The 30-day window catches any hidden cron schedule, webhook, or external integration that still depends on the workflow.

---

## 8. Phase 4 — Repo Find-and-Replace (20 min)

Two name swaps cover ~28 files. Order: rename prompt files, then data files, then docs.

### 8.1 Rename the VAPI prompt files (do this first, in git)

These files need to be **renamed**, not just edited. Use `git mv` so history follows.

```bash
cd C:\Projects\BizElevate\ClaudeCode\appointment-concierge\vapi\prompts
git mv alex-v1-full-booking.md casey-v1-full-booking.md
git mv alex-v2-intake-only.md  casey-v2-intake-only.md
```

Then inside each renamed file: find/replace `Alex` → `Casey` (whole-word) and `Smile Dental Campsie` / `Smile Dental` → `Riverside Dental`. Also update any heading like `# Alex Prompt v2` to `# Casey Prompt v2`.

### 8.2 Update assistant-config.json reference

`appointment-concierge/vapi/assistant-config.json` has metadata pointing at the old filenames:
- `_promptVersion: "v2-intake-only"` — leave as-is
- `_promptFile: "vapi/prompts/alex-v2-intake-only.md"` → `"vapi/prompts/casey-v2-intake-only.md"`
- `_note` first line — change `alex-v2-intake-only.md` to `casey-v2-intake-only.md`

### 8.3 Data files (run as actual SQL too if not already done)

| File | Replace |
|---|---|
| `supabase/seeds/001_demo_client.sql` | `'smile-dental'` → `'riverside-dental'`, `'Smile Dental Campsie'` → `'Riverside Dental'` (12 occurrences across the seed inserts) |
| `supabase/seeds/002_client_config.sql` | `'smile-dental'` → `'riverside-dental'` (3 occurrences); `https://calendly.com/smile-dental-campsie` → `https://calendly.com/riverside-dental` |
| `appointment-concierge/n8n/workflow.json` | `smile-dental` → `riverside-dental`; `Smile Dental` → `Riverside Dental`; `Alex` → `Casey` (whole-word). After change, validate JSON parses. |
| `appointment-concierge/n8n/workflow-live.json` | Same as above. **Note:** this file is the export of the live workflow — Phase 3 (re-export) will rewrite it, so you can either edit by hand or just trust the re-export. |

### 8.4 Markdown docs (full find-and-replace, all instances)

Files containing `Smile Dental` references:
```
notion/playbook-respond.md
notion/playbook-answer.md
notion/playbook-remind.md
notion/OPERATING-TRUTH.md
notion/01-launch-plan.md
notion/00-quick-finder.md
notion/06-client-onboarding.md
testing/RELEASE-READINESS.md
testing/CRITICAL-PATH-TESTS.md
LAUNCH.md
docs/GUIDE.md
docs/manus-additions.md
checklists/auth-setup.md
checklists/SPRINT-NOW.md
checklists/CLIENT-ONBOARDING.md
missed-call/PLAYBOOK.md
appointment-concierge/PLAYBOOK.md
appointment-reminders/PLAYBOOK.md
```

Additional files containing `Alex` references (some overlap with above):
```
notion/playbook-answer.md
notion/playbook-respond.md
notion/playbook-remind.md
notion/01-launch-plan.md
notion/05-sprint-now.md
notion/06-client-onboarding.md
notion/07-deploy-gates.md
notion/08-environments.md
notion/OPERATING-TRUTH.md
notion/bizelevate-one-pager.md
LAUNCH.md
supabase/ENVIRONMENTS.md
checklists/SPRINT-NOW.md
checklists/DEPLOY-GATES.md
checklists/CLIENT-ONBOARDING.md
appointment-concierge/PLAYBOOK.md
appointment-concierge/docs/IMPLEMENTATION.md
appointment-reminders/PLAYBOOK.md
missed-call/PLAYBOOK.md
```

**VS Code find-and-replace sequence — run in this exact order, longest token first:**

1. `Smile Dental Campsie` → `Riverside Dental`
2. `Smile Dental` → `Riverside Dental`
3. `smile-dental-campsie` → `riverside-dental`
4. `smile-dental` → `riverside-dental`
5. `smile_dental` → `riverside_dental`
6. `Alex prompt` → `Casey prompt` *(catch the most common phrase first so it's not partially mangled)*
7. `Alex assistant` → `Casey assistant`
8. `Alex v2.5` → `Casey v2.5` *(version label phrase)*
9. **Whole-word match required:** `\bAlex\b` → `Casey` *(VS Code: enable "Match Whole Word" toggle — the icon next to the regex toggle. This prevents collateral damage to any unrelated word containing "alex".)*
10. **Whole-word, case-sensitive:** `\balex\b` → `casey`

After step 10, run `grep -ri "smile\|alex" .` from the repo root and confirm only legitimate hits remain (e.g. the `cleanup-rebrand.md` file itself, which intentionally documents the swap).

### 8.5 Rebrand-context note

Add a short note to `OPERATING-TRUTH.md` at the top so future-you remembers why both renames happened:
```
> **2026-05-03 — Rebrand:** All references to "Smile Dental" replaced with "Riverside Dental" (fictional demo brand). Smile Dental was CJ's personal dentist used as a placeholder during early build; clinic had not consented. No business relationship existed. AI agent renamed from "Alex" to "Casey" — same call, different operational reason: Amazon Alexa devices in the home office woke up on every test call.
```

---

## 9. Phase 5 — Notion Sync (10 min)

Per `CLAUDE.md`, every playbook in `notion/` mirrors a page in the BizElevate Document Hub. The user reads from Notion, not the repo, so syncing is mandatory.

- [ ] In Claude Code, run: `node /tmp/notion-sync.js` (the reusable script referenced in CLAUDE.md). This deletes all blocks on each tracked page and re-pushes the cleaned markdown.
- [ ] If the script doesn't exist on disk anymore, regenerate from the spec in `CLAUDE.md` § Notion Sync (Non-Negotiable). The pages array should cover at minimum: OPERATING-TRUTH, playbook-respond, playbook-answer, playbook-remind, plus the testing docs.
- [ ] Add **this** file (`cleanup-rebrand.md`) as a new page in the Document Hub if you want it preserved in Notion — otherwise leave as repo-only.

---

## 10. Phase 6 — Smoke Test (10 min)

Proves the cleanup landed across all surfaces. **Don't mark the rebrand "done" until all four pass.**

| # | Test | Pass criteria |
|---|------|---------------|
| 1 | Call `+61 485 004 338` from your mobile and let the AI pick up | Greeting says **"Thank you for calling Riverside Dental. You are speaking to Casey."** Zero "Smile Dental", zero "Alex". |
| 2 | While test 1 is in progress, listen for any Amazon Echo / Alexa device in the room | Devices stay silent — confirms the Alex→Casey rename solved the test interruption problem |
| 3 | Call `+61 485 034 338` and hang up after 2 rings | SMS arrives within 10s, sign-off says **"– Riverside Dental Team"** |
| 4 | Log in to `dashboard.bizelevate.app` as `shijugamma@gmail.com` | Top-left client name shows **"Riverside Dental"**; call_logs page shows the seeded demo rows under the new client |
| 5 | Run in Supabase SQL Editor: `SELECT * FROM clients WHERE name ILIKE '%smile%' OR id ILIKE '%smile%'` | Zero rows. Repeat for `phone_number_map`, `call_logs`, `client_subscriptions` — all zero. |
| 6 | Run in repo: `grep -rni "smile dental\|smile-dental\|\\balex\\b" --include="*.md" --include="*.json" --include="*.sql" .` | Only `cleanup-rebrand.md` and the rebrand-context note in `OPERATING-TRUTH.md` should appear (those intentionally document the swap). Everything else = zero. |

If any test fails, do not proceed to next phase of work. Re-open the corresponding section above.

---

## 11. Rollback Plan

If something breaks mid-rebrand and you need to revert:

1. **Supabase:** Dashboard → Database → **Backups** → click **Restore** on the daily backup taken before this session started (the most recent timestamp from §4). This reverts the entire database to that snapshot. Destructive to anything written *after* the snapshot — accept the loss for the rollback window. After a 3.5-week pause with no live traffic, that loss is effectively zero.
2. **n8n:** Re-push the `*.before.json` files from `backups/2026-05-03/n8n/` via `n8n_update_full_workflow` for each workflow. Workflow IDs stay the same on update-replace, so phone routing keeps working.
3. **VAPI:** Open `backups/2026-05-03/vapi-alex-prompt.md` (committed to git, so it's available even if you abandoned the branch). Paste each section back into the corresponding VAPI Dashboard field. Rename the assistant Casey → Alex.
4. **Repo:** `git checkout main` to abandon the `rebrand-2026-05-03` branch.
5. **Notion:** Re-run the sync script against the now-restored markdown — Notion catches up automatically.

---

## 12. Acceptance Gate — "Demo is now safe"

Mark complete only when ALL of these are true:

- [ ] Supabase daily backup confirmed fresh at start of Phase 0 (PIT skip is documented + risk accepted in §4)
- [ ] `backups/2026-05-03/n8n/*.before.json` and `*.after.json` committed to the rebrand branch
- [ ] VAPI text snapshot saved at `backups/2026-05-03/vapi-alex-prompt.md` (committed to git)
- [ ] Supabase has zero rows referencing `smile-dental` or `Smile Dental`
- [ ] VAPI test call: greeting says "Riverside Dental" + "Casey" (not Alex)
- [ ] No Alexa device in the home office reacts during a test call
- [ ] All 7 in-scope n8n workflows updated via `n8n_update_full_workflow` + validated + test-executed
- [ ] 2 orphan workflows renamed `[ARCHIVED 2026-05-03]` and deactivated; 2026-06-03 deletion reminder set in Todoist
- [ ] Two `alex-v*.md` prompt files renamed via `git mv`; `assistant-config.json` `_promptFile` reference updated
- [ ] Repo `grep -ri "smile"` and `grep -rni "\\balex\\b"` return only the documented rebrand notes
- [ ] Notion pages re-synced and visually inspected
- [ ] Smoke tests 1–6 in §10 all pass
- [ ] Branch `rebrand-2026-05-03` merged to main with commit message `chore: rebrand Smile Dental → Riverside Dental and Alex → Casey across all surfaces (incl. n8n via MCP)`

Once this gate clears, the demo number, dashboard, and all playbooks are prospect-safe. Cousin's-wife conversation and friendly-pilot outreach can proceed without the credibility risk.

---

## 13. Phase 7 — Forward State: Dynamic VAPI Configuration (separate sprint, ~4–6h)

**Pre-requisite:** §12 Acceptance Gate signed off. Do not start until the static rebrand is complete.

**Why this phase exists:** Even after the static rebrand lands, the VAPI assistant is still hardcoded with one clinic name and one agent name. Onboarding a second clinic would mean a second VAPI assistant, a second prompt file, and a second routing setup — i.e. workflow branching, which CLAUDE.md explicitly prohibits ("*Customise via configuration and tool enablement, never by branching workflows*"). This phase moves the clinic and agent identity into Supabase, where everything else multi-client already lives.

### 13.1 Goal

VAPI fires `assistant-request` to n8n the instant a call hits a demo number. n8n looks up the calling number → resolves `client_id` → reads clinic config from Supabase → returns a hydrated assistant config to VAPI. One VAPI assistant template. N clinics. Zero per-client VAPI work after onboarding.

### 13.2 Architecture Sketch

```
Inbound call to +61 4XX XXX XXX
        ↓
Twilio routes call to VAPI SIP/PSTN endpoint
        ↓
VAPI fires `assistant-request` event to n8n
        ↓ (HTTP POST with calledPhoneNumber)
n8n: SELECT * FROM phone_number_map WHERE phone_number = $1
        ↓
n8n: SELECT * FROM clients WHERE id = $client_id
        ↓
n8n: hydrate template with {{clinic_name}}, {{agent_name}},
     {{business_hours}}, {{booking_link}}, {{services}}
        ↓
n8n returns JSON assistant config to VAPI
        ↓
VAPI uses returned config for THIS call only
        ↓
Caller hears: "Thank you for calling Riverside Dental.
              You're speaking to Casey..."
```

### 13.3 Schema Migration (015_extend_clients_for_vapi.sql)

```sql
ALTER TABLE clients ADD COLUMN agent_name TEXT NOT NULL DEFAULT 'Casey';
ALTER TABLE clients ADD COLUMN voice_id   TEXT NOT NULL DEFAULT '21m00Tcm4TlvDq8ikWAM'; -- ElevenLabs Rachel (current default)

COMMENT ON COLUMN clients.agent_name IS 'First name the AI agent uses when introducing itself (e.g. Casey, Riley, Jordan). Per-clinic so two clinics can run different agent identities on shared infrastructure.';
COMMENT ON COLUMN clients.voice_id IS 'ElevenLabs voice ID. Lets each clinic pick male/female/AU-accent without infrastructure changes.';
```

### 13.4 Build Steps (Order Matters)

1. **Schema migration 015** — add `agent_name`, `voice_id` columns to `clients`. Backfill existing rows (`riverside-dental` and `clyde-north-dental`) with sensible defaults.
2. **n8n new workflow: VAPI Assistant Request Handler** — webhook listener at `/webhook/vapi-assistant-request`. Body shape comes from VAPI docs. Returns the hydrated assistant config JSON.
3. **n8n: assistant config template** — store the BizElevate concierge prompt template in n8n as a Set node OR as a row in a new `assistant_templates` table (cleaner, version-controlled). Use `{{clinic_name}}`, `{{agent_name}}`, `{{business_hours}}` placeholders.
4. **VAPI Dashboard: enable assistant-request server URL** — set the assistant's Server URL to the new n8n webhook. Confirm `assistant-request` is in the listed serverMessages.
5. **Test scenario A** — call a phone number mapped to `riverside-dental`, verify Casey + Riverside greeting.
6. **Test scenario B** — set `clyde-north-dental.agent_name = 'Riley'` and `clyde-north-dental.name = 'Clyde North Dental'`, map a second Twilio number to it, call, verify Riley + Clyde North greeting on the same VAPI assistant.
7. **Migrate the static prompt** — once dynamic flow works, the static prompt in VAPI becomes the fallback only. Archive `casey-v2-intake-only.md` as `concierge-template-v3.md` (template form, no clinic/agent baked in) under `appointment-concierge/vapi/templates/`.

### 13.5 Acceptance Criteria

- [ ] Two clinics with different `agent_name` and `name` values both produce correct greetings on the same VAPI assistant ID.
- [ ] Changing `clients.agent_name` for a clinic and re-calling produces the new name within 1 call (no VAPI redeploy).
- [ ] Adding a third clinic = INSERT into `clients` + INSERT into `phone_number_map` + zero VAPI work.
- [ ] The original assistant config is preserved as the static fallback (in case the assistant-request webhook fails — VAPI should still answer with a generic greeting rather than silence).

### 13.6 Risks & Watch-outs

- **Latency:** the assistant-request webhook adds round-trip time before VAPI picks up. Target: <800ms from VAPI request to n8n response. If n8n cold-starts make this unreliable, the fallback static config saves the call.
- **Failure mode:** if Supabase is down, the webhook returns an error; VAPI uses the static fallback. Patient hears generic "Thank you for calling. How may I help?" — not ideal but not broken.
- **Voice change risk:** changing `voice_id` mid-conversation isn't supported. Voice is locked at call start.
- **Don't ship the same week as a brand rename.** Phase 1–6 is a brand rename. Phase 7 is architecture. Separate weeks, separate test windows.

### 13.7 What Phase 7 unlocks (Todoist-ready)

| Action item | Description |
|---|---|
| Onboard client #2 in <30 min | Database insert only — no VAPI surgery. This is the *Phase 1.5* milestone in `notion/01-launch-plan.md`. |
| Sell **Practice tier ($1,299/mo)** with multi-location credibility | Tier promises multi-location support; Phase 7 is what makes the promise true. |
| Per-clinic voice personality | Some clinics will want a male voice, some female, some with AU accent — Phase 7 makes this a config change, not an engineering change. |
| Cleaner first-client onboarding playbook | Update `notion/06-client-onboarding.md` to reflect database-only onboarding. Cuts setup-fee delivery time. |

---

## 14. Todoist Mapping (recommended)

Per the Tool Roles rule (Todoist for tasks, Notion for docs), create **two** Todoist projects — one short-lived for the static rebrand, one for the forward-state architecture sprint. Each task description should link back to the matching section of this document.

### 14.1 Project A — `BizElevate — Rebrand Cleanup` (one-off, delete after acceptance)

```
🔥 Focus Right Now
- [ ] Phase 0 — verify Supabase daily backup is fresh + (optional) pg_dump + VAPI prompt screenshot + git branch (§4)

Phase 1 — Database  →  unlocks: dashboard demo with new name, correct seed data
- [ ] Run rebrand SQL transaction (§5.1)
- [ ] RLS sanity: update user_profiles + dashboard login test (§5.3)

Phase 2 — VAPI  →  unlocks: voice testing resumes, no Alexa interruptions
- [ ] Rename assistant Alex → Casey + system prompt + firstMessage + endCallMessage (§6)
- [ ] VAPI test call (verify greeting, verify no Alexa device wakes up)

Phase 3 — n8n via MCP  →  unlocks: 60-second Respond demo recordable end-to-end
- [ ] §7.1 — n8n_list_workflows; reconcile names ↔ IDs ↔ active state
- [ ] §7.2 — Export all 7 in-scope workflows to backups/2026-05-03/n8n/*.before.json + git commit
- [ ] §7.3 — Run scripts/rebrand-n8n.mjs; eyeball each diff; verify no unintended changes
- [ ] §7.4 — n8n_update_full_workflow + n8n_validate_workflow for each workflow
- [ ] §7.5 — n8n_test_workflow for each + commit *.after.json files
- [ ] §7.6 — Archive 2 orphan workflows (deactivate + rename [ARCHIVED 2026-05-03])
- [ ] Add 2026-06-03 Todoist reminder to delete archived workflows if nothing has broken

Phase 4 — Repo  →  unlocks: shareable repo, Phase 5 sync produces correct content
- [ ] git mv alex-v1-full-booking.md → casey-v1-full-booking.md (§8.1)
- [ ] git mv alex-v2-intake-only.md → casey-v2-intake-only.md (§8.1)
- [ ] Update assistant-config.json _promptFile + _note (§8.2)
- [ ] Find-and-replace data files (§8.3)
- [ ] Find-and-replace markdown docs in 10-step sequence (§8.4)
- [ ] Add rebrand context note to OPERATING-TRUTH.md (§8.5)

Phase 5 — Notion  →  unlocks: shareable playbooks, source of truth
- [ ] Run notion-sync.js (§9)

Phase 6 — Smoke Test  →  unlocks: schedule first prospect demo
- [ ] Tests 1–6 all pass (§10)
- [ ] Acceptance gate signed off (§12)
```

Delete the project after the rebrand lands — it's a one-off, not a recurring sprint.

### 14.2 Project B — `BizElevate — Phase 7 Dynamic VAPI` (separate sprint, blocked until Project A acceptance)

Do not start any task in Project B until **§12 Acceptance Gate** is signed off. Project B should sit idle in Todoist with a "Blocked: rebrand acceptance" label until then.

```
Schema  →  unlocks: per-client agent and voice config in DB
- [ ] Write migration 015_extend_clients_for_vapi.sql (§13.3)
- [ ] Apply migration to dev → preprod → prod
- [ ] Backfill existing 2 clients with defaults

n8n — Assistant Request Handler  →  unlocks: dynamic per-call config
- [ ] Build new webhook workflow at /webhook/vapi-assistant-request (§13.4 step 2)
- [ ] Add concierge template with {{clinic_name}}, {{agent_name}}, {{business_hours}} (§13.4 step 3)
- [ ] Validate JSON response shape against VAPI assistant-request schema

VAPI Dashboard  →  unlocks: dynamic flow goes live
- [ ] Enable assistant-request in serverMessages (§13.4 step 4)
- [ ] Set Server URL to new n8n webhook
- [ ] Keep static config as fallback

Test  →  unlocks: confidence to onboard client #2
- [ ] Test A: Riverside + Casey via dynamic flow (§13.4 step 5)
- [ ] Test B: 2nd test client with different agent name (§13.4 step 6)
- [ ] Latency check: assistant-request <800ms round trip (§13.6)
- [ ] Failure-mode test: Supabase down → VAPI uses static fallback gracefully

Migrate prompt to template  →  unlocks: clean architecture state
- [ ] Move casey-v2-intake-only.md → templates/concierge-template-v3.md (§13.4 step 7)
- [ ] Update playbook-answer.md to reflect template-driven model
- [ ] Run notion-sync.js

Acceptance  →  unlocks: Phase 1.5 onboarding (client #2)
- [ ] All §13.5 acceptance criteria pass
- [ ] Update notion/06-client-onboarding.md to database-only flow
```

Once Project B's acceptance is signed off, the next Todoist project becomes **`BizElevate — Client #2 Onboarding`** — and that project will be radically shorter than the first one was, because all the per-clinic surgery has been removed.

# Management Dashboard — Architecture Reference

**This file is a Claude Code reference.** For client onboarding steps, see [checklists/CLIENT-ONBOARDING.md](../checklists/CLIENT-ONBOARDING.md).

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React + TypeScript |
| UI | shadcn/ui + Tailwind CSS |
| Charts | Recharts |
| Data fetching | TanStack Query (React Query) |
| Auth | Supabase Auth (Google OAuth + Magic Link) |
| Database | Supabase (Postgres + RLS) |
| Hosting | Vercel (auto-deploy from GitHub) |

## Repository

- GitHub: `https://github.com/shijujabbar07/bizelevate-dashboard`
- Local path: `BizElevate/bizelevate-dashboard/` (sibling to `ClaudeCode/`)
- Key files:
  - `src/lib/supabase.ts` — Supabase client (anon key, browser-safe)
  - `src/services/callLogService.ts` — all async Supabase queries, dynamic `client_id` resolution
  - `src/types/index.ts` — TypeScript types matching Supabase schema
  - `src/hooks/useAuth.ts` — session state + cache invalidation on sign-out
  - `src/components/AuthGuard.tsx` — protects all routes behind auth check

## Multi-Client Architecture

1. User logs in via Supabase Auth (Google OAuth or Magic Link)
2. Dashboard calls `user_profiles` to resolve the user's `client_id`
3. All subsequent queries include `client_id` in the filter
4. Supabase RLS policies enforce isolation at the database level

`client_id` cache is cleared on `SIGNED_OUT` auth event — next user gets a fresh lookup.

## Supabase Tables

| Table | Purpose | Client scoping |
|-------|---------|---------------|
| `auth.users` | Supabase-managed user identities | By `auth.uid()` |
| `user_profiles` | Maps `auth.uid()` → `client_id` | One row per staff member |
| `clients` | Business profile (name, industry, etc.) | `id` = text slug |
| `client_subscriptions` | Active capabilities per client | FK to `clients.id` |
| `call_logs` | All call records | `client_id` text field |
| `phone_number_map` | Maps Twilio number → client_id + capability | — |

## n8n — Service Role Key

n8n uses the **service role key** which bypasses RLS entirely.

- Credential: **Supabase Production** (`supabaseApi`, ID: `i9Zym8Avlm1ddBue`)
- All HTTP Request nodes use `predefinedCredentialType → supabaseApi → Supabase Production`
- The anon key is **never used** in n8n

## Three-Environment Setup

| | Dev | Preprod | Prod |
|--|-----|---------|------|
| Dashboard URL | `localhost:8081` | `staging.bizelevate.app` *(TBD)* | `dashboard.bizelevate.app` |
| Supabase | `bizelevate-dev` *(not yet created)* | `bizelevate-preprod` *(not yet created)* | `gdzpgimyjgfzhnwyojmz` |
| Vercel env | Local `.env` | Vercel env vars (staging) | Vercel env vars (prod) |
| n8n | `[DEV] Workflow Name` | `[STAGING] Workflow Name` | `Workflow Name` |

## Vercel Environment Variables

| Variable | Dev | Preprod | Prod |
|----------|-----|---------|------|
| `VITE_SUPABASE_URL` | dev url | preprod url | `https://gdzpgimyjgfzhnwyojmz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | dev anon key | preprod anon key | prod anon key |
| `VITE_ENV` | `development` | `staging` | `production` |

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Dashboard shows no data after login | No `user_profiles` row for this user | Add row with correct `user_id` and `client_id` |
| Wrong client's data showing | `user_profiles.client_id` incorrect | Update the row |
| Google OAuth not redirecting back | Redirect URL not in Supabase allow-list | Add URL to Supabase Auth → URL Configuration |
| n8n can't insert to `call_logs` | Using anon key instead of service role | Set HTTP node to `Predefined Credential Type → supabaseApi → Supabase Production` |

# Auth Setup — complete

All 8 steps completed on **2026-03-09**. Google OAuth, RLS, Vercel, DNS, n8n service role credential, staff accounts — all live.

Reference details (for troubleshooting) are in **[checklists/CLIENT-ONBOARDING.md](CLIENT-ONBOARDING.md)** → Troubleshooting section.

**Test accounts:**
| Account | Client |
|---------|--------|
| `shijugamma@gmail.com` | `smile-dental` |
| `shijubeta@gmail.com` | `clyde-north-dental` |

**Key config values:**
- Supabase prod project: `gdzpgimyjgfzhnwyojmz`
- Google OAuth redirect URI: `https://gdzpgimyjgfzhnwyojmz.supabase.co/auth/v1/callback`
- Vercel CNAME: `dashboard` → `97514bdda2ea8d61.vercel-dns-017.com`
- n8n Supabase credential: `Supabase Production` (ID: `i9Zym8Avlm1ddBue`)

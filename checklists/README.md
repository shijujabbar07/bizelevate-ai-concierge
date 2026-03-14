# Checklists

Operational checklists for consistent delivery.

| Checklist | When to use |
|-----------|------------|
| [pre-deploy.md](pre-deploy.md) | Before promoting any change from dev → preprod → prod |
| [schema-change.md](schema-change.md) | Every time a database table or column changes |
| [auth-setup.md](auth-setup.md) | One-time — enable Google OAuth, magic link, RLS, and provision staff accounts |
| [first-customer.md](first-customer.md) | One-time — when the first real customer is onboarded, to set up full environment separation |

## Environment strategy

See `supabase/ENVIRONMENTS.md` for the full environment registry, project URLs, and migration promotion runbook.

## Rule of thumb

- **dev** — break freely
- **preprod** — must mirror prod, used for demos and final validation
- **prod** — no direct SQL, no direct workflow edits, no seed scripts

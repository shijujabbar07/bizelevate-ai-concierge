# Checklists

Operational checklists for consistent delivery.

| Checklist | When to use |
|-----------|------------|
| [DEPLOY-GATES.md](DEPLOY-GATES.md) | Before promoting any change from dev → preprod → prod, and for every schema change |
| [auth-setup.md](auth-setup.md) | Reference only — auth setup is complete (done 2026-03-09) |

## Client onboarding

Client onboarding checklists live in [onboarding/](../onboarding/).

## Environment strategy

See [supabase/ENVIRONMENTS.md](../supabase/ENVIRONMENTS.md) for the full environment registry, project URLs, and migration promotion runbook.

## Rule of thumb

- **dev** — break freely
- **preprod** — must mirror prod, used for demos and final validation
- **prod** — no direct SQL, no direct workflow edits, no seed scripts

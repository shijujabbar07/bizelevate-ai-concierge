# BizElevate — Reading Index

Point Obsidian at this folder (`reading/`). Every file you need to read is here, nothing else.

---

## Foundation

| File | When to open it |
|------|----------------|
| [OPERATING-TRUTH.md](OPERATING-TRUTH.md) | Pricing tiers, product positioning, non-negotiable architecture rules |
| [MASTER-NAVIGATION.md](MASTER-NAVIGATION.md) | System architecture diagram, active n8n workflow IDs, weekly ops check |

## Sales and GTM

| File | When to open it |
|------|----------------|
| [ONE-PAGER.md](gtm/ONE-PAGER.md) | One-page pitch — open before a prospect call |
| [GTM-STRATEGY.md](gtm/GTM-STRATEGY.md) | Go-to-market strategy, pipeline actions, sales approach |
| [GTM-OUTREACH-AUTOMATION.md](gtm/GTM-OUTREACH-AUTOMATION.md) | Automated outreach system for a time-constrained founder — 3-layer model, email sequences, tool stack, Week 1 checklist |

## Product Playbooks (Demo Prep)

| File | When to open it |
|------|----------------|
| [PLAYBOOK-RESPOND.md](playbooks/PLAYBOOK-RESPOND.md) | CustomerReach Respond — missed call SMS. Demo script, how it works, pricing, setup options |
| [PLAYBOOK-ANSWER.md](playbooks/PLAYBOOK-ANSWER.md) | CustomerReach Answer — AI voice concierge. Casey, VAPI, appointment intake |
| [PLAYBOOK-REMIND.md](playbooks/PLAYBOOK-REMIND.md) | CustomerReach Remind — appointment reminders (Phase 2, not yet live) |

## Client Onboarding (CustomerReach Respond)

| File | When to open it |
|------|----------------|
| [ONBOARDING-RESPOND-SOP.md](onboarding/ONBOARDING-RESPOND-SOP.md) | The full onboarding SOP — what you do, what Claude does, in order |
| [ONBOARDING-CLIENT-INPUT.md](onboarding/ONBOARDING-CLIENT-INPUT.md) | Fill this in for each new client and paste to Claude |
| [ONBOARDING-DECOMMISSION.md](onboarding/ONBOARDING-DECOMMISSION.md) | How to reset or fully offboard a client (use this before re-testing onboarding) |

## Testing and QA

| File | When to open it |
|------|----------------|
| [TESTING-RUNBOOK.md](testing/TESTING-RUNBOOK.md) | Step-by-step test procedures for Respond and Answer — cURL commands included |
| [TESTING-RELEASE-READINESS.md](testing/TESTING-RELEASE-READINESS.md) | Go/no-go checklist before any client go-live or demo |
| [TESTING-BUG-REPORT.md](testing/TESTING-BUG-REPORT.md) | Template to log a bug with all required context |

## Product Ideas (On Hold)

| File | When to open it |
|------|----------------|
| [PRODUCT-IDEAS.md](ideas/PRODUCT-IDEAS.md) | Ideas captured for future evaluation — each has full context, pitfalls, and prerequisites |

## Operations and Checklists

| File | When to open it |
|------|----------------|
| [DEPLOY-GATES.md](checklists/DEPLOY-GATES.md) | Must-pass gates before pushing any change to production or changing the schema |
| [sales-call.md](checklists/sales-call.md) | Objection handling scripts for prospect calls |
| [PHONE-SETUP.md](onboarding/PHONE-SETUP.md) | Three options for clinic phone number setup — dedicated, conditional forward, or porting |

---

## What lives outside this folder (technical reference — Claude uses these)

| Location | What's there |
|----------|-------------|
| `appointment-concierge/docs/` | VAPI-to-n8n payload contract, test JSON payloads |
| `appointment-concierge/vapi/prompts/` | Casey voice prompts (v1, v2, v3) |
| `docs/WORKFLOW-OPS.md` | n8n credentials, webhook URLs, environment management |
| `supabase/ENVIRONMENTS.md` | Database project URLs, migration runbook |
| `checklists/` | Auth setup reference, archived sprint |
| `testing/archive/` | Archived test strategy docs |
| `CLAUDE.md` | Claude Code instructions (not for reading — for Claude) |

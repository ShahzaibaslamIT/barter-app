---
id: 003
title: Admin monorepo split plan
stage: plan
date: 2026-05-25
surface: agent
model: claude-opus-4-7
feature: 001-admin-monorepo-split
branch: 001-admin-monorepo-split
user: Solution tech
command: /sp.plan
labels: ["plan","architecture","monorepo","turborepo","pnpm","prisma","admin"]
links:
  spec: specs/001-admin-monorepo-split/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-admin-monorepo-split/plan.md
  - specs/001-admin-monorepo-split/research.md
  - specs/001-admin-monorepo-split/data-model.md
  - specs/001-admin-monorepo-split/contracts/route-ownership.md
  - specs/001-admin-monorepo-split/contracts/auth-isolation.md
  - specs/001-admin-monorepo-split/quickstart.md
  - CLAUDE.md
tests:
  - validation: research.md resolves all NEEDS CLARIFICATION (zero remain)
  - validation: contracts/auth-isolation.md enumerates 6 test obligations for SC-005
  - validation: contracts/route-ownership.md maps every existing route family to a target app
  - validation: plan.md Constitution Check is PASS (vacuous — constitution template unfilled)
---

## Prompt

run ap.plan

(Interpreted as typo for /sp.plan. Skill invoked with the following arguments:)

Produce the implementation plan for feature 001-admin-monorepo-split (spec at specs/001-admin-monorepo-split/spec.md). The architectural direction is already decided: pnpm + Turborepo monorepo, apps/web + apps/admin, packages/db (Prisma) + packages/types + packages/ui + packages/config, admin on a subdomain, existing JWT admin auth retained, incremental migration with main always deployable.

## Response snapshot

Ran setup-plan.ps1 and produced six Phase-0/Phase-1 artifacts under `specs/001-admin-monorepo-split/`:

- **research.md** — 10 numbered decisions with rationale and rejected alternatives covering: monorepo tooling (pnpm + Turborepo), workspace layout (`apps/{web,admin}` + `packages/{db,types,ui,config}`), Prisma extraction strategy, Vercel multi-project setup, host-only cookie scoping for SC-005, 9-step incremental migration order (expand → migrate → contract), shared tooling configs, UI primitive sharing strategy, per-app env var split, and local dev experience (web=3000, admin=3001).
- **data-model.md** — confirms schema is unchanged; documents the `@barter/db` access pattern; lists the 10 top-level domain entities for completeness.
- **contracts/route-ownership.md** — authoritative mapping of every existing page and API route family to its post-migration app and path. Includes the rule that `/api/admin/*` prefixes are dropped on the admin subdomain.
- **contracts/auth-isolation.md** — cookie/middleware contract enforcing SC-005, with 6 test obligations (cross-cookie 401 tests, no-`Domain=` invariant, grep obligations confirming admin auth is not referenced in `apps/web` post-migration).
- **quickstart.md** — forward-looking developer guide: pnpm install, single-command `pnpm dev`, schema workflow, troubleshooting.
- **plan.md** — Summary, Technical Context, Constitution Check (vacuous PASS — constitution template is unfilled), full post-migration source tree, references to all Phase 0/1 artifacts, Phase 2 task-cluster skeleton for `/sp.tasks`, and a Complexity Tracking table justifying the four monorepo-introduced concerns.

`update-agent-context.ps1 -AgentType claude` ran successfully and updated `CLAUDE.md` with the new tech stack (TypeScript 5.x, Next.js 15.5, Prisma 6.16, NextAuth, Turborepo, pnpm).

One deferred policy clarification noted but not blocking: FR-015 redirect-vs-404 for legacy `/admin/*` URLs on the user-app host (recommended 301 for 90 days, then 404). Suggested running `/sp.clarify` if stakeholders want it locked in writing before the contract phase.

## Outcome

- ✅ Impact: plan.md + 5 Phase 0/1 artifacts ready as input to `/sp.tasks`; CLAUDE.md kept current
- 🧪 Tests: spec-quality items still PASS; no NEEDS CLARIFICATION remain in plan; constitution gate vacuous PASS
- 📁 Files: plan.md, research.md, data-model.md, contracts/route-ownership.md, contracts/auth-isolation.md, quickstart.md, CLAUDE.md (all created/updated)
- 🔁 Next prompts: `/sp.adr admin-monorepo-split` (now unblocked — plan.md exists), then `/sp.tasks` to enumerate the 9-step migration order into reviewable, dependency-ordered tasks
- 🧠 Reflection: The user's spec was unusually decision-rich (pnpm, Turbo, Vercel, subdomain, JWT auth all named upfront), which made Phase 0 research mostly about *documenting* chosen patterns rather than evaluating them. Where I added value was in (a) the host-only cookie invariant for SC-005 — easy to get subtly wrong with `Domain=.x.com`, (b) the 9-step migration order that keeps main deployable, and (c) the explicit grep-based test obligations in auth-isolation.md that turn an abstract "isolation" requirement into something verifiable in CI.

## Evaluation notes (flywheel)

- Failure modes observed: none in the planning phase. Watch for: misconfigured `Domain=` cookie attribute during step 7 of migration (would break SC-005); stale Prisma client in CI if Turbo pipeline dependsOn isn't wired correctly (would break FR-016).
- Graders run and results (PASS/FAIL): no NEEDS CLARIFICATION — PASS; constitution gate — PASS (vacuous); plan covers all 6 user stories and all 16 FRs — PASS.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): pick the lowest-risk first migration step (scaffolding only — no file moves) and execute it as a single PR, then re-evaluate the rest of the migration order based on what surfaces.

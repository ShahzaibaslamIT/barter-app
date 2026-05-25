---
id: 004
title: Admin monorepo split ADRs
stage: misc
date: 2026-05-25
surface: agent
model: claude-opus-4-7
feature: 001-admin-monorepo-split
branch: 001-admin-monorepo-split
user: Solution tech
command: /sp.adr admin-monorepo-split
labels: ["adr","architecture","monorepo","deployment","security","data-layer"]
links:
  spec: specs/001-admin-monorepo-split/spec.md
  ticket: null
  adr: history/adr/0001-monorepo-topology-and-build-orchestration.md
  pr: null
files:
  - history/adr/0001-monorepo-topology-and-build-orchestration.md
  - history/adr/0002-application-boundary-and-deployment-isolation.md
  - history/adr/0003-shared-data-access-layer.md
tests:
  - validation: all 3 ADRs document a clustered decision (not atomic)
  - validation: all 3 ADRs list at least one alternative with rationale (each lists 4-6)
  - validation: all 3 ADRs include both positive and negative consequences
  - validation: all 3 ADRs reference back to plan/research/contracts
---

## Prompt

/sp.adr admin-monorepo-split

## Response snapshot

Ran `.specify/scripts/powershell/check-prerequisites.ps1` — prerequisites met (plan.md + research.md + data-model.md + contracts/ + quickstart.md all present). No existing ADRs in `history/adr/`. Identified three decision clusters that each pass the significance test (impact + alternatives + cross-cutting):

1. **ADR-0001 — Monorepo Topology & Build Orchestration**: pnpm + Turborepo + workspace layout + shared `@barter/config` + local dev. Five alternatives considered (separate repos, npm workspaces, Yarn workspaces, Nx, pnpm-without-Turbo, route-group on separate deploy) with explicit rejection rationale for each.
2. **ADR-0002 — Application Boundary & Deployment Isolation**: two-app split + admin subdomain + two Vercel projects + per-app env split + host-only cookies. Five alternatives considered (same-domain path split, separate parent domain, unified auth, `Domain=.x.com` SSO cookies, server-side Redis sessions).
3. **ADR-0003 — Shared Data Access Layer**: `@barter/db` owns schema + migrations + Prisma client; both apps consume `import { prisma } from "@barter/db"`. Five alternatives considered (repo-root schema with per-app generate, per-app duplicate schema, Drizzle swap, separate databases, raw SQL).

The 9-step incremental migration sequence and UI primitive sharing (decisions 6 and 8 in research.md) are deliberately **not** promoted to ADRs — migration is a process decision and UI sharing falls out of ADR-0001. Both stay documented in plan.md/research.md.

`create-adr.sh` does not exist in this project (only PowerShell scripts), so ADRs were created agent-natively from `.specify/templates/adr-template.md`. Numbering: 0001-0003.

ADRs marked `Accepted` (not `Proposed`) because the user explicitly committed to this direction via the earlier AskUserQuestion flow (pnpm + Turborepo, subdomain, SDD workflow) and the plan is built on that commitment.

## Outcome

- ✅ Impact: three architectural decisions formally documented and reviewable; references created from plan.md and contracts to the ADRs (and vice versa)
- 🧪 Tests: significance checklist — PASS for all 3 (each meets all three criteria); ADR quality grader — PASS (clustered, alternatives explicit, both-sided consequences, concise but detailed)
- 📁 Files: history/adr/0001…0003.md (created), history/adr/ directory (created)
- 🔁 Next prompts: `/sp.tasks` to enumerate the 9-step migration order into dependency-ordered tasks; optionally `/sp.clarify` first if FR-015 redirect-vs-404 policy needs to be locked
- 🧠 Reflection: The three-cluster cut works because each cluster could in principle evolve independently — we could swap Turborepo for Nx (ADR-0001) without changing the deployment topology (ADR-0002) or data layer (ADR-0003). The temptation was to lump everything into one mega-ADR ("split the admin panel") but that would have made the ADRs unrevisitable in isolation. Three medium-grain ADRs is the right level for this refactor.

## Evaluation notes (flywheel)

- Failure modes observed: none in this step. Watched for the documented anti-patterns: over-granular ADRs (would have produced 10 atomic ADRs from research.md's 10 decisions) and missing alternatives (each ADR has 4-6 with explicit rejection rationale).
- Graders run and results (PASS/FAIL): significance gate — PASS x3; clustering rule — PASS x3; alternatives + tradeoffs — PASS x3; conciseness — PASS x3 (each ADR ~120-150 lines, dense but readable).
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): proceed to /sp.tasks; if any task surfaces a decision that contradicts an ADR, that ADR moves to Superseded and a new one captures the revised decision.

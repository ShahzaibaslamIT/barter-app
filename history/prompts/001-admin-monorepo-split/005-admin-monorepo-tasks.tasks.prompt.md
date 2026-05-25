---
id: 005
title: Admin monorepo split tasks
stage: tasks
date: 2026-05-25
surface: agent
model: claude-opus-4-7
feature: 001-admin-monorepo-split
branch: 001-admin-monorepo-split
user: Solution tech
command: /sp.tasks
labels: ["tasks","migration","monorepo","admin","execution-plan"]
links:
  spec: specs/001-admin-monorepo-split/spec.md
  ticket: null
  adr: history/adr/0001-monorepo-topology-and-build-orchestration.md
  pr: null
files:
  - specs/001-admin-monorepo-split/tasks.md
tests:
  - validation: 99 tasks generated; every task carries checkbox + ID + (story label where required) + exact file paths
  - validation: 6 user stories mapped to phases; US6 captured as cross-phase invariant
  - validation: priority inversion (US4/US5 P2 before US1/US2/US3 P1) explicitly justified
  - validation: tests deliberately omitted (not requested by spec); inline verification steps reference contracts/auth-isolation.md
---

## Prompt

/sp.tasks (no additional arguments)

## Response snapshot

Generated `specs/001-admin-monorepo-split/tasks.md` with **99 tasks** across **8 phases**:

- **Phase 1 — Setup** (T001–T011, 11 tasks): monorepo scaffolding, packages/config seed
- **Phase 2 — Foundational** (T012–T042, 31 tasks): apps/web relocation, packages/db extraction, packages/ui extraction, packages/types extraction, Turbo wiring
- **Phase 3 — US4 verification** (T043–T045, 3 tasks): schema-single-source acceptance
- **Phase 4 — US5 wiring** (T046–T050, 5 tasks): single-command dev scripts, SC-003 timing
- **Phase 5 — US1 MVP** (T051–T076, 26 tasks): apps/admin skeleton, Vercel barter-admin project, per-feature admin migration (users/listings/reports/audit-logs/dashboard), turbo-ignore deploy gating
- **Phase 6 — US2** (T077–T081, 5 tasks): subdomain DNS + binding + NEXTAUTH_URL split
- **Phase 7 — US3** (T082–T088, 7 tasks): middleware split, FR-015 redirect, host-only cookie verification, 6 test obligations from contracts/auth-isolation.md
- **Phase 8 — Polish** (T089–T099, 11 tasks): dep audit, dead-code cleanup, .env.example update, full SC verification, quickstart re-run, migration tag

**Per-story task counts**: US1=26, US2=5, US3=7, US4=3, US5=5. US6 is a cross-phase invariant, not its own phase.

**Priority inversion justified explicitly in the doc**: P2 stories (US4, US5) precede P1 stories (US1, US2, US3) because the P1 stories have hard technical dependencies on the data layer (US4) and dev wiring (US5). MVP is still US1 — flagged with 🎯 MVP banner on Phase 5.

**Tests deliberately omitted** per template guidance ("only generate test tasks if explicitly requested"). Verification steps embedded inline: grep assertions (T043, T044, T087), the 6 auth test obligations from contracts/auth-isolation.md (T088), per-task Vercel preview smoke-tests (T019, T029, T036, T042, T068), and full SC-001..SC-010 verification (T097).

**Parallel opportunities identified**:
- Phase 1: 8 `[P]` tasks (workspace config files)
- Phase 2: db/ui/types skeleton creation tasks `[P]`
- Phase 5: 5 `[P]` admin-app config files
- Phase 8: 7 `[P]` cleanup tasks

**Dependencies and execution order** documented with phase-to-phase gates and within-phase ordering. With two developers: dev A on long path (Phase 1 → 2 → 5), dev B on Phase 3 + 4 in parallel after Phase 2 first half lands.

**Format validation**: spot-checked tasks — every task has `- [ ] T0nn [P?] [USn?]` prefix and exact file paths. Spec-quality items (testable, atomic, file-path-bearing) pass.

## Outcome

- ✅ Impact: tasks.md is the executable plan for the entire migration; immediately consumable by /sp.implement
- 🧪 Tests: 99 tasks generated; format validation PASS; user-story coverage verified (US1–US5 each have own phase; US6 as invariant); SC-001..SC-010 mapped to verification tasks
- 📁 Files: specs/001-admin-monorepo-split/tasks.md (created)
- 🔁 Next prompts: `/sp.implement` (executes tasks one-by-one — start with Phase 1), `/sp.checklist` (optional pre-flight quality checklist for the migration), or `/sp.clarify` (recommended before Phase 7 if FR-015 redirect-vs-404 policy needs locking)
- 🧠 Reflection: Two key calls here. (1) Folding most of US4's heavy lifting into Foundational because the data layer is a technical prerequisite for everything else — keeping US4 as its own phase felt artificial, so I made it a verification-only phase. (2) Per-feature admin migration in Phase 5 (T069–T073, one PR each for users/listings/reports/audit-logs/dashboard) is the riskiest part of the migration — each PR is small, deployable, and revertible. Strict sequential merge to avoid `apps/admin/` conflicts.

## Evaluation notes (flywheel)

- Failure modes observed: none. Watched for the documented anti-patterns: tasks too coarse to execute (broke "migrate admin features" into 5 separate per-feature tasks T069-T073); tasks missing file paths (none); priority confusion (explicitly addressed with the inversion note at top).
- Graders run and results (PASS/FAIL): task format — PASS; user-story coverage — PASS; independent-test criteria per phase — PASS; MVP scope identified — PASS (Phase 5 / US1).
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): start /sp.implement on Phase 1 (T001-T011) which is the lowest risk — pure additive scaffolding, no source moves yet. Measure: did the 8 `[P]` tasks actually parallelize cleanly in one PR or fragment into reviewer headaches?

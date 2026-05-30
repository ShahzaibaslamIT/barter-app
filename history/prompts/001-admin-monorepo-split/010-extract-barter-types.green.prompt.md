---
id: 010
title: Add @barter/types shared types package
stage: green
date: 2026-05-30
surface: agent
model: claude-opus-4-8
feature: 001-admin-monorepo-split
branch: 007-extract-barter-types
user: ShahzaibaslamIT
command: "start phase 2d"
labels: ["monorepo", "phase-2d", "barter-types", "refactor"]
links:
  spec: specs/001-admin-monorepo-split/spec.md
  ticket: null
  adr: history/adr/0003-shared-data-access-layer.md
  pr: null
files:
  - packages/types/package.json (new)
  - packages/types/tsconfig.json (new)
  - packages/types/src/index.ts (new — empty placeholder)
  - apps/web/package.json (+@barter/types)
  - specs/001-admin-monorepo-split/tasks.md (T037-T042)
tests:
  - "pnpm install — success (15s)"
  - "pnpm build — full workspace, 2/2 green"
  - "pnpm lint — FAILS (pre-existing: eslint not installed; not a 2d regression; ignored at build time)"
---

## Prompt

start phase 2d

## Response snapshot

Added `@barter/types`, the third and final shared package of Phase 2.

- Created `packages/types` (package.json with no runtime deps, tsconfig,
  `src/index.ts` = `export {}` placeholder + guidance comment). Starts empty by
  design (T038) — cross-app DTOs / non-Prisma enums land during US1; Prisma
  model types stay in `@barter/db`.
- Added `@barter/types` workspace dep to `apps/web/package.json`. No codemod, no
  `transpilePackages` — nothing imports it yet and it ships no runtime code.
- T040: no-op — `pnpm-workspace.yaml` already globs `packages/*`.
- Verification: `pnpm install` + full `pnpm build` green. `pnpm lint` fails on a
  pre-existing gap (ESLint deps never installed against the scaffolded
  `.eslintrc.cjs`); flagged as a follow-up, not blocking — deploys ignore lint.
- Committed `d35ba3a` on `007-extract-barter-types`; pushed for preview.

## Outcome

- ✅ Impact: all three shared packages (`@barter/db`, `@barter/ui`,
  `@barter/types`) now exist and are consumed by `apps/web`. Phase 2
  (Foundational) is functionally complete pending the 2d merge.
- 🧪 Tests: install + build green; lint pre-existing-broken (documented).
- 📁 Files: 3 new + 1 manifest + tasks/PHR. Zero runtime change.
- 🔁 Next prompts: merge 2d → main, then Phase 3 (US4 verify) + Phase 4 (US5 dev
  wiring), both quick, before Phase 5 (admin app standup — the big one).
- 🧠 Reflection: an empty types package is the lowest-risk extraction — no files
  move, no imports change. Its value is structural: it gives US1 a home for
  shared DTOs so apps/web and apps/admin don't each invent their own.

## Evaluation notes (flywheel)

- Failure modes observed: `pnpm lint` surfaced that ESLint was never wired up
  (scaffolded config, missing deps) — discovered now only because Phase 2 has a
  lint gate; harmless to deploys.
- Graders run and results (PASS/FAIL): build PASS; lint FAIL (pre-existing, out of scope).
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): add an explicit ESLint-deps task
  (eslint + eslint-config-next + @barter/config plugins) so the lint gate works
  before Phase 8.

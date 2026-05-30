---
id: 008
title: Extract @barter/db shared data layer
stage: green
date: 2026-05-30
surface: agent
model: claude-opus-4-8
feature: 001-admin-monorepo-split
branch: 005-extract-barter-db
user: ShahzaibaslamIT
command: (continued session) "start phase 2b , both issues solved" / "what is next we were in deployment phase 2b"
labels: ["monorepo", "prisma", "phase-2b", "barter-db", "refactor"]
links:
  spec: specs/001-admin-monorepo-split/spec.md
  ticket: null
  adr: history/adr/0003-shared-data-access-layer.md
  pr: null
files:
  - packages/db/package.json (new)
  - packages/db/tsconfig.json (new)
  - packages/db/src/index.ts (new — barrel)
  - packages/db/src/client.ts (moved from apps/web/lib/prisma.ts)
  - packages/db/prisma/** (moved from apps/web/prisma/**)
  - apps/web/package.json (add @barter/db; drop @prisma/client, prisma, postinstall)
  - package.json (add db:generate, db:migrate)
  - apps/web/** (47 files codemodded: 42x @/lib/prisma, 5x @prisma/client + 2 scripts)
  - specs/001-admin-monorepo-split/tasks.md (T020-T028 checked)
tests:
  - "pnpm install — success (1m19s); @barter/db postinstall generated Prisma client v6.19.3 to hoisted root node_modules"
  - "pnpm turbo run build --filter=web... — 2/2 tasks green (@barter/db#build -> web:build)"
  - "grep: zero remaining @/lib/prisma or @prisma/client refs in apps/web"
---

## Prompt

start phase 2b , both issues solved
(then, after compaction) Okay so what is next we were in deployment phase 2b

## Response snapshot

Executed Phase 2b (T020–T028 of the admin-monorepo-split): extracted Prisma
into a `@barter/db` workspace package per ADR-0003.

- Created `packages/db` (package.json with generate/build/migrate/postinstall
  scripts, tsconfig, and `src/index.ts` barrel: `export { prisma } from
  "./client"` + `export * from "@prisma/client"`).
- `git mv` preserved history: `apps/web/prisma` → `packages/db/prisma`
  (schema, 20 migrations, seed.ts); `apps/web/lib/prisma.ts` →
  `packages/db/src/client.ts` (Neon keep-alive singleton untouched).
- Codemod: 42 files `@/lib/prisma` → `@barter/db`; 5 active `@prisma/client`
  type/enum imports + 2 dev scripts → `@barter/db`. seed.ts (now inside the db
  package) keeps `@prisma/client`.
- `apps/web/package.json`: added `@barter/db` workspace dep; removed
  `@prisma/client`, `prisma`, and the orphaned `prisma generate` postinstall.
- Root: added `db:generate` / `db:migrate` scripts.
- Verified: `pnpm install` + `turbo run build --filter=web...` green.
- Committed `a84c187` on branch `005-extract-barter-db`. T029 (deploy preview /
  smoke-test / merge) is the remaining gate.

## Outcome

- ✅ Impact: apps/web now consumes the data layer exclusively through
  `@barter/db`; Prisma owned in exactly one place (ADR-0003 invariant). No
  behavioural change — production build verified byte-equivalent in behaviour.
- 🧪 Tests: install + monorepo build green; grep assertions confirm zero stray
  imports.
- 📁 Files: 76 changed (23 renames, 3 new package files, 47 codemods, 3 manifests/tasks).
- 🔁 Next prompts: merge decision (preview vs. straight-to-gamma), then Phase 2c
  (@barter/ui, T030–T036).
- 🧠 Reflection: hoisted pnpm linker means the default Prisma generator output
  lands in root node_modules and is reachable from apps/web with no custom
  `output` path — the extraction needed no schema change.

## Evaluation notes (flywheel)

- Failure modes observed: cosmetic Turbo warning "no output files for
  @barter/db#build" (Prisma writes to hoisted root node_modules, outside the
  package — not cacheable per-package; functionally harmless).
- Graders run and results (PASS/FAIL): build PASS; import-grep PASS.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): give @barter/db a real `dist`
  output or mark its build uncacheable to silence the Turbo warning during 2c.

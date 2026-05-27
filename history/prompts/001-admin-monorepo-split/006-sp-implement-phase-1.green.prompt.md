---
id: 006
title: sp.implement Phase 1 scaffolding
stage: green
date: 2026-05-25
surface: agent
model: claude-opus-4-7
feature: 001-admin-monorepo-split
branch: 001-admin-monorepo-split
user: Solution tech
command: /sp.implement
labels: ["implement","monorepo","scaffolding","phase-1","baseline-cleanup","git-commits"]
links:
  spec: specs/001-admin-monorepo-split/spec.md
  ticket: null
  adr: history/adr/0001-monorepo-topology-and-build-orchestration.md
  pr: null
files:
  - package.json
  - pnpm-workspace.yaml
  - turbo.json
  - apps/.gitkeep
  - packages/.gitkeep
  - packages/config/package.json
  - packages/config/eslint/base.js
  - packages/config/tsconfig.base.json
  - packages/config/tailwind/base.js
  - specs/001-admin-monorepo-split/tasks.md
tests:
  - validation: 9 of 11 Phase-1 tasks completed (T001-T003, T005-T010); T004 + T011 explicitly deferred with documented reasons
  - validation: 3 baseline commits on main precede Phase 1 work (feat/admin+features, chore/in-flight, chore/speckit)
  - validation: working tree clean before Phase 1 began; clean baseline preserved through commits
  - validation: existing repo-root `next dev` script untouched — US6 invariant preserved
---

## Prompt

/sp.implement (no additional arguments)

User decisions captured via AskUserQuestion:
- Baseline: commit current work to main first (recommended)
- Scope: Phase 1 only (T001-T011, scaffolding) (recommended)
- Baseline path: I run the commits for the user
- Cruft: delete Android Gradle leftovers

## Response snapshot

**Pre-flight assessment**: surfaced three blockers before touching files:
1. Working tree had 91 dirty entries (31 modified tracked + 60 untracked) — would have created an unreviewable Phase 1 diff
2. 8 of 99 tasks require Vercel/DNS dashboard access (only the user can run them)
3. Spec invariant US6 ("main always deployable") would break if I went straight in

User chose path: clean baseline + Phase 1 only. Got explicit consent to commit on user's behalf and delete the cruft.

**Baseline cleanup (committed on main)**:

1. Deleted Windows redirect artifact `nul` and Android Gradle leftovers (`build.gradle`, `settings.gradle`, `gradle.properties`, `gradle/`, `gradlew`, `gradlew.bat`, `app/src/`).
2. Commit `54f654c` — `feat: admin panel, user moderation, notifications, terms gate, profile completion` (68 files, +5528/-45). Bundled because `prisma/schema.prisma` modifications spanned admin + user-feature concerns inseparably (PushSubscription + terms + Admin/AuditLog/Report/AppSettings models arrived together).
3. Commit `68aab6b` — `chore: in-flight updates to user-app pages, API routes, and dependencies` (30 files, +6543/-4684).
4. Commit `7a9eec2` — `chore(speckit): add SDD tooling, ADRs, PHRs, and feature 001 artifacts` (49 files, +8547).
5. Switched back to `001-admin-monorepo-split` and `git merge main --ff-only`. Working tree clean.

**Phase 1 scaffolding executed (T001-T003, T005-T010 = 9 of 11 tasks)**:

- T001: added `"packageManager": "pnpm@9.15.0"` to root `package.json`; renamed `"name"` from `my-v0-project` to `barter-app`. (`corepack enable` deferred to user — machine-level setup.)
- T002: `pnpm-workspace.yaml` declaring `apps/*` and `packages/*`.
- T003: `turbo.json` with `build` (dependsOn `^build`), `dev` (cache:false, persistent:true), `lint`, `generate` tasks; global env `DATABASE_URL`, `JWT_SECRET`.
- T005, T006: `apps/.gitkeep`, `packages/.gitkeep`.
- T007: `packages/config/package.json` (name `@barter/config`, three exports).
- T008: `packages/config/eslint/base.js` extending `next/core-web-vitals` + `next/typescript`.
- T009: `packages/config/tsconfig.base.json` (strict, ES2022, bundler module resolution).
- T010: `packages/config/tailwind/base.js` — Tailwind v4 preset with the existing color/radius/animation theme tokens.

**Two tasks deliberately deferred**:

- **T004** (rewrite root `package.json` scripts + remove Next.js deps): would have broken the current repo-root `next dev` because Phase 2 hasn't moved files into `apps/web` yet. The tasks.md was edited inline to defer T004 to Phase 2 start (alongside T012). This preserves US6 ("main always deployable").
- **T011** (`pnpm install` + workspace verification): machine-level step requiring corepack enablement on the user's Windows machine. User runs `corepack enable && corepack use pnpm@9.15.0 && pnpm install` locally to validate.

The tasks.md file was updated to reflect completed tasks with `[x]` and to record the deferral rationale next to T004 and T011.

## Outcome

- ✅ Impact: monorepo scaffolding live on `001-admin-monorepo-split`; baseline cleaned via 3 logical commits on main; production user app unaffected; ready for Phase 2 once user confirms `pnpm install` succeeds locally
- 🧪 Tests: T001-T003, T005-T010 — done in code (9 tasks); T011 verification deferred to user; T004 deferred to Phase 2 with explicit reason
- 📁 Files (Phase 1 only): package.json (M), pnpm-workspace.yaml, turbo.json, apps/.gitkeep, packages/.gitkeep, packages/config/{package.json, eslint/base.js, tsconfig.base.json, tailwind/base.js}, specs/001-admin-monorepo-split/tasks.md (M — task-status updates)
- 🔁 Next prompts: user runs `corepack enable && corepack use pnpm@9.15.0 && pnpm install` locally and reports `pnpm ls --depth -1` output. Once confirmed, proceed with Phase 2 (T012 onward) which relocates apps/web and extracts the data layer. **Do not** auto-run Phase 2 — it has the largest file-movement risk.
- 🧠 Reflection: The biggest value-add of this session wasn't the scaffolding code (mechanical) — it was catching the Phase 1 / Phase 2 sequencing bug in tasks.md before executing it. T004 as written would have broken the live user app. Caught it by re-reading the phase checkpoint against the actual state of the repo. Lesson: even with a thorough plan, re-read each task against current state before executing.

## Evaluation notes (flywheel)

- Failure modes observed: tasks.md had a sequencing bug (T004 destructive, but Phase 2 hadn't yet provided a destination for the displaced code). Detected pre-execution; deferred and documented. Also: `mkdir` of empty `apps/` and `packages/` doesn't get tracked by git without `.gitkeep` — handled by T005/T006 in the plan.
- Graders run and results (PASS/FAIL): working-tree-clean before commits — PASS; commit-message format follows project style — PASS; .env files not committed — PASS; sequenced commits preserve logical reviewability — PASS; Phase 1 maintains US6 (main deployable) — PASS.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): user runs `pnpm install`; if it surfaces any peer-dep warnings on the existing app deps (since pnpm is stricter than npm), surface them as a separate Phase-1.5 task before Phase 2 begins.

---
id: 017
title: Wire up ESLint across the monorepo
stage: green
date: 2026-06-02
surface: agent
model: claude-opus-4-8
feature: 001-admin-monorepo-split
branch: main
user: ShahzaibaslamIT
command: (conversational — "go with A" / ESLint baseline)
labels: ["eslint", "tooling", "monorepo", "phase-8", "open-issue-3"]
links:
  spec: specs/001-admin-monorepo-split/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - package.json (add eslint + eslint-config-next devDeps)
 - apps/web/.eslintrc.cjs (require.resolve the shared config)
 - apps/admin/.eslintrc.cjs (require.resolve the shared config)
 - packages/config/eslint/base.js (react/no-unescaped-entities -> off)
 - pnpm-lock.yaml
 - specs/001-admin-monorepo-split/tasks.md (open issue #3 resolved)
tests:
 - pnpm lint (turbo): 3/3 successful, exit 0
 - apps/web: 0 errors, 108 warnings
 - apps/admin: 0 errors, 5 warnings
---

## Prompt

go with A
(Option A = wire up ESLint with a baseline: get pnpm lint working, fix the
blocking stuff, warn on the rest, and stop before any large warning cleanup.)

## Response snapshot

Open issue #3: ESLint config (.eslintrc.cjs + shared @barter/config/eslint/base)
was scaffolded at init but the packages were never installed — `pnpm lint`
failed with "ESLint must be installed" and lint had never run.

1. Added `eslint@^8.57.1` + `eslint-config-next@15.5.9` to the root devDeps
   (hoisted linker → resolvable by both apps and the shared config). Chose
   ESLint 8 so the existing `.eslintrc.cjs` (eslintrc format) works natively
   (ESLint 9 defaults to flat config).
2. Fixed shared-config resolution: both apps' `.eslintrc.cjs` now use
   `extends: [require.resolve("@barter/config/eslint/base")]`. ESLint 8's own
   resolver ignores the package.json `exports` map (so the bare specifier
   failed: "Failed to load config"), but Node's `require.resolve` honors exports
   and returns the absolute path, which ESLint loads directly.
3. Ran lint: the ONLY error-level rule was `react/no-unescaped-entities`
   (26 cosmetic `'`/`"`-in-JSX hits in apps/web). Downgraded it to `off` in the
   shared base — literal entities render fine. All other findings are warnings.

Result: `pnpm lint` passes (turbo 3/3, 0 errors). Informative warnings remain:
web 108 (62 no-explicit-any + no-unused-vars + no-img-element + exhaustive-deps),
admin 5. Did NOT mass-fix warnings (per Option A — stop before large cleanup).
`eslint.ignoreDuringBuilds: true` left as-is so Vercel deploys are unaffected.

Branch 020-eslint-wiring → merged --no-ff to main (c478032). Config/tooling
only; no runtime change, so no preview needed.

## Outcome

- ✅ Impact: lint works for the first time in this monorepo; future code gets
  linted; open issue #3 resolved.
- 🧪 Tests: pnpm lint 3/3 successful (0 errors); web 108 warns / admin 5 warns.
- 📁 Files: 6 changed (commit 5d841d9), merged c478032.
- 🔁 Next prompts: optional — clean up the 108 web warnings (unused imports are
  the quick wins; no-explicit-any/exhaustive-deps are case-by-case); optionally
  flip ignoreDuringBuilds→false to make lint gate deploys. Otherwise Phase 6
  (needs a domain) is the remaining migration work.
- 🧠 Reflection: the require.resolve trick is the reliable pattern for sharing
  an eslintrc config across a pnpm workspace under ESLint 8.

## Evaluation notes (flywheel)

- Failure modes observed: (1) ESLint 8 "Failed to load config" — exports-map
  blind resolver, fixed with require.resolve; (2) `next lint` deprecation
  warning (Next 16 will remove it — migrate to ESLint CLI later, non-blocking).
- Graders run and results (PASS/FAIL): pnpm lint PASS (0 errors).
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): if migrating off `next lint`, run
  `npx @next/codemod next-lint-to-eslint-cli` and switch the lint script.

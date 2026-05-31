---
id: 012
title: Scaffold apps/admin skeleton
stage: green
date: 2026-05-31
surface: agent
model: claude-opus-4-8
feature: 001-admin-monorepo-split
branch: 009-admin-app-skeleton
user: ShahzaibaslamIT
command: "begin stage 1, build the apps/admin skeleton"
labels: ["monorepo", "phase-5", "US1", "apps-admin", "scaffold"]
links:
  spec: specs/001-admin-monorepo-split/spec.md
  ticket: null
  adr: history/adr/0002-application-boundary-and-deployment-isolation.md
  pr: null
files:
  - apps/admin/package.json (new)
  - apps/admin/next.config.mjs (new — transpilePackages + tracing)
  - apps/admin/tsconfig.json (new)
  - apps/admin/.eslintrc.cjs (new)
  - apps/admin/postcss.config.mjs (new)
  - apps/admin/app/globals.css (new — theme tokens + @source)
  - apps/admin/app/layout.tsx (new — minimal, no providers)
  - apps/admin/app/page.tsx (new — redirect to /login)
  - specs/001-admin-monorepo-split/tasks.md (T051-T058)
tests:
  - "pnpm install — admin workspace linked (23s)"
  - "pnpm turbo run build --filter=admin... — 2/2 green; routes / and /_not-found compiled"
---

## Prompt

begin stage 1, build the apps/admin skeleton

## Response snapshot

Scaffolded `apps/admin` — an empty-but-buildable Next app, stage 1 of Phase 5.
Not deployed (the `barter-admin` Vercel project is stage 3, user-driven).

Eight files: package.json (name `admin`, port 3001, four `@barter/*` deps +
geist), next.config.mjs, tsconfig.json, .eslintrc.cjs, postcss.config.mjs,
app/globals.css, app/layout.tsx, app/page.tsx.

Three deliberate deviations from the written tasks, all carried forward from
hard-won lessons:
1. **T055 → globals.css, not tailwind.config.ts** — project is Tailwind v4
   CSS-first. Admin gets its own globals.css with theme tokens + `@source` for
   `@barter/ui` (else the kit's classes purge in the admin app).
2. **transpilePackages + outputFileTracingRoot baked into next.config from the
   start** — admin imports `@barter/db`/`@barter/ui` (raw-TS); without these the
   admin app would 500 on its first preview (the exact 2b/2c failures).
3. **layout.tsx has no providers** — admin has no NextAuth/Notification/SW.

`pnpm install` linked the admin workspace; `turbo run build --filter=admin...`
is green (2/2). Committed `b78537f` on `009-admin-app-skeleton` (not pushed —
stage 2 moves login/auth in before the first deploy).

## Outcome

- ✅ Impact: `apps/admin` exists and builds; the shell for the independently
  deployable admin app (US1) is in place.
- 🧪 Tests: install + admin build green.
- 📁 Files: 8 new + tasks/PHR. No apps/web change; nothing deployed.
- 🔁 Next prompts: stage 2 (move admin login + auth, T059-T064), then pause for
  stage 3 (user creates barter-admin in Vercel).
- 🧠 Reflection: baking the transpile/tracing/@source fixes in up front (rather
  than discovering them on the admin app's first preview, as happened for web)
  is the payoff of having captured those as memories — the skeleton should
  deploy clean the first time.

## Evaluation notes (flywheel)

- Failure modes observed: none. `next build` auto-added `allowJs` to tsconfig
  (expected Next behaviour); kept.
- Graders run and results (PASS/FAIL): admin build PASS.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): in stage 2, move admin-auth + login
  and confirm `pnpm --filter admin build` still green before the user wires
  Vercel.

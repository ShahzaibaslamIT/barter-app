---
id: 016
title: Phase 8 polish — dep audit and docs
stage: refactor
date: 2026-06-02
surface: agent
model: claude-opus-4-8
feature: 001-admin-monorepo-split
branch: main
user: ShahzaibaslamIT
command: (conversational — "start phase 8 polish")
labels: ["phase-8", "cleanup", "dependencies", "docs", "tailwind"]
links:
  spec: specs/001-admin-monorepo-split/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - apps/admin/package.json (removed @barter/ui dep)
 - apps/admin/next.config.mjs (transpilePackages now just @barter/db)
 - apps/admin/app/globals.css (removed dead @source packages/ui scan)
 - pnpm-lock.yaml (lockfile updated)
 - .env.example (new — per-app env var docs)
 - apps/web/README.md (new)
 - apps/admin/README.md (new — host-only cookie invariant + 3-layer auth)
 - specs/001-admin-monorepo-split/tasks.md (T089–T099 statuses)
tests:
 - pnpm --filter admin build (clean — identical route/bundle sizes after @barter/ui removal)
 - production HTTP checks: /login 200, /dashboard 307, /api/users 401 (middleware gating works)
 - user-verified barter-admin preview: dashboard fully styled (no purge regression)
---

## Prompt

start phase 8 polish
(then) merge it and check production

## Response snapshot

Worked the domain-independent Phase 8 tasks:

- T089 ✅ — admin dep audit. The admin package.json was already free of the
  copy-paste suspects (Twilio/Resend/Firebase/OneSignal/Cloudinary/NextAuth/
  leaflet). Found `@barter/ui` had ZERO import sites (admin UI is plain Tailwind
  + lucide). Removed it from deps, from transpilePackages (now just @barter/db),
  and the dead `@source ".../packages/ui/..."` from globals.css. Build green with
  identical bundle sizes; user confirmed the preview dashboard renders fully
  styled (no Tailwind purge regression).
- T090 ✅ no-op — web still uses jsonwebtoken (3 sites) + bcryptjs (4), kept.
- T092 ✅ — confirmed web/lib/admin-auth.ts gone (Phase 5).
- T093 ✅ — root .env.example, env vars grouped per app, keys enumerated from
  actual process.env usage.
- T094/T095 ✅ — per-app READMEs; admin README documents the host-only
  admin_token cookie invariant + 3-layer defense-in-depth auth.
- T096 SKIPPED — update-agent-context.ps1 is branch-name-coupled and CLAUDE.md
  here is the curated rules file we won't auto-clobber.
- T097/T098 deferred to the post-Phase-6 final sweep; T099 (tag) blocked until
  the migration is actually complete (Phase 6 + T086 remain).

Merged branches 019-phase8-dep-audit to main (d5a01b6). Verified production
barter-admin-wine.vercel.app: /login 200, /dashboard 307, /api/users 401.

## Outcome

- ✅ Impact: leaner admin app (no unused @barter/ui / dead transpile / dead
  @source), accurate per-app docs, production auth gating confirmed live.
- 🧪 Tests: admin build clean; production HTTP gating checks pass; preview
  styling user-verified.
- 📁 Files: 8 changed across 2 commits (b3f05a4 dep audit, 6f73d0d docs),
  merged d5a01b6.
- 🔁 Next prompts: optional ESLint wiring (open issue #3); Phase 6 (subdomain,
  needs a domain) then final T086/T097/T098/T099.
- 🧠 Reflection: the "@barter/ui in admin" turned out unused — the admin UI was
  rebuilt plain rather than reusing the kit; worth catching in the audit.

## Evaluation notes (flywheel)

- Failure modes observed: a Chrome "Dangerous" (Safe Browsing) badge appeared on
  the long *.vercel.app PREVIEW login URL — a false-positive heuristic on
  login-form + unknown-subdomain, NOT caused by code. Resolved properly by a
  Phase 6 custom domain. Production functionally healthy.
- Graders run and results (PASS/FAIL): admin build PASS; prod gating PASS.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): when auditing a copied app, grep
  import-site counts per dependency up front to catch unused workspace deps.

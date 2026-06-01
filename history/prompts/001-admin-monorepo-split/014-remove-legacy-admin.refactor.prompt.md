---
id: 014
title: Remove legacy admin from web app
stage: refactor
date: 2026-06-01
surface: agent
model: claude-opus-4-8
feature: 001-admin-monorepo-split
branch: main
user: ShahzaibaslamIT
command: (conversational — Phase 5 final cleanup)
labels: ["cleanup", "monorepo", "admin", "middleware", "phase-5"]
links:
  spec: specs/001-admin-monorepo-split/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - apps/web/app/admin/** (deleted — 11 UI pages)
 - apps/web/app/api/admin/** (deleted — 11 API routes)
 - apps/web/lib/admin-auth.ts (deleted)
 - apps/web/lib/audit.ts (deleted)
 - apps/web/app/auth/page.tsx (removed Admin Portal button + Link/ShieldCheck imports)
 - apps/web/middleware.ts (removed admin-protection block + ADMIN_COOKIE; kept user moderation gate)
 - specs/001-admin-monorepo-split/tasks.md (T081b/T083/T091 done, T082 partial)
tests:
 - pnpm --filter web build (clean — no /admin or /api/admin routes emitted; /auth + middleware compile)
 - Select-String admin_token in apps/web → ZERO matches
 - Vercel preview (branch 017) verified by user: marketplace + auth page OK, no Admin Portal button
---

## Prompt

hey claude we were on full clean removal i believe ?
(later) the preview works, merge it

## Response snapshot

Executed the full clean removal of the legacy admin from `apps/web`, now that
`barter-admin` (apps/admin) was verified in Phase 5:

1. Deleted `apps/web/app/admin/*` (11 UI pages) and `apps/web/app/api/admin/*`
   (11 routes), plus admin-only libs `lib/admin-auth.ts` and `lib/audit.ts`
   (confirmed all 12 importers lived inside the admin tree — zero non-admin
   consumers).
2. Removed the dark "Admin Portal" `<Link href="/admin/login">` button from
   `app/auth/page.tsx` and its now-orphaned `Link` + `ShieldCheck` imports.
3. Stripped the admin-protection block + `ADMIN_COOKIE` const from
   `middleware.ts`, keeping the suspended/banned/blacklisted user moderation
   gate intact and simplifying its path condition.
4. Verified the web build is clean and zero `admin_token` references remain in
   `apps/web/`. Pushed branch `017-remove-legacy-admin`; user confirmed the
   Vercel preview; merged `--no-ff` to main (188a4b7) and deleted the branch.
5. Updated tasks.md: T081b ✅, T083 ✅, T091 ✅; T082 partial (web side done,
   `apps/admin/middleware.ts` deferred to Phase 7); noted T090 still open
   (`apps/web/lib/auth.ts:149` still uses jsonwebtoken for user auth).

## Outcome

- ✅ Impact: apps/web no longer contains any admin code; the admin panel lives
  solely in apps/admin. Marketplace unaffected; main stays deployable.
- 🧪 Tests: web build clean (no admin routes emitted); zero admin_token refs;
  user-verified Vercel preview.
- 📁 Files: 26 changed (5 insertions, 2806 deletions) in commit 5723eb8;
  tasks.md doc commit d69b848.
- 🔁 Next prompts: Phase 6 (admin.<domain> subdomain + DNS, T077–T081) and
  Phase 7 (T086 legacy /admin→subdomain 301, optional apps/admin/middleware.ts).
- 🧠 Reflection: keep-old-until-verified paid off — removal was a single
  low-risk PR after barter-admin was proven, with a clean preview gate.

## Evaluation notes (flywheel)

- Failure modes observed: Grep/ripgrep tool intermittently failed with uv_spawn
  errors this session — fell back to PowerShell Select-String. PowerShell
  here-string for git commit -m broke on embedded parens/slashes — used a temp
  message file with git commit -F instead.
- Graders run and results (PASS/FAIL): web build PASS; admin_token grep PASS (0).
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): prefer git commit -F <file> for any
  multi-line commit message on Windows PowerShell to avoid here-string parsing.

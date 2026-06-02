---
id: 015
title: Admin middleware and Phase 7 isolation
stage: green
date: 2026-06-02
surface: agent
model: claude-opus-4-8
feature: 001-admin-monorepo-split
branch: main
user: ShahzaibaslamIT
command: (conversational — Phase 7 code work, Phase 6 deferred)
labels: ["middleware", "auth", "cookie-isolation", "phase-7", "admin"]
links:
  spec: specs/001-admin-monorepo-split/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - apps/admin/middleware.ts (new — edge-safe cookie-presence gate)
 - specs/001-admin-monorepo-split/tasks.md (T082/T084/T085/T087 done; T086 blocked on Phase 6; T088 notes)
tests:
 - pnpm --filter admin build (clean — ƒ Middleware 34.3 kB present, all routes intact)
 - Select-String next-auth in apps/admin → ZERO (T087)
 - code inspection: admin login cookie + web NextAuth cookie both host-only, no domain attr (T084/T085)
 - Vercel barter-admin preview (branch 018) verified by user (logged-out → /login; login works)
---

## Prompt

probab;y we were starting phase 6 right ?
(then chose: Skip Phase 6 for now → Phase 7 code work)
(then) the preview works, merge it

## Response snapshot

Phase 6 (admin.<domain> subdomain) was deferred — it needs a custom root domain
the user doesn't have yet; admin remains reachable at barter-admin-wine.vercel.app
(the MVP fallback). Pivoted to the Phase 7 code work that needs no domain:

1. T082 — added apps/admin/middleware.ts: an EDGE-SAFE cookie-PRESENCE gate
   (no jwt.verify — jsonwebtoken isn't Edge-compatible). Redirects anonymous
   page requests to /login, returns 401 for anonymous /api/*, exempts /login
   and /api/auth/*. The verifying guards (getAdminFromRequest in route handlers,
   getAdminFromCookies in (protected)/layout.tsx, both Node runtime) remain the
   PRIMARY auth — this is defense-in-depth. Admin build green (ƒ Middleware 34.3 kB).
2. T084 ✅ — admin login sets admin_token host-only (no domain attribute).
3. T085 ✅ — web NextAuth sessionToken (auth-options.ts:326) host-only, no domain.
4. T087 ✅ — zero admin_token in apps/web, zero next-auth in apps/admin.
5. T086 — left BLOCKED on Phase 6 (can't bake the throwaway vercel.app URL into a
   24h-cached 301; /admin 404s on web meanwhile, harmless).
6. T088 — noted runnable now against the existing separate vercel.app origins
   (manual browser check, still pending).

Branch 018-admin-middleware → user verified barter-admin preview → merged --no-ff
to main (e60d99a), branch deleted.

## Outcome

- ✅ Impact: admin app now has an edge auth gate; Phase 7 cookie-isolation
  verified — US3 holds structurally (separate origins, different cookie names,
  no domain attr on either). Phases 5 + 7 essentially complete.
- 🧪 Tests: admin build clean; isolation greps + cookie inspections pass;
  user-verified preview.
- 📁 Files: apps/admin/middleware.ts (new); tasks.md updates. Commit 1efbd65,
  merge e60d99a.
- 🔁 Next prompts: Phase 8 polish (dep prune T089/T090, ESLint wiring, final
  tag T099) — code work, startable anytime. Phase 6 + T086 + T088 await a domain.
- 🧠 Reflection: most of US3 was already true by construction once the apps were
  split onto separate hosts; the middleware is hardening, not the mechanism.

## Evaluation notes (flywheel)

- Failure modes observed: none new. Key design call — keep middleware to a
  presence check, not JWT verification, because Edge runtime lacks jsonwebtoken.
- Graders run and results (PASS/FAIL): admin build PASS; isolation greps PASS.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): when a domain exists, land T086 +
  Phase 6 together so the 301 target is the real subdomain from day one.

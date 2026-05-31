---
id: 013
title: Copy admin login + auth into apps/admin
stage: green
date: 2026-05-31
surface: agent
model: claude-opus-4-8
feature: 001-admin-monorepo-split
branch: 009-admin-app-skeleton
user: ShahzaibaslamIT
command: "start stage 2 with the keep-old-until-verified approach"
labels: ["monorepo", "phase-5", "US1", "apps-admin", "auth"]
links:
  spec: specs/001-admin-monorepo-split/spec.md
  ticket: null
  adr: history/adr/0002-application-boundary-and-deployment-isolation.md
  pr: null
files:
  - apps/admin/lib/admin-auth.ts (new — copy)
  - apps/admin/app/login/page.tsx (new — copy, de-prefixed)
  - apps/admin/app/api/auth/login/route.ts (new — copy)
  - apps/admin/app/api/auth/logout/route.ts (new — copy)
  - apps/admin/app/api/auth/me/route.ts (new — copy)
  - apps/admin/components/AdminSidebar.tsx (new — copy, de-prefixed)
  - apps/admin/package.json (+bcryptjs, +lucide-react)
  - specs/001-admin-monorepo-split/tasks.md (T059-T064)
tests:
  - "pnpm install — admin deps linked (1m7s)"
  - "pnpm turbo run build --filter=admin... — 2/2 green; routes /, /login, /api/auth/{login,logout,me}"
  - "git status — only apps/admin + lockfile changed; apps/web untouched"
---

## Prompt

start stage 2 with the keep-old-until-verified approach

## Response snapshot

Stage 2 of Phase 5: brought the smallest deployable admin feature (login + auth)
into `apps/admin`, using the **keep-old-until-verified** strategy the user chose
— i.e. **copy**, not `git mv`, so `apps/web/app/admin/*` keeps working untouched
until `barter-admin` is verified.

Copied: `admin-auth.ts` (verbatim — already on `@barter/db`), the login page,
the three auth routes (`login`/`logout`/`me`), and `AdminSidebar.tsx`. Dropped
the `/admin` URL prefix on the admin host: login fetch → `/api/auth/login`,
post-login → `/dashboard`, sidebar nav/logout de-prefixed. Added `bcryptjs` +
`lucide-react` (direct deps of the copied code) to the admin manifest.

`turbo run build --filter=admin...` green — admin now serves `/`, `/login`, and
`/api/auth/{login,logout,me}`. `git status` confirms `apps/web` is untouched.
Committed `359d8ef` on `009-admin-app-skeleton`.

Deferred to stage 4: the protected layout (AdminSidebar + `getAdminFromCookies`
guard) — there are no authed admin pages yet, so the sidebar compiles but isn't
rendered. The web admin layout's `x-pathname` guard was intentionally not
carried over (it's web-middleware-specific; admin gets real middleware in
Phase 7).

## Outcome

- ✅ Impact: admin app is now independently deployable with a working login +
  session-cookie auth — ready for the user to stand up `barter-admin` (stage 3).
- 🧪 Tests: admin build green; apps/web untouched (old admin still live).
- 📁 Files: 6 new + manifest + tasks/PHR. Zero apps/web change.
- 🔁 Next prompts: stage 3 — user creates the barter-admin Vercel project and
  smoke-tests login on its preview. NOTE: post-login `/dashboard` will 404 until
  stage 4 (dashboard not migrated yet); login success is confirmed via the
  admin_token cookie + GET /api/auth/me.
- 🧠 Reflection: copying instead of moving trades a short window of duplicated
  code for an admin that never goes dark mid-migration — the right call for a
  single-owner panel. The `[~]` tasks convert to real moves in the final cleanup.

## Evaluation notes (flywheel)

- Failure modes observed: none. Phantom-dep risk (login UI imports lucide-react,
  route imports bcryptjs) pre-empted by declaring both in apps/admin deps rather
  than relying on the hoisted linker.
- Graders run and results (PASS/FAIL): admin build PASS; apps/web-untouched PASS.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): in stage 3, confirm the admin
  preview deploys clean on the first try (validating the baked-in
  transpilePackages/tracing from stage 1).

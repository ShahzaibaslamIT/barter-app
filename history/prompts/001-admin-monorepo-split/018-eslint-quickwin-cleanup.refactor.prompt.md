---
id: 018
title: ESLint quick-win unused-code cleanup
stage: refactor
date: 2026-06-03
surface: agent
model: claude-opus-4-8
feature: 001-admin-monorepo-split
branch: main
user: ShahzaibaslamIT
command: (conversational — "quick-wins only" + smoke test)
labels: ["eslint", "cleanup", "dead-code", "phase-8"]
links:
  spec: specs/001-admin-monorepo-split/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - 17 source files across apps/web + apps/admin (unused imports/vars removed)
 - packages/config/eslint/base.js (ignore next-env.d.ts)
 - specs/001-admin-monorepo-split/tasks.md
tests:
 - pnpm lint (turbo): 3/3 successful, 0 errors, 85 warnings (was 113)
 - pnpm build: 3/3 successful (web 39/39 pages, admin 18/18)
 - user smoke-test on 021 preview (marketplace + admin) — passed
---

## Prompt

quick-wins only
(after smoke test + a reactivation scare:) it worked after re-login now merge the file

## Response snapshot

Removed 28 unused imports/vars flagged by `no-unused-vars` across 18 files
(dead imports, orphaned `useRouter`/`useToast`, disconnected photo handlers +
their dead state in EditListingClient, an unused `UserStatusFields` interface,
5 unused catch bindings → optional `catch {}`), handling the cascade of
newly-unused imports in a second pass. Added `next-env.d.ts` to the shared
eslint `ignorePatterns` (Next-generated; `next lint` ignores it, a direct
eslint run otherwise flags its triple-slash reference). Left one finding
intentionally: `location-picker.tsx` `getPreciseLocation` (from a
`useGeolocation()` hook that may run effects — not a safe mechanical delete).

Warnings 113 → 85 (web 82, admin 3), 0 errors, both apps build clean.

**Smoke-test reactivation scare (resolved, important):** during the admin
smoke test, reactivating a suspended user "did nothing." Investigated: the
reactivate path (users list `quickAction` → PATCH `/api/users/[id]`
`{action:"reactivate"}`) is byte-identical since Phase 5 (git-verified) and my
only edit to that route was removing two UNUSED destructured vars the reactivate
branch never touches. Root cause was the **30-minute admin session
(`SESSION_MINUTES=30`) expiring**: the expired token made the PATCH 401, and the
list page's `if (res.ok) fetchUsers()` swallows non-OK responses silently → no
feedback, row stays suspended. Confirmed: it worked immediately after re-login.
NOT a Phase 8 regression.

Merged 021-eslint-quickwins → main (8b55ba7).

## Outcome

- ✅ Impact: leaner codebase (28 dead symbols gone), lint signal sharper; no
  behavior change (build + lint + user smoke-test green).
- 🧪 Tests: pnpm lint 3/3 (0 err / 85 warn); pnpm build 3/3; smoke-test passed.
- 📁 Files: 19 changed (commit 70ff403), merged 8b55ba7.
- 🔁 Next prompts: KNOWN FOLLOW-UP — admin actions fail silently on expired
  session; fix by surfacing 401 (redirect to /login with a message) in the
  admin fetch handlers and/or revisiting the 30-min token lifetime. Otherwise
  Phase 6 (subdomain, needs a domain) is the only remaining migration work.
- 🧠 Reflection: "nothing happens" + no error pointed straight at a swallowed
  non-OK response; the silent `if (res.ok)` pattern hides auth expiry.

## Evaluation notes (flywheel)

- Failure modes observed: a user-reported "regression" that was actually a
  pre-existing silent-401 on session expiry; git diff + history were decisive in
  separating my change from the symptom before touching anything.
- Graders run and results (PASS/FAIL): lint PASS, build PASS, smoke-test PASS.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): make admin fetch helpers treat 401
  as "session expired → redirect to /login" instead of silently no-op'ing.

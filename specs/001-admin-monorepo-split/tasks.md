---

description: "Task list for feature 001-admin-monorepo-split"
---

# Tasks: Admin Panel Monorepo Split

**Input**: Design documents from `specs/001-admin-monorepo-split/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/route-ownership.md, contracts/auth-isolation.md, quickstart.md
**Related ADRs**: [ADR-0001](../../history/adr/0001-monorepo-topology-and-build-orchestration.md), [ADR-0002](../../history/adr/0002-application-boundary-and-deployment-isolation.md), [ADR-0003](../../history/adr/0003-shared-data-access-layer.md)

**Tests**: Not requested by the spec. Verification of acceptance criteria is performed inline (smoke tests, grep assertions, manual E2E flows per user story, and the 6 test obligations in `contracts/auth-isolation.md`).

**Organization**: Tasks are grouped by user story. The 9-step incremental migration order from `research.md` Decision 6 is preserved within and across phases.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story (US1–US6) — included only for tasks inside a user story phase
- Every task includes exact file paths (current → target where applicable)

## Priority inversion (intentional)

P2 user stories `US4` (Shared Data Layer) and `US5` (Single-Command Dev) are sequenced **before** P1 user stories `US1`/`US2`/`US3`. This is a deliberate technical-dependency ordering: P1 stories require the data layer and dev wiring established by P2 work. The **MVP for value delivery** is still `US1` — the operational payoff (independent admin deployment) lands when Phase 5 completes. `US6` (Incremental migration with `main` always deployable) is treated as a cross-phase invariant — every numbered task respects it — rather than a phase of its own.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Stand up the monorepo scaffolding without moving any existing source code. After this phase, the current single-app build at the repo root must continue to work unchanged.

- [x] T001 Add `"packageManager": "pnpm@9.15.0"` to `package.json`. **Deferred to user**: `corepack enable && corepack use pnpm@9.15.0` is a machine-level setup step the user runs locally before T011.
- [x] T002 [P] Created `pnpm-workspace.yaml` declaring `apps/*` and `packages/*`
- [x] T003 [P] Created `turbo.json` at repo root with `dev`, `build`, `lint`, `generate` pipelines and `dependsOn: ["^build"]` on the `build` task
- [ ] T004 **Deferred to Phase 2 start.** As written, T004 removes Next.js deps from root `package.json` — this would break the current single-app build at the repo root, violating US6 ("main always deployable") because Phase 2 hasn't moved files into `apps/web` yet. Will execute the script/dep restructure together with T012 (the actual file move into `apps/web`).
- [x] T005 [P] Created `apps/.gitkeep`
- [x] T006 [P] Created `packages/.gitkeep`
- [x] T007 [P] Created `packages/config/package.json` (name `@barter/config`, private, exports for `./eslint/base`, `./tsconfig.base.json`, `./tailwind/base`)
- [x] T008 [P] Created `packages/config/eslint/base.js` extending `next/core-web-vitals` + `next/typescript`
- [x] T009 [P] Created `packages/config/tsconfig.base.json` (strict, target ES2022, jsx preserve, moduleResolution bundler)
- [x] T010 [P] Created `packages/config/tailwind/base.js` exporting the Tailwind v4 preset (dark mode, colors, radius, animations)
- [ ] T011 **Deferred to user** (machine-level step). After this PR lands, run from the repo root: `corepack enable && corepack use pnpm@9.15.0 && pnpm install`. Then confirm `pnpm ls --depth -1` shows `@barter/config` as a workspace package.

**Checkpoint**: Monorepo scaffolding is in place additively. The existing app at the repo root continues to run via `next dev` (the existing scripts in `package.json` were intentionally **not** rewritten yet — that lands together with the apps/web file move in Phase 2). `main` is deployable. After the user runs `pnpm install` locally, `pnpm ls --depth -1` should show `@barter/config` as a workspace package.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Relocate the existing user app into `apps/web` and extract the three shared workspace packages (`@barter/db`, `@barter/ui`, `@barter/types`) that all user stories depend on. No new user-visible functionality. After this phase, **the production user app must be byte-equivalent in behaviour to before the migration started**.

**⚠️ CRITICAL**: No user story (US1–US5) work can begin until this phase completes. Each task in this phase is a separate PR; `main` remains deployable between them.

### Relocate the user app

- [x] T012 Moved all current Next.js source from repo root into `apps/web/` via `git mv` (rename status preserved for `app/`, `components/`, `hooks/`, `lib/`, `public/`, `prisma/`, `styles/`, `scripts/`, `middleware.ts`, `next.config.mjs`, `postcss.config.mjs`, `tsconfig.json`, `components.json`). Also copied `.env` / `.env.production` (gitignored, can't `git mv`) into `apps/web/`. Cleaned stale root build artefacts (`.next/`, `tsconfig.tsbuildinfo`, empty `vercel` file).
- [x] T013 Created `apps/web/package.json` (name `web`, private). Moved every user-app dep from the root manifest. `@prisma/client` and `prisma` remain temporarily — extract in T020–T024. Declared `"@barter/config": "workspace:*"`.
- [x] T014 [P] Rewrote `apps/web/tsconfig.json` to extend `@barter/config/tsconfig.base.json`; preserved the `@/*` path alias and the Next.js plugin entry. Kept `target: ES6` and `allowJs` as app-specific overrides.
- [x] T015 [P] Created `apps/web/.eslintrc.cjs` extending `@barter/config/eslint/base` (root: true so children don't merge upward).
- [~] T016 [P] **Not applicable**: this project uses Tailwind v4 CSS-first configuration (theme tokens live in `apps/web/app/globals.css` via `@theme`). There is no `tailwind.config.ts` to update. The shared `packages/config/tailwind/base.js` preset is v3-style and will be converted to a v4 CSS preset in a follow-up if/when both apps need shared tokens. Tracked as an open item.
- [x] T017 Dev script in `apps/web/package.json` set to `"next dev -p 3000"`. Start script also bound to `-p 3000` for consistency.
- [x] T018 Updated root `turbo.json`: corrected `globalDependencies` to `**/.env` + `**/.env.*` (monorepo-aware), added `NEXTAUTH_SECRET` and `NEXTAUTH_URL` to `globalEnv`. Outputs glob `.next/**` already correct — Turbo scopes outputs per workspace package automatically.
- [x] T018b Slimmed root `package.json` to workspace tooling only (`turbo` devDep + orchestration scripts `dev`/`build`/`lint`/`generate`). All user-app deps now live in `apps/web/package.json`.
- [ ] T019 **Local smoke test passed** (2026-05-27): `pnpm install` succeeded (≈53m, slow network — `node_modules` linker is `hoisted` per [[feedback_pnpm_hoisted_linker]]); `pnpm --filter web dev` boots Next 15.5.9 on `:3000` reading `.env` from `apps/web/`; `/home`, `/auth`, `/discover`, `/api/listings` all return 200. Prisma client generated to `node_modules/@prisma/client` via the `apps/web` `postinstall` hook. **Vercel reconfig pending (user-driven step)**: barter-app project Root Directory → `apps/web`, Build Command → `cd ../.. && turbo run build --filter=web...`, Install Command → `cd ../.. && pnpm install --frozen-lockfile`.

### Extract `@barter/db` (per ADR-0003)

- [x] T020 [P] Created `packages/db/package.json` (name `@barter/db`, private; `@prisma/client` dep, `prisma` devDep; scripts `generate`/`build`/`migrate`/`postinstall`). Also added `packages/db/tsconfig.json`.
- [x] T021 [P] Moved `apps/web/prisma/schema.prisma` → `packages/db/prisma/schema.prisma` via `git mv` (rename preserved). Default generator (no custom `output`) → hoisted root `node_modules`, reachable from apps/web.
- [x] T022 [P] Moved `apps/web/prisma/migrations/` (+ `seed.ts`) → `packages/db/prisma/` via `git mv`.
- [x] T023 Moved `apps/web/lib/prisma.ts` → `packages/db/src/client.ts`; Neon keep-alive singleton preserved unchanged.
- [x] T024 Created `packages/db/src/index.ts` — `export { prisma } from "./client"` + `export * from "@prisma/client"` (types, enums, Prisma namespace).
- [x] T025 Added `"@barter/db": "workspace:*"` to `apps/web/package.json`; removed `@prisma/client` + `prisma` and the now-orphaned `prisma generate` postinstall (generation lives in `@barter/db`).
- [x] T026 Codemodded all 42 `@/lib/prisma` imports → `@barter/db`. Zero remaining refs.
- [x] T027 Codemodded active `@prisma/client` type/enum imports → `@barter/db`: `lib/auth.ts`, `lib/auth-options.ts`, `lib/admin-auth.ts`, `app/api/auth/signup/route.ts`, `app/api/admin/listings/[id]/route.ts`, plus `scripts/create-admin.ts` and `scripts/seed-user.mjs`. (`packages/db/prisma/seed.ts` keeps `@prisma/client` — it lives inside the db package.)
- [x] T028 `pnpm install` (1m19s; `@barter/db` postinstall generated client v6.19.3 to hoisted root). `pnpm turbo run build --filter=web...` → **2/2 tasks green** (`@barter/db#build` then `web:build`). Committed `a84c187` on branch `005-extract-barter-db`.
- [x] T029 Pushed branch `005-extract-barter-db` → Vercel preview. First preview 500'd on sign-in (Next copied @barter/db's raw `.ts` into the function uncompiled); fixed in `b6eb624` with `transpilePackages: ["@barter/db"]` + `outputFileTracingRoot` (repo root, for the hoisted Prisma engine). Preview re-verified (sign-in, discover, listing, offer). Merged `--no-ff` → main (`6d5cf70`); gamma redeploying.

### Extract `@barter/ui` (per ADR-0001)

- [ ] T030 [P] Create `packages/ui/package.json` declaring name `@barter/ui`, `private: true`, dependencies on all `@radix-ui/*` primitives currently used by `apps/web/components/ui/*`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`. Add `"@barter/config": "workspace:*"`.
- [ ] T031 Move every file under `apps/web/components/ui/` to `packages/ui/src/`. Keep filenames unchanged.
- [ ] T032 Create `packages/ui/src/index.ts` re-exporting every component (one re-export per file)
- [ ] T033 Add `"@barter/ui": "workspace:*"` to `apps/web/package.json`
- [ ] T034 Replace every `import { X } from "@/components/ui/<name>"` in `apps/web/` with `import { X } from "@barter/ui"`. Single codemod PR.
- [ ] T035 Remove `@radix-ui/*`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react` from `apps/web/package.json` if they are now used only by `@barter/ui` (keep any with direct `apps/web` consumers).
- [ ] T036 Build and deploy preview; smoke-test the user app UI (any visual regression means a wrapper got dropped during the move — revert immediately and retry per-file).

### Extract `@barter/types`

- [ ] T037 [P] Create `packages/types/package.json` declaring name `@barter/types`, `private: true`, no runtime dependencies
- [ ] T038 [P] Create `packages/types/src/index.ts`. Move type-only declarations that are cross-cutting (DTOs, non-Prisma enums) here. **Initial content**: empty index — populate as cross-app types are identified during US1.
- [ ] T039 Add `"@barter/types": "workspace:*"` to `apps/web/package.json`

### Cleanup and verification

- [ ] T040 Update `pnpm-workspace.yaml` if any glob needs adjustment now that real packages exist
- [ ] T041 Run `pnpm install`, `pnpm build`, `pnpm lint` from repo root. All must succeed.
- [ ] T042 Deploy preview of `apps/web` and smoke-test the full user-app flow end-to-end. Merge only after production-equivalent verification.

**Checkpoint**: `apps/web` lives in its new home; three shared packages exist and are consumed; `main` is deployable; no user-facing behavior change.

---

## Phase 3: User Story 4 - Single source of truth for shared data layer (Priority: P2)

**Goal**: Confirm the data layer is owned exactly once by `@barter/db` and that schema changes propagate to consuming apps with no per-app duplication.

**Independent Test**: Add a no-op field to a model in `packages/db/prisma/schema.prisma`, run `pnpm db:generate`, and confirm `apps/web` type-checks against the new field with zero additional edits.

> Most of US4's work is folded into Phase 2 by technical dependency. This phase verifies the acceptance criteria and locks in the property going forward.

- [ ] T043 [US4] Run `grep -r "model " --include="*.prisma" .` from repo root and confirm matches are confined to `packages/db/prisma/schema.prisma` (SC-010)
- [ ] T044 [US4] Run `grep -r "from \"@prisma/client\"" apps/` and confirm zero matches — apps must import types from `@barter/db` only (ADR-0003)
- [ ] T045 [US4] Execute the schema-edit-one-place workflow: add a temporary `// noop` comment-only change to `schema.prisma`, run `pnpm db:generate`, run `pnpm --filter web build`, confirm green, then revert.

**Checkpoint**: US4 acceptance scenarios pass independently.

---

## Phase 4: User Story 5 - Single-command local development (Priority: P2)

**Goal**: A developer can start both apps locally with one command, on distinct ports, sharing the same `DATABASE_URL`.

**Independent Test**: From a clean clone, `pnpm install && pnpm dev` boots `apps/web` on `:3000` within ~60s of first compile (SC-003). At this point `apps/admin` does not yet exist — partial verification.

- [ ] T046 [P] [US5] Add root `package.json` script `"dev:web": "turbo run dev --filter=web"`
- [ ] T047 [P] [US5] Add root `package.json` script `"dev:admin": "turbo run dev --filter=admin"` (will start working once `apps/admin` exists in Phase 5)
- [ ] T048 [US5] Update `turbo.json` `dev` task: `"cache": false, "persistent": true` so dev servers stay running and aren't cached
- [ ] T049 [US5] Update `quickstart.md` if any concrete details diverged from what was drafted in Phase 1 design
- [ ] T050 [US5] On a fresh clone, time `pnpm install && pnpm dev:web` from cold and record the time-to-first-served-page. Must be ≤60s (SC-003).

**Checkpoint**: Single-command dev works for the user app; verification for both apps simultaneously completes in Phase 5 after `apps/admin` exists.

---

## Phase 5: User Story 1 - Independent admin deployment (Priority: P1) 🎯 MVP

**Goal**: The admin panel deploys independently. An admin-only change triggers zero builds of `apps/web`; a web-only change triggers zero builds of `apps/admin`.

**Independent Test**: Modify a file inside `apps/admin/` and push. Verify only the `barter-admin` Vercel project builds. Reverse the test for `apps/web`. SC-001 and SC-002 must both hold.

### Stand up the admin app skeleton

- [ ] T051 [US1] Create `apps/admin/package.json` declaring name `admin`, `private: true`, dependencies: `next`, `react`, `react-dom`, `jsonwebtoken`, `@types/jsonwebtoken`, plus `"@barter/db": "workspace:*"`, `"@barter/ui": "workspace:*"`, `"@barter/types": "workspace:*"`, `"@barter/config": "workspace:*"`. Set `"dev": "next dev -p 3001"`.
- [ ] T052 [P] [US1] Create `apps/admin/next.config.mjs` (minimal — image/eslint config copied from `apps/web/next.config.mjs` and trimmed)
- [ ] T053 [P] [US1] Create `apps/admin/tsconfig.json` extending `@barter/config/tsconfig.base.json` with `paths: { "@/*": ["./*"] }`
- [ ] T054 [P] [US1] Create `apps/admin/.eslintrc.cjs` extending `@barter/config/eslint/base`
- [ ] T055 [P] [US1] Create `apps/admin/tailwind.config.ts` declaring `presets: [require('@barter/config/tailwind/base')]` and admin-specific `content` paths
- [ ] T056 [P] [US1] Create `apps/admin/postcss.config.mjs` mirroring `apps/web/postcss.config.mjs`
- [ ] T057 [US1] Create `apps/admin/app/layout.tsx` as a minimal root layout (no providers; admin app has no NotificationProvider, TermsGate, or NextAuth session provider)
- [ ] T058 [US1] Create `apps/admin/app/page.tsx` that redirects to `/dashboard` (or `/login` if no admin session — final logic lands in T072)

### Move admin login + auth (the smallest deployable admin feature)

- [ ] T059 [US1] Move `apps/web/app/admin/layout.tsx` → `apps/admin/app/layout.tsx` (merge with T057); move `apps/web/app/admin/AdminSidebar.tsx` → `apps/admin/components/AdminSidebar.tsx`
- [ ] T060 [US1] Move `apps/web/app/admin/login/` → `apps/admin/app/login/`
- [ ] T061 [US1] Move `apps/web/lib/admin-auth.ts` → `apps/admin/lib/admin-auth.ts`
- [ ] T062 [US1] Move `apps/web/app/api/admin/auth/` → `apps/admin/app/api/auth/` (URL prefix `/admin/` is dropped on the admin host per `contracts/route-ownership.md`)
- [ ] T063 [US1] Update every fetch call inside the moved admin login UI from `fetch('/api/admin/auth/...')` to `fetch('/api/auth/...')`. Files: `apps/admin/app/login/page.tsx` and any client component under the moved login tree.
- [ ] T064 [US1] Run `pnpm --filter admin build` from repo root. Build must succeed.

### Stand up the admin Vercel project

- [ ] T065 [US1] Create a new Vercel project `barter-admin` linked to the same Git repo. **Root Directory**: `apps/admin`. **Build Command**: `cd ../.. && turbo run build --filter=admin...`. **Install Command**: `cd ../.. && pnpm install --frozen-lockfile`. **Environment variables**: `DATABASE_URL`, `JWT_SECRET`, and any admin-specific secrets (see `research.md` Decision 9 table).
- [ ] T066 [US1] Configure `barter-admin` **Ignored Build Step** to run `npx turbo-ignore admin` (skip the build if no files under the admin filter changed)
- [ ] T067 [US1] Configure `barter-web` **Ignored Build Step** to run `npx turbo-ignore web` (skip web builds when only admin changed)
- [ ] T068 [US1] Trigger a preview deploy of `barter-admin`. Verify admin login flow works end-to-end against the production database from the `vercel.app` preview URL.

### Migrate admin features one route family at a time

Each of the following tasks is a separate PR. Each PR moves one admin feature, updates fetch sites, deploys a preview, smoke-tests, then merges. The corresponding `apps/web/app/admin/<area>` and `apps/web/app/api/admin/<area>` directories are deleted in the same PR.

- [ ] T069 [US1] Migrate **users**: move `apps/web/app/admin/users/` → `apps/admin/app/users/`; move `apps/web/app/api/admin/users/` → `apps/admin/app/api/users/`; update fetch sites from `/api/admin/users` → `/api/users` inside the moved tree; deploy preview; smoke-test; delete from `apps/web`; merge.
- [ ] T070 [US1] Migrate **listings**: same pattern for `apps/web/app/admin/listings/` and `apps/web/app/api/admin/listings/`.
- [ ] T071 [US1] Migrate **reports**: same pattern.
- [ ] T072 [US1] Migrate **audit-logs**: same pattern; also move `apps/web/lib/audit.ts` → `apps/admin/lib/audit.ts`.
- [ ] T073 [US1] Migrate **dashboard**: same pattern.
- [ ] T074 [US1] After all admin features have moved, finalise `apps/admin/app/page.tsx` to redirect to `/dashboard` when authenticated or `/login` when not.

### Verify per-app deploy isolation

- [ ] T075 [US1] Make a trivial whitespace-only edit inside `apps/admin/app/dashboard/page.tsx`, push to a branch, open a PR. Verify in the PR's check list that only `barter-admin` reports a build status; `barter-web` reports "skipped by turbo-ignore".
- [ ] T076 [US1] Reverse: trivial whitespace-only edit inside `apps/web/app/discover/page.tsx`. Verify only `barter-web` builds.

**Checkpoint**: Admin app deploys independently. SC-001 and SC-002 hold. This is the **MVP** — the most important user-visible value (operational separation) has landed.

---

## Phase 6: User Story 2 - Admin panel served from dedicated hostname (Priority: P1)

**Goal**: The admin panel is reachable at `admin.<root-domain>`; the user app remains at the apex/`www` domain.

**Independent Test**: Resolve `https://admin.<root-domain>` in a browser and observe the admin login (or dashboard) page; resolve the user-app domain and observe the marketplace. Response headers must indicate two distinct deployments.

- [ ] T077 [US2] In the Vercel `barter-admin` project, add the production domain `admin.<root-domain>` (replace placeholder with the actual root). Vercel issues a TLS cert automatically.
- [ ] T078 [US2] Update DNS at the registrar: add a `CNAME` (or ALIAS) record for `admin.<root-domain>` pointing to `cname.vercel-dns.com`
- [ ] T079 [US2] Confirm DNS resolves and TLS handshake succeeds: `curl -I https://admin.<root-domain>` returns `HTTP/2 200` (or `307` if not logged in)
- [ ] T080 [US2] Set `NEXTAUTH_URL` env var in the `barter-web` Vercel project to the user-app production URL (e.g. `https://www.<root-domain>`). Confirm `NEXTAUTH_URL` is **not** set in `barter-admin`.
- [ ] T081 [US2] Verify acceptance scenarios from spec US2: admin host serves admin app; user-app host has no admin routes reachable; monitoring shows two distinct request streams.

**Checkpoint**: SC-009 holds. The admin panel has its own hostname.

---

## Phase 7: User Story 3 - Cross-application session isolation (Priority: P1)

**Goal**: A session cookie issued by one app cannot authenticate against the other. Browsers send each cookie only to its issuing host.

**Independent Test**: Log in as a regular user on the user-app host, then visit the admin host in the same browser — admin app prompts for login. Reverse: log in as admin then visit user host — user app shows logged-out marketplace. Both sessions must coexist independently.

- [ ] T082 [US3] Move the admin-protection block (currently at `apps/web/middleware.ts` lines 9–26 in the current `middleware.ts`) into a new file `apps/admin/middleware.ts`. The matcher becomes `["/((?!login|api/auth).*)"]` — protect everything except login and auth endpoints. Adjust the redirect URL from `/admin/login` to `/login` (admin host no longer carries the `/admin` prefix).
- [ ] T083 [US3] Delete the admin block from `apps/web/middleware.ts`. The web middleware must contain zero references to `admin_token` after this task.
- [ ] T084 [US3] Inspect `Set-Cookie` headers returned by the admin login endpoint and confirm the cookie has no `Domain=` attribute (host-only scoping). Adjust `apps/admin/lib/admin-auth.ts` cookie-setting call if a `Domain` value was being passed.
- [ ] T085 [US3] Inspect `Set-Cookie` headers returned by NextAuth on the user app and confirm no `Domain=` attribute is present (NextAuth's default — verify nothing in `apps/web/lib/auth-options.ts` overrides it).
- [ ] T086 [US3] Implement the FR-015 legacy URL handler in `apps/web/middleware.ts`: requests to `/admin/*` or `/api/admin/*` on the user-app host return a 301 redirect to `https://admin.<root-domain><pathname>` with a `Cache-Control: public, max-age=86400` header. Plan: switch to a 404 response after a 90-day deprecation window (open a follow-up issue with the cutover date).
- [ ] T087 [US3] Run `grep -r "admin_token" apps/web/` and confirm zero matches. Run `grep -r "next-auth" apps/admin/` and confirm zero matches. (Test obligations 5 and 6 from `contracts/auth-isolation.md`.)
- [ ] T088 [US3] Execute the 4 runtime test obligations from `contracts/auth-isolation.md`: (a) request to `https://admin.<root-domain>/api/users` with only a NextAuth cookie returns 401; (b) request to user-app `/api/user/me` with only an `admin_token` returns 401; (c) both cookies in same browser via separate logins — each app authenticates only its own; (d) logging out of one app leaves the other's session intact.

**Checkpoint**: SC-005 holds. All P1 user stories (US1, US2, US3) are independently functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Remove dead code and unused dependencies, finalise documentation, run end-to-end acceptance verification, and tag the migration commit.

- [ ] T089 [P] Audit `apps/admin/package.json` and remove any user-app-only deps that were inherited from copy-paste (Twilio, Resend, Firebase, OneSignal, Cloudinary, NextAuth, leaflet, react-onesignal, react-leaflet)
- [ ] T090 [P] Audit `apps/web/package.json` and remove `jsonwebtoken` and `@types/jsonwebtoken` if no remaining usage (search for `jwt.sign` / `jwt.verify` in `apps/web/`)
- [ ] T091 [P] Delete any empty `apps/web/app/admin/` and `apps/web/app/api/admin/` directories that remained after Phase 5 migrations
- [ ] T092 [P] Confirm `apps/web/lib/admin-auth.ts` does not exist (only `apps/admin/lib/admin-auth.ts` remains)
- [ ] T093 [P] Update `.env.example` at repo root to document per-app env vars per the table in `research.md` Decision 9
- [ ] T094 [P] Update `apps/web/README.md` (or create one) with the web-app-specific dev workflow
- [ ] T095 [P] Update `apps/admin/README.md` (or create one) with the admin-app-specific dev workflow and the host-only cookie invariant
- [ ] T096 Re-run `update-agent-context.ps1 -AgentType claude` to refresh `CLAUDE.md` with the final post-migration state
- [ ] T097 Run full acceptance verification across SC-001 through SC-010 (see `spec.md` Success Criteria). Record any failures and resolve before tagging.
- [ ] T098 Run the `quickstart.md` setup end-to-end on a fresh clone: `pnpm install && cp .env.example .env && pnpm dev` boots both apps; admin login works; user signup works. Update `quickstart.md` if any step needs correction.
- [ ] T099 Create a git tag `migration/admin-monorepo-split-complete` on the merge commit that finishes Phase 8 and reference it in the feature's final PR description for traceability.

**Checkpoint**: Refactor complete. Open issues file: (1) FR-015 redirect→404 cutover date, (2) `lib/rate-limit.ts` shared vs duplicated decision (deferred from Phase 2 — audit in a follow-up if it has both admin and web consumers).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies. Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion. **Blocks** every user story phase.
- **User Story 4 (Phase 3)**: Depends on Foundational completion. Verification-only phase.
- **User Story 5 (Phase 4)**: Depends on Foundational completion. Independent of US4.
- **User Story 1 (Phase 5)**: Depends on Foundational + US5 completion (needs `pnpm dev:admin` wired). Independent of US4 specifics.
- **User Story 2 (Phase 6)**: Depends on US1 completion (needs `barter-admin` Vercel project to exist).
- **User Story 3 (Phase 7)**: Depends on US1 + US2 completion (needs admin app to be the one running middleware at the admin host).
- **Polish (Phase 8)**: Depends on all user stories being complete.

### User Story Dependencies

For this refactor, user stories have inter-dependencies driven by physical migration order, not by feature coupling:

- US4 and US5 are **parallel** after Foundational — different files, no shared state.
- US1 depends on US5 (single-command dev needs to be working before standing up the admin app).
- US2 depends on US1 (subdomain points to the Vercel project that US1 creates).
- US3 depends on US2 (cookie scoping behaviour is only meaningful once the admin host is reachable).

### Within Each User Story Phase

- Tasks marked `[P]` within the same phase can run in parallel.
- Vercel configuration tasks (T019, T065, T066, T067, T077, T078, T080) are manual UI/CLI steps in the Vercel dashboard — cannot be PR-merged but **must** complete before the next code task that depends on them.

### Parallel Opportunities

- **Phase 1**: T002, T003, T005, T006, T007, T008, T009, T010 are all `[P]` — open them as a single bundle PR or 8 small PRs.
- **Phase 2**: T020–T022 (db package skeleton + schema moves) can run in parallel; T030 (ui package skeleton) parallel with T037 (types package skeleton).
- **Phase 5**: T052–T056 (admin app config files) can all run in parallel before T057 (layout) lands.
- **Phase 5 (route migration)**: T069–T073 (per-feature admin migration PRs) can technically be opened in parallel by different developers, but should be **merged sequentially** to avoid noisy conflicts in `apps/admin/` shared files.
- **Phase 8**: T089–T095 (cleanup PRs) all `[P]`.

---

## Parallel Example: Phase 1 Setup

```bash
# Open these as separate PRs in parallel (or one bundled PR):
Task T002: Create pnpm-workspace.yaml
Task T003: Create turbo.json
Task T007: Create packages/config/package.json
Task T008: Create packages/config/eslint/base.js
Task T009: Create packages/config/tsconfig.base.json
Task T010: Create packages/config/tailwind/base.js
```

## Parallel Example: Phase 5 admin app config

```bash
# After T051 (apps/admin/package.json) lands, these can ship in one PR or parallel PRs:
Task T052: apps/admin/next.config.mjs
Task T053: apps/admin/tsconfig.json
Task T054: apps/admin/.eslintrc.cjs
Task T055: apps/admin/tailwind.config.ts
Task T056: apps/admin/postcss.config.mjs
```

---

## Implementation Strategy

### MVP First (Phase 1 → Phase 5)

The operational payoff of this refactor — independent admin deployment that cannot take down the marketplace — lands at the end of **Phase 5**. Up to that point, every step is structural plumbing.

1. **Phase 1 (Setup)**: Monorepo scaffolding lands, no user-visible change. One or two PRs.
2. **Phase 2 (Foundational)**: User app relocates to `apps/web` and consumes three shared packages. Multiple small PRs, each shipping safely. Production behaviour is unchanged.
3. **Phase 3 (US4)**: Verification only. One small PR.
4. **Phase 4 (US5)**: Dev-script wiring. One PR.
5. **Phase 5 (US1)**: Stand up `apps/admin`, migrate admin features one at a time, configure per-app deploy gating. ~10 PRs.
6. **VALIDATE MVP**: Admin can be deployed independently. SC-001/SC-002 hold. **Stop and demo.**

Phases 6–8 are valuable but not strictly required to realize the core benefit. If timeline pressure intervenes, the MVP can ship at the end of Phase 5 with the admin panel reachable at its `vercel.app` URL, and Phase 6/7 land in a follow-up sprint.

### Incremental Delivery

Each phase ships independently. After each phase, `main` is deployable and the production user app remains functionally identical to before the migration started (FR-013, SC-008).

### Parallel Team Strategy

With two developers:

- Dev A drives Phase 1 → Phase 2 → Phase 5 (the long path).
- Dev B drives Phase 3 + Phase 4 in parallel after Phase 2's first half lands; then helps with the per-feature admin migrations in Phase 5 (T069–T073 can split across both devs).

With one developer: serial execution; aim for one phase per day of focused work.

---

## Notes

- `[P]` tasks operate on different files with no incomplete-task dependencies and can be opened as parallel PRs or bundled.
- Every user-story-phase task carries a `[USn]` label for traceability against `spec.md`.
- The 9-step migration order from `research.md` Decision 6 maps to these phases as: scaffolding (Phase 1) → move web (Phase 2) → Prisma extract (Phase 2) → shared packages (Phase 2) → admin skeleton + Vercel project (Phase 5) → admin route migration (Phase 5) → middleware split (Phase 7) → DNS cutover (Phase 6) → cleanup (Phase 8).
- US6 (Incremental migration with `main` always deployable) is an **invariant**, not a phase. Each task in this file is small enough to ship independently and leave `main` deployable.
- Commit after every task. Do not bundle multiple tasks into one commit unless the bundle is explicitly flagged `[P]` and lives in a single PR.
- Verify deploy preview before merging any task that touches `apps/web` route handlers (T012, T019, T026, T034, T086) — these have direct production blast radius.

# Implementation Plan: Admin Panel Monorepo Split

**Branch**: `001-admin-monorepo-split` | **Date**: 2026-05-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-admin-monorepo-split/spec.md`

## Summary

Split the current single-app barter-app into a pnpm + Turborepo monorepo containing two independently-deployable Next.js applications (`apps/web`, `apps/admin`) and four shared workspace packages (`@barter/db`, `@barter/types`, `@barter/ui`, `@barter/config`). The admin panel deploys to a dedicated subdomain (`admin.<root-domain>`) as a separate Vercel project. The existing JWT `admin_token` cookie authentication and three-role RBAC are retained without behavioural change. The Prisma schema relocates to `packages/db` as the single source of truth; both apps consume the generated client from a single workspace dependency. Migration is incremental: each step is a small, reviewable PR that keeps `main` deployable.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20 LTS
**Primary Dependencies**: Next.js 15.5.x (App Router) for both apps; Prisma 6.16.x in `packages/db`; NextAuth 4.24.x in `apps/web`; `jsonwebtoken` + custom RBAC in `apps/admin`; Radix UI primitives via `@barter/ui`; Tailwind CSS 4.1.x; Turborepo (latest); pnpm 9+
**Storage**: PostgreSQL (Neon-hosted) accessed via the shared Prisma client. Schema unchanged.
**Testing**: No existing automated test suite. Verification is via manual E2E flows enumerated per user story + the assertions in `contracts/auth-isolation.md` (test obligations table). Adding a test suite is out of scope for this feature.
**Target Platform**: Vercel-hosted, web (Chrome/Safari/Firefox/Edge, latest two majors), with a PWA service worker on the user app only.
**Project Type**: Monorepo with two web applications (`apps/web`, `apps/admin`) plus four shared packages.
**Performance Goals**: No new performance targets — existing user-app latency budget is preserved; admin app inherits standard Vercel cold-start expectations. Single-command local dev should boot both apps within ~60s of first compile (SC-003).
**Constraints**: `main` MUST remain deployable at every commit (FR-013). No schema changes (out of scope). Host-only cookie scoping (no `Domain=` attribute) is mandatory for session isolation (FR-008, SC-005). Admin authentication code must not be referenced from `apps/web` post-migration (SC-005 `grep` obligation in `contracts/auth-isolation.md`).
**Scale/Scope**: 2 apps, 4 packages, ~30 admin routes (pages + API combined), ~50 user-app routes (pages + API combined). One Postgres database. Two Vercel projects.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The repo's constitution at `.specify/memory/constitution.md` is still the unfilled template — no concrete principles are defined. **No gates apply.** This is recorded as a non-blocker; if/when the constitution is populated, this plan should be re-checked. Initial gate: **PASS (vacuous)**. Post-Phase-1 gate: **PASS (vacuous)**.

The plan introduces no new architectural concepts that would be at risk under common principles a constitution might define (test-first, simplicity, single-responsibility): the refactor is structural and conservative.

## Project Structure

### Documentation (this feature)

```text
specs/001-admin-monorepo-split/
├── plan.md                         # This file (/sp.plan command output)
├── research.md                     # Phase 0 — decisions + alternatives
├── data-model.md                   # Phase 1 — data layer ownership (no schema change)
├── quickstart.md                   # Phase 1 — developer onboarding for the monorepo
├── contracts/
│   ├── route-ownership.md          # Authoritative mapping: which app owns which URL
│   └── auth-isolation.md           # Cookie/middleware contract enforcing SC-005
├── checklists/
│   └── requirements.md             # Spec-quality checklist (from /sp.specify)
└── tasks.md                        # Phase 2 output (/sp.tasks — NOT created by /sp.plan)
```

### Source Code (post-migration repository root)

```text
barter-app/
├── apps/
│   ├── web/                        # User-facing barter app (was: repo root)
│   │   ├── app/                    # All non-admin Next.js routes (pages + API)
│   │   ├── components/             # User-app composites (listings, auth, etc.)
│   │   ├── lib/                    # auth-options, get-server-user, geocode, sms,
│   │   │                           # send-notification, firebase*, user-status
│   │   ├── public/                 # Service worker, PWA assets, marketing images
│   │   ├── middleware.ts           # User-app middleware (terms gate, NextAuth refresh)
│   │   ├── next.config.mjs
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json           # extends @barter/config/tsconfig.base
│   │   ├── .eslintrc.cjs           # extends @barter/config/eslint/base
│   │   └── package.json
│   └── admin/                      # Admin panel (was: app/admin + app/api/admin)
│       ├── app/                    # Admin Next.js routes — dashboard, users,
│       │                           # listings, reports, audit-logs, login
│       ├── components/             # AdminSidebar and admin-only composites
│       ├── lib/                    # admin-auth, audit
│       ├── middleware.ts           # Admin token validation block (relocated)
│       ├── next.config.mjs
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       ├── .eslintrc.cjs
│       └── package.json
├── packages/
│   ├── db/                         # Prisma schema + generated client (single source)
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Relocated from prisma/schema.prisma
│   │   │   └── migrations/         # Relocated from prisma/migrations/
│   │   ├── src/
│   │   │   ├── client.ts           # The `prisma` singleton (was lib/prisma.ts)
│   │   │   └── index.ts            # Re-exports client + Prisma types
│   │   └── package.json
│   ├── types/                      # Cross-app DTOs and non-Prisma enums
│   │   ├── src/index.ts
│   │   └── package.json
│   ├── ui/                         # Radix wrappers and primitive components
│   │   ├── src/                    # Button, Card, Dialog, Sheet, Toast, etc.
│   │   └── package.json
│   └── config/                     # Shared ESLint, TS, Tailwind config
│       ├── eslint/base.js
│       ├── tsconfig.base.json
│       ├── tailwind/base.js
│       └── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── package.json                    # Workspace root: only dev/build/lint scripts
├── tsconfig.base.json              # Path aliases + compiler defaults
├── .env.example
└── .gitignore
```

**Structure Decision**: Monorepo with two web applications under `apps/` and four shared workspace packages under `packages/`. This is the canonical Turborepo layout. `apps/web` corresponds to today's repo-root Next.js app (minus admin code); `apps/admin` is the new home for everything currently under `app/admin/` and `app/api/admin/`. The four packages are scoped to a single concern each (data layer, types, UI primitives, tooling config) so a change to one cannot force a re-version of the others.

## Phase 0 — Research

See [`research.md`](./research.md). Ten decisions are documented with rationale and alternatives:

1. Monorepo manager + build orchestrator → pnpm workspaces + Turborepo
2. Workspace layout → `apps/{web,admin}` + `packages/{db,types,ui,config}`
3. Prisma extraction strategy → `packages/db` owns schema, migrations, and the client singleton
4. Vercel multi-project deployment → two Vercel projects from one repo with per-app Root Directory and env
5. Cookie scoping and session isolation → host-only cookies on each app; no `Domain=` attribute
6. Incremental migration order → 9-step expand → migrate → contract sequence
7. Shared tooling configuration → `@barter/config` exports ESLint, TS, Tailwind base
8. UI primitives ownership → primitives shared in `@barter/ui`, composites stay app-local
9. Per-app environment variable split → web owns Twilio/Resend/Firebase/NextAuth; both share `DATABASE_URL` and `JWT_SECRET`
10. Local development experience → root `pnpm dev` runs both apps; web=3000, admin=3001

No NEEDS CLARIFICATION items remain. One deferred policy question (`FR-015 redirect vs 404` for legacy `/admin/*` URLs on the web host) is recommended for `/sp.clarify` before step 7 of the migration order, but does not block planning.

## Phase 1 — Design Artifacts

- **[data-model.md](./data-model.md)** — confirms the schema is unchanged; documents the data-layer ownership pattern via `@barter/db`; lists the 10 top-level domain entities (User, Listing, BarterOffer, Message, Rating, Notification, Admin, AuditLog, Report, AppSettings).
- **[contracts/route-ownership.md](./contracts/route-ownership.md)** — authoritative map of every existing page and API route to its post-migration app and path. Includes the rule that `/api/admin/*` prefixes are dropped on the admin subdomain.
- **[contracts/auth-isolation.md](./contracts/auth-isolation.md)** — invariants for cookie issuance, middleware behavior, and the six test obligations that must pass for SC-005.
- **[quickstart.md](./quickstart.md)** — forward-looking developer guide: install, single-command boot, per-app boot, schema workflow, shared package patterns, troubleshooting.

## Phase 2 — Tasks (deferred to `/sp.tasks`)

`/sp.plan` does not produce `tasks.md`. The migration order in `research.md` Decision 6 provides the skeleton for `/sp.tasks` to enumerate into 30–50 concrete tasks. Expected task clusters:

1. Scaffolding (pnpm-workspace.yaml, turbo.json, root package.json restructure, packages/* skeletons, packages/config seed)
2. `apps/web` relocation (move code, update Vercel Root Directory, verify production parity)
3. `packages/db` extraction (move schema + migrations, replace `@/lib/prisma` imports, wire `postinstall`/Turbo pipeline)
4. `packages/ui` extraction (move components/ui/, update imports)
5. `packages/types` + `packages/config` extraction
6. `apps/admin` skeleton + login (sibling Next.js app, Vercel project, preview subdomain)
7. Per-route admin migration (users → listings → reports → audit-logs → dashboard, one PR each)
8. Middleware split (move admin block, add FR-015 redirect/404)
9. DNS cutover for `admin.<root-domain>`
10. Cleanup (remove admin deps/env from `apps/web`, delete dead code)
11. Acceptance verification (run all SC-001 through SC-010 checks)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified.**

The constitution template is unfilled, so no concrete violations to justify. The general complexity introduced by this refactor — adding monorepo tooling to manage what is logically two apps — is itself the *resolution* of a complexity problem (admin code in the user app), not a new complexity.

| Concern | Why introduced | Why simpler alternative rejected |
|---|---|---|
| pnpm + Turborepo (new tooling) | Needed for workspaces + per-app cached builds + deploy gating (SC-001, SC-002) | Plain pnpm without Turbo: no build cache, no `turbo-ignore` deploy-skip — CI would build both apps on every PR. Plain npm workspaces: phantom-dep risk on a shared-DB setup. |
| 4 packages instead of 1 shared package | Each package has a distinct lifecycle (schema, types, UI, tooling) | A single `packages/shared`: changes to a button bump the data-layer package version; couples unrelated concerns. |
| Two Vercel projects from one repo | Required for independent deploys + per-host cookie scoping | One project with rewrites: defeats the entire point of the refactor (cookies bleed; one bad admin push affects user-app traffic). |
| Path-aliased Prisma client (`@barter/db`) instead of direct `@prisma/client` | Single source of generated client; both apps see identical types | Each app generates its own client: easy to forget regeneration; two clients in `node_modules`; class of bugs we want to eliminate. |

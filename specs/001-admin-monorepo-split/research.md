# Phase 0 Research: Admin Panel Monorepo Split

**Feature**: 001-admin-monorepo-split
**Spec**: [spec.md](./spec.md)
**Date**: 2026-05-25

This document records the technical decisions and patterns adopted for splitting the barter-app into a pnpm + Turborepo monorepo. All NEEDS CLARIFICATION items from Technical Context are resolved here.

---

## Decision 1 — Monorepo manager and build orchestrator

**Decision**: pnpm workspaces for dependency management; Turborepo for task orchestration and caching.

**Rationale**:
- pnpm's strict, content-addressed `node_modules` prevents phantom-dependency leaks between workspaces — critical when two apps share a database client and must not silently diverge on transitive versions.
- pnpm's `link-workspace-packages=true` default makes `workspace:*` dependencies resolve to local sources without manual linking — `packages/db` is reflected live in both apps during dev.
- Turborepo's task graph + content-hash cache lets a CI run skip building `apps/web` when only `apps/admin` changed (and vice versa), which is the operational payoff for the whole refactor (FR-004, SC-001, SC-002).
- Turbo's `dependsOn: ["^build"]` syntax cleanly expresses "the data-layer package must build before either app builds" (FR-016).

**Alternatives considered**:
- *npm workspaces + Turborepo*: zero migration of the existing lockfile, but lacks pnpm's strict resolution, so phantom dependencies between workspaces remain a real risk on a shared-DB setup.
- *Yarn workspaces*: mature, but no advantage over pnpm and still requires migrating off the existing npm lockfile.
- *Nx*: more powerful task graph and generators than Turborepo, but heavier conceptual surface and stronger opinions about project structure — overkill for two apps and three packages.
- *No build orchestrator (just pnpm)*: works for local dev, but offers no cache and no per-app deploy gating — would force every PR to build both apps in CI.

---

## Decision 2 — Workspace layout

**Decision**:

```
barter-app/
├── apps/
│   ├── web/                  # current user-facing app
│   └── admin/                # new admin panel
├── packages/
│   ├── db/                   # Prisma schema + generated client + migrations
│   ├── types/                # cross-app TypeScript types (DTOs, enums not from Prisma)
│   ├── ui/                   # shared UI primitives (Radix wrappers, button, card, etc.)
│   └── config/               # shared ESLint, TS, Tailwind config
├── pnpm-workspace.yaml
├── turbo.json
├── package.json              # workspace root: lint/build/dev scripts only
└── tsconfig.base.json
```

**Rationale**:
- `apps/` and `packages/` is the canonical Turborepo convention; aligns with hosting-platform docs and example repos, reducing onboarding friction.
- `packages/db` keeps Prisma's schema + migrations in one place (FR-002, SC-010). It also owns `prisma generate` and re-exports the typed client — both apps import from `@barter/db`.
- `packages/ui` exists only because the current app has ~30 Radix primitive wrappers under `components/ui/`. Admin uses a subset; the user app uses the full set. Sharing avoids drift in the design language.
- `packages/types` is for types that are *not* derived from Prisma (e.g., API DTO shapes, NotificationPayload, AdminTokenPayload). Prisma model types come from `@barter/db` directly.
- `packages/config` makes lint/TS/Tailwind a one-edit change instead of two (FR-014).

**Alternatives considered**:
- *Single `packages/shared` for everything*: simpler but bundles unrelated concerns; a change to a button forces the database package to re-version.
- *Skip `packages/ui`, duplicate primitives*: would diverge within a sprint based on past experience with shared component libraries.
- *Put admin under `apps/web/admin` as a Next.js route group on a separate deploy*: rejected during planning (this is the convention violation we're fixing).

---

## Decision 3 — Prisma extraction strategy

**Decision**: Relocate `prisma/schema.prisma` and `prisma/migrations/` to `packages/db/prisma/`. The package's `package.json` declares `prisma generate` as a `postinstall` script (or, preferably, a `prebuild` script invoked via Turborepo's pipeline). Both apps depend on `@barter/db` as `"@barter/db": "workspace:*"` and import the Prisma client from `@barter/db`.

The package exports:
- `prisma` — a singleton `PrismaClient` instance (the existing `lib/prisma.ts` pattern, moved into the package).
- Re-exports of generated Prisma types (`User`, `Listing`, `AdminRole`, etc.) so consuming apps don't reach into `@prisma/client` directly.

`DATABASE_URL` is consumed at runtime by the apps, not the package — the package reads `process.env.DATABASE_URL` lazily inside its singleton getter. Each app sets `DATABASE_URL` in its own deployment env (same value in production; same value or a local `.env` in dev).

**Rationale**:
- Single source of truth for schema (SC-010, FR-002).
- `prisma generate` runs once and the generated client is consumed by both apps' build outputs — Turborepo caches the generation step (FR-016).
- Apps see the same query types and same client behavior. Schema changes propagate automatically (SC-004).

**Alternatives considered**:
- *Keep schema at repo root with both apps pointing to it*: works but requires both apps to declare Prisma as a direct dep and run `prisma generate` themselves — duplicated config and slower CI.
- *Generate the client into each app's `node_modules` separately*: forces a stale-cache class of bug that's painful to debug. The single-package approach makes the client version-locked to the schema by construction.

---

## Decision 4 — Vercel multi-project deployment

**Decision**: Two Vercel projects sharing one Git repo:

| Project | Root Directory | Production Domain | Preview Domains |
|---|---|---|---|
| `barter-web` | `apps/web` | `barter-app.com` (and `www.barter-app.com`) | `*-web-*.vercel.app` |
| `barter-admin` | `apps/admin` | `admin.barter-app.com` | `*-admin-*.vercel.app` |

Each project sets its own `Root Directory`, `Build Command` (`turbo run build --filter=<workspace>...`), and env vars. Turborepo's remote cache is configured once at the repo level so both projects share build cache.

**Rationale**:
- Native Vercel feature; no custom build server needed.
- Per-project env vars mean `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and admin-specific secrets are scoped to the correct app (FR-008 cookie scoping depends on the correct `NEXTAUTH_URL`).
- Vercel's Git integration detects which app changed per push (via `Ignored Build Step` configured to use `turbo-ignore`), satisfying SC-001/SC-002.

**Alternatives considered**:
- *Single Vercel project with rewrites*: would defeat the deployment-isolation goal and break cookie scoping.
- *Self-hosted on a single container*: more ops surface, no clear win for a two-app marketplace product.

---

## Decision 5 — Cookie scoping and session isolation

**Decision**:
- The admin JWT `admin_token` cookie is set with `Domain` unset (host-only) on `admin.barter-app.com`, `Path=/`, `HttpOnly`, `Secure`, `SameSite=Lax`. Result: browsers send this cookie only when the request host exactly equals `admin.barter-app.com`.
- The user-app NextAuth session cookies follow NextAuth defaults on `barter-app.com` / `www.barter-app.com` — also host-only by default. `NEXTAUTH_URL` is set to the user-app domain in the web app's env vars.
- Neither app sets `Domain=.barter-app.com` for its session cookie (that would let the cookie traverse subdomains, violating FR-008 and SC-005).
- Middleware in each app validates only its own cookie name (`admin_token` in admin, NextAuth's session token in web). The web app's middleware does *not* reference `admin_token` at all post-migration — that block of `middleware.ts` moves to `apps/admin/middleware.ts`.

**Rationale**:
- Host-only cookies are the simplest and most secure approach to cross-app isolation on the same parent domain (SC-005).
- No code changes required to the JWT signing/verifying logic; only the deployment context changes.

**Alternatives considered**:
- *Same domain for both with path-based cookies*: brittle and explicitly rejected during planning.
- *Different parent domains entirely*: stronger isolation, but introduces CORS, DNS, and cert overhead with no security gain over host-only cookies on a single parent.
- *Sharing one session cookie across both apps*: violates the security invariant in US3; rejected.

---

## Decision 6 — Incremental migration order

**Decision**: Migration proceeds as a sequence of small, mergeable steps. Each step leaves `main` in a deployable state. Order:

1. **Add monorepo scaffolding alongside existing code** (no moves yet): `pnpm-workspace.yaml`, `turbo.json`, `apps/`, `packages/` empty dirs, root `package.json` becomes a workspace root with the existing `package.json` moved into a temporary location. (Expand)
2. **Move the existing user app to `apps/web` with no logic changes**. Update Vercel project Root Directory. Confirm production parity.
3. **Extract Prisma into `packages/db`**. Update imports in `apps/web` from `@/lib/prisma` to `@barter/db`. Confirm production parity.
4. **Extract `packages/types`, `packages/ui`, `packages/config`** incrementally — one PR per package.
5. **Create `apps/admin` skeleton** as a sibling Next.js app. Copy the admin layout, login page, and one trivial admin route. Stand up the Vercel project on a preview subdomain. Confirm login works end-to-end against the same DB.
6. **Move admin routes app-by-app**: users → listings → reports → audit-logs → dashboard. Each move is one PR. The corresponding `app/admin/<area>` and `app/api/admin/<area>` are deleted from `apps/web` only after the admin app's equivalent is live and verified.
7. **Move admin middleware block** from `apps/web/middleware.ts` to `apps/admin/middleware.ts`. Replace the admin block in the web app with a redirect or 404 for `/admin/*` URLs (per FR-015 — decide redirect-vs-404 in a clarification before this step).
8. **Cut DNS** for `admin.barter-app.com` to the admin Vercel project. (Contract)
9. **Remove admin-related deps, env vars, and dead code from `apps/web`**.

**Rationale**:
- Each numbered step is a reviewable, revertible PR.
- The "expand" phase (steps 1–4) introduces structure without removing anything — main remains deployable trivially.
- The "migrate" phase (steps 5–6) duplicates each admin route briefly in both apps; the web-app copy is removed only after the admin-app copy is proven in production. This eliminates the deploy-skew failure mode from spec Edge Cases.
- The "contract" phase (steps 7–9) removes the old code only after the new path is fully proven.
- An emergency hotfix can branch from `main` at any step without conflicting with in-flight migration work, since each step is small.

**Alternatives considered**:
- *Big-bang move on a long-lived branch*: rejected — high merge-conflict risk, and main is undeployable for days.
- *Move admin app first, then web*: rejected — web is the higher-traffic system and we want it touched as little as possible; moving it into `apps/web` first (a pure path change) is the safest first structural step.

---

## Decision 7 — Shared tooling configuration

**Decision**:
- `packages/config/eslint/base.js` exports a base ESLint config. Each app's `.eslintrc.cjs` does `extends: ['@barter/config/eslint/base']`.
- `packages/config/tsconfig.base.json` defines compiler defaults; each app's `tsconfig.json` extends it.
- `packages/config/tailwind/base.js` exports a shared Tailwind preset. Each app's `tailwind.config.ts` declares the preset and adds app-specific content paths.

**Rationale**: Centralises three orthogonal pieces of tooling without forcing apps to share runtime code. Aligns with FR-014.

**Alternatives considered**:
- *Inline configs duplicated per app*: rejected — exactly the drift this refactor is meant to prevent.
- *Single `@barter/config` exporting everything*: workable, but separate sub-paths make IDE auto-imports and tree-shaking cleaner.

---

## Decision 8 — UI primitives ownership

**Decision**: All current `components/ui/*` (Radix wrappers, Button, Card, Sheet, Dialog, etc.) move to `packages/ui` and both apps consume them. Higher-level composite components (`components/listings/listing-card.tsx`, `components/auth/auth-form.tsx`, etc.) stay in `apps/web/components/` because they are user-app-specific. Admin-specific composites stay in `apps/admin/components/`.

**Rationale**: Primitive design tokens (button, dialog, card) should not drift between apps. Composite components are use-case-specific and rarely re-used — sharing them creates coupling without payoff.

**Alternatives considered**:
- *Duplicate primitives per app*: rejected — guaranteed visual drift within weeks.
- *Share composites too*: rejected — adds coupling to features (listings UI) that have no admin equivalent.

---

## Decision 9 — Per-app environment variable split

**Decision**: Environment variables are split per app:

| Variable | apps/web | apps/admin | Notes |
|---|---|---|---|
| `DATABASE_URL` | ✓ | ✓ | Same value; consumed by `@barter/db` singleton |
| `JWT_SECRET` | ✓ | ✓ | Same value (admin tokens are signed in admin app, verified in admin app; user JWTs in NextAuth use their own) |
| `NEXTAUTH_URL` | ✓ | ✗ | Web only |
| `NEXTAUTH_SECRET` | ✓ | ✗ | Web only |
| `RESEND_API_KEY` | ✓ | ✗ | Web only (user emails) |
| `TWILIO_*` | ✓ | ✗ | Web only (OTP) |
| `CLOUDINARY_*` | ✓ | maybe | Web for uploads; admin may need read access only |
| `FIREBASE_*` / `ONESIGNAL_*` | ✓ | ✗ | Push notifications — web only |
| Admin-specific (if any) | ✗ | ✓ | TBD per admin feature audit |

**Rationale**: Smaller blast radius; admin app's secrets surface is minimal. Aligns with security principle of least exposure.

**Alternatives considered**:
- *Mirror all env vars in both apps*: less secure and adds rotation overhead.

---

## Decision 10 — Local development experience

**Decision**: Root `package.json` exposes:
- `pnpm dev` → `turbo run dev` (starts both apps in parallel)
- `pnpm dev:web` → `turbo run dev --filter=web`
- `pnpm dev:admin` → `turbo run dev --filter=admin`
- `pnpm build` → `turbo run build`
- `pnpm lint` → `turbo run lint`
- `pnpm db:generate` → `pnpm --filter @barter/db generate`
- `pnpm db:migrate` → `pnpm --filter @barter/db migrate dev`

`apps/web` runs on port 3000 (preserves current default). `apps/admin` runs on port 3001. Both read `DATABASE_URL` from the repo-root `.env` (or app-level overrides if needed).

**Rationale**: Aligns with FR-009 and FR-010. Preserves current developer muscle memory (port 3000 for the user app).

**Alternatives considered**:
- *Port 3000 for admin*: would break developer habits and any local docs that reference localhost:3000.

---

## Open questions deferred to /sp.clarify (none blocking)

The spec contains one unresolved policy point worth confirming before the contract phase of migration:

- **FR-015 redirect-vs-404 for legacy `/admin/*` URLs on the web app**: choice is policy, not technical. Recommendation: 301 permanent redirect to `https://admin.barter-app.com<path>` for at least 90 days, then switch to 404. This avoids breaking bookmarks operators may have saved. Defer to `/sp.clarify` if stakeholders want to lock this in writing.

No NEEDS CLARIFICATION items remain in Technical Context.

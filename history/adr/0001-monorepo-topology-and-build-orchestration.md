# ADR-0001: Monorepo Topology & Build Orchestration

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2026-05-25
- **Feature:** 001-admin-monorepo-split
- **Context:** The barter-app codebase grew an admin panel (`app/admin/*`, `app/api/admin/*`) inside the same Next.js application as the user-facing marketplace. Every admin change forced a redeploy of the marketplace, every admin dependency landed in the user app's bundle, and there was no operational boundary between the two surfaces. We need a code-organisation strategy that (a) physically separates the two applications, (b) keeps shared infrastructure (database client, design primitives, lint/TS config) in one place to prevent drift, and (c) supports per-app build caching and deploy gating so an admin-only change does not rebuild the user app.

## Decision

Adopt a **pnpm workspaces + Turborepo monorepo** with the following layout:

- **Package manager:** pnpm 9+ with `pnpm-workspace.yaml` declaring `apps/*` and `packages/*` as workspaces.
- **Build orchestrator:** Turborepo, with a `turbo.json` pipeline that declares `packages/db#build` (Prisma client generation) as a dependency of every app `build` (`dependsOn: ["^build"]`).
- **Application directory:** `apps/web` (user-facing app) and `apps/admin` (admin panel).
- **Shared packages directory:**
  - `@barter/db` — Prisma schema, migrations, generated client (covered by ADR-0003).
  - `@barter/types` — cross-app TypeScript types.
  - `@barter/ui` — Radix-based UI primitives shared between apps; composite, app-specific components stay app-local.
  - `@barter/config` — shared ESLint base config, base `tsconfig.json`, and Tailwind preset.
- **Local development:** root `pnpm dev` runs both apps via `turbo run dev`; `apps/web` on port 3000, `apps/admin` on port 3001. Per-app boot is supported via `--filter` flags.
- **Single source of truth for tooling:** ESLint, TypeScript, and Tailwind configs live in `@barter/config` and are extended (not duplicated) by each app.

## Consequences

### Positive

- Per-app build caching via Turbo means CI builds only the workspaces affected by a change; combined with Vercel's `Ignored Build Step` + `turbo-ignore`, this satisfies the SC-001/SC-002 deploy-gating goal.
- pnpm's strict, content-addressed `node_modules` makes phantom dependencies between workspaces impossible — important when both apps share a Prisma client and must not silently diverge on transitive versions.
- A single edit to lint/TS/Tailwind config propagates to both apps (FR-014); design primitives in `@barter/ui` cannot drift between apps because they are the same source files.
- The `apps/` + `packages/` convention is well-documented across hosting providers and example repos, lowering onboarding cost.
- Shared types (`@barter/types`, plus re-exports from `@barter/db`) eliminate the "DTO copy-paste" failure mode common in multi-repo splits.

### Negative

- Adds three new tools to learn (pnpm, Turborepo, workspace package authoring) — modest one-time cost but real, especially for contributors used to single-app npm projects.
- Existing `package-lock.json` is replaced with `pnpm-lock.yaml`; a single hard migration step.
- Turborepo's task graph is one more thing that can break (misconfigured `dependsOn` produces stale Prisma client at build time — see FR-016).
- More directories at repo root; some IDE features (project-wide search/refactor) need explicit configuration to span workspaces.
- Vendor coupling to Turborepo (mitigated: the underlying `pnpm --filter` commands remain functional even without Turbo).

## Alternatives Considered

**Alternative A — Separate repositories (`barter-app` + `barter-admin`).** Strongest isolation, independent CI/permissions, separate audit trails. Rejected: Prisma schema synchronisation across repos becomes a manual coordination problem (the exact class of bug we are trying to eliminate); shared UI/types require publishing a private package; cross-repo refactors become PRs in multiple places. Worth revisiting only if organisational boundaries demand it.

**Alternative B — npm workspaces + Turborepo.** Zero migration off the existing npm lockfile. Rejected: lacks pnpm's strict resolution, so phantom dependencies between workspaces remain possible. On a setup where both apps share a database client, this is a non-trivial risk.

**Alternative C — Yarn workspaces + Turborepo.** Mature, but no concrete advantage over pnpm and still requires migrating off the existing npm lockfile. Rejected on indifference.

**Alternative D — Nx in place of Turborepo.** More powerful task graph, code generators, dependency-graph visualisation. Rejected as overkill for two apps and four packages; Nx's stronger opinions about project structure and code generators add complexity we don't need.

**Alternative E — pnpm workspaces with no build orchestrator.** Works for local dev but produces no build cache and no per-app deploy gating; every PR would build both apps in CI, defeating the operational goal of the refactor. Rejected.

**Alternative F — Same-repo route group on a separate deployment (`app/(admin)/*`).** Keeps the convention violation we are fixing. Rejected.

## References

- Feature Spec: [specs/001-admin-monorepo-split/spec.md](../../specs/001-admin-monorepo-split/spec.md)
- Implementation Plan: [specs/001-admin-monorepo-split/plan.md](../../specs/001-admin-monorepo-split/plan.md)
- Research (Decisions 1, 2, 7, 8, 10): [specs/001-admin-monorepo-split/research.md](../../specs/001-admin-monorepo-split/research.md)
- Related ADRs: [ADR-0002](./0002-application-boundary-and-deployment-isolation.md), [ADR-0003](./0003-shared-data-access-layer.md)
- Evaluator Evidence: [history/prompts/001-admin-monorepo-split/](../prompts/001-admin-monorepo-split/)

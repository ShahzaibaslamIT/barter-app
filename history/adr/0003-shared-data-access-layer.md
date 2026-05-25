# ADR-0003: Shared Data Access Layer

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2026-05-25
- **Feature:** 001-admin-monorepo-split
- **Context:** Both applications operate on the same Postgres database (this is a non-negotiable constraint — the admin panel exists to administer the marketplace's data). Once the apps are physically separated (ADR-0001, ADR-0002), the question is how the data-access layer is owned and consumed. The risk we are eliminating: schema drift between two apps that share a database is a high-likelihood, high-impact failure mode (subtle data corruption, runtime errors in production, mismatched expectations between admin writes and user-app reads). This ADR records how the data-access layer is structured so that drift is impossible by construction.

## Decision

The data-access layer is owned by a single shared workspace package, `@barter/db`:

- **Schema location:** `packages/db/prisma/schema.prisma` (relocated verbatim from the current repo-root `prisma/schema.prisma`). Migrations live alongside it in `packages/db/prisma/migrations/`. There is exactly one `model ...` definition site in the repository — a `grep` for `model ` returns matches only inside this file (SC-010).
- **Client distribution:** `packages/db/src/client.ts` defines the shared `PrismaClient` singleton (relocated from `lib/prisma.ts`). `packages/db/src/index.ts` re-exports the singleton and the generated Prisma types so consumers import once: `import { prisma, type User, AdminRole } from "@barter/db"`. Application code does not import `@prisma/client` directly.
- **Generation contract:** `prisma generate` is wired into `packages/db`'s `postinstall` (for local dev) and exposed as a `build` script that Turborepo invokes before either app builds. The Turbo pipeline declares `packages/db#build` as a transitive dependency of every app `build` via `dependsOn: ["^build"]` (FR-016). This makes a stale-client build impossible.
- **Environment binding:** `DATABASE_URL` is read at runtime by the client singleton (not at package build time). Each app sets `DATABASE_URL` in its own Vercel project; both point at the same Postgres in production.
- **Migration ownership:** `pnpm db:migrate` (alias for `pnpm --filter @barter/db migrate dev`) creates new migrations in dev. Production migration deploys are invoked from CI on the user-app deployment by convention (one app drives migrations; this is the higher-traffic system whose deploy gate the team watches most closely).
- **Schema change workflow:** edit the schema in one place → run `pnpm db:generate` → both apps see updated types instantly. No per-app schema files, no per-app client regeneration.

## Consequences

### Positive

- Single source of truth: schema drift between the two apps becomes structurally impossible (SC-010).
- Type consistency: an admin write and a user-app read are guaranteed to use the same TypeScript types because both compile against the same generated client (US4 acceptance scenario 2).
- Schema changes propagate atomically: one edit, one client regeneration, both apps updated (SC-004).
- Turbo's `dependsOn` enforces generation-before-build at the toolchain level — no developer can forget to regenerate the client.
- Removes the `@prisma/client` import scatter: a single import surface (`@barter/db`) means a future ORM swap touches one package, not every API route.

### Negative

- One more workspace dependency to bootstrap; `pnpm install` from a fresh clone must complete before either app's type-check works (mitigated by `postinstall` hook).
- A change to a Prisma model triggers re-builds of both apps in Turbo's task graph (correct behaviour, but slower than the pre-refactor world where only one app existed).
- `@barter/db` becomes a hot bottleneck for the schema review process — schema PRs touching this package warrant extra scrutiny because they affect both apps.
- Bundling: care needed to ensure `PrismaClient` is server-only. Any client-side `import "@barter/db"` will fail at build time (Prisma cannot run in the browser); documented in `quickstart.md` troubleshooting.

## Alternatives Considered

**Alternative A — Keep schema at repo root with both apps pointing to it.** Each app declares Prisma as a direct dep and runs `prisma generate` independently against the shared schema file. Rejected: duplicated config, two separate generated client directories in `node_modules`, two places where generation can be forgotten or fall out of sync. Doesn't eliminate the drift class of bugs — just papers over it.

**Alternative B — Per-app Prisma schema, manually kept in sync.** Each app maintains its own schema. Rejected immediately: this is exactly the failure mode we are spending engineering effort to eliminate. Mentioning it only to be explicit that we considered and rejected the path of least immediate effort.

**Alternative C — Replace Prisma with Drizzle (or another query builder) inside `@barter/db`.** Lighter runtime, no codegen, easier edge-runtime story. Rejected as out of scope for this refactor — switching ORMs is a separate decision that would touch every query in the codebase. The package boundary established by this ADR makes a future Drizzle migration easier (one package to swap, not every API route), so this alternative is preserved as future optionality.

**Alternative D — Split the apps onto separate databases.** Strongest isolation between admin and user-app workloads. Rejected outright by spec scope ("The Postgres database is the source of truth for both applications and will not be split or replicated as part of this work"). The admin panel administers the same data the user app produces; splitting would defeat its purpose.

**Alternative E — Direct database access via raw SQL or `node-postgres` from each app independently.** No Prisma dependency, no client to keep in sync. Rejected: loses type safety, makes refactors brittle, and goes against the established pattern of the codebase. Schema drift would re-emerge in a different shape (column-name typos, missed migrations).

## References

- Feature Spec: [specs/001-admin-monorepo-split/spec.md](../../specs/001-admin-monorepo-split/spec.md)
- Implementation Plan: [specs/001-admin-monorepo-split/plan.md](../../specs/001-admin-monorepo-split/plan.md)
- Research (Decision 3): [specs/001-admin-monorepo-split/research.md](../../specs/001-admin-monorepo-split/research.md)
- Data Model: [specs/001-admin-monorepo-split/data-model.md](../../specs/001-admin-monorepo-split/data-model.md)
- Related ADRs: [ADR-0001](./0001-monorepo-topology-and-build-orchestration.md), [ADR-0002](./0002-application-boundary-and-deployment-isolation.md)
- Evaluator Evidence: [history/prompts/001-admin-monorepo-split/](../prompts/001-admin-monorepo-split/)

# Feature Specification: Admin Panel Monorepo Split

**Feature Branch**: `001-admin-monorepo-split`
**Created**: 2026-05-25
**Status**: Draft
**Input**: User description: "Separate the admin panel from the main barter-app into a standalone Next.js application within a pnpm + Turborepo monorepo. Shared database, admin on a subdomain, existing JWT admin auth retained, incremental migration with main always deployable."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Independent admin deployment isolated from user app (Priority: P1)

The product team wants the admin panel to live in its own application so that admin-side changes (moderation tooling, audit dashboards, user-management UIs) can be reviewed, deployed, and rolled back without touching the user-facing app's release pipeline. Today, every admin change forces a redeploy of the entire user app, increasing blast radius and slowing operator iteration.

**Why this priority**: Eliminates the highest-risk coupling — a bad admin change taking down the marketplace for end users. This separation alone delivers the core organizational value of the refactor; everything else builds on it.

**Independent Test**: Make a trivial UI change in the admin panel only and confirm a deployment is triggered for the admin app and **not** for the user app. Conversely, a change to a user-app-only page must trigger only the user app's deployment.

**Acceptance Scenarios**:

1. **Given** the monorepo contains both applications, **When** a developer modifies a file that lives only under the admin app's tree, **Then** only the admin app's CI/CD pipeline runs a build and deploy.
2. **Given** the admin app is deployed and serving traffic, **When** the user app is rolled back to a previous release, **Then** the admin panel remains available and unaffected.
3. **Given** both apps are deployed, **When** an end user visits the marketplace and an admin visits the admin panel concurrently, **Then** both experiences work without cross-impact.

---

### User Story 2 - Admin panel served from a dedicated hostname (Priority: P1)

Operators need the admin panel to be reachable at a distinct hostname (a subdomain of the product domain) so that admin traffic is segregated at the network layer, can carry its own access controls (IP allowlists, WAF rules), and is visibly separated from public-facing traffic in operational dashboards.

**Why this priority**: Hostname separation is a hard requirement for the security and cookie-scoping guarantees the refactor depends on. Without it, the session-isolation user story (US3) cannot be enforced.

**Independent Test**: Resolve the admin hostname in a browser, observe an admin login screen served by the admin application; resolve the user-app hostname, observe the user-facing app. Confirm via response headers/source that the two pages come from different deployments.

**Acceptance Scenarios**:

1. **Given** DNS is configured, **When** a user visits the admin hostname, **Then** they receive the admin app's login page (or an authenticated admin dashboard if already signed in).
2. **Given** an end user visits the user-app hostname, **When** they navigate the marketplace, **Then** no admin routes are reachable from the user-app hostname.
3. **Given** monitoring is wired up, **When** the operator inspects request traffic, **Then** admin requests and user-app requests appear as separate streams attributable to their respective deployments.

---

### User Story 3 - Cross-application session isolation (Priority: P1)

Admin and user authentication systems must remain fully independent: a stolen or shared cookie from one app must be unable to authenticate against the other. An end user signed into the marketplace and an admin signed into the admin panel must coexist in the same browser without state collision.

**Why this priority**: This is a security-critical invariant. Any leak between session systems would be a credential-equivalent vulnerability. P1 because failure here is unacceptable, not optional.

**Independent Test**: Log in as a regular user on the user-app hostname, then visit the admin hostname in the same browser session. Confirm the admin app does not consider the user authenticated. Reverse the test (admin then user) and confirm the same.

**Acceptance Scenarios**:

1. **Given** a user is authenticated on the user-app hostname, **When** they navigate to the admin hostname, **Then** the admin app prompts for admin login as if no session exists.
2. **Given** an admin is authenticated on the admin hostname, **When** they call a user-app API endpoint, **Then** their admin session is not accepted as user authentication.
3. **Given** both sessions exist in the same browser, **When** the user logs out of one app, **Then** the other app's session remains intact.

---

### User Story 4 - Single source of truth for shared data layer (Priority: P2)

Both applications operate on the same production database, so the database schema and the data-access layer must be defined exactly once in a shared location and consumed by both apps. Anyone updating the schema does so in one place, and both apps pick up the change without manual duplication or copy-paste drift.

**Why this priority**: Schema drift between two apps that share a database is a high-likelihood, high-impact failure mode (subtle data corruption, runtime errors in production). Centralising the data layer makes this class of bug impossible by construction.

**Independent Test**: Add a field to a model in the shared data-layer package, regenerate the client once, and verify both applications type-check against the new field without local schema files.

**Acceptance Scenarios**:

1. **Given** a developer modifies the schema in the shared package, **When** they run the build, **Then** both apps consume the updated client and types without separate schema edits.
2. **Given** an admin operation writes to a table, **When** the user app reads from that table, **Then** it observes the write through identical model definitions.
3. **Given** the repository is freshly cloned, **When** a developer searches the codebase, **Then** they find exactly one location defining each database model.

---

### User Story 5 - Single-command local development for both apps (Priority: P2)

A developer working on the repo can start both apps locally with one command from the repo root, with both apps available on predictable, distinct ports and able to talk to the same local database.

**Why this priority**: Without this, the monorepo's developer experience regresses versus the current single-app setup. Splitting the apps must not make it harder to work on either of them.

**Independent Test**: From a fresh clone, run the documented setup commands and a single dev command at the repo root. Confirm both apps come up and serve their landing pages on distinct localhost ports.

**Acceptance Scenarios**:

1. **Given** a fresh clone with dependencies installed, **When** the developer runs the documented dev command at the repo root, **Then** both apps start, each on its own port, sharing the same local database connection.
2. **Given** both apps are running locally, **When** a developer edits a shared package, **Then** both apps observe the change without a manual restart of either.
3. **Given** a developer wants to work on only one app, **When** they run the dev command for that app's workspace, **Then** only that app starts.

---

### User Story 6 - Incremental migration with main always deployable (Priority: P2)

The migration from the current single-app layout to the monorepo must proceed in small, independently deployable steps. At every commit on the main branch during the migration, the production user app must remain deployable and functionally identical to today.

**Why this priority**: A multi-day big-bang restructure is too risky for a live product. Incremental migration preserves the option to pause, ship hotfixes, or abort the migration without rolling back days of work.

**Independent Test**: Pick any commit on the migration branch after its first merge, deploy it to a preview environment, and verify the user-app experience is unchanged from production.

**Acceptance Scenarios**:

1. **Given** the migration is in progress, **When** an operator deploys the main branch HEAD to production at any point, **Then** the user app continues to function with no observable regressions.
2. **Given** a hotfix is needed mid-migration, **When** a developer branches from main and ships a fix, **Then** the fix lands without conflicting with the in-flight restructure.
3. **Given** the migration completes, **When** the team reviews the merge log, **Then** the migration is composed of a sequence of small, reviewable steps rather than a single mega-commit.

---

### Edge Cases

- A developer opens both apps in the same browser tab session — both authentication systems must remain independently navigable without cookie collision or unexpected logout.
- An operator deploys the admin app before the user app picks up a corresponding shared-package change — both apps must tolerate a brief skew window, or the deploy ordering must be enforced by tooling.
- A schema change is made that requires both apps to be updated atomically — the migration plan must define a safe rollout order (expand → migrate → contract pattern).
- A request to an old admin URL on the user app hostname arrives after the migration — the system must respond deterministically (redirect to the new hostname or 404) rather than serve stale content.
- The admin app is briefly unreachable (DNS propagation, deploy in flight) — the user app must remain fully functional and not depend on admin availability at request time.
- A developer adds a dependency only one app needs — the dependency must not be installed into the other app's bundle.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The repository MUST contain exactly two deployable applications: one user-facing application and one admin application, located under a top-level `apps/` directory.
- **FR-002**: Shared code (database schema and client, shared types, shared configuration) MUST live in a top-level `packages/` directory and be consumed by both applications via workspace dependencies, with no source duplication across apps.
- **FR-003**: The admin application MUST be served from a distinct hostname (a subdomain of the product domain) that is separate from the user-facing application's hostname.
- **FR-004**: Each application MUST deploy independently — a change touching only one application's code MUST trigger a build and deploy only for that application.
- **FR-005**: Both applications MUST connect to the same production database using a single, shared data-access client defined in the shared packages.
- **FR-006**: The admin application MUST continue to use the existing admin authentication mechanism (JWT cookie, RBAC roles `super_admin`, `moderator`, `support`) without behavioural change.
- **FR-007**: The user application MUST continue to use its existing end-user authentication mechanism without behavioural change.
- **FR-008**: Admin session cookies MUST be scoped such that they are sent only to the admin hostname; user-app session cookies MUST be scoped such that they are sent only to the user-app hostname.
- **FR-009**: A developer MUST be able to start both applications locally with a single command executed at the repository root, with each app bound to a distinct, predictable port.
- **FR-010**: A developer MUST be able to start each application individually from its workspace.
- **FR-011**: All current admin features (user management, listing moderation, reports, ratings, audit logs, dashboard, settings) MUST function identically after the migration.
- **FR-012**: All current user-facing features MUST function identically after the migration, with no observable change to end users.
- **FR-013**: The migration MUST be executed as a sequence of merges to `main`, each of which leaves `main` in a deployable state for the user application.
- **FR-014**: Build and lint tooling configuration (ESLint, TypeScript) MUST be defined once in a shared package and extended by each application, rather than duplicated.
- **FR-015**: Requests to legacy admin URLs on the user-app hostname after the migration completes MUST be handled deterministically — either by permanent redirect to the corresponding admin-hostname URL or by an explicit 404 — and MUST NOT serve the legacy admin UI from the user-app hostname.
- **FR-016**: The shared data-access client MUST be generated and available to both apps before either app builds in CI; build tooling MUST enforce this ordering.

### Key Entities

- **Application**: A deployable web application. Two instances exist post-migration — the user app and the admin app — each with its own dependency manifest, build artefact, and deployment target.
- **Shared Package**: A workspace module consumed by one or both applications. Includes the data-access package (schema + generated client), shared types, and shared tooling configuration. Has no deployment target of its own.
- **Deployment Target**: A hosting environment bound to a specific application and hostname. Includes its own environment variables, build settings, and release pipeline.
- **Session Cookie**: A credential issued by one application, scoped to that application's hostname. Admin and user-app session cookies are distinct entities and cannot authenticate against each other.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An admin-only code change results in zero builds of the user-facing application (verified via CI/CD pipeline logs).
- **SC-002**: A user-app-only code change results in zero builds of the admin application (verified via CI/CD pipeline logs).
- **SC-003**: A new developer running the documented setup commands followed by a single root-level dev command sees both applications serving on distinct local ports within 60 seconds of the dev command completing first compile.
- **SC-004**: A schema change requires editing exactly one file in one location; both applications type-check against the new schema without further edits.
- **SC-005**: A session cookie issued by one application is rejected by the other application's authentication middleware in 100% of test cases.
- **SC-006**: 100% of existing admin user-management, listing-moderation, reporting, audit-log, dashboard, and ratings flows pass end-to-end testing after migration.
- **SC-007**: 100% of existing end-user marketplace flows (signup, listing creation, discovery, messaging, barter offers, profile) pass end-to-end testing after migration.
- **SC-008**: Every commit on `main` between migration start and completion can be deployed to a production-equivalent environment with the user app remaining fully functional.
- **SC-009**: The admin application is reachable at its dedicated hostname and the user application at its hostname, with a measurable HTTP response from each within standard web-app latency expectations.
- **SC-010**: Searching the repository for the database schema definition returns exactly one result.

## Assumptions

- The hosting platform supports deploying multiple applications from a single repository with per-application root directories and per-application environment variables (this is true for the current Vercel-based setup).
- A subdomain on the existing product domain can be provisioned for the admin application, with TLS handled by the hosting platform.
- The existing admin authentication implementation (JWT cookie, three RBAC roles, 30-minute session) is the target end-state and is not being redesigned as part of this work.
- The existing end-user authentication implementation (NextAuth-based) is the target end-state and is not being redesigned as part of this work.
- The Postgres database is the source of truth for both applications and will not be split or replicated as part of this work.
- "Incremental migration" means a sequence of merges to `main`, not a long-lived parallel branch — each step is small enough to review and ship independently.
- The migration plan will adopt an expand-then-contract pattern for any change that temporarily requires both layouts to coexist (e.g., dependency moves, route deprecation), so that no commit on `main` is broken.

## Out of Scope

- Changing or extending admin features beyond what exists today.
- Database schema changes (other than relocating the schema file to the shared package).
- Rewriting the admin panel in a different framework or with a different admin toolkit.
- Mobile applications.
- Build-time optimisation work beyond enabling the monorepo build tool's default caching.
- Design-system overhaul or visual changes.
- Introducing new shared infrastructure (queues, caches, observability stacks) beyond what already exists.

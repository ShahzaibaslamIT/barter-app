# ADR-0002: Application Boundary & Deployment Isolation

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2026-05-25
- **Feature:** 001-admin-monorepo-split
- **Context:** With the monorepo topology decided (ADR-0001), the next architectural question is **where the boundary between the user app and the admin panel sits at runtime**, and how that boundary is enforced operationally and from a security perspective. The choice of boundary (path vs subdomain vs separate domain), deployment unit (one Vercel project with rewrites vs two projects), and session isolation strategy (shared cookies vs host-only vs server-side sessions) are tightly coupled — choosing one forecloses options for the others. This ADR captures them as a single cluster because none of them can be revisited without revisiting the rest.

## Decision

The application boundary, deployment topology, and session isolation strategy are jointly defined as follows:

- **Application boundary:** the user app and the admin panel are two distinct Next.js applications (`apps/web`, `apps/admin`), each with its own dependency manifest, build artefact, and middleware. No source code is shared between them at the route level; only the shared workspace packages from ADR-0001 cross the boundary.
- **Network boundary:** the admin panel is served from a dedicated subdomain (`admin.<root-domain>`); the user app is served from the apex/`www` domain. The `/api/admin/` URL prefix used today is **dropped** on the admin subdomain (e.g., today's `/api/admin/users` becomes `/api/users` on `admin.<root-domain>`).
- **Deployment unit:** two independent Vercel projects sharing one Git repo. Each project sets its own Root Directory (`apps/web` or `apps/admin`), its own build command (`turbo run build --filter=<workspace>...`), and its own env-var set. Vercel's Git integration plus `turbo-ignore` ensures a push that touches only one app's files triggers only that project's deploy.
- **Environment variable split:** `DATABASE_URL` and `JWT_SECRET` are present in both projects (same value). `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, Resend, Twilio, Cloudinary, Firebase, and OneSignal credentials live only in `apps/web`. Admin-specific secrets (if any) live only in `apps/admin`.
- **Session isolation:** both apps issue **host-only cookies** (no `Domain` attribute) — `admin_token` on the admin host, NextAuth session token on the user-app host. Each app's middleware validates only its own cookie name. `apps/web/middleware.ts` contains zero references to `admin_token` post-migration; `apps/admin/middleware.ts` contains zero references to NextAuth. A `grep` for either token in the other app's source tree must return zero matches.
- **Legacy URL policy (deferred):** requests to `/admin/*` or `/api/admin/*` on the user-app host after the migration's contract phase are handled with a deterministic 301 redirect to the admin subdomain for a 90-day deprecation window, then switched to 404. Final policy is candidate for `/sp.clarify` but does not block this ADR.

## Consequences

### Positive

- Independent deploy lifecycles: a bad admin push cannot affect the marketplace, and rollbacks are scoped per app (delivers the core US1 value).
- Hostname separation enables independent WAF rules, IP allowlists, and access logs for admin traffic — a long-standing wishlist item that becomes free with this boundary.
- Host-only cookies provide provable cross-app session isolation (SC-005) without introducing a session store or rewriting either auth system. The invariant is enforced by browsers, not by application code.
- Cookie-name disjointness gives a second line of defence: even a middleware misconfiguration cannot leak sessions across apps if the cookies are named differently and scoped to different hosts.
- Per-app env-var split shrinks each deployment's secret surface area — `apps/admin` does not see Twilio, Resend, or Firebase credentials at all.
- Two Vercel projects from one repo is a first-class platform feature, not a workaround — no custom build server, no path-based proxy configuration.

### Negative

- DNS work required: a subdomain must be provisioned, TLS cert issued (automatic on Vercel), and at cutover time DNS must be flipped — a small but real ops step.
- Per-app env-var management means rotating `DATABASE_URL` or `JWT_SECRET` requires updating two Vercel projects atomically. Misalignment causes either app to fail to authenticate or connect.
- Two preview deployments per PR (one per app) instead of one — slightly more clutter in PR comments; mostly a wash because each preview is independent.
- The "drop `/api/admin/` prefix on the admin host" rule is a one-time codemod risk during migration step 6 — any missed fetch site will 404 after migration. Mitigated by per-area migration PRs and acceptance testing.
- Operators who bookmarked `/admin/login` on the marketplace domain hit the redirect/404 policy — recommended 301 grace period mitigates but does not eliminate.

## Alternatives Considered

**Alternative A — Same domain, path-based split with one Vercel project and rewrites.** Treats `/admin/*` as a rewrite to a separate workspace built into the same deployment artefact. Rejected: defeats the deploy-isolation goal (a single bad build takes down both surfaces) and forces shared cookie scoping (cookies on the same host travel to all paths by default), which breaks SC-005 without significant rework.

**Alternative B — Separate parent domain entirely (`barter-admin.com`).** Strongest isolation: separate TLS, separate DNS authority, no cookie-leakage scenarios even by accident. Rejected: introduces CORS, certificate, and brand-management overhead with no security gain over host-only cookies on a single parent domain. Worth revisiting only if compliance or organisational boundaries demand it.

**Alternative C — Same subdomain, shared cookies, distinguish admin sessions by JWT claim.** Single auth system handling both user and admin sessions via role claims. Rejected: collapses two auth systems into one, increases blast radius of any auth bug, and requires migrating NextAuth and the JWT admin system into a unified scheme — explicitly out of scope for this refactor.

**Alternative D — Subdomain with `Domain=.<root-domain>` cookies for SSO between apps.** Allows a single login to flow into both apps. Rejected: this is the exact failure mode SC-005 is meant to prevent — admin and user sessions must not be able to authenticate each other. SSO across apps is a non-goal and would weaken the security posture without payoff.

**Alternative E — Server-side opaque sessions in Redis instead of JWT cookies.** Removes the JWT validation surface entirely; sessions are revocable. Rejected: introduces a new piece of infrastructure (Redis) and is a meaningful re-platform of the admin auth system, both explicitly out of scope for this feature. Worth filing as future work if revocation becomes a hard requirement.

## References

- Feature Spec: [specs/001-admin-monorepo-split/spec.md](../../specs/001-admin-monorepo-split/spec.md)
- Implementation Plan: [specs/001-admin-monorepo-split/plan.md](../../specs/001-admin-monorepo-split/plan.md)
- Research (Decisions 4, 5, 9): [specs/001-admin-monorepo-split/research.md](../../specs/001-admin-monorepo-split/research.md)
- Auth Isolation Contract: [specs/001-admin-monorepo-split/contracts/auth-isolation.md](../../specs/001-admin-monorepo-split/contracts/auth-isolation.md)
- Route Ownership Contract: [specs/001-admin-monorepo-split/contracts/route-ownership.md](../../specs/001-admin-monorepo-split/contracts/route-ownership.md)
- Related ADRs: [ADR-0001](./0001-monorepo-topology-and-build-orchestration.md), [ADR-0003](./0003-shared-data-access-layer.md)
- Evaluator Evidence: [history/prompts/001-admin-monorepo-split/](../prompts/001-admin-monorepo-split/)

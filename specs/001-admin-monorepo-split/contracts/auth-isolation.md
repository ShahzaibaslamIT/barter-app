# Contract: Cross-App Authentication Isolation

**Feature**: 001-admin-monorepo-split
**Date**: 2026-05-25

This contract specifies how authentication and session state remain isolated between `apps/web` and `apps/admin` after the migration. It exists because FR-008 and SC-005 require provable session isolation; violating this contract is a security defect.

---

## Cookies issued

### `apps/web` (user-app host)

| Cookie | Issuer | Domain | Path | HttpOnly | Secure | SameSite | Notes |
|---|---|---|---|---|---|---|---|
| `next-auth.session-token` (or `__Secure-next-auth.session-token` in prod) | NextAuth | host-only (no `Domain` attribute) | `/` | yes | yes | `lax` | NextAuth default; carries user session |
| `next-auth.csrf-token` | NextAuth | host-only | `/` | yes | yes | `lax` | NextAuth CSRF |

### `apps/admin` (admin subdomain)

| Cookie | Issuer | Domain | Path | HttpOnly | Secure | SameSite | Notes |
|---|---|---|---|---|---|---|---|
| `admin_token` | `lib/admin-auth.ts` `signAdminToken` | host-only (no `Domain` attribute) | `/` | yes | yes | `lax` | JWT signed with `JWT_SECRET`; 30-min expiry; payload includes `admin_id`, `email`, `name`, `role` |

## Invariants

1. **Host-only scoping** — neither cookie sets a `Domain` attribute. Browsers send the cookie only when the request host exactly matches the host that set it. This is the mechanism behind SC-005.
2. **Distinct cookie names** — `admin_token` is unique to the admin app; NextAuth cookie names belong to the web app. A misconfigured middleware that read the wrong cookie would still receive nothing on the wrong host.
3. **No shared parent-domain cookies** — neither app issues a cookie with `Domain=.barter-app.com`. Any future need to share state across hosts must use a different mechanism (e.g., server-side session lookup), not cookies.
4. **No cross-app token validation** — `apps/admin` middleware validates `admin_token` only. `apps/web` middleware validates NextAuth session only. Neither app references the other's cookie name.
5. **NEXTAUTH_URL scoping** — `apps/web` sets `NEXTAUTH_URL` to its own production URL. The admin app does not set or reference `NEXTAUTH_URL`.

## Middleware contracts

### `apps/web/middleware.ts`

- **Before migration** (current state): contains an admin block that intercepts `/admin/*` and `/api/admin/*` requests and validates `admin_token`. This block is removed in step 7 of the migration order.
- **After migration**: contains only user-app concerns (terms gate, NextAuth session refresh, pathname header injection, etc.). Contains no reference to `admin_token`. Optionally adds the FR-015 redirect/404 for legacy `/admin/*` paths during the deprecation window.

### `apps/admin/middleware.ts`

- **Pre-existing** middleware admin block moves here verbatim during step 7.
- Intercepts all admin app routes except `/login` and `/api/auth/*` and validates `admin_token`.
- Returns 401 JSON for missing/invalid token on `/api/*`; redirects to `/login` for page routes.

## Test obligations (acceptance for SC-005)

The following must hold and must be covered by automated tests in the migration's verification step:

| Test | Expected result |
|---|---|
| Send a request to `https://admin.barter-app.com/api/users` carrying only a valid `next-auth.session-token` (no `admin_token`) | 401 Unauthorized |
| Send a request to `https://www.barter-app.com/api/user/me` carrying only a valid `admin_token` (no NextAuth cookie) | 401 Unauthorized |
| Set both cookies in the same browser via separate logins; visit each app | each app authenticates its own session; logging out of one leaves the other intact |
| Inspect `Set-Cookie` response headers from each app's login endpoint | neither response contains `Domain=` for its session cookie |
| `grep -r "admin_token" apps/web/` | zero matches post-migration |
| `grep -r "next-auth" apps/admin/` | zero matches post-migration |

## Rotation and secrets

`JWT_SECRET` is configured in both apps (admin signs and verifies; web does not need it post-migration). Rotation requires updating env vars in both Vercel projects atomically. `NEXTAUTH_SECRET` lives only in `apps/web` env.

# Contract: Route Ownership Map

**Feature**: 001-admin-monorepo-split
**Date**: 2026-05-25

> This contract is **not** a new API specification. The route surface is unchanged. This document is the authoritative mapping of which application owns each existing route family post-migration. Any route not listed here is a defect and should be reported.

---

## Page routes

### Owned by `apps/web` (user-app domain)

| Current path (under `app/`) | Post-migration path | Notes |
|---|---|---|
| `/` (page.tsx) | `apps/web/app/page.tsx` | Landing |
| `/auth/*` | `apps/web/app/auth/*` | Login / OTP verify |
| `/home/*` | `apps/web/app/home/*` | Authenticated home |
| `/discover/*` | `apps/web/app/discover/*` | Marketplace browse |
| `/post/*` | `apps/web/app/post/*` | Create listing |
| `/listings/*` | `apps/web/app/listings/*` | Listing detail + edit |
| `/profile/*` | `apps/web/app/profile/*` | User profile |
| `/my-listings/*` | `apps/web/app/my-listings/*` | User's listings |
| `/accept-terms/*` | `apps/web/app/accept-terms/*` | Terms gate |
| `/complete-profile/*` | `apps/web/app/complete-profile/*` | Profile completion |

### Owned by `apps/admin` (admin subdomain)

| Current path (under `app/admin/`) | Post-migration path | Notes |
|---|---|---|
| `/admin` (page.tsx) | `apps/admin/app/page.tsx` | Root → redirect to `/dashboard` or `/login` |
| `/admin/login` | `apps/admin/app/login` | Admin login form |
| `/admin/dashboard` | `apps/admin/app/dashboard` | KPI dashboard |
| `/admin/users` | `apps/admin/app/users` | User management |
| `/admin/listings` | `apps/admin/app/listings` | Listing moderation |
| `/admin/reports` | `apps/admin/app/reports` | User-submitted reports |
| `/admin/audit-logs` | `apps/admin/app/audit-logs` | Admin action history |
| `app/admin/layout.tsx` | `apps/admin/app/layout.tsx` | Admin shell layout |
| `app/admin/AdminSidebar.tsx` | `apps/admin/components/AdminSidebar.tsx` | Sidebar nav |

### Redirect / 404 on `apps/web` (post-migration)

Per FR-015, requests to legacy paths under `/admin/*` on the user-app host are handled deterministically:

- **Recommended policy**: 301 permanent redirect from `https://<web-host>/admin/<path>` to `https://admin.<root-domain>/<path>` for 90 days post-cutover, then switch to 404. Implemented in `apps/web/middleware.ts` or `apps/web/app/admin/[...slug]/route.ts`.
- This policy is a candidate for `/sp.clarify` before the contract phase.

---

## API routes

### Owned by `apps/web` (user-app domain)

| Current path (under `app/api/`) | Post-migration | Public/Auth |
|---|---|---|
| `/api/auth/*` | `apps/web/app/api/auth/*` | NextAuth + custom signup/login/verify-otp/resend-otp |
| `/api/listings/*` (excluding `/api/listings/mine`) | `apps/web/app/api/listings/*` | Public read; auth write |
| `/api/listings/mine` | `apps/web/app/api/listings/mine` | Auth (user) |
| `/api/listings/nearby` | `apps/web/app/api/listings/nearby` | Public |
| `/api/listings/cities` | `apps/web/app/api/listings/cities` | Public |
| `/api/listings/[id]` | `apps/web/app/api/listings/[id]` | Public read; owner write |
| `/api/barter-offers/*` | `apps/web/app/api/barter-offers/*` | Auth (user) |
| `/api/messages/*` | `apps/web/app/api/messages/*` | Auth (user) |
| `/api/ratings/*` | `apps/web/app/api/ratings/*` | Auth (user) |
| `/api/notifications/*` | `apps/web/app/api/notifications/*` | Auth (user) |
| `/api/upload/*` | `apps/web/app/api/upload/*` | Auth (user) — Cloudinary signed uploads |
| `/api/user/me` | `apps/web/app/api/user/me` | Auth (user) |
| `/api/user/profile` | `apps/web/app/api/user/profile` | Auth (user) |
| `/api/user/accept-terms` | `apps/web/app/api/user/accept-terms` | Auth (user) |
| `/api/user/[id]` | `apps/web/app/api/user/[id]` | Auth (user) |
| `/api/users` (if present) | `apps/web/app/api/users` | Auth (user) |

### Owned by `apps/admin` (admin subdomain)

| Current path (under `app/api/admin/`) | Post-migration | Auth |
|---|---|---|
| `/api/admin/auth/*` | `apps/admin/app/api/auth/*` | Public (login endpoints only) |
| `/api/admin/dashboard/*` | `apps/admin/app/api/dashboard/*` | Admin JWT |
| `/api/admin/users/*` | `apps/admin/app/api/users/*` | Admin JWT |
| `/api/admin/listings/*` | `apps/admin/app/api/listings/*` | Admin JWT |
| `/api/admin/reports/*` | `apps/admin/app/api/reports/*` | Admin JWT |
| `/api/admin/audit-logs/*` | `apps/admin/app/api/audit-logs/*` | Admin JWT |

> **Note on path rewriting**: On the admin subdomain, the `/api/admin/` prefix is **dropped** — the admin app's own root is the admin namespace, so `/api/users` on `admin.barter-app.com` is the equivalent of today's `/api/admin/users` on the user-app host. All admin-side fetch calls in the admin UI must be updated from `fetch('/api/admin/users')` → `fetch('/api/users')` during the migration of each admin route family.

### Forbidden on `apps/web` post-migration

The following must return 404 (or redirect, per FR-015) on the user-app host after the contract phase completes:

- Any URL under `/admin/*`
- Any URL under `/api/admin/*`

Verifying these return 404/redirect on the user-app host is part of US2 acceptance scenario 2 and US3 acceptance scenario 2.

---

## Shared libraries — call surface

Code that currently lives in `lib/` is split as follows. This is a **contract** between the apps and the shared packages — apps must import from the package, not reach into another app's `lib/`.

| Current file | Post-migration location | Consumers |
|---|---|---|
| `lib/prisma.ts` | `packages/db/src/client.ts` (exported as `prisma`) | both apps |
| `lib/admin-auth.ts` | `apps/admin/lib/admin-auth.ts` | admin only |
| `lib/auth-options.ts` | `apps/web/lib/auth-options.ts` | web only |
| `lib/get-server-user.ts` | `apps/web/lib/get-server-user.ts` | web only |
| `lib/user-status.ts` | `apps/web/lib/user-status.ts` | web only |
| `lib/audit.ts` | `apps/admin/lib/audit.ts` | admin only (audit logs are admin-action records) |
| `lib/rate-limit.ts` | `packages/shared` (if shared) or duplicated | TBD — audit consumers in Phase 2 |
| `lib/geocode.ts` | `apps/web/lib/geocode.ts` | web only |
| `lib/sms.ts` | `apps/web/lib/sms.ts` | web only (Twilio OTP) |
| `lib/send-notification.ts` | `apps/web/lib/send-notification.ts` | web only |
| `lib/firebase.ts`, `lib/firebase-admin.ts` | `apps/web/lib/firebase*.ts` | web only |

Any cross-cutting type used by both apps (e.g., `AdminTokenPayload` if any web-side admin verification is needed — which we expect to be zero post-migration) goes into `packages/types`.

# apps/admin — Barter admin panel

The internal admin panel: dashboard, user management, listing moderation,
reports, audit logs. Next.js 15 (App Router) on port **3001**.

Production: `barter-admin-wine.vercel.app` (Vercel project root dir `apps/admin`).
A dedicated `admin.<domain>` subdomain is planned (Phase 6) once a custom domain
is registered. The marketplace is a **separate** app — see [`../web`](../web/README.md).

## Stack

- Next.js 15.5.9 (App Router) · React 18.3 · Tailwind v4 (CSS-first)
- Auth: **custom JWT** (`jsonwebtoken` + `bcryptjs`), **not** NextAuth
- UI: plain Tailwind + `lucide-react` icons (does **not** depend on `@barter/ui`)
- Shared workspace packages: `@barter/db`, `@barter/types`, `@barter/config`

## Dev

From the repo root (preferred — boots only this app):

```bash
pnpm install                 # first time
cp .env.example .env         # fill in values (see root .env.example)
pnpm db:generate             # generate the Prisma client
pnpm dev:admin               # http://localhost:3001
```

First-run: seed an admin user with `apps/web/scripts/create-admin.ts`
(`ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` + `DATABASE_URL`), then log in
at `/login`.

## Environment

This app needs only **`DATABASE_URL`** and **`JWT_SECRET`** (see root
`.env.example`). It must **never** receive NextAuth/Google/Twilio/etc. secrets —
those are web-app concerns.

## Auth & the host-only cookie invariant

> **Invariant:** the admin session cookie (`admin_token`) is **host-only** — it
> is set with **no `Domain` attribute** (`httpOnly`, `secure` in prod,
> `sameSite=lax`, `path=/`). This is what isolates admin sessions from the
> marketplace: a cookie scoped to the admin host is never sent to the web host,
> and vice-versa. The two apps also use **different cookie names**
> (`admin_token` vs `__Secure-next-auth.session-token`). **Do not** add a
> `Domain=` value to either app's cookie — that would break cross-app session
> isolation (US3).

Protection layers (defense-in-depth):

1. `middleware.ts` — Edge-safe **presence** check on `admin_token`; redirects
   anonymous page requests to `/login`, returns 401 for anonymous `/api/*`
   (exempts `/login` and `/api/auth/*`). No JWT verification here —
   `jsonwebtoken` isn't Edge-compatible.
2. `app/(protected)/layout.tsx` — server guard, **verifies** the JWT via
   `getAdminFromCookies()`; redirects to `/login` if invalid.
3. Each `app/api/*` route handler (Node runtime) — calls `getAdminFromRequest()`
   and returns 401 if the token is missing/invalid. RBAC via `hasPermission()`.

## Notes

- `@barter/db` is in `transpilePackages` (`next.config.mjs`); `@barter/ui` is
  intentionally **not** — this app imports no `@barter/ui` components.
- `outputFileTracingRoot` points at the monorepo root so the hoisted Prisma
  engine binary is bundled into the serverless functions.

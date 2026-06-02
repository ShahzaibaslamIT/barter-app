# apps/web — Barter marketplace (user app)

The public-facing barter marketplace: listings, discovery, offers, messaging,
ratings, profiles. Next.js 15 (App Router) on port **3000**.

Production: `barter-app-gamma.vercel.app` (Vercel project root dir `apps/web`).
The admin panel is a **separate** app — see [`../admin`](../admin/README.md).

## Stack

- Next.js 15.5.9 (App Router) · React 18.3 · Tailwind v4 (CSS-first)
- Auth: **NextAuth** (Google OAuth + credentials), session in the
  `__Secure-next-auth.session-token` cookie (host-only, no `Domain`)
- Shared workspace packages: `@barter/db` (Prisma client), `@barter/ui`
  (shadcn/Radix component kit), `@barter/types`, `@barter/config`

## Dev

From the repo root (preferred — boots only this app):

```bash
pnpm install                 # first time
cp .env.example .env         # fill in values (see root .env.example)
pnpm db:generate             # generate the Prisma client
pnpm dev:web                 # http://localhost:3000
```

`pnpm dev` (no filter) boots both web and admin together.

## Environment

See the **root `.env.example`** for the full list. This app needs:
`DATABASE_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID/SECRET`, `JWT_SECRET`,
`CLOUDINARY_*`, `TWILIO_*`, `RESEND_API_KEY`, `ONESIGNAL_*` (+ `NEXTAUTH_URL`
in production). It does **not** need any admin-only vars.

## Notes

- `middleware.ts` enforces the user moderation gate (suspended / banned /
  blacklisted users are bounced to `/auth`). It contains **no** admin logic —
  the admin panel moved to `apps/admin`.
- Workspace TS packages imported at runtime (`@barter/db`, `@barter/ui`) are
  listed in `transpilePackages` in `next.config.mjs`; `outputFileTracingRoot`
  points at the monorepo root so the hoisted Prisma engine binary is traced.
- First admin user is seeded via `scripts/create-admin.ts` (uses
  `ADMIN_EMAIL/NAME/PASSWORD`).

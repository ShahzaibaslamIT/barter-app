# Quickstart: Working with the Monorepo

**Feature**: 001-admin-monorepo-split
**Audience**: Developers picking up the repo post-migration
**Date**: 2026-05-25

This guide is **forward-looking** — it describes the developer experience after the migration in this feature completes. Until each migration step lands, the existing single-app `npm run dev` workflow continues to work.

---

## Prerequisites

- Node.js 20+ (current LTS)
- pnpm 9+ (`npm install -g pnpm` or `corepack enable && corepack use pnpm@latest`)
- A local Postgres reachable via `DATABASE_URL` (or use the production-equivalent connection string from your `.env`)

## First-time setup

```bash
git clone <repo-url>
cd barter-app
pnpm install                  # installs all workspaces, runs prisma generate via packages/db postinstall
cp .env.example .env          # populate DATABASE_URL, JWT_SECRET, NEXTAUTH_SECRET, NEXTAUTH_URL, etc.
pnpm db:generate              # explicit re-generate if needed
```

## Start both apps locally

```bash
pnpm dev
```

You should see two dev servers come up:

| App | URL |
|---|---|
| User app (`apps/web`) | http://localhost:3000 |
| Admin panel (`apps/admin`) | http://localhost:3001 |

Both apps watch the same `DATABASE_URL`; changes in either app's UI are reflected in the other through the shared database.

## Start one app at a time

```bash
pnpm dev:web      # only the user app
pnpm dev:admin    # only the admin panel
```

## Database workflow

```bash
# Edit packages/db/prisma/schema.prisma, then:
pnpm db:generate           # regenerate the client (alias for pnpm --filter @barter/db generate)
pnpm db:migrate            # create + apply a new migration in dev (alias for prisma migrate dev)
```

Schema changes take effect in both apps as soon as the client is regenerated — no per-app schema files to keep in sync.

## Build and lint

```bash
pnpm build          # builds all apps and packages via Turbo (caches across CI runs)
pnpm build --filter=web        # only build the user app and its dependencies
pnpm build --filter=admin      # only build the admin app and its dependencies
pnpm lint           # lints everything via the shared @barter/config/eslint preset
```

## Common workflows

### Adding a dependency

```bash
pnpm add <package> --filter web         # only in the user app
pnpm add <package> --filter admin       # only in the admin panel
pnpm add <package> -w                   # at the workspace root (rarely correct)
```

> Pin a dep to a single app unless you have a reason to share it. Avoid root-level deps except for tooling that operates on the workspace (Turborepo, Prettier, etc.).

### Adding a shared UI primitive

1. Create the component under `packages/ui/src/<name>.tsx`.
2. Re-export it from `packages/ui/src/index.ts`.
3. Import in either app: `import { MyComponent } from "@barter/ui"`.

### Adding a shared type

1. Add to `packages/types/src/<area>.ts`.
2. Re-export from `packages/types/src/index.ts`.
3. Import in either app: `import type { MyType } from "@barter/types"`.

### Running the admin login flow locally

1. Ensure your local DB has an `Admin` row (seed or insert via Prisma Studio).
2. Visit `http://localhost:3001/login`.
3. The `admin_token` cookie is scoped to `localhost:3001` — your `localhost:3000` user session is unaffected.

## Verifying session isolation locally

```bash
# Open two different browser profiles or use --user-data-dir to keep cookie jars separate
# In profile A: log into http://localhost:3000 as a regular user
# In profile B: log into http://localhost:3001 as an admin
# Confirm: navigating profile A to localhost:3001 shows the admin login (no admin session)
#          navigating profile B to localhost:3000 shows logged-out marketplace
```

Single-profile cross-app verification works too because the cookies are host-only — they don't traverse ports on `localhost`.

## Troubleshooting

- **`Module '@barter/db' not found`**: run `pnpm install` from the repo root to (re)link workspaces.
- **`PrismaClient is unable to be run in the browser`**: you imported `@barter/db` in a client component. Move the import to a server component, API route, or `"use server"` action.
- **Stale Prisma types after schema edit**: run `pnpm db:generate`. If both apps' editors still show old types, restart the TS server.
- **Both dev servers fight for port 3000**: the admin app is configured to use port 3001 in `apps/admin/package.json`. If it tries 3000, your `apps/web/package.json` dev script likely ran in the admin workspace by mistake.
- **`Invalid admin_token` after fresh login**: confirm `JWT_SECRET` is set in `apps/admin/.env` (or repo-root `.env`) and that the value matches what's in production if you're testing against prod data.

## What changed from the pre-migration setup

- `npm run dev` → `pnpm dev` (or `pnpm dev:web` for old-style behavior).
- `app/api/admin/*` → `apps/admin/app/api/*` (no more `/admin` prefix in the URL on the admin host).
- `app/admin/*` → `apps/admin/app/*`.
- `lib/prisma.ts` → import from `@barter/db`.
- All other `lib/*.ts` files moved into the relevant app's `lib/` directory or, for cross-cutting concerns, into `packages/`.

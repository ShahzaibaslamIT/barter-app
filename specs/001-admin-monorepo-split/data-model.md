# Phase 1 Data Model: Admin Panel Monorepo Split

**Feature**: 001-admin-monorepo-split
**Date**: 2026-05-25

> **Note**: This refactor does **not** change the database schema. The Prisma schema is being relocated, not redesigned. This document records the data-layer **ownership and access pattern** post-migration. Per spec Out of Scope: "Database schema changes (other than relocating the schema file to the shared package)."

---

## Ownership

The single Prisma schema file (`prisma/schema.prisma`) moves verbatim to `packages/db/prisma/schema.prisma`. All existing migrations under `prisma/migrations/` move to `packages/db/prisma/migrations/`. The `packages/db` workspace owns:

- Schema definition (one file, one source of truth — SC-010)
- Migration history
- Generated Prisma Client output
- The shared `PrismaClient` singleton (relocated from `lib/prisma.ts`)
- Re-exports of generated types so app code never imports `@prisma/client` directly

## Access pattern

Both `apps/web` and `apps/admin` declare:

```jsonc
// apps/<name>/package.json
{
  "dependencies": {
    "@barter/db": "workspace:*"
  }
}
```

Application code imports the client and types from a single namespace:

```ts
import { prisma, type User, type Listing, AdminRole } from "@barter/db";
```

The package exposes:

- `prisma` — the shared `PrismaClient` singleton (lazy-initialized; reads `DATABASE_URL` from `process.env` at call time).
- All generated model types (`User`, `Listing`, `BarterOffer`, `Message`, `Admin`, `AdminRole`, `UserStatus`, etc.).

## Entities (unchanged from current schema, listed for completeness)

The schema retains the following top-level domain entities. **No fields, relationships, or constraints change.**

- **User** — marketplace participant. Owns: listings, sent/received barter offers, sent/received messages, ratings, notifications, terms acceptance, and admin-moderation fields (`status`, `admin_notes`, `suspended_until`).
- **Listing** — an item posted for barter, with location data and status fields used by both the marketplace and admin moderation.
- **BarterOffer** — a transactional exchange between two users referencing two listings.
- **Message** — direct user-to-user communication tied to a barter offer or listing.
- **Rating** — post-trade feedback.
- **Notification** — push/email notification record consumed by the user app's notification provider.
- **Admin** — admin-panel user, distinct from `User`. Has `role: AdminRole` (`super_admin` | `moderator` | `support`).
- **AuditLog** — admin action history, used by the audit-logs view in the admin panel.
- **Report** — user-submitted reports of listings or users, queued in the admin panel.
- **AppSettings** — global admin-controlled settings (existing recent feature per commit `7183ebf`).

## Migration mechanics

- `pnpm --filter @barter/db generate` runs `prisma generate`, producing the client.
- `pnpm --filter @barter/db migrate dev` runs `prisma migrate dev` for local development.
- CI invokes `prisma generate` via Turborepo's `build` pipeline; `packages/db#build` is in `dependsOn: ["^build"]` for both apps so apps never build against a stale client (FR-016).
- Production migrations remain a manual `prisma migrate deploy` step invoked from CI on production deploys of the user app (only one app needs to drive migrations; convention: web app owns the deploy-migration step since it is the higher-traffic app).

## Constraints reaffirmed by this layout

- **One schema file** (SC-010): a `grep` for `model ` returns matches only inside `packages/db/prisma/schema.prisma`.
- **Atomic schema-to-app updates** (SC-004): a schema edit + `pnpm db:generate` makes the new types visible to both apps; no per-app schema files or per-app client regeneration is required.
- **Consistent reads/writes** (US4 acceptance scenario 2): both apps use the same client class compiled from the same schema, so an admin write is read back by the web app through identical types.

## No new entities

This refactor introduces no new tables, no new fields on existing tables, and no new relationships. If a future feature requires a schema change, that change goes through its own spec/plan cycle.

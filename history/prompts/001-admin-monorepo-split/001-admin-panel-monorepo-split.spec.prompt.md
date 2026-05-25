---
id: 001
title: Admin panel monorepo split spec
stage: spec
date: 2026-05-25
surface: agent
model: claude-opus-4-7
feature: 001-admin-monorepo-split
branch: 001-admin-monorepo-split
user: Solution tech
command: /sp.specify
labels: ["architecture","monorepo","admin","refactor","deployment","security"]
links:
  spec: specs/001-admin-monorepo-split/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-admin-monorepo-split/spec.md
  - specs/001-admin-monorepo-split/checklists/requirements.md
tests:
  - validation: 16 functional requirements mapped to acceptance scenarios across 6 prioritized user stories
  - validation: 10 measurable, technology-agnostic success criteria
  - validation: spec-quality checklist all items pass after Key Entities implementation-leak fix
---

## Prompt

hey claude i need to seperate out admin panel from the app as it is against the conventions to have an admin panel within the app. Suggest me what are the best possible options to have a seperate admin panel.

Follow-up: Go with option1 which meands therewould be a different deployement of admin panel synced with the main app

Follow-up: so what are your suggestions ?

User decisions captured via AskUserQuestion:
- Tooling: pnpm + Turborepo
- Domain strategy: subdomain (admin.<domain>)
- Workflow: run /sp.specify -> /sp.plan -> /sp.tasks

/sp.specify input:

Separate the admin panel from the main barter-app into a standalone Next.js application within a pnpm + Turborepo monorepo. Constraints and goals:

- Final layout: apps/web (existing user-facing barter app) and apps/admin (new admin panel). Shared code lives in packages/ (e.g., packages/db for Prisma schema + client, packages/types for shared TypeScript types, packages/ui for shared UI primitives if needed).
- Both apps connect to the SAME Postgres database. Prisma schema is the single source of truth and lives in packages/db. No schema drift between apps.
- Admin app deploys to a subdomain (admin.<domain>) as a separate Vercel project. User app keeps the apex/www domain.
- Admin authentication remains the existing JWT-based admin_token cookie system (lib/admin-auth.ts) with the super_admin / moderator / support RBAC roles. NextAuth stays exclusively in the user app. Cookies are domain-scoped so user sessions and admin sessions cannot collide.
- All current /admin pages (app/admin/*) and /api/admin routes (app/api/admin/*) move into apps/admin. The middleware.ts admin-protection block moves with them. NotificationProvider, TermsGate, and other user-app-only components stay in apps/web.
- Tooling: pnpm workspaces, Turborepo for build orchestration and caching, shared ESLint/TS config via packages/config.
- Migration must be incremental and safe: existing main branch must remain deployable at each step. No breakage of the live user app.
- Out of scope: changing admin features, changing the database schema, rewriting admin in a different framework, mobile apps.
- Non-goals: optimizing build times beyond Turborepo defaults, introducing a design system overhaul.

Success criteria:
- apps/web builds and deploys independently and serves the user app exactly as today.
- apps/admin builds and deploys independently to admin.<domain> with the existing admin login flow working end-to-end.
- Both apps read/write the same database through the shared packages/db Prisma client.
- A developer can run pnpm dev at the repo root and have both apps start on different ports.
- No duplication of Prisma schema, admin-auth logic, or shared types between apps.

## Response snapshot

Recommended monorepo (pnpm + Turborepo) over four alternatives (separate repo, admin framework adoption, route-group with separate deployment); user confirmed. Created branch `001-admin-monorepo-split`, scaffolded feature directory under `specs/`, wrote `spec.md` with 6 prioritized user stories (3xP1 deployment/hostname/session isolation, 3xP2 shared data layer, dev DX, incremental migration), 16 functional requirements, 4 key entities, 10 measurable technology-agnostic success criteria, edge cases, assumptions, and out-of-scope. Generated `checklists/requirements.md` and validated; one implementation-detail leak ("Next.js unit") found in Key Entities and fixed. Surfaced ADR suggestion for the architectural decision.

## Outcome

- ✅ Impact: spec.md ready as input to /sp.plan; architectural decision captured for ADR consideration
- 🧪 Tests: spec-quality checklist passes all items after edit; no [NEEDS CLARIFICATION] markers remain
- 📁 Files: specs/001-admin-monorepo-split/spec.md (created), specs/001-admin-monorepo-split/checklists/requirements.md (created)
- 🔁 Next prompts: `/sp.adr admin-panel-separation` (optional but recommended), then `/sp.plan` to produce implementation plan covering pnpm workspace layout, Turborepo pipeline, Prisma package extraction strategy, Vercel project configuration, and incremental migration order
- 🧠 Reflection: User input was unusually thorough — implementation details (pnpm/Turborepo/Vercel/Prisma) explicitly named upfront. Kept these out of the WHAT-level functional requirements and parked them in the Assumptions section so plan.md is the place where those choices get documented and rationalized.

## Evaluation notes (flywheel)

- Failure modes observed: PowerShell scaffold script tripped on `<` in feature description ("admin.<domain>"); branch and spec.md template were created, but `history/prompts/<feature>/` directory had to be created manually as a fallback. Future: strip angle-bracket placeholders before passing description to the scaffolder, or quote-escape.
- Graders run and results (PASS/FAIL): spec-quality checklist — PASS (all items, after Key Entities edit)
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): adopt expand-then-contract migration sequence in /sp.plan, starting with extracting Prisma to packages/db while admin still lives inside the existing app (lowest-risk first step).

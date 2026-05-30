---
id: 009
title: Extract @barter/ui component library
stage: green
date: 2026-05-30
surface: agent
model: claude-opus-4-8
feature: 001-admin-monorepo-split
branch: 006-extract-barter-ui
user: ShahzaibaslamIT
command: "start phase 2c"
labels: ["monorepo", "shadcn", "phase-2c", "barter-ui", "refactor"]
links:
  spec: specs/001-admin-monorepo-split/spec.md
  ticket: null
  adr: history/adr/0001-monorepo-topology-and-build-orchestration.md
  pr: null
files:
  - packages/ui/package.json (new)
  - packages/ui/tsconfig.json (new)
  - packages/ui/src/index.ts (new — barrel)
  - packages/ui/src/lib/utils.ts (new — cn)
  - packages/ui/src/*.tsx (52 components moved from apps/web/components/ui)
  - apps/web/package.json (+@barter/ui)
  - apps/web/next.config.mjs (transpilePackages += @barter/ui)
  - apps/web/** (31 files codemodded to @barter/ui)
  - apps/web/hooks/use-toast.ts, use-mobile.ts (deleted — dead)
  - specs/001-admin-monorepo-split/tasks.md (T030-T036)
tests:
  - "pnpm install — success (15s); @barter/ui linked, +2 -59 packages"
  - "pnpm turbo run build --filter=web... — 2/2 green"
  - "grep: zero @/components/ui or @/hooks/use-toast refs remain in apps/web; zero @/ refs in packages/ui"
  - "export-collision scan: only Toaster duplicated (sonner vs toaster) — aliased"
---

## Prompt

start phase 2c

## Response snapshot

Extracted the shadcn/ui kit into `@barter/ui` per ADR-0001.

- Created `packages/ui` with package.json (full runtime dep set the components
  actually import — 27 radix pkgs + cmdk/embla/recharts/vaul/etc.; react/next
  peers), tsconfig, `src/lib/utils.ts` (self-contained `cn`), and a barrel
  `src/index.ts`.
- `git mv` 52 files `apps/web/components/ui/*` → `packages/ui/src/` (per-file —
  a Windows dir-level lock blocked the whole-dir mv). Rewrote intra-package
  imports to relative.
- **Two correctness traps handled:**
  1. `Toaster` is exported by both `sonner.tsx` and `toaster.tsx` → blind
     `export *` would make it ambiguous (undefined at runtime, hidden by
     `typescript.ignoreBuildErrors`). Aliased sonner's to `SonnerToaster`.
  2. The toast store is a module-level singleton. Moving `toaster.tsx` into the
     package while app code kept importing `@/hooks/use-toast` would split the
     store across two instances → toasts silently never render. Funnelled all
     14 use-toast sites through `@barter/ui` so there is one instance; deleted
     the dead `apps/web/hooks/use-toast.ts` + `use-mobile.ts`.
- Added `@barter/ui` to `transpilePackages` (raw-TS package, same lesson as 2b).
- Build green (2/2). Committed `3f9da2d` on `006-extract-barter-ui`; pushed for
  Vercel preview. T036 (visual smoke-test) is the remaining gate before merge.

## Outcome

- ✅ Impact: UI kit owned once by `@barter/ui`; apps/web imports components from
  a single barrel. No intended behaviour change.
- 🧪 Tests: install + monorepo build green; import/collision greps clean.
- 📁 Files: ~90 changed (52 renames, 4 new, 2 deletions, 31 codemods + config).
- 🔁 Next prompts: preview visual smoke-test → merge → Phase 2d (@barter/types).
- 🧠 Reflection: `next build` with `ignoreBuildErrors:true` will NOT catch an
  ambiguous barrel export or a split React-context/store — these only surface
  at runtime, so the export-collision scan + the singleton funnel had to be done
  by reasoning, not by leaning on the build.

## Evaluation notes (flywheel)

- Failure modes observed: whole-dir `git mv` failed with EPERM (Windows lock) —
  fell back to per-file mv. Barrel generation initially self-referenced
  `./index` (redirect created the file before the glob ran) — stripped it.
- Graders run and results (PASS/FAIL): build PASS; import-grep PASS; collision-scan PASS (1 found + fixed).
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): for 2d, generate barrels excluding
  the target file from the glob up front to avoid the self-reference cleanup.

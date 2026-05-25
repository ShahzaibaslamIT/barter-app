---
id: 002
title: sp.adr blocked on missing plan.md
stage: misc
date: 2026-05-25
surface: agent
model: claude-opus-4-7
feature: 001-admin-monorepo-split
branch: 001-admin-monorepo-split
user: Solution tech
command: /sp.adr
labels: ["adr","workflow","prerequisites","blocked"]
links:
  spec: specs/001-admin-monorepo-split/spec.md
  ticket: null
  adr: null
  pr: null
files: []
tests:
  - validation: check-prerequisites.ps1 -Json returns non-zero with "plan.md not found"
---

## Prompt

/sp.adr

(No additional user input. Command invoked after /sp.specify completed, before /sp.plan.)

## Response snapshot

Ran `.specify/scripts/powershell/check-prerequisites.ps1 -Json` per Step 1 of the /sp.adr workflow. Script errored with exit code 1: "plan.md not found ... Run /sp.plan first to create the implementation plan." Per the command's ERROR HANDLING block, displayed the canonical error message and exited gracefully without creating any ADRs. Confirmed `history/adr/` directory does not exist and `specs/001-admin-monorepo-split/` contains only `spec.md` and `checklists/`.

Offered three paths to the user: (1) run /sp.plan first to enable the full ADR extraction, (2) write a Proposed-status ADR now from spec + conversation context and promote after planning, or (3) skip the ADR. Recommended option (1).

## Outcome

- ⚠️ Impact: ADR not yet created; architectural decision still captured only in spec.md Assumptions section
- 🧪 Tests: prerequisites script — FAIL (expected, given workflow order)
- 📁 Files: none created
- 🔁 Next prompts: /sp.plan to generate plan.md, then re-invoke /sp.adr — or, if user prefers, manually write a Proposed ADR now and revisit after planning
- 🧠 Reflection: The /sp.adr command treats plan.md as a hard prerequisite, which makes sense for the typical case (extracting clusters from a fully-articulated plan) but slightly mis-fits this specific situation where the central architectural decision was made *before* the spec was written. Following the command's literal contract is the safe choice — it avoids producing an ADR that conflicts with decisions plan.md will introduce.

## Evaluation notes (flywheel)

- Failure modes observed: none — the workflow correctly gated on a missing prerequisite.
- Graders run and results (PASS/FAIL): prereq check — FAIL by design; command error-handling — PASS (followed spec).
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): proceed to /sp.plan; this will most likely surface additional ADR-worthy clusters (Prisma extraction strategy, middleware split, deploy ordering) that can all be captured in one /sp.adr pass.

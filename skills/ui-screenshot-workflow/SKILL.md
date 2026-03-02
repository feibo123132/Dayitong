---
name: ui-screenshot-workflow
description: Execute screenshot-driven UI changes for this repository. Use when the user provides local screenshot files (for example in `_shots`) and asks to replicate, adjust, or compare visual and interaction details on specific pages. Apply targeted UI edits, preserve simplified Chinese text quality, and validate changes with type-check/build.
---

# UI Screenshot Workflow

## Overview
Use this skill to implement UI updates from screenshots with predictable quality and low regression risk.

## Required Inputs
Confirm these inputs before editing:
- Screenshot path(s): absolute local paths
- Target route/page: exact route to modify
- Desired result: what must match the reference screenshot
- Scope boundaries: what must not be changed

## Execution Steps
1. Open every referenced screenshot.
2. Extract concrete deltas: spacing, alignment, hierarchy, colors, icons, labels, states, and interactions.
3. Map deltas to exact files/components before editing.
4. Implement minimal edits in existing files; avoid unrelated refactors.
5. Preserve existing routing and state behavior unless explicitly requested.
6. Validate with `pnpm exec tsc -b --pretty false` and run `pnpm build` when appropriate.
7. Report changed files, behavior changes, and verification results.

## UI Rules
- Keep simplified Chinese text readable and consistent; avoid garbled characters.
- Preserve mobile-first behavior and verify desktop visibility for fixed/floating elements.
- Use clear list grouping: section spacing, separators, and trailing chevrons when navigation is implied.
- Prevent unintended event bubbling for nested click targets.

## Safety Checks
Before final response, verify:
- No accidental global text replacement occurred.
- The implemented result matches the screenshot intent.
- No compile/type errors remain.
- Changes stay inside requested scope.

## Response Template
Use this structure:
1. One-sentence outcome summary.
2. Files changed.
3. Implemented behavior/visual updates.
4. Verification commands and results.
5. Optional next iteration options.

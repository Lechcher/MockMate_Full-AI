## Context

`biome check .` (Biome 2.5.1) reports 17 errors and 69 warnings and 5 infos across 30 files after `fix-biome-lint-safe-autofixes` ran. The forces pushing for this change:

- **CI-blocking errors**: 17 errors block `biome check .` from exiting 0.
- **Call-site judgment**: every remaining diagnostic is fixable without Biome's `--unsafe` flag and without changing source behavior.
- **Inconsistent rule application**: a single rule appears across many files with a single root cause per occurrence.

## Goals / Non-Goals

**Goals:**
- Bring every rule outside `src/lib/sanity/schemas/**` and `assets/**` SVG-only diagnostic count to zero for the residuals in scope.
- Resolve the two SVG accessibility errors by adding `<title>` metadata rather than muting the rule.
- Preserve all source-code behavior; settlements are syntax / import / list-key / dep-array edits only.

**Non-Goals:**
- Do not touch `src/lib/sanity/schemas/**` lint errors — covered by a follow-up change (`biome-overrides-for-schema-any` or `tighten-sanity-schema-types`).
- Do not modify `biome.json` in this change.
- Do not fix the pre-existing TypeScript errors in `src/stores/gamificationStore.ts` and `src/stores/interviewStore.ts` — those are out of Biome's scope and warrant a separate change.

## Decisions

**Decision: Group fix tasks by rule, ordered lowest-risk → highest-risk.**
- *Rationale:* Resume a "stabilize" → "judge" gradient. Unused-import chains are pure deletions; effect-deps require reading actual usage semantics; SVG title-edits are one-line. Each group is independently testable.
- *Alternative considered:* Bucket-by-file order. Rejected: violates rule semantics and makes the diff harder to review.

**Decision: Add `<title>` to the two SVG assets rather than ignore them via `biome.json`.**
- *Rationale:* Accessibility fix is cheap; an `--ignore` would silence lint without fixing the user-facing problem.
- *Alternative considered:* Extend `biome.json`'s `assets/**` ignore list. Rejected — the change is two literal lines, no config drift.

**Decision: For `useExhaustiveDependencies`, prefer "add deps" over "extract effect".**
- *Rationale:* Schemas also store functions; small dep lists in `useEffect([…, n])` are the universal React pattern. Extracting effects creates new symbols per fix.
- *Alternative considered:* Custom-hook extraction. Rejected — fragmenting focused fixes.

**Decision: Don't run `npx tsc --noEmit` between rule-groups.**
- *Rationale:* Pre-existing TS errors are documented and isolated. Re-typescript between passes adds runtime with no signal in scope.
- *Alternative considered:* Run `tsc` after every file. Rejected — TS errors live in store bodies, not in files the lint change touches.

## Risks / Trade-offs

- **[Risk]** A `useExhaustiveDependencies` fix reintroduces an infinite re-render by including reactive deps.
  - **Mitigation:** Each fix follows the React docs pattern of "add to deps array as-is". Visual smoke test for `interview/results.tsx` and `voice.tsx` post-fix.
- **[Risk]** Removing an unused-import breaks a re-export contract.
  - **Mitigation:** Cross-check `index.ts` / barrel patterns before each deletion. None expected — most files are leaf components.
- **[Risk]** Adding `<title>` to SVG distorts rendering if title positional ordering matters.
  - **Mitigation:** `<title>` is a non-rendering child element in SVG. It's safe to insert at top.
- **[Risk]** A `key={i}` rewrites to a stable id, but the array is filtered/sorted at use site and breaks order assumptions.
  - **Mitigation:** Read the data source and confirm each array iteration site is already stable before renaming keys.

## Migration Plan

Standard git flow:
1. Land changes per rule-group via direct file edits (no autofix batch).
2. Run `npx @biomejs/biome@2.5.1 check . --reporter=summary --max-diagnostics=1000` after each group; require that rule's count to drop to zero.
3. Final re-check sums compared to baseline `baseline.txt` from `fix-biome-lint-safe-autofixes`.
4. No rollback needed beyond `git revert`.

## Open Questions

- Do the two SVG `<title>` additions need a specific text or is "Logo" / "Flame icon" acceptable? Default to descriptive strings inferred from filename; safe to revise.

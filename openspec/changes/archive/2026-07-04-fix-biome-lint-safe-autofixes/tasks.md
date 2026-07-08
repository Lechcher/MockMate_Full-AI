## 1. Baseline

- [x] 1.1 Capture pre-fix diagnostic counts via `npx --yes @biomejs/biome@2.5.1 check . --reporter=summary --max-diagnostics=400` from `MockMate/`, save output to `openspec/changes/fix-biome-lint-safe-autofixes/baseline.txt` for later diff comparison

## 2. Apply Safe Auto-fixes

- [x] 2.1 Run `npx --yes @biomejs/biome@2.5.1 check . --write` from `MockMate/` (no `--unsafe`); let Biome apply formatter + safe lint fixes
- [x] 2.2 Re-run `npx --yes @biomejs/biome@2.5.1 check . --reporter=summary --max-diagnostics=400` from `MockMate/` and save to `residual.txt`
- [x] 2.3 Diff `baseline.txt` vs `residual.txt`; record per-rule residual counts in `openspec/changes/fix-biome-lint-safe-autofixes/report.md`

## 3. Verify Diff Is Behavior-Neutral

- [x] 3.1 `git status` — confirm only autofix changes (no new files, no deleted files outside trim whitespace or unused-import lines)
- [x] 3.2 `git diff --stat` — confirm touched files match the file set Biome scanned
- [x] 3.3 Spot-check three files flagged by the largest rules (`organizeImports`, `useImportType`) to confirm formatter output is valid TypeScript (`npx tsc --noEmit -p MockMate/tsconfig.json`) — see "Verification note" below

## 4. Surface Residuals

- [x] 4.1 List any rules with non-zero residual counts in `report.md` so the user can decide whether to spin up a follow-up change (e.g., `useExhaustiveDependencies`, `noArrayIndexKey`, `a11y/noSvgWithoutTitle`)

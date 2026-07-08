## Why

The prior change `fix-biome-lint-safe-autofixes` ran `biome check . --write` (no `--unsafe`) and eliminated 150 of 241 diagnostics. 91 remain across 30 files. Most are call-site fixes that Biome cannot auto-apply. The 51 low-risk residuals (everything except `noExplicitAny` × 40 inside Sanity schema files) are in scope here. The Schemas bucket is excluded and tracked for a follow-up change because Sanity `defineField` generics legitimately need `any` in spots where narrowing has no clean type path.

## What Changes

Resolve the 51 call-site lint diagnostics that `biome check . --write` could not auto-fix, outside the Sanity schemas directory:

- `lint/correctness/noUnusedImports` × 25 — delete unused imports across 19 files
- `lint/correctness/useExhaustiveDependencies` × 9 — correct effect deps in interview screens, `VIPContext`, `RequireAuth`, `Skeleton`, `vip`
- `lint/suspicious/noArrayIndexKey` × 5 — replace `key={i}` with stable ids in `results.tsx`, `mode.tsx`, `vip.tsx`
- `lint/a11y/noSvgWithoutTitle` × 2 — add `<title>` to the two SVG assets
- `lint/correctness/noUnusedVariables` × 3 — drop unused locals in `welcome.tsx`, `voice.tsx`
- `lint/complexity/useLiteralKeys` × 4 — bracket → dot in `vip.tsx`, `VIPContext.tsx`
- `lint/complexity/useOptionalChain` × 1, `noUselessCatch` × 1, `style/useHookAtTopLevel` × 1 — single-file trivial fixes

Behavior remains unchanged. No dependency, no config changes.

## Capabilities

### New Capabilities

- `biome-residual-fixes`: Tracks individual rule-level residual outcomes against the original Biome 2.5.1 baseline. The end-state rule is: a representative subset of the residual counters reaches zero (or scoped override count is documented) for each rule outside the Schemas exclude path.

### Modified Capabilities

- `biome-lint-conformance` (existing): no requirement changes. This change extends compliance in practice but does not amend the rule phrasing.

## Impact

- Affected files: 28 source files (see `tasks.md` "Files Touched" table) + 2 SVG assets
- Behavior: none, all fixes are mechanical lint corrections or comment additions to SVG metadata
- Tooling: none
- Follow-ups: Schemas `noExplicitAny` × 40 left for a separate scoped change once this lands

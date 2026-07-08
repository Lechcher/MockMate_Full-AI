## Why

Biome 2.5.1 reports 144 errors, 91 warnings, and 6 infos across 84 files in `MockMate/`. The bulk are mechanical rule violations — unsorted imports, mixed import-type usages, unused symbols — fixable by Biome's safe autofixes. Stakeholders asked: make `biome check .` pass without manual touch-ups at every call site.

## What Changes

- Run `npx @biomejs/biome@2.5.1 check . --write` from `MockMate/` to apply Biome's safe fixes (formatter + safe lint fixes) to all 84 scanned files.
- Capture the resulting diagnostic state in a new `biome-lint-conformance` capability and rule out regressions via the documented check command.

No source code behavior changes. No dependency changes (`@biomejs/biome` is invoked via `npx` and is not added to `package.json` in this change). No breaking changes.

## Capabilities

### New Capabilities

- `biome-lint-conformance`: States that source files under `MockMate/` conform to the rules configured in `MockMate/biome.json` and that `npx @biomejs/biome@2.5.1 check .` exits without errors.

### Modified Capabilities

- None. Existing capabilities cover bundler resolution, import paths, and styling; lint conformance is orthogonal.

## Impact

- Affected files: all 84 files scanned by Biome (source, schemas, generated types, config).
- Behavior: none. Diff is style/import-order/unused-symbols only.
- Tooling: none added. `npx @biomejs/biome@2.5.1` resolves on-demand.
- `MockMate/biome.json` unchanged.

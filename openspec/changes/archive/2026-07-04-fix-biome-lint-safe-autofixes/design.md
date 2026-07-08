## Context

`MockMate/` ships with a Biome config (`biome.json` pinned to schema `2.5.1`) that drives both formatter and linter. The repo currently has no installation of `@biomejs/biome` in `MockMate/package.json`; the binary resolves on demand via `npx`. A full `biome check .` against 84 files surfaces 144 errors / 91 warnings / 6 infos. The dominant rule violations are mechanical and are exactly the rules Biome can auto-fix:

- `assist/source/organizeImports` — 47 errors
- `lint/suspicious/noExplicitAny` — 40 warnings (require review)
- `lint/style/useImportType` — 21 warnings
- `lint/correctness/noUnusedImports` — 25 warnings

## Goals / Non-Goals

**Goals:**
- Drive the diagnostic count to zero (or close to it) using only Biome's safe autofixes (`biome check . --write` without `--unsafe`).
- Establish the rule that future pushes must pass `biome check .` clean.
- No source-code behavior change.

**Non-Goals:**
- No manual surgery on individual files. Anything Biome cannot fix stays fixed-or-excluded in a follow-up if it surfaces.
- No `biome.json` change. Configuration drift is its own change.
- No introduction of `@biomejs/biome` as a `package.json` dependency in this change (out of scope; user can request later).

## Decisions

**Decision: Run `biome check . --write` (no `--unsafe`).**
- *Rationale:* User asked for safe auto-fix only. Biome's `--unsafe` flag enables fixes the maintainers mark as risk-bearing (e.g., `noExplicitAny` suppression, certain cast rewrites). Skipping `--unsafe` keeps the diff conservative.
- *Alternative considered:* `--write --unsafe`. Rejected — violates user constraint and risks semantic drift on type-assertion paths.

**Decision: Use `npx --yes @biomejs/biome@2.5.1` (version-pinned).**
- *Rationale:* Schema in `biome.json` references `https://biomejs.dev/schemas/2.5.1/schema.json`. Pinning the runtime matches the schema and avoids silent rule-set drift if a future major is released.
- *Alternative considered:* Use whatever `npx @biomejs/biome` resolves to. Rejected — schema/runtime mismatch would silently apply different rules.

**Decision: Re-check after `--write` and report residual diagnostics.**
- *Rationale:* The user's prompt says "fix for me", not "suppress for me". Surfaces the rules Biome cannot auto-fix (e.g., `useExhaustiveDependencies`, `noArrayIndexKey`, `noSvgWithoutTitle`) so they can be addressed in a follow-up change.

## Risks / Trade-offs

- **[Risk]** A `noExplicitAny` (40) or another rule is fixable by Biome only via `--unsafe`, and the residual count is still high after safe auto-fix.
  - **Mitigation:** Report per-rule residual counts. Add a follow-up OpenSpec change scoped to whatever rules remain. Do not pile more changes into this one.
- **[Risk]** Some files are auto-generated (`uniwind-types.d.ts`) and Biome flags them anyway.
  - **Mitigation:** Confirm via the post-check report whether generated files belong in the scan; if not, add `Ignore` entries to `biome.json` in a follow-up. Don't touch `biome.json` here.
- **[Risk]** Safe fixes include formatter changes that may not match conventions (e.g., quote style, indent).
  - **Mitigation:** `MockMate/biome.json` already pins `indentStyle: tab` and `quoteStyle: double`. Safe fixes align with the config.

## Migration Plan

Single-step: run the command, commit the resulting diff. No rollback mechanism needed beyond `git checkout .`. If the user wants to revert, that is a single `git revert`/`reset --hard`.

## Open Questions

- Should `@biomejs/biome@2.5.1` be added to `MockMate/package.json` as a devDependency? Currently it only resolves via `npx`. If yes, scope as a follow-up change (separate concern).

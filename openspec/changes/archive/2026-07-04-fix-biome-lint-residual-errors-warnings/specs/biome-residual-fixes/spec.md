## ADDED Requirements

### Requirement: No Residual Biome Diagnostics Outside Excluded Paths
The system SHALL ensure that running `npx --yes @biomejs/biome@2.5.1 check .` from `MockMate/` reports zero diagnostics for every rule outside the explicit exclude list (currently `src/lib/sanity/schemas/**` for `noExplicitAny`). For every other rule listed in this change's scope, the post-fix count SHALL be zero for `error`-level diagnostics, and zero for `warning`/`info`-level diagnostics unless intentionally tolerated.

#### Scenario: All in-scope lint rules report zero
- **WHEN** an integrator runs `npx --yes @biomejs/biome@2.5.1 check .` from `MockMate/` after landing this change
- **THEN** each of the rules listed in `tasks.md` "Rules Targeted" table reports a count equal to its pre-change residual minus N (where N is the rule's full in-scope occurrence count)

#### Scenario: Schematic validation holds
- **WHEN** an integrator inspects the diff from this change
- **THEN** the only schema-directory files left untouched are `src/lib/sanity/schemas/**`, with no edits required there for any residual to clear

### Requirement: Two Specific SVG Assets Include a Title Element
The system SHALL ensure that `MockMate/assets/expo.icon/Assets/expo-symbol 2.svg` and `MockMate/assets/icons/Fire.svg` each contain a `<title>` child element as the first non-display child of the root `<svg>` element.

#### Scenario: Title element present in each target SVG
- **WHEN** inspecting either target SVG with a XML-aware reader
- **THEN** the document contains at least one `<title>` element with descriptive text inferred from filename defaults

### Requirement: Pre-existing TypeScript Errors Are Not Addressed
The system SHALL NOT, as part of this change, attempt to resolve `npx tsc --noEmit` errors in `src/stores/gamificationStore.ts` or `src/stores/interviewStore.ts`. Those errors are out of scope and SHALL be tracked under a separate change.

#### Scenario: Scope explicitly excludes TS errors
- **WHEN** an integrator runs `tsc --noEmit` after this change is applied
- **THEN** the same set of pre-existing TypeScript diagnostics remain (parity check; this change's diff does not introduce or remove any of them)

# Lib Import Paths

## ADDED Requirements

### Requirement: Sanity client imports use the file-direct path

Source files under `src/app/` and `src/hooks/` SHALL import the Sanity client via the explicit `lib/sanity/client` file path, matching the convention established by the rest of the codebase. Directory imports via `lib/sanity` SHALL NOT be used unless an `index.ts` barrel exists at that path.

#### Scenario: All screen-level imports of sanityClient resolve
- **WHEN** `npx expo export --platform android` (or `expo start`) is invoked
- **THEN** Metro completes bundling with no `Unable to resolve module .../lib/sanity` error
- **AND** `results.tsx`, `vip.tsx`, and any other source file SHALL resolve `sanityClient` to `src/lib/sanity/client.ts`.

#### Scenario: Directory imports have a real resolution target
- **WHEN** any source file imports from a directory style path (e.g. `'../lib/sanity'`)
- **THEN** that directory SHALL contain either an `index.ts` (or matching extension) barrel, OR no source file SHALL use the directory-style form.

## ADDED Requirements

### Requirement: Source Tree Conforms to Biome Config
The system SHALL ensure all files under `MockMate/` that are scanned by Biome conform to the rules configured in `MockMate/biome.json`. The mandatory check command is `npx --yes @biomejs/biome@2.5.1 check .` run from `MockMate/`, and it SHALL exit with code 0 (no errors, warnings, or infos).

#### Scenario: Biome check exits clean
- **WHEN** an integrator runs `npx --yes @biomejs/biome@2.5.1 check .` from `MockMate/`
- **THEN** the command exits with code 0 and prints no diagnostics

#### Scenario: Auto-fix yields a reviewable diff
- **WHEN** an integrator runs `npx --yes @biomejs/biome@2.5.1 check . --write` from `MockMate/` against a non-conforming tree
- **THEN** Biome modifies only files flagged by safe fixes (formatter + safe lint fixes), the resulting diff is committed via standard git flow, and no source-code behavior changes

# readme-fidelity Specification

## Purpose
TBD - created by archiving change cleanup-leftovers. Update Purpose after archive.
## Requirements
### Requirement: Auth Backend Documentation Match
Both READMEs MUST state that authentication is provided by Appwrite (Google OAuth via `react-native-appwrite`), NOT by Clerk or Auth0. Any mention of Clerk or Auth0 in prose MUST be limited to a tombstone note pointing at prior commits.

#### Scenario: New contributor reads root README
- **WHEN** a new contributor clones the repo and reads `README.md`
- **THEN** the auth row in the stack table shows Appwrite
- **AND** troubleshooting shows Appwrite setup
- **AND** any Clerk or Auth0 mention is clearly marked as historical

#### Scenario: New contributor reads MockMate/README.md if present
- **WHEN** a contributor reads the quick-start and troubleshooting sections
- **THEN** the Appwrite framing appears
- **AND** no `EXPO_PUBLIC_AUTH0_*` env-var snippets are present

### Requirement: Expo Go Compatibility Statement
Both READMEs MUST state that MockMate runs in Expo Go (no custom development-client build required). The earlier "Auth0 requires a development client" warning MUST be removed.

#### Scenario: First-time setup
- **WHEN** a contributor follows the README quick-start
- **THEN** the preconditions describe Expo Go as the supported path
- **AND** no "build dev-client first" warning appears

### Requirement: No Misleading Architecture Diagrams
README tree diagrams MUST match the on-disk `src/` layout. Names of files actually present in the repo may be referenced; names referring to deleted providers (Clerk, Auth0) MUST NOT appear as if they exist in `src/`.

#### Scenario: Diff between README tree and `git ls-tree`
- **WHEN** a contributor renders the README tree next to `git ls-tree -r --name-only HEAD | grep "^MockMate/src/"`
- **THEN** every file referenced by the README tree is present in the tree on disk
- **AND** no Clerk- or Auth0-named file is listed in the README but missing from disk


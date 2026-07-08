## ADDED Requirements

### Requirement: Typed Error When Auth0 TurboModule Is Unregistered
The system SHALL throw a custom error named `Auth0NativeModuleMissingError` instead of the framework's generic `Invariant Violation` when the `A0Auth0` TurboModule is referenced from production code but is not registered with the native runtime. The error message SHALL name the missing module (`A0Auth0`), state the package that must be rebuilt (`react-native-auth0`), and include the exact recovery command(s) (`npx expo prebuild --clean` followed by `npx expo run:<platform>`).

#### Scenario: Stale dev client surfaces a readable error
- **WHEN** an integrator cold-starts the app using a dev client whose native binary was built before `react-native-auth0` was autolinked
- **THEN** the system throws `Auth0NativeModuleMissingError` whose `message` contains the strings `"A0Auth0"`, `"react-native-auth0"`, `"expo prebuild --clean"`, and `"expo run"`. The original `Invariant Violation` text SHALL be present on `error.cause` for diagnostics.

#### Scenario: Auth0-cautious environments do not throw
- **WHEN** `process.env.NODE_ENV === 'test'` OR the `@react-native/jest-preset` environment is detected
- **THEN** the guard SHALL be a no-op and not throw, regardless of TurboModule availability

#### Scenario: Other code paths continue to function
- **WHEN** the `A0Auth0` TurboModule IS registered (rebuilt dev client)
- **THEN** the guard does not execute any side effects and `useAuth()` behaves exactly as before this change

### Requirement: Native Build Static Check Exits Non-Zero On Drift
The system SHALL provide `scripts/check-native-modules.ts`, executable as `npm run check:native`, that exits with code `1` and writes a one-line, action-oriented diagnostic to stderr when `package.json` lists a native package (via `node_modules/<pkg>/package.json`) whose name string does not appear in:
- the top-level grep targets of `android/settings.gradle` for Android packages, or
- the resolved package list of `ios/Podfile.lock` for iOS packages.

If neither Android nor iOS native directories exist (web-only or pre-prebuild), the script SHALL exit `0` after reporting "no native project detected".

#### Scenario: Drift detected on Android
- **GIVEN** `react-native-auth0` is installed in `node_modules` AND `app.json` plugins list `"react-native-auth0"` AND `android/settings.gradle` does not reference it
- **WHEN** `npm run check:native` is run from the `MockMate/` workspace
- **THEN** exit code is `1` and stderr contains the strings `"react-native-auth0"`, `"android/settings.gradle"`, and one of `"rebuild"` or `"run:"`

#### Scenario: Drift detected on iOS
- **GIVEN** `react-native-auth0` is installed in `node_modules` AND `ios/Podfile.lock` does not reference it
- **WHEN** `npm run check:native` is run
- **THEN** exit code is `1` and the diagnostic mentions `"ios"`, `"Podfile.lock"`, and the recovery steps

#### Scenario: No drift
- **GIVEN** all native directories either do not exist or contain the expected package references
- **WHEN** `npm run check:native` is run
- **THEN** exit code is `0` and stdout reports `"OK: <count> native modules match"`

### Requirement: Operator-Facing Rebuild Procedure
A document at `docs/AUTH0_NATIVE_REBUILD.md` SHALL document the rebuild procedure in a single short page. The document MUST be reachable from both `MockMate/AGENTS.md` and the project-root `AGENTS.md` via a relative link under the Auth0 section.

#### Scenario: First-time operator follows the doc
- **WHEN** an operator encounters the `Auth0NativeModuleMissingError` message for the first time
- **THEN** following the link in either AGENTS.md leads to a page whose `## Rebuild steps` heading is reachable in one H2 jump from the file top

#### Scenario: Doc remains accurate
- **WHEN** the operator runs the listed commands verbatim with default `MockMate/` prefix
- **THEN** the operation succeeds without editing additional files beyond those in this change's diff

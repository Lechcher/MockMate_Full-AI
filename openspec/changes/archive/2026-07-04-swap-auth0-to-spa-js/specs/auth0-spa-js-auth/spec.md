## ADDED Requirements

### Requirement: Pure-JS Auth0 Client

The system MUST authenticate with Auth0 using `@auth0/auth0-spa-js` exclusively on the JS side. There MUST NOT be any synchronous native-module lookup at the import of the auth module.

#### Scenario: App launches in Expo Go
- **WHEN** the JS bundle evaluates `src/hooks/useAuth.ts`
- **THEN** no `'A0Auth0' could not be found` invariant violation occurs

#### Scenario: First interactive login
- **WHEN** a user taps the login button on the welcome screen
- **THEN** `useAuth().login()` opens a system browser, completes Google consent, closes back to `mockmate://callback`, and `useAuth().user` becomes a non-null `Auth0User`

### Requirement: Public Hook Surface Preservation

`useAuth()` MUST continue to expose the shape `{ user, isLoading, error, login, logout, getAccessToken }` so existing consumers (`RequireAuth`, `verifyToken`, `useAuthSync`) require no changes.

#### Scenario: Reading user on protected route
- **WHEN** a route is wrapped in `RequireAuth`
- **THEN** the component receives a `user` instance as today

### Requirement: Secure Token Storage

The system MUST persist `code_verifier` and refresh tokens via an `expo-secure-store`-backed storage shim that conforms to the `WebStorage` interface (sync-callable with `.then`-based reads + write-queue buffered on the sync call path).

#### Scenario: Cold restart
- **WHEN** the app is terminated and relaunched within the refresh-token window
- **THEN** silent `getTokenSilently` succeeds with no interactive login

#### Scenario: iOS device or simulator
- **WHEN** tokens are stored
- **THEN** they live in the iOS Keychain (or simulator Keychain)

#### Scenario: Android device or emulator
- **WHEN** tokens are stored
- **THEN** they live in hardware-backed storage when available

### Requirement: Silent Refresh on Foreground

When the app returns to foreground from a background state older than 60 seconds, the system MUST call `getTokenSilently({ ignoreCache: true })` to refresh the access token.

#### Scenario: App resumes from background
- **WHEN** `AppState` transitions `background -> active` after >60s
- **THEN** the access token is renewed without user interaction when the session is still valid

### Requirement: Dev Bypass Short-Circuit

When `EXPO_PUBLIC_DEV_AUTH_BYPASS === "true"`, the auth module MUST return a synthetic `Auth0User` and skip any round-trip. The bypass MUST be the only code path that does not call `createAuth0Client`.

#### Scenario: Dev bypass on
- **WHEN** the env flag is `"true"` on app start
- **THEN** `useAuth().user` is a synthetic user, `isLoading` is `false`, and no Auth0 client is constructed

### Requirement: Cleanup on Unmount

The `useAuth`-level listener MUST remove the `AppState` subscription on unmount and on provider tear-down to avoid leaks across hot reloads and Fast Refresh.

#### Scenario: Provider unmount
- **WHEN** the auth provider is removed from the tree
- **THEN** the `AppState` change listener is removed

### Requirement: Config Plugin Removal

`MockMate/app.json` MUST NOT contain a `"react-native-auth0"` entry under `plugins`. The `expo-web-browser` and `expo-dev-client` plugins remain.

#### Scenario: Prebuild dry-run
- **WHEN** `expo prebuild --no-install` runs
- **THEN** no `react-native-auth0` native iOS / Android files are generated

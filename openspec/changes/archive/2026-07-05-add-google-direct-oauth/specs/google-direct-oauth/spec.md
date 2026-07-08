## ADDED Requirements

### Requirement: Google Authorization Code + PKCE

The system MUST authenticate with Google via Authorization Code Grant Flow + PKCE using `expo-auth-session`. There MUST NOT be any synchronous native module lookup at the import of the auth module.

#### Scenario: App launches in Expo Go
- **WHEN** the JS bundle evaluates `src/hooks/useAuth.ts`
- **THEN** no `'A0Auth0' could not be found` invariant violation occurs and no missing native module triggers a crash

#### Scenario: First interactive login
- **WHEN** a user taps the login button on the welcome screen
- **THEN** `useAuth().login()` opens a system browser, completes Google consent, closes back to `mockmate://`, and `useAuth().user` becomes a non-null `Auth0User`-shaped value

### Requirement: Public Hook Surface Preservation

`useAuth()` MUST continue to expose the shape `{ user, isLoading, error, login, logout, getAccessToken }` so existing consumers (`RequireAuth`, `verifyToken`, `useAuthSync`) require no functional changes.

#### Scenario: Reading user on protected route
- **WHEN** a route is wrapped in `RequireAuth`
- **THEN** the component receives a `user` instance as today

### Requirement: Secure Token Storage

The system MUST persist `access_token`, `refresh_token`, and `id_token` via `expo-secure-store`. Reads MAY be buffered in an in-memory cache mirrors of the most recent value to allow sync-style initial read at app start, but the source of truth at rest MUST be `expo-secure-store`.

#### Scenario: Cold restart
- **WHEN** the app is terminated and relaunched within the refresh-token window
- **THEN** silent rehydration of the session succeeds with no interactive login

#### Scenario: iOS device or simulator
- **WHEN** tokens are stored
- **THEN** they live in the iOS Keychain (or simulator Keychain)

#### Scenario: Android device or emulator
- **WHEN** tokens are stored
- **THEN** they live in hardware-backed storage when available

### Requirement: Silent Refresh on Foreground

When the app returns to foreground from a background state older than 60 seconds, the system MUST refresh the access token using the stored refresh token silently (no interactive consent).

#### Scenario: App resumes from background after >60s
- **WHEN** `AppState` transitions `background -> active` after >60s
- **THEN** the access token is renewed without user interaction when a refresh token is available

### Requirement: Dev Bypass Short-Circuit

When `EXPO_PUBLIC_DEV_AUTH_BYPASS === "true"`, the auth module MUST return a synthetic `Auth0User` and skip any Google round-trip. The bypass MUST be the only code path that does not call `expo-auth-session` or fetch Google token endpoints.

#### Scenario: Dev bypass on
- **WHEN** the env flag is `"true"` on app start
- **THEN** `useAuth().user` is a synthetic user, `isLoading` is `false`, and no Google network call is dispatched

### Requirement: Cleanup on Unmount

The `useAuth`-level listener MUST remove the `AppState` subscription on unmount and on provider tear-down to avoid leaks across hot reloads and Fast Refresh.

#### Scenario: Provider unmount
- **WHEN** the auth provider is removed from the tree
- **THEN** the `AppState` change listener is removed

### Requirement: Config Plugin Removal

`MockMate/app.json` MUST NOT contain a `"react-native-auth0"` entry under `plugins`. The `expo-web-browser`, `expo-dev-client`, and `scheme: "mockmate"` remain.

#### Scenario: Prebuild dry-run
- **WHEN** `expo prebuild --no-install` runs
- **THEN** no `react-native-auth0` native iOS / Android files are generated

### Requirement: Cap Removed

`app.json` MUST NOT include any entry whose purpose is the Auth0 SDK lifecycle; caps-specific config (RN configuration plugin, native schema overrides) MUST NOT be required for Auth0 (the Auth0 native SDK is gone).

#### Scenario: App startup on Expo Go
- **WHEN** the app is launched in Expo Go
- **THEN** the auth module imports and the welcome screen renders a login button with no native-module finding errors

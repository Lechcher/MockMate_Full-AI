# Capability: appwrite-auth

User authentication and session lifecycle managed by Appwrite (`react-native-appwrite`), exposed through the same `useAuth()` bridge hook so no consumer imports Appwrite directly. Google OAuth login, token issuance, and session persistence work entirely in Expo Go — no custom dev-client requirement.

## Purpose

Define the Appwrite-backed authentication contract for MockMate:
- A stateless `Client` singleton initialized from env (`EXPO_PUBLIC_APPWRITE_ENDPOINT`, `EXPO_PUBLIC_APPWRITE_PROJECT_ID`).
- Google OAuth login via `account.createOAuth2Token` + `openAuthSessionAsync`.
- Bridge hook `useAuth()` returning `{ user, isLoading, error, login, logout, getAccessToken }` — consumers unchanged.
- Server-side JWT verification via Appwrite HMAC secret.
- Dev bypass short-circuit preserved.

## Requirements

### Requirement: Appwrite Client Initialization

The system SHALL initialize a single `Client` from `react-native-appwrite` at module load time, configured with `EXPO_PUBLIC_APPWRITE_ENDPOINT` and `EXPO_PUBLIC_APPWRITE_PROJECT_ID`. The client SHALL be used to create an `Account` service instance. Both the `Client` and the `Account` singleton SHALL be constructed exactly once at module load; hydration (`getCurrentUser`) and the OAuth login flow SHALL reuse the same singletons — no per-call `new Client()` / `new Account({ client })`. If either env var is missing and `EXPO_PUBLIC_DEV_AUTH_BYPASS` is not `"true"`, the system SHALL throw a descriptive error on first access.

#### Scenario: App launches with valid env
- **WHEN** the JS bundle evaluates and appwrite module is imported
- **THEN** a configured `Client` and `Account` singleton exist and are ready for `getCurrentUser()` calls

#### Scenario: Missing env in production
- **WHEN** `EXPO_PUBLIC_APPWRITE_ENDPOINT` or `EXPO_PUBLIC_APPWRITE_PROJECT_ID` is unset and `EXPO_PUBLIC_DEV_AUTH_BYPASS` is not `"true"`
- **THEN** the system SHALL throw an error message identifying which env var is missing

#### Scenario: Repeated hydration call
- **WHEN** layout re-renders and `getCurrentUser` is called twice in the same process
- **THEN** both calls route through the same singleton `Client`; no duplicate clients are constructed.

### Requirement: Google OAuth Login via Appwrite

The system SHALL expose `useAuth().login()` that performs Google OAuth login through Appwrite's OAuth2 flow without any Clerk or native module:

1. Create an OAuth2 token (`account.createOAuth2Token({ provider: OAuthProvider.Google, success: Linking.createURL("/") })`).
2. Open the resulting URL in a system browser via `openAuthSessionAsync` from `expo-web-browser`.
3. Parse `secret` and `userId` from the callback URL.
4. Create an Appwrite session (`account.createSession({ userId, secret })`).
5. Set `useAuth().user` to the result of `getCurrentUser()`.

#### Scenario: Successful first login
- **WHEN** user taps "Continue with Google" on `(auth)/welcome.tsx`
- **THEN** the system opens a browser sheet, user completes Google consent, the app receives the callback, a session is created, and `useAuth().user` is non-null within the same async flow

#### Scenario: User cancels browser authentication
- **WHEN** user dismisses the Google auth browser without completing consent
- **THEN** `openAuthSessionAsync` returns `{ type: "cancel" | "dismiss" }`, login promise resolves `false`, `useAuth().user` stays `null`, and `useAuth().error` is set to a descriptive Error

#### Scenario: Network or OAuth failure
- **WHEN** any step of the OAuth flow throws (token creation, session creation, URL parse)
- **THEN** `useAuth().error` SHALL contain the error, `isLoading` SHALL become `false`, and the login promise resolves `false`

### Requirement: Session Persistence and Hydration

Appwrite SDK SHALL persist the active session within the app process. On app launch, the auth provider SHALL call `getCurrentUser()` to hydrate `useAuth().user`. If no session exists, `user` SHALL be `null` and `isLoading` SHALL eventually become `false`.

#### Scenario: Cold app start with valid session
- **WHEN** app launches and Appwrite SDK holds a valid session cookie/token from a previous login
- **THEN** `getCurrentUser()` returns the user object, `useAuth().user` becomes non-null, and `isLoading` flips to `false`

#### Scenario: Cold app start with no session
- **WHEN** app launches and no previous login exists
- **THEN** `getCurrentUser()` returns `null`, `useAuth().user` is `null`, and `isLoading` is `false`

### Requirement: Guest Hydration Is Not An Error

The system SHALL treat the first-call result of `account.get()` that
returns `null` OR throws `AppwriteException` whose message matches
the `role:\s*guests[\s\S]*?missing scopes[\s\S]*?account\s*[\]"]`
pattern (i.e. `User (role: guests) missing scopes (["account"])`
verbatim) as "no active session" — `useAuth().user` SHALL be set to
`null`, `useAuth().error` SHALL remain `undefined`, and `isLoading`
SHALL become `false`. The error SHALL NOT be logged via `console.error`
on the guest-hydration path.

#### Scenario: First cold launch with no session

- **WHEN** app launches, no previous Appwrite session exists, and the SDK
  calls `account.get()`
- **THEN** no `AppwriteException` line appears in the JS log;
  `useAuth().user` is `null`; `isLoading` is `false`; `error` is
  `undefined`.

#### Scenario: Cold launch with valid session

- **WHEN** app launches and a previous valid session exists
- **THEN** `account.get()` succeeds, `useAuth().user` is populated, no
  error is logged.

### Requirement: Logout

The system SHALL expose `useAuth().logout()` that deletes the current Appwrite session via `account.deleteSession({ sessionId: "current" })`. After logout, `useAuth().user` SHALL become `null` and `RequireAuth` SHALL redirect to `(auth)/welcome`.

#### Scenario: User taps logout button
- **WHEN** user taps the logout icon on any authenticated screen
- **THEN** current Appwrite session is deleted, `useAuth().user` becomes `null`, and the screen redirects to `(auth)/welcome`

### Requirement: Token Access for Backend Calls

The system SHALL expose `useAuth().getAccessToken()` that returns an Appwrite-issued JWT via `account.createJWT()`. The returned string SHALL be suitable for `Authorization: Bearer <token>` headers on backend calls.

#### Scenario: Backend API call needs auth
- **WHEN** an API helper calls `getAccessToken()`
- **THEN** the system returns a valid Appwrite JWT created from `account.createJWT()` — never a raw ID token or a Clerk session token

### Requirement: Public Hook Surface Preservation

`useAuth()` SHALL continue to expose the shape `{ user, isLoading, error, login, logout, getAccessToken }` with the same field types. Existing consumers (`RequireAuth`, `verifyToken` callers, `VIPContext`, hooks) SHALL require zero structural changes. The `user` shape SHALL map from `AppwriteUser` (`$id`, `name`, `email`, `avatar`) to the existing consumer-visible shape.

#### Scenario: RequireAuth reads user
- **WHEN** `RequireAuth` calls `useAuth().user`
- **THEN** the user object has non-null `id` (mapped from `$id`), `email`, `name` — same as Clerk-shaped consumer expectations

#### Scenario: VIPContext uses user identity
- **WHEN** `VIPContext` calls `useAuth().user`
- **THEN** the component receives a user object without any Clerk-specific fields or provider references

### Requirement: Dev Bypass Short-Circuit

When `EXPO_PUBLIC_DEV_AUTH_BYPASS === "true"`, the auth module SHALL return a synthetic user with `id: "appwrite-dev-bypass"` and SHALL NOT instantiate the Appwrite `Client` or call any Appwrite network API.

#### Scenario: Dev bypass on
- **WHEN** the env flag is `"true"` on app start
- **THEN** `useAuth().user` is a synthetic user, `isLoading` is `false`, and no `account` service is accessed

### Requirement: Expo Go Compatibility

The entire auth flow SHALL operate without custom native modules. No `@clerk/expo`, `react-native-reanimated`, or `react-native-worklets` SHALL be imported anywhere in the app. Appwrite's REST API is accessed through `react-native-appwrite` which is a pure JS SDK — no native build required.

#### Scenario: Running in Expo Go
- **WHEN** the app is launched via `expo start` inside Expo Go
- **THEN** the auth flow (login, logout, session hydration) works without a custom development client and without any native module errors

### Requirement: getCurrentUser returns authenticated user after setSession
`getCurrentUser` SHALL return the authenticated `AppwriteUser` immediately after `client.setSession(secret)` has been called. Non-guest-scope errors SHALL be rethrown (not swallowed as `null`) so callers can distinguish a missing session from a transient failure.

#### Scenario: Valid session returns user
- **WHEN** `client.setSession(secret)` has been called with a valid session secret
- **THEN** `getCurrentUser()` SHALL return an `AppwriteUser` with a non-empty `$id`

#### Scenario: Guest scope error returns null
- **WHEN** `account.get()` throws a guest-scope error (no active session)
- **THEN** `getCurrentUser()` SHALL return `null` without throwing

#### Scenario: Non-guest error is rethrown
- **WHEN** `account.get()` throws an error that is NOT a guest-scope error (e.g., network timeout, rate limit)
- **THEN** `getCurrentUser()` SHALL rethrow the error so the caller can handle it

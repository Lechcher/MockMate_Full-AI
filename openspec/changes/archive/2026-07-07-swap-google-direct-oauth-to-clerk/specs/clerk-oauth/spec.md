# Capability: clerk-oauth

User authentication and session lifecycle managed by Clerk, exposed to the
MockMate app through a thin `useAuth()` bridge hook so no consumer imports Clerk
directly and existing routes (`RequireAuth`, API route `verifyToken`) keep working.

## ADDED Requirements

### Requirement: Clerk Provider at App Root

The application MUST wrap the root component tree in `<ClerkProvider>` from
`@clerk/expo`, with the publishable key sourced from
`EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`, and a `tokenCache` wired from the
`@clerk/expo/token-cache` subpath (delegates to `expo-secure-store`).

#### Scenario: App launches
- **WHEN** the JS bundle evaluates `src/app/_layout.tsx`
- **THEN** `<ClerkProvider>` renders before any consumer hook and `useAuth()` consumers (the bridge hook) resolve to `{ user: null, isLoading: true, … }` while Clerk rehydrates the session

#### Scenario: Env var missing in production build
- **WHEN** `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is unset and `EXPO_PUBLIC_DEV_AUTH_BYPASS` is unset
- **THEN** the app must throw a descriptive error during provider mount instead of silently using a stale or invalid key

### Requirement: One-Tap Google Sign-In via useSSO

The application MUST expose `useAuth().login()` that resolves to a single-click
Google sign-in using Clerk's `useSSO()` hook from `@clerk/expo` plus
`expo-web-browser` (via Clerk's bundled helpers) and `expo-linking` for the
`mockmate://sso-callback` deep-link return path. End-to-end behavior MUST match
a WebBrowser pop-up → Google account picker → silent return → active session.

> **Note:** Clerk deprecated `useOAuth()` in `@clerk/expo` v3 in favor of
> `useSSO()`. Both expose `startSSOFlow({ strategy: "oauth_google" })`. We MUST
> use `useSSO`.

#### Scenario: First interactive login
- **WHEN** the user taps the login button on `(auth)/welcome.tsx`
- **THEN** `useAuth().login()` opens a system/browser sheet via `startSSOFlow({ strategy: "oauth_google" })`, completes Google consent, closes back to `mockmate://sso-callback`, and `useAuth().user` becomes a non-null Clerk-shaped user within the same render cycle

#### Scenario: Native error from Clerk
- **WHEN** Clerk returns a thrown error (network, user cancelled, OAuth failure)
- **THEN** `useAuth().error` is set to a Clerk-normalized `Error` and `isLoading` flips to `false`

#### Scenario: Warm-up for snappier browser open on Android
- **WHEN** the app mounts on Android
- **THEN** Clerk's `useWarmUpBrowser()` is called at the top of the Google-sign-in handler so the Chrome Custom Tabs browser is pre-loaded before the user taps the button

### Requirement: Public Hook Surface Preservation

`useAuth()` MUST continue to expose the shape
`{ user, isLoading, error, login, logout, getAccessToken }` so existing
consumers (`RequireAuth`, `verifyToken` callers, route guards) require no
functional changes. The shape MUST be backed by Clerk state inside the bridge
hook.

#### Scenario: Reading user on protected route
- **WHEN** a route is wrapped in `RequireAuth`
- **THEN** the component receives a `user` instance before children render

#### Scenario: API route carries bearer token
- **WHEN** an API helper calls `getAccessToken()`
- **THEN** it returns a Clerk-issued JWT template (default - the Clerk session JWT) suitable for an `Authorization: Bearer` header — never a Google raw `id_token`

### Requirement: Dev Bypass Short-Circuit

When `EXPO_PUBLIC_DEV_AUTH_BYPASS === "true"`, the auth module MUST return a
synthetic Clerk-shaped user and MUST NOT call `startOAuthFlow`. The bypass is
the only code path that does not interact with the Clerk SDK's authentication
APIs.

#### Scenario: Dev bypass on
- **WHEN** the env flag is `"true"` on app start
- **THEN** `useAuth().user` is a synthetic user, `isLoading` is `false`, and no `startSSOFlow` call is dispatched

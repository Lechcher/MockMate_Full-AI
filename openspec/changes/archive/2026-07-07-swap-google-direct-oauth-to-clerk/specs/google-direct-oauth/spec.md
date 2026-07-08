# Modified Capability: google-direct-oauth

> **Status:** REMOVED — superseded by the `clerk-oauth` capability in
> `openspec/changes/swap-google-direct-oauth-to-clerk/specs/clerk-oauth/spec.md`.
> All four authentication providers (Auth0, Firebase, direct-Google-OAuth, Clerk)
> walked through this directory over a single session. Kept on disk only as a
> historical delta so `openspec validate` continues to find the file the archive
> command references.

## REMOVED Requirements

### Requirement: Google Authorization Code + PKCE
**Reason:** Replaced by Clerk's hosted OAuth flow via `useSSO({ strategy: "oauth_google" })` (v3+ — `useOAuth` is deprecated). Manual PKCE wiring (`expo-auth-session.AuthRequest` + `expo-crypto` SHA-256 verifier) is no longer needed — Clerk owns discovery, verifier generation, token exchange, and refresh.
**Migration:** Delete `MockMate/src/hooks/useAuth.ts` PKCE body. Wrap the app root in `<ClerkProvider>` from `@clerk/expo` instead of `AuthProvider`. Login is now a one-call `startSSOFlow` round-trip.

### Requirement: Public Hook Surface Preservation
**Reason:** Replaced by Clerk's same-shape surface (`useUser()`, `useSession()`, `getToken()`). The bridge hook in `MockMate/src/hooks/useAuth.ts` keeps the `{ user, isLoading, error, login, logout, getAccessToken }` shape returning Clerk data so consumers (`RequireAuth`, API routes) still type-check and never import Clerk directly.
**Migration:** Same shape is preserved by the bridge hook; no consumer refactor needed.

### Requirement: Secure Token Storage
**Reason:** Replaced by Clerk's `tokenCache` configuration (default-during-`@clerk/expo`: `expo-secure-store` backed via `tokenCache` import). Source-of-truth storage, cold-restart rehydration, and keychain/hardware-backed behavior all live in `@clerk/expo`. Manual `expo-secure-store.getItemAsync` / `setItemAsync` calls in `useAuth.ts` go away.
**Migration:** Configure `tokenCache` once in `ClerkProvider`; remove manual token-storage code paths from `useAuth.ts`.

### Requirement: Silent Refresh on Foreground
**Reason:** Replaced by Clerk's automatic token refresh. `getToken({ skipCache: true })` returns a fresh JWT whenever the cached one is past expiry; no `AppState` listener or 60s-wake debounce needed in app code.
**Migration:** Drop the `AppState` subscription in `useAuth.ts`; rely on Clerk's internal refresh or `getToken({ skipCache: true })` at consumer read sites if absolute freshness is required.

### Requirement: Dev Bypass Short-Circuit
**Reason:** Replaced. The dev bypass short-circuit is now an `EXPO_PUBLIC_DEV_AUTH_BYPASS === "true"` check in `useAuth.ts` that synthesizes a Clerk-shaped user without calling `startSSOFlow`. Same flag, same behavior, simpler implementation.
**Migration:** Keep the env var and bypass code; replace the Clerk-call branch only.

### Requirement: Cleanup on Unmount
**Reason:** Replaced. No `AppState` listener to clean up when Clerk owns refresh. Provider unmount is handled by React Native renderer + Clerk's own teardown. Scenario vacuously satisfied.
**Migration:** Remove from this spec; covered by `@clerk/expo`'s provider lifecycle.

### Requirement: Config Plugin Removal
**Reason:** Vacuously satisfied — `react-native-auth0` is gone, `expo-clerk-presence` does not exist, and `@clerk/clerk-expo` ships no native plugin. `MockMate/app.json` `plugins` block stays as `{ expo-router, expo-splash-screen, expo-font, expo-web-browser, expo-dev-client }`.
**Migration:** No action required.

### Requirement: Cap Removed
**Reason:** Vacuously satisfied — there is no Auth0 SDK lifecycle to manage.
**Migration:** Inspection only; `app.json` audit.

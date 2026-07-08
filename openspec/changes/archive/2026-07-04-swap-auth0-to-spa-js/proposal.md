## Why

`react-native-auth0` requires a native `A0Auth0` TurboModule that is not autolinked into Expo Go. When the SDK is imported in `src/hooks/useAuth.ts:42`, `TurboModuleRegistry.getEnforcing('A0Auth0')` runs at module load — before any guard or hook can fire — and crashes the JS bundle with `Invariant Violation: TurboModuleRegistry.getEnforcing(...): 'A0Auth0' could not be found`. The previous change (`fix-auth0-turbomodule-missing`) added JS-side guards and a native-module check script; those do not stop the static `import` from evaluating. Only a swap to a pure-JS Auth0 client can work in Expo Go while preserving login UX.

## What Changes

- Replace `react-native-auth0` with `@auth0/auth0-spa-js` across the app.
- Add `expo-secure-store` for refresh-token / code-verifier persistence (token-sensitive, hardware-backed on iOS/Android; backed by localStorage on web).
- Add `expo-web-browser` (already present transitively) as the OAuth round-trip surface via `AuthSession.openAuthSessionAsync` — preferred over `WebBrowser.openAuthSessionAsync` for predictable behavior on Android.
- Rewrite `src/hooks/useAuth.ts` against the SPA-JS `createAuth0Client` API; preserve the surface (`{ user, isLoading, error, login, logout, getAccessToken }`) so `RequireAuth.tsx`, `verifyToken.ts`, and other consumers do not churn.
- Remove the now-dead `Auth0NativeModuleMissingError` class and the `ensureAuth0TurboModule()` guard.
- Remove `react-native-auth0` plugin entry from `MockMate/app.json`.
- Repurpose `docs/AUTH0_NATIVE_REBUILD.md` → `docs/AUTH0_AUTH_SETUP.md` (SPA-JS + WebBrowser + SecureStore + Callback URL allowlist).
- Keep `MockMate/scripts/check-native-modules.ts` for other native deps (RevenueCat etc.); the `npm run check:native` script stays.
- Update `MockMate/.env.example` Auth0 comment block to "Single Page Application" application type + corrected Callback URLs / Web Origins (already applied in this session).
- Update root `AGENTS.md` Stack table to swap the `react-native-auth0` reference → `@auth0/auth0-spa-js`; keep cross-link in the new doc.

## Capabilities

### New Capabilities

- `auth0-spa-js-auth`: browser-based Google OAuth round-trip, SPA-JS token lifecycle (`loginWithRedirect`, `getTokenSilently` with refresh, `logout`), secure-store-backed `WebStorage` shim, foreground silent-refresh via `AppState`, toggle-binary dev bypass honored when `EXPO_PUBLIC_DEV_AUTH_BYPASS === "true"`.

### Modified Capabilities

- (none) — no existing capability spec covers Auth0 integration today.

## Impact

- Deps:
  - Remove: `react-native-auth0`
  - Add: `@auth0/auth0-spa-js` (~50 KB gz + `jose`), `expo-secure-store` (~12 KB)
  - Add (transitive only, no install): `expo-web-browser`, `expo-auth-session` — both ship with Expo SDK
- Files: `MockMate/src/hooks/useAuth.ts` (rewrite), `MockMate/src/lib/auth/Auth0Provider.tsx` (init client), `MockMate/package.json`, `MockMate/app.json`, `MockMate/.env.example`, `MockMate/scripts/check-native-modules.ts` (keep, narrow comment), `docs/AUTH0_AUTH_SETUP.md` (rename/new content), `AGENTS.md` (root, Stack table + cross-link).
- Non-churn: `RequireAuth.tsx`, `verifyToken.ts`, `useAuthSync.ts` consume the existing `useAuth()` shape — surface preserved.
- Runtime: Expo Go login now works. Dev-client and prod builds same path. Web (if ever activated) same path via SPA-JS browser API.
- Bundle: ~62 KB added (SPA-JS + SecureStore). Tree-shake limited because `@auth0/auth0-spa-js` ships monolithic.
- Auth0 dashboard: Application Type must be Single Page Application (not Native). Callback URLs: `mockmate://callback`, `mockmate://callback/expo`, `http://localhost:19006`. Web Origins: `mockmate://`, `http://localhost:19006`. SPA default `token_endpoint_auth_method: "none"`.

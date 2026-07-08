## Why

`react-native-auth0` cannot run on Expo Go: its static `import { useAuth0 } from "react-native-auth0"` evaluates `TurboModuleRegistry.getEnforcing('A0Auth0')` at module load, and Expo Go's JS shell does not autolink that native module. JS-side guards (`ensureAuth0TurboModule`, `Auth0NativeModuleMissingError`, `npm run check:native`) all run after the fatal `getEnforcing` already crashed the bundle. Auth0 itself is incidental: for Google-only OAuth it is a third-party middleware wrapping standard OIDC. Removing the middleware and speaking to Google directly via standard Authorization Code + PKCE eliminates the native dep entirely, keeps the full OAuth feature surface, and works under Expo Go, custom dev-client, and prod builds from one codebase.

## What Changes

- Remove `react-native-auth0` from `package.json` and from `MockMate/app.json`'s plugins (already executed this session).
- Add `expo-auth-session@~7.0.11` (Expo SDK-54-matched discovery, PKCE flow, `AuthSession.openAuthSessionAsync`).
- Add `expo-crypto@~15.0.9` for `getRandomBytesAsync` PKCE verifier generator.
- Keep `expo-secure-store@~14.2.4` for refresh-token / code-verifier persistence (already added this session).
- Keep `expo-web-browser@~15.0.11` (already present; `AuthSession.openAuthSessionAsync` uses it under the hood).
- Rewrite `MockMate/src/hooks/useAuth.ts` against `AuthSession.useAuthRequest(...)` (Google ID-token / authorization-code flow) — preserves the public surface `{ user, isLoading, error, login, logout, getAccessToken }` so `RequireAuth`, `verifyToken`, `useAuthSync` do not churn.
- Rewrite `MockMate/src/lib/auth/Auth0Provider.tsx` → `MockMate/src/lib/auth/AuthProvider.tsx` — wraps the app with `AuthSession`'s `AuthRequestProvider` and reads env vars (`EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`).
- Rewrite `MockMate/src/lib/auth/RequireAuth.tsx` to consume local `useAuth()` rather than `useAuth0` — same Redis-style redirect logic stays.
- Update `MockMate/src/lib/auth/verifyToken.ts` to verify Google ID tokens against `https://accounts.google.com` issuer using `jose` (already in project deps).
- Rewrite `MockMate/.env.example` Auth0 block → Google OAuth block (iOS / Android / Web client IDs + redirect URIs).
- Update root `AGENTS.md` Stack table: drop Auth0 row → add Google OAuth row; replace cross-link text pointer to `docs/AUTH_SETUP.md`.
- Rewrite `docs/AUTH0_NATIVE_REBUILD.md` → `docs/AUTH_SETUP.md` (Google OAuth setup: dashboard project, OAuth consent screen, client IDs, redirect URI allowlist).
- Remove stale `openspec/specs/auth0-spa-js-auth/spec.md` orphans from the never-shipped `swap-auth0-to-spa-js` drift.
- Keep `MockMate/scripts/check-native-modules.ts` (still useful for `react-native-purchases` etc.); the `npm run check:native` script stays.

## Capabilities

### New Capabilities

- `google-direct-oauth`: browser-based Google Authorization Code + PKCE flow via `expo-auth-session`. Token lifecycle (`exchangeCodeAsync`, refresh via `refreshTokenAsync` w/ `expo-secure-store` stored `access_token`/`refresh_token`/`id_token`), `AppState` foreground silent-refresh, dev bypass switch.

### Modified Capabilities

- (none) — no existing capability spec covers auth today.

## Impact

- Deps:
  - Remove: `react-native-auth0`
  - Add: `expo-auth-session@~7.0.11`, `expo-crypto@~15.0.9`
  - Kept (this session): `expo-secure-store@~14.2.4`, `expo-web-browser@~15.0.11` (already present), `jose@^6.2.3` (already present)
- Files: `MockMate/src/hooks/useAuth.ts` (rewrite), `MockMate/src/lib/auth/Auth0Provider.tsx` → `AuthProvider.tsx` (replace), `MockMate/src/lib/auth/RequireAuth.tsx` (rewrite), `MockMate/src/lib/auth/verifyToken.ts` (issuer change), `MockMate/src/app/_layout.tsx` (one import rename), `MockMate/.env.example` (replace Auth0 block with Google block), `MockMate/app.json` (already done), `MockMate/package.json` (already done partly), `docs/AUTH0_NATIVE_REBUILD.md` → `docs/AUTH_SETUP.md`, `AGENTS.md` root (Stack table + cross-link).
- Non-churn consumers: `verifyToken.ts`'s `verifyAuth0Token()` function name becomes `verifyGoogleToken()` (BREAKING for callers — use Zod's `assertNever` style or grep rename across the repo).
- Runtime: Expo Go, dev-client (iOS + Android), prod builds all same path. Web build also works (uses `expo-auth-session` browser fallback).
- Bundle: ~25 KB added (`expo-auth-session` + `expo-crypto`); SecureStore already counted in prior session.
- Auth0 dashboard: no longer used. To delete the Auth0 tenant, run separately (out of scope).
- Google Cloud Console: new OAuth client IDs for iOS, Android, Web. Redirect URIs: `mockmate:/oauth2redirect`, `https://oauth2redirect.example.com` (Expo dev-tool proxy only), and `mockmate://` as a JS-origins equivalent if Web build added.

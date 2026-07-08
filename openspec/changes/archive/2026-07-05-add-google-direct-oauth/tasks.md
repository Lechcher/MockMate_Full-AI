## 1. Dependencies & Config

- [x] 1.1 Resolve latest `expo-auth-session` (SDK 54) and `expo-crypto` (SDK 54) via `npm-check-updates` skill; add both to `MockMate/package.json` `dependencies`. (`expo-secure-store` already added this session.)
- [x] 1.2 Confirm `MockMate/app.json` still has `scheme: "mockmate"` (already removed `react-native-auth0` plugin this session — see context). Add `expo-crypto` and `expo-auth-session` plugin entries if absent (most projects omit them — confirm).
- [x] 1.3 Run `npm install` in `MockMate/` to materialize `node_modules`; verify `node_modules/expo-auth-session` and `node_modules/expo-crypto` are present, `node_modules/react-native-auth0` is gone.

## 2. Auth Module Rewrite

- [x] 2.1 Replace `MockMate/src/hooks/useAuth.ts` implementation: drop `react-native-auth0` import, drop `Auth0NativeModuleMissingError` + `ensureAuth0TurboModule()`. Replace with `expo-auth-session` Google Authorization Code + PKCE flow. Preserve `{ user, isLoading, error, login, logout, getAccessToken }` return shape.
- [x] 2.2 Implement token storage helpers (`saveTokens`, `loadTokens`, `clearTokens`) backed by `expo-secure-store`. Use `getItemAsync`/`setItemAsync`/`deleteItemAsync`. Shape `{ access_token, refresh_token, id_token, expires_in, expiresAt, user }`.
- [x] 2.3 Generate `code_verifier` via `getRandomBytesAsync(64)` from `expo-crypto`, then compute `code_challenge = base64url(sha256(verifier))`. Pass to `AuthSession.useAuthRequest({ responseType: "code", scopes: ["openid","profile","email"], extraParams: { access_type: "offline", prompt: "consent" } })`. Use `clientId` = `Platform.OS === "ios"` ? `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` : `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`; `webClientId = EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` for the discovery config.
- [x] 2.4 On `promptAsync` resolve with `type: "success"` and a `code`: call `AuthSession.exchangeCodeAsync({ code, clientId, redirectUri, codeVerifier, extraParams: { code_verifier: codeVerifier } })`. Save the returned `{ accessToken, refreshToken, idToken, expiresIn }` via `saveTokens`. Derive `user` from the `id_token` decoded user fields (use `jose.decodeJwt`).
- [x] 2.5 `logout()` calls `clearTokens()` and sets local user state to null. Optionally open Google's revoke endpoint (out of scope: keep simple, revoke local session only — re-prompt on next login).
- [x] 2.6 `getAccessToken()` returns saved `access_token` if `expiresAt > Date.now() + 5_000`, otherwise refresh via `refresh.acquireTokenSilently` (construct a request body with `grant_type=refresh_token&refresh_token=...` POST to `https://oauth2.googleapis.com/token`) and update via `saveTokens`.

## 3. Auth Provider, Consumers & App Wiring

- [x] 3.1 Rewrite `MockMate/src/lib/auth/Auth0Provider.tsx` → `MockMate/src/lib/auth/AuthProvider.tsx`: drops `react-native-auth0`'s `Auth0Provider`; uses plain React context for env-vars + client-config access. Or just exposes a component that pulls env vars.
- [x] 3.2 Rewrite `MockMate/src/lib/auth/RequireAuth.tsx` to drop `useAuth0` import; consume local `useAuth()` shape. Preserve the same `useSegments`/`useRouter` redirect logic.
- [x] 3.3 Update `MockMate/src/lib/auth/verifyToken.ts` to verify Google ID tokens (`iss: "https://accounts.google.com"`). Change JWKS endpoint to `https://www.googleapis.com/oauth2/v3/certs`. Rename `verifyAuth0Token` → `verifyGoogleIdToken` (find via grep to update call sites).
- [x] 3.4 Update `MockMate/src/app/_layout.tsx` import path from `Auth0Provider` → `AuthProvider`.
- [x] 3.5 Register `AppState.addEventListener("change", ...)` inside `useAuth()` for foreground silent-refresh (after >60s background). Record `Date.now()` when entering background; on `active` compare; if delta > 60s, trigger silent refresh.

## 4. Documentation

- [x] 4.1 Repurpose `docs/AUTH0_NATIVE_REBUILD.md` → `docs/AUTH_SETUP.md` with sections: `# Google OAuth Setup`, `## Google Cloud Console` (project + OAuth consent), `## Client IDs` (iOS, Android, Web), `## Redirect URIs`, `## Login flow`, `## Token storage`, `## Silent refresh`, `## Troubleshooting`.
- [x] 4.2 Update root `AGENTS.md` Stack table: drop `auth: Auth0 (Google OAuth)` row → add `auth: Google OAuth (via expo-auth-session)`. Update cross-link callout text.
- [x] 4.3 Rewrite `MockMate/.env.example` Auth0 block → Google block (lines 8–22 currently Auth0/SPA-flavored). Add sections for `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` with example values.
- [x] 4.4 Delete orphan `openspec/specs/auth0-spa-js-auth/spec.md` (artifact of the never-shipped `swap-auth0-to-spa-js` change).

## 5. Validation

- [x] 5.1 Run `npx tsc --noEmit` in `MockMate/`; expect no NEW errors introduced (pre-existing out-of-scope errors allowed).
- [x] 5.2 Run `npm run check:native` in `MockMate/`; expect exit `0` (script still useful for `react-native-purchases` etc.).
- [x] 5.3 Run `npx biome check --write` in `MockMate/` for the rewritten files.
- [x] 5.4 Confirm `node_modules/expo-auth-session/package.json` and `node_modules/expo-crypto/package.json` resolve and `import { useAuthRequest } from "expo-auth-session"` export exists when called via `npx expo install expo-auth-session expo-crypto` (the CLI picks SDK-compatible versions).
- [x] 5.5 Confirm `app.json` still has `scheme: "mockmate"` and no `react-native-auth0` entry (`grep -n react-native-auth0 MockMate/app.json` returns nothing).
- [x] 5.6 Confirm no project file still imports `react-native-auth0` (`grep -rl "react-native-auth0" MockMate/src MockMate/scripts` returns nothing).
- [x] 5.7 Smoke launch instructions: `npx expo start --go` from `MockMate/`; `app/(auth)/welcome.tsx`; tap login; redirect to Google consent; grant; closes back to `mockmate://`; user populated. (Note: full smoke requires real client IDs in `.env` to talk to Google — local-only verification limited to import graph + bundle compile.)

## 1. Dependency & Config

- [x] 1.1 Resolve latest `@auth0/auth0-spa-js` and `expo-secure-store` versions via `npm-check-updates` skill; add both to `MockMate/package.json` `dependencies`. Remove `react-native-auth0` from `dependencies`.
- [x] 1.2 Drop the `"react-native-auth0"` plugin entry from `MockMate/app.json`'s `plugins`. Keep `expo-dev-client` and `expo-web-browser`. The `scheme: "mockmate"` stays.
- [x] 1.3 Run `npm install` in `MockMate/` to materialize `node_modules`; verify `node_modules/react-native-auth0` is gone and `node_modules/@auth0/auth0-spa-js` + `node_modules/expo-secure-store` are present.

## 2. Auth Module Rewrite

- [ ] 2.1 Replace `MockMate/src/hooks/useAuth.ts` implementation: drop `react-native-auth0` import, drop `Auth0NativeModuleMissingError` + `ensureAuth0TurboModule()`. Replace with `@auth0/auth0-spa-js` `createAuth0Client` + lazy ref. Preserve `{ user, isLoading, error, login, logout, getAccessToken }` return shape.
- [ ] 2.2 Add a `WebStorage`-shaped adapter backed by `expo-secure-store` at the top of `useAuth.ts`. The shim MUST be promise-aware + a write-queue to satisfy SPA-JS's sync-feeling API (use a synchronous-looking facade backed by an in-memory cache mirrored by async writes).
- [ ] 2.3 Wire `login()` through `AuthSession.openAuthSessionAsync(url, "mockmate")` using `AuthSession.makeRedirectUri({ native: "mockmate://callback" })`. Handle the redirect result and pass `code + state` to `client.handleRedirectCallback(url)`.
- [ ] 2.4 Implement `logout()` via `client.logout({ logoutParams: { returnTo: "mockmate://callback" }, openUrl: ... })` so the system browser completes the Auth0 RP-initiated logout when possible.
- [ ] 2.5 Keep `getAccessToken()` returning `client.getTokenSilently({ ignoreCache: true })`; same behavior for current consumers.
- [ ] 2.6 Honor `EXPO_PUBLIC_DEV_AUTH_BYPASS === "true"` short-circuit returning a synthetic user without constructing the client.

## 3. Provider, Consumers & App Wiring

- [ ] 3.1 Confirm `MockMate/src/lib/auth/Auth0Provider.tsx` does not require changes for the new client — only passes `EXPO_PUBLIC_AUTH0_DOMAIN` and `EXPO_PUBLIC_AUTH0_CLIENT_ID`. If it imports `react-native-auth0`, swap to using env-vars-or-`undefined` pattern.
- [ ] 3.2 Confirm `MockMate/src/lib/auth/RequireAuth.tsx` and `MockMate/src/lib/auth/verifyToken.ts` and `MockMate/src/hooks/useAuthSync.ts` still type-check against the preserved `useAuth()` shape; surface changes only if any type signature drifted.
- [ ] 3.3 Register `AppState.addEventListener("change", ...)` in the provider or hook for foreground silent-refresh (after >60s background). Remove listener on unmount.

## 4. Documentation

- [ ] 4.1 Repurpose `docs/AUTH0_NATIVE_REBUILD.md` → `docs/AUTH0_AUTH_SETUP.md` with sections: `# Auth0 Setup`, `## Application type` (SPA), `## Environment variables`, `## Callback URLs & Web Origins`, `## Login flow` (browser round-trip), `## Token storage`, `## Silent refresh`, `## Troubleshooting`.
- [ ] 4.2 Update root `AGENTS.md` Stack table Auth0 row from `react-native-auth0 (Google OAuth)` to `@auth0/auth0-spa-js (Google OAuth)`; cross-link to the new doc.
- [ ] 4.3 Confirm `MockMate/.env.example` Auth0 block matches the SPA guidance (lines 8–22 already updated this session).

## 5. Validation

- [ ] 5.1 Run `npx tsc --noEmit` in `MockMate/`; expect no NEW errors introduced (pre-existing out-of-scope errors allowed).
- [ ] 5.2 Run `npm run check:native` in `MockMate/`; expect exit `0` and `OK: N native module checks passed`.
- [ ] 5.3 Run `npx biome check --write` in `MockMate/` for the rewritten files.
- [ ] 5.4 Inspect `node_modules/@auth0/auth0-spa-js` is importable from `useAuth.ts` (MetaTest: `node --experimental-strip-types -e "import('@auth0/auth0-spa-js').then(m=>console.log(typeof m.createAuth0Client))"` from `MockMate/`).
- [ ] 5.5 Confirm `app.json` no longer lists `react-native-auth0` plugin (grep).
- [ ] 5.6 Smoke launch instructions: `npx expo start --go` from `MockMate/`; navigate to `app/(auth)/welcome.tsx`; tap login; browser opens, Auth0 consent, redirects to `mockmate://callback`, user returned. (Run on dev-client or Expo Go as available.)

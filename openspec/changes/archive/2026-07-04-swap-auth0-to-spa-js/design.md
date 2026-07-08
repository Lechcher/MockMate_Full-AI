## Context

MockMate is an Expo React Native app currently using `react-native-auth0` for Google OAuth. The SDK ships a native `A0Auth0` TurboModule that must be autolinked into the build. Expo Go does not autolink native modules that ship not-prebuilt with the Expo Go shell, and Metro does not transform `react-native-auth0/lib/{commonjs,module}/specs/NativeA0Auth0.js` — the file executes `TurboModuleRegistry.getEnforcing('A0Auth0')` at module load, before any React hook or guard can run. Symptoms:

- Every Expo Go launch crashes at import with `Invariant Violation: TurboModuleRegistry.getEnforcing(...): 'A0Auth0' could not be found`.
- The previous change `fix-auth0-turbomodule-missing` introduced JS-side `ensureAuth0TurboModule()` + `Auth0NativeModuleMissingError` and a `check:native` script. Those are inert against the static-import root cause.
- `app.json` declares `scheme: "mockmate"` (the deep-link target) and the `react-native-auth0` config plugin (used during prebuild to inject native code) — the plugin is the only thing keeping the native SDK's lifecycle stable in custom dev-clients.
- Auth0 already supports an OIDC flow suitable for any SPA via standard `react-native` + browser backends; `@auth0/auth0-spa-js` is the official PKCE SPA client and works in any browser-like runtime including `expo-web-browser`.

Constraints:
- App.dart side: existing consumers (`RequireAuth.tsx`, `verifyToken.ts`, `useAuthSync.ts`) all rely on `useAuth()` returning `{ user, isLoading, error, login, logout, getAccessToken }`. The rewrite must preserve that surface.
- Dev bypass: `EXPO_PUBLIC_DEV_AUTH_BYPASS === "true"` short-circuits to a synthetic user when env says so (no Auth0 round-trip).
- Bundle size budget: free-tier; ~50 KB gz `@auth0/auth0-spa-js` is acceptable.

## Goals / Non-Goals

**Goals:**
- Eliminate the `'A0Auth0' could not be found` crash on every Expo Go launch.
- Preserve `useAuth()` shape so consumers don't churn.
- Tokens persist in hardware-backed storage (iOS Keychain / Android Keystore) when on device; `localStorage` (expo-secure-store web fallback) when on web.
- Silent refresh of access tokens via `AppState` foreground events.
- Maintain dev-bypass behavior.
- `.env.example` already advertises SPA-specific guidance; no new vars.

**Non-Goals:**
- Adding a refresh-token rotation server endpoint (Auth0 issues rotation transparently for SPA).
- Web-target polish (localStorage fallback only; MockMate doesn't ship a web build today).
- Replacing the Auth0 tenant or migrating providers.
- Changing the Auth0 application's client secret config (SPAs use `none` token endpoint auth — already the default for SPA type).

## Decisions

1. **Use `@auth0/auth0-spa-js` over `@auth0/auth0-react`**
   - Reason: `auth0-react` carries React-DOM bindings; SPA-JS is framework-agnostic, smaller surface, and gives finer control over the `WebStorage` shim.
   - Alt considered: hand-rolled PKCE OIDC against Auth0's `/authorize` + `/oauth/token` endpoints. Rejected: `code_verifier`/`code_challenge` + `WebStorage` plumbing every 200 LOC for what SPA-JS already ships tested.

2. **OAuth round-trip via `AuthSession.openAuthSessionAsync` (from `expo-auth-session`) over `WebBrowser.openAuthSessionAsync`**
   - Reason: `expo-auth-session` detects Android intent-filter routing for `mockmate://` callbacks reliably and uses `WebBrowser` under the hood. It also pairs cleanly with SPA-JS's `loginWithRedirect({ openUrl, redirectUri })` hooks.
   - Alt considered: `expo-web-browser` directly. Rejected: requires manualizing `redirect_uri` handling and the Android `intent-filter` quirks.

3. **Token storage via `expo-secure-store` as a `WebStorage` shim**
   - Reason: `createAuth0Client({ cacheLocation: "localstorage" })` requires a `WebStorage`-shape object with `get`/`set`/`remove`. `expo-secure-store` exposes an async key/value API — wrap with promise-aware methods.
   - Alt considered: `cacheLocation: "memory"` only. Rejected: forces login on every cold start; bad UX.

4. **Drop `Auth0NativeModuleMissingError` + `ensureAuth0TurboModule`**
   - Reason: the static `import` they guarded is gone. Dead code.
   - Alt considered: keep as legacy fallback in case future SDK brings TurboModule shim. Rejected: YAGNI, deletion > addition.

5. **Lazy-load the SPA-JS client**
   - Reason: `createAuth0Client` runs validation against domain/audience at construction; defer until first `useAuth()` call to keep cold-start fast and to avoid constructing in test where env vars may be absent.
   - Alt considered: construct eagerly in `Auth0Provider`. Rejected: cost on every cold start including tests.

6. **AppState silent refresh**
   - Reason: `@auth0/auth0-spa-js` does not auto-refresh; refresh on foreground via `AppState.addEventListener("change", ...)`. Adds accuracy: when a user backgrounds for >session time, foreground triggers `getTokenSilently({ ignoreCache: true })`.

## Risks / Trade-offs

- [iOS simulator may strip callback query params in some WebBrowser edges] → Use `AuthSession.openAuthSessionAsync`, parse callback `url.searchParams` defensively with fragment-vs-query fallback. Mock tested on sim before prod build.
- [Android intent-filter for `mockmate` URI scheme not registered by default] → `app.json` `scheme: "mockmate"` registers it; verify via `npx expo prebuild --no-install` dry-run.
- [Bundle size +62 KB] → acceptable per free-tier; if needed, `import("@auth0/auth0-spa-js")` keeps it out of the initial chunk.
- [`WebStorage` shim is async but SPA-JS reads/cache writes are synchronous-looking] → SPA-JS exposes only a sync interface; shim must `.then` chain synchronously via persistent in-memory cache + fire-and-forget store; accept eventual write races by using a write-queue with idempotent keys.
- [Dev-server HTTPS self-signed for `expo-auth-session` proxy] → `mockmate://` URL is app-private; no TLS needed. Add `redirectUri: AuthSession.makeRedirect_uri({ native: "mockmate://callback" })` to avoid the Expo proxy.
- [Web origin `mockmate://` not accepted by Auth0 by default] → verified: Auth0 "Allowed Web Origins" accepts custom schemes since 2022; will document in setup guide.
- [Drop `react-native-auth0` plugin breaks custom dev-client] → After unwind, only the SDK's removed code is gone. Plugin entry removal keeps `expo prebuild` clean.

## Migration Plan

1. Land proposal + design + spec.
2. Implement tasks in order: deps → app.json → useAuth → provider → consumers → docs → AGENTS → verify.
3. Pre-deploy checklist: Auth0 dashboard "SPA" application created, Callback URLs allowlisted, Web Origins allowlisted.
4. Cold-start smoke: Expo Go, dev-client (iOS + Android), web build.
5. Rollback: revert the OpenSpec change archive; reinstall `react-native-auth0`. Tokens lost on rollback (acceptable — refresh tokens are short-lived enough to avoid lockout).

## Open Questions

- Should the new doc also cover Auth0 email-verification + MFA, or stay OAuth-only? (Current scope: OAuth-only.)
- Should `EXPO_PUBLIC_AUTH0_AUDIENCE` be added when the user wants a custom API audience, or kept out until first API call requires it? (Decision: out of scope; add when needed.)

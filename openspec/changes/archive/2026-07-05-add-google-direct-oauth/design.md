## Context

MockMate runs on Expo Go (project README confirms dev-client is required for Auth0, but general practice for the team is Expo Go first). The current `useAuth` import of `react-native-auth0` crashes the JS bundle at module load: the SDK's static `import { useAuth0 } from "react-native-auth0"` evaluates `TurboModuleRegistry.getEnforcing('A0Auth0')` at top-level, which throws inside Expo Go (no autolinking). Every JS-side guard (the `ensureAuth0TurboModule` helper, `Auth0NativeModuleMissingError`, `npm run check:native`) is too late — module load has already thrown.

The previous fixes exposed a clean root cause but did not move it. The pivot options:

1. **Swap to `@auth0/auth0-spa-js`** — failed at plan time: SPA-JS's `loginWithRedirect`/`logout` require `window.location`, so they don't fire inside `expo-web-browser`.
2. **Use Firebase Web SDK** — fails at plan time for the same class of reason (Firebase Web expects `indexedDB`, `localStorage`, polyfills, and the `signInWithRedirect` flow).
3. **`@react-native-firebase/auth` (native)** — crashes at module load in Expo Go for the same reason `react-native-auth0` does. Not a fix.
4. **Drop Auth0 entirely. Use Google Identity Services directly via `expo-auth-session`** — chosen. For Google-only OAuth, Auth0 is a pass-through; speaking OIDC directly to Google is the smaller, simpler dependency tree.

Constraints (preserved from prior change):

- Public `useAuth()` hook surface stays `{ user, isLoading, error, login, logout, getAccessToken }`.
- `@auth0/auth0-spa-js` decision artifact (`openspec/specs/auth0-spa-js-auth/spec.md`) is orphan and gets removed.
- `docs/AUTH0_NATIVE_REBUILD.md` repurposed for Google setup.
- `Auth0NativeModuleMissingError` class is already deleted at module-init time (current `useAuth.ts` is rewritten) — no defunct code to clean.

## Goals / Non-Goals

**Goals:**
- Eliminate the `'A0Auth0' could not be found` crash on every Expo Go launch.
- Preserve `useAuth()` shape so consumers don't churn.
- Tokens persist in hardware-backed storage (iOS Keychain / Android Keystore) when on device.
- Silent refresh via `AppState` foreground events (token expiry-aware).
- Maintain dev-bypass behavior (`EXPO_PUBLIC_DEV_AUTH_BYPASS === "true"` returns a synthetic user).
- `.env.example` documents the new env vars.
- One codebase + one OAuth flow across Expo Go, dev-client (iOS + Android), and prod.

**Non-Goals:**
- Replacing `verifyToken.ts`'s `jose`-based JWT verification with a different library.
- Supporting sign-up of new accounts in-app (Google account choice only; new users rely on Google signup flow).
- Multi-tenant orgs / RBAC inside the app.
- Auth0 tenant deletion (out of scope; infra decision).
- Web login polish (the project is mobile-first; web build does not currently ship a production page).

## Decisions

1. **Use `expo-auth-session` for Google Authorization Code + PKCE** over hand-rolling the discovery + token exchange.
   - Reason: `expo-auth-session` ships discovery, `makeRedirectUri`, `AuthRequest` with `code_verifier`/`code_challenge`, and `exchangeCodeAsync()` already wired to `fetch`. We still own the browser round-trip via `AuthSession.openAuthSessionAsync` (which calls `expo-web-browser` under the hood — predictable on Android where intent-filters matter).
   - Alt: hand-rolled `/authorize` + `/oauth/token` + PKCE. Rejected: ~150 LOC of work `expo-auth-session` already covers correctly.

2. **Per-platform client IDs via `webClientId`, `iosClientId`, `androidClientId`** instead of one shared client.
   - Reason: Google's OAuth grant requires the client ID to match the platform whose redirect URL is being used. `AuthSession` switches client ID automatically on the current `Platform.OS` and avoids `redirect_uri_mismatch`.
   - Alt: keep a single web client ID and ignore iOS/Android-specific flows. Rejected: leads to `idpiframe_initialization_failed` or platform-mismatch rejections on real devices.

3. **`access_type=offline` + `prompt=consent` to receive `refresh_token`**.
   - Reason: silent refresh requires `refresh_token` from Google. Google's defaults (`access_type=online`, no `prompt`) skip refresh-token issuance.
   - Alt: rely on `prompt=none` and re-prompt if Google says consent required. Rejected: poor UX on cold restart.

4. **Token storage via `expo-secure-store`-backed helpers `saveTokens`/`loadTokens`/`clearTokens`**, not a `WebStorage` shim.
   - Reason: skips SPA-JS's `ICache` shape requirement (only matters if SPA-JS were used). For direct OAuth, we own the storage. Async API + write-queue with in-memory cache mirror (so reads can be synchronous after init).
   - Alt: AsyncStorage. Rejected: plaintext; tokens are sensitive.

5. **Lazy token rehydration at `useAuth()` mount only**, not provider construct.
   - Reason: keep cold-start cheap; avoid constructing fetch requests during provider mount before env vars may be set.
   - Alt: eager rehydrate on `AuthRequestProvider`. Rejected: heavier startup; less predictable for tests.

6. **`AppState.addEventListener("change", ...)` for foreground refresh** with `Date.now() - lastBackgroundAt > 60_000` trigger.
   - Reason: keep silent-refresh cheap; avoid hammering `/oauth/token` on every foreground transition (some users switch apps frequently).
   - Alt: refresh on every `active` transition. Rejected: extra network calls + battery.

## Risks / Trade-offs

- [Token expiry misaligned with shouldRenew thresholds] → Pass `access_type=offline` on every refresh; rely on `expires_in` from Google's response.
- [Android intent-filter for `mockmate://` unregistered] → `app.json` `scheme: "mockmate"` covers this. `AuthSession.makeRedirectUri({ native: "mockmate://", path: undefined })` produces `mockmate://` redirect; verify via `prebuild --no-install` dry-run. (No Google sign-in uses redirect URI further; AuthSession handles the round-trip.)
- [Bundle ~25 KB added] → acceptable; trade-off avoids Auth0 dependency.
- [Multi-account on same device] → fine; Google handles selection at consent screen; tokens stored per-user so re-login produces isolated state.
- [Cold restart in dev-bypass mode never touches Google] → keep bypass check inside `useAuth()` body, before any `loadTokens()`.
- [Public OAuth client_id leak] → Accepted for native apps. Restrict to iOS bundle id / Android package + SHA1 in Google Cloud Console.
- [Fallback `id_token` audience] → JWT `aud` should equal web client ID; document in setup doc.

## Migration Plan

1. Land proposal + design + spec.
2. Add deps: `expo-auth-session`, `expo-crypto`.
3. Rewrite `useAuth.ts`.
4. Rename `Auth0Provider.tsx` → `AuthProvider.tsx`, drop native SDK import, use `AuthSession.AuthRequestProvider` (expo-auth-session ships a React context for `useAuthRequest`).
5. Update `RequireAuth.tsx` to use local `useAuth()`.
6. Update `verifyToken.ts` issuer to `https://accounts.google.com`; rename `verifyAuth0Token` → `verifyGoogleIdToken`.
7. Update `_layout.tsx` import path.
8. Update `MockMate/.env.example` Auth0 block → Google block.
9. Rename doc + update `AGENTS.md` + remove orphan `openspec/specs/auth0-spa-js-auth/spec.md`.
10. Verify: `tsc --noEmit`, `npm run check:native`, `biome check --write`.
11. Smoke: sign in from dev-client or Expo Go; cold restart; consent flow.
12. Rollback: revert change archive; restore `react-native-auth0`. Tokens lost on rollback (acceptable — Google refresh tokens are long-lived but tenant can be re-link per-user).

## Open Questions

- Do we want a `description` param / i18n copy for the consent screen? (Out of scope; Google defaults to user account's locale.)
- Should we add web-source for `scope=profile email openid` exclusively, or also include Auth0-only fields (e.g., `given_name`, `family_name`)? Google ID token includes `given_name`/`family_name` — keep same.
- Where do we store the refresh-token if the user signs out — purge everything or retain? **Decision: purge everything on logout.**

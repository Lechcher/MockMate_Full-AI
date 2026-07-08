# Proposal: swap-google-direct-oauth-to-clerk

## Why

The Google-direct OAuth implementation (`add-google-direct-oauth`) we just shipped works but ships a lot of complexity for a single, narrow goal: Google sign-in. Manually wiring `expo-auth-session.AuthRequest` + `expo-crypto` PKCE + JWKS verification + secure-store refresh-cycle leaks platform-level auth concerns into app code and forces every consumer to depend on those internals. Clerk collapses all of that (discovery, PKCE, token refresh, session storage, MFA ladder, multi-provider federation) into one declarative provider plus the `useSSO` hook (v3+ — `useOAuth` is deprecated). Expo Go compatibility is preserved via Clerk's `oauth_<provider>` strategy over `expo-web-browser` + `expo-linking`, with a future `<AuthView/>` upgrade path when we leave Expo Go for a dev build.

## What Changes

- Replace `MockMate/src/hooks/useAuth.ts` (Google-direct PKCE) with a Clerk-backed bridge hook that exposes the same `{ user, isLoading, error, login, logout, getAccessToken }` surface, so no consumer changes.
- Replace `MockMate/src/lib/auth/AuthProvider.tsx` pass-through with `<ClerkProvider>` from `@clerk/expo` (forwarding `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` + `tokenCache` from `@clerk/expo/token-cache`).
- Replace `MockMate/src/lib/auth/verifyToken.ts` `verifyGoogleIdToken` with `Clerk`-side `getToken({ template: "mockmate_jwt" })` for API bearer usage. Server API routes consume the Clerk-issued JWT directly (no JWKS verify needed in variant code; Clerk handles signing).
- Replace `MockMate/src/lib/auth/RequireAuth.tsx` consumer hook site to read from Clerk's `useUser` / `useSession`.
- Delete the `add-google-direct-oauth` capability's 7 ADDED requirements from main `openspec/specs/google-direct-oauth/spec.md` (REMOVED section) and replace with a smaller `clerk-oauth` capability ADDED list (~4 requirements).
- Update `MockMate/.env.example`: rename `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` → `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` and add `EXPO_PUBLIC_DEV_AUTH_BYPASS` (carried over — already present).
- Update `docs/AUTH_SETUP.md`: replace Google-OAuth setup doc content with Clerk dashboard setup + `clerk-cli` test loop.
- Update `AGENTS.md` Stack / Auth row.
- Keep `EXPO_PUBLIC_DEV_AUTH_BYPASS` short-circuit (synth dev user when `"true"`) — only swap implementation under it.

**BREAKING**: env-var name changes (Google client IDs → Clerk publishable key). Anyone with `.env` from prior change must update.

## Capabilities

### New Capabilities

- **`clerk-oauth`**: User authentication and session lifecycle managed by Clerk. Replaces the `google-direct-oauth` capability.
  - Login via `useSSO({ strategy: "oauth_google" })` + `expo-web-browser` + `expo-linking` redirect round-trip
  - `useWarmUpBrowser()` called at top of welcome screen for snappier Android cold-open
  - `WebBrowser.maybeCompleteAuthSession()` called at module load to consume the `mockmate://sso-callback` deep link
  - Session persistence handled by Clerk's `tokenCache` (`expo-secure-store` backed)
  - Public hook surface preserved
  - Dev bypass short-circuit preserved

### Modified Capabilities

- **`google-direct-oauth`**: All 7 previously-ADDED requirements REMOVED in full (replaced by `clerk-oauth`). Spec file becomes the historical delta — this archive moves to `/archive/` per the archive command workflow.

## Impact

- **Code**: 5 existing auth files rewritten (`useAuth.ts`, `AuthProvider.tsx`, `RequireAuth.tsx`, `verifyToken.ts`, `GoogleSignInButton.tsx`). 1 dead file deleted (`Auth0Provider.tsx` already deleted; no further deletions unless profile file proves unused).
- **Env vars**: `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` / `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` / `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` removed; `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` added.
- **Dependencies** (additive; pinned per Expo SDK 54 expected):
  - `@clerk/expo@^3.x` (new — should replace nothing — `react-native-auth0` and `expo-auth-session` already absent from install)
  - `@clerk/expo/token-cache` subpath (no extra entry; subpaths stay inside `@clerk/expo`)
  - Verify `expo-secure-store`, `expo-web-browser`, `expo-linking` already in `package.json` (yes — kept them).
  - No removals: `expo-crypto`, `jose`, old Google-direct helpers will appear unused after this change; user-aligned manifest sync already covers their removal when user re-aligns.
- **API routes** (`MockMate/src/app/api/*+api.ts`): still consume `Authorization: Bearer <token>` from the same hook — no signature changes in the routes themselves.
- **CI / test loop**: Authoritative loop becomes `clerk login` → `clerk dev` (or `clerk listen --forward-port 8081`) for local webhook testing; integrated pass-through on iOS/Android via the publishable key. No Clerk backend service required (Clerk is fully managed SaaS).
- **Archive**:
  - `add-google-direct-oauth` change stays in archive (unchanged, well-formed) but its main-spec delta gets REMOVED. Net: `openspec/specs/google-direct-oauth/spec.md` becomes empty. Kept as a list-only empty capability entry for traceability — alternative is deleting the directory but that breaks openspec history. Decision: leave directory, mark capability REMOVED in delta.
  - `swap-google-direct-oauth-to-clerk` becomes the new active spec under main.

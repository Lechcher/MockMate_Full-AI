# Design: drop-clerk-swap-to-appwrite-auth-only

## Context

MockMate runtimes: real (dev-client) and dev-bypass (Expo Go). Both modes currently drive Clerk `AuthProvider` → `useClerkAuth` → `useAuth` bridge → consumers. 9 screen/files import `useAuth`, 2 more import Clerk directly (`useClerkAuth`, `__clerk_ssr_state`). Server `verifyToken` uses `jose` to validate Clerk JWTs. RevenueCat `VIPContext` reads `useAuth().user` for user identity; `useSyncProfile` syncs profile to Sanity (CMS stays).

App accesses Clerk keys from `.env` (`EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` for webhooks). Every consumer sees a `user` object with Clerk shape (`{ id, email, fullName, ... }`). The `useAuth` bridge strips Clerk specifics and returns a flat shape but keeps Clerk-isms in `useClerkAuth`.

Appwrite example: the user already ships `appwrite.ts` / `global-provider.tsx` / `useAppwrite.ts` / `auth.tsx` from a sibling project. This can be ported directly — the `useAppwrite` hook + `getCurrentUser` pattern replaces Clerk entirely. Google OAuth goes through `account.createOAuth2Token` + `openAuthSessionAsync`. The key env vars become `EXPO_PUBLIC_APPWRITE_ENDPOINT`, `EXPO_PUBLIC_APPWRITE_PROJECT_ID`, `EXPO_PUBLIC_APPWRITE_BUCKET_ID`.

Requirement: Expo Go must work. That means no native build == no reanimated@4, no worklets@0.5. All reanimated calls must be converted to `Animated` / `LayoutAnimation`.

## Goals / Non-Goals

**Goals:**
- Drop `@clerk/expo` and `useClerkAuth` entirely; add `react-native-appwrite`.
- Replace auth provider (`AuthProvider.tsx`) with Appwrite client init — no Clerk `ClerkProvider` wrapper, no token cache.
- `useAuth` bridge returns same public shape (`user`, `isLoading`, `error`, `login`, `logout`, `getAccessToken`) but backed by `useAppwrite(getCurrentUser)`.
- Preserve dev-bypass mode: when `EXPO_PUBLIC_DEV_AUTH_BYPASS=true`, no Appwrite client instantiated, return synthetic user.
- Replace server token verification (`verifyToken.ts`) — Appwrite JWT verified via HMAC (Appwrite secret) instead of Clerk JWKS.
- All consumer imports of `useAuth()` remain identical — zero consumer changes (only the bridge rewrites).
- Expo Go runs: drop `react-native-reanimated` and `react-native-worklets` from `package.json`; replace all `useAnimatedStyle`/`useSharedValue`/worklet with `Animated` API.
- Sanity CMS untouched — interview content, user-profile syncing, hooks (`useUserProfile`, `useInterviews`, `useSavedInterviews`, etc.) keep using Sanity client and GROQ queries.
- Google OAuth button on `(auth)/welcome.tsx` now calls `login()` which internally uses Appwrite `account.createOAuth2Token`.

**Non-Goals:**
- No Sanity → Appwrite content migration.
- No new UI redesign — `welcome.tsx` keeps its visual, `index.tsx` logout button stays, profile screen stays.
- No RevenueCat refactor — `VIPContext` already reads user via `useAuth().user` which stays after swap.
- No gamification or interview engine changes.
- No new API routes added.

## Decisions

### D1: Auth provider — thin bridge, not ORM

Clerk's `ClerkProvider` wraps the whole app and injects `useUser`, `useSession`, `useSignIn/Up`. Appwrite has no equivalent "global provider" — instead we init a `Client` singleton and call `account.get()` directly. We replace `AuthProvider` with:

```tsx
// New AuthProvider: render <AppwriteAuthProvider> if not bypass
function AppwriteAuthProvider({ children }) {
  const { data: user, loading, refetch } = useAppwrite({ fn: getCurrentUser });
  const value = { user, isLoading: loading, refetch };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

Then `useAuth()` reads `AuthContext` instead of requiring `useClerkAuth`. No `ClerkProvider`, no `tokenCache`, no HR-native setup.

**Rationale**: One `Client` per process (Alpha). Appwrite's `account` service works globally; no per-screen provider needed. This eliminates the custom dev-client build requirement.

**Alternatives considered**: Keep `ClerkProvider` in bypass and only use Appwrite in prod (split-mode). Rejected — adds dead code and two auth paths to maintain.

### D2: Token type shift — Appwrite JWT vs Clerk session token

Clerk issues session JWT signed by JWKS; `verifyToken` calls `jose.createRemoteJWKSet(jwksURL)` → `jwtVerify(token, jwks, { issuer })`. Appwrite issues HMAC JWT signed by project secret. We replace with:

```ts
const secret = new TextEncoder().encode(process.env.APPWRITE_JWT_SECRET);
const { payload } = await jwtVerify(token, secret);
```

No remote fetch; simpler, faster.

**Rationale**: Appwrite's JWT endpoint (`account.createJWT()`) returns an HMAC-signed token — single secret per project. Still uses `jose`, same package.

**Risk**: The `sub` field format changes from Clerk `{"sub": "google-oauth2|xxx"}` to Appwrite `{"sub": "user_<id>"}`. No consumer reads `sub` directly — `getAccessToken` just returns the raw token, consumers pass it to server routes. OK.

### D3: Login flow — Appwrite OAuth2 Token + expo-web-browser

The user's `appwrite.ts` example already works in Expo Go:

```ts
login() → account.createOAuth2Token({provider: OAuthProvider.Google}) →
openAuthSessionAsync(response.toString(), Linking.createURL("/")) →
parse URL → account.createSession({userId, secret})
```

No native module, no custom scheme handler. `expo-linking` creates a redirect URL (`/`) automatically; `expo-web-browser` is already a dependency.

**Rationale**: Same Google OAuth UX as Clerk's `useSSO().startSSOFlow`. User clicks "Continue with Google" → browser opens → callback → session created.

**Risk**: `openAuthSessionAsync` uses `WebBrowser.maybeCompleteAuthSession()` in some Expo SDK versions for deep-link cleanup. The user's code doesn't mention that — check docs before implementing.

### D4: Reanimated purge — `Animated` replacement

Reanimated 4 + worklets break Expo Go. Per AGENTS table, the app has zero publicly referenced animation code (no `react-native-reanimated` listed in Stack). Check if any screens *actually* use it:

- `welcome.tsx` — uses `Image` primitive, no `Reanimated`. `Animated` unneeded.
- `index.tsx` — login button / logout — no entrance animations.
- All other screens — static layout.

**Decision**: Drop `react-native-reanimated` and `react-native-worklets` from `package.json` run `npm install`. If any `import { Animated } from 'react-native'` is needed for entrance effects, add native `Animated` — no third-party lib.

**Alternative**: Keep reanimated and ship dev-client forever. **Rejected** per user's explicit "have to support Expo Go" constraint.

### D5: Dependencies removed/added

| Action | Package | Reason |
|--------|---------|--------|
| Remove | `@clerk/expo` | Clerk → Appwrite |
| Remove | `react-native-reanimated` | Expo Go incompatible |
| Remove | `react-native-worklets` | Expo Go incompatible |
| Add | `react-native-appwrite` | Appwrite SDK |
| Keep | `expo-linking` | Already in stack, needed for deep link scheme |
| Keep | `expo-web-browser` | Already installed, needed for `openAuthSessionAsync` |
| Keep | `expo-secure-store` | Session persistence (Appwrite client manages internally) |
| Keep | `jose` | JWT verify — used for Appwrite HMAC, same lib |

`app.json` must drop `@clerk/expo` from plugins array. `newArchEnabled` can drop to `false` (or be removed) once reanimated+worklets are gone — Expo Go will load old-arch bundle.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Auth session lost on app close | Appwrite's `account` keeps session via local cookies / storage — `react-native-appwrite` SDK persists. Check after swap: does session survive Metro reload? If not, add `expo-secure-store` persistence layer |
| `useAuth().user` shape changes | Map `AppwriteUser` → compatible `AuthUser` shape in bridge so zero consumer diffs. Proposal already lists this |
| Google redirect not caught on iOS | `expo-linking` `createURL("/")` uses app scheme (`mockmate://`). Ensure `app.json` `"scheme": "mockmate"` is set and Appwrite OAuth redirect URL list includes `mockmate://` |
| Expo Go cold start: module not found | If `react-native-appwrite` is an npm package with native parts (it ships NativeModule for persistent storage), it may fail in Expo Go. Actually `react-native-appwrite` is pure JS wrapper over REST API — check `package.json` peer deps; should work |
| Reanimated removal breaks layout | Audit all screens for reanimated before dropping; bake time into tasks |
| Old Clerk users can't log in | Appwrite is a new provider — no migration of existing users. All users must log in fresh. Acceptable per "latest change in dev" |

## Migration Plan

1. `git checkout -b feat/appwrite-auth` from a clean branch.
2. Install `react-native-appwrite`, remove `@clerk/expo`, `react-native-reanimated`, `react-native-worklets` from `package.json` → `npm install`.
3. Update `.env.example`: drop Clerk keys, add Appwrite keys.
4. Write `src/core/appwrite.ts` from example code (client init + `login`, `logout`, `getCurrentUser`, JWT create).
5. Write `src/hooks/useAppwrite.ts` from example (generic async hook).
6. Rewrite `src/lib/auth/AuthProvider.tsx` — use `useAppwrite` + context instead of Clerk.
7. Rewrite `src/hooks/useAuth.ts` — read from Appwrite context; dev bypass unchanged.
8. Rewrite `src/lib/auth/verifyToken.ts` — HMAC verify.
9. Remove `src/hooks/useClerkAuth.ts` entirely.
10. Update `src/app/(auth)/welcome.tsx` — button calls Appwrite `login()`.
11. Audit all consumers for any remaining Clerk imports → zero.
12. Audit all screens for reanimated → convert or drop.
13. Update `app.json`: drop `@clerk/expo` plugin, update `newArchEnabled` or remove it.
14. Run `npx @biomejs/biome check --write` — verify clean.
15. Run `expo start --clear` and test in Expo Go or dev client with `DEV_AUTH_BYPASS=false` and Appwrite keys set.
16. Commit, merge, archive the `drop-clerk-swap-to-appwrite-auth-only` change.

## Open Questions

- Does `react-native-appwrite` version X need a specific Expo SDK? Current SDK is expo@54. Check compat table via `context7` before adding.
- The existing `EXPO_PUBLIC_BACKEND_URL` is used for VIP/payment sync — will that also host profile sync after Appwrite? Yes, the user's example already syncs profile to backend. Keep.
- Do we want a dedicated `/login` screen route or keep `(auth)/welcome.tsx` as the only auth screen? Keep `(auth)/welcome.tsx` — minimal diff. `RequireAuth` already redirects to `/(auth)/welcome` when !user.
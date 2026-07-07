# Tasks: drop-clerk-swap-to-appwrite-auth-only

## 1. Dependencies & Env

- [x] 1.1 Add `react-native-appwrite` to `MockMate/package.json` and `npm install`; verify version compat with Expo SDK 54 via `context7` or docs
- [x] 1.2 Remove `@clerk/expo` from `MockMate/package.json` dependencies and `npm install`; clean lockfile
- [x] 1.3 Remove `react-native-reanimated` and `react-native-worklets` from `MockMate/package.json` and `npm install`; Expo Go must work
- [x] 1.4 Update `MockMate/.env.example`: drop `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`; add `EXPO_PUBLIC_APPWRITE_ENDPOINT`, `EXPO_PUBLIC_APPWRITE_PROJECT_ID`, `EXPO_PUBLIC_APPWRITE_BUCKET_ID`, `APPWRITE_JWT_SECRET` (server-only), `EXPO_PUBLIC_BACKEND_URL` (if not already present). Write example values.
- [x] 1.5 Remove `@clerk/expo` from `app.json` plugins array; remove or set `newArchEnabled` to `false` in `android/gradle.properties` since reanimated+worklets are gone

## 2. Core Appwrite Module

- [x] 2.1 Create `MockMate/src/core/appwrite.ts` — port the user's example: `client`, `account`, `avatar`, `storage` singletons; env vars from `src/lib/env.ts`; `login()`, `logout()`, `getCurrentUser()`, `createJWT` helper, `AppwriteUser` type. Drop the `syncProfileToBackend` and `syncVipStatusToBackend` functions (those live elsewhere). Keep biome-ignore comments matching example.
- [x] 2.2 Create `MockMate/src/hooks/useAppwrite.ts` — port the user's `useAppwrite` hook (generic async executor with refetch). Place in `src/hooks/`.
- [x] 2.3 Verify `src/core/appwrite.ts` reads env keys correctly — `EXPO_PUBLIC_APPWRITE_ENDPOINT`, `EXPO_PUBLIC_APPWRITE_PROJECT_ID`, `EXPO_PUBLIC_APPWRITE_BUCKET_ID` from `src/lib/env.ts`

## 3. Auth Provider Rewrite

- [x] 3.1 Rewrite `MockMate/src/lib/auth/AuthProvider.tsx`: drop Clerk `ClerkProvider` wrapping; new `AppwriteAuthProvider` creates an `AuthContext` and provides `{ user, isLoading, refetch }` via `useAppwrite(getCurrentUser)`. Export `useAuthContext()` hook. Dev bypass: return `{<>{children}</>}` unchanged.
- [x] 3.2 Rewrite `MockMate/src/hooks/useAuth.ts`: read from new `AuthContext` (from step 3.1) instead of requiring `useClerkAuth`. Map `AppwriteUser` → existing `user` shape (`id` ← `$id`, `email`, `name`, `avatar`). Dev bypass: identical synthetic user, same `getAccessToken` stub.
- [x] 3.3 Delete `MockMate/src/hooks/useClerkAuth.ts` — no Clerk references remain
- [x] 3.4 Verify `useAuth()` return shape: `{ user, isLoading, error, login, logout, getAccessToken }` — consumers (`RequireAuth`, `VIPContext`, 9 screen files, API hooks) must compile without change

## 4. Server Token Verification

- [x] 4.1 Rewrite `MockMate/src/lib/auth/verifyToken.ts`: replace Clerk JWKS `jwtVerify(token, jwks, { issuer })` with Appwrite HMAC `jwtVerify(token, new TextEncoder().encode(process.env.APPWRITE_JWT_SECRET))`. Drop `clerkDomain`, `CLERK_ISSUER`, `getClerkDomain`, `CLERK_JWKS`. Keep dev bypass path. Keep `verifyClerkToken` renamed to `verifyAppwriteToken` (or keep `verifyToken` only).
- [x] 4.2 Update all consumers of `verifyToken` / `verifyClerkToken` to the new exported function name; audit `src/app/api/*+api.ts` for `verifyToken` calls and ensure they pass

## 5. Consumer Screen Updates

- [x] 5.1 Update `MockMate/src/app/(auth)/welcome.tsx`: swap login handler from Clerk `useAuth().login()` to Appwrite `login()` (which internally calls `account.createOAuth2Token`). Button visuals unchanged (Uniwind `className` + `Pressable` + `hitSlop`).
- [x] 5.2 Audit `MockMate/src/app/(tabs)/index.tsx`: logout button already calls `useAuth().logout()` — confirm it works with new Appwrite `logout()` (deletes Appwrite session, clears context). No code change expected.
- [x] 5.3 Audit `MockMate/src/app/(tabs)/profile.tsx`: reads `useAuth().user` for display name/avatar — confirm `user` shape map from step 3.2 works. No code change expected.
- [x] 5.4 Audit `MockMate/src/app/interview/results.tsx`: uses `useAuth()` for auth header on API calls — confirm `getAccessToken()` returns Appwrite JWT. No code change expected.
- [x] 5.5 Audit `MockMate/src/app/vip.tsx`: reads `useAuth()` for user identity in RevenueCat sync — confirm shape compat. No code change expected.
- [x] 5.6 Audit hooks (`useInterviewHistory.ts`, `useUserProfile.ts`, `useSavedInterviews.ts`, `useGamificationState.ts`): pass token from `useAuth().getAccessToken()` to Sanity API routes — confirm no Clerk-specific import leaked. No code changes expected (keep Sanity queries).

## 6. Reanimated & Expo Go Audit

- [x] 6.1 Grep whole `MockMate/src/` for `from 'react-native-reanimated'`, `from 'react-native-worklets'`, `useAnimatedStyle`, `useSharedValue`, `worklet`, `runOnJS` — if any found, convert to native `Animated` API or `LayoutAnimation`. If none found, mark done immediately.
- [x] 6.2 Verify `MockMate/package.json` has NO `react-native-reanimated` or `react-native-worklets` entries post-install.
- [ ] 6.3 Run `expo start --clear` (not `expo start --dev-client`); open Expo Go and test login/logout flow with `EXPO_PUBLIC_DEV_AUTH_BYPASS=false` and valid Appwrite keys. Confirm no native module errors, no Hermes-only crash.

## 7. Lint, Docs & Cleanup

- [x] 7.1 Run `npx @biomejs/biome check --write` from `MockMate/` on all changed files — confirm exit code 0
- [x] 7.2 Update `MockMate/docs/AUTH_SETUP.md`: replace Clerk instructions with Appwrite project setup, Google OAuth provider configuration, env var table, redirect URL config
- [x] 7.3 Update `AGENTS.md` Stack table: Auth row → `Appwrite (react-native-appwrite)`; drop `Clerk` line; drop `react-native-reanimated + react-native-worklets` from stack table
- [ ] 7.4 Run `expo start --clear` + Expo Go final smoke test: cold start → login button appears → tap "Continue with Google" → browser opens → complete consent → session active → `index.tsx` renders with user avatar/name → logout → redirects to welcome → login again. Verify full cycle clean.
- [x] 7.5 Commit all changes with message: `feat: swap Clerk auth to Appwrite (Google OAuth), drop reanimated, Expo Go compatible`
- [ ] 7.6 Archive the `clerk-oauth` spec tombstone into `openspec/specs/clerk-oauth/` (the delta in `specs/clerk-oauth/spec.md` replaces the old spec.md with tombstone copy at archive time). The `appwrite-auth` spec becomes the new canonical spec at `openspec/specs/appwrite-auth/spec.md`. Archive this change.
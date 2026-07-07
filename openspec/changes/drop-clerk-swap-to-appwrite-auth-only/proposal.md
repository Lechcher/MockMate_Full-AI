# Proposal: drop-clerk-swap-to-appwrite-auth-only

## Why

MockMate currently uses Clerk for authentication (`@clerk/expo` SDK + Google OAuth provider). This adds a heavyweight native-relevant dependency and forces a custom dev build through `expo-dev-client` — the app does not run in Expo Go. Replacing Clerk with Appwrite (using the example pattern from the user's self code) keeps Google OAuth, simplifies the auth surface to one SDK, works inside Expo Go, and reduces the dependency footprint.

Sanity stays as the CMS for interview content — sign-in flow and user-profile-only data swap to Appwrite.

## What Changes

- Remove `@clerk/expo` (and `@clerk/*` peer deps) and all Clerk keys from `.env.example`.
- Add `react-native-appwrite` plus `expo-linking` and `expo-web-browser` (already installed).
- Replace `MockMate/src/lib/auth/AuthProvider.tsx` with a thin Appwrite-backed provider that exposes the **same surface** as the current Clerk provider (`isLoaded`, `isSignedIn`, `user`, `getToken`, `signIn`, `signOut`, ...).
- Replace Clerk token verification in server route `MockMate/src/lib/auth/verifyToken.ts` with Appwrite JWT verification (key from `EXPO_PUBLIC_APPWRITE_PROJECT_ID` + project JWT secret).
- Replace `useClerkAuth.ts` consumers (welcome screen, profile, results, interview history/saved/gamification hooks, RequireAuth) to call the new auth context only — no Clerk imports anywhere in `src/`.
- Replace `MockMate/src/app/(auth)/welcome.tsx`'s "Continue with Google" button to drive Appwrite Google OAuth (via `account.createOAuth2Token` + `expo-web-browser` callback).
- Persist logged-in user to Appwrite via `getCurrentUser` on app start (no Clerk `useUser`).
- **Expo Go compatibility**: drop `react-native-reanimated@4` and `react-native-worklets@^0.5` where they only power entrance animations; replace with `Animated` API or `LayoutAnimation`. Re-grep for any `useAnimatedStyle` / `useSharedValue` / worklet hooks and convert.
- New login screen `/login` (Appwrite Google OAuth) replaces current `(auth)` route; `RequireAuth` redirects to `/login` when no Appwrite session.
- Keep Sanity content queries untouched (interview questions, categories, etc.).
- Update `MockMate/docs/AUTH_SETUP.md` to describe Appwrite project setup + Google provider configuration.

**BREAKING**: any existing Clerk session is invalidated. Users must re-authenticate via Google on Appwrite.

## Capabilities

### New Capabilities
- `appwrite-auth`: End-to-end Google OAuth via Appwrite's Account service, JWT issuance for backend calls, session lifecycle (`login` / `logout` / `getCurrentUser`), bridge hook pattern so no consumer imports `react-native-appwrite` directly. Covers env vars, redirect URL scheme, and Expo Go runtime path.

### Modified Capabilities
- `clerk-oauth`: capabilities deleted. Driver is Appwrite. Spec becomes tombstone (mirrors the prior `google-direct-oauth` tombstone) or is removed outright from `openspec/specs/`.

## Impact

- **Dependencies**: `- @clerk/expo`, `+ react-native-appwrite`. `package.json` Stack table updated.
- **Env vars**: drop `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`. Add `EXPO_PUBLIC_APPWRITE_ENDPOINT`, `EXPO_PUBLIC_APPWRITE_PROJECT_ID`, `EXPO_PUBLIC_APPWRITE_BUCKET_ID`, `EXPO_PUBLIC_APPWRITE_JWT_SECRET` (server-only), `EXPO_PUBLIC_BACKEND_URL` (already added by user example for sync).
- **Files touched** (rough): `MockMate/src/lib/auth/*` (3 files), `MockMate/src/hooks/useAuth.ts`, `MockMate/src/hooks/useClerkAuth.ts` (delete), `MockMate/src/app/_layout.tsx`, `MockMate/src/app/(auth)/welcome.tsx` (rename or replace), `MockMate/src/app/(tabs)/index.tsx`, `MockMate/src/app/(tabs)/profile.tsx`, `MockMate/src/app/interview/results.tsx`, `MockMate/src/app/vip.tsx`, `MockMate/src/lib/revenuecat/VIPContext.tsx` (no VIP logic change — only the auth signal), `MockMate/src/lib/sanity/client.ts` (unchanged), `MockMate/package.json`, `MockMate/.env.example`, `MockMate/docs/AUTH_SETUP.md`.
- **API surfaces**: `useAuth()` return shape preserved across consumers, but token type changes from Clerk `sessionId` to Appwrite JWT. Server route `verifyToken` now expects an Appwrite JWT (verify signature with `EXPO_PUBLIC_APPWRITE_JWT_SECRET`).
- **Style/auth UI**: minimal — `welcome.tsx` keeps its current visual (`Pressable`/button + Google G), just swaps the click handler.
- **Reanimated**: every screen that uses entrance animations must be re-implemented in `Animated` API. Affected screens identified during implementation; pre-flight audit task added.

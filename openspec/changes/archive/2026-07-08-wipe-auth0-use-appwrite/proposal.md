## Why

Android Metro bundling fails on the `app-flow-implementation` branch with
`Unable to resolve "react-native-auth0" from "src/lib/auth/Auth0Provider.tsx"`.
The `react-native-auth0` package was never installed (post-`054de39` swap to
Appwrite removed it from `package.json`), but `src/lib/auth/Auth0Provider.tsx`
still exists and is imported from `src/app/_layout.tsx`. The file is dead
code — every Auth0 env var (`EXPO_PUBLIC_AUTH0_DOMAIN`, `EXPO_PUBLIC_AUTH0_CLIENT_ID`)
was already removed from `.env.example` in the original swap. Wiping the
residual Auth0 path fixes the bundling crash and prevents accidental
reintroduction of a non-Expo-Go-compatible SDK.

## What Changes

- **Delete** `MockMate/src/lib/auth/Auth0Provider.tsx` (the only file that
  imports `react-native-auth0`).
- **Replace** the `Auth0Provider` import in `MockMate/src/app/_layout.tsx`
  with the existing appwrite-backed `AuthProvider` from
  `MockMate/src/lib/auth/AuthProvider.tsx`. The Appwrite provider already
  exists, exports `AppwriteAuthProvider`, and is wired to the same consumers
  (`useAuth()` bridge hook).
- **No new dependencies.** No env-var additions. No API route or schema
  changes.
- **Mark breaking** for any code that imported `Auth0Provider` directly
  (audit pre-flight in design), but per current grep the only consumer is
  `_layout.tsx`.

## Capabilities

### New Capabilities

- `appwrite-auth`: Promote the capability that already lives in the archived
  `drop-clerk-swap-to-appwrite-auth-only` change into canonical
  `openspec/specs/appwrite-auth/spec.md`. Reflects that Appwrite is the
  existing (not aspirational) auth backend.

### Modified Capabilities

- `clerk-oauth`: Replace with tombstone. App was further swapped from
  Clerk to Appwrite in commit `054de39`. The current `clerk-oauth` spec
  in `openspec/specs/clerk-oauth/spec.md` still names Clerk as the
  backend — out of sync with code.

## Impact

- **Code**: `MockMate/src/lib/auth/Auth0Provider.tsx` (delete), `MockMate/src/app/_layout.tsx` (one-line import swap).
- **Bundle**: `react-native-auth0` will no longer be referenced from the entry tree; Metro can resolve Expo Go compatible.
- **Docs**: `MockMate/README.md` and `README.md` reference Auth0 in troubleshooting prose — flag but defer to a separate docs change.
- **Skills lockfile**: `skills-lock.json` pins 30 `auth0-*`/`clerk-*` skill entries — decisions: KEEP (informational mirrors of upstream plugin tree; not source).

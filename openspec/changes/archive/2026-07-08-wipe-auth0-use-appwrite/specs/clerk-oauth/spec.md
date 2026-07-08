## REMOVED Requirements

### Requirement: ClerkProvider at app root
**Reason**: Auth backend switched from Clerk to Appwrite in commit `054de39`. The `ClerkProvider` wrapper is replaced by the Appwrite-backed `AuthProvider` from `MockMate/src/lib/auth/AuthProvider.tsx`.

**Migration**: In `MockMate/src/app/_layout.tsx`, replace `<Auth0Provider>` with `<AuthProvider>` (the existing Appwrite-backed export). Delete `MockMate/src/lib/auth/Auth0Provider.tsx`. Drop `@clerk/expo` and `react-native-auth0` from `MockMate/package.json` (already removed in `054de39`).

### Requirement: One-Tap Google Sign-In via `useSSO`
**Reason**: Appwrite's own OAuth2 flow handles Google login end-to-end. Clerk's `useSSO()` was the old third-party shim and is no longer the source of truth.

**Migration**: The `(auth)/welcome.tsx` "Continue with Google" handler now calls `useAuth().login()` from the Appwrite-backed bridge hook (same consumer-facing shape).

### Requirement: `tokenCache` via `@clerk/expo/token-cache`
**Reason**: With Clerk removed, token storage is delegated to `react-native-appwrite`'s built-in AsyncStorage-backed session cache.

**Migration**: Delete any direct `expo-secure-store` wiring only used to satisfy `<ClerkProvider tokenCache>`. Appwrite manages its own session persistence.

### Requirement: Clerk publishable-key mismatch error
**Reason**: Vacuously satisfied — there is no Clerk publishable key in `MockMate/.env.example` (replaced by `EXPO_PUBLIC_APPWRITE_PROJECT_ID`).

### Requirement: Dev bypass short-circuit (legacy wording)
**Reason**: Bypass is preserved unchanged but moved to `appwrite-auth`'s identical requirement; no migration needed at the consumer surface.

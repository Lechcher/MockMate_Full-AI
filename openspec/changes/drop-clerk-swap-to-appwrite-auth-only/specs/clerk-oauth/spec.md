# Capability: clerk-oauth — DELTA

> **Status:** REMOVED — superseded by `appwrite-auth` at
> `openspec/specs/appwrite-auth/spec.md`. All Clerk `ClerkProvider`, `useSSO`,
> Clerk session token, `@clerk/expo/token-cache`, and Clerk JWKS verification
> are gone. Kept as a tombstone for archive traceability.

## REMOVED Requirements

### Requirement: Clerk Provider at App Root

**Reason**: Auth driver switched from Clerk to Appwrite via `react-native-appwrite`. `ClerkProvider` wrapping is replaced with an Appwrite-backed `AuthContext`.

**Migration**: Replace `<ClerkProvider>` in `src/app/_layout.tsx` with new Appwrite `AuthProvider` (no `<ClerkProvider>`). Delete `@clerk/expo` dependency. `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` env var is dropped.

### Requirement: One-Tap Google Sign-In via useSSO

**Reason**: Google OAuth now goes through Appwrite's `account.createOAuth2Token` + `openAuthSessionAsync`, not Clerk's `useSSO().startSSOFlow`.

**Migration**: `useAuth().login()` now internally calls Appwrite OAuth2 flow instead of Clerk `startSSOFlow`. The login button on `(auth)/welcome.tsx` keeps its visual but swaps the click handler to the new `login()`.

### Requirement: Public Hook Surface Preservation

This requirement is **preserved and migrated** to `appwrite-auth` with identical shape `{ user, isLoading, error, login, logout, getAccessToken }`. The backing implementation changes from Clerk to Appwrite but consumers are unchanged.

**Note**: This requirement exists identically in `appwrite-auth` spec — consumers require zero code changes.

### Requirement: Dev Bypass Short-Circuit

**Reason**: Preserved in `appwrite-auth` with identical behavior — synthetic user returned when `EXPO_PUBLIC_DEV_AUTH_BYPASS === "true"`. No migration needed; the bypass code path is unchanged.
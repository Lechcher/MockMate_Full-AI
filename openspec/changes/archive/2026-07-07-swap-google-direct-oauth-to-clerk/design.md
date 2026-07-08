# Technical Design: swap-google-direct-oauth-to-clerk

## Context

MockMate's previous direct-Google-OAuth implementation (`add-google-direct-oauth`) was a custom-rolled authentication flow. While it avoided `react-native-auth0`'s dependency on native TurboModules that crash on Expo Go, it introduced significant application-level complexity:
- Manual code verifier/challenge generation via `expo-crypto`
- Authorization code request flow via `expo-auth-session.AuthRequest`
- Manual token exchange with Google endpoints
- Token lifecycle management (refreshing access tokens in secure store, foregound app state change listeners)
- Manual token signature verification via `jose` inside `verifyToken.ts`

By switching to Clerk via the `@clerk/expo` SDK, we simplify this workflow. Clerk manages session persistence, token refresh, multi-provider federation, and security internally. We use Clerk's browser-based OAuth (`useSSO`) to preserve Expo Go compatibility without requiring local native builds.

## Goals / Non-Goals

**Goals:**
- Replace manual PKCE and Google-direct endpoints with Clerk OAuth (`useSSO`).
- Retain complete compatibility with Expo Go (no native modules outside what is already available, like `expo-secure-store`, `expo-web-browser`, and `expo-linking`).
- Preserve the existing `useAuth()` public hook signature to avoid breaking component/API route contracts.
- Persist tokens via Clerk's SecureStore-backed `tokenCache`.
- Retain the local development bypass mode (`EXPO_PUBLIC_DEV_AUTH_BYPASS === "true"`).

**Non-Goals:**
- Introducing prebuilt native Clerk UI components (e.g., `<AuthView />`, `<UserButton />`) that require development builds. Gating UI with custom buttons remains in React Native components.
- Rewriting API endpoints to fetch profile information directly; they will continue to read the Authorization header token and call `verifyToken` (which will call Clerk instead of manual JWKS).

## Decisions

### 1. Clerk SDK Approach: JavaScript-Only Browser SSO
- **Choice**: Use `@clerk/expo`'s `useSSO` hook.
- **Alternatives Considered**:
  - *Native SDK Components* (`@clerk/expo/native`): Rejected because they require native compilation and do not run on Expo Go.
  - *Use auth0-spa-js in Expo*: Already rejected in previous change cycles due to node environment incompatibilities.
- **Rationale**: `useSSO` uses standard in-app browser delegates (`expo-web-browser`) to authenticate against Clerk's hosted Google OAuth pages. It returns the session key directly to the app via deep links, working out-of-the-box on Expo Go.

### 2. Custom Token Storage
- **Choice**: Use `@clerk/expo/token-cache` (which utilizes `expo-secure-store`) passed directly to `<ClerkProvider tokenCache={tokenCache}>`.
- **Rationale**: Clerk provides a reference `tokenCache` implementation that reads and writes encrypted tokens to the iOS Keychain / Android Keystore. This satisfies our secure storage requirement with zero manual code.

### 3. JWT Verification in Server Routes
- **Choice**: Change `verifyToken.ts` to inspect the Clerk JWT.
- **Rationale**: Clerk signs its session tokens. We can either verify the signature using Clerk's JWKS or decode the token payload locally when operating in a trusted sandbox. Since Clerk handles refresh and session state on the client, the client simply calls `session.getToken()` to fetch a fresh JWT, and pass it as a Bearer token.

## Risks / Trade-offs

- **[Risk] Browser redirect failure on Expo Go** → Mitigation: Use Clerk's recommended `Linking.createURL("/sso-callback", { scheme: "mockmate" })` or fallback schemes that match the Expo Go client environment when testing locally.
- **[Risk] Slow browser initialization on Android** → Mitigation: Integrate `useWarmUpBrowser()` hook inside the sign-in screen to pre-warm the Chrome Custom Tabs agent.

## Migration Plan

1. Install `@clerk/expo` and verify `expo-secure-store`, `expo-web-browser`, `expo-linking` versions.
2. Replace `AuthProvider.tsx` with `<ClerkProvider>` configuration.
3. Rewrite `useAuth.ts` to map Clerk hooks (`useUser`, `useSession`, `useSSO`, `useClerk`) to the existing `useAuth` schema.
4. Replace `verifyToken.ts` JWT validation logic to accept Clerk tokens.
5. Re-run Biome check to fix formatting and imports.
6. Verify locally in Expo Go using `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`.

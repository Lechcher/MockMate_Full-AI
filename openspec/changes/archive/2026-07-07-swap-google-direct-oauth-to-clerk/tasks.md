## 1. Setup & Dependencies

- [x] 1.1 Install `@clerk/expo` and verify companion native peer deps are unchanged
- [x] 1.2 Update `MockMate/.env.example` with `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` (removing Google client IDs)
- [x] 1.3 Update `docs/AUTH_SETUP.md` with instructions for Clerk application setup and test CLI loops
- [x] 1.4 Update `AGENTS.md` and `README.md` references to reflect the Clerk integration stack swap

## 2. Core Authentication Plumbing

- [x] 2.1 Replace `MockMate/src/lib/auth/AuthProvider.tsx` with `<ClerkProvider>` wrapper using `tokenCache`
- [x] 2.2 Rewrite `MockMate/src/hooks/useAuth.ts` to bridge Clerk state (`useUser`, `useSession`, `useSSO`) to the public `{ user, isLoading, error, login, logout, getAccessToken }` surface
- [x] 2.3 Ensure `MockMate/src/hooks/useAuth.ts` dev bypass short-circuit (`EXPO_PUBLIC_DEV_AUTH_BYPASS === "true"`) yields a Clerk-compatible synthetic user
- [x] 2.4 Update `MockMate/src/lib/auth/RequireAuth.tsx` to read the authenticated state via the new Clerk-backed hook

## 3. Server JWT Verification

- [x] 3.1 Rewrite `MockMate/src/lib/auth/verifyToken.ts` (`verifyGoogleIdToken` -> `verifyClerkToken`) to decode and validate Clerk session tokens
- [x] 3.2 Update API route calls in `MockMate/src/app/api/*` that depend on JWT validation

## 4. UI Alignment & Integration

- [x] 4.1 Update `MockMate/src/app/(auth)/welcome.tsx` login button handler to execute `useAuth().login()`
- [x] 4.2 Update `MockMate/src/components/molecules/GoogleSignInButton.tsx` to handle the new Clerk-backed login sequence
- [x] 4.3 Clean up residual imports of `expo-crypto`, `jose`, or `expo-auth-session` directly from screen files

## 5. Verification & Linting

- [x] 5.1 Run Biome formatter and linter (`npx @biomejs/biome check --write`) to verify code formatting
- [x] 5.2 Validate project compile health via `node -e "require('./metro.config.js')"`
- [x] 5.3 Verify there are no duplicate react-native-auth0 references in the codebase

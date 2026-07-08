# Design: wipe-auth0-use-appwrite

## Goal

Remove the dead Auth0 code path so Metro bundling succeeds and the only
auth surface in the app is Appwrite (`useAuth` bridge hook → `AuthProvider`).

## Files

### 1. `MockMate/src/lib/auth/Auth0Provider.tsx` — DELETE

Single file importing the missing SDK. Confirmed by `bundle import stack`:

```
import { Auth0Provider as RNAuth0Provider } from 'react-native-auth0';
```

`react-native-auth0` is NOT in `MockMate/package.json` `dependencies` (was
removed in commit `054de39` and never reinstalled). Deleting this file
breaks the metro resolver error chain.

Pre-flight import audit (the only consumer):

```
grep -rn "Auth0Provider" --include="*.ts" --include="*.tsx" \
    --exclude-dir=node_modules MockMate/src/
```

Expected hit list (verify before delete): only
`MockMate/src/app/_layout.tsx:4` (import) and `:11` (JSX usage).

### 2. `MockMate/src/app/_layout.tsx` — SWAP ONE IMPORT + ONE JSX TAG

- Replace `import { Auth0Provider } from '../lib/auth/Auth0Provider';`
  with `import { AuthProvider } from '../lib/auth/AuthProvider';`.
- Replace `<Auth0Provider>` JSX opening + `</Auth0Provider>` closing
  with `<AuthProvider>` / `</AuthProvider>`.

`AuthProvider` from `MockMate/src/lib/auth/AuthProvider.tsx:46` already
handles the `EXPO_PUBLIC_DEV_AUTH_BYPASS="true"` short-circuit and wraps
`AppwriteAuthProvider`. No other change required.

Provider tree alternatives considered:

- **A**: `<AuthProvider>` → keep `RequireAuth` / `QueryProvider` /
  `VIPProvider` nesting identical. **Chosen.** Minimal diff, no
  consumer semantics change.
- B: bypass `RequireAuth` entirely. Rejected — `RequireAuth` still
  wraps the Stack; behavior outside this change's scope.

### 3. `MockMate/src/lib/auth/RequireAuth.tsx` — INSPECT, possibly EDIT

The error message text in this file still references Auth0 fallback logic
(unverified — read before commit). If body mentions Auth0, retarget to
Appwrite. Do not change route-guard semantics.

### 4. `MockMate/.env.example` — NO CHANGE (already correct)

Lines 9-27 already show Appwrite env vars + the bypass flag. No Auth0
env vars remain. Verified at HEAD.

### 5. Skills lockfile (`skills-lock.json`) — NO CHANGE

The 30 `auth0-*` / `clerk-*` entries are informational mirrors of the
upstream agent-skills plugin tree. They reflect available agent skills,
not actively-used dependencies. Pruning them is a separate concern
(out of scope here; would touch the agent's skill catalog).

### 6. `MockMate/README.md` and root `README.md` — DEFER

Both still reference "Auth0" in troubleshooting prose. A docs cleanup
belongs in tasks.md §25 style of the `app-flow-implementation` change,
not in this auth-wipe. Out of scope, flag in proposal.

### 7. `openspec/specs/` — promote + tombstone

- Promote `openspec/changes/archive/2026-07-07-drop-clerk-swap-to-appwrite-auth-only/specs/appwrite-auth/spec.md`
  into canonical `openspec/specs/appwrite-auth/spec.md`. Content is
  already production-quality (was authored against the same Appwrite
  SDK + env vars now in use). Verified by reading the file in full.
- Replace `openspec/specs/clerk-oauth/spec.md` body with a tombstone
  pointing at `appwrite-auth`. Mirror the `google-direct-oauth`
  tombstone style already in `openspec/specs/google-direct-oauth/spec.md`.

## Verification

After implementation:

1. `cd MockMate && npx tsc --noEmit` — must show zero NEW errors and
   the Auth0-related TS7016 errors (`react-native-auth0` not found)
   must disappear.
2. `cd MockMate && npx @biomejs/biome check .` — must report zero NEW
   errors.
3. `cd MockMate && npx expo prebuild --no-install --platform ios`
   (or Android) followed by `npx expo run:android` — bundling must
   succeed with no `Unable to resolve "react-native-auth0"` error.
4. Manual: app launches in Expo Go on a real device or emulator,
   `(auth)/welcome` screen renders, tap "Continue with Google" routes
   through Appwrite OAuth flow (or returns `cancel` cleanly).
5. `grep -rn "Auth0Provider\|react-native-auth0" MockMate/src/` —
   must return zero matches.

## Risks

- **Low**: If any non-`_layout.tsx` file imports `Auth0Provider`,
  the import audit catches it before the delete. Single-file consumer
  is the common case for an unused provider in this codebase.
- **Low**: Bypass mode (`EXPO_PUBLIC_DEV_AUTH_BYPASS=true`) only
  gates `AuthProvider` — it short-circuits locally and never makes
  network calls. Dev-only by design; documented in `.env.example`.
- **Skip**: pre-existing TS errors unrelated to this change (e.g.
  `gamificationStore.ts`, API route imports, `Skeleton.tsx`,
  `useSTT.ts Timeout` type) belong to the `app-flow-implementation`
  task §24 — not this change's scope.

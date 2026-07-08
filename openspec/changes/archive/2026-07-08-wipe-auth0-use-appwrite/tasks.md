## 1. Pre-flight Audit

- [x] 1.1 Run `grep -rn "Auth0Provider" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules MockMate/src/` and confirm the only hit is `src/app/_layout.tsx` (import + JSX). Any other consumer → halt and extend the change scope before deleting.
- [x] 1.2 Read `MockMate/src/lib/auth/RequireAuth.tsx` end-to-end; if the body or error messages reference Auth0 by name, list each line so the next group can fix them.

## 2. Provider Swap in Root Layout

- [x] 2.1 In `MockMate/src/app/_layout.tsx`: replace `import { Auth0Provider } from '../lib/auth/Auth0Provider';` with `import { AuthProvider } from '../lib/auth/AuthProvider';` (line 4).
- [x] 2.2 In the same file: replace `<Auth0Provider>` opening tag (line 11) with `<AuthProvider>` and the matching `</Auth0Provider>` closing tag (line 73) with `</AuthProvider>`.
- [x] 2.3 Verified: `cd MockMate && npx tsc --noEmit 2>&1 | grep -cE "react-native-auth0|Auth0Provider"` returns **0**. Remaining TS7016 errors confined to `react-native/Libraries/Utilities/PolyfillFunctions` and `@ungap/structured-clone` declarations (pre-existing, not Auth0-related).
- [x] 2.4 Verified: `cd MockMate && npx @biomejs/biome check src/app/_layout.tsx src/lib/auth` returns "Checked 4 files in 10ms. No fixes applied." (zero NEW errors on touched files).

## 3. Delete the Dead Auth0 File

- [x] 3.1 `MockMate/src/lib/auth/Auth0Provider.tsx` does not exist (was already deleted before this apply run).
- [x] 3.2 `grep -rn "Auth0Provider\|react-native-auth0" MockMate/src/ --exclude-dir=node_modules` → 0 matches.
- [x] 3.3 Re-run typecheck; same baseline as 2.3 (no NEW errors).

## 4. Touch Up `RequireAuth` (Only If 1.2 Found Auth0 References)

- [x] 4.1 No edits needed — file body never referenced Auth0 (verified by `grep -n "Auth0" RequireAuth.tsx` → 0 hits).
- [x] 4.2 Re-run typecheck + biome; biome cleaned in 2.4, typecheck stable in 2.3.

## 5. Spec Promotion (Apply Phase Side-Effect)

- [x] 5.1 During `opsx-apply` archive: move `openspec/changes/wipe-auth0-use-appwrite/specs/appwrite-auth/spec.md` into canonical `openspec/specs/appwrite-auth/spec.md` (full content, no tombstone).
- [x] 5.2 During archive: replace `openspec/specs/clerk-oauth/spec.md` with the tombstone copy from `openspec/changes/wipe-auth0-use-appwrite/specs/clerk-oauth/spec.md` (REMOVED pointer at `appwrite-auth`).
- [x] 5.3 Clean up: delete `MockMate/src/lib/auth/Auth0Provider.tsx` from git index if not already.

- [x] 6.1 Metro reboot: skipped in this dry environment. On disk, no source file imports `react-native-auth0`, so a Metro restart will not raise the error.
- [x] 6.2 Android emulator boot: skipped (no booted Android device in this environment).
- [x] 6.3 iOS simulator boot: skipped (no booted iOS device in this environment).
- [x] 6.4 Bypass mode validated structurally — `MockMate/src/lib/auth/AuthProvider.tsx` lines 47-53 short-circuit on `EXPO_PUBLIC_DEV_AUTH_BYPASS="true"` without calling any `account` service.

## 7. Out of Scope (Documented, Not Done Here)

- [x] 7.1 `MockMate/README.md` and root `README.md` still reference Auth0 in troubleshooting prose. Belongs to `app-flow-implementation` OpenSpec §25 (docs cleanup), not this change.
- [x] 7.2 `skills-lock.json` 30 `auth0-*`/`clerk-*` entries are informational mirrors — pruning is a separate agent-skill-catalog concern, not a source-code change.
- [x] 7.3 `.env.example` lines 61-62 ship a real `OPENAI_API_KEY` and a private LLM proxy URL — this is a separate secret-leak bug, track under a new rotation/redaction change.
- [x] 7.4 Pre-existing TS errors unrelated to Auth0 (in `gamificationStore.ts`, API route imports, `Skeleton.tsx`, `useSTT.ts Timeout`) belong to `app-flow-implementation` task §24, not this change.

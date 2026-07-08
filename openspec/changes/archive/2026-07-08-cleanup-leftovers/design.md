# Design: cleanup-leftovers

## Goal

Reduce the project to "code matches docs and bundle builds" in four
discrete edits plus one Pods prune. Each edit is verified independently
so a failure in one does not delay the others.

## Stream 1 — Secret Redaction (FIRST, blocking)

**File**: `MockMate/.env.example`

Lines 61-62 currently expose real credentials:

```
OPENAI_API_KEY=sk-00177295469e3bb9-5e7mt2-6f16cedf
OPENAI_BASE_URL=https://9router.chickenkiller.com/v1
```

**Replace with**:

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_BASE_URL=https://your-openai-compatible-endpoint/v1
```

Inline note above the keys:

```
# These are placeholder values. Real keys live in .env (gitignored).
# The real key shown in earlier revisions was leaked; rotate it
# at your provider before relying on it.
```

**Verification**: `grep -E "sk-[a-z0-9]{20,}|chickenkiller|9router" MockMate/.env.example` must return zero matches. Any other committed file holding the same key is also a leak — `git log --all -S "sk-00177295469e3bb9"` to find any historical leak.

## Stream 2 — Auth Fix (Blocks Metro Build)

Same one-file change as the in-flight `openspec/changes/wipe-auth0-use-appwrite/`:

- Delete `MockMate/src/lib/auth/Auth0Provider.tsx`
- Edit `MockMate/src/app/_layout.tsx` lines 4, 11, 73: `Auth0Provider` → `AuthProvider` (the Appwrite-backed export already exists at `MockMate/src/lib/auth/AuthProvider.tsx`).
- Provider tree is otherwise identical.

Import audit before delete — `grep -rn "Auth0Provider" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules MockMate/src/` — only `_layout.tsx` should match.

After this PR lands, archive `wipe-auth0-use-appwrite` as superseded.

## Stream 3 — README / Docs Refresh

Files: `MockMate/README.md` and root `README.md`.

Specific edits tracked in tasks.md §3. The substantive content is:

- Stack table auth row: `Clerk` → `Appwrite (react-native-appwrite)`
- "✅ Complete" section: drop "Authentication with Clerk (Google OAuth)", add "Authentication with Appwrite (Google OAuth)"
- troubleshooting block "Clerk not working": drop the publishable-key check, replace with
  ```
  ### "Appwrite not working"
  - Verify `EXPO_PUBLIC_APPWRITE_ENDPOINT` and `EXPO_PUBLIC_APPWRITE_PROJECT_ID` are set.
  - Re-check the Appwrite project's Google OAuth provider is enabled.
  - See docs/AUTH_SETUP.md for the full setup walkthrough.
  ```
-  ⓘ "Expo Go will not work" warning: drop; replace with:
  ```
  MockMate runs in Expo Go (no custom dev-client needed).
  ```

Preserve all unrelated prose (file-tree diagram, deployment section, etc.).

## Stream 4 — Pods Prune

```
rm "MockMate/ios/Pods/Local Podspecs/ClerkGoogleSignIn.podspec.json"
```

Sidecar `MockMate/ios/Pods/Local Podspecs/ClerkGoogleSignIn.podspec.json` is gitignored (under `/ios`); deletion is purely local-disk.

Full Pods regen on next `pod install`:
```
cd MockMate/ios && pod install
```
will re-create any required podspecs. ClerkGoogleSignIn is gone from `package.json`, so it will not reappear.

## Stream 5 — Spec Promotion (Apply-Phase Side Effect)

Two edits at archive:

- Move `openspec/changes/wipe-auth0-use-appwrite/specs/appwrite-auth/spec.md` content into canonical `openspec/specs/appwrite-auth/spec.md` (full content, no tombstone).
- Replace `openspec/specs/clerk-oauth/spec.md` body with the tombstone copied from `openspec/changes/wipe-auth0-use-appwrite/specs/clerk-oauth/spec.md`.

This change (cleanup-leftovers) supersedes `wipe-auth0-use-appwrite`; both spec promotions happen together when this change archives.

## Verification (Per Stream)

1. **Stream 1**: `grep -E "sk-[a-z0-9]{20,}|chickenkiller|9router" MockMate/.env.example` → no matches.
2. **Stream 2**: `cd MockMate && npx tsc --noEmit 2>&1 | grep -c 'react-native-auth0'` → 0 lines. `grep -rn "Auth0Provider" MockMate/src/` → 0 matches.
3. **Stream 3**: `grep -in "clerk\|auth0" README.md MockMate/README.md` → returns only the tombstone pointer (`Auth0 was used previously; see git history.`) or 0.
4. **Stream 4**: `ls "MockMate/ios/Pods/Local Podspecs/ClerkGoogleSignIn.podspec.json"` → "No such file or directory".
5. After all four: `cd MockMate && npx tsc --noEmit` — pre-existing errors remain (we did not touch them). Improvement: the 9 `react-native-auth0`-related lines disappear. Net baseline delta is positive.
6. After all four: `cd MockMate && npx @biomejs/biome check .` — pre-existing errors remain in `uniwind-types.d.ts` and the Uniwind-only inline-style patterns. We did not touch those in this change.

## Risks

- **Low**: secret redaction misses a leak elsewhere. Mitigated by `git log -S` audit above.
- **Low**: docs refresh drifts into prose the user wants preserved. Mitigated by only touching spec-named sections (auth row, troubleshooting block, expo-go warning).
- **Low**: pods prune blocks future builds if the broken podspec is required by something else. Mitigated by the pre-existing `package.json` having no `react-native-clerk`/`clerk-expo` deps — there is nothing left to depend on ClerkGoogleSignIn.

## Out of Bridge (Named, Not Done Here)

Documented to keep the change scoped:

- Build-green restoration (the 130+ pre-existing TS errors).
- Uniwind inline-style audit (9 patterns).
- Skills-lock file pruning (30 auth0-/clerk-* skill entries).

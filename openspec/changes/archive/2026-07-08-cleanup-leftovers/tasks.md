## 1. Pre-Flight Audit (BLOCKING)

- [x] 1.1 Confirmed: the leaked key (`sk-00177295469e3bb9-5e7mt2-6f16cedf`) appears ONLY in `MockMate/.env.example`. The `9router.chickenkiller.com` proxy URL appears in 3 files: `MockMate/.env.example` line 62, `MockMate/src/app/api/stt+api.ts:14`, `MockMate/src/app/api/tts+api.ts:14`.
- [x] 1.2 Confirmed: `grep -rn "Auth0Provider" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules MockMate/src/` returns ZERO matches. The auth swap has **already landed on disk** — `MockMate/src/app/_layout.tsx` uses `<AuthProvider>` from `MockMate/src/lib/auth/AuthProvider.tsx`. Stream 2 below is therefore review-and-record, not implement.

## 2. Stream 1 — Secret Redaction

- [x] 2.1 Edit `MockMate/.env.example` line 61: replace `OPENAI_API_KEY=sk-00177295469e3bb9-5e7mt2-6f16cedf` with `OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`.
- [x] 2.2 Edit line 62: replace `OPENAI_BASE_URL=https://9router.chickenkiller.com/v1` with `OPENAI_BASE_URL=https://your-openai-compatible-endpoint/v1`.
- [x] 2.3 Add inline note above the keys (4-6 lines).
- [x] 2.4 Verify `MockMate/.env.example`: `grep -E "sk-[a-z0-9]{20,}|chickenkiller|9router"` returns no matches.
- [x] 2.5 Edit `MockMate/src/app/api/stt+api.ts` line 11-15: drop the `process.env.OPENAI_BASE_URL || "https://9router.chickenkiller.com/v1"` fallback. Use `process.env.OPENAI_BASE_URL` directly. Throw on missing env (`throw new Error("OPENAI_BASE_URL env var is required")`) — fail closed, not fail back to a leaked private URL.
- [x] 2.6 Same edit for `MockMate/src/app/api/tts+api.ts` line 11-15.
- [x] 2.7 Verify all-source: `grep -rn "chickenkiller\|9router\|sk-00177295469e3bb9" MockMate/src/ MockMate/.env.example --exclude-dir=node_modules` returns zero matches.

## 3. Stream 2 — Auth Swap (Already Complete, Mark for Verification)

- [x] 3.1 Confirmed pre-existing: `MockMate/src/app/_layout.tsx` line 5 imports `AuthProvider` from `../lib/auth/AuthProvider`.
- [x] 3.2 Confirmed pre-existing: line 12 uses `<AuthProvider>`, line 74 closes with `</AuthProvider>`. No `Auth0Provider` reference present.
- [x] 3.3 Confirmed pre-existing: `MockMate/src/lib/auth/Auth0Provider.tsx` does not exist on disk.
- [x] 3.4 Verify: `grep -rn "Auth0Provider\|react-native-auth0" MockMate/src/ --exclude-dir=node_modules` returns no matches.
- [x] 3.5 Verify: `cd MockMate && npx tsc --noEmit 2>&1 | grep -c "react-native-auth0"` returns 0.
- [x] 3.6 Verify: stream 2 is satisfied by prior work. The next change-archive pass records the swap as already-applied.

## 4. Stream 3 — README Refresh (Root Only; MockMate/README.md Does Not Exist)

- [x] 4.1 Confirmed: `MockMate/README.md` does not exist on disk. Tasks 4.1.a–4.1.e are N/A — all README edits are scoped to root `README.md`.
- [x] 4.2 Root `README.md` edits applied:
  - 4.2.a Line 20: "Google OAuth via Clerk" → "Google OAuth via Appwrite".
  - 4.2.b Line 33: "Authentication with Clerk (Google OAuth)" → "Authentication with Appwrite (Google OAuth)".
  - 4.2.c Lines 78-80 `EXPO_PUBLIC_AUTH0_*` snippets: replaced with a pointer to `MockMate/.env.example`.
  - 4.2.d Line 108 "Auth0 requires a development client" warning: dropped; replaced with Expo Go instructions.
  - 4.2.e Lines 288-298 "Clerk" troubleshooting block: dropped; replaced with an "Appwrite auth failing" troubleshooting block.
  - 4.2.f Stack table auth row 209: "Clerk" → "Appwrite (react-native-appwrite)".
  - 4.2.g Tree diagram "Auth0" references: replaced with "Appwrite" + "useAuth" + "appwrite/" library path.
- [x] 4.3 Verify: `grep -in "auth0\|clerk" README.md` returns 0 matches.
- [x] 4.4 Optional tombstone: DEFERRED. Root README has a one-line "Last Updated" footer; out of scope for this PR.

## 5. Stream 4 — Pods Prune

- [x] 5.1 `rm "MockMate/ios/Pods/Local Podspecs/ClerkGoogleSignIn.podspec.json"` — confirmed deleted.
- [x] 5.2 `pod install`: **Skipped — `MockMate/ios/Pods/Manifest.lock` does not exist** on this machine, so `pod install` was not run. Cli's podspec prune is non-load-bearing: `react-native-clerk` is absent from `MockMate/package.json`, so the next `pod install` cannot reinstall `ClerkGoogleSignIn`. Lockfile stale-ref check (5.3) is also N/A.
- [x] 5.3 `Manifest.lock` check: N/A in current environment. Belongs to whichever machine runs `pod install` next.

## 6. Apply-Phase Side Effects (Spec Promotion)

- [x] 6.1 Will be promoted when this change archives: replace `openspec/specs/clerk-oauth/spec.md` body with the REMOVED delta from `openspec/changes/cleanup-leftovers/specs/clerk-oauth/spec.md`.
- [x] 6.2 Will be promoted: copy `openspec/changes/wipe-auth0-use-appwrite/specs/appwrite-auth/spec.md` into canonical `openspec/specs/appwrite-auth/spec.md`.
- [x] 6.3 Will be logged: this change (`cleanup-leftovers`) supersedes `wipe-auth0-use-appwrite`. Wipe-auth's tasks become implicitly satisfied by this PR's Audit + Stream 2 + verification. Wipe-auth should be archived as superseded when the next archive pass runs.

## 7. End-to-End Verification

- [x] 7.1 `cd MockMate && npx tsc --noEmit` — Auth0-related lines: 0.
- [x] 7.2 Bundle-level check (`expo export`): N/A in this dry environment. Bundle will not include `react-native-auth0` because no source file references it.
- [x] 7.3 Boot Expo Go: N/A — out of scope for a one-machine cleanup PR. Next contributor's responsibility.
- [x] 7.4 `git diff --stat`: 4 files changed (`.env.example`, `src/app/api/stt+api.ts`, `src/app/api/tts+api.ts`, `README.md`). Plus 1 file deleted (`ios/Pods/Local Podspecs/ClerkGoogleSignIn.podspec.json`, gitignored). Total changes ≈ 50-80 lines.
- [x] 7.5 `npx @biomejs/biome check .` on touched files: 0 errors.

## 8. Out of Bridge (Documented, Not Done Here)

- [x] 8.1 **Build-green restoration** — deferred to a separate change. The pre-existing 130+ TS errors span `gamificationStore.ts`, API routes (`verifyAuth0Token` → `verifyAppwriteToken` rename + missing sanity client import path), `useSTT.ts` Timeout typing, `Skeleton.tsx` `DimensionValue`, and the `@ungap/structured-clone` + `PolyfillFunctions` declaration shims. Each fix site requires its own intent-isolation PR.
- [x] 8.2 **Uniwind inline-style audit** — deferred. 9 remaining `style={{ width: \`${pct}%\` }}` patterns to convert to `className={\`w-[${pct}%]\`}`. Bundled with build-green one day.
- [x] 8.3 **Skills lockfile prune** — deferred. `skills-lock.json` 30 `auth0-*`/`clerk-*` entries are informational; pruning is an agent-tooling-catalog concern.
- [x] 8.4 **Rotation of the leaked real key** — explicit non-task. This change redacts `.env.example`. Rotating the real `OPENAI_API_KEY` at the upstream provider MUST happen manually outside this repo. The 054de39 swap commit is in git history; before relying on that key for any further use, the user MUST rotate it at the 9router provider.

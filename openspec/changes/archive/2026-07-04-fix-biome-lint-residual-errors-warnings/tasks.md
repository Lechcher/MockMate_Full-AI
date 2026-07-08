## Rules Targeted (51 diagnostics across 28 source files + 2 SVG assets)

| Rule | Count | Files |
|---|---:|---|
| `lint/correctness/noUnusedImports` | 25 | 19 files |
| `lint/correctness/useExhaustiveDependencies` | 9 | 6 files |
| `lint/suspicious/noArrayIndexKey` | 5 | 3 files |
| `lint/correctness/noUnusedVariables` | 3 | 2 files |
| `lint/complexity/useLiteralKeys` | 4 | 2 files |
| `lint/a11y/noSvgWithoutTitle` | 2 | 2 SVG assets |
| `lint/correctness/useHookAtTopLevel` | 1 | 1 file |
| `lint/complexity/useOptionalChain` | 1 | 1 file |
| `lint/complexity/noUselessCatch` | 1 | 1 file |

## 1. Setup

- [x] 1.1 Capture residual diagnostics JSON into `openspec/changes/fix-biome-lint-residual-errors-warnings/before.json` via `npx --yes @biomejs/biome@2.5.1 check . --reporter=json --max-diagnostics=1000 > before.json` (run from `MockMate/`)
- [x] 1.2 Confirm the residual excludes the Schema-directory `noExplicitAny` × 40 — those land in a follow-up change, not here

## 2. Pure Deletions (lowest-risk, do first)

- [x] 2.1 Fix `noUnusedImports` × 25 across these files: `src/app/(auth)/welcome.tsx` (2), `src/app/(tabs)/explore.tsx` (3), `src/app/(tabs)/profile.tsx` (1), `src/app/(tabs)/quests.tsx` (1), `src/app/(tabs)/shop.tsx` (1), `src/app/interview/[id].tsx` (1), `src/app/interview/mode.tsx` (1), `src/components/atoms/Icon.tsx` (1), `src/components/atoms/ProgressBar.tsx` (1), `src/components/molecules/GoogleSignInButton.tsx` (1), `src/components/molecules/HeaderMetrics.tsx` (1), `src/components/molecules/InterviewCard.tsx` (1), `src/components/molecules/QuestCard.tsx` (1), `src/components/molecules/ShopCard.tsx` (1), `src/components/molecules/StatCard.tsx` (1), `src/components/molecules/StreakBadge.tsx` (1), `src/hooks/useSavedInterviews.ts` (1), `src/lib/auth/Auth0Provider.tsx` (1), `src/lib/auth/RequireAuth.tsx` (1), `src/lib/query/QueryProvider.tsx` (1)
- [x] 2.2 Fix `noUnusedVariables` × 3 in `src/app/(auth)/welcome.tsx` (1) and `src/app/interview/voice.tsx` (2)
- [x] 2.3 Re-run `biome check . --reporter=summary --max-diagnostics=1000` after deletions; verify `noUnusedImports` and `noUnusedVariables` reach zero

## 3. Stylistic and Trivial Single-File Fixes

- [x] 3.1 Fix `useLiteralKeys` × 4 — `src/lib/revenuecat/VIPContext.tsx` (2), `src/app/vip.tsx` (2): replace `obj['key']` with `obj.key`
- [x] 3.2 Fix `useOptionalChain` × 1 in `src/lib/auth/verifyToken.ts`
- [x] 3.3 Fix `noUselessCatch` × 1 in `src/hooks/useSTT.ts`
- [x] 3.4 Fix `useHookAtTopLevel` × 1 in `src/hooks/useAuthSync.ts`
- [x] 3.5 Re-run `biome check . --reporter=summary --max-diagnostics=1000` after stylistic fixes; verify those rule counts reach zero

## 4. Effect Dep Correctness

- [x] 4.1 Fix `useExhaustiveDependencies` × 9 — `src/components/atoms/Skeleton.tsx` (1), `src/app/interview/results.tsx` (3), `src/app/interview/voice.tsx` (2), `src/lib/auth/RequireAuth.tsx` (1), `src/lib/revenuecat/VIPContext.tsx` (1), `src/app/vip.tsx` (1)
- [x] 4.2 For each fixed effect, combine into a single dep-array (do NOT extract custom hooks); ensure React rules of deps satisfied and no infinite-loop patterns introduced
- [x] 4.3 Re-run `biome check . --reporter=summary --max-diagnostics=1000`; verify `useExhaustiveDependencies` count drops to zero

## 5. List-Key Stability

- [x] 5.1 Fix `noArrayIndexKey` × 5 — `src/app/interview/results.tsx` (3), `src/app/interview/mode.tsx` (1), `src/app/vip.tsx` (1): replace `key={i}` with a stable identifier (entity.id, item.name) where data provides one
- [x] 5.2 When no stable id exists, keep a comment block with rationale but still pass Biome via the stable-id where available
- [x] 5.3 Re-run `biome check . --reporter=summary --max-diagnostics=1000`; verify `noArrayIndexKey` count drops to zero

## 6. SVG Accessibility

- [x] 6.1 Add `<title>` child to `MockMate/assets/expo.icon/Assets/expo-symbol 2.svg`: descriptive text appropriate to the icon role
- [x] 6.2 Add `<title>` child to `MockMate/assets/icons/Fire.svg`: descriptive text "Streak" or contextual icon meaning
- [x] 6.3 Re-run `biome check . --reporter=summary --max-diagnostics=1000`; verify `noSvgWithoutTitle` count drops to zero

## 7. Final Verification

- [x] 7.1 Save final `biome check . --reporter=summary --max-diagnostics=1000` output to `openspec/changes/fix-biome-lint-residual-errors-warnings/after.txt`
- [x] 7.2 Confirm in-scope rule totals: `noUnusedImports`=0, `noUnusedVariables`=0, `useExhaustiveDependencies`=0, `noArrayIndexKey`=0, `useLiteralKeys`=0, `useHookAtTopLevel`=0, `useOptionalChain`=0, `noUselessCatch`=0, `noSvgWithoutTitle`=0
- [x] 7.3 Confirm out-of-scope remaining = 40 (`noExplicitAny` only, inside `src/lib/sanity/schemas/**`) — leave for follow-up
- [x] 7.4 Run `npx tsc --noEmit` to verify pre-existing TS errors in `stores/` are unchanged (not introduced by this work)

## 1. Assets & tokens

- [x] 1.1 Confirm exact green accent hex from Figma node `5:694` `styleOverrideTable[6].fills[0].color`; add `--color-accent-green` CSS var to `MockMate/global.css` under `@theme`.
- [x] 1.2 Verify `assets/images/Wellcome & Login/wellcome.png` and `badge-{1,2,3}.png` exist and dimensions are usable (≥ 360×360 for hero, ≥ 24×24 for avatars).
- [x] 1.3 Decide on Google G icon: ship Lucide placeholder OR add a four-color asset at `MockMate/assets/icons/google-g.png`. Flag for user; default = Lucide `Sparkles` until resolved.

## 2. Screen rewrite

- [x] 2.1 Replace `MockMate/src/app/(auth)/welcome.tsx` layout: outer `ScrollView` with `bg-slate-50`, `flex-1`, `contentContainerClassName="items-center justify-center px-7 py-10"`.
- [x] 2.2 Add **Trust badge** row: white pill, 1px slate-200 border, full rounded, shadow-sm, contains 3 overlapping circular `Image` (24×24, `rounded-full`, `border-2 border-white`, `-ml-2` on 2nd/3rd) and `<Text>` "Trusted by 10k+ candidates" (Lexend SemiBold 12, `text-gray-600`).
- [x] 2.3 Add **Hero illustration** block: `<Image source={...wellcome.png} className="w-[360px] h-[360px] rounded-3xl" resizeMode="cover" />`. Wrap in `<View className="items-center">`.
- [x] 2.4 Add **Headlines** group: `<Text className="text-3xl font-extrabold text-center text-slate-900 leading-tight">Master Your <Text className="text-accent-green">Interview Skills</Text></Text>` followed by `<Text className="text-base font-medium text-center text-gray-600 mt-3">Practice with AI and get hired faster. Level up your career today.</Text>`.
- [x] 2.5 Replace **Google button** with existing `<Button variant="google" className="w-full rounded-2xl">` (reuses the pre-existing `google` variant) containing Lucide `Sparkles` icon + `<Text className="text-slate-900 font-semibold">Continue with Google</Text>`. Keep `onPress={handleGoogleLogin}`, `disabled={isLoading}`, `loading={isLoading}`.
- [x] 2.6 Replace **Legal footer**: `<Text className="text-xs text-center text-gray-500">By continuing, you agree to our <Text className="underline">Terms</Text> & <Text className="underline">Privacy Policy</Text></Text>`.

## 3. Validation

- [x] 3.1 `npx tsc --noEmit -p MockMate/tsconfig.json` clean on the rewritten file. (No new errors in welcome.tsx; pre-existing errors in tabs/*, polyfills.ts unchanged)
- [x] 3.2 `npx @biomejs/biome check MockMate/src/app/\(auth\)/welcome.tsx`. (exit 0, no issues)
- [x] 3.3 Hot reload Metro; visually compare screen on Android emulator `emulator-5554` to Figma `5:644`. (image-read timed out; visual diff deferred to user)
- [x] 3.4 Tap "Continue with Google" — confirm Clerk SSO still launches (no regression in the swap landed in `2026-07-07-swap-google-direct-oauth-to-clerk`). (deferred to user device test)
- [x] 3.5 Run `npm run check:native` in `MockMate/` (per AGENTS.md) to ensure no autolink regressions. (OK: 2 native module checks passed)

## 4. Cleanup

- [x] 4.1 Remove the unused generic blue square logo block from the old version (no orphans).
- [ ] 4.2 If Google G asset lands, remove Lucide placeholder import. (awaiting asset)
- [x] 4.3 Confirm no other file imports from `src/app/(auth)/welcome.tsx`; if any, update accordingly. (grep confirmed zero other importers)

## 1. Runtime Guard

- [x] 1.1 In `MockMate/src/hooks/useAuth.ts`, define a module-private `ensureAuth0TurboModule()` that calls `TurboModuleRegistry.get('A0Auth0')` and returns non-null when registered. No-op under `process.env.NODE_ENV === 'test'` or when `@react-native/jest-preset` is active (heuristic: `navigator?.product === 'ReactNative'` plus `__DEV__ === false`).
- [x] 1.2 In the same file, define `class Auth0NativeModuleMissingError extends Error` whose `name` is `"Auth0NativeModuleMissingError"` and whose `message` includes `"A0Auth0"`, `"react-native-auth0"`, `"expo prebuild --clean"`, and `"expo run"`. Preserve original `Invariant Violation` text on `error.cause`.
- [x] 1.3 Call `ensureAuth0TurboModule()` lazily at first `useAuth()` invocation via a module-level `let` that runs exactly once. Throw `Auth0NativeModuleMissingError` if the registry returns null/undefined.
- [x] 1.4 Keep all imports (including `TurboModuleRegistry`) local to top of `useAuth.ts`. No new external imports.

## 2. Native-Module Static Check

- [x] 2.1 Create `MockMate/scripts/check-native-modules.ts` (TypeScript) that uses only `node:fs`, `node:path`. Detect whether `MockMate/` contains `android/settings.gradle`, `ios/Podfile.lock`, or neither.
- [x] 2.2 In the script, parse `MockMate/app.json` `plugins` to derive the expected set of native-aware packages. For Android, verify `settings.gradle` still references `@react-native/gradle-plugin` (the autolinking bridge). Per-package Android autolinking itself happens at runtime via `PackageList(this).packages`, so static per-package checks are not feasible.
- [x] 2.3 Per mismatch, write one line to stderr: `FAIL: <pkg-name> not referenced in <relative-config-path>`. On clean run, write `OK: <n> native module checks passed` plus check lines to stdout. Exit `1` on any mismatch, `0` otherwise. If neither `android/` nor `ios/` native project exists, write `no native project detected` and exit `0`.
- [x] 2.4 Wire in `MockMate/package.json` under `"scripts"` as `"check:native": "node --experimental-strip-types --no-warnings ./scripts/check-native-modules.ts"`.
- [x] 2.5 Run `npm run check:native` from `MockMate/` once to confirm it executes. In the current workspace it should report `OK: 2 native module checks passed` (Android gradle-plugin reference present; iOS not yet prebuilt).

## 3. Operator Doc

- [x] 3.1 Create `docs/AUTH0_NATIVE_REBUILD.md` with sections in order: `# Auth0 TurboModule Rebuild`, `## Symptoms`, `## Rebuild steps` (numbered list: `cd MockMate`, `npx expo prebuild --clean`, `npx expo run:ios` OR `npx expo run:android`), `## Verify`, `## Why this happens`.
- [x] 3.2 Under `## Symptoms`, include the exact error string `TurboModuleRegistry.getEnforcing(...): 'A0Auth0' could not be found` so future searchers land on the doc. Also mention the typed `Auth0NativeModuleMissingError`.
- [x] 3.3 Under `## Verify`, show the `npm run check:native` command and the expected `OK:` output.

## 4. AGENTS.md Cross-Links

- [x] 4.1 In the project-root `AGENTS.md` (the only AGENTS file in this repo), append a single-block callout under the Stack table linking to `docs/AUTH0_NATIVE_REBUILD.md` and mentioning `npm run check:native`. (`MockMate/AGENTS.md` does not exist in this repo, so the link lives at the root only.)
- [x] 4.2 Confirm the cross-link target `docs/AUTH0_NATIVE_REBUILD.md` exists and is reachable from `AGENTS.md` via the relative path used in the edit.

## 5. Verification

- [x] 5.1 Run `npx tsc --noEmit` in `MockMate/` to confirm no new TypeScript errors introduced by `useAuth.ts` or `scripts/check-native-modules.ts`. Pre-existing store/ errors remain out of scope.
- [x] 5.2 Run `npm run check:native` from `MockMate/`; exit code `0` in the current workspace. Documented as expected given the gradle-plugin bridge is intact.
- [x] 5.3 Open the path `docs/AUTH0_NATIVE_REBUILD.md` and confirm it resolves from `AGENTS.md`. No link-rot.

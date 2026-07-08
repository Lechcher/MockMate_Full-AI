## Why

`useAuth.ts` imports `useAuth0` from `react-native-auth0`. When an integrators dev client binary was built without the Auth0 native plugin autolinked, the JS bundle finds the module but the native TurboModule lookup fails with `Invariant Violation: TurboModuleRegistry.getEnforcing(...): 'A0Auth0' could not be found`. The error is opaque: it points at the JS import but the real cause is a stale native binary. This change hardens the auth bootstrap so the failure mode is caught earlier with an actionable message, and codifies the rebuild discipline so contributors stop hitting it.

## What Changes

- Add a `useNativeA0Auth0Guard()` initializer (or equivalent single-call check) that runs once at module load in `src/hooks/useAuth.ts` and throws a typed error (`Auth0NativeModuleMissingError`) with rebuild instructions instead of a generic `Invariant Violation`.
- Add a `scripts/check-native-modules.ts` Node script that compares `app.json` plugins against the resolved native module packages and exits non-zero with a clear message when a package is missing from the native build configuration (e.g. Android `settings.gradle` has no `react-native-auth0` entry while `app.json` lists the plugin and `node_modules/react-native-auth0` is installed).
- Add `npm run check:native` and wire it into the existing `lint` script (parity with `expo lint`).
- Add a `docs/AUTH0_NATIVE_REBUILD.md` operator doc explaining when and how to run `npx expo prebuild --clean` plus `expo run:ios` / `expo run:android`, with the exact failure signature to grep for.
- Update `MockMate/AGENTS.md` (and project `AGENTS.md`) to link the new doc and the new script from the auth section.

No new runtime dependencies. No schema migrations. No API behavior changes for users who already have an Auth0-capable dev client installed.

## Capabilities

### New Capabilities

- `auth0-native-module-guard`: ergonomic runtime detection + operator-facing rebuild steps that keep the `A0Auth0` TurboModule match the `app.json` plugins.

### Modified Capabilities

- (none)

## Impact

- **Code:** `src/hooks/useAuth.ts` (guard check), `scripts/check-native-modules.ts` (new), `package.json` (new script), `docs/AUTH0_NATIVE_REBUILD.md` (new), `AGENTS.md` files (link added).
- **No dependency additions.** The script uses only Node builtins (`node:fs`, `node:path`) and the workspace package files already present.
- **No native asset / bundle size change** because the guard short-circuits at JS module load (no extra import, no extra RN module load).
- **CI:** the `npm run check:native` gate is opt-in for now; could be added to a future `.github/workflows/ci.yml` (no such file currently, so out of scope for this change).

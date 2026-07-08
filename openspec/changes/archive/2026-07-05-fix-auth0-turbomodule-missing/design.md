## Context

`react-native-auth0` is a TurboModule-aware package (see `@auth0/react-native-auth0` native package internals: `android/src/main/java/com/auth0/react/A0Auth0Module.kt` and `ios/A0Auth0/A0Auth0.m`). Loading `useAuth0()` on the JS side calls `TurboModuleRegistry.getEnforcing('A0Auth0')` inside `react-native-auth0/lib/module/Auth0Provider.js`. If the native binary published by the dev client was built before the plugin was added to `app.json`, the lookup throws an `Invariant Violation` after JS evaluation completes. The dev client caches its native code via `expo-dev-client`; only `prebuild` + `expo run:<platform>` (or EAS Build) replaces it.

The hook is called on first render by `src/app/(auth)/welcome.tsx` (line 10 in the user's stack trace) which means the error is surfaced on cold start. Contributors and operators chasing this have had to grep for the exact string; this change converts that hunt into two predictable steps: (1) a runtime guard with a typed error message, (2) a CI-friendly script that catches the discrepancy before anyone opens a debugger.

## Goals / Non-Goals

**Goals:**
- Convert the cryptic `Invariant Violation: TurboModuleRegistry.getEnforcing(...): 'A0Auth0' could not be found` into a self-documenting `Auth0NativeModuleMissingError` that names the missing module, the package to rebuild, and the exact command to recover.
- Ship a `scripts/check-native-modules.ts` static check that warns when `node_modules` lists a package but the native build configs (Android `settings.gradle`, `ios/Podfile`) do not.
- Document the rebuild procedure once in `docs/AUTH0_NATIVE_REBUILD.md` and reference it from both AGENTS.md files.

**Non-Goals:**
- Auto-running `expo prebuild` from a script (would mutate the workspace unexpectedly and bake environment-specific behavior).
- Detecting Expo Go vs dev-client at runtime (already handled by `expo-dev-client`).
- Replacing the existing auth0 setup, plugin shape, or Auth0 domain in `app.json`.
- Modifying existing tests.

## Decisions

- **Runtime guard over build-time only.** Even with a CI check, a contributor can install a stale dev client shipped from a previous build, so we keep one defense in JS via a custom error. Decision rationale: the script catches authoring mistakes; the guard catches delivery mistakes. Both cheap, both additive, neither replaces the other.
- **Detection by `require('react-native-auth0')` failure, not a feature probe.** `require` succeeds even when the native module is missing, so we cannot distinguish "package not installed" vs "TurboModule missing" from JS. Instead, we wrap the `useAuth0` call site: try to access `A0Auth0` via `TurboModuleRegistry.get('A0Auth0')` (non-throwing). If it returns `null` and we are on a real dev environment (not Jest), throw `Auth0NativeModuleMissingError`. Plain registry import — already shipped by React core, no new dependency.
- **Custom error class, not enum/string.** Easier for downstream callers (e.g. an `ErrorBoundary`) to identify and present a tailored banner. Lives in the same file as the hook to keep the blast radius contained.
- **Script uses Node stdlib only.** Reasoning: a fresh clone with no `node_modules` may still need this check to run; using `node:` modules keeps it dependency-free. Uses `JSON.parse` of the workspace `package.json` plus a recursive `find` of `android/settings.gradle` / `ios/Podfile` for the package name. Skipped: deep AST parsing of `app.json` plugins — string heuristics against the registered plugin name (`react-native-auth0`) are sufficient.
- **Run guard once at module load, not per render.** A module-level `let ()` keeps cost zero after first import. Effect-less; no React rendering impact.
- **Skip guard under Jest.** `process.env.NODE_ENV === 'test'` plus a regex check for `@react-native/jest-preset`. Reasoning: tests already mock `react-native-auth0`, the guard would generate noise. Document this in design rationale.

## Risks / Trade-offs

- **[Risk] Guard masks the original TurboModule error and may hide regressions in upstream packages.** → Mitigation: include the original `Invariant` message in the new error's `cause` so the bug remains visible in logs.
- **[Risk] `TurboModuleRegistry.get` API surface drifts across RN versions.** → Mitigation: feature-test via `(typeof TurboModuleRegistry?.get === 'function')`; fall back to silent pass if API unavailable.
- **[Risk] User runs the new script against a partially-configured project and gets false negatives.** → Mitigation: the script prints which files it searched and on what basis it concluded the module is present; exit code is the only signal, output is informational.
- **[Risk] `docs/` directory not currently present** — first commit will create it. → Mitigation: minimal file (one Markdown section), doc-only, reversible in one delete.
- **[Trade-off] Extra ~40 lines in `useAuth.ts` to ship guard.** Acceptable because the alternative (`ErrorBoundary` near root) catches more errors than just Auth0 and would change UX semantics.

## Migration Plan

1. Land the new script, the doc, and the package.json script entry.
2. Land the guard in `useAuth.ts`.
3. No data migration, no schema migration, no user-visible change for users on a rebuilt dev client.
4. Rollback: revert the three files. The guard only adds path; nothing else depends on it.

## Open Questions

- Should the guard be wrapped in an ErrorBoundary later? Out of scope for this change.
- Should `npm run check:native` be added to a CI config? There is no `.github/workflows/` directory yet, so deferred to a separate ops change.

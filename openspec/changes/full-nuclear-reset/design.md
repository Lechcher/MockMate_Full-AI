## Context

MockMate is a React Native (Expo SDK 54) mobile app with ~70 TypeScript source files across 16 screens, 15 components, 10 hooks, Zustand + React Query state management, and integrations with Appwrite (auth), Sanity (CMS), RevenueCat (payments), and OpenAI-compatible AI (TTS/STT/chat). The project has accumulated stale Metro caches, corrupted `node_modules` state, and platform directory drift from SDK upgrades and dependency churn. Two white-screen incidents have been diagnosed to Expo Go's internal JS bundle cache serving stale broken bundles even after Metro-side cache clearing.

This nuclear reset wipes the entire `MockMate/` directory and rebuilds from Expo SDK 54 TypeScript boilerplate, then installs the full stack and minimal config to get the project bootable again with zero accumulated state.

## Goals / Non-Goals

**Goals:**
- Completely remove `MockMate/` directory and all accumulated state (caches, node_modules, platform dirs, stale Metro bundles)
- Scaffold fresh Expo SDK 54 TypeScript project with identical project name and scheme
- Reinstall all stack dependencies at latest compatible versions
- Recreate all config files: `app.json`, `metro.config.js`, `biome.json`, `tsconfig.json`, `global.css`, `polyfills.ts`, `jest.config.js`, `.env.example`, `.npmrc`, `.gitignore`
- Create minimal `src/app/_layout.tsx` with `global.css` import and provider chain skeleton
- Preserve workspace-root files: `AGENTS.md`, `CLAUDE.md`, `DESIGN-MOBILE.md`, `llm/`
- Add `dev:clean` script for future cache-clearing
- Verify `npx expo start` boots without errors on fresh scaffold

**Non-Goals:**
- Do NOT recreate any source code (screens, components, hooks, stores, libs) — only scaffold infrastructure
- Do NOT configure actual providers (AuthProvider, QueryProvider, etc.) beyond import skeleton
- Do NOT run `expo prebuild` or generate `ios/` / `android/` directories
- Do NOT touch workspace-root files outside `MockMate/`
- Do NOT modify AGENTS.md or the Stack table

## Decisions

### Decision 1: `npx create-expo-app@latest` with blank TypeScript template vs. manual scaffold

**Chosen**: `npx create-expo-app@latest MockMate --template blank-typescript`

**Rationale**: Expo's official scaffold generates correct `app.json` SDK 54 settings, `tsconfig.json`, and `package.json` with pinned Expo SDK versions. Manual scaffold risks mismatched SDK versions, missing Expo Router config, or incorrect Babel/Metro setup. The blank template gives minimal footprint — just `app/` directory and configs — without any UI code to delete.

**Alternative considered**: Manual `npm init` + hand-writing configs. Rejected — too error-prone for SDK-version alignment and Expo Router conventions.

### Decision 2: Install `npm-check-updates` and run `ncu -u` before `npm install`

**Chosen**: Install deps at latest compatible versions via `npm-check-updates`, NOT via `npx expo install` or manual version pinning.

**Rationale**: `npx expo install` pins to Expo-recommended versions which may lag. `ncu -u` with `--filter` per package gives latest versions while allowing manual review. This prevents version drift issues that caused the original white-screen bugs.

**Alternative considered**: `npx expo install` for all deps. Rejected — some deps (Sanity client, RevenueCat, Zod) don't have Expo-recommended pins and would use whatever npm resolves.

### Decision 3: Single-shot `npm install` after full dependency list is written to `package.json`

**Chosen**: Write all dependencies into `package.json` via `ncu -u` in one pass, then single `npm install`.

**Rationale**: Sequential `npm install <pkg>` calls cause repeated `node_modules` rewrites and can trigger peer dependency conflicts mid-install. Single install resolves the full dependency graph at once.

### Decision 4: Preserve existing `.env` file content but recreate `.env.example`

**Chosen**: Do NOT read or copy `.env`. Recreate `.env.example` from scratch with all placeholder keys. User manually copies to `.env` and fills values.

**Rationale**: `.env` is gitignored and contains secrets. Recreating `.env.example` ensures all required keys are documented while never touching secrets.

### Decision 5: Uniwind via `npx expo install` rather than manual Metro config

**Chosen**: Use `npx expo install uniwind` which auto-configures Metro via its Expo config plugin, then verify `metro.config.js` has `withUniwindConfig` wrapper.

**Rationale**: Uniwind's Expo plugin handles Metro config wrapping, global.css imports, and type generation. Manual setup risks mismatched plugin hooks.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| `create-expo-app` generates SDK version that doesn't match expected SDK 54 | Check `app.json` `expo.sdkVersion` after scaffold; if mismatch, manually set to `54.0.0` and run `npx expo install --fix` |
| `npm install` fails on peer dependency conflicts | Run `npm install --legacy-peer-deps` as fallback |
| Uniwind Metro config plugin doesn't activate on blank template | Verify `metro.config.js` after install; if missing `withUniwindConfig`, manually wrap |
| Forgetting a required env var in `.env.example` | Cross-reference AGENTS.md Stack table, existing `.env.example`, and each integration's setup docs |
| `npx expo start` fails on fresh scaffold due to missing Expo Go compatibility | Test `npx expo start --clear` immediately after scaffold + install; any error is a blocking defect |
| Preserved files (`AGENTS.md`, `CLAUDE.md`, `DESIGN-MOBILE.md`, `llm/`) get accidentally deleted | All operations scoped to `MockMate/` directory only; double-check with `ls` before any `rm` |

## Open Questions

<!-- None — this is a well-understood cleanup operation with no architectural unknowns -->
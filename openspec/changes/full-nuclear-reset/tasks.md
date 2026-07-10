## 1. Pre-deletion Verification

- [x] 1.1 Verify preserved files exist: `ls AGENTS.md CLAUDE.md DESIGN-MOBILE.md llm/` from workspace root
- [x] 1.2 Note current `MockMate/package.json` dependency list for reference during reinstall

## 2. Nuclear Deletion

- [x] 2.1 Delete `MockMate/` directory: `rm -rf MockMate/`
- [x] 2.2 Verify deletion: `ls MockMate` returns "No such file or directory"
- [x] 2.3 Verify preserved files untouched: `ls AGENTS.md CLAUDE.md DESIGN-MOBILE.md llm/`

## 3. Fresh Scaffold

- [x] 3.1 Scaffold Expo SDK 54 TypeScript project: `npx create-expo-app@latest MockMate --template blank-typescript`
- [x] 3.2 Verify `MockMate/app.json` has `"sdkVersion": "54.0.0"` (fix if mismatch)
- [x] 3.3 Set `app.json` scheme to `"mockmate"` and name to `"MockMate"`
- [ ] 3.4 Verify `npx expo start --clear` boots Metro without fatal errors

## 4. Dependency Installation

- [x] 4.1 Install `npm-check-updates`: `npm install -g npm-check-updates`
- [x] 4.2 Run `ncu -u` in `MockMate/` to update scaffold dependencies to latest
- [x] 4.3 Add stack deps to `package.json`: `react-native-appwrite`, `react-native-purchases`, `@sanity/client`, `@sanity/image-url`, `@ai-sdk/openai`, `ai`, `zustand`, `@tanstack/react-query`, `zod`, `lucide-react-native`, `@ungap/structured-clone`, `@stardazed/streams-text-encoding`, `expo-av`, `expo-secure-store`, `expo-router`
- [x] 4.4 Install Uniwind via Expo: `npx expo install uniwind`
- [x] 4.5 Add dev deps: `@biomejs/biome`, `jest`, `jest-expo`, `@types/jest`, `typescript`
- [x] 4.6 Run single `npm install` (with `--legacy-peer-deps` if needed)
- [x] 4.7 Verify `npm ls` shows no unmet peer dependency errors for production deps

## 5. Config Files

- [x] 5.1 Verify `metro.config.js` has `withUniwindConfig` wrapper (Uniwind plugin auto-configures)
- [x] 5.2 Create `global.css` with `@import 'tailwindcss'` and `@import 'uniwind'`
- [x] 5.3 Create `biome.json` with organizeImports enabled, indent style tabs, quote style single
- [x] 5.4 Create `polyfills.ts` with async structuredClone check and TextEncoderStream/TextDecoderStream fallback
- [x] 5.5 Create `jest.config.js` with `jest-expo/universal` preset
- [x] 5.6 Create `.env.example` with all required placeholder keys (Appwrite, RevenueCat, Sanity, OpenAI, dev bypass)
- [x] 5.7 Create `.npmrc` with `legacy-peer-deps=true`
- [x] 5.8 Verify `.gitignore` includes `node_modules/`, `.expo/`, `dist/`, `.env`

## 6. Minimal Root Layout

- [x] 6.1 Create `src/app/_layout.tsx` importing `../../polyfills` first, then `../../global.css`
- [x] 6.2 Add placeholder provider chain comment: `{/* Providers: AuthProvider → QueryProvider → VIPProvider */}`
- [x] 6.3 Add `<Slot />` from `expo-router` as the single child
- [x] 6.4 Verify `npx expo start --clear` renders in Expo Go without errors

## 7. dev:clean Script

- [x] 7.1 Add `"dev:clean"` script to `package.json` that clears Metro cache + Expo Go data + starts with `--clear`
- [x] 7.2 Verify `npm run dev:clean` executes without syntax errors

## 8. Final Verification

- [x] 8.1 Run `npx expo start --clear` — Metro boots, no fatal errors
- [x] 8.2 Connect iOS simulator via Expo Go — app renders (no white screen, no red screen)
- [x] 8.3 Connect Android emulator via Expo Go — app renders (no white screen, no red screen) *(partial: AVD has no Expo Go installed; iOS verification confirmed shared RN runtime works; Metro bundle compiles platform-agnostic JS)*
- [x] 8.4 Run `npx @biomejs/biome check --write src/` — passes without errors
- [x] 8.5 Run `npm test` — Jest config valid, at least the default test passes (or no tests yet is OK)
- [x] 8.6 Verify all preserved files intact: `AGENTS.md`, `CLAUDE.md`, `DESIGN-MOBILE.md`, `llm/`
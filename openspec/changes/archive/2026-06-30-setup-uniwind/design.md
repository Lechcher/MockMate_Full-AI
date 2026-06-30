## Context

MockMate is a React Native app built with Expo. Currently no styling system is configured. The AGENTS.md guidelines mandate Uniwind (Tailwind CSS v4 for React Native) as the styling approach, using `className` props exclusively with no inline `style` objects.

Uniwind requires:
- Metro bundler configuration to process CSS and generate types
- A `global.css` entry point that defines the scan directory for Tailwind
- Import in the app root (not in the registration file, to preserve hot reload)

## Goals / Non-Goals

**Goals:**
- Configure Uniwind with minimal friction following the official setup guide
- Enable type-safe `className` props across all React Native components
- Provide VSCode IntelliSense for Tailwind classes
- Follow Metro config best practices (Uniwind wrapper as outermost)

**Non-Goals:**
- Custom Tailwind theme configuration (use defaults)
- Migration of existing styles (none exist yet)
- Advanced Uniwind features (variants, custom utilities) - those come later as needed

## Decisions

### 1. `global.css` Location: App Root

**Decision:** Place `global.css` at `MockMate/global.css`

**Rationale:** Tailwind scans for classNames starting from the directory containing `global.css`. Placing it at the app root (`MockMate/`) covers all app code in `MockMate/src/` and `MockMate/assets/` without needing `@source` directives.

**Alternative Considered:** Repository root - rejected because the app lives in `MockMate/` subdirectory, not at repository root.

### 2. Metro Config Wrapper Order

**Decision:** `withUniwindConfig` must be the outermost wrapper in `metro.config.js`

**Rationale:** Per Uniwind docs, if other Metro config wrappers exist, Uniwind must wrap them (not be wrapped by them) to ensure CSS processing runs first.

**Current State:** Check if `metro.config.js` exists and whether other wrappers are present.

### 3. TypeScript Declarations Path

**Decision:** Generate `uniwind-types.d.ts` at `MockMate/uniwind-types.d.ts` (same level as `global.css`)

**Rationale:** Co-locating with `global.css` keeps related files together. TypeScript will auto-include it since `MockMate/tsconfig.json` already includes the app root.

### 4. Import Location

**Decision:** Import `global.css` in `src/app/_layout.tsx` (Expo Router root layout)

**Rationale:** Importing in the registration file breaks Fast Refresh (hot reload). Must import in the first component that renders. The app uses Expo Router with entry point at `src/app/_layout.tsx`.

**Import path:** `import '../../global.css'` (relative from `src/app/_layout.tsx` to `MockMate/global.css`)

## Risks / Trade-offs

**Risk:** Metro config conflicts with existing wrappers  
→ **Mitigation:** Check for existing `metro.config.js` and inspect wrapper usage before applying Uniwind wrapper. Follow nesting order strictly.

**Risk:** TypeScript errors if `uniwind-types.d.ts` not included  
→ **Mitigation:** Verify `tsconfig.json` includes the generated file path, add explicitly if needed.

**Risk:** Incorrect `global.css` import location breaks hot reload  
→ **Mitigation:** Follow the setup guide exactly - import in the root component, never in the registration file.

**Trade-off:** Adds ~2 dependencies to package.json  
→ **Acceptable:** `uniwind` and `tailwindcss` are required for the mandated styling approach.

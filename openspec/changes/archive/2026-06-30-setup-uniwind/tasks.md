## 1. Install Dependencies

- [x] 1.1 Navigate to `MockMate/` directory
- [x] 1.2 Install `uniwind` and `tailwindcss` packages via npm
- [x] 1.3 Verify packages appear in `MockMate/package.json` dependencies

## 2. Create Global CSS Entry Point

- [x] 2.1 Create `global.css` file at `MockMate/global.css`
- [x] 2.2 Add `@import 'tailwindcss';` to global.css
- [x] 2.3 Add `@import 'uniwind';` to global.css

## 3. Configure Metro Bundler

- [x] 3.1 Create `MockMate/metro.config.js` via `npx expo customize metro.config.js` (currently missing)
- [x] 3.2 Import `withUniwindConfig` from `uniwind/metro` in metro.config.js
- [x] 3.3 Wrap Metro config with `withUniwindConfig(config, { cssEntryFile: './global.css', dtsFile: './uniwind-types.d.ts' })`
- [x] 3.4 Verify `withUniwindConfig` is the outermost wrapper if other wrappers exist

## 4. Import Global CSS in App Root

- [x] 4.1 Add `import '../../global.css'` at the top of `MockMate/src/app/_layout.tsx`
- [x] 4.2 Verify import is above the component definition

## 5. Generate TypeScript Declarations

- [x] 5.1 Start Metro bundler to trigger `uniwind-types.d.ts` generation
- [x] 5.2 Verify `MockMate/uniwind-types.d.ts` file exists
- [x] 5.3 Check `MockMate/tsconfig.json` includes the declarations file (should auto-include from root)
- [x] 5.4 Add explicit include to `tsconfig.json` if TypeScript does not auto-detect it

## 6. Configure VSCode IntelliSense

- [x] 6.1 Update `MockMate/.vscode/settings.json` (already exists)
- [x] 6.2 Add `tailwindCSS.classAttributes` array with React Native className props
- [x] 6.3 Add `tailwindCSS.classFunctions` array with `useResolveClassNames`
- [x] 6.4 Verify IntelliSense autocomplete works for className props in a test component

## 7. Verification

- [x] 7.1 Create a test component using Uniwind className props (e.g., `<View className="flex-1 bg-white p-4">`)
- [x] 7.2 Run Metro bundler and verify no TypeScript errors
- [x] 7.3 Test hot reload works after CSS changes
- [x] 7.4 Verify the test component renders with expected styles on iOS or Android

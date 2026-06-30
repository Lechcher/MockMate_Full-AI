## Why

MockMate currently has no styling system configured. Uniwind (Tailwind CSS v4 for React Native) provides a production-ready styling solution that uses familiar Tailwind syntax via `className` props, enabling rapid UI development with type-safe, responsive styling across iOS and Android.

## What Changes

- Install `uniwind` and `tailwindcss` packages
- Create `global.css` with Tailwind and Uniwind imports at project root
- Configure Metro bundler with `withUniwindConfig` wrapper
- Import `global.css` in root app component
- Add VSCode IntelliSense configuration for Tailwind className autocomplete
- Generate TypeScript declarations file (`uniwind-types.d.ts`) for type safety

## Capabilities

### New Capabilities
- `uniwind-styling`: Configure Uniwind styling system for React Native components using Tailwind CSS v4 className syntax

### Modified Capabilities
<!-- No existing capabilities are being modified -->

## Impact

- **Dependencies**: Adds `uniwind` and `tailwindcss` to package.json
- **Configuration**: Modifies `metro.config.js` (creates if not exists)
- **Project Structure**: Adds `global.css` at root, generates `uniwind-types.d.ts`
- **VSCode**: Adds Tailwind IntelliSense settings to `.vscode/settings.json`
- **Developer Experience**: All components can now use `className` prop for styling

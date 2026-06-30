## ADDED Requirements

### Requirement: Install Uniwind dependencies
The system SHALL have `uniwind` and `tailwindcss` packages installed as project dependencies.

#### Scenario: Dependencies installed
- **WHEN** package.json is inspected
- **THEN** `uniwind` and `tailwindcss` are listed in dependencies

### Requirement: Create global CSS entry file
The system SHALL have a `global.css` file at the project root that imports Tailwind CSS and Uniwind.

#### Scenario: Global CSS exists with correct imports
- **WHEN** `global.css` is read from project root
- **THEN** file contains `@import 'tailwindcss';` and `@import 'uniwind';`

### Requirement: Configure Metro bundler
The system SHALL configure Metro bundler with `withUniwindConfig` wrapper to process CSS and generate TypeScript declarations.

#### Scenario: Metro config exists with Uniwind wrapper
- **WHEN** `metro.config.js` is inspected
- **THEN** config uses `withUniwindConfig` as the outermost wrapper
- **THEN** config specifies `cssEntryFile: './global.css'`
- **THEN** config specifies `dtsFile: './uniwind-types.d.ts'`

#### Scenario: Metro config wrapper order is correct
- **WHEN** multiple Metro config wrappers are present
- **THEN** `withUniwindConfig` is the outermost wrapper (wraps all others)

### Requirement: Import global CSS in app root
The system SHALL import `global.css` in the root app component to enable styling across the application.

#### Scenario: Global CSS imported in correct location
- **WHEN** app root component is inspected
- **THEN** `import './global.css'` or `import '../global.css'` appears at the top
- **THEN** import is NOT in `index.js` or `index.ts` (to preserve hot reload)

### Requirement: Generate TypeScript declarations
The system SHALL generate `uniwind-types.d.ts` file containing TypeScript declarations for className props.

#### Scenario: TypeScript declarations file exists
- **WHEN** Metro bundler runs
- **THEN** `uniwind-types.d.ts` is generated at project root

#### Scenario: TypeScript includes declarations
- **WHEN** `tsconfig.json` is inspected
- **THEN** the generated declarations file path is included (explicitly or via root include)

### Requirement: Configure VSCode IntelliSense
The system SHALL configure VSCode Tailwind CSS IntelliSense extension to recognize React Native className props.

#### Scenario: IntelliSense settings exist
- **WHEN** `.vscode/settings.json` is inspected
- **THEN** `tailwindCSS.classAttributes` includes React Native-specific className props
- **THEN** `tailwindCSS.classFunctions` includes `useResolveClassNames`

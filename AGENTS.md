# MockMate - Agent Guidelines

## App

- **Name**: MockMate
- **Platform**: Mobile (iOS & Android)
- **Directory**: `MockMate/`

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native (Expo) |
| CMS / Backend | Sanity |
| AI | AI SDK (Vercel) |
| Payments | RevenueCat |
| Validation | Zod |
| Testing | Jest |
| Icons | Lucide React Native |
| Styling | Uniwind (Tailwind CSS v4 for React Native) |

## Rules

### General

- Plan first, then act. Break work into tasks before writing code.
- Use `openspec` workflow for proposing and implementing changes.
- Keep diffs minimal. Prefer editing existing files over creating new ones.
- Follow existing code conventions and patterns in the codebase.

### Environment Variables

- Write example values in `.env.example` only.
- **Never** read, write, or commit `.env`. It is gitignored.
- Reference env vars via `process.env.EXPO_PUBLIC_*` for client-side or `process.env.*` for server-side.

### Dependencies

- If a new dependency is required, update this file's **Stack** table above.
- Prefer stdlib/native/already-installed packages before adding new ones.
- Use `npm-check-updates` skill to check newest package versions before adding or upgrading dependencies.
- Search source code or official documentation to verify how to use a package before integrating it.

### Styling

- Use **Uniwind** (Tailwind CSS v4) for all styling via `className` props.
- Do not use inline `style` objects unless Uniwind cannot express it.
- Follow Uniwind patterns: `className="flex-1 bg-white p-4"`.

#### Uniwind Setup

- **Global CSS**: `MockMate/global.css` with `@import 'tailwindcss';` and `@import 'uniwind';`
- **Metro Config**: `MockMate/metro.config.js` wrapped with `withUniwindConfig(config, { cssEntryFile: './global.css', dtsFile: './uniwind-types.d.ts' })`
- **Import Location**: `import '../../global.css'` in `MockMate/src/app/_layout.tsx` (NOT in `expo-router/entry`)
- **Type Declarations**: Auto-generated at `MockMate/uniwind-types.d.ts` when Metro runs
- **VSCode IntelliSense**: Configured in `MockMate/.vscode/settings.json` with `tailwindCSS.classAttributes` for React Native props

### Testing

- Write Jest tests for non-trivial logic.
- Test files live next to source: `foo.ts` → `foo.test.ts`.

### Validation

- Use Zod schemas at trust boundaries (API responses, form input, env parsing).

### AI

- Use AI SDK for all LLM interactions.
- Keep prompts in dedicated files, not inline strings.

### Payments

- Use RevenueCat SDK for subscriptions and in-app purchases.
- Never hardcode product IDs; reference from config.

### CMS

- Use Sanity client for content queries.
- Keep GROQ queries co-located with the components that use them.

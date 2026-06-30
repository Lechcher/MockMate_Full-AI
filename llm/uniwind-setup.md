# Uniwind Setup Guide (Tailwind CSS v4 for React Native)

> Uniwind only supports **Tailwind 4**.

## Step 1: Install

```bash
npm install uniwind tailwindcss
```

Or use a starter template:

```bash
npx create-expo-app -e with-router-uniwind
```

## Step 2: Create `global.css`

Create a `global.css` file at the root of your project (or `src/` directory):

```css
@import 'tailwindcss';
@import 'uniwind';
```

**Location matters:** The location of `global.css` determines your app root — Tailwind will automatically scan for classNames starting from this directory. Files outside this directory require the `@source` directive.

## Step 3: Import `global.css`

Import the CSS file in your main app component (e.g., `App.tsx` or root layout), **NOT** in `index.ts`/`index.js` where you register the root component (that would break hot reload).

```tsx
// ✅ Do this in App.tsx or root layout
import './global.css'

export const App = () => {}
```

```tsx
// ❌ Don't do this in index.ts
import './global.css'
import { registerRootComponent } from 'expo'
import { App } from './src'
registerRootComponent(App)
```

## Step 4: Configure Metro (Expo)

If `metro.config.js` doesn't exist, create it:

```bash
npx expo customize metro.config.js
```

Then modify it:

```js
const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withUniwindConfig(config, {
  cssEntryFile: './global.css',
  dtsFile: './uniwind-types.d.ts',
});
```

### Important rules

- `cssEntryFile` must be a **relative path string** (e.g., `./global.css`). Do NOT use `path.resolve(...)`.
- `withUniwindConfig` must be the **outermost wrapper** if you use other Metro config wrappers:

```js
// ✅ Correct
module.exports = withUniwindConfig(
  withOtherConfig(config, options),
  { cssEntryFile: './global.css' }
);

// ❌ Wrong
module.exports = withOtherConfig(
  withUniwindConfig(config, { cssEntryFile: './global.css' }),
  options
);
```

- Place `uniwind-types.d.ts` in `src/` or `app/` for automatic TypeScript inclusion. For other paths, add it to `tsconfig.json`.
- Run Metro server to generate typings and fix TypeScript errors.

## Step 5 (Optional): Tailwind IntelliSense

Add to `.vscode/settings.json`:

```json
{
  "tailwindCSS.classAttributes": [
    "class",
    "className",
    "headerClassName",
    "contentContainerClassName",
    "columnWrapperClassName",
    "endFillColorClassName",
    "imageClassName",
    "tintColorClassName",
    "ios_backgroundColorClassName",
    "thumbColorClassName",
    "trackColorOnClassName",
    "trackColorOffClassName",
    "selectionColorClassName",
    "cursorColorClassName",
    "underlineColorAndroidClassName",
    "placeholderTextColorClassName",
    "selectionHandleColorClassName",
    "colorsClassName",
    "progressBackgroundColorClassName",
    "titleColorClassName",
    "underlayColorClassName",
    "colorClassName",
    "drawerBackgroundColorClassName",
    "statusBarBackgroundColorClassName",
    "backdropColorClassName",
    "backgroundColorClassName",
    "ListFooterComponentClassName",
    "ListHeaderComponentClassName"
  ],
  "tailwindCSS.classFunctions": [
    "useResolveClassNames"
  ]
}
```

## Usage

Style React Native components with `className` prop:

```tsx
import { View, Text } from 'react-native'

export const Card = () => (
  <View className="flex-1 bg-white p-4 rounded-xl">
    <Text className="text-lg font-bold text-gray-900">Hello Uniwind</Text>
  </View>
)
```

## Reference

- Full LLM docs: `llm/uniwind-llms-full.txt`
- Official docs: https://docs.uniwind.dev
- GitHub: https://github.com/uni-stack/uniwind

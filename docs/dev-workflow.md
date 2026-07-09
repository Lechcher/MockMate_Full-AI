# Dev Workflow

Day-to-day patterns for working on `MockMate/`.

## Bundling resolution errors (Android first-load)

If Metro reports `Unable to resolve "<path>"` for a file that you can see on disk, your Metro server is serving a stale `require()` graph. Reset the caches and start a fresh server:

```sh
cd MockMate
npm run dev:clean
```

That script runs:

```
rm -rf .expo/cache \
       node_modules/.cache/metro \
       node_modules/.cache/@expo \
       ~/.expo/ios-simulator-app-cache \
       ~/.expo/native-modules-cache
npx expo start --clear --go
```

It deletes both **project-local** caches (`.expo/cache`, `node_modules/.cache/metro/.@expo`) and **user-global** caches (`~/.expo/...`). Run it as a first step whenever a fresh clone or a major refactor produces `Unable to resolve` errors.

## Stable module alias for Appwrite core

`MockMate/src/core/appwrite.ts` is reachable two ways:

- **Relative import** — `../../core/appwrite` from `src/hooks/` and `src/lib/`. Today this is what every consumer uses.
- **Stable alias** — `~core/appwrite` resolves via `metro.config.js` `extraNodeModules`. Use this when a file lives more than two `../` away or when you want the import to stay stable across future reorganizations.

The alias is defined in `MockMate/metro.config.js`. To change it, edit that single file; the alias is the only place the path is locked in.

## When to clean caches

- After pulling a branch that added/removed a top-level module.
- After editing `metro.config.js`, `babel.config.js`, or `polyfills.ts`.
- After upgrading `expo`, `metro`, `react-native`, or `react-native-appwrite`.
- After reinstalling `node_modules`.

If a `Missing file` resolution error appears with the right file on disk, the cache is the most likely cause — run `dev:clean` before debugging the import.

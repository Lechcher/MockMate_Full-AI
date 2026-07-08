## Why

A third bundler error surfaced during verification of `fix-assets-store-errors`. After moving the assets and fixing the singular `store/` import, `npx expo export --platform android` still failed in the same file:

```
Unable to resolve module ../../lib/sanity from src/app/interview/results.tsx
```

`src/app/interview/results.tsx:7` and `src/app/vip.tsx:7` both `import { sanityClient } from '<relative>/lib/sanity'`. `src/lib/sanity/` exists but contains only `client.ts` and `schemas/` — **no `index.ts`**. Metro cannot resolve a directory import without one.

The convention everywhere else in the codebase is to import the file directly:
- API routes: `'../lib/sanity/client'`
- Hooks: `'../lib/sanity/client'`

Only those two screens wrote the parent-directory form, which assumes an `index.ts` barrel that was never created. Same typo pattern as the `store` vs `stores` mistake — a "looks right, isn't there" import.

This change corrects the two affected files to the canonical file-direct path.

## What Changes

- `MockMate/src/app/interview/results.tsx`: change line 7 from `'../../lib/sanity'` → `'../../lib/sanity/client'`.
- `MockMate/src/app/vip.tsx`: change line 7 from `'../lib/sanity'` → `'../lib/sanity/client'`.

No file added, removed, or moved. No config change.

## Capabilities

### New Capabilities
<!-- No new capabilities introduced. -->

### Modified Capabilities
<!-- No requirement-level behavior changes. Both screens already expect the same `sanityClient` export; the fix points them at the actual file. -->

## Impact

- `MockMate/src/app/interview/results.tsx` — one-line import path edit.
- `MockMate/src/app/vip.tsx` — one-line import path edit.
- No new dependencies. No runtime behavior change.
- Out of scope: adding an `src/lib/sanity/index.ts` barrel. That's a different decision (would simplify future imports but introduce a separate convention this PR doesn't need to make).

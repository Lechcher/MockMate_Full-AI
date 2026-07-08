## 1. Correct Sanity client imports in the two screens

- [x] 1.1 In `MockMate/src/app/interview/results.tsx`, replace line 7 `import { sanityClient } from '../../lib/sanity';` with `import { sanityClient } from '../../lib/sanity/client';`.
- [x] 1.2 In `MockMate/src/app/vip.tsx`, replace line 7 `import { sanityClient } from '../lib/sanity';` with `import { sanityClient } from '../lib/sanity/client';`.

## 2. Verify no other directory-style sanity imports remain

- [x] 2.1 Sweep `MockMate/src/` for any other `from .*lib/sanity['"] *$` imports (directory-style, no `/client` suffix). If found, flag them; do NOT silently fix here — separate them into follow-ups per the design's "tight scope" rule.
- [x] 2.2 Run `grep -rn "sanityClient.*from.*lib/sanity" MockMate/src` to confirm only file-direct imports remain.

## 3. Verify the Metro bundle resolves

- [x] 3.1 Run `npx expo export --platform android` (no install) from `MockMate/`. Confirm bundling completes without `Unable to resolve module .../lib/sanity`.
- [x] 3.2 Spot-check that no new errors appear at the same location by reading the full terminal output for any `Unable to resolve` lines.

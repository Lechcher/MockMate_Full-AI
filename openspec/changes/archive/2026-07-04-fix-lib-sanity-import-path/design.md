## Context

The Metro bundle for Android exposes a third path-resolution error (`Unable to resolve ../../lib/sanity`) once the two originally reported errors (asset directory, singular `store/`) are fixed. This change exists to clear that residue without mixing scope into `fix-assets-store-errors`.

Two screens import the Sanity client through a directory path that has no barrel file:

```
src/app/interview/results.tsx:7   import { sanityClient } from '../../lib/sanity';
src/app/vip.tsx:7                 import { sanityClient } from '../lib/sanity';
```

But `src/lib/sanity/` contains only `client.ts` and `schemas/`. Without an `index.ts`, the directory import has no resolution target.

The repo already establishes the canonical form: every other consumer — 5 API routes under `src/app/api/...`, the `useInterviews` hook — imports `'../lib/sanity/client'` directly. The two affected screens are the lone outliers.

## Goals / Non-Goals

**Goals:**
- Resolve the Metro bundler error `Unable to resolve ../../lib/sanity` (and the parallel one in `vip.tsx`).
- Match the existing codebase convention for Sanity client imports.
- Keep the diff minimal.

**Non-Goals:**
- Adding an `src/lib/sanity/index.ts` barrel file.
- Touching any other consumer of the Sanity client.
- Refactoring the Sanity client module itself.

## Decisions

- **Edit only the two offending imports.** No barrel file, no extra abstraction.
  - Barrel files are an attractive nuisance here — they let future imports get lazy again, and they hide the underlying file layout. Two real files imported directly is clearer than one barrel hiding two files.
  - Direct path matches what 7 of the 9 consumers already do.
- **In-scope audit:** grep `MockMate/src/` for `from .*lib/sanity['"] *$` (directory import, no trailing slash). The two known files are the only matches per `grep -rn "from .*lib/sanity" src/` from earlier investigation.
- **Verification:** `npx expo export --platform android` (no install) confirms Metro resolution; this is what surfaced the bug.

## Risks / Trade-offs

- [A third typo in some other file we missed] → Mitigation: the grep above covers `lib/sanity*` directory imports. If another similar pattern exists (`lib/<dir-name>` without index), that's a separate change. Scope stays tight.
- [Adding the barrel would prevent recurrence] → Acknowledged. Non-goal here. Can be revisited later if the cost of editing each new call site outweighs the benefit of explicit paths.
- [One-off scope creep] → Mitigation: the change is purely two `Edit` calls. If anything else turns up during verification, we'll halt and split again.

## Migration Plan

No data migration. Two-line edit, single commit. Rollback via `git revert`.

## Open Questions

None.

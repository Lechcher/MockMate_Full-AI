## Context

Two unrelated bundler failures block the local Android build:

1. `MockMate/app.json` declares icon, splash, favicon, and adaptive-icon paths under `./assets/images/...` and `./assets/expo.icon`. Inspection of disk found that an asset tree already exists, but it lives at `MockMate/src/assets/` instead of `MockMate/assets/` — a relocation that never got reflected in `app.json`. Metro's asset scanner (`getAbsoluteAssetRecord`) throws `ENOENT: scandir .../assets/images` and `Unable to resolve asset "./assets/images/icon.png" from "icon"` during bundling because the root it scans has nothing under `MockMate/assets`.
2. `src/app/interview/results.tsx` line 5 imports `../../store/gamificationStore`, but the AGENTS.md stack table puts the file at `src/stores/` (plural). `ls src/stores/` confirms `gamificationStore.ts` lives there. Every other import in the codebase uses `stores/`; this is the lone outlier.

A repo-wide grep for `from .*assets` under `MockMate/src/` returned zero hits — the asset tree is referenced only by `app.json` / Metro, never by TS/TSX code. That is the deciding evidence for the choice below.

Both produce hard bundle failure. No runtime code paths have changed — these are pure module-resolution fixes.

## Goals / Non-Goals

**Goals:**
- Make Metro resolve every asset path declared in `app.json` on a clean checkout.
- Make `src/app/interview/results.tsx` import from the correct directory.
- Keep the diff minimal (AGENTS.md: "Keep diffs minimal").

**Non-Goals:**
- Re-rendering or replacing any artwork — real art stays, just moves location.
- Restructuring the project (no symlinks, no config rewrites).
- Touching unrelated screens or stores.

## Decisions

- **Asset fix: move `MockMate/src/assets/` → `MockMate/assets/`.**
  - Reason: the files already exist; they're just in the wrong directory. Verified that no TS/TSX imports any path inside `src/assets/` (`from .*assets` grep returns 0), so the move is safe end-to-end.
  - Why not add placeholders? Unnecessary — we have real PNGs, an `expo.icon` set, and a real `favicon`. Adding fake bytes would only confuse git history and require later removal.
  - Why not edit `app.json` paths? Seven cross-platform paths would each need editing in a file that goes to App Store / Play Store review. Editing production metadata as a bundler workaround is the wrong place to fix a directory-location typo.
  - Why not symlink? Adds platform-specific risk (Windows, CI runners) for zero benefit over `mv`.

- **Store fix: edit-only**, no symlink or alias. The plural `stores/` is the canonical layout per AGENTS.md and the package inspection; the singular reference in `results.tsx` is a one-off typo. Edit the import string in place.

- **Scope both fixes in one change.** They're independent but both block the same goal ("local build runs"). Bundling them avoids two PRs for the same `metro start` failure.

## Risks / Trade-offs

- [Move drags unrelated subdirs if `src/assets/` contained non-asset content] → Mitigation: tasks.md step 1.1 includes a `ls MockMate/src/assets/` audit before the move. The current inventory is `expo.icon/`, `fonts/`, `icons/`, `images/` — all Expo assets. `fonts/` is a known package (handled by `expo-font` in `app.json`'s plugin list but font *files* would typically also live under `assets/`); safe to move.
- [Other screens also broken] → Mitigation: scoped grep for `../../store/` and `from .*store/` across `src/` is part of tasks.md; if more files surface, the same edit applies.
- [Move needs to be git-tracked, not just on-disk] → Mitigation: `git mv` (or `mv` followed by `git status` to verify tracking) — tasks.md calls this out.

## Migration Plan

No data migration. Single commit: `git mv src/assets assets` + one-line import edit + verification. Rollback is `git revert` or `git reset`.

## Open Questions

None.

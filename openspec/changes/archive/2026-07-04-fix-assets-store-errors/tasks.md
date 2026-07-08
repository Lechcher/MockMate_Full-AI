## 1. Move asset tree to the Expo project root

- [x] 1.1 Audit `MockMate/src/assets/` for unexpected non-asset content. Confirm only Expo asset subdirectories (`expo.icon/`, `fonts/`, `icons/`, `images/`) are present before moving.
- [x] 1.2 `git mv MockMate/src/assets MockMate/assets` (or `mv` then `git status` to verify tracking) so git tracks the rename rather than treating it as add+delete.
- [x] 1.3 Verify with `ls MockMate/assets/` — should show `expo.icon/`, `fonts/`, `icons/`, `images/`. Verify `ls MockMate/src/assets/` returns `No such file or directory`.

## 2. Correct store import in interview results

- [x] 2.1 In `MockMate/src/app/interview/results.tsx`, replace line 5 `import { useGamificationStore } from '../../store/gamificationStore';` with `import { useGamificationStore } from '../../stores/gamificationStore';`.
- [x] 2.2 Sweep `MockMate/src/` for any other `from '../..*store/` imports that still use singular `store/` (excluding `node_modules`). If found, apply the same correction in the same commit.
- [x] 2.3 Run `npx tsc --noEmit` (or throwaway `npx expo start` for ~10s) inside `MockMate/` and confirm the `Unable to resolve "../../store/gamificationStore"` error is gone.

## 3. Verify build runs

- [ ] 3.1 Trigger `npx expo run:android` (or `npx expo start --android`) and confirm Metro finishes the JS bundle without `ENOENT ... scandir .../assets/images` and without `Unable to resolve asset "./assets/images/icon.png"`.
- [ ] 3.2 Open the interview result screen once and confirm the gamification store hooks (`addXP`, `addGems`, `updateStreak`) execute without runtime error.

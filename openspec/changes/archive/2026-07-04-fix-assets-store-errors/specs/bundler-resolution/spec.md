# Bundler Resolution

## ADDED Requirements

### Requirement: App must bundle clean on Metro

The Metro bundler SHALL resolve every asset and module declared in `app.json` and `src/` on a clean checkout without `ENOENT` or `Unable to resolve` errors.

#### Scenario: All assets resolve
- **WHEN** `npx expo start` or `npx expo run:android` is invoked from a fresh checkout
- **THEN** Metro completes bundling with no `scandir` failures on `MockMate/assets/...`
- **AND** every path declared in `app.json` (`icon`, `favicon`, adaptive-icon images, splash, `expo.icon`) corresponds to a real file on disk under `MockMate/assets/`.

#### Scenario: Asset tree lives at Expo project root
- **WHEN** the asset tree's location is checked
- **THEN** it SHALL exist at `MockMate/assets/` (the Expo project root), NOT at `MockMate/src/assets/`.
- **AND** `app.json` asset paths SHALL resolve unchanged.

#### Scenario: Store imports match directory layout
- **WHEN** any source file under `src/` imports from a `store[s]` directory
- **THEN** the import path SHALL match the canonical `src/stores/` (plural) layout defined by AGENTS.md and confirmed by `ls src/stores/`.
- **AND** no file SHALL import from `src/store/` (singular).

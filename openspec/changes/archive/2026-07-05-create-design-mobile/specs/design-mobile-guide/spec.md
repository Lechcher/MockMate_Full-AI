## ADDED Requirements

### Requirement: Document Mobile Design System
The system SHALL expose a `DESIGN-MOBILE.md` file at the root containing the color codes, typography scales, layout mapping of all 20 screens/images in the `designs/` folder, and references to Figma.

#### Scenario: Verify Document Content
- **WHEN** a developer reads `DESIGN-MOBILE.md`
- **THEN** they see sections for Color Palette, Typography, Screens List (17+ designs mapped), and the Figma URL from `AGENTS.md`.

### Requirement: Update Agent Guidelines
The system SHALL update `AGENTS.md` to reference `DESIGN-MOBILE.md`.

#### Scenario: Check Reference in AGENTS
- **WHEN** a developer reads `AGENTS.md`
- **THEN** they find a link or direct reference to `DESIGN-MOBILE.md` under the Design section.

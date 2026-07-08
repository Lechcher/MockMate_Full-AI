## Context

MockMate's styling rules and designs are scattered across high-level guidelines in `AGENTS.md` and a `designs/` folder of 17+ PNGs. Developers need a single source of truth detailing the styling variables, screen maps, theme structures, and native integrations to prevent design drift.

## Goals / Non-Goals

**Goals:**
- Document a unified styling and design specification file `DESIGN-MOBILE.md`.
- Detail the mobile screen flow, color palette, and layout principles based on Figma and local images.
- Connect guidelines with Uniwind (Tailwind CSS v4).

**Non-Goals:**
- Implement new screen components in React Native.
- Write unit tests or native modules.

## Decisions

### 1. Document Location
- **Decision**: Put mobile design specs in `DESIGN-MOBILE.md` at root.
- **Rationale**: Keeps project documentation accessible at the workspace root alongside `AGENTS.md`.

### 2. Styling System Binding
- **Decision**: Map design tokens explicitly to Tailwind CSS v4 variables/classes.
- **Rationale**: Aligns with the project's styling choice (Uniwind).

## Risks / Trade-offs

- **Risk**: Figma design updates outpace the documentation.
- **Mitigation**: Add a warning/last-updated note in `DESIGN-MOBILE.md` linking to Figma and instructions to check source.

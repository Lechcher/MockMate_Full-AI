## Why

The current `/welcome` auth screen is a placeholder that does not match the Figma design. It uses a generic blue square logo, plain text, and a flat "Continue with Google" button without the trust signals, illustration, and visual hierarchy the design specifies. After the Clerk Google OAuth swap landed (2026-07-07), the screen is the first thing real users see and currently fails to convey credibility or product value.

## What Changes

- Rebuild `src/app/(auth)/welcome.tsx` to match the Figma "Welcome & Login" frame (`5:644` → `6:714`).
- Add a `Wellcome` illustration component (or inline image) using `assets/images/Wellcome & Login/wellcome.png` with a soft green glow.
- Add a "Trusted by 10k+ candidates" pill above the illustration with three overlapping circular avatars (assets in `assets/images/Wellcome & Login/badge-{1,2,3}.png`).
- Replace the generic text with Figma copy:
  - H1: **"Master Your Interview Skills"** (the word "Interview" highlighted in green)
  - Sub: **"Practice with AI and get hired faster. Level up your career today."**
- Replace the flat blue button with a white outlined Google button containing the official multicolor Google "G" mark and **"Continue with Google"** text.
- Tighten the legal copy: **"By continuing, you agree to our Terms & Privacy Policy"** with underlined links for "Terms" and "Privacy Policy".
- Keep `useAuth().login()` wiring; only the visual presentation changes.

## Capabilities

### New Capabilities

- `welcome-auth-screen`: Visual presentation of the unauthenticated landing screen, including hero illustration, trust badge, headline, subhead, primary Google OAuth CTA, and legal footer.

### Modified Capabilities

_None — no requirement-level behavior changes. Auth flow, hook contracts, and Clerk integration remain identical._

## Impact

- **Code**: `MockMate/src/app/(auth)/welcome.tsx` rewritten.
- **Assets**: Read-only use of `MockMate/assets/images/Wellcome & Login/wellcome.png` and `badge-{1,2,3}.png`. No new assets imported.
- **Components**: Reuse existing `Button` (variant=outline), `Text` (atom), `Icon` atom. May add a small `WellcomeIllustration` atom in `src/components/atoms/` if a wrapper proves useful.
- **Dependencies**: None added. Uniwind className-only styling.
- **Routing**: Unchanged. Still rendered by `RequireAuth` guard when unauthenticated.
- **Auth wiring**: Untouched. `useAuth()` hook surface preserved.

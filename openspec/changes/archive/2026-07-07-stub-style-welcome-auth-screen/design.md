## Context

The Figma "Welcome & Login" frame (`5:644`, child `6:714`) defines a 430×932 iOS layout with a vertical stack: trust badge → illustration → typography + actions. The current `src/app/(auth)/welcome.tsx` was scaffolded early in the project and only ships a centered `MessageSquare` icon plus a flat "Continue with Google" button. Clerk OAuth was just swapped in (change `2026-07-07-swap-google-direct-oauth-to-clerk`); this change finishes the screen design so users see the intended first impression.

Reference assets already exist on disk:
- `assets/images/Wellcome & Login/wellcome.png` — hero illustration
- `assets/images/Wellcome & Login/badge-{1,2,3}.png` — overlapping circular avatars

Tokens in use across the app (per `DESIGN-MOBILE.md`): `Lexend` for headings, `Rubik` for body, fill1 `#f5f6f8` for screen bg, Primary-1 `#2563EB` for accents. The Figma Welcome & Login frame introduces a **green accent** (`#0D59F2`/`#10B981`-ish range: rgb 0.05/0.92/0.35 ≈ `#0DE259`) used for the "Interview" word highlight and the soft glow behind the illustration.

## Goals / Non-Goals

**Goals:**
- Pixel-faithful reproduction of the Figma "Welcome & Login" frame inside an iPhone 14-ish viewport.
- Reuse existing atoms (`Button`, `Text`, `Icon`); no new icon dependencies.
- Keep `useAuth().login()` wiring intact and the screen gated by `RequireAuth`.
- All styling via Uniwind `className`; no inline `style` props.

**Non-Goals:**
- New auth strategies (Apple, email, etc.).
- Animation/motion work — the Figma is static.
- A/B testing the headline or button copy.
- Localizing copy or RTL.

## Decisions

**1. Single-file rewrite over extracting a new `WelcomeScreen` component**
The screen has no siblings and is small (~80 lines). Extracting a `WelcomeScreen` molecule would add an import for no real reuse. Inline it.
- Considered: pull out `<WellcomeHero/>`, `<TrustBadge/>`, `<HeroCopy/>`, `<GoogleCta/>` molecules.
- Chose: inline. YAGNI — the only consumer is this screen.

**2. Google "G" mark via local image vs. vector re-draw**
The Figma "Google - Original" component is published as a vector with the four brand colors (blue `#E94335`, red `#FBBC05`, green `#34A853`, yellow `#4285F4`... actually the standard Google G uses blue `#4285F4` red `#EA4335` yellow `#FBBC05` green `#34A853`). Rendering this in pure RN/Expo would mean a custom SVG component or a Lucide icon — Lucide does not ship an official Google G.
- Chose: inline a tiny PNG of the G, or compose 4 Lucide circles. We do not have a Google G asset in `assets/`.
- Pragmatic call: use a single small color-tinted Lucide `Sparkles` or `MessageSquare` placeholder inside the button until/unless the user provides a Google G asset. **Open question — flag for user.**

**3. Hero illustration sizing**
Figma places the illustration at 360×360 inside a 430-wide frame with 35px side padding. Use `w-[360px] h-[360px] mx-auto` on `<Image>`. The wellcome.png asset is square and large; trust it to scale.
- Considered: `aspect-square w-full` for responsiveness.
- Chose: fixed 360px to match Figma. Smaller phones will scroll. The `ScrollView` wrapper already exists conceptually; add it.

**4. Green accent for the "Interview" word**
Figma uses an inline `styleOverrideTable` to color one word. In RN, split the headline into two `<Text>` spans, the second colored `text-[#0D9550]` (approx — need to sample the exact hex from Figma: rgb 0.051/0.918/0.349 ≈ `#0DEA59`... close to a Tailwind `emerald-500` = `#10B981`). Add a local semantic constant: `--color-accent-green` via `global.css` and use `text-accent-green` class. Single source of truth.

**5. Layout container**
Figma uses vertical flex with `gap: 56` between hero block and content block, and the trust badge is 24px above the illustration. Reproduce with `flex flex-col items-center gap-14 px-7 py-6` and a `gap-6` sub-stack inside the trust+illustration group. Background `bg-slate-50` (token `fill1`).

**6. Trust badge — overlapping avatars**
Figma has 3×24px circles, 8px negative spacing, inside a pill with 16px horizontal padding, 8px vertical, white bg, 1px slate border, 100px radius, 1px y=1 black 5% drop shadow. The pill also contains the text "Trusted by 10k+ candidates" — Lexend SemiBold 12px, color `rgb 0.294/0.333/0.388` ≈ `#4B5563` (token `Black-2`).
- Compose via `<View className="flex-row items-center bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm">` with three `<Image>` and one `<Text>` inside.

**7. Google button**
Figma button: 372 wide × 58 tall, 24px radius, white bg, 1px slate-200 border, 18px vertical padding, 82px horizontal padding, gap 16, with the 22×22 G icon and "Continue with Google" Lexend SemiBold 16px `#0F172A` (token `Black-1`).
- Use existing `Button` with `variant="outline"` (already supports white bg + border) or add a new `variant="google"` if a tint difference is needed.
- Decision: reuse `variant="outline"`; do not add a new variant for one screen.

## Risks / Trade-offs

- **[Risk] Google G icon visual mismatch** — the Figma uses the official four-color mark; without that asset the button will look generic. → **Mitigation**: ask user for an asset, or ship a TODO comment to add it.
- **[Risk] Pixel drift on smaller devices** — 360×360 illustration + 372px button exceeds 360px safe width on small Android. → **Mitigation**: wrap screen in `ScrollView` with `contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}`. No resize — keep the design.
- **[Risk] Green hex mismatch** — exact brand green is eyeballed. → **Mitigation**: sample Figma node fill again to confirm before commit; define the constant in one place.
- **[Risk] Asset path 404 if folder name changes** — current folder is `Wellcome & Login` (typo: double-l). → **Mitigation**: alias the import or keep filename; document the quirk in code comment.

## Migration Plan

1. Apply change via `/opsx-apply` to land the file rewrite.
2. Re-bundle Metro: no native changes, so a JS reload via `r` in Metro console or `expo-dev-client` quick reload is enough.
3. Visual smoke test on Android emulator (`emulator-5554`) at `/welcome` route.
4. Compare against Figma `5:644` using the argent screenshot-diff workflow if available.
5. If button icon is wrong, request Google G asset from user, drop into `assets/icons/`, import in screen.

## Open Questions

- **Google G asset**: do we want a four-color PNG/SVG, or accept a Lucide placeholder for v1?
- **Green accent hex**: confirm exact brand green or accept approximate `#10B981` (Tailwind emerald-500)?
- **Folder rename**: should `Wellcome & Login/` be renamed to `Welcome & Login/`? Touches `app-flow-implementation` change references — defer or batch.

## Context

MockMate is an Expo-based React Native app for AI-powered mock interviews. Currently only has placeholder screens. The Figma designs define 20 screens across authentication, tab navigation, interview flows, gamification, and settings. Mock data structures already exist defining industries, difficulties, quest types, shop items, and user status.

**Current State:**
- Expo SDK 54 with Uniwind (Tailwind CSS v4) styling configured
- Empty app structure with `_layout.tsx` and placeholder `index.tsx`
- Mock data in separate files with TypeScript types
- Dependencies: Auth0 (Google OAuth), Sanity (CMS + data), AI SDK (Vercel), RevenueCat (subscriptions)
- A custom development client is required for `react-native-auth0` (no Expo Go)

**Constraints:**
- Auth0 requires a custom Expo dev client (`expo-dev-client` + EAS Build / `expo run:ios|android`)
- Uniwind className props only (no inline styles)
- File-based routing via Expo Router
- All env vars prefixed with `EXPO_PUBLIC_*` for client access
- Server-only secrets (Sanity write token) must NEVER be prefixed with `EXPO_PUBLIC_`

## Goals / Non-Goals

**Goals:**
- Implement all 20 screens from Figma designs with pixel-accurate layouts
- Create complete navigation flow: auth → tabs → nested stacks
- Google-only authentication via Auth0 with PKCE and refresh tokens
- Sanity-backed persistence for user profile, interview history, saved interviews, and gamification
- RevenueCat integration for VIP subscription (test mode initially)
- Reusable component library matching design system

**Non-Goals:**
- Real AI interview functionality in v1 (use mock responses; keep hook surface for AI SDK)
- Sanity Studio customization in v1 (default desk is fine)
- Email/password or other social providers (Google only per `auth-flow.md`)
- Analytics or crash reporting
- Full offline support (optimistic local updates with network sync only when online)

## Decisions

### 1. Navigation Architecture: Expo Router with Nested Navigators

**Decision:** Use Expo Router's file-based routing with `(tabs)` layout for main navigation and `(auth)` group for auth flow.

**Rationale:**
- File-based routing is Expo standard, clearer than React Navigation config
- `(tabs)` group provides bottom tabs without cluttering URL
- `(auth)` group keeps auth flow separate from main app
- Stack navigation for sub-flows (interview detail → mode select → execution)

**Structure:**
```
app/
  _layout.tsx          # Root layout with providers
  (auth)/
    _layout.tsx        # Auth stack
    welcome.tsx
    login.tsx
  (tabs)/
    _layout.tsx        # Bottom tabs
    index.tsx          # Home tab
    explore.tsx        # Explore tab
    quests.tsx         # Daily Quests tab
    shop.tsx           # Shop tab
    profile.tsx        # Profile tab
  interview/
    [id].tsx           # Interview detail
    mode.tsx           # Mode selection
    text.tsx           # Text mode interview
    voice.tsx          # Voice mode interview
    result.tsx         # Interview results
  history.tsx          # Interview history
  vip.tsx              # VIP subscription
```

**Alternatives Considered:**
- React Navigation: More verbose, less idiomatic for Expo
- Single-file routing: Harder to maintain with 20+ screens

### 2. State Management: Auth0Provider + React Query + Zustand

**Decision:** Use `Auth0Provider` (from `react-native-auth0`) for the auth context, React Query for all Sanity reads/writes, and Zustand for ephemeral UI state that must survive across screens (gamification counters, active interview session, favorites).

**Rationale:**
- `Auth0Provider` already manages user, token, and refresh — no need to reimplement
- React Query handles caching, deduping, retries, and background refetching against Sanity for free
- Zustand persists in-progress interview answers and current screen state, independent of network
- Clear seams: hooks wrap queries, components consume query results; no manual fetch logic

**Alternatives Considered:**
- Raw `fetch` + custom cache: reinvents React Query
- SWR: equivalent but React Query has stronger mutation + invalidation story
- Zustand for everything: wrong tool for server data, causes stale UI

### 3. Component Architecture: Atomic Design with Uniwind

**Decision:** Three-tier component structure: atoms, molecules, screens. All styled with Uniwind className props.

**Atoms:** Button, Text, Icon, Badge, Card
**Molecules:** InterviewCard, QuestCard, StreakBadge, TabBar
**Screens:** Full page components in `app/`

**Rationale:**
- Atomic design proven for design systems
- Uniwind className props match Figma design tokens (colors, spacing)
- Components map 1:1 to Figma components for easier handoff

**Alternatives Considered:**
- Flat component structure: Harder to reuse
- Inline styles: Violates AGENTS.md constraint

### 4. Data Layer: Sanity with JWT-Guarded API Routes

**Decision:** Read public interview content (cards, focus areas) via the Sanity client directly with CDN. Route all user-scoped reads/writes (history, gamification, saved interviews) through Expo API routes that verify the Auth0 JWT and pass the user `sub` server-side.

**Pattern:**
```typescript
// hooks/useInterviews.ts — public content
export function useInterviews() {
  return useQuery({
    queryKey: ['interviews'],
    queryFn: () => client.fetch(`*[_type == "interview"]{ ... }`),
  });
}

// hooks/useInterviewHistory.ts — user-scoped
export function useInterviewHistory() {
  const { getAccessToken } = useAuth0();
  return useQuery({
    queryKey: ['history'],
    queryFn: async () => {
      const token = await getAccessToken();
      return fetch('/api/history', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json());
    },
  });
}

// app/api/history/+server.ts — server-side
export async function GET({ request }) {
  const { sub } = await verifyAuth0Token(request);
  return client.fetch(
    `*[_type == "interviewHistory" && userId == $sub]`,
    { sub }
  );
}
```

**Rationale:**
- Sanity CDN token is safe to ship (read-only, scoped to public content)
- User-scoped writes never trust client-side `userId`; server derives from verified JWT
- Single source of truth (Sanity), no duplicated read paths

**Alternatives Considered:**
- Direct Sanity writes from app: requires a write token in the client bundle — security risk
- BFF only: even public reads benefit from GROQ expressiveness via Sanity CDN

### 5. Gamification: Optimistic Local + Sanity Sync

**Decision:** Update XP/gems/streak in Zustand instantly, mirror writes to Sanity via API routes. On app open, hydrate Zustand from the latest Sanity doc (last write wins).

**Flow:**
1. User completes interview → `addXP(120)` updates Zustand synchronously
2. UI reflects new XP immediately
3. React Query mutation posts to `/api/gamification/award` with the Auth0 access token
4. Server validates JWT, writes to Sanity, returns new state
5. On next session, `useGamificationState` query hydrates Zustand

**Rationale:**
- Instant UI feedback (no spinner on every gem earn)
- Sanity remains source of truth across devices (future: streak holds on phone + web)
- No data loss on force quit — Zustand persists transient, Sanity persists permanent

**Alternatives Considered:**
- Server-authoritative: adds round-trip latency to every reward animation
- No persistence: user loses progress on crash

### 6. RevenueCat Integration: Offerings-Based Paywall

**Decision:** Use RevenueCat Offerings API to fetch subscription plans dynamically, gate features with `useVIPStatus()` hook.

**Pattern:**
```typescript
// hooks/useVIPStatus.ts
export function useVIPStatus() {
  const customerInfo = Purchases.getCustomerInfo();
  const isVIP = customerInfo.entitlements.active['vip'] !== undefined;
  return { isVIP, expiryDate: customerInfo.expiryDate };
}

// In screen:
const { isVIP } = useVIPStatus();
if (!isVIP) return <VIPPaywall />;
```

**Rationale:**
- Offerings API allows server-side plan changes without app update
- Hook pattern keeps subscription logic centralized
- Easy to A/B test pricing

**Alternatives Considered:**
- Hardcoded product IDs: Requires app update for price changes
- Manual App Store API: More code, less reliable

## Risks / Trade-offs

**[Risk]** Auth0 Universal Login opens an external browser, breaking in-app feel
→ **Mitigation:** Smooth transition animation; deep-link back to the same screen the user left; track the "return from auth" handoff in `_layout.tsx`

**[Risk]** `react-native-auth0` doesn't work in Expo Go
→ **Mitigation:** Document the dev-client workflow (`npx expo run:ios`), commit a working dev build to TestFlight for shared QA

**[Risk]** Sanity write token leaked to client bundle
→ **Mitigation:** Only `EXPO_PUBLIC_SANITY_*` (project id, dataset, CDN token) ship in the client; the write token lives in API route env vars and is server-only. Add a lint rule or prebuild check for `EXPO_PUBLIC_SANITY_TOKEN`

**[Risk]** Auth0 token expired mid-session, user sees 401
→ **Mitigation:** React Query `retry` calls `getAccessToken` (which uses the refresh token) before the actual request; falls through to login only if refresh fails

**[Risk]** GROQ query exposes another user's data due to a missing `userId` filter
→ **Mitigation:** Centralize all user-scoped queries in `src/lib/sanity/queries.ts`; never inline a user filter in a screen — the helper always injects `$sub` from the verified JWT

**[Risk]** RevenueCat sandbox purchases diverge from production
→ **Mitigation:** Document sandbox test plan; gate the paywall behind a `__DEV__` env var so manual QA can skip

**[Risk]** 20+ screens = large JS bundle
→ **Mitigation:** Expo Router code-splits by route automatically; verify with `expo export --platform ios`

**[Trade-off]** Client-optimistic gamification = easier to cheat
→ **Accept:** Server-side reconciliation in v2; acceptable for MVP since gems are non-fungible rewards

**[Trade-off]** Uniwind limits dynamic theming
→ **Accept:** Design system uses a fixed color palette, dynamic themes not in scope
→ **Accept:** Design system uses fixed color palette, dynamic themes not in Figma scope

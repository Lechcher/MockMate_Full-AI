## Why

MockMate currently has only placeholder screens. We need to implement the complete app flow with all screens, navigation, and data integration based on the Figma designs and mock data to create a functional AI mock interview application. The authentication layer is anchored by Auth0 (Google OAuth only) and all user data, interview content, and gamification state are persisted to Sanity CMS (document database with GROQ).

## What Changes

- Implement complete tab-based navigation (Home, Explore, Daily Quests, Shop, Profile)
- Build Google-only authentication flow via Auth0 (no email/password)
- Persist all user data to Sanity: profile, interview history, gamification state, saved interviews
- Create interview browsing and filtering by industry/difficulty
- Implement interview detail, mode selection, and execution screens (text and voice modes)
- Add gamification features (streaks, XP, gems, quests) with Sanity-backed persistence
- Build shop with premium subscription and power-ups
- Create profile and settings screens
- Add interview history and saved interviews
- Implement VIP status and subscription plans
- Connect all screens to mock data structures provided

## Capabilities

### New Capabilities
- `authentication-flow`: Welcome screen and Google-only OAuth via Auth0 (PKCE + refresh tokens); auto-create Sanity profile on first login
- `tab-navigation`: Bottom tab navigation structure for five main sections
- `home-screen`: Dashboard with streak tracking, featured interviews, and quick actions
- `explore-interviews`: Browse and filter mock interviews by industry, difficulty, with search
- `interview-detail`: Interview preview with metadata, questions count, reviews, and save functionality
- `interview-execution`: Text and voice mode interview screens with AI interaction
- `interview-results`: Post-interview feedback, scoring, and performance breakdown
- `daily-quests`: Quest system with progress tracking and gem rewards
- `shop-system`: Premium upsell, power-ups purchase with gems, subscription management
- `profile-settings`: User profile, interview history, saved interviews, app settings, security
- `gamification`: Streak tracking, XP system, gem economy, level progression
- `vip-subscription`: Premium plan selection, RevenueCat integration, feature gating
- `sanity-data-layer`: Sanity client, GROQ queries, JWT-guarded API routes for secure user-data access

### Modified Capabilities
<!-- No existing capabilities are being modified -->

## Impact

- New directory structure under `MockMate/src/app/` for all screens using Expo Router file-based routing
- New components under `MockMate/src/components/` for reusable UI elements
- Integration with existing mock data structures (status, industries, difficulties, cardsData, questData, etc.)
- Auth0 SDK integration for Google OAuth (requires `expo-dev-client`, no Expo Go)
- Sanity client + GROQ queries for content and user data
- Sanity schema additions: `userProfile`, `interviewHistory`, `gamificationState`
- API route layer to verify Auth0 JWT and proxy user-scoped Sanity queries
- RevenueCat SDK integration for subscription management
- New dependencies: `react-native-auth0`, `@sanity/client`, `@tanstack/react-query`
- New env vars: `EXPO_PUBLIC_AUTH0_*`, `EXPO_PUBLIC_SANITY_*`, server-only `SANITY_API_TOKEN`

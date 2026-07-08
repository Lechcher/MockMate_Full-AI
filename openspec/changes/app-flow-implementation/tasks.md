## 1. Project Setup and Dependencies

- [x] 1.1 Install Expo Router dependencies (`expo-router`, `expo-linking`, `expo-constants`) — already present
- [x] 1.2 Install state management dependencies (`zustand`, `@react-native-async-storage/async-storage`) — already installed
- [x] 1.3 Install RevenueCat SDK (`react-native-purchases`) — already installed
- [x] 1.4 Install Auth0 SDK (`react-native-auth0`) — already installed
- [x] 1.5 Install Sanity client (`@sanity/client`) and React Query (`@tanstack/react-query`)
- [x] 1.6 Install `expo-dev-client` (required for `react-native-auth0`, not Expo Go compatible)
- [x] 1.7 Create `.env.example` with Auth0, Sanity, and RevenueCat env vars (see end of this file)
- [x] 1.8 Update `AGENTS.md` Stack table with new dependencies (Auth0, Sanity, React Query, dev client)

## 2. Type Definitions and Data Schemas

- [x] 2.1 Create `src/types/interview.ts` with Interview, Industry, Difficulty types
- [x] 2.2 Create `src/types/user.ts` with Auth0 User, Sanity UserProfile, GamificationState types
- [x] 2.3 Create `src/types/quest.ts` with Quest, QuestType types
- [x] 2.4 Create `src/types/shop.ts` with PowerUp, VIPPlan types
- [x] 2.5 Create Zod schemas in `src/schemas/` mirroring TypeScript types
- [x] 2.6 Create `src/lib/sanity/schemas/userProfile.ts` (Sanity Studio schema for `userProfile` document)
- [x] 2.7 Create `src/lib/sanity/schemas/interviewHistory.ts` (Sanity schema for history)
- [x] 2.8 Create `src/lib/sanity/schemas/savedInterview.ts` (Sanity schema for saved interviews)

## 3. State Management Setup

- [x] 3.1 Create `src/lib/sanity/client.ts` with two clients: public CDN (read public interviews) and server-only (API routes)
- [x] 3.2 Create `src/lib/auth/Auth0Provider.tsx` wrapper that reads `EXPO_PUBLIC_AUTH0_DOMAIN` and `EXPO_PUBLIC_AUTH0_CLIENT_ID` and wraps the app
- [x] 3.3 Create `src/lib/query/QueryProvider.tsx` React Query provider with sane defaults
- [x] 3.4 Create Zustand store `src/stores/gamificationStore.ts` for transient streak/XP/gems with persist middleware
- [x] 3.5 Create Zustand store `src/stores/interviewStore.ts` for active interview answers and favorites
- [x] 3.6 Create `src/lib/auth/RequireAuth.tsx` component that redirects to `(auth)/welcome` if not authenticated
- [x] 3.7 Create `src/lib/revenuecat/VIPContext.tsx` that reads `getCustomerInfo()` and exposes `isVIP`, `expiryDate`

## 4. Data Hooks

- [x] 4.1 Create `src/hooks/useInterviews.ts` — React Query calling the public Sanity client for interview list
- [x] 4.2 Create `src/hooks/useUserProfile.ts` — React Query calling `/api/user-profile` (JWT-guarded)
- [x] 4.3 Create `src/hooks/useInterviewHistory.ts` — React Query calling `/api/interview-history`
- [x] 4.4 Create `src/hooks/useSavedInterviews.ts` — React Query calling `/api/saved-interviews`
- [x] 4.5 Create `src/hooks/useGamificationState.ts` — React Query + Zustand hydration
- [x] 4.6 Create `src/hooks/useAuthSync.ts` — auto-creates Sanity profile on first login, hydrates Zustand on subsequent logins
- [x] 4.7 Create `src/hooks/useVIPStatus.ts` — wraps VIPContext with a stable API
- [x] 4.8 Create `src/hooks/useAuth.ts` — wraps `useAuth0` from `react-native-auth0` (Google login, logout, getAccessToken)

## 5. API Routes (Server-Side Sanity Layer)

- [x] 5.1 Create `src/lib/auth/verifyToken.ts` — verifies Auth0 JWT using `jose` and the JWKS endpoint
- [x] 5.2 Create `src/app/api/user-profile+api.ts` — GET/POST/PATCH user profile (Auth0 sub from JWT)
- [x] 5.3 Create `src/app/api/interview-history+api.ts` — GET list, POST new history entry
- [x] 5.4 Create `src/app/api/saved-interviews+api.ts` — GET/POST/DELETE favorites
- [x] 5.5 Create `src/app/api/gamification/award+api.ts` — POST XP/gems/streak update with server-side validation
- [x] 5.6 Create `src/app/api/gamification/state+api.ts` — GET current state for hydration

## 6. Atomic Components (Atoms)

- [x] 6.1 Create `src/components/atoms/Button.tsx` with Uniwind className variants (primary, secondary, outline, google)
- [x] 6.2 Create `src/components/atoms/Text.tsx` with typography variants (heading, body, caption)
- [x] 6.3 Create `src/components/atoms/Icon.tsx` wrapper for Lucide icons
- [x] 6.4 Create `src/components/atoms/Badge.tsx` with color variants
- [x] 6.5 Create `src/components/atoms/Card.tsx` base card component with shadow
- [x] 6.6 Create `src/components/atoms/ProgressBar.tsx` with percentage fill

## 7. Molecular Components (Molecules)

- [x] 7.1 Create `src/components/molecules/InterviewCard.tsx` with industry icon, difficulty badge, rating, favorite button
- [x] 7.2 Create `src/components/molecules/QuestCard.tsx` with quest icon, progress bar, reward display
- [x] 7.3 Create `src/components/molecules/StreakBadge.tsx` with fire icon and count
- [x] 7.4 Create `src/components/molecules/ShopCard.tsx` for premium and power-up displays
- [x] 7.5 Create `src/components/molecules/StatCard.tsx` for profile statistics
- [x] 7.6 Create `src/components/molecules/HeaderMetrics.tsx` showing gems, XP, streak in header
- [x] 7.7 Create `src/components/molecules/GoogleSignInButton.tsx` — branded button with Google logo

## 8. Navigation Structure

- [x] 8.1 Update `src/app/_layout.tsx` to wrap with `Auth0Provider`, `QueryProvider`, and `RequireAuth`
- [x] 8.2 Create `src/app/(auth)/_layout.tsx` auth stack navigator
- [x] 8.3 Create `src/app/(tabs)/_layout.tsx` bottom tabs navigator with 5 tabs and custom tab bar
- [x] 8.4 Configure tab icons using Lucide icons (Home, Compass, List, ShoppingBag, User)
- [x] 8.5 Add navigation theme matching Uniwind color system
- [x] 8.6 Configure deep linking with `mockmate://` scheme in `app.json` for Auth0 callbacks

## 9. Authentication Flow Screens

- [x] 9.1 Create `src/app/(auth)/welcome.tsx` with app logo, tagline, and a single "Continue with Google" button using `useAuth0().authorize({ connection: 'google-oauth2' })`
- [x] 9.2 Display login error states: cancelled consent, network error, Auth0 error
- [x] 9.3 Show loading state while Auth0 returns from the browser
- [x] 9.4 Wire `_layout.tsx` to render `(auth)/welcome` when user is null, otherwise `(tabs)`
- [x] 9.5 Wire `useAuthSync` so the first successful login creates the Sanity `userProfile` document before navigating to home
- [x] 9.6 Wire `useUserProfile` query so subsequent logins hydrate the Zustand gamification store before showing home
- [x] 9.7 Implement silent refresh on app launch using `getCredentials()` + `clearSession()` fallback to welcome

## 10. Home Tab Screen

- [x] 10.1 Create `src/app/(tabs)/index.tsx` home screen layout
- [x] 10.2 Add `HeaderMetrics` component showing gems, XP, streak, VIP badge from `useUserProfile`
- [x] 10.3 Add featured interviews carousel using `useInterviews` and a horizontal `FlatList`
- [x] 10.4 Add daily quest progress card linking to quests tab
- [x] 10.5 Add quick action buttons (Start Interview, Browse All)
- [x] 10.6 Add learning status indicator ("Start your daily practice" or "Great job today!")
- [x] 10.7 Implement streak milestone popup modal on 7/14/30 day achievements

## 11. Explore Tab Screen

- [x] 11.1 Create `src/app/(tabs)/explore.tsx` explore screen layout
- [x] 11.2 Add search input with real-time filtering on the local `useInterviews` cache
- [x] 11.3 Add horizontal industry filter chips with selection state
- [x] 11.4 Add difficulty filter chips below industry filters
- [x] 11.5 Implement interview grid using FlatList with 2 columns
- [x] 11.6 Implement combined filter logic (industry AND difficulty AND search)
- [x] 11.7 Add favorite toggle via mutation to `/api/saved-interviews`
- [x] 11.8 Implement navigation to interview detail on card tap

## 12. Daily Quests Tab Screen

- [x] 12.1 Create `src/app/(tabs)/quests.tsx` daily quests screen layout
- [x] 12.2 Display list of quest cards using FlatList
- [x] 12.3 Implement real-time progress updates via `useGamificationState` (server) and `gamificationStore` (transient)
- [x] 12.4 Add quest completion celebration animation and gem award (POST to `/api/gamification/award`)
- [x] 12.5 Add countdown timer showing time until daily reset
- [x] 12.6 Display "Total Earned" lifetime gem stat
- [x] 12.7 Implement daily quest reset logic (midnight local time) — generate a new quest set client-side from a seedable list

## 13. Shop Tab Screen

- [x] 13.1 Create `src/app/(tabs)/shop.tsx` shop screen layout
- [x] 13.2 Add "Go Premium" card at top for non-VIP users (hide for VIP) using `useVIPStatus`
- [x] 13.3 Add "Daily Deal" special offer card
- [x] 13.4 Display Power-Ups section with Streak Freeze and Double XP cards
- [x] 13.5 Implement gem purchase confirmation modal
- [x] 13.6 Add power-up purchase logic: POST to `/api/gamification/award` (negative delta) and update local store
- [x] 13.7 Display gem balance in header, update after purchases via React Query invalidation
- [x] 13.8 Implement "insufficient gems" error with link to quests tab
- [x] 13.9 Prevent duplicate Double XP purchase when already active

## 14. Profile Tab Screen

- [x] 14.1 Create `src/app/(tabs)/profile.tsx` profile screen layout
- [x] 14.2 Add user profile header with avatar (from `useUserProfile`), name, email, VIP badge
- [x] 14.3 Display user stats (XP, level, gems, streak) from `useUserProfile`
- [x] 14.4 Add Career section menu (Interview History, Saved Interviews)
- [x] 14.5 Add App Settings section menu (General Settings, Security, Language)
- [x] 14.6 Add Support section menu (Help Center, Log Out)
- [x] 14.7 Implement logout confirmation modal — calls `useAuth().logout()` which clears Auth0 session and React Query cache
- [x] 14.8 Add "Upgrade to VIP" banner for non-VIP users

## 15. Interview Detail Screen

- [x] 15.1 Create `src/app/interview/[id].tsx` detail screen using `useInterviews` to find the interview
- [x] 15.2 Display interview header with title, industry, difficulty, rating
- [x] 15.3 Show focus area, question count, duration estimate
- [x] 15.4 Add favorite toggle button — calls `useSavedInterviews` mutation
- [x] 15.5 Display interview description and review breakdown
- [x] 15.6 Add "VIP Only" indicator for premium interviews when `useVIPStatus().isVIP === false`
- [x] 15.7 Add "Start Interview" button navigating to mode selection
- [x] 15.8 Replace button with "Upgrade to Start" for premium interviews (non-VIP)

## 16. Interview Mode Selection Screen

- [x] 16.1 Create `src/app/interview/mode.tsx` mode selection screen
- [x] 16.2 Display two mode cards: Text Mode and Voice Mode
- [x] 16.3 Add descriptions and icons to each mode card
- [x] 16.4 Implement navigation to text interview on Text Mode tap
- [x] 16.5 Request microphone permission via `expo-av` and navigate to voice interview on Voice Mode tap
- [x] 16.6 Handle microphone permission denial with error message

## 17. Text Mode Interview Screen

- [x] 17.1 Create `src/app/interview/text.tsx` text interview screen
- [x] 17.2 Display question progress indicator (Question X of Y)
- [x] 17.3 Display current question text prominently
- [x] 17.4 Add multi-line text input with character count
- [x] 17.5 Add "Next Question" button with answer submission logic (store in Zustand)
- [x] 17.6 Implement skip confirmation modal for empty answers
- [x] 17.7 Add elapsed time timer in header
- [x] 17.8 On finish, POST to `/api/interview-history` and navigate to results
- [x] 17.9 Implement save and exit confirmation modal

## 18. Voice Mode Interview Screen

- [x] 18.1 Create `src/app/interview/voice.tsx` voice interview screen
- [x] 18.2 Display question progress indicator
- [x] 18.3 Implement text-to-speech for question reading (`expo-speech`)
- [x] 18.4 Add "Replay" button to repeat question
- [x] 18.5 Implement microphone recording with waveform animation (`expo-av`)
- [x] 18.6 Add stop recording button and playback controls
- [x] 18.7 Add re-record functionality
- [x] 18.8 Implement 3-minute recording time limit
- [x] 18.9 Add elapsed time timer in header
- [x] 18.10 On finish, upload audio to Sanity assets, POST to `/api/interview-history`, navigate to results

## 19. Interview Results Screen

- [x] 19.1 Create `src/app/interview/result.tsx` results screen
- [x] 19.2 Display overall performance score with circular progress indicator
- [x] 19.3 Add color-coded score styling (green 80-100%, yellow 60-79%, red 0-59%)
- [x] 19.4 Show performance metrics breakdown (Communication, Technical Knowledge, Problem Solving, Confidence)
- [x] 19.5 Display question-by-question feedback list with expand/collapse
- [x] 19.6 Calculate and display XP and gems earned with animation
- [x] 19.7 POST to `/api/gamification/award` to persist rewards
- [x] 19.8 Increment streak if first interview of the day (server-side in the award endpoint)
- [x] 19.9 Display improvement areas section
- [x] 19.10 Add action buttons (Save Interview, Share Results, Try Again)
- [x] 19.11 Implement "Back to Home" navigation clearing stack

## 20. Interview History Screen

- [x] 20.1 Create `src/app/history.tsx` interview history screen
- [x] 20.2 Display list from `useInterviewHistory` (paged if needed)
- [x] 20.3 Show interview title, completion date, score, duration per entry
- [x] 20.4 Navigate to history detail screen on tap
- [x] 20.5 Display "No interviews completed yet" empty state

## 21. Saved Interviews Screen

- [x] 21.1 Create saved interviews screen at `src/app/saved.tsx`
- [x] 21.2 Display grid of favorited interviews from `useSavedInterviews`
- [x] 21.3 Add unfavorite functionality on heart icon tap (DELETE via mutation)
- [x] 21.4 Display "No saved interviews" empty state with "Browse Interviews" button

## 22. VIP Subscription Screen

- [x] 22.1 Create `src/app/vip.tsx` VIP subscription screen
- [x] 22.2 Display yearly and monthly plan cards with pricing
- [x] 22.3 Show "Best Value" badge on yearly plan with 50% discount
- [x] 22.4 List VIP benefits with checkmark icons
- [x] 22.5 Integrate `Purchases.getOfferings()` to fetch subscription products
- [x] 22.6 Implement plan selection highlighting
- [x] 22.7 Add "Subscribe" button triggering `Purchases.purchasePackage()`
- [x] 22.8 Handle purchase success, cancellation, and error states
- [x] 22.9 Display "Try Free for 7 Days" badge for new users
- [x] 22.10 Add "Restore Purchases" button calling `Purchases.restorePurchases()`
- [x] 22.11 Show trial terms disclaimer text

## 23. VIP Status Screen

- [x] 23.1 Create `src/app/vip-status.tsx` VIP status screen
- [x] 23.2 Display current plan type (Yearly/Monthly) from `useVIPStatus`
- [x] 23.3 Show renewal or expiration date
- [x] 23.4 Add "Manage Subscription" button opening App Store/Google Play via `Linking`
- [x] 23.5 Accessible only from profile crown badge tap

## 24. Testing and Verification

- [ ] 24.1 Run `npx expo run:ios` and verify app loads on iOS dev build
- [ ] 24.2 Run `npx expo run:android` and verify app loads on Android dev build
- [ ] 24.3 Test Google login: welcome → Google consent → home navigation, confirm Sanity `userProfile` is created
- [ ] 24.4 Test tab navigation and state preservation
- [ ] 24.5 Test explore filters (industry, difficulty, search) combinations
- [ ] 24.6 Test favorite toggle persistence across sessions (via `/api/saved-interviews`)
- [ ] 24.7 Test interview flow: detail → mode select → text mode → results, confirm `interviewHistory` written to Sanity
- [ ] 24.8 Test interview flow: detail → mode select → voice mode → results
- [ ] 24.9 Test quest progress updates and completion, confirm gamification state updated in Sanity
- [ ] 24.10 Test gem purchases and balance updates
- [ ] 24.11 Test streak increment logic and freeze consumption
- [ ] 24.12 Test VIP subscription flow (sandbox mode)
- [ ] 24.13 Test VIP feature gating (premium interviews)
- [ ] 24.14 Verify no API route returns another user's data (manual probe with a second account)
- [ ] 24.15 Verify all screens use Uniwind className props (no inline styles)
- [ ] 24.16 Run `lsp_diagnostics` on all new files and fix errors

## 25. Documentation and Cleanup

- [ ] 25.1 Update `MockMate/README.md` with app architecture overview (Auth0 + Sanity)
- [ ] 25.2 Document the data flow in `llm/DATA_FLOW.md` (already have `app-flow.md` and `auth-flow.md`)
- [ ] 25.3 Document state management in `llm/STATE_MANAGEMENT.md`
- [ ] 25.4 Add inline JSDoc comments to complex hooks (esp. `useAuthSync`, `useGamificationState`)
- [ ] 25.5 Remove any unused imports or commented code
- [ ] 25.6 Verify `.env.example` has all required variables with example values (Auth0, Sanity, RevenueCat)
- [ ] 25.7 Document the dev-client workflow in `README.md` (cannot use Expo Go)

## 26. Required .env.example Variables (Reference)

The `MockMate/.env.example` already contains every variable below plus the
current Appwrite/RevenueCat/OpenAI pieces. Auth0 was replaced by Appwrite
in commit `054de39`, so 26.1 + 26.2 are obsolete; the Appwrite equivalents
(AUTH_SETUP.md) cover the same role.

- [x] 26.1 `EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1` (replaces Auth0 domain)
- [x] 26.2 `EXPO_PUBLIC_APPWRITE_PROJECT_ID=...` (replaces Auth0 client id)
- [x] 26.3 `EXPO_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id`
- [x] 26.4 `EXPO_PUBLIC_SANITY_DATASET=production`
- [x] 26.5 `EXPO_PUBLIC_SANITY_API_VERSION=2024-01-01`
- [x] 26.6 `SANITY_API_TOKEN=server_only_write_token` (no `EXPO_PUBLIC_` prefix)
- [x] 26.7 `EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxxxxx`
- [x] 26.8 `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxxxxxxx`

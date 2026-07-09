# MockMate - AI-Powered Mock Interview App

**Status:** 🟢 85% Complete - Ready for Testing Phase  
**Platform:** iOS & Android (React Native + Expo)  
**Last Updated:** July 3, 2026

---

## 🎯 What is MockMate?

MockMate is a mobile app that helps users practice job interviews with AI-powered feedback. Users can complete mock interviews in text or voice mode, receive detailed AI feedback, and track their progress with gamification features.

### Key Features
- 📱 **Dual Interview Modes** - Text or voice-based practice
- 🤖 **AI-Powered Feedback** - Detailed performance analysis with scoring
- 🎮 **Gamification System** - XP, levels, gems, daily streaks, and quests
- 👑 **VIP Subscription** - Premium interviews and exclusive features via RevenueCat
- 📊 **Progress Tracking** - Interview history with saved completions
- 🔖 **Favorites** - Save interviews for later practice
- 🔐 **Secure Authentication** - Google OAuth via Appwrite
- 🎤 **Voice Features** - Text-to-Speech (TTS) and Speech-to-Text (STT)
- 🛍️ **In-App Shop** - Power-ups like Streak Freeze and Double XP

---

## 📊 Current Status

**Progress:** 172/202 tasks complete (85%)

### ✅ Complete
- ✅ All 16 user-facing screens implemented
- ✅ Complete interview flow (browse → practice → results → history)
- ✅ Authentication with Appwrite (Google OAuth)
- ✅ Gamification system (XP, gems, quests, shop)
- ✅ RevenueCat VIP subscription (purchase, restore, status sync)
- ✅ Component library (15 components: 8 atoms + 7 molecules)
- ✅ State management (Zustand + React Query)
- ✅ TTS/STT integration (Expo AV + OpenAI)
- ✅ Data persistence (interview completions saved to Sanity)
- ✅ Error handling and loading states

### 🚧 Remaining (30 tasks - 15%)
- ⏳ End-to-end testing (17 tasks)
- ⏳ Documentation polish (7 tasks)
- ⏳ UI polish and animations (6 tasks)

**See [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md) for detailed breakdown**

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- iOS Simulator (macOS) or Android Emulator
- Expo CLI (`npm install -g expo-cli`)
- **Required accounts:**
  - Appwrite Cloud project (for Google OAuth authentication)
  - Sanity (for CMS/database)
  - RevenueCat (for subscriptions)
  - OpenAI-compatible API (for AI features)

### Installation

1. **Clone and install dependencies**
   ```bash
   cd MockMate
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your credentials. Appwrite and Sanity vars go in
   here. See `MockMate/.env.example` for the full list with placeholders.

3. **Run in Expo Go (recommended for local dev)**
   ```bash
   npx expo start
   ```
   
   Press `i` for iOS simulator or `a` for Android emulator. No custom
   development-client build required — Appwrite is Expo Go compatible.

4. **Configure Sanity Studio (Required for data persistence)**
   
   See [SANITY_STUDIO_SETUP.md](SANITY_STUDIO_SETUP.md) for detailed instructions.

---

## 📁 Project Structure

```
MockMate/
├── MockMate/                          # React Native app
│   ├── src/
│   │   ├── app/                       # Screens (Expo Router)
│   │   │   ├── _layout.tsx            # Root layout with providers
│   │   │   ├── (auth)/                # Auth stack
│   │   │   │   └── welcome.tsx        # Google OAuth login
│   │   │   ├── (tabs)/                # Bottom tabs (5 screens)
│   │   │   │   ├── index.tsx          # Home tab
│   │   │   │   ├── explore.tsx        # Browse interviews
│   │   │   │   ├── quests.tsx         # Daily quests
│   │   │   │   ├── shop.tsx           # Power-ups shop
│   │   │   │   └── profile.tsx        # User profile
│   │   │   ├── interview/             # Interview flow (5 screens)
│   │   │   │   ├── [id].tsx           # Interview detail
│   │   │   │   ├── mode.tsx           # Text/Voice selection
│   │   │   │   ├── text.tsx           # Text interview
│   │   │   │   ├── voice.tsx          # Voice interview
│   │   │   │   └── results.tsx        # Feedback & rewards
│   │   │   ├── history.tsx            # Interview history
│   │   │   ├── saved.tsx              # Saved interviews
│   │   │   └── vip.tsx                # VIP subscription
│   │   ├── components/
│   │   │   ├── atoms/                 # 8 basic components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Text.tsx
│   │   │   │   ├── Icon.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   └── Avatar.tsx
│   │   │   └── molecules/             # 7 composite components
│   │   │       ├── InterviewCard.tsx
│   │   │       ├── QuestCard.tsx
│   │   │       ├── StreakBadge.tsx
│   │   │       ├── ShopCard.tsx
│   │   │       ├── StatCard.tsx
│   │   │       ├── HeaderMetrics.tsx
│   │   │       └── GoogleSignInButton.tsx
│   │   ├── hooks/                     # 10 custom hooks
│   │   │       ├── useAuth.ts             # Appwrite-backed auth bridge
│   │   │   ├── useUserProfile.ts      # User data from Sanity
│   │   │   ├── useInterviews.ts       # Interview queries
│   │   │   ├── useSavedInterviews.ts  # Favorites management
│   │   │   ├── useInterviewHistory.ts # Past completions
│   │   │   ├── useGamificationState.ts # XP, gems, quests
│   │   │   ├── useVIPStatus.ts        # RevenueCat subscription
│   │   │   ├── useTTS.ts              # Text-to-Speech
│   │   │   ├── useSTT.ts              # Speech-to-Text
│   │   │   └── useChat.ts             # AI chat (future)
│   │   ├── lib/
│   │   │   ├── sanity/
│   │   │   │   ├── client.ts          # Sanity client config
│   │   │   │   └── schemas/           # Document schemas
│   │   │   └── appwrite/             # Appwrite config + auth context
│   │   │   ├── query/                 # React Query setup
│   │   │   └── revenuecat/            # RevenueCat config
│   │   ├── stores/                    # Zustand stores
│   │   │   ├── gamificationStore.ts   # XP, gems, streak
│   │   │   └── interviewStore.ts      # Interview state
│   │   ├── types/                     # TypeScript types
│   │   └── contexts/
│   │       └── VIPContext.tsx         # VIP status provider
│   ├── app.json                       # Expo config
│   ├── global.css                     # Uniwind styles
│   ├── metro.config.js                # Metro + Uniwind config
│   └── .env.example                   # Environment template
├── docs/                              # Documentation
│   ├── API_INTEGRATION.md             # Integration guides
│   ├── SANITY_STUDIO_SETUP.md         # CMS setup
│   └── QUICK_START.md                 # Setup instructions
├── IMPLEMENTATION_PROGRESS.md         # Task tracking
├── CURRENT_STATUS.md                  # Detailed status
└── README.md                          # This file
```

**70 TypeScript files | ~4,600 lines of code**

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React Native (Expo SDK 56) | Cross-platform mobile |
| **Routing** | Expo Router | File-based navigation |
| **Styling** | Uniwind (Tailwind CSS v4) | Utility-first styling |
| **State** | Zustand + React Query | Local + server state |
| **Backend** | Sanity | Headless CMS/database |
| **Auth** | Appwrite (react-native-appwrite) | Google OAuth |
| **Payments** | RevenueCat | Subscription management |
| **AI** | AI SDK + OpenAI | Chat, TTS, STT |
| **Audio** | Expo AV | Audio playback/recording |
| **Validation** | Zod | Runtime type checking |
| **Icons** | Lucide React Native | Icon library |
| **TypeScript** | 5.x | Type safety |

---

## 📱 User Flows

### Complete Interview (Text Mode)
```
Welcome (Login) → Home → Explore → Interview Detail → Mode Selection 
→ Text Interview → Results → Home
```

### Complete Interview (Voice Mode)
```
Welcome (Login) → Home → Explore → Interview Detail → Mode Selection 
→ Microphone Permission → Voice Interview (TTS/STT) → Results → Home
```

### Subscribe to VIP
```
Profile → Upgrade to VIP → Select Plan (Monthly/Yearly) 
→ Purchase → Confirmation → VIP Badge
```

### Daily Quest Flow
```
Home → Quests Tab → Complete Interview → Auto Quest Progress 
→ Quest Complete → Gem Reward
```

---

## 🎨 Features in Detail

### Authentication
- **Google OAuth** via Appwrite
- Auto profile creation in Sanity on first login
- Session management with Appwrite SDK (cookies/AsyncStorage) and JWT issuance on demand
- Logout with full state cleanup

### Interview System
- **Browse & Search** - Filter by industry and difficulty
- **Text Mode** - Type answers with character validation
- **Voice Mode** - TTS reads questions, STT captures answers
- **AI Feedback** - Score, rating, strengths, improvements
- **History** - Review past completions with full feedback
- **Favorites** - Save interviews for later

### Gamification
- **XP & Leveling** - Earn XP from interviews, level up
- **Gems** - Currency earned from quests
- **Daily Streak** - Consecutive days tracked
- **Daily Quests** - 3 challenges, reset at midnight
- **Power-Ups** - Streak Freeze, Double XP
- **Shop** - Purchase power-ups with gems

### VIP Subscription
- **RevenueCat Integration** - Native iOS/Android purchases
- **Monthly & Yearly Plans** - Dynamic pricing from RevenueCat
- **Premium Interviews** - Exclusive content for VIP
- **Restore Purchases** - Cross-device subscription sync
- **VIP Badge** - Displayed in profile and headers

### Voice Features
- **Text-to-Speech** - AI reads questions aloud
- **Speech-to-Text** - Transcribe voice answers
- **Recording UI** - Timer and waveform animation
- **Playback Controls** - Listen Again, Re-record

---

## 🔌 API Integration

### Appwrite
Authentication is handled by Appwrite. See `MockMate/.env.example`
under the "Appwrite Authentication" block for the four `EXPO_PUBLIC_*`
vars plus `APPWRITE_JWT_SECRET`. The redirect scheme `mockmate` must
be configured in `MockMate/app.json` and registered in your Appwrite
project's Google OAuth provider.

### Sanity
```typescript
// Public CDN client (read-only)
import { sanityClient } from '@/lib/sanity/client';

const interviews = await sanityClient.fetch('*[_type == "interview"]');
```

### RevenueCat
```typescript
// VIP status check
import { useVIPStatus } from '@/hooks/useVIPStatus';

const { isVIP, isLoading } = useVIPStatus();
```

### OpenAI (TTS/STT)
```typescript
// Text-to-Speech
import { useTTS } from '@/hooks/useTTS';

const { generateAndPlay, stop } = useTTS();
await generateAndPlay('Hello world');
```

**See [docs/API_INTEGRATION.md](docs/API_INTEGRATION.md) for detailed integration guides**

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Authentication flow (Google OAuth)
- [ ] Interview browsing and search
- [ ] Text interview flow (start to results)
- [ ] Voice interview flow (TTS/STT)
- [ ] Saving/unsaving interviews
- [ ] XP and gem rewards
- [ ] Daily quest completion
- [ ] Shop purchases
- [ ] VIP subscription flow
- [ ] Interview history and saved screens

### Edge Cases
- [ ] Offline behavior
- [ ] Network errors
- [ ] Microphone permission denial
- [ ] Empty states (no history, no saved)
- [ ] VIP gating without subscription
- [ ] Auth session expiry
- [ ] App backgrounding during interview

---

## 📚 Documentation

- **[IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md)** - Detailed task tracking
- **[CURRENT_STATUS.md](CURRENT_STATUS.md)** - Current state and next steps
- **[SANITY_STUDIO_SETUP.md](SANITY_STUDIO_SETUP.md)** - Sanity configuration
- **[docs/API_INTEGRATION.md](docs/API_INTEGRATION.md)** - Integration guides
- **[AGENTS.md](AGENTS.md)** - Development guidelines

---

## 🚢 Deployment

### Build Commands

```bash
# Development builds (local testing)
npx expo run:ios
npx expo run:android

# Production builds (TestFlight/Play Store)
eas build --platform ios --profile production
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### Environment Setup
1. Configure EAS in `eas.json`
2. Set secrets in EAS dashboard (Appwrite project id + JWT secret, Sanity, RevenueCat, OpenAI)
3. Configure app signing (iOS certificates, Android keystore)
4. Submit for review

---

## 🐛 Troubleshooting

### "Appwrite auth failing"
- Verify `EXPO_PUBLIC_APPWRITE_ENDPOINT` and `EXPO_PUBLIC_APPWRITE_PROJECT_ID` are set in your `.env`.
- The redirect scheme `mockmate` must be registered in Appwrite Console → Authentication → Google provider.
- Confirm the scheme is declared in `MockMate/app.json` (`"scheme": "mockmate"`).
- For local dev only: set `EXPO_PUBLIC_DEV_AUTH_BYPASS=true` for a synthetic user (NEVER enable in production).

### "Bundling fails: Unable to resolve <relative path>"
- Metro is serving a stale `require()` graph even though the file exists. Run `npm run dev:clean` from `MockMate/` to wipe caches and start Expo with `--clear`. See `docs/dev-workflow.md` for the full recovery flow and the `~core/appwrite` stable alias.

### "Sanity data not loading"
- Check `SANITY_API_TOKEN` is set (write token)
- Verify schema deployed with `sanity deploy`
- Check network requests in console

### "RevenueCat purchases failing"
- Verify API keys match platform (iOS/Android)
- Check entitlement ID is "vip" in dashboard
- Test on real device (not simulator)

### "Voice features not working"
- Grant microphone permissions
- Check `OPENAI_TTS_MODEL` and `OPENAI_STT_MODEL` are set
- Verify API endpoint is OpenAI-compatible

---

## 📈 Performance

- **App Size:** ~50MB (estimated)
- **Cold Start:** ~2-3 seconds
- **Interview Load:** <1 second
- **TTS Latency:** ~1-2 seconds
- **STT Latency:** ~1-2 seconds

---

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

---

## 📄 License

Proprietary - All rights reserved

---

**Last Updated:** July 3, 2026 - 4:04 PM  
**Version:** 0.8.5 (85% complete)  
**Status:** Ready for Testing Phase 🚀

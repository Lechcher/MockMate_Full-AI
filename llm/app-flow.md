# MockMate App Flow

Complete user journey through the MockMate AI mock interview application.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     MOCKMATE APP ARCHITECTURE                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    Auth0     │         │    Sanity    │         │  RevenueCat  │
│              │         │     CMS      │         │              │
│ Google OAuth │◄────────│   Content    │◄────────│ Subscriptions│
│   Tokens     │         │   Database   │         │   Payments   │
└──────────────┘         └──────────────┘         └──────────────┘
       │                        │                         │
       │                        │                         │
       └────────────────────────┼─────────────────────────┘
                                │
                                ▼
                    ┌──────────────────────┐
                    │   React Native App   │
                    │   (Expo Framework)   │
                    │                      │
                    │  • Expo Router       │
                    │  • Zustand State     │
                    │  • Uniwind Styling   │
                    └──────────────────────┘
```

## Entry Point Flow

```
App Launch
    │
    ├─── Check Auth0 Session
    │    │
    │    ├─ Has valid token? 
    │    │  └─▶ Navigate to HOME TAB
    │    │
    │    └─ No token?
    │       └─▶ Navigate to WELCOME SCREEN
```

## 1. Authentication Flow

### Welcome Screen
```
┌─────────────────────────────────────┐
│        Welcome Screen               │
│                                     │
│         [MockMate Logo]             │
│                                     │
│    "AI Mock Interview Practice"    │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  🔵 Continue with Google      │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
         │
         │ User taps button
         ▼
    Auth0 Flow (see auth-flow.md)
         │
         │ Returns with user data
         ▼
┌─────────────────────────────────────┐
│     Create/Update Sanity Profile    │
│                                     │
│  • userId: google-oauth2|123...    │
│  • email: user@gmail.com           │
│  • name: John Doe                  │
│  • picture: [Google avatar URL]    │
│  • Initialize gamification:        │
│    - streak: 0                     │
│    - gems: 0                       │
│    - xp: 0                         │
│    - level: 1                      │
└─────────────────────────────────────┘
         │
         ▼
    Navigate to HOME TAB
```

## 2. Main Navigation Structure

```
┌──────────────────────────────────────────────────────────────────┐
│                    BOTTOM TAB NAVIGATION                         │
│              (Visible on all 5 main screens)                    │
└──────────────────────────────────────────────────────────────────┘

┌────────┐  ┌─────────┐  ┌──────────┐  ┌──────┐  ┌──────────┐
│  🏠    │  │   🧭    │  │    📋    │  │  🛍️  │  │   👤     │
│  Home  │  │ Explore │  │  Quests  │  │ Shop │  │ Profile  │
└────────┘  └─────────┘  └──────────┘  └──────┘  └──────────┘
```

## 3. Home Tab - Dashboard

```
HOME SCREEN
├─ Header Metrics Bar
│  ├─ 🔥 Streak: 6 days
│  ├─ 💎 Gems: 450
│  ├─ 📊 XP: 1,250
│  └─ 👑 VIP Badge (if subscribed)
│
├─ Learning Status Card
│  └─ "Start your daily practice" 
│     OR
│     "Great job today! ✓"
│
├─ Featured Interviews Carousel
│  ├─ [Card 1: Senior UX Designer]
│  ├─ [Card 2: Product Manager]
│  └─ [Card 3: Software Engineer]
│      │
│      └─ Tap any card ──▶ INTERVIEW DETAIL SCREEN
│
├─ Daily Quest Preview
│  ├─ "Complete 3 Mock Interviews"
│  ├─ Progress: 1/3 ███░░░ 33%
│  └─ Reward: +75 gems
│      │
│      └─ Tap ──▶ Navigate to QUESTS TAB
│
└─ Quick Actions
   ├─ "Start Interview" ──▶ Navigate to EXPLORE TAB
   └─ "Browse All" ──────▶ Navigate to EXPLORE TAB
```

## 4. Explore Tab - Browse Interviews

```
EXPLORE SCREEN
├─ Search Bar
│  └─ Real-time filter by title/focus area
│
├─ Industry Filter Chips (Horizontal Scroll)
│  └─ [All] [IT] [Sales] [Finance] [Design] [Manager] [Marketing] [Healthcare] [Education]
│
├─ Difficulty Filter Chips
│  └─ [Easy] [Medium] [Hard]
│
└─ Interview Grid (2 columns, scrollable)
   │
   ├─ Interview Card
   │  ├─ Title: "Senior UX Designer"
   │  ├─ Industry: Design 🎨 (purple)
   │  ├─ Difficulty: Hard (red badge)
   │  ├─ ⭐ 4.8 (120 reviews)
   │  ├─ 6 questions
   │  └─ ❤️ Favorite toggle
   │      │
   │      └─ Tap card ──▶ INTERVIEW DETAIL SCREEN
   │
   └─ [More cards...]
```

## 5. Interview Journey - Core Flow

### 5.1 Interview Detail Screen

```
INTERVIEW DETAIL
├─ Header
│  ├─ Back button
│  ├─ Title: "Senior UX Designer"
│  ├─ Industry: Design 🎨
│  ├─ Difficulty: Hard
│  ├─ ⭐ 4.8 (120)
│  └─ ❤️ Favorite toggle
│
├─ Metadata Section
│  ├─ Focus Area: "User Research & Interaction Design"
│  ├─ Questions: 6
│  └─ Duration: ~15-20 minutes
│
├─ Description
│  └─ "This interview covers..."
│
├─ Review Breakdown
│  └─ [5★ ████████ 80%]
│     [4★ ███░░░░░ 15%]
│     [3★ █░░░░░░░  5%]
│
├─ [VIP Badge] (if premium interview)
│
└─ Call-to-Action
   ├─ "Start Interview" (free or VIP user)
   │   OR
   └─ "Upgrade to Start" (premium + non-VIP)
       │
       └─ Tap ──▶ MODE SELECTION SCREEN
```

### 5.2 Mode Selection Screen

```
MODE SELECTION
├─ Header: "Choose Interview Mode"
│
├─ Text Mode Card
│  ├─ 📝 Icon
│  ├─ "Text Mode"
│  ├─ "Type your answers for thoughtful, written responses"
│  └─ Tap ──▶ TEXT INTERVIEW SCREEN
│
└─ Voice Mode Card
   ├─ 🎤 Icon
   ├─ "Voice Mode"
   ├─ "Speak naturally as in a real interview"
   └─ Tap ──▶ [Request Mic Permission]
              │
              ├─ Granted ──▶ VOICE INTERVIEW SCREEN
              └─ Denied ──▶ Error: "Mic required"
```

### 5.3 Text Interview Screen

```
TEXT INTERVIEW
├─ Header
│  ├─ Progress: "Question 2 of 6"
│  ├─ Timer: 08:42
│  └─ Exit (Save & Exit confirmation)
│
├─ Question Display
│  └─ "Tell me about a time you had to make a difficult design decision..."
│
├─ Answer Input
│  ├─ Multi-line text field
│  └─ Character count: 245 characters
│
└─ Action Button
   ├─ "Next Question"
   │   │
   │   ├─ Has answer ──▶ Save, show next question
   │   └─ Empty ──▶ Confirmation: "Skip this question?"
   │
   └─ Last question ──▶ Navigate to RESULTS SCREEN
```

### 5.4 Voice Interview Screen

```
VOICE INTERVIEW
├─ Header
│  ├─ Progress: "Question 2 of 6"
│  ├─ Timer: 08:42
│  └─ Exit (Save & Exit confirmation)
│
├─ Question Display
│  ├─ Question text
│  └─ "Replay" button (TTS speaks question)
│
├─ Recording Interface
│  ├─ States:
│  │  ├─ Ready: 🎤 "Tap to record"
│  │  ├─ Recording: 🔴 Waveform animation
│  │  └─ Recorded: Playback controls
│  │
│  ├─ Stop recording (3min max)
│  ├─ Play recording
│  └─ Re-record button
│
└─ Action Button
   ├─ "Next Question"
   │   │
   │   └─ Save recording, show next question
   │
   └─ Last question ──▶ Navigate to RESULTS SCREEN
```

### 5.5 Results Screen

```
INTERVIEW RESULTS
├─ Overall Score
│  └─ 85% (Circular progress)
│     └─ Color: Green (80-100%) | Yellow (60-79%) | Red (0-59%)
│
├─ Performance Metrics
│  ├─ Communication: 8/10 ████████░░
│  ├─ Technical Knowledge: 9/10 █████████░
│  ├─ Problem Solving: 7/10 ███████░░░
│  └─ Confidence: 8/10 ████████░░
│
├─ Rewards Earned (Animated)
│  ├─ +120 XP 📈
│  └─ +25 Gems 💎
│
├─ Question-by-Question Feedback
│  └─ [Expandable list]
│     ├─ Q1: Your answer
│     │   └─ AI Feedback + Suggestions
│     ├─ Q2: Your answer
│     │   └─ AI Feedback + Suggestions
│     └─ [...]
│
├─ Improvement Areas
│  └─ "Provide more specific examples"
│     "Elaborate on technical details"
│
├─ Time Taken
│  └─ "Completed in 18m 42s"
│
└─ Actions
   ├─ "Save Interview" (add to favorites)
   ├─ "Share Results" (native share)
   ├─ "Try Again" ──▶ MODE SELECTION
   └─ "Back to Home" ──▶ HOME TAB
```

**Side Effects After Interview:**
```
Results Screen Submission
    │
    ├─ Update Sanity
    │  ├─ Create interviewHistory document
    │  ├─ Update user gamificationState
    │  └─ Update lastCompletedAt timestamp
    │
    ├─ Update Local Zustand Store
    │  ├─ Add XP to balance
    │  ├─ Add gems to balance
    │  └─ Increment streak (if first today)
    │
    └─ Update Quest Progress
       └─ Check active quests
          ├─ "Complete Interview" +1
          ├─ "Earn XP" +120
          ├─ "Earn Gems" +25
          └─ "Learn Minutes" +18
              │
              └─ Any quest complete? ──▶ Show celebration + award gems
```

## 6. Daily Quests Tab

```
DAILY QUESTS SCREEN
├─ Header
│  ├─ Gem balance: 💎 450
│  └─ Reset countdown: "Resets in 14h 23m"
│
├─ Quest Cards List
│  │
│  ├─ Complete Mock Interview Quest
│  │  ├─ Icon: ✓ (yellow)
│  │  ├─ "Complete 3 Mock Interviews"
│  │  ├─ Progress: 2/3 ████████░░ 66%
│  │  └─ Reward: +75 gems
│  │
│  ├─ Vocal Stamina Quest
│  │  ├─ Icon: 🎤 (orange)
│  │  ├─ "Learn 15 Minutes"
│  │  ├─ Progress: 8/15 min ██████░░░░ 53%
│  │  └─ Reward: +100 gems
│  │
│  ├─ Earn XP Quest
│  │  ├─ Icon: 📊 (purple)
│  │  ├─ "Earn 50 XP"
│  │  ├─ Progress: 30/50 ██████░░░░ 60%
│  │  └─ Reward: +50 gems
│  │
│  └─ Earn Gems Quest
│     ├─ Icon: 💎 (blue)
│     ├─ "Earn 100 Gems"
│     ├─ Progress: 25/100 ███░░░░░░░ 25%
│     └─ Reward: +100 gems
│
└─ Lifetime Stats
   └─ "Total Earned: 2,450 gems"
```

**Quest Completion Flow:**
```
Quest Progress Reaches Requirement
    │
    ├─ Mark quest complete
    ├─ Award gems
    │  └─ Update Zustand store
    │     └─ Sync to Sanity gamificationState
    │
    └─ Show Celebration
       └─ "Quest Complete! +75 gems" (toast + animation)
```

**Daily Reset Logic:**
```
Midnight (Local Time)
    │
    ├─ Generate new random quests
    │  ├─ Random requirements (1-5 interviews, 5-30 mins, etc.)
    │  └─ Calculate rewards based on requirements
    │
    └─ Reset all progress to 0
```

## 7. Shop Tab

```
SHOP SCREEN
├─ Header
│  └─ Gem balance: 💎 450
│
├─ [IF NOT VIP] Premium Upsell Card
│  ├─ 👑 "Go Premium"
│  ├─ Badge: "Premium"
│  ├─ "Get unlimited AI feedback and more features!"
│  └─ "Try Free for 7 Days" ──▶ VIP SUBSCRIPTION SCREEN
│
├─ Daily Deal Card
│  ├─ ⏰ "Daily Deal" badge
│  ├─ "Interview Pack"
│  ├─ "50+ Top tech interview questions"
│  └─ "Click Now!" ──▶ Offer detail modal
│
└─ Power-Ups Section
   │
   ├─ Streak Freeze Card
   │  ├─ ❄️ Icon (blue)
   │  ├─ "Streak Freeze"
   │  ├─ "Protect your streak for one day"
   │  ├─ Price: 200 gems
   │  ├─ Owned: 2
   │  └─ "Buy" ──▶ PURCHASE FLOW
   │
   └─ Double XP Card
      ├─ ⬆️ Icon (purple)
      ├─ "Double XP"
      ├─ "Earn double XP for 30 mins"
      ├─ Price: 350 gems
      └─ "Buy" ──▶ PURCHASE FLOW
```

**Purchase Flow:**
```
User Taps "Buy"
    │
    ├─ Check gem balance
    │  │
    │  ├─ Sufficient gems?
    │  │  │
    │  │  ├─ YES ──▶ Show confirmation modal
    │  │  │         "Purchase [Power-up] for X gems?"
    │  │  │         [Confirm] [Cancel]
    │  │  │             │
    │  │  │             └─ Confirm ──▶ Deduct gems
    │  │  │                          ├─ Update Zustand
    │  │  │                          ├─ Add power-up to inventory
    │  │  │                          ├─ Sync to Sanity
    │  │  │                          └─ Show success toast
    │  │  │
    │  │  └─ NO ──▶ Show error
    │  │           "Not enough gems. Complete quests to earn more!"
    │  │           + Highlight QUESTS TAB
    │  │
    │  └─ Already active? (Double XP)
    │     └─ Show message
    │        "Already active! Time remaining: 12m 34s"
```

## 8. Profile Tab

```
PROFILE SCREEN
├─ User Header
│  ├─ [Avatar from Google]
│  ├─ Name: John Doe
│  ├─ Email: user@gmail.com
│  ├─ [👑 VIP Badge] (if subscribed)
│  │
│  └─ Stats Row
│     ├─ Level 12
│     ├─ 1,250 XP
│     ├─ 💎 450
│     └─ 🔥 6 streak
│
├─ Career Section
│  ├─ Interview History ──▶ INTERVIEW HISTORY SCREEN
│  │                        │
│  │                        └─ List of completed interviews
│  │                           ├─ Title, date, score, duration
│  │                           └─ Tap ──▶ Full results view
│  │
│  └─ Saved Interviews ──▶ SAVED INTERVIEWS SCREEN
│                         │
│                         └─ Grid of favorited interviews
│                            └─ Tap ──▶ INTERVIEW DETAIL
│
├─ App Settings Section
│  ├─ General Settings ──▶ Notifications, Theme, Sound
│  ├─ Security ──────────▶ Password (N/A for Google), Biometric
│  └─ Language ──────────▶ Language picker modal
│
└─ Support Section
   ├─ Help Center ──▶ FAQ / Support articles
   └─ Log Out ─────▶ [Confirmation Modal]
                     "Are you sure?"
                     [Log Out] [Cancel]
                         │
                         └─ Confirm ──▶ Clear Auth0 session
                                      ├─ Clear Zustand state
                                      └─ Navigate to WELCOME SCREEN
```

## 9. VIP Subscription Flow

```
VIP SUBSCRIPTION SCREEN
├─ Benefits Section
│  └─ ✓ Unlimited AI Feedback
│     ✓ Advanced Analytics
│     ✓ Priority Support
│     ✓ Ad-Free Experience
│     ✓ Exclusive Interview Packs
│
├─ Plan Cards
│  │
│  ├─ Yearly Plan [Best Value Badge]
│  │  ├─ $120 ~~strikethrough~~
│  │  ├─ $60 (Save 50%)
│  │  └─ $5/month
│  │
│  └─ Monthly Plan
│     └─ $10/month
│
├─ Trial Offer (new users)
│  └─ "Try Free for 7 Days"
│     "Free for 7 days, then $X/month. Cancel anytime."
│
├─ "Subscribe" Button
│  └─▶ RevenueCat Purchase Flow
│      ├─ Success ──▶ "Welcome to VIP!" ──▶ HOME TAB
│      ├─ Cancelled ──▶ Toast: "Purchase cancelled"
│      └─ Error ──▶ Error message + Retry
│
└─ "Restore Purchases" Link
   └─▶ RevenueCat.restorePurchases()
      ├─ Found ──▶ "Subscription restored!"
      └─ Not found ──▶ "No purchases to restore"
```

**VIP Status Check (Throughout App):**
```
User Taps Premium Interview
    │
    ├─ Check RevenueCat
    │  └─ getCustomerInfo()
    │     └─ Has "vip" entitlement?
    │        │
    │        ├─ YES ──▶ Allow normal flow
    │        │         (Mode Selection → Interview)
    │        │
    │        └─ NO ──▶ Show "VIP Only" badge
    │                  Button: "Upgrade to Start"
    │                  └─▶ VIP SUBSCRIPTION SCREEN
```

## 10. Cross-Cutting Flows

### Streak Management

```
Daily Check (Runs at App Open)
    │
    ├─ Has user completed interview today?
    │  │
    │  ├─ YES (and first of day)
    │  │  ├─ Increment streak
    │  │  ├─ Check milestone (7, 14, 30)
    │  │  │  └─ Show celebration popup + bonus gems
    │  │  └─ Update Sanity
    │  │
    │  ├─ YES (already counted)
    │  │  └─ No action
    │  │
    │  └─ NO (24hrs passed since last)
    │     ├─ Has streak freeze?
    │     │  ├─ YES ──▶ Consume 1 freeze
    │     │  │        ├─ Maintain streak
    │     │  │        ├─ Show "Streak Protected!" notification
    │     │  │        └─ Update Sanity
    │     │  │
    │     │  └─ NO ──▶ Reset streak to 0
    │     │           ├─ Show "Streak ended at X days"
    │     │           └─ Update Sanity
```

### Navigation State Preservation

```
Tab Switch
    │
    ├─ Save current tab state
    │  ├─ Scroll position
    │  ├─ Filter selections
    │  └─ Navigation stack
    │
    └─ Switch to new tab
       │
       └─ Restore saved state
          └─ (Tabs maintain their state independently)
```

### Data Sync Strategy

```
App Lifecycle
    │
    ├─ On Open
    │  ├─ Load from Zustand (instant)
    │  └─ Fetch from Sanity (background)
    │     └─ Merge conflicts (server wins)
    │
    ├─ During Session
    │  ├─ Update Zustand (instant UI)
    │  └─ Batch sync to Sanity (debounced)
    │
    └─ On Close/Background
       └─ Final sync to Sanity
          └─ Update all pending changes
```

## 11. Error States & Edge Cases

### Network Errors
```
API Call Fails
    │
    ├─ Show error toast
    │  └─ "Connection error. Check your internet."
    │
    ├─ Retry logic (3 attempts)
    │
    └─ Fallback to cached data
       └─ Show indicator: "Offline mode"
```

### Session Expiration
```
Auth0 Token Expires
    │
    ├─ Attempt silent refresh
    │  ├─ Success ──▶ Continue normally
    │  └─ Failed ──▶ Clear session
    │                └─ Navigate to WELCOME SCREEN
    │                   └─ Show: "Session expired, please log in"
```

### Empty States
```
No Data Scenarios
    │
    ├─ No interview history
    │  └─ "No interviews completed yet"
    │     + "Start Learning" button
    │
    ├─ No saved interviews
    │  └─ "No saved interviews"
    │     + "Browse Interviews" button
    │
    └─ Search returns nothing
       └─ "No interviews found"
          + "Adjust your filters"
```

## Summary

This comprehensive app flow document maps every screen, transition, and user interaction in MockMate. The architecture centers around:

1. **Auth0** for Google authentication
2. **Sanity CMS** for all data storage
3. **RevenueCat** for subscriptions
4. **Zustand** for local state (instant UI updates)
5. **Expo Router** for file-based navigation

Key flows:
- Authentication: Single Google OAuth button
- Interview Journey: Browse → Detail → Mode → Execution → Results
- Gamification: Streaks, XP, Gems, Quests
- Monetization: Power-ups (gems) + VIP subscription

For detailed authentication flow, see `auth-flow.md`.

# MockMate - Mobile Design System Specification

This document serves as the single source of truth for the MockMate mobile app design assets, colors, typography, and screen layouts.

---

## 🔗 Figma Source
- **File Name**: `AI Mock Interviewer`
- **Figma URL**: [Figma Link](https://www.figma.com/design/RX73sEuTfKKNh66AzU408Q/AI-Mock-Interviewer?m=auto&t=YqmrJrCQfzCmRK5q-6)

---

## 🎨 Color Palette & Design Tokens

These tokens are mapped to **Tailwind CSS v4 (Uniwind)** variables and utility classes:

| Token | CSS/Tailwind Color | Hex Code | Usage |
|---|---|---|---|
| **Primary-1** | `bg-blue-600` / `text-blue-600` | `#2563EB` | Main Accent, CTA buttons, active state indicators |
| **Primary-2** | `bg-blue-100` | `#DBEAFE` | Highlight backgrounds, soft indicators |
| **Primary-3** | `bg-blue-600/10` | `#0D59F2` (10%) | Very light tint / hover backgrounds |
| **Black-1** | `text-slate-900` | `#0F172A` | Primary text, titles, headings |
| **Black-2** | `text-gray-600` | `#4B5563` | Body copy, secondary descriptions |
| **Black-3** | `text-slate-500` | `#64748B` | Muted labels, placeholders, borders |
| **fill1** | `bg-slate-50` | `#f5f6f8` | Primary light theme screen background |
| **fill2** | `bg-white` | `#ffffff` | Card background, input boxes, modular containers |
| **fill3** | `bg-slate-950` | `#020617` | Dark theme sections, VIP styling, header focus |
| **fill4** | `bg-slate-900` | `#101622` | Dark mode interview layout background |

---

## 🔠 Typography

- **Primary Font Family**: `Lexend` (used for bold headings, title stats, and brand assets)
- **Secondary Font Family**: `Rubik` (used for body content, labels, descriptions, and interactive component text)

---

## 📱 Screen Mapping (`designs/` Assets)

The `designs/` folder contains 20 design references mapped to the app screens:

### 1. Welcome & Login (`Welcome & Login.png`)
- **Visuals**: Logo, Google OAuth button, initial welcome tagline, simple clean splash background.

### 2. Splash (`Splash.png`)
- **Visuals**: Clean background (`#f5f6f8` or `#ffffff`), central App Icon/Logotype.

### 3. Home Tab (`Home Tab.png`)
- **Visuals**: Main hub. Features stats (e.g. streaks, completed interviews), recommended quests, quick launch panel.

### 4. Explore Tab (`Explore Tab.png`)
- **Visuals**: Search/Filter interfaces for finding specific interview categories (e.g., Frontend, Backend, Product Manager).

### 5. Daily Quests Tab (`Daily Quests Tab.png`)
- **Visuals**: Checklist of daily goals, XP/rewards progression bar, completion ticks.

### 6. Shop Tab (`Shop Tab.png`)
- **Visuals**: In-app store for buying tickets, custom mock tokens, avatar customizations, or power-ups.

### 7. Create Custom Interview (`Create Custom Interview.png`)
- **Visuals**: Form layouts, selectors for roles, difficulty slider, and duration configs.

### 8. Interview Detail (`Interview Detail.png`)
- **Visuals**: Overview of selected mock session, syllabus outline, average scores, prep notes, "Start" CTA.

### 9. Interview Mode Selection (`Interview Mode Selection.png`)
- **Visuals**: Choice between "Text Mode" (keyboard typing) and "Voice Mode" (real-time voice conversation).

### 10. Voice Mode Interview (`Voice Mode Interview.png` & `Voice Mode Interview-1.png`)
- **Visuals**: Large voice wavelength/microphone visual, audio state (speaking vs listening), AI avatar, transcript toggle. Uses dark theme style (`#101622`).

### 11. Text Mode Interview (`Text Mode Interview.png`)
- **Visuals**: Chat message bubble flow, input box, send button, active question container at top.

### 12. Interview Result (`Interview Result.png`)
- **Visuals**: Score breakdown, feedback criteria, highlight of correct/suboptimal answers, recommendation section.

### 13. VIP Status (`VIP Status.png`)
- **Visuals**: Special gold badge, account details with VIP branding, active benefit duration.

### 14. VIP Subscription Plan (`VIP Subscription Plan.png`)
- **Visuals**: Comparison table, pricing options, checkout CTAs linked to RevenueCat products. Dark style background (`#020617`).

### 15. Interview History (`Interview History.png`)
- **Visuals**: Chronological scroll list of previous interviews, overall average scores, completion indicators.

### 16. Interview History Info (`Interview History Info.png`)
- **Visuals**: Expanded item details from history list, displaying specific question logs and score metrics.

### 17. Profile (`Profile.png`)
- **Visuals**: User details, settings shortcuts, streak count badge, total XP tracker, and Google signout option.

### 18. Streak Popup (`Streak Popup.png`)
- **Visuals**: Pop-up card container, streak flame animation, count number (e.g. "5 days!"), "Keep going" CTA.

### 19. Screen (`Screen.png`) & Generic Layouts (`Screen.png`, `Screen.png` duplicates)
- **Visuals**: Reusable component/layout templates containing baseline navbars and safe areas.

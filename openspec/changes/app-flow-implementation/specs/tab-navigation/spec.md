## ADDED Requirements

### Requirement: Display bottom tab navigation with five tabs
The app SHALL display a bottom tab bar with five tabs: Home, Explore, Daily Quests, Shop, and Profile.

#### Scenario: Tab bar visible on all main screens
- **WHEN** user is on any main screen (Home, Explore, Daily Quests, Shop, Profile)
- **THEN** system displays bottom tab bar with all five tabs visible

#### Scenario: Active tab is highlighted
- **WHEN** user is on a specific tab
- **THEN** system highlights that tab with accent color and icon

#### Scenario: Tab bar hidden on nested screens
- **WHEN** user navigates to interview detail, interview execution, or settings screens
- **THEN** system hides bottom tab bar

### Requirement: User can switch between tabs by tapping
The system SHALL allow users to navigate between main sections by tapping tab bar items.

#### Scenario: Switch to different tab
- **WHEN** user taps on a different tab
- **THEN** system navigates to that tab's screen and highlights the tab

#### Scenario: Tap active tab
- **WHEN** user taps the currently active tab
- **THEN** system scrolls to top of that tab's content (if scrollable)

### Requirement: Tab navigation preserves screen state
The system SHALL maintain each tab's navigation state when switching between tabs.

#### Scenario: Return to previous tab position
- **WHEN** user switches from Tab A to Tab B, then back to Tab A
- **THEN** system displays Tab A in the same scroll position and navigation state as before

#### Scenario: Nested navigation preserved
- **WHEN** user navigates deep into a tab's stack, switches tabs, then returns
- **THEN** system maintains the navigation stack (user doesn't reset to tab root)

### Requirement: Display appropriate icons for each tab
The system SHALL display Lucide icons for each tab matching the design system.

#### Scenario: Tab icons match design
- **WHEN** tab bar is rendered
- **THEN** system displays Home (house icon), Explore (compass icon), Daily Quests (list icon), Shop (shopping bag icon), Profile (user icon)

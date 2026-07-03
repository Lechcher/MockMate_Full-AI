## ADDED Requirements

### Requirement: Display list of active daily quests
The daily quests screen SHALL display all available daily quests with progress indicators.

#### Scenario: Show quest cards
- **WHEN** user views daily quests tab
- **THEN** system displays list of quest cards showing title, description, progress bar, current progress, requirement, and gem reward

#### Scenario: Quest types displayed
- **WHEN** quest cards are rendered
- **THEN** system shows appropriate icon and color for each quest type (Complete Mock Interview, Learn Minutes, Earn EXP, Earn Gems)

### Requirement: Display quest progress
Each quest card SHALL show current progress toward completion.

#### Scenario: Show progress bar
- **WHEN** quest card is displayed
- **THEN** system shows progress bar filled to percentage of completion (e.g., 2/5 interviews = 40% filled)

#### Scenario: Show progress text
- **WHEN** quest card is displayed
- **THEN** system shows text "X/Y" below progress bar (e.g., "2/5 interviews completed")

### Requirement: Update quest progress in real-time
The system SHALL update quest progress immediately after relevant actions.

#### Scenario: Interview completion updates quest
- **WHEN** user completes a mock interview
- **THEN** system increments "Complete Mock Interview" quest progress and updates progress bar

#### Scenario: XP earned updates quest
- **WHEN** user earns XP from any activity
- **THEN** system increments "Earn EXP" quest progress and updates display

#### Scenario: Learning time updates quest
- **WHEN** user spends time in interview mode
- **THEN** system increments "Learn Minutes" quest progress in real-time

### Requirement: Award gems on quest completion
The system SHALL automatically award gems when user completes a quest.

#### Scenario: Quest completion
- **WHEN** user's progress reaches quest requirement
- **THEN** system marks quest as complete, awards gems, displays celebration animation, and shows "Quest Complete! +X gems" toast

#### Scenario: Update gem balance
- **WHEN** quest is completed
- **THEN** system updates user's gem balance in Zustand store and header display

### Requirement: Display completed quests
The system SHALL visually distinguish completed quests from active ones.

#### Scenario: Completed quest styling
- **WHEN** quest is completed
- **THEN** system displays quest card with green checkmark, dimmed appearance, and "Completed" label

#### Scenario: Completed quests remain visible
- **WHEN** user completes quest
- **THEN** system keeps quest visible on screen until daily reset (does not remove immediately)

### Requirement: Reset quests daily
The system SHALL generate new quests daily at midnight user's local time.

#### Scenario: Daily reset
- **WHEN** clock passes midnight in user's timezone
- **THEN** system generates new random quests with different requirements and resets all progress to 0

#### Scenario: Open app after midnight
- **WHEN** user opens app after daily reset has occurred
- **THEN** system displays new quests for the current day

### Requirement: Display quest refresh countdown
The screen SHALL show time remaining until next daily quest refresh.

#### Scenario: Show countdown timer
- **WHEN** user views daily quests tab
- **THEN** system displays countdown "Resets in Xh Ym" at top of screen

#### Scenario: Timer updates
- **WHEN** countdown timer is visible
- **THEN** system updates countdown every minute

### Requirement: Display total gems earned from quests
The screen SHALL show lifetime gem earnings from quest system.

#### Scenario: Show total earned
- **WHEN** user views daily quests tab
- **THEN** system displays stat "Total Earned: X gems" from all-time quest completions

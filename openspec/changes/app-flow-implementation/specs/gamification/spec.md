## ADDED Requirements

### Requirement: Track daily learning streak
The system SHALL maintain a count of consecutive days user has completed at least one interview.

#### Scenario: Increment streak on first interview of day
- **WHEN** user completes first interview of the day
- **THEN** system increments streak count by 1 if previous day's streak is active

#### Scenario: Maintain streak on multiple interviews same day
- **WHEN** user completes multiple interviews on same day
- **THEN** system does not increment streak count beyond the first interview

#### Scenario: Break streak after missed day
- **WHEN** user does not complete any interview for 24 hours
- **THEN** system resets streak count to 0

### Requirement: Consume streak freeze on missed day
The system SHALL automatically use streak freeze to protect streak when user misses a day.

#### Scenario: Use streak freeze automatically
- **WHEN** user has not learned in 24 hours and owns at least 1 streak freeze
- **THEN** system consumes 1 streak freeze, maintains streak count, and displays "Streak protected!" notification

#### Scenario: No streak freeze available
- **WHEN** user misses a day and has 0 streak freezes
- **THEN** system resets streak to 0 and displays "Streak ended at X days" notification

### Requirement: Display streak milestones with rewards
The system SHALL celebrate streak milestones and award bonus gems.

#### Scenario: Reach 7-day milestone
- **WHEN** user reaches 7-day streak
- **THEN** system displays celebration popup "7 Day Streak! 🔥" and awards 50 bonus gems

#### Scenario: Reach 14-day milestone
- **WHEN** user reaches 14-day streak
- **THEN** system displays celebration popup and awards 100 bonus gems

#### Scenario: Reach 30-day milestone
- **WHEN** user reaches 30-day streak
- **THEN** system displays celebration popup and awards 250 bonus gems

### Requirement: Track and display XP progression
The system SHALL accumulate experience points and calculate user level.

#### Scenario: Earn XP from interview completion
- **WHEN** user completes interview with score X%
- **THEN** system awards base 50 XP plus bonus XP based on score (0-50 XP)

#### Scenario: Earn XP from quest completion
- **WHEN** user completes daily quest
- **THEN** system awards quest-specific XP (varies per quest type)

#### Scenario: Double XP boost active
- **WHEN** user earns XP while Double XP power-up is active
- **THEN** system multiplies all XP earnings by 2

#### Scenario: Calculate level from total XP
- **WHEN** XP is earned
- **THEN** system calculates level using formula: Level = floor(totalXP / 100) + 1

#### Scenario: Level up animation
- **WHEN** user's XP crosses level threshold
- **THEN** system displays "Level Up!" animation and updates level display

### Requirement: Track and display gem balance
The system SHALL maintain user's gem currency balance.

#### Scenario: Earn gems from quest completion
- **WHEN** user completes daily quest
- **THEN** system awards gems specified in quest reward

#### Scenario: Earn gems from interview completion
- **WHEN** user completes interview
- **THEN** system awards 10 base gems plus 0-10 bonus gems based on performance

#### Scenario: Spend gems on power-ups
- **WHEN** user purchases power-up with gems
- **THEN** system deducts gem cost from balance

#### Scenario: Display gem balance in header
- **WHEN** user views any screen
- **THEN** system displays current gem balance with gem icon in header

### Requirement: Persist gamification state
The system SHALL save streak, XP, and gem data locally and sync to backend.

#### Scenario: Save state on change
- **WHEN** streak, XP, or gem value changes
- **THEN** system persists to Zustand store with AsyncStorage backup

#### Scenario: Restore state on app launch
- **WHEN** user opens app
- **THEN** system loads saved gamification state from AsyncStorage

#### Scenario: Sync to backend on session start
- **WHEN** user opens app with network connection
- **THEN** system syncs local gamification state to Appwrite backend (phase 2 feature)

### Requirement: Display gamification metrics prominently
The system SHALL show streak, XP, and gems in home screen header.

#### Scenario: Show all metrics
- **WHEN** user views home screen
- **THEN** system displays fire icon with streak count, chart icon with XP, gem icon with gem count in header

#### Scenario: Animate metric changes
- **WHEN** any metric value increases
- **THEN** system animates the change with scaling effect and color pulse

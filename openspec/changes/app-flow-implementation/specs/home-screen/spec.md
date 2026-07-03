## ADDED Requirements

### Requirement: Display user streak status and freeze count
The home screen SHALL display the user's current streak count and available streak freezes.

#### Scenario: Display active streak
- **WHEN** user views home screen
- **THEN** system displays current streak count with fire icon and streak freeze count with snowflake icon

#### Scenario: Show streak popup on milestone
- **WHEN** user completes a learning session and reaches a streak milestone (7, 14, 30 days)
- **THEN** system displays congratulatory popup with streak count and rewards earned

### Requirement: Display user gems and XP
The home screen SHALL display the user's current gem balance and XP earned.

#### Scenario: Display resource counts
- **WHEN** user views home screen
- **THEN** system displays gem count with gem icon and XP count with chart icon in header

#### Scenario: Animate resource changes
- **WHEN** user earns gems or XP
- **THEN** system animates the count incrementing with visual feedback

### Requirement: Display VIP status badge
The home screen SHALL display VIP status indicator if user has active subscription.

#### Scenario: VIP user sees badge
- **WHEN** authenticated user with active VIP subscription views home screen
- **THEN** system displays crown icon badge with "VIP" label

#### Scenario: Non-VIP user sees no badge
- **WHEN** user without VIP subscription views home screen
- **THEN** system does not display VIP badge

### Requirement: Display featured mock interviews carousel
The home screen SHALL display a carousel of 3-5 featured mock interviews.

#### Scenario: Show featured interviews
- **WHEN** user views home screen
- **THEN** system displays horizontal scrollable carousel with featured interview cards showing title, industry, difficulty, and rating

#### Scenario: Tap featured interview
- **WHEN** user taps a featured interview card
- **THEN** system navigates to interview detail screen for that interview

### Requirement: Display daily quest progress
The home screen SHALL display current daily quest with progress indicator.

#### Scenario: Show active quest
- **WHEN** user views home screen with active daily quest
- **THEN** system displays quest card with title, progress bar, and gem reward

#### Scenario: Tap quest card
- **WHEN** user taps daily quest card
- **THEN** system navigates to Daily Quests tab

### Requirement: Display quick action buttons
The home screen SHALL provide quick action buttons for common tasks.

#### Scenario: Show action buttons
- **WHEN** user views home screen
- **THEN** system displays "Start Interview" and "Browse All" buttons

#### Scenario: Tap Start Interview
- **WHEN** user taps "Start Interview" button
- **THEN** system navigates to Explore tab

#### Scenario: Tap Browse All
- **WHEN** user taps "Browse All" button
- **THEN** system navigates to Explore tab

### Requirement: Display learning status indicator
The home screen SHALL show whether user has completed learning today.

#### Scenario: Not learned today
- **WHEN** user has not completed any interviews today
- **THEN** system displays "Start your daily practice" message with call-to-action

#### Scenario: Learned today
- **WHEN** user has completed at least one interview today
- **THEN** system displays "Great job today!" message with checkmark icon

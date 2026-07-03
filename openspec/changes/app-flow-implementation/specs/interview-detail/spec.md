## ADDED Requirements

### Requirement: Display interview header with title and metadata
The interview detail screen SHALL display interview title, industry, difficulty, and rating at the top.

#### Scenario: Show interview header
- **WHEN** user views interview detail screen
- **THEN** system displays interview title, industry icon with name, difficulty badge, star rating with review count

#### Scenario: Display back button
- **WHEN** user views interview detail screen
- **THEN** system displays back button in header to return to previous screen

### Requirement: Display interview focus area and question count
The screen SHALL display the interview's focus area and total number of questions.

#### Scenario: Show focus area
- **WHEN** user views interview detail screen
- **THEN** system displays focus area text (e.g., "User Research & Interaction Design")

#### Scenario: Show question count
- **WHEN** user views interview detail screen
- **THEN** system displays total number of questions (e.g., "6 questions")

### Requirement: Display user reviews and ratings
The screen SHALL display aggregate rating and review statistics.

#### Scenario: Show rating breakdown
- **WHEN** user views interview detail screen
- **THEN** system displays star rating, total review count, and rating distribution bar chart

#### Scenario: No reviews
- **WHEN** interview has no reviews
- **THEN** system displays "No reviews yet" message

### Requirement: Toggle favorite status
The system SHALL allow users to favorite/unfavorite the interview from detail screen.

#### Scenario: Favorite from detail screen
- **WHEN** user taps heart icon in header
- **THEN** system marks interview as favorite and fills heart icon

#### Scenario: Unfavorite from detail screen
- **WHEN** user taps filled heart icon
- **THEN** system removes favorite status and displays outline heart icon

### Requirement: Display Start Interview button
The screen SHALL display a prominent call-to-action button to start the interview.

#### Scenario: Show CTA button
- **WHEN** user views interview detail screen
- **THEN** system displays "Start Interview" button at bottom of screen

#### Scenario: Tap Start Interview
- **WHEN** user taps "Start Interview" button
- **THEN** system navigates to interview mode selection screen

### Requirement: Display interview description
The screen SHALL display detailed description of what the interview covers.

#### Scenario: Show description
- **WHEN** user views interview detail screen
- **THEN** system displays interview description text explaining topics covered

### Requirement: Display estimated duration
The screen SHALL display estimated time to complete the interview.

#### Scenario: Show duration estimate
- **WHEN** user views interview detail screen
- **THEN** system displays estimated duration (e.g., "15-20 minutes")

### Requirement: Show VIP-only indicator for premium interviews
The system SHALL display VIP badge if interview requires subscription.

#### Scenario: Premium interview for non-VIP user
- **WHEN** non-VIP user views premium interview detail
- **THEN** system displays crown icon badge with "VIP Only" label and "Start Interview" button shows "Upgrade to Start"

#### Scenario: Premium interview for VIP user
- **WHEN** VIP user views premium interview detail
- **THEN** system displays standard "Start Interview" button without upgrade prompt

#### Scenario: Free interview for any user
- **WHEN** user views free interview detail
- **THEN** system displays no VIP indicator and standard "Start Interview" button

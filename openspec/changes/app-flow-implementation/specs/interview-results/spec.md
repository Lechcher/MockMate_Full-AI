## ADDED Requirements

### Requirement: Display overall performance score
The results screen SHALL display user's overall performance score for the interview.

#### Scenario: Show score
- **WHEN** user completes interview
- **THEN** system displays overall score as percentage (e.g., "85%") with visual indicator (progress circle)

#### Scenario: Score color coding
- **WHEN** results screen displays score
- **THEN** system colors score indicator: green (80-100%), yellow (60-79%), red (0-59%)

### Requirement: Display detailed feedback per question
The system SHALL provide AI-generated feedback for each interview answer.

#### Scenario: Show question-by-question breakdown
- **WHEN** user views results screen
- **THEN** system displays list of questions with user's answer and AI feedback for each

#### Scenario: Expand question details
- **WHEN** user taps on a question in results list
- **THEN** system expands to show full answer, AI feedback, and improvement suggestions

### Requirement: Display performance metrics
The results screen SHALL show breakdown of performance across evaluation criteria.

#### Scenario: Show metrics
- **WHEN** user views results screen
- **THEN** system displays metrics: Communication (score/10), Technical Knowledge (score/10), Problem Solving (score/10), Confidence (score/10)

#### Scenario: Metric visualization
- **WHEN** metrics are displayed
- **THEN** system shows each metric as horizontal bar with score label

### Requirement: Award XP and gems
The system SHALL award experience points and gems based on performance.

#### Scenario: Calculate rewards
- **WHEN** interview is completed
- **THEN** system calculates XP (base 50 + score bonus) and gems (base 10 + performance bonus)

#### Scenario: Display rewards earned
- **WHEN** results screen loads
- **THEN** system displays animated counter showing XP and gems earned with celebration animation

#### Scenario: Update user balance
- **WHEN** rewards are displayed
- **THEN** system updates user's total XP and gem balance in Zustand store

### Requirement: Update streak status
The system SHALL update user's daily learning streak after interview completion.

#### Scenario: First interview of the day
- **WHEN** user completes first interview of the day
- **THEN** system increments streak count and displays streak milestone popup (if applicable)

#### Scenario: Multiple interviews same day
- **WHEN** user completes additional interviews on same day
- **THEN** system awards XP/gems but does not increment streak

### Requirement: Display action buttons
The results screen SHALL provide options to save, share, or retry interview.

#### Scenario: Show action buttons
- **WHEN** results screen loads
- **THEN** system displays "Save Interview", "Share Results", "Try Again" buttons at bottom

#### Scenario: Save interview
- **WHEN** user taps "Save Interview" button
- **THEN** system marks interview as saved and displays confirmation toast "Interview saved"

#### Scenario: Share results
- **WHEN** user taps "Share Results" button
- **THEN** system opens native share sheet with shareable results image/text

#### Scenario: Try again
- **WHEN** user taps "Try Again" button
- **THEN** system navigates to mode selection screen for same interview

### Requirement: Display time spent
The results screen SHALL show total time spent on the interview.

#### Scenario: Show duration
- **WHEN** results screen loads
- **THEN** system displays total interview duration in minutes and seconds (e.g., "Completed in 18m 42s")

### Requirement: Display improvement areas
The system SHALL highlight areas where user can improve based on performance.

#### Scenario: Show improvement suggestions
- **WHEN** user views results screen
- **THEN** system displays 2-3 key improvement areas with actionable advice (e.g., "Provide more specific examples", "Elaborate on technical details")

### Requirement: Navigate back to home
The results screen SHALL provide button to return to home screen.

#### Scenario: Return home
- **WHEN** user taps "Back to Home" button
- **THEN** system navigates to home tab and clears interview navigation stack

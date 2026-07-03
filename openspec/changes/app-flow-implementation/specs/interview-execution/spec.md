## ADDED Requirements

### Requirement: Display mode selection screen
The system SHALL present users with text mode and voice mode options before starting interview.

#### Scenario: Show mode options
- **WHEN** user taps "Start Interview" from detail screen
- **THEN** system displays mode selection screen with two cards: "Text Mode" and "Voice Mode"

#### Scenario: Text mode card shows description
- **WHEN** mode selection screen is displayed
- **THEN** "Text Mode" card shows icon, title, and description "Type your answers for thoughtful, written responses"

#### Scenario: Voice mode card shows description
- **WHEN** mode selection screen is displayed
- **THEN** "Voice Mode" card shows microphone icon, title, and description "Speak naturally as in a real interview"

### Requirement: User can select text mode
The system SHALL start text-based interview when user selects text mode.

#### Scenario: Select text mode
- **WHEN** user taps "Text Mode" card
- **THEN** system navigates to text interview screen

### Requirement: User can select voice mode
The system SHALL start voice-based interview when user selects voice mode.

#### Scenario: Select voice mode
- **WHEN** user taps "Voice Mode" card
- **THEN** system requests microphone permission (if not granted) and navigates to voice interview screen

#### Scenario: Microphone permission denied
- **WHEN** user denies microphone permission for voice mode
- **THEN** system displays error "Microphone access required for voice mode" and returns to mode selection

### Requirement: Display question progress in text mode
Text interview screen SHALL display current question number and total questions.

#### Scenario: Show progress indicator
- **WHEN** user is in text interview
- **THEN** system displays "Question X of Y" at top of screen

### Requirement: Display question text in text mode
The system SHALL display the current interview question prominently.

#### Scenario: Show question
- **WHEN** text interview screen loads
- **THEN** system displays current question text in large readable font

### Requirement: User can type answer in text mode
The system SHALL provide text input for user to type their answer.

#### Scenario: Type answer
- **WHEN** user taps text input field
- **THEN** system displays keyboard and allows multi-line text input

#### Scenario: Character count display
- **WHEN** user types answer
- **THEN** system displays character count below input field

### Requirement: User can submit answer in text mode
The system SHALL allow user to submit typed answer and move to next question.

#### Scenario: Submit answer
- **WHEN** user taps "Next Question" button after typing answer
- **THEN** system saves answer, displays next question, and clears input field

#### Scenario: Submit empty answer
- **WHEN** user taps "Next Question" with empty answer field
- **THEN** system displays confirmation "Skip this question?" with "Yes" and "No, go back" options

#### Scenario: Last question submission
- **WHEN** user submits answer to last question
- **THEN** system navigates to interview results screen

### Requirement: Display question progress in voice mode
Voice interview screen SHALL display current question number and total questions.

#### Scenario: Show progress indicator
- **WHEN** user is in voice interview
- **THEN** system displays "Question X of Y" at top of screen

### Requirement: AI speaks question in voice mode
The system SHALL use text-to-speech to speak the interview question.

#### Scenario: Question spoken aloud
- **WHEN** voice interview question loads
- **THEN** system speaks question text using AI voice synthesis

#### Scenario: Replay question
- **WHEN** user taps "Replay" button
- **THEN** system speaks question again from beginning

### Requirement: User can record voice answer
The system SHALL allow user to record spoken answer using microphone.

#### Scenario: Start recording
- **WHEN** user taps microphone button
- **THEN** system starts recording and displays waveform animation

#### Scenario: Stop recording
- **WHEN** user taps stop button during recording
- **THEN** system stops recording and displays playback controls

#### Scenario: Recording time limit
- **WHEN** user records for 3 minutes
- **THEN** system automatically stops recording and displays "Maximum answer length reached"

### Requirement: User can review voice recording
The system SHALL allow user to play back recorded answer before submitting.

#### Scenario: Play recording
- **WHEN** user taps play button on recorded answer
- **THEN** system plays back recorded audio with progress indicator

#### Scenario: Re-record answer
- **WHEN** user taps "Re-record" button
- **THEN** system discards current recording and allows new recording

### Requirement: User can submit voice answer
The system SHALL allow user to submit recorded answer and move to next question.

#### Scenario: Submit voice answer
- **WHEN** user taps "Next Question" after recording
- **THEN** system saves recording, displays next question, and resets recording state

#### Scenario: Last question submission in voice mode
- **WHEN** user submits answer to last voice question
- **THEN** system navigates to interview results screen

### Requirement: User can pause and resume interview
The system SHALL allow user to exit interview and resume later.

#### Scenario: Exit during interview
- **WHEN** user taps back button or home button during interview
- **THEN** system displays confirmation "Save progress and exit?" with "Save & Exit" and "Cancel" options

#### Scenario: Resume saved interview
- **WHEN** user returns to saved interview from history
- **THEN** system resumes at last answered question with previous answers preserved

### Requirement: Display elapsed time
Both interview modes SHALL display elapsed time during interview.

#### Scenario: Show timer
- **WHEN** user is in interview (text or voice mode)
- **THEN** system displays elapsed time in MM:SS format at top of screen

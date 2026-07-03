## ADDED Requirements

### Requirement: Display user profile header
The profile screen SHALL display user information at the top.

#### Scenario: Show user details
- **WHEN** user views profile tab
- **THEN** system displays user avatar, name, email, and VIP badge (if applicable)

#### Scenario: Display user stats
- **WHEN** profile header is rendered
- **THEN** system shows total XP earned, current level, gems balance, and streak count

### Requirement: Display career section
The profile screen SHALL provide access to interview history and saved interviews.

#### Scenario: Show career menu items
- **WHEN** user views profile tab
- **THEN** system displays "Career" section with "Interview History" and "Saved Interviews" options

#### Scenario: Navigate to interview history
- **WHEN** user taps "Interview History"
- **THEN** system navigates to interview history screen showing list of completed interviews

#### Scenario: Navigate to saved interviews
- **WHEN** user taps "Saved Interviews"
- **THEN** system navigates to saved interviews screen showing list of favorited interviews

### Requirement: Display interview history list
The interview history screen SHALL show all completed interviews with results.

#### Scenario: Show history entries
- **WHEN** user views interview history screen
- **THEN** system displays list of completed interviews with title, completion date, score, and duration

#### Scenario: Tap history entry
- **WHEN** user taps an interview history entry
- **THEN** system navigates to interview history detail screen showing full results and feedback

#### Scenario: Empty history
- **WHEN** user has not completed any interviews
- **THEN** system displays "No interviews completed yet" message with "Start Learning" button

### Requirement: Display saved interviews list
The saved interviews screen SHALL show all favorited interviews.

#### Scenario: Show saved list
- **WHEN** user views saved interviews screen
- **THEN** system displays grid of favorited interview cards with same design as explore screen

#### Scenario: Tap saved interview
- **WHEN** user taps saved interview card
- **THEN** system navigates to interview detail screen

#### Scenario: Remove from saved
- **WHEN** user taps heart icon on saved interview card
- **THEN** system removes from saved list and displays "Removed from saved" toast

#### Scenario: Empty saved list
- **WHEN** user has no saved interviews
- **THEN** system displays "No saved interviews" message with "Browse Interviews" button

### Requirement: Display app settings section
The profile screen SHALL provide access to general settings, security, and language options.

#### Scenario: Show settings menu
- **WHEN** user views profile tab
- **THEN** system displays "App Settings" section with "General Settings", "Security", and "Language" options

#### Scenario: Navigate to general settings
- **WHEN** user taps "General Settings"
- **THEN** system navigates to general settings screen with notification, theme, and sound preferences

#### Scenario: Navigate to security settings
- **WHEN** user taps "Security"
- **THEN** system navigates to security screen with password change and biometric auth options

#### Scenario: Display current language
- **WHEN** "Language" option is displayed
- **THEN** system shows current language selection (e.g., "English") on the right

#### Scenario: Change language
- **WHEN** user taps "Language"
- **THEN** system displays language picker modal with available languages

### Requirement: Display support section
The profile screen SHALL provide access to help center and logout.

#### Scenario: Show support menu
- **WHEN** user views profile tab
- **THEN** system displays "Support" section with "Help Center" and "Log Out" options

#### Scenario: Navigate to help center
- **WHEN** user taps "Help Center"
- **THEN** system navigates to help center screen or opens web view with FAQ and support articles

#### Scenario: Log out confirmation
- **WHEN** user taps "Log Out"
- **THEN** system displays confirmation modal "Are you sure you want to log out?" with "Log Out" and "Cancel" buttons

#### Scenario: Confirm logout
- **WHEN** user confirms logout
- **THEN** system clears Appwrite session, clears local state, navigates to welcome screen

### Requirement: Display VIP status prominently
The profile screen SHALL highlight VIP status for subscribed users.

#### Scenario: VIP user sees crown badge
- **WHEN** VIP user views profile tab
- **THEN** system displays crown icon badge next to username with "VIP Member" label

#### Scenario: Tap VIP badge
- **WHEN** VIP user taps crown badge
- **THEN** system navigates to VIP status screen showing subscription details

#### Scenario: Non-VIP user sees upsell
- **WHEN** non-VIP user views profile tab
- **THEN** system displays "Upgrade to VIP" banner at top of profile screen

### Requirement: Display account statistics
The profile screen SHALL show user's learning progress statistics.

#### Scenario: Show stats summary
- **WHEN** user views profile tab
- **THEN** system displays stats card with "Interviews Completed", "Days Active", "Total XP Earned"

#### Scenario: Animate stat counters
- **WHEN** stats card appears on screen
- **THEN** system animates numbers counting up from 0 to actual value

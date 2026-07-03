## ADDED Requirements

### Requirement: Display welcome screen on first launch
The app SHALL display a welcome screen with branding and a Google login button when the user is not authenticated.

#### Scenario: First time user sees welcome screen
- **WHEN** user opens the app for the first time
- **THEN** system displays welcome screen with app logo, tagline, and a single "Continue with Google" button

#### Scenario: Returning unauthenticated user sees welcome screen
- **WHEN** user opens the app after logging out or after a refresh-token failure
- **THEN** system displays welcome screen with the Google login button

### Requirement: User can log in with Google via Auth0
The system SHALL allow users to authenticate using Google OAuth through Auth0 Universal Login.

#### Scenario: Successful Google login on first device
- **WHEN** user taps "Continue with Google", completes the Google consent screen, and returns to the app
- **THEN** system receives the Auth0 access token, decodes the ID token, and navigates to the home tab
- **AND** system creates a corresponding `userProfile` document in Sanity keyed by `user.sub`

#### Scenario: Returning user with cached Auth0 session
- **WHEN** user reopens the app within the refresh-token lifetime
- **THEN** system silently refreshes the access token and navigates directly to the home tab
- **AND** system does NOT show the welcome screen

#### Scenario: User cancels Google consent
- **WHEN** user dismisses the Google consent screen without granting permission
- **THEN** system remains on the welcome screen and displays toast "Login cancelled"

#### Scenario: Network error during login
- **WHEN** the device is offline when the user taps "Continue with Google"
- **THEN** system displays error "Check your internet connection" and offers a "Try again" action

### Requirement: Persist authentication state across app launches
The system SHALL maintain user authentication state using Auth0's encrypted storage and the OS keychain.

#### Scenario: Authenticated user reopens app
- **WHEN** authenticated user closes and reopens the app
- **THEN** system attempts a silent refresh and navigates directly to the home tab without showing the welcome screen

#### Scenario: Refresh token expired
- **WHEN** the user's Auth0 refresh token is expired or revoked
- **THEN** system navigates to the welcome screen and displays "Session expired, please sign in again"

#### Scenario: User logs out
- **WHEN** user taps "Log Out" and confirms
- **THEN** system calls `clearSession()`, deletes the cached tokens, resets the Sanity user-scoped query cache, and navigates to the welcome screen

### Requirement: Sync Google identity to Sanity on first login
The system SHALL create a `userProfile` document in Sanity using the Auth0 `sub` as the document `_id` on first successful login.

#### Scenario: New user profile creation
- **WHEN** a user logs in for the first time
- **THEN** system upserts a `userProfile` document with `_id = user.sub`, email, name, picture, `provider: "google"`, and a freshly initialized `gamificationState` (streak 0, gems 0, xp 0, level 1)

#### Scenario: Returning user profile hydration
- **WHEN** a returning user logs in
- **THEN** system fetches the existing `userProfile` document by `user.sub` and hydrates the local gamification store from it

### Requirement: Authenticated user is isolated in Sanity
The system SHALL ensure that every user-scoped Sanity read or write is keyed by the verified Auth0 `sub` from the access token, never from a client-supplied value.

#### Scenario: API route returns only the caller's history
- **WHEN** an authenticated client requests `/api/interview-history`
- **THEN** server verifies the Auth0 JWT, extracts `sub`, and queries Sanity with `userId == $sub`
- **AND** the response contains only documents belonging to that user

#### Scenario: Forged userId in client query
- **WHEN** a client sends a query that references a `userId` other than its own `sub`
- **THEN** server ignores the client value and substitutes the verified `sub` from the JWT

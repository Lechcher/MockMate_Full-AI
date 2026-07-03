## ADDED Requirements

### Requirement: Display grid of mock interview cards
The explore screen SHALL display all available mock interviews in a scrollable grid.

#### Scenario: Show all interviews
- **WHEN** user views explore screen
- **THEN** system displays grid of interview cards with title, industry icon, difficulty badge, question count, rating, and favorite icon

#### Scenario: Scroll to load more
- **WHEN** user scrolls to bottom of interview grid
- **THEN** system loads next page of interviews (if pagination implemented)

### Requirement: Filter interviews by industry category
The system SHALL allow users to filter interviews by industry category.

#### Scenario: Display industry filters
- **WHEN** user views explore screen
- **THEN** system displays horizontal scrollable list of industry chips (All, IT, Sales, Finance, Design, Manager, Marketing, HealthCare, Education)

#### Scenario: Select industry filter
- **WHEN** user taps an industry chip
- **THEN** system highlights selected chip and displays only interviews matching that industry

#### Scenario: Select All filter
- **WHEN** user taps "All" chip
- **THEN** system displays all interviews regardless of industry

### Requirement: Filter interviews by difficulty level
The system SHALL allow users to filter interviews by difficulty level.

#### Scenario: Display difficulty filters
- **WHEN** user views explore screen
- **THEN** system displays difficulty filter chips (Easy, Medium, Hard) below industry filters

#### Scenario: Select difficulty filter
- **WHEN** user taps a difficulty chip
- **THEN** system highlights selected chip and displays only interviews matching that difficulty

#### Scenario: Combine filters
- **WHEN** user selects both industry and difficulty filters
- **THEN** system displays interviews matching BOTH filters (AND logic)

### Requirement: Search interviews by title or focus area
The system SHALL allow users to search interviews using a search input.

#### Scenario: Enter search query
- **WHEN** user types in search field
- **THEN** system filters interviews in real-time to match search query against title or focus area

#### Scenario: Clear search
- **WHEN** user clears search field
- **THEN** system displays all interviews (respecting active filters)

#### Scenario: No results found
- **WHEN** search query matches no interviews
- **THEN** system displays "No interviews found" message with suggestion to adjust filters

### Requirement: Toggle favorite status on interview cards
The system SHALL allow users to mark interviews as favorites from the explore screen.

#### Scenario: Favorite an interview
- **WHEN** user taps heart icon on interview card
- **THEN** system marks interview as favorite and fills heart icon with color

#### Scenario: Unfavorite an interview
- **WHEN** user taps filled heart icon on favorited interview card
- **THEN** system removes favorite status and displays outline heart icon

#### Scenario: Favorite persists across sessions
- **WHEN** user favorites an interview and reopens the app
- **THEN** system displays favorited interviews with filled heart icons

### Requirement: Navigate to interview detail on card tap
The system SHALL navigate to interview detail screen when user taps an interview card.

#### Scenario: Tap interview card
- **WHEN** user taps anywhere on interview card (except heart icon)
- **THEN** system navigates to interview detail screen for that interview

### Requirement: Display interview metadata on cards
Each interview card SHALL display industry, difficulty, question count, and rating.

#### Scenario: Show industry with icon
- **WHEN** interview card is rendered
- **THEN** system displays industry name with colored icon matching industries design system

#### Scenario: Show difficulty badge
- **WHEN** interview card is rendered
- **THEN** system displays difficulty badge (Easy/Medium/Hard) with appropriate color

#### Scenario: Show question count
- **WHEN** interview card is rendered
- **THEN** system displays number of questions with "X questions" label

#### Scenario: Show rating
- **WHEN** interview card is rendered
- **THEN** system displays star rating (e.g., 4.8) and review count (e.g., "(120)")

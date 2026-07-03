## ADDED Requirements

### Requirement: Display premium upsell card
The shop screen SHALL display prominent card promoting VIP subscription.

#### Scenario: Show premium card for non-VIP users
- **WHEN** non-VIP user views shop tab
- **THEN** system displays "Go Premium" card at top with crown icon, benefits list, and "Try Free for 7 Days" button

#### Scenario: Hide premium card for VIP users
- **WHEN** VIP user views shop tab
- **THEN** system does not display "Go Premium" card

#### Scenario: Tap premium card
- **WHEN** user taps "Go Premium" card or "Try Free for 7 Days" button
- **THEN** system navigates to VIP subscription plan selection screen

### Requirement: Display special offers card
The shop screen SHALL display limited-time offers and bundles.

#### Scenario: Show daily deal card
- **WHEN** user views shop tab
- **THEN** system displays "Daily Deal" card with clock badge, offer description, and "Click Now!" button

#### Scenario: Tap daily deal
- **WHEN** user taps daily deal card
- **THEN** system opens offer details modal or navigates to offer-specific screen

### Requirement: Display power-ups section
The shop SHALL display available power-ups purchasable with gems.

#### Scenario: Show power-ups list
- **WHEN** user views shop tab
- **THEN** system displays "Power-Ups" section with cards for Streak Freeze and Double XP

#### Scenario: Power-up card shows details
- **WHEN** power-up card is displayed
- **THEN** system shows icon, title, description, and gem price

### Requirement: User can purchase power-up with gems
The system SHALL allow users to buy power-ups using their gem balance.

#### Scenario: Purchase streak freeze
- **WHEN** user taps "Buy" on Streak Freeze (200 gems) and has sufficient gems
- **THEN** system deducts 200 gems, adds 1 streak freeze to user inventory, displays "Purchased! +1 Streak Freeze" toast

#### Scenario: Purchase double XP
- **WHEN** user taps "Buy" on Double XP (350 gems) and has sufficient gems
- **THEN** system deducts 350 gems, activates 30-minute double XP boost, displays countdown timer in header

#### Scenario: Insufficient gems
- **WHEN** user taps "Buy" on power-up with insufficient gem balance
- **THEN** system displays error "Not enough gems. Complete quests to earn more!" and highlights daily quests tab

### Requirement: Display user gem balance
The shop screen SHALL prominently display user's current gem balance.

#### Scenario: Show gem count in header
- **WHEN** user views shop tab
- **THEN** system displays gem icon with current balance at top of screen

#### Scenario: Update balance after purchase
- **WHEN** user purchases power-up
- **THEN** system updates displayed gem balance immediately with animation

### Requirement: Display power-up inventory count
Power-up cards SHALL show how many user currently owns.

#### Scenario: Show owned count
- **WHEN** power-up card is displayed
- **THEN** system shows "Owned: X" label below description

#### Scenario: Streak freeze count matches status
- **WHEN** user owns streak freezes
- **THEN** displayed count matches value in user status store

### Requirement: Prevent duplicate active boosts
The system SHALL not allow purchasing duplicate time-limited power-ups.

#### Scenario: Double XP already active
- **WHEN** user has active Double XP boost and taps "Buy" on Double XP
- **THEN** system displays message "Already active! Time remaining: Xm Ys" and prevents purchase

### Requirement: Display purchase confirmation
The system SHALL require confirmation before completing gem purchases.

#### Scenario: Confirm purchase
- **WHEN** user taps "Buy" on power-up
- **THEN** system displays confirmation modal "Purchase [Power-up] for X gems?" with "Confirm" and "Cancel" buttons

#### Scenario: Cancel purchase
- **WHEN** user taps "Cancel" in confirmation modal
- **THEN** system closes modal without deducting gems

### Requirement: Display power-up effects
The system SHALL show active power-up effects in relevant screens.

#### Scenario: Double XP indicator
- **WHEN** Double XP is active
- **THEN** system displays countdown timer badge in header on all screens and multiplies XP earnings by 2

#### Scenario: Streak freeze indicator
- **WHEN** user owns streak freezes
- **THEN** home screen displays snowflake icon with count

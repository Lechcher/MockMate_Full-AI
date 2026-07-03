## ADDED Requirements

### Requirement: Display VIP subscription plan options
The VIP subscription screen SHALL present yearly and monthly plan options.

#### Scenario: Show plan cards
- **WHEN** user views VIP subscription screen
- **THEN** system displays two plan cards: "Yearly Plan" and "Monthly Plan"

#### Scenario: Yearly plan shows discount
- **WHEN** yearly plan card is displayed
- **THEN** system shows original price ($120), discounted price ($60), savings badge "Save 50%", and per-month cost ($5/month)

#### Scenario: Monthly plan shows standard price
- **WHEN** monthly plan card is displayed
- **THEN** system shows price ($10/month) without discount badge

#### Scenario: Recommended plan highlighted
- **WHEN** plan cards are displayed
- **THEN** system highlights yearly plan with "Best Value" badge and accent border

### Requirement: List VIP benefits
The screen SHALL display all features included with VIP subscription.

#### Scenario: Show benefits list
- **WHEN** user views VIP subscription screen
- **THEN** system displays benefits: "Unlimited AI Feedback", "Advanced Analytics", "Priority Support", "Ad-Free Experience", "Exclusive Interview Packs"

#### Scenario: Benefit icons
- **WHEN** benefits list is displayed
- **THEN** each benefit shows checkmark icon in accent color

### Requirement: User can select subscription plan
The system SHALL allow users to choose between yearly and monthly plans.

#### Scenario: Select yearly plan
- **WHEN** user taps yearly plan card
- **THEN** system highlights card with accent border and updates "Subscribe" button to show yearly price

#### Scenario: Select monthly plan
- **WHEN** user taps monthly plan card
- **THEN** system highlights card and updates "Subscribe" button to show monthly price

### Requirement: Integrate RevenueCat for purchases
The system SHALL use RevenueCat SDK to handle subscription purchases.

#### Scenario: Fetch offerings from RevenueCat
- **WHEN** VIP subscription screen loads
- **THEN** system calls RevenueCat.getOfferings() and displays available subscription products

#### Scenario: Purchase subscription
- **WHEN** user taps "Subscribe" button after selecting plan
- **THEN** system calls RevenueCat.purchasePackage() with selected plan and processes payment via App Store/Google Play

#### Scenario: Purchase successful
- **WHEN** RevenueCat confirms successful purchase
- **THEN** system updates user VIP status, displays "Welcome to VIP!" success screen, and navigates to home

#### Scenario: Purchase cancelled
- **WHEN** user cancels payment in App Store/Google Play sheet
- **THEN** system displays "Purchase cancelled" toast and remains on subscription screen

#### Scenario: Purchase failed
- **WHEN** RevenueCat returns error (payment declined, network error)
- **THEN** system displays error message with retry option

### Requirement: Display free trial offer
The system SHALL highlight 7-day free trial for new subscribers.

#### Scenario: Show trial badge
- **WHEN** user has not previously subscribed
- **THEN** system displays "Try Free for 7 Days" badge on subscription button

#### Scenario: Hide trial for existing subscribers
- **WHEN** user has active or expired subscription
- **THEN** system does not display free trial offer

#### Scenario: Trial terms displayed
- **WHEN** subscription screen is visible
- **THEN** system shows disclaimer text "Free for 7 days, then $X/month. Cancel anytime."

### Requirement: Check VIP status via RevenueCat
The system SHALL verify subscription status through RevenueCat customer info.

#### Scenario: Active VIP subscription
- **WHEN** system calls RevenueCat.getCustomerInfo() and user has active "vip" entitlement
- **THEN** useVIPStatus() hook returns isVIP: true and expiration date

#### Scenario: Expired subscription
- **WHEN** RevenueCat customer info shows expired "vip" entitlement
- **THEN** useVIPStatus() hook returns isVIP: false

#### Scenario: Never subscribed
- **WHEN** RevenueCat customer info has no "vip" entitlement
- **THEN** useVIPStatus() hook returns isVIP: false

### Requirement: Display VIP status in profile
The system SHALL show active subscription details in profile screen.

#### Scenario: VIP user views status
- **WHEN** VIP user taps crown badge in profile
- **THEN** system navigates to VIP status screen showing plan type, renewal date, and "Manage Subscription" button

#### Scenario: Show renewal date
- **WHEN** VIP status screen is displayed
- **THEN** system shows "Renews on [date]" or "Expires on [date]" based on subscription state

#### Scenario: Manage subscription
- **WHEN** user taps "Manage Subscription"
- **THEN** system opens App Store/Google Play subscription management screen

### Requirement: Gate premium features by VIP status
The system SHALL restrict premium interview content to VIP subscribers.

#### Scenario: Non-VIP views premium interview
- **WHEN** non-VIP user taps premium interview in explore
- **THEN** interview detail shows "VIP Only" badge and "Upgrade to Start" button instead of "Start Interview"

#### Scenario: VIP accesses premium interview
- **WHEN** VIP user taps premium interview
- **THEN** system allows normal "Start Interview" flow without restrictions

#### Scenario: Free interviews accessible to all
- **WHEN** any user taps free interview
- **THEN** system allows normal "Start Interview" flow regardless of VIP status

### Requirement: Display restore purchases option
The screen SHALL provide button to restore previous purchases.

#### Scenario: Show restore button
- **WHEN** user views subscription screen
- **THEN** system displays "Restore Purchases" link at bottom

#### Scenario: Restore purchases
- **WHEN** user taps "Restore Purchases"
- **THEN** system calls RevenueCat.restorePurchases() and syncs subscription status

#### Scenario: Restore successful
- **WHEN** RevenueCat restores active subscription
- **THEN** system updates VIP status and displays "Subscription restored!" success message

#### Scenario: No purchases to restore
- **WHEN** RevenueCat finds no previous purchases
- **THEN** system displays "No purchases found to restore"

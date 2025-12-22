# Profile & Settings

**Navigation:** Accessed from Thread or Dashboard via profile icon
**Purpose:** Manage notifications, account settings, profile, and subscriptions
**Epics Covered:** Epic 7 (Notifications), Epic 8 (Settings & Profile)

---

## Page Overview

The **Profile & Settings** pages are cross-cutting features accessible from the Thread or Dashboard pages. These screens allow users to customize their experience, manage notifications, and control account settings.

### User Value Proposition
- Control notification frequency and timing
- Manage account details and preferences
- View and upgrade subscription plans
- Access help resources and support
- Logout securely

### Navigation Pattern
- **Entry:** Profile icon on Thread or Dashboard → Profile Overview
- **From Profile Overview:**
  - Identity Document → View/edit archetype and dream self
  - Notification Preferences → Manage notification settings
  - App Settings → General app configuration
  - Subscription Management → View/upgrade plan
  - Help/Support → FAQ, contact support
  - Logout → Confirm and logout

---

## Wireframe Requirements

### Purpose
iOS-style settings page following Apple Settings.app patterns. Single scrollable page with grouped sections.

**Access:** Tap profile button (top-right on Thread or Dashboard)

---

### Screen Layout

**Profile Header (Top, non-scrollable):**
- **Circular profile photo** (large, centered)
  - Tap to change photo
  - Upload from camera or gallery
- **Name** (below photo, centered)
- **Email** (below name, smaller text)
- **Level badge** (e.g., "Level 2 - Strand") + Streak (e.g., "12 day streak 🔥")

---

**Scrollable Content (Grouped List Sections):**

### Section 1: Account
**Style:** iOS grouped list with chevrons

- **Edit Profile** →
  - Name (text input)
  - Email (text input)
  - Profile photo (upload button)
  - Save button

- **Identity Document** →
  - View archetype (from onboarding)
  - Dream self description (read-only or editable?)
  - Motivations & failure modes
  - Constraints & demographics

- **Subscription** →
  - Current plan badge: "Free" / "Pro" / "Max"
  - Plan comparison table:
    | Feature | Free | Pro | Max |
    |---------|------|-----|-----|
    | Goals | 1 | 3 | 5 |
    | AI Chat | Limited | Unlimited | Unlimited |
    | Insights | Basic | Advanced | Premium |
  - **Upgrade button** (if not on Max)
  - Link to App Store subscription management
  - Cancel subscription info

---

### Section 2: Notifications
**Style:** Toggle switches + time pickers

- **Enable Notifications** (master toggle)
  - If off, all below are disabled

- **Morning Intention** (toggle)
  - Time picker: "8:00 AM" (tap to change)
  - Subtitle: "Daily plan and yesterday's recap"

- **Bind Reminders** (toggle)
  - Subtitle: "Gentle reminders for scheduled binds"

- **Evening Reflection** (toggle)
  - Time picker: "9:00 PM"
  - Subtitle: "Daily check-in prompt"

- **Streak Recovery** (toggle)
  - Subtitle: "Compassionate nudges after missing days"

- **Quiet Hours** (toggle)
  - If on, show time range picker:
    - Start: "10:00 PM"
    - End: "7:00 AM"
  - Subtitle: "No notifications during this window"

**Note:** "Max 5 notifications per day" enforced automatically (not a setting)

---

### Section 3: Preferences

- **Strictness Mode** (segmented control or picker)
  - Options: None / Normal / Strict
  - Subtitle: "Controls warnings when editing goals"
  - **None:** No warnings
  - **Normal:** Show impact summary
  - **Strict:** Require justification text

- **Theme** (if we add dark mode toggle)
  - Options: Auto / Light / Dark

---

### Section 4: Data & Privacy

- **Export My Data** →
  - Button: "Download Data"
  - Generates JSON with all user data
  - Opens share sheet to save/send

- **Weave Chat History** →
  - List of past AI conversations
  - Each entry: Date + first message preview
  - Tap → Opens Weave AI modal with that history

---

### Section 5: Support

- **Help & FAQ** →
  - In-app FAQ section (expandable list)
  - Topics: "How do streaks work?", "What are Q-goals?", etc.

- **Contact Support** →
  - Email link: support@weaveapp.com
  - Or in-app form

- **Rate App** →
  - Opens App Store rating dialog
  - (Prompt after 7 active days - US-8.5)

- **Version** (non-tappable)
  - Gray text: "Version 1.0.0 (Build 42)"

---

### Section 6: Account Actions

- **Logout** (red text)
  - Confirmation dialog: "Are you sure you want to logout?"
  - Clears local session
  - Returns to login screen

- **Delete Account** (red text)
  - Multi-step confirmation:
    1. Warning: "This will permanently delete all your data"
    2. Require re-authentication (Face ID / password)
    3. Type "DELETE" to confirm
  - Soft delete: 30-day grace period before hard delete
  - Email sent: "Your account will be deleted in 30 days. Log back in to cancel."

---

### Interaction Patterns

- Tap profile button → Opens Profile & Settings
- Tap section item with chevron → Navigate to detail screen
- Toggle switches → Update immediately (optimistic UI)
- Time pickers → Native iOS picker
- Logout → Confirmation dialog
- Delete account → Multi-step confirmation flow
- Back button (if in detail screen) → Returns to main settings

---

## Stories Implementing This Page

### Epic 7: Notifications

#### [US-7.1: Morning Intention Notification](#)
**Priority:** M (Must Have) | **Estimate:** 5 pts

**Acceptance Criteria:**
- [ ] Sent at user's preferred start time
- [ ] Content includes:
  - Today's binds
  - Yesterday's intention recap (from journal)
- [ ] Uses Dream Self voice
- [ ] Deep link to Thread (Home)
- [ ] Can be disabled in settings

**Reference:** `docs/prd/epic-7-notifications.md` (lines 9-35)

---

#### [US-7.2: Bind Reminder Notifications](#)
**Priority:** M (Must Have) | **Estimate:** 5 pts

**Acceptance Criteria:**
- [ ] Triggered based on bind schedule
- [ ] Escalation strategy:
  - First: Gentle ("Ready to knock out your gym session?")
  - Second: Contextual ("You usually feel great after workouts")
  - Third: Accountability ("Your 27-day streak is on the line")
- [ ] Max 3 reminders per bind per day
- [ ] Uses Dream Self voice
- [ ] Deep link to specific Bind Screen

**Reference:** `docs/prd/epic-7-notifications.md` (lines 37-63)

---

#### [US-7.3: Evening Reflection Prompt](#)
**Priority:** M (Must Have) | **Estimate:** 3 pts

**Acceptance Criteria:**
- [ ] Sent at user's wind-down time (from preferences)
- [ ] Only if journal not yet submitted today
- [ ] Content: "How did today go? Weave is ready to reflect with you."
- [ ] Deep link to Daily Reflection

**Reference:** `docs/prd/epic-7-notifications.md` (lines 65-83)

---

#### [US-7.4: Streak Recovery Notification](#)
**Priority:** M (Must Have) | **Estimate:** 5 pts

**Acceptance Criteria:**
- [ ] Triggered after 24-48 hours of inactivity
- [ ] Compassionate, not shame-based messaging
- [ ] Reference specific goals and past wins
- [ ] Offer easy re-entry: "Just log ONE bind today"
- [ ] Uses Dream Self voice
- [ ] For 48h-7d absence: Deep-link to AI Chat
- [ ] For >7d absence: Trigger special welcome animation

**Reference:** `docs/prd/epic-7-notifications.md` (lines 85-126)

---

#### [US-7.6: Notification Preferences](#)
**Priority:** M (Must Have) | **Estimate:** 5 pts

**Acceptance Criteria:**
- [ ] Per-notification toggles:
  - Morning intention
  - Bind reminders
  - Evening reflection
- [ ] Max 5 notifications per day enforced

**Data Requirements:**
- Store in `user_profiles.preferences.notifications`

**Reference:** `docs/prd/epic-7-notifications.md` (lines 128-147)

---

### Epic 8: Settings & Profile

#### [US-8.1: Profile Overview](#)
**Priority:** M (Must Have) | **Estimate:** 3 pts

**Acceptance Criteria:**
- [ ] Access from Thread via profile icon
- [ ] Display: Name, email, profile photo (optional)
- [ ] Quick links to:
  - Identity Document
  - Notification Preferences
  - App Settings
  - Help/Support
  - Logout

**Reference:** `docs/prd/epic-8-settings-profile.md` (lines 9-30)

---

#### [US-8.3: General Settings](#)
**Priority:** M (Must Have) | **Estimate:** 5 pts

**Acceptance Criteria:**
- [ ] Data export (JSON download)
- [ ] Delete account (with confirmation)

**Data Requirements:**
- Read/Write `user_profiles.preferences`

**Technical Notes:**
- Data export: Generate JSON with all user data
- Delete account: Soft delete first, hard delete after 30 days

**Reference:** `docs/prd/epic-8-settings-profile.md` (lines 32-51)

---

#### [US-8.4: Subscription Management](#)
**Priority:** M (Must Have) | **Estimate:** 5 pts

**Acceptance Criteria:**
- [ ] Show current plan (Free, Pro, Max)
- [ ] Show features by plan
- [ ] Upgrade CTA with pricing
- [ ] Link to App Store subscription management
- [ ] Cancel subscription info

**Pricing Tiers:**
| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | 1 goal, limited AI chat |
| Pro | $12/month | 3 goals, unlimited AI chat, advanced triad |
| Max | $24/month | 5 goals, priority support, advanced insights |

**Technical Notes:**
- MVP: Link to App Store for management
- Track subscription status via webhooks

**Reference:** `docs/prd/epic-8-settings-profile.md` (lines 53-83)

---

#### [US-8.5: Help and Support](#)
**Priority:** S (Should Have) | **Estimate:** 3 pts

**Acceptance Criteria:**
- [ ] FAQ section (in-app)
- [ ] Contact support (email link)
- [ ] Rate app prompt (after 7 active days)
- [ ] Version number display

**Reference:** `docs/prd/epic-8-settings-profile.md` (lines 85-99)

---

#### [US-8.6: Logout and Account Security](#)
**Priority:** M (Must Have) | **Estimate:** 2 pts

**Acceptance Criteria:**
- [ ] Logout button with confirmation
- [ ] Clear local session data
- [ ] Redirect to login screen
- [ ] Re-authentication required for sensitive actions (delete account)

**Technical Notes:**
- Supabase Auth handles session management
- JWT tokens invalidated on logout

**Reference:** `docs/prd/epic-8-settings-profile.md` (lines 101-119)

---

## Page Completion Criteria

This page is considered **complete** when:
1. ✅ Users can access profile overview from Thread or Dashboard
2. ✅ Users can manage notification preferences (toggles, timing)
3. ✅ Users can export data and delete account
4. ✅ Users can view and upgrade subscription plans
5. ✅ Users can access help resources and contact support
6. ✅ Users can logout securely
7. ✅ All notifications respect user preferences and quiet hours

---

## Technical Implementation Notes

### Data Sources
- **User Profile:** `user_profiles` (name, email, photo)
- **Notification Preferences:** `user_profiles.preferences.notifications`
- **Subscription Status:** `subscriptions` table
- **Notification Queue:** APNs (Expo Push)
- **Identity Document:** `identity_docs`

### State Management
- **Server State (TanStack Query):** User profile, preferences, subscription
- **UI State (Zustand):** Selected menu item, modal state
- **Local State (useState):** Form inputs, toggles

### Key Patterns
- **Notification Scheduling:** Use APNs with timezone support
- **Dream Self Voice:** Load personality from `identity_docs`
- **Rate Limiting:** Max 5 notifications/day enforced at scheduling level
- **Deep Linking:** Use Expo Linking for notification deep links
- **Subscription Webhooks:** Listen for App Store events (purchase, cancel)

### Performance Considerations
- Notification preferences update immediately (optimistic UI)
- Subscription status polled every 24 hours
- Data export generates JSON in background (async)
- Delete account: soft delete first, hard delete after 30 days

---

## Design System Components

**Expected Components:**
- `Card` (variants: "glass", "elevated")
- `Text` (variants: displayMd, bodyMd, labelSm)
- `Button` (variants: primary, secondary, ghost, danger)
- `Toggle` (for notification preferences)
- `TimePicker` (for notification timing)
- `MenuItem` (custom component for settings list)
- `ConfirmationDialog` (for logout, delete account)

**Tokens:**
- Colors: `brandPrimary`, `neutral.surface`, `danger.default`
- Spacing: `spacing.md`, `spacing.lg`
- Typography: `fonts.body`, `fonts.label`

---

## Open Questions for Wireframe Review

When reviewing wireframes, clarify:
1. **Profile Icon Placement:** Top-right of Thread/Dashboard or in a menu?
2. **Notification Toggles:** Group by type or list all individually?
3. **Time Picker UI:** Native picker, custom slider, or text input?
4. **Subscription Comparison:** Full-screen modal or scrollable table?
5. **Logout Confirmation:** Simple alert or custom modal?
6. **Delete Account Flow:** Multi-step wizard or single confirmation?
7. **Identity Document Access:** From profile overview or separate tab?

---

## Related Documentation

- **Functional Requirements:**
  - `docs/prd/epic-7-notifications.md`
  - `docs/prd/epic-8-settings-profile.md`
- **Data Model:** `docs/idea/backend.md` (lines 200-800 for schema)
- **API Patterns:** `docs/architecture/implementation-patterns-consistency-rules.md`
- **Design System:** `docs/dev/design-system-guide.md`
- **Notification System:** Expo Push setup guide

---

**Last Updated:** 2025-12-21
**Status:** ✅ Ready for wireframe mapping

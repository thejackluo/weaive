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

**Key UI Elements Expected:**

### Profile Overview Screen
1. **Header** - Profile photo, name, email
2. **Quick Stats** - Active goals, current streak, total binds
3. **Menu Items:**
   - Identity Document
   - Notification Preferences
   - App Settings
   - Subscription Management
   - Help & Support
   - Logout

### Notification Preferences Screen
4. **Notification Toggles** - Per-notification type (morning, bind reminders, evening)
5. **Time Pickers** - Start time, wind-down time
6. **Quiet Hours** - Do not disturb window

### App Settings Screen
7. **Data Export** - Download user data as JSON
8. **Delete Account** - Confirmation flow

### Subscription Management Screen
9. **Current Plan** - Show active subscription
10. **Plan Comparison** - Free vs. Pro vs. Max
11. **Upgrade CTA** - Link to App Store

**Interaction Patterns:**
- Tap menu item → Navigate to detail screen
- Toggle switches → Update preferences immediately
- Logout → Confirmation dialog
- Delete account → Multi-step confirmation (type "DELETE")

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

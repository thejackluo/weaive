# Epic 7: Notifications

## Overview

Proactive push notifications keep users engaged without becoming spam. Notifications use Dream Self voice and respect user preferences.

## User Stories

### US-7.1: Morning Intention Notification

**Priority:** M (Must Have)

**As a** user
**I want to** receive my daily plan each morning
**So that** I start the day with focus

**Acceptance Criteria:**
- [ ] Sent at user's preferred start time
- [ ] Content includes:
  - Today's binds
  - Yesterday's intention recap (from journal)
- [ ] Uses Dream Self voice
- [ ] Deep link to Thread (Home)
- [ ] Can be disabled in settings

**Data Requirements:**
- Read from `triad_tasks`
- Read from `journal_entries` (yesterday's intention)
- Read from `user_profiles.preferences.notification_windows`

**Technical Notes:**
- Scheduled via APNs
- Respects timezone

---

### US-7.2: Bind Reminder Notifications

**Priority:** M (Must Have)

**As a** user
**I want to** receive gentle reminders for binds
**So that** I don't forget my commitments

**Acceptance Criteria:**
- [ ] Triggered based on bind schedule
- [ ] Escalation strategy:
  - First: Gentle ("Ready to knock out your gym session?")
  - Second: Contextual ("You usually feel great after workouts")
  - Third: Accountability ("Your 27-day streak is on the line")
- [ ] Max 3 reminders per bind per day
- [ ] Uses Dream Self voice
- [ ] Deep link to specific Bind Screen

**Data Requirements:**
- Read from `subtask_instances`
- Read from `subtask_completions` to check if already done

**Technical Notes:**
- Respects quiet hours
- Per-bind notification preferences (optional)

---

### US-7.3: Evening Reflection Prompt

**Priority:** M (Must Have)

**As a** user
**I want to** be reminded to reflect at end of day
**So that** I don't miss the journaling habit

**Acceptance Criteria:**
- [ ] Sent at user's wind-down time (from preferences)
- [ ] Only if journal not yet submitted today
- [ ] Content: "How did today go? Weave is ready to reflect with you."
- [ ] Deep link to Daily Reflection

**Data Requirements:**
- Read from `journal_entries` to check submission status
- Read from `user_profiles.preferences`

---

### US-7.4: Streak Recovery Notification

**Priority:** M (Must Have)

**As a** user
**I want to** be encouraged after missing days
**So that** I can recover without shame

**Related:** See [Return States (UX-R)](#return-states-ux-r---differentiator) for comprehensive return experience framework.

**Acceptance Criteria:**
- [ ] Works in conjunction with Return States framework (UX-R2, UX-R3, UX-R4)
- [ ] Triggered after 24-48 hours of inactivity (UX-R2/R3 threshold)
- [ ] Compassionate, not shame-based messaging
- [ ] Reference specific goals and past wins
- [ ] Offer easy re-entry: "Just log ONE bind today"
- [ ] Uses Dream Self voice
- [ ] For 48h-7d absence: Notification deep-links to AI Chat (UX-R3 flow)
- [ ] For >7d absence: Notification triggers special welcome animation (UX-R4)

**Example (24-48h - UX-R2):**
```
Hey, you're back! 💙
Ready to pick up where you left off?
Just ONE bind keeps the thread going.
```

**Example (48h-7d - UX-R3):**
```
I noticed you've been away. Everything okay?
Life gets busy—no judgment here.
Tap to chat with Weave about getting back on track.
[Opens AI Chat with return context]
```

**Data Requirements:**
- Read from `user_profiles.last_active_at`
- Read from `goals` for context
- Calculate time_away_hours on notification trigger
- Route to appropriate UX-R experience based on absence duration

---

### US-7.6: Notification Preferences

**Priority:** M (Must Have)

**As a** user
**I want to** control notification frequency and channels
**So that** I'm not overwhelmed and receive notifications where I want them

**Acceptance Criteria:**
- [ ] Per-notification toggles:
  - Morning intention
  - Bind reminders
  - Evening reflection
- [ ] Max 5 notifications per day enforced

**Data Requirements:**
- Store in `user_profiles.preferences.notifications`

**Note:** MVP uses push notifications via Expo Push → APNs. **Future roadmap:** SMS/text messaging integration for users who prefer text-based accountability (requires Twilio or similar).

---

## Epic 7 Summary

| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-7.1 | Morning Intention | M | 5 pts |
| US-7.2 | Bind Reminders | M | 5 pts |
| US-7.3 | Evening Reflection Prompt | M | 3 pts |
| US-7.4 | Streak Recovery | M | 5 pts |
| US-7.6 | Notification Preferences | M | 5 pts |

**Epic Total:** 23 story points

**Changes from Original:**
- Removed US-7.5 (Milestone Celebration) - milestone celebration integrated into US-3.3 completion flow

---

# MVP Progress Tracker

**Purpose:** Track completion status for MVP features
**Last Updated:** 2025-12-23

---

## Overall Progress

**MVP Scope:** 97 story points
**Completed:** 18 story points (Epic 3 + 4 Thread flow)
**Remaining:** 79 story points

**Progress:** 18.6% complete ████░░░░░░░░░░░░░░░░

---

## Epic 0: Foundation ✅ COMPLETE

**Status:** ✅ All foundation stories complete
**Total:** ~40 story points

- [x] US-0.1: Project Scaffolding ✅ Complete
- [x] US-0.2: Database Schema (Core) ✅ Complete
- [x] US-0.3: Authentication Flow ✅ Complete
- [x] US-0.4: Row Level Security (RLS) ✅ Complete
- [x] US-0.5: CI/CD Pipeline ✅ Complete
- [x] US-0.6: AI Service Abstraction ✅ Complete
- [x] US-0.9: Image Upload & Processing ✅ Complete
- [x] Story 1.5.1: Navigation Architecture ✅ Complete
- [x] Story 1.5.2: Backend Standardization ✅ Complete
- [x] Story 1.5.3: AI Module Orchestration ✅ Complete

---

## Epic 1: Onboarding ⚠️ PARTIALLY COMPLETE

**Status:** ⚠️ Core onboarding flow complete, some stories pending
**Total:** ~35 story points

- [x] US-1.1: Welcome & Vision Hook ✅ Complete
- [x] US-1.5: Authentication ✅ Complete
- [x] US-1.6: Name Entry & Weave Personality ✅ Complete
- [x] US-1.7: Commitment Ritual & Origin Story ✅ Complete
- [ ] US-1.8: Create First Needle (AI-assisted) ⏳ **Priority: HIGH**
- [ ] US-1.9: First Daily Reflection ⏳ **Priority: MEDIUM**

**Next Step:** Complete US-1.8 (links to Epic 2, US-2.3)

---

## Epic 2: Goal Management (Dashboard Page) ❌ NOT STARTED

**Priority:** 🎯 **HIGH** - Entry point to app
**Total:** 24 story points
**Status:** ❌ Not started

### Stories

- [ ] US-2.1: View Goals List (3 pts)
- [ ] US-2.2: View Goal Details (5 pts)
- [ ] US-2.3: Create New Goal (AI-Assisted) (8 pts) 🎯 **CRITICAL AI FEATURE**
- [ ] US-2.4: Edit Needle (5 pts)
- [ ] US-2.5: Archive Goal (3 pts)

### Implementation Checklist

- [ ] Backend API: Goals router (`/api/goals`)
- [ ] Backend AI: Onboarding Coach module (goal breakdown)
- [ ] Frontend: Goals list screen
- [ ] Frontend: Goal detail screen
- [ ] Frontend: Create goal flow with AI generation
- [ ] Frontend: Edit goal flow
- [ ] Frontend: Archive confirmation

**Reference:** `docs/pages/dashboard-page.md` + `docs/prd/epic-2-goal-management.md`

---

## Epic 3: Daily Actions (Thread Page) ✅ PARTIALLY COMPLETE

**Priority:** 🎯 **HIGH** - Core engagement loop
**Total:** 18 story points
**Status:** ✅ Complete in `thread-flow` branch

### Stories

- [x] US-3.1: View Today's Binds (5 pts) ✅ 2025-12-22
- [x] US-3.3: Complete Bind with Proof (8 pts) ✅ 2025-12-22
- [x] US-3.4: Timer Tracking (5 pts) ✅ 2025-12-22

### Completed Features

- [x] Backend API: Binds router (`/api/binds/today`, `/api/binds/{id}/complete`)
- [x] Frontend: ThreadHomeScreen (today's binds grouped by needle)
- [x] Frontend: BindScreen (completion flow)
- [x] Frontend: PomodoroTimer component
- [x] Frontend: CompletionCelebration component (confetti animation)
- [x] Frontend: Mock data for testing

### TODO: Merge to Main

- [ ] Replace mock data with live API calls
- [ ] Add tests for new components
- [ ] Merge `thread-flow` branch to `main`

**Reference:** `docs/pages/thread-page.md` + `docs/prd/epic-3-daily-actions-proof.md`

---

## Epic 4: Reflection & Journaling (Thread Page) ❌ SIMPLIFIED

**Priority:** 🎯 **HIGH** - Daily habit loop + AI trigger
**Total:** 28 story points → **14 pts MVP**
**Status:** ❌ Not started

### MVP Stories (Simplified)

- [ ] US-4.1a: Reflection Questions (Default 2) (3 pts)
- [ ] US-4.3: AI Feedback Generation (8 pts) 🎯 **CRITICAL AI FEATURE**
- [ ] US-4.4: Edit AI Feedback (5 pts)

### Skipped for MVP

- [ ] ~~US-4.1b: Custom Reflection Questions (3 pts)~~ ⏳ Post-MVP
- [ ] ~~US-4.2: Recap Before Reflection (3 pts)~~ ⏳ Post-MVP
- [ ] ~~US-4.5: View Past Journal Entries (6 pts)~~ ⏳ Post-MVP

### Implementation Checklist

- [ ] Backend API: Journal router (`/api/journal/today`, `/api/journal/submit`)
- [ ] Backend AI: Daily Recap module (affirming + blocker insights)
- [ ] Backend AI: Triad Planner module (next-day 3 tasks)
- [ ] Frontend: Daily reflection screen (2 default questions + fulfillment slider)
- [ ] Frontend: AI feedback display (3 cards: affirming, blocker, triad)
- [ ] Frontend: Edit AI feedback flow

**Reference:** `docs/pages/thread-page.md` + `docs/prd/epic-4-reflection-journaling.md`

---

## Epic 5: Progress Visualization (Dashboard Page) ❌ SIMPLIFIED

**Priority:** 🎯 **MEDIUM** - Motivational, but not blocking
**Total:** 26 story points → **18 pts MVP**
**Status:** ❌ Not started

### MVP Stories (Simplified)

- [ ] US-5.1: Weave Dashboard Overview (5 pts)
- [ ] US-5.2: Consistency Heat Map (5 pts)
- [ ] US-5.3: Fulfillment Trend Chart (5 pts)
- [ ] US-5.5: Streak Tracking (3 pts)

### Skipped for MVP

- [ ] ~~US-5.4: Weave Character Progression (8 pts)~~ ⏳ Post-MVP (complex visualization)

**Alternative for US-5.4:** Show simple level badge "Level 2 - Strand" + progress bar

### Implementation Checklist

- [ ] Frontend: Dashboard overview screen
- [ ] Frontend: Consistency heat map (GitHub-style)
- [ ] Frontend: Fulfillment trend chart (line chart with 7-day rolling average)
- [ ] Frontend: Streak counter (current + longest)
- [ ] Frontend: Level badge (text + progress bar)

**Reference:** `docs/pages/dashboard-page.md` + `docs/prd/epic-5-progress-visualization.md`

---

## Epic 6: AI Coaching (Weave AI Page) ❌ SIMPLIFIED

**Priority:** 🎯 **CRITICAL** - Your differentiator
**Total:** 24 story points → **13 pts MVP**
**Status:** ❌ Not started

### MVP Stories (Simplified)

- [ ] US-6.1: Access AI Chat (5 pts) 🎯 **DIFFERENTIATOR**
- [ ] US-6.2: Contextual AI Responses (8 pts) 🎯 **COMPETITIVE MOAT**

### Skipped for MVP

- [ ] ~~US-6.3: Edit AI Chat Responses (3 pts)~~ ⏳ Post-MVP
- [ ] ~~US-6.4: AI Weekly Insights (8 pts)~~ ⏳ Post-MVP

### Implementation Checklist

- [ ] Backend API: AI chat router (`/api/ai/chat`)
- [ ] Backend AI: Dream Self Advisor module (contextual coaching)
- [ ] Backend AI: Context Builder (assemble user state)
- [ ] Backend: Rate limiting (10 messages/hour)
- [ ] Frontend: AI chat modal (Siri-style overlay)
- [ ] Frontend: Message bubbles with streaming responses
- [ ] Frontend: Quick action chips ("Plan my day", "I'm stuck")
- [ ] Frontend: Chat history storage

**Reference:** `docs/pages/weave-ai-page.md` + `docs/prd/epic-6-ai-coaching.md`

---

## Epic 7: Notifications ⏳ POST-MVP (ENTIRE EPIC)

**Priority:** ⏳ **LOW** - Ship UI only, disable notifications
**Total:** 23 story points
**Status:** ⏳ Deferred to post-MVP

### What to Ship for MVP

- [ ] US-7.6: Notification Preferences (UI only, all toggles disabled) (5 pts)

### Deferred to Post-MVP

- [ ] ~~US-7.1: Morning Intention~~ ⏳ Post-launch
- [ ] ~~US-7.2: Bind Reminders~~ ⏳ Post-launch
- [ ] ~~US-7.3: Evening Reflection Prompt~~ ⏳ Post-launch
- [ ] ~~US-7.4: Streak Recovery~~ ⏳ Post-launch

**Rationale:** Notifications require APNs setup/testing. Can enable via feature flag post-launch.

**Reference:** `docs/pages/profile-settings.md` + `docs/prd/epic-7-notifications.md`

---

## Epic 8: Settings & Profile ❌ SIMPLIFIED

**Priority:** 🎯 **REQUIRED** - GDPR compliance
**Total:** 18 story points → **10 pts MVP**
**Status:** ❌ Not started

### MVP Stories (Simplified)

- [ ] US-8.1: Profile Overview (3 pts)
- [ ] US-8.3: General Settings (5 pts) 🎯 **GDPR: Data export, delete account**
- [ ] US-8.6: Logout and Account Security (2 pts)

### Skipped for MVP

- [ ] ~~US-8.4: Subscription Management (5 pts)~~ ⏳ Free tier only, no upgrade flow
- [ ] ~~US-8.5: Help and Support (3 pts)~~ ⏳ Post-MVP

### Implementation Checklist

- [ ] Backend API: User profile endpoints (`/api/users/me`, `/api/users/export`, `/api/users/delete`)
- [ ] Frontend: Profile overview screen (iOS Settings.app style)
- [ ] Frontend: General settings (data export, delete account)
- [ ] Frontend: Logout confirmation
- [ ] Frontend: Delete account multi-step confirmation

**Reference:** `docs/pages/profile-settings.md` + `docs/prd/epic-8-settings-profile.md`

---

## Current Sprint Focus

### This Week (2025-12-23 to 2025-12-29)

**Goal:** Complete Dashboard Page (Epic 2 + 5)

**Priority Tasks:**
1. [ ] Epic 2: Goal Management (24 pts)
   - Backend: Goals API + AI goal breakdown
   - Frontend: Goals list, detail, create, edit, archive
2. [ ] Epic 5: Progress Viz (18 pts, simplified)
   - Frontend: Dashboard, heat map, fulfillment chart, streak counter

**Stretch Goal:**
3. [ ] Epic 4: Reflection (14 pts, simplified)
   - Backend: Journal API + AI recap/triad
   - Frontend: Reflection screen + AI feedback

---

## Next Sprint Focus

### Following Week (2025-12-30 to 2026-01-05)

**Goal:** Complete AI Coaching Page (Epic 6)

**Priority Tasks:**
1. [ ] Epic 6: AI Coaching (13 pts, simplified)
   - Backend: AI chat API + Dream Self Advisor
   - Frontend: AI chat modal + streaming responses

**Stretch Goal:**
2. [ ] Epic 8: Settings & Profile (10 pts, simplified)
   - Backend: User profile API + data export/delete
   - Frontend: Profile screen + settings

---

## App Store Readiness Checklist

**Target:** End of January 2026

### Core Features
- [ ] Complete Epic 2: Goal Management (24 pts)
- [ ] Complete Epic 3: Daily Actions (18 pts) ✅ Done (pending merge)
- [ ] Complete Epic 4: Reflection (14 pts, simplified)
- [ ] Complete Epic 5: Progress Viz (18 pts, simplified)
- [ ] Complete Epic 6: AI Coaching (13 pts, simplified)
- [ ] Complete Epic 8: Settings (10 pts, simplified)

### AI Features
- [ ] Goal breakdown AI (US-2.3) 🎯 Claude 3.7 Sonnet
- [ ] Daily recap + triad AI (US-4.3) 🎯 GPT-4o-mini
- [ ] AI chat coach (US-6.1, US-6.2) 🎯 Claude 3.7 Sonnet

### Design & UX
- [ ] Complete navigation (Thread, Dashboard, Weave AI tabs)
- [ ] Design system consistency (all screens use components)
- [ ] Empty states handled gracefully
- [ ] Error states with user-friendly messages
- [ ] Loading states with skeletons/spinners
- [ ] Confetti animation on bind completion ✅ Done
- [ ] Affirmation messages ✅ Done

### App Store Requirements
- [ ] Privacy Policy (draft + hosted)
- [ ] Terms of Service (draft + hosted)
- [ ] App Store screenshots (iPhone 15 Pro)
- [ ] App Store description
- [ ] App icon (1024x1024)
- [ ] Data export functionality (GDPR) 🎯 Required
- [ ] Delete account functionality (GDPR) 🎯 Required
- [ ] TestFlight beta testing (10+ users)

### Technical Readiness
- [ ] Production backend deployment (Railway/Fly.io)
- [ ] Production database (Supabase)
- [ ] Environment variables configured
- [ ] Error tracking (Sentry) - Optional
- [ ] Analytics (PostHog) - Optional
- [ ] Rate limiting enforced (AI: 10 calls/hour)
- [ ] Cost monitoring (AI budget: $2,500/month)

---

## Known Blockers

### Critical
- None currently

### Medium
- [ ] Need wireframes for Dashboard page (Epic 2 + 5)
- [ ] Need wireframes for Weave AI page (Epic 6)
- [ ] Need Privacy Policy & Terms of Service copy

### Low
- [ ] Decide on App Store screenshots strategy
- [ ] Finalize app icon design

---

## Notes

### 2025-12-23
- Created project management tracking system
- Identified 97 story points for MVP (down from 138 full scope)
- Epic 3 (Thread flow) complete in `thread-flow` branch, ready to merge
- Next focus: Epic 2 (Goal Management) + Epic 5 (Progress Visualization) → Dashboard Page

---

## Update Log

**How to Update This File:**

When you complete a story, change:
```markdown
- [ ] US-2.1: View Goals List (3 pts)
```

To:
```markdown
- [x] US-2.1: View Goals List (3 pts) ✅ 2025-12-23
```

Update the overall progress percentage at the top.

---

**Last Updated:** 2025-12-23
**Next Review:** 2025-12-30

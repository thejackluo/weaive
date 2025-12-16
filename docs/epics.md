---
stepsCompleted: [1, 2]
inputDocuments:
  - docs/prd.md
  - docs/architecture.md
  - docs/ux-design.md
workflowType: 'create-epics-and-stories'
project_name: 'Weave'
created: '2025-12-16'
status: 'in_progress'
last_updated: '2025-12-16'
---

# Weave - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Weave, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Terminology Reference

| MVP Term (User-Facing) | Technical Term (Internal) | Description |
|------------------------|---------------------------|-------------|
| **Needle** | Goal | Top-level user goal (max 3 active) |
| **Bind** | Subtask | Consistent daily action/habit toward a goal |
| **Thread** | User/Identity | User's starting state and identity profile |
| **Weave** | Progress/Stats | User's evolved state, consistency metrics, dashboard |
| **Proof** | Capture | Evidence of bind completion (photo, note, timer) |
| **Triad** | Daily Plan | AI-generated top 3 recommended binds for the day |
| **Reflection** | Journal Entry | Daily check-in with fulfillment score |
| **Q-Goal** | Quantifiable Goal | *Internal only* - measurable subgoals with metrics (not user-facing in edit UI) |

**Convention:** Use MVP terms in user-facing UI. Technical terms in code/database. This document uses both for clarity.

## Design Principles

**Magical & Delightful Experience:** All interactions should feel magical and delightful. Animations should be purposeful and create moments of joy. The app experience should feel distinctly different from typical productivity apps - more like a companion that genuinely cares about your growth.

## Requirements Inventory

### Functional Requirements

**Epic 1: Onboarding & Identity (33 pts)**
- FR-1.1: Welcome Screen - Display engaging welcome with Weave logo, slogan ("See who you're becoming"), value proposition, and Get Started CTA (M)
- FR-1.2: Demographics Collection - Collect user type, timezone (auto-detect), preferred working hours with progress indicator (M)
- FR-1.3: Archetype Assessment - Present 6-8 questions, categorize into archetype, display result with description, allow retake (M)
- FR-1.4: Dream Self Definition - Text input for ideal future self (200-500 chars), prompt suggestions, editable later in profile (M)
- FR-1.5: Motivation and Constraints - Select motivation drivers, failure mode, optional time/energy constraints. **Note:** Initial direct input PLUS AI observes and refines these over time based on user behavior patterns (S)
- FR-1.6: First Needle/Goal Setup (AI-Assisted) - Input goal (Needle), probing questions ("Why is this important?"), AI generates goal breakdown with suggested Binds (subtasks), all editable. Q-Goals are internal and not shown in edit UI (M)
- FR-1.7: First Commitment - Display summary of Needle + first 3 Binds, hold-to-commit interaction, trigger push permission request, complete onboarding (M)
- FR-1.8: App Tutorial - 3-4 screen tutorial showing core features (Thread, Bind completion, Daily check-in, Weave dashboard). **Important:** Emphasizes this is a differentiated experience, not just another habit app. Skippable but encouraged (M - upgraded from C)
- FR-1.9: Soft Paywall - Present subscription options after onboarding completion, before entering main app. Show value proposition, allow skip to free tier. Payment integration with App Store (M - NEW)

**Epic 2: Needle/Goal Management (27 pts)**
- FR-2.1: View Needles List - Display up to 3 active Needles (goals) with status, consistency %, Bind count, tap to expand (M)
- FR-2.2: View Needle Details - Full Needle info with associated Binds (subtasks), stats (completion rate, streak), edit/archive/add bind actions. Q-Goals are internal metrics not shown in edit UI (M)
- FR-2.3: Create New Needle (AI-Assisted) - Text input for new Needle, probing questions, AI-generated Bind suggestions, enforce max 3 active Needles (M)
- FR-2.4: Edit Needle - Edit title, description, "why it matters". Add/remove/edit Binds. **Change warning:** Thoughtfully balanced - makes user pause and confirm intent without creating friction. Options: require brief justification text, or show impact summary ("This will affect your 12-day streak tracking") (M)
- FR-2.5: Archive Needle - Confirmation dialog, archive status, visible in history (read-only), reactivate option if <3 active Needles (M)
- FR-2.6: Needle Change Strictness - Three modes (Normal/Strict/None) configurable in settings. Normal = justification text, Strict = requires daily reflection first, None = free changes (S)

**Epic 3: Daily Actions & Proof (38 pts)**
- FR-3.1: View Today's Binds (Thread Home) - Today's Binds (subtasks) grouped by Needle (goal), collapsible dropdowns, completion status indicators. Answers "What should I do today?" in <10 seconds (M)
- FR-3.2: View Triad (AI Daily Plan) - Top 3 AI-recommended Binds with rationale ("Why this bind"). **Note:** Triad IS the prioritized subset of Binds - they are the same entity type, just AI-ranked. Editable/dismissible by user (M)
- FR-3.3: Start and Complete Bind - Tap Bind to open Bind Screen showing Needle context, Bind details, "Start Bind" button. Timer option available. Complete with **magical, delightful confetti animation**. Entire flow <30 seconds (M)
- FR-3.4: Attach Proof to Bind - After completion, prompt: "Add proof?" Options: photo capture, quick note (280 char), timer auto-attached. Optional skip (trust-based). Proof creation <10 seconds (M)
- FR-3.5: Quick Capture (Document) - Floating menu access, fast capture sheet for photo/note/voice. Optional link to specific Bind. If nothing captured today: "What's one thing you want to remember?" (M)
- FR-3.6: Timer Tracking (Pomodoro-style) - **Pomodoro-feel timer experience**: Set duration upfront (25 min default, customizable), focus mode UI, subtle progress visualization, satisfying completion moment. Duration auto-attached as proof (S)
- FR-3.7: Dual Path Visualization - Show positive/negative trajectories based on user's current patterns. **Two components:** (1) Visual representation (animated paths diverging), (2) AI-generated personalized text from Tech Context Engine describing where each path leads. Triggered when user expresses difficulty or doubt (C)

**Epic 4: Reflection & Journaling (28 pts)**
- FR-4.1: Daily Reflection Entry - **Default 2 reflection questions** ("How do you feel about today?", "What's one thing for tomorrow?") + **user-customizable questions** (add/edit/remove custom tracking questions). Fulfillment slider (1-10). Submit triggers AI batch for feedback and next day's Triad (M)
- FR-4.2: Recap Before Reflection - Summary of today's completed Binds, Captures created, time tracked before showing reflection questions (S)
- FR-4.3: AI Feedback Generation - Loading state ("Weave is reflecting..."), generate within 20s: Affirming insight, Blocker insight (if detected), Next-day Triad. Display as 3 stacked cards (M)
- FR-4.4: Edit AI Feedback - Each insight card has "Edit" and "Not true" actions. Corrections stored for AI improvement. Edited artifacts marked with flag (M)
- FR-4.5: View Past Journal Entries - List by date, tap to view full reflection + AI feedback, filter by timeframe (7/30/90 days) (S)

**Epic 5: Progress Visualization (Weave Dashboard) (39 pts)**
- FR-5.1: Weave Dashboard Overview - **Emotional Mirror** (top): Weave level/rank visualization, active Needles summary, Dream Self reminder. **Data Mirror** (bottom): consistency %, fulfillment chart. AI weekly insights displayed (M)
- FR-5.2: Consistency Heat Map - **GitHub-style contribution graph**. Color intensity = completion percentage (not binary). Filter by: timeframe (7/30/60/90 days), specific Needle, specific Bind type. Tap date to navigate to that day's entry (M)
- FR-5.3: Fulfillment Trend Chart - Line chart of fulfillment score (1-10) over time, 7-day rolling average smoothed line, tap point to navigate to entry (M)
- FR-5.4: Weave Character Progression - **Mathematical curve visualization** that increases in complexity and intricacy as user progresses. Starts simple (thread), becomes more intertwined and beautiful (weave). Based on: total Binds completed, current streak, consistency %. Milestone-based level names: Thread → Strand → Cord → Braid → Weave (S)
- FR-5.5: Streak Tracking - Current and longest streak display, streak resilience metric (recovery rate), streak freeze: 3 consecutive days recovers 1 missed day (M)
- FR-5.6: Badge System - Milestone triggers (7/10/30 day streaks, 10/50/100 Binds, first Needle archived, first Proof). Displayed in profile, shareable badge cards (S)
- FR-5.7: Day 10 Snapshot (Shareable) - "Before vs After" summary at 10 active days: consistency score, rank achieved, badges, top 3 wins (AI-selected), identity shift summary. Shareable card format. Also at 30/60/90 days (S)

**Epic 6: AI Coaching (Dream Self Advisor) (29 pts)**
- FR-6.1: Access AI Chat - Floating menu → "Talk to Weave". Chat interface with message bubbles. Contextual opening prompt (not blank). Quick chips: "Plan my day", "I'm stuck", "Edit my Needle", "Explain this Bind". Streaming response (M)
- FR-6.2: Contextual AI Responses - AI references: current Needles and progress, recent completions and Captures, fulfillment scores and trends, Identity doc (archetype, Dream Self), past wins. Dream Self voice (from personality document). Evidence-based, no generic advice. Rate limited: 10 messages/hour (M)
- FR-6.3: Edit AI Chat Responses - Long-press AI message → "Edit" or "Not helpful". Corrections stored for feedback loop. Regenerate option (S)
- FR-6.4: AI Weekly Insights - Generated weekly (Sunday night per timezone). Pattern insights ("You skip gym on Fridays"), success correlations ("Morning Binds = higher fulfillment"), trajectory predictions. Dismissible/markable as helpful (S)
- FR-6.5: AI Needle Suggestions - After archiving a Needle, AI suggests related Needles based on user's interests and patterns. Accept/modify/dismiss (C)

**Epic 7: Notifications & Engagement (28 pts)**
- FR-7.1: Morning Intention Notification - Sent at user's preferred start time. Content: Today's Triad (top 3 Binds), yesterday's intention recap. Dream Self voice. Deep link to Thread. Disableable (M)
- FR-7.2: Bind Reminder Notifications - Escalation strategy: (1) Gentle: "Ready to knock out your gym session?", (2) Contextual: "You usually feel great after workouts", (3) Accountability: "Your 27-day streak is on the line". Max 3 per Bind per day. Deep link to specific Bind Screen (M)
- FR-7.3: Evening Reflection Prompt - Sent at wind-down time if journal not submitted. "How did today go? Weave is ready to reflect with you." Deep link to Daily Reflection (M)
- FR-7.4: Streak Recovery Notification - After 24-48h inactivity. Compassionate, not shame-based. Reference specific Needles and past wins. Easy re-entry: "Just log ONE Bind today" (M)
- FR-7.5: Milestone Celebration Notification - At 10/30/60/90 active days, badge unlocks, Needle completions. Share option for milestone snapshot (S)
- FR-7.6: Notification Preferences - Nudging intensity slider (1-10), quiet hours (start/end time), per-notification toggles, max 5 notifications/day enforced. **Note:** MVP uses push notifications. Future roadmap: SMS/text messaging integration (M)

**Epic 8: Settings & Profile (23 pts)**
- FR-8.1: Profile Overview - Name, email, profile photo (optional). Quick links to: Identity Document, Notification Preferences, App Settings, Help/Support, Logout (M)
- FR-8.2: Edit Identity Document - View/edit: Archetype (retake option), Dream Self description, Motivations, Failure mode, Coaching preference slider (gentle ↔ strict), Constraints. Each edit creates new version. AI uses latest version (M)
- FR-8.3: General Settings - Timezone (auto-detect with override), preferred working hours, Needle change strictness mode, nudging intensity, data export (JSON), delete account (with confirmation, soft delete 30 days) (M)
- FR-8.4: Subscription Management - Show current plan (Free/Pro/Max), features by tier, upgrade CTA with pricing, link to App Store subscription management. Free: 1 Needle, limited AI. Pro $12/mo: 3 Needles, unlimited AI. Max $24/mo: 5 Needles, priority support (M)
- FR-8.5: Help and Support - FAQ section, contact support (email), rate app prompt (after 7 active days), version number (S)
- FR-8.6: Logout and Security - Logout with confirmation, clear local session, redirect to login. Re-authentication required for sensitive actions (delete account) (M)

### Non-Functional Requirements

**Performance (NFR-P)**
- NFR-P1: App launch time <3 seconds (M)
- NFR-P2: Thread (Home) load time <1 second (M)
- NFR-P3: Bind completion response <500ms (M)
- NFR-P4: AI chat response (streaming start) <3 seconds (M)
- NFR-P5: AI batch job completion <30 seconds (M)
- NFR-P6: Image upload time <5 seconds for 10MB max (S)
- NFR-P7: Heat map render time <1 second (S)

**Scalability (NFR-S)**
- NFR-S1: Support 10,000 concurrent users (M)
- NFR-S2: Handle 1,000 database queries/second (M)
- NFR-S3: Process 5,000 AI requests/hour system-wide (M)
- NFR-S4: Max 500MB storage per user (S)

**Availability (NFR-A)**
- NFR-A1: 99.5% system uptime (M)
- NFR-A2: Planned maintenance window <4 hours/month (S)
- NFR-A3: Unplanned downtime recovery <1 hour (S)

**Usability (NFR-U)**
- NFR-U1: Onboarding completion rate >70% (M)
- NFR-U2: Bind completion time <30 seconds (M)
- NFR-U3: Capture creation time <10 seconds (M)
- NFR-U4: Answer "What should I do?" <10 seconds (M)
- NFR-U5: Accessibility WCAG 2.1 Level AA (S)

**Reliability (NFR-R)**
- NFR-R1: Zero data loss tolerance (M)
- NFR-R2: 100% completion event persistence (M)
- NFR-R3: API error rate <0.1% (M)
- NFR-R4: Mobile crash rate <1% (M)

**Compatibility (NFR-C)**
- NFR-C1: iOS 15+ version support (M)
- NFR-C2: iPhone X and newer models (M)
- NFR-C3: Screen sizes 5.8" - 6.7" (M)
- NFR-C4: Offline mode with basic read access (S)

**AI Cost Control (AI-C)**
- AI-C1: AI cost per free user/month <$0.10 (M)
- AI-C2: AI cost per Pro user/month <$0.50 (M)
- AI-C3: AI cost per Max user/month <$1.50 (M)
- AI-C4: Cache hit rate >80% (M)
- AI-C5: Chat rate limit 10 messages/hour per user (M)

**AI Safety (AI-S)**
- AI-S1: Prompt injection detection and prevention (M)
- AI-S2: No harmful content generation (M)
- AI-S3: Evidence grounding - no invented facts (M)
- AI-S4: User data privacy in prompts (M)

**Security - Authentication (SEC-A)**
- SEC-A1: Supabase Auth with email + OAuth (M)
- SEC-A2: JWT token expiration 7 days (M)
- SEC-A3: Refresh token rotation (M)

**Security - Authorization (SEC-Z)**
- SEC-Z1: Row Level Security (RLS) on all user tables (M)
- SEC-Z2: Users can only access own data (M)
- SEC-Z3: API endpoint authorization (M)

**Security - Data Protection (SEC-D)**
- SEC-D1: Data encrypted at rest (M)
- SEC-D2: Data encrypted in transit (TLS 1.3) (M)
- SEC-D3: PII encryption (M)
- SEC-D4: Supabase Storage security with signed URLs (M)

**Security - Input Validation (SEC-I)**
- SEC-I1: Input sanitization (XSS prevention) (M)
- SEC-I2: SQL injection prevention (parameterized queries) (M)
- SEC-I3: File upload validation (type: JPEG/PNG, size: 10MB max) (M)
- SEC-I4: Rate limiting on all endpoints (M)

**Privacy (PRI)**
- PRI-1: Privacy policy link in app (M)
- PRI-2: GDPR compliance for EU users (M)
- PRI-3: Data export capability (JSON) (M)
- PRI-4: Account deletion capability (M)
- PRI-5: Analytics opt-out option (S)

### Additional Requirements

**From Architecture Document:**

*Project Initialization:*
- Initialize mobile app using `npx create-expo-app` with blank-typescript template
- Initialize backend using `uv init` with FastAPI, uvicorn, supabase, openai, anthropic
- Use Expo SDK 53, React Native 0.79, React 19, Expo Router v5
- Use Python 3.11+, FastAPI 0.115+

*Infrastructure:*
- Supabase for authentication, PostgreSQL database, and file storage
- FastAPI backend deployed on Railway
- Expo Push for iOS APNs notifications (SMS in future roadmap)
- No job queue for MVP (sync calls), add Redis/BullMQ at 1K+ users

*Styling & State Management:*
- NativeWind (Tailwind CSS for React Native) for styling
- TanStack Query for server state management with 5-minute staleTime
- Zustand for shared UI state only
- useState for component-local state

*Data Patterns:*
- Immutable `subtask_completions` table (append-only, never UPDATE/DELETE)
- Soft delete pattern with `deleted_at` timestamp
- snake_case for database columns and API parameters
- PascalCase for React components and files
- API response format: `{data, error, meta}`
- Transform snake_case ↔ camelCase at API boundary only

*AI Strategy:*
- GPT-4o-mini for routine operations (90% of calls) - triad, recap, chat
- Claude 3.7 Sonnet for complex operations - onboarding, Dream Self
- AI fallback chain: OpenAI → Anthropic → Deterministic
- Cost tracking with daily budget alerts ($83.33/day for $2,500/month)
- Auto-throttle to cache-only mode at 100% daily budget
- **Tech Context Engine** provides AI with user context for personalized responses

*Offline Support:*
- TanStack Query persistence to AsyncStorage
- `networkMode: 'offlineFirst'` for queries and mutations
- Optimistic updates with rollback on error
- Connectivity detection with NetInfo
- Offline banner UI component
- Sync on reconnect with `invalidateQueries()`

*RLS Requirement:*
- **CRITICAL**: RLS policies must be implemented in Sprint 1 before alpha release

*Database Schema (8 Core Tables):*
- user_profiles, identity_docs, goals, subtask_templates
- subtask_instances, subtask_completions, captures, journal_entries

**From UX Design Document:**

*Interaction Timing:*
- Complete a Bind in <30 seconds
- Document a Capture in <10 seconds
- Onboarding total <5 minutes
- Archetype assessment <2 minutes
- App tutorial <1 minute

*Design System:*
- Primary color: #3B72F6 (action)
- Amber #FBBF24 (highlight/celebration)
- Violet #A78BFA (AI accent)
- Heat map gradient for consistency visualization (GitHub-style)
- Weave gradient for character progression (thread → strand → cord → braid → weave)

*Accessibility:*
- WCAG 2.1 Level AA compliance
- SF Pro system font family
- 16px base font size
- Minimum touch targets
- Screen reader support

*Animation & Delight:*
- **Magical, delightful animations** throughout the experience
- Confetti on Bind completion (classy, celebratory)
- Smooth transitions between screens
- Loading states for AI operations
- Pomodoro timer with satisfying visual progress
- Mathematical curve visualization increasing in complexity

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR-1.1 | Epic 1 | Welcome Screen |
| FR-1.2 | Epic 1 | Demographics Collection |
| FR-1.3 | Epic 1 | Archetype Assessment |
| FR-1.4 | Epic 1 | Dream Self Definition |
| FR-1.5 | Epic 1 | Motivation and Constraints |
| FR-1.6 | Epic 1 | First Needle/Goal Setup (AI) |
| FR-1.7 | Epic 1 | First Commitment |
| FR-1.8 | Epic 1 | App Tutorial |
| FR-1.9 | Epic 1 | Soft Paywall |
| FR-2.1 | Epic 2 | View Needles List |
| FR-2.2 | Epic 2 | View Needle Details |
| FR-2.3 | Epic 2 | Create New Needle (AI) |
| FR-2.4 | Epic 2 | Edit Needle |
| FR-2.5 | Epic 2 | Archive Needle |
| FR-2.6 | Epic 2 | Needle Change Strictness |
| FR-3.1 | Epic 3 | View Today's Binds (Thread Home) |
| FR-3.2 | Epic 3 | View Triad (AI Daily Plan) |
| FR-3.3 | Epic 3 | Start and Complete Bind |
| FR-3.4 | Epic 3 | Attach Proof to Bind |
| FR-3.5 | Epic 3 | Quick Capture |
| FR-3.6 | Epic 3 | Timer Tracking (Pomodoro) |
| FR-3.7 | Epic 3 | Dual Path Visualization |
| FR-4.1 | Epic 4 | Daily Reflection Entry |
| FR-4.2 | Epic 4 | Recap Before Reflection |
| FR-4.3 | Epic 4 | AI Feedback Generation |
| FR-4.4 | Epic 4 | Edit AI Feedback |
| FR-4.5 | Epic 4 | View Past Journal Entries |
| FR-5.1 | Epic 5 | Weave Dashboard Overview |
| FR-5.2 | Epic 5 | Consistency Heat Map |
| FR-5.3 | Epic 5 | Fulfillment Trend Chart |
| FR-5.4 | Epic 5 | Weave Character Progression |
| FR-5.5 | Epic 5 | Streak Tracking |
| FR-5.6 | Epic 5 | Badge System |
| FR-5.7 | Epic 5 | Day 10 Snapshot |
| FR-6.1 | Epic 6 | Access AI Chat |
| FR-6.2 | Epic 6 | Contextual AI Responses |
| FR-6.3 | Epic 6 | Edit AI Chat Responses |
| FR-6.4 | Epic 6 | AI Weekly Insights |
| FR-6.5 | Epic 6 | AI Needle Suggestions |
| FR-7.1 | Epic 7 | Morning Intention Notification |
| FR-7.2 | Epic 7 | Bind Reminder Notifications |
| FR-7.3 | Epic 7 | Evening Reflection Prompt |
| FR-7.4 | Epic 7 | Streak Recovery Notification |
| FR-7.5 | Epic 7 | Milestone Celebration Notification |
| FR-7.6 | Epic 7 | Notification Preferences |
| FR-8.1 | Epic 8 | Profile Overview |
| FR-8.2 | Epic 8 | Edit Identity Document |
| FR-8.3 | Epic 8 | General Settings |
| FR-8.4 | Epic 8 | Subscription Management |
| FR-8.5 | Epic 8 | Help and Support |
| FR-8.6 | Epic 8 | Logout and Security |

**Coverage Summary:** 51 FRs → 8 Epics (100% coverage)

---

## Epic List

### Epic 1: Onboarding & Identity (35 pts)
**User Outcome:** New users can set up their identity profile, complete their first Needle (goal) with AI assistance, and start their 10-day journey.

**FRs Covered:** FR-1.1, FR-1.2, FR-1.3, FR-1.4, FR-1.5, FR-1.6, FR-1.7, FR-1.8, FR-1.9

**Why This Epic First:** Users cannot do anything without completing onboarding. This establishes identity, first goal, and payment - the foundation for everything else.

---

### Epic 2: Needle/Goal Management (27 pts)
**User Outcome:** Users can create, view, edit, and archive their Needles (goals), with AI assistance for breakdown. Max 3 active Needles enforced.

**FRs Covered:** FR-2.1, FR-2.2, FR-2.3, FR-2.4, FR-2.5, FR-2.6

**Why This Order:** After onboarding, users need to manage their goals before they can complete daily actions.

---

### Epic 3: Daily Actions & Proof (38 pts)
**User Outcome:** Users can complete daily Binds (tasks), capture proof, and use the Pomodoro timer. This is the core action loop driving the North Star metric.

**FRs Covered:** FR-3.1, FR-3.2, FR-3.3, FR-3.4, FR-3.5, FR-3.6, FR-3.7

**Why This Order:** The daily action loop is the heart of the product. Users need this to make progress toward their Needles.

---

### Epic 4: Reflection & Journaling (28 pts)
**User Outcome:** Users can complete daily reflections, receive AI feedback, and get their next day's Triad. This triggers the AI batch operations.

**FRs Covered:** FR-4.1, FR-4.2, FR-4.3, FR-4.4, FR-4.5

**Why This Order:** Reflection closes the daily loop and generates tomorrow's plan. Depends on having Binds to reflect on.

---

### Epic 5: Progress Visualization (Weave Dashboard) (39 pts)
**User Outcome:** Users can see their progress through the Weave Dashboard, including heat map, fulfillment trends, streak tracking, and the Weave character evolution.

**FRs Covered:** FR-5.1, FR-5.2, FR-5.3, FR-5.4, FR-5.5, FR-5.6, FR-5.7

**Why This Order:** Visualization requires accumulated data from daily actions and reflections.

---

### Epic 6: AI Coaching (Dream Self Advisor) (29 pts)
**User Outcome:** Users can chat with their AI coach (Dream Self Advisor) for personalized guidance, receive weekly insights, and get goal suggestions.

**FRs Covered:** FR-6.1, FR-6.2, FR-6.3, FR-6.4, FR-6.5

**Why This Order:** AI coaching benefits from having user context (completions, reflections, patterns) to provide personalized responses.

---

### Epic 7: Notifications & Engagement (28 pts)
**User Outcome:** Users receive timely notifications (morning intention, bind reminders, evening reflection, streak recovery) to stay engaged.

**FRs Covered:** FR-7.1, FR-7.2, FR-7.3, FR-7.4, FR-7.5, FR-7.6

**Why This Order:** Notifications are engagement layer on top of core functionality. Can be developed in parallel with other epics.

---

### Epic 8: Settings & Profile (23 pts)
**User Outcome:** Users can manage their profile, edit identity document, configure settings, manage subscription, and get help.

**FRs Covered:** FR-8.1, FR-8.2, FR-8.3, FR-8.4, FR-8.5, FR-8.6

**Why This Order:** Settings and profile management are supporting features that enhance the core experience.

---

## Epic Summary Table

| Epic | Name | Story Points | Priority FRs (M) | Dependencies |
|------|------|--------------|------------------|--------------|
| 1 | Onboarding & Identity | 35 | 8 | None (Foundation) |
| 2 | Needle/Goal Management | 27 | 5 | Epic 1 |
| 3 | Daily Actions & Proof | 38 | 5 | Epic 1, 2 |
| 4 | Reflection & Journaling | 28 | 3 | Epic 1, 2, 3 |
| 5 | Progress Visualization | 39 | 3 | Epic 1, 2, 3, 4 |
| 6 | AI Coaching | 29 | 2 | Epic 1, 2, 3, 4 |
| 7 | Notifications | 28 | 5 | Epic 1, 2, 3 |
| 8 | Settings & Profile | 23 | 5 | Epic 1 |

**Total:** 247 story points across 51 FRs

---

## Epic Dependency Flow

```
Epic 1 (Onboarding) ─────┬──────────────────────────────────────────┐
                         │                                          │
                         ▼                                          ▼
                    Epic 2 (Goals)                            Epic 8 (Settings)
                         │
                         ▼
                    Epic 3 (Daily Actions) ◄───── Epic 7 (Notifications)
                         │                              (can parallel)
                         ▼
                    Epic 4 (Reflection)
                         │
                         ├──────────────────┐
                         ▼                  ▼
                    Epic 5 (Progress)  Epic 6 (AI Coach)
```

**Key Principle:** Each epic is standalone and enables future epics without requiring them to function.

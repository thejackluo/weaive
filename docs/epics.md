---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - docs/prd.md
  - docs/architecture.md
  - docs/ux-design.md
workflowType: 'create-epics-and-stories'
project_name: 'Weave'
created: '2025-12-16'
status: 'complete'
last_updated: '2025-12-16'
party_mode_review: true
party_mode_feedback_integrated: true
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
| FR-0.1 | Epic 0 | Project Scaffolding (Mobile + API) |
| FR-0.2 | Epic 0 | Supabase Setup + Database Migrations |
| FR-0.3 | Epic 0 | Authentication Flow (Supabase Auth) |
| FR-0.4 | Epic 0 | Row Level Security (RLS) Policies |
| FR-0.5 | Epic 0 | CI/CD Pipeline Setup |
| FR-0.6 | Epic 0 | AI Service Abstraction Layer |
| FR-0.7 | Epic 0 | Test Infrastructure Setup |
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

**Coverage Summary:** 58 FRs → 9 Epics (100% coverage)

---

## Epic List

### Epic 0: Foundation (25 pts)
**User Outcome:** Development team has a fully scaffolded, secure, and testable codebase with authentication, database, and AI infrastructure ready for feature development.

**FRs Covered:** FR-0.1, FR-0.2, FR-0.3, FR-0.4, FR-0.5, FR-0.6, FR-0.7

**Why This Epic First:** No features can be built without project scaffolding, database setup, authentication, and security policies. This is the true foundation that enables all other epics.

**Stories:**
- **Story 0.1: Project Scaffolding** (5 pts) - Initialize Expo app (SDK 53, React Native 0.79) and FastAPI backend (Python 3.11+, uv init)
- **Story 0.2: Supabase Setup** (5 pts) - Configure Supabase project, create database schema (8 core tables), run initial migrations
- **Story 0.3: Authentication Flow** (3 pts) - Implement Supabase Auth with email + OAuth, JWT handling, session management
- **Story 0.4: Row Level Security (RLS)** (5 pts) - Implement RLS policies on ALL user-owned tables before alpha release (CRITICAL)
- **Story 0.5: CI/CD Pipeline** (3 pts) - GitHub Actions for linting, type checking, tests; Expo EAS Build for iOS; Railway deploy for API
- **Story 0.6: AI Service Abstraction** (3 pts) - Abstract AI provider layer with fallback chain (OpenAI → Anthropic → Deterministic), cost tracking
- **Story 0.7: Test Infrastructure** (1 pt) - Jest setup for mobile, pytest for API, fixture factories, test database seeding

---

### Epic 1: Onboarding & Identity (35 pts)
**User Outcome:** New users can set up their identity profile, complete their first Needle (goal) with AI assistance, and start their 10-day journey.

**FRs Covered:** FR-1.1, FR-1.2, FR-1.3, FR-1.4, FR-1.5, FR-1.6, FR-1.7, FR-1.8, FR-1.9

**Why This Epic First:** Users cannot do anything without completing onboarding. This establishes identity, first goal, and payment - the foundation for everything else.

**Stories:**
- **Story 1.1: Welcome Screen** (2 pts) - FR-1.1: Display engaging welcome with Weave logo, slogan, value proposition, Get Started CTA
- **Story 1.2: Demographics Collection** (3 pts) - FR-1.2: Collect user type, timezone (auto-detect), preferred working hours with progress indicator
- **Story 1.3: Archetype Assessment** (5 pts) - FR-1.3: Present 6-8 questions, categorize into archetype, display result with description, allow retake
- **Story 1.4: Dream Self Definition** (3 pts) - FR-1.4: Text input for ideal future self (200-500 chars), prompt suggestions, editable later
- **Story 1.5: Motivation and Constraints** (3 pts) - FR-1.5: Select motivation drivers, failure mode, optional constraints
- **Story 1.6a: Goal Input Flow** (3 pts) - FR-1.6 Part 1: Goal text input with character limit, probing question display
- **Story 1.6b: AI Goal Analysis** (5 pts) - FR-1.6 Part 2: AI processes goal with probing answers, generates breakdown
- **Story 1.6c: Bind Suggestions & Editing** (3 pts) - FR-1.6 Part 3: Display AI-generated Binds, allow user editing, confirm selections
- **Story 1.7: First Commitment** (3 pts) - FR-1.7: Display summary, hold-to-commit interaction, trigger push permission
- **Story 1.8: App Tutorial** (2 pts) - FR-1.8: 3-4 screen tutorial showing core features, skippable
- **Story 1.9: Soft Paywall** (3 pts) - FR-1.9: Present subscription options, value proposition, allow skip to free tier

---

### Epic 2: Needle/Goal Management (27 pts)
**User Outcome:** Users can create, view, edit, and archive their Needles (goals), with AI assistance for breakdown. Max 3 active Needles enforced.

**FRs Covered:** FR-2.1, FR-2.2, FR-2.3, FR-2.4, FR-2.5, FR-2.6

**Why This Order:** After onboarding, users need to manage their goals before they can complete daily actions.

**Stories:**
- **Story 2.1: Needles List View** (3 pts) - FR-2.1: Display up to 3 active Needles with status, consistency %, Bind count
- **Story 2.2: Needle Detail View** (5 pts) - FR-2.2: Full Needle info with Binds, stats, edit/archive/add bind actions
- **Story 2.3a: New Needle Input** (3 pts) - FR-2.3 Part 1: Text input, enforce max 3 active Needles, probing questions
- **Story 2.3b: AI Bind Generation** (5 pts) - FR-2.3 Part 2: AI-generated Bind suggestions, user can accept/edit/dismiss
- **Story 2.4: Edit Needle** (5 pts) - FR-2.4: Edit title, description, add/remove Binds with thoughtful change warning
- **Story 2.5: Archive Needle** (3 pts) - FR-2.5: Confirmation dialog, archive status, reactivate option
- **Story 2.6: Change Strictness Settings** (3 pts) - FR-2.6: Normal/Strict/None modes configurable in settings

---

### Epic 3: Daily Actions & Proof (38 pts)
**User Outcome:** Users can complete daily Binds (tasks), capture proof, and use the Pomodoro timer. This is the core action loop driving the North Star metric.

**FRs Covered:** FR-3.1, FR-3.2, FR-3.3, FR-3.4, FR-3.5, FR-3.6, FR-3.7

**Why This Order:** The daily action loop is the heart of the product. Users need this to make progress toward their Needles.

**Stories:**
- **Story 3.1: Thread Home (Today's Binds)** (5 pts) - FR-3.1: Today's Binds grouped by Needle, collapsible, completion status. Answer "What should I do?" in <10s
- **Story 3.2: Triad Display** (5 pts) - FR-3.2: AI-recommended top 3 Binds with rationale, editable/dismissible
- **Story 3.3a: Bind Screen** (3 pts) - FR-3.3 Part 1: Needle context, Bind details, Start Bind button
- **Story 3.3b: Bind Completion** (5 pts) - FR-3.3 Part 2: Complete flow with magical confetti animation, <30s total
- **Story 3.4: Attach Proof** (5 pts) - FR-3.4: Photo capture, quick note, optional skip, <10s creation
- **Story 3.5: Quick Capture** (5 pts) - FR-3.5: Floating menu, fast capture sheet, optional Bind linking
- **Story 3.6: Pomodoro Timer** (5 pts) - FR-3.6: Set duration upfront, focus mode UI, satisfying completion moment
- **Story 3.7: Dual Path Visualization** (5 pts) - FR-3.7: Visual animated paths + AI text from Tech Context Engine

---

### Epic 4: Reflection & Journaling (28 pts)
**User Outcome:** Users can complete daily reflections, receive AI feedback, and get their next day's Triad. This triggers the AI batch operations.

**FRs Covered:** FR-4.1, FR-4.2, FR-4.3, FR-4.4, FR-4.5

**Why This Order:** Reflection closes the daily loop and generates tomorrow's plan. Depends on having Binds to reflect on.

**Stories:**
- **Story 4.1a: Reflection Questions** (3 pts) - FR-4.1 Part 1: Default 2 questions + fulfillment slider (1-10)
- **Story 4.1b: Custom Questions** (3 pts) - FR-4.1 Part 2: User can add/edit/remove custom tracking questions
- **Story 4.2: Recap Before Reflection** (3 pts) - FR-4.2: Summary of completed Binds, Captures, time tracked
- **Story 4.3: AI Feedback Generation** (8 pts) - FR-4.3: Loading state, generate within 20s, display as 3 stacked cards
- **Story 4.4: Edit AI Feedback** (5 pts) - FR-4.4: Edit and "Not true" actions, corrections stored for AI improvement
- **Story 4.5: Journal History** (6 pts) - FR-4.5: List by date, view full reflection + feedback, filter by timeframe

---

### Epic 5: Progress Visualization (Weave Dashboard) (39 pts)
**User Outcome:** Users can see their progress through the Weave Dashboard, including heat map, fulfillment trends, streak tracking, and the Weave character evolution.

**FRs Covered:** FR-5.1, FR-5.2, FR-5.3, FR-5.4, FR-5.5, FR-5.6, FR-5.7

**Why This Order:** Visualization requires accumulated data from daily actions and reflections.

**Stories:**
- **Story 5.1: Dashboard Overview** (5 pts) - FR-5.1: Emotional Mirror (top) + Data Mirror (bottom), AI weekly insights
- **Story 5.2: Consistency Heat Map** (8 pts) - FR-5.2: GitHub-style graph, color intensity by %, filters, tap to navigate
- **Story 5.3: Fulfillment Trend Chart** (5 pts) - FR-5.3: Line chart with 7-day rolling average, tap to navigate
- **Story 5.4: Weave Character** (8 pts) - FR-5.4: Mathematical curve visualization, complexity increases with progress
- **Story 5.5: Streak Tracking** (5 pts) - FR-5.5: Current/longest streak, resilience metric, streak freeze logic
- **Story 5.6: Badge System** (5 pts) - FR-5.6: Milestone triggers, display in profile, shareable badge cards
- **Story 5.7: Day 10 Snapshot** (3 pts) - FR-5.7: Before vs After summary, shareable card format

---

### Epic 6: AI Coaching (Dream Self Advisor) (29 pts)
**User Outcome:** Users can chat with their AI coach (Dream Self Advisor) for personalized guidance, receive weekly insights, and get goal suggestions.

**FRs Covered:** FR-6.1, FR-6.2, FR-6.3, FR-6.4, FR-6.5

**Why This Order:** AI coaching benefits from having user context (completions, reflections, patterns) to provide personalized responses.

**Stories:**
- **Story 6.1: AI Chat Interface** (5 pts) - FR-6.1: Chat interface, contextual opening prompt, quick action chips
- **Story 6.2: Contextual AI Engine** (8 pts) - FR-6.2: AI references user context, Dream Self voice, evidence-based, rate limited
- **Story 6.3: Edit AI Responses** (3 pts) - FR-6.3: Long-press to edit or mark unhelpful, regenerate option
- **Story 6.4: Weekly Insights** (8 pts) - FR-6.4: Generated weekly, pattern insights, success correlations, dismissible
- **Story 6.5: AI Needle Suggestions** (5 pts) - FR-6.5: After archiving, suggest related Needles based on patterns

---

### Epic 7: Notifications & Engagement (28 pts)
**User Outcome:** Users receive timely notifications (morning intention, bind reminders, evening reflection, streak recovery) to stay engaged.

**FRs Covered:** FR-7.1, FR-7.2, FR-7.3, FR-7.4, FR-7.5, FR-7.6

**Why This Order:** Notifications are engagement layer on top of core functionality. Can be developed in parallel with other epics.

**Stories:**
- **Story 7.1: Morning Intention** (5 pts) - FR-7.1: Today's Triad, yesterday recap, Dream Self voice, deep link
- **Story 7.2: Bind Reminders** (5 pts) - FR-7.2: Escalation strategy (gentle → contextual → accountability), max 3/day
- **Story 7.3: Evening Reflection Prompt** (3 pts) - FR-7.3: Sent at wind-down time if journal not submitted
- **Story 7.4: Streak Recovery** (5 pts) - FR-7.4: After 24-48h inactivity, compassionate, reference past wins
- **Story 7.5: Milestone Celebration** (5 pts) - FR-7.5: At 10/30/60/90 days, badge unlocks, share option
- **Story 7.6: Notification Preferences** (5 pts) - FR-7.6: Intensity slider, quiet hours, per-notification toggles, max 5/day

---

### Epic 8: Settings & Profile (23 pts)
**User Outcome:** Users can manage their profile, edit identity document, configure settings, manage subscription, and get help.

**FRs Covered:** FR-8.1, FR-8.2, FR-8.3, FR-8.4, FR-8.5, FR-8.6

**Why This Order:** Settings and profile management are supporting features that enhance the core experience.

**Stories:**
- **Story 8.1: Profile Overview** (3 pts) - FR-8.1: Name, email, photo, quick links to settings sections
- **Story 8.2: Edit Identity Document** (5 pts) - FR-8.2: View/edit archetype, Dream Self, motivations, coaching preference
- **Story 8.3: General Settings** (5 pts) - FR-8.3: Timezone, working hours, change strictness, data export, delete account
- **Story 8.4: Subscription Management** (5 pts) - FR-8.4: Current plan, tier features, upgrade CTA, App Store link
- **Story 8.5: Help and Support** (2 pts) - FR-8.5: FAQ, contact support, rate app prompt, version number
- **Story 8.6: Logout and Security** (3 pts) - FR-8.6: Logout with confirmation, re-auth for sensitive actions

---

## Epic Summary Table

| Epic | Name | Story Points | Priority FRs (M) | Dependencies |
|------|------|--------------|------------------|--------------|
| 0 | Foundation | 25 | 7 | None (True Foundation) |
| 1 | Onboarding & Identity | 35 | 8 | Epic 0 |
| 2 | Needle/Goal Management | 27 | 5 | Epic 0, 1 |
| 3 | Daily Actions & Proof | 38 | 5 | Epic 0, 1, 2 |
| 4 | Reflection & Journaling | 28 | 3 | Epic 0, 1, 2, 3 |
| 5 | Progress Visualization | 39 | 3 | Epic 0, 1, 2, 3, 4 |
| 6 | AI Coaching | 29 | 2 | Epic 0, 1, 2, 3, 4 |
| 7 | Notifications | 28 | 5 | Epic 0, 1, 2, 3 |
| 8 | Settings & Profile | 23 | 5 | Epic 0, 1 |

**Total:** 272 story points across 58 FRs

---

## Epic Dependency Flow

```
                    Epic 0 (Foundation)
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
     Epic 1 (Onboarding)   │          Epic 8 (Settings)
          │                │
          ▼                │
     Epic 2 (Goals) ◄──────┘
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

**Key Principles:**
- Epic 0 is the TRUE foundation - scaffolding, database, auth, RLS, CI/CD, AI abstraction
- Each epic is standalone and enables future epics without requiring them to function
- Cross-cutting concerns (empty states, error handling, delight) are woven through each epic

---

## Cross-Cutting Concerns

These concerns apply across ALL epics and should be addressed within each feature implementation rather than as separate epics.

### Empty States (UX-E)
Every screen that can be empty must have a thoughtful, encouraging empty state.

| ID | Screen | Empty State Message | CTA |
|----|--------|---------------------|-----|
| UX-E1 | Thread (Today's Binds) | "No binds yet for today. Let's set up your first Needle!" | Create Needle |
| UX-E2 | Needles List | "You haven't set any goals yet. What do you want to achieve?" | Create First Needle |
| UX-E3 | Captures Gallery | "No memories captured yet. Document your wins!" | Quick Capture |
| UX-E4 | Journal History | "Your reflection journey starts today" | Start Reflection |
| UX-E5 | Heat Map (new user) | "Complete your first bind to start building your weave" | View Today's Binds |
| UX-E6 | AI Chat | "I'm here to help. Ask me anything about your goals" | Suggested chips |

**Implementation:** Each story with a list view MUST include acceptance criteria for empty state handling.

### Error & Fallback UX (UX-F)
Graceful degradation for all failure scenarios.

| ID | Scenario | User Message | Fallback Behavior |
|----|----------|--------------|-------------------|
| UX-F1 | Network offline | "You're offline. Some features are limited." | Show cached data, disable mutations |
| UX-F2 | AI service down | "Weave is thinking... Taking longer than usual." | Retry 3x, then show deterministic fallback |
| UX-F3 | AI rate limited | "Let's take a breather. More AI help in X minutes." | Show countdown, suggest manual actions |
| UX-F4 | Upload failed | "Couldn't save your photo. Retry?" | Queue for retry, allow skip |
| UX-F5 | Auth token expired | Silent refresh; if fails: "Please sign in again" | Redirect to login |
| UX-F6 | Server 500 | "Something went wrong. We're on it!" | Log to Sentry, show retry button |

**AI Fallback Chain:**
1. Primary: GPT-4o-mini (or Claude for complex ops)
2. Secondary: Alternative provider
3. Tertiary: Deterministic/template-based response

**Implementation:** All API calls must have error boundaries with appropriate fallback UI.

### Delight Moments (UX-D)
Purposeful animations that create moments of joy and reinforce positive behavior.

| ID | Trigger | Animation | Purpose |
|----|---------|-----------|---------|
| UX-D1 | Bind completed | Confetti burst (classy, not overwhelming) | Celebrate completion |
| UX-D2 | Streak milestone (7, 30, 60, 90 days) | Special celebration animation | Reinforce consistency |
| UX-D3 | Badge unlocked | Badge reveal with shine effect | Acknowledge achievement |
| UX-D4 | Weave level up | Character evolution animation | Show growth |
| UX-D5 | First Needle set | Welcome animation with Dream Self | Celebrate commitment |
| UX-D6 | Reflection submitted | Gentle wave/weave animation | Close daily loop |
| UX-D7 | Timer completed | Satisfying completion sound + visual | Pomodoro finish |

**Guidelines:**
- Animations should feel **magical and delightful**, not generic
- Keep animations short (<1.5s) and skippable
- Use haptic feedback on iOS for tactile reinforcement
- Respect reduced motion accessibility settings

### Loading States (UX-L)
Every async operation needs a thoughtful loading state.

| ID | Operation | Loading UI | Max Duration |
|----|-----------|-----------|--------------|
| UX-L1 | App launch | Splash with Weave logo | <3s |
| UX-L2 | AI generating response | "Weave is thinking..." with animation | <30s |
| UX-L3 | Image uploading | Progress bar with percentage | <5s |
| UX-L4 | Data syncing | Subtle spinner in nav bar | <2s |
| UX-L5 | Screen transition | Skeleton loaders | <1s |

**Implementation:** Use skeleton loaders for data-heavy screens. Show progress for operations >2s.

### Return States (UX-R) ⭐ NEW
How we handle users returning after absence - **THIS IS OUR DIFFERENTIATOR**.

**Core Principle:** Never lead with shame. Lead with warmth. Lower the bar.

| ID | Time Away | Experience | AI Behavior |
|----|-----------|------------|-------------|
| UX-R1 | <24h | Normal home screen | No special messaging |
| UX-R2 | 24-48h | Warm welcome banner | 'Hey, you're back! 💙 Ready to pick up where you left off?' |
| UX-R3 | 48h-7d | AI-initiated chat | Proactive: 'I noticed you've been away. Everything okay? Just ONE bind is a win.' |
| UX-R4 | >7d | Special welcome animation | 'Welcome back, [Name]! Your Dream Self is still here. Let's restart together.' |

**Return Chat Flow (UX-R3):**
1. App detects `hours_since_active > 48`
2. AI Chat opens automatically with contextual greeting
3. Quick response chips: 'Life got busy', 'Feeling overwhelmed', 'Ready to restart'
4. AI responds with empathy and ONE small action
5. Always reference their Dream Self and past wins

**What We DON'T Do:**
- ❌ Show broken streak prominently
- ❌ Guilt-trip with sad mascots
- ❌ Require catching up on missed days
- ❌ Send shame-based notifications

**What We DO:**
- ✅ Lead with warmth and genuine care
- ✅ Lower the bar: 'Just ONE bind today'
- ✅ Reference their WHY (Dream Self)
- ✅ Celebrate their return as a WIN
- ✅ Let AI Chat be the re-entry point

**Implementation:** Store `last_active_at` in user_profiles. Calculate on app launch. Trigger appropriate UX-R state.

---

## Sprint 1 Prioritization (2-Week MVP)

### Sprint 1 Theme: 'Core Loop + AI Companion'

**Goal:** Prove ONE thing - users will complete binds AND engage with AI over 10 days.

### Critical Path Visualization

```
WEEK 1: Foundation + Identity
═══════════════════════════════════════════════════════════════════
Day 1-2: Project Setup
┌──────────────────┐
│ 0.1 Scaffolding  │──► UNBLOCKS ALL
│     (5 pts)      │
└────────┬─────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐  ┌────────┐
│0.2 DB  │  │0.6 AI  │
│(5 pts) │  │(3 pts) │
└───┬────┘  └───┬────┘
    │           │
    ▼           │
┌────────┐      │
│0.3 Auth│      │
│(3 pts) │      │
└───┬────┘      │
    │           │
    ▼           │
┌────────┐      │
│0.4 RLS │      │ ← CRITICAL: Must complete before alpha
│(5 pts) │      │
└────────┘      │
                │
Day 3-5: Onboarding Core         │
┌──────────────────────┐         │
│ 1.1 Welcome (2 pts)  │         │
│ 1.4 Dream Self (3pt) │         │
│ 1.6a Goal Input (3p) │         │
└─────────┬────────────┘         │
          │                      │
          ▼                      │
┌──────────────────────┐         │
│ 1.6b AI Analysis     │◄────────┘
│     (5 pts)          │
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│ 1.6c Bind Suggestions│
│ 1.7 First Commitment │
│     (6 pts)          │
└──────────────────────┘

WEEK 2: Core Action Loop + AI Chat
═══════════════════════════════════════════════════════════════════
Day 6-8: Daily Actions
┌──────────────────────┐
│ 3.1 Thread Home      │
│     (5 pts)          │
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│ 3.3a Bind Screen     │
│     (3 pts)          │
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│ 3.3b Bind Completion │ ← CONFETTI MOMENT! ✨
│     (5 pts)          │
└──────────────────────┘

Day 9-10: AI Companion (CRUCIAL)
┌──────────────────────┐
│ 6.1 AI Chat UI       │
│     (5 pts)          │
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│ 6.2 Contextual AI    │ ← THE DIFFERENTIATOR
│     (8 pts)          │
│ Includes: Return UX  │
│ 'I'm Stuck' Flow     │
│ Dream Self Voice     │
└──────────────────────┘
```

### Sprint 1 Story List

| Priority | Story | Points | Blocker | Rationale |
|----------|-------|--------|---------|-----------|
| **P0** | 0.1 Project Scaffolding | 5 | None | Blocks everything |
| **P0** | 0.2 Supabase Setup | 5 | 0.1 | Data foundation |
| **P0** | 0.3 Authentication | 3 | 0.1, 0.2 | User identity |
| **P0** | 0.4 RLS | 5 | 0.2, 0.3 | Security (CRITICAL) |
| **P0** | 0.6 AI Service Abstraction | 3 | 0.1 | Enables AI features |
| **P1** | 1.1 Welcome Screen | 2 | 0.3 | First impression |
| **P1** | 1.4 Dream Self Definition | 3 | 0.3 | Personalization core |
| **P1** | 1.6a Goal Input Flow | 3 | 1.4 | Core onboarding |
| **P1** | 1.6b AI Goal Analysis | 5 | 0.6, 1.6a | AI-powered breakdown |
| **P1** | 1.6c Bind Suggestions | 3 | 1.6b | Editable binds |
| **P1** | 1.7 First Commitment | 3 | 1.6c | Psychological commitment |
| **P2** | 3.1 Thread Home | 5 | 1.6c | Daily view |
| **P2** | 3.3a Bind Screen | 3 | 3.1 | Bind details |
| **P2** | 3.3b Bind Completion | 5 | 3.3a | Core action + CONFETTI |
| **P2** | 6.1 AI Chat Interface | 5 | 0.6 | Chat UI |
| **P2** | 6.2 Contextual AI Engine | 8 | 6.1, 0.6 | AI brain + Return UX |

**Sprint 1 Total: 66 points**

### Sprint 1 Deferrals

| Story | Reason for Deferral |
|-------|---------------------|
| 1.2 Demographics | Hardcode timezone detection for Sprint 1 |
| 1.3 Archetype Assessment | Hardcode initial archetype, add later |
| 1.5 Motivation/Constraints | Nice-to-have, AI can infer from behavior |
| 1.8 App Tutorial | Users can explore; add after core proven |
| 1.9 Soft Paywall | No payment until retention proven |
| 3.4-3.7 | Proof, Capture, Timer, Dual Path - Sprint 2 |
| Epic 4 | Reflection - Sprint 2 |
| Epic 5 | Progress Visualization - Sprint 2 |
| Epic 7 | Notifications - Sprint 2 |
| Epic 8 | Settings - Sprint 2 (except minimal logout) |

### Why AI Chat is CRUCIAL (Not Optional)

| Without AI Chat | With AI Chat |
|-----------------|--------------|
| 'Here are your tasks' | 'Based on your energy today, here's what I'd focus on' |
| User gets stuck → closes app | User gets stuck → asks 'I'm stuck' → gets help |
| Generic productivity app | Personal coach that knows their Dream Self |
| Competes with Todoist, Streaks | Competes with $200/session life coaches |
| 77% churn at Day 3 | Re-engagement through compassionate AI |

**The AI Chat is our moat.** It's what makes Weave "Weave" and not "Yet Another Habit Tracker."

---

## Story Blocking Dependencies

### Complete Blocking Map

```
LEGEND: A ──► B means "A blocks B" (B cannot start until A is complete)

Epic 0 (Foundation) - Blocks Everything
═══════════════════════════════════════
0.1 ──► 0.2, 0.3, 0.5, 0.6, 0.7, ALL Epic 1-8 stories
0.2 ──► 0.3, 0.4, ALL data-dependent stories
0.3 ──► 0.4, ALL user-facing features
0.4 ──► Alpha Release (HARD BLOCK)
0.6 ──► ALL AI-powered features (1.6b, 2.3b, 3.2, 4.3, 6.1-6.5)

Epic 1 (Onboarding) - Sequential Flow
═════════════════════════════════════
1.1 ──► 1.2 (linear onboarding)
1.2 ──► 1.3
1.3 ──► 1.4
1.4 ──► 1.5
1.5 ──► 1.6a
1.6a ──► 1.6b (needs goal text)
1.6b ──► 1.6c (needs AI breakdown)
1.6c ──► 1.7 (needs binds to commit to)
1.7 ──► 3.1 (onboarding complete, can see Thread)

Epic 2 (Goal Management) - Depends on Onboarding
════════════════════════════════════════════════
1.7 ──► 2.1 (user must have first goal)
2.1 ──► 2.2, 2.3a
2.3a ──► 2.3b (needs goal input for AI)
2.2 ──► 2.4, 2.5

Epic 3 (Daily Actions) - Depends on Goals
═════════════════════════════════════════
1.6c ──► 3.1 (needs binds to display)
3.1 ──► 3.2, 3.3a
3.3a ──► 3.3b (screen before completion)
3.3b ──► 3.4 (completion before proof)
3.1 ──► 3.5 (can capture once home exists)
3.3a ──► 3.6 (timer on bind screen)

Epic 4 (Reflection) - Depends on Actions
════════════════════════════════════════
3.3b ──► 4.1 (needs completions to reflect on)
4.1 ──► 4.2, 4.3
4.3 ──► 4.4
4.1 ──► 4.5 (needs entries to view history)

Epic 5 (Progress) - Depends on Data
═══════════════════════════════════
3.3b ──► 5.1 (needs completion data)
4.1 ──► 5.3 (needs fulfillment data)
5.1 ──► 5.2, 5.4, 5.5
5.5 ──► 5.6 (badges depend on streaks)
5.6 ──► 5.7 (snapshot includes badges)

Epic 6 (AI Coaching) - Depends on AI Service
════════════════════════════════════════════
0.6 ──► 6.1 (needs AI abstraction)
6.1 ──► 6.2 (UI before context engine)
6.2 ──► 6.3, 6.4, 6.5

Epic 7 (Notifications) - Depends on Core Loop
═════════════════════════════════════════════
3.1 ──► 7.1 (morning notification needs binds)
3.3a ──► 7.2 (reminders need bind screens)
4.1 ──► 7.3 (evening prompt needs reflection)
5.5 ──► 7.4 (streak recovery needs streak data)
5.6 ──► 7.5 (milestone celebration needs badges)
7.1 ──► 7.6 (preferences need notifications to exist)

Epic 8 (Settings) - Minimal Dependencies
════════════════════════════════════════
0.3 ──► 8.1 (profile needs auth)
1.4 ──► 8.2 (identity edit needs identity)
0.3 ──► 8.6 (logout needs auth)
```

### Dependency Matrix (Simplified)

| Epic | Hard Blockers | Can Run In Parallel With |
|------|---------------|--------------------------|
| **0** | None | Nothing (must be first) |
| **1** | Epic 0 | Nothing (sequential onboarding) |
| **2** | Epic 0, 1 | Epic 7, 8 (partially) |
| **3** | Epic 0, 1, 2 | Epic 6, 7 |
| **4** | Epic 0, 1, 2, 3 | Epic 5, 6 |
| **5** | Epic 0, 1, 2, 3, 4 | Epic 6 |
| **6** | Epic 0 | Epic 2, 3, 4 (AI service needed early) |
| **7** | Epic 0, 1, 2, 3 | Epic 5, 6 |
| **8** | Epic 0, 1 | Epic 2, 3, 4, 5, 6, 7 |

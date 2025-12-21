---
document_type: 'prd'
project: 'Weave'
version: '1.0'
created: '2025-12-16'
status: 'active'
owner: 'Jack'
workflow_phase: 'planning'
last_updated: '2025-12-16'
target_release: 'Q1 2026'
---

# Weave Product Requirements Document (PRD)

## Document Overview

### Purpose

This Product Requirements Document defines the complete requirements for Weave MVP v1.0 - an AI-powered identity coach that helps ambitious but inconsistent users turn vague goals into daily wins, proof, and a stronger sense of self.

### Scope

**In Scope (MVP v1.0):**
- iOS mobile application (React Native)
- Core goal tracking and habit system
- AI coaching and feedback
- Daily reflection and journaling
- Progress visualization
- Push notifications
- Freemium monetization

**Out of Scope (Post-MVP):**
- Android application
- Shared accountability / social features
- iMessage integration
- Screen time integration
- Vector embeddings / "second brain"
- Multi-modal long-term memory
- Advanced analytics dashboard

### Stakeholders

| Role | Name | Responsibility |
|------|------|----------------|
| Product Owner | Jack | Requirements, prioritization, approval |
| Engineering Lead | TBD | Technical feasibility, architecture |
| Design Lead | TBD | UX/UI design, user research |
| AI Engineer | TBD | AI module implementation, cost optimization |

### Related Documents

| Document | Path | Purpose |
|----------|------|---------|
| Product Brief | `docs/analysis/product-brief.md` | Executive summary and strategy |
| MVP Specification | `docs/idea/mvp.md` | Feature specifications |
| Backend Architecture | `docs/idea/backend.md` | Technical architecture |
| UX Architecture | `docs/idea/ux.md` | Screen specifications |
| AI Architecture | `docs/idea/ai.md` | AI system design |
| Market Research | `docs/analysis/research/` | Competitive analysis |

---

## Table of Contents

1. [Product Vision](#product-vision)
2. [User Personas](#user-personas)
3. [Functional Requirements](#functional-requirements)
   - [Epic 0: Foundation](#epic-0-foundation)
   - [Epic 1: Onboarding & Identity](#epic-1-onboarding--identity)
   - [Epic 2: Goal Management](#epic-2-goal-management)
   - [Epic 3: Daily Actions & Proof](#epic-3-daily-actions--proof)
   - [Epic 4: Reflection & Journaling](#epic-4-reflection--journaling)
   - [Epic 5: Progress Visualization](#epic-5-progress-visualization)
   - [Epic 6: AI Coaching](#epic-6-ai-coaching)
   - [Epic 7: Notifications](#epic-7-notifications)
   - [Epic 8: Settings & Profile](#epic-8-settings--profile)
4. [Cross-Cutting UX Concerns](#cross-cutting-ux-concerns)
5. [Non-Functional Requirements](#non-functional-requirements)
6. [Data Requirements](#data-requirements)
7. [AI System Requirements](#ai-system-requirements)
8. [Security & Privacy Requirements](#security--privacy-requirements)
9. [Analytics & Success Metrics](#analytics--success-metrics)
10. [Constraints & Assumptions](#constraints--assumptions)
11. [Dependencies & Risks](#dependencies--risks)
12. [Release Plan](#release-plan)
13. [Appendices](#appendices)

---

## Product Vision

### One-Liner

**Turn vague goals into daily wins, proof, and a stronger identity in 10 days.**

### Promise

"Give me 10 days and I will show you who you are becoming."

### North Star Metric

**Active Days with Proof** = User completes at least 1 subtask (bind) + logs either:
- (a) A memory/capture (photo, note, voice), OR
- (b) A journal check-in

### Success Criteria (MVP)

| Metric | Target | Timeline |
|--------|--------|----------|
| Downloads | 1,000 | Month 1 |
| 7-Day Retention | 40% | Month 2 |
| Active Days with Proof (7+ in first 10 days) | 60% of users | Month 3 |
| Free-to-Paid Conversion | 5% | Month 3 |
| Monthly Active Users (MAU) | 10,000 | Q2 2026 |

### Competitive Moats

1. **Identity + Narrative Switching Cost** - Users build a "story of self" with proof and reflection
2. **Unique Dataset** - Goals → Q-goals → Subtasks + Proof + Mood linkage
3. **Deterministic Personalization** - AI constrained by archetype, dream self, and history
4. **Distribution Wedge** - Shareable "Before vs After" cards for viral growth

---

## User Personas

### Primary Persona: "Chaotic Builder Chris"

**Demographics:**
- Age: 20-25
- Occupation: College student or early-career builder
- Location: US (initially)
- Tech-savvy: Comfortable with mobile apps

**Psychographics:**
- High intent but inconsistent execution
- Identity-driven: cares about "who I'm becoming"
- Has tried productivity apps before without success
- Seeks personalized guidance, not generic advice

**Pain Points:**
1. "I set goals but don't know what to do daily to achieve them"
2. "I say I'll do things but don't hold myself accountable"
3. "I've tried habit apps but they feel empty and I quit after 2 weeks"
4. "I want a coach but can't afford $200/session"

**Jobs to be Done:**
1. When I have a vague goal, I want AI to break it into daily actions so I know exactly what to do
2. When I complete a task, I want to document proof so I stay accountable
3. When I miss days, I want a recovery path so I don't spiral into shame
4. When I feel lost, I want coaching that knows my context so advice feels personal

### Secondary Persona: "Graduate School Grace"

**Demographics:**
- Age: 24-28
- Occupation: Graduate student or early-career professional
- Balancing research/work + side projects + personal goals

**Pain Points:**
- Overwhelmed by competing priorities
- Needs structure but current systems are too rigid
- Wants to track progress across multiple life areas

---

## Functional Requirements

### Terminology Reference

| MVP Term | Technical Term | Description |
|----------|---------------|-------------|
| **Needle** | Goal | Top-level user goal (max 3 active) |
| **Bind** | Subtask | Consistent daily action toward a goal |
| **Thread** | User/Identity | User's starting state and identity |
| **Weave** | Progress/Stats | User's evolved state, consistency metrics |
| **Q-Goal** | Quantifiable Goal | *Internal only* - Measurable subgoal with metrics (not shown in user edit UI) |
| **Proof** | Capture | Evidence of bind completion |
| **Triad** | Daily Plan | AI-generated 3 tasks for next day |
| **Reflection** | Journal Entry | Daily check-in with fulfillment score |

### Priority Legend (MoSCoW)

- **M** = Must Have (required for MVP)
- **S** = Should Have (important but can defer)
- **C** = Could Have (nice to have)
- **W** = Won't Have (explicitly excluded from MVP)

---

## Epic 0: Foundation

### Overview

Before any user-facing features can be built, the development team must have a fully scaffolded, secure, and testable codebase with authentication, database, and AI infrastructure ready.

### User Stories

#### US-0.1: Project Scaffolding

**Priority:** M (Must Have)

**As a** developer
**I want to** have a properly initialized Expo and FastAPI project
**So that** I can begin implementing features with the correct tech stack

**Acceptance Criteria:**
- [ ] Initialize Expo app using `npx create-expo-app` with blank-typescript template
- [ ] Use Expo SDK 53, React Native 0.79, React 19, Expo Router v5
- [ ] Initialize backend using `uv init` with FastAPI, uvicorn
- [ ] Use Python 3.11+, FastAPI 0.115+
- [ ] Configure NativeWind (Tailwind CSS for React Native) for styling
- [ ] Set up TanStack Query with `networkMode: 'offlineFirst'`
- [ ] Configure Zustand for shared UI state

**Story Points:** 5

---

#### US-0.2: Supabase Setup

**Priority:** M (Must Have)

**As a** developer
**I want to** have Supabase configured with the database schema
**So that** authentication and data persistence work correctly

**Acceptance Criteria:**
- [ ] Create Supabase project with PostgreSQL database
- [ ] Run initial migrations for 8 core tables:
  - user_profiles, identity_docs, goals, subtask_templates
  - subtask_instances, subtask_completions, captures, journal_entries
- [ ] Configure Supabase Storage for user uploads
- [ ] Set up critical indexes on frequently queried columns
- [ ] Implement snake_case for database columns

**Story Points:** 5

---

#### US-0.3: Authentication Flow

**Priority:** M (Must Have)

**As a** user
**I want to** be able to sign up and log in securely
**So that** my data is protected and associated with my account

**Acceptance Criteria:**
- [ ] Implement Supabase Auth with email + OAuth (Google, Apple)
- [ ] JWT token expiration set to 7 days
- [ ] Implement refresh token rotation
- [ ] Session management with secure storage
- [ ] Logout functionality clears local session

**Story Points:** 3

---

#### US-0.4: Row Level Security (RLS)

**Priority:** M (Must Have) - **CRITICAL: Must complete before alpha release**

**As a** user
**I want to** know my data is secure from other users
**So that** I can trust the app with my personal reflections and goals

**Acceptance Criteria:**
- [ ] RLS policies on ALL user-owned tables (CRITICAL)
- [ ] Users can only SELECT/INSERT/UPDATE/DELETE own data
- [ ] API endpoint authorization validates user ownership
- [ ] Test RLS policies with multiple test users
- [ ] Document RLS policies in security documentation

**Story Points:** 5

---

#### US-0.5: CI/CD Pipeline

**Priority:** M (Must Have)

**As a** developer
**I want to** have automated testing and deployment
**So that** code quality is maintained and releases are consistent

**Acceptance Criteria:**
- [ ] GitHub Actions for linting (ESLint, Black)
- [ ] GitHub Actions for type checking (TypeScript, mypy)
- [ ] GitHub Actions for running tests
- [ ] Expo EAS Build configured for iOS
- [ ] Railway deployment configured for FastAPI backend
- [ ] Environment variable management for staging/production

**Story Points:** 3

---

#### US-0.6: AI Service Abstraction

**Priority:** M (Must Have)

**As a** developer
**I want to** have an abstracted AI provider layer
**So that** we can switch providers and implement fallbacks without changing business logic

**Acceptance Criteria:**
- [ ] Abstract AI provider interface supporting OpenAI and Anthropic
- [ ] Implement fallback chain: OpenAI → Anthropic → Deterministic
- [ ] Cost tracking with `input_tokens`, `output_tokens`, `model`, `cost_usd`
- [ ] Daily budget alerts at $83.33/day threshold
- [ ] Auto-throttle to cache-only mode at 100% daily budget
- [ ] Rate limiting: 10 AI calls/hour per user

**Story Points:** 3

---

#### US-0.7: Test Infrastructure

**Priority:** M (Must Have)

**As a** developer
**I want to** have testing infrastructure set up
**So that** I can write and run tests for new features

**Acceptance Criteria:**
- [ ] Jest configured for React Native mobile testing
- [ ] pytest configured for FastAPI backend testing
- [ ] Test fixture factories for common entities (user, goal, subtask)
- [ ] Test database seeding scripts
- [ ] Minimum 1 integration test demonstrating the pattern

**Story Points:** 1

---

#### US-0.8: Error Handling Framework

**Priority:** M (Must Have)

**As a** developer
**I want to** have a consistent error handling framework
**So that** users receive helpful error messages and errors are properly logged

**Acceptance Criteria:**
- [ ] Define standard error response format: `{error: {code, message, retryable, retryAfter?}}`
- [ ] Establish HTTP status codes for each error type:
  - 400 for validation errors
  - 401 for authentication errors
  - 429 for rate limiting
  - 500 for server errors
  - 503 for AI service unavailable
- [ ] Create error response utilities for backend
- [ ] Create error handling hooks for mobile (API errors, network errors, AI errors)
- [ ] Document all error codes in `/docs/api-error-codes.md`

**Technical Notes:**
- All API endpoints must return consistent error format
- Mobile should handle errors gracefully with user-friendly messages
- Error handling smoke tests must pass

**Story Points:** 3

---

#### US-0.9: Image Upload Error Handling

**Priority:** M (Must Have)

**As a** user
**I want to** understand what went wrong when image uploads fail
**So that** I can take corrective action

**Acceptance Criteria:**
- [ ] Implement file validation: Max 10MB, JPEG/PNG only, minimum 100x100px
- [ ] Handle error scenarios:
  - File too large
  - Invalid file format
  - Storage quota exceeded
  - Upload timeout
- [ ] Display progress UI with upload progress bar and cancel button
- [ ] Implement retry logic with 3 attempts using exponential backoff
- [ ] Queue failed uploads locally for retry when connection returns

**Technical Notes:**
- User sees clear, actionable error messages
- Failed uploads automatically retry when online
- Supabase Storage integration with signed URLs

**Story Points:** 3

---

#### US-0.10: Memory System Architecture Decision

**Priority:** M (Must Have)

**As a** developer
**I want to** have a clear memory storage architecture
**So that** AI can recall user context without over-engineering

**Acceptance Criteria:**
- [ ] Decision documented: Simple PostgreSQL TEXT[] arrays (no vector DB for MVP)
- [ ] Implement basic keyword search (no semantic/vector search yet)
- [ ] Define memory lifecycle: Created on journal submit, pruned at 100 memories per user
- [ ] Document memory schema in architecture docs
- [ ] Implement memory retrieval strategy for AI context

**Technical Notes:**
- Keep it simple for MVP - no fancy vector embeddings
- Memory storage works and retrieval returns relevant memories
- Can be enhanced with vector search post-MVP if needed

**Story Points:** 2

---

### Epic 0 Summary

| Metric | Value |
|--------|-------|
| Total Story Points | 38 |
| Priority M (Must Have) | 10 |
| Priority S (Should Have) | 0 |
| Dependencies | None (True Foundation) |

---

## Epic 1: Onboarding (Optimized Hybrid Flow)

### Overview

**Goal:** Maximize completion → emotional resonance → early activation → set up the 7-day retention loop → gather deep personalization incrementally.

New users experience a streamlined onboarding that gets them to their first "win" within 3 minutes, then progressively gathers deeper personalization over the first 3-4 days of actual usage.

---

### PHASE 1 — Emotional Hook (PRE-AUTH, 45s max)

#### US-1.1: Welcome & Vision Hook

**Priority:** M (Must Have)

**As a** new user
**I want to** see a simple, motivating welcome screen
**So that** I feel emotionally drawn into the experience and choose to start

**Acceptance Criteria:**
- [ ] Show Weave logo + tagline: "See who you're becoming."
- [ ] Short value prop (1 sentence): "Weave helps you turn daily actions into visible transformation."
- [ ] Display Get Started CTA button
- [ ] Loads under 2 seconds
- [ ] Tracks `onboarding_started` event

**Technical Notes:**
- No API calls; static assets only
- Event logged to analytics

---

#### US-1.2: Emotional State Selection (Painpoint Identification)

**Priority:** M (Must Have)

**As a** new user
**I want to** pick what I'm struggling with right now
**So that** the app feels personalized immediately without asking for heavy data

**Acceptance Criteria:**
- [ ] Display 4 cards:
  - **Clarity** → "I'm figuring out my direction"
  - **Action** → "I think a lot but don't start"
  - **Consistency** → "I start strong but fall off"
  - **Alignment** → "I feel ambitious but isolated"
- [ ] User selects 1; can optionally add a second after confirmation
- [ ] Smooth transitions; each card has micro-animation on select
- [ ] Sends `selected_painpoints` to backend (lightweight)

**Data Requirements:**
- Store `initial_painpoints` in `user_profiles.json`

**Technical Notes:**
- Deterministic mapping → no AI call
- Used later to adjust early prompts and tone

---

#### US-1.3: Symptom Insight Screen (Dynamic Mirror)

**Priority:** M (Must Have)

**As a** new user
**I want to** see a short, powerful reflection of the symptoms I'm experiencing based on the option(s) I selected
**So that** I feel deeply understood and motivated to continue

**Acceptance Criteria:**
- [ ] Displays 1–2 short, high-impact paragraphs describing the user's symptom(s)
- [ ] If user selected two painpoints, show both symptom cards stacked with soft separation
- [ ] No solutions appear here (solutions are in US-1.4)
- [ ] Visual elements must enhance emotional impact (not plain text)
- [ ] Completion time < 10 seconds
- [ ] CTA: Next →
- [ ] Track event: `symptom_insight_shown` with selected categories

**Dynamic Copy (Final, Improved Versions):**

**1. Clarity**

*Symptoms*
You want direction, but nothing feels aligned. You've reflected, journaled, thought deeply — yet you're still on autopilot.
Deep down, you do have an idea of the life you want.
You're just scared to start, because choosing a direction feels like closing every other door.

**2. Action**

*Symptoms*
Your mind runs laps while your actions stay still.
You overthink, perfect, plan, and wait for the "right moment" — but the moment never arrives.
Starting feels overwhelming, so hesitation becomes your default.

**3. Consistency**

*Symptoms*
You start strong, fall off, and repeat the cycle again and again.
It's not that "life gets in the way" — it's that you don't see progress fast enough to believe it's working.
One missed day breaks everything, and motivation collapses with it.

**4. Alignment**

*Symptoms*
You're ambitious in a place that isn't.
You feel misunderstood, unsupported, and tired of pushing alone.
You've tried getting others to grow with you, but they didn't get it — and shrinking yourself to match them feels wrong.

**If User Selected Two Painpoints:**
- Display both cards, each in a rounded glass panel
- **Animations:**
  - Card 1 fades in
  - Card 2 slides upward after a 200ms delay
  - CTA appears only after both cards appear

**Design Specification:**

*Layout:*
- Title at top: **"Why this feels so hard"**
- Below title: one or two glass-paneled cards containing symptom text
- Cards have:
  - Soft shadow
  - Subtle animated thread-lines in the background (very faint)
  - Light vertical gradient (transparent → subtle highlight)
- Page transitions: fade-in + slight upward drift (150–200ms)

*Typography:*
- Title: Semi-bold
- Body: Medium; 90% opacity for clean minimalism

*CTA Button:*
- Text: "Next →"
- Full-width, floating above safe area

**Technical Notes:**
- All content is local/static; no API call needed
- Deterministic mapping based on selected painpoints
- Gracefully handle 1 or 2 selected painpoints (never more)
- Store data in `user_profiles.json.initial_symptoms`

---

#### US-1.4: Weave Solution Screen (Dynamic "Here's What Changes Now")

**Priority:** M (Must Have)

**As a** new user
**I want to** understand how Weave solves the struggle I'm experiencing
**So that** I feel hopeful, supported, and motivated to proceed into the app

**Acceptance Criteria:**
- [ ] Display one short "solution" paragraph for each selected painpoint
- [ ] Content must be brief, actionable, and benefits-focused
- [ ] Screen remains visually clean and minimal — no long explanations
- [ ] If two painpoints selected, show two solution cards, matching the style of US-1.3
- [ ] CTA: Show me →
- [ ] Completion time < 8 seconds
- [ ] Track event: `solution_screen_shown`

**Dynamic Copy (Final, Improved Solutions):**

**1. Clarity — Solution**

*How Weave fixes this:*
We turn vague feelings into clear direction.
Through small daily reflections and pattern insights, Weave reveals where your motivation naturally points — and turns that into a path you can follow.

*(Visual cue: reflection spark + weave insight glowing thread)*

**2. Action — Solution**

*How Weave fixes this:*
We make starting easy.
We break your goal into simple, doable steps and nudge you into motion — so action replaces hesitation, and momentum replaces overthinking.

*(Visual cue: needle guiding a thread into motion)*

**3. Consistency — Solution**

*How Weave fixes this:*
We make consistency feel meaningful.
Every time you follow through, Weave turns that action into visible proof of who you're becoming — making discipline feel natural instead of forced.

*(Visual cue: weave pattern gaining structure as binds complete)*

**4. Alignment — Solution**

*How Weave fixes this:*
We become the environment that supports your ambition.
The more you use the app, the better it understands how you grow — and eventually, Weave will connect you with others moving in the same direction.

*(Visual cue: two threads beginning to intertwine — "coming soon" subtly noted)*

**If User Selected Two Painpoints:**
- Display both solutions in two separate glass cards
- Layout mirrors US-1.3 for visual continuity
- **Soft stacking animation:**
  - Card 1 fades in
  - Card 2 slides up (150–200ms delay)

**Design Specification:**

*Layout:*
- Title at top: **"How Weave helps"**
- Cards below containing solution statements
- Subtle background animation: threads gently converging behind the card(s)
- CTA button fixed bottom: **"Show me →"**

*Visual Style:*
- Liquid-glass cards
- Light pulse animation on key words (optional): *clear, easy, visible proof, support*
- Exactly 3–5 lines of text per card (no scrolling)

*Typography:*
- Header: Semi-bold
- Body: Medium, 90% opacity
- Keywords bolded for emotional anchors

**Technical Notes:**
- Static content, no API
- Deterministic mapping from earlier selections
- Store `initial_solution_categories` for future personalization
- Must support 1 or 2 cards, never more

---

#### US-1.5: Authentication

**Priority:** M (Must Have)

**As a** new user
**I want to** quickly create an account
**So that** I can start my transformation

**Acceptance Criteria:**
- [ ] Buttons: Sign in with Apple, Sign in with Google, Email
- [ ] Show: "7-day free trial. No commitment."
- [ ] Fast authentication (<3 seconds)
- [ ] Store user row in `user_profiles`

**Technical Notes:**
- Use Supabase Auth
- Track `auth_completed`

---

### PHASE 2 — Light Identity Bootup (IN-APP, FAST)

#### US-1.6: Identity Traits Selection

**Priority:** M (Must Have)

**As a** new user
**I want to** choose traits I want to grow into
**So that** the app can anchor my early journey to identity

**Acceptance Criteria:**
- [ ] Display 12 selectable traits (chips)
- [ ] User selects 3-5
- [ ] Stored immediately after selection
- [ ] CTA: "Continue"
- [ ] Completion time <15 seconds

**Data Requirements:**
- Write `identity_traits` → `identity_docs.json`

---

#### US-1.7: First Needle (Goal Definition – Simple)

**Priority:** M (Must Have)

**As a** new user
**I want to** define one goal
**So that** Weave can break it down into actionable steps

**Acceptance Criteria:**
- [ ] Input field: "What's one thing you want to achieve first?"
- [ ] Suggestion chips based on painpoint chosen earlier
- [ ] User must input or tap a suggestion
- [ ] CTA: "Continue"
- [ ] Completion time <10 seconds

**Data Requirements:**
- Store basic goal text in temporary onboarding state
- Later transformed into tables during AI breakdown

---

### PHASE 3 — Early Value Proof ("Wow Moment")

#### US-1.8: Weave Path Generation (AI-Assisted)

**Priority:** M (Must Have)

**As a** new user
**I want to** see a clear, AI-generated breakdown of my goal
**So that** I understand exactly how to begin

**Acceptance Criteria:**
- [ ] Loading animation: "Shaping your path…"
- [ ] 1-3 second delay (UX pacing)
- [ ] AI generates:
  - Goal title & summary
  - 2-3 milestones
  - 2-4 binds (actions/habits)
- [ ] User can accept or edit each item
- [ ] CTA: "Looks good" → or "Edit"

**AI Module:** Onboarding Coach (deterministic constraints, ~70% success probability)

**Data Requirements:**
- Write outputs to:
  - `goals`
  - `qgoals`
  - `subtask_templates`
- Create `ai_runs` record

---

#### US-1.9: First Commitment Ritual (Bind #1)

**Priority:** M (Must Have)

**As a** new user
**I want to** complete a symbolic first action
**So that** I feel emotionally invested and committed

**Acceptance Criteria:**
- [ ] Display: "Today is [date]. Mark this as the start of your transformation."
- [ ] User must tap "Complete my first Bind"
- [ ] Accept any input type: text, photo, audio, or checkmark
- [ ] Show micro-animation of thread tightening
- [ ] Display: "Day 1 complete."

**Data Requirements:**
- Create first `subtask_instance`
- Write `bind_completed` event
- Set `onboarding_first_bind_completed_at`

---

### PHASE 4 — Lightweight Orientation

#### US-1.10: App Mini-Tutorial (Tooltip Style)

**Priority:** M (Must Have)

**As a** new user
**I want to** see a quick, digestible tour
**So that** I understand the core structure without feeling overwhelmed

**Acceptance Criteria:**
- [ ] 3 tooltips:
  - Highlight Weave avatar → "This grows with your consistency."
  - Highlight Binds → "These are your identity-building actions."
  - Highlight Reflection button → "Reflect nightly for deeper insights."
- [ ] Each tooltip dismissible with "Got it"
- [ ] Tutorial duration <20 seconds
- [ ] Track tutorial completed vs skipped

---

### PHASE 5 — Trial Activation

#### US-1.11: Welcome Into the 7-Day Journey

**Priority:** M (Must Have)

**As a** new user
**I want to** understand I'm beginning a guided 7-day experience
**So that** I'm motivated to continue

**Acceptance Criteria:**
- [ ] Banner at top: "You're on Day 1 of your 7-day transformation."
- [ ] No paywall
- [ ] User enters Thread (Home)

---

### PHASE 6 — Deferred Deep Personalization (Post-Activation)

These replace the earlier heavy pre-auth screens and are delivered contextually during Days 1-3.

#### US-1.12: Dream Self (Day 1 Evening Prompt)

**Priority:** S (Should Have)

**Triggered inside nightly reflection.**

**As a** new user
**I want to** describe my future self when I'm emotionally primed
**So that** the AI can personalize my philosophy and tone

**Acceptance Criteria:**
- [ ] Prompt during first evening reflection
- [ ] Text input: "Describe the person you're becoming" (200 char min)
- [ ] Stored in `identity_docs.json.dream_self`

---

#### US-1.13: Archetype Micro-Assessment (Day 2)

**Priority:** S (Should Have)

**Delivered as conversational micro-questions (not a psych test).**

**As a** new user
**I want to** answer quick questions about my style
**So that** the AI can adapt its coaching approach

**Acceptance Criteria:**
- [ ] 3-4 quick questions delivered in chat or reflection
- [ ] Deterministic archetype mapping
- [ ] Stored in `identity_docs.archetype`

---

#### US-1.14: Motivations & Failure Modes (Day 2-3)

**Priority:** S (Should Have)

**Inserted contextually into reflection flow.**

**As a** user on Day 2-3
**I want to** specify what motivates me and what blocks me
**So that** the AI creates realistic plans

**Acceptance Criteria:**
- [ ] Select 2-3 motivation drivers
- [ ] Select failure mode
- [ ] Optional: time constraints, energy patterns
- [ ] Stored in `identity_docs.json`

---

#### US-1.15: Constraints & Demographics (Day 3)

**Priority:** S (Should Have)

**Optional "Improve your recommendations" modal.**

**As a** user on Day 3
**I want to** provide additional context
**So that** recommendations become more accurate

**Acceptance Criteria:**
- [ ] Optional prompt after Day 3 reflection
- [ ] Collect: timezone, preferred hours, user type
- [ ] Stored in `user_profiles`

---

### PHASE 7 — Monetization

#### US-1.16: Soft Paywall (Day 3-4 Trigger)

**Priority:** M (Must Have)

**As a** trialing user
**I want to** understand the tiers after I've had value
**So that** upgrading feels natural and earned

**Trigger:**
- After 3 consecutive days of bind completion
- OR when user tries to add a second Needle

**Acceptance Criteria:**
- [ ] Show Free vs Pro vs Max
- [ ] Clear CTA: "Start 7-day free trial" (if applicable)
- [ ] Always show "Continue free" option
- [ ] Track `paywall_presented` and `paywall_action` events

**Data Requirements:**
- Write to `user_profiles.subscription_tier`
- Store `subscription_started_at`, `trial_ends_at`

**Technical Notes:**
- Use RevenueCat or native StoreKit 2 for subscription management
- Soft paywall = always allows skip to free tier

---

### Epic 1 Summary (Hybrid Flow)

| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-1.1 | Welcome | M | 2 pts |
| US-1.2 | Painpoint Selection | M | 3 pts |
| US-1.3 | Insight Mirror | M | 2 pts |
| US-1.4 | Weave Solution | M | 2 pts |
| US-1.5 | Auth | M | 3 pts |
| US-1.6 | Identity Traits | M | 3 pts |
| US-1.7 | First Needle | M | 3 pts |
| US-1.8 | AI Path | M | 8 pts |
| US-1.9 | First Commitment | M | 3 pts |
| US-1.10 | Mini Tutorial | M | 3 pts |
| US-1.11 | Trial Activation | M | 1 pt |
| US-1.12 | Dream Self (Deferred) | S | 3 pts |
| US-1.13 | Micro-Archetype (Deferred) | S | 3 pts |
| US-1.14 | Motivations & Failure Modes | S | 3 pts |
| US-1.15 | Constraints & Demographics | S | 2 pts |
| US-1.16 | Soft Paywall (Day 3-4) | M | 5 pts |

**Epic Total:** 48 story points

**Note:** This hybrid flow increases story points from 35 to 48, but distributes complexity across the user journey, resulting in higher activation rates and lower drop-off. The deferred personalization (US-1.12 through US-1.15) can be implemented incrementally without blocking the core onboarding flow.

---

## Epic 2: Goal Management

### Overview

Users can create, view, edit, and archive goals (needles), with AI assistance for goal breakdown. Maximum 3 active goals enforced.

### User Stories

#### US-2.1: View Goals List

**Priority:** M (Must Have)

**As a** user
**I want to** see all my active goals
**So that** I can track what I'm working toward

**Acceptance Criteria:**
- [ ] Display up to 3 active goals (needles) with status
- [ ] Show consistency % for each goal
- [ ] Show active binds count per goal
- [ ] Tap goal to expand/view details
- [ ] "Add Goal" button (disabled if 3 active goals)
- [ ] Access from Weave Dashboard → Needles Overview

**Data Requirements:**
- Read from `goals` table (status = 'active')
- Read from `daily_aggregates` for consistency

**Technical Notes:**
- No AI call on this screen
- Enforce max 3 active goals at UI and API level

---

#### US-2.2: View Goal Details

**Priority:** M (Must Have)

**As a** user
**I want to** see full details of a goal
**So that** I can understand my progress and adjust binds

**Acceptance Criteria:**
- [ ] Display goal title, description, created date
- [ ] Show "Why it matters" (user's motivation)
- [ ] List Q-goals with progress indicators
- [ ] List associated binds with completion stats
- [ ] Show consistency % (7-day, 30-day)
- [ ] Actions: Edit goal, Archive goal, Add bind

**Data Requirements:**
- Read from `goals`, `qgoals`, `subtask_templates`
- Read from `subtask_completions` for stats

---

#### US-2.3: Create New Goal (AI-Assisted)

**Priority:** M (Must Have)

**As a** user
**I want to** add a new goal with AI assistance
**So that** I can expand what I'm working on

**Acceptance Criteria:**
- [ ] Text input for new goal
- [ ] Probing question: "Why is this goal important to you?"
- [ ] AI generates Q-goals and suggested binds
- [ ] User can edit all AI suggestions
- [ ] Enforce max 3 active goals (show error if limit reached)
- [ ] Create goal and associated data on confirm

**AI Module:** Onboarding Coach (reused)

**Data Requirements:**
- Write to `goals`, `qgoals`, `subtask_templates`
- Create `ai_runs` record

**Technical Notes:**
- Same AI module as onboarding
- Cache with input_hash (8 hour TTL)

---

#### US-2.4: Edit Needle

**Priority:** M (Must Have)

**As a** user
**I want to** edit my Needle (goal) details
**So that** I can refine my approach as I learn

**Acceptance Criteria:**
- [ ] Edit Needle title and description
- [ ] Edit "Why it matters"
- [ ] Add/remove/edit Binds (subtasks)
- [ ] Q-goals are internal only - not shown in user edit UI
- [ ] Confirm changes and save
- [ ] **Change Warning (Thoughtfully Balanced):**
  - Not too easy to change (prevents impulsive pivots)
  - Not too hard (doesn't create friction for legitimate refinement)
  - Options based on strictness mode:
    - Show impact summary: "This will affect your 12-day streak tracking"
    - Require brief justification text: "Why are you making this change?"
    - Visual friction: hold-to-confirm interaction

**Data Requirements:**
- Update `goals`, `subtask_templates`
- Track edit history (version chain)
- Store change justification if required

**Technical Notes:**
- Editing a goal may invalidate cached AI outputs
- Change warning respects user's strictness mode setting (Normal/Strict/None)

---

#### US-2.5: Archive Goal

**Priority:** M (Must Have)

**As a** user
**I want to** archive a goal I no longer want to pursue
**So that** I can focus on other priorities

**Acceptance Criteria:**
- [ ] Confirmation dialog: "Are you sure? You can reactivate later."
- [ ] Archive sets goal status to 'archived'
- [ ] Archived goals don't count toward 3-goal limit
- [ ] Archived goals visible in History (read-only)
- [ ] Option to reactivate if <3 active goals

**Data Requirements:**
- Update `goals.status` = 'archived'
- Update `goals.archived_at`

---

#### US-2.6: Goal Change Strictness

**Priority:** S (Should Have)

**As a** user
**I want to** control how easily I can change goals
**So that** I stay committed and don't constantly pivot

**Acceptance Criteria:**
- [ ] Three modes configurable in Settings:
  - **Normal:** Changes require justification text
  - **Strict:** Changes require daily reflection first
  - **None:** Changes allowed freely
- [ ] Default: Normal
- [ ] Mode saved in user preferences

**Data Requirements:**
- Store in `user_profiles.preferences.goal_change_strictness`

---

### Epic 2 Summary

| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-2.1 | View Goals List | M | 3 pts |
| US-2.2 | View Goal Details | M | 5 pts |
| US-2.3 | Create New Goal (AI) | M | 8 pts |
| US-2.4 | Edit Goal | M | 5 pts |
| US-2.5 | Archive Goal | M | 3 pts |
| US-2.6 | Goal Change Strictness | S | 3 pts |

**Epic Total:** 27 story points

---

## Epic 3: Daily Actions & Proof

### Overview

Users complete daily binds (habits/actions) and document proof. This is the core action loop that drives the North Star metric.

### User Stories

#### US-3.1: View Today's Binds (Thread Home)

**Priority:** M (Must Have)

**As a** user
**I want to** see my tasks for today when I open the app
**So that** I know exactly what to do

**Acceptance Criteria:**
- [ ] Thread (Home) shows today's binds grouped by needle (goal)
- [ ] Each needle is a collapsible dropdown
- [ ] Binds show: title, estimated time, completion status
- [ ] Incomplete binds show empty checkbox
- [ ] Completed binds show checkmark with optional proof indicator
- [ ] If no active binds, show "next smallest win" nudge
- [ ] Answer "What should I do today?" in <10 seconds

**Data Requirements:**
- Read from `subtask_instances` for today (local_date)
- Read from `subtask_completions` for status
- Read from `goals` for needle context

**Technical Notes:**
- No AI call on this screen
- Use user's timezone for local_date

---

#### US-3.2: View Triad (AI Daily Plan)

**Priority:** M (Must Have)

**As a** user
**I want to** see AI-recommended top 3 Binds
**So that** I focus on what matters most

**Acceptance Criteria:**
- [ ] Display Triad at top of Thread (Home)
- [ ] **Note:** Triad IS the prioritized subset of Binds - same entity type, just AI-ranked
- [ ] Show yesterday's insight/intention summary (from AI)
- [ ] Triad Binds ranked: Easy win, Medium challenge, Important/difficult
- [ ] Each Bind shows rationale ("Why this bind")
- [ ] User can edit or dismiss Triad Binds

**AI Module:** Triad Planner

**Data Requirements:**
- Read from `triad_tasks` table (cached from last night)
- Read from `ai_artifacts` for insight

**Technical Notes:**
- Triad generated after journal submission (evening)
- No model call on Thread load (reads cache)
- Triad tasks reference existing `subtask_instances` - they are the same Binds, just highlighted

---

#### US-3.3: Start and Complete Bind

**Priority:** M (Must Have)

**As a** user
**I want to** mark a Bind as started/completed
**So that** I track my progress toward my Needle (goal)

**Acceptance Criteria:**
- [ ] Tap Bind → Opens Bind Screen
- [ ] Bind Screen shows:
  - Needle context (why this matters)
  - Bind title and description
  - "Start Bind" primary button
  - Timer option (one tap start/stop)
  - Estimated duration
- [ ] Tap "Complete" → Mark Bind as done
- [ ] **Magical, delightful confetti animation** (classy, celebratory, makes user feel accomplished)
- [ ] Return to Thread with updated status
- [ ] Completion time: <30 seconds from open to done
- [ ] **Design Principle:** The entire experience should feel magical and delightful, not transactional

**Data Requirements:**
- Write to `subtask_completions` (immutable event log)
- Fields: `user_id`, `subtask_instance_id`, `completed_at`, `local_date`
- Trigger `event_log`: `subtask_completed`
- Update `daily_aggregates` (async worker)

**Technical Notes:**
- Completions are immutable (audit log)
- Stats recomputed from completions

---

#### US-3.4: Attach Proof to Bind

**Priority:** M (Must Have)

**As a** user
**I want to** attach proof when completing a bind
**So that** I stay accountable and build evidence

**Acceptance Criteria:**
- [ ] After completing bind, prompt: "Add proof?" (optional)
- [ ] Proof options:
  - **Photo:** Camera capture or gallery upload
  - **Note:** Quick text (280 char max)
  - **Timer:** Auto-attached if timer was used
- [ ] Proof attached to completion
- [ ] Skip option (trust-based system)
- [ ] Attach proof in <10 seconds

**Data Requirements:**
- Write to `captures` table
- Write to `subtask_proofs` to link proof to completion
- Upload images to Supabase Storage

**Technical Notes:**
- Max image size: 10MB
- Allowed types: JPEG, PNG
- Proof is optional (trust-based)

---

#### US-3.5: Quick Capture (Document)

**Priority:** M (Must Have)

**As a** user
**I want to** quickly capture memories and notes
**So that** I document my day beyond just binds

**Acceptance Criteria:**
- [ ] Access via floating menu → "Document"
- [ ] Fast capture sheet (not full notes app)
- [ ] Capture types:
  - **Photo:** One tap to camera
  - **Note:** Text input
  - **Voice:** Audio recording (MVP: optional, store as transcription)
- [ ] Optional: Link capture to specific bind
- [ ] If nothing captured yet today: "What's one thing you want to remember?"
- [ ] Capture time: <10 seconds

**Data Requirements:**
- Write to `captures` table
- Fields: `user_id`, `type`, `content`, `local_date`, `linked_subtask_id`
- Trigger `event_log`: `capture_created`
- Update `daily_aggregates.has_proof` = true

**Technical Notes:**
- Voice recording stored as audio file, transcription optional
- Captures contribute to "Active Day with Proof"

---

#### US-3.6: Timer Tracking (Pomodoro-Style)

**Priority:** S (Should Have)

**As a** user
**I want to** track time spent on Binds with a focused timer experience
**So that** I have accurate records of my effort and stay in flow

**Acceptance Criteria:**
- [ ] **Pomodoro-feel timer experience:**
  - Set duration upfront (25 min default, customizable: 15/25/45/60 min options)
  - Focus mode UI (minimal distractions, clean visual)
  - Subtle but satisfying progress visualization (circle fill, progress bar)
  - Satisfying completion moment with sound/haptic feedback
- [ ] One-tap start timer from Bind Screen
- [ ] Running timer displays prominently
- [ ] Option to pause (with confirmation) or extend
- [ ] Timer duration auto-attached to completion as Proof
- [ ] Break reminder after completion (optional)

**Data Requirements:**
- Store timer data in `captures` (type: 'timer')
- Fields: `duration_seconds`, `started_at`, `ended_at`, `preset_duration`

**Technical Notes:**
- Timer should work even when app is backgrounded
- Local notifications for timer completion

---

#### US-3.7: Dual Path Visualization

**Priority:** C (Could Have)

**As a** user
**I want to** see positive/negative trajectories
**So that** I'm motivated to stay on track when I'm feeling doubt

**Acceptance Criteria:**
- [ ] Triggered when user expresses difficulty or doubt (in chat/reflection)
- [ ] **Two components:**
  1. **Visual representation:** Animated paths diverging - one upward (growth), one downward (stagnation)
  2. **AI-generated personalized text:** From Tech Context Engine describing where each path leads based on user's specific Needles and patterns
- [ ] Example positive path: "In 30 days, you'll have completed 45 gym sessions and be 15% closer to your goal weight"
- [ ] Example negative path: "Without consistency, you'll be in the same place as last month"
- [ ] Dismissible but impactful

**AI Module:** Tech Context Engine (trajectory prediction)

**Data Requirements:**
- Read from user's completion history, Needle progress, fulfillment trends
- Generate personalized trajectory predictions

**Technical Notes:**
- Requires sentiment detection in chat/reflection to trigger
- AI generates text based on user's specific context, not generic

---

### Epic 3 Summary

| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-3.1 | View Today's Binds | M | 5 pts |
| US-3.2 | View Triad (AI-recommended) | M | 5 pts |
| US-3.3a | Bind Screen | M | 3 pts |
| US-3.3b | Bind Completion | M | 5 pts |
| US-3.4 | Attach Proof to Bind | M | 5 pts |
| US-3.5 | Quick Capture | M | 5 pts |
| US-3.6 | Timer Tracking | S | 5 pts |
| US-3.7 | Dual Path Visualization | C | 5 pts |

**Epic Total:** 38 story points

**Note:** US-3.2 increased to 5 pts to account for AI fallback chain complexity. US-3.3 split into 3.3a (Bind Screen) and 3.3b (Completion with confetti animation) for implementation clarity. US-3.7 revised down to 5 pts based on implementation assessment.

---

## Epic 4: Reflection & Journaling

### Overview

Users complete daily reflections that generate AI feedback and next-day plans. This is the primary trigger for AI batch operations.

### User Stories

#### US-4.1: Daily Reflection Entry

**Priority:** M (Must Have)

**As a** user
**I want to** reflect on my day with personalized questions
**So that** I process what happened and track what matters to me

**Acceptance Criteria:**
- [ ] Access via Thread → "Daily Check-in" CTA
- [ ] **Default 2 reflection questions:**
  - "How do you feel about today? What worked well and what didn't?"
  - "What is the one thing you want to accomplish tomorrow?"
- [ ] **User-customizable questions:**
  - User can add/edit/remove custom tracking questions
  - Examples: "Did I stick to my diet?", "How many pages did I read?", "Rate my energy level"
  - Custom questions can be numeric (1-10), yes/no, or free text
  - Manage custom questions in Settings or inline "Add question" button
- [ ] Fulfillment score slider (1-10)
- [ ] "Skip" allowed for text fields (not encouraged)
- [ ] Submit button triggers AI batch
- [ ] One screen, minimal scrolling (custom questions expand if added)

**Data Requirements:**
- Write to `journal_entries` table
- Fields: `user_id`, `local_date`, `fulfillment_score`, `default_responses`, `custom_responses`
- Store custom question definitions in `user_profiles.preferences.custom_reflection_questions`
- Trigger `event_log`: `journal_submitted`
- Update `daily_aggregates.has_journal` = true

**Technical Notes:**
- Journal submission is the primary AI batch trigger
- Only one journal entry per day per user
- Custom question responses available to AI for pattern detection

---

#### US-4.2: Recap Before Reflection

**Priority:** S (Should Have)

**As a** user
**I want to** see a summary of today before reflecting
**So that** I remember what I accomplished

**Acceptance Criteria:**
- [ ] Before reflection questions, show:
  - Binds completed today (count and list)
  - Captures created today
  - Time tracked (if any)
- [ ] "This is what you did today" summary
- [ ] Continue to reflection questions

**Data Requirements:**
- Read from `subtask_completions` for today
- Read from `captures` for today

---

#### US-4.3: AI Feedback Generation

**Priority:** M (Must Have)

**As a** user
**I want to** receive AI feedback after reflection
**So that** I get insights I might not see myself

**Acceptance Criteria:**
- [ ] After journal submit, show loading: "Weave is reflecting..."
- [ ] Generate within 20 seconds
- [ ] AI Feedback contains:
  - **Affirming Insight:** Positive pattern or progress
  - **Blocker Insight:** Addresses what's blocking (if detected)
  - **Next-Day Plan:** Tomorrow's triad tasks
- [ ] Display as 3 stacked cards
- [ ] Each card has "Edit" and "Not true" actions
- [ ] User corrections trigger regeneration if needed

**AI Module:** Daily Recap Generator

**Data Requirements:**
- Write to `ai_artifacts` (type: 'recap')
- Write to `triad_tasks` for tomorrow
- Link to `ai_runs` for traceability
- Store `input_hash` for caching

**Technical Notes:**
- Async batch job (202 Accepted)
- Push notification when ready
- Cache TTL: 8 hours

---

#### US-4.4: Edit AI Feedback

**Priority:** M (Must Have)

**As a** user
**I want to** correct AI assumptions
**So that** the AI improves and I maintain control

**Acceptance Criteria:**
- [ ] Each AI insight has "Edit" button
- [ ] Edit opens text editor with current content
- [ ] Save edit stores in `user_edits` table
- [ ] "Not true" marks insight as rejected
- [ ] Rejected insights inform future AI (feedback loop)
- [ ] Edited artifacts marked with `is_user_edited` flag

**Data Requirements:**
- Write to `user_edits` table (JSONPatch format)
- Update `ai_artifacts.is_user_edited`

**Technical Notes:**
- Edited artifacts not overwritten by regeneration
- Tracks edit history for ML improvement

---

#### US-4.5: View Past Journal Entries

**Priority:** S (Should Have)

**As a** user
**I want to** see my past reflections
**So that** I can track my journey over time

**Acceptance Criteria:**
- [ ] Access from Weave Dashboard → Daily Entry Overview
- [ ] List of past journal entries by date
- [ ] Tap entry → View full reflection + AI feedback
- [ ] Filter by date range (7 days, 30 days, 90 days)
- [ ] Search by keyword (optional for MVP)

**Data Requirements:**
- Read from `journal_entries`
- Read from `ai_artifacts` linked to journals

---

### Epic 4 Summary

| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-4.1a | Reflection Questions (Default) | M | 3 pts |
| US-4.1b | Custom Questions | M | 3 pts |
| US-4.2 | Recap Before Reflection | S | 3 pts |
| US-4.3 | AI Feedback Generation | M | 8 pts |
| US-4.4 | Edit AI Feedback | M | 5 pts |
| US-4.5 | View Past Journals | S | 6 pts |

**Epic Total:** 28 story points

**Note:** US-4.1 split into 4.1a (Default 2 questions) and 4.1b (User-customizable questions) for clearer implementation scope. US-4.5 increased to 6 pts to account for filtering, search, and navigation complexity.

---

## Epic 5: Progress Visualization

### Overview

Users view their progress through the Weave Dashboard, including consistency metrics, fulfillment trends, and identity progression.

### User Stories

#### US-5.1: Weave Dashboard Overview

**Priority:** M (Must Have)

**As a** user
**I want to** see my overall progress at a glance
**So that** I understand how I'm doing

**Acceptance Criteria:**
- [ ] Weave (Dashboard) tab accessible from main navigation
- [ ] Top: "Emotional Mirror"
  - Weave level/rank visualization
  - Active needles (goals) summary
  - Dream self reminder
- [ ] Bottom: "Data Mirror"
  - Consistency % with heat map
  - Average fulfillment chart
- [ ] AI insights displayed (from weekly analysis)
- [ ] No AI call on dashboard load (reads pre-computed data)

**Data Requirements:**
- Read from `user_stats` for overall metrics
- Read from `daily_aggregates` for heat map
- Read from `goals` for active needles
- Read from `identity_docs` for dream self
- Read from `ai_artifacts` (type: 'insight') for AI insights

**Technical Notes:**
- All data pre-computed by workers
- Dashboard is read-only (no mutations)

---

#### US-5.2: Consistency Heat Map

**Priority:** M (Must Have)

**As a** user
**I want to** see my consistency as a visual heat map
**So that** I can spot patterns in my behavior

**Acceptance Criteria:**
- [ ] GitHub-style contribution graph
- [ ] Color intensity = completion percentage (not binary)
- [ ] Filter by timeframe: 7 days, 30 days, 60 days, 90 days
- [ ] Filter by: Overall, specific needle, specific bind type
- [ ] Tap date → Navigate to that day's entry overview
- [ ] Moving averages smooth volatility (not weekly resets)

**Data Requirements:**
- Read from `daily_aggregates` for each date
- Compute percentage: `binds_completed / binds_scheduled`

**Technical Notes:**
- Heat map computed on read from aggregates
- No real-time recalculation

---

#### US-5.3: Fulfillment Trend Chart

**Priority:** M (Must Have)

**As a** user
**I want to** see my fulfillment over time
**So that** I can track my emotional progress

**Acceptance Criteria:**
- [ ] Line chart showing fulfillment score (1-10) over time
- [ ] Filter by timeframe: 7 days, 30 days, 60 days, 90 days
- [ ] Show 7-day rolling average (smoothed line)
- [ ] Tap point → Navigate to that day's entry
- [ ] Show "overall average" indicator

**Data Requirements:**
- Read from `journal_entries.fulfillment_score`
- Compute rolling average from `daily_aggregates`

---

#### US-5.4: Weave Character Progression

**Priority:** S (Should Have)

**As a** user
**I want to** see a visual representation of my growth
**So that** I feel my progress is tangible

**Acceptance Criteria:**
- [ ] **Mathematical curve visualization** that increases in complexity and intricacy as user progresses
  - Starts simple (single thread line)
  - Becomes more intertwined and beautiful over time (weave pattern)
  - Visual complexity directly tied to progress metrics
- [ ] Character visualization evolves based on:
  - Total Binds completed
  - Current streak
  - Consistency percentage
- [ ] Milestone-based progression (not daily changes - feels earned)
- [ ] Levels/ranks: Thread → Strand → Cord → Braid → Weave
- [ ] Each level has distinctly more complex mathematical curve pattern
- [ ] Show current level and progress to next
- [ ] Animation when leveling up (special moment)

**Data Requirements:**
- Read from `user_stats.total_binds_completed`
- Read from `user_stats.current_streak`
- Compute rank from thresholds

**Rank Thresholds:**
| Rank | Binds Required | Consistency Req | Visual Complexity |
|------|---------------|-----------------|-------------------|
| Thread | 0 | - | Single line |
| Strand | 20 | 30% | 2-3 intertwined lines |
| Cord | 50 | 50% | 4-5 intertwined lines |
| Braid | 100 | 65% | Complex weave pattern |
| Weave | 200 | 80% | Intricate, beautiful weave |

**Technical Notes:**
- Mathematical curves can be generated using parametric equations
- Consider using SVG or Lottie animations for smooth rendering

---

#### US-5.5: Streak Tracking

**Priority:** M (Must Have)

**As a** user
**I want to** see my current and longest streak
**So that** I'm motivated to maintain consistency

**Acceptance Criteria:**
- [ ] Display current active streak (days)
- [ ] Display longest streak ever
- [ ] Define "streak day" = Active Day with Proof
- [ ] Show "streak resilience" metric (recovery rate after misses)
- [ ] Streak freeze: 3 consecutive days recovers 1 missed day

**Data Requirements:**
- Read from `user_stats.current_streak`
- Read from `user_stats.longest_streak`
- Compute from `daily_aggregates.is_active_day`

**Technical Notes:**
- Streak calculated by worker on completion events
- Streak resilience = (streaks recovered / streaks broken)

---

#### US-5.6: Badge System

**Priority:** S (Should Have)

**As a** user
**I want to** earn badges for milestones
**So that** I have tangible achievements

**Acceptance Criteria:**
- [ ] Badge triggers:
  - 7-day streak
  - 10-day streak
  - 30-day streak
  - 10 binds completed
  - 50 binds completed
  - 100 binds completed
  - First goal archived (completed)
  - First proof captured
- [ ] Badges displayed in Profile
- [ ] Push notification when badge earned
- [ ] Shareable badge card

**Data Requirements:**
- Write to `user_badges` table
- Fields: `user_id`, `badge_type`, `earned_at`

---

#### US-5.7: Day 10 Snapshot (Shareable)

**Priority:** S (Should Have)

**As a** user
**I want to** see a "before vs after" summary at day 10
**So that** I can share my progress and feel accomplished

**Acceptance Criteria:**
- [ ] Triggered at 10 active days with proof
- [ ] Show:
  - Consistency score
  - Rank achieved
  - Badges earned
  - Top 3 wins (AI-selected)
  - Identity shift summary (AI-generated)
- [ ] Shareable card format (image export)
- [ ] "Share" button (native share sheet)
- [ ] Also generated at 30, 60, 90 days

**Data Requirements:**
- Compute from `daily_aggregates`, `user_stats`, `ai_artifacts`
- Store snapshot in `milestone_snapshots` table

**Technical Notes:**
- This is the viral distribution wedge
- Image generation can be client-side (Canvas/SVG)

---

### Epic 5 Summary

| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-5.1 | Dashboard Overview | M | 5 pts |
| US-5.2 | Consistency Heat Map | M | 5 pts |
| US-5.3 | Fulfillment Trend Chart | M | 5 pts |
| US-5.4 | Weave Character Progression | S | 8 pts |
| US-5.5 | Streak Tracking | M | 3 pts |
| US-5.6 | Badge System | S | 5 pts |
| US-5.7 | Day 10 Snapshot | S | 8 pts |

**Epic Total:** 39 story points

---

## Epic 6: AI Coaching

### Overview

Users interact with the Dream Self Advisor for personalized coaching, clarification, and guidance. This is the conversational interface for the AI.

### User Stories

#### US-6.1: Access AI Chat

**Priority:** M (Must Have)

**As a** user
**I want to** talk to my AI coach anytime
**So that** I can get personalized guidance

**Acceptance Criteria:**
- [ ] Access via floating menu → "Talk to Weave"
- [ ] Chat interface with message bubbles
- [ ] Weave initiates with contextual prompt (not blank chat)
- [ ] Quick chips: "Plan my day", "I'm stuck", "Edit my goal", "Explain this bind"
- [ ] User can type free-form messages
- [ ] Streaming response for perceived speed

**Technical Notes:**
- Rate limited: 10 AI chat messages per hour
- Uses Dream Self Advisor module

---

#### US-6.2: Contextual AI Responses

**Priority:** M (Must Have)

**As a** user
**I want to** receive advice that references my actual data
**So that** guidance feels personal, not generic

**Acceptance Criteria:**
- [ ] AI references:
  - Current goals and progress
  - Recent completions and captures
  - Fulfillment scores and trends
  - Identity doc (archetype, dream self)
  - Past wins and patterns
- [ ] No generic advice (e.g., "stay motivated")
- [ ] Evidence-based responses (cites user's actual data)
- [ ] Dream Self voice (from personality document)

**AI Module:** Dream Self Advisor

**Data Requirements:**
- Read from `identity_docs` for personality
- Read from `goals`, `subtask_completions`, `journal_entries` for context
- Context Builder assembles user state

**Technical Notes:**
- Context Builder provides canonical user context
- Personality document ensures deterministic voice

---

#### US-6.3: Edit AI Chat Responses

**Priority:** S (Should Have)

**As a** user
**I want to** correct AI mistakes in chat
**So that** the AI learns and improves

**Acceptance Criteria:**
- [ ] Long-press AI message → "Edit" or "Not helpful"
- [ ] Corrections stored for feedback loop
- [ ] Regenerate option if user provides correction

**Data Requirements:**
- Write corrections to `ai_feedback` table

---

#### US-6.4: AI Weekly Insights

**Priority:** S (Should Have)

**As a** user
**I want to** receive weekly pattern analysis
**So that** I learn about behaviors I don't notice

**Acceptance Criteria:**
- [ ] Generated weekly (scheduled job)
- [ ] Surfaced in Weave Dashboard
- [ ] Insight types:
  - **Pattern:** "You skip gym on Fridays"
  - **Success correlation:** "Morning binds = higher fulfillment"
  - **Trajectory:** "30-day streak incoming"
- [ ] Each insight has evidence and suggestion
- [ ] Can be dismissed or marked helpful

**AI Module:** AI Insights Engine

**Data Requirements:**
- Write to `ai_artifacts` (type: 'insight')
- Schedule via cron job (Sunday night per timezone)

---

#### US-6.5: AI Goal Suggestions

**Priority:** C (Could Have)

**As a** user
**I want to** receive suggestions for new goals
**So that** I continue growing after completing goals

**Acceptance Criteria:**
- [ ] After archiving a goal, AI suggests related goals
- [ ] Based on user's interests and patterns
- [ ] User can accept, modify, or dismiss

**Technical Notes:**
- Post-MVP enhancement
- Requires goal completion data

---

### Epic 6 Summary

| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-6.1 | Access AI Chat | M | 5 pts |
| US-6.2 | Contextual AI Responses | M | 8 pts |
| US-6.3 | Edit AI Chat Responses | S | 3 pts |
| US-6.4 | AI Weekly Insights | S | 8 pts |
| US-6.5 | AI Goal Suggestions | C | 5 pts |

**Epic Total:** 29 story points

---

## Epic 7: Notifications

### Overview

Proactive push notifications keep users engaged without becoming spam. Notifications use Dream Self voice and respect user preferences.

### User Stories

#### US-7.1: Morning Intention Notification

**Priority:** M (Must Have)

**As a** user
**I want to** receive my daily plan each morning
**So that** I start the day with focus

**Acceptance Criteria:**
- [ ] Sent at user's preferred start time
- [ ] Content includes:
  - Today's triad tasks (top 3)
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

#### US-7.2: Bind Reminder Notifications

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

#### US-7.3: Evening Reflection Prompt

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

#### US-7.4: Streak Recovery Notification

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

#### US-7.5: Milestone Celebration Notification

**Priority:** S (Should Have)

**As a** user
**I want to** be celebrated when I hit milestones
**So that** I feel accomplished

**Acceptance Criteria:**
- [ ] Triggered at milestones: 10, 30, 60, 90 active days
- [ ] Also triggered for badge unlocks, goal completions
- [ ] Content affirms identity shift
- [ ] Option to share progress card
- [ ] Deep link to milestone snapshot

**Data Requirements:**
- Triggered by worker after stats update
- Read from `milestone_snapshots`

---

#### US-7.6: Notification Preferences

**Priority:** M (Must Have)

**As a** user
**I want to** control notification frequency and channels
**So that** I'm not overwhelmed and receive notifications where I want them

**Acceptance Criteria:**
- [ ] Nudging intensity slider (1-10)
- [ ] Quiet hours: Start time and end time
- [ ] Per-notification toggles:
  - Morning intention
  - Bind reminders
  - Evening reflection
  - Milestones
- [ ] "Disable all except milestones" option
- [ ] Max 5 notifications per day enforced

**Data Requirements:**
- Store in `user_profiles.preferences.notifications`

**Note:** MVP uses push notifications via Expo Push → APNs. **Future roadmap:** SMS/text messaging integration for users who prefer text-based accountability (requires Twilio or similar).

---

### Epic 7 Summary

| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-7.1 | Morning Intention | M | 5 pts |
| US-7.2 | Bind Reminders | M | 5 pts |
| US-7.3 | Evening Reflection Prompt | M | 3 pts |
| US-7.4 | Streak Recovery | M | 5 pts |
| US-7.5 | Milestone Celebration | S | 5 pts |
| US-7.6 | Notification Preferences | M | 5 pts |

**Epic Total:** 28 story points

---

## Epic 8: Settings & Profile

### Overview

Users manage their account settings, identity document, and app preferences.

### User Stories

#### US-8.1: Profile Overview

**Priority:** M (Must Have)

**As a** user
**I want to** access my profile settings
**So that** I can manage my account

**Acceptance Criteria:**
- [ ] Access from Thread via profile icon
- [ ] Display: Name, email, profile photo (optional)
- [ ] Quick links to:
  - Identity Document
  - Notification Preferences
  - App Settings
  - Help/Support
  - Logout

**Data Requirements:**
- Read from `user_profiles`

---

#### US-8.2: Edit Identity Document

**Priority:** M (Must Have)

**As a** user
**I want to** update my identity document
**So that** the AI evolves with me

**Acceptance Criteria:**
- [ ] View current identity doc:
  - Archetype (with option to retake assessment)
  - Dream self description (editable)
  - Motivations (editable)
  - Failure mode (editable)
  - Coaching preference slider (gentle ↔ strict)
  - Constraints (editable)
- [ ] Save changes creates new version
- [ ] AI uses latest version for coaching

**Data Requirements:**
- Read/Write `identity_docs` table
- Version control (each edit creates new row)
- Store `version` and `created_at`

**Technical Notes:**
- Editing identity doc may affect AI personality
- Consider showing "personality preview" before save

---

#### US-8.3: General Settings

**Priority:** M (Must Have)

**As a** user
**I want to** manage app settings
**So that** I customize my experience

**Acceptance Criteria:**
- [ ] Timezone (auto-detect with override)
- [ ] Preferred working hours
- [ ] Goal change strictness mode
- [ ] Nudging intensity slider
- [ ] Data export (JSON download)
- [ ] Delete account (with confirmation)

**Data Requirements:**
- Read/Write `user_profiles.preferences`

**Technical Notes:**
- Data export: Generate JSON with all user data
- Delete account: Soft delete first, hard delete after 30 days

---

#### US-8.4: Subscription Management

**Priority:** M (Must Have)

**As a** user
**I want to** manage my subscription
**So that** I can upgrade or change my plan

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

**Data Requirements:**
- Read from `subscriptions` table
- Integrate with App Store Connect API

**Technical Notes:**
- MVP: Link to App Store for management
- Track subscription status via webhooks

---

#### US-8.5: Help and Support

**Priority:** S (Should Have)

**As a** user
**I want to** access help resources
**So that** I can resolve issues

**Acceptance Criteria:**
- [ ] FAQ section (in-app)
- [ ] Contact support (email link)
- [ ] Rate app prompt (after 7 active days)
- [ ] Version number display

---

#### US-8.6: Logout and Account Security

**Priority:** M (Must Have)

**As a** user
**I want to** securely logout
**So that** my data is protected

**Acceptance Criteria:**
- [ ] Logout button with confirmation
- [ ] Clear local session data
- [ ] Redirect to login screen
- [ ] Re-authentication required for sensitive actions (delete account)

**Technical Notes:**
- Supabase Auth handles session management
- JWT tokens invalidated on logout

---

### Epic 8 Summary

| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-8.1 | Profile Overview | M | 3 pts |
| US-8.2 | Edit Identity Document | M | 5 pts |
| US-8.3 | General Settings | M | 5 pts |
| US-8.4 | Subscription Management | M | 5 pts |
| US-8.5 | Help and Support | S | 3 pts |
| US-8.6 | Logout and Security | M | 2 pts |

**Epic Total:** 23 story points

---

## Epic DS: Design System Rebuild

**User Outcome:** Complete rebuild as a new standalone package **`weave-design-system`** with 70 production-ready components following Tamagui patterns, Atomic Design principles, and modern animation standards.

**Context:** The existing design system (`src/design-system`) is "vibe-coded," buggy, and inconsistent. This epic creates a **completely new package** called `weave-design-system` from scratch with:
- **220+ design tokens** (colors, typography, spacing, effects, animations)
- **Tamagui-inspired architecture** (composable anatomy, theme builder, runtime theming)
- **Atomic Design organization** (Atoms → Molecules → Organisms)
- **Spring physics animations** (using Reanimated `withSpring()`)
- **Dark-first aesthetic** (Opal-inspired glassmorphism, OLED optimization)
- **75% test coverage** enforced in CI with Chromatic visual regression
- **Full TypeScript support** with prop intellisense

**Why This Order:** Design system foundation enables consistent, rapid UI development across all other epics. Must be completed early to prevent design debt and component inconsistencies.

**Package Structure:**
- **Location:** `packages/weave-design-system/` (new standalone package)
- **Old system:** `src/design-system/` (deprecated, will be removed after migration)
- **Import path:** `import { Button, Card } from '@weave/design-system'`
- **Package name:** `@weave/design-system`
- **Versioning:** Semantic versioning starting at `v0.1.0` (pre-release)

**Migration Strategy:**
1. Build new `weave-design-system` package alongside old system
2. Create adapter layer for gradual component migration
3. Use feature flags for component rollout
4. Remove old `src/design-system` after all features migrated
5. Publish to npm for potential reuse across future Weave products

**FRs Covered:** FR-DS-1 through FR-DS-10

---

### User Stories

#### US-DS-1: Foundation (Tokens + Theme + Animations)

**Priority:** M (Must Have)

**As a** developer
**I want** a comprehensive token system with runtime theme switching
**So that** I can build consistent UIs with dark/light modes and smooth animations

**Acceptance Criteria:**
- [ ] **220+ Design Tokens** organized by category:
  - **Colors (60+ tokens):** `dark[50-950]`, `accent[50-950]`, `violet[50-950]`, `amber[50-950]`, `rose[50-950]`, `emerald[50-950]`
  - **Semantic colors:** `semantic.success`, `semantic.warning`, `semantic.error`, `semantic.info`
  - **Background colors:** `background.primary`, `background.secondary`, `background.tertiary`, `background.elevated`
  - **Text colors:** `text.primary`, `text.secondary`, `text.tertiary`, `text.disabled`, `text.inverse`
  - **Border colors:** `border.primary`, `border.secondary`, `border.focus`, `border.error`
  - **Heat map colors:** `heatMap.none`, `heatMap.minimal`, `heatMap.low`, `heatMap.medium`, `heatMap.high`
  - **Gradients:** `weaveGradient.primary`, `weaveGradient.accent`, `gradients.sunset`, `gradients.ocean`, `gradients.aurora`
  - **Typography (45+ tokens):** `fontFamily.sans`, `fontFamily.mono`, `fontSizes.xs-5xl`, `fontWeights.light-black`, `lineHeights.tight-loose`, `letterSpacing.tight-wide`
  - **Display scale:** `display.xs-3xl` (large heading styles)
  - **Label scale:** `label.xs-xl` (small UI text styles)
  - **Mono scale:** `mono.xs-lg` (code/monospace styles)
  - **Spacing (25+ tokens):** `spacing[0-24]` (0px to 96px in logical increments), `layout.screenPadding`, `layout.cardPadding`, `gap.xs-xl`, `inset.xs-xl`
  - **Effects (35+ tokens):**
    - **Shadows:** `shadows.sm`, `shadows.md`, `shadows.lg`, `shadows.xl`, `shadows.card`, `shadows.modal`
    - **Glows:** `glows.sm`, `glows.md`, `glows.lg` (colored shadow tints)
    - **Glass effects:** `glass.light`, `glass.medium`, `glass.heavy` (blur + opacity presets)
    - **Blur:** `blur.sm`, `blur.md`, `blur.lg`, `blur.xl`
    - **Opacity:** `opacity[10-90]` (10% increments)
  - **Borders (20+ tokens):**
    - **Radius:** `radius.xs-3xl`, `componentRadius.button`, `componentRadius.card`, `componentRadius.input`, `componentRadius.modal`
    - **Border widths:** `borderWidth.thin`, `borderWidth.regular`, `borderWidth.thick`
  - **Animations (35+ tokens):**
    - **Durations:** `durations.instant`, `durations.fast`, `durations.normal`, `durations.slow`, `durations.slower`
    - **Easings:** `easings.easeInOut`, `easings.easeOut`, `easings.spring`
    - **Springs:** `springs.gentle`, `springs.snappy`, `springs.bouncy`, `springs.stiff`
    - **Motion presets:** `motion.fadeIn`, `motion.slideUp`, `motion.scale`, `motion.pressIn`
    - **Reduced motion:** `reducedMotion.disable` (accessibility support)

- [ ] **ThemeProvider + Runtime Switching:**
  - `ThemeProvider` wrapper component with `mode` prop (`dark` | `light`)
  - `useTheme()` hook returns: `{ colors, spacing, typography, layout, shadows, radius, animations, mode }`
  - `useThemeMode()` hook for toggling: `{ mode, setMode, toggleMode, isDark }`
  - Specialized hooks: `useColors()`, `useSpacing()`, `useTypography()`, `useAnimations()`
  - Theme switches without app reload (CSS custom properties + React Context)

- [ ] **Tamagui-Inspired Theme Builder:**
  - Nested theme support: `<Theme name="violet">...</Theme>` overrides accent color
  - Color-matched shadows: violet button → violet shadow tint
  - Theme inheritance: child themes merge with parent themes

- [ ] **Animation Library (Reanimated):**
  - Spring presets using `withSpring()`:
    ```typescript
    export const springs = {
      gentle: { damping: 15, stiffness: 150, mass: 0.8 },
      snappy: { damping: 20, stiffness: 300, mass: 0.5 },
      bouncy: { damping: 10, stiffness: 200, mass: 1.2 }
    }
    ```
  - Motion presets for common animations (fadeIn, slideUp, scale, pressIn)
  - Accessibility: respect `reducedMotion` setting

**Technical Notes:**
- Use React Context for theme state management
- CSS custom properties for runtime theme switching
- Reanimated `useSharedValue()` + `withSpring()` for all animations
- Token files organized by category in `src/design-system/tokens/`

**Estimate:** 5 story points

---

#### US-DS-2: Core Primitives (Text, Buttons, Icons)

**Priority:** M (Must Have)

**As a** developer
**I want** foundational text, button, and icon components with variants
**So that** I can build UIs with consistent typography and interactions

**Acceptance Criteria:**

**Text Components (11 total):**
- [ ] **Text** - Base text component with variant prop
  - Props: `variant`, `color`, `weight`, `align`, `numberOfLines`, `ellipsizeMode`
  - Variants: `displayLg`, `displayMd`, `displaySm`, `titleLg`, `titleMd`, `titleSm`, `bodyLg`, `bodyMd`, `bodySm`, `caption`, `label`
  - Auto-applies typography tokens based on variant
- [ ] **AnimatedText** - Text with entrance animation support
  - Props: Same as Text + `animation` (`fadeIn` | `slideUp` | `typewriter`)
  - Uses Reanimated for smooth animations
- [ ] **Heading** - Semantic heading (h1-h6 equivalent)
  - Props: `level` (1-6), `color`, `weight`
  - Maps to appropriate display/title variants
- [ ] **Title** - Preset for title text (`variant="titleMd"`)
- [ ] **Subtitle** - Preset for subtitle text (`variant="titleSm"`)
- [ ] **Body** - Preset for body text (`variant="bodyMd"`)
- [ ] **BodySmall** - Preset for small body text (`variant="bodySm"`)
- [ ] **Caption** - Preset for caption text (`variant="caption"`)
- [ ] **Label** - Preset for label text (`variant="label"`)
- [ ] **Link** - Interactive text with underline + press animation
  - Props: `href`, `onPress`, `external`, `disabled`
  - Spring-based press animation
- [ ] **Mono** - Monospace text for code/data
  - Props: `variant` (mono.xs - mono.lg), `color`

**Button Components (7 total):**
- [ ] **Button** - Base button with composable anatomy
  - **Unstyled variant** for full customization
  - **Styled variants:** `primary`, `secondary`, `ghost`, `destructive`, `ai`
  - **Composable anatomy (Radix pattern):**
    ```typescript
    <Button>
      <Button.Icon name="sparkles" />
      <Button.Text>Generate</Button.Text>
      <Button.Spinner /> // Shows during loading
    </Button>
    ```
  - Props: `variant`, `size` (`sm` | `md` | `lg`), `disabled`, `loading`, `onPress`, `fullWidth`
  - **Spring press animation:**
    ```typescript
    const scale = useSharedValue(1)
    const handlePressIn = () => { scale.value = withSpring(0.95, springs.snappy) }
    const handlePressOut = () => { scale.value = withSpring(1, springs.snappy) }
    ```
  - **Color-matched shadows:** Primary button (violet) → violet glow shadow
- [ ] **PrimaryButton** - Preset with `variant="primary"`
- [ ] **SecondaryButton** - Preset with `variant="secondary"`
- [ ] **GhostButton** - Preset with `variant="ghost"`
- [ ] **DestructiveButton** - Preset with `variant="destructive"` (red accent)
- [ ] **AIButton** - Preset with `variant="ai"` (gradient, sparkle icon, special animations)
- [ ] **IconButton** - Square button with only icon
  - Props: `icon` (Lucide icon name), `size`, `variant`, `onPress`
  - Auto-centers icon, maintains square aspect ratio

**Icon Wrapper (1 total):**
- [ ] **Icon** - Lucide icon wrapper with theme colors
  - Props: `name` (100+ curated Lucide icons), `size`, `color`, `strokeWidth`
  - Themed colors: `color="text.primary"` maps to theme token

**Technical Notes:**
- Button pressable feedback using Reanimated `useSharedValue()` + `withSpring()`
- Icon integration with `lucide-react-native`
- All text components support theme color tokens via `color` prop
- Composable anatomy allows flexible button layouts

**Estimate:** 6 story points

---

#### US-DS-3: Form Components

**Priority:** M (Must Have)

**As a** developer
**I want** text inputs, textareas, search inputs, checkboxes, and toggles
**So that** I can build forms with consistent styling and validation

**Acceptance Criteria:**

**Input Components (3 total):**
- [ ] **Input** - Text input with floating label, composable anatomy
  - **Composable anatomy:**
    ```typescript
    <Input>
      <Input.Label>Email</Input.Label>
      <Input.Field placeholder="you@example.com" />
      <Input.Error>Invalid email format</Input.Error>
      <Input.Helper>We'll never share your email</Input.Helper>
    </Input>
    ```
  - Props: `value`, `onChangeText`, `placeholder`, `disabled`, `error`, `size` (`sm` | `md` | `lg`)
  - **Floating label animation:**
    ```typescript
    const labelY = useSharedValue(16)
    const labelScale = useSharedValue(1)
    // When focused or has value: labelY → 0, labelScale → 0.85
    useEffect(() => {
      if (isFocused || value) {
        labelY.value = withSpring(0, springs.snappy)
        labelScale.value = withSpring(0.85, springs.snappy)
      }
    }, [isFocused, value])
    ```
  - States: default, focused (violet border), error (red border), disabled (gray)

- [ ] **TextArea** - Multiline text input with auto-expanding height
  - Props: Same as Input + `numberOfLines`, `maxHeight`
  - Auto-expands height as user types (up to `maxHeight`)
  - Supports floating label

- [ ] **SearchInput** - Input with search icon, clear button, and debounced onChange
  - Props: `value`, `onChangeText`, `onSearch`, `debounceMs` (default 300)
  - Left icon: search magnifying glass
  - Right icon: clear button (X) when has value
  - Debounced onChange for search queries

**Selection Components (4 total - includes future Radio + Toggle):**
- [ ] **Checkbox** - Checkbox with checkmark animation
  - Props: `checked`, `onChange`, `disabled`, `size` (`sm` | `md` | `lg`), `label`
  - **Checkmark animation:** Scale + rotate checkmark path on check
    ```typescript
    const checkScale = useSharedValue(0)
    const checkRotate = useSharedValue(-90)
    if (checked) {
      checkScale.value = withSpring(1, springs.bouncy)
      checkRotate.value = withSpring(0, springs.snappy)
    }
    ```

- [ ] **BindCheckbox** - Gamified checkbox with streak indicator
  - Props: Same as Checkbox + `streak` (number of consecutive completions)
  - Visual: Small flame icon + streak count when `streak > 0`
  - Spring bounce animation on check + confetti burst

- [ ] **Radio** - Radio button group (future enhancement)
  - Props: `options`, `value`, `onChange`, `disabled`

- [ ] **Toggle** - Switch toggle (future enhancement)
  - Props: `value`, `onChange`, `disabled`, `size`

**Technical Notes:**
- All form components support theme tokens for colors
- Floating labels use Reanimated for smooth transitions
- Error states trigger red border + error message display
- Composable anatomy allows flexible form layouts

**Estimate:** 7 story points

---

#### US-DS-4: Layout & Cards

**Priority:** M (Must Have)

**As a** developer
**I want** cards, navigation components, badges, and avatars
**So that** I can build layouts with consistent spacing and visual hierarchy

**Acceptance Criteria:**

**Card Components (4 total):**
- [ ] **Card** - Base card with composable anatomy
  - **Composable anatomy:**
    ```typescript
    <Card>
      <Card.Header>
        <Card.Title>Goal Progress</Card.Title>
        <Card.Subtitle>This week</Card.Subtitle>
      </Card.Header>
      <Card.Content>
        {/* Main content */}
      </Card.Content>
      <Card.Footer>
        <Button>View Details</Button>
      </Card.Footer>
    </Card>
    ```
  - Props: `variant` (`elevated` | `flat` | `outlined`), `padding` (`none` | `sm` | `md` | `lg`)
  - Variants: elevated (shadow), flat (no shadow), outlined (border only)

- [ ] **GlassCard** - Glassmorphic card (Opal-inspired)
  - Props: Same as Card + `blurIntensity` (`light` | `medium` | `heavy`)
  - Visual: Semi-transparent background + backdrop blur + subtle border
  - Example: `background: rgba(dark[800], 0.6)` + `blur(20px)`

- [ ] **ElevatedCard** - Card with larger shadow
  - Preset: `<Card variant="elevated" />` with `shadows.xl`

- [ ] **AICard** - Card with violet gradient border + shimmer effect
  - Visual: Animated gradient border using `LinearGradient`
  - Shimmer animation: Subtle moving gradient overlay

**Navigation Components (3 total):**
- [ ] **BottomTabBar** - Bottom navigation bar
  - Props: `tabs` (array of `{ id, label, icon, badge }`), `activeTab`, `onTabChange`
  - Active tab: violet accent color + scale animation
  - Inactive tabs: gray color
  - Spring animation on tab press

- [ ] **HeaderBar** - Top navigation header
  - Props: `title`, `leftAction`, `rightAction`, `transparent`
  - Left action: back button or custom component
  - Right action: custom component (e.g., settings icon)
  - Supports transparent mode for scroll-based reveal

- [ ] **BackButton** - Back navigation button
  - Props: `onPress`, `label`, `icon`
  - Default: chevron-left icon + optional label
  - Spring press animation

**Badge Components (6 total):**
- [ ] **Badge** - Small label with count or status
  - Props: `variant` (`default` | `success` | `warning` | `error` | `info`), `size` (`sm` | `md`), `text`
  - Variants use semantic colors

- [ ] **CountBadge** - Badge showing numeric count
  - Props: `count`, `max` (shows "99+" when exceeded), `variant`

- [ ] **StatusDot** - Small colored dot for status indication
  - Props: `status` (`online` | `offline` | `away` | `busy`), `size`

- [ ] **StreakBadge** - Badge showing streak count with flame icon
  - Props: `streak`, `size`
  - Visual: 🔥 icon + streak number
  - Animated pulse when streak increases

- [ ] **AIBadge** - Badge with sparkle icon for AI features
  - Visual: ✨ icon + "AI" text + violet gradient background

- [ ] **ConsistencyBadge** - Badge showing consistency percentage
  - Props: `percentage`, `size`
  - Color scales with percentage: red (<50%) → amber (50-79%) → emerald (80-100%)

**Avatar Components (3 total):**
- [ ] **Avatar** - User avatar with image or initials fallback
  - Props: `src` (image URL), `name` (for initials), `size` (`xs` | `sm` | `md` | `lg` | `xl`), `shape` (`circle` | `square`), `status` (optional status dot)
  - Fallback: Show initials (first 2 letters) when no image
  - Status dot: small colored dot overlayed in corner

- [ ] **AvatarGroup** - Stack of overlapping avatars
  - Props: `avatars` (array of avatar props), `max` (shows "+N" for overflow), `size`
  - Visual: Avatars overlap by 25% with border

- [ ] **AvatarWithName** - Avatar with name label below
  - Props: Same as Avatar + `showName`
  - Layout: Avatar stacked above name text

**Technical Notes:**
- All cards support nested theme contexts
- Navigation components integrate with React Navigation
- Badges use semantic color tokens for variants
- Avatars handle missing images gracefully with initials

**Estimate:** 6 story points

---

#### US-DS-5: Feedback & Overlays

**Priority:** M (Must Have)

**As a** developer
**I want** modals, toasts, and bottom sheets
**So that** I can show overlays and notifications with consistent animations

**Acceptance Criteria:**

**Modal Component:**
- [ ] **Modal** - Full-screen modal overlay with backdrop
  - Props: `visible`, `onClose`, `title`, `children`, `dismissable`, `size` (`sm` | `md` | `lg` | `fullscreen`)
  - **Entrance animation:** Backdrop fade in + modal slide up from bottom
    ```typescript
    const backdropOpacity = useSharedValue(0)
    const modalY = useSharedValue(screenHeight)
    useEffect(() => {
      if (visible) {
        backdropOpacity.value = withTiming(0.6, { duration: 200 })
        modalY.value = withSpring(0, springs.snappy)
      }
    }, [visible])
    ```
  - Backdrop: Semi-transparent black with blur
  - Dismissable: tap backdrop or swipe down to close
  - Accessibility: traps focus within modal, restores focus on close

**Toast Component:**
- [ ] **Toast** - Temporary notification message
  - Props: `message`, `type` (`success` | `error` | `warning` | `info`), `duration` (default 3000ms), `action` (optional action button)
  - **Entrance animation:** Slide down from top + fade in
    ```typescript
    const toastY = useSharedValue(-100)
    const toastOpacity = useSharedValue(0)
    useEffect(() => {
      // Enter
      toastY.value = withSpring(0, springs.gentle)
      toastOpacity.value = withTiming(1, { duration: 200 })
      // Auto-dismiss after duration
      setTimeout(() => {
        toastY.value = withSpring(-100, springs.gentle)
        toastOpacity.value = withTiming(0, { duration: 200 })
      }, duration)
    }, [])
    ```
  - Visual: Uses semantic colors for type (success = emerald, error = rose, etc.)
  - Position: Top of screen with safe area padding
  - Stacking: Multiple toasts stack vertically

**Bottom Sheet Component:**
- [ ] **BottomSheet** - Swipeable bottom sheet
  - Props: `visible`, `onClose`, `snapPoints` (array of percentages like `[0.3, 0.7]`), `children`, `dismissable`
  - **Gesture-driven animation:** Pan gesture + spring physics
    ```typescript
    const panGesture = Gesture.Pan()
      .onUpdate((e) => {
        sheetY.value = Math.max(0, e.translationY)
      })
      .onEnd((e) => {
        const shouldClose = e.velocityY > 500 || sheetY.value > screenHeight * 0.4
        if (shouldClose) {
          sheetY.value = withSpring(screenHeight, springs.snappy)
          runOnJS(onClose)()
        } else {
          sheetY.value = withSpring(0, springs.snappy)
        }
      })
    ```
  - Snap points: Sheet snaps to predefined heights (e.g., 30%, 70%)
  - Backdrop: Semi-transparent black with blur
  - Dismissable: swipe down or tap backdrop to close

**Technical Notes:**
- All overlays use React Native Gesture Handler for smooth interactions
- Reanimated for spring physics and performance
- Overlays render in `<Portal>` to avoid z-index issues
- Toast notifications use a global queue (max 3 visible at once)

**Estimate:** 5 story points

---

#### US-DS-6: Data Visualization & Progress

**Priority:** M (Must Have)

**As a** developer
**I want** progress bars, circular progress, stat cards, and heat maps
**So that** I can visualize user progress and data

**Acceptance Criteria:**

**Progress Components (2 total):**
- [ ] **ProgressBar** - Horizontal progress bar with gradient fill
  - Props: `value` (0-100), `size` (`sm` | `md` | `lg`), `color` (theme color or gradient), `showLabel`, `animated`
  - **Gradient fill animation:**
    ```typescript
    const progressWidth = useSharedValue(0)
    useEffect(() => {
      progressWidth.value = withSpring(value, springs.gentle)
    }, [value])
    ```
  - Visual: Gradient from `accent[400]` to `accent[600]` for fill
  - Label: Shows percentage when `showLabel={true}`

- [ ] **CircularProgress** - Circular progress indicator
  - Props: `value` (0-100), `size`, `strokeWidth`, `color`, `showLabel`
  - **Arc animation:** Animated SVG arc using Reanimated
    ```typescript
    const animatedAngle = useSharedValue(0)
    useEffect(() => {
      animatedAngle.value = withSpring((value / 100) * 360, springs.gentle)
    }, [value])
    ```
  - Visual: Circular stroke with animated fill
  - Label: Shows percentage in center when `showLabel={true}`

**Stat Card Components (4 total):**
- [ ] **StatCard** - Card displaying key metric
  - Props: `label`, `value`, `trend` (`up` | `down` | `neutral`), `trendValue`, `icon`, `color`
  - Visual: Large value text + trend indicator (arrow + percentage)
  - Color: Trend up = emerald, down = rose, neutral = gray

- [ ] **StatCardGrid** - Grid layout for multiple stat cards
  - Props: `stats` (array of StatCard props), `columns` (1-3)
  - Responsive grid with equal-width cards

- [ ] **MiniStatCard** - Compact stat card
  - Props: Same as StatCard but smaller size
  - Visual: Smaller text, icon on left

- [ ] **ProgressStatCard** - Stat card with embedded progress bar
  - Props: Same as StatCard + `progress` (0-100)
  - Visual: Stat + horizontal progress bar below

**Heat Map Component:**
- [ ] **ConsistencyHeatmap** - GitHub-style activity heat map
  - Props: `data` (array of `{ date: string, level: 0-4 }`), `startDate`, `endDate`, `onDayPress`
  - **Visual:** 7-row grid (days of week) with colored squares
  - **Color scale (5 levels):**
    - Level 0 (none): `heatMap.none` (dark[800])
    - Level 1 (minimal): `heatMap.minimal` (emerald[900])
    - Level 2 (low): `heatMap.low` (emerald[700])
    - Level 3 (medium): `heatMap.medium` (emerald[500])
    - Level 4 (high): `heatMap.high` (emerald[400])
  - **Tap interaction:** Spring scale animation + shows day detail tooltip
  - **Scroll:** Horizontal scroll for viewing past months

**Technical Notes:**
- Progress components use Reanimated for smooth animations
- Circular progress uses `react-native-svg` for arc rendering
- Heat map uses `FlatList` with optimized rendering for large datasets
- All components support theme color customization

**Estimate:** 6 story points

---

#### US-DS-7: Weave-Specific Cards

**Priority:** M (Must Have)

**As a** developer
**I want** specialized cards for Needles, Binds, Captures, Insights, Success, and Timer
**So that** I can display Weave-specific content with consistent styling

**Acceptance Criteria:**

**Weave-Specific Components (6 total):**

- [ ] **NeedleCard** - Goal card with progress ring
  - Props: `title`, `description`, `progress` (0-100), `bindsCount`, `consistencyPercentage`, `onPress`
  - **Visual:**
    - Circular progress ring around goal icon
    - Title + description text
    - Stats row: "X binds • Y% consistent"
    - Tap to navigate to goal detail
  - **Animation:** Progress ring animates on mount using `withSpring()`
  - **Accessibility:** VoiceOver reads "Goal: {title}, {progress}% complete"

- [ ] **BindCard** - Task card with checkbox animation
  - Props: `title`, `goalName`, `isCompleted`, `streak`, `onComplete`, `onPress`
  - **Visual:**
    - Large checkbox on left (gamified with `BindCheckbox`)
    - Title + goal name (small gray text)
    - Streak indicator when `streak > 0` (flame icon + count)
  - **Checkbox animation:**
    ```typescript
    // Spring scale + confetti burst on complete
    const checkScale = useSharedValue(0.8)
    const handleComplete = () => {
      checkScale.value = withSequence(
        withSpring(1.2, springs.bouncy),
        withSpring(1, springs.gentle)
      )
      // Trigger confetti
      confetti.show()
    }
    ```
  - **Confetti:** Classy confetti burst (15-20 particles, violet/amber colors, 1s duration)

- [ ] **CaptureCard** - Proof/memory card with image preview
  - Props: `type` (`photo` | `note` | `voice` | `timer`), `thumbnailUrl`, `note`, `timestamp`, `bindTitle`, `onPress`
  - **Visual:**
    - Small thumbnail (if photo/video) or icon (if note/voice/timer)
    - Note preview text (truncated to 2 lines)
    - Timestamp + linked bind name
  - **Animation:** Spring press animation on tap

- [ ] **InsightCard** - AI insight card with gradient border
  - Props: `type` (`affirming` | `blocker` | `triad`), `title`, `content`, `onEdit`, `onDismiss`
  - **Visual:**
    - Violet gradient border (uses `LinearGradient`)
    - Icon based on type (✅ affirming, ⚠️ blocker, ✨ triad)
    - Title + content text
    - Action buttons: Edit, Dismiss
  - **Animation:** Fade + slide in from bottom on mount

- [ ] **SuccessCard** - Celebration card with confetti
  - Props: `title`, `message`, `imageUrl`, `confettiEnabled`, `onClose`
  - **Visual:**
    - Large celebration icon or image
    - Title + message text
    - Confetti animation (if enabled)
  - **Confetti:** More particles than BindCard (40-50), rainbow colors, 2s duration

- [ ] **Timer** - Pomodoro-style countdown timer
  - Props: `duration` (seconds), `onComplete`, `onPause`, `onResume`
  - **Visual:**
    - Large circular progress ring (counts down)
    - Time remaining in center (MM:SS format)
    - Play/pause button below
    - Haptic feedback every minute
  - **Animation:** Smooth countdown using Reanimated
    ```typescript
    const timeRemaining = useSharedValue(duration)
    useEffect(() => {
      const interval = setInterval(() => {
        if (timeRemaining.value > 0) {
          timeRemaining.value -= 1
        } else {
          clearInterval(interval)
          onComplete()
        }
      }, 1000)
    }, [])
    ```
  - **Completion:** Haptic burst + satisfying completion sound + visual animation

**Technical Notes:**
- All cards use spring animations for interactions
- Confetti uses `react-native-confetti-cannon` library
- Timer uses Reanimated for performance (60fps countdown)
- InsightCard gradient uses `expo-linear-gradient`
- All cards support dark mode with theme tokens

**Estimate:** 8 story points (most complex components)

---

#### US-DS-8: Loading & Empty States

**Priority:** M (Must Have)

**As a** developer
**I want** skeleton loaders and empty state components
**So that** I can show loading states and empty screens consistently

**Acceptance Criteria:**

**Skeleton Loader Components (8 total):**

- [ ] **Skeleton** - Base rectangular skeleton with shimmer animation
  - Props: `width`, `height`, `borderRadius`, `shimmerSpeed` (default 1500ms)
  - **Shimmer animation:**
    ```typescript
    const shimmerX = useSharedValue(-screenWidth)
    useEffect(() => {
      shimmerX.value = withRepeat(
        withTiming(screenWidth * 2, { duration: shimmerSpeed, easing: Easing.linear }),
        -1, // Infinite
        false
      )
    }, [])
    ```
  - Visual: Gray rectangle with moving shimmer gradient overlay

- [ ] **SkeletonText** - Multiple text lines with varying widths
  - Props: `lines` (number of lines), `gap` (spacing between lines)
  - Visual: Stack of skeleton rectangles with different widths (mimics text lines)

- [ ] **SkeletonAvatar** - Circular skeleton for avatars
  - Props: `size` (`xs` | `sm` | `md` | `lg` | `xl`)
  - Visual: Circular skeleton with shimmer

- [ ] **SkeletonCard** - Card-shaped skeleton
  - Props: `height`, `padding`
  - Visual: Rounded rectangle skeleton (mimics Card component)

- [ ] **SkeletonListItem** - List item skeleton (avatar + 2 text lines)
  - Visual: Small circular skeleton (avatar) + 2 text line skeletons on right

- [ ] **SkeletonBindCard** - Skeleton matching BindCard layout
  - Visual: Circular skeleton (checkbox) + 2 text line skeletons on right

- [ ] **SkeletonStatCard** - Skeleton matching StatCard layout
  - Visual: Small text skeleton (label) + large text skeleton (value)

- [ ] **SkeletonProgressCard** - Skeleton matching ProgressStatCard layout
  - Visual: Stat skeleton + progress bar skeleton below

**Empty State Components (10 total):**

- [ ] **EmptyState** - Generic empty state with icon, message, and CTA
  - Props: `icon`, `title`, `message`, `action` (button props), `illustration` (optional Lottie animation)
  - Visual: Large icon/illustration + title + message + action button
  - Center-aligned, vertically centered on screen

- [ ] **EmptyGoals** - Empty state for no goals
  - Preset: icon = target, title = "No goals yet", message = "Create your first goal to get started", action = "Create Goal"

- [ ] **EmptyBinds** - Empty state for no binds today
  - Preset: icon = checkbox, title = "No tasks for today", message = "Add binds to your goals to see them here", action = "Add Bind"

- [ ] **EmptyCaptures** - Empty state for no captures
  - Preset: icon = camera, title = "No memories yet", message = "Document your wins and progress", action = "Quick Capture"

- [ ] **EmptyJournal** - Empty state for no journal entries
  - Preset: icon = book, title = "Your journey starts today", message = "Complete your first reflection to track progress", action = "Start Reflection"

- [ ] **EmptySearch** - Empty state for no search results
  - Preset: icon = search, title = "No results found", message = "Try different keywords or filters", action = null

- [ ] **EmptyNotifications** - Empty state for no notifications
  - Preset: icon = bell, title = "All caught up!", message = "No new notifications", action = null

- [ ] **ErrorState** - Generic error state
  - Props: `title`, `message`, `onRetry`
  - Preset: icon = alert-circle, title = "Something went wrong", action = "Try Again"

- [ ] **NoConnectionState** - Offline/no connection error
  - Preset: icon = wifi-off, title = "No internet connection", message = "Check your connection and try again", action = "Retry"

- [ ] **ComingSoonState** - Feature not yet available
  - Preset: icon = construction, title = "Coming soon", message = "We're working on this feature", action = null

**Technical Notes:**
- All skeleton components use the same shimmer animation for consistency
- Shimmer gradient: `linear-gradient(90deg, transparent, rgba(white, 0.1), transparent)`
- Empty states support optional Lottie animations for visual interest
- Error states include retry functionality with automatic retry after timeout

**Estimate:** 4 story points

---

#### US-DS-9: Testing & Storybook

**Priority:** M (Must Have)

**As a** developer
**I want** comprehensive testing and Storybook documentation
**So that** I can ensure component quality and visual consistency

**Acceptance Criteria:**

**Storybook Setup:**
- [ ] Storybook v7 installed and configured for React Native
- [ ] All 70 components have Storybook stories
- [ ] Each story demonstrates:
  - Default state
  - All variants
  - Interactive controls (Storybook args)
  - Props documentation
  - Usage examples
- [ ] Dark mode toggle in Storybook toolbar
- [ ] Responsive viewport presets (iPhone SE, iPhone 14, iPhone 14 Pro Max)

**Unit Testing (75% coverage enforced):**
- [ ] Jest + React Native Testing Library configured
- [ ] All 70 components have unit tests covering:
  - Rendering without errors
  - Props validation
  - User interactions (press, type, etc.)
  - Accessibility (VoiceOver labels, roles)
  - Edge cases (missing props, empty states)
- [ ] Coverage report generated on every commit
- [ ] CI fails if coverage drops below 75%

**Visual Regression Testing:**
- [ ] Chromatic integrated for visual regression
- [ ] Snapshots captured for:
  - All component variants
  - Light + dark modes
  - Different screen sizes
- [ ] CI fails on visual regressions without approval

**Performance Testing:**
- [ ] Bundle size analysis with `@react-native-community/cli-plugin-metro`
- [ ] Target: Design system bundle <150KB (gzipped)
- [ ] CI warns if bundle size increases >10%

**Render performance:**
- [ ] All animations run at 60fps (verified with React DevTools Profiler)
- [ ] No component takes >16ms to render (1 frame at 60fps)

**Accessibility Testing:**
- [ ] All interactive components have accessibility labels
- [ ] Screen reader navigation tested with VoiceOver (iOS)
- [ ] Color contrast meets WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large text)
- [ ] Reduced motion setting respected (animations disabled when enabled)

**CI/CD Quality Gates:**
- [ ] Linting: ESLint + Prettier (100% compliance)
- [ ] Tests: 75% coverage minimum
- [ ] Type safety: TypeScript strict mode (0 errors)
- [ ] Bundle size: <150KB gzipped
- [ ] Visual regression: No unapproved changes

**Documentation:**
- [ ] README.md with:
  - Installation instructions
  - Quick start guide
  - Component API reference
  - Theme customization guide
  - Animation guidelines
- [ ] CONTRIBUTING.md with:
  - Code style guide
  - Component development workflow
  - Testing requirements
  - PR checklist

**Technical Notes:**
- Use `@storybook/react-native` for native Storybook support
- Chromatic requires GitHub Actions integration
- Bundle size tracked with `size-limit` package
- Accessibility audit using `@react-native-community/eslint-plugin`

**Estimate:** 6 story points

---

#### US-DS-10: Additional Form & Layout Components

**Priority:** M (Must Have)

**As a** developer
**I want** slider, radio, toggle, tabs, divider, and list item components
**So that** I can implement all documented MVP features requiring these form primitives

**Context:** Research on Tamagui and UI Kitten revealed 6 critical missing components that block 11+ documented MVP features (FR-1.13, FR-1.14, FR-2.6, FR-4.1, FR-7.6, FR-8.2, FR-8.3). Both reference libraries include these as standard form primitives. Adding these components ensures the design system is complete and prevents technical debt.

**Acceptance Criteria:**

**Slider Component:**
- [ ] **Slider** - Horizontal slider with gesture control
  - Props: `value` (number), `onChange`, `min`, `max`, `step`, `disabled`, `showValue`, `marks` (optional tick marks)
  - **Gesture animation:**
    ```typescript
    const thumbX = useSharedValue(0)
    const panGesture = Gesture.Pan()
      .onUpdate((e) => {
        const newX = Math.max(0, Math.min(trackWidth, thumbX.value + e.translationX))
        thumbX.value = newX
        const newValue = (newX / trackWidth) * (max - min) + min
        runOnJS(onChange)(Math.round(newValue / step) * step)
      })
      .onEnd(() => {
        // Snap to nearest step with spring
        const snappedX = calculateSnappedPosition(thumbX.value)
        thumbX.value = withSpring(snappedX, springs.snappy)
      })
    ```
  - **Visual:**
    - Track: Gray bar with active portion (violet)
    - Thumb: Circular draggable handle with shadow
    - Marks: Optional tick marks at intervals
    - Value label: Shows current value when `showValue={true}`
  - **Haptic feedback:** Light haptic on snap-to-step
  - **Accessibility:** VoiceOver announces value changes, supports increment/decrement gestures
  - **Use cases:**
    - FR-4.1: Fulfillment score slider (1-10) in Daily Reflection
    - FR-7.6: Nudging intensity slider (1-10) in Notification Preferences
    - FR-8.2: Coaching preference slider (gentle ↔ strict) in Identity Document

**Radio Components (2 total):**
- [ ] **Radio** - Single radio button
  - Props: `selected`, `onChange`, `value`, `disabled`, `label`, `size` (`sm` | `md` | `lg`)
  - **Visual:**
    - Outer circle: Border in theme color
    - Inner dot: Filled circle when selected
    - Label: Right-aligned text
  - **Animation:** Inner dot scales in with spring on selection
    ```typescript
    const dotScale = useSharedValue(selected ? 1 : 0)
    useEffect(() => {
      dotScale.value = withSpring(selected ? 1 : 0, springs.bouncy)
    }, [selected])
    ```

- [ ] **RadioGroup** - Group of radio buttons (Radix-inspired pattern)
  - Props: `options` (array of `{ value, label, description? }`), `value`, `onChange`, `orientation` (`vertical` | `horizontal`), `disabled`
  - **Composable anatomy:**
    ```typescript
    <RadioGroup value={mode} onChange={setMode}>
      <RadioGroup.Item value="normal">
        <RadioGroup.Radio />
        <RadioGroup.Label>Normal</RadioGroup.Label>
        <RadioGroup.Description>Changes require justification</RadioGroup.Description>
      </RadioGroup.Item>
    </RadioGroup>
    ```
  - **Visual:** Stack of radio options with proper spacing
  - **Keyboard support:** Arrow keys navigate options, Enter/Space to select
  - **Use cases:**
    - FR-1.13: Archetype micro-assessment (Day 2) - select from 4-6 archetypes
    - FR-1.14: Motivation drivers selection - select 2-3 from list
    - FR-2.6: Needle change strictness modes (Normal/Strict/None)

**Toggle Component:**
- [ ] **Toggle / Switch** - Binary on/off switch
  - Props: `value` (boolean), `onChange`, `disabled`, `size` (`sm` | `md` | `lg`), `label`, `description`
  - **Visual:**
    - Track: Rounded rectangle, changes color when on (violet) vs off (gray)
    - Thumb: Circular handle that slides left/right
    - Label + description: Optional text on right
  - **Animation:** Thumb slides with spring physics
    ```typescript
    const thumbX = useSharedValue(value ? trackWidth - thumbSize : 0)
    const trackColor = useSharedValue(value ? colors.accent[500] : colors.dark[700])
    useEffect(() => {
      thumbX.value = withSpring(value ? trackWidth - thumbSize : 0, springs.snappy)
      trackColor.value = withTiming(value ? colors.accent[500] : colors.dark[700], { duration: 200 })
    }, [value])
    ```
  - **Haptic feedback:** Medium haptic on toggle
  - **Accessibility:** VoiceOver announces "on" or "off" state
  - **Use cases:**
    - FR-7.6: Per-notification toggles (Morning intention on/off, Bind reminders on/off, etc.)
    - FR-8.3: Settings toggles (Quiet hours enabled, Data export enabled, etc.)

**Tabs Component:**
- [ ] **Tabs** - Tabbed navigation with animated indicator
  - **Composable anatomy (Radix pattern):**
    ```typescript
    <Tabs value={activeTab} onChange={setActiveTab}>
      <Tabs.List>
        <Tabs.Trigger value="general">General</Tabs.Trigger>
        <Tabs.Trigger value="identity">Identity</Tabs.Trigger>
        <Tabs.Trigger value="subscription">Subscription</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="general">
        {/* General settings content */}
      </Tabs.Content>
      <Tabs.Content value="identity">
        {/* Identity settings content */}
      </Tabs.Content>
    </Tabs>
    ```
  - Props: `value`, `onChange`, `variant` (`default` | `pills` | `underline`), `size` (`sm` | `md` | `lg`)
  - **Visual:**
    - Tab list: Horizontal row of tab triggers
    - Active indicator: Animated underline or pill background
    - Active tab: Violet accent color
    - Inactive tabs: Gray color
  - **Indicator animation:**
    ```typescript
    const indicatorX = useSharedValue(0)
    const indicatorWidth = useSharedValue(0)
    useEffect(() => {
      const activeTabLayout = tabLayouts[activeTab]
      indicatorX.value = withSpring(activeTabLayout.x, springs.snappy)
      indicatorWidth.value = withSpring(activeTabLayout.width, springs.snappy)
    }, [activeTab])
    ```
  - **Swipe gestures:** Support swipe left/right to change tabs
  - **Keyboard navigation:** Tab key to focus, arrow keys to navigate, Enter/Space to select
  - **Use cases:**
    - FR-8.3: Settings sections (General / Identity / Subscription tabs)
    - FR-4.5: Journal history filters (7 days / 30 days / 90 days tabs)
    - FR-5.2: Heat map filters (Overall / By Needle / By Bind Type tabs)

**Divider Component:**
- [ ] **Divider / Separator** - Visual separator line
  - Props: `orientation` (`horizontal` | `vertical`), `thickness` (`thin` | `regular` | `thick`), `color`, `spacing` (margin around divider)
  - **Visual:**
    - Horizontal: Full-width line with top/bottom margin
    - Vertical: Height-adjusted line with left/right margin
    - Color: Uses `border.primary` or custom theme color
  - **Variants:**
    - Default: `border.primary` color (subtle gray)
    - Emphasized: Thicker line or accent color
  - **Use cases:**
    - Universal: Visual separation in Settings sections
    - Needles list: Separate each goal card
    - Journal entries: Separate each day's entry

**ListItem Component:**
- [ ] **ListItem** - Structured list item with composable anatomy
  - **Composable anatomy:**
    ```typescript
    <ListItem onPress={handlePress}>
      <ListItem.Icon name="calendar" />
      <ListItem.Content>
        <ListItem.Title>December 16, 2025</ListItem.Title>
        <ListItem.Subtitle>Fulfillment: 8/10 • 3 binds completed</ListItem.Subtitle>
      </ListItem.Content>
      <ListItem.Trailing>
        <ListItem.Icon name="chevron-right" />
      </ListItem.Trailing>
    </ListItem>
    ```
  - Props: `onPress`, `disabled`, `variant` (`default` | `card` | `flush`), `divider` (show bottom divider)
  - **Visual:**
    - Leading: Optional icon or avatar (left-aligned)
    - Content: Title + subtitle text (center, flex-grow)
    - Trailing: Optional icon, badge, or value (right-aligned)
    - Background: Transparent (default), card (elevated), flush (no padding)
  - **Press animation:** Spring scale + background color change
    ```typescript
    const scale = useSharedValue(1)
    const bgOpacity = useSharedValue(0)
    const handlePressIn = () => {
      scale.value = withSpring(0.98, springs.snappy)
      bgOpacity.value = withTiming(0.05, { duration: 100 })
    }
    const handlePressOut = () => {
      scale.value = withSpring(1, springs.snappy)
      bgOpacity.value = withTiming(0, { duration: 200 })
    }
    ```
  - **Accessibility:** Entire item is one tappable region with combined VoiceOver label
  - **Use cases:**
    - FR-4.5: Journal History entries (date + fulfillment preview + chevron)
    - FR-8.1: Settings menu items (label + current value + chevron)
    - Universal: Any structured list (Needles, Binds, Notifications)

**Select Component (Dropdown):**
- [ ] **Select** - Dropdown selection with bottom sheet picker
  - Props: `options` (array of `{ value, label }`), `value`, `onChange`, `placeholder`, `disabled`, `searchable`
  - **Visual (Closed state):**
    - Looks like Input component with down chevron on right
    - Shows selected label or placeholder
  - **Visual (Open state):**
    - Opens BottomSheet with list of options
    - Each option is a ListItem with checkmark when selected
    - Searchable: Shows SearchInput at top of sheet
  - **Animation:**
    - Chevron rotates 180° when opening
    - BottomSheet slides up with spring physics
  - **Keyboard support:** Arrow keys to navigate, Enter to select, Escape to close
  - **Use cases:**
    - FR-8.3: Timezone selection (dropdown of timezones)
    - FR-5.2: Heat map filters (dropdown of Needles or Bind types)
    - FR-1.15: User type selection (Student / Professional / etc.)

**Technical Notes:**
- All components use React Native Gesture Handler for smooth interactions
- Reanimated for 60fps animations
- Slider and Toggle use spring physics for natural feel
- Tabs indicator animates smoothly when switching
- ListItem supports both touch and keyboard interactions
- All components support theme customization via tokens
- All components respect reduced motion settings

**Cross-References to Blocked FRs:**
- **Slider:** FR-4.1 (fulfillment slider), FR-7.6 (nudging intensity), FR-8.2 (coaching preference)
- **Radio:** FR-1.13 (archetype selection), FR-1.14 (motivations), FR-2.6 (strictness modes)
- **Toggle:** FR-7.6 (notification toggles), FR-8.3 (settings toggles)
- **Tabs:** FR-8.3 (settings sections), FR-4.5 (journal filters), FR-5.2 (heat map filters)
- **Divider:** Universal separator for all list/section layouts
- **ListItem:** FR-4.5 (journal entries), FR-8.1 (settings menu)

**Estimate:** 21 story points

**Components Delivered:** 7 total (Slider, Radio, RadioGroup, Toggle, Tabs, Divider, ListItem, Select)

---

### Epic DS Summary

| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-DS-1 | Foundation (Tokens + Theme + Animations) | M | 5 pts |
| US-DS-2 | Core Primitives (Text, Buttons, Icons) | M | 6 pts |
| US-DS-3 | Form Components | M | 7 pts |
| US-DS-4 | Layout & Cards | M | 6 pts |
| US-DS-5 | Feedback & Overlays | M | 5 pts |
| US-DS-6 | Data Visualization & Progress | M | 6 pts |
| US-DS-7 | Weave-Specific Cards | M | 8 pts |
| US-DS-8 | Loading & Empty States | M | 4 pts |
| US-DS-9 | Testing & Storybook | M | 6 pts |
| US-DS-10 | Additional Form & Layout Components | M | 21 pts |

**Epic Total:** 74 story points

**Components Delivered:** 70 total
- Text (11): Text, AnimatedText, Heading, Title, Subtitle, Body, BodySmall, Caption, Label, Link, Mono
- Buttons (7): Button, PrimaryButton, SecondaryButton, GhostButton, DestructiveButton, AIButton, IconButton
- Forms (10): Input, TextArea, SearchInput, Checkbox, BindCheckbox, Slider, Radio, RadioGroup, Toggle, Select
- Cards (4): Card, GlassCard, ElevatedCard, AICard
- Navigation (3): BottomTabBar, HeaderBar, BackButton
- Badges (6): Badge, CountBadge, StatusDot, StreakBadge, AIBadge, ConsistencyBadge
- Avatars (3): Avatar, AvatarGroup, AvatarWithName
- Overlays (3): Modal, Toast, BottomSheet
- Progress (2): ProgressBar, CircularProgress
- Stats (4): StatCard, StatCardGrid, MiniStatCard, ProgressStatCard
- Heatmap (1): ConsistencyHeatmap
- Weave Cards (6): NeedleCard, BindCard, CaptureCard, InsightCard, SuccessCard, Timer
- Skeletons (8): Skeleton, SkeletonText, SkeletonAvatar, SkeletonCard, SkeletonListItem, SkeletonBindCard, SkeletonStatCard, SkeletonProgressCard
- Empty States (10): EmptyState, EmptyGoals, EmptyBinds, EmptyCaptures, EmptyJournal, EmptySearch, EmptyNotifications, ErrorState, NoConnectionState, ComingSoonState
- Layout (3): Tabs, Divider, ListItem

**Design Tokens:** 220+ tokens (colors, typography, spacing, effects, borders, animations)

**Migration Strategy:**
- Feature flags for gradual component rollout
- Adapter layer for old → new component migration
- Storybook as living documentation for developers
- Component deprecation warnings in console (dev mode only)

---

## Functional Requirements Summary

### Total Story Points by Epic

| Epic | Description | M Points | S Points | C Points | Total |
|------|-------------|----------|----------|----------|-------|
| E0 | Foundation | 38 | 0 | 0 | 38 |
| E1 | Onboarding (Hybrid Flow) | 38 | 10 | 0 | 48 |
| E2 | Goal Management | 24 | 3 | 0 | 27 |
| E3 | Daily Actions & Proof | 28 | 5 | 5 | 38 |
| E4 | Reflection & Journaling | 19 | 9 | 0 | 28 |
| E5 | Progress Visualization | 18 | 21 | 0 | 39 |
| E6 | AI Coaching | 13 | 11 | 5 | 29 |
| E7 | Notifications | 23 | 5 | 0 | 28 |
| E8 | Settings & Profile | 20 | 3 | 0 | 23 |
| **EDS** | **Design System Rebuild** | **74** | **0** | **0** | **74** |
| **Total** | | **287** | **67** | **10** | **364** |

**Note:** Epic 0 (Foundation) added - includes infrastructure, auth, RLS, CI/CD, and AI service abstraction (38 pts). Epic 1 updated with optimized hybrid flow (+13 pts) that distributes personalization across Days 1-3 for higher activation. Epics 3, 4 also updated based on implementation complexity assessment and story splitting for clarity.

### MVP Scope (Must Have)

**Total Must Have Points:** 213 story points (includes Epic 0 Foundation: 38 pts, Epic 1 Hybrid Flow: 38 pts M)

**Estimated Duration:** 10-14 sprints (assuming 15-20 points/sprint with 2-person team)

**Note:** Sprint 1 (2-week MVP) focuses on Epic 0 foundation + core loop: 66 points per implementation plan in epics.md

---

## Cross-Cutting UX Concerns

These concerns apply across ALL epics and must be addressed within each feature implementation.

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

**Implementation Requirement:** Each story with a list view MUST include acceptance criteria for empty state handling.

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

**Implementation Requirement:** All API calls must have error boundaries with appropriate fallback UI.

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

**Implementation Requirement:** Use skeleton loaders for data-heavy screens. Show progress for operations >2s.

### Return States (UX-R) - DIFFERENTIATOR

How we handle users returning after absence. **This is what sets Weave apart from shame-based habit apps.**

| ID | Time Away | Experience | AI Behavior |
|----|-----------|------------|-------------|
| UX-R1 | <24h | Normal home screen | No special messaging |
| UX-R2 | 24-48h | Warm welcome banner | "Hey, you're back! 💙 Ready to pick up where you left off?" |
| UX-R3 | 48h-7d | AI-initiated chat | Proactive: "I noticed you've been away. Everything okay? Just ONE bind is a win." |
| UX-R4 | >7d | Special welcome animation | "Welcome back, [Name]! Your Dream Self is still here. Let's restart together." |

**Return Chat Flow (UX-R3):**
1. App detects `hours_since_active > 48`
2. AI Chat opens automatically with contextual greeting
3. Quick response chips: "Life got busy", "Feeling overwhelmed", "Ready to restart"
4. AI responds with empathy and ONE small action
5. Always reference their Dream Self and past wins

**Core Principles:**
- ❌ NEVER show broken streak prominently
- ❌ NEVER guilt-trip with sad mascots
- ❌ NEVER require catching up on missed days
- ✅ ALWAYS lead with warmth and genuine care
- ✅ ALWAYS lower the bar: "Just ONE bind today"
- ✅ ALWAYS reference their WHY (Dream Self)
- ✅ ALWAYS celebrate their return as a WIN
- ✅ ALWAYS let AI Chat be the re-entry point

**Technical Implementation:**
- Store `last_active_at` in `user_profiles` table
- Calculate return state on app launch
- Trigger appropriate UX-R experience based on time away

**Competitive Advantage:**
| What Competitors Do | What Weave Does |
|---------------------|-----------------|
| Duolingo: Guilt-trips with sad owl | Warm AI welcome, no judgment |
| Streaks: Shows broken chain prominently | Celebrates return as a win |
| Habitica: Character dies/loses HP | Lower the bar, reference past wins |
| Most apps: 77% churn at Day 3 | Re-engagement through compassionate AI |

---

## Non-Functional Requirements

### Performance Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-P1 | App launch time | <3 seconds | M |
| NFR-P2 | Thread (Home) load time | <1 second | M |
| NFR-P3 | Bind completion response | <500ms | M |
| NFR-P4 | AI chat response (streaming start) | <3 seconds | M |
| NFR-P5 | AI batch job completion | <30 seconds | M |
| NFR-P6 | Image upload time | <5 seconds (10MB max) | S |
| NFR-P7 | Heat map render time | <1 second | S |

### Scalability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-S1 | Concurrent users | 10,000 | M |
| NFR-S2 | Database queries/second | 1,000 | M |
| NFR-S3 | AI requests/hour (system) | 5,000 | M |
| NFR-S4 | Storage per user | 500MB max | S |

### Availability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-A1 | System uptime | 99.5% | M |
| NFR-A2 | Planned maintenance window | <4 hours/month | S |
| NFR-A3 | Unplanned downtime recovery | <1 hour | S |

### Usability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-U1 | Onboarding completion rate | >70% | M |
| NFR-U2 | Bind completion time | <30 seconds | M |
| NFR-U3 | Capture creation time | <10 seconds | M |
| NFR-U4 | Answer "What should I do?" | <10 seconds | M |
| NFR-U5 | Accessibility (WCAG 2.1) | Level AA | S |

### Reliability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-R1 | Data loss prevention | Zero tolerance | M |
| NFR-R2 | Completion event persistence | 100% | M |
| NFR-R3 | Error rate (API) | <0.1% | M |
| NFR-R4 | Crash rate (mobile) | <1% | M |

### Compatibility Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-C1 | iOS version support | iOS 15+ | M |
| NFR-C2 | iPhone models | iPhone X and newer | M |
| NFR-C3 | Screen sizes | 5.8" - 6.7" | M |
| NFR-C4 | Offline mode | Basic read access | S |

### Error Handling Requirements **[NEW - Implementation Readiness]**

**Purpose:** Ensure consistent, user-friendly error handling across all features. Every error scenario must have a defined fallback path.

#### Error Response Standard

All API endpoints must return errors in this format:

```json
{
  "error": {
    "code": "GOAL_LIMIT_REACHED",
    "message": "You can have a maximum of 3 active goals. Archive a goal to create a new one.",
    "retryable": false,
    "retryAfter": null
  }
}
```

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `code` | string | Machine-readable error code (UPPER_SNAKE_CASE) | Yes |
| `message` | string | Human-friendly error message (actionable) | Yes |
| `retryable` | boolean | Whether user should retry this request | Yes |
| `retryAfter` | number | Seconds to wait before retry (for rate limits) | No |

#### HTTP Status Codes

| Code | Usage | Example Scenarios |
|------|-------|-------------------|
| **400 Bad Request** | Validation errors, malformed input | Goal title >200 chars, invalid timezone, negative fulfillment score |
| **401 Unauthorized** | Missing or invalid auth token | JWT expired, token not provided |
| **403 Forbidden** | Valid auth but insufficient permissions | User A accessing User B's data (RLS violation) |
| **429 Too Many Requests** | Rate limit exceeded | 11th AI message in an hour, >10 goals created per day |
| **500 Internal Server Error** | Unexpected backend failure | Database connection lost, uncaught exception |
| **503 Service Unavailable** | AI provider down or system maintenance | OpenAI API timeout, Anthropic rate limit (after all retries) |

#### Common Error Scenarios

| ID | Scenario | HTTP Status | Error Code | User Message | Fallback |
|----|----------|-------------|------------|--------------|----------|
| **ERR-001** | AI timeout (>5s) | 503 | AI_TIMEOUT | "AI is taking longer than usual. Here's a simpler suggestion..." | Template/deterministic response |
| **ERR-002** | Network offline | N/A (client) | NETWORK_OFFLINE | "You're offline. Changes will sync when connected." | Show cached data |
| **ERR-003** | File too large | 400 | FILE_TOO_LARGE | "Image must be under 10MB. Try compressing it." | Reject upload |
| **ERR-004** | Invalid file type | 400 | INVALID_FILE_TYPE | "Only JPEG and PNG images are supported." | Reject upload |
| **ERR-005** | Storage quota exceeded | 400 | STORAGE_QUOTA_EXCEEDED | "You've used all 500MB of storage. Delete old captures to upload more." | Block upload |
| **ERR-006** | Goal limit reached | 400 | GOAL_LIMIT_REACHED | "You can have max 3 active goals. Archive one to create a new goal." | Block creation |
| **ERR-007** | Rate limit (AI chat) | 429 | RATE_LIMIT_EXCEEDED | "You've sent 10 messages this hour. Try again in 37 minutes." | Show countdown timer |
| **ERR-008** | JWT expired | 401 | TOKEN_EXPIRED | "Your session expired. Logging you back in..." | Automatic token refresh |
| **ERR-009** | RLS violation | 403 | ACCESS_DENIED | "You don't have access to this resource." | Redirect to home |
| **ERR-010** | Database unavailable | 500 | DATABASE_ERROR | "Something went wrong. We're fixing it. Try again in a minute." | Show cached data |

#### AI Fallback Requirements

**Every AI operation must have a 4-level fallback chain:**

| Level | Type | Implementation | Example (Goal Breakdown) |
|-------|------|----------------|--------------------------|
| **Level 1** | AI Primary | GPT-4o-mini (fast, cheap) | AI generates Q-goals + Binds |
| **Level 2** | AI Secondary | Claude Sonnet (quality) | If OpenAI fails, use Claude |
| **Level 3** | Deterministic | Template or rule-based | Category templates (fitness → exercise binds) |
| **Level 4** | Static | Generic fallback | "Define your goal", "Research first step" |

**User Experience:** Users should never be blocked by AI failure. Level 3/4 fallbacks must always return a usable result.

#### Image Upload Error Handling **[Critical]**

| Validation | Error Code | User Message | AC |
|------------|------------|--------------|-----|
| File size >10MB | FILE_TOO_LARGE | "Image is X MB. Max 10MB allowed. Compress and try again." | User sees file size |
| Invalid format (not JPEG/PNG) | INVALID_FILE_TYPE | "Only JPEG and PNG images supported. Your file is X format." | User sees their file type |
| Image dimensions <100x100px | IMAGE_TOO_SMALL | "Image must be at least 100x100 pixels." | User sees dimensions |
| Upload timeout (>30s) | UPLOAD_TIMEOUT | "Upload timed out. Check your connection and try again." | Retry button appears |
| Storage quota exceeded | STORAGE_QUOTA_EXCEEDED | "You've used 500MB storage. Delete old captures to upload." | Link to manage captures |
| Network offline | NETWORK_OFFLINE | "You're offline. Image saved locally and will upload when connected." | Queue for retry |

**Retry Logic:** 3 automatic retries with exponential backoff (1s, 2s, 4s). If all fail, queue for manual retry.

#### Error Logging & Monitoring

| Error Type | Log Level | Alert Threshold | Action |
|------------|-----------|-----------------|--------|
| Validation errors (400) | INFO | N/A | Log for analytics |
| Auth errors (401/403) | WARNING | >100/hour | Security review |
| Server errors (500) | ERROR | Any occurrence | Immediate Sentry alert |
| AI errors (503) | WARNING | >10% of requests | Check provider status |
| Client crashes | CRITICAL | >1% crash rate | Emergency fix |

---

## Data Requirements

### Data Classification

**Canonical Truth (Immutable Event Logs):**
- `goals` - User goals
- `qgoals` - Quantifiable subgoals
- `subtask_templates` - Bind definitions
- `subtask_completions` - Completion events (immutable)
- `captures` - Proof and memories
- `journal_entries` - Daily reflections

**Derived Views (Recomputable):**
- `daily_aggregates` - Daily statistics
- `user_stats` - User-level statistics
- `streak calculations` - Computed from completions
- `consistency percentages` - Computed from aggregates

**Key Rule:** Never edit derived data directly. Always regenerate from source events.

### Critical Database Indexes

```sql
user_profiles(auth_user_id)
subtask_instances(user_id, scheduled_for_date)
subtask_completions(user_id, local_date)
captures(user_id, local_date)
journal_entries(user_id, local_date)
goals(user_id, status)
daily_aggregates(user_id, local_date)
ai_runs(input_hash)
```

### Data Retention

| Data Type | Retention | Policy |
|-----------|-----------|--------|
| User profile | Until account deletion | GDPR compliant |
| Goals and completions | Indefinite | Core user data |
| Journal entries | Indefinite | Core user data |
| Captures (images) | 2 years | Storage optimization |
| AI artifacts | 90 days | Cost optimization |
| Analytics events | 2 years | Analytics retention |

### Data Export

- Users can export all their data as JSON
- Export includes: profile, goals, completions, journals, captures (metadata)
- Export excludes: AI artifacts, derived stats (can be recomputed)

---

## AI System Requirements

### AI Modules

| Module | Trigger | Output | Model | Cost Tier |
|--------|---------|--------|-------|-----------|
| Onboarding Coach | Goal setup | Goal tree + identity doc | GPT-4/Sonnet | High |
| Triad Planner | Journal submission | 3 tasks for tomorrow | GPT-3.5/Haiku | Low |
| Daily Recap Generator | Journal submission | Insights + suggestions | GPT-3.5/Haiku | Low |
| Dream Self Advisor | User chat | Coaching response | GPT-4/Sonnet | High |
| AI Insights Engine | Weekly cron | Pattern analysis | GPT-4/Sonnet | Medium |

### Cost Control Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| AI-C1 | AI cost per free user/month | <$0.10 | M |
| AI-C2 | AI cost per Pro user/month | <$0.50 | M |
| AI-C3 | AI cost per Max user/month | <$1.50 | M |
| AI-C4 | Cache hit rate | >80% | M |
| AI-C5 | Chat rate limit | 10 msgs/hour | M |

### Cost Optimization Strategies

1. **Prompt Caching:** Cache static context (identity, goals) - 60-90% reduction
2. **Semantic Caching:** Reuse responses for similar queries - 30-50% reduction
3. **Model Routing:** Use Haiku for routine, Sonnet for complex - 40% reduction
4. **Batch Operations:** Group AI calls at journal time

### AI Principles (Non-Negotiable)

1. **Editable by Default:** All AI outputs can be modified by user
2. **No Hallucinated Certainty:** AI labels assumptions, asks questions
3. **Deterministic Personality:** Same inputs yield consistent coaching style
4. **Guardrails:** Enforced constraints (max goals, valid dates, evidence grounding)

### AI Safety Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| AI-S1 | Prompt injection detection | M |
| AI-S2 | No harmful content generation | M |
| AI-S3 | Evidence grounding (no invented facts) | M |
| AI-S4 | User data privacy in prompts | M |

### Memory System Architecture **[NEW - Implementation Readiness]**

**Decision:** Simple approach for MVP, no fancy vector DB. Scale to semantic search later if needed.

#### MVP Memory Storage (PostgreSQL)

| Component | Implementation | Rationale |
|-----------|----------------|-----------|
| **Storage** | PostgreSQL `TEXT[]` arrays in `user_memories` table | Avoid external vector DB complexity |
| **Search** | Keyword-based (PostgreSQL `LIKE` or GIN index) | Fast, simple, good enough for <100 memories |
| **Embedding** | None for MVP | Defer until usage patterns justify cost |

#### Memory Schema

```sql
CREATE TABLE user_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  memory_type TEXT NOT NULL CHECK (memory_type IN ('win', 'insight', 'pattern', 'blocker')),
  content TEXT NOT NULL,
  source TEXT NOT NULL, -- 'journal', 'capture', 'ai_chat', 'goal_completion'
  keywords TEXT[] NOT NULL, -- For keyword search
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  relevance_score INTEGER DEFAULT 5, -- 1-10, decays over time
  archived_at TIMESTAMPTZ -- Soft delete after 100 memories
);

CREATE INDEX idx_user_memories_user_keywords ON user_memories USING GIN (keywords);
CREATE INDEX idx_user_memories_user_date ON user_memories (user_id, created_at DESC);
```

#### Memory Lifecycle

| Event | Action | Logic |
|-------|--------|-------|
| **Journal Submit** | Extract 1-3 memories | AI identifies wins/insights/patterns from fulfillment + reflection text |
| **Goal Complete** | Create memory | "Completed goal: [title]" → stored as 'win' |
| **AI Chat** | Store important exchanges | User-flagged messages or AI-detected breakthroughs |
| **Pruning** | Archive oldest memories at 100 limit | Keep most recent 50 + top 50 by relevance_score |

#### Memory Retrieval (for AI Context)

**When:** Before AI chat, weekly insights, triad generation

**Strategy:**
1. Fetch recent memories (7 days): `WHERE user_id = X AND created_at > NOW() - INTERVAL '7 days'`
2. Fetch top wins: `WHERE memory_type = 'win' ORDER BY relevance_score DESC LIMIT 3`
3. Fetch relevant keywords: `WHERE keywords && ARRAY['fitness', 'gym']` (if goal is fitness-related)
4. Combine up to 10 memories max (limit AI context bloat)

#### Memory Extraction (AI)

**Prompt:**
```
From this journal entry, extract 1-3 key memories:
- Wins: Achievements, completions, breakthroughs
- Insights: Learnings, realizations, patterns discovered
- Blockers: Obstacles, struggles, repeated failures

Journal: {user_reflection_text}
Fulfillment: {score}/10

Return JSON: [{"type": "win", "content": "...", "keywords": ["..."]}]
```

**Cost Control:** Memory extraction piggybacks on journal AI call (no extra API cost)

#### Future Enhancements (Post-MVP)

| Enhancement | Trigger | Estimated Cost |
|-------------|---------|----------------|
| **Semantic Search** | >500 memories per user OR user requests better memory | $0.0001/query (OpenAI embeddings) |
| **Vector DB** | >1M total memories OR <50% keyword match rate | Pinecone $70/mo (10K users) |
| **Multi-modal** | Image/audio capture analysis | Vision API $0.01/image |

**MVP Decision Rationale:**
- Most users will have <50 memories in first 30 days
- Keyword search is 90% effective for short-term memory
- PostgreSQL avoids external dependency, simplifies deployment
- Can migrate to vector DB seamlessly later (same schema, add `embedding VECTOR(1536)` column)

---

## Security & Privacy Requirements

### Authentication

| ID | Requirement | Priority |
|----|-------------|----------|
| SEC-A1 | Supabase Auth (email + OAuth) | M |
| SEC-A2 | JWT token expiration | 7 days | M |
| SEC-A3 | Refresh token rotation | M |
| SEC-A4 | Multi-factor auth | W (Post-MVP) |

### Authorization

| ID | Requirement | Priority |
|----|-------------|----------|
| SEC-Z1 | Row Level Security (RLS) on all user tables | M |
| SEC-Z2 | Users can only access own data | M |
| SEC-Z3 | API endpoint authorization | M |

### Data Protection

| ID | Requirement | Priority |
|----|-------------|----------|
| SEC-D1 | Data encrypted at rest | M |
| SEC-D2 | Data encrypted in transit (TLS 1.3) | M |
| SEC-D3 | PII encryption | M |
| SEC-D4 | Supabase Storage security (signed URLs) | M |

### Input Validation

| ID | Requirement | Priority |
|----|-------------|----------|
| SEC-I1 | Input sanitization (XSS prevention) | M |
| SEC-I2 | SQL injection prevention (parameterized queries) | M |
| SEC-I3 | File upload validation (type, size) | M |
| SEC-I4 | Rate limiting on all endpoints | M |

### Privacy Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| PRI-1 | Privacy policy link in app | M |
| PRI-2 | GDPR compliance (EU users) | M |
| PRI-3 | Data export capability | M |
| PRI-4 | Account deletion capability | M |
| PRI-5 | Analytics opt-out option | S |

---

## Analytics & Success Metrics

### Event Tracking Requirements

**Onboarding Events:**
- `onboarding_started`
- `onboarding_step_completed` (with step number)
- `onboarding_completed`
- `onboarding_abandoned` (with step)

**Core Loop Events:**
- `bind_started`
- `bind_completed`
- `proof_attached`
- `capture_created`
- `journal_submitted`
- `ai_feedback_viewed`

**Engagement Events:**
- `chat_message_sent`
- `dashboard_viewed`
- `goal_created`
- `goal_archived`
- `notification_opened`

**Monetization Events:**
- `subscription_started`
- `subscription_canceled`
- `upgrade_clicked`

### KPI Dashboard Requirements

**North Star:**
- Active Days with Proof (daily, weekly, cohort)

**Engagement:**
- DAU/MAU ratio (target: >20%)
- Binds completed per active user
- Journal completion rate
- AI chat usage

**Retention:**
- Day 1, Day 7, Day 30 retention
- Streak distribution
- Churn rate by cohort

**Monetization:**
- Free-to-paid conversion rate
- ARPU (Average Revenue Per User)
- MRR (Monthly Recurring Revenue)

### Analytics Tools

- **PostHog:** Event tracking and analytics
- **Sentry:** Error tracking and monitoring
- **Custom Dashboard:** North Star metric tracking

---

## Constraints & Assumptions

### Constraints

| ID | Constraint | Impact |
|----|------------|--------|
| CON-1 | iOS only for MVP | No Android users initially |
| CON-2 | English only for MVP | No localization |
| CON-3 | US market focus | Timezone/payment considerations |
| CON-4 | 2-person engineering team | Limited velocity |
| CON-5 | AI budget: $2,500/month at 10K users | Model selection constraints |
| CON-6 | Max 3 active goals | Product design constraint |

### Assumptions

| ID | Assumption | Risk if False |
|----|------------|---------------|
| ASM-1 | Users will complete onboarding in one session | High abandonment |
| ASM-2 | Users will journal daily | Core loop breaks |
| ASM-3 | AI coaching provides differentiated value | No conversion |
| ASM-4 | $12/month is acceptable price for students | Revenue targets missed |
| ASM-5 | Push notifications drive engagement | Retention suffers |
| ASM-6 | Trust-based proof is sufficient | Accountability fails |

### Technical Assumptions

- Supabase can handle projected scale (10K users)
- Railway provides adequate backend performance
- OpenAI/Anthropic API availability is stable
- React Native performance is acceptable on target devices

---

## Dependencies & Risks

### External Dependencies

| ID | Dependency | Type | Mitigation |
|----|------------|------|------------|
| DEP-1 | Supabase | Infrastructure | Monitor status, backup plan |
| DEP-2 | Railway | Infrastructure | Monitor status, backup plan |
| DEP-3 | OpenAI API | AI Provider | Anthropic as backup |
| DEP-4 | Apple App Store | Distribution | Follow guidelines strictly |
| DEP-5 | APNs | Push Notifications | Graceful degradation |

### Risk Register

| ID | Risk | Probability | Impact | Mitigation |
|----|------|-------------|--------|------------|
| RSK-1 | AI costs exceed budget | Medium | High | Aggressive caching, model routing |
| RSK-2 | Low retention (<20% D7) | Medium | High | Recovery loop, notifications |
| RSK-3 | App Store rejection | Low | High | Guidelines compliance review |
| RSK-4 | Security breach | Low | Critical | RLS, encryption, audits |
| RSK-5 | AI generates harmful content | Low | High | Safety filters, guardrails |
| RSK-6 | Competitor copies features | Medium | Medium | Speed of execution, moats |
| RSK-7 | Free-to-paid conversion <2% | Medium | High | A/B test free tier limits |

---

## Release Plan

### Phase 1: Foundation (Weeks 1-4)

**Epics:** Infrastructure setup, Authentication, Basic data model

**Deliverables:**
- React Native project setup
- Supabase database and auth
- FastAPI backend on Railway
- Basic user authentication flow
- Core data models implemented

### Phase 2: Onboarding (Weeks 5-8)

**Epics:** E1 (Onboarding & Identity)

**Deliverables:**
- Complete onboarding flow
- Archetype assessment
- Dream self definition
- AI-assisted goal setup (Onboarding Coach)
- First commitment flow

### Phase 3: Core Loop (Weeks 9-14)

**Epics:** E2 (Goal Management), E3 (Daily Actions)

**Deliverables:**
- Goals management (CRUD)
- Binds (subtasks) management
- Bind completion flow
- Proof capture (photo, note, timer)
- Thread (Home) screen

### Phase 4: Reflection & AI (Weeks 15-18)

**Epics:** E4 (Reflection), E6 (AI Coaching)

**Deliverables:**
- Daily reflection flow
- AI feedback generation (Recap, Triad)
- Dream Self Advisor chat
- AI cost optimization

### Phase 5: Progress & Notifications (Weeks 19-22)

**Epics:** E5 (Progress), E7 (Notifications)

**Deliverables:**
- Weave Dashboard
- Consistency heat map
- Streak and badge system
- Push notifications (all types)

### Phase 6: Polish & Launch (Weeks 23-26)

**Epics:** E8 (Settings), Testing, Launch

**Deliverables:**
- Settings and profile
- Subscription management (IAP)
- Bug fixes and polish
- Performance optimization
- App Store submission
- Beta launch

### Milestones

| Milestone | Date | Criteria |
|-----------|------|----------|
| M1: Alpha | Week 14 | Core loop functional (bind + capture + reflect) |
| M2: Beta | Week 22 | All must-have features complete |
| M3: RC | Week 25 | All critical bugs fixed, performance targets met |
| M4: Launch | Week 26 | App Store approval, public launch |

---

## Appendices

### Appendix A: Terminology Glossary

| Term | Definition |
|------|------------|
| Active Day | Day with ≥1 bind completed + proof or journal |
| Bind | Daily action/habit toward a goal (technical: subtask) |
| Capture | Proof or memory (photo, note, voice) |
| Dream Self | User's ideal future identity, informs AI voice |
| Needle | User's goal (max 3 active) |
| Q-Goal | Quantifiable subgoal with metrics |
| Thread | User's starting state and identity |
| Triad | AI-generated 3 tasks for next day |
| Weave | User's evolved state, progress visualization |

### Appendix B: API Endpoints (Summary)

**Authentication:**
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

**Users:**
- `GET /users/me`
- `PATCH /users/me`
- `GET /users/me/identity`
- `PATCH /users/me/identity`

**Goals:**
- `GET /goals`
- `POST /goals`
- `GET /goals/{id}`
- `PATCH /goals/{id}`
- `DELETE /goals/{id}`

**Subtasks:**
- `GET /subtasks/today`
- `POST /subtasks/{id}/complete`
- `POST /subtasks/{id}/proof`

**Journals:**
- `GET /journals`
- `POST /journals`
- `GET /journals/{date}`

**AI:**
- `POST /ai/chat`
- `GET /ai/triad`
- `GET /ai/recap`
- `GET /ai/insights`

### Appendix C: Database Schema Reference

See `docs/idea/backend.md` for complete schema documentation.

### Appendix D: UI/UX Specifications

See `docs/idea/ux.md` for complete screen specifications.

### Appendix E: AI Architecture

See `docs/idea/ai.md` for complete AI system documentation.

---

## Document Control

### Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-16 | Jack | Initial PRD created |

### Review Schedule

- Weekly: Engineering review of current sprint stories
- Bi-weekly: Product review of upcoming epics
- Monthly: Full PRD review and update

### Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | Jack | 2025-12-16 | Pending |
| Engineering Lead | TBD | - | - |
| Design Lead | TBD | - | - |

---

**Document Status:** Active
**Next Review:** 2026-01-15
**Owner:** Jack

# Weave MVP Documentation

## Table of Contents

1. [Product Overview](#product-overview)
   - [Product Definition](#product-definition)
   - [Success Metrics](#success-metrics)
   - [Competitive Moats](#competitive-moats)
   - [Ideal Customer Profile](#ideal-customer-profile)
2. [MVP Features](#mvp-features)
3. [User Experience](#user-experience)
   - [Onboarding](#onboarding)
   - [Core User Loop](#core-user-loop)
   - [Recovery Loop](#recovery-loop)
   - [UI/UX Design](#uiux-design)
4. [AI System](#ai-system)
   - [AI Principles](#ai-principles)
   - [AI Modules](#ai-modules)
   - [AI Companion Guidelines](#ai-companion-guidelines)
5. [Additional Features](#additional-features)
   - [Identity Document](#identity-document)
   - [History Page](#history-page)
   - [Settings](#settings)
6. [Post-MVP Roadmap](#post-mvp-roadmap)
7. [Appendix: Historical Notes](#appendix-historical-notes)

---

# Product Overview

## Product Definition

**Working name:** Weave

**One-liner:** *Turn vague goals into daily wins, proof, and a stronger identity in 10 days.*

**Primary user:** Ambitious but chaotic students and builders (high intent, inconsistent execution).

**Promise:** "Give me 10 days and I will show you who you are becoming."

## Success Metrics

**North Star:** *Active Days with Proof*

An "Active Day" = user completes at least 1 subtask + logs either (a) a memory/capture or (b) a journal check-in.

**Onboarding Success:** User completes onboarding + sets 1 goal + completes 1 mission in first 24 hours.

## Competitive Moats

### A) Identity + Narrative Switching Cost (Psychological)

- Users don't just log tasks; they build a "story of self" with proof and reflection.
- Leaving means losing momentum history, identity continuity, and progress artifacts (Day 10 snapshot, streak calendar, badges).
- Psychological investment in the identity narrative creates strong retention.

### B) Unique Dataset: Goals → Q-goals → Subtasks + Proof + Mood

- Most apps collect tasks OR journaling. We collect the *link* between intention → action → evidence → emotion.
- That link enables better planning and coaching than generic todo apps or generic journaling apps.
- We assume the user has an iceberg and we want to go deep in this iceberg to really understand the user.
- This unique data structure becomes a competitive advantage as it scales.

### C) Deterministic Personalization (Trust Moat)

- The AI is not a random chatbot. It is constrained by:
  - User archetype + dream self voice
  - Goal structure
  - Completion history and difficulty calibration
- This makes advice feel consistent and "built for me," which is rare.
- We are also looking at supporting niches that have consistent pain and is measurable.

### D) Distribution Wedge (MVP-level)

- Shareable "Before vs After (10 Days)" card:
  - Consistency score, rank, badges, highlight wins, one sentence identity shift
- People share progress. They do not share "I used a todo app."
- Viral potential through progress sharing.

### E) Optional Later Moat (Do Not Block MVP)

- Screen Time / app-blocker style data can become a moat later, but it's permission heavy and easy to screw up UX. Treat as v1.5.

## Ideal Customer Profile

**Primary ICP:** 20-year-old college student frustrated with their work and tried other apps and don't feel like other apps are working that well. They want a more personalized roadmap.

**Characteristics:**
- High intent but inconsistent execution
- Has tried productivity apps before without success
- Seeks personalized guidance, not generic advice
- Values identity and self-improvement
- Needs structure but resists rigid systems

---

# MVP Features

## Must-Ship Features

1. **Goal Breakdown Engine**
   - Goal → Q-goals → Subtasks (<30 min)
   - Like an AI scheduler but much better
   - Uses Goldilocks principle: target ~70% completion probability

2. **Identity Document**
   - Archetype + dream self + motivations + constraints
   - What the AI uses to understand the user
   - Editable and evolves with user

3. **Action + Memory Capture**
   - Completed subtasks + quick proof (note/photo)
   - Timer tracking for progress
   - Dual path system: positive/negative trajectory visualization

4. **Journaling Session**
   - Fulfillment rating (1–10)
   - Tomorrow triad tasks (auto-created by AI)
   - Daily reflection and check-in

5. **Progress Visualization**
   - Calendar streak view
   - Consistency percentage
   - Ranks/badges system
   - Heat map with gradient intensity

6. **AI Coach**
   - Structured, editable, consistent personality
   - Based on the dream self
   - Deterministic responses based on user profile

---

# User Experience

## Onboarding

> **Goal:** User completes onboarding + sets 1 goal + completes 1 mission in first 24 hours.

### Flow

1. **Welcome Screen**
   - Weave Logo + Slogan ("See who you're becoming.")

2. **Demographics & Logistics**
   - Who are they (student, professional, etc.)
   - Set timezone + preferred working hours
   - Optional: Screen time access for context

3. **Identity Discovery**
   - **MBTI-like Archetypes** (informs AI how to approach/speak with the user)
   - What dream self do you want to be in the future?
   - Affirming the identity of the person when they achieve the goal (so they feel good)
   - Balance between easy to use and accurate
   - Use psychology frameworks and tests to create an accurate snapshot of the user

4. **Goal Setting**
   - **What do you most want to improve right now?** What are your goals? Why are you motivated to do them?
   - AI converts abstract goal into a measurable plan plus milestones, but user can edit.
   - Here's what we suggest the right cadence should look like. If it's quantifiable, here's how we'll update your progress.
   - Goal limitations: Hard cap on number of simultaneous goals to prevent overcommitment

5. **App Tutorial**
   - Why the app (compared to traditional apps)
     - AI Companion with personalized coaching
     - Dynamic tasks and goals that adjust to your day-to-day emotions and motion
     - Storytelling of your identity becoming different
   - Tutorial: how to use the core loop?
     - Showcase how to use the app in all of the different features
   - What is your first commitment you will make with the app?
     - Hold down the button to commit (fabulous)

6. **Monetization Decision**
   - STRICT paywall or not?
   - We sell the vision and then we have them pay?
   - Freemium model??

### Key Considerations

- How do we get as much context on the user as quickly as possible?
- Maximum 2 minutes of reading for AI-generated content, otherwise they bounce.

## Core User Loop

### Prerequisites

- From onboarding, user understands their current snapshot and their projected snapshot.
- User shares screen time information and calendar integration so AI has more context on them.
- **Gradual difficulty increase**: Start with easy wins, progressively challenge users as habits form.

### 1. Needles (Max of 3 Goals at a time)

**Setting Goals:**
- User inputs whatever, AI helps shape the answer + affirms them
  - Example: "get jacked"
- Probing Questions: why is this a goal? why does this matter to you? how far along are you right now?
- AI will formulate a future identity that the user *buys into* (current vs projected snapshot)
  - "You are committed to doing this because of _"
- Breaks down into subgoals/milestones, and suggested binds (suggested by AI)
  - Evaluates current situation and provides progression roadmap; suggestions the user can take
  - Actions then are adjusted by difficulties and priorities based on the user's identity and goals

*This grounds the user in what they want to do from both a long-term and short-term scale. They are reaffirmed by their "why" and also know the necessary steps it'll take, and can see the future version of themself vs. their current.*

**Changing Goals:**
- Three strictness modes for goal changes:
  - **Normal**: Changes require justification
  - **Strict**: Changes require daily reflection
  - **None**: No changes allowed

### 2. Document (Action + Memory Capture)

**Binds (Unlimited):**
- Photo/Timer proof of the action that they want to complete towards their goals
- You can extend the task or defer the tasks if needed (we will acknowledge their hard work, but not in app rewards)
- Dual path system:
  - Positive trajectory (the future if you keep going) - shown when the user feels like it is difficult or they are about to quit
  - Negative trajectory - if the user is not as sure
- After you complete the tasks you do a short confetti + optional "1 reflection prompt" (optional)

**Daily Media to Remember:**
- Notes/Memos/Photos that the user wants to carry with them
- The User's Weave reminds and prods the user to document their day using curiosity

*This helps the user store memories to look back on, also logs their action towards their goals, and provides Weave additional data about the user to get smarter on.*

### 3. Thread (Reflection)

**Recap:**
- Summarize the documents (refresh user on that day)

**Daily Check-In:**
- How do you feel about today? (What worked well and didn't?)
- Rate 1-10 on how fulfilled you are.
- What is the one thing you want to get done for tomorrow?
  - The next day, the user receives a reminder "summary" from weave of their intention set from yesterday as well as any upcoming binds for the day.

**Daily Feedback (AI Insights):**
- Take their daily check-in, synthesize with Weave's existing conception of the person's starting/current persona, to help surface a pattern or insight the user might not realize.
- Components:
  - Insight about themself that affirms the positive patterns/progress
  - Insight about themself that addresses their blocker
  - Summary of next day plan

*Users stay mindful of how they spend their time and also get feedback from Weave. Weave also gets more data from the user to improve its intelligence.*

### 4. Weave (Dashboard)

**"Weave" Character:**
- Spectrum from Starting Point to Dream Outcome to current positioning

**Consistency Breakdown:**
- Overall, By Needle, and By Bind
- % is based on the week and also task completion, and can be filtered by 2 weeks, 1 month, 60 days, 90 days (Streak can exist, but percent is the headline.)
- Badge system
  - If a user is consistent and meets our defined thresholds 0-20%, 20-40%, etc.

**Hero's Journey View (v2 Dashboard - Post MVP):**
- Achievement and milestone tracking (seeing what milestones you have reached in a nice timeline view)
- Heat map showing intensity (darker = more habits completed)
- Their progress / level on their goals and their overall level (another way to see progress)
  - We can use moving averages to ensure that we see the true scope of users progress.
- Their emotions (fulfillment, momentum etc)
- Roadblocks: Better pattern detection (day-of-week, time-of-day, frog avoidance)
- Future projections of their journey

### Summary of Functionality

The user has goals (needle) they are reminded and convicted of doing, with known habits/actions (binds) that they must complete to make progress towards their goals. Every day, the user documents their day, including the actions they've taken, as reminded by the AI, and at the end of the day, they reflect on what they've done and what they want to do tomorrow. At the end of the week, the user gets a weekly recap of their progress.

At any point in time, the user can see their progress in their dashboard, in which their logged actions impact their present digital avatar and how it contributes to getting them closer to their dream outcome via the Weave dashboard in terms of consistency and other data points. Additionally, the user can converse with Weave (the AI advisor) to get advice from their dream version of themself.

## Recovery Loop

**Problem:** If a user fails to check into the app, what should we do?

**Solution:**
- If user inactive 48h: next time they open, show "Welcome back. Take a 10-minute win."
- Give a Recovery Mission (ultra small, low friction)
- Show "streak resilience" metric, not just streak resets (this prevents shame spirals)

**Recovery System for Missed Days:**
- Consistent streaks earn "removal credits" for past misses
- Accelerates recovery from setbacks
- Similar to Duolingo's streak freeze but earned through performance
- User can recover missed habits/consistency percentage by getting three days in a row

## UI/UX Design

### Thread (Home Screen)

**Layout:**
- **Top:** Level and profile button, with AI insight/daily intention summary from yesterday (also texted to the user)
- **Middle:** 3 needles as dropdowns with the binds that need to be completed for each, empty boxes that are clicked will take user to the bind screen
- **Bottom:** Daily Check-in with instructions: log moments from your day and reflect with Weave on your daily progress (sends to document page as a reminder to document, which will turn into story recap, then to the actual reflection page, and then to AI feedback on reflection)
- **Floating button:** + and AI to document or converse with Weave.

### Weave Dashboard Screen

**Top = Identity Section (Emotional Mirror):**
- User's Weave (level), their needles, their anchor, and their dream outcome

**Bottom = Progress Dashboard (Data Mirror):**
- User's consistency % and heat map (filter by time frame, overall, needle, and bind type)
- Average fulfillment chart (filter by time frame)
- Both contain AI insights underneath that are potentially conversational
- Both allow user to drag across chart to pick out a certain date and explore that day's entries
- User can recover missed habits/consistency percentage by getting three days in a row

**Optional = History Section:**
- Sort by time frame (days, weeks, months) and medium (reflection, bind, photo, etc.) to find all records
- Searchable

### Weave Progression System

**Core Concept:**
- Users start as thread, each completed bind strengthens the weave
- Visual metaphor: More binds = more complex, beautiful pattern
- Status symbol aspect: Others can see your weave progression
- Inspired by Hollow Knight: Silksong game mechanics (thread, needle, binding)

**Implementation Approach:**
- Milestone-based progression vs. daily changes (too frequent would be annoying)
- Different tiers unlock at certain bind counts
- Dynamic shape generation based on user patterns
- Mathematical approach to create unique visualizations per user
- Reference: Opal app creates gemstones based on consistency metrics

### Dashboard Visualization Strategy

**Primary Display Elements:**
1. Character weave (personified representation)
2. Consistency tracking via gradient/heat map
3. Identity section with goals and progress stats
4. AI-generated insights with chat integration

**Gradient System:**
- Replaces calendar view
- Color intensity shows completion percentage (not just binary)
- Adapts to different timeframes (7 days to months)
- Heat map approach handles partial task completion (75% vs 0%)

**Graph Design:**
- Rolling 7-day average vs weekly resets
- Decided on continuous rolling average for accuracy
- Prevents false sense of progress from weekly resets

### Consistency Measurement Framework

**Moving Averages:**
- 7-day rolling window prevents single-day impact
- Stock ticker analogy: smooths out daily fluctuations
- More accurate long-term progress tracking

**Binary vs Percentage Tracking:**
- Binary: Simple yes/no completion
- Percentage: Partial completion recognition (coded 1.5/2 hours = 75%)

---

# AI System

## AI Principles (Non-Negotiable)

- **Editable by default:** Every AI-generated plan, Q-goal, subtask, recap can be edited.
- **No hallucinated certainty:** AI must label assumptions and ask questions when needed.
- **Deterministic personality:** Same user should get the same style of coaching tomorrow.
- **Guardrails:** Make sure the scope and constraints are good and there are GUARDRAILS.

### Cost Control (Important)

- Most screens should not call the model.
- Batch AI calls around journal time and onboarding.
- Cache outputs and only regenerate when user changes inputs.

## AI Modules

### Onboarding Coach

- **Output:** Goal structure (Goal → Q-goals → subtasks) + dream-self voice selection
- **Constraint:** Max 2 minutes of reading, otherwise they bounce.

### Triad Planner

- **Goal decomposition:** Break abstract goals into measurable sub-goals and actionable habits
- **Input:** Active goals, history, fulfillment trend, missed tasks
- **Output:** 3 tasks for tomorrow, balanced difficulty (one easy, one medium, one "important")

### Daily Recap Generator

- **Input:** Completed subtasks + captures + fulfillment score
- **Output:** Bullet recap + 1 insight + 1 suggestion

### Dream Self Advisor

- This is the "face" of AI: consistent voice, slightly opinionated, not generic.
- It should reference the user's identity doc and past wins, otherwise it feels fake.
- The idea of using dream self to give advice and motivate people is very powerful because it shows an idealized version of themselves and sells that identity.

### AI Insights Engine

- Deep behavioral analysis and pattern recognition
- Proactive recommendations and notifications
- Adaptive task suggestions based on user patterns
- "Second brain" functionality revealing user identity and trajectory
- **Trust-based system:** Rely on user honesty for proof rather than building complex verification
- **Proactive engagement:** Weekly deeper reflections and check-ins to accelerate AI understanding
- **Pattern recognition:** Analyze daily inputs to surface insights user cannot see independently

## AI Companion Guidelines

- Adaptive good personalities
- Either an animal, or a virtual human (Rive or other apps for character design)
- **Voice-first input:** Reduce friction through speech rather than typing
- Easy correction of the AI when need be
- Recovery loop should be easy

### Notification Strategy

- The AI Agent should proactively reach out
- We will focus on Notifications first, then look into iMessage integration

---

# Additional Features

## Identity Document

- **Archetype:** Choose 1 of 6–8, MBTI-like but not cringe
- **Dream self description:** 1 paragraph, user-editable
- **Motivation drivers:** 2–3
- **Constraints:** Time windows, energy patterns, obligations
- **Coaching preference slider:** Gentle ↔ strict (from settings)
- **"Failure mode"** (one selection): Procrastination, overcommitment, avoidance, perfectionism

## History Page

- Log page (with everything)
- Separate page for users who want to dig
- Comprehensive log with search/filter capabilities
  - Sort by timeframe, keyword search, photo attachments
  - Power user feature for detailed analysis

## Settings

### General Settings
- Name, username, email, phone number

### App Settings
- Nudging slider for how much the AI should proactively reach out
- How strict should the AI be for changing goals
- Data export (simple JSON later)
- Delete account (trust)

---

# Post-MVP Roadmap

## Weaves (Silk)

- Complex mathematical representation of threads based on the progress you make in the software
- Advanced visualization system

## Shared Accountability (V2)

### Shared Accountability Features

- Shared commitment mechanism for habit partnerships
  - Users pair with friends on similar goals (e.g., gym attendance)
  - Automatic notifications when partner completes habit
  - Dual function: reminder + proof of completion
- Minimal viable approach for social features
- Shareable profile pages showcasing achievements to the world

## Hero's Journey View (V2 Dashboard)

- Achievement and milestone tracking (seeing what milestones you have reached in a nice timeline view)
- Heat map showing intensity (darker = more habits completed)
- Their progress / level on their goals and their overall level (another way to see progress)
  - We can use moving averages to ensure that we see the true scope of users progress.
- Their emotions (fulfillment, momentum etc)
- Roadblocks: Better pattern detection (day-of-week, time-of-day, frog avoidance)
- Future projections of their journey

## Advanced Features

- Screen Time / app-blocker style data integration (v1.5)
- iMessage integration for AI notifications
- Enhanced social features
- Advanced analytics and insights

---

# Appendix: Historical Notes

## Design Philosophy Evolution

### Character/Mascot Discussion
- Debated anime girl vs universal appeal (bird, pet, penguin)
- Referenced successful bird mascots: Twitter, Duolingo, Club Penguin
- Considered gamification with leveling up companion/pet
- Animation challenges: expensive, limited technology for dynamic content

### Design Philosophy Differences
- Max prefers visual appeal, "wow factor" for Instagram-worthy content
- Jack favors functionality over aesthetics initially
- Agreed on Duolingo-style aesthetic as middle ground
- Plan extensive A/B testing with 10k+ users for validation

### Technical Approach
- First principles development vs iterating off existing (Life Reset)
- Rive app for code-based animation (recently updated)
- Godot game engine discussion for implementation

## Previous Feature Considerations

### 15-Level Difficulty System (Not in MVP)
- Level 1-4: Easy tasks
- Level 5-8: Hard tasks
- Level 9-15: Difficult to expert tasks
- Level 7-8 represents average difficulty (normalized curve)
- Separate level progression per category (gym, work, relationships)
- ELO-based progression system with trials to unlock higher difficulties
- Users can only access current level ±1 and all lower levels

### Monetization Models Considered
1. Duolingo-style: streak freezing, energy systems
2. Cosmetics for virtual companions
3. Premium features (risk of user churn)
4. Better AI/more AI usage

### MVP Development Strategy
- Core problem focus: Direction + consistency gaps (not discipline)
- Target solution: Bridge intention to action through AI coaching
- Competitive advantage: Automated, scalable version of one-on-one coaching
- Monetization: Free for 8 days, then paywall with data retention incentive

### Web App Design Review & Refinements
- Core app structure solid with goals displayed upfront
- Weakest design areas identified:
  - Daily recap functionality needs redesign
  - Launcher recap requires visual overhaul
  - Overall consistency and visualization need refinement
- User validation critical before building recap features
  - Must confirm users actually want story-style daily reflection
  - Build-test-feedback approach for all new features

---

*Last Updated: MVP Planning Phase*

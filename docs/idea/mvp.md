# Weave MVP Specification

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
   - [History & Settings](#history--settings)
6. [Post-MVP Roadmap](#post-mvp-roadmap)

---

# Product Overview

## Product Definition

**Working Name:** Weave

**One-liner:** *Turn vague goals into daily wins, proof, and a stronger identity in 10 days.*

**Primary User:** Ambitious but chaotic students and builders (high intent, inconsistent execution).

**Promise:** "Give me 10 days and I will show you who you are becoming."

## Success Metrics

**North Star:** *Active Days with Proof*

An "Active Day" = user completes at least 1 subtask + logs either:
- (a) a memory/capture, or
- (b) a journal check-in

**Onboarding Success:** User completes onboarding + sets 1 goal + completes 1 mission in first 24 hours.

## Competitive Moats

### A) Identity + Narrative Switching Cost (Psychological)

- Users don't just log tasks; they build a "story of self" with proof and reflection
- Leaving means losing momentum history, identity continuity, and progress artifacts (Day 10 snapshot, streak calendar, badges)
- Psychological investment in the identity narrative creates strong retention

### B) Unique Dataset: Goals → Q-goals → Subtasks + Proof + Mood

- Most apps collect tasks OR journaling. We collect the *link* between intention → action → evidence → emotion
- That link enables better planning and coaching than generic todo apps or generic journaling apps
- We assume the user has an iceberg and we want to go deep in this iceberg to really understand the user
- This unique data structure becomes a competitive advantage as it scales

### C) Deterministic Personalization (Trust Moat)

- The AI is not a random chatbot. It is constrained by:
  - User archetype + dream self voice
  - Goal structure
  - Completion history and difficulty calibration
- This makes advice feel consistent and "built for me," which is rare
- We are also looking at supporting niches that have consistent pain and is measurable

### D) Distribution Wedge (MVP-level)

- Shareable "Before vs After (10 Days)" card:
  - Consistency score, rank, badges, highlight wins, one sentence identity shift
- People share progress. They do not share "I used a todo app."
- Viral potential through progress sharing

### E) Optional Later Moat (Do Not Block MVP)

- Screen Time / app-blocker style data can become a moat later, but it's permission heavy and easy to screw up UX. Treat as v1.5.

## Ideal Customer Profile

**Primary ICP:** 20-year-old college student that is ambitious, but may feel directionally lost and also inconsistent with their goal achievements. They need a more personalized roadmap.

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
   - Goal → Quantifiable-goals → Consistent habit/actions
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

4. **Daily Reflection (Journaling Session)**
   - Understands what went well and what didn't
   - Intakes a fulfillment score (1-10)
   - Helps decide plan for the next day

5. **Progress Visualization**
   - Consistency % heat map
   - Average fulfillment
   - Weave character leveling up based on number of binds completed

6. **AI Coach**
   - Structured, editable, consistent personality
   - Based on the dream self of the user

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
   - AI converts abstract goal into a measurable plan plus milestones, but user can edit
   - Here's what we suggest the right cadence should look like. If it's quantifiable, here's how we'll update your progress
   - Goal limitations: Hard cap on number of simultaneous goals to prevent overcommitment

5. **App Tutorial**
   - Why the app (compared to traditional apps):
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

### Prerequisites from Onboarding

- User understands their current snapshot and their projected snapshot that informs the personality of their Weave
- User shares screen time information and calendar integration so AI has more context on them (optional at this stage)
- User has set out on at least one initial needle (goal) and knows the binds (habits) that they should complete

### Weave Reminders

Weave notifies and texts user their Daily Intention/Task list of binds. They will repeatedly "pester/gently remind" (depending on user preferences discovered from onboarding and that can be changed in settings) about bind completion in a conversational way (you need to do this/why haven't you done this yet? when are you going to do this?) via text.

### 1. Document (Action + Memory Capture)

**Binds:**
- Photo/Timer proof of the action that they want to complete towards their goals
- Going above and beyond the initial goal will be acknowledged but not rewarded by the app in terms of progress in leveling up
- Dual path system:
  - Positive trajectory (the future if you keep going) - shown when the user feels like it is difficult or they are about to quit
  - Negative trajectory - if the user is not as sure
- After you complete the tasks you do a short confetti + optional "1 reflection prompt" (optional)

**Daily Media to Remember:**
- Notes/Memos/Photos that the user wants to carry with them
- The User's Weave reminds and prods the user to document their day using curiosity

*This helps the user store memories to look back on, also logs their action towards their goals, and provides Weave additional data about the user to get smarter on.*

### 2. Thread (Reflection)

**Recap:**
- Summarize the documents (refresh user on that day)

**Daily Check-In:**
- How do you feel about today? (What worked well and didn't?)
- Rate 1-10 on how fulfilled you are
- What is the one thing you want to get done for tomorrow?
  - The next day, the user receives a reminder "summary" from weave of their intention set from yesterday as well as any upcoming binds for the day

**Daily Feedback (AI Insights):**
- Take their daily check-in, synthesize with Weave's existing conception of the person's starting/current persona, to help surface a pattern or insight the user might not realize
- Components:
  - Insight about themself that affirms the positive patterns/progress
  - Insight about themself that addresses their blocker
  - Summary of next day plan

*Users stay mindful of how they spend their time and also get feedback from Weave. Weave also gets more data from the user to improve its intelligence.*

### 3. Weave (Dashboard)

**"Weave" Character:**
- Spectrum from Starting Point to Dream Outcome to current positioning

**Consistency Breakdown:**
- Overall, By Needle, and By Bind
- % is based on the week and also task completion, and can be filtered by 2 weeks, 1 month, 60 days, 90 days (Streak can exist, but percent is the headline)
- Badge system
  - If a user is consistent and meets our defined thresholds 0-20%, 20-40%, etc.

**Hero's Journey View (v2 Dashboard - Post MVP):**
- Achievement and milestone tracking (seeing what milestones you have reached in a nice timeline view)
- Heat map showing intensity (darker = more habits completed)
- Their progress / level on their goals and their overall level (another way to see progress)
  - We can use moving averages to ensure that we see the true scope of users progress
- Their emotions (fulfillment, momentum etc)
- Roadblocks: Better pattern detection (day-of-week, time-of-day, frog avoidance)
- Future projections of their journey

### 4. Needles (Max of 3 Goals at a time)

**Note:** User can add or remove their goals whenever. Typically done at onboarding and not part of a core loop, but whenever the user feels it to be necessary.

**Setting Goals:**
- User inputs whatever, AI helps shape the answer + affirms them
  - Example: "get jacked"
- Probing Questions: why is this a goal? why does this matter to you? how far along are you right now?
- AI will formulate a future identity that the user *buys into* (current vs projected snapshot)
  - "You are committed to doing this because of _"
- Breaks down into subgoals/milestones, and suggested binds (suggested by AI)
  - Evaluates current situation and provides progression roadmap (**Gradual difficulty increase**: Start with easy wins, progressively challenge users as habits form); user can provide input

*This grounds the user in what they want to do from both a long-term and short-term scale. They are reaffirmed by their "why" and also know the necessary steps it'll take, and can see the future version of themself vs. their current.*

**Changing Goals (Optional at this stage):**
- Three strictness modes for goal changes:
  - **Normal**: Changes require justification
  - **Strict**: Changes require daily reflection
  - **None**: No changes allowed

### Summary of Functionality

The user has goals (needle) they are reminded and convicted of doing, with known habits/actions (binds) that they must complete to make progress towards their goals. Every day, the user documents their day, including the actions they've taken, as reminded by the AI, and at the end of the day, they reflect on what they've done and what they want to do tomorrow. At the end of the week, the user gets a weekly recap of their progress.

At any point in time, the user can see their progress in their dashboard, in which their logged actions impact their present digital avatar and how it contributes to getting them closer to their dream outcome via the Weave dashboard in terms of consistency and other data points. Additionally, the user can converse with Weave (the AI advisor) to get advice from their dream version of themself.

## Recovery Loop

**Problem:** If a user fails to check into the app, what should we do?

**Solution:**
- Weave will text/notify the user with deeply personal insults/points of encouragement, with reminders of the 3 day consistency bonus (negates a missed day)
- Show "streak resilience" metric, not just streak resets (this prevents shame spirals)

**Recovery System for Missed Days:**
- Consistent streaks earn "removal credits" for past misses
- Accelerates recovery from setbacks
- Similar to Duolingo's streak freeze but earned through performance
- User can recover missed habits/consistency percentage by getting three days in a row

## UI/UX Design

### Navigation Structure

Two primary screens:

1. **Thread (the home screen)** - Gives an overview of the user's current Weave level/status, their goals and tasks for the day, and a daily check-in for the end of the day that includes a space to document notes, photos, voice memos from the day that want to be remembered.

2. **Weave (the progress screen)** - Shows an in-depth mirror of the user from both an emotional perspective (remind them of their motivations/desires, where their current weave is in regards to their starting point and their dream outcome) and a data perspective (consistency with bind completion, fulfillment). AI insights are surfaced here that identify patterns or observations the user may not realize. This page will also include a full history of all of the users documented media (binds, reflections, photos, etc.).

A floating menu button exists on both screens that allows the user to talk to Weave or to document parts of their day.

### Thread (Home Screen)

**Layout:**
- **Top:** Level and profile button, with AI insight/daily intention summary from yesterday (also texted to the user)
- **Middle:** 3 needles as dropdowns with the binds that need to be completed for each, empty boxes that are clicked will take user to the bind screen
- **Bottom:** Daily Check-in with instructions: log moments from your day and reflect with Weave on your daily progress (sends to document page as a reminder to document, which will turn into story recap, then to the actual reflection page, and then to AI feedback on reflection)
- **Floating button:** + and AI to document or converse with Weave

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
- Users start as a thread, each completed bind strengthens the weave
    - Visual metaphor: More binds = more complex, beautiful pattern
    - Status symbol aspect: Others can see your weave progression
    - Inspired by Hollow Knight: Silksong game mechanics (thread, needle, binding)

**Implementation Approach:**
    - Milestone-based progression, not daily changes (too frequent would be annoying)
    - Different tiers/levels (complexity of the weave) unlock at certain bind counts
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

**Recovery System for Missed Days:**
- Consistent streaks earn "removal credits" for past misses
    - Accelerates recovery from setbacks
- Similar to Duolingo's streak freeze but earned through performance

**Binary vs Percentage Tracking:**
    - Binary: Simple yes/no completion
    - Percentage: Partial completion recognition (coded 1.5/2 hours = 75%)

### Technical Implementation Notes

- History section: Comprehensive log with search/filter capabilities
    - Sort by timeframe, keyword search, photo attachments
    - Power user feature for detailed analysis
- Future projections: AI-generated narrative stories vs mathematical projections
- Identity integration: Goals, motivations, before/after stats prominently displayed
- Marketing opportunity: Leverage Silksong game popularity for user acquisition

---

# AI System

## AI Principles (Non-Negotiable)

- **Editable by default:** Every AI-generated plan, Q-goal, subtask, recap can be edited
- **No hallucinated certainty:** AI must label assumptions and ask questions when needed
- **Deterministic personality:** Same user should get the same style of coaching tomorrow
- **Guardrails:** Make sure the scope and constraints are good and there are GUARDRAILS

### Cost Control (Important)

- Most screens should not call the model
- Batch AI calls around journal time and onboarding
- Cache outputs and only regenerate when user changes inputs

## AI Modules

### Onboarding Coach

- **Output:** Goal structure (Goal → Q-goals → subtasks) + dream-self voice selection
- **Constraint:** Max 2 minutes of reading, otherwise they bounce

### Triad Planner

- **Goal decomposition:** Break abstract goals into measurable sub-goals and actionable habits
- **Input:** Active goals, history, fulfillment trend, missed tasks
- **Output:** General habits that are easily trackable that are customizable to potential outputs (for getting fit, habits could be "lifting x times per week, eating x grams of protein")

### Daily Recap Generator

- **Input:** Completed subtasks + captures + fulfillment score
- **Output:** Bullet recap + 1 insight + 1 suggestion

### Dream Self Advisor

- This is the "face" of AI: consistent voice, slightly opinionated, not generic
- It should reference the user's identity doc and past wins, otherwise it feels fake
- The idea of using dream self to give advice and motivate people is very powerful because it shows an idealized version of themselves and sells that identity

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

## History & Settings

### History Page

- Log page (with everything)
- Separate page for users who want to dig
- Comprehensive log with search/filter capabilities
  - Sort by timeframe, keyword search, photo attachments
  - Power user feature for detailed analysis

### Settings Page

**General Settings:**
- Name, username, email, phone number

**App Settings:**
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
  - We can use moving averages to ensure that we see the true scope of users progress
- Their emotions (fulfillment, momentum etc)
- Roadblocks: Better pattern detection (day-of-week, time-of-day, frog avoidance)
- Future projections of their journey

## Advanced Features

- Screen Time / app-blocker style data integration (v1.5)
- iMessage integration for AI notifications
- Enhanced social features
- Advanced analytics and insights

---

*Last Updated: MVP Planning Phase*

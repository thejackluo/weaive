# Epic 1: Onboarding (Optimized Hybrid Flow)

## Overview

**Goal:** Maximize completion → emotional resonance → early activation → set up the 7-day retention loop → gather deep personalization incrementally.

New users experience a streamlined onboarding that gets them to their first "win" within 3 minutes, then progressively gathers deeper personalization over the first 3-4 days of actual usage.

---

## PHASE 1 — Emotional Hook (PRE-AUTH, 45s max)

### US-1.1: Welcome & Vision Hook

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

### US-1.2: Emotional State Selection (Painpoint Identification)

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
- Store `initial_painpoints` in `user_profiles.json` (array of 1-2 strings)

**Technical Notes:**
- Deterministic mapping → no AI call
- Used later to adjust early prompts and tone

**CRITICAL AI PERSONALIZATION USAGE:**

Painpoints selected here define **who the user IS NOW** (current struggles).
Combined with identity traits from US-1.6 (aspirational values), Weave creates **tension-driven coaching**:

**How Painpoints Inform AI Messaging:**
- **Consistency struggle** → Weave acknowledges "I know you start strong but fall off" + leverages aspirational identity to motivate
- **Action struggle** → Weave acknowledges "I know you overthink" + challenges user to act in alignment with stated values
- **Clarity struggle** → Weave acknowledges "I know direction feels unclear" + pushes for commitment over exploration
- **Alignment struggle** → Weave acknowledges "I know you feel alone in this" + validates ambition while suggesting actionable next steps

**Example Personalized Message:**
- User selects: "Consistency" (US-1.2) + "Consistent Effort" (US-1.6)
- Weave says: *"You still have a bind left. As someone who values consistent effort, you gotta make it happen."*
- Creates cognitive dissonance between stated value and current inaction

See `docs/idea/ai.md` → Personalization Framework for complete implementation guidelines.

---

### US-1.3: Symptom Insight Screen (Dynamic Mirror)

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

### US-1.4: Weave Solution Screen (Dynamic "Here's What Changes Now")

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

### US-1.5: Authentication

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

## PHASE 2 — Light Identity Bootup (IN-APP, FAST)

### US-1.6: Name Entry, Weave Personality Selection & Identity Traits

**Priority:** M (Must Have)

**As a** new user
**I want to** enter my name, choose how my Weave interacts with me, and select traits I want to grow into
**So that** the experience feels personally motivating and aligned with my communication style

**Acceptance Criteria:**

**Step 1: Name Entry**
- [ ] Display welcoming header: "Let's get to know you"
- [ ] Input field: "What should we call you?" (single line text input)
- [ ] Placeholder: "Your first name or nickname"
- [ ] Validation: Required field, 1-50 characters, no special characters
- [ ] CTA: "Continue" (disabled until valid name entered)
- [ ] Completion time <10 seconds

**Step 2: Weave Personality Selection**
- [ ] Display title: "I'm your Weave, your future self that we create together. How should I engage with you?"
- [ ] Display subheading: "You can change this anytime. This sets my core personality — and I'll adapt as I understand you better."
- [ ] Display one persona card at a time (swipeable left ↔ right)
- [ ] Pagination dots (2 total)
- [ ] Each persona card includes:
  - Weave icon (animated subtly)
  - Persona title
  - Three example lines demonstrating tone
- [ ] **Persona 1: Supportive but Direct**
  - Tone: grounded, honest, steady, confidence-building without coddling
  - Example lines:
    - "You don't need motivation — just one clear step. Let's choose it."
    - "You're capable. More than you think. Let's act on it."
    - "If you slipped, just reset. One small restart changes everything."
- [ ] **Persona 2: Tough but Warm**
  - Tone: Gen Z-coded, playful, dry humor, gently confrontational, gender-neutral
  - Example lines:
    - "alright, lock in. you said you wanted this."
    - "nice. that was actually clean. keep the pace."
    - "bro… where'd you go 💀 let's get back to it."
- [ ] PanResponder-based swipe gestures (both directions supported)
- [ ] CTA: "Continue" (enabled immediately after selection)
- [ ] Selection saved to `user_profiles.core_personality`
- [ ] Liquid-glass card aesthetic with subtle thread animation
- [ ] Supportive persona in proper casing; Tough persona in lowercase + emoji support
- [ ] No "✓ Selected" text indicator (card border shows selection)
- [ ] No arrow navigation buttons (swipe-only with pagination dots)
- [ ] Proper spacing between card and Continue button (24px)
- [ ] Completion time <20 seconds

**Step 3: Identity Traits (Aspirational Focus)**

**User-Facing Copy:**
- [ ] Display title: "Who do we want to become?"
- [ ] Display subtext: "Choose the 3 most important qualities you want to embody."

**Acceptance Criteria:**
- [ ] Display 8 total trait options as selectable chips
- [ ] User must select exactly 3 traits to continue
- [ ] No scrolling required on standard mobile screen
- [ ] Completion time target: <10 seconds
- [ ] Traits are framed as aspirational (who the user is becoming), not fixed personality
- [ ] User can edit selections later in Profile
- [ ] Chip layout: 2-1-2-1-2 arrangement for visual balance (longest text alone to prevent layout shifts)

**Trait Options (Final):**
- [ ] Clear Direction
- [ ] Intentional Time
- [ ] Decisive Action
- [ ] Consistent Effort
- [ ] High Standards
- [ ] Continuous Growth
- [ ] Self Aware
- [ ] Emotionally Grounded

**Selection Requirements:**
- [ ] Exactly 3 traits required
- [ ] Traits are weighted equally on selection
- [ ] Behavioral data takes precedence after onboarding
- [ ] Hard validation: must select exactly 3
- [ ] Track analytics event: `identity_traits_selected` with selected traits + completion time

**Behavioral & AI Impact (Non-User Facing):**

**CRITICAL PERSONALIZATION FRAMEWORK:**

Identity traits selected here define **who the user WANTS TO BE** (aspirational values).
Combined with painpoints from US-1.2 (current struggles), Weave creates **tension-driven coaching**:

- **US-1.2 painpoints** = Who the user IS NOW (e.g., "I struggle with consistency")
- **US-1.6 identity traits** = Who the user WANTS TO BE (e.g., "I value consistent effort")
- **Weave's messaging** = Bridges the gap by creating motivational tension

**Example:** User struggles with "Consistency" but values "Consistent Effort"
→ Weave: *"You still have a bind left. As someone who values consistent effort, you gotta make it happen."*

Selected traits are used as primary personalization signals that influence:
- Weave's tone (gentle vs direct vs challenging)
- Bind difficulty and pacing
- Reminder frequency and urgency
- Reflection depth and prompt style
- Insight framing (performance-oriented vs introspective)
- **Language in notifications** - "As someone who values [trait]..."
- **Daily recaps** - Progress toward stated values
- **Triad generation** - Suggest binds aligned with traits
- Traits represent initial intent, not fixed identity
- Observed behavior can override trait assumptions over time

See `docs/idea/ai.md` → Personalization Framework for complete implementation guidelines.

**Data Requirements:**
- [ ] Persist selected traits to: `identity_docs.json.active_traits` (array of 3 strings)
- [ ] Persist immediately upon completion

**Technical Notes:**
- [ ] Deterministic selection (no AI call)
- [ ] Hard validation: must select exactly 3
- [ ] Track analytics event: `identity_traits_selected`
  - Include selected traits + completion time

**Success Metrics:**
- [ ] 95% completion rate
- [ ] Median completion time <10 seconds
- [ ] Low hesitation/back-navigation rate (<5%)
- [ ] Positive correlation with Day 1–3 bind completion

**Why This Step Exists:**
This step:
- Captures values + inner orientation that are hard to infer early
- Avoids redundant signals that Weave can learn from behavior
- Gives the AI enough context to meaningfully change tone and structure
- Keeps onboarding fast, intuitive, and emotionally resonant

**Data Requirements:**
- Write `preferred_name` → `user_profiles.preferred_name` (VARCHAR 50)
- Write `core_personality` → `user_profiles.core_personality` (ENUM: "supportive_direct" | "tough_warm")
- Write `personality_selected_at` → `user_profiles.personality_selected_at` (TIMESTAMPTZ)
- Write `identity_traits` → `user_profiles.identity_traits` (JSONB array)

**Event Tracking:**
- `name_entered` (existing)
- `weave_personality_shown`
- `weave_personality_swiped`
- `weave_personality_selected` (with value: "supportive_direct" | "tough_warm")
- `identity_traits_selected` (existing)

**Usage of Personality Selection:**
- Tone of push notifications and reminders
- Voice during daily reflections
- Encouragement messages during bind completion
- AI commentary and coaching style
- Long-term personalization as user data accumulates

**Technical Notes:**
- All content static; no AI calls required
- Ensure smooth swipe performance (60fps)
- Emoji compatibility across iOS/Android
- Use fallback arrows for accessibility if swipe isn't detected
- Should be dismissible via swipe but not skippable
- Transition to US-1.7 upon Step 3 completion

**Total Flow Time:** <45 seconds

---

### US-1.7: First Needle (Goal Definition – Simple)

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

## PHASE 3 — Early Value Proof ("Wow Moment")

### US-1.8: Weave Path Generation (AI-Assisted)

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

### US-1.9: First Commitment Ritual (Bind #1)

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

## PHASE 4 — Lightweight Orientation

### US-1.10: App Mini-Tutorial (Tooltip Style)

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

## PHASE 5 — Trial Activation

### US-1.11: Welcome Into the 7-Day Journey

**Priority:** M (Must Have)

**As a** new user
**I want to** understand I'm beginning a guided 7-day experience
**So that** I'm motivated to continue

**Acceptance Criteria:**
- [ ] Banner at top: "You're on Day 1 of your 7-day transformation."
- [ ] No paywall
- [ ] User enters Thread (Home)

---

## PHASE 6 — Deferred Deep Personalization (Post-Activation)

These replace the earlier heavy pre-auth screens and are delivered contextually during Days 1-3.

### US-1.12: Dream Self (Day 1 Evening Prompt)

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

### US-1.13: Archetype Micro-Assessment (Day 2)

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

### US-1.14: Motivations & Failure Modes (Day 2-3)

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

### US-1.15: Constraints & Demographics (Day 3)

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

## PHASE 7 — Monetization

### US-1.16: Soft Paywall (Day 3-4 Trigger)

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

## Epic 1 Summary (Hybrid Flow)

| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-1.1 | Welcome | M | 2 pts |
| US-1.2 | Painpoint Selection | M | 3 pts |
| US-1.3 | Insight Mirror | M | 2 pts |
| US-1.4 | Weave Solution | M | 2 pts |
| US-1.5 | Auth | M | 3 pts |
| US-1.6 | Name Entry, Weave Personality & Identity Traits | M | 5 pts |
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

**Epic Total:** 50 story points (includes name entry + Weave Personality Selection in US-1.6)

**Note:** This hybrid flow increases story points from 35 to 50, but distributes complexity across the user journey, resulting in higher activation rates and lower drop-off. The deferred personalization (US-1.12 through US-1.15) can be implemented incrementally without blocking the core onboarding flow. The additional points account for name entry and Weave personality selection in US-1.6.

---

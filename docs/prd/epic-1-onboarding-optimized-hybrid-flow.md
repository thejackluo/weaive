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

### US-1.7: Commitment Ritual & Origin Story (First Bind)

**Priority:** M (Must Have)

**User Story:**

As a new user, I want to mark the beginning of my transformation in a personal, meaningful way so that I feel emotionally committed and can look back on where I started.

**Overview / Rationale:**

This ritual transforms onboarding inputs into a permanent origin story.

By reflecting the user's:
- current struggles,
- desired future traits,
- and spoken commitment,

Weave creates a time-stamped narrative artifact that:
- reinforces identity change,
- anchors motivation,
- and gives future progress emotional context.

This first Bind is symbolic, narrative, and irreversible.

**Flow Summary:**

- **Trigger:** After completion of Primary struggle selection (1–2) and Dream self trait selection (3)
- **Total Screens:** 3
- **Total Time:** ~45–60 seconds

#### Screen 1: Narrative Validation (Current → Future)

**Purpose:**

Mirror the user's internal story back to them and establish the transformation arc.

**Dynamic UI Copy (Template):**

- **Title:** "This is where your story shifts."
- **Body (auto-generated using user data):**
  - "Right now, you're feeling [primary struggle 1] (and [primary struggle 2], if selected)."
  - "But you want to become someone who is [dream trait 1], [dream trait 2], and [dream trait 3]."
  - "Weave is how you bridge that gap — one action at a time."
- **Primary CTA:** "Take the first step →"

**Acceptance Criteria:**
- [ ] Copy dynamically injects 1–2 struggles (plain-language labels) and 3 future traits
- [ ] Copy must read naturally (use conjunction logic)
- [ ] No user input on this screen
- [ ] Completion time < 10 seconds
- [ ] Track event: `origin_story_intro_viewed`

**Technical Notes:**
- Dynamic text generation (non-AI, deterministic)

#### Screen 2: Origin Story Capture (Commitment Bind)

**Purpose:**

Create a digital postcard from Day 0 — a multi-modal record of the user's starting point. This is the first Bind.

**UI Copy:**

- **Title:** "Let's make this moment official."
- **Body:**
  - "Take a photo and record a short voice note saying:"
  - *"Today is [date]. My name is [name]. I'm starting this because I'm [struggle], and I'm committed to becoming someone who is [dream traits]."*
  - "This will be saved as the beginning of your story — something you can return to anytime."
- **Primary CTA:** "Complete Bind"

**Interaction Requirements:**
- [ ] Camera capture (required)
- [ ] Voice note capture (required)
- [ ] Display a preview card showing:
  - User photo (thumbnail)
  - Auto-formatted text summary: "From: [struggle(s)]" / "To: [dream traits]"
- [ ] User confirms once before final submission

**Acceptance Criteria:**
- [ ] User must complete both photo and voice note
- [ ] Preview of the "origin story card" is shown before final submit
- [ ] On submit:
  - Bind is marked complete
  - Origin story artifact is created
  - User proceeds immediately to success screen

**Data Requirements:**

Create a persistent Origin Story Record:
- `origin_created_at`
- `starting_struggles[]`
- `dream_traits[]`
- `photo_asset_id`
- `voice_note_asset_id`
- `origin_summary_text`

Associate this with:
- first `bind_instance`
- user history/log

**Technical Notes:**
- Media stored securely
- Origin Story is immutable (retention)
- Track event: `origin_story_created`

#### Screen 3: Completion & Reinforcement

**Purpose:**

Deliver emotional reinforcement and define what a Bind means.

**UI / Animation:**
- Weave animation evolves from blank → first form
- Confetti or subtle glow
- Level bar animates from 0 → 1

**UI Copy:**

- **Title:** "This is your beginning."
- **Body:**
  - "You've created your origin story."
  - "Every Bind you complete builds on this moment — strengthening your Weave and the person you're becoming."
- **Primary CTA:** "Continue →"

**Acceptance Criteria:**
- [ ] Animation plays once
- [ ] CTA advances to next onboarding step
- [ ] No additional explanation required
- [ ] Completion time < 6 seconds
- [ ] Track event: `origin_bind_completed`
- [ ] Set: `first_bind_completed_at`, `user level = 1`

**Where This Lives in the App (Critical):**

The Origin Story should be accessible from:
- Weave profile / identity section
- Timeline / history view
- "Look how far you've come" moments (Day 10, Day 30)

It is never edited — only revisited.

**Success Criteria:**
- ≥ 95% completion rate
- Users can articulate what a "Bind" is without explanation
- Increased emotional attachment to early progress
- Stronger long-term retention driven by narrative continuity

---

### US-1.8: Create Your First Needle (Goal + Plan)

**Priority:** M (Must Have)

**User Story:**

As a new user, I want to create my first Needle so that my daily actions are connected to a clear long-term goal.

**Overview / Rationale:**

After completing the Commitment Ritual (US-1.7), the user is emotionally invested and ready for structure.

This step introduces:
- what a Needle is,
- how Binds relate to it,
- and provides an AI-generated plan that is explicitly flexible.

**Flow Summary:**

- **Trigger:** Immediately after US-1.7: Commitment Ritual & Origin Story
- **Total Screens:** 4
- **Total Time:** ~90 seconds

#### Screen 1: Introduce Needles

**UI Copy:**

- **Title:** "Give your actions direction."
- **Body:**
  - "The Binds you complete each day connect to your Needles — the long-term goals you're working toward."
  - "Let's create your first one."
  - "You can change or refine this anytime."
- **Primary CTA:** "Create my first Needle →"

**Acceptance Criteria:**
- [ ] Display educational card explaining Needles
- [ ] Reassure that this is flexible (not permanent)
- [ ] No user input required on this screen
- [ ] Track event: `needle_intro_viewed`

#### Screen 2: Choose Your First Needle (Suggested Options)

**UI Copy:**

- **Title:** "What do you want to work on first?"
- **Subtext:** "This doesn't have to be perfect — it's just a starting point."

**Suggested Options (single-select):**
- [ ] Build a simple fitness routine
- [ ] Improve my sleep and daily energy
- [ ] Reduce stress and feel more balanced
- [ ] Get back into a healthy rhythm
- [ ] Improve focus and productivity
- [ ] Make steady progress in school
- [ ] Work consistently on a project
- [ ] Start or rebuild a creative habit
- [ ] Prepare for an upcoming opportunity
- [ ] Build discipline around my work

**Secondary Option:**
- **Link:** "Can't find yours? Type your own goal"

**Acceptance Criteria:**
- [ ] Display 10 suggested goal options as selectable cards
- [ ] User must select exactly one option OR enter custom goal
- [ ] Custom goal input: 10-200 characters
- [ ] Track event: `needle_option_selected` with chosen option
- [ ] If custom: Track event: `needle_custom_entered`

#### Screen 3: Optional Customization

**UI Copy:**

- **Title:** "Want to make this more specific?"
- **Input Placeholder:** "e.g. gym, writing, studying, startup"
- **Primary CTA:** "Continue →"
- **Secondary CTA:** "Skip" (allowed)

**Acceptance Criteria:**
- [ ] Optional text input (0-100 characters)
- [ ] User can skip this screen
- [ ] If provided, append to goal context for AI
- [ ] Track event: `needle_customized` if user adds text

#### Screen 4: AI Plan Breakdown

**UI Copy:**

- **Title:** "Here's how we'll work toward this."
- **Body:**
  - "I've broken your Needle into milestones and Binds that are realistic and sustainable."
  - "This is a starting point — not a contract."
  - "You can adjust anything later."

**Display:**
- [ ] Show AI-generated breakdown:
  - Needle title (refined)
  - Needle summary (1-2 sentences)
  - 2–3 milestones (progress checkpoints)
  - 2–4 Bind templates (daily/weekly actions)
- [ ] Each item is editable (tap to edit inline)
- [ ] Loading state while AI processes (1-10 seconds)
- [ ] Show "Shaping your path..." animation during AI call

**Primary CTA:** "Looks good →"

**Acceptance Criteria:**
- [ ] User selects exactly one Needle option (or enters custom)
- [ ] AI generates structured breakdown using selected Needle + customization
- [ ] All outputs are editable before accepting
- [ ] Loading animation displays during AI processing
- [ ] Error handling: If AI fails, show friendly error + retry option
- [ ] Track event: `needle_plan_generated`
- [ ] Track event: `needle_plan_accepted` when user continues

**Data Requirements:**

Persist to database:
- `goals` table: Create first Needle record
  - `title` (AI-generated or user custom)
  - `description` (AI-generated summary)
  - `status` = 'active'
  - `order_index` = 1
- `qgoals` table: Create 2-3 milestone records (quantifiable sub-goals)
- `subtask_templates` table: Create 2-4 Bind template records
- `ai_runs` table: Log AI generation metadata

**AI Module:** Onboarding Coach (deterministic constraints, ~70% success probability)

**Technical Notes:**
- Reuse AI service from Story 0.6 (AI Service Abstraction)
- Use user's painpoints (from US-1.2) and identity traits (from US-1.6) as AI context
- Goal templates should map to predefined examples for faster generation
- Fallback: If AI fails, use deterministic template-based breakdown

---

## PHASE 3 — Early Value Proof ("Wow Moment")

### US-1.9: First Daily Reflection (Day 0 Check-In)

**Priority:** M (Must Have)

**User Story:**

As a new user, I want to complete a daily check-in so that I feel present and so Weave can begin learning how I think.

**Overview / Rationale:**

Reflection is the third pillar of Weave:
- **Needles** = direction
- **Binds** = action
- **Reflection** = meaning

This first reflection closes Day 0 emotionally and reinforces intentionality.

**Screen: Daily Check-In**

**UI Copy:**

- **Title:** "One last thing for today."
- **Body:**
  - "Daily check-ins help you stay present and intentional — and help me understand you better over time."
- **Prompt:** "How are you feeling right now, knowing you've started?"
- **Input:** Text or voice input; no minimum length
- **Primary CTA:** "Complete check-in →"

**Acceptance Criteria:**
- [ ] Reflection is required to proceed (cannot skip)
- [ ] Text input: multi-line textarea, no character minimum
- [ ] Voice input: optional alternative (tap mic icon to record)
- [ ] Stored as Day 0 reflection in `journal_entries` table
- [ ] Track event: `first_reflection_completed`
- [ ] Completion time target: <30 seconds

**Reflection Prompt Logic (Days 0–3):**

| Day | Prompt |
|-----|--------|
| Day 0 | "How are you feeling right now, knowing you've started?" |
| Day 1 | "What felt easiest about showing up today?" |
| Day 2 | "What got in your way today — even a little?" |
| Day 3 | "What's starting to feel different about you?" |

**Data Requirements:**
- Create first `journal_entries` record:
  - `user_id`
  - `local_date` = Day 0 (today's date)
  - `reflection_text` (user input)
  - `fulfillment_score` = NULL (not prompted on Day 0)
  - `created_at`

**Technical Notes:**
- Day 0 reflection skips fulfillment slider (introduced on Day 1)
- Voice input stored as audio file + transcribed text
- Use Expo Audio API for voice recording

---

## PHASE 4 — Lightweight Orientation

### US-1.10: Progress Dashboard Introduction

**Priority:** M (Must Have)

**User Story:**

As a new user, I want to understand how progress is tracked so that I know where to look as I continue.

**Overview / Rationale:**

This step orients the user without over-explaining. The goal is clarity, not feature comprehension.

**Dashboard Tooltips (3 Total):**

**Tooltip 1 — Weave Visualization**
- **Target:** Weave avatar/character visualization
- **Text:** "This is your Weave. It grows as you show up."
- **Placement:** Center screen, pointing to Weave visualization

**Tooltip 2 — Binds & Reflections**
- **Target:** Binds list or activity log
- **Text:** "Binds and reflections are how you strengthen it."
- **Placement:** Mid-screen, pointing to Binds section

**Tooltip 3 — Progress Over Time**
- **Target:** Consistency heat map or progress chart
- **Text:** "This is where consistency compounds."
- **Placement:** Lower screen, pointing to progress visualization

**Acceptance Criteria:**
- [ ] Max 3 tooltips (no more)
- [ ] Tap-to-advance (no auto-dismiss)
- [ ] Tooltips appear in sequence (1 → 2 → 3)
- [ ] Cannot skip tooltips (must tap through all 3)
- [ ] Completion time < 20 seconds
- [ ] Track event: `dashboard_intro_completed`
- [ ] Tooltips only shown once (never repeat)

**Technical Notes:**
- Use design system tooltip component
- Store completion in `user_profiles.onboarding_dashboard_intro_completed`
- Simple overlay with semi-transparent background + spotlight effect

---

## PHASE 5 — Trial Activation & Handoff

### US-1.11: Housekeeping, Trial Framing & Handoff

**Priority:** M (Must Have)

**User Story:**

As a new user, I want to understand privacy, set up reminders, and know what happens after my trial so that I can confidently continue.

**Flow Summary:**

- **Total Screens:** 4
- **Total Time:** ~60-90 seconds

#### Screen 1: Privacy & Trust

**UI Copy:**

- **Title:** "Your data is yours."
- **Body:**
  - "I only exist to understand you so I can help you grow."
  - "Your data is private, secure, and never sold."
- **Primary CTA:** "Continue →"

**Acceptance Criteria:**
- [ ] Display privacy reassurance message
- [ ] No user input required
- [ ] Track event: `privacy_screen_viewed`

#### Screen 2: Reminders Setup

**UI Copy:**

- **Title:** "Want help staying consistent?"
- **Body:**
  - "I can remind you when it's time to complete Binds and check in."
  - "(This really helps — most people who stick with Weave turn this on.)"

**Toggles:**
- [ ] **Daily reminder** (morning intention notification)
- [ ] **Bind reminders** (nudges for incomplete binds)
- [ ] **Reflection reminder** (evening check-in prompt)

**Primary CTA:** "Enable reminders →"

**Secondary CTA:** "Skip" (allowed but visually discouraged - smaller, less prominent)

**Acceptance Criteria:**
- [ ] Display 3 notification toggle switches
- [ ] All toggles default to ON
- [ ] User can toggle any combination on/off
- [ ] User can skip entirely (not recommended)
- [ ] If enabled, request notification permissions (iOS/Android)
- [ ] Track event: `reminders_configured` with enabled options
- [ ] Store preferences in `user_profiles.notification_preferences`

#### Screen 3: Soft Paywall (End of Onboarding)

**UI Copy:**

- **Title:** "You're on a 7-day trial."
- **Body:**
  - "You have a full week to experience Weave and build momentum."
  - "After your trial ends, you'll be asked to continue with a subscription to keep your progress."
  - "You'll be reminded before the trial ends."

**Pricing Options:**

- **Monthly**
  - "$19.99 / month"
  - (Single-line display)

- **Yearly**
  - "$119.99 / year"
  - "That's $9.99 / month"
  - (Recommended badge)

**Primary CTA:** "Continue my free trial →"

**Acceptance Criteria:**
- [ ] Display trial duration (7 days) and pricing tiers
- [ ] Yearly option visually emphasized (recommended)
- [ ] No payment required at this stage (true free trial)
- [ ] CTA advances to completion screen (does not trigger payment)
- [ ] Track event: `paywall_viewed`
- [ ] Track event: `trial_started`
- [ ] Set `trial_ends_at` in `user_profiles` (7 days from now)

#### Screen 4: Onboarding Complete

**UI Copy:**

- **Title:** "You're all set."
- **Body:**
  - "You can now:"
  - "• Add up to two more Needles"
  - "• Adjust your Binds"
  - "• Complete Binds and reflections"
  - "If you ever want to talk or ask questions, I'm right here."

**Primary CTA:** "Start exploring →"

**Acceptance Criteria:**
- [ ] Display completion message with feature summary
- [ ] Marks onboarding as complete in database
- [ ] Navigates user to Thread (Home) screen
- [ ] Track event: `onboarding_completed`
- [ ] Set `onboarding_completed_at` in `user_profiles`

**Data Requirements:**
- Update `user_profiles`:
  - `onboarding_completed_at` = now()
  - `trial_starts_at` = now()
  - `trial_ends_at` = now() + 7 days
  - `subscription_tier` = 'trial'
  - `notification_preferences` (JSON with toggle states)

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

## Epic 1 Summary (Hybrid Flow)

| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-1.1 | Welcome | M | 2 pts |
| US-1.2 | Painpoint Selection | M | 3 pts |
| US-1.3 | Insight Mirror | M | 2 pts |
| US-1.4 | Weave Solution | M | 2 pts |
| US-1.5 | Auth | M | 3 pts |
| US-1.6 | Name Entry, Weave Personality & Identity Traits | M | 5 pts |
| US-1.7 | Commitment Ritual & Origin Story (First Bind) | M | 5 pts |
| US-1.8 | Create Your First Needle (Goal + Plan) | M | 8 pts |
| US-1.9 | First Daily Reflection (Day 0 Check-In) | M | 2 pts |
| US-1.10 | Progress Dashboard Introduction | M | 2 pts |
| US-1.11 | Housekeeping, Trial Framing & Handoff | M | 6 pts |
| US-1.12 | Dream Self (Deferred) | S | 3 pts |
| US-1.13 | Micro-Archetype (Deferred) | S | 3 pts |
| US-1.14 | Motivations & Failure Modes | S | 3 pts |
| US-1.15 | Constraints & Demographics | S | 2 pts |

**Epic Total:** 51 story points

**Note:** This hybrid flow creates a streamlined onboarding with emotional commitment (US-1.7 origin story), structured goal creation (US-1.8), immediate reflection practice (US-1.9), and clear trial framing (US-1.11 soft paywall integrated). The flow emphasizes flexibility and reduces friction while ensuring users understand the core pillars: Needles (direction), Binds (action), and Reflection (meaning). The deferred personalization (US-1.12 through US-1.15) can be implemented incrementally without blocking the core onboarding flow.

---

⭐️ EPIC 1: Onboarding (Optimized Hybrid Flow)

Goal: Maximize completion → emotional resonance → early activation → set up the 7-day retention loop → gather deep personalization incrementally.

US-1.1: Welcome & Vision Hook

Priority: Must Have (M)

As a new user, I want to see a simple, motivating welcome screen so that I feel emotionally drawn into the experience and choose to start.

Acceptance Criteria:

Show Weave logo + tagline: “See who you’re becoming.”

Short value prop (1 sentence):
“Weave helps you turn daily actions into visible transformation.”

Display Get Started CTA button

Loads under 2 seconds

Tracks onboarding_started event

Technical Notes:

No API calls; static assets only

Event logged to analytics

US-1.2: Emotional State Selection (Painpoint Identification)

Priority: Must Have (M)

As a new user, I want to pick what I’m struggling with right now so that the app feels personalized immediately without asking for heavy data.

Acceptance Criteria:

Display 4 cards:

Clarity → “I’m figuring out my direction”

Action → “I think a lot but don’t start”

Consistency → “I start strong but fall off”

Alignment → “I feel ambitious but isolated”

User selects 1; can optionally add a second after confirmation

Smooth transitions; each card has micro-anim on select

Sends selected_painpoints to backend (lightweight)

Data Requirements:

Store initial_painpoints in user_profiles.json

Technical Notes:

Deterministic mapping → no AI call

Used later to adjust early prompts and tone

US-1.3: Insight Reflection (Painpoint Mirror)

Priority: Must Have (M)

As a new user, I want to feel deeply understood so that I trust the app and continue.

Acceptance Criteria:

Show 1–2 lines explaining why this struggle feels hard
(copy varies by painpoint)

No scrolling, no walls of text

Single CTA: Next

Completion time <7 seconds

Technical Notes:

Static content

Track painpoint_insight_viewed

US-1.4: High-Level Weave Solution

Priority: Must Have (M)

As a new user, I want to understand at a high level how Weave helps me so that I’m motivated to sign up.

Acceptance Criteria:

Show 1 sentence solution matched to user’s painpoint

Subtle animation showing a weave forming

CTA: Continue

Completion time <5 seconds

Technical Notes:

Static; no backend calls

Track solution_screen_viewed

US-1.5: Authentication

Priority: Must Have (M)

As a new user, I want to quickly create an account so that I can start my transformation.

Acceptance Criteria:

Buttons: Sign in with Apple, Sign in with Google, Email

Show: “7-day free trial. No commitment.”

Fast authentication (<3 seconds)

Store user row in user_profiles

Technical Notes:

Use Supabase Auth / Firebase Auth

Track auth_completed

PHASE 2 — Light Identity Bootup (IN-APP, FAST)
US-1.6: Identity Traits Selection

Priority: Must Have (M)

As a new user, I want to choose traits I want to grow into so that the app can anchor my early journey to identity.

Acceptance Criteria:

Display 12 selectable traits (chips)

User selects 3–5

Stored immediately after selection

CTA: Continue

Completion time <15 seconds

Data Requirements:

Write identity_traits → identity_docs.json

US-1.7: First Needle (Goal Definition – Simple)

Priority: Must Have (M)

As a new user, I want to define one goal so that Weave can break it down into actionable steps.

Acceptance Criteria:

Input field: “What’s one thing you want to achieve first?”

Suggestion chips based on painpoint chosen earlier

User must input or tap a suggestion

CTA: Continue

Completion time <10 seconds

Data Requirements:

Store basic goal text in temporary onboarding state

Later transformed into tables during AI breakdown

PHASE 3 — Early Value Proof (“Wow Moment”)
US-1.8: Weave Path Generation (AI-Assisted)

Priority: Must Have (M)

As a new user, I want to see a clear, AI-generated breakdown of my goal so that I understand exactly how to begin.

Acceptance Criteria:

Loading animation: “Shaping your path…”

1–3 second delay (UX pacing)

AI generates:

Goal title & summary

2–3 milestones

2–4 binds (actions/habits)

User can accept or edit each item

CTA: Looks good → or Edit

AI Module:

Onboarding Coach (deterministic constraints)

Suggestions aim for ~70% success probability

Data Requirements:

Write outputs to:

goals

qgoals

subtask_templates

Create ai_runs record

US-1.9: First Commitment Ritual (Bind #1)

Priority: Must Have (M)

As a new user, I want to complete a symbolic first action so that I feel emotionally invested and committed.

Acceptance Criteria:

Display:
“Today is [date]. Mark this as the start of your transformation.”

User must tap Complete my first Bind

Accept any input type: text, photo, audio, or checkmark

Show micro-animation of thread tightening

Display:
“Day 1 complete.”

Data Requirements:

Create first subtask_instance

Write bind_completed event

Set onboarding_first_bind_completed_at

PHASE 4 — Lightweight Orientation
US-1.10: App Mini-Tutorial (Tooltip Style)

Priority: Must Have (M)

As a new user, I want a quick, digestible tour so that I understand the core structure without feeling overwhelmed.

Acceptance Criteria:

3 tooltips:

Highlight Weave avatar → “This grows with your consistency.”

Highlight Binds → “These are your identity-building actions.”

Highlight Reflection button → “Reflect nightly for deeper insights.”

Each tooltip dismissible with Got it

Tutorial duration <20 seconds

Track tutorial completed vs skipped

PHASE 5 — Trial Activation
US-1.11: Welcome Into the 7-Day Journey

Priority: Must Have (M)

As a new user, I want to understand I’m beginning a guided 7-day experience so that I’m motivated to continue.

Acceptance Criteria:

Banner at top:
“You’re on Day 1 of your 7-day transformation.”

No paywall

User enters Thread (Home)

PHASE 6 — Deferred Deep Personalization (Post-Activation)

(These replace your earlier heavy pre-auth screens)

US-1.12: Dream Self (Day 1 Evening Prompt)

Priority: Should Have (S)

Triggered inside nightly reflection.

As a new user, I want to describe my future self when I’m emotionally primed so that the AI can personalize my philosophy and tone.

US-1.13: Archetype Micro-Assessment (Day 2)

Priority: Should Have (S)

Delivered as conversational micro-questions (not a psych test).

US-1.14: Motivations & Failure Modes (Day 2–3)

Priority: Should Have (S)

Inserted contextually into reflection flow.

US-1.15: Constraints & Demographics (Day 3)

Priority: Should Have (S)

Optional “Improve your recommendations” modal.

PHASE 7 — Monetization
US-1.16: Soft Paywall (Day 3–4 Trigger)

Priority: Must Have (M)

As a trialing user, I want to understand the tiers after I’ve had value so that upgrading feels natural and earned.

Trigger:

After 3 consecutive days of bind completion

OR when user tries to add a second Needle

Acceptance Criteria:

Show Free vs Pro vs Max

Clear CTA: Start 7-day free trial (if applicable)

Always show “Continue free” option

⭐️ Epic Summary (Hybrid)
ID	Story	Priority	Estimate
US-1.1	Welcome	M	2 pts
US-1.2	Painpoint Selection	M	3 pts
US-1.3	Insight Mirror	M	2 pts
US-1.4	Weave Solution	M	2 pts
US-1.5	Auth	M	3 pts
US-1.6	Identity Traits	M	3 pts
US-1.7	First Needle	M	3 pts
US-1.8	AI Path	M	8 pts
US-1.9	First Commitment	M	3 pts
US-1.10	Mini Tutorial	M	3 pts
US-1.11	Trial Activation	M	1 pt
US-1.12	Dream Self (Deferred)	S	3 pts
US-1.13	Micro-Archetype (Deferred)	S	3 pts
US-1.14	Motivations & Failure Modes	S	3 pts
US-1.15	Constraints & Demographics	S	2 pts
US-1.16	Soft Paywall (Day 3–4)	M	5 pts

Total: ~48 pts
(roughly equivalent but more distributed, higher activation, less drop-off)
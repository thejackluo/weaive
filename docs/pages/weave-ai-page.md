# Weave AI Page

**Navigation:** Bottom Tab
**Purpose:** AI coaching chat interface for personalized guidance
**Epics Covered:** Epic 6 (AI Coaching)

---

## Page Overview

The **Weave AI Page** is the conversational interface for the Dream Self Advisor. This page provides on-demand coaching, guidance, and personalized insights based on the user's goals, progress, and identity.

### User Value Proposition
- Get personalized coaching anytime
- Ask questions about goals, binds, or progress
- Receive contextual advice based on actual user data (not generic tips)
- Edit AI responses if they're not helpful
- Access quick actions via chips (e.g., "Plan my day", "I'm stuck")

### Navigation Pattern
- **Entry:** Bottom tab navigation OR floating menu → "Talk to Weave"
- **From AI Page:**
  - Quick action chips → Contextual prompts
  - Long-press message → Edit or regenerate
  - Link to goals/binds → Navigate to relevant screens

---

## Wireframe Requirements

### Concept

iOS Siri-style modal overlay that appears over current screen. Keeps user in context while chatting with AI.

**Trigger Points:**
1. Bottom nav center button (Weave icon)
2. Clicking any AI insight card (Thread, Dashboard)
3. "Ask AI to Help" button (Needle Edit screen)
4. Any other AI interaction points

---

### Modal Layout

**Backdrop:**
- Heavy blur effect (iOS Siri-style)
- Dark overlay (40-50% opacity)
- User can vaguely see screen content behind
- Tap outside modal → Does NOT dismiss (require explicit X button)

**Modal Container:**
- Centered on screen (doesn't cover entire screen)
- Rounded corners (large radius, ~24px)
- Dark background (matches app theme)

**Top Section:**
- **Weave Character Visualization:**
  - User's current Weave mathematical shape (animated)
  - Same visual as Dashboard header (Level 2 → Strand pattern)
  - Subtle animation/pulse while AI is "thinking"
- **X Button (top-right corner):**
  - Dismisses modal
  - Returns to previous screen

**Chat Area (Middle, scrollable):**
- Message bubbles:
  - **Weave messages:** Left-aligned, Weave icon avatar
  - **User messages:** Right-aligned, user's profile photo avatar
- Message styling:
  - Weave: Dark bubble with white text
  - User: Lighter bubble (blue/accent color)
- **Streaming effect:** Weave responses appear word-by-word (typewriter)
- **Scroll behavior:** Auto-scroll to latest message

**Quick Action Chips (above input):**
- Horizontal scrollable row of chips:
  - "Plan my day"
  - "I'm stuck"
  - "Edit my goal"
  - "Explain this bind"
- **Collapsible:** Arrow or X button to hide/show
  - Default: Shown on first open
  - Hidden after user sends first message
  - User can toggle visibility with arrow button
- Tap chip → Auto-fills message + sends

**Input Area (Bottom):**
- Text input field:
  - Placeholder: "Start typing..."
  - Multi-line support (grows as user types)
  - Max ~4 lines, then scrollable
- **Microphone button (right of input):**
  - Tap to toggle voice input
  - While recording:
    - Red dot indicator
    - Voice waveform visualization (animated)
    - Tap again to stop recording
  - Speech-to-text: Converts to text in input field
  - User can edit before sending
- **Send button:** Paper plane icon, appears when text is entered

---

### Context Handling

**When opened from AI Insight click:**
1. Insight text appears as first message in chat (Weave message)
2. Weave also references it in next message:
   - Example: "You wanted to talk about [insight topic]. Let's dive in..."
3. User can see full context and continue conversation

**When opened from "Ask AI to Help" (Needle Edit):**
1. First message: "I'm looking at your [Needle Name] goal. How can I help?"
2. User asks to modify binds/milestones
3. AI suggests changes
4. User approves → Changes apply to needle
5. Modal shows confirmation: "Updated [Needle Name]!"

**When opened from Bottom Nav (cold start):**
1. Weave greets user contextually:
   - "Hey eddie, how's your day going?"
   - Or references recent activity: "I see you crushed your workout earlier! 💪"
2. Quick action chips visible
3. User can start any conversation

---

### Chat History

**Behavior:**
- Each modal session is a **fresh chat** (starts blank or with context)
- Previous conversations saved to database
- **Accessing past chats:**
  - Settings → "Weave Chat History" (from Profile & Settings)
  - Opens list of past conversations (by date/topic)
  - Tap conversation → Opens modal with that history loaded

**Rate Limiting:**
- 10 AI messages per hour per user (enforced at API level)
- Show warning when approaching limit
- Block when limit reached: "You've reached your chat limit. Try again in [X] minutes."

---

### Interaction Patterns

- Tap Weave icon (bottom nav) → Opens modal with fresh chat
- Tap AI insight card → Opens modal with insight as first message
- Tap "Ask AI to Help" → Opens modal with needle context
- Type message → Send button appears
- Tap microphone → Voice recording starts
- Tap quick action chip → Auto-fills and sends message
- Tap X button → Dismisses modal, returns to previous screen
- Scroll chat → View message history
- Streaming response → Word-by-word typewriter effect

---

## Stories Implementing This Page

### Epic 6: AI Coaching

#### [US-6.1: Access AI Chat](#)
**Priority:** M (Must Have) | **Estimate:** 5 pts

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

**Reference:** `docs/prd/epic-6-ai-coaching.md` (lines 9-29)

---

#### [US-6.2: Contextual AI Responses](#)
**Priority:** M (Must Have) | **Estimate:** 8 pts

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

**Reference:** `docs/prd/epic-6-ai-coaching.md` (lines 31-61)

---

#### [US-6.3: Edit AI Chat Responses](#)
**Priority:** S (Should Have) | **Estimate:** 3 pts

**Acceptance Criteria:**
- [ ] Long-press AI message → "Edit" or "Not helpful"
- [ ] Corrections stored for feedback loop
- [ ] Regenerate option if user provides correction

**Data Requirements:**
- Write corrections to `ai_feedback` table

**Reference:** `docs/prd/epic-6-ai-coaching.md` (lines 63-79)

---

#### [US-6.4: AI Weekly Insights](#)
**Priority:** S (Should Have) | **Estimate:** 8 pts

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

**Reference:** `docs/prd/epic-6-ai-coaching.md` (lines 81-105)

---

## Page Completion Criteria

This page is considered **complete** when:
1. ✅ Users can access AI chat from bottom tab or floating menu
2. ✅ Chat interface displays message bubbles with streaming responses
3. ✅ Quick action chips provide contextual prompts
4. ✅ AI responses reference user's actual data (goals, progress, identity)
5. ✅ Users can edit or regenerate AI responses
6. ✅ Rate limiting (10 messages/hour) enforced
7. ✅ Dream Self voice is consistent and personalized

---

## Technical Implementation Notes

### Data Sources
- **User Identity:** `identity_docs` (archetype, dream self, personality)
- **Goals & Progress:** `goals`, `subtask_completions`, `daily_aggregates`
- **Journal Entries:** `journal_entries` (fulfillment scores, reflections)
- **AI Insights:** `ai_artifacts` (type: 'insight')
- **Feedback:** `ai_feedback` (user corrections)

### State Management
- **Server State (TanStack Query):** Chat history, user context
- **UI State (Zustand):** Current message, streaming state
- **Local State (useState):** Text input, selected quick action

### Key Patterns
- **Context Builder:** Assembles canonical user state for AI prompts
- **Personality Document:** Ensures deterministic voice (no hallucinated certainty)
- **Rate Limiting:** 10 messages/hour per user (enforced at API level)
- **Streaming Responses:** Use SSE (Server-Sent Events) for perceived speed
- **Feedback Loop:** Store corrections in `ai_feedback` for future improvements

### Performance Considerations
- **Model Selection:** Claude 3.7 Sonnet for quality-critical coaching
- **Caching:** Cache with input_hash (8 hour TTL) for repeated questions
- **Cost Control:** Weekly insights pre-generated, not on-demand
- **Fallback Chain:** Claude 3.7 Sonnet → GPT-4o → Deterministic response

### AI System Architecture
- **Dream Self Advisor Module:** See `docs/idea/ai.md` (lines 500-700)
- **Context Builder:** Provides canonical user state (goals, streaks, recent actions)
- **Personality Document:** Loaded from `identity_docs` (archetype-based voice)
- **Guardrails:** Clear scope, no hallucinated certainty, editable by default

---

## Design System Components

**Expected Components:**
- `ChatBubble` (custom component for user/AI messages)
- `StreamingText` (custom component for typing effect)
- `Chip` (for quick action buttons)
- `TextInput` (for message entry)
- `Button` (for send action)
- `LoadingSpinner` (for "thinking" state)

**Tokens:**
- Colors: `brandPrimary`, `neutral.surface`, `neutral.text`
- Spacing: `spacing.sm`, `spacing.md`
- Typography: `fonts.body`, `fonts.label`

---

## Open Questions for Wireframe Review

When reviewing wireframes, clarify:
1. **Chat Header:** Show Dream Self name? Show user avatar?
2. **Quick Action Chips:** Fixed at top or bottom? How many visible?
3. **Message Bubbles:** Show timestamps? Show "edited" indicator?
4. **Streaming Animation:** Typing indicator style? (dots, pulse, etc.)
5. **Edit Flow:** Modal or inline editing? Show original + edited side-by-side?
6. **Rate Limit Warning:** Toast notification or inline message when limit reached?
7. **Empty State:** First-time chat shows welcome message? Suggested prompts?

---

## Related Documentation

- **Functional Requirements:** `docs/prd/epic-6-ai-coaching.md`
- **AI System Design:** `docs/idea/ai.md` (Dream Self Advisor module)
- **Data Model:** `docs/idea/backend.md` (lines 200-800 for schema)
- **API Patterns:** `docs/architecture/implementation-patterns-consistency-rules.md`
- **Design System:** `docs/dev/design-system-guide.md`

---

**Last Updated:** 2025-12-21
**Status:** ✅ Ready for wireframe mapping

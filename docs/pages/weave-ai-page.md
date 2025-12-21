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

**Key UI Elements Expected:**
1. **Chat Header** - Weave branding, user's Dream Self persona
2. **Message Bubbles** - User messages (right), AI responses (left)
3. **Quick Action Chips** - Pre-defined prompts for common tasks
4. **Text Input** - Free-form message entry
5. **Streaming Indicator** - Shows AI is "thinking" or typing
6. **Message Actions** - Long-press for edit, regenerate, or "not helpful"

**Interaction Patterns:**
- Scroll to view chat history
- Tap quick action chip → Auto-fill message
- Type free-form message → Send button activates
- Streaming response → Shows typing indicator, then text appears progressively
- Long-press AI message → Show edit/regenerate options
- Links in AI responses → Deep link to relevant screens (e.g., goal details)

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

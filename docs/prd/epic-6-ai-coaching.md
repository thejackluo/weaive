# Epic 6: AI Coaching

## Overview

Users interact with the Dream Self Advisor for personalized coaching, clarification, and guidance. This is the conversational interface for the AI.

## User Stories

### US-6.1: Access AI Chat

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

### US-6.2: Contextual AI Responses + AI Tool Use

**Priority:** M (Must Have) | **Story Points:** 12 pts

**As a** user
**I want to** receive advice that references my actual data
**So that** guidance feels personal, not generic

**ENHANCED (Sprint Change Proposal 2025-12-23):**
- **I want to** switch between Dream Self (personalized) and Weave AI (general coach)
- **I want to** have the AI execute actions directly in chat (e.g., "Change my personality" → AI updates identity doc)

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
- [ ] **NEW:** Dual personality system (Dream Self ↔ Weave AI)
  - Switcher UI in chat header + settings
  - Persists preference across sessions
- [ ] **NEW:** AI Tool Use ("mini private MCP server")
  - AI can call tools to execute actions (modify personality, create goals, etc.)
  - Natural language wrapping of tool results
  - Initial tool: `modify_personality` (updates Dream Self personality in chat)

**AI Module:** Dream Self Advisor + Weave AI (dual personality)

**Data Requirements:**
- Read from `identity_docs` for personality
- Read from `goals`, `subtask_completions`, `journal_entries` for context
- Context Builder assembles user state
- **NEW:** Read/write `user_profiles.active_personality` for personality switching
- **NEW:** Tool Registry executes tools on behalf of AI

**Technical Notes:**
- Context Builder provides canonical user context
- Personality document ensures deterministic voice
- **NEW:** AI Tool Use follows OpenAI/Anthropic function calling pattern
- **NEW:** Tool Registry enables 10+ future tools (goal creation, breakdown, reflection, etc.)

---

### US-6.3: Edit AI Chat Responses

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

### US-6.4: AI Weekly Insights

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

## Epic 6 Summary

| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-6.1 | Access AI Chat | M | 5 pts |
| US-6.2 | Contextual AI Responses + AI Tool Use | M | **12 pts** *(enhanced +4 pts)* |
| US-6.3 | Edit AI Chat Responses | S | 3 pts |
| US-6.4 | AI Weekly Insights | S | 8 pts |

**Epic Total:** 28 story points *(increased from 24 pts due to US-6.2 enhancement)*

**Changes from Original:**
- Removed US-6.5 (AI Goal Suggestions)

---

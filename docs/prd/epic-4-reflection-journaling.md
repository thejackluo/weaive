# Epic 4: Reflection & Journaling

## Overview

Users complete daily reflections that generate AI feedback and next-day plans. This is the primary trigger for AI batch operations.

## User Stories

### US-4.1: Daily Reflection Entry

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

### US-4.2: Recap Before Reflection

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

### US-4.3: AI Feedback Generation

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

### US-4.4: Edit AI Feedback

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

### US-4.5: View Past Journal Entries

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

## Epic 4 Summary

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

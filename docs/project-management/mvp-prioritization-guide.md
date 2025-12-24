# Weave MVP Prioritization Guide

**Document Type:** Strategic Planning
**Created:** 2025-12-23
**Status:** ✅ Active

---

## Executive Summary

This document provides a comprehensive analysis of EPICs 2-8 to help prioritize development for App Store launch. It identifies critical features for MVP versus nice-to-haves, with special focus on AI features and design quality.

**Key Finding:** Ship 97 story points (down from 138 full scope) to achieve App Store-ready MVP with good AI and design.

---

## Table of Contents

1. [Epic 7 & 8: Profile & Settings Features](#epic-7--8-profile--settings-features)
2. [Epic 6: AI Coaching (Detailed)](#epic-6-ai-coaching-detailed)
3. [AI Features Across EPICs 2-8](#ai-features-across-epics-2-8)
4. [MVP Prioritization: Critical Path](#mvp-prioritization-critical-path)
5. [MVP Scorecard](#mvp-scorecard-what-makes-app-store-ready)
6. [Final Recommendations](#final-mvp-recommendation)

---

## Epic 7 & 8: Profile & Settings Features

### Epic 7: Notifications (23 story points)
**Purpose:** Keep users engaged without becoming spam

| Story | Priority | What It Does | MVP Critical? |
|-------|----------|--------------|---------------|
| **US-7.1: Morning Intention** | M | Daily plan at user's preferred time, includes today's binds + yesterday's recap | ⚠️ **OPTIONAL for MVP** |
| **US-7.2: Bind Reminders** | M | Gentle reminders for scheduled binds with 3-level escalation | ⚠️ **OPTIONAL for MVP** |
| **US-7.3: Evening Reflection** | M | Reminder to journal at wind-down time | ⚠️ **OPTIONAL for MVP** |
| **US-7.4: Streak Recovery** | M | Compassionate re-engagement after 24-48h absence | ⚠️ **OPTIONAL for MVP** |
| **US-7.6: Notification Preferences** | M | Per-notification toggles, max 5/day enforcement | ✅ **REQUIRED** (UI only) |

**Key Implementation Details:**
- Uses **Expo Push** → APNs (iOS native push)
- All notifications use **Dream Self voice** (personality from identity doc)
- Respects timezone and quiet hours
- Max 5 notifications/day enforced

**MVP Recommendation:** Ship notification **preferences UI** but notifications themselves can be post-MVP. Users need control even if feature is disabled.

---

### Epic 8: Settings & Profile (18 story points)
**Purpose:** Account management and app preferences

| Story | Priority | What It Does | MVP Critical? |
|-------|----------|--------------|---------------|
| **US-8.1: Profile Overview** | M | Access from Thread, show name/email/photo, links to settings | ✅ **REQUIRED** |
| **US-8.3: General Settings** | M | Data export (JSON), delete account (soft delete → 30 days) | ✅ **REQUIRED** (GDPR) |
| **US-8.4: Subscription Management** | M | Show plan (Free/Pro/Max), upgrade CTA, link to App Store | ⚠️ **SIMPLIFIED** |
| **US-8.5: Help & Support** | S | FAQ, contact support, rate app prompt, version number | ⚠️ **OPTIONAL** |
| **US-8.6: Logout & Security** | M | Logout with confirmation, clear session, JWT invalidation | ✅ **REQUIRED** |

**Subscription Tiers (US-8.4):**
| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | 1 goal, limited AI chat (10/hour) |
| **Pro** | $12/month | 3 goals, unlimited AI chat, advanced triad |
| **Max** | $24/month | 5 goals, priority support, advanced insights |

**MVP Recommendation:**
- Ship **Free tier only** for MVP (simplifies App Store review)
- Add subscription tiers post-launch based on traction
- Must have: Profile, logout, data export, delete account

---

## Epic 6: AI Coaching (Detailed)

**Total:** 24 story points | **User Value:** On-demand personalized coaching

### US-6.1: Access AI Chat (5 pts) ✅ **CRITICAL**
**What:** Conversational interface with Dream Self Advisor

**Features:**
- Access via bottom tab (Weave icon) or floating menu
- Message bubbles with **streaming responses** (word-by-word typewriter effect)
- **Quick action chips:** "Plan my day", "I'm stuck", "Edit my goal", "Explain this bind"
- Contextual greeting (not blank chat): "Hey eddie, how's your day going?"
- **Rate limited:** 10 AI messages per hour

**Technical:**
- Uses **Dream Self Advisor module** (Claude 3.7 Sonnet for quality)
- SSE (Server-Sent Events) for streaming
- Respects user's timezone and coaching strictness

**Why Critical:** This is your **differentiator** - personalized AI coach that knows user's actual data

---

### US-6.2: Contextual AI Responses (8 pts) ✅ **CRITICAL**
**What:** AI references user's actual data, not generic advice

**AI Must Reference:**
- Current goals and progress
- Recent completions and captures
- Fulfillment scores and trends
- Identity doc (archetype, dream self)
- Past wins and patterns

**Example Response:**
> "I see you crushed your workout earlier this morning (8:30am check-in photo)! 💪 You mentioned wanting to be more consistent with mornings. This is your 3rd morning workout this week - you're building exactly the identity you said you wanted."

**Technical:**
- **Context Builder** assembles canonical user state
- **Personality Document** ensures deterministic voice (same user = consistent coaching)
- Uses **AI Module Orchestration** pattern (operation: `chat_response`)

**Why Critical:** **No generic advice** = competitive moat. Most habit apps give cookie-cutter tips.

---

### US-6.3: Edit AI Chat Responses (3 pts) ⚠️ **OPTIONAL for MVP**
**What:** Long-press AI message → "Edit" or "Not helpful"

**Features:**
- User can correct AI mistakes
- Corrections stored in `ai_feedback` table
- Regenerate option if user provides correction

**MVP Recommendation:** **Skip for MVP**. Focus on getting AI responses right first.

---

### US-6.4: AI Weekly Insights (8 pts) ⚠️ **OPTIONAL for MVP**
**What:** Pre-generated weekly pattern analysis

**Insight Types:**
- **Pattern:** "You skip gym on Fridays"
- **Success correlation:** "Morning binds = higher fulfillment"
- **Trajectory:** "30-day streak incoming"

**Technical:**
- Generated weekly (cron job Sunday night)
- Uses **AI Insights Engine module**
- Stored in `ai_artifacts` (type: 'insight')

**MVP Recommendation:** **Skip for MVP**. Requires 30+ days of data to be useful.

---

## AI Features Across EPICs 2-8

### AI Module Architecture Overview

Your AI system uses a **5-module architecture** with orchestration:

```
Request → AIOrchestrator (which product module?)
       → AIModule (what context to build?)
       → AIService (which AI provider?)
       → AIProvider (API call implementation)
```

**5 Core AI Modules:**
1. **Onboarding Coach** (Epic 1, 2) - Goal breakdown, identity doc generation
2. **Triad Planner** (Epic 4) - Tomorrow's 3-task plan after journal
3. **Daily Recap** (Epic 4) - AI feedback after reflection
4. **Dream Self Advisor** (Epic 6) - Conversational coaching chat
5. **AI Insights Engine** (Epic 6) - Weekly pattern analysis

---

### AI Features by Epic

#### Epic 2: Goal Management - **Onboarding Coach Module**

**US-2.3: Create New Goal (AI-Assisted)** - 8 pts ✅ **CRITICAL**

**What:** AI parses vague goal → Q-goals + suggested binds

**Flow:**
1. User enters goal: "I want to get in shape"
2. Probing question: "Why is this goal important to you?"
3. User responds: "I want more energy and confidence"
4. **AI generates:**
   - **Q-goals:** "Lose 10 lbs in 90 days", "Run 5K without stopping"
   - **Binds:** "30-min workout 5x/week", "Track meals daily"
5. User edits all suggestions before confirming

**Model Selection:** **Claude 3.7 Sonnet** (quality-critical, complex reasoning)

**Cost:** $3.00/$15.00 per MTok (expensive, but only on goal creation)

**Cache Strategy:** 8-hour TTL with `input_hash` (same goal input = cached response)

**Why Critical:** This is the **entry point** to your app. Goal creation must feel magical, not generic.

---

#### Epic 3: Daily Actions - **No AI** ✅ **GOOD**

**US-3.1, US-3.3, US-3.4** - All deterministic, no AI calls

**Why This Matters:**
- Most screens should NOT call AI (cost control)
- Completion flow is instant (no waiting for AI)
- Proof capture is local-first (no API dependency)

**Design Principle:** AI is used for **high-value moments**, not every interaction

---

#### Epic 4: Reflection & Journaling - **2 AI Modules**

**US-4.3: AI Feedback Generation** - 8 pts ✅ **CRITICAL**

**What:** After journal submit, generate:
1. **Affirming Insight:** "You completed 4/5 binds today - that's 80% consistency!"
2. **Blocker Insight:** "I noticed you skipped gym again. What's blocking you?"
3. **Next-Day Triad:** 3 tasks for tomorrow

**Model Selection:** **GPT-4o-mini** for routine generation (90% of calls)

**Cost:** $0.15/$0.60 per MTok (cheap, high volume)

**Modules Used:**
- **Daily Recap Generator** (affirming + blocker insights)
- **Triad Planner** (next-day 3 tasks)

**Technical:**
- Async batch job (202 Accepted, push notification when ready)
- Generate within 20 seconds
- Cache TTL: 8 hours

**Why Critical:** This is the **daily habit loop**. AI feedback must be fast and personal.

---

#### Epic 5: Progress Visualization - **No AI** ✅ **GOOD**

**US-5.1 through US-5.5** - All read from pre-computed data

**Why This Matters:**
- Dashboard loads instantly (no AI call on load)
- All data pre-computed by workers
- User sees progress without waiting

**Design Principle:** AI should **generate insights**, not block UI rendering

---

## MVP Prioritization: Critical Path

### ✅ **MUST SHIP for MVP** (Core Value Loop)

#### 1. **Epic 2: Goal Management** (24 pts)
- ✅ US-2.1: View Goals List (3 pts)
- ✅ US-2.2: View Goal Details (5 pts)
- ✅ **US-2.3: Create New Goal (AI-Assisted)** (8 pts) ← **AI FEATURE**
- ✅ US-2.4: Edit Needle (5 pts)
- ✅ US-2.5: Archive Goal (3 pts)

**Why Critical:** Entry point to app. Users need to create goals before anything else works.

**AI Feature:** Goal breakdown (Onboarding Coach module) must feel magical.

---

#### 2. **Epic 3: Daily Actions** (18 pts)
- ✅ US-3.1: View Today's Binds (5 pts)
- ✅ US-3.3: Complete Bind with Proof (8 pts) ← **Confetti, affirmation, level progress**
- ✅ US-3.4: Timer Tracking (5 pts) ← **Pomodoro-feel**

**Why Critical:** Core engagement loop. "What should I do today?" answered in <10 seconds.

**No AI Required:** This is deterministic, fast, and local-first.

---

#### 3. **Epic 4: Reflection & Journaling** (28 pts → 14 pts simplified)
- ✅ **US-4.1a: Reflection Questions (Default 2)** (3 pts)
- ⚠️ US-4.1b: Custom Questions (3 pts) ← **Skip for MVP**
- ⚠️ US-4.2: Recap Before Reflection (3 pts) ← **Skip for MVP**
- ✅ **US-4.3: AI Feedback Generation** (8 pts) ← **CRITICAL AI FEATURE**
- ✅ US-4.4: Edit AI Feedback (5 pts)
- ⚠️ US-4.5: View Past Journals (6 pts) ← **Skip for MVP**

**Why Critical:** Daily habit loop that triggers AI batch operations.

**AI Feature:** Daily Recap + Triad generation. This is your **North Star metric** (Active Days with Proof).

**MVP Simplification:** Ship with 2 default reflection questions. Custom questions post-MVP.

---

#### 4. **Epic 5: Progress Visualization** (26 pts → 18 pts simplified)
- ✅ US-5.1: Dashboard Overview (5 pts)
- ✅ US-5.2: Consistency Heat Map (5 pts)
- ✅ US-5.3: Fulfillment Trend Chart (5 pts)
- ⚠️ US-5.4: Weave Character Progression (8 pts) ← **Skip for MVP**
- ✅ US-5.5: Streak Tracking (3 pts)

**Why Critical:** Users need to see progress to stay motivated.

**MVP Simplification:** Skip Weave Character mathematical curves. Show simple level badge instead.

---

#### 5. **Epic 6: AI Coaching** (24 pts → 13 pts simplified)
- ✅ **US-6.1: Access AI Chat** (5 pts) ← **DIFFERENTIATOR**
- ✅ **US-6.2: Contextual AI Responses** (8 pts) ← **COMPETITIVE MOAT**
- ⚠️ US-6.3: Edit AI Responses (3 pts) ← **Skip for MVP**
- ⚠️ US-6.4: AI Weekly Insights (8 pts) ← **Skip for MVP**

**Why Critical:** This is your **unique value prop**. AI coach that knows your actual data.

**MVP Focus:** US-6.1 + US-6.2 only. Edit and insights come later.

---

#### 6. **Epic 8: Settings & Profile** (18 pts → 10 pts simplified)
- ✅ US-8.1: Profile Overview (3 pts)
- ✅ US-8.3: General Settings (5 pts) ← **Data export, delete account (GDPR)**
- ⚠️ US-8.4: Subscription Management (5 pts) ← **Free tier only**
- ⚠️ US-8.5: Help & Support (3 pts) ← **Skip for MVP**
- ✅ US-8.6: Logout & Security (2 pts)

**Why Critical:** GDPR compliance (data export, delete account). Basic account management.

**MVP Simplification:** Free tier only. No paid subscriptions until post-launch.

---

### ❌ **SKIP for MVP** (Ship Post-Launch)

#### Epic 7: Notifications (23 pts) ← **ENTIRE EPIC**
**Recommendation:** Ship notification **preferences UI** but disable actual notifications

**Why Skip:**
- Requires APNs setup and testing (adds complexity)
- User can still use app without notifications
- Can be enabled via feature flag post-launch

**What to Ship:**
- US-7.6: Notification Preferences (UI only, all toggles disabled)

**App Store Note:** Mention "Push notifications coming soon" in App Store description

---

#### Epic 5: Weave Character Progression (US-5.4) - 8 pts
**Recommendation:** Skip mathematical curve visualization for MVP

**Why Skip:**
- Complex visualization (parametric equations, SVG/Lottie animations)
- Not critical for core value loop
- Users can still see level/rank as text

**What to Ship Instead:**
- Simple level badge: "Level 2 - Strand"
- Progress bar to next level
- No mathematical curve visualization

---

#### Epic 4: Custom Reflection Questions (US-4.1b) - 3 pts
**Recommendation:** Ship with 2 default questions only

**Why Skip:**
- Adds UI complexity (question management screen)
- Default questions cover 90% of use cases
- Can iterate based on user feedback

**What to Ship:**
- 2 default questions:
  1. "How do you feel about today? What worked well and what didn't?"
  2. "What is the one thing you want to accomplish tomorrow?"

---

#### Epic 6: AI Features (US-6.3, US-6.4) - 11 pts
**Recommendation:** Skip edit AI responses and weekly insights

**Why Skip:**
- US-6.3: Edit requires feedback loop infrastructure
- US-6.4: Weekly insights need 30+ days of data to be useful

**What to Ship:**
- US-6.1 + US-6.2: AI chat with contextual responses
- Focus on getting base AI right before adding edit/insights

---

## MVP Scorecard: What Makes App Store-Ready?

### ✅ **Good AI** (Your Differentiator)

**Must Ship:**
1. ✅ **Goal Breakdown AI** (Epic 2, US-2.3)
   - Model: Claude 3.7 Sonnet
   - Quality-critical: First impression matters
   - Cost: $3-5 per goal creation (acceptable)

2. ✅ **Daily Recap + Triad AI** (Epic 4, US-4.3)
   - Model: GPT-4o-mini (90% of calls)
   - High volume, routine generation
   - Cost: $0.002-0.005 per recap (cheap)

3. ✅ **AI Chat Coach** (Epic 6, US-6.1, US-6.2)
   - Model: Claude 3.7 Sonnet
   - Contextual, references user data
   - Rate limited: 10 messages/hour
   - Cost: $0.01-0.02 per chat session (acceptable)

**AI Budget Check:**
- Goal creation: ~5 goals/user/month = $15-25/user/month (one-time)
- Daily recap: 30 recaps/month = $0.06-0.15/user/month
- AI chat: 10 sessions/month = $0.10-0.20/user/month
- **Total: ~$0.20-0.40/user/month recurring** (within $2,500/month at 10K users)

---

### ✅ **Good Design** (App Store Approval)

**Must Ship:**
1. ✅ **Complete navigation** (Thread, Dashboard, Weave AI tabs)
2. ✅ **Polished onboarding** (Epic 1 - already complete)
3. ✅ **Design system consistency** (Button, Card, Text components)
4. ✅ **Empty states** handled gracefully
5. ✅ **Error states** with user-friendly messages
6. ✅ **Loading states** with skeletons/spinners
7. ✅ **Confetti animation** on bind completion (US-3.3)
8. ✅ **Affirmation messages** (makes users feel accomplished)

**App Store Requirements:**
- ✅ Data export (GDPR compliance)
- ✅ Delete account (GDPR compliance)
- ✅ Privacy Policy (required)
- ✅ Terms of Service (required)
- ⚠️ In-App Purchases (Free tier only for MVP)

---

### ⚠️ **Lower Priority** (Nice-to-Haves)

**Can Ship Post-MVP:**
1. ⚠️ Push notifications (Epic 7)
2. ⚠️ Weave character visualization (Epic 5, US-5.4)
3. ⚠️ Custom reflection questions (Epic 4, US-4.1b)
4. ⚠️ AI weekly insights (Epic 6, US-6.4)
5. ⚠️ Edit AI responses (Epic 6, US-6.3)
6. ⚠️ View past journals (Epic 4, US-4.5)
7. ⚠️ Subscription tiers (Epic 8, US-8.4 - Free tier only)

---

## Final MVP Recommendation

### Ship These EPICs for MVP:

1. ✅ **Epic 2: Goal Management** (24 pts) - Full implementation
2. ✅ **Epic 3: Daily Actions** (18 pts) - Full implementation
3. ✅ **Epic 4: Reflection** (14 pts) - Simplified (US-4.1a, US-4.3, US-4.4 only)
4. ✅ **Epic 5: Progress Viz** (18 pts) - Simplified (skip US-5.4)
5. ✅ **Epic 6: AI Coaching** (13 pts) - Simplified (US-6.1, US-6.2 only)
6. ✅ **Epic 8: Settings** (10 pts) - Simplified (no subscriptions, basic settings)

**Total MVP Scope:** ~97 story points (down from 138 full scope)

---

### AI Features Priority:

**MUST SHIP:**
1. 🎯 **Goal Breakdown AI** (US-2.3) - Your entry point magic
2. 🎯 **Daily Recap + Triad AI** (US-4.3) - Your engagement loop
3. 🎯 **AI Chat Coach** (US-6.1, US-6.2) - Your differentiator

**CAN WAIT:**
4. ⏳ Edit AI responses (US-6.3) - Post-MVP
5. ⏳ Weekly insights (US-6.4) - Post-MVP (needs 30+ days data)

---

### Design Features Priority:

**MUST SHIP:**
- ✅ Complete navigation (tabs, modals, screens)
- ✅ Design system (Button, Card, Text, etc.)
- ✅ Confetti + affirmation on completion
- ✅ Heat map + fulfillment chart
- ✅ Empty/error/loading states

**CAN WAIT:**
- ⏳ Weave character curves (US-5.4)
- ⏳ Push notifications (Epic 7)
- ⏳ Custom reflection questions (US-4.1b)

---

## Next Steps

1. **Review this prioritization** - Does it align with your vision?
2. **Choose development order:**
   - Option A: Dashboard-first (recommended)
   - Option B: Thread-first (alternative)
   - Option C: Parallel (if you have multiple devs)
3. **Start with highest-value page** - Complete vertical slice end-to-end
4. **Test AI features early** - Goal breakdown and daily recap are critical
5. **Polish UX moments** - Confetti, affirmations, level progress (US-3.3)

---

**Last Updated:** 2025-12-23
**Status:** ✅ Active - Reference for all MVP development decisions

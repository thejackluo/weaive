---
document_type: 'product-brief'
project: 'Weave'
version: '1.0'
created: '2025-12-16'
status: 'active'
owner: 'Jack'
workflow_phase: 'discovery'
last_updated: '2025-12-16'
---

# Weave Product Brief

## Executive Summary

**Product Name:** Weave

**One-Liner:** Turn vague goals into daily wins, proof, and a stronger identity in 10 days.

**Promise to Users:** "Give me 10 days and I will show you who you are becoming."

**Platform:** iOS mobile app (React Native)

**Target Launch:** Q1 2026 (MVP)

### The Opportunity

There's a gap in the market between:
- **Generic productivity apps** (todo lists, habit trackers) that focus on tasks without context
- **Expensive coaching** ($200+/session) that's personalized but inaccessible

**Weave** bridges this gap by combining:
1. **AI-powered personalized coaching** that understands your goals, identity, and patterns
2. **Proof-based accountability** that builds trust and creates switching costs
3. **Identity narrative** that transforms task completion into self-transformation

### Market Context

**Target Market:** Ambitious but inconsistent builders and students (20-30 years old)
- **Market Size (TAM):** ~50M users in US (college students + early-career builders seeking personal growth)
- **Competitive Landscape:** Fabulous, Finch, Habitica, Parrot, Life Reset, Poke
- **Differentiation:** Unique "goals → proof → identity" data model that creates psychological switching costs

**Business Model:**
- **Freemium:** Core features free
- **Pro Tier:** $12/month (advanced AI coaching, unlimited goals)
- **Max Tier:** $24/month (accountability groups, priority support)

### Success Metrics

**North Star Metric:** Active Days with Proof
- Definition: User completes ≥1 subtask + logs memory/capture OR journal check-in
- Target: 60% of users have 7+ active days in first 10 days

**Key Performance Indicators:**
- **Onboarding Success:** 50% complete onboarding + set 1 goal + complete 1 task in 24 hours
- **7-Day Retention:** 40% of users return on day 7
- **Free-to-Paid Conversion:** 5% within 30 days
- **Monthly Active Users (MAU):** 10,000 by end of Q2 2026

---

## Problem Statement

### User Problem

**Target User:** 20-year-old college student or early-career builder who is:
- Ambitious with big goals but directionally lost
- Inconsistent with goal execution despite high intent
- Has tried productivity apps before without long-term success
- Seeks personalized guidance, not generic advice
- Values identity and self-improvement
- Needs structure but resists rigid systems

### The Core Problem

**Users struggle with three interconnected challenges:**

1. **Vague Goals → No Action**
   - "I want to be healthy" doesn't translate to daily actions
   - Generic productivity apps can't break down abstract goals into consistent habits
   - Users need goal decomposition: Goal → Quantifiable milestones → Daily actions

2. **No Accountability → No Follow-Through**
   - Self-reporting without proof enables self-deception
   - Generic reminders don't create real commitment
   - Users need to document progress with evidence (captures: photos, notes, timers)

3. **No Identity Reinforcement → No Retention**
   - Completing tasks feels empty without narrative meaning
   - Users don't see the connection between daily actions and long-term identity
   - Generic apps don't reflect back "who you are becoming"

### Current Alternatives and Their Limitations

| **Alternative** | **What It Does Well** | **What It Lacks** |
|-----------------|----------------------|-------------------|
| **Fabulous** | Beautiful onboarding, habit streaks | No goal decomposition, generic coaching, expensive ($60/year) |
| **Finch** | Gamification, emotional support | No proof-based accountability, no identity narrative |
| **Habitica** | Gamification, community | No personalized AI coaching, no goal breakdown |
| **Notion/Obsidian** | Flexible note-taking | Not mobile-first, no AI coaching, high setup friction |
| **Traditional Coaching** | Personalized, human connection | Expensive ($200+/session), not scalable |

**Key Insight:** No existing product combines:
- AI-powered goal decomposition (abstract → actionable)
- Proof-based accountability (captures as evidence)
- Identity narrative reinforcement (who you're becoming)

---

## Solution Overview

### Product Vision

**Weave** is an AI-powered identity coach that helps ambitious but inconsistent users turn vague goals into daily wins, proof, and a stronger sense of self in 10 days.

### How It Works

**1. Thread (Identity Foundation)**
- User defines their "dream self" (who they want to become)
- AI breaks down abstract goals into quantifiable milestones (Q-goals)
- Q-goals become consistent daily actions (Binds)

**2. Daily Action + Proof**
- User completes 1-3 "Binds" (daily actions) toward their goals
- User documents progress with "Captures" (photos, notes, voice, timer)
- Proof creates accountability and builds trust with the AI

**3. Reflection + AI Feedback**
- Daily check-in: 2 open-ended questions + fulfillment score (1-10)
- AI analyzes patterns: what's working, what's blocking progress
- AI generates next-day plan (Triad: 3 tasks optimized for user)

**4. Weave (Progress Visualization)**
- Consistency heatmap (inspired by GitHub contribution graph)
- Streak tracking, badges, and rank progression
- Emotional mirror: AI reflects back identity shifts over 10 days
- Day 10 snapshot: shareable "before vs. after" card

### Core Value Proposition

**For Users:**
1. **Clarity:** AI breaks down vague goals into specific daily actions
2. **Accountability:** Proof-based system (captures) prevents self-deception
3. **Identity:** See yourself evolving through data, reflections, and AI insights
4. **Trust:** Deterministic AI that knows your archetype, goals, and patterns

**For Business:**
1. **Unique Dataset:** Goals → Q-goals → Subtasks + Proof + Mood (competitive moat)
2. **Psychological Switching Costs:** Identity narrative creates retention
3. **Viral Distribution:** Shareable progress cards (Day 10 snapshot)
4. **Cost-Effective AI:** Batch AI calls around journal time, cache with input_hash

---

## Target Users

### Primary Persona: "Chaotic Builder Chris"

**Demographics:**
- Age: 20-25
- Occupation: College student or early-career builder (designer, developer, entrepreneur)
- Location: US (initially), urban/suburban
- Tech-savvy: Comfortable with mobile apps, uses productivity tools

**Psychographics:**
- **High Intent, Low Consistency:** Sets ambitious goals but struggles to follow through
- **Identity-Driven:** Cares deeply about "who I'm becoming," not just "what I achieve"
- **Self-Awareness:** Knows their patterns (procrastination, overwhelm) but needs structure
- **Seeks Personalization:** Tired of generic advice; wants guidance tailored to their context

**Pain Points:**
- "I set goals but don't know what to do daily to achieve them"
- "I say I'll do things but don't hold myself accountable"
- "I've tried habit apps but they feel empty and I quit after 2 weeks"
- "I want a coach but can't afford $200/session"

**Motivations:**
- Prove to myself I can be consistent
- Build a stronger sense of identity
- See tangible progress toward my goals
- Feel less lost and more directional

**Current Behavior:**
- Uses Notion for notes but rarely reviews them
- Has tried Fabulous, Streaks, or other habit apps (abandoned after 1-2 weeks)
- Follows productivity influencers on YouTube/TikTok
- Active in communities like r/GetStudying, r/productivity, r/ADHD

### Secondary Persona: "Graduate School Grace"

**Demographics:**
- Age: 24-28
- Occupation: Graduate student or early-career professional
- Balancing: Research/work + side projects + personal goals

**Pain Points:**
- Overwhelmed by competing priorities
- Needs structure but current systems are too rigid
- Wants to track progress across multiple life areas (career, health, creative projects)

---

## Market Positioning

### Competitive Landscape

**Direct Competitors:**

1. **Fabulous** (Habit-building + Science-based coaching)
   - Strengths: Beautiful UX, science-backed, strong retention
   - Weaknesses: No goal decomposition, generic coaching, expensive ($60/year)
   - Positioning: More personalized AI coaching, proof-based accountability

2. **Finch** (Mental health + Habit tracking)
   - Strengths: Gamification (virtual pet), emotional support
   - Weaknesses: No proof system, no identity narrative, limited goal structure
   - Positioning: Identity-focused, proof-based, less gamification

3. **Habitica** (Gamified habit tracking)
   - Strengths: Strong community, RPG mechanics
   - Weaknesses: No AI coaching, no goal breakdown, dated UX
   - Positioning: Modern AI-powered coaching vs. manual gamification

**Indirect Competitors:**
- **Notion/Obsidian:** Flexible note-taking, but not mobile-first, no AI coaching
- **Traditional Coaching:** Personalized but expensive and not scalable
- **Generic Todo Apps (Todoist, Things):** Task management without identity context

### Differentiation Strategy

**3 Unique Moats:**

1. **Identity + Narrative Switching Cost (Psychological)**
   - Users don't just log tasks; they build a "story of self" with proof and reflection
   - Leaving means losing momentum history, identity continuity, progress artifacts
   - Psychological investment creates retention

2. **Unique Dataset: Goals → Q-goals → Subtasks + Proof + Mood**
   - Most apps collect tasks OR journaling. Weave collects the *link* between intention → action → evidence → emotion
   - This enables better planning and coaching than generic apps
   - Competitive advantage scales with user data

3. **Deterministic Personalization (Trust Moat)**
   - AI is constrained by user archetype + dream self voice + completion history
   - Advice feels consistent and "built for me," not random chatbot responses
   - Trust builds over time as AI learns user patterns

**Distribution Wedge:**
- Shareable "Before vs. After (10 Days)" card
- Consistency score, rank, badges, highlight wins, identity shift summary
- Viral potential: people share progress, not "I used a todo app"

---

## MVP Scope

### Must-Ship Features (Version 1.0)

**1. Goal Breakdown Engine**
- Input: Vague goal (e.g., "Get healthier")
- Output: Q-goals (measurable milestones) → Binds (consistent daily habits)
- AI suggests ~70% completion probability habits
- User can edit all AI suggestions

**2. Identity Document**
- Onboarding: User defines archetype, dream self, motivations, constraints
- Editable at any time
- Informs AI coaching personality and tone

**3. Action + Memory Capture**
- Complete Binds (daily actions)
- Document progress with Captures:
  - **Photo:** Take picture as proof
  - **Note:** Quick text reflection
  - **Timer:** Track time spent on task
  - **Voice:** Audio note (optional)

**4. Daily Reflection/Journaling**
- 2 open-ended questions (customized to user)
- Fulfillment score (1-10 slider)
- AI feedback: affirming insight + blocker insight + next-day plan (Triad)

**5. Progress Visualization (Weave Dashboard)**
- **Consistency Heatmap:** GitHub-style contribution graph
- **Streak Tracking:** Current streak, longest streak
- **Rank Progression:** Beginner → Apprentice → Artisan → Master
- **Badges:** Milestones (7-day streak, 10 binds completed, etc.)

**6. AI Coach (Deterministic, Editable)**
- Structured personality based on dream self + archetype
- All AI outputs are editable
- Batch AI calls around journal time (cost control)
- Consistent coaching based on user history

### Do Not Block MVP

**Post-MVP Features (Version 1.5+):**
- Vector embeddings for "second brain"
- Multi-modal long-term memory
- Complex recurrence UI for habits
- iMessage integration for accountability
- Screen time / app-blocker integration
- Shared accountability groups
- Query result caching and database connection pooling

---

## Technical Architecture

### High-Level Stack

**Frontend:**
- React Native (iOS App Store initially)
- Expo for development and OTA updates

**Backend:**
- Python FastAPI (deployed on Railway)
- Supabase (PostgreSQL + Auth + Storage)
- Redis + BullMQ for job queue

**AI/ML:**
- GPT-4 for coaching and goal decomposition (via OpenAI API)
- Cost control: batch calls, cache with input_hash, 10 calls/hour rate limit

**Infrastructure:**
- Push Notifications: iOS APNs
- Analytics: PostHog
- Error Tracking: Sentry
- Deployment: Railway (backend), App Store (mobile)

### Data Architecture (3-Layer Model)

**1. Static Text Database**
- Demographics, stable user profile fields
- Identity documents (archetype, dream self, motivations)

**2. Dynamic Text Database (Artifact Store)**
- Goals, Q-goals, Binds (subtask templates and instances)
- Journal entries, reflections, AI feedback
- Completions (immutable event log)
- Daily aggregates (computed statistics)

**3. Image Storage**
- User uploads, proof captures, identity visuals
- Direct uploads via signed URLs

### Request Flow Patterns

**Pattern A (Fast Path):** Auth + Basic CRUD → Synchronous responses
**Pattern B (AI-Heavy):** Long-running operations → Queue + Workers → 202 Accepted
**Pattern C (Media Uploads):** Direct to storage with signed URLs
**Pattern D (Latency-Critical):** Edge Functions for instant response

---

## Business Model

### Monetization Strategy

**Freemium Model:**

**Free Tier:**
- 1 active goal (Needle) at a time
- Unlimited Binds (daily actions)
- Unlimited Captures (proof)
- Daily reflection and AI feedback (limited)
- Basic progress visualization

**Pro Tier: $12/month**
- 3 active goals (Needles) simultaneously
- Advanced AI coaching (deeper insights, more personalized)
- Unlimited AI-generated Triads (daily plans)
- Priority support

**Max Tier: $24/month**
- Everything in Pro
- Shared accountability groups (post-MVP)
- Custom AI coaching personality
- Advanced analytics and insights
- Early access to new features

### Pricing Rationale

**Market Benchmarking:**
- Fabulous: $60/year (~$5/month)
- Finch: $8/month
- Notion: $10/month
- Traditional coaching: $200+/session

**Value Justification:**
- **Pro ($12/month):** Less than 1 coffee/week for personalized AI coaching
- **Max ($24/month):** Still 10x cheaper than traditional coaching

**Conversion Strategy:**
- **Free Trial:** 7-day trial of Pro tier for all new users
- **Upgrade Triggers:**
  - User hits 1-goal limit and wants to add more
  - User completes 7 active days (high engagement signal)
  - User requests deeper AI insights

**Revenue Projections (Year 1):**
- 10,000 MAU by Q2 2026
- 5% conversion to Pro ($12/month) = 500 paying users
- Monthly Recurring Revenue (MRR): $6,000
- Annual Recurring Revenue (ARR): $72,000

---

## Go-to-Market Strategy

### Launch Plan (Q1 2026)

**Phase 1: Beta (Jan-Feb 2026)**
- Invite 50-100 beta testers from personal network
- Target: r/GetStudying, r/productivity, college communities
- Goal: Validate onboarding, retention, and core value prop

**Phase 2: App Store Launch (March 2026)**
- Submit to iOS App Store
- Launch with Product Hunt, Reddit, Twitter
- Goal: 1,000 users in first month

**Phase 3: Growth (April-June 2026)**
- Content marketing: Blog posts, YouTube tutorials
- Influencer partnerships: Productivity YouTubers, TikTok creators
- Goal: 10,000 MAU by end of Q2

### Distribution Channels

**Owned Channels:**
- Product Hunt launch
- Blog (SEO-optimized content on goal-setting, productivity)
- Twitter/X account for product updates

**Earned Channels:**
- Reddit communities (r/GetStudying, r/productivity, r/ADHD)
- YouTube reviews (reach out to productivity YouTubers)
- Word-of-mouth via shareable progress cards

**Paid Channels (Post-MVP):**
- Instagram/TikTok ads targeting productivity enthusiasts
- Google Search Ads (keywords: "habit tracker," "AI coach")

### Content Strategy

**Key Messages:**
1. "Stop setting vague goals. Start building proof."
2. "Your AI coach that actually knows you."
3. "10 days to see who you're becoming."

**Content Types:**
- **User Stories:** "How Weave helped me complete my thesis in 10 days"
- **How-To Guides:** "How to break down abstract goals into daily actions"
- **Before/After Showcases:** Shareable progress cards with testimonials

---

## Risk Assessment

### Key Risks and Mitigation

**1. AI Cost Overruns**
- **Risk:** OpenAI API costs exceed revenue
- **Mitigation:**
  - Batch AI calls around journal time
  - Cache outputs with input_hash
  - Rate limiting: 10 AI calls/hour per user
  - Monitor cost per user and adjust pricing if needed

**2. Low Retention (Users Churn After 7 Days)**
- **Risk:** Users don't build habit of daily check-ins
- **Mitigation:**
  - Push notifications optimized for re-engagement
  - Day 7 "reward" (shareable progress card)
  - AI feedback designed to create curiosity for next day

**3. Privacy Concerns (Sensitive User Data)**
- **Risk:** Users hesitant to share identity, goals, reflections
- **Mitigation:**
  - Clear privacy policy (data encrypted, not sold)
  - Row-level security (RLS) in Supabase
  - Transparency: "Your data is yours, we only use it to coach you"

**4. Competitive Response (Fabulous, Finch Copy Features)**
- **Risk:** Larger competitors copy unique features
- **Mitigation:**
  - Speed of execution (ship MVP fast)
  - Build psychological switching costs early (identity narrative)
  - Focus on unique dataset advantage (goals → proof → mood linkage)

**5. App Store Rejection**
- **Risk:** iOS App Store rejects app for unclear reasons
- **Mitigation:**
  - Follow Apple guidelines strictly (no misleading health claims)
  - Have legal review of app description and onboarding
  - Prepare appeal process if rejected

---

## Success Criteria

### MVP Success Metrics (First 90 Days)

**User Acquisition:**
- 1,000 downloads in first month
- 10,000 total users by end of Q2 2026

**Engagement:**
- 60% of users have 7+ active days in first 10 days
- 40% 7-day retention
- Average 4 binds completed per active day

**Monetization:**
- 5% free-to-paid conversion within 30 days
- 500 paying Pro users by end of Q2 2026
- $6,000 MRR by end of Q2 2026

**Qualitative:**
- NPS score >40
- 50+ user testimonials
- 10+ organic social media mentions per week

### Go/No-Go Decision Points

**After Beta (Feb 2026):**
- **GO:** If 7-day retention >30% and users report "I feel more consistent"
- **NO-GO:** If retention <20% or users say "this is just another todo app"

**After Launch (April 2026):**
- **GO:** If organic growth via word-of-mouth (>20% of users from referrals)
- **NO-GO:** If growth is flat and requires heavy paid acquisition

---

## Appendix

### Key Terminology

| **Term** | **Definition** |
|----------|---------------|
| **Needle** | Top-level user goal (max 3 active) |
| **Bind** | Consistent daily action toward a goal |
| **Thread** | User's starting identity and context |
| **Weave** | User's evolved identity and progress |
| **Q-Goal** | Quantifiable milestone toward a goal |
| **Proof** | Evidence of bind completion (capture) |
| **Triad** | AI-generated 3 tasks for next day |
| **Reflection** | Daily check-in with fulfillment score |
| **Capture** | Photo, note, timer, or voice recording as proof |
| **Active Day** | Day with ≥1 bind completed + proof or journal |

### Related Documents

- **MVP Specification:** `docs/idea/mvp.md`
- **Backend Architecture:** `docs/idea/backend.md`
- **UX/UI Architecture:** `docs/idea/ux.md`
- **AI System Design:** `docs/idea/ai.md`
- **Market Research:** `docs/analysis/research/market-ai-habit-productivity-apps-research-2025-12-16.md`
- **Workflow Status:** `docs/bmm-workflow-status.yaml`

### Change Log

| **Version** | **Date** | **Changes** | **Author** |
|-------------|----------|-------------|-----------|
| 1.0 | 2025-12-16 | Initial product brief created | Jack |

---

**Document Status:** Active
**Next Review:** 2026-01-15
**Owner:** Jack
**Stakeholders:** Product, Engineering, Design

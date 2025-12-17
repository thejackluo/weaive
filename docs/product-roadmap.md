# Weave Product Roadmap

**Last Updated:** 2025-12-17
**Status:** Active Development (Pre-MVP)

---

## Overview

This roadmap outlines the strategic timeline for Weave feature releases, organized into phases aligned with our product vision: **Turn vague goals into daily wins, proof, and a stronger identity in 10 days.**

### Release Philosophy

- **MVP (v1.0):** Prove the core loop - users complete binds AND engage with AI over 10 days
- **v1.1:** Enhance engagement with recovery mechanisms, visibility features, and accountability systems
- **v1.2+:** Expand depth of experience with advanced visualization, social features, and platform expansion

---

## Release Timeline

| Phase | Target | Focus | Key Metrics |
|-------|--------|-------|-------------|
| **MVP (v1.0)** | Q1 2025 | Core loop validation | 10-day active user retention >40% |
| **v1.1** | Q2 2025 | Engagement & retention | 30-day retention >30%, streak recovery rate >60% |
| **v1.2** | Q3 2025 | Growth & polish | DAU/MAU >0.5, NPS >50 |
| **v2.0** | Q4 2025 | Platform expansion | Android launch, web companion |

---

## MVP (v1.0) - Core Loop Validation

**Release Target:** Q1 2025
**Theme:** "Prove that AI-powered goal breakdown + daily actions work"

### Critical Path Features

**✅ Foundation (Sprint 1 - Week 0)**
- Project scaffolding (React Native + FastAPI)
- Supabase setup (Auth + Database + Storage)
- Row Level Security (RLS) policies
- AI service abstraction (OpenAI + Anthropic + fallbacks)
- Test infrastructure
- CI/CD pipeline

**🎯 Onboarding (Sprint 1-2)**
- Welcome screen with value proposition
- Dream Self definition (200-500 char text input)
- First Needle setup with AI-assisted breakdown
- First commitment (hold-to-commit interaction)

**🎯 Daily Actions (Sprint 2-3)**
- Thread home screen (today's binds grouped by needles)
- Bind screen (action + proof interface)
- Bind completion with confetti animation
- Basic proof attachment (photo or note)

**🎯 AI Coaching (Sprint 2-3)**
- AI chat interface with contextual opening
- Contextual AI responses (references goals, progress, identity)
- Dream Self voice personality
- Quick action chips ("Plan my day", "I'm stuck", "Edit my Needle")

**📊 Minimal Dashboard (Sprint 3)**
- Weave level display
- Active needles summary
- Basic streak counter (resets on miss - v1.0 behavior)

### MVP Success Criteria

- **User can complete onboarding in <5 minutes**
- **User can complete a bind in <30 seconds**
- **AI chat responds in <3 seconds (streaming start)**
- **10-day active retention >40%** (industry baseline: 20-25%)
- **User completes ≥1 bind/day for 7 out of 10 days**

### MVP Deferrals (Not Blocking Launch)

- Archetype assessment (hardcode initial archetype)
- Demographics collection (timezone auto-detect only)
- App tutorial (users explore naturally)
- Soft paywall (free tier only for MVP)
- Reflection & journaling (Sprint 4)
- Progress visualization (heat map, charts)
- Notifications (push notification infrastructure only)

---

## v1.1 - Engagement & Retention Enhancements

**Release Target:** Q2 2025 (1-2 months post-MVP)
**Theme:** "Keep users coming back with recovery mechanisms and visibility"

### Feature Set

**🔄 Streak Recovery System** `[v1.1]`
- **Old behavior (MVP):** Streak resets to 0 on any missed day
- **New behavior:** 3 consecutive check-ins after missing a day prevents streak loss
- Streak resilience metric (recovery rate)
- Visual progress bar: "You're 2/3 days to recovering your streak!"
- Reduces shame spiral, encourages comeback behavior
- **Rationale:** Research shows forgiving streak systems improve 30-day retention by 15-20%

**📅 Calendar Component** `[v1.1]`
- Week/month view on Thread home screen
- At-a-glance completion status for recent activity
- Visual indicator: completed days vs. missed days
- Tap on date to view that day's details
- Shows streak resilience visually
- **Rationale:** Users need quick check-in history without navigation; improves awareness

**📸 Document Tracking System** `[v1.1]`
- Daily documentation requires 3-item minimum for weave level-up
- Progress tracking: "2 out of 3 documented today"
- Accepts: pictures, notes, videos, voice memos
- Not tied to specific binds - general life recording
- No maximum limit but rewards cap at 3 items
- **Rationale:** Creates clear daily goal (3 items) for progression; encourages life documentation

**✨ Enhanced Bind Workflow** `[v1.1]`
- Post-action flow: Complete → Optional reflection → Confetti → Insight
- Insight provided regardless of reflection completion
- Immediate insight if reflection completed
- Accountability messaging: "Strengthening your weave"
- **Rationale:** Better accountability loop with immediate feedback; reduces friction

**⏱️ Daily Check-in Enhancements** `[v1.1]`
- 24-hour countdown timer for end-of-day task
- Recap feature shows daily documents + bind completion
- Swipeable interface through day's activities
- Visual timeline of the day's progress
- **Rationale:** Recap before reflection improves reflection quality; countdown creates urgency

**💬 Weave Chat Repositioning** `[v1.1]`
- Move chat from floating button to navigation bar item
- Animated speaking effect as text appears
- Accessible as primary feature, not secondary action
- **Rationale:** Simplifies UI, makes chat more discoverable, increases engagement

### v1.1 Success Criteria

- **30-day retention >30%** (up from MVP baseline ~25%)
- **Streak recovery rate >60%** (users who miss 1 day recover within 3 days)
- **Daily documentation rate >50%** (users document ≥1 item/day)
- **Chat engagement >3 messages/week** (users actively use AI coach)
- **Bind completion rate >70%** (completed binds / total scheduled)

### Impacted Epics & Stories

**Epic 3: Daily Actions**
- 3.1: View Today's Binds (calendar integration)
- 3.3: Complete Bind (new post-action flow)
- 3.5: Quick Capture (document system with progress tracking)

**Epic 4: Reflection & Journaling**
- 4.1: Daily Reflection Entry (check-in flow updates)
- 4.2: Recap Before Reflection (swipeable recap)

**Epic 5: Progress Dashboard**
- 5.5: Streak Display (recovery mechanism)
- 5.1: Dashboard Overview (calendar component)

**Epic 6: AI Coaching**
- 6.1: Access AI Chat (navigation bar placement)

---

## v1.2 - Growth & Polish

**Release Target:** Q3 2025
**Theme:** "Deepen the experience with advanced features and social proof"

### Feature Set

**📊 Advanced Progress Visualization** `[v1.2]`
- Consistency heat map (GitHub-style contribution graph)
- Fulfillment trend chart (line chart with 7-day rolling average)
- Weave character progression (mathematical curve visualization)
- Badge system (milestone triggers: 7/10/30 day streaks)
- Day 10 snapshot (shareable "Before vs After" summary)

**🔔 Smart Notifications** `[v1.2]`
- Morning intention notification (today's Triad + yesterday recap)
- Bind reminder escalation (gentle → contextual → accountability)
- Evening reflection prompt (if journal not submitted)
- Streak recovery notification (compassionate, not shame-based)
- Milestone celebration (10/30/60/90 active days)

**🎯 Advanced Goal Management** `[v1.2]`
- View needles list (up to 3 active with stats)
- View needle details (full info with binds, completion rates)
- Create new needle with AI assistance
- Edit needle with thoughtful change warning
- Archive needle with reactivate option
- Needle change strictness modes (Normal/Strict/None)

**📝 Reflection & Journaling** `[v1.2]`
- Daily reflection entry (2 questions + fulfillment slider)
- AI feedback generation (3 insights: Affirming, Blocker, Triad)
- Edit AI feedback (corrections stored for improvement)
- View past journal entries (filter by timeframe)

**🤖 Advanced AI Features** `[v1.2]`
- AI weekly insights (pattern detection, success correlations)
- AI needle suggestions (after archiving a needle)
- Edit AI chat responses (long-press to edit or regenerate)

**⚙️ Settings & Personalization** `[v1.2]`
- Edit identity document (archetype, Dream Self, motivations)
- Notification preferences (intensity slider, quiet hours)
- General settings (timezone, working hours, data export)
- Subscription management (Free/Pro/Max tiers)

### v1.2 Success Criteria

- **DAU/MAU ratio >0.5** (highly engaged user base)
- **NPS score >50** (strong product-market fit)
- **7-day retention >60%** (users stick through first week)
- **Subscription conversion >5%** (free → paid)
- **Average session length >5 minutes**

---

## v2.0 - Platform Expansion

**Release Target:** Q4 2025
**Theme:** "Meet users where they are"

### Feature Set

**🤖 Platform Expansion** `[v2.0]`
- Android app (React Native shared codebase)
- Web companion (read-only progress dashboard)
- Apple Watch complication (streak counter + quick complete)
- Siri shortcuts ("Hey Siri, complete my morning workout")

**🌐 Social Features** `[v2.0]`
- Accountability partners (optional 1:1 sharing)
- Community challenges (opt-in group goals)
- Shareable milestone cards (10/30/60/90 day snapshots)
- Anonymous success stories (user-submitted wins)

**🧠 Advanced AI Memory** `[v2.0]`
- Vector embeddings for "second brain" (semantic search)
- Multi-modal long-term memory (text, images, audio)
- Proactive AI suggestions based on context
- Predictive insights ("You tend to skip gym on Fridays")

**💬 Communication Channels** `[v2.0]`
- SMS/text messaging integration (as requested in FR-7.6)
- Email summaries (weekly progress reports)
- iMessage integration (quick bind completion)

---

## Feature Flag Strategy

All v1.1+ features will be controlled by feature flags for phased rollouts and A/B testing.

```python
# Example feature flag configuration
FEATURE_FLAGS = {
    "mvp": {
        "streak_recovery_enabled": False,
        "calendar_component_enabled": False,
        "document_tracking_enabled": False,
        "countdown_timer_enabled": False,
        "swipeable_recap_enabled": False,
    },
    "v1.1": {
        "streak_recovery_enabled": True,
        "calendar_component_enabled": True,
        "document_tracking_enabled": True,
        "countdown_timer_enabled": True,
        "swipeable_recap_enabled": True,
    },
}
```

### Rollout Strategy

1. **Internal Alpha:** Feature flags enabled for team testing (10 users)
2. **Closed Beta:** 10% of users, monitor metrics for 1 week
3. **Gradual Rollout:** 25% → 50% → 100% over 2 weeks
4. **A/B Testing:** Compare cohorts with/without feature
5. **Full Release:** Feature flag removed after stability confirmed

---

## Post-MVP Deferred Features

**Not blocking MVP or v1.1, evaluate for v1.2+:**

- Vector embeddings for semantic search
- Multi-modal long-term memory
- Complex recurrence UI (daily/weekly/monthly)
- iMessage integration
- Query result caching (Redis)
- Database connection pooling
- Read replicas for scaling
- PostHog analytics (add at 500+ users)
- Sentry error tracking (add at 500+ users)
- Redis/BullMQ job queue (add at 1K+ users)

---

## Success Metrics by Phase

| Metric | MVP (v1.0) | v1.1 | v1.2 | v2.0 |
|--------|-----------|------|------|------|
| **10-day retention** | >40% | >50% | >60% | >70% |
| **30-day retention** | >25% | >30% | >40% | >50% |
| **DAU/MAU** | >0.3 | >0.4 | >0.5 | >0.6 |
| **Bind completion rate** | >60% | >70% | >75% | >80% |
| **Chat engagement** | >2 msg/wk | >3 msg/wk | >5 msg/wk | >7 msg/wk |
| **NPS** | >30 | >40 | >50 | >60 |
| **Subscription conversion** | N/A | >3% | >5% | >8% |

---

## Risk Assessment

### High-Priority Risks

| Risk | Impact | Mitigation | Timeline |
|------|--------|------------|----------|
| **AI costs exceed budget** | High | Aggressive caching, rate limiting, cost alerts | Ongoing |
| **10-day retention <40%** | Critical | Revisit onboarding UX, increase AI engagement | Sprint 3-4 |
| **Streak recovery confuses users** | Medium | Clear UI messaging, tutorial on first miss | v1.1 beta |
| **Calendar component slow** | Low | Pre-compute daily aggregates, optimize queries | v1.1 dev |
| **Notification fatigue** | Medium | Default to gentle mode, easy opt-out | v1.2 launch |

### Dependency Risks

| Dependency | Risk | Backup Plan |
|------------|------|-------------|
| **OpenAI API** | Service outage | Fall back to Anthropic Claude |
| **Anthropic API** | Service outage | Fall back to deterministic templates |
| **Supabase** | Downtime | Self-hosted PostgreSQL on Railway |
| **Expo EAS Build** | Build failures | Local builds with manual deployment |

---

## Iteration Plan

### How We Decide What's Next

1. **User Feedback Loop** (Weekly)
   - User interviews with 5-10 active users
   - In-app feedback prompts after key moments
   - Support ticket analysis

2. **Data-Driven Decisions** (Weekly)
   - Monitor North Star metric: "Active Days with Proof"
   - Track feature adoption rates
   - Identify drop-off points in funnel

3. **Quarterly Planning** (Every 3 months)
   - Review roadmap priorities
   - Adjust timelines based on learnings
   - Deprioritize low-impact features

### Feature Promotion Criteria

For a feature to move from "Future" to "Next Sprint":

1. **User demand:** >20% of users request it in feedback
2. **Metrics impact:** Projected to improve retention by >5%
3. **Technical feasibility:** Can be built in <2 sprints
4. **Strategic alignment:** Supports North Star metric

---

## Release Notes Template

Each release will include:

- **What's New:** User-facing feature descriptions
- **Improvements:** Performance and UX polish
- **Bug Fixes:** Resolved issues
- **Known Issues:** Limitations and workarounds

---

*This roadmap is a living document. Priorities may shift based on user feedback, technical constraints, and market conditions.*

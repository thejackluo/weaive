# Weave Sprint Plan

**Generated:** 2025-12-16 (Updated: 2025-12-17 for Epic 1 Hybrid Flow)
**Project:** Weave MVP
**Total Scope:** 298 story points across 9 epics (+26 pts from Epic 1 hybrid flow)
**Target Delivery:** 12-14 weeks (3 months)
**Team Size:** 1-2 developers

---

## Executive Summary

Based on the **Implementation Readiness Assessment**, this project requires **Week 0 Foundation** (3-5 days) before Sprint 1 can begin. The assessment identified critical gaps that block feature development:

| Gap | Impact | Addressed In |
|-----|--------|-------------|
| No database schema | Cannot store any data | Week 0 |
| No API implementation | Cannot build mobile screens | Week 0 |
| No authentication | Cannot access user data | Week 0 |
| No test infrastructure | Cannot validate quality | Week 0 |
| RLS policies missing | Security vulnerability | Week 0 |

**Revised Strategy:**
1. **Week 0:** Foundation setup (Epic 0: 40 pts → 3-5 days)
2. **Sprint 1:** Core user journey (48 pts → 2 weeks)
3. **Sprint 2:** AI features & polish (52 pts → 2 weeks)
4. **Sprint 3+:** Remaining features and scale prep

---

## Week 0: Foundation (Pre-Sprint Setup)

**Duration:** 3-5 days
**Goal:** Establish executable codebase with authentication, database, and security
**Epic:** Epic 0 - Foundation (40 points)

### Critical Path

```
Day 1-2: Project scaffolding + Database schema
  ├─ 0.1: Mobile & Backend initialization (5 pts)
  ├─ 0.2a: Database schema core tables (3 pts)
  └─ 0.2b: Schema refinement (2 pts)

Day 2-3: Authentication + Security
  ├─ 0.3: Authentication flow (3 pts)
  └─ 0.4: Row Level Security [CRITICAL] (5 pts)

Day 3-4: Infrastructure + AI
  ├─ 0.5: CI/CD pipeline (3 pts)
  ├─ 0.6: AI service abstraction (3 pts)
  └─ 0.7: Test infrastructure (3 pts)

Day 4-5: Error handling (NEW - from gaps)
  ├─ 0.8: Error handling framework (3 pts)
  ├─ 0.9: Image upload error handling (3 pts)
  └─ 0.10: AI failure handling (3 pts)
```

### Week 0 Deliverables

**✅ By End of Week 0:**
- [ ] Mobile app (Expo) runs on iOS simulator
- [ ] Backend API (FastAPI) runs locally on http://localhost:8000
- [ ] Database has 8 core tables with RLS enabled
- [ ] User can sign up, log in, log out
- [ ] CI/CD pipeline runs on every commit
- [ ] AI service can call OpenAI/Anthropic with fallback
- [ ] Test infrastructure ready with sample tests passing
- [ ] Error handling framework documented

**🔴 Blockers Resolved:**
- Database exists → Can store data
- API exists → Can build screens
- Auth works → Can access user data
- RLS enabled → Security vulnerability closed
- Tests ready → Can validate quality

---

## Sprint 1: Core User Journey (Weeks 1-2)

**Duration:** 2 weeks (10 work days)
**Capacity:** 59 story points (updated for Epic 1 Hybrid Flow with suggested goals)
**Goal:** User can complete onboarding (Phases 1-5), set first goal, complete first bind, and see progress

### Sprint 1 Scope (Revised: 59 pts)

**Epic 1: Onboarding (Hybrid Flow) - Phases 1-5 (35 pts)**
- **Phase 1: Emotional Hook (Pre-Auth, 45s max)**
  - 1.1: Welcome & Vision Hook (2 pts)
  - 1.2: Emotional State Selection (Painpoint) (3 pts)
  - 1.3: Symptom Insight Screen (Dynamic Mirror) (2 pts)
  - 1.4: Weave Solution Screen (Dynamic "Here's What Changes Now") (2 pts)
  - 1.5: Authentication (3 pts)
- **Phase 2: Light Identity Bootup (In-App, Fast)**
  - 1.6: Name Entry, Weave Personality Selection & Identity Traits (5 pts)
  - 1.7: Commitment Ritual & Origin Story (First Bind) (5 pts)
- **Phase 3: Early Value Proof ("Wow Moment")**
  - 1.8: Create Your First Needle (Goal + Plan) (8 pts)
  - 1.9: First Daily Reflection (Day 0 Check-In) (2 pts)
- **Phase 4: Lightweight Orientation**
  - 1.10: Progress Dashboard Introduction (2 pts)
- **Phase 5: Trial Activation & Handoff**
  - 1.11: Housekeeping, Trial Framing & Handoff (6 pts)
- ⏭️ **DEFERRED Phase 6 → Sprint 2:** 1.12 Dream Self (3 pts), 1.13 Archetype (3 pts), 1.14 Motivations (3 pts), 1.15 Constraints (2 pts)
  - **Note:** Soft paywall (old 1.16) integrated into 1.11 Screen 3

**Epic 3: Daily Actions (Simplified) (16 pts)** - Reduced from 38 pts
- ✅ 3.1a: View Today's Binds (basic list) (5 pts)
- ✅ 3.3a: Complete Bind (no timer) (5 pts)
- ✅ 3.4a: Attach Proof (photo only, no voice) (3 pts)
- ✅ 3.5a: Quick Note Capture (3 pts)
- ⏭️ **DEFERRED:** 3.2 (Triad AI), 3.3b (Timer), 3.3c (Confetti), 3.4b (Voice), 3.6 (Pomodoro)

**Epic 5: Progress Dashboard (Minimal) (8 pts)** - Reduced from 39 pts
- ✅ 5.1a: Dashboard Overview (basic stats) (5 pts)
- ✅ 5.5a: Streak Display (current only) (3 pts)
- ⏭️ **DEFERRED:** 5.2 (Heat map - 8 pts), 5.3 (Charts), 5.4 (Weave character), 5.6 (Badges), 5.7 (Snapshots)

**Total Sprint 1:** 64 points

### Sprint 1 User Story

> "As a new user, I can complete onboarding in <5 minutes, set my first goal (Needle) with manually created habits (Binds), complete my first Bind today, attach proof (photo or note), and see my progress streak on a basic dashboard."

### Sprint 1 Success Criteria

**Technical:**
- [ ] End-to-end onboarding flow works (Welcome → Dream Self → First Goal)
- [ ] User can create a goal with 3 binds
- [ ] User can complete a bind and attach proof
- [ ] Dashboard shows: active goals, today's binds, current streak
- [ ] All API endpoints tested with >80% coverage
- [ ] No critical security vulnerabilities (RLS verified)

**User Experience:**
- [ ] Onboarding completion time <5 minutes
- [ ] Bind completion flow <30 seconds
- [ ] Zero crashes during happy path
- [ ] App feels responsive (<1s load times)

---

## Sprint 2: AI Features & Deferred Personalization (Weeks 3-4)

**Duration:** 2 weeks
**Capacity:** 53 story points (updated for Epic 1 Hybrid Flow)
**Goal:** Complete deferred onboarding (Phase 6), add daily plans (Triad), and journaling with feedback

### Sprint 2 Scope (Revised: 53 pts)

**Epic 1 (Continued): Hybrid Flow Phase 6 (11 pts Should Have)**
- **Phase 6: Deferred Deep Personalization (Days 1-3)**
  - 1.12: Dream Self (Day 1 Evening Prompt) (3 pts)
  - 1.13: Archetype Micro-Assessment (Day 2) (3 pts)
  - 1.14: Motivations & Failure Modes (Day 2-3) (3 pts)
  - 1.15: Constraints & Demographics (Day 3) (2 pts)
- **Note:** Soft paywall (old 1.16) integrated into 1.11 Screen 3

**Epic 3 (Continued): AI Daily Plan (14 pts)**
- 3.2a: View Triad (AI daily plan) (5 pts)
- 3.2b: Triad rationale ("Why this bind") (3 pts)
- 3.3c: Confetti animation on completion (2 pts)
- 3.6a: Pomodoro timer (basic) (4 pts)

**Epic 4: Reflection & Journaling (20 pts)**
- 4.1: Daily Reflection Entry (5 pts)
- 4.2: Recap Before Reflection (3 pts)
- 4.3: AI Feedback Generation (5 pts)
- 4.4: Edit AI Feedback (3 pts)
- 4.5: View Past Journal Entries (4 pts)

**Epic 5 (Continued): Progress Viz (8 pts)**
- 5.2a: Consistency Heat Map (basic) (5 pts)
- 5.3a: Fulfillment Trend (basic line chart) (3 pts)

**Total Sprint 2:** 53 points

### Sprint 2 User Story

> "As an active user, I receive AI-generated daily plans (Triad) tailored to my goals, complete my daily reflection with AI feedback that feels personal and encouraging, and visualize my consistency on a heat map that motivates me to maintain my streak."

---

## Sprint 3: Goal Management & Engagement (Weeks 5-6)

**Duration:** 2 weeks
**Capacity:** 50-52 story points
**Goal:** Full goal lifecycle (create, edit, archive) + notifications + settings

### Sprint 3 Scope

**Epic 2: Needle/Goal Management (27 pts)**
- 2.1: View Needles List (3 pts)
- 2.2: View Needle Details (5 pts)
- 2.3: Create New Needle (AI-assisted) (5 pts)
- 2.4: Edit Needle (5 pts)
- 2.5: Archive Needle (3 pts)
- 2.6: Needle Change Strictness (3 pts)
- UX-R: Return States for goal editing (3 pts)

**Epic 7: Notifications (18 pts)** - Priority subset
- 7.1: Morning Intention Notification (5 pts)
- 7.3: Evening Reflection Prompt (3 pts)
- 7.4: Streak Recovery Notification (5 pts)
- 7.6: Notification Preferences (5 pts)
- ⏭️ **DEFERRED:** 7.2 (Bind reminders), 7.5 (Milestones)

**Epic 8: Settings & Profile (10 pts)** - Core only
- 8.1: Profile Overview (3 pts)
- 8.2: Edit Identity Document (5 pts)
- 8.6: Logout and Security (2 pts)
- ⏭️ **DEFERRED:** 8.3 (General settings), 8.4 (Subscription), 8.5 (Help)

**Total Sprint 3:** 55 points

---

## Sprint 4+: Polish, AI Chat, Advanced Features

**Remaining Scope:** ~116 points (Epics 5-8 completion + cross-cutting concerns)

### Sprint 4 (Weeks 7-8): AI Coaching & Advanced Progress

**Epic 6: AI Coaching (29 pts)**
- 6.1: Access AI Chat (8 pts)
- 6.2: Contextual AI Responses (with Tech Context Engine) (10 pts)
- 6.3: Edit AI Chat Responses (3 pts)
- 6.4: AI Weekly Insights (5 pts)
- 6.5: AI Needle Suggestions (3 pts)

**Epic 5 (Continued): Advanced Progress (18 pts)**
- 5.4: Weave Character Progression (8 pts)
- 5.6: Badge System (5 pts)
- 5.7: Day 10 Snapshot (5 pts)

**Total Sprint 4:** 47 points

### Sprint 5 (Weeks 9-10): Final Features & Polish

**Epic 3 (Final): Advanced Actions (8 pts)**
- 3.4b: Voice capture (3 pts)
- 3.7: Dual Path Visualization (5 pts)

**Epic 7 (Final): Notifications (10 pts)**
- 7.2: Bind Reminder Notifications (5 pts)
- 7.5: Milestone Celebration (5 pts)

**Epic 8 (Final): Settings (13 pts)**
- 8.3: General Settings (5 pts)
- 8.4: Subscription Management (5 pts)
- 8.5: Help and Support (3 pts)

**Cross-Cutting: UX Polish (20 pts)**
- UX-E: Error states and empty states (5 pts)
- UX-F: Loading and feedback (5 pts)
- UX-D: Delight and animations (5 pts)
- UX-L: Accessibility and localization (5 pts)

**Total Sprint 5:** 51 points

### Sprint 6 (Weeks 11-12): Alpha Testing & Hardening

**Focus:** Bug fixes, performance optimization, alpha user feedback integration

**Activities:**
- Alpha release to 10-20 testers
- Monitor crash analytics (target <1% crash rate)
- Monitor AI costs (target <$0.50/user/month)
- Fix critical bugs and UX friction points
- Prepare for beta launch

---

## Team Capacity & Velocity

### Assumptions

**Team Size:** 1-2 developers
**Sprint Length:** 2 weeks (10 work days)
**Points per Day:** 5 points (realistic for greenfield project)
**Velocity:** 50 points/sprint (with buffer for unknowns)

### Velocity Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| AI integration complexity | HIGH | Start with simple prompts, iterate |
| React Native learning curve | MEDIUM | Use design system, limit custom animations |
| Supabase RLS debugging | MEDIUM | Test early, write clear policies |
| Scope creep | HIGH | Protect "Do Not Block MVP" boundaries |
| Third-party API downtime | LOW | Implement fallback chains |

---

## Dependencies & Blockers

### External Dependencies

| Dependency | Required By | Risk Level | Mitigation |
|------------|-------------|------------|------------|
| Supabase account | Week 0 | LOW | Free tier sufficient |
| OpenAI API key | Week 0 | LOW | $5 free trial |
| Anthropic API key | Week 0 | LOW | Fallback only |
| Apple Developer account | Sprint 5 | MEDIUM | Register early ($99/year) |
| Railway account | Week 0 | LOW | Free tier sufficient |

### Critical Path

```
Week 0 → Sprint 1 → Sprint 2 → Sprint 3 → Sprint 4 → Sprint 5 → Sprint 6
  ↓         ↓          ↓          ↓          ↓          ↓          ↓
  DB     Onboard   AI+Journal  Goals+    AI Chat   Polish    Alpha
  Auth   Binds     Triad       Notifs    Coaching  UX        Testing
  RLS    Streak    Reflect     Settings  Progress  Bugs      Launch
```

---

## Definition of Done (DoD)

### Story-Level DoD

- [ ] Acceptance criteria verified
- [ ] Unit tests written (>80% coverage for new code)
- [ ] Integration tests for API endpoints
- [ ] No linting errors (ESLint, Ruff)
- [ ] TypeScript strict mode passes
- [ ] Manual testing on iOS simulator
- [ ] Code reviewed (self-review or peer review)
- [ ] Documentation updated (if API/schema changes)

### Sprint-Level DoD

- [ ] All stories marked "done"
- [ ] Sprint demo recorded (video walkthrough)
- [ ] Sprint retrospective completed
- [ ] Known bugs documented in backlog
- [ ] Performance benchmarks met (load times, API latency)
- [ ] Security checklist reviewed
- [ ] Deployment to staging successful

### Release-Level DoD (Alpha)

- [ ] All Sprint 1-5 features complete
- [ ] Zero critical bugs
- [ ] <1% crash rate
- [ ] RLS policies verified by penetration test
- [ ] AI costs within budget (<$0.50/user/month)
- [ ] Onboarding completion rate >70%
- [ ] Performance targets met (see NFRs)
- [ ] Privacy policy + terms of service published
- [ ] TestFlight build available for alpha testers

---

## Risk Register

### Top 5 Risks

| # | Risk | Impact | Probability | Mitigation |
|---|------|--------|-------------|------------|
| 1 | AI costs exceed budget | CRITICAL | HIGH | Implement cost tracking + auto-throttle in Week 0 |
| 2 | RLS misconfiguration | CRITICAL | MEDIUM | Test with multiple users in Week 0 |
| 3 | Offline mode breaks sync | HIGH | MEDIUM | Implement TanStack Query persistence early |
| 4 | Onboarding too long | HIGH | HIGH | Time every flow, cut ruthlessly to <5 min |
| 5 | Sprint 1 over-commitment | MEDIUM | HIGH | Protect 48pt scope, defer nice-to-haves |

---

## Success Metrics

### Sprint 1 KPIs

- [ ] Onboarding completion rate >70%
- [ ] First bind completion time <30 seconds
- [ ] Zero authentication failures
- [ ] API response time <500ms (p95)
- [ ] Zero RLS bypass vulnerabilities

### MVP Launch KPIs (End of Sprint 6)

- [ ] 10-20 alpha testers onboarded
- [ ] 7-day retention >40%
- [ ] Daily active user rate >30%
- [ ] AI cost per user <$0.50/month
- [ ] Crash rate <1%
- [ ] App Store ready (no blockers)

---

## Next Steps

1. **Review & Approve This Plan** - Confirm Week 0 + Sprint 1 scope
2. **Execute Week 0 Foundation** - Complete Epic 0 stories (3-5 days)
3. **Sprint 1 Planning Meeting** - Break stories into tasks, assign owners
4. **Daily Standups** - Track progress, unblock issues
5. **Sprint 1 Demo & Retro** - Review work, adjust Sprint 2 scope

---

**Document Status:** ✅ Ready for Review
**Last Updated:** 2025-12-16
**Next Review:** After Week 0 completion

# Release Plan

## Phase 1: Foundation (Weeks 1-4)

**Epics:** Infrastructure setup, Authentication, Basic data model

**Deliverables:**
- React Native project setup
- Supabase database and auth
- FastAPI backend on Railway
- Basic user authentication flow
- Core data models implemented

## Phase 2: Onboarding (Weeks 5-8)

**Epics:** E1 (Onboarding & Identity)

**Deliverables:**
- Complete onboarding flow
- Archetype assessment
- Dream self definition
- AI-assisted goal setup (Onboarding Coach)
- First commitment flow

## Phase 3: Core Loop (Weeks 9-14)

**Epics:** E2 (Goal Management), E3 (Daily Actions)

**Deliverables:**
- Goals management (CRUD)
- Binds (subtasks) management
- Bind completion flow
- Proof capture (photo, note, timer)
- Thread (Home) screen

## Phase 4: Reflection & AI (Weeks 15-18)

**Epics:** E4 (Reflection), E6 (AI Coaching)

**Deliverables:**
- Daily reflection flow
- AI feedback generation (Recap, Triad)
- Dream Self Advisor chat
- AI cost optimization

## Phase 5: Progress & Notifications (Weeks 19-22)

**Epics:** E5 (Progress), E7 (Notifications)

**Deliverables:**
- Weave Dashboard
- Consistency heat map
- Streak and badge system
- Push notifications (all types)

## Phase 6: Polish & Launch (Weeks 23-26)

**Epics:** E8 (Settings & Profile), E9 (Production Launch & App Store)

### Week 23: Production Infrastructure Setup

**Stories:** 9.1, 9.2, 9.7, 9.5 (18 story points)

**Deliverables:**
- **Production Backend Deployment (9.1):** Railway production environment, CI/CD pipeline, health checks
- **Production Database Setup (9.2):** Supabase Pro instance, production migrations, RLS audit, backup strategy
- **Production Monitoring (9.7):** Sentry error tracking, LogRocket session replay, cost dashboard, uptime monitoring
- **Security Hardening (9.5):** Rate limiting, OWASP security scan, secrets management, API key rotation

**Parallel Work:** Epic 8 (Settings & Profile) can start this week

### Week 24: App Store Compliance & Subscriptions

**Stories:** 9.3, 9.4, E8 completion (26 story points)

**Deliverables:**
- **App Store Compliance (9.3):** Privacy policy, terms of service, App Store Connect setup, screenshots, metadata
- **Subscription Management (9.4):** Apple IAP configuration, RevenueCat integration, subscription tiers (Free/Pro/Max), receipt validation
- **Settings & Profile (E8):** Profile screen, notification preferences, subscription management UI, help & support

### Week 25: Beta Testing & Submission

**Stories:** 9.6, 9.8 (11 story points)

**Deliverables:**
- **TestFlight Beta Testing (9.6):** Production IPA build, 10+ beta testers, bug tracking, feedback collection
- **Bug Fixes & Polish:** Address P0/P1 bugs from beta testing (target: zero P0, <5 P1)
- **Performance Optimization:** Meet benchmarks (app launch <2s, API <1s, app size <100MB)
- **App Store Submission (9.8):** Demo account setup, final build upload, review information, submission to Apple

### Week 26: Launch & Post-Launch Monitoring

**Milestone:** M4 - Public Launch

**Deliverables:**
- **App Store Approval:** Monitor review process, respond to reviewer questions, handle rejection if needed
- **Public Launch:** Release app to App Store (target: Week 26 start)
- **Post-Launch Monitoring:** 24-hour intensive monitoring (Sentry, LogRocket, backend logs, crash rate <1%)
- **User Support:** Respond to App Store reviews within 48 hours
- **Celebration:** 🎉 MVP shipped!

**Cost Summary (Production Infrastructure):**
- Railway (Backend): $20-50/month
- Supabase Pro: $25/month
- LogRocket: $99/month
- Sentry: Free or $26/month
- Apple Developer: $8/month ($99/year)
- **Total:** $172-208/month (excluding AI costs)

## Milestones

| Milestone | Date | Criteria |
|-----------|------|----------|
| M1: Alpha | Week 14 | Core loop functional (bind + capture + reflect) |
| M2: Beta | Week 22 | All must-have features complete |
| M3: RC | Week 25 | All critical bugs fixed, performance targets met |
| M4: Launch | Week 26 | App Store approval, public launch |

---

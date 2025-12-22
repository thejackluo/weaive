# Epic 0.5: Post-Development Observability

## Overview

Production debugging, error tracking, and user experience monitoring infrastructure to ensure product quality and enable fast issue resolution post-launch.

**Why Epic 0.5 (Not Epic 9)?** These are foundational infrastructure stories that must be deployed **before public launch** to catch issues early. Directly supports NFR-R2 (Error handling) and NFR-P1 (Performance monitoring).

## User Stories

### US-0.12: LogRocket Session Replay & Debugging

**Priority:** M (Must Have)

**As a** developer
**I want to** have session replay and user behavior tracking
**So that** I can reproduce bugs and understand how users interact with the app

**Acceptance Criteria:**

**LogRocket Integration:**
- [ ] Create LogRocket account and obtain API key
- [ ] Install LogRocket React Native SDK in mobile app (`weave-mobile/`)
- [ ] Configure LogRocket with user identification (user_id from Supabase Auth)
- [ ] Implement privacy controls: Mask sensitive fields (passwords, auth tokens)
- [ ] Set up LogRocket dashboard with:
  - [ ] Session replay video
  - [ ] Console logs
  - [ ] Network requests
  - [ ] Performance metrics (FPS, memory usage)
  - [ ] User actions (taps, navigation)

**Integration Points:**
- [ ] Add LogRocket initialization to `app/_layout.tsx` (root layout)
- [ ] Track custom events:
  - `goal_created`, `bind_completed`, `proof_captured`
  - `journal_submitted`, `triad_generated`
- [ ] Track screen views automatically (using Expo Router)

**Privacy & Security:**
- [ ] Mask input fields: password, auth token, sensitive profile data
- [ ] Disable session recording for settings/profile screens (optional toggle)
- [ ] Data retention: 30 days (LogRocket default)

**Testing:**
- [ ] Verify session recordings appear in LogRocket dashboard
- [ ] Verify sensitive fields are masked
- [ ] Verify custom events are tracked correctly

**Data Requirements:**
- No database tables required (external service)
- LogRocket API key stored in environment variables

**Technical Notes:**
- **LogRocket Plan:** $99/month (up to 10K sessions/month)
- **ROI:** Reduces support cost by 50%+ (fewer blind debugging sessions)
- **Privacy compliance:** GDPR-compliant, data stored in US/EU regions
- **Integration time:** ~4 hours (straightforward SDK setup)

**Story Points:** 3

**Dependencies:**
- Requires: Story 0.3 (Auth) for user identification
- No blockers for other stories

---

### US-0.13: Error Tracking & Performance Monitoring

**Priority:** M (Must Have)

**As a** developer
**I want to** have error tracking and performance monitoring
**So that** I can catch issues before users report them and optimize slow screens

**Acceptance Criteria:**

**Sentry Integration:**
- [ ] Create Sentry account and obtain DSN keys (frontend + backend)
- [ ] Install Sentry React Native SDK in mobile app
- [ ] Install Sentry FastAPI SDK in backend (`weave-api/`)
- [ ] Configure Sentry with:
  - [ ] Automatic error capture (unhandled exceptions, promise rejections)
  - [ ] Performance monitoring (screen load times, API response times)
  - [ ] Breadcrumbs (user actions leading to errors)
  - [ ] Release tracking (link errors to specific app versions)

**Frontend Monitoring:**
- [ ] Track screen load times for key screens:
  - Thread (Home), Goal Details, Journal Entry, Triad View
- [ ] Track API call performance:
  - `GET /api/goals`, `POST /api/completions`, `POST /api/journal-entries`
- [ ] Set up alerts for:
  - [ ] Error rate > 1% of sessions
  - [ ] API response time > 5 seconds

**Backend Monitoring:**
- [ ] Track API endpoint performance:
  - P50, P95, P99 latencies for all endpoints
  - Error rates by endpoint
- [ ] Set up alerts for:
  - [ ] API error rate > 0.5%
  - [ ] Database query time > 2 seconds
  - [ ] AI API failures (Gemini, AssemblyAI, Whisper, OpenAI)

**Testing:**
- [ ] Trigger test errors in dev environment → verify they appear in Sentry
- [ ] Verify performance metrics are tracked
- [ ] Verify alerts are configured correctly

**Data Requirements:**
- No database tables required (external service)
- Sentry DSN keys stored in environment variables

**Technical Notes:**
- **Sentry Plan:** Free tier (5K errors/month) or $26/month (50K errors)
- **ROI:** Proactive issue detection, faster debugging
- **Performance baseline:** Establish P95 latency targets for all screens/endpoints
- **Integration time:** ~4 hours (SDK setup + alert configuration)

**Story Points:** 3

**Dependencies:**
- Requires: Story 0.3 (Auth), Story 0.6 (AI Service) for full monitoring coverage
- No blockers for other stories

---

## Epic 0.5 Summary

| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-0.12 | LogRocket Session Replay | M | 3 pts |
| US-0.13 | Sentry Error Tracking | M | 3 pts |

**Epic Total:** 6 story points

**Cost Impact:** $99/month (LogRocket) + $0/month (Sentry free tier) = **$99/month** observability infrastructure

**Timeline:** 1-2 days (8-16 hours)

**Critical for:** Production launch readiness, support efficiency, proactive issue detection

---

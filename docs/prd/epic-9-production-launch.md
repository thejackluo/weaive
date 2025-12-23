# Epic 9: Production Launch & App Store Publishing

## Overview

Deploy the Weave MVP to production infrastructure (Railway + Supabase), comply with Apple App Store guidelines, integrate subscription payments, and successfully publish the app to the iOS App Store.

**Priority:** M (Must Have) - **BLOCKS LAUNCH**

**Dependencies:**
- **Depends on:** Epic 0 (Foundation), Epic 8 (Settings - subscription UI)
- **Blocks:** M4: Launch milestone

**Business Value:** Without Epic 9, the app cannot be published to the App Store or reach users. This epic transforms the development MVP into a production-ready, publicly available iOS application.

---

## User Stories

### US-9.1: Production Backend Deployment

**Priority:** M (Must Have)

**As a** developer
**I want to** deploy the FastAPI backend to Railway production
**So that** the mobile app can connect to a stable, production-grade API

**Acceptance Criteria:**
- [ ] Create Railway production project (`weave-api-production`)
- [ ] Configure environment variables (DATABASE_URL, API keys, secrets)
- [ ] Set up CI/CD pipeline (GitHub Actions → Railway deploy on `main` push)
- [ ] Configure health check endpoint (`GET /health` returns 200)
- [ ] Enable auto-scaling (max 3 instances)
- [ ] Test production API from mobile app (staging build)
- [ ] Document rollback procedure in runbook

**Technical Notes:**
- Use Railway CLI for initial setup: `railway init`
- Store secrets in Railway dashboard (not in GitHub)
- Health check should verify database connection
- Configure region: us-west-1 (low latency for US users)

**Story Points:** 5

**Dependencies:**
- Requires: Epic 0 complete (backend exists)
- Unblocks: US-9.7 (monitoring), US-9.8 (submission)

---

### US-9.2: Production Database Setup

**Priority:** M (Must Have)

**As a** developer
**I want to** configure Supabase production instance with migrations and backups
**So that** user data is stored securely and can be recovered in case of failure

**Acceptance Criteria:**
- [ ] Create Supabase production project (separate from dev/staging)
- [ ] Upgrade to Supabase Pro Plan ($25/month for production SLA)
- [ ] Run all migrations from `supabase/migrations/` in order
- [ ] Verify RLS policies active on all 12 user-owned tables
- [ ] Enable daily automatic backups (7-day retention)
- [ ] Configure connection pooling (PgBouncer)
- [ ] Test database connection from Railway production backend
- [ ] Document migration rollback procedure

**Technical Notes:**
- Use `npx supabase db push --db-url $DATABASE_URL` for migrations
- Verify RLS: `SELECT * FROM pg_policies;`
- Connection pooling reduces database connection overhead
- Backups included in Supabase Pro Plan

**Story Points:** 5

**Dependencies:**
- Requires: Epic 0 complete (schema defined)
- Unblocks: US-9.1 (backend deployment), US-9.5 (security audit)

---

### US-9.3: App Store Compliance

**Priority:** M (Must Have)

**As a** product manager
**I want to** ensure Weave complies with all App Store guidelines
**So that** the app is approved for publication without delays

**Acceptance Criteria:**

**Legal Documents:**
- [ ] Draft privacy policy (cover data collection, AI usage, third-party services)
- [ ] Draft terms of service (user agreements, liability, dispute resolution)
- [ ] Legal review of both documents (use attorney or LegalZoom template)
- [ ] Publish privacy policy and ToS on public website (e.g., weave.app/privacy)
- [ ] Link to privacy policy in app settings (required by App Store)

**App Store Connect Setup:**
- [ ] Create Apple Developer account ($99/year)
- [ ] Set up App Store Connect account
- [ ] Create app record in App Store Connect (bundle ID: com.weaveapp.weave)
- [ ] Add app metadata (name, subtitle, description, keywords, category)
- [ ] Upload 6.7" and 5.5" iPhone screenshots (required)
- [ ] Upload app preview video (30 seconds, optional but recommended)
- [ ] Set age rating (4+ if no user-generated content, 12+ if journaling visible)

**Compliance Checklist:**
- [ ] Review App Store Review Guidelines (https://developer.apple.com/app-store/review/guidelines/)
- [ ] Verify no prohibited content (hate speech, violence, illegal activity)
- [ ] Ensure AI-generated content is clearly labeled
- [ ] Add COPPA compliance (if users under 13)
- [ ] Add GDPR compliance (for EU users)

**Technical Notes:**
- Privacy policy must cover: Supabase (data storage), OpenAI/Anthropic (AI processing), Sentry/LogRocket (analytics)
- App Store description should highlight "10-day identity transformation" value prop
- Legal review can use attorney ($500-1000) or LegalZoom template ($300)

**Story Points:** 8

**Dependencies:**
- Requires: Marketing team for screenshots/video
- Unblocks: US-9.8 (App Store submission)

---

### US-9.4: App Store Readiness - Critical Gaps

**Priority:** M (Must Have) - **BLOCKS TESTFLIGHT & SUBMISSION**

**As a** product manager
**I want to** fix all critical App Store deployment gaps identified in technical research
**So that** Weave can be submitted to the App Store without immediate rejection

**Acceptance Criteria:**
- [ ] iOS permission descriptions added to `app.json` (camera, photo library, microphone)
- [ ] Privacy manifest added to `app.json` (iOS 17+ requirement)
- [ ] Data export endpoint implemented (`GET /api/user/export-data`)
- [ ] Account deletion endpoint implemented (`DELETE /api/user/account`)
- [ ] Account deletion UI added to settings screen
- [ ] LogRocket user consent flow implemented
- [ ] Sentry PII scrubbing configured
- [ ] Privacy policy published to public URL (`weavelight.app/privacy`)
- [ ] Terms of Service published to public URL (`weavelight.app/terms`)
- [ ] 12 App Store screenshots created (6 for 6.7", 6 for 5.5")
- [ ] App icon verified as 1024x1024px PNG
- [ ] App description, subtitle, keywords written
- [ ] Apple Developer account created
- [ ] App Store Connect app record created
- [ ] `eas.json` submit profile configured

**Technical Notes:**
- **Background:** Technical research (2025-12-23) identified 10 critical blockers preventing App Store submission
- **Rejection Risk:** 99% rejection without iOS permissions, 80% without public privacy policy, 60% without GDPR compliance
- **Full specification:** `docs/stories/epic-9/9-4-app-store-readiness.md`
- **Sprint Change Proposal:** `_bmad-output/sprint-change-proposal-2025-12-23.md`

**Story Points:** 13

**Dependencies:**
- Requires: US-9.1 (Backend deployed), US-9.2 (Database setup), US-9.3 (Legal drafting)
- Unblocks: US-9.6 (TestFlight), US-9.8 (App Store submission)

---

### US-9.5: Subscription Management (Apple In-App Purchases)

**Priority:** M (Must Have)

**As a** user
**I want to** purchase a Pro or Max subscription within the app
**So that** I can unlock premium features

**Acceptance Criteria:**

**App Store Connect Setup:**
- [ ] Create 3 subscription products in App Store Connect:
  - Free Trial (10 days, auto-renews to Pro Monthly)
  - Pro Monthly ($9.99/month)
  - Max Yearly ($79.99/year, 33% discount)
- [ ] Configure subscription groups and upgrade/downgrade logic

**RevenueCat Integration (Recommended):**
- [ ] Create RevenueCat account (free up to $10K MRR)
- [ ] Integrate RevenueCat SDK in React Native app
- [ ] Configure entitlements (e.g., "pro" = unlimited goals, "max" = advanced AI)
- [ ] Implement paywall UI (use RevenueCat's Paywall component)
- [ ] Test subscription purchase flow in sandbox environment

**Backend Receipt Validation:**
- [ ] Implement server-side receipt validation (RevenueCat webhook)
- [ ] Update `user_profiles.subscription_tier` on successful purchase
- [ ] Handle subscription lifecycle events (purchase, renewal, cancellation, refund)

**Testing:**
- [ ] Create App Store sandbox test accounts
- [ ] Test subscription purchase (all tiers)
- [ ] Test subscription renewal (fast-forward time in sandbox)
- [ ] Test subscription cancellation
- [ ] Test subscription restore (on new device)

**Technical Notes:**
- **Recommended:** Use RevenueCat (abstracts StoreKit complexity, cross-platform)
- **Alternative:** Direct StoreKit 2 integration (more complex, iOS-only)
- RevenueCat handles receipt validation, reduces backend complexity
- Free tier supports up to $10K MRR (plenty for MVP)

**Story Points:** 8

**Dependencies:**
- Requires: Epic 8 (Subscription UI in settings)
- Unblocks: Revenue generation, premium feature gating

---

### US-9.6: Production Security Hardening

**Priority:** M (Must Have)

**As a** security engineer
**I want to** harden production infrastructure against common attacks
**So that** user data and the app are protected from malicious actors

**Acceptance Criteria:**

**Rate Limiting:**
- [ ] Implement API rate limiting middleware (FastAPI)
  - 100 requests/minute per IP for public endpoints
  - 1000 requests/minute per user for authenticated endpoints
- [ ] Return HTTP 429 with `Retry-After` header on limit exceeded

**Secrets Management:**
- [ ] Audit all environment variables (no secrets in GitHub)
- [ ] Use Railway secrets dashboard for production secrets
- [ ] Implement API key rotation strategy (quarterly)
- [ ] Document secret rotation procedure in runbook

**Security Audit:**
- [ ] Run OWASP ZAP scan on production API (vulnerability scanner)
- [ ] Review RLS policies (verify no cross-user data leaks)
- [ ] Test SQL injection prevention (parameterized queries)
- [ ] Test XSS prevention (input sanitization)
- [ ] Test CSRF protection (SameSite cookies, CORS headers)

**Production-Only Security:**
- [ ] Disable debug mode (`DEBUG=false`)
- [ ] Enable HTTPS-only (Railway auto-provides SSL)
- [ ] Set secure cookie flags (`HttpOnly`, `Secure`, `SameSite`)
- [ ] Implement CORS whitelist (only allow mobile app origin)

**Technical Notes:**
- Use `slowapi` for rate limiting in FastAPI: `uv add slowapi`
- OWASP ZAP is free and open-source: https://www.zaproxy.org/
- Security audit can be done by dev team (no external firm needed for MVP)

**Story Points:** 5

**Dependencies:**
- Requires: US-9.1, US-9.2 (production infrastructure exists)
- Unblocks: US-9.7 (beta testing - security baseline met)

---

### US-9.7: TestFlight Beta Testing

**Priority:** M (Must Have)

**As a** product manager
**I want to** run a beta test with real users on TestFlight
**So that** we can identify critical bugs before public launch

**Acceptance Criteria:**

**TestFlight Setup:**
- [ ] Generate production IPA using EAS Build (`eas build --platform ios --profile production`)
- [ ] Upload IPA to App Store Connect via Transporter app
- [ ] Enable TestFlight for app record
- [ ] Create beta testing group "Internal Beta" (team + friends, 10-20 users)
- [ ] Create beta testing group "External Beta" (public users, 30-50 users)

**Beta Testing Process:**
- [ ] Send TestFlight invites to internal beta group
- [ ] Collect feedback via Google Form or Typeform
- [ ] Monitor Sentry for crash reports during beta
- [ ] Fix critical bugs (P0: crashes, P1: data loss)
- [ ] Release updated builds to TestFlight (iterate 2-3 times)

**Beta Completion Criteria:**
- [ ] Zero P0 bugs (no crashes on core flows)
- [ ] <5 P1 bugs (data loss, broken features)
- [ ] Positive feedback from 80%+ of beta testers
- [ ] Core user journey tested end-to-end (onboarding → goal creation → bind completion → journal)

**Technical Notes:**
- TestFlight builds expire after 90 days (must re-upload)
- External Beta requires App Store review (1-2 day delay)
- Internal Beta is instant (no review needed)

**Story Points:** 3

**Dependencies:**
- Requires: US-9.1, US-9.2, US-9.4, US-9.6 (production infrastructure ready, critical gaps fixed)
- Unblocks: US-9.9 (final submission after bugs fixed)

---

### US-9.8: Production Monitoring Setup

**Priority:** M (Must Have)

**As a** DevOps engineer
**I want to** configure production monitoring and alerting
**So that** we can detect and respond to issues quickly

**Acceptance Criteria:**

**Sentry Configuration:**
- [ ] Create production projects in Sentry (weave-mobile, weave-api)
- [ ] Configure alert rules:
  - Error rate > 1% of sessions → Slack #alerts
  - API response time > 5s → Email engineering@
  - App crash rate > 1% → Slack #alerts (urgent)
- [ ] Set up release tracking (link errors to app versions)

**LogRocket Configuration:**
- [ ] Upgrade to LogRocket paid plan ($99/month, 10K sessions)
- [ ] Configure session recording in production
- [ ] Mask sensitive fields (passwords, auth tokens, PII)
- [ ] Set up user identification (log user ID after auth)

**Cost Monitoring:**
- [ ] Create dashboard to track monthly costs:
  - Railway (backend compute)
  - Supabase (database + storage)
  - OpenAI + Anthropic (AI API calls)
  - AssemblyAI (voice transcription)
  - Google AI (image analysis)
- [ ] Set budget alerts ($100/day = $3,000/month threshold)

**Uptime Monitoring:**
- [ ] Set up UptimeRobot (free) to ping `/health` every 5 minutes
- [ ] Alert on downtime > 2 minutes

**Technical Notes:**
- Sentry integration already defined in Epic 0.5 (Observability)
- LogRocket integration already defined in Epic 0.5 (Observability)
- Cost dashboard can use Supabase + simple web UI

**Story Points:** 3

**Dependencies:**
- Requires: US-9.1 (production backend exists)
- Unblocks: Proactive incident detection

---

### US-9.9: App Store Submission

**Priority:** M (Must Have)

**As a** product manager
**I want to** submit the final Weave app to App Store review
**So that** we can launch publicly on the iOS App Store

**Acceptance Criteria:**

**Pre-Submission Checklist:**
- [ ] All Epic 0-8 features complete and tested
- [ ] Beta testing complete (zero P0 bugs, <5 P1 bugs)
- [ ] Privacy policy and ToS published and linked in app
- [ ] Subscription IAP configured and tested
- [ ] App Store metadata complete (screenshots, description, keywords)
- [ ] Production backend deployed and stable (>99% uptime during beta)

**Final Build:**
- [ ] Generate production IPA: `eas build --platform ios --profile production`
- [ ] Test final build on 3+ physical devices (iPhone 12, 13, 14+)
- [ ] Verify no dev-only features enabled (no TestFlight badge, no debug logs)

**Submission:**
- [ ] Upload final IPA to App Store Connect
- [ ] Select build for App Store release
- [ ] Fill out App Store Review Information:
  - Demo account credentials (for Apple reviewers)
  - Notes about AI features (explain Dream Self, Triad, etc.)
- [ ] Submit for review

**Review Process Management:**
- [ ] Monitor App Store Connect for review status (typically 1-3 days)
- [ ] Respond to Apple reviewer questions within 24 hours (if any)
- [ ] Address rejection reasons if rejected (common: crashes, missing features, privacy issues)

**Launch:**
- [ ] Once approved, release app to App Store
- [ ] Monitor Sentry for production errors (first 24 hours)
- [ ] Monitor user reviews (respond to negative reviews within 48 hours)
- [ ] **🎉 M4: Launch Milestone Achieved**

**Technical Notes:**
- App Store review typically takes 24-48 hours (can be longer during holidays)
- Rejection rate: ~40% of first submissions (prepare for iteration)
- Common rejection reasons: crashes, unclear IAP, privacy policy issues
- Keep demo account simple: email + password, pre-populated with sample data

**Story Points:** 8

**Dependencies:**
- Requires: ALL previous US-9.1 through US-9.8 complete
- Unblocks: Public launch, M4 milestone

---

## Epic 9 Summary

| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-9.1 | Production Backend Deployment | M | 5 pts |
| US-9.2 | Production Database Setup | M | 5 pts |
| US-9.3 | App Store Compliance | M | 8 pts |
| US-9.4 | App Store Readiness - Critical Gaps | M | 13 pts |
| US-9.5 | Subscription Management (IAP) | M | 8 pts |
| US-9.6 | Production Security Hardening | M | 5 pts |
| US-9.7 | TestFlight Beta Testing | M | 3 pts |
| US-9.8 | Production Monitoring Setup | M | 3 pts |
| US-9.9 | App Store Submission | M | 8 pts |

**Epic Total:** 58 story points

**Estimated Duration:** 2-3 sprints (assuming 20-25 points/sprint with parallel work)

**Dependencies:**
- Depends on: Epic 0 (Foundation), Epic 8 (Subscription UI in settings)
- Blocks: M4: Launch milestone

**Cost Impact:**
- **One-time:** $400-1,800 (Apple Developer, legal review, screenshots, icon)
- **Monthly recurring (MVP launch):**
  - Railway: ~$20-50/month (usage-based)
  - Supabase Pro: $25/month (production SLA)
  - Sentry: $0-26/month (free tier initially, Team plan at 200+ users)
  - LogRocket: $0-99/month (defer until post-launch recommended)
  - Apple Developer: $99/year ($8/month amortized)
  - AI Services: ~$225/month @ 100 users (OpenAI, Anthropic, Google AI, AssemblyAI)
- **Total at MVP: ~$278-408/month** (Supabase $25 + Railway $50 + AI $225 + Apple $8, deferring Sentry paid & LogRocket)
- **Total at 500 users: ~$650-1,125/month** (includes Sentry $26 + LogRocket $99 + AI $900)

**Cost Risk:** AI costs can spike; strict rate limiting (10 calls/hr/user) and budget alerts ($100/day) required

**Success Criteria:**
- [ ] App published on iOS App Store (live for public download)
- [ ] Zero P0 bugs in production (no crashes on core flows)
- [ ] Production monitoring active (Sentry, LogRocket, UptimeRobot)
- [ ] Subscription purchases working end-to-end
- [ ] M4: Launch milestone achieved 🎉

---

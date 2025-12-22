# Sprint Change Proposal: Epic 9 - Production Launch & App Store Publishing

**Date:** 2025-12-22
**Author:** BMad Correct Course Workflow
**Scope:** Major - New Epic Addition
**Status:** Pending Approval
**Timeline Impact:** +2-3 weeks (can overlap with Epic 7-8)

---

## 1. Issue Summary

### **Problem Statement**

**Missing Epic:** The current PRD (Epics 0-8) does not include **App Store Publishing and Production Readiness**. While the Release Plan mentions "App Store submission" in Phase 6, there are no concrete stories, acceptance criteria, or implementation tasks defined.

### **Discovery Context**

- **When:** Sprint planning session on 2025-12-22
- **How:** User identified gap while preparing for imminent launch ("releasing in a few days")
- **Evidence:** No existing stories for:
  - Production backend deployment (Railway)
  - Production database setup (Supabase production instance)
  - App Store compliance (privacy policy, terms of service, App Store guidelines)
  - Subscription management (Apple In-App Purchases / RevenueCat)
  - Production security hardening
  - Production testing and QA
  - Monitoring and error tracking setup
  - App Store assets and metadata

### **Impact**

**BLOCKS LAUNCH:** Cannot publish to App Store without completing these requirements. This is not optional work - it's mandatory for any iOS app release.

---

## 2. Impact Analysis

### **2.1 Epic Impact**

| Epic | Status | Modification Needed |
|------|--------|---------------------|
| Epic 0: Foundation | ✅ Complete | None - remains unchanged |
| Epic 1: Onboarding | 🚧 In Progress | None - continues as planned |
| Epic 2: Goal Management | 📅 Planned | None - continues as planned |
| Epic 3: Daily Actions | 📅 Planned | None - continues as planned |
| Epic 4: Reflection | 📅 Planned | None - continues as planned |
| Epic 5: Progress Viz | 📅 Planned | None - continues as planned |
| Epic 6: AI Coaching | 📅 Planned | None - continues as planned |
| Epic 7: Notifications | 📅 Planned | None - continues as planned |
| Epic 8: Settings | 📅 Planned | None - continues as planned |
| **Epic 9: Production Launch** | ❌ **MISSING** | **ADD NEW EPIC** |

**Epic 9 Position:** Final epic (after Epic 8) - serves as gate before M4: Launch milestone

**Epic 9 Dependency Chain:**
- Depends on: Epic 0 (Foundation), Epic 8 (Settings - subscription UI)
- Blocks: M4: Launch milestone (cannot publish without Epic 9)
- Can parallelize with: Epic 7, Epic 8 (DevOps work can start early)

### **2.2 Artifact Conflicts**

#### **PRD Documents**

| Artifact | Current State | Modification Needed |
|----------|---------------|---------------------|
| `docs/prd/functional-requirements.md` | Epic 0-8 only | Add Epic 9 reference |
| `docs/prd/functional-requirements-summary.md` | 252 story points (Epic 0-8) | Add Epic 9 story points (~45 pts) |
| `docs/prd/index.md` | Epic 0-8 in TOC | Add Epic 9 entry |
| **NEW:** `docs/prd/epic-9-production-launch.md` | ❌ Does not exist | **CREATE NEW FILE** |

#### **Architecture Documents**

| Artifact | Current State | Modification Needed |
|----------|---------------|---------------------|
| `docs/architecture/core-architectural-decisions.md` | Dev/staging mentioned | Add "Production Deployment" section |
| **NEW:** Production deployment section | ❌ Does not exist | Document Railway production config |
| **NEW:** Supabase production setup | ❌ Does not exist | Document database migration strategy |
| **NEW:** Environment variables | Partial documentation | Complete production env vars list |

#### **Release Plan**

| Artifact | Current State | Modification Needed |
|----------|---------------|---------------------|
| `docs/prd/release-plan.md` | Phase 6: "App Store submission" (1 bullet) | Expand with concrete tasks |

#### **Story Files**

| Artifact | Current State | Modification Needed |
|----------|---------------|---------------------|
| `docs/stories/epic-9/` directory | ❌ Does not exist | **CREATE 8 NEW STORY FILES** |

### **2.3 Technical Impact**

**Production Infrastructure (Not Yet Implemented):**
- ❌ Railway production environment (backend deployment)
- ❌ Supabase production instance (database + auth + storage)
- ❌ Environment variable management (secrets, API keys)
- ❌ CDN configuration (if needed for static assets)
- ❌ Domain setup and SSL certificates

**Apple Compliance (Not Yet Addressed):**
- ❌ Privacy Policy (required by App Store guidelines)
- ❌ Terms of Service (required for user account creation)
- ❌ App Store Connect account setup
- ❌ App Store metadata (description, screenshots, keywords)
- ❌ App Store review guidelines compliance check

**Subscription Management (Not Yet Implemented):**
- ❌ Apple In-App Purchase integration (StoreKit 2)
- ❌ RevenueCat SDK integration (recommended for subscription management)
- ❌ Subscription tiers configuration (Free trial, Pro, Max)
- ❌ Receipt validation (server-side)

**Production Security (Hardening Needed):**
- ⚠️ RLS policies exist (Story 0.4) but need production audit
- ❌ Rate limiting middleware (API protection)
- ❌ Input validation audit (SQL injection, XSS prevention)
- ❌ API key rotation strategy
- ❌ Secrets management (not in version control)

**Production Testing (Not Yet Planned):**
- ❌ TestFlight beta testing (Apple's beta distribution)
- ❌ Load testing (simulate 100+ concurrent users)
- ❌ Security penetration testing
- ❌ End-to-end smoke tests in production environment

**Monitoring & Observability (Partially Complete):**
- ✅ Sentry integration defined (Epic 0.5: Observability)
- ✅ LogRocket integration defined (Epic 0.5: Observability)
- ❌ Production alerting configuration (error thresholds, uptime monitoring)
- ❌ Cost monitoring dashboard (track AI/storage/compute costs)

---

## 3. Recommended Approach

### **Decision: Option 1 - Direct Adjustment (Add New Epic 9)**

**Approach:** Create Epic 9: Production Launch & App Store Publishing as a new epic with 8 stories covering all aspects of production readiness.

### **Rationale**

**Why This Approach:**

1. **✅ Additive Only:** Does not modify existing Epic 0-8 (no rework, no scope change)
2. **✅ Clear Scope:** Production requirements are well-defined industry standards
3. **✅ Low Risk:** Standard DevOps/deployment practices (not experimental)
4. **✅ Parallelizable:** Can start Epic 9 work (DevOps setup) while finishing Epic 7-8 features
5. **✅ Maintains MVP:** Core features (Epic 0-8) remain unchanged
6. **✅ Standard Practice:** All production apps require these steps (not unique to Weave)

**Why Not Option 2 (Rollback) or Option 3 (MVP Review):**
- ❌ **Option 2 (Rollback):** No completed work needs to be reverted - this is new work
- ❌ **Option 3 (MVP Review):** Cannot reduce MVP scope - publishing is mandatory, not optional

### **Effort Estimate**

| Epic 9 Story | Est. Story Points | Rationale |
|--------------|-------------------|-----------|
| US-9.1: Production Backend Deployment | 5 pts | Railway setup, env vars, CI/CD integration |
| US-9.2: Production Database Setup | 5 pts | Supabase production, migrations, backups |
| US-9.3: App Store Compliance | 8 pts | Privacy policy, ToS, legal review, App Store metadata |
| US-9.4: Subscription Management (IAP) | 8 pts | RevenueCat integration, StoreKit 2, receipt validation |
| US-9.5: Production Security Hardening | 5 pts | Rate limiting, secrets management, security audit |
| US-9.6: TestFlight Beta Testing | 3 pts | Beta build, TestFlight setup, user feedback collection |
| US-9.7: Production Monitoring Setup | 3 pts | Sentry/LogRocket production config, alerting |
| US-9.8: App Store Submission | 8 pts | Final build, submission, review process management |
| **Total** | **45 pts** | **2-3 sprints (assuming 15-20 pts/sprint)** |

### **Timeline Impact**

**Original Timeline (Without Epic 9):**
- Weeks 1-22: Epic 0-8 (feature development)
- Week 23-26: Phase 6 (polish + "submission")
- **Total:** 26 weeks

**Revised Timeline (With Epic 9):**
- Weeks 1-22: Epic 0-8 (feature development) - **UNCHANGED**
- **Weeks 19-22: Epic 9 stories 9.1-9.3 (parallelize with Epic 7-8)** - **NEW**
- **Weeks 23-25: Epic 9 stories 9.4-9.8 (production readiness)** - **NEW**
- Week 26: M4: Launch
- **Total:** 26 weeks (same end date, but with production work explicitly planned)

**Key Insight:** Epic 9 can START during Epic 7-8 work (DevOps setup doesn't block feature development). Total duration remains 26 weeks, but now production work is explicit.

### **Risk Assessment**

| Risk | Probability | Mitigation |
|------|-------------|------------|
| App Store rejection | Medium | Follow guidelines checklist, legal review |
| Production deployment issues | Low | Use Railway (managed platform), test in staging first |
| IAP integration complexity | Medium | Use RevenueCat (abstracts StoreKit complexity) |
| TestFlight feedback delays | Low | Run internal beta first (team + friends) |
| Timeline slippage | Low | Start Epic 9 early (Week 19), parallelize with Epic 7-8 |

---

## 4. Detailed Change Proposals

### **4.1 PRD Changes**

#### **Change Proposal 1: Create Epic 9 PRD Section**

**File:** `docs/prd/epic-9-production-launch.md` (NEW FILE)

**Action:** CREATE

**Content:** (See full epic definition in Section 5 below)

**Rationale:** Epic 9 must be documented with same detail as Epic 0-8 for implementation clarity.

---

#### **Change Proposal 2: Update Functional Requirements Summary**

**File:** `docs/prd/functional-requirements-summary.md`

**Section:** Total Story Points by Epic

**OLD:**
```markdown
| Epic | Description | M Points | S Points | C Points | Total |
|------|-------------|----------|----------|----------|-------|
| E0 | Foundation | 40 | 0 | 0 | 40 |
| E1 | Onboarding (Hybrid Flow) | 40 | 11 | 0 | 51 |
| E2 | Goal Management | 24 | 0 | 0 | 24 |
| E3 | Daily Actions & Proof | 18 | 0 | 0 | 18 |
| E4 | Reflection & Journaling | 19 | 9 | 0 | 28 |
| E5 | Progress Visualization | 18 | 8 | 0 | 26 |
| E6 | AI Coaching | 13 | 11 | 0 | 24 |
| E7 | Notifications | 23 | 0 | 0 | 23 |
| E8 | Settings & Profile | 18 | 0 | 0 | 18 |
| **Total** | | **213** | **39** | **0** | **252** |
```

**NEW:**
```markdown
| Epic | Description | M Points | S Points | C Points | Total |
|------|-------------|----------|----------|----------|-------|
| E0 | Foundation | 40 | 0 | 0 | 40 |
| E1 | Onboarding (Hybrid Flow) | 40 | 11 | 0 | 51 |
| E2 | Goal Management | 24 | 0 | 0 | 24 |
| E3 | Daily Actions & Proof | 18 | 0 | 0 | 18 |
| E4 | Reflection & Journaling | 19 | 9 | 0 | 28 |
| E5 | Progress Visualization | 18 | 8 | 0 | 26 |
| E6 | AI Coaching | 13 | 11 | 0 | 24 |
| E7 | Notifications | 23 | 0 | 0 | 23 |
| E8 | Settings & Profile | 18 | 0 | 0 | 18 |
| **E9** | **Production Launch & App Store** | **45** | **0** | **0** | **45** |
| **Total** | | **258** | **39** | **0** | **297** |
```

**Rationale:** Update total story points to reflect Epic 9 addition (+45 pts).

---

#### **Change Proposal 3: Update PRD Index**

**File:** `docs/prd/index.md`

**Section:** Table of Contents (after Epic 8)

**OLD:**
```markdown
  - [Epic 8: Settings & Profile](./epic-8-settings-profile.md)
    - [Overview](./epic-8-settings-profile.md#overview)
    - [User Stories](./epic-8-settings-profile.md#user-stories)
    ...
  - [Functional Requirements Summary](./functional-requirements-summary.md)
```

**NEW:**
```markdown
  - [Epic 8: Settings & Profile](./epic-8-settings-profile.md)
    - [Overview](./epic-8-settings-profile.md#overview)
    - [User Stories](./epic-8-settings-profile.md#user-stories)
    ...
  - [Epic 9: Production Launch & App Store Publishing](./epic-9-production-launch.md)
    - [Overview](./epic-9-production-launch.md#overview)
    - [User Stories](./epic-9-production-launch.md#user-stories)
      - [US-9.1: Production Backend Deployment](./epic-9-production-launch.md#us-91-production-backend-deployment)
      - [US-9.2: Production Database Setup](./epic-9-production-launch.md#us-92-production-database-setup)
      - [US-9.3: App Store Compliance](./epic-9-production-launch.md#us-93-app-store-compliance)
      - [US-9.4: Subscription Management (IAP)](./epic-9-production-launch.md#us-94-subscription-management-iap)
      - [US-9.5: Production Security Hardening](./epic-9-production-launch.md#us-95-production-security-hardening)
      - [US-9.6: TestFlight Beta Testing](./epic-9-production-launch.md#us-96-testflight-beta-testing)
      - [US-9.7: Production Monitoring Setup](./epic-9-production-launch.md#us-97-production-monitoring-setup)
      - [US-9.8: App Store Submission](./epic-9-production-launch.md#us-98-app-store-submission)
    - [Epic 9 Summary](./epic-9-production-launch.md#epic-9-summary)
  - [Functional Requirements Summary](./functional-requirements-summary.md)
```

**Rationale:** Add Epic 9 to PRD navigation structure.

---

### **4.2 Architecture Changes**

#### **Change Proposal 4: Add Production Deployment Section**

**File:** `docs/architecture/core-architectural-decisions.md`

**Section:** (NEW) Production Deployment Architecture

**Action:** APPEND

**Content:**
```markdown
---

## Production Deployment Architecture

**Purpose:** Document production infrastructure configuration for backend (Railway), database (Supabase), and monitoring services.

### Backend Deployment (Railway)

**Platform:** Railway.app (managed Node.js/Python hosting)

**Configuration:**
- **Project:** weave-api-production
- **Service:** FastAPI backend
- **Region:** us-west-1 (low latency for US users)
- **Instance:** Shared vCPU, 512MB RAM (scale to 1GB if needed)
- **Auto-scaling:** Enabled (max 3 instances)

**Environment Variables (Production):**
```bash
# Database
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx  # Server-side only (never expose to client)
DATABASE_URL=postgresql://xxx

# AI Providers
OPENAI_API_KEY=sk-proj-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
GOOGLE_AI_API_KEY=xxx  # Gemini

# Auth
JWT_SECRET=xxx  # 256-bit random string
JWT_ALGORITHM=HS256

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
LOGROCKET_APP_ID=weave/production

# Environment
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO
```

**Deployment Strategy:**
- **CI/CD:** GitHub Actions triggers Railway deploy on push to `main`
- **Health Check:** `GET /health` endpoint (200 = healthy)
- **Rollback:** Railway auto-rollback on failed health check

---

### Database (Supabase Production)

**Instance:** Supabase Production Project (dedicated)

**Configuration:**
- **Region:** us-west-1 (same as Railway for low latency)
- **Plan:** Pro Plan ($25/month) - required for production SLA
- **Database:** PostgreSQL 15
- **Connection Pooling:** Enabled (PgBouncer)

**Migration Strategy:**
```bash
# Run migrations via Supabase CLI
npx supabase db push --db-url $DATABASE_URL

# Verify migration success
npx supabase db diff --linked
```

**Backup Strategy:**
- **Automatic:** Daily backups (Supabase Pro Plan)
- **Retention:** 7 days
- **Manual Backup:** Run before major migrations

---

### Monitoring & Observability

**Sentry (Error Tracking):**
- **Project:** weave-mobile, weave-api
- **Alert Rules:**
  - Error rate > 1% of sessions → Slack #alerts
  - API response time > 5s → Email engineering@
- **Integration:** See Epic 0.5 (Observability) for setup

**LogRocket (Session Replay):**
- **Project:** weave/production
- **Usage:** Debug user issues, watch session recordings
- **Privacy:** Mask password fields, auth tokens
- **Integration:** See Epic 0.5 (Observability) for setup

---

### CDN & Static Assets

**Not Required for MVP:**
- Expo serves mobile app bundle
- Supabase Storage serves images/audio (built-in CDN)
- No separate CDN needed

---
```

**Rationale:** Production deployment architecture was missing from original docs. This documents how to deploy and manage production infrastructure.

---

### **4.3 Release Plan Changes**

#### **Change Proposal 5: Expand Phase 6 with Concrete Tasks**

**File:** `docs/prd/release-plan.md`

**Section:** Phase 6: Polish & Launch (Weeks 23-26)

**OLD:**
```markdown
## Phase 6: Polish & Launch (Weeks 23-26)

**Epics:** E8 (Settings), Testing, Launch

**Deliverables:**
- Settings and profile
- Subscription management (IAP)
- Bug fixes and polish
- Performance optimization
- App Store submission
- Beta launch
```

**NEW:**
```markdown
## Phase 6: Polish & Launch (Weeks 23-26)

**Epics:** E8 (Settings), E9 (Production Launch), Testing, Launch

**Week 23: Production Setup**
- [x] Deploy backend to Railway production (Story 9.1)
- [x] Configure Supabase production instance (Story 9.2)
- [x] Set up production monitoring (Story 9.7)
- [x] Run security audit (Story 9.5)

**Week 24: App Store Compliance**
- [x] Finalize privacy policy and terms of service (Story 9.3)
- [x] Create App Store Connect account and metadata (Story 9.3)
- [x] Integrate Apple In-App Purchases (Story 9.4)
- [x] Generate App Store screenshots and preview video (Story 9.3)

**Week 25: Beta Testing & Submission**
- [x] Build production IPA and upload to TestFlight (Story 9.6)
- [x] Invite 20-50 beta testers (internal + external)
- [x] Collect feedback and fix critical bugs
- [x] Submit final build to App Store review (Story 9.8)

**Week 26: Launch**
- [x] App Store review approval (typically 1-3 days)
- [x] Release app to App Store
- [x] Monitor production metrics (errors, performance, crashes)
- [x] **M4: Launch Milestone Achieved** 🎉
```

**Rationale:** Replace vague "App Store submission" with concrete week-by-week tasks tied to Epic 9 stories.

---

## 5. Epic 9 Definition (Complete)

### **Epic 9: Production Launch & App Store Publishing**

**Overview:** Deploy the Weave MVP to production infrastructure (Railway + Supabase), comply with Apple App Store guidelines, integrate subscription payments, and successfully publish the app to the iOS App Store.

**Priority:** M (Must Have) - **BLOCKS LAUNCH**

**Dependencies:**
- **Depends on:** Epic 0 (Foundation), Epic 8 (Settings - subscription UI)
- **Blocks:** M4: Launch milestone

**Story Breakdown:**

---

#### **US-9.1: Production Backend Deployment**

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

**Story Points:** 5

---

#### **US-9.2: Production Database Setup**

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

**Story Points:** 5

---

#### **US-9.3: App Store Compliance**

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

**Story Points:** 8

---

#### **US-9.4: Subscription Management (Apple In-App Purchases)**

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

**Story Points:** 8

---

#### **US-9.5: Production Security Hardening**

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

**Story Points:** 5

---

#### **US-9.6: TestFlight Beta Testing**

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

**Story Points:** 3

---

#### **US-9.7: Production Monitoring Setup**

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

---

#### **US-9.8: App Store Submission**

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

**Story Points:** 8

---

### **Epic 9 Summary**

| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-9.1 | Production Backend Deployment | M | 5 pts |
| US-9.2 | Production Database Setup | M | 5 pts |
| US-9.3 | App Store Compliance | M | 8 pts |
| US-9.4 | Subscription Management (IAP) | M | 8 pts |
| US-9.5 | Production Security Hardening | M | 5 pts |
| US-9.6 | TestFlight Beta Testing | M | 3 pts |
| US-9.7 | Production Monitoring Setup | M | 3 pts |
| US-9.8 | App Store Submission | M | 8 pts |

**Epic Total:** 45 story points

**Dependencies:**
- Depends on: Epic 0 (Foundation), Epic 8 (Subscription UI in settings)
- Blocks: M4: Launch milestone

**Cost Impact:**
- Railway production: ~$20-50/month (depends on usage)
- Supabase Pro Plan: $25/month
- Apple Developer: $99/year
- RevenueCat: Free up to $10K MRR
- LogRocket: $99/month (10K sessions)
- Sentry: $26/month (50K errors) or free tier (5K errors)
- **Total: ~$200-250/month** (excluding AI costs already budgeted)

---

## 6. Implementation Handoff

### **Change Scope Classification: Moderate**

**Justification:**
- ✅ **Not Minor:** Cannot be implemented by dev team alone (requires legal review, Apple account setup, payment integration)
- ✅ **Not Major:** Does not require PM/Architect for fundamental replan (clear scope, standard practices)
- ✅ **Moderate:** Requires PO/SM coordination for backlog reorganization and cross-functional work (DevOps, Legal, QA)

### **Handoff Recipients**

#### **Primary: Product Owner / Scrum Master**

**Responsibilities:**
1. **Backlog Management:**
   - Add Epic 9 to product backlog
   - Create 8 story tickets (US-9.1 through US-9.8) in project management tool (Jira/Linear/GitHub Projects)
   - Prioritize Epic 9 stories (can start 9.1, 9.2, 9.7 during Epic 7-8)

2. **Dependency Coordination:**
   - Identify which Epic 7-8 stories can parallelize with Epic 9
   - Schedule Epic 9 stories to start Week 19 (alongside Epic 7)

3. **Cross-Functional Coordination:**
   - Legal: Schedule review of privacy policy and ToS (Story 9.3)
   - Finance: Approve subscription pricing and Apple Developer account fee
   - Marketing: Prepare App Store screenshots and description (Story 9.3)

4. **Sprint Planning:**
   - Allocate Sprint 12-13 (Weeks 23-25) for Epic 9 completion
   - Reserve Sprint 14 (Week 26) for launch activities

#### **Secondary: Development Team**

**Responsibilities:**
1. **Implementation:**
   - Execute Epic 9 stories as prioritized by PO
   - Follow acceptance criteria for each story
   - Document production runbook (deployment, rollback, troubleshooting)

2. **DevOps Setup:**
   - Configure Railway and Supabase production instances (Story 9.1, 9.2)
   - Set up CI/CD pipeline for production deployments
   - Configure monitoring and alerting (Story 9.7)

3. **Testing:**
   - Run security audit (Story 9.5)
   - Conduct TestFlight beta testing (Story 9.6)
   - Fix bugs identified during beta

#### **Tertiary: Legal/Compliance (External)**

**Responsibilities:**
1. **Legal Review:**
   - Review draft privacy policy and ToS (Story 9.3)
   - Provide feedback on GDPR and COPPA compliance
   - Approve final versions for publication

**Note:** Can use attorney or LegalZoom template ($300-500) if in-house legal unavailable.

### **Success Criteria**

**Epic 9 Complete When:**
- [ ] All 8 stories (US-9.1 through US-9.8) marked "Done"
- [ ] App published on iOS App Store (live for public download)
- [ ] Zero P0 bugs in production (no crashes on core flows)
- [ ] Production monitoring active (Sentry, LogRocket, UptimeRobot)
- [ ] Subscription purchases working end-to-end (test with real credit card)
- [ ] M4: Launch milestone achieved 🎉

**Timeline Success:**
- [ ] Epic 9 completed by Week 25 (as scheduled)
- [ ] App Store approval received by Week 26
- [ ] Public launch on target date (Week 26, end of Phase 6)

---

## 7. Next Steps

### **Immediate Actions (This Week)**

1. **✅ User Approval:** Jack approves this Sprint Change Proposal
2. **✅ Create Epic 9 PRD File:** Write `docs/prd/epic-9-production-launch.md` (use content from Section 5)
3. **✅ Update PRD Files:** Apply changes from Section 4.1 (update summary, index)
4. **✅ Update Architecture Docs:** Add production deployment section (Section 4.2)
5. **✅ Create Story Files:** Create 8 story files in `docs/stories/epic-9/` directory

### **Sprint Planning (Next Sprint)**

1. **Add Epic 9 to Backlog:** Create 8 tickets (US-9.1 through US-9.8)
2. **Schedule Early Start:** Plan to start Story 9.1, 9.2, 9.7 in Sprint 10 (Week 19, alongside Epic 7)
3. **Coordinate Dependencies:** Identify Epic 7-8 stories that can parallelize with Epic 9

### **Week 19-22 (Parallel Execution)**

- **Epic 7-8 Work:** Continue feature development (notifications, settings)
- **Epic 9 DevOps:** Start production setup (Railway, Supabase, monitoring)

### **Week 23-25 (Epic 9 Focus)**

- **Week 23:** Production deployment, security audit
- **Week 24:** App Store compliance, IAP integration
- **Week 25:** TestFlight beta, app submission

### **Week 26 (Launch)**

- **Monitor review:** App Store review approval (typically 1-3 days)
- **Release:** Publish app to App Store
- **🎉 M4: Launch Milestone Achieved**

---

## 8. Appendix: Risk Mitigation

### **Risk: App Store Rejection**

**Probability:** Medium (40% of first submissions get rejected)

**Mitigation:**
- ✅ Follow App Store Review Guidelines checklist (Story 9.3)
- ✅ Use legal-reviewed privacy policy and ToS
- ✅ Provide clear demo account and notes for Apple reviewers
- ✅ Respond to reviewer questions within 24 hours
- ✅ Budget 3-5 days for potential resubmission

### **Risk: IAP Integration Complexity**

**Probability:** Medium (StoreKit is complex)

**Mitigation:**
- ✅ **Recommended:** Use RevenueCat (abstracts complexity)
- ✅ Test extensively in App Store sandbox
- ✅ Follow RevenueCat documentation and examples
- ✅ Budget 8 story points (1 sprint) for IAP work

### **Risk: Production Deployment Issues**

**Probability:** Low (Railway is managed platform)

**Mitigation:**
- ✅ Test in staging environment first
- ✅ Use Railway health checks and auto-rollback
- ✅ Document rollback procedure in runbook
- ✅ Monitor Sentry for production errors

### **Risk: Timeline Slippage**

**Probability:** Low (Epic 9 can parallelize)

**Mitigation:**
- ✅ Start Epic 9 early (Week 19 vs Week 23)
- ✅ Parallelize DevOps work with Epic 7-8 features
- ✅ Reserve Week 26 as buffer for resubmission

---

## 9. Approval

**Proposed By:** BMad Correct Course Workflow
**Date:** 2025-12-22

**Approval Required From:**
- [ ] Jack (Product Owner)

**Once Approved:**
1. Create Epic 9 PRD file
2. Update PRD summary and index
3. Add production deployment to architecture docs
4. Create 8 story files for Epic 9
5. Add Epic 9 stories to backlog
6. Schedule Epic 9 work in Sprint 10-13

---

**✅ Sprint Change Proposal Complete**

**Next Action:** Jack, please review this proposal and approve/request revisions. Once approved, I'll create all the necessary files and update the documentation.

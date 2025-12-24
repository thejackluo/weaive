# ✅ Production Readiness Checklist

**Purpose:** Comprehensive checklist to verify Weave is production-ready before public launch.

**Status:** 🔄 In Progress (Story 9.1 complete, Stories 9.2-9.8 pending)

---

## How to Use This Checklist

1. **Review before EVERY production deployment** (not just initial launch)
2. **Sign off on each section** - Add initials + date when complete
3. **Block deployment if any critical item fails** - Mark critical items with ⚠️
4. **Document exceptions** - If skipping an item, document why

**Sign-Off Format:**
```
- [x] Item description ✅ [Initials] [Date]
- [ ] Item not done yet
- [~] Item skipped (with reason documented below)
```

---

## 1️⃣ Code Quality & Testing

### Backend Tests (weave-api/)
- [ ] ⚠️ All pytest tests pass: `uv run pytest tests/ -v`
- [ ] ⚠️ Test coverage >= 80% for critical paths
- [ ] Deployment tests pass (25+ tests): `uv run pytest tests/deployment/ -v`
- [ ] RLS security tests pass (48 tests): `npx supabase test db`
- [ ] No test warnings in critical modules
- [ ] All skipped tests documented with reason

**Verification Command:**
```bash
cd weave-api
uv run pytest tests/ -v --cov=app --cov-report=term-missing
# Expected: >=80% coverage, 0 failures
```

### Mobile Tests (weave-mobile/)
- [ ] ⚠️ All Jest tests pass: `npm test`
- [ ] TypeScript compilation succeeds: `npx tsc --noEmit`
- [ ] Linting passes (no errors): `npm run lint`
- [ ] Build succeeds: `npx expo export --platform ios`
- [ ] No console errors in dev mode

**Verification Command:**
```bash
cd weave-mobile
npm test -- --coverage --watchAll=false
npx tsc --noEmit
npm run lint
```

### Code Quality
- [ ] All code reviewed and approved
- [ ] No `TODO` or `FIXME` comments in critical paths
- [ ] No hardcoded secrets or API keys
- [ ] All environment variables documented
- [ ] No debug logging in production code

---

## 2️⃣ Security & Authentication

### Row Level Security (RLS)
- [ ] ⚠️ RLS enabled on ALL 12 user-owned tables
- [ ] ⚠️ RLS penetration tests pass: `python scripts/test_rls_security.py`
- [ ] All RLS policies use correct `auth.uid()::text` casting
- [ ] Immutable tables (subtask_completions) have no UPDATE/DELETE policies
- [ ] Cross-user access blocked (verified by automated tests)

**Tables with RLS (12 total):**
- [ ] user_profiles
- [ ] identity_docs
- [ ] goals
- [ ] subtask_templates
- [ ] subtask_instances
- [ ] subtask_completions (SELECT + INSERT only)
- [ ] captures
- [ ] journal_entries
- [ ] daily_aggregates
- [ ] triad_tasks
- [ ] ai_runs
- [ ] ai_artifacts

### Authentication & Secrets
- [ ] ⚠️ JWT_SECRET is strong (256-bit entropy)
- [ ] ⚠️ JWT_SECRET unique per environment (staging ≠ production)
- [ ] Supabase service role key secured (not in code)
- [ ] AWS Bedrock credentials configured (Story 9.1)
- [ ] API keys valid and not expired
- [ ] No secrets in Git history

### Security Configuration
- [ ] ⚠️ DEBUG=false in production
- [ ] ⚠️ ENVIRONMENT=production set
- [ ] CORS configured (only allow app origins)
- [ ] Rate limiting enabled:
  - [ ] AI calls: 10/hour per user
  - [ ] File uploads: 50/day per user
  - [ ] Completions: 100/day per user
- [ ] Input validation on all endpoints (Pydantic models)
- [ ] File upload limits: 10MB max, JPEG/PNG/MP3 only

**Verification Command:**
```bash
cd weave-api
uv run pytest tests/deployment/test_production_security.py -v
# Expected: All 4 security tests pass
```

---

## 3️⃣ Infrastructure & Deployment

### Railway Configuration
- [ ] ⚠️ Production project created (`weave-api-production`)
- [ ] Health check endpoint responds: `curl https://weave-api-production.railway.app/health`
- [ ] Railway environment variables set (15 variables)
- [ ] GitHub secrets configured (RAILWAY_TOKEN, RAILWAY_PROJECT_ID)
- [ ] CI/CD workflow tested (push to main triggers deploy)
- [ ] Rollback tested successfully

### Environment Variables (15 required)
- [ ] SUPABASE_URL
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] DATABASE_URL
- [ ] AWS_REGION
- [ ] AWS_ACCESS_KEY_ID
- [ ] AWS_SECRET_ACCESS_KEY
- [ ] OPENAI_API_KEY
- [ ] ANTHROPIC_API_KEY
- [ ] GOOGLE_AI_API_KEY
- [ ] JWT_SECRET
- [ ] JWT_ALGORITHM
- [ ] SENTRY_DSN
- [ ] LOGROCKET_APP_ID
- [ ] ENVIRONMENT
- [ ] DEBUG

**Verification Command:**
```bash
railway variables | grep -E "SUPABASE_URL|JWT_SECRET|ENVIRONMENT"
# Expected: All 15 variables present
```

### Health Checks & Monitoring
- [ ] `/health` endpoint returns 200 OK
- [ ] Health check verifies database connection
- [ ] Sentry error tracking configured
- [ ] LogRocket session replay configured
- [ ] Railway health check timeout: 100 seconds
- [ ] Restart policy: ON_FAILURE, max 10 retries

---

## 4️⃣ Database & Data Integrity

### Supabase Configuration
- [ ] ⚠️ Production Supabase project created (Story 9.2)
- [ ] All migrations applied successfully
- [ ] Database backup configured (Supabase automatic backups)
- [ ] Connection pooling enabled (if needed at scale)
- [ ] Database indexes optimized for queries

### Data Validation
- [ ] Append-only tables immutable (subtask_completions, captures, journal_entries)
- [ ] Soft delete implemented (user_profiles, goals)
- [ ] Foreign key constraints enforced
- [ ] Timestamp columns (created_at, updated_at) on all tables
- [ ] No orphaned records (verified by data integrity tests)

### Data Retention & Privacy
- [ ] Data retention policy documented
- [ ] User data deletion endpoint implemented (`DELETE /api/users/me`)
- [ ] Export user data endpoint implemented (`GET /api/users/me/export`)
- [ ] GDPR compliance verified (30-day data retention after deletion)

---

## 5️⃣ Performance & Scalability

### API Performance
- [ ] Health check responds in < 500ms
- [ ] Critical endpoints respond in < 2 seconds (95th percentile)
- [ ] Database queries optimized (no N+1 queries)
- [ ] AI call caching implemented (input_hash deduplication)
- [ ] Rate limiting prevents abuse

### Mobile App Performance
- [ ] App startup time < 3 seconds
- [ ] Navigation transitions smooth (60 FPS)
- [ ] Images lazy-loaded
- [ ] TanStack Query cache configured (5-minute stale time)
- [ ] No memory leaks (tested with React DevTools Profiler)

### Scalability Limits
- [ ] Railway auto-scaling configured (max 3 instances)
- [ ] Database connection limits documented
- [ ] AI budget limits enforced ($2,500/month for 10K users)
- [ ] Storage limits documented (Supabase free tier: 1GB)

---

## 6️⃣ Compliance & Legal

### Privacy Policy
- [ ] ⚠️ Privacy policy drafted and reviewed by legal
- [ ] Privacy policy accessible in app (`/settings/privacy`)
- [ ] Privacy policy URL added to App Store submission
- [ ] Privacy policy covers:
  - [ ] What data is collected
  - [ ] How data is used
  - [ ] Third-party services (OpenAI, Anthropic, AWS, Supabase)
  - [ ] Data retention policy
  - [ ] User rights (access, deletion, export)

### Terms of Service
- [ ] ⚠️ Terms of service drafted and reviewed by legal
- [ ] Terms of service accessible in app (`/settings/terms`)
- [ ] Terms of service URL added to App Store submission
- [ ] Terms cover:
  - [ ] User responsibilities
  - [ ] Prohibited uses
  - [ ] Liability limitations
  - [ ] Termination conditions

### User Consent
- [ ] User consent flow implemented on signup
- [ ] User can review and accept ToS
- [ ] User can review and accept Privacy Policy
- [ ] Consent logged in database (user_profiles.consent_accepted_at)
- [ ] User can withdraw consent (triggers account deletion)

### Data Protection (GDPR/CCPA)
- [ ] User can request data export (email with JSON file)
- [ ] User can request data deletion (30-day retention)
- [ ] Data breach notification procedure documented
- [ ] Data processing agreement with third parties (Supabase, OpenAI, etc.)

### Age Restrictions
- [ ] Age gate implemented (13+ required)
- [ ] User birth date collected and validated
- [ ] Parental consent flow (if targeting <13, otherwise block)
- [ ] Age restrictions documented in Privacy Policy

### App Store Compliance
- [ ] App Store Connect metadata complete
- [ ] Privacy nutrition label filled out
- [ ] Content rating questionnaire completed
- [ ] Export compliance reviewed (encryption, US export laws)
- [ ] Third-party SDK disclosures complete

---

## 7️⃣ Monitoring & Observability

### Error Tracking (Sentry)
- [ ] Sentry project created (`weave-production`)
- [ ] Sentry DSN configured in Railway
- [ ] Error alerts configured (Slack/email)
- [ ] Error grouping rules configured
- [ ] Source maps uploaded (for mobile stack traces)

### Session Replay (LogRocket)
- [ ] LogRocket app created (`weave/production`)
- [ ] LogRocket App ID configured in Railway
- [ ] Session replay enabled for critical user flows
- [ ] PII masking configured (passwords, tokens, emails)
- [ ] Recording sampling configured (e.g., 10% of sessions)

### Logging
- [ ] Production log level set to INFO
- [ ] Sensitive data NOT logged (passwords, tokens, secrets)
- [ ] Structured logging implemented (JSON format)
- [ ] Log retention configured (Railway default: 7 days)

### Metrics & Analytics
- [ ] PostHog analytics configured (defer to 500+ users)
- [ ] Key metrics tracked:
  - [ ] Daily active users (DAU)
  - [ ] Completion rate (binds completed per day)
  - [ ] Retention rate (7-day, 30-day)
  - [ ] AI API costs (tracked in ai_runs table)

---

## 8️⃣ Documentation & Knowledge Transfer

### User-Facing Documentation
- [ ] Onboarding tutorial complete
- [ ] Help center/FAQ accessible in app
- [ ] Support email configured (support@weave.app)
- [ ] Bug report flow implemented (in-app or email)

### Developer Documentation
- [ ] CLAUDE.md updated with production commands
- [ ] Production deployment manual complete
- [ ] Rollback procedures documented
- [ ] Incident response playbook created
- [ ] Architecture diagrams up to date

### Runbooks
- [ ] Production deployment runbook (PRODUCTION_DEPLOYMENT_MANUAL.md)
- [ ] Incident response runbook (docs/devops-strategy.md)
- [ ] Database migration runbook
- [ ] Rollback runbook (3 methods documented)

---

## 9️⃣ Business & Product Readiness

### Product Completeness
- [ ] All MVP features implemented (Stories 0.1-9.8)
- [ ] Critical user flows tested end-to-end:
  - [ ] Signup → Onboarding → First goal → First completion → First journal
- [ ] Edge cases handled (no active goals, all goals completed, etc.)
- [ ] Error states designed (no network, API errors, etc.)

### User Onboarding
- [ ] Onboarding flow complete (Epic 1)
- [ ] Welcome screen with vision hook
- [ ] Identity document creation
- [ ] First goal setup guidance
- [ ] Tutorial tooltips for key features

### Support & Communication
- [ ] Support email configured and monitored
- [ ] User feedback mechanism implemented
- [ ] Social media accounts created (Twitter, etc.)
- [ ] Status page configured (e.g., status.weave.app)

### Pricing & Monetization (Future)
- [ ] Pricing model defined (deferred to post-MVP)
- [ ] Payment integration (Stripe) - deferred
- [ ] Subscription management - deferred
- [ ] Free tier limits enforced (if applicable)

---

## 🔟 App Store Submission (Story 9.8)

### iOS App Store
- [ ] App Store Connect account created
- [ ] App metadata complete (title, description, keywords)
- [ ] Screenshots uploaded (6.5", 5.5" sizes)
- [ ] App icon finalized (1024x1024)
- [ ] Privacy policy URL provided
- [ ] Support URL provided
- [ ] Age rating completed
- [ ] Export compliance reviewed
- [ ] App binary uploaded via EAS Build
- [ ] TestFlight beta tested (min 5 testers)

### Google Play Store (Future)
- [ ] Google Play Console account created
- [ ] Store listing complete
- [ ] Feature graphic uploaded
- [ ] Privacy policy linked
- [ ] Target API level met (Android 13+)
- [ ] App bundle uploaded

---

## ✅ Final Sign-Off

**Before deployment, all critical items (⚠️) MUST be checked.**

### Sign-Off by Role

| Role | Name | Date | Signature |
|------|------|------|-----------|
| **Tech Lead** | | | |
| **Product Manager** | | | |
| **QA Lead** | | | |
| **Legal/Compliance** | | | |
| **DevOps/SRE** | | | |

### Exception Log

If any items are skipped, document here:

| Item | Reason | Approved By | Date | Risk Mitigation |
|------|--------|-------------|------|-----------------|
| | | | | |

---

## 📊 Readiness Score

**Formula:** (Completed Items / Total Items) × 100

**Current Score:** ___% (Target: 95%+ for production launch)

**Critical Items:** ___/__ complete (Target: 100%)

---

## 🚀 Post-Launch Checklist (First 48 Hours)

After deployment, monitor:

- [ ] Health check stable (no 503 errors)
- [ ] No critical errors in Sentry
- [ ] Database performance stable
- [ ] AI API costs within budget
- [ ] User signups functional
- [ ] Onboarding flow completing
- [ ] No security incidents
- [ ] Rollback tested in production

---

**Last Updated:** 2025-12-23
**Next Review:** Before every production deployment
**Owner:** Engineering Team

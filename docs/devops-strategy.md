# DevOps Strategy

**Project:** Weave - AI-Powered Identity Coach
**Version:** 1.0
**Date:** 2025-12-16
**Status:** Pre-MVP Planning
**Owner:** Engineering Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Infrastructure Architecture](#infrastructure-architecture)
3. [Environment Strategy](#environment-strategy)
4. [Deployment Pipeline](#deployment-pipeline)
5. [Database Management](#database-management)
6. [Secret Management](#secret-management)
7. [Monitoring & Observability](#monitoring--observability)
8. [Incident Response & Rollback](#incident-response--rollback)
9. [CI/CD Pipeline](#cicd-pipeline)
10. [Scaling Strategy](#scaling-strategy)
11. [Cost Management](#cost-management)
12. [DevOps Checklist](#devops-checklist)

---

## Executive Summary

### DevOps Philosophy

**Weave's DevOps strategy balances MVP speed with enterprise reliability:**

- **Week 0-4 (MVP):** Manual deployments, basic monitoring, staging + production
- **Month 2-3 (Alpha):** Automated CI/CD, comprehensive monitoring, blue-green deployments
- **Month 4+ (Scale):** Full automation, auto-scaling, advanced observability

### Current State

```yaml
Infrastructure:
  Backend: ❌ Not deployed
  Database: ❌ Not created
  Mobile App: ❌ Not built
  CI/CD: ❌ Not configured
  Monitoring: ❌ Not set up

Target State (Week 0):
  Backend: Railway (staging + production)
  Database: Supabase (separate projects for staging/prod)
  Mobile App: Expo EAS (TestFlight)
  CI/CD: GitHub Actions (basic linting + tests)
  Monitoring: Railway logs + Supabase dashboard
```

### Key Metrics

| Metric | MVP Target | Scale Target |
|--------|------------|--------------|
| **Deployment Frequency** | 1x/week | 5x/day |
| **Lead Time** | < 1 day | < 1 hour |
| **MTTR (Mean Time to Recovery)** | < 4 hours | < 15 minutes |
| **Change Failure Rate** | < 15% | < 5% |
| **Uptime SLA** | 95% | 99.5% |

---

## Infrastructure Architecture

### Technology Stack

```
┌─────────────────────────────────────────────────────┐
│                  Mobile App (iOS)                     │
│  React Native + Expo + TanStack Query + Zustand     │
└────────────────┬────────────────────────────────────┘
                 │
                 │ HTTPS/TLS 1.3
                 ▼
┌─────────────────────────────────────────────────────┐
│              Backend API (FastAPI)                   │
│  Railway (Staging + Production)                      │
│  Python 3.12 + FastAPI + Uvicorn                    │
└────────────┬───────────────┬────────────────────────┘
             │               │
             │               │
    ┌────────▼──────┐  ┌────▼─────────────┐
    │   Supabase    │  │   AI Providers   │
    │  PostgreSQL   │  │  OpenAI/Anthropic│
    │  Auth/Storage │  │                  │
    └───────────────┘  └──────────────────┘
```

### Infrastructure Components

| Component | Provider | Purpose | Cost (Estimate) |
|-----------|----------|---------|-----------------|
| **Backend Hosting** | Railway | FastAPI server, async workers | $20/month (Hobby), $20/month (Production) |
| **Database** | Supabase | PostgreSQL, Auth, Storage | Free (MVP), $25/month (Pro) |
| **Mobile Distribution** | Expo EAS | TestFlight builds, OTA updates | Free (100 builds/month) |
| **CDN/Static Assets** | Supabase Storage | User uploads (photos, audio) | Included in Supabase |
| **Job Queue** | Railway Redis | Background tasks (post-MVP) | $10/month |
| **Monitoring** | Railway Logs | Basic logging (MVP) | Included |
| **Error Tracking** | Sentry | Error monitoring (post-MVP) | Free tier (5k events/month) |
| **Analytics** | PostHog | User analytics (post-MVP) | Free tier (1M events/month) |

**Total Infrastructure Cost (MVP):** ~$40/month
**Total Infrastructure Cost (Production):** ~$95/month

---

## Environment Strategy

### Environment Definitions

```yaml
environments:
  development:
    purpose: "Local development on engineer's machine"
    backend_url: "http://localhost:8000"
    supabase: "Local Supabase CLI (optional)"
    mobile: "Expo Go"

  staging:
    purpose: "Integration testing, QA, demos"
    backend_url: "https://weave-api-staging.up.railway.app"
    supabase: "weave-staging (separate Supabase project)"
    mobile: "Expo EAS (internal distribution)"
    database: "Isolated from production"

  production:
    purpose: "Live app for real users"
    backend_url: "https://api.weave.app"
    supabase: "weave-production (separate Supabase project)"
    mobile: "App Store (TestFlight → Public)"
    database: "Production data (backups enabled)"
```

### Environment Parity

**Principle:** Staging should mirror production as closely as possible.

| Aspect | Development | Staging | Production |
|--------|-------------|---------|------------|
| **Backend** | Local (uvicorn) | Railway (same config) | Railway (same config) |
| **Database** | Local Supabase or remote staging | Supabase (Pro tier) | Supabase (Pro tier) |
| **AI Providers** | Stubbed or real API | Real API (low rate limits) | Real API (full rate limits) |
| **Environment Variables** | `.env.local` | Railway env vars | Railway env vars |
| **Data** | Seed data | Sanitized prod data | Real user data |
| **Monitoring** | Console logs | Railway logs | Railway logs + Sentry |

**Migration Path:**
- **Week 0:** Development + Production only
- **Week 2:** Add Staging environment
- **Month 2:** Full environment parity

---

## Deployment Pipeline

### MVP Deployment (Manual)

**Backend Deployment (Railway):**

```bash
# Connect Railway project
railway link weave-api-production

# Deploy to production
git push origin main  # Railway auto-deploys on push to main

# Manual deployment (if needed)
railway up
```

**Mobile Deployment (Expo EAS):**

```bash
# Build for TestFlight
eas build --platform ios --profile preview

# Submit to TestFlight
eas submit --platform ios --latest

# Over-the-air update (post-build)
eas update --branch production --message "Bug fixes"
```

**Database Deployment (Supabase Migrations):**

```bash
# Apply migrations to production
supabase db push --db-url $SUPABASE_PROD_URL

# OR manually via Supabase dashboard (SQL Editor)
# Copy-paste migration SQL files
```

### Automated Deployment (Month 2)

**GitHub Actions Pipeline:**

```yaml
# .github/workflows/deploy.yml

name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: |
          npm test  # Mobile tests
          pytest    # Backend tests
      - name: Lint
        run: |
          npm run lint
          ruff check .

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: weave-api-production

  deploy-mobile:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build iOS app
        run: eas build --platform ios --profile production --non-interactive
      - name: Submit to TestFlight
        run: eas submit --platform ios --latest
```

### Deployment Checklist

**Pre-Deployment:**
- [ ] All tests passing locally
- [ ] Code reviewed and approved
- [ ] Database migrations tested in staging
- [ ] Environment variables updated (if needed)
- [ ] Security scan passed (no secrets in code)
- [ ] Changelog updated

**Deployment:**
- [ ] Merge to main branch
- [ ] Monitor Railway deployment logs
- [ ] Run smoke tests on production
- [ ] Verify database migrations applied
- [ ] Check monitoring dashboards

**Post-Deployment:**
- [ ] Verify critical user flows (auth, goal creation, journal)
- [ ] Check error rate in Sentry (post-MVP)
- [ ] Monitor API latency
- [ ] Notify team of deployment

---

## Database Management

### Supabase Configuration

**Projects:**

```yaml
supabase_projects:
  staging:
    project_id: "weave-staging-xxxxx"
    region: "us-east-1"
    tier: "Free" (MVP) → "Pro" (Month 2)

  production:
    project_id: "weave-production-xxxxx"
    region: "us-east-1"  # Closest to primary users
    tier: "Free" (MVP) → "Pro" (Month 2)
```

### Migration Strategy

**Migration File Naming Convention:**

```
supabase/migrations/
  001_user_profiles.sql
  002_goals.sql
  003_subtask_templates.sql
  004_subtask_instances.sql
  005_subtask_completions.sql
  006_captures.sql
  007_journal_entries.sql
  008_daily_aggregates.sql
  009_rls_policies.sql
  010_ai_runs.sql
  011_ai_artifacts.sql
  012_event_log.sql
```

**Migration Workflow:**

```bash
# 1. Create migration locally
supabase migration new add_new_feature

# 2. Write SQL in generated file
# supabase/migrations/TIMESTAMP_add_new_feature.sql

# 3. Test migration locally
supabase db reset  # Applies all migrations to local DB

# 4. Apply to staging
supabase db push --db-url $SUPABASE_STAGING_URL

# 5. Test in staging
# Run integration tests

# 6. Apply to production
supabase db push --db-url $SUPABASE_PROD_URL

# 7. Verify production
# Check that migration applied successfully
```

**Rollback Strategy:**

```bash
# Option 1: Revert migration (if no data loss)
supabase migration revert TIMESTAMP_add_new_feature

# Option 2: Write a new migration to undo changes
supabase migration new rollback_feature

# Option 3: Restore from backup (last resort)
# Use Supabase dashboard → Database → Backups
```

### Backup Strategy

**Supabase Automatic Backups:**

| Tier | Backup Frequency | Retention | Point-in-Time Recovery |
|------|------------------|-----------|------------------------|
| **Free** | Daily | 7 days | No |
| **Pro** | Daily | 30 days | Yes (up to 30 days) |

**Manual Backups (Critical Changes):**

```bash
# Before major migration or data change
pg_dump $SUPABASE_PROD_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Store in secure location (S3, Google Drive)
aws s3 cp backup_*.sql s3://weave-backups/
```

**Backup Schedule:**
- **Daily:** Automatic (Supabase)
- **Pre-deployment:** Manual (before database migrations)
- **Weekly:** Full database export (for disaster recovery)

### Data Seeding

**Development Seed Data:**

```sql
-- supabase/seed.sql

-- Create test users
INSERT INTO user_profiles (auth_user_id, email, full_name, archetype) VALUES
  ('test-user-1', 'alice@test.com', 'Alice Test', 'achiever'),
  ('test-user-2', 'bob@test.com', 'Bob Test', 'explorer');

-- Create test goals
INSERT INTO goals (user_id, title, description, priority) VALUES
  ((SELECT id FROM user_profiles WHERE email = 'alice@test.com'),
   'Learn React Native',
   'Build 3 mobile apps by end of quarter',
   'high');

-- Apply seed data
-- supabase db seed
```

**Production Data:**
- **NO seeding** - production data is user-generated only
- **Test accounts** - Create via normal signup flow with special email pattern (`test+*@weave.app`)

---

## Secret Management

### Environment Variables

**Backend (Railway):**

```bash
# Production Environment Variables
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # NEVER expose to client

OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

REDIS_URL=redis://default:xxx@redis.railway.internal:6379

ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO

# Security
ALLOWED_ORIGINS=https://weave.app,https://api.weave.app
JWT_SECRET=xxx  # Auto-generated by Supabase
```

**Mobile (Expo):**

```bash
# .env.production
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_API_URL=https://api.weave.app

# Build secrets (not exposed to app)
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Secret Rotation Policy

| Secret | Rotation Frequency | Trigger |
|--------|-------------------|---------|
| **Supabase Anon Key** | Annually | Suspected exposure |
| **Supabase Service Key** | Quarterly | Team member departure |
| **OpenAI API Key** | Quarterly | Cost spike or breach |
| **Anthropic API Key** | Quarterly | Cost spike or breach |
| **JWT Secret** | Never (managed by Supabase) | Security incident only |

**Rotation Procedure:**

```bash
# 1. Generate new key in provider dashboard
# 2. Update Railway environment variables
railway variables set OPENAI_API_KEY=sk-new-key

# 3. Update staging first, test
# 4. Update production
# 5. Revoke old key after 24h grace period
# 6. Document rotation in changelog
```

### Secret Detection

**Pre-commit Hook (Month 2):**

```bash
# .husky/pre-commit
#!/bin/sh

# Detect secrets in staged files
if git diff --cached --name-only | xargs grep -E "(sk-|sk-ant-|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9)"; then
  echo "❌ Error: Potential secret detected in staged files!"
  echo "Remove secrets before committing."
  exit 1
fi
```

**GitHub Secret Scanning:**
- Enable in repository settings
- Configure alerts to security@weave.app
- Auto-revoke exposed tokens when possible

---

## Monitoring & Observability

### MVP Monitoring (Week 0-4)

**Railway Logs:**

```bash
# View production logs
railway logs --service weave-api-production

# Filter by log level
railway logs --filter "ERROR"

# Follow live logs
railway logs --follow
```

**Supabase Dashboard:**
- Database stats (connections, query performance)
- Storage usage
- Auth activity (logins, signups)
- API usage

**Manual Health Checks:**

```bash
# API health endpoint
curl https://api.weave.app/health
# Expected: {"status": "healthy", "database": "connected", "timestamp": "..."}

# Database connection check
curl https://api.weave.app/health/db
# Expected: {"status": "healthy", "latency_ms": 12}
```

### Production Monitoring (Month 2+)

**Sentry Error Tracking:**

```python
# api/app/main.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

if settings.ENVIRONMENT == "production":
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        traces_sample_rate=0.1,  # 10% of requests
        profiles_sample_rate=0.1,

        # Alert on these errors
        before_send=lambda event, hint: event if event.get("level") in ["error", "fatal"] else None,
    )
```

**PostHog Analytics:**

```typescript
// mobile/lib/analytics.ts
import PostHog from 'posthog-react-native';

export const analytics = new PostHog(
  process.env.EXPO_PUBLIC_POSTHOG_API_KEY!,
  {
    host: 'https://app.posthog.com',
    captureNativeAppLifecycleEvents: true,
  }
);

// Track critical events
analytics.capture('goal_created', { goal_id, title, priority });
analytics.capture('journal_submitted', { fulfillment_score, word_count });
```

**Key Metrics to Track:**

| Metric | Tool | Alert Threshold |
|--------|------|-----------------|
| **API Error Rate** | Sentry | > 5% |
| **API Latency (p95)** | Railway | > 500ms |
| **Database CPU** | Supabase | > 80% |
| **Database Connections** | Supabase | > 80 (of 100) |
| **AI API Errors** | Sentry | > 10% |
| **Daily Active Users** | PostHog | < 10% of previous day |
| **Crash Rate** | Sentry | > 1% |

### Alerting Strategy

**Alert Channels:**
- **Critical (P1):** Phone call + email (security@weave.app)
- **High (P2):** Email within 15 minutes
- **Medium (P3):** Slack notification
- **Low (P4):** Daily digest email

**Alert Examples:**

```yaml
critical_alerts:
  - api_down: "API health check failed 3x in 5 minutes"
  - database_down: "Supabase connection failed"
  - error_spike: "Error rate > 10% over 10 minutes"

high_alerts:
  - high_latency: "API p95 latency > 1s for 5 minutes"
  - ai_budget_exceeded: "AI costs > $100/day"
  - auth_failures: "Auth failure rate > 20%"

medium_alerts:
  - disk_space_low: "Database storage > 80%"
  - memory_high: "Railway memory > 80%"
```

---

## Incident Response & Rollback

### Rollback Procedures

**Backend Rollback (Railway):**

#### Automatic Rollback (Railway Default)
Railway automatically rolls back if:
- Health check fails 3 times consecutively
- Deployment crashes within 5 minutes of start

#### Manual Rollback (Via Railway CLI)
```bash
# List recent deployments
railway deployments

# Rollback to specific deployment
railway deployment rollback <deployment-id>

# Verify rollback succeeded
curl https://weave-api-production.railway.app/health
```

#### Manual Rollback (Via Railway Dashboard)
1. Go to https://railway.app/dashboard
2. Select `weave-api-production` project
3. Click "Deployments" tab
4. Find previous successful deployment
5. Click "Redeploy" on that deployment
6. Confirm rollback

#### Git-Based Rollback
```bash
# Method 1: Revert commit and trigger auto-deploy
git revert HEAD
git push origin main  # Triggers GitHub Actions → Railway deploy

# Method 2: Manual deployment of previous commit
git checkout <previous-commit-sha>
railway up
```

**Health Check Verification:**
After any rollback, verify the health endpoint:
```bash
curl https://weave-api-production.railway.app/health

# Expected response:
{
  "status": "healthy",
  "service": "weave-api",
  "database": "connected",
  "timestamp": "2025-12-23T...",
  ...
}
```

**Database Rollback:**

```bash
# Option 1: Revert migration
supabase migration revert TIMESTAMP_bad_migration

# Option 2: Restore from backup
# 1. Download backup from Supabase dashboard
# 2. Apply to production:
psql $SUPABASE_PROD_URL < backup_TIMESTAMP.sql

# Option 3: Point-in-time recovery (Pro tier only)
# Use Supabase dashboard → Database → Backups → Restore to point in time
```

**Mobile Rollback (Expo EAS):**

```bash
# Revert OTA update
eas update --branch production --message "Rollback to previous version"

# If app build is broken:
# 1. Reject build in App Store Connect
# 2. Re-submit previous working build
```

### Incident Response Runbook

**Phase 1: Detection (0-5 minutes)**
1. Alert received (Sentry, monitoring, user report)
2. Acknowledge incident
3. Assess severity (P1-P4)
4. Notify team (if P1/P2)

**Phase 2: Triage (5-15 minutes)**
1. Check monitoring dashboards (Railway, Supabase, Sentry)
2. Review recent deployments (last 24h)
3. Check error logs for stack traces
4. Identify affected users/features

**Phase 3: Mitigation (15-60 minutes)**

**For Backend Issues:**
```bash
# Check Railway deployment status
railway status

# Check recent logs
railway logs --tail 100 --filter "ERROR"

# If deployment caused issue:
railway rollback

# If database migration caused issue:
supabase migration revert TIMESTAMP
```

**For Database Issues:**
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Kill long-running queries
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND query_start < NOW() - INTERVAL '5 minutes';

-- Check slow queries
SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
```

**For AI Provider Issues:**
```python
# Fallback to alternative provider
# api/app/services/ai_service.py

if openai_error:
    # Fallback to Anthropic
    response = await anthropic_client.generate(prompt)
elif anthropic_error:
    # Fallback to template response
    response = get_template_response(prompt_type)
```

**Phase 4: Recovery (1-4 hours)**
1. Deploy fix or rollback
2. Verify fix in production
3. Monitor metrics for 1 hour
4. Notify affected users (if needed)

**Phase 5: Post-Mortem (24-72 hours)**
1. Write incident report
2. Root cause analysis
3. Action items to prevent recurrence
4. Update runbook

---

## CI/CD Pipeline

### MVP CI/CD (Week 0-4)

**Manual Workflow:**

```bash
# 1. Develop locally
git checkout -b feature/new-feature
# Make changes...

# 2. Run tests locally
npm test
pytest

# 3. Lint
npm run lint
ruff check .

# 4. Commit and push
git add .
git commit -m "feat: Add new feature"
git push origin feature/new-feature

# 5. Create pull request
# Review on GitHub

# 6. Merge to main
# Triggers automatic Railway deployment

# 7. Manual smoke test in production
curl https://api.weave.app/health
```

### Automated CI/CD (Month 2+)

**GitHub Actions Pipeline:**

```yaml
# .github/workflows/ci.yml

name: CI/CD Pipeline

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Lint frontend
        run: npm run lint
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - name: Lint backend
        run: |
          pip install ruff
          ruff check .

  test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - name: Run frontend tests
        run: npm test -- --coverage
      - name: Run backend tests
        run: pytest --cov=app tests/
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  security-scan:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'

  deploy-staging:
    runs-on: ubuntu-latest
    needs: [test, security-scan]
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway Staging
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN_STAGING }}
          service: weave-api-staging

  deploy-production:
    runs-on: ubuntu-latest
    needs: [test, security-scan]
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway Production
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: weave-api-production
      - name: Run smoke tests
        run: |
          curl -f https://api.weave.app/health || exit 1
```

### Quality Gates

**Pre-Merge Requirements:**
- ✅ All tests passing
- ✅ Code coverage > 80%
- ✅ Linting passing (no errors)
- ✅ Security scan passing (no critical vulnerabilities)
- ✅ Code review approved by 1+ reviewers

**Pre-Deploy Requirements:**
- ✅ All pre-merge requirements
- ✅ Integration tests passing in staging
- ✅ Smoke tests passing in staging
- ✅ Database migrations tested

---

## Scaling Strategy

### Horizontal Scaling (Railway)

**Current (MVP):**
- Single Railway instance
- Auto-restart on crashes
- 1 GB RAM, 1 vCPU

**Month 2-3 (Alpha):**
- 2 Railway instances (load balanced)
- Health checks enabled
- 2 GB RAM, 2 vCPU per instance

**Month 4+ (Scale):**
- Auto-scaling: 2-10 instances based on load
- Horizontal pod autoscaling (HPA)
- Regional distribution (if international users)

**Scaling Triggers:**

| Metric | Threshold | Action |
|--------|-----------|--------|
| **CPU** | > 70% for 5 min | Add 1 instance |
| **Memory** | > 80% for 5 min | Add 1 instance |
| **Request Latency** | p95 > 500ms | Add 1 instance |
| **Error Rate** | > 5% | Alert (investigate) |

### Database Scaling (Supabase)

**Vertical Scaling (Supabase Tiers):**

| Tier | Cost | Database | Storage | Connections | Use Case |
|------|------|----------|---------|-------------|----------|
| **Free** | $0 | 500 MB | 1 GB | 60 | MVP (< 1000 users) |
| **Pro** | $25/mo | 8 GB | 100 GB | 200 | Alpha (< 10K users) |
| **Team** | $599/mo | Custom | Custom | Custom | Scale (> 50K users) |

**Optimization Strategies:**

```sql
-- 1. Add indexes for common queries
CREATE INDEX idx_subtask_instances_user_date
ON subtask_instances(user_id, scheduled_for_date);

CREATE INDEX idx_journal_entries_user_date
ON journal_entries(user_id, local_date);

-- 2. Materialized views for heavy aggregations
CREATE MATERIALIZED VIEW user_stats_summary AS
SELECT
  user_id,
  COUNT(*) as total_completions,
  MAX(local_date) as last_active_date,
  AVG(fulfillment_score) as avg_fulfillment
FROM daily_aggregates
GROUP BY user_id;

-- Refresh daily via cron
REFRESH MATERIALIZED VIEW user_stats_summary;
```

**Read Replicas (Post-MVP):**
- Read-heavy queries (dashboards, analytics) → Read replica
- Write operations → Primary database
- Supabase Pro tier required

### Caching Strategy (Month 3+)

**Redis Cache Layers:**

```python
# api/app/services/cache_service.py
from redis import Redis

redis_client = Redis.from_url(settings.REDIS_URL)

# Cache daily aggregates (frequently read)
async def get_daily_aggregate(user_id: str, local_date: date) -> dict:
    cache_key = f"daily_aggregate:{user_id}:{local_date.isoformat()}"
    cached = redis_client.get(cache_key)

    if cached:
        return json.loads(cached)

    # Cache miss - fetch from database
    aggregate = await db.query(
        "SELECT * FROM daily_aggregates WHERE user_id = $1 AND local_date = $2",
        user_id, local_date
    )

    # Cache for 1 hour
    redis_client.setex(cache_key, 3600, json.dumps(aggregate))
    return aggregate
```

**Cache Invalidation:**
- On completion creation → Invalidate daily_aggregate cache
- On journal submission → Invalidate daily_aggregate cache
- On goal update → Invalidate user goals cache

---

## Cost Management

### Infrastructure Cost Tracking

**MVP Baseline (100 users):**

| Service | Cost | Notes |
|---------|------|-------|
| Railway (Hobby + Prod) | $40/mo | 2 instances |
| Supabase (Free tier) | $0 | < 500 MB database |
| Expo EAS (Free tier) | $0 | 100 builds/month |
| **Total Infrastructure** | **$40/mo** | **$0.40/user/month** |

**Scale Projections (10,000 users):**

| Service | Cost | Notes |
|---------|------|-------|
| Railway (Pro plan) | $200/mo | 4 instances, auto-scaling |
| Supabase (Pro tier) | $25/mo | 8 GB database |
| Redis (Railway) | $10/mo | Caching + job queue |
| Sentry (Team plan) | $26/mo | 50k events/month |
| PostHog (Growth plan) | $0 | Free tier (1M events) |
| **Total Infrastructure** | **$261/mo** | **$0.026/user/month** |

**AI Cost Estimates (from architecture.md):**

| Users | Daily AI Calls | Monthly Cost | Per-User Cost |
|-------|----------------|--------------|---------------|
| 100 | 500 | $150 | $1.50/user/month |
| 1,000 | 5,000 | $1,500 | $1.50/user/month |
| 10,000 | 50,000 | $2,500 | $0.25/user/month |

**Total Cost Breakdown (10K users):**
- Infrastructure: $261/mo ($0.026/user)
- AI: $2,500/mo ($0.25/user)
- **Total: $2,761/mo ($0.276/user/month)**

### Cost Optimization Strategies

**AI Cost Reduction:**
- Input hash caching (avoid duplicate prompts)
- Rate limiting (10 AI calls/hour per user)
- Fallback to templates when AI fails
- Use GPT-4o-mini for routine tasks ($0.15/MTok vs $2.50/MTok for GPT-4o)

**Database Cost Reduction:**
- Pre-computed aggregates (avoid expensive queries)
- Materialized views (refresh nightly)
- Archive old data (captures > 2 years)

**Infrastructure Cost Reduction:**
- Auto-scaling: scale down during low traffic
- Optimize API calls (batch operations)
- CDN caching (static assets)

---

## DevOps Checklist

### Week 0: Foundation Setup

**Infrastructure:**
- [ ] Create Railway project (staging + production)
- [ ] Create Supabase projects (staging + production)
- [ ] Configure environment variables in Railway
- [ ] Set up domain names (api.weave.app → Railway)
- [ ] Enable HTTPS (Railway automatic)

**Database:**
- [ ] Write migration files (001-012)
- [ ] Apply migrations to staging
- [ ] Test migrations locally
- [ ] Apply migrations to production
- [ ] Enable daily backups (Supabase)

**CI/CD:**
- [ ] Set up GitHub repository
- [ ] Configure Railway auto-deploy on main branch
- [ ] Add basic GitHub Actions (lint + test)
- [ ] Configure branch protection (require tests)

**Monitoring:**
- [ ] Set up Railway log access
- [ ] Configure Supabase dashboard access
- [ ] Create health check endpoint (/health)
- [ ] Set up manual smoke tests

**Security:**
- [ ] Rotate all API keys
- [ ] Enable secret scanning (GitHub)
- [ ] Configure CORS (allow only weave.app)
- [ ] Enable RLS on all tables

### Month 2: Production Hardening

**Monitoring:**
- [ ] Integrate Sentry error tracking
- [ ] Set up PostHog analytics
- [ ] Configure alerting (email + Slack)
- [ ] Create monitoring dashboard

**CI/CD:**
- [ ] Add security scanning (Trivy)
- [ ] Add code coverage reporting (Codecov)
- [ ] Configure auto-deploy to staging on PR
- [ ] Add smoke tests to deployment pipeline

**Reliability:**
- [ ] Enable Railway health checks
- [ ] Configure auto-restart on crashes
- [ ] Test rollback procedures
- [ ] Document incident response runbook

**Performance:**
- [ ] Add Redis caching
- [ ] Optimize database queries
- [ ] Add API rate limiting
- [ ] Configure CDN for static assets

### Month 4: Scale Preparation

**Scaling:**
- [ ] Enable Railway auto-scaling
- [ ] Upgrade Supabase to Pro tier
- [ ] Add database read replicas
- [ ] Implement caching layer

**Observability:**
- [ ] Add distributed tracing (OpenTelemetry)
- [ ] Set up custom dashboards (Grafana)
- [ ] Configure SLO/SLA monitoring
- [ ] Add user behavior analytics

**Automation:**
- [ ] Automated database backups (weekly)
- [ ] Automated dependency updates (Dependabot)
- [ ] Automated security patching
- [ ] Automated performance testing

---

## Disaster Recovery Plan

### Recovery Objectives

| Metric | Target | Description |
|--------|--------|-------------|
| **RTO** (Recovery Time Objective) | < 4 hours | Max time to restore service |
| **RPO** (Recovery Point Objective) | < 1 hour | Max acceptable data loss |
| **MTTR** (Mean Time To Recovery) | < 4 hours | Average time to fix issues |

### Disaster Scenarios & Runbooks

#### Scenario 1: Railway Outage (Backend Down)

**Symptoms:**
- API health checks failing
- Mobile app showing "Cannot connect to server"
- Railway dashboard shows service down

**Recovery Steps:**

```bash
# 1. Verify outage scope
curl https://api.weave.app/health  # Fails
curl https://railway.app/status    # Check Railway status page

# 2. If Railway platform issue:
# - Wait for Railway resolution (check status.railway.app)
# - Communicate with users via status page
# - ETA: 15-60 minutes (Railway SLA)

# 3. If deployment issue:
railway logs --tail 100  # Check for errors
railway rollback         # Roll back to last working deployment

# 4. If database connection issue:
# Check Supabase status
# Verify DATABASE_URL environment variable
railway variables get SUPABASE_URL

# 5. Verify recovery
curl https://api.weave.app/health
# Expected: {"status": "healthy"}
```

**Data Loss:** None (stateless API, database unaffected)
**User Impact:** Cannot create/update goals, journal entries, completions
**Mitigation:** Add status page (status.weave.app) to communicate downtime

#### Scenario 2: Supabase Outage (Database Down)

**Symptoms:**
- API returns 500 errors
- "Database connection failed" in logs
- Supabase dashboard inaccessible

**Recovery Steps:**

```bash
# 1. Verify Supabase status
curl https://status.supabase.com
# Check if it's a platform outage or our project

# 2. If platform outage:
# - Wait for Supabase resolution
# - Enable "offline mode" in mobile app (read-only cached data)
# - ETA: 15-60 minutes (Supabase SLA)

# 3. If our project issue:
# Check connection limits
SELECT count(*) FROM pg_stat_activity;
# If > 60 connections (Free tier limit):
# Kill idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle' AND state_change < NOW() - INTERVAL '10 minutes';

# 4. If data corruption:
# Restore from backup (Supabase dashboard → Backups)
# Select most recent backup (< 1 hour old for RPO)

# 5. Verify recovery
psql $SUPABASE_URL -c "SELECT NOW();"
```

**Data Loss:** Up to 1 hour (last backup)
**User Impact:** App unusable (all data access blocked)
**Mitigation:** Upgrade to Supabase Pro (better SLA, more connections)

#### Scenario 3: AI Provider Outage (OpenAI/Anthropic Down)

**Symptoms:**
- Triad generation fails
- Dream Self chat returns errors
- "AI service unavailable" in logs

**Recovery Steps:**

```python
# 1. Automatic fallback chain (already implemented)
# OpenAI fails → Try Anthropic
# Anthropic fails → Use template response

# 2. Manual intervention (if both fail)
# Enable "graceful degradation" mode
# api/app/services/ai_service.py

DEGRADATION_MODE = True  # Set via environment variable

if DEGRADATION_MODE:
    # Return template responses for all AI operations
    return get_template_response(operation_type)

# 3. Communicate with users
# Push notification: "AI features temporarily unavailable.
#                     Your progress is saved and will sync when service resumes."

# 4. Monitor provider status
# https://status.openai.com
# https://status.anthropic.com
```

**Data Loss:** None (AI outputs are optional)
**User Impact:** No AI-generated triads, recaps, or chat responses
**Mitigation:** Pre-generate fallback templates for common scenarios

#### Scenario 4: Complete Platform Failure (Railway + Supabase Both Down)

**Probability:** Extremely low (< 0.01% chance)
**User Impact:** App completely unusable

**Recovery Steps:**

```bash
# 1. Activate disaster recovery plan
# Deploy backend to backup platform (e.g., Vercel, Fly.io)
# Use pre-configured backup deployment (Month 4+)

# 2. Point DNS to backup infrastructure
# Update api.weave.app CNAME → backup-api.weave.app

# 3. Restore database from backup
# Download latest Supabase backup
# Deploy to backup PostgreSQL instance

# 4. Update mobile app via OTA
eas update --branch production --message "Switched to backup infrastructure"

# ETA: 2-4 hours (manual process)
```

**Mitigation (Month 4+):**
- Pre-configure backup Railway project
- Weekly full database backups to S3
- Documented recovery procedures

### Backup Verification

**Monthly Drill (starts Month 2):**

```bash
# Test database restore
# 1. Download latest backup
supabase db dump --db-url $SUPABASE_PROD_URL > backup_test.sql

# 2. Restore to staging
psql $SUPABASE_STAGING_URL < backup_test.sql

# 3. Verify data integrity
psql $SUPABASE_STAGING_URL -c "SELECT COUNT(*) FROM user_profiles;"
psql $SUPABASE_STAGING_URL -c "SELECT COUNT(*) FROM goals;"

# 4. Document results
echo "Backup restore successful: $(date)" >> docs/backup-tests.log
```

### Data Loss Prevention

**Critical Tables (Zero Data Loss Acceptable):**
- `user_profiles` - User accounts
- `goals` - User goals
- `subtask_completions` - Immutable event log
- `journal_entries` - User reflections

**Strategy:**
- Daily automated backups (Supabase)
- Pre-deployment manual backups (critical migrations)
- Immutable event logs (never UPDATE/DELETE completions)
- Write-ahead logging (PostgreSQL built-in)

---

## API Versioning Strategy

### Why Versioning Matters for Mobile Apps

Mobile apps are long-lived and users don't always update immediately. API versioning prevents breaking changes from crashing old app versions.

**Problem Without Versioning:**
```
Day 1: Deploy API change (rename "goal_title" → "title")
Day 2: Old mobile app users crash (looking for "goal_title")
Day 3: 1-star App Store reviews pour in
```

### Versioning Scheme

**URL-Based Versioning:**

```
Current API:   https://api.weave.app/api/goals
Versioned API: https://api.weave.app/api/v1/goals
```

**Version Format:** `/api/v{major}`
- `v1` = Initial production API
- `v2` = Breaking changes (removed fields, changed behavior)
- No minor versions (use feature flags for non-breaking changes)

### Backward Compatibility Policy

**Breaking Changes (require new version):**
- Removing a field from response
- Renaming a field
- Changing field type (string → number)
- Changing endpoint URL
- Removing an endpoint

**Non-Breaking Changes (no new version):**
- Adding a new field to response (old apps ignore it)
- Adding a new endpoint
- Adding optional request parameters
- Bug fixes

### Version Lifecycle

```
v1 Launch:        2025-01 (MVP)
v1 Deprecation:   2026-01 (12 months notice)
v1 Sunset:        2026-07 (18 months total)
```

**Deprecation Process:**

1. **Month 0:** Announce v2 in release notes
2. **Month 1:** Add deprecation headers to v1 responses
   ```http
   Deprecated: true
   Sunset: 2026-07-01
   Link: <https://docs.weave.app/api/v2>; rel="successor"
   ```
3. **Month 3:** Show in-app migration notice (update required)
4. **Month 6:** Block old app versions from accessing API
5. **Month 12:** Remove v1 endpoints

### Mobile App Minimum Version Enforcement

**API Gateway Check:**

```python
# api/app/middleware/version_check.py
from fastapi import Request, HTTPException

MIN_SUPPORTED_APP_VERSION = "1.0.0"  # Update when deprecating old APIs

async def check_app_version(request: Request):
    """Block old app versions from accessing deprecated APIs."""

    app_version = request.headers.get("X-App-Version", "0.0.0")

    if compare_versions(app_version, MIN_SUPPORTED_APP_VERSION) < 0:
        raise HTTPException(
            status_code=426,  # Upgrade Required
            detail={
                "code": "APP_UPDATE_REQUIRED",
                "message": "Please update Weave to the latest version",
                "min_version": MIN_SUPPORTED_APP_VERSION,
                "download_url": "https://apps.apple.com/app/weave"
            }
        )
```

**Mobile App Header:**

```typescript
// mobile/lib/apiClient.ts
const API_VERSION = "v1";
const APP_VERSION = Constants.expoConfig?.version || "1.0.0";

const apiClient = axios.create({
  baseURL: `https://api.weave.app/api/${API_VERSION}`,
  headers: {
    "X-App-Version": APP_VERSION,
    "X-Platform": Platform.OS,  // ios or android
  },
});
```

### Implementation Timeline

| Milestone | Date | Action |
|-----------|------|--------|
| **MVP** | Week 0 | No versioning (rapid iteration OK) |
| **Alpha** | Month 1 | Add version headers (`X-App-Version`) |
| **Beta** | Month 2 | Implement `/api/v1/` endpoints |
| **Production** | Month 3 | Enforce minimum version checks |

**Note:** Start with `/api/goals` (unversioned) for MVP speed. Add `/api/v1/goals` when stabilizing for beta.

---

## Push Notification Deployment

### Architecture Overview

```
Mobile App → Expo Push Token → Backend API → Expo Push Service → APNs → iOS Device
```

### Setup Steps

#### 1. Configure Expo Push Notifications

**expo app.json:**

```json
{
  "expo": {
    "name": "Weave",
    "slug": "weave",
    "ios": {
      "bundleIdentifier": "com.weave.app",
      "supportsTabletOnly": false,
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      }
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#6366F1",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ]
  }
}
```

#### 2. Request Push Permissions (Mobile App)

```typescript
// mobile/lib/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export async function registerForPushNotifications(): Promise<string | null> {
  // Only real devices support push notifications
  if (!Device.isDevice) {
    console.warn('Push notifications only work on physical devices');
    return null;
  }

  // Request permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  // Get Expo Push Token
  const token = await Notifications.getExpoPushTokenAsync({
    projectId: 'your-expo-project-id',  // From expo.dev dashboard
  });

  return token.data;
}

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
```

#### 3. Store Push Tokens (Backend)

```python
# api/app/routers/users.py
from fastapi import APIRouter, Depends

router = APIRouter(prefix="/api/users", tags=["users"])

@router.post("/push-token")
async def register_push_token(
    token: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Store user's Expo Push Token for sending notifications.
    Called when user logs in or grants push permission.
    """

    await supabase.from_('user_profiles').update({
        'expo_push_token': token,
        'push_enabled': True,
        'push_registered_at': datetime.utcnow().isoformat()
    }).eq('id', current_user['id']).execute()

    return {"status": "registered", "token": token}
```

#### 4. Send Push Notifications (Backend)

```python
# api/app/services/notification_service.py
import httpx
from typing import List, Dict

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

async def send_push_notification(
    expo_push_tokens: List[str],
    title: str,
    body: str,
    data: Dict = None
) -> dict:
    """
    Send push notification via Expo Push Service.
    """

    messages = []
    for token in expo_push_tokens:
        messages.append({
            "to": token,
            "sound": "default",
            "title": title,
            "body": body,
            "data": data or {},
            "priority": "high",
            "channelId": "default",
        })

    async with httpx.AsyncClient() as client:
        response = await client.post(
            EXPO_PUSH_URL,
            json=messages,
            headers={"Content-Type": "application/json"}
        )

        return response.json()

# Example usage: Send triad reminder
async def send_triad_reminder(user_id: str):
    """Send daily triad reminder at 8 AM user's local time."""

    user = await get_user_profile(user_id)

    if not user['expo_push_token'] or not user['push_enabled']:
        return

    await send_push_notification(
        expo_push_tokens=[user['expo_push_token']],
        title="Your daily triad is ready ✨",
        body="3 tasks to move you closer to your goals today",
        data={"screen": "today", "type": "triad_reminder"}
    )
```

#### 5. Schedule Notifications (Redis + Cron)

**Post-MVP: Use Redis + BullMQ for scheduled notifications**

```python
# api/app/jobs/notification_scheduler.py
from datetime import datetime, timedelta

async def schedule_daily_notifications():
    """
    Cron job: Runs every hour to send scheduled notifications.
    """

    current_hour = datetime.utcnow().hour

    # Get users who should receive triad reminders this hour
    users = await supabase.from_('user_profiles') \
        .select('id, expo_push_token, timezone') \
        .eq('push_enabled', True) \
        .execute()

    for user in users.data:
        # Calculate if it's 8 AM in user's timezone
        user_hour = convert_to_user_timezone(current_hour, user['timezone'])

        if user_hour == 8:  # 8 AM local time
            await send_triad_reminder(user['id'])
```

**MVP: Manual notifications via Railway cron**

```bash
# railway.json (Month 2+)
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "on-failure"
  },
  "cron": [
    {
      "schedule": "0 * * * *",
      "command": "python -m app.jobs.notification_scheduler"
    }
  ]
}
```

### Notification Types

| Type | Trigger | Example |
|------|---------|---------|
| **Triad Ready** | Daily 8 AM | "Your daily triad is ready ✨" |
| **Streak Warning** | 10 PM if no completions | "Don't break your 5-day streak! Complete 1 bind today" |
| **Journal Reminder** | Daily 9 PM | "How was today? Reflect on your progress" |
| **Goal Milestone** | Goal completion | "🎉 You completed 'Learn React Native'!" |

### Testing Push Notifications

```bash
# 1. Get test Expo Push Token from mobile app
# Log it in app: console.log('Push token:', token);

# 2. Send test notification via Expo Push Tool
curl -H "Content-Type: application/json" \
  -X POST https://exp.host/--/api/v2/push/send \
  -d '{
    "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
    "title": "Test Notification",
    "body": "This is a test from DevOps setup!"
  }'

# 3. Verify notification appears on iOS device
```

### Implementation Timeline

| Phase | Timeline | Status |
|-------|----------|--------|
| **Setup Expo notifications** | Week 0 | During mobile app setup |
| **Store push tokens** | Week 2 | After auth flow complete |
| **Manual test notifications** | Week 3 | Test on real devices |
| **Triad reminders** | Month 2 | After journal flow complete |
| **Scheduled notifications (cron)** | Month 3 | Add Redis + BullMQ |

---

## Future Enhancements

### Deferred to Month 2+ (Post-MVP)

The following enhancements are important for scale but NOT required for MVP launch. They are documented here for future reference.

#### 1. Load Testing Strategy 📊

**Why Deferred:** MVP will have < 100 users. Load testing is premature optimization.

**When to Add:** Month 2, before scaling to 1,000+ users

**Approach:**

```yaml
Tool: k6 (open-source load testing)

Test Scenarios:
  - API health check: 1000 req/sec
  - Goal creation: 100 req/sec
  - Journal submission: 50 req/sec
  - Triad generation (AI): 10 req/sec

Target Metrics:
  - p95 latency < 500ms
  - Error rate < 1%
  - Database connections < 80% of limit

Script Example (k6):
  # k6 run --vus 100 --duration 5m load-test.js
```

#### 2. Infrastructure as Code (IaC) 🏗️

**Why Deferred:** Railway and Supabase are managed services with dashboards. IaC adds complexity without immediate benefit.

**When to Add:** Month 4, when multi-environment complexity grows

**Approach:**

```yaml
Tool: Terraform or Pulumi

What to Codify:
  - Railway projects (staging + production)
  - Supabase projects configuration
  - DNS records (api.weave.app)
  - Environment variables (templated)

Benefit:
  - Reproducible infrastructure
  - Version-controlled config
  - Easy disaster recovery
```

#### 3. Complete CI/CD Configuration Files 📝

**Why Deferred:** GitHub Actions workflow provided is 80% complete. Remaining 20% is project-specific (secrets, repo structure).

**When to Add:** Week 0, during repository setup

**What's Needed:**

```yaml
Files to Create:
  - .github/workflows/ci.yml (provided in doc, needs secrets)
  - .github/workflows/mobile-build.yml (Expo EAS builds)
  - railway.json (optional, for advanced Railway config)
  - .env.example (template for local development)

GitHub Secrets to Configure:
  - RAILWAY_TOKEN
  - RAILWAY_TOKEN_STAGING
  - EXPO_TOKEN
  - CODECOV_TOKEN (optional)
```

#### 4. Database Migration SQL Files 📄

**Why Deferred:** Migration files require finalized schema. Implementation-readiness doc lists what's needed.

**When to Add:** Week 0, Day 2 (after schema finalized)

**What's Needed:**

```sql
supabase/migrations/
  001_user_profiles.sql
  002_goals.sql
  003_subtask_templates.sql
  004_subtask_instances.sql
  005_subtask_completions.sql
  006_captures.sql
  007_journal_entries.sql
  008_daily_aggregates.sql
  009_rls_policies.sql
  010_ai_runs.sql
  011_ai_artifacts.sql
  012_event_log.sql

Reference: docs/idea/backend.md (complete schema)
```

#### 5. Blue-Green Deployment Implementation 🔄

**Why Deferred:** Railway provides instant rollback. Blue-green adds complexity without clear MVP benefit.

**When to Add:** Month 3, for zero-downtime deployments

**Approach:**

```yaml
Strategy:
  - Deploy new version to "green" environment
  - Run smoke tests on green
  - Switch traffic from blue → green
  - Keep blue running for 1 hour (rollback buffer)
  - Decommission blue if stable

Railway Support:
  - Use Railway's built-in deployment history
  - Manual switch via DNS or load balancer
```

#### 6. Multi-Region Deployment 🌍

**Why Deferred:** All initial users likely US-based. Multi-region is premature optimization.

**When to Add:** Month 6+, if international users > 20%

**Approach:**

```yaml
Regions:
  - US East (primary): Virginia
  - Europe: Frankfurt
  - Asia: Singapore

Strategy:
  - Read-heavy: Route to nearest region
  - Write operations: Route to primary (eventual consistency)
  - Database: Supabase multi-region (Enterprise tier)
```

#### 7. Advanced Monitoring & Observability 📈

**Why Deferred:** Basic Railway logs + Sentry sufficient for MVP.

**When to Add:** Month 3, for deep performance insights

**Tools:**

```yaml
Distributed Tracing: OpenTelemetry + Jaeger
  - Trace API requests across services
  - Identify slow database queries
  - Track AI API latency

Custom Dashboards: Grafana
  - Real-time metrics visualization
  - Alert management
  - Business metrics (DAU, goal completions)

APM: New Relic or DataDog (if budget allows)
  - Automatic instrumentation
  - Error tracking with context
  - Performance profiling
```

---

## Appendix: Quick Reference Commands

### Railway CLI

```bash
# Link to project
railway link weave-api-production

# Deploy
railway up

# View logs
railway logs --follow --filter "ERROR"

# Rollback
railway rollback

# Set environment variable
railway variables set KEY=value

# Get current deployment
railway status
```

### Supabase CLI

```bash
# Create migration
supabase migration new migration_name

# Apply migrations
supabase db push --db-url $SUPABASE_URL

# Reset local database
supabase db reset

# View database
supabase db diff

# Seed data
supabase db seed
```

### Expo EAS

```bash
# Build for iOS
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios --latest

# OTA update
eas update --branch production --message "Bug fixes"

# View builds
eas build:list
```

---

**Document Status:** ✅ Complete (Enterprise-Ready)
**Last Updated:** 2025-12-16 (Enhanced with critical sections)
**Version:** 2.0
**Next Review:** After Week 0 completion
**Owner:** Engineering Team

**Enhancements Added:**
- Disaster Recovery Plan (RTO/RPO: <4hrs, <1hr)
- API Versioning Strategy (mobile app compatibility)
- Push Notification Deployment (Expo Push)
- Future Enhancements section (load testing, IaC, etc.)

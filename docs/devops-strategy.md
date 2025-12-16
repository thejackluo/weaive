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

```bash
# Method 1: Redeploy previous commit
git revert HEAD
git push origin main  # Triggers auto-deploy

# Method 2: Railway CLI
railway rollback  # Rolls back to previous deployment

# Method 3: Railway Dashboard
# Deployments → Select previous deployment → Redeploy
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

**Document Status:** Complete
**Last Updated:** 2025-12-16
**Next Review:** After Week 0 completion
**Owner:** Engineering Team

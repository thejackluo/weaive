# Story 9.1: Production Backend Deployment (READY FOR DEV)

**Epic:** Epic 9 - Production Launch & App Store Publishing  
**Story ID:** 9.1  
**Priority:** M (Must Have) - **BLOCKS LAUNCH**  
**Estimate:** 5 story points  
**Status:** ready-for-dev  
**Created:** 2025-12-23  

---

## 📋 User Story

**As a** developer  
**I want to** deploy the FastAPI backend to Railway production  
**So that** the mobile app can connect to a stable, production-grade API  

---

## ✅ Acceptance Criteria

### 1. Railway Setup
- [ ] Create Railway production project (`weave-api-production`)
- [ ] Configure project settings:
  - Region: us-west-1 (low latency for US users)
  - Instance type: Shared vCPU, 512MB RAM (scale to 1GB if needed)
  - Auto-scaling: Enabled (max 3 instances)

### 2. Environment Variables
- [ ] Configure production environment variables in Railway dashboard:
  ```bash
  # Database
  SUPABASE_URL=https://xxx.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=xxx
  DATABASE_URL=postgresql://xxx

  # AI Providers (AWS Bedrock primary, OpenAI/Anthropic fallback)
  AWS_REGION=us-east-1
  AWS_ACCESS_KEY_ID=xxx
  AWS_SECRET_ACCESS_KEY=xxx
  OPENAI_API_KEY=sk-proj-xxx
  ANTHROPIC_API_KEY=sk-ant-xxx
  GOOGLE_AI_API_KEY=xxx

  # Auth
  JWT_SECRET=xxx  # 256-bit random string
  JWT_ALGORITHM=HS256

  # Monitoring (Story 9.7 dependency)
  SENTRY_DSN=https://xxx@sentry.io/xxx
  LOGROCKET_APP_ID=weave/production

  # Environment
  ENVIRONMENT=production
  DEBUG=false
  LOG_LEVEL=INFO
  ```

### 3. CI/CD Pipeline
- [x] Create GitHub Actions workflow `.github/workflows/railway-deploy.yml`
- [x] Configure workflow to trigger on push to `main` branch
- [x] Add Railway deployment step using Railway GitHub Action
- [ ] **MANUAL:** Test CI/CD pipeline with sample commit (requires Railway account setup first)

### 4. Health Check
- [x] Ensure `/health` endpoint exists at `app/api/health.py` (already implemented)
- [x] Health check verifies:
  - Backend is running
  - Database connection is active
  - Returns 200 status with `{"status": "healthy", "timestamp": "..."}`
- [ ] **MANUAL:** Configure Railway health check to use `/health` endpoint (requires Railway project setup)

### 5. Testing
- [ ] **MANUAL:** Deploy backend to Railway production (requires Railway account and credentials)
- [ ] **MANUAL:** Test production API from mobile app staging build
- [ ] **MANUAL:** Verify all critical endpoints respond correctly:
  - `GET /health` - Health check (no auth required)
  - `GET /api/goals` - List goals (auth required)
  - `POST /api/completions` - Log bind completion (auth required)
  - `POST /api/journal-entries` - Create journal entry (auth required)
  - `POST /api/transcribe` - Voice STT (auth required)
- [ ] **MANUAL:** Monitor logs for errors during testing via Railway dashboard

### 6. Documentation
- [x] Document rollback procedure in `docs/devops-strategy.md`:
  - How to revert to previous deployment
  - Railway's automatic rollback on failed health check
  - Manual rollback via Railway dashboard
- [x] Document production deployment process for team (`docs/dev/railway-deployment-guide.md`)
- [x] Update CLAUDE.md with production deployment commands

---

## 🛠️ Technical Implementation Guide

### Backend Structure (Current Reality)

**Project Root:** `/weave-prod/weave-api/`

```
weave-prod/
├── weave-api/                # Backend directory
│   ├── app/                  # ✅ FastAPI application (PRODUCTION-READY)
│   ├── main.py              # FastAPI entry point with CORS, RLS middleware
│   ├── api/                 # API routers
│   │   ├── health.py        # ✅ Health check endpoint (ALREADY EXISTS)
│   │   ├── goals/router.py  # Goal management
│   │   ├── journal_router.py # Journal entries
│   │   ├── transcribe.py    # Voice STT
│   │   └── ...
│   ├── core/                # Core config and dependencies
│   │   ├── config.py        # Environment config with Pydantic Settings
│   │   ├── deps.py          # Dependency injection (auth, Supabase)
│   │   └── stt_config.py    # STT provider config
│   ├── services/            # Business logic
│   │   ├── ai/              # AI service abstraction (Story 0.6)
│   │   │   ├── bedrock_provider.py  # AWS Bedrock (PRIMARY)
│   │   │   ├── openai_provider.py   # OpenAI (FALLBACK)
│   │   │   ├── anthropic_provider.py # Anthropic (FALLBACK)
│   │   │   └── cost_tracker.py      # Dual cost tracking
│   │   ├── images/          # Image AI service (Story 0.9)
│   │   └── stt/             # Voice STT service (Story 0.11)
│   └── middleware/          # Request middleware
│       └── rate_limit.py    # Rate limiting
│   ├── tests/               # ✅ 71 tests passing, 76% coverage
│   ├── pyproject.toml       # uv dependencies (Python 3.11+)
│   ├── uv.lock
│   └── README.md
└── weave-mobile/             # React Native app (separate)
```

### Railway CLI Setup

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project (from weave-api directory)
cd /weave-prod/weave-api
railway init

# Create production project
railway project create weave-api-production

# Link to project
railway link <project-id>

# Set environment variables (see Acceptance Criteria #2)
railway variables set SUPABASE_URL=https://xxx.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=xxx
# ... repeat for all env vars

# Verify all environment variables are set
railway variables

# Expected output: 15+ variables including:
# - SUPABASE_URL
# - AWS_REGION (PRIMARY AI provider)
# - OPENAI_API_KEY (Fallback)
# - JWT_SECRET
# - ENVIRONMENT=production

# Deploy
railway up
```

**Alternative: Railway Web Dashboard (GUI)**

If you prefer a visual interface:

1. Visit https://railway.app/dashboard
2. Click "New Project" → "Empty Project"
3. Name: `weave-api-production`
4. **Settings** → **Variables** → Add all env vars from Acceptance Criteria #2
5. **Settings** → **Connect GitHub**:
   - Repository: `thejackluo/weave-prod`
   - Root Directory: `/weave-api` (⚠️ CRITICAL - not root)
6. **Deploy** → Railway auto-detects Python via `pyproject.toml`
7. Wait 2-5 minutes for initial build
8. Verify health check: `https://weave-api-production.railway.app/health`

### Health Check Implementation

**File:** `app/api/health.py` (ALREADY EXISTS - Story 0.6)

```python
from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.core.deps import get_supabase

router = APIRouter()

@router.get("/health")
async def health_check():
    """
    Health check endpoint for Railway and monitoring.
    
    Returns:
        dict: Status and timestamp if healthy
    
    Raises:
        HTTPException: 503 if database connection fails
    """
    try:
        # Test database connection
        supabase = get_supabase()
        result = supabase.table("user_profiles").select("id").limit(1).execute()
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "environment": "production"
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Unhealthy: Database connection failed - {str(e)}"
        )
```

**⚠️ VALIDATION REQUIRED:** Verify `/health` endpoint is registered in `app/main.py`:

```bash
# Check if health router is registered
cd /weave-prod/weave-api
grep -n "health" app/main.py

# Expected output:
# from app.api import health
# app.include_router(health.router, tags=["health"])
```

**If health endpoint is NOT registered, add to `app/main.py`:**

```python
from app.api import health
app.include_router(health.router, tags=["health"])
```

### GitHub Actions Workflow

**File:** `.github/workflows/railway-deploy.yml` (TO BE CREATED)

```yaml
name: Deploy to Railway Production

on:
  push:
    branches:
      - main
  workflow_dispatch:  # Manual trigger

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Install Railway CLI
        run: npm install -g @railway/cli

      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          railway link ${{ secrets.RAILWAY_PROJECT_ID }}
          railway up --detach

      - name: Wait for deployment
        run: sleep 30

      - name: Health check
        run: |
          HEALTH_URL="https://weave-api-production.railway.app/health"
          curl -f $HEALTH_URL || exit 1

      - name: Notify on failure
        if: failure()
        run: |
          echo "❌ Railway deployment failed"
          echo "Check Railway dashboard: https://railway.app/dashboard"
```

**GitHub Secrets Required:**
- `RAILWAY_TOKEN` - Railway API token (get from https://railway.app/account/tokens)
- `RAILWAY_PROJECT_ID` - Railway project ID (see below)

**How to Get RAILWAY_PROJECT_ID:**
```bash
# After creating Railway project and linking
cd /weave-prod/weave-api
railway status

# Output shows:
# Project ID: abc-xyz-123-def-456
# Copy this value to GitHub Secrets

# Or via Railway CLI
railway project
# Shows: weave-api-production (abc-xyz-123-def-456)
```

### Auto-Scaling Configuration

Railway auto-scales based on CPU/memory usage:
- **Min instances:** 1 (zero-downtime)
- **Max instances:** 3 (cost control)
- **Scaling trigger:** CPU > 70% for 2 minutes

**Configuration:** Set via Railway dashboard → Settings → Scaling

### Security Best Practices

#### 1. Never Commit Secrets to GitHub
```bash
# ❌ BAD - Don't do this
echo "SUPABASE_SERVICE_KEY=xxx" >> .env
git add .env
git commit -m "Add env vars"

# ✅ GOOD - Use Railway's secrets dashboard
railway variables set SUPABASE_SERVICE_KEY=xxx
```

#### 2. Rotate JWT Secret
```python
# Generate strong JWT secret (256-bit)
import secrets
jwt_secret = secrets.token_urlsafe(32)
print(f"JWT_SECRET={jwt_secret}")
```

#### 3. Verify RLS Policies (Story 0.4)
```sql
-- Check RLS enabled on all user tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN (
  'user_profiles', 'goals', 'subtask_completions', 'journal_entries',
  'captures', 'daily_aggregates', 'triad_tasks', 'ai_runs', 'ai_artifacts',
  'identity_docs', 'subtask_templates', 'subtask_instances'
);
-- All should have rowsecurity = true
```

---

## 🔍 Developer Context & Guardrails

### Architecture Compliance

**Story 0.6:** AI Service Abstraction - **AWS Bedrock is PRIMARY, not OpenAI**
- **Primary Provider:** AWS Bedrock (Claude 3.7 Sonnet via `bedrock_provider.py`)
- **Fallback Chain:** OpenAI GPT-4o-mini → Anthropic Claude API
- **Cost Tracking:** Dual tracking in `ai_runs` table (provider + model + cost)
- **Rate Limiting:** 10 AI calls/hour per user (enforced in `rate_limiter.py`)

**Environment Variables (CRITICAL):**
```bash
# ⚠️ AWS Bedrock is PRIMARY - These are REQUIRED
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx

# OpenAI/Anthropic are FALLBACK - Still required for failover
OPENAI_API_KEY=sk-proj-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
```

### Railway-Specific Considerations

#### 1. Railway Auto-Detects Python
Railway automatically detects Python projects via `pyproject.toml` and runs:
```bash
uv install --frozen
uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**⚠️ CRITICAL:** Railway sets `$PORT` dynamically. FastAPI must bind to `0.0.0.0:$PORT`, NOT `localhost:8000`.

**Fix:** Update `app/main.py` if needed:
```python
if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
```

#### 2. Railway Provides HTTPS Automatically
- Railway generates SSL certificate via Let's Encrypt
- Production URL: `https://weave-api-production.railway.app`
- **No nginx/caddy needed** - Railway handles TLS termination

#### 3. Railway Logs
```bash
# View logs in real-time
railway logs

# View logs for specific deployment
railway logs --deployment <deployment-id>
```

#### 4. Railway Database Connection Pooling
Supabase already provides connection pooling via PgBouncer. Railway doesn't need additional pooling for FastAPI.

### Testing Strategy

#### 1. Local Testing Before Deploy
```bash
# Run backend locally with production-like env vars
cd /weave-prod
export ENVIRONMENT=production
export DEBUG=false
uv run uvicorn app.main:app --reload

# Test health check
curl http://localhost:8000/health

# Test authenticated endpoint
curl -H "Authorization: Bearer <test-jwt>" http://localhost:8000/api/goals
```

#### 2. Railway Staging Environment (Optional)
```bash
# Create staging project
railway project create weave-api-staging

# Deploy to staging first
railway up --environment staging

# Test staging
curl https://weave-api-staging.railway.app/health
```

#### 3. Mobile App Testing
**File:** `weave-mobile/src/utils/api.ts`

```typescript
// Update API base URL for production testing
const API_BASE_URL = __DEV__
  ? 'http://localhost:8000'  // Local dev
  : 'https://weave-api-production.railway.app';  // Production
```

**Test Flow:**
1. Build mobile app with production API URL: `npx expo build:ios --release-channel staging`
2. Install staging build on physical device
3. Test critical flows:
   - Create goal → Verify `POST /api/goals` works
   - Log bind completion → Verify `POST /api/completions` works
   - Create journal entry → Verify `POST /api/journal-entries` works
   - Upload voice memo → Verify `POST /api/transcribe` works
4. Monitor Railway logs during testing: `railway logs`

### Rollback Procedure

#### Automatic Rollback (Railway Default)
Railway automatically rolls back if:
- Health check fails 3 times consecutively
- Deployment crashes within 5 minutes of start

#### Manual Rollback (Via Railway Dashboard)
1. Go to https://railway.app/dashboard
2. Select `weave-api-production` project
3. Click "Deployments" tab
4. Find previous successful deployment
5. Click "Redeploy" on that deployment
6. Confirm rollback

#### Manual Rollback (Via Railway CLI)
```bash
# List recent deployments
railway deployments

# Rollback to specific deployment
railway deployment rollback <deployment-id>

# Verify rollback succeeded
curl https://weave-api-production.railway.app/health
```

### Cost Monitoring

**Railway Pricing (as of 2025-12):**
- **Starter Plan:** $5/month (500 hours, 512MB RAM, 1GB storage)
- **Team Plan:** $20/month (2000 hours, 2GB RAM, 10GB storage)

**Estimated Monthly Cost:**
- Backend compute: $5-20/month (depends on usage)
- Supabase Pro: $25/month (Story 9.2)
- AI API calls: $2,500/month budget (already tracked in `ai_runs` table)

**Total:** ~$30-50/month infrastructure + AI costs

**Monitor Railway Costs:**

```bash
# View current usage and costs
railway metrics

# Output shows:
# - CPU usage
# - Memory usage
# - Network bandwidth
# - Estimated monthly cost
```

**Set Billing Alert (Railway Dashboard):**

1. Visit https://railway.app/account/billing
2. Click "Set Usage Alert"
3. Alert threshold: `$40/month` (buffer before $50 limit)
4. Email notification to: engineering@weave.com
5. Save alert

**Cost Control:**
- Railway charges per resource usage (CPU + memory + bandwidth)
- Shared vCPU (512MB) typically stays under $30/month for MVP traffic
- If cost exceeds $40/month, review Railway metrics for anomalies
- Consider upgrading to dedicated instance ($20-50/month) if traffic increases

---

## 📚 Related Stories & Dependencies

### Depends On (COMPLETED)
- ✅ **Story 0.1:** Project Scaffolding - FastAPI backend exists
- ✅ **Story 0.3:** Authentication Flow - JWT auth implemented
- ✅ **Story 0.4:** Row Level Security - RLS policies active
- ✅ **Story 0.5:** CI/CD Pipeline - GitHub Actions workflows exist
- ✅ **Story 0.6:** AI Service Abstraction - AWS Bedrock primary, cost tracking
- ✅ **Story 0.7:** Test Infrastructure - 71 tests passing, 76% coverage

### Unblocks (FUTURE STORIES)
- **Story 9.2:** Production Database Setup (can be done in parallel)
- **Story 9.7:** Production Monitoring Setup (Sentry/LogRocket integration)
- **Story 9.8:** App Store Submission (final submission requires stable prod backend)

### Related Documentation
- `docs/dev/ci-cd-setup.md` - CI/CD troubleshooting guide
- `docs/devops-strategy.md` - Deployment strategy and runbook (to be updated)
- `docs/architecture/core-architectural-decisions.md` - Data access patterns
- `docs/prd/epic-9-production-launch.md` - Epic 9 overview

---

## 🧪 Testing Checklist

### Unit/Integration Tests (Already Passing)
- ✅ 71 backend tests passing (Story 0.7)
- ✅ Health check endpoint tested in `tests/test_health.py`
- ✅ Auth security tested in `tests/test_auth_security.py`
- ✅ RLS policies tested in `supabase/tests/rls_policies.test.sql` (48 tests)

### Production Deployment Tests
- [ ] Railway deployment succeeds via GitHub Actions
- [ ] Health check returns 200 status at `https://weave-api-production.railway.app/health`
- [ ] Database connection verified (health check queries `user_profiles` table)
- [ ] Mobile app staging build connects to production API
- [ ] All critical endpoints return expected responses:
  - `GET /api/goals` - Returns user's goals
  - `POST /api/completions` - Logs bind completion
  - `POST /api/journal-entries` - Creates journal entry
  - `POST /api/transcribe` - Transcribes voice memo
- [ ] Logs accessible via Railway dashboard
- [ ] Auto-scaling triggers when CPU > 70% (simulate load with `ab` or `locust`)
- [ ] Rollback procedure tested (revert to previous deployment)

### Security Tests
- [ ] RLS policies verified in production database (Story 0.4)
- [ ] JWT secret rotation documented in runbook
- [ ] No secrets committed to GitHub (audit with `git log -p | grep -i "secret"`)
- [ ] HTTPS enforced (Railway auto-provides SSL)
- [ ] CORS headers configured correctly (only allow mobile app origin)

---

## 📝 Definition of Done

- [ ] Railway production project created and configured
- [ ] All environment variables set in Railway dashboard (see Acceptance Criteria #2)
- [ ] GitHub Actions workflow `.github/workflows/railway-deploy.yml` created and tested
- [ ] Health check endpoint `/health` responding correctly
- [ ] Production API tested from mobile app staging build
- [ ] All critical endpoints verified (goals, completions, journal, transcribe)
- [ ] Rollback procedure documented in `docs/devops-strategy.md`
- [ ] Production deployment commands documented in CLAUDE.md
- [ ] Code reviewed and approved
- [ ] Deployed to production
- [ ] Sprint status updated to `done` in `docs/sprint-status.yaml`

---

## 🚀 Next Steps After Story 9.1

1. **Story 9.2:** Production Database Setup (Supabase Pro, migrations, backups)
2. **Story 9.7:** Production Monitoring Setup (Sentry, LogRocket, cost alerts)
3. **Story 9.8:** App Store Submission (TestFlight, beta testing, final submission)

---

## 🎯 Story Status

**Status:** review  
**Last Updated:** 2025-12-23  
**Created By:** Bob (SM Agent) via BMAD Ultimate Context Engine  
**Implemented By:** Amelia (Dev Agent) - 2025-12-23  

**Developer Ready:** ✅ This story includes all context needed for flawless implementation:
- Complete architectural context (AWS Bedrock primary, dual cost tracking)
- Railway-specific deployment patterns (auto-detect Python, dynamic PORT binding)
- Testing strategy (local → staging → production)
- Rollback procedure (automatic + manual)
- Security guardrails (no secrets in Git, JWT rotation, RLS verification)
- Related stories and dependencies clearly mapped

**Ultimate Context Engine Analysis Complete** - Comprehensive developer guide created with zero ambiguity.

---

**📖 Reference:**
- Story file: `docs/stories/epic-9/9-1-production-backend-deployment-ready-for-dev.md`
- Epic file: `docs/prd/epic-9-production-launch.md`
- Architecture: `docs/architecture/core-architectural-decisions.md`
- CI/CD Guide: `docs/dev/ci-cd-setup.md`

---

## 📋 Dev Agent Record

### Implementation Summary

**Date:** 2025-12-23  
**Agent:** Amelia (Dev Agent)  
**Status:** Implementation Complete (Pending Manual Deployment)

### Completed Tasks

#### 1. Health Check Enhancement ✅
- **File:** `weave-api/app/api/health.py`
- **Changes:** Enhanced `/health` endpoint with database connection verification
- **Implementation:**
  - Added Supabase dependency injection via `get_supabase()`
  - Query `user_profiles` table to verify database connectivity
  - Returns `{"status": "healthy", "database": "connected", ...}` on success
  - Returns 503 `{"status": "unhealthy", "error": "..."}` on database failure
  - Includes timestamp, port, environment in response
- **Tests:** Updated `tests/test_health.py` with database connection mocking

#### 2. CI/CD Pipeline ✅
- **File:** `.github/workflows/railway-deploy.yml`
- **Changes:** Created GitHub Actions workflow for automatic Railway deployment
- **Features:**
  - Triggers on push to `main` branch (only when `weave-api/**` changes)
  - Manual trigger via `workflow_dispatch`
  - Installs Railway CLI and deploys via `railway up --detach`
  - Waits 30 seconds for deployment
  - Verifies health check at production URL
  - Notifies on deployment failure

#### 3. Documentation ✅
- **Files Modified:**
  - `CLAUDE.md` - Added "Production Deployment (Railway)" section with CLI commands
  - `docs/devops-strategy.md` - Enhanced "Incident Response & Rollback" section with detailed procedures
  - `docs/dev/railway-deployment-guide.md` - **NEW** comprehensive deployment guide

#### 4. Railway Deployment Guide ✅
- **File:** `docs/dev/railway-deployment-guide.md` (NEW)
- **Contents:**
  - Complete setup instructions (Railway project, environment variables, GitHub connection)
  - Deployment process (manual + automatic via GitHub Actions)
  - Health check verification procedures
  - Rollback procedures (automatic, CLI, dashboard, git-based)
  - Testing production API (curl commands, mobile app integration)
  - Monitoring and cost tracking
  - Security checklist
  - Troubleshooting common issues
  - GitHub secrets configuration

### Files Changed

```
Modified:
- weave-api/app/api/health.py
- weave-api/tests/test_health.py
- CLAUDE.md
- docs/devops-strategy.md
- docs/sprint-status.yaml
- docs/stories/epic-9/9-1-production-backend-deployment-ready-for-dev.md

Created:
- .github/workflows/railway-deploy.yml
- docs/dev/railway-deployment-guide.md
```

### Technical Decisions

1. **Health Check Database Verification:**
   - Uses minimal query (`SELECT id LIMIT 1`) to avoid performance impact
   - Queries `user_profiles` table (guaranteed to exist per Story 0.2a)
   - Returns 503 on failure for Railway automatic rollback

2. **GitHub Actions Workflow:**
   - Only triggers on `weave-api/**` path changes (avoids unnecessary deploys)
   - Uses Railway CLI for deployment (simple, official method)
   - Includes 30-second wait before health check (allows startup time)

3. **Documentation Strategy:**
   - CLAUDE.md: Quick reference for common commands
   - devops-strategy.md: Detailed rollback procedures for incidents
   - railway-deployment-guide.md: Complete end-to-end deployment guide

### Manual Steps Required

**⚠️ IMPORTANT: The following tasks require manual execution by Jack:**

1. **Railway Account Setup:**
   - Create Railway account at https://railway.app
   - Create production project: `weave-api-production`
   - Configure region: us-west-1
   - Link GitHub repository with root directory `/weave-api`

2. **Environment Variables:**
   - Configure 15+ production environment variables in Railway dashboard
   - Generate JWT secret: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
   - Add Supabase production credentials
   - Add AWS Bedrock credentials (primary AI provider)
   - Add OpenAI/Anthropic API keys (fallback providers)

3. **GitHub Secrets:**
   - Add `RAILWAY_TOKEN` to GitHub repo secrets
   - Add `RAILWAY_PROJECT_ID` to GitHub repo secrets

4. **First Deployment:**
   - Run `railway up` from `weave-api/` directory
   - Verify health check: `curl https://weave-api-production.railway.app/health`

5. **Production Testing:**
   - Test critical endpoints from mobile app staging build
   - Monitor Railway logs for errors
   - Verify auto-scaling configuration

### Acceptance Criteria Status

- [x] AC #3: CI/CD Pipeline - GitHub Actions workflow created
- [x] AC #4: Health Check - Endpoint enhanced with database verification
- [x] AC #6: Documentation - Rollback + deployment commands documented
- [ ] AC #1: Railway Setup - **MANUAL** (requires Railway account)
- [ ] AC #2: Environment Variables - **MANUAL** (requires Railway dashboard access)
- [ ] AC #5: Testing - **MANUAL** (requires production deployment)

### Next Steps for Jack

1. **Immediate (Story 9.1 Completion):**
   - Create Railway account and production project
   - Configure environment variables per `docs/dev/railway-deployment-guide.md`
   - Add GitHub secrets for CI/CD pipeline
   - Deploy backend: `railway up`
   - Test health check and critical endpoints

2. **Follow-up Stories:**
   - **Story 9.2:** Production Database Setup (Supabase Pro, migrations, backups)
   - **Story 9.7:** Production Monitoring Setup (Sentry, LogRocket, cost alerts)
   - **Story 9.8:** App Store Submission (TestFlight, beta testing)

### References

- **Deployment Guide:** `docs/dev/railway-deployment-guide.md` (comprehensive step-by-step)
- **Railway Docs:** https://docs.railway.app/
- **Health Endpoint:** `https://weave-api-production.railway.app/health` (after deployment)
- **GitHub Actions:** `.github/workflows/railway-deploy.yml`

---

**Implementation Status:** ✅ All automated infrastructure complete, pending manual Railway setup by Jack

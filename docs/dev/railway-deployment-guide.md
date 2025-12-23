# Railway Production Deployment Guide

**Story:** 9.1 - Production Backend Deployment  
**Created:** 2025-12-23  
**Status:** Implementation Complete (Pending Manual Deployment)

---

## Overview

This guide documents the Railway production deployment process for the Weave FastAPI backend. The deployment infrastructure is now fully configured and ready for manual deployment.

## Prerequisites

- Railway account with production project created
- GitHub repository with push access
- Railway CLI installed: `npm install -g @railway/cli`
- Access to Supabase production credentials

---

## Setup Instructions

### 1. Railway Project Setup

**Option A: Via Railway CLI**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create production project
cd /weave-prod/weave-api
railway init
railway project create weave-api-production

# Link to project
railway link <project-id>
```

**Option B: Via Railway Dashboard (Recommended)**

1. Visit https://railway.app/dashboard
2. Click "New Project" → "Empty Project"
3. Name: `weave-api-production`
4. Region: `us-west-1` (low latency for US users)

### 2. Environment Variables Configuration

Configure the following environment variables in Railway Dashboard → Settings → Variables:

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
JWT_SECRET=xxx  # 256-bit random string (generate with: python -c "import secrets; print(secrets.token_urlsafe(32))")
JWT_ALGORITHM=HS256

# Monitoring (Story 9.7 dependency - optional for MVP)
SENTRY_DSN=https://xxx@sentry.io/xxx
LOGROCKET_APP_ID=weave/production

# Environment
ENVIRONMENT=production
ENV=production
DEBUG=false
LOG_LEVEL=INFO
```

**Set via Railway CLI:**
```bash
railway variables set SUPABASE_URL=https://xxx.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=xxx
railway variables set AWS_REGION=us-east-1
# ... repeat for all variables
```

**Verify all environment variables:**
```bash
railway variables

# Expected: 15+ variables listed
```

### 3. GitHub Repository Connection

1. Railway Dashboard → Settings → "Connect GitHub"
2. Repository: `thejackluo/weave-prod`
3. Root Directory: `/weave-api` (⚠️ CRITICAL - not root)
4. Branch: `main`

Railway will auto-detect Python via `pyproject.toml` and run:
```bash
uv install --frozen
uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### 4. Configure Health Check

Railway Dashboard → Settings → Health Check:
- **Health Check Path:** `/health`
- **Timeout:** 30 seconds
- **Interval:** 60 seconds

Railway will automatically rollback if health check fails 3 times consecutively.

---

## Deployment Process

### Manual Deployment (First Time)

```bash
cd /weave-prod/weave-api

# Deploy to Railway
railway up

# Wait for deployment (2-5 minutes)
# Railway will build and deploy automatically

# Verify deployment
railway status

# Check logs
railway logs

# Test health check
curl https://weave-api-production.railway.app/health
```

### Automatic Deployment (GitHub Actions)

After the first manual deployment, GitHub Actions will automatically deploy on every push to `main`:

1. Push changes to `main` branch:
   ```bash
   git push origin main
   ```

2. GitHub Actions workflow (`.github/workflows/railway-deploy.yml`) triggers:
   - Installs Railway CLI
   - Links to project
   - Deploys to production
   - Waits 30 seconds
   - Verifies health check

3. View deployment status:
   ```bash
   gh run list --workflow=railway-deploy
   ```

---

## Health Check Verification

The health endpoint verifies:
- ✅ Backend is running
- ✅ Database connection is active

**Test health check:**
```bash
curl https://weave-api-production.railway.app/health

# Expected response:
{
  "status": "healthy",
  "service": "weave-api",
  "version": "0.1.0",
  "database": "connected",
  "timestamp": "2025-12-23T...",
  "port": 8000,
  "environment": "production"
}
```

**If unhealthy (503 response):**
```json
{
  "status": "unhealthy",
  "error": "Database connection failed: ...",
  "service": "weave-api",
  "timestamp": "2025-12-23T..."
}
```

---

## Rollback Procedures

### Automatic Rollback (Railway Default)
Railway automatically rolls back if:
- Health check fails 3 times consecutively
- Deployment crashes within 5 minutes of start

### Manual Rollback (Via Railway CLI)
```bash
# List recent deployments
railway deployments

# Output shows:
# ID              STATUS    DATE                COMMIT
# abc-123-def     success   2025-12-23 10:00    Fix bug
# xyz-456-ghi     success   2025-12-23 09:00    Add feature

# Rollback to specific deployment
railway deployment rollback xyz-456-ghi

# Verify rollback succeeded
curl https://weave-api-production.railway.app/health
```

### Manual Rollback (Via Railway Dashboard)
1. Go to https://railway.app/dashboard
2. Select `weave-api-production` project
3. Click "Deployments" tab
4. Find previous successful deployment
5. Click "Redeploy" on that deployment
6. Confirm rollback

---

## Testing Production API

### Critical Endpoints to Test

1. **Health Check (No Auth)**
   ```bash
   curl https://weave-api-production.railway.app/health
   ```

2. **Goals API (Auth Required)**
   ```bash
   curl -H "Authorization: Bearer <jwt-token>" \
        https://weave-api-production.railway.app/api/goals
   ```

3. **Journal Entries (Auth Required)**
   ```bash
   curl -X POST \
        -H "Authorization: Bearer <jwt-token>" \
        -H "Content-Type: application/json" \
        -d '{"content": "Test entry", "fulfillment_score": 7}' \
        https://weave-api-production.railway.app/api/journal-entries
   ```

4. **Voice Transcription (Auth Required)**
   ```bash
   curl -X POST \
        -H "Authorization: Bearer <jwt-token>" \
        -F "audio=@test.mp3" \
        https://weave-api-production.railway.app/api/transcribe
   ```

### Mobile App Testing

Update mobile app API base URL for production testing:

**File:** `weave-mobile/src/utils/api.ts`

```typescript
const API_BASE_URL = __DEV__
  ? 'http://localhost:8000'  // Local dev
  : 'https://weave-api-production.railway.app';  // Production
```

**Build staging mobile app:**
```bash
cd weave-mobile
npx expo build:ios --release-channel staging
```

**Test critical flows:**
1. Create goal → Verify `POST /api/goals` works
2. Log bind completion → Verify `POST /api/completions` works
3. Create journal entry → Verify `POST /api/journal-entries` works
4. Upload voice memo → Verify `POST /api/transcribe` works

---

## Monitoring

### View Logs
```bash
# Real-time logs
railway logs

# Logs for specific deployment
railway logs --deployment <deployment-id>

# Filter by level
railway logs --filter ERROR
```

### Check Resource Usage
```bash
# View CPU, memory, network usage
railway metrics

# Output shows:
# - CPU usage (%)
# - Memory usage (MB)
# - Network bandwidth
# - Estimated monthly cost
```

### Cost Monitoring

**Railway Pricing (as of 2025-12):**
- **Starter Plan:** $5/month (500 hours, 512MB RAM, 1GB storage)
- **Team Plan:** $20/month (2000 hours, 2GB RAM, 10GB storage)

**Set Billing Alert:**
1. Visit https://railway.app/account/billing
2. Click "Set Usage Alert"
3. Alert threshold: `$40/month`
4. Email notification to: engineering@weave.com

**Expected Monthly Cost:**
- Backend compute: $5-20/month (Starter plan sufficient for MVP)
- Total infrastructure: ~$30-50/month (including Supabase Pro $25/month)

---

## Security Checklist

- ✅ No secrets committed to GitHub (`git log -p | grep -i "secret"`)
- ✅ JWT secret is 256-bit random string
- ✅ HTTPS enforced (Railway auto-provides SSL via Let's Encrypt)
- ✅ CORS configured (only allow mobile app origin)
- ✅ RLS policies enabled on all user tables (Story 0.4)
- ✅ Health check endpoint requires no authentication
- ✅ All other endpoints require JWT authentication

---

## Troubleshooting

### Deployment Fails
```bash
# Check deployment logs
railway logs --deployment <deployment-id>

# Common issues:
# 1. Missing environment variables → Set in Railway dashboard
# 2. Database connection failed → Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
# 3. Port binding error → Railway sets $PORT dynamically, ensure app binds to 0.0.0.0:$PORT
```

### Health Check Fails
```bash
# Test locally first
cd weave-api
export ENVIRONMENT=production
uv run uvicorn app.main:app --reload

# Test health check locally
curl http://localhost:8000/health

# If local works but Railway fails:
# 1. Check Railway logs for errors
# 2. Verify database credentials in Railway variables
# 3. Test database connection from Railway environment
```

### Database Connection Issues
```bash
# Test Supabase connection
psql $DATABASE_URL -c "SELECT 1"

# If connection fails:
# 1. Verify SUPABASE_SERVICE_ROLE_KEY is correct
# 2. Check Supabase dashboard for database status
# 3. Ensure IP allowlist includes Railway (or set to 0.0.0.0/0 for MVP)
```

---

## GitHub Secrets Required

Configure these secrets in GitHub repo settings for CI/CD:

1. **RAILWAY_TOKEN**
   - Get from: https://railway.app/account/tokens
   - Create new token: "GitHub Actions Deploy"
   - Copy token value

2. **RAILWAY_PROJECT_ID**
   - Get from Railway CLI:
     ```bash
     railway status
     # Output shows: Project ID: abc-xyz-123-def-456
     ```
   - Or from Railway dashboard URL:
     `https://railway.app/project/<project-id>`

**Set secrets:**
```bash
# Via GitHub CLI
gh secret set RAILWAY_TOKEN --body "your-railway-token"
gh secret set RAILWAY_PROJECT_ID --body "your-project-id"

# Or via GitHub UI:
# Repo → Settings → Secrets and variables → Actions → New repository secret
```

---

## Next Steps After Deployment

1. **Story 9.2:** Production Database Setup (Supabase Pro, migrations, backups)
2. **Story 9.7:** Production Monitoring Setup (Sentry, LogRocket, cost alerts)
3. **Story 9.8:** App Store Submission (TestFlight, beta testing, final submission)

---

## References

- **Story File:** `docs/stories/epic-9/9-1-production-backend-deployment-ready-for-dev.md`
- **Epic File:** `docs/prd/epic-9-production-launch.md`
- **DevOps Strategy:** `docs/devops-strategy.md`
- **CI/CD Guide:** `docs/dev/ci-cd-setup.md`
- **Railway Docs:** https://docs.railway.app/
- **Supabase Docs:** https://supabase.com/docs

---

**Status:** ✅ Implementation Complete (Pending Manual Deployment)  
**Last Updated:** 2025-12-23  
**Implemented By:** Amelia (Dev Agent) via BMAD dev-story workflow

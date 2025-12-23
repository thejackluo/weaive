# 📋 Manual Production Deployment Guide - Story 9.1

**Date:** 2025-12-23  
**Story:** Epic 9, Story 9.1 - Production Backend Deployment  
**Status:** Ready for Manual Execution  
**Estimated Time:** 1-2 hours

---

## ✅ What's Already Done (By Code Review Agent)

The following have been **automatically implemented** by the code review fixes:

- ✅ Health endpoint created (`weave-api/app/api/health.py`)
- ✅ CI/CD workflow created (`.github/workflows/railway-deploy.yml`)
- ✅ PORT binding added to `app/main.py` (required for Railway)
- ✅ Deployment tests created (17 tests in `weave-api/tests/deployment/`)
- ✅ Test fixtures registered in `conftest.py`
- ✅ Security tests enhanced (JWT entropy, AWS Bedrock, expired tokens)
- ✅ Monitoring tests added (`test_monitoring.py`)
- ✅ Rollback procedures documented (`docs/devops-strategy.md`)

---

## 🚨 What You Need to Do Manually

This checklist covers the **manual setup steps** that require your intervention (creating Railway project, configuring secrets, testing deployment).

---

## Part 1: Railway Project Setup (15 minutes)

### Step 1.1: Create Railway Account (if needed)

1. Go to https://railway.app
2. Sign up with GitHub account
3. Verify email address

### Step 1.2: Create Production Project

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login
```

Follow the browser prompt to authorize Railway CLI.

### Step 1.3: Create Project from Dashboard

1. Go to https://railway.app/dashboard
2. Click "+ New Project"
3. Select "Empty Project"
4. Name it: **"weave-api-production"**
5. Region: **us-west1** (California - low latency for US users)

### Step 1.4: Link Project to CLI

```bash
cd weave-api
railway link
# Select: weave-api-production (from list)
```

This creates `.railway` directory with project configuration.

### Step 1.5: Get Project ID

```bash
# Get project ID (needed for GitHub Actions)
railway status

# Output:
# Project: weave-api-production
# Project ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  ← COPY THIS
```

**Save this Project ID** - you'll need it for GitHub Secrets.

---

## Part 2: Environment Variables Configuration (30 minutes)

### Step 2.1: Required Environment Variables

You need to set **15 environment variables** in Railway. Go to:
1. Railway Dashboard → weave-api-production → Variables tab
2. Click "+ Add Variable"

#### Database Variables (3)

```bash
# From your Supabase production project
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  
DATABASE_URL=postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres
```

**Where to find these:**
- Go to https://supabase.com/dashboard
- Select your **production** project (NOT staging)
- Settings → API
  - `SUPABASE_URL` = Project URL
  - `SUPABASE_SERVICE_ROLE_KEY` = service_role key (under "Project API keys")
- Settings → Database
  - `DATABASE_URL` = Connection string (URI format)

#### AI Provider Variables (6)

```bash
# AWS Bedrock (for Claude AI via Amazon)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...  # 20 characters, starts with AKIA
AWS_SECRET_ACCESS_KEY=...  # 40 characters

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Anthropic (direct API)
ANTHROPIC_API_KEY=sk-ant-...

# Google AI (for Gemini)
GOOGLE_AI_API_KEY=AIza...
```

**Where to get these:**
- **AWS Bedrock:** https://console.aws.amazon.com/iam/ (create IAM user with Bedrock access)
- **OpenAI:** https://platform.openai.com/api-keys
- **Anthropic:** https://console.anthropic.com/settings/keys
- **Google AI:** https://aistudio.google.com/app/apikey

**Important:** Use **production** API keys, NOT development keys.

#### Auth Variables (2)

```bash
JWT_SECRET=<generate-strong-256-bit-secret>  # See below for how to generate
JWT_ALGORITHM=HS256
```

**Generate strong JWT_SECRET:**
```bash
# Method 1: OpenSSL (Mac/Linux)
openssl rand -base64 32

# Method 2: Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Method 3: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Requirements:**
- At least 32 characters (256 bits)
- High entropy (random alphanumeric + special chars)
- NOT "changeme", "secret", "12345...", etc.

#### Monitoring Variables (2)

```bash
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
LOGROCKET_APP_ID=weave/production
```

**Where to get these:**
- **Sentry:** https://sentry.io/ → Create project → Copy DSN
- **LogRocket:** https://logrocket.com/ → Create app → Copy App ID

**Note:** Both have free tiers. Set up now, integrate later.

#### Environment Variables (2)

```bash
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO
```

**Critical:** Set `DEBUG=false` and `ENVIRONMENT=production` for security.

### Step 2.2: Verify All Variables Set

```bash
# List all environment variables
railway variables

# Expected output (15 variables):
AWS_ACCESS_KEY_ID=AKIA...
AWS_REGION=us-east-1
AWS_SECRET_ACCESS_KEY=...
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=AIza...
JWT_SECRET=...
JWT_ALGORITHM=HS256
SENTRY_DSN=https://...
LOGROCKET_APP_ID=weave/production
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO
```

**If any are missing, add them now.**

---

## Part 3: GitHub Secrets Configuration (10 minutes)

### Step 3.1: Add Railway Secrets to GitHub

Go to GitHub repository settings:
1. Settings → Secrets and variables → Actions
2. Click "New repository secret"

Add these secrets:

```bash
# Railway deployment token
RAILWAY_TOKEN=<your-railway-token>

# Railway project ID (from Step 1.5)
RAILWAY_PROJECT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Where to get RAILWAY_TOKEN:**
```bash
# Generate token via CLI
railway tokens create

# Or get from Railway dashboard:
# Profile → Account Settings → Tokens → Create Token
```

### Step 3.2: Verify GitHub Secrets

Go to: Repository → Settings → Secrets and variables → Actions

You should see:
- `RAILWAY_TOKEN` ✅
- `RAILWAY_PROJECT_ID` ✅

---

## Part 4: First Manual Deployment (20 minutes)

### Step 4.1: Verify Railway Configuration

Check that Railway configuration files exist:
```bash
cd weave-api
cat railway.json
cat nixpacks.toml
```

**Expected:**
- `railway.json` - Railway service configuration (health checks, restart policy)
- `nixpacks.toml` - Build configuration (uv package manager, start command)

**Why two files?**
- `railway.json` → Service configuration (replicas, health checks, restart policy)
- `nixpacks.toml` → Build configuration (how to install dependencies and start app)

This is Railway's modern standard (2024+) replacing the old `railpack.json` format.

### Step 4.2: Deploy via Railway CLI

```bash
# Deploy to production
railway up

# Railway will:
# 1. Detect railway.json configuration
# 2. Install uv package manager
# 3. Sync dependencies (uv sync --frozen)
# 4. Build and upload container
# 5. Start service with: uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT
# 6. Run health checks at /health endpoint
# 7. Auto-rollback if health checks fail 3x
```

**Expected output:**
```
Building...
Uploading...
Deploying...
✓ Deployment successful
URL: https://weave-api-production.railway.app
```

**Deployment time:** 2-5 minutes (first deploy is slower)

### Step 4.3: Verify Health Endpoint

```bash
# Test health endpoint
curl https://weave-api-production.railway.app/health

# Expected response (200 OK):
{
  "status": "healthy",
  "service": "weave-api",
  "version": "0.1.0",
  "database": "connected",
  "timestamp": "2025-12-23T10:00:00Z",
  "port": 8000,
  "environment": "production"
}
```

**If health check FAILS (503):**
```bash
# Check Railway logs
railway logs --tail 100

# Common issues:
# 1. Database connection failed → Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
# 2. Port binding failed → Verify app/main.py has `host="0.0.0.0"` and uses PORT env var
# 3. Environment variable missing → Check `railway variables`
```

### Step 4.4: Test Critical Endpoints

**Get a test JWT token:**
```bash
# Method 1: From mobile app (if logged in)
# Check console logs for token after login

# Method 2: Generate test token (for testing only)
cd weave-api
python -c "
import jwt
from datetime import datetime, timedelta
payload = {
    'sub': 'test-user-id',
    'email': 'test@weave-test.com',
    'iat': datetime.utcnow(),
    'exp': datetime.utcnow() + timedelta(hours=1)
}
print(jwt.encode(payload, 'your-JWT_SECRET-from-railway', algorithm='HS256'))
"
```

**Test authenticated endpoints:**
```bash
export TOKEN="<your-jwt-token-here>"
export API_URL="https://weave-api-production.railway.app"

# 1. Test goals endpoint
curl -H "Authorization: Bearer $TOKEN" $API_URL/api/goals

# Expected: 200 OK with goals list (may be empty)

# 2. Test completions endpoint
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"subtask_instance_id": "test"}' \
  $API_URL/api/completions

# Expected: 400 or 404 (validation error or not found - both OK)
# Should NOT return 500 (server error)
```

---

## Part 5: Configure CI/CD Auto-Deployment (5 minutes)

### Step 5.1: Verify Workflow File

The workflow file `.github/workflows/railway-deploy.yml` already exists (created by code review fixes).

Check it:
```bash
cat .github/workflows/railway-deploy.yml
```

Should contain:
- Trigger: `on: push: branches: [main]`
- Steps: Checkout → Install Railway CLI → Deploy → Health Check

### Step 5.2: Test Auto-Deployment

```bash
# Make a trivial commit to trigger workflow
cd weave-api
echo "# Production ready" >> README.md
git add README.md
git commit -m "test: trigger production deployment"
git push origin main
```

**Monitor deployment:**
1. Go to GitHub → Actions tab
2. Watch "Deploy to Railway Production" workflow
3. Should complete in 3-5 minutes

### Step 5.3: Verify Auto-Deployment

```bash
# Check health after auto-deploy
curl https://weave-api-production.railway.app/health

# Should return 200 OK
```

**If workflow FAILS:**
1. Check GitHub Actions logs
2. Verify RAILWAY_TOKEN and RAILWAY_PROJECT_ID secrets
3. Check Railway dashboard for errors

---

## Part 6: Test Rollback Procedures (10 minutes)

### Step 6.1: List Deployments

```bash
railway deployments

# Output:
# ID               Status     Created At           Message
# 7a8b9c0d         success    2025-12-23 11:00     test: trigger production deployment
# 6a7b8c9d         success    2025-12-23 10:00     feat: health endpoint
```

### Step 6.2: Test Rollback

```bash
# Rollback to previous deployment
railway deployment rollback 6a7b8c9d

# Wait 30-60 seconds

# Verify rollback
curl https://weave-api-production.railway.app/health
```

**Expected:** Health endpoint still returns 200 OK.

### Step 6.3: Roll Forward Again

```bash
# Deploy latest again
railway up

# Or just push to main again (triggers auto-deploy)
```

---

## Part 7: Run Deployment Tests (15 minutes)

### Step 7.1: Set Test Environment Variables

```bash
cd weave-api

# Create .env.deployment file
cat > .env.deployment << EOF
PRODUCTION_API_URL=https://weave-api-production.railway.app
PRODUCTION_JWT_SECRET=<your-JWT_SECRET-from-railway>
SUPABASE_URL=<your-SUPABASE_URL-from-railway>
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-AWS_ACCESS_KEY_ID>
AWS_SECRET_ACCESS_KEY=<your-AWS_SECRET_ACCESS_KEY>
SENTRY_DSN=<your-SENTRY_DSN>
LOGROCKET_APP_ID=weave/production
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO
EOF
```

### Step 7.2: Run Deployment Tests

```bash
# Load environment variables
export $(cat .env.deployment | xargs)

# Run deployment tests
uv run pytest tests/deployment/ -v --maxfail=5

# Expected: 25+ tests (17 original + 8 new from code review)
# All should pass or skip (if env vars missing)
```

**Expected output:**
```
tests/deployment/test_railway_deployment.py::TestPreDeployment::test_health_endpoint_exists PASSED
tests/deployment/test_railway_deployment.py::TestCICDPipeline::test_github_workflow_file_exists PASSED
tests/deployment/test_railway_deployment.py::TestPostDeployment::test_production_health_endpoint_responds PASSED
tests/deployment/test_production_api_endpoints.py::TestAuthenticatedEndpoints::test_production_goals_endpoint_with_auth PASSED
tests/deployment/test_production_security.py::TestSecurityConfiguration::test_jwt_secret_is_strong PASSED
tests/deployment/test_aws_bedrock.py::TestAWSBedrockCredentials::test_aws_bedrock_env_vars_configured PASSED
tests/deployment/test_monitoring.py::TestMonitoringConfiguration::test_sentry_dsn_configured PASSED
...

======================== 25 passed, 2 skipped in 12.5s ========================
```

**If tests fail:**
- Check environment variables: `echo $PRODUCTION_API_URL`
- Verify production API is running: `railway status`
- Check Railway logs: `railway logs --tail 50`

---

## Part 8: Update Documentation (5 minutes)

### Step 8.1: Update Story Status

Edit `docs/stories/epic-9/9-1-production-backend-deployment.md`:

Change:
```markdown
**Status:** Ready for Development
**Validation Status:** ✅ Validated (2025-12-23)
```

To:
```markdown
**Status:** ✅ Complete
**Validation Status:** ✅ Deployed (2025-12-23)
**Production URL:** https://weave-api-production.railway.app
```

### Step 8.2: Update CLAUDE.md

Add to `CLAUDE.md` under "Production Deployment" section:

```markdown
### Production Deployment Commands

```bash
# Deploy to production
cd weave-api
railway up

# View production logs
railway logs --follow

# Rollback deployment
railway deployments
railway deployment rollback <deployment-id>

# Health check
curl https://weave-api-production.railway.app/health
```

**Production URL:** https://weave-api-production.railway.app
```

---

## ✅ Final Checklist

Before marking Story 9.1 as complete, verify:

- [ ] Railway production project created
- [ ] All 15 environment variables configured in Railway
- [ ] GitHub secrets configured (RAILWAY_TOKEN, RAILWAY_PROJECT_ID)
- [ ] First manual deployment succeeded (railway up)
- [ ] Health endpoint returns 200 OK
- [ ] Critical endpoints tested (goals, completions, journal)
- [ ] Auto-deployment workflow tested (push to main)
- [ ] Rollback procedure tested
- [ ] Deployment tests pass (25+ tests)
- [ ] Documentation updated (story status, CLAUDE.md)

---

## 🎯 Success Criteria Met

If all checklist items are checked, you have successfully completed:

✅ Railway production project configured  
✅ All environment variables set  
✅ CI/CD pipeline deployed and tested  
✅ Health check endpoint responding correctly  
✅ Production API tested from command line  
✅ Rollback procedure documented and tested  
✅ Code reviewed and approved  
✅ Deployed to production  

**Estimated Total Time:** 1-2 hours

---

## 🚨 Troubleshooting

### Issue: Health check returns 503

**Symptoms:** `curl https://weave-api-production.railway.app/health` returns 503 Service Unavailable

**Solution:**
```bash
# Check Railway logs
railway logs --tail 100

# Common causes:
# 1. Database connection failed
railway variables get SUPABASE_URL
railway variables get SUPABASE_SERVICE_ROLE_KEY

# 2. Port binding issue
# Verify app/main.py has: uvicorn.run("app.main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)))

# 3. Environment variable typo
railway variables | grep SUPABASE
```

### Issue: GitHub Actions workflow fails

**Symptoms:** "Deploy to Railway Production" workflow fails with error

**Solution:**
```bash
# 1. Check secrets are set
gh secret list

# Expected:
# RAILWAY_TOKEN
# RAILWAY_PROJECT_ID

# 2. Verify Railway token is valid
railway whoami

# 3. Check workflow logs
gh run list --workflow=railway-deploy.yml
gh run view <run-id> --log
```

### Issue: Tests fail with "fixture not found"

**Symptoms:** `pytest tests/deployment/` fails with `fixture 'production_api_url' not found`

**Solution:**
```bash
# Verify environment variable is set
echo $PRODUCTION_API_URL

# Should return: https://weave-api-production.railway.app
# If empty, run: export PRODUCTION_API_URL=https://weave-api-production.railway.app
```

---

## 📞 Support

If you encounter issues not covered here:

1. Check Railway logs: `railway logs --tail 100`
2. Check GitHub Actions logs: `gh run list`
3. Check Supabase dashboard for database status
4. Review `docs/devops-strategy.md` for detailed troubleshooting

**Emergency Rollback:**
```bash
railway deployments
railway deployment rollback <previous-deployment-id>
```

---

**Document Created:** 2025-12-23  
**Last Updated:** 2025-12-23  
**Owner:** Engineering Team  
**Status:** Ready for Execution

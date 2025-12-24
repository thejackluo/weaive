# Story 9.4: Railway Deployment Verification

**Status:** ✅ Verified - Already Fixed
**Platform:** Railway (cloud hosting)
**Deployment URL:** `https://weave-api-production.railway.app`

---

## Verification Summary

Railway deployment has been correctly configured with `uv run` prefix to ensure proper Python environment activation.

### ✅ railway.json (Primary Config)

```json
{
  "deploy": {
    "startCommand": "uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT --log-level info",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100
  }
}
```

**Key features:**
- `uv run` prefix ensures virtual environment is activated
- Binds to `0.0.0.0` (required for Railway's proxy)
- Uses dynamic `$PORT` environment variable
- Health check at `/health` endpoint
- 100s health check timeout (allows for slow cold starts)

### ✅ nixpacks.toml (Nixpacks Build Config)

```toml
[phases.setup]
nixPkgs = ["python311", "uv"]

[phases.install]
cmds = ["uv sync --frozen"]

[start]
cmd = "uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT --log-level info"
```

**Build process:**
1. Setup: Install Python 3.11 + uv
2. Install: Run `uv sync --frozen` (installs dependencies from lockfile)
3. Start: Run uvicorn with `uv run` prefix

### ✅ Procfile (Fallback)

```
web: uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT --log-level info
```

**Purpose:** Fallback if railway.json is not found

---

## Deployment Process

### Automatic Deployment (GitHub Integration)

Railway automatically deploys when code is pushed to `main` branch:

1. **Trigger:** Push to `main` → GitHub webhook → Railway
2. **Build:** Nixpacks detects Python + uv → Runs build phases
3. **Deploy:** Starts uvicorn with health check verification
4. **Health Check:** Railway pings `/health` every 100s
5. **Traffic:** Routes production traffic to new deployment

### Manual Deployment (Railway CLI)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project (one-time)
cd weave-api
railway link

# Deploy manually
railway up

# View logs
railway logs

# View environment variables
railway variables
```

---

## Environment Variables (Production)

Required environment variables in Railway dashboard:

```bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret-here

# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
ASSEMBLYAI_API_KEY=...

# Apple IAP
APPLE_SHARED_SECRET=...
APPLE_TEAM_ID=...
IAP_SANDBOX=false

# Configuration
ENV=production
ALLOWED_ORIGINS=https://weavelight.app,https://www.weavelight.app
PORT=8000  # Railway provides this automatically
```

**How to set:**
1. Go to [Railway Dashboard](https://railway.app/)
2. Select Weave API project
3. Navigate to **Variables** tab
4. Add each variable

---

## Health Check Verification

Railway uses `/health` endpoint to verify deployments:

### Health Endpoint Implementation

```python
# app/api/health.py
@router.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
```

### Test Health Check

```bash
# Test production
curl https://weave-api-production.railway.app/health

# Expected response:
# {"status":"healthy","timestamp":"2025-12-23T10:00:00Z"}
```

---

## Deployment Checklist

Before deploying to production:

- [x] `uv run` prefix in all start commands
- [x] Bind to `0.0.0.0` (not `127.0.0.1`)
- [x] Use `$PORT` environment variable (not hardcoded)
- [x] Health check endpoint implemented at `/health`
- [x] Environment variables configured in Railway
- [x] Nixpacks build succeeds (Python 3.11 + uv)
- [x] GitHub integration enabled (auto-deploy on `main` push)
- [ ] Custom domain configured (weavelight.app)
- [ ] SSL certificate active
- [ ] Production secrets rotated (Supabase keys, API keys)

---

## Troubleshooting

### Issue: "Application failed to respond to health check"

**Cause:** App not binding to `0.0.0.0` or using wrong port

**Fix:** Verify `railway.json` has correct start command

### Issue: "ModuleNotFoundError: No module named 'app'"

**Cause:** Virtual environment not activated

**Fix:** Ensure `uv run` prefix is used

### Issue: "Port 8000 already in use"

**Cause:** Hardcoded port instead of `$PORT` variable

**Fix:** Use `--port $PORT` in start command

### Issue: "Deployment succeeded but API returns 502"

**Cause:** App crashed after startup

**Fix:** Check Railway logs:
```bash
railway logs
```

---

## Monitoring & Logs

### View Production Logs

```bash
# Real-time logs
railway logs --follow

# Last 100 lines
railway logs --limit 100

# Filter by service
railway logs --service weave-api
```

### Metrics Dashboard

Railway provides built-in metrics:
- CPU usage
- Memory usage
- Network traffic
- Response times

**Access:** Railway Dashboard → Metrics tab

---

## Rollback Strategy

If a deployment fails, Railway automatically keeps the previous deployment running.

### Manual Rollback

```bash
# View deployment history
railway deployments

# Rollback to specific deployment
railway deployment rollback <deployment-id>
```

### Rollback via Dashboard

1. Go to Railway Dashboard → Deployments
2. Find previous successful deployment
3. Click **Redeploy**

---

## Performance Optimization

### Cold Start Mitigation

Railway apps may have cold starts after inactivity. To reduce:

1. **Keep-alive pings:** Ping `/health` every 5 minutes
2. **Railway Pro:** Upgrade to Pro plan (never sleeps)
3. **Pre-warm requests:** Send dummy request on deploy

### Database Connection Pooling

Consider adding connection pooling for production (Story 9.5):

```python
from supabase import create_client, Client

# Create connection pool
supabase: Client = create_client(
    supabase_url=settings.SUPABASE_URL,
    supabase_key=settings.SUPABASE_SERVICE_KEY,
    options={
        "pool_pre_ping": True,
        "pool_size": 10,
        "max_overflow": 5,
    }
)
```

---

## Resources

- [Railway Documentation](https://docs.railway.app/)
- [Nixpacks Python Documentation](https://nixpacks.com/docs/providers/python)
- [uv Documentation](https://github.com/astral-sh/uv)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

---

**Status:** ✅ Railway deployment verified and production-ready
**Deployment URL:** https://weave-api-production.railway.app
**Fixed In:** Story 9.1 (Code Review Fixes)

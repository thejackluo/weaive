# Story 9.1: Production Backend Deployment

**Epic:** Epic 9 - Production Launch & App Store Publishing
**Priority:** M (Must Have)
**Estimate:** 5 story points
**Status:** Ready for Development

---

## User Story

**As a** developer
**I want to** deploy the FastAPI backend to Railway production
**So that** the mobile app can connect to a stable, production-grade API

---

## Acceptance Criteria

### Railway Setup
- [ ] Create Railway production project (`weave-api-production`)
- [ ] Configure project settings:
  - Region: us-west-1 (low latency for US users)
  - Instance type: Shared vCPU, 512MB RAM (scale to 1GB if needed)
  - Auto-scaling: Enabled (max 3 instances)

### Environment Variables
- [ ] Configure production environment variables in Railway dashboard:
  ```bash
  # Database
  SUPABASE_URL=https://xxx.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=xxx
  DATABASE_URL=postgresql://xxx

  # AI Providers
  OPENAI_API_KEY=sk-proj-xxx
  ANTHROPIC_API_KEY=sk-ant-xxx
  GOOGLE_AI_API_KEY=xxx

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

### CI/CD Pipeline
- [ ] Create GitHub Actions workflow for production deployment
- [ ] Configure workflow to trigger on push to `main` branch
- [ ] Add Railway deployment step using Railway GitHub Action
- [ ] Test CI/CD pipeline with sample commit

### Health Check
- [ ] Ensure `/health` endpoint exists and returns 200 status
- [ ] Health check verifies:
  - Backend is running
  - Database connection is active
  - Essential services are available
- [ ] Configure Railway health check to use `/health` endpoint

### Testing
- [ ] Deploy backend to Railway production
- [ ] Test production API from mobile app staging build
- [ ] Verify all critical endpoints respond correctly:
  - `GET /api/goals`
  - `POST /api/completions`
  - `POST /api/journal-entries`
  - `POST /api/transcribe`
- [ ] Monitor logs for errors during testing

### Documentation
- [ ] Document rollback procedure in production runbook:
  - How to revert to previous deployment
  - Railway's automatic rollback on failed health check
  - Manual rollback via Railway dashboard
- [ ] Document production deployment process for team

---

## Technical Notes

### Railway CLI Setup
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to existing project
railway link <project-id>

# Deploy
railway up
```

### Security Best Practices
- **Never commit secrets to GitHub** - Use Railway's secrets dashboard
- Store all sensitive environment variables in Railway (not `.env` files)
- Use strong, randomly generated JWT_SECRET (256-bit)

### Health Check Implementation
```python
# weave-api/app/main.py
@app.get("/health")
async def health_check():
    """Health check endpoint for Railway."""
    try:
        # Test database connection
        await check_db_connection()
        return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Unhealthy: {str(e)}")
```

### Auto-Scaling Configuration
- Railway auto-scales based on CPU/memory usage
- Max 3 instances prevents runaway costs
- Minimum 1 instance ensures zero-downtime

---

## Dependencies

**Requires:**
- Epic 0 complete (FastAPI backend exists)
- Supabase production instance (Story 9.2 can be done in parallel)

**Unblocks:**
- Story 9.7 (Production Monitoring Setup)
- Story 9.8 (App Store Submission)

---

## Definition of Done

- [ ] Railway production project created and configured
- [ ] All environment variables set in Railway dashboard
- [ ] CI/CD pipeline deployed and tested
- [ ] Health check endpoint responding correctly
- [ ] Production API tested from mobile app
- [ ] Rollback procedure documented
- [ ] Code reviewed and approved
- [ ] Deployed to production

---

## Testing Checklist

- [ ] Backend deploys successfully via GitHub Actions
- [ ] Health check returns 200 status
- [ ] Database connection verified in production
- [ ] Mobile app can connect to production API
- [ ] All critical endpoints return expected responses
- [ ] Logs accessible via Railway dashboard

---

## Resources

- **Railway Documentation:** https://docs.railway.app/
- **Railway GitHub Action:** https://github.com/marketplace/actions/railway-deploy
- **FastAPI Deployment Guide:** https://fastapi.tiangolo.com/deployment/

---

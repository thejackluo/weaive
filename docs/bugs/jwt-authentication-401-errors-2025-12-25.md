# JWT Authentication 401 Unauthorized Errors

## Summary
All API requests returning 401 Unauthorized with "Signature verification failed" errors. Backend health endpoint shows database connected, but JWT token validation is failing for all authenticated endpoints.

## Error Messages
```
Backend Logs:
WARNING:app.core.deps:⚠️  Invalid JWT token: Signature verification failed
INFO: 192.168.1.70:65492 - "GET /api/binds/today HTTP/1.1" 401 Unauthorized
INFO: 192.168.1.70:65493 - "GET /api/goals?status=active HTTP/1.1" 401 Unauthorized
INFO: 192.168.1.70:65494 - "GET /api/journal-entries/today HTTP/1.1" 401 Unauthorized

Mobile App Logs:
ERROR [BINDS_SERVICE] API error: 500 {"error": {"code": "INTERNAL_ERROR", "message": "Authentication is not configured on the server"}}
ERROR [JOURNAL_API] ❌ API error: 500
```

## Root Causes

### 1. **Incorrect JWT Secret** (PRIMARY ISSUE)
The `SUPABASE_JWT_SECRET` in `weave-api/.env` does not match the actual JWT secret from Supabase project settings.

**Current (WRONG):**
```bash
SUPABASE_JWT_SECRET=TkyLIINyDRklETxyI5tKIg_q78AqcoD
```

**Problem:** This appears to be a truncated or incorrect value. Supabase JWT secrets are typically 40-60 characters and may end with `=` or `==` (base64 padding).

**How JWT verification works:**
1. Mobile app gets JWT token from Supabase Auth (signed with Supabase's JWT secret)
2. Backend tries to verify token using `SUPABASE_JWT_SECRET` from `.env`
3. If secrets don't match → Signature verification fails → 401 Unauthorized

### 2. **Port Mismatch** (SECONDARY ISSUE)
Mobile app and backend are configured to use different ports.

```bash
# Mobile: weave-mobile/.env
API_BASE_URL=http://192.168.1.6:8003  ❌

# Backend: Running on
http://0.0.0.0:8000  ✅
```

### 3. **Trailing Slash in Supabase URL** (MINOR ISSUE)
```bash
# Backend: weave-api/.env
SUPABASE_URL=https://jywfusrgwybljusuofnp.supabase.co/  ❌ Remove trailing slash

# Should be:
SUPABASE_URL=https://jywfusrgwybljusuofnp.supabase.co  ✅
```

## Impact
- **All authenticated API endpoints fail** - Users cannot access any protected resources
- **Backend health check passes** - Database connection works, misleading symptom
- **Silent auth failures** - App shows loading states but never resolves
- **No data loading** - Goals, binds, journal entries all fail to fetch

## Diagnosis Steps

### 1. Check Backend Logs
```bash
# View running backend logs
cat /tmp/claude/-Users-arman-Desktop-weavelight-main-weave-api/tasks/[task-id].output

# Look for:
# ✅ Good: "Application startup complete"
# ✅ Good: "database": "connected"
# ❌ Bad: "Invalid JWT token: Signature verification failed"
# ❌ Bad: "401 Unauthorized"
```

### 2. Test Health Endpoint
```bash
curl http://localhost:8000/health | jq .

# Expected response:
{
  "status": "healthy",
  "database": "connected",  # ✅ This proves DB config is correct
  "service": "weave-api"
}
```

### 3. Test Authenticated Endpoint
```bash
# Get JWT token from mobile app logs or Supabase dashboard
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8000/api/goals

# Expected error (if JWT secret is wrong):
# 401 Unauthorized
# {"error": {"code": "UNAUTHORIZED", "message": "Invalid authentication token"}}
```

### 4. Verify JWT Secret Format
```bash
# JWT secrets are base64-encoded, often end with = or ==
# Typical length: 40-60 characters
# Example format: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890+/=="

# Your JWT secret should look similar to this pattern
```

## Files Affected
- `weave-api/.env` - Backend environment configuration (JWT secret, Supabase URL)
- `weave-mobile/.env` - Mobile app configuration (API base URL)
- `weave-api/app/core/deps.py:85-151` - JWT verification logic
- `weave-api/app/core/config.py:34-36` - Settings validation

## Solution Steps

### Step 1: Get Correct JWT Secret from Supabase
1. Go to https://supabase.com/dashboard
2. Select your project: `jywfusrgwybljusuofnp`
3. Navigate to: **Settings** → **API** → **Configuration**
4. Find section: **JWT Settings** → **JWT Secret**
5. Click **"Reveal"** to show the secret
6. Copy the ENTIRE secret (it will be a long base64 string)

### Step 2: Update Backend .env
Edit `weave-api/.env`:

```bash
# Fix JWT secret (use the one from Supabase dashboard)
SUPABASE_JWT_SECRET=your-actual-jwt-secret-from-supabase-here==

# Fix Supabase URL (remove trailing slash)
SUPABASE_URL=https://jywfusrgwybljusuofnp.supabase.co

# Keep other settings as-is
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
```

### Step 3: Fix Mobile App Port
Edit `weave-mobile/.env`:

```bash
# Fix port to match backend (8000, not 8003)
API_BASE_URL=http://192.168.1.6:8000

# Keep other settings as-is
EXPO_PUBLIC_SUPABASE_URL=https://jywfusrgwybljusuofnp.supabase.co/
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Restart Backend Server
```bash
# Kill existing backend process
# (Find process ID from /tasks/ or use: lsof -i :8000)
kill [process-id]

# Restart backend (will reload .env)
cd weave-api
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 5: Restart Mobile App
```bash
# Clear Metro bundler cache
cd weave-mobile
npm run start:clean

# Or just restart normally
npm start
```

### Step 6: Verify Fix
```bash
# 1. Check backend logs for NO MORE "Signature verification failed" errors
# 2. Check mobile app logs for successful API calls
# 3. Test authentication by logging in
# 4. Verify data loads (goals, binds, journal entries)
```

## Prevention for Future

### 1. Environment Setup Checklist
When setting up a new environment, verify:

- [ ] `SUPABASE_JWT_SECRET` matches **exactly** with Supabase dashboard (Settings → API → JWT Secret)
- [ ] No trailing slashes in `SUPABASE_URL`
- [ ] API ports match between mobile and backend (default: 8000)
- [ ] Restart backend after changing `.env` files (env vars are loaded at startup)

### 2. Validation Script
Add to `weave-api/scripts/validate-env.py`:

```python
#!/usr/bin/env python3
"""Validate .env configuration before starting server"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

def validate_jwt_secret():
    jwt_secret = os.getenv("SUPABASE_JWT_SECRET")
    if not jwt_secret:
        print("❌ SUPABASE_JWT_SECRET is not set")
        return False
    if len(jwt_secret) < 32:
        print(f"⚠️  SUPABASE_JWT_SECRET seems too short ({len(jwt_secret)} chars)")
        print("   Expected: 40-60 characters (base64-encoded)")
        return False
    print(f"✅ SUPABASE_JWT_SECRET: {len(jwt_secret)} characters")
    return True

def validate_supabase_url():
    url = os.getenv("SUPABASE_URL")
    if url and url.endswith("/"):
        print(f"⚠️  SUPABASE_URL has trailing slash: {url}")
        print("   Remove it: SUPABASE_URL=https://xxx.supabase.co")
        return False
    print(f"✅ SUPABASE_URL: {url}")
    return True

if __name__ == "__main__":
    all_valid = True
    all_valid &= validate_jwt_secret()
    all_valid &= validate_supabase_url()

    if not all_valid:
        print("\n❌ Environment validation failed")
        exit(1)
    print("\n✅ All environment variables valid")
```

Run before starting server:
```bash
python scripts/validate-env.py && uv run uvicorn app.main:app --reload
```

### 3. .env.example Documentation
Update `weave-api/.env.example` with clear instructions:

```bash
# SUPABASE_JWT_SECRET - CRITICAL for authentication
#
# ⚠️  MUST match your Supabase project's JWT secret EXACTLY
#
# How to find it:
# 1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
# 2. Scroll to "JWT Settings" → "JWT Secret"
# 3. Click "Reveal" and copy the ENTIRE secret
# 4. Paste here (usually 40-60 chars, may end with = or ==)
#
# Example (DO NOT USE THIS):
# SUPABASE_JWT_SECRET=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefg1234567890==
#
SUPABASE_JWT_SECRET=
```

## Related Issues
- [Security Architecture](../security-architecture.md) - JWT verification design
- [Story 0.3](../stories/0-3-jwt-authentication.md) - JWT authentication implementation
- [Backend Patterns](../dev/backend-patterns-guide.md) - Authentication patterns

## References
- Supabase JWT Secret Location: `Settings → API → Configuration → JWT Settings`
- Backend JWT Verification: `weave-api/app/core/deps.py:85-151`
- PyJWT Documentation: https://pyjwt.readthedocs.io/en/stable/
- Base64 Encoding: https://en.wikipedia.org/wiki/Base64

## Date Discovered
2025-12-25

## Status
**IDENTIFIED** - Root causes documented, solution steps provided

## Fixed In
Pending manual fix by developer (requires Supabase dashboard access)

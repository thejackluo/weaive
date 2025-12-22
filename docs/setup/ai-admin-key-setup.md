# AI Admin Key Setup Guide

**Purpose:** Configure admin API key for unlimited AI chat access during development/testing.

---

## Quick Setup

### 1. Add to Backend `.env`

**File:** `weave-api/.env`

```bash
# AI Chat Admin Access
AI_ADMIN_KEY=dev-admin-key-12345-change-in-production
```

### 2. Restart Backend

```bash
cd weave-api
uv run uvicorn app.main:app --reload
```

### 3. Verify

You should NO LONGER see this warning:
```
[ADMIN_KEY_CHECK] AI_ADMIN_KEY not set in .env!
```

---

## What This Key Does

**Location:** `weave-api/app/config/ai_chat_config.py:60-69`

```python
ADMIN_API_KEY: Optional[str] = os.getenv('AI_ADMIN_KEY', None)
```

### Features Unlocked

| Feature | Without Admin Key | With Admin Key |
|---------|-------------------|----------------|
| **AI Chat Messages** | 10 premium + 40 free/day | ✅ Unlimited |
| **Rate Limiting** | Strict (500/month) | ✅ Bypassed |
| **Admin Endpoints** | ❌ 403 Forbidden | ✅ Access granted |
| **Testing** | Blocked after 10 msgs | ✅ Test freely |

### Admin-Only Endpoints

These require `X-Admin-Key` header:

- `POST /api/admin/trigger-checkin/{user_id}` - Manually trigger AI check-in for a user

---

## Usage

### Backend Testing (curl)

```bash
curl -X POST http://localhost:8000/api/ai-chat/messages/stream \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-Admin-Key: dev-admin-key-12345-change-in-production" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, test unlimited access"}'
```

### Frontend Testing (Development Only)

**File:** `weave-mobile/src/services/apiClient.ts`

```typescript
// ⚠️ DEVELOPMENT ONLY - Never hardcode in production
if (__DEV__) {
  apiClient.defaults.headers.common['X-Admin-Key'] =
    'dev-admin-key-12345-change-in-production';
}
```

---

## Security Best Practices

### Development

```bash
# Simple key for local dev (OK)
AI_ADMIN_KEY=dev-admin-key-12345-change-in-production
```

### Production

```bash
# Generate a secure 32-byte key
openssl rand -hex 32

# Or use Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Example output:
AI_ADMIN_KEY=8f3a9b2c7e1d4f6a8b9c0e2f4a6b8c9d1e3f5a7b9c0d2e4f6a8b0c2d4e6f8a0b
```

### Security Checklist

- ✅ **DO**: Use different keys for dev/staging/production
- ✅ **DO**: Keep in `.env` (already in `.gitignore`)
- ✅ **DO**: Rotate key periodically (every 90 days)
- ✅ **DO**: Use 32+ character hex/base64 strings
- ❌ **DON'T**: Hardcode in source files
- ❌ **DON'T**: Commit to version control
- ❌ **DON'T**: Share in public channels
- ❌ **DON'T**: Use in production mobile app client-side

---

## Rate Limiting Logic

**File:** `weave-api/app/api/ai_chat_router.py:62-71`

```python
def check_admin_key(x_admin_key: Optional[str] = Header(None)) -> bool:
    """Check if request has valid admin key for bypass."""
    if not AIChatConfig.ADMIN_API_KEY:
        return False  # No admin key configured = no bypass

    is_valid = x_admin_key == AIChatConfig.ADMIN_API_KEY
    return is_valid
```

**Flow:**
1. Request includes `X-Admin-Key` header
2. Backend compares to `AI_ADMIN_KEY` from `.env`
3. If match: `is_admin=True` → bypass all rate limits
4. If no match: `is_admin=False` → normal tier limits apply

---

## Troubleshooting

### Warning: "AI_ADMIN_KEY not set in .env!"

**Cause:** Missing or misnamed environment variable.

**Fix:**
```bash
# Check current .env
cd weave-api
grep "ADMIN" .env

# ✅ CORRECT: AI_ADMIN_KEY (with AI_ prefix)
AI_ADMIN_KEY=dev-admin-key-12345-change-in-production

# ❌ WRONG: ADMIN_API_KEY (missing AI_ prefix - not used by code)
ADMIN_API_KEY=dev-unlimited-access-key-2025
```

**Common mistake:** Having `ADMIN_API_KEY` (without `AI_` prefix) in `.env`.

**Why it fails:**
- Code reads: `os.getenv('AI_ADMIN_KEY', None)` - looks for `AI_ADMIN_KEY`
- If you have: `ADMIN_API_KEY=...` - this is ignored (wrong name)
- Result: Backend thinks no admin key is configured

**Solution:** Remove the old `ADMIN_API_KEY` line and use only `AI_ADMIN_KEY`.

### Admin Key Not Working

**Debug checklist:**
1. ✅ Key is named `AI_ADMIN_KEY` (not `ADMIN_API_KEY`)
2. ✅ No extra spaces or quotes: `AI_ADMIN_KEY=value` (not `AI_ADMIN_KEY = "value"`)
3. ✅ Backend restarted after adding key
4. ✅ Header name is `X-Admin-Key` (not `X-Admin-API-Key`)
5. ✅ Header value matches exactly (case-sensitive)

**Test:**
```bash
# Check if key is loaded
cd weave-api
uv run python -c "from app.config.ai_chat_config import AIChatConfig; print(f'Admin key loaded: {AIChatConfig.ADMIN_API_KEY is not None}')"
```

**Expected:** `Admin key loaded: True`

---

## Related Documentation

- **Story 6.1:** `docs/stories/6-1-ai-chat-interface.md` (Task 8: Admin bypass)
- **AI Chat Config:** `weave-api/app/config/ai_chat_config.py:60-69`
- **Rate Limiter:** `weave-api/app/services/ai/tiered_rate_limiter.py`
- **Admin Check Logic:** `weave-api/app/api/ai_chat_router.py:62-71`

---

## Quick Reference

| Environment Variable | Purpose | Default | Example |
|---------------------|---------|---------|---------|
| `AI_ADMIN_KEY` | Admin bypass key | None | `dev-admin-key-12345` |
| `AI_FREE_PREMIUM_DAILY_LIMIT` | Free tier Sonnet/day | 10 | `10` |
| `AI_FREE_FREE_DAILY_LIMIT` | Free tier Haiku/day | 40 | `40` |
| `AI_FREE_MONTHLY_LIMIT` | Free tier total/month | 500 | `500` |
| `AI_PRO_MONTHLY_LIMIT` | Pro tier total/month | 5000 | `5000` |

**All variables:** See `weave-api/app/config/ai_chat_config.py`

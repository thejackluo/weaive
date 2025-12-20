# Multi-Worktree Setup Guide

## Overview

This guide explains how to run multiple mobile apps against different backend ports when working on multiple worktrees simultaneously.

## Quick Setup

### 1. Configure Backend Port in Each Worktree

Each worktree needs its own backend port. Edit `.env` in `weave-mobile/`:

**Worktree 1 (.env):**
```bash
API_BASE_URL=http://localhost:8000
EXPO_PUBLIC_SUPABASE_URL=https://jywfusrgwybljusuofnp.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Worktree 2 (.env):**
```bash
API_BASE_URL=http://localhost:8001
EXPO_PUBLIC_SUPABASE_URL=https://jywfusrgwybljusuofnp.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Start Backend on Different Ports

**Terminal 1 (Worktree 1):**
```bash
cd weave-api
PORT=8000 uv run uvicorn app.main:app --reload --port 8000
```

**Terminal 2 (Worktree 2):**
```bash
cd weave-api
PORT=8001 uv run uvicorn app.main:app --reload --port 8001
```

### 3. Start Mobile Apps

**Terminal 3 (Worktree 1):**
```bash
cd weave-mobile
npm run start:clean  # --clear is important to reload .env
```

**Terminal 4 (Worktree 2):**
```bash
cd weave-mobile
npm run start:clean  # --clear is important to reload .env
```

### 4. Verify Setup

Each mobile app will show a **blue banner** at the top in dev mode:
```
🔧 Dev Mode - API Port: 8000
http://localhost:8000
```

You can also verify by hitting the health endpoint:
```bash
curl http://localhost:8000/health
# Response: {"status":"ok","service":"weave-api","version":"0.1.0","port":8000,"environment":"development"}

curl http://localhost:8001/health
# Response: {"status":"ok","service":"weave-api","version":"0.1.0","port":8001,"environment":"development"}
```

## How It Works

### Mobile App Configuration Flow

1. **app.config.js** loads `.env` using dotenv
2. Injects `API_BASE_URL` into `expo.extra.apiBaseUrl`
3. **src/utils/api.ts** reads from `Constants.expoConfig.extra.apiBaseUrl`
4. **Services** (e.g., `onboarding.ts`) use `getApiBaseUrl()` for API calls
5. **DevEnvironmentBanner** displays current API URL in dev mode

### Backend Configuration

- Backend reads `PORT` from environment variable
- `/health` endpoint returns port for verification
- Each instance can run on different ports (8000, 8001, 8002, etc.)

## Troubleshooting

### Mobile app still using old API URL

**Solution:** Run with `--clear` flag to reload app.config.js:
```bash
npm run start:clean
```

### "API_BASE_URL is not configured" error

**Solution:** Ensure `.env` file exists with `API_BASE_URL` set:
```bash
# In weave-mobile/
cat .env
# Should show: API_BASE_URL=http://localhost:8000
```

### Backend not responding

**Solution:** Verify backend is running on correct port:
```bash
# Check if port is in use
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Test health endpoint
curl http://localhost:8000/health
```

### Environment banner not showing

**Solution:** Banner only appears in dev mode (`__DEV__ === true`). If not visible:
- Check that you're running `npm start` (not production build)
- Banner appears at top of screen (may be behind status bar)

## Tips for Epic 4 Development

When working on Epic 4 stories across multiple worktrees:

1. **Use different test users** - Create separate accounts (agent1@test.com, agent2@test.com) to avoid auth conflicts
2. **Monitor API logs** - Each backend shows which port it's running on in startup logs
3. **Clear cache between switches** - Always use `npm run start:clean` when changing .env
4. **Verify health check** - Quick sanity check that you're hitting the right backend

## Architecture Notes

### Why app.config.js instead of EXPO_PUBLIC_ vars?

- **Zero-rebuild switching** - EXPO_PUBLIC_ vars require full rebuild (~30s), app.config.js only needs Metro cache clear (~3s)
- **Dynamic logic** - app.config.js can execute JavaScript for conditional configuration
- **Better for secrets** - Extra field not embedded in bundle (though Supabase anon key is intentionally public)

### File Structure

```
weave-mobile/
├── .env                        # Your API configuration (git-ignored)
├── .env.example                # Template for new worktrees
├── app.config.js               # Dynamic config (loads .env)
├── src/
│   ├── utils/api.ts            # getApiBaseUrl() utility
│   ├── components/
│   │   └── DevEnvironmentBanner.tsx  # Shows API URL in dev
│   └── services/
│       └── onboarding.ts       # Uses getApiBaseUrl()

weave-api/
├── app/
│   └── api/
│       └── health.py           # Enhanced with port info
```

## Related Documentation

- **CLAUDE.md** - Overall project setup
- **docs/architecture/core-architectural-decisions.md** - Data access patterns
- **docs/dev/git-workflow-guide.md** - Worktree management

# CI/CD Setup and Troubleshooting Guide

**Last Updated:** 2025-12-19

## Overview

This guide covers setting up and troubleshooting the CI/CD pipeline for Weave. Our CI/CD system uses GitHub Actions for automated testing, linting, and building.

**Related Documents:**
- [Git Workflow Guide](git-workflow-guide.md) - Branch protection rules and PR process
- Story 0.5 - CI/CD Pipeline implementation details

---

## Table of Contents

1. [GitHub Secrets Setup](#github-secrets-setup)
2. [Workflow Overview](#workflow-overview)
3. [Triggering EAS Build Manually](#triggering-eas-build-manually)
4. [Common CI Failures and Fixes](#common-ci-failures-and-fixes)
5. [Cache Management](#cache-management)
6. [Railway Deployment](#railway-deployment)
7. [Monitoring and Alerts](#monitoring-and-alerts)
8. [Troubleshooting](#troubleshooting)

---

## GitHub Secrets Setup

### Required Secrets

The CI/CD pipeline requires these secrets to be configured in your GitHub repository:

| Secret Name | Purpose | Where to Get It | Expires? |
|-------------|---------|-----------------|----------|
| `EXPO_TOKEN` | Authenticates EAS Build | https://expo.dev/settings/access-tokens | Yes (90 days) |
| `SUPABASE_URL` | Backend tests need database access | `weave-api/.env` | No |
| `SUPABASE_SERVICE_KEY` | Backend tests need admin access | `weave-api/.env` | No (rotate annually) |
| `RAILWAY_TOKEN` | *Optional* - For automated deployment | https://railway.app/account/tokens | No |

---

### Step-by-Step: Adding GitHub Secrets

#### 1. Generate EXPO_TOKEN

```bash
# Option A: Via Expo CLI
cd weave-mobile
npx expo login
npx expo whoami  # Verify login
# Then visit https://expo.dev/settings/access-tokens

# Option B: Via Website
# 1. Visit https://expo.dev/settings/access-tokens
# 2. Click "Create Token"
# 3. Name: "GitHub Actions CI/CD"
# 4. Expiration: 90 days (recommended for security)
# 5. Click "Create Token"
# 6. Copy the token (you won't see it again!)
```

**⏰ Set a reminder** to rotate this token in 80 days (before expiration).

---

#### 2. Get Supabase Credentials

```bash
# From your weave-api/.env file
cd weave-api
grep SUPABASE .env

# You'll see:
# SUPABASE_URL=https://xxxxx.supabase.co
# SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ Security Note:** The `SUPABASE_SERVICE_KEY` is an admin key. Never commit it to Git or share it publicly.

---

#### 3. Add Secrets to GitHub

**Via GitHub Website:**

1. Go to: `https://github.com/thejackluo/weavelight/settings/secrets/actions`
2. Click "New repository secret"
3. Add each secret:
   - **Name:** `EXPO_TOKEN`
   - **Value:** (paste token from Expo)
   - Click "Add secret"
4. Repeat for `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`

**Via GitHub CLI:**

```bash
# Add EXPO_TOKEN
gh secret set EXPO_TOKEN

# Prompt will ask for the value (paste your token)

# Add SUPABASE secrets (one-liner)
gh secret set SUPABASE_URL --body "https://xxxxx.supabase.co"
gh secret set SUPABASE_SERVICE_KEY --body "eyJhbGciOi..."

# Verify secrets were added
gh secret list
```

**Output:**
```
EXPO_TOKEN              Updated 2025-12-19
SUPABASE_URL            Updated 2025-12-19
SUPABASE_SERVICE_KEY    Updated 2025-12-19
```

---

#### 4. Verify Secrets Work

**Trigger a backend test workflow to verify:**

```bash
# Make a trivial change to trigger backend CI
echo "# Test" >> weave-api/README.md
git add weave-api/README.md
git commit -m "test: verify CI secrets"
git push

# Watch the workflow run
gh run watch
```

**Expected:** Backend tests pass (not "SUPABASE_URL is not set" error).

---

### Secret Rotation Schedule

| Secret | Rotation Frequency | How to Rotate |
|--------|-------------------|---------------|
| `EXPO_TOKEN` | Every 90 days | Generate new token, update secret, delete old token |
| `SUPABASE_SERVICE_KEY` | Annually | Create new key in Supabase dashboard, update secret |
| `RAILWAY_TOKEN` | Annually | Create new token in Railway, update secret |

**Set calendar reminders** for these dates to avoid CI breakage!

---

## Workflow Overview

### Our 6 CI/CD Workflows

| Workflow | File | Triggers | Duration | Purpose |
|----------|------|----------|----------|---------|
| **Mobile Lint** | `mobile-lint.yml` | `weave-mobile/**` | ~1 min | ESLint 9 checks |
| **Backend Lint** | `backend-lint.yml` | `weave-api/**` | ~30s | Ruff checks |
| **Type Check** | `type-check.yml` | `**/*.ts`, `**/*.tsx` | ~1 min | TypeScript compiler |
| **Mobile Tests** | `mobile-tests.yml` | `weave-mobile/**` | ~2 min | Jest tests + coverage |
| **Backend Tests** | `backend-tests.yml` | `weave-api/**` | ~1 min | pytest + RLS security |
| **EAS Build** | `eas-build.yml` | Manual only | ~30s* | Trigger Expo build |

**\*Note:** EAS Build workflow completes in ~30s because it uses `--no-wait` flag. Actual build happens on Expo servers and takes 10-30 minutes.

---

### Path Filters (How They Work)

**Problem:** Mobile changes shouldn't trigger backend tests (wastes time and quota).

**Solution:** Each workflow has `paths:` filter to only run when relevant files change.

**Example:**
```yaml
on:
  push:
    branches: [main]
    paths:
      - 'weave-mobile/**'
      - '.github/workflows/mobile-lint.yml'
```

**What this means:**
- ✅ Change `weave-mobile/App.tsx` → Mobile lint **runs**
- ❌ Change `weave-api/main.py` → Mobile lint **skips**
- ✅ Change `.github/workflows/mobile-lint.yml` → Mobile lint **runs** (to test the workflow itself)

---

### Workflow Dependencies

```
PR Created
    ↓
┌───────────────────────────────────┐
│  All 5 workflows run in parallel  │
├───────────────────────────────────┤
│  • mobile-lint                    │
│  • backend-lint                   │
│  • type-check                     │
│  • mobile-tests                   │
│  • backend-tests                  │
└───────────────────────────────────┘
    ↓
All pass? → PR can be merged ✅
Any fail? → PR blocked ❌
```

**No dependencies:** All workflows run independently. One failure doesn't stop others.

---

## Triggering EAS Build Manually

### Why Manual Trigger?

**For MVP:** EAS Build takes 10-30 minutes. We don't want it blocking every PR.

**Post-MVP:** Will auto-trigger on `v*` tags (e.g., `v0.1.0`) for production releases.

---

### Step-by-Step: Trigger EAS Build

#### Via GitHub Website

1. Go to: `https://github.com/thejackluo/weavelight/actions`
2. Click "EAS Build (Manual)" in the left sidebar
3. Click "Run workflow" button (top right)
4. Select:
   - **Branch:** `main` (or your feature branch)
   - **Platform:** `ios`, `android`, or `all`
5. Click "Run workflow" (green button)

**What happens:**
- Workflow starts (~10s to queue)
- Installs dependencies (~2 min)
- Triggers EAS Build with `--no-wait` flag (~5s)
- Workflow completes ✅ (~30s total)
- Build continues on Expo servers (10-30 min)

---

#### Via GitHub CLI

```bash
# Trigger iOS build on main branch
gh workflow run eas-build.yml \
  --ref main \
  --field platform=ios

# Trigger build for all platforms on a feature branch
gh workflow run eas-build.yml \
  --ref story/0.5-ci-cd \
  --field platform=all

# Watch the workflow (but it completes quickly)
gh run watch
```

---

#### Via Expo CLI (Alternative)

**If GitHub Actions is down or you prefer direct control:**

```bash
cd weave-mobile

# Build for iOS (internal distribution)
eas build --platform ios --profile preview

# Build for production
eas build --platform ios --profile production

# Build locally (requires Xcode)
eas build --platform ios --profile development --local
```

---

### Viewing EAS Build Status

```bash
# List recent builds
eas build:list

# View specific build
eas build:view <build-id>

# Download build artifact
eas build:download <build-id>
```

**Or via Expo website:** https://expo.dev/accounts/thejackluo/projects/weave/builds

---

## Common CI Failures and Fixes

### 1. Mobile Lint Failures

**Symptom:**
```
❌ mobile-lint
   weave-mobile/app/index.tsx:10:7 - Error: 'theme' is assigned a value but never used
   weave-mobile/components/Button.tsx:5:1 - Error: Unexpected console statement
```

**Cause:** ESLint 9 found code style violations.

**Fix:**
```bash
cd weave-mobile

# Run lint locally to see errors
npm run lint

# Auto-fix most issues
npm run lint -- --fix

# Fix remaining issues manually
# ... edit files ...

# Verify
npm run lint

# Commit and push
git add .
git commit -m "fix: eslint errors"
git push
```

**Common ESLint Errors:**
- Unused variables → Remove or prefix with `_` (e.g., `_theme`)
- `console.log` statements → Remove or use proper logging
- Missing semicolons → Add semicolons (or configure ESLint to allow)
- Incorrect imports → Fix import paths

---

### 2. Backend Lint Failures

**Symptom:**
```
❌ backend-lint
   weave-api/app/api/goals.py:15:1 - F401 'datetime' imported but unused
   weave-api/app/models/user.py:42:80 - E501 Line too long (95 > 88 characters)
```

**Cause:** Ruff found formatting or import issues.

**Fix:**
```bash
cd weave-api

# Run ruff locally
uv run ruff check .

# Auto-fix most issues
uv run ruff check . --fix

# Format code
uv run ruff format .

# Verify
uv run ruff check .

# Commit and push
git add .
git commit -m "fix: ruff formatting"
git push
```

**Common Ruff Errors:**
- Unused imports → Remove them
- Line too long → Break into multiple lines
- Import order → Ruff auto-fixes this with `--fix`
- Missing docstrings → Add if required by project config

---

### 3. Type Check Failures

**Symptom:**
```
❌ type-check
   weave-mobile/app/index.tsx:15:7 - error TS2322: Type 'string' is not assignable to type 'number'
   weave-mobile/components/Card.tsx:20:5 - error TS2304: Cannot find name 'useState'
```

**Cause:** TypeScript compiler found type errors.

**Fix:**
```bash
cd weave-mobile

# Run type check locally
npx tsc --noEmit

# Fix type errors
# Option A: Add correct types
const count: number = 0;  // Not "0" (string)

# Option B: Import missing types
import { useState } from 'react';

# Option C: Use type assertion (when you're sure)
const data = response as UserData;

# Verify
npx tsc --noEmit

# Commit and push
git add .
git commit -m "fix: typescript errors"
git push
```

**Common TypeScript Errors:**
- Type mismatch → Fix the type or cast
- Missing import → Add import statement
- `any` type → Add proper type annotation
- Null safety → Use optional chaining (`?.`) or null checks

---

### 4. Mobile Tests Failures

**Symptom:**
```
❌ mobile-tests
   FAIL  src/components/Button.test.tsx
     ● Button › renders correctly
       Expected: "Submit"
       Received: "Click Me"
```

**Cause:** Test expectations don't match implementation.

**Fix:**
```bash
cd weave-mobile

# Run tests locally
npm test

# Run specific test file
npm test -- Button.test.tsx

# Run in watch mode (for development)
npm test -- --watch

# Fix the test or implementation
# ... edit files ...

# Verify all tests pass
npm test

# Commit and push
git add .
git commit -m "fix: update button test expectations"
git push
```

**Common Test Issues:**
- Snapshot mismatch → Update snapshot: `npm test -- -u`
- Async timing → Add `await` or use `waitFor`
- Missing mock → Mock API calls or navigation
- Test isolation → Reset state between tests

---

### 5. Backend Tests Failures

**Symptom:**
```
❌ backend-tests
   FAILED tests/test_goals.py::test_create_goal - AssertionError: status code 500 != 201
   ERROR tests/test_rls.py - supabase.errors.AuthApiError: Invalid JWT
```

**Cause:** Tests failing due to implementation bugs, missing env vars, or RLS issues.

**Fix:**
```bash
cd weave-api

# Run tests locally
uv run pytest

# Run specific test file
uv run pytest tests/test_goals.py

# Run with verbose output
uv run pytest -v

# Run RLS security tests
uv run python scripts/test_rls_security.py

# Check environment variables
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_KEY

# If env vars missing, set them from .env
set -a
source .env
set +a

# Verify
uv run pytest

# Commit and push
git add .
git commit -m "fix: goals endpoint error handling"
git push
```

**Common Backend Test Issues:**
- `SUPABASE_URL not set` → Check GitHub secrets configured correctly
- Database schema mismatch → Run migrations before tests
- RLS policy blocking → Check policies allow service key access
- Import errors → Check dependencies installed: `uv sync --dev`

---

### 6. EAS Build Failures

**Symptom:**
```
❌ eas-build
   Error: EXPO_TOKEN is not set
```

**Cause:** GitHub secret not configured or expired.

**Fix:**
```bash
# Check if secret exists
gh secret list

# If missing, add it
gh secret set EXPO_TOKEN

# If expired, generate new token at:
# https://expo.dev/settings/access-tokens

# Re-run the workflow
gh workflow run eas-build.yml --ref main --field platform=ios
```

**Other EAS Build Issues:**
- **Build times out:** Expo servers overloaded (wait and retry)
- **Invalid credentials:** Re-run `eas build:configure`
- **Bundle size too large:** Check for large assets, optimize images

---

## Cache Management

### How Caching Works

**npm caching (mobile):**
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v6
  with:
    node-version: '22'
    cache: 'npm'
    cache-dependency-path: weave-mobile/package-lock.json
```

**What's cached:** `node_modules/` (dependencies)
**Cache key:** Hash of `package-lock.json`
**Cache invalidation:** Automatic when `package-lock.json` changes

---

**uv caching (backend):**
```yaml
- name: Install uv
  uses: astral-sh/setup-uv@v7
  with:
    enable-cache: true
    cache-dependency-glob: "weave-api/uv.lock"
```

**What's cached:** Python packages and uv cache
**Cache key:** Hash of `uv.lock`
**Cache invalidation:** Automatic when `uv.lock` changes

---

### Viewing Caches

```bash
# List all caches for the repo
gh cache list

# Output:
# mobile-lint-Linux-22-abc123    10 MB    1 hour ago
# backend-lint-Linux-3.11-def456 5 MB     2 hours ago
```

---

### Clearing Caches

**When to clear:**
- CI passes locally but fails in GitHub Actions
- Dependency install errors ("corrupted cache")
- After major dependency upgrades

**How to clear:**

```bash
# Delete specific cache
gh cache delete <cache-key>

# Delete all caches (nuclear option)
gh cache list | awk '{print $1}' | xargs -I {} gh cache delete {}
```

**Or via GitHub Website:**
1. Go to: `https://github.com/thejackluo/weavelight/actions/caches`
2. Click "X" next to cache to delete

**Cache will rebuild on next CI run** (~2-3 minutes extra time for first run).

---

### Cache Performance

| Workflow | First Run (no cache) | Cached Run | Speedup |
|----------|----------------------|------------|---------|
| mobile-lint | ~3 min | ~1 min | 66% faster |
| backend-lint | ~1 min | ~30s | 50% faster |
| mobile-tests | ~5 min | ~2 min | 60% faster |
| backend-tests | ~2 min | ~1 min | 50% faster |

**Average:** Cache reduces CI time by ~60%.

---

## Railway Deployment

### MVP Strategy: Manual Deployment

**For MVP:** Deploy backend manually using Railway CLI.

```bash
cd weave-api

# Install Railway CLI (one-time)
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Deploy
railway up

# View logs
railway logs

# View deployment URL
railway open
```

---

### Post-MVP: Automated Deployment

**Future implementation (Story 0.6 or later):**

1. **Add RAILWAY_TOKEN secret:**
   ```bash
   # Generate token at https://railway.app/account/tokens
   gh secret set RAILWAY_TOKEN
   ```

2. **Create `.github/workflows/railway-deploy.yml`:**
   ```yaml
   name: Deploy to Railway
   on:
     push:
       branches: [main]
       paths:
         - 'weave-api/**'
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v5
         - name: Install Railway CLI
           run: npm install -g @railway/cli
         - name: Deploy
           run: railway up --service weave-api
           env:
             RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
   ```

---

### Railway Configuration

**In `railway.toml` (create if missing):**
```toml
[build]
builder = "NIXPACKS"
buildCommand = "uv sync --locked"

[deploy]
startCommand = "uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3

[env]
PYTHON_VERSION = "3.11"
```

---

## Monitoring and Alerts

### GitHub Actions Dashboard

**View all workflows:**
```bash
gh workflow list

# Output:
# Mobile Lint        active  12345
# Backend Lint       active  12346
# Type Check         active  12347
# Mobile Tests       active  12348
# Backend Tests      active  12349
# EAS Build (Manual) active  12350
```

**View recent runs:**
```bash
# All workflows
gh run list

# Specific workflow
gh run list --workflow=mobile-lint

# Failed runs only
gh run list --status=failure

# Watch live
gh run watch
```

---

### Email Notifications

**GitHub sends emails for:**
- Workflow failures (if you're the author)
- Workflow cancellations
- Long-running workflows (>1 hour)

**Customize notifications:**
1. Go to: https://github.com/settings/notifications
2. Adjust "Actions" section
3. Choose: Email, Web, or Mobile

---

### Slack Integration (Future)

**Post-MVP enhancement:**

1. Create Slack webhook
2. Add `SLACK_WEBHOOK_URL` secret
3. Add notification step to workflows:
   ```yaml
   - name: Notify Slack
     if: failure()
     run: |
       curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
         -H 'Content-Type: application/json' \
         -d '{"text":"❌ Mobile lint failed on main"}'
   ```

---

## Troubleshooting

### Problem: "Workflow not triggering"

**Symptoms:**
- Push code to branch
- No CI runs appear

**Possible causes:**
1. **Path filter excluded changes**
   - Changed `README.md` (not in path filter)
   - **Fix:** Workflows intentionally skip unrelated changes

2. **Branch not `main` and no PR open**
   - Workflows trigger on: `push` to `main` OR `pull_request` to `main`
   - **Fix:** Open a PR or push to `main`

3. **Workflow file syntax error**
   - YAML indentation broken
   - **Fix:** Validate YAML at https://yamllint.com

4. **Workflow disabled**
   - Someone manually disabled it
   - **Fix:** Go to Actions tab → Select workflow → "Enable workflow"

---

### Problem: "CI passes locally but fails in GitHub Actions"

**Common causes:**

1. **Different Node/Python version**
   - Local: Node 20, CI: Node 22
   - **Fix:** Match versions in workflow file and `.nvmrc` / `pyproject.toml`

2. **Missing environment variable**
   - Works locally with `.env` file
   - CI doesn't have the secret
   - **Fix:** Add secret to GitHub (see [Secrets Setup](#github-secrets-setup))

3. **Cached dependencies out of sync**
   - Local has different versions
   - **Fix:** Clear CI cache (see [Cache Management](#cache-management))

4. **Race condition in tests**
   - Tests pass locally but fail randomly in CI
   - **Fix:** Use `--maxWorkers=2` for Jest, add `await` for async tests

---

### Problem: "Workflow stuck in 'Queued' status"

**Causes:**
1. **GitHub Actions quota exhausted**
   - Free tier: 2,000 minutes/month
   - **Check:** https://github.com/settings/billing
   - **Fix:** Wait for month reset or upgrade plan

2. **Concurrent workflow limit reached**
   - GitHub limits concurrent workflows
   - **Wait:** Other workflows will complete

3. **Large file in commit**
   - Checkout takes forever (>50MB file)
   - **Fix:** Use Git LFS or reduce file size

---

### Problem: "Secret not working"

**Symptoms:**
```
❌ backend-tests
   Error: SUPABASE_URL is not set
```

**Troubleshooting steps:**

1. **Verify secret exists:**
   ```bash
   gh secret list | grep SUPABASE
   ```

2. **Check secret name spelling:**
   - Secret: `SUPABASE_SERVICE_KEY`
   - Workflow: `${{ secrets.SUPABASE_SERVICE_KEY }}`
   - Must match exactly (case-sensitive)

3. **Check workflow file:**
   ```yaml
   env:
     SUPABASE_URL: ${{ secrets.SUPABASE_URL }}  # Correct
     # SUPABASE_URL: $SUPABASE_URL             # Wrong (doesn't work in GitHub Actions)
   ```

4. **Re-create secret:**
   ```bash
   gh secret delete SUPABASE_URL
   gh secret set SUPABASE_URL --body "https://xxxxx.supabase.co"
   ```

---

### Problem: "EAS Build fails with 'Resource not accessible by integration'"

**Cause:** `EXPO_TOKEN` is missing or invalid.

**Fix:**
1. Generate new token at https://expo.dev/settings/access-tokens
2. Update GitHub secret:
   ```bash
   gh secret set EXPO_TOKEN
   ```
3. Re-run workflow

---

### Problem: "Tests timeout after 6 hours"

**Cause:** Infinite loop or extremely slow test.

**Fix:**
1. **Check test logs** to find hanging test
2. **Add timeout to test:**
   ```typescript
   // Jest
   test('slow test', async () => {
     // ...
   }, 10000); // 10 second timeout

   // Pytest
   @pytest.mark.timeout(10)
   def test_slow():
       pass
   ```

3. **Cancel workflow:**
   ```bash
   gh run cancel <run-id>
   ```

---

## Quick Command Reference

### GitHub CLI Commands

```bash
# Workflows
gh workflow list                           # List all workflows
gh workflow run <workflow-name>            # Trigger workflow manually
gh workflow disable <workflow-name>        # Disable workflow

# Runs
gh run list                                # List recent workflow runs
gh run list --status=failure               # List failed runs
gh run view <run-id>                       # View run details
gh run watch                               # Watch current run live
gh run rerun <run-id>                      # Re-run failed workflow
gh run cancel <run-id>                     # Cancel running workflow

# Secrets
gh secret list                             # List all secrets
gh secret set <name>                       # Add/update secret
gh secret delete <name>                    # Delete secret

# Caches
gh cache list                              # List all caches
gh cache delete <cache-key>                # Delete specific cache
```

---

## Support and Resources

**Documentation:**
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Expo EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Railway Docs](https://docs.railway.app/)

**Project-Specific:**
- [Git Workflow Guide](git-workflow-guide.md) - Branch protection, PRs
- [BMAD Implementation Guide](bmad-implementation-guide.md) - Story workflow
- Story 0.5 - CI/CD Pipeline specifications

**Getting Help:**
- GitHub Actions failures → Check workflow logs
- EAS Build issues → Check Expo dashboard
- Railway deployment → Check Railway logs
- CI/CD questions → Review this guide or Story 0.5

---

**Last Updated:** 2025-12-19 (Story 0.5 Implementation)

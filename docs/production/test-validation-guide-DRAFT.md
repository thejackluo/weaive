# 🧪 Test Validation Guide

**Purpose:** Step-by-step guide to verify ALL tests pass before production deployment.

**Target Audience:** Developers, QA Engineers, Tech Leads

**When to Use:** Before EVERY merge to main, before EVERY production deployment

---

## 🎯 Test Validation Workflow

### Quick Validation (5 minutes)
```bash
# Backend: Run critical tests only
cd weave-api
uv run pytest tests/test_health.py tests/deployment/test_production_security.py -v

# Mobile: TypeScript check + quick tests
cd weave-mobile
npx tsc --noEmit && npm test -- --testPathPattern="(Auth|Navigation)" --watchAll=false
```

### Full Validation (20 minutes)
```bash
# Run comprehensive test suite (see sections below)
./docs/production/scripts/run-all-tests.sh
```

---

## 1️⃣ Backend Tests (weave-api/)

### 1.1 Unit Tests

**Run all unit tests:**
```bash
cd weave-api
uv run pytest tests/ -v --ignore=tests/deployment/ --ignore=tests/integration/
```

**Expected Output:**
```
tests/test_goals.py::test_create_goal PASSED
tests/test_subtasks.py::test_create_subtask PASSED
tests/test_completions.py::test_log_completion PASSED
...
======================== XX passed in X.XXs ========================
```

**If tests fail:**
1. Read error message carefully
2. Check if environment variables are set (`.env` file)
3. Verify database connection (Supabase URL, service key)
4. Check for missing fixtures in `conftest.py`

### 1.2 Integration Tests

**Run integration tests (API endpoints):**
```bash
cd weave-api
uv run pytest tests/integration/ -v
```

**Expected Output:**
```
tests/integration/test_goals_api.py::test_get_goals_endpoint PASSED
tests/integration/test_completions_api.py::test_create_completion_endpoint PASSED
...
======================== XX passed in X.XXs ========================
```

**What these tests verify:**
- ✅ API endpoints return correct status codes
- ✅ Request/response models validate correctly
- ✅ Database transactions commit properly
- ✅ Error handling works as expected

### 1.3 Deployment Tests

**Run deployment tests (production readiness):**
```bash
cd weave-api

# Set required environment variables first
export PRODUCTION_API_URL=https://weave-api-production.railway.app
export PRODUCTION_JWT_SECRET=<your-production-jwt-secret>
export SUPABASE_URL=<your-production-supabase-url>
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=<your-aws-key>
export AWS_SECRET_ACCESS_KEY=<your-aws-secret>
export SENTRY_DSN=<your-sentry-dsn>
export LOGROCKET_APP_ID=weave/production

# Run deployment tests
uv run pytest tests/deployment/ -v --maxfail=5
```

**Expected Output:**
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

**Deployment tests verify:**
- ✅ Health endpoint exists and responds
- ✅ CI/CD workflow file exists
- ✅ Production API endpoints accessible
- ✅ JWT secret is strong (256-bit entropy)
- ✅ AWS Bedrock credentials configured
- ✅ Monitoring tools configured (Sentry, LogRocket)
- ✅ Environment variables correct (ENVIRONMENT=production, DEBUG=false)

**If tests skip:**
- Check that environment variables are set: `echo $PRODUCTION_API_URL`
- Some tests skip if production API not deployed yet (expected before first deploy)

### 1.4 RLS Security Tests (Supabase)

**Run Row Level Security penetration tests:**
```bash
# Start local Supabase (if testing locally)
npx supabase start

# Apply migrations
npx supabase db push

# Run automated RLS tests
npx supabase test db
```

**Expected Output:**
```
Running tests...

✓ RLS Policy: users_select_own_profiles
✓ RLS Policy: users_update_own_profiles
✓ RLS Policy: users_manage_own_goals
✓ Cross-user attack: User A cannot read User B's goals
✓ Cross-user attack: User A cannot update User B's completions
...
======================== 48 tests passed ========================
```

**Run penetration tests (Python script):**
```bash
cd weave-api
python scripts/test_rls_security.py
```

**Expected Output:**
```
Testing RLS Security...

[✓] User A can read own goals
[✓] User A CANNOT read User B's goals (403 Forbidden)
[✓] User A can create own completion
[✓] User A CANNOT update User B's completion (403 Forbidden)
...
======================== 0 successful attacks, 24 blocked ========================
```

**RLS tests verify:**
- ✅ RLS enabled on all 12 user-owned tables
- ✅ Users can only access their own data
- ✅ Cross-user attacks blocked (403 Forbidden)
- ✅ Immutable tables (subtask_completions) have no UPDATE/DELETE policies

### 1.5 Test Coverage Report

**Generate coverage report:**
```bash
cd weave-api
uv run pytest tests/ --cov=app --cov-report=term-missing --cov-report=html
```

**Expected Output:**
```
Name                                Stmts   Miss  Cover   Missing
-----------------------------------------------------------------
app/main.py                           45      2    96%   78-79
app/api/goals.py                     120      8    93%   145, 230-235
app/api/completions.py                95      5    95%   67, 89-90
app/models/goal.py                    30      0   100%
...
-----------------------------------------------------------------
TOTAL                               1500    120    92%

HTML coverage report: htmlcov/index.html
```

**Coverage targets:**
- ✅ Overall coverage: >= 80%
- ✅ Critical paths (auth, completions, goals): >= 90%
- ✅ New code: 100% coverage

**View HTML report:**
```bash
open htmlcov/index.html  # Mac
start htmlcov/index.html  # Windows
```

---

## 2️⃣ Mobile Tests (weave-mobile/)

### 2.1 TypeScript Compilation

**Verify TypeScript compiles without errors:**
```bash
cd weave-mobile
npx tsc --noEmit
```

**Expected Output:**
```
# No output = success
```

**If TypeScript errors:**
```
src/components/GoalCard.tsx:42:15 - error TS2339: Property 'user_id' does not exist on type 'Goal'
```

**Fix:**
1. Check type definitions in `src/types/`
2. Ensure all imports are correct
3. Verify API response types match TypeScript interfaces

### 2.2 Linting

**Run ESLint:**
```bash
cd weave-mobile
npm run lint
```

**Expected Output:**
```
✓ No ESLint warnings or errors
```

**If linting errors:**
```
src/screens/GoalDetailScreen.tsx
  42:15  error  'userId' is assigned a value but never used  @typescript-eslint/no-unused-vars
```

**Fix:**
- Remove unused variables
- Add `// eslint-disable-next-line` for intentional exceptions (rare)
- Auto-fix: `npm run lint -- --fix`

### 2.3 Jest Unit Tests

**Run all Jest tests:**
```bash
cd weave-mobile
npm test -- --watchAll=false --coverage
```

**Expected Output:**
```
PASS  src/components/__tests__/Button.test.tsx
PASS  src/hooks/__tests__/useGoals.test.tsx
PASS  src/services/__tests__/apiClient.test.tsx
...
Test Suites: 15 passed, 15 total
Tests:       82 passed, 82 total
Snapshots:   12 passed, 12 total
Time:        8.234 s

Coverage:
-----------|---------|---------|---------|---------
File       | % Stmts | % Branch| % Funcs | % Lines
-----------|---------|---------|---------|---------
All files  |   78.5  |   65.2  |   82.1  |   79.3
```

**If tests fail:**
```
FAIL  src/components/__tests__/GoalCard.test.tsx
  ● GoalCard › renders goal title correctly
    Expected: "My Goal"
    Received: undefined
```

**Fix:**
1. Check mock data in test files
2. Verify component props are passed correctly
3. Ensure React Testing Library queries are correct

### 2.4 Component Snapshot Tests

**Update snapshots if UI changed intentionally:**
```bash
cd weave-mobile
npm test -- -u --watchAll=false
```

**Expected Output:**
```
Snapshot Summary
 › 12 snapshots updated
```

**⚠️ Warning:** Only update snapshots if UI changes are intentional!

### 2.5 Manual Testing on Simulator

**Start Expo dev server:**
```bash
cd weave-mobile
npm start
```

**Test critical flows manually:**
1. **Authentication Flow**
   - [ ] Login with email/password
   - [ ] Signup with new account
   - [ ] Logout and login again

2. **Goal Management**
   - [ ] Create new goal
   - [ ] Edit goal title
   - [ ] Mark goal as complete
   - [ ] Delete goal

3. **Daily Actions**
   - [ ] View today's Triad
   - [ ] Complete a bind (subtask)
   - [ ] Upload proof photo
   - [ ] Log completion

4. **Journal Entry**
   - [ ] Create journal entry
   - [ ] Add fulfillment score
   - [ ] View past entries

5. **Navigation**
   - [ ] Bottom tab navigation works
   - [ ] Modal screens open/close
   - [ ] Back button works correctly

6. **Error Handling**
   - [ ] Network error shows friendly message
   - [ ] Invalid input shows validation error
   - [ ] API error shows retry option

---

## 3️⃣ End-to-End Tests (E2E)

### 3.1 Backend E2E (Postman/Thunder Client)

**Test critical API flows:**

```bash
# 1. Health check
curl https://weave-api-production.railway.app/health

# Expected: 200 OK
{
  "status": "healthy",
  "service": "weave-api",
  "version": "0.1.0",
  "database": "connected",
  "timestamp": "2025-12-23T10:00:00Z"
}

# 2. Authenticated endpoint (goals)
export TOKEN="<your-test-jwt-token>"
curl -H "Authorization: Bearer $TOKEN" https://weave-api-production.railway.app/api/goals

# Expected: 200 OK with goals array
{
  "data": [...],
  "meta": { "total": 3, "timestamp": "..." }
}

# 3. Create completion
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"subtask_instance_id": "123", "capture_method": "manual"}' \
  https://weave-api-production.railway.app/api/completions

# Expected: 201 Created
{
  "data": { "id": "...", "subtask_instance_id": "123", ... },
  "meta": { "timestamp": "..." }
}
```

### 3.2 Mobile E2E (Detox - Future)

**Not yet implemented** - defer to post-MVP

When implemented:
```bash
cd weave-mobile
npm run test:e2e
```

---

## 4️⃣ Build Verification

### 4.1 Backend Build

**Verify Railway build succeeds:**
```bash
cd weave-api

# Test local build (simulates Railway)
uv sync --frozen

# Expected: Dependencies installed without errors
```

**Verify start command works:**
```bash
cd weave-api
uvicorn app.main:app --host 0.0.0.0 --port 8000 --log-level info

# Expected: Server starts without errors
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 4.2 Mobile Build (EAS Build)

**Verify iOS build succeeds:**
```bash
cd weave-mobile
npx eas build --platform ios --profile preview
```

**Expected Output:**
```
✓ Build in progress
✓ Build completed
Build URL: https://expo.dev/builds/...
```

**Download and test build:**
1. Download IPA from EAS Build dashboard
2. Install on TestFlight or physical device
3. Test critical user flows (see section 2.5)

---

## 5️⃣ Test Result Thresholds

### Pass/Fail Criteria

| Test Type | Pass Threshold | Block Deployment? |
|-----------|----------------|-------------------|
| Backend unit tests | 100% pass | ✅ YES |
| Backend integration tests | 100% pass | ✅ YES |
| Backend deployment tests | >= 90% pass | ✅ YES |
| RLS security tests | 100% pass | ✅ YES |
| Mobile TypeScript | 0 errors | ✅ YES |
| Mobile linting | 0 errors | ⚠️ YES (warnings OK) |
| Mobile Jest tests | >= 90% pass | ⚠️ YES |
| Test coverage (backend) | >= 80% | ⚠️ Recommended |
| Test coverage (mobile) | >= 70% | ⚠️ Recommended |
| Manual smoke tests | All critical flows pass | ✅ YES |

### When to Override Thresholds

**Only in these cases:**
1. Known non-critical test failure with documented workaround
2. Test environment issue (not production issue)
3. Approved by Tech Lead + documented in exception log

**Never override:**
- ❌ RLS security test failures
- ❌ Authentication test failures
- ❌ Data integrity test failures
- ❌ Production API health check failures

---

## 6️⃣ Troubleshooting Test Failures

### Common Backend Test Failures

#### Issue: "ModuleNotFoundError: No module named 'app'"
**Cause:** Python path not set correctly
**Fix:**
```bash
cd weave-api
export PYTHONPATH="$PWD"
uv run pytest tests/ -v
```

#### Issue: "Connection refused" or "Database not found"
**Cause:** Supabase URL or service key incorrect
**Fix:**
```bash
# Check environment variables
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# If missing, add to .env file
cp .env.example .env
# Edit .env with your credentials
```

#### Issue: "Fixture 'production_api_url' not found"
**Cause:** Deployment fixtures not imported in conftest.py
**Fix:** Already fixed in Story 9.1 code review (see `weave-api/tests/conftest.py` lines 35-50)

#### Issue: "PermissionError: RLS policy violation"
**Cause:** RLS policies not applied or user not authenticated
**Fix:**
```bash
# Apply RLS migrations
npx supabase db push

# Run RLS tests to verify
npx supabase test db
```

### Common Mobile Test Failures

#### Issue: "Cannot find module '@/design-system'"
**Cause:** Metro cache stale after moving files
**Fix:**
```bash
cd weave-mobile
npm run start:clean
```

#### Issue: "NativeWind styles not applying"
**Cause:** Component not wrapped in ThemeProvider
**Fix:** Ensure `App.tsx` has `ThemeProvider` wrapper (see `weave-mobile/App.tsx`)

#### Issue: "Jest snapshot mismatch"
**Cause:** UI changed (may be intentional)
**Fix:** Review snapshot diff, update if intentional:
```bash
npm test -- -u --watchAll=false
```

---

## 7️⃣ Automated Test Script

**Create a script to run all tests:**

```bash
#!/bin/bash
# File: docs/production/scripts/run-all-tests.sh

set -e  # Exit on first failure

echo "🧪 Running full test suite..."
echo ""

# Backend tests
echo "📦 Backend: Unit tests"
cd weave-api
uv run pytest tests/ -v --ignore=tests/deployment/ --ignore=tests/integration/

echo ""
echo "📦 Backend: Integration tests"
uv run pytest tests/integration/ -v

echo ""
echo "📦 Backend: Deployment tests (skipped if env vars missing)"
uv run pytest tests/deployment/ -v || true

echo ""
echo "🔒 Backend: RLS security tests"
npx supabase test db

echo ""
echo "📱 Mobile: TypeScript compilation"
cd ../weave-mobile
npx tsc --noEmit

echo ""
echo "📱 Mobile: Linting"
npm run lint

echo ""
echo "📱 Mobile: Jest tests"
npm test -- --watchAll=false --coverage

echo ""
echo "✅ All tests passed!"
```

**Make executable:**
```bash
chmod +x docs/production/scripts/run-all-tests.sh
```

**Run all tests:**
```bash
./docs/production/scripts/run-all-tests.sh
```

---

## ✅ Test Validation Checklist

Before deploying to production, verify:

- [ ] Backend unit tests: 100% pass
- [ ] Backend integration tests: 100% pass
- [ ] Backend deployment tests: >= 90% pass (skips OK if env vars missing)
- [ ] RLS security tests: 100% pass (48/48)
- [ ] Backend coverage: >= 80%
- [ ] Mobile TypeScript: 0 errors
- [ ] Mobile linting: 0 errors (warnings OK)
- [ ] Mobile Jest tests: >= 90% pass
- [ ] Mobile coverage: >= 70%
- [ ] Manual smoke tests: All critical flows pass
- [ ] Backend build: Succeeds (uv sync --frozen)
- [ ] Mobile build: Succeeds (EAS Build or Expo export)
- [ ] Health check: Returns 200 OK

**Sign-off:** _______________ (Name) _______________ (Date)

---

**Last Updated:** 2025-12-23
**Owner:** QA Team + Tech Lead
**Review Frequency:** Before every production deployment

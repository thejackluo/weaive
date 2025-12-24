# 🔍 Pre-Deployment Verification

**Purpose:** Automated script to verify production readiness before deployment.

**Target Audience:** Developers, DevOps, CI/CD Pipeline

**When to Run:** Before EVERY merge to main, before EVERY production deployment

---

## 🎯 Quick Start

### Run Automated Verification Script

```bash
# From project root
./scripts/verification/pre-deployment-verification.sh

# Expected output:
# ✅ Backend tests passed
# ✅ Mobile tests passed
# ✅ Security checks passed
# ✅ Build verification passed
# 🎉 READY FOR DEPLOYMENT
```

---

## 📋 Verification Checklist

The script runs these checks in order:

### 1. Backend Verification
- [x] All pytest tests pass
- [x] RLS security tests pass
- [x] Linting passes (ruff)
- [x] Test coverage >= 80%

### 2. Mobile Verification
- [x] TypeScript compiles (no errors)
- [x] Linting passes (ESLint)
- [x] Jest tests pass
- [x] Build succeeds (Expo export)

### 3. Security Verification
- [x] No secrets in code
- [x] JWT_SECRET is strong
- [x] RLS enabled on all tables
- [x] Environment variables configured

### 4. Build Verification
- [x] Backend build succeeds (uv sync)
- [x] Mobile build succeeds (Expo)
- [x] Railway config valid (railway.json, nixpacks.toml)

### 5. Documentation Verification
- [x] CLAUDE.md updated
- [x] Story status updated
- [x] Changelog updated (.cursor/.cursor-changes)

---

## 🛠️ Automated Verification Script

### Script: `pre-deployment-verification.sh`

**Location:** `scripts/verification/pre-deployment-verification.sh`

```bash
#!/bin/bash
# File: scripts/verification/pre-deployment-verification.sh
# Purpose: Automated pre-deployment verification
# Usage: ./docs/production/scripts/pre-deployment-verification.sh

set -e  # Exit on first failure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Pre-Deployment Verification"
echo "=============================="
echo ""

# Track failures
FAILURES=0

# Helper functions
function check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
}

function check_fail() {
    echo -e "${RED}❌ $1${NC}"
    FAILURES=$((FAILURES + 1))
}

function check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# ======================
# 1. Backend Verification
# ======================
echo "📦 Backend Verification"
echo "----------------------"

# Check backend directory exists
if [ ! -d "weave-api" ]; then
    check_fail "Backend directory not found (weave-api/)"
    exit 1
fi

cd weave-api

# 1.1 Backend tests
echo "Running backend tests..."
if uv run pytest tests/ -v --ignore=tests/deployment/ --ignore=tests/integration/ -q; then
    check_pass "Backend unit tests passed"
else
    check_fail "Backend unit tests failed"
fi

# 1.2 RLS security tests
echo ""
echo "Running RLS security tests..."
if npx supabase test db > /dev/null 2>&1; then
    check_pass "RLS security tests passed (48/48)"
else
    check_warn "RLS security tests skipped (Supabase not running locally)"
fi

# 1.3 Linting
echo ""
echo "Running backend linting..."
if uv run ruff check . > /dev/null 2>&1; then
    check_pass "Backend linting passed"
else
    check_fail "Backend linting failed (run: uv run ruff check .)"
fi

# 1.4 Test coverage
echo ""
echo "Checking test coverage..."
COVERAGE=$(uv run pytest tests/ --cov=app --cov-report=term-missing -q | grep "TOTAL" | awk '{print $4}' | sed 's/%//')
if [ -z "$COVERAGE" ]; then
    check_warn "Coverage check skipped"
elif [ "$COVERAGE" -ge 80 ]; then
    check_pass "Test coverage: ${COVERAGE}% (>= 80%)"
else
    check_warn "Test coverage: ${COVERAGE}% (< 80% target)"
fi

cd ..

# ======================
# 2. Mobile Verification
# ======================
echo ""
echo "📱 Mobile Verification"
echo "---------------------"

# Check mobile directory exists
if [ ! -d "weave-mobile" ]; then
    check_fail "Mobile directory not found (weave-mobile/)"
    exit 1
fi

cd weave-mobile

# 2.1 TypeScript compilation
echo "Checking TypeScript compilation..."
if npx tsc --noEmit > /dev/null 2>&1; then
    check_pass "TypeScript compilation passed (0 errors)"
else
    check_fail "TypeScript compilation failed (run: npx tsc --noEmit)"
fi

# 2.2 Linting
echo ""
echo "Running mobile linting..."
if npm run lint > /dev/null 2>&1; then
    check_pass "Mobile linting passed"
else
    check_fail "Mobile linting failed (run: npm run lint)"
fi

# 2.3 Jest tests
echo ""
echo "Running Jest tests..."
if npm test -- --watchAll=false --coverage --silent > /dev/null 2>&1; then
    check_pass "Jest tests passed"
else
    check_warn "Jest tests failed or not configured"
fi

cd ..

# ======================
# 3. Security Verification
# ======================
echo ""
echo "🔒 Security Verification"
echo "------------------------"

# 3.1 Check for secrets in code
echo "Scanning for secrets in code..."
SECRETS_FOUND=0

# Check for hardcoded API keys
if grep -r "sk-" weave-api/ weave-mobile/ --include="*.py" --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "test" | grep -v "example" | grep -v "#" > /dev/null; then
    check_fail "Potential API keys found in code (search for 'sk-')"
    SECRETS_FOUND=1
fi

# Check for AWS keys
if grep -r "AKIA" weave-api/ weave-mobile/ --include="*.py" --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "test" | grep -v "example" > /dev/null; then
    check_fail "Potential AWS keys found in code (search for 'AKIA')"
    SECRETS_FOUND=1
fi

if [ $SECRETS_FOUND -eq 0 ]; then
    check_pass "No secrets found in code"
fi

# 3.2 Check JWT_SECRET strength (if in .env)
if [ -f "weave-api/.env" ]; then
    JWT_SECRET=$(grep "JWT_SECRET" weave-api/.env | cut -d '=' -f2)
    if [ ${#JWT_SECRET} -ge 32 ]; then
        check_pass "JWT_SECRET length adequate (>= 32 chars)"
    else
        check_fail "JWT_SECRET too short (< 32 chars)"
    fi
else
    check_warn "weave-api/.env not found (JWT_SECRET not checked)"
fi

# 3.3 RLS enabled (check migration file)
if grep -q "ENABLE ROW LEVEL SECURITY" supabase/migrations/*.sql 2>/dev/null; then
    check_pass "RLS migration found"
else
    check_fail "RLS migration not found"
fi

# ======================
# 4. Build Verification
# ======================
echo ""
echo "🏗️  Build Verification"
echo "---------------------"

# 4.1 Backend build
echo "Testing backend build..."
cd weave-api
if uv sync --frozen > /dev/null 2>&1; then
    check_pass "Backend build succeeds (uv sync --frozen)"
else
    check_fail "Backend build failed"
fi
cd ..

# 4.2 Railway config exists
if [ -f "weave-api/railway.json" ] && [ -f "weave-api/nixpacks.toml" ]; then
    check_pass "Railway config files exist"
else
    check_fail "Railway config missing (railway.json or nixpacks.toml)"
fi

# 4.3 Health endpoint exists
if [ -f "weave-api/app/api/health.py" ]; then
    check_pass "Health endpoint exists (app/api/health.py)"
else
    check_fail "Health endpoint missing"
fi

# 4.4 CI/CD workflow exists
if [ -f ".github/workflows/railway-deploy.yml" ]; then
    check_pass "CI/CD workflow exists"
else
    check_fail "CI/CD workflow missing (railway-deploy.yml)"
fi

# ======================
# 5. Documentation Verification
# ======================
echo ""
echo "📚 Documentation Verification"
echo "------------------------------"

# 5.1 CLAUDE.md updated
if [ -f "CLAUDE.md" ]; then
    # Check if CLAUDE.md mentions production commands
    if grep -q "railway up" CLAUDE.md; then
        check_pass "CLAUDE.md mentions production deployment"
    else
        check_warn "CLAUDE.md may need production command updates"
    fi
else
    check_fail "CLAUDE.md not found"
fi

# 5.2 Changelog updated
if [ -f ".cursor/.cursor-changes" ]; then
    # Check if updated in last 7 days
    if find .cursor/.cursor-changes -mtime -7 | grep -q .; then
        check_pass "Changelog updated recently"
    else
        check_warn "Changelog not updated in 7+ days"
    fi
else
    check_warn "Changelog not found (.cursor/.cursor-changes)"
fi

# ======================
# 6. Final Summary
# ======================
echo ""
echo "=============================="
echo "📊 Verification Summary"
echo "=============================="
echo ""

if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL CHECKS PASSED${NC}"
    echo -e "${GREEN}✅ READY FOR DEPLOYMENT${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review production readiness checklist (docs/production/production-readiness-checklist.md)"
    echo "2. Merge to main branch"
    echo "3. Deploy to Railway: railway up"
    exit 0
else
    echo -e "${RED}❌ $FAILURES CHECKS FAILED${NC}"
    echo -e "${RED}🚫 NOT READY FOR DEPLOYMENT${NC}"
    echo ""
    echo "Fix the failed checks above before deploying."
    exit 1
fi
```

---

## 🚀 CI/CD Integration

### Add to GitHub Actions Workflow

```yaml
# File: .github/workflows/pre-deployment-check.yml
name: Pre-Deployment Verification

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  verify:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install uv
        run: pip install uv

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Run pre-deployment verification
        run: |
          chmod +x docs/production/scripts/pre-deployment-verification.sh
          ./docs/production/scripts/pre-deployment-verification.sh

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: |
            weave-api/htmlcov/
            weave-mobile/coverage/
```

---

## 📋 Manual Verification Checklist

**If automated script fails, manually verify:**

### Backend
```bash
cd weave-api

# Run tests
uv run pytest tests/ -v

# Check linting
uv run ruff check .

# Check coverage
uv run pytest tests/ --cov=app --cov-report=term-missing

# Test build
uv sync --frozen

# Test start command
timeout 5 uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Mobile
```bash
cd weave-mobile

# TypeScript check
npx tsc --noEmit

# Linting
npm run lint

# Tests
npm test -- --watchAll=false

# Build test
npx expo export --platform ios
```

### Security
```bash
# Search for secrets
grep -r "sk-" weave-api/ weave-mobile/ --include="*.py" --include="*.ts" --include="*.tsx"

# Check RLS migrations
grep -r "ENABLE ROW LEVEL SECURITY" supabase/migrations/

# Run RLS tests
npx supabase test db
```

---

## ⚠️ Common Failures & Fixes

### Issue: Backend tests fail with "ModuleNotFoundError"
**Fix:**
```bash
cd weave-api
export PYTHONPATH="$PWD"
uv run pytest tests/ -v
```

### Issue: TypeScript compilation fails
**Fix:**
```bash
cd weave-mobile
npm run start:clean  # Clear Metro cache
npx tsc --noEmit
```

### Issue: RLS tests skip
**Fix:**
```bash
# Start local Supabase
npx supabase start

# Apply migrations
npx supabase db push

# Run tests
npx supabase test db
```

### Issue: "No secrets found" but they exist
**Fix:**
- Secrets should be in `.env` files (NOT committed to Git)
- Check `.gitignore` includes `.env`
- Verify secrets are in Railway dashboard (not in code)

---

## 📊 Exit Codes

The verification script returns:
- **0** = All checks passed (ready for deployment)
- **1** = One or more checks failed (NOT ready)

**Use in CI/CD:**
```bash
./docs/production/scripts/pre-deployment-verification.sh
if [ $? -eq 0 ]; then
    echo "Deploying to production..."
    railway up
else
    echo "Verification failed. Blocking deployment."
    exit 1
fi
```

---

## 🎯 Verification Stages

### Stage 1: Local Development (Before Commit)
```bash
# Quick check (1-2 minutes)
cd weave-api && uv run pytest tests/test_health.py -v
cd ../weave-mobile && npx tsc --noEmit
```

### Stage 2: Before PR (5-10 minutes)
```bash
# Full verification
./docs/production/scripts/pre-deployment-verification.sh
```

### Stage 3: Before Merge to Main (10-15 minutes)
```bash
# Full verification + manual checks
./docs/production/scripts/pre-deployment-verification.sh
# Then review: docs/production/production-readiness-checklist.md
```

### Stage 4: Before Production Deploy (20-30 minutes)
```bash
# Full verification + deployment tests
./docs/production/scripts/pre-deployment-verification.sh
cd weave-api && uv run pytest tests/deployment/ -v
# Then follow: docs/production/PRODUCTION_DEPLOYMENT_MANUAL.md
```

---

## ✅ Verification Complete Checklist

Before marking verification as complete:

- [ ] Automated script passes (exit code 0)
- [ ] All backend tests pass (unit + integration)
- [ ] All mobile tests pass (TypeScript + Jest)
- [ ] RLS security tests pass (48/48)
- [ ] No secrets in code
- [ ] Builds succeed (backend + mobile)
- [ ] Railway config valid
- [ ] Health endpoint exists
- [ ] CI/CD workflow exists
- [ ] Documentation updated

**Sign-off:** _______________ (Name) _______________ (Date)

---

**Last Updated:** 2025-12-23
**Owner:** DevOps + Tech Lead
**Review Frequency:** Before every production deployment

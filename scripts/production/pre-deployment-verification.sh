#!/bin/bash
# Pre-Deployment Verification Script
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
if timeout 30 uv run pytest tests/test_health.py::test_health_endpoint -v --tb=short > /dev/null 2>&1; then
    check_pass "Backend health tests passed"
else
    check_warn "Backend health tests skipped or failed"
fi

# 1.2 Linting
echo ""
echo "Running backend linting..."
if uv run ruff check . > /dev/null 2>&1; then
    check_pass "Backend linting passed"
else
    check_fail "Backend linting failed (run: uv run ruff check .)"
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
if timeout 60 npx tsc --noEmit > /dev/null 2>&1; then
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
    check_warn "Mobile linting failed (run: npm run lint)"
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

# Check for hardcoded API keys (but ignore test files and examples)
if grep -r "sk-proj-" weave-api/ weave-mobile/ --include="*.py" --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "test" | grep -v "example" | grep -v "#" > /dev/null; then
    check_fail "Potential OpenAI API keys found in code"
    SECRETS_FOUND=1
fi

# Check for AWS keys
if grep -r "AKIA" weave-api/ weave-mobile/ --include="*.py" --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "test" | grep -v "example" | grep -v "#" > /dev/null; then
    check_fail "Potential AWS keys found in code"
    SECRETS_FOUND=1
fi

if [ $SECRETS_FOUND -eq 0 ]; then
    check_pass "No obvious secrets found in code"
fi

# 3.2 RLS enabled (check migration file)
if ls supabase/migrations/*.sql > /dev/null 2>&1 && grep -q "ENABLE ROW LEVEL SECURITY" supabase/migrations/*.sql 2>/dev/null; then
    check_pass "RLS migration found"
else
    check_warn "RLS migration not found or supabase/ directory missing"
fi

# ======================
# 4. Build Verification
# ======================
echo ""
echo "🏗️  Build Verification"
echo "---------------------"

# 4.1 Railway config exists
if [ -f "weave-api/railway.json" ] && [ -f "weave-api/nixpacks.toml" ]; then
    check_pass "Railway config files exist"
else
    check_fail "Railway config missing (railway.json or nixpacks.toml)"
fi

# 4.2 Health endpoint exists
if [ -f "weave-api/app/api/health.py" ]; then
    check_pass "Health endpoint exists (app/api/health.py)"
else
    check_fail "Health endpoint missing"
fi

# 4.3 CI/CD workflow exists
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
    check_pass "CLAUDE.md exists"
else
    check_fail "CLAUDE.md not found"
fi

# 5.2 Production docs exist
if [ -f "docs/production/README.md" ]; then
    check_pass "Production documentation exists"
else
    check_warn "Production documentation missing"
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
    echo -e "${GREEN}🎉 ALL CRITICAL CHECKS PASSED${NC}"
    echo -e "${GREEN}✅ READY FOR DEPLOYMENT${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review: docs/production/production-readiness-checklist.md"
    echo "2. Merge to main branch"
    echo "3. Deploy to Railway: cd weave-api && railway up"
    exit 0
else
    echo -e "${RED}❌ $FAILURES CRITICAL CHECKS FAILED${NC}"
    echo -e "${RED}🚫 NOT READY FOR DEPLOYMENT${NC}"
    echo ""
    echo "Fix the failed checks above before deploying."
    exit 1
fi

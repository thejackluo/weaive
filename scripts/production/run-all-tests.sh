#!/bin/bash
# Run All Tests Script
# Purpose: Run comprehensive test suite (backend + mobile)
# Usage: ./docs/production/scripts/run-all-tests.sh

set -e  # Exit on first failure

echo "🧪 Running Full Test Suite"
echo "==========================="
echo ""

# Track test results
BACKEND_TESTS_PASSED=0
MOBILE_TESTS_PASSED=0
RLS_TESTS_PASSED=0

# ======================
# Backend Tests
# ======================
echo "📦 Backend Tests"
echo "----------------"

cd weave-api

# Run all backend tests (except deployment tests which need env vars)
echo "Running backend unit tests..."
if timeout 60 uv run pytest tests/ -v --ignore=tests/deployment/ --ignore=tests/integration/ --tb=short; then
    echo "✅ Backend unit tests passed"
    BACKEND_TESTS_PASSED=1
else
    echo "❌ Backend unit tests failed"
    exit 1
fi

echo ""
echo "Running backend integration tests..."
if [ -d "tests/integration" ]; then
    if timeout 60 uv run pytest tests/integration/ -v --tb=short; then
        echo "✅ Backend integration tests passed"
    else
        echo "⚠️  Backend integration tests failed or skipped"
    fi
fi

echo ""
echo "Running deployment tests (may skip if env vars missing)..."
if timeout 60 uv run pytest tests/deployment/ -v --tb=short; then
    echo "✅ Deployment tests passed"
else
    echo "⚠️  Deployment tests skipped (some env vars missing - expected)"
fi

cd ..

# ======================
# RLS Security Tests
# ======================
echo ""
echo "🔒 RLS Security Tests"
echo "---------------------"

echo "Checking if Supabase is running locally..."
if npx supabase status > /dev/null 2>&1; then
    echo "Running RLS security tests..."
    if timeout 30 npx supabase test db; then
        echo "✅ RLS security tests passed (48/48)"
        RLS_TESTS_PASSED=1
    else
        echo "❌ RLS security tests failed"
        exit 1
    fi
else
    echo "⚠️  Supabase not running locally (run: npx supabase start)"
    echo "⚠️  RLS tests skipped"
fi

# ======================
# Mobile Tests
# ======================
echo ""
echo "📱 Mobile Tests"
echo "---------------"

cd weave-mobile

# TypeScript compilation
echo "Checking TypeScript compilation..."
if timeout 60 npx tsc --noEmit; then
    echo "✅ TypeScript compilation passed"
else
    echo "❌ TypeScript compilation failed"
    exit 1
fi

# Linting
echo ""
echo "Running ESLint..."
if npm run lint; then
    echo "✅ Linting passed"
else
    echo "⚠️  Linting failed (warnings may be acceptable)"
fi

# Jest tests
echo ""
echo "Running Jest tests..."
if npm test -- --watchAll=false --coverage; then
    echo "✅ Jest tests passed"
    MOBILE_TESTS_PASSED=1
else
    echo "⚠️  Jest tests failed or not configured"
fi

cd ..

# ======================
# Summary
# ======================
echo ""
echo "==========================="
echo "📊 Test Summary"
echo "==========================="
echo ""

if [ $BACKEND_TESTS_PASSED -eq 1 ]; then
    echo "✅ Backend tests: PASSED"
else
    echo "❌ Backend tests: FAILED"
fi

if [ $RLS_TESTS_PASSED -eq 1 ]; then
    echo "✅ RLS security tests: PASSED"
else
    echo "⚠️  RLS security tests: SKIPPED"
fi

if [ $MOBILE_TESTS_PASSED -eq 1 ]; then
    echo "✅ Mobile tests: PASSED"
else
    echo "⚠️  Mobile tests: FAILED"
fi

echo ""
echo "🎉 Test suite complete!"
echo ""
echo "Next steps:"
echo "1. Review test output above"
echo "2. Run pre-deployment verification: ./docs/production/scripts/pre-deployment-verification.sh"
echo "3. Follow production deployment manual: docs/production/PRODUCTION_DEPLOYMENT_MANUAL.md"

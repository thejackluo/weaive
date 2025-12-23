#!/bin/bash
# Verify CI/CD setup is correct
# Usage: bash scripts/verify-ci-setup.sh

echo "🔍 Verifying CI/CD Configuration..."
echo ""

# Check workflow files exist
WORKFLOWS=(
  ".github/workflows/mobile-lint.yml"
  ".github/workflows/backend-lint.yml"
  ".github/workflows/type-check.yml"
  ".github/workflows/mobile-tests.yml"
  ".github/workflows/backend-tests.yml"
  ".github/workflows/eas-build.yml"
)

WORKFLOW_CHECK_PASSED=true

for workflow in "${WORKFLOWS[@]}"; do
  if [ -f "$workflow" ]; then
    echo "✅ $workflow exists"
  else
    echo "❌ $workflow MISSING"
    WORKFLOW_CHECK_PASSED=false
  fi
done

echo ""

# Check GitHub secrets (requires gh CLI)
if command -v gh &> /dev/null; then
  echo "Checking GitHub secrets..."

  if gh secret list | grep -q "EXPO_TOKEN"; then
    echo "✅ EXPO_TOKEN secret exists"
  else
    echo "⚠️  EXPO_TOKEN secret NOT FOUND (required for EAS Build)"
    echo "   Generate at: https://expo.dev/settings/access-tokens"
  fi

  if gh secret list | grep -q "SUPABASE_URL"; then
    echo "✅ SUPABASE_URL secret exists"
  else
    echo "⚠️  SUPABASE_URL secret NOT FOUND (required for backend tests)"
    echo "   Copy from: weave-api/.env"
  fi

  if gh secret list | grep -q "SUPABASE_SERVICE_KEY"; then
    echo "✅ SUPABASE_SERVICE_KEY secret exists"
  else
    echo "⚠️  SUPABASE_SERVICE_KEY secret NOT FOUND (required for backend tests)"
    echo "   Copy from: weave-api/.env"
  fi
else
  echo "⚠️  GitHub CLI (gh) not installed - skipping secret verification"
  echo "   Install: https://cli.github.com/"
fi

echo ""

# Check eas.json exists
if [ -f "weave-mobile/eas.json" ]; then
  echo "✅ weave-mobile/eas.json exists"
else
  echo "❌ weave-mobile/eas.json MISSING"
  echo "   Run: cd weave-mobile && eas build:configure"
  WORKFLOW_CHECK_PASSED=false
fi

echo ""

# Final status
if [ "$WORKFLOW_CHECK_PASSED" = true ]; then
  echo "✅ CI/CD setup verification complete!"
  echo ""
  echo "Next steps:"
  echo "  1. Add GitHub secrets (if not already done): docs/dev/ci-cd-setup.md"
  echo "  2. Configure branch protection rules: GitHub Settings → Branches"
  echo "  3. Create a test PR to verify CI workflows run correctly"
  exit 0
else
  echo "❌ CI/CD setup verification FAILED!"
  echo "   Fix the issues above and run this script again."
  exit 1
fi

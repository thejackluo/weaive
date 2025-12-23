#!/bin/bash

# Database Validation Script (Bash)
# Runs schema validation and performance tests
# Usage: ./scripts/validate-database.sh [local|cloud] [DATABASE_URL]

set -e  # Exit on error

ENVIRONMENT="${1:-local}"
DATABASE_URL="${2:-}"

echo "========================================"
echo "  Database Validation"
echo "========================================"
echo ""

# Determine connection string
if [ "$ENVIRONMENT" == "local" ]; then
    DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"
    echo "Environment: Local (Docker)"
elif [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL required for cloud environment"
    echo "Usage: ./scripts/validate-database.sh cloud 'postgresql://...'"
    exit 1
else
    echo "Environment: Cloud"
fi

echo ""

# Check if psql is available
echo -n "[0/3] Checking psql installation... "
if command -v psql &> /dev/null; then
    echo "✓ Installed ($(psql --version))"
else
    echo "✗ Not found"
    echo "      Install psql: See docs/dev/psql-setup-guide.md"
    exit 1
fi

# Check if Supabase is running (local only)
if [ "$ENVIRONMENT" == "local" ]; then
    echo -n "[1/3] Checking local Supabase... "
    if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
        echo "✓ Running"
    else
        echo "✗ Not running"
        echo "      Start with: npx supabase start"
        exit 1
    fi
fi

# Validate schema
echo -n "[2/3] Validating schema... "
if psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/testing/validate_schema.sql > /dev/null 2>&1; then
    echo "✓ Passed"
else
    echo "✗ Failed"
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/testing/validate_schema.sql
    exit 1
fi

# Performance baseline
echo -n "[3/3] Running performance tests... "
if psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/testing/performance_baseline.sql > /dev/null 2>&1; then
    echo "✓ Passed"
else
    echo "✗ Failed"
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/testing/performance_baseline.sql
    exit 1
fi

echo ""
echo "✅ All validation checks passed!"


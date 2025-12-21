#!/bin/bash
# Setup script for local Supabase test database
# Run this before running integration tests for the first time

set -e  # Exit on any error

echo "🧪 Setting up test database for Story 4.1..."
echo ""

# Check Docker is running
if ! docker ps &> /dev/null; then
    echo "❌ Error: Docker is not running"
    echo "   Please start Docker Desktop and try again"
    exit 1
fi

echo "✅ Docker is running"

# Check if Supabase is initialized
if [ ! -f "supabase/config.toml" ]; then
    echo "⚙️  Initializing Supabase..."
    npx supabase init
fi

echo "✅ Supabase initialized"

# Start local Supabase
echo ""
echo "🚀 Starting local Supabase (this may take 30-60 seconds)..."
npx supabase start

# Check if start was successful
if [ $? -ne 0 ]; then
    echo "❌ Failed to start Supabase"
    echo "   Try: npx supabase stop && npx supabase start"
    exit 1
fi

echo ""
echo "✅ Local Supabase is running!"

# Get connection details
echo ""
echo "📋 Connection details (save these to weave-api/.env.test):"
echo ""
npx supabase status | grep -E "API URL|anon key|service_role key"

# Check if .env.test exists
echo ""
if [ ! -f "weave-api/.env.test" ]; then
    echo "⚠️  weave-api/.env.test does not exist"
    echo ""
    echo "Next steps:"
    echo "1. Copy the example file:"
    echo "   cp weave-api/.env.test.example weave-api/.env.test"
    echo ""
    echo "2. Update .env.test with credentials shown above"
    echo ""
    echo "3. Apply migrations:"
    echo "   npx supabase db push"
    echo ""
    echo "4. Run tests:"
    echo "   cd weave-api && uv run pytest tests/ -v"
else
    echo "✅ weave-api/.env.test exists"
    echo ""
    echo "Next steps:"
    echo "1. Verify .env.test has correct credentials (shown above)"
    echo "2. Apply migrations: npx supabase db push"
    echo "3. Run tests: cd weave-api && uv run pytest tests/ -v"
fi

echo ""
echo "📖 Full guide: docs/dev/test-database-setup.md"

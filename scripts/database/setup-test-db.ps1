# Setup script for local Supabase test database (Windows PowerShell)
# Run this before running integration tests for the first time

Write-Host "🧪 Setting up test database for Story 4.1..." -ForegroundColor Cyan
Write-Host ""

# Check Docker is running
try {
    docker ps 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not running"
    }
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Docker is not running" -ForegroundColor Red
    Write-Host "   Please start Docker Desktop and try again" -ForegroundColor Yellow
    exit 1
}

# Check if Supabase is initialized
if (-Not (Test-Path "supabase/config.toml")) {
    Write-Host "⚙️  Initializing Supabase..." -ForegroundColor Yellow
    npx supabase init
}

Write-Host "✅ Supabase initialized" -ForegroundColor Green

# Start local Supabase
Write-Host ""
Write-Host "🚀 Starting local Supabase (this may take 30-60 seconds)..." -ForegroundColor Cyan
npx supabase start

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start Supabase" -ForegroundColor Red
    Write-Host "   Try: npx supabase stop; npx supabase start" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ Local Supabase is running!" -ForegroundColor Green

# Get connection details
Write-Host ""
Write-Host "📋 Connection details (save these to weave-api/.env.test):" -ForegroundColor Cyan
Write-Host ""
npx supabase status | Select-String -Pattern "API URL|anon key|service_role key"

# Check if .env.test exists
Write-Host ""
if (-Not (Test-Path "weave-api/.env.test")) {
    Write-Host "⚠️  weave-api/.env.test does not exist" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Copy the example file:"
    Write-Host "   Copy-Item weave-api\.env.test.example weave-api\.env.test"
    Write-Host ""
    Write-Host "2. Update .env.test with credentials shown above"
    Write-Host ""
    Write-Host "3. Apply migrations:"
    Write-Host "   npx supabase db push"
    Write-Host ""
    Write-Host "4. Run tests:"
    Write-Host "   cd weave-api; uv run pytest tests/ -v"
} else {
    Write-Host "✅ weave-api/.env.test exists" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Verify .env.test has correct credentials (shown above)"
    Write-Host "2. Apply migrations: npx supabase db push"
    Write-Host "3. Run tests: cd weave-api; uv run pytest tests/ -v"
}

Write-Host ""
Write-Host "📖 Full guide: docs/dev/test-database-setup.md" -ForegroundColor Cyan

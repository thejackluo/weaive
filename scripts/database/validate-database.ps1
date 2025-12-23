# Database Validation Script
# Runs schema validation and performance tests
# Usage: .\scripts\validate-database.ps1 [-Environment local|cloud] [-DatabaseUrl "postgresql://..."]

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("local", "cloud")]
    [string]$Environment = "local",
    
    [Parameter(Mandatory=$false)]
    [string]$DatabaseUrl = ""
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Database Validation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Determine connection string
if ($Environment -eq "local") {
    $DatabaseUrl = "postgresql://postgres:postgres@localhost:54322/postgres"
    Write-Host "Environment: Local (Docker)" -ForegroundColor Yellow
} elseif ($DatabaseUrl -eq "") {
    Write-Host "❌ Error: DatabaseUrl required for cloud environment" -ForegroundColor Red
    Write-Host "Usage: .\scripts\validate-database.ps1 -Environment cloud -DatabaseUrl 'postgresql://...'" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "Environment: Cloud" -ForegroundColor Yellow
}

Write-Host ""

# Check if psql is available
Write-Host "[0/3] Checking psql installation..." -NoNewline
try {
    $psqlVersion = psql --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✓ Installed" -ForegroundColor Green
    } else {
        Write-Host " ✗ Not found" -ForegroundColor Red
        Write-Host "      Install psql: See docs/dev/psql-setup-guide.md" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host " ✗ Not found" -ForegroundColor Red
    Write-Host "      Install psql: See docs/dev/psql-setup-guide.md" -ForegroundColor Yellow
    exit 1
}

# Check if Supabase is running (local only)
if ($Environment -eq "local") {
    Write-Host "[1/3] Checking local Supabase..." -NoNewline
    $testConnection = psql $DatabaseUrl -c "SELECT 1;" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host " ✗ Not running" -ForegroundColor Red
        Write-Host "      Start with: npx supabase start" -ForegroundColor Yellow
        exit 1
    }
    Write-Host " ✓ Running" -ForegroundColor Green
}

# Validate schema
Write-Host "[2/3] Validating schema..." -NoNewline
$validationResult = psql $DatabaseUrl -v ON_ERROR_STOP=1 -f supabase/testing/validate_schema.sql 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host " ✓ Passed" -ForegroundColor Green
} else {
    Write-Host " ✗ Failed" -ForegroundColor Red
    Write-Host ""
    Write-Host $validationResult -ForegroundColor Red
    exit 1
}

# Performance baseline
Write-Host "[3/3] Running performance tests..." -NoNewline
$perfResult = psql $DatabaseUrl -v ON_ERROR_STOP=1 -f supabase/testing/performance_baseline.sql 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host " ✓ Passed" -ForegroundColor Green
} else {
    Write-Host " ✗ Failed" -ForegroundColor Red
    Write-Host ""
    Write-Host $perfResult -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ All validation checks passed!" -ForegroundColor Green


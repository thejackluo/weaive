# psql Setup and Automation Guide

**Last Updated:** 2025-12-19
**Project:** Weave Mobile App
**Purpose:** Install and use `psql` for database automation and command-line workflows

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Verification](#verification)
4. [Connection Strings](#connection-strings)
5. [Common Commands](#common-commands)
6. [Automation Scripts](#automation-scripts)
7. [CI/CD Integration](#cicd-integration)
8. [Troubleshooting](#troubleshooting)

---

## Overview

`psql` is the PostgreSQL command-line client that allows you to:
- ✅ Run SQL scripts from the command line (automation-friendly)
- ✅ Connect directly to databases without web UI
- ✅ Execute queries programmatically in CI/CD pipelines
- ✅ Bulk import/export data
- ✅ Debug database issues with direct access

### When to Use `psql` vs Supabase Tools

| Task | Tool | Why |
|------|------|-----|
| **Run validation scripts** | `psql` | Automation, CI/CD integration |
| **Interactive queries** | Supabase Dashboard | Better UI, syntax highlighting |
| **Migrations** | `npx supabase db push` | Version control, rollback support |
| **Type generation** | `npx supabase gen types` | Integrated with Supabase |
| **Bulk operations** | `psql` | Faster, scriptable |
| **Testing/Validation** | `psql` | Automated test runs |

**TL;DR:** Use `psql` for automation and scripts. Use Supabase Dashboard for interactive exploration.

---

## Installation

### Windows

#### Option 1: PostgreSQL Full Installer (Recommended)

1. **Download PostgreSQL:**
   - Visit: https://www.postgresql.org/download/windows/
   - Download the latest version (16.x recommended)
   - Run the installer

2. **During Installation:**
   - ✅ Check **"Command Line Tools"** (includes `psql`)
   - ✅ Check **"Add to PATH"** (or add manually later)
   - Note the installation path (usually `C:\Program Files\PostgreSQL\<version>\bin`)

3. **Verify PATH:**
   ```powershell
   # Check if psql is accessible
   psql --version
   
   # If not found, add to PATH manually:
   # System Properties → Environment Variables → Path → Add:
   # C:\Program Files\PostgreSQL\16\bin
   ```

#### Option 2: Standalone PostgreSQL Client (Lighter)

1. **Download Binaries:**
   - Visit: https://www.enterprisedb.com/download-postgresql-binaries
   - Download Windows x86-64 version
   - Extract to `C:\PostgreSQL\bin` (or your preferred location)

2. **Add to PATH:**
   ```powershell
   # Add to user PATH
   [Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\PostgreSQL\bin", "User")
   ```

3. **Restart terminal** and verify:
   ```powershell
   psql --version
   ```

#### Option 3: Chocolatey (If You Use Package Managers)

```powershell
# Install PostgreSQL (includes psql)
choco install postgresql

# Or install just the client tools
choco install postgresql-client
```

### macOS

```bash
# Using Homebrew (recommended)
brew install postgresql@16

# Add to PATH (if not auto-added)
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify
psql --version
```

### Linux (Ubuntu/Debian)

```bash
# Install PostgreSQL client
sudo apt-get update
sudo apt-get install postgresql-client

# Verify
psql --version
```

---

## Verification

After installation, verify `psql` works:

```powershell
# Check version
psql --version
# Expected: psql (PostgreSQL) 16.x

# Test connection to local Supabase (if running)
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT version();"
```

**Expected Output:**
```
PostgreSQL 15.1 on x86_64-pc-linux-gnu, compiled by gcc (GCC) 10.2.1 20210110, 64-bit
```

---

## Connection Strings

### Format

```
postgresql://[user]:[password]@[host]:[port]/[database]
```

### Local Supabase (Docker)

**Default connection:**
```
postgresql://postgres:postgres@localhost:54322/postgres
```

**Usage:**
```powershell
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT NOW();"
```

### Supabase Cloud

**Get connection string from:**
1. Supabase Dashboard → Settings → Database
2. Connection string format:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

**Usage with environment variable:**
```powershell
$env:DATABASE_URL = "postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres"
psql $env:DATABASE_URL -c "SELECT COUNT(*) FROM user_profiles;"
```

### Connection String Components

| Component | Local Docker | Supabase Cloud |
|-----------|--------------|----------------|
| **User** | `postgres` | `postgres` |
| **Password** | `postgres` | Your project password |
| **Host** | `localhost` | `db.xxxxx.supabase.co` |
| **Port** | `54322` | `5432` |
| **Database** | `postgres` | `postgres` |

---

## Common Commands

### Run SQL File

```powershell
# Validate schema
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/testing/validate_schema.sql

# Performance baseline
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/testing/performance_baseline.sql

# Load seed data
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/seed.sql
```

### Execute Single Command

```powershell
# Quick query
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT COUNT(*) FROM user_profiles;"

# Check table exists
psql postgresql://postgres:postgres@localhost:54322/postgres -c "\dt user_profiles"
```

### Interactive Mode

```powershell
# Connect interactively
psql postgresql://postgres:postgres@localhost:54322/postgres

# Once connected, you can run SQL:
# SELECT * FROM user_profiles;
# \dt  (list tables)
# \d user_profiles  (describe table)
# \q  (quit)
```

### Output Options

```powershell
# Quiet mode (no headers, just data)
psql postgresql://postgres:postgres@localhost:54322/postgres -t -c "SELECT COUNT(*) FROM user_profiles;"

# Output to file
psql postgresql://postgres:postgres@localhost:54322/postgres -f validate_schema.sql -o validation-report.txt

# CSV output
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT * FROM user_profiles;" --csv
```

### Useful psql Meta-Commands

When in interactive mode (`psql` without `-c`):

| Command | Description |
|---------|-------------|
| `\dt` | List all tables |
| `\d table_name` | Describe table structure |
| `\di` | List indexes |
| `\df` | List functions |
| `\dv` | List views |
| `\du` | List users |
| `\l` | List databases |
| `\q` | Quit |
| `\?` | Help |

---

## Automation Scripts

### PowerShell: Database Validation Script

**File:** `scripts/validate-database.ps1`

```powershell
# Database Validation Script
# Runs schema validation and performance tests

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
$validationResult = psql $DatabaseUrl -f supabase/testing/validate_schema.sql 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host " ✓ Passed" -ForegroundColor Green
} else {
    Write-Host " ✗ Failed" -ForegroundColor Red
    Write-Host $validationResult
    exit 1
}

# Performance baseline
Write-Host "[3/3] Running performance tests..." -NoNewline
$perfResult = psql $DatabaseUrl -f supabase/testing/performance_baseline.sql 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host " ✓ Passed" -ForegroundColor Green
} else {
    Write-Host " ✗ Failed" -ForegroundColor Red
    Write-Host $perfResult
    exit 1
}

Write-Host ""
Write-Host "✅ All validation checks passed!" -ForegroundColor Green
```

**Usage:**
```powershell
# Local validation
.\scripts\validate-database.ps1

# Cloud validation
.\scripts\validate-database.ps1 -Environment cloud -DatabaseUrl "postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres"
```

### PowerShell: Quick Database Status

**File:** `scripts/db-status.ps1`

```powershell
# Quick Database Status Check

param(
    [string]$DatabaseUrl = "postgresql://postgres:postgres@localhost:54322/postgres"
)

Write-Host "Database Status" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan
Write-Host ""

# Connection test
Write-Host "Connection:" -NoNewline
$test = psql $DatabaseUrl -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host " ✓ Connected" -ForegroundColor Green
} else {
    Write-Host " ✗ Failed" -ForegroundColor Red
    exit 1
}

# Table counts
Write-Host ""
Write-Host "Table Counts:" -ForegroundColor Yellow
psql $DatabaseUrl -t -c "
SELECT 
    'user_profiles' as table_name, COUNT(*) as count FROM user_profiles
UNION ALL
SELECT 'goals', COUNT(*) FROM goals
UNION ALL
SELECT 'subtask_completions', COUNT(*) FROM subtask_completions;
"

# Latest migration
Write-Host ""
Write-Host "Latest Migration:" -ForegroundColor Yellow
psql $DatabaseUrl -t -c "SELECT version, installed_on FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 1;"
```

### Bash: Database Validation (Linux/macOS)

**File:** `scripts/validate-database.sh`

```bash
#!/bin/bash

# Database Validation Script (Bash)

ENVIRONMENT="${1:-local}"
DATABASE_URL="${2:-}"

if [ "$ENVIRONMENT" == "local" ]; then
    DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"
    echo "Environment: Local (Docker)"
elif [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL required for cloud environment"
    echo "Usage: ./scripts/validate-database.sh cloud 'postgresql://...'"
    exit 1
else
    echo "Environment: Cloud"
fi

echo ""

# Validate schema
echo "[1/2] Validating schema..."
if psql "$DATABASE_URL" -f supabase/testing/validate_schema.sql; then
    echo "✓ Schema validation passed"
else
    echo "✗ Schema validation failed"
    exit 1
fi

# Performance baseline
echo "[2/2] Running performance tests..."
if psql "$DATABASE_URL" -f supabase/testing/performance_baseline.sql; then
    echo "✓ Performance tests passed"
else
    echo "✗ Performance tests failed"
    exit 1
fi

echo ""
echo "✅ All validation checks passed!"
```

**Usage:**
```bash
# Make executable
chmod +x scripts/validate-database.sh

# Local validation
./scripts/validate-database.sh

# Cloud validation
./scripts/validate-database.sh cloud "postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres"
```

---

## CI/CD Integration

### GitHub Actions Example

**File:** `.github/workflows/validate-db.yml`

```yaml
name: Validate Database Schema

on:
  push:
    branches: [main, develop]
    paths:
      - 'supabase/migrations/**'
      - 'supabase/testing/**'
  pull_request:
    branches: [main, develop]
    paths:
      - 'supabase/migrations/**'
      - 'supabase/testing/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Install PostgreSQL client
        run: |
          sudo apt-get update
          sudo apt-get install -y postgresql-client
      
      - name: Validate schema
        env:
          DATABASE_URL: ${{ secrets.SUPABASE_DATABASE_URL }}
        run: |
          psql "$DATABASE_URL" -f supabase/testing/validate_schema.sql
      
      - name: Performance baseline
        env:
          DATABASE_URL: ${{ secrets.SUPABASE_DATABASE_URL }}
        run: |
          psql "$DATABASE_URL" -f supabase/testing/performance_baseline.sql
```

**Setup Secrets:**
1. GitHub Repository → Settings → Secrets and variables → Actions
2. Add secret: `SUPABASE_DATABASE_URL`
3. Value: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### GitLab CI Example

**File:** `.gitlab-ci.yml` (add to existing)

```yaml
validate-database:
  stage: test
  image: postgres:16
  before_script:
    - apt-get update && apt-get install -y postgresql-client
  script:
    - psql "$SUPABASE_DATABASE_URL" -f supabase/testing/validate_schema.sql
    - psql "$SUPABASE_DATABASE_URL" -f supabase/testing/performance_baseline.sql
  only:
    changes:
      - supabase/migrations/**
      - supabase/testing/**
```

---

## Troubleshooting

### Issue: "psql: command not found"

**Windows:**
```powershell
# Check if psql is in PATH
where.exe psql

# If not found, add PostgreSQL bin to PATH:
# System Properties → Environment Variables → Path → Add:
# C:\Program Files\PostgreSQL\16\bin

# Or use full path:
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" --version
```

**macOS/Linux:**
```bash
# Check installation
which psql

# If not found, verify installation:
brew list postgresql@16  # macOS
dpkg -l | grep postgresql-client  # Linux
```

### Issue: "Connection refused" (Local)

**Error:**
```
psql: error: connection to server at "localhost" (::1), port 54322 failed
```

**Solution:**
```powershell
# 1. Check if Supabase is running
npx supabase status

# 2. If not running, start it:
npx supabase start

# 3. Verify port 54322 is listening:
netstat -an | findstr 54322  # Windows
lsof -i :54322  # macOS/Linux
```

### Issue: "Password authentication failed" (Cloud)

**Error:**
```
psql: error: password authentication failed for user "postgres"
```

**Solution:**
1. Get correct password from Supabase Dashboard → Settings → Database
2. Use connection string with correct password:
   ```powershell
   $env:DATABASE_URL = "postgresql://postgres:CORRECT_PASSWORD@db.xxxxx.supabase.co:5432/postgres"
   ```
3. Or use connection pooling (port 6543) if available

### Issue: "SSL connection required" (Cloud)

**Error:**
```
psql: error: SSL connection is required
```

**Solution:**
```powershell
# Add ?sslmode=require to connection string
$env:DATABASE_URL = "postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres?sslmode=require"
psql $env:DATABASE_URL -c "SELECT 1;"
```

### Issue: Script exits with code 0 even on errors

**Problem:** Some SQL scripts don't properly exit on errors.

**Solution:** Use `-v ON_ERROR_STOP=1`:
```powershell
psql $DatabaseUrl -v ON_ERROR_STOP=1 -f supabase/testing/validate_schema.sql
```

This makes `psql` exit with non-zero code on any SQL error.

### Issue: Output is messy in automation

**Solution:** Use quiet flags:
```powershell
# Suppress notices and warnings
psql $DatabaseUrl -q -f script.sql

# Suppress all output except errors
psql $DatabaseUrl -q -f script.sql > $null 2>&1

# Only show errors
psql $DatabaseUrl -f script.sql 2>&1 | Where-Object { $_ -match "ERROR|FATAL" }
```

---

## Quick Reference

### Most Common Commands

```powershell
# Validate schema (local)
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/testing/validate_schema.sql

# Validate schema (cloud)
psql $env:DATABASE_URL -f supabase/testing/validate_schema.sql

# Quick query
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT COUNT(*) FROM user_profiles;"

# Interactive mode
psql postgresql://postgres:postgres@localhost:54322/postgres

# Run automation script
.\scripts\validate-database.ps1
```

### Connection String Cheat Sheet

| Environment | Connection String |
|-------------|-------------------|
| **Local Docker** | `postgresql://postgres:postgres@localhost:54322/postgres` |
| **Cloud (Direct)** | `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres` |
| **Cloud (Pooler)** | `postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres` |

---

## Additional Resources

### Official Documentation
- **PostgreSQL psql Docs:** https://www.postgresql.org/docs/current/app-psql.html
- **Connection Strings:** https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING

### Project Documentation
- **Supabase CLI Guide:** `docs/dev/supabase-cli-guide.md`
- **Database Schema:** `docs/supabase/docs-database-schema.md`
- **Query Patterns:** `docs/supabase/docs-query-patterns.md`

### Related Scripts
- **Validation Script:** `supabase/testing/validate_schema.sql`
- **Performance Tests:** `supabase/testing/performance_baseline.sql`

---

**Last Updated:** 2025-12-19
**Maintained by:** Weave Development Team
**Questions?** Check `docs/dev/supabase-cli-guide.md` for Supabase-specific workflows


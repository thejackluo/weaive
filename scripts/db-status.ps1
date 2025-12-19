# Quick Database Status Check
# Shows connection status, table counts, and latest migration
# Usage: .\scripts\db-status.ps1 [-DatabaseUrl "postgresql://..."]

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
    Write-Host $test -ForegroundColor Red
    exit 1
}

# Database version
Write-Host ""
Write-Host "Database Version:" -ForegroundColor Yellow
psql $DatabaseUrl -t -c "SELECT version();" | ForEach-Object { Write-Host "  $_" }

# Table counts
Write-Host ""
Write-Host "Table Counts:" -ForegroundColor Yellow
$tableCounts = psql $DatabaseUrl -t -c @"
SELECT 
    'user_profiles' as table_name, COUNT(*)::text as count FROM user_profiles
UNION ALL
SELECT 'goals', COUNT(*)::text FROM goals
UNION ALL
SELECT 'subtask_templates', COUNT(*)::text FROM subtask_templates
UNION ALL
SELECT 'subtask_instances', COUNT(*)::text FROM subtask_instances
UNION ALL
SELECT 'subtask_completions', COUNT(*)::text FROM subtask_completions
UNION ALL
SELECT 'journal_entries', COUNT(*)::text FROM journal_entries
UNION ALL
SELECT 'daily_aggregates', COUNT(*)::text FROM daily_aggregates;
"@

$tableCounts | ForEach-Object {
    if ($_ -match '\S') {
        $parts = $_ -split '\s+'
        if ($parts.Length -ge 2) {
            Write-Host "  $($parts[0]): $($parts[1])" -ForegroundColor White
        }
    }
}

# Latest migration
Write-Host ""
Write-Host "Latest Migration:" -ForegroundColor Yellow
$migration = psql $DatabaseUrl -t -c "SELECT version, installed_on FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 1;" 2>&1
if ($LASTEXITCODE -eq 0 -and $migration -match '\S') {
    Write-Host "  $migration" -ForegroundColor White
} else {
    Write-Host "  (No migrations found or table doesn't exist)" -ForegroundColor Gray
}

Write-Host ""


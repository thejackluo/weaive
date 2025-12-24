#
# Frontend Hard Reset Script (Windows PowerShell)
# Clears ALL caches and reinstalls dependencies from scratch
#
# Usage: .\scripts\hard-reset.ps1
#

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir

Set-Location $ProjectDir

Write-Host "🧹 FRONTEND HARD RESET" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will:"
Write-Host "  • Stop watchman"
Write-Host "  • Delete .expo cache"
Write-Host "  • Delete node_modules"
Write-Host "  • Delete Metro cache"
Write-Host "  • Delete Expo cache"
Write-Host "  • Delete Haste map cache"
Write-Host "  • Clear npm cache"
Write-Host "  • Reinstall dependencies"
Write-Host "  • Start clean dev server"
Write-Host ""
$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ Aborted" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🛑 Step 1: Stop watchman..." -ForegroundColor Yellow
try {
    watchman watch-del-all 2>$null
} catch {
    Write-Host "   (watchman not running or not installed)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🗑️  Step 2: Delete .expo cache..." -ForegroundColor Yellow
if (Test-Path ".expo") {
    Remove-Item -Recurse -Force ".expo"
    Write-Host "   ✓ Deleted .expo/" -ForegroundColor Green
} else {
    Write-Host "   (already deleted)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🗑️  Step 3: Delete node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "   ✓ Deleted node_modules/" -ForegroundColor Green
} else {
    Write-Host "   (already deleted)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🗑️  Step 4: Delete package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
    Write-Host "   ✓ Deleted package-lock.json" -ForegroundColor Green
} else {
    Write-Host "   (already deleted)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🗑️  Step 5: Delete Metro cache..." -ForegroundColor Yellow
$tempDir = [System.IO.Path]::GetTempPath()
Get-ChildItem -Path $tempDir -Filter "metro-*" -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path $tempDir -Filter "react-*" -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "   ✓ Deleted Metro cache" -ForegroundColor Green

Write-Host ""
Write-Host "🗑️  Step 6: Delete Haste map cache..." -ForegroundColor Yellow
Get-ChildItem -Path $tempDir -Filter "haste-map-*" -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "   ✓ Deleted Haste map cache" -ForegroundColor Green

Write-Host ""
Write-Host "🗑️  Step 7: Delete Expo cache (~/.expo)..." -ForegroundColor Yellow
$expoCache = Join-Path $env:USERPROFILE ".expo\cache"
if (Test-Path $expoCache) {
    Remove-Item -Recurse -Force $expoCache -ErrorAction SilentlyContinue
    Write-Host "   ✓ Deleted ~/.expo/cache" -ForegroundColor Green
} else {
    Write-Host "   (no cache found)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🧼 Step 8: Clear npm cache..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "   ✓ Cleared npm cache" -ForegroundColor Green

Write-Host ""
Write-Host "📦 Step 9: Reinstall dependencies..." -ForegroundColor Yellow
npm install
Write-Host "   ✓ Dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "✅ HARD RESET COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Starting clean dev server..." -ForegroundColor Cyan
Write-Host "   (Metro will rebuild the entire bundle)" -ForegroundColor Gray
Write-Host ""

# Start with full cache clear
npm start -- --reset-cache --clear

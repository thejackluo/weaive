# Weavelight Documentation Viewer - PowerShell Launcher
# Run from project root: .\dev\docs-viewer\scripts\serve.ps1

$PORT = 3030
$ScriptDir = $PSScriptRoot
$ProjectRoot = Split-Path (Split-Path (Split-Path $ScriptDir -Parent) -Parent) -Parent

Write-Host "`n┌──────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "│  📚 Weavelight Documentation Viewer     │" -ForegroundColor Cyan
Write-Host "└──────────────────────────────────────────┘`n" -ForegroundColor Cyan

Write-Host "🌐 Server:      http://localhost:$PORT" -ForegroundColor Green
Write-Host "📂 Project:     $ProjectRoot" -ForegroundColor Yellow
Write-Host "📁 Viewer:      $(Split-Path $ScriptDir -Parent)" -ForegroundColor Yellow

Write-Host "`n💡 Tips:" -ForegroundColor Gray
Write-Host "   • Press `"/`" in browser to search" -ForegroundColor White
Write-Host "   • Press Ctrl+C to stop server" -ForegroundColor White
Write-Host "   • Modern UI with glassmorphism`n" -ForegroundColor White

# Change to project root
Set-Location $ProjectRoot

# Try Node.js first
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "🚀 Starting with Node.js...`n" -ForegroundColor Green
    node "$ScriptDir\server.js"
} 
# Then try Python
elseif (Get-Command python -ErrorAction SilentlyContinue) {
    Write-Host "🚀 Starting with Python...`n" -ForegroundColor Green
    python "$ScriptDir\server.py"
}
# Fallback message
else {
    Write-Host "`n❌ Error: Neither Node.js nor Python found!" -ForegroundColor Red
    Write-Host "`nPlease install one of:" -ForegroundColor Yellow
    Write-Host "  • Node.js: https://nodejs.org/" -ForegroundColor White
    Write-Host "  • Python 3: https://www.python.org/downloads/" -ForegroundColor White
    Write-Host "`n"
    pause
}

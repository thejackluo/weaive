# Cross-platform script to remove .venv and run the development server
# Works on Windows PowerShell
# Usage: .\run-dev.ps1 [-Port 8002]

param(
    [int]$Port = 8002
)

$ErrorActionPreference = "Stop"

# Get the directory where this script is located
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "Removing .venv directory if it exists..." -ForegroundColor Cyan
if (Test-Path ".venv") {
    try {
        Remove-Item -Recurse -Force ".venv" -ErrorAction Stop
        Write-Host "[OK] .venv removed successfully" -ForegroundColor Green
    } catch {
        Write-Host "[WARNING] Could not fully remove .venv (some files may be locked)" -ForegroundColor Yellow
        Write-Host "   This is usually fine - uv will recreate it if needed" -ForegroundColor Gray
    }
} else {
    Write-Host "[INFO] .venv directory not found, skipping removal" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Cyan
Write-Host "   Command: uv run uvicorn app.main:app --reload --host 0.0.0.0 --port $Port" -ForegroundColor Gray
Write-Host ""

# Run the uvicorn server
& uv run uvicorn app.main:app --reload --host 0.0.0.0 --port $Port

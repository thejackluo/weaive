# Cross-platform script to remove .venv and run the development server
# Works on Windows PowerShell
# Usage: .\run-dev.ps1 [-Port 8002] [-SkipCleanup] [-SkipSync]

param(
    [int]$Port = 8002,
    [switch]$SkipCleanup,
    [switch]$SkipSync,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

# Show help if requested
if ($Help) {
    Write-Host ""
    Write-Host "Weave API Development Server" -ForegroundColor Cyan
    Write-Host "============================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\run-dev.ps1 [Options]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor White
    Write-Host "  -Port <number>     Port to run the server on (default: 8002)" -ForegroundColor Gray
    Write-Host "  -SkipCleanup       Skip removing .venv directory" -ForegroundColor Gray
    Write-Host "  -SkipSync          Skip syncing dependencies with uv sync" -ForegroundColor Gray
    Write-Host "  -Help              Show this help message" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor White
    Write-Host "  .\run-dev.ps1" -ForegroundColor Gray
    Write-Host "  .\run-dev.ps1 -Port 8000" -ForegroundColor Gray
    Write-Host "  .\run-dev.ps1 -SkipCleanup -SkipSync" -ForegroundColor Gray
    Write-Host ""
    exit 0
}

# Get the directory where this script is located
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host ""
Write-Host "=== Weave API Development Server ===" -ForegroundColor Cyan
Write-Host ""

# Check if uv is installed
Write-Host "Checking prerequisites..." -ForegroundColor Cyan
try {
    $uvVersion = & uv --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "uv command failed"
    }
    Write-Host "[OK] uv is installed: $uvVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] uv is not installed or not in PATH" -ForegroundColor Red
    Write-Host "   Install with: pip install uv" -ForegroundColor Yellow
    Write-Host "   Or visit: https://github.com/astral-sh/uv" -ForegroundColor Yellow
    exit 1
}

# Validate port range
if ($Port -lt 1024 -or $Port -gt 65535) {
    Write-Host "[ERROR] Port must be between 1024 and 65535" -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "[WARNING] .env file not found" -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Write-Host "   Copy .env.example to .env and configure your credentials" -ForegroundColor Gray
    } else {
        Write-Host "   Create a .env file with your configuration" -ForegroundColor Gray
    }
    Write-Host ""
}

# Remove .venv if requested
if (-not $SkipCleanup) {
    Write-Host "Cleaning up .venv directory..." -ForegroundColor Cyan
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
} else {
    Write-Host "[INFO] Skipping .venv cleanup (--SkipCleanup specified)" -ForegroundColor Yellow
}

# Sync dependencies
if (-not $SkipSync) {
    Write-Host ""
    Write-Host "Syncing dependencies..." -ForegroundColor Cyan
    try {
        & uv sync
        if ($LASTEXITCODE -ne 0) {
            throw "uv sync failed"
        }
        Write-Host "[OK] Dependencies synced successfully" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Failed to sync dependencies" -ForegroundColor Red
        Write-Host "   Run 'uv sync' manually to troubleshoot" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "[INFO] Skipping dependency sync (--SkipSync specified)" -ForegroundColor Yellow
}

# Start the server
Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Cyan
Write-Host "   Port: $Port" -ForegroundColor Gray
Write-Host "   Host: 0.0.0.0 (accessible from all network interfaces)" -ForegroundColor Gray
Write-Host "   Local URL: http://localhost:$Port" -ForegroundColor Gray
Write-Host "   API Docs: http://localhost:$Port/docs" -ForegroundColor Gray
Write-Host "   ReDoc: http://localhost:$Port/redoc" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor DarkGray
Write-Host ""

# Run the uvicorn server
try {
    & uv run uvicorn app.main:app --reload --host 0.0.0.0 --port $Port
} catch {
    Write-Host ""
    Write-Host "[ERROR] Server failed to start" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Yellow
    exit 1
}

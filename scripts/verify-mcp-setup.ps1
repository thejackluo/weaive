# WeaveLight MCP Setup Verification Script
# Run this to check if your MCP servers are configured correctly

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  WeaveLight MCP Setup Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0

# Check Node.js
Write-Host "[1/8] Checking Node.js..." -NoNewline
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✓ Installed ($nodeVersion)" -ForegroundColor Green
    } else {
        Write-Host " ✗ Not found" -ForegroundColor Red
        Write-Host "      Install from: https://nodejs.org/" -ForegroundColor Yellow
        $errors++
    }
} catch {
    Write-Host " ✗ Not found" -ForegroundColor Red
    Write-Host "      Install from: https://nodejs.org/" -ForegroundColor Yellow
    $errors++
}

# Check npx
Write-Host "[2/8] Checking npx..." -NoNewline
try {
    $npxVersion = npx --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✓ Available ($npxVersion)" -ForegroundColor Green
    } else {
        Write-Host " ✗ Not found" -ForegroundColor Red
        $errors++
    }
} catch {
    Write-Host " ✗ Not found" -ForegroundColor Red
    $errors++
}

# Check .mcp.json
Write-Host "[3/8] Checking .mcp.json..." -NoNewline
if (Test-Path ".mcp.json") {
    try {
        $mcpConfig = Get-Content ".mcp.json" | ConvertFrom-Json
        Write-Host " ✓ Found" -ForegroundColor Green
        
        # Check server count
        $serverCount = ($mcpConfig.mcpServers | Get-Member -MemberType NoteProperty).Count
        Write-Host "      Configured servers: $serverCount" -ForegroundColor Cyan
    } catch {
        Write-Host " ✗ Invalid JSON" -ForegroundColor Red
        Write-Host "      Fix JSON syntax errors" -ForegroundColor Yellow
        $errors++
    }
} else {
    Write-Host " ✗ Not found" -ForegroundColor Red
    Write-Host "      Create .mcp.json in project root" -ForegroundColor Yellow
    $errors++
}

# Check .env file
Write-Host "[4/8] Checking .env file..." -NoNewline
if (Test-Path ".env") {
    Write-Host " ✓ Found" -ForegroundColor Green
    
    # Check for API keys
    $envContent = Get-Content ".env" -Raw
    
    if ($envContent -match "CONTEXT7_API_KEY=\S+") {
        Write-Host "      ✓ Context7 API key configured" -ForegroundColor Green
    } else {
        Write-Host "      ⚠ Context7 API key not set" -ForegroundColor Yellow
        $warnings++
    }
    
    if ($envContent -match "GITHUB_PERSONAL_ACCESS_TOKEN=\S+") {
        Write-Host "      ✓ GitHub token configured" -ForegroundColor Green
    } else {
        Write-Host "      ⚠ GitHub token not set" -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host " ⚠ Not found" -ForegroundColor Yellow
    Write-Host "      Create .env file for API keys (recommended)" -ForegroundColor Yellow
    $warnings++
}

# Check .gitignore
Write-Host "[5/8] Checking .gitignore..." -NoNewline
if (Test-Path ".gitignore") {
    $gitignore = Get-Content ".gitignore" -Raw
    
    $hasEnv = $gitignore -match "\.env"
    $hasMcp = $gitignore -match "\.mcp\.json"
    
    if ($hasEnv -and $hasMcp) {
        Write-Host " ✓ API keys protected" -ForegroundColor Green
    } elseif ($hasEnv) {
        Write-Host " ⚠ .mcp.json not in .gitignore" -ForegroundColor Yellow
        $warnings++
    } elseif ($hasMcp) {
        Write-Host " ⚠ .env not in .gitignore" -ForegroundColor Yellow
        $warnings++
    } else {
        Write-Host " ✗ Sensitive files not protected" -ForegroundColor Red
        Write-Host "      Add .env and .mcp.json to .gitignore" -ForegroundColor Yellow
        $errors++
    }
} else {
    Write-Host " ⚠ .gitignore not found" -ForegroundColor Yellow
    $warnings++
}

# Check project path
Write-Host "[6/8] Checking project path..." -NoNewline
$currentPath = Get-Location
$expectedPath = "C:\Users\Jack Luo\Desktop\(local) github software\weavelight"
if ($currentPath.Path -eq $expectedPath) {
    Write-Host " ✓ Correct location" -ForegroundColor Green
} else {
    Write-Host " ⚠ Running from: $($currentPath.Path)" -ForegroundColor Yellow
    Write-Host "      Expected: $expectedPath" -ForegroundColor Yellow
    $warnings++
}

# Check docs folder
Write-Host "[7/8] Checking docs folder..." -NoNewline
if (Test-Path "docs") {
    Write-Host " ✓ Found" -ForegroundColor Green
} else {
    Write-Host " ✗ Not found" -ForegroundColor Red
    $errors++
}

# Check for setup guide
Write-Host "[8/8] Checking setup guide..." -NoNewline
if (Test-Path "docs\setup\mcp-setup-guide.md") {
    Write-Host " ✓ Found" -ForegroundColor Green
} else {
    Write-Host " ⚠ Setup guide not found" -ForegroundColor Yellow
    $warnings++
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "✓ All checks passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Add API keys to .env file"
    Write-Host "2. Restart Cursor"
    Write-Host "3. Test with: 'Search code with ripgrep'"
} elseif ($errors -eq 0) {
    Write-Host "⚠ Setup is functional with $warnings warning(s)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You can proceed, but consider fixing warnings for best experience."
} else {
    Write-Host "✗ Found $errors error(s) and $warnings warning(s)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Fix errors above before proceeding."
}

Write-Host ""
Write-Host "For detailed setup instructions:" -ForegroundColor Cyan
Write-Host "  docs\setup\mcp-setup-guide.md"
Write-Host ""


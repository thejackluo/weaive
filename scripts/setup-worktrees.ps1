# Git Worktree Setup Script for Parallel Feature Development
# Creates two workspaces: one for features 0.2/0.6, another for 0.3/0.7

param(
    [switch]$Remove,
    [switch]$List
)

$RepoRoot = "c:\Users\Jack Luo\Desktop\(local) github software\weavelight"
$ParentDir = "c:\Users\Jack Luo\Desktop\(local) github software"
$Workspace1 = "$ParentDir\weavelight-workspace-1"
$Workspace2 = "$ParentDir\weavelight-workspace-2"

# Change to repo directory
Set-Location $RepoRoot

if ($List) {
    Write-Host "`n=== Current Worktrees ===" -ForegroundColor Cyan
    git worktree list
    exit 0
}

if ($Remove) {
    Write-Host "`n=== Removing Worktrees ===" -ForegroundColor Yellow
    
    if (Test-Path $Workspace1) {
        Write-Host "Removing workspace 1..." -ForegroundColor Yellow
        git worktree remove $Workspace1 -f
        Write-Host "✓ Workspace 1 removed" -ForegroundColor Green
    } else {
        Write-Host "Workspace 1 doesn't exist" -ForegroundColor Gray
    }
    
    if (Test-Path $Workspace2) {
        Write-Host "Removing workspace 2..." -ForegroundColor Yellow
        git worktree remove $Workspace2 -f
        Write-Host "✓ Workspace 2 removed" -ForegroundColor Green
    } else {
        Write-Host "Workspace 2 doesn't exist" -ForegroundColor Gray
    }
    
    Write-Host "`n✓ Cleanup complete!" -ForegroundColor Green
    exit 0
}

# Setup mode
Write-Host "`n=== Setting Up Git Worktrees ===" -ForegroundColor Cyan
Write-Host "Workspace 1: Features 0.2 and 0.6" -ForegroundColor White
Write-Host "Workspace 2: Features 0.3 and 0.7`n" -ForegroundColor White

# Check for uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "⚠ Warning: You have uncommitted changes!" -ForegroundColor Yellow
    Write-Host "Current changes:" -ForegroundColor Yellow
    git status --short
    Write-Host "`nOptions:" -ForegroundColor Yellow
    Write-Host "1. Commit your changes: git add . && git commit -m 'WIP: current progress'" -ForegroundColor White
    Write-Host "2. Stash your changes: git stash push -m 'WIP: current progress'" -ForegroundColor White
    Write-Host "3. Continue anyway (not recommended)" -ForegroundColor White
    $response = Read-Host "`nContinue? (y/n)"
    if ($response -ne 'y') {
        Write-Host "Setup cancelled." -ForegroundColor Red
        exit 1
    }
}

# Check if worktrees already exist
if (Test-Path $Workspace1) {
    Write-Host "⚠ Workspace 1 already exists at: $Workspace1" -ForegroundColor Yellow
    $response = Read-Host "Remove and recreate? (y/n)"
    if ($response -eq 'y') {
        git worktree remove $Workspace1 -f
    } else {
        Write-Host "Skipping workspace 1 setup" -ForegroundColor Gray
    }
}

if (Test-Path $Workspace2) {
    Write-Host "⚠ Workspace 2 already exists at: $Workspace2" -ForegroundColor Yellow
    $response = Read-Host "Remove and recreate? (y/n)"
    if ($response -eq 'y') {
        git worktree remove $Workspace2 -f
    } else {
        Write-Host "Skipping workspace 2 setup" -ForegroundColor Gray
    }
}

# Create Workspace 1 (story/0.2)
Write-Host "`n=== Creating Workspace 1 (story/0.2) ===" -ForegroundColor Cyan
try {
    # Check if story/0.2 exists
    $branchExists = git show-ref --verify --quiet "refs/heads/story/0.2"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Branch story/0.2 exists, creating worktree..." -ForegroundColor Gray
        git worktree add $Workspace1 story/0.2
    } else {
        Write-Host "Branch story/0.2 doesn't exist, creating new branch..." -ForegroundColor Gray
        git worktree add $Workspace1 -b story/0.2
    }
    Write-Host "✓ Workspace 1 created at: $Workspace1" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to create workspace 1: $_" -ForegroundColor Red
}

# Create Workspace 2 (story/0.3)
Write-Host "`n=== Creating Workspace 2 (story/0.3) ===" -ForegroundColor Cyan
try {
    # Check if story/0.3 exists
    $branchExists = git show-ref --verify --quiet "refs/heads/story/0.3"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Branch story/0.3 exists, creating worktree..." -ForegroundColor Gray
        git worktree add $Workspace2 story/0.3
    } else {
        Write-Host "Branch story/0.3 doesn't exist, creating new branch..." -ForegroundColor Gray
        git worktree add $Workspace2 -b story/0.3
    }
    Write-Host "✓ Workspace 2 created at: $Workspace2" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to create workspace 2: $_" -ForegroundColor Red
}

# Show summary
Write-Host "`n=== Setup Complete! ===" -ForegroundColor Green
Write-Host "`nAll worktrees:" -ForegroundColor Cyan
git worktree list

Write-Host "`n=== Quick Start Commands ===" -ForegroundColor Cyan
Write-Host "`nWorkspace 1 (Features 0.2 & 0.6):" -ForegroundColor White
Write-Host "  cd `"$Workspace1`"" -ForegroundColor Gray
Write-Host "  code ." -ForegroundColor Gray
Write-Host "  git checkout story/0.2  # or story/0.6" -ForegroundColor Gray

Write-Host "`nWorkspace 2 (Features 0.3 & 0.7):" -ForegroundColor White
Write-Host "  cd `"$Workspace2`"" -ForegroundColor Gray
Write-Host "  code . -n  # Opens in new VS Code window" -ForegroundColor Gray
Write-Host "  git checkout story/0.3  # or story/0.7" -ForegroundColor Gray

Write-Host "`n=== Management Commands ===" -ForegroundColor Cyan
Write-Host "  List worktrees:    .\scripts\setup-worktrees.ps1 -List" -ForegroundColor Gray
Write-Host "  Remove worktrees:  .\scripts\setup-worktrees.ps1 -Remove" -ForegroundColor Gray

Write-Host "`n✓ Ready to work on parallel features! 🚀" -ForegroundColor Green


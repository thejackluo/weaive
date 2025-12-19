# Git Worktrees for Parallel Feature Development

**Last Updated:** 2025-12-17

## Goal

Set up two separate workspaces to work on features in parallel:
- **Workspace 1:** Features 0.2 and 0.6
- **Workspace 2:** Features 0.3 and 0.7

## What Are Worktrees?

**Worktrees** let you have multiple copies of your repository, each on a different branch, in separate folders. This means you can:
- Open two VS Code windows side-by-side
- Work on different features simultaneously
- Test one feature while coding another
- Compare code between branches easily

**Normal workflow (one branch at a time):**
```
weavelight/  ← You switch branches here
```

**With worktrees (multiple branches simultaneously):**
```
weavelight/              ← main branch
weavelight-workspace-1/  ← story/0.2 branch
weavelight-workspace-2/  ← story/0.3 branch
```

---

## Setup: Creating Your Two Workspaces

### Step 1: Commit or Stash Current Work

Before creating worktrees, handle any uncommitted changes:

```powershell
# Check current status
git status

# Option A: Commit your work
git add .
git commit -m "WIP: current progress on story/0.2"

# Option B: Stash your work (if not ready to commit)
git stash push -m "WIP: story/0.2 progress"
```

### Step 2: Create Workspace 1 (Features 0.2 & 0.6)

```powershell
# Navigate to parent directory
cd "c:\Users\Jack Luo\Desktop\(local) github software"

# Create worktree for story/0.2 (or create new branch if needed)
git worktree add ../weavelight-workspace-1 story/0.2

# If story/0.2 doesn't exist yet, create it:
# git worktree add ../weavelight-workspace-1 -b story/0.2
```

**Result:**
```
(local) github software/
├── weavelight/              ← Original repo (main or current branch)
└── weavelight-workspace-1/ ← New folder with story/0.2 branch
```

### Step 3: Create Workspace 2 (Features 0.3 & 0.7)

```powershell
# Still in parent directory
# Create worktree for story/0.3
git worktree add ../weavelight-workspace-2 -b story/0.3

# If story/0.3 already exists:
# git worktree add ../weavelight-workspace-2 story/0.3
```

**Result:**
```
(local) github software/
├── weavelight/              ← Original repo
├── weavelight-workspace-1/ ← story/0.2 branch
└── weavelight-workspace-2/ ← story/0.3 branch
```

### Step 4: Verify Worktrees

```powershell
# From any worktree, list all worktrees
git worktree list
```

**Expected output:**
```
C:/Users/Jack Luo/Desktop/(local) github software/weavelight          abc123 [main]
C:/Users/Jack Luo/Desktop/(local) github software/weavelight-workspace-1 def456 [story/0.2]
C:/Users/Jack Luo/Desktop/(local) github software/weavelight-workspace-2 ghi789 [story/0.3]
```

---

## Daily Workflow: Using Your Workspaces

### Working on Features 0.2 and 0.6 (Workspace 1)

```powershell
# Navigate to workspace 1
cd "c:\Users\Jack Luo\Desktop\(local) github software\weavelight-workspace-1"

# Verify you're on the right branch
git status
# Should show: "On branch story/0.2"

# Open in VS Code
code .

# Work normally - all git commands work here
git add .
git commit -m "feat: progress on story/0.2"
git push

# When ready to work on 0.6, switch branches (in this workspace)
git checkout -b story/0.6
# Or if story/0.6 already exists:
git checkout story/0.6
```

### Working on Features 0.3 and 0.7 (Workspace 2)

```powershell
# Navigate to workspace 2
cd "c:\Users\Jack Luo\Desktop\(local) github software\weavelight-workspace-2"

# Verify you're on the right branch
git status
# Should show: "On branch story/0.3"

# Open in VS Code (separate window)
code .

# Work normally
git add .
git commit -m "feat: progress on story/0.3"
git push

# When ready to work on 0.7, switch branches (in this workspace)
git checkout -b story/0.7
# Or if story/0.7 already exists:
git checkout story/0.7
```

### Switching Between Features in the Same Workspace

You can switch branches within a worktree just like normal:

```powershell
# In workspace 1
cd "c:\Users\Jack Luo\Desktop\(local) github software\weavelight-workspace-1"

# Switch from 0.2 to 0.6
git checkout story/0.6

# Switch back to 0.2
git checkout story/0.2
```

---

## Recommended Organization Strategy

### Option A: One Branch Per Workspace (Recommended)

**Workspace 1:** Only story/0.2
- When done with 0.2, switch to 0.6 in the same workspace
- Keeps things simple

**Workspace 2:** Only story/0.3
- When done with 0.3, switch to 0.7 in the same workspace

### Option B: Multiple Worktrees Per Feature

If you want to have 0.2 and 0.6 open simultaneously:

```powershell
# Create separate worktrees for each feature
git worktree add ../weavelight-0.2 story/0.2
git worktree add ../weavelight-0.6 -b story/0.6
git worktree add ../weavelight-0.3 story/0.3
git worktree add ../weavelight-0.7 -b story/0.7
```

**Result:**
```
weavelight/          ← main
weavelight-0.2/      ← story/0.2
weavelight-0.6/      ← story/0.6
weavelight-0.3/      ← story/0.3
weavelight-0.7/      ← story/0.7
```

This gives you 4 separate VS Code windows, one for each feature.

---

## Managing Worktrees

### List All Worktrees

```powershell
git worktree list
```

### Remove a Worktree

```powershell
# Option A: Proper removal (recommended)
git worktree remove ../weavelight-workspace-1

# Option B: If folder was deleted manually
git worktree prune
```

### Update All Worktrees

When `main` gets updated, you'll want to update your feature branches:

```powershell
# In workspace 1 (story/0.2)
cd ../weavelight-workspace-1
git checkout story/0.2
git pull origin main  # Or rebase: git rebase main

# In workspace 2 (story/0.3)
cd ../weavelight-workspace-2
git checkout story/0.3
git pull origin main  # Or rebase: git rebase main
```

---

## VS Code Setup for Multiple Workspaces

### Opening Multiple Windows

1. **Open workspace 1:**
   ```powershell
   cd "c:\Users\Jack Luo\Desktop\(local) github software\weavelight-workspace-1"
   code .
   ```

2. **Open workspace 2 in a new window:**
   ```powershell
   cd "c:\Users\Jack Luo\Desktop\(local) github software\weavelight-workspace-2"
   code . -n  # -n opens in new window
   ```

### Using VS Code Workspace Files

Create workspace files to quickly switch:

**`weavelight-workspace-1.code-workspace`:**
```json
{
  "folders": [
    {
      "path": "weavelight-workspace-1"
    }
  ],
  "settings": {
    "git.defaultBranchName": "story/0.2"
  }
}
```

**`weavelight-workspace-2.code-workspace`:**
```json
{
  "folders": [
    {
      "path": "weavelight-workspace-2"
    }
  ],
  "settings": {
    "git.defaultBranchName": "story/0.3"
  }
}
```

Then open with:
```powershell
code weavelight-workspace-1.code-workspace
code weavelight-workspace-2.code-workspace -n
```

---

## Common Scenarios

### Scenario 1: Starting Feature 0.2

```powershell
# Navigate to workspace 1
cd ../weavelight-workspace-1

# Make sure you're on story/0.2
git checkout story/0.2

# Pull latest changes
git pull origin main

# Start working
code .
```

### Scenario 2: Switching from 0.2 to 0.6 in Workspace 1

```powershell
# In workspace 1
cd ../weavelight-workspace-1

# Commit or stash current work
git add .
git commit -m "WIP: progress on 0.2"

# Switch to 0.6
git checkout -b story/0.6
# Or: git checkout story/0.6

# Continue working
```

### Scenario 3: Comparing Code Between Features

```powershell
# In workspace 1 (story/0.2)
cd ../weavelight-workspace-1
code file.tsx

# In workspace 2 (story/0.3) - new VS Code window
cd ../weavelight-workspace-2
code file.tsx -n

# Now you can see both side-by-side!
```

### Scenario 4: Merging Feature 0.2 to Main

```powershell
# Switch to main in original repo
cd ../weavelight
git checkout main
git pull origin main

# Merge story/0.2
git merge story/0.2

# Push
git push origin main

# Update workspace 1 to latest main
cd ../weavelight-workspace-1
git checkout story/0.2
git pull origin main
```

---

## Best Practices

### ✅ DO

1. **One feature per worktree** (or group related features)
2. **Commit frequently** in each worktree
3. **Pull main regularly** to stay up-to-date
4. **Use descriptive worktree folder names** (e.g., `weavelight-workspace-1`)
5. **Close worktrees when done** with features

### ❌ DON'T

1. **Don't create worktrees for the same branch** (Git will prevent this)
2. **Don't forget to push** from each worktree
3. **Don't delete worktree folders manually** - use `git worktree remove`
4. **Don't work on main in a worktree** - use the original repo

---

## Troubleshooting

### Problem: "fatal: 'path' is already a working tree"

**Solution:** The worktree already exists. Either:
- Use the existing worktree: `cd ../weavelight-workspace-1`
- Remove it first: `git worktree remove ../weavelight-workspace-1`

### Problem: "fatal: 'branch' is already checked out"

**Solution:** That branch is checked out in another worktree. Either:
- Switch to the worktree that has it checked out
- Or create a new branch: `git worktree add ../path -b new-branch-name`

### Problem: Worktree folder deleted but Git still thinks it exists

**Solution:**
```powershell
git worktree prune
```

### Problem: Can't push from worktree

**Solution:** Make sure you've set upstream:
```powershell
git push -u origin story/0.2
```

---

## Quick Reference Commands

```powershell
# Create worktree for existing branch
git worktree add ../weavelight-workspace-1 story/0.2

# Create worktree with new branch
git worktree add ../weavelight-workspace-1 -b story/0.2

# List all worktrees
git worktree list

# Remove worktree
git worktree remove ../weavelight-workspace-1

# Clean up deleted worktrees
git worktree prune

# Switch branches within a worktree (normal git)
cd ../weavelight-workspace-1
git checkout story/0.6
```

---

## Your Specific Setup

Based on your needs (0.2, 0.6 in one workspace; 0.3, 0.7 in another):

### Initial Setup

```powershell
# From weavelight directory
cd "c:\Users\Jack Luo\Desktop\(local) github software\weavelight"

# Workspace 1: Features 0.2 and 0.6
git worktree add ../weavelight-workspace-1 story/0.2

# Workspace 2: Features 0.3 and 0.7
git worktree add ../weavelight-workspace-2 -b story/0.3
```

### Daily Usage

**Morning - Start on 0.2:**
```powershell
cd ../weavelight-workspace-1
git checkout story/0.2
git pull origin main
code .
```

**Switch to 0.6 (same workspace):**
```powershell
# Still in workspace-1
git checkout -b story/0.6  # or git checkout story/0.6 if exists
```

**Afternoon - Start on 0.3:**
```powershell
cd ../weavelight-workspace-2
git checkout story/0.3
git pull origin main
code . -n  # New VS Code window
```

**Switch to 0.7 (same workspace):**
```powershell
# Still in workspace-2
git checkout -b story/0.7  # or git checkout story/0.7 if exists
```

---

## Summary

**Worktrees let you:**
- Work on multiple features simultaneously
- Keep separate VS Code windows for each feature
- Test one feature while coding another
- Compare code between branches easily

**Your setup:**
- **Workspace 1:** Features 0.2 → 0.6
- **Workspace 2:** Features 0.3 → 0.7

**Key commands:**
- `git worktree add ../path branch` - Create worktree
- `git worktree list` - See all worktrees
- `git worktree remove ../path` - Remove worktree
- Normal git commands work in each worktree!

Happy parallel coding! 🚀


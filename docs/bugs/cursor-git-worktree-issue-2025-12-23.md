# Cursor IDE Git Worktree History Issue (2025-12-23)

## Problem

**Symptom:** Cursor IDE cannot display git history when working in a git worktree directory.

**Environment:**
- Git worktrees configured for parallel branch development
- Cursor IDE (latest version as of Dec 2025)
- WSL2 environment with Windows paths

**Impact:** Developers lose access to:
- Commit history visualization
- Git timeline
- Blame information
- Branch comparison tools

This significantly disrupts the developer workflow, especially when reviewing changes or understanding code evolution.

---

## Root Cause

Git worktrees can be configured with either **absolute paths** or **relative paths** in the `.git` pointer file.

**Absolute path format (BREAKS Cursor):**
```
gitdir: /mnt/c/Users/Jack Luo/Desktop/(local) github software/weavelight/.git/worktrees/weave-ai-6-2
```

**Relative path format (WORKS in Cursor):**
```
gitdir: ../weavelight/.git/worktrees/weave-ai-6-2
```

**Explanation:** Cursor IDE has limited support for git worktrees and does not properly resolve absolute paths in worktree `.git` pointer files. However, it successfully handles relative paths that reference the main repository.

---

## Solution

Convert the worktree's `.git` pointer file from absolute path to relative path.

### Step-by-Step Fix

1. **Navigate to the worktree directory:**
   ```bash
   cd "/mnt/c/Users/Jack Luo/Desktop/(local) github software/weave-ai-6-2"
   ```

2. **Check current .git configuration:**
   ```bash
   cat .git
   # Output: gitdir: /mnt/c/Users/.../weavelight/.git/worktrees/weave-ai-6-2
   ```

3. **Update to relative path:**
   ```bash
   echo "gitdir: ../weavelight/.git/worktrees/weave-ai-6-2" > .git
   ```

4. **Verify git still works:**
   ```bash
   git status
   # Should display branch and file status normally
   ```

5. **Verify Cursor IDE now shows history:**
   - Restart Cursor IDE
   - Open the worktree directory
   - Check Source Control panel → Timeline view
   - Git history should now be visible

### Automated Fix Script

For future worktrees, you can automate this fix:

```bash
#!/bin/bash
# Fix git worktree for Cursor IDE
# Usage: ./fix-worktree-cursor.sh <worktree-name>

WORKTREE_NAME=$1
WORKTREE_PATH="/mnt/c/Users/Jack Luo/Desktop/(local) github software/${WORKTREE_NAME}"

if [ ! -d "$WORKTREE_PATH" ]; then
  echo "Error: Worktree directory not found: $WORKTREE_PATH"
  exit 1
fi

cd "$WORKTREE_PATH"
echo "gitdir: ../weavelight/.git/worktrees/${WORKTREE_NAME}" > .git
git status > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo "✅ Successfully fixed git worktree: $WORKTREE_NAME"
  echo "Cursor IDE should now display git history."
else
  echo "❌ Git verification failed. Please check the configuration."
  exit 1
fi
```

---

## Prevention

When creating new worktrees, configure them with relative paths from the start:

### Option 1: Create worktree with relative path

```bash
cd "/mnt/c/Users/Jack Luo/Desktop/(local) github software/weavelight"

# Create worktree with relative reference
git worktree add ../weave-ai-6.3 story/6.3
```

### Option 2: Fix after creation

If you create a worktree normally and it uses absolute paths, apply the fix immediately:

```bash
# Create worktree (might use absolute path)
git worktree add ../weave-ai-6.3 story/6.3

# Fix the .git pointer to use relative path
cd ../weave-ai-6.3
echo "gitdir: ../weavelight/.git/worktrees/weave-ai-6.3" > .git
```

---

## Verification Checklist

After applying the fix, verify:

- [ ] `.git` file contains relative path (`../weavelight/.git/worktrees/...`)
- [ ] `git status` works correctly
- [ ] `git log` displays commit history
- [ ] Cursor IDE Source Control panel shows files
- [ ] Cursor IDE Timeline view displays commits
- [ ] Git operations (commit, push, pull) work normally

---

## Related Issues

- Similar issue reported with VSCode worktrees (though VSCode has better worktree support than Cursor)
- Some IDEs cache the absolute path and require a restart after the fix
- WSL2 path translation can sometimes interfere with relative paths (not observed in this case)

---

## Technical Details

**Worktree Structure:**

```
weavelight/                              # Main repository
├── .git/                                # Main git directory
│   └── worktrees/                       # Worktree metadata
│       ├── weave-ai-6-2/                # Worktree-specific git data
│       │   ├── HEAD                     # Current branch reference
│       │   ├── index                    # Staging area
│       │   └── gitdir                   # Path back to worktree
│       └── weave-prod/
│           └── ...
│
weave-ai-6-2/                            # Worktree directory (separate location)
├── .git                                 # Pointer file (NOT a directory)
│                                        # Content: "gitdir: ../weavelight/.git/worktrees/weave-ai-6-2"
└── [project files]

weave-prod/                              # Another worktree (working correctly)
├── .git                                 # Uses relative path (works in Cursor)
└── [project files]
```

**How Git Worktrees Work:**

1. Main repository has a `.git` directory (full git database)
2. Worktrees have a `.git` **file** (pointer to main repository's worktree metadata)
3. The pointer file contains `gitdir: <path>` to the actual git data
4. Git resolves this path (absolute or relative) to find the worktree's git metadata

**Why Relative Paths Work Better:**

- Cursor IDE's git integration may not properly expand absolute paths in worktree pointers
- Relative paths are simpler to resolve and more portable (works if directories are moved together)
- Relative paths match how git naturally references parent directories

---

## Status

✅ **RESOLVED** - Applied fix to `weave-ai-6-2` worktree on 2025-12-23

**Worktrees:**
- `weave-ai-6-2`: ✅ Fixed (using relative path)
- `weave-prod`: ✅ Already working (was using relative path)
- `weave-ds-0-2`: ⚠️ Unknown (not checked)

**Recommendation:** Apply this fix to all existing worktrees and use relative paths for all new worktrees going forward.

---

## References

- [Git Worktree Documentation](https://git-scm.com/docs/git-worktree)
- [VSCode Worktree Issues](https://github.com/microsoft/vscode/issues?q=worktree)
- Project Git Workflow Guide: `docs/dev/git-workflow-guide.md`

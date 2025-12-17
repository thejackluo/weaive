# Git Workflow Guide (Non-Technical)

**Last Updated:** 2025-12-17

## What is This Guide?

This guide explains how to use Git, GitHub, and version control effectively while building Weave using BMAD. Think of Git as a time machine for your code - it lets you save progress, experiment safely, collaborate with others, and undo mistakes.

---

## Table of Contents

1. [Git Basics: The Mental Model](#git-basics-the-mental-model)
2. [Branching Strategy for BMAD](#branching-strategy-for-bmad)
3. [Daily Git Workflow](#daily-git-workflow)
4. [Git Worktrees (Advanced)](#git-worktrees-advanced)
5. [Handling Merge Conflicts](#handling-merge-conflicts)
6. [Creating Issues and Pull Requests](#creating-issues-and-pull-requests)
7. [Debugging with Git](#debugging-with-git)
8. [Common Git Problems and Solutions](#common-git-problems-and-solutions)
9. [Git Commands Cheat Sheet](#git-commands-cheat-sheet)

---

## Git Basics: The Mental Model

### What is Git?

Imagine you're writing a book:
- **Without Git:** You have one Word document. If you make a mistake, you hit undo 50 times or start over.
- **With Git:** You save a snapshot of your book every chapter. You can go back to any chapter, try different endings, and merge the best ideas.

**Git is a version control system** that saves snapshots of your code called **commits**.

### Key Concepts

#### 1. Repository (Repo)

A **repository** is like a project folder with a time machine built in.

```
weavelight/              ← Your repository
├── .git/               ← The time machine (Git's history)
├── src/                ← Your code
├── docs/               ← Your documentation
└── README.md
```

#### 2. Commit

A **commit** is a snapshot of your code at a specific moment.

**Analogy:** Like a save point in a video game. You can always go back to this exact state.

```
Commit A: "Added login screen"
   ↓
Commit B: "Fixed login bug"
   ↓
Commit C: "Added logout button"
   ↓
Commit D: "Current state" ← You are here
```

#### 3. Branch

A **branch** is a parallel timeline where you can experiment without affecting the main codebase.

**Analogy:** Like writing a draft chapter without changing the published book.

```
main branch (published book):
A → B → C → D

feature/new-chapter branch (draft):
A → B → C → E → F
              ↑
           Your draft
```

Later, you can **merge** your draft back into the published book.

#### 4. Remote (GitHub)

A **remote** is a copy of your repository stored online (on GitHub).

**Analogy:** Like Google Drive for code. Your local computer has a copy, GitHub has a copy. You sync them.

```
Your Computer (Local)          GitHub (Remote)
weavelight/            ⟷      github.com/you/weavelight
```

---

## Branching Strategy for BMAD

### BMAD Branch Model

When building Weave with BMAD, use this branching strategy:

```
main (production-ready code)
  │
  ├── epic/0-foundation
  │     │
  │     ├── story/0.1-mobile-backend-init
  │     ├── story/0.2-database-schema
  │     └── story/0.3-authentication
  │
  ├── epic/1-onboarding
  │     │
  │     ├── story/1.1-welcome-screen
  │     ├── story/1.2-demographics
  │     └── story/1.3-archetype-quiz
  │
  └── epic/2-goal-management
        └── story/2.1-view-goals-list
```

### Branch Naming Convention

| Branch Type | Pattern | Example | Purpose |
|-------------|---------|---------|---------|
| **Main** | `main` | `main` | Production-ready code |
| **Epic** | `epic/N-name` | `epic/0-foundation` | Groups related stories |
| **Story** | `story/N.N-name` | `story/0.1-mobile-backend-init` | Individual feature work |
| **Hotfix** | `hotfix/description` | `hotfix/login-crash` | Emergency bug fixes |

### Branch Lifecycle

```
1. Create story branch from main
   main → story/0.1-mobile-backend-init

2. Do your work (commits)
   story/0.1-mobile-backend-init: A → B → C

3. Code review passes

4. Merge back to main via Pull Request
   story/0.1-mobile-backend-init → main

5. Delete story branch (cleanup)
```

---

## Daily Git Workflow

### Morning: Starting a New Story

#### Step 1: Check Current Status

```bash
# See what branch you're on and what's changed
git status
```

**Output:**
```
On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean
```

**Translation:** You're on the main branch, everything is synced, no changes.

---

#### Step 2: Pull Latest Changes

```bash
# Get the latest code from GitHub
git pull origin main
```

**What this does:** Downloads any changes other people made to `main`.

**Why it matters:** Ensures you start with the latest code.

---

#### Step 3: Create a New Branch for Your Story

```bash
# Create and switch to a new branch
git checkout -b story/0.1-mobile-backend-init
```

**Breaking it down:**
- `git checkout`: Switch branches
- `-b`: Create a new branch
- `story/0.1-mobile-backend-init`: The branch name

**What happens:**
```
main (you were here)
  │
  └── story/0.1-mobile-backend-init (you are now here)
```

**Verify:**
```bash
git status
```

**Output:**
```
On branch story/0.1-mobile-backend-init
nothing to commit, working tree clean
```

---

### During the Day: Making Progress

#### Step 4: Do Your Work

Now you run the BMAD workflows:
```bash
# Work on your story
/bmad:bmm:workflows:dev-story
```

Claude will create/modify files. Let's say it created:
- `mobile/App.tsx`
- `api/main.py`
- `README.md`

---

#### Step 5: Check What Changed

```bash
git status
```

**Output:**
```
On branch story/0.1-mobile-backend-init
Untracked files:
  mobile/App.tsx
  api/main.py
  README.md

nothing added to commit but untracked files present
```

**Translation:** These files are new, but Git isn't tracking them yet.

---

#### Step 6: Stage Your Changes

```bash
# Add all changed files
git add .

# Or add specific files
git add mobile/App.tsx api/main.py
```

**What this does:** Tells Git "I want to include these files in my next snapshot (commit)."

**Analogy:** Like putting items in a shopping cart before checkout.

**Verify:**
```bash
git status
```

**Output:**
```
On branch story/0.1-mobile-backend-init
Changes to be committed:
  new file:   mobile/App.tsx
  new file:   api/main.py
  new file:   README.md
```

---

#### Step 7: Commit Your Changes

```bash
# Create a snapshot with a message
git commit -m "feat: initialize mobile and backend apps

- Created Expo mobile app with TypeScript
- Created FastAPI backend with health endpoint
- Added README with setup instructions

🤖 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**Breaking it down:**
- `git commit`: Create a snapshot
- `-m "message"`: The commit message
- `feat:`: Conventional commit type (feat, fix, docs, etc.)

**Commit Message Format:**
```
type: brief description (50 chars max)

- Detailed bullet points
- What changed
- Why it changed

🤖 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**Commit Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Build/config changes

---

#### Step 8: Push to GitHub

```bash
# Push your branch to GitHub
git push -u origin story/0.1-mobile-backend-init
```

**Breaking it down:**
- `git push`: Upload your commits
- `-u origin`: Set up tracking (only needed first time)
- `story/0.1-mobile-backend-init`: The branch name

**What happens:**
```
Your Computer                  GitHub
story/0.1-mobile-backend-init → story/0.1-mobile-backend-init
(commits A, B, C)               (commits A, B, C)
```

**Output:**
```
Branch 'story/0.1-mobile-backend-init' set up to track remote branch 'story/0.1-mobile-backend-init' from 'origin'.
```

---

### End of Day: Code Review

#### Step 9: Create a Pull Request

After your story is complete and pushed, create a **Pull Request (PR)** on GitHub.

**What is a Pull Request?**

A request to merge your story branch into `main`. It allows:
- Code review
- Discussion
- Automated tests
- Quality checks

**How to create:**

**Option A: Via GitHub Website**
1. Go to https://github.com/thejackluo/weavelight
2. Click "Pull requests" → "New pull request"
3. Select: `base: main` ← `compare: story/0.1-mobile-backend-init`
4. Click "Create pull request"
5. Fill in the template (see below)

**Option B: Via GitHub CLI**
```bash
gh pr create --title "Story 0.1: Mobile & Backend Initialization" --body "$(cat <<'EOF'
## Summary
Initialized the mobile (Expo) and backend (FastAPI) applications for Weave.

## Changes
- Created Expo app with TypeScript template
- Created FastAPI backend with health endpoint
- Added README files for both apps
- Verified both apps run locally

## Testing
- [x] Mobile app runs on iOS simulator
- [x] Backend API responds to http://localhost:8000/health
- [x] README instructions work

## Story Reference
Story 0.1 from Epic 0: Foundation
File: docs/stories/epic-0/story-0.1-mobile-backend-init.md

## Checklist
- [x] Code passes linting
- [x] Tests added and passing
- [x] Documentation updated
- [x] Code review requested

🤖 Generated with Claude Code
EOF
)"
```

---

### After Code Review: Merging

#### Step 10: Address Review Feedback (if needed)

If code review finds issues:

```bash
# Make the fixes
# ... edit files ...

# Stage and commit
git add .
git commit -m "fix: address code review feedback

- Added error handling to setup script
- Created .gitignore file
- Made API port configurable

🤖 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push the new commit
git push
```

**The PR automatically updates!** No need to create a new PR.

---

#### Step 11: Merge the PR

Once approved:

**Option A: Merge via GitHub Website**
1. Go to your PR
2. Click "Merge pull request"
3. Choose "Squash and merge" (recommended for BMAD)
4. Click "Confirm squash and merge"

**Option B: Merge via GitHub CLI**
```bash
gh pr merge --squash --delete-branch
```

**What happens:**
```
main: A → B → C → D (your story merged!)
                   ↑
story/0.1 branch deleted (cleanup)
```

---

#### Step 12: Update Your Local Main

```bash
# Switch back to main
git checkout main

# Pull the merged changes
git pull origin main

# Your local main now has your story!
```

---

## Git Worktrees (Advanced)

### What are Worktrees?

**Worktrees** let you work on multiple branches simultaneously without switching branches.

**Normal workflow:**
```bash
git checkout story/0.1    # Work on story 0.1
git checkout story/0.2    # Switch to story 0.2 (files change!)
git checkout story/0.1    # Switch back (files change again!)
```

**With worktrees:**
```bash
# Each branch has its own folder
weavelight/               # main branch
weavelight-story-0.1/     # story/0.1 branch
weavelight-story-0.2/     # story/0.2 branch
```

You can open multiple VS Code windows, one for each branch!

---

### When to Use Worktrees

**Use worktrees when:**
- Testing two different approaches simultaneously
- Working on multiple stories (not recommended, but sometimes necessary)
- Comparing code between branches
- Running tests on one branch while coding on another

**Don't use worktrees when:**
- You're following "one story at a time" (usual BMAD workflow)
- You're new to Git (stick to regular branches first)

---

### Creating a Worktree

```bash
# Create a worktree for a new branch
git worktree add ../weavelight-story-0.1 -b story/0.1-mobile-backend-init

# Create a worktree for an existing branch
git worktree add ../weavelight-story-0.2 story/0.2-database-schema
```

**Breaking it down:**
- `git worktree add`: Create a new worktree
- `../weavelight-story-0.1`: Path to the new folder
- `-b story/0.1-mobile-backend-init`: Create a new branch
- `story/0.2-database-schema`: Use existing branch

**Result:**
```
~/projects/
├── weavelight/               # Original repo (main branch)
├── weavelight-story-0.1/     # Worktree (story/0.1 branch)
└── weavelight-story-0.2/     # Worktree (story/0.2 branch)
```

---

### Working with Worktrees

```bash
# List all worktrees
git worktree list

# Output:
# /Users/you/projects/weavelight          abc123 [main]
# /Users/you/projects/weavelight-story-0.1 def456 [story/0.1-mobile-backend-init]

# Switch to a worktree (just cd into it)
cd ../weavelight-story-0.1

# Work normally
code .  # Open in VS Code
git status
git add .
git commit -m "feat: added login screen"
git push
```

---

### Removing a Worktree

```bash
# Remove the worktree folder
git worktree remove ../weavelight-story-0.1

# Or delete the folder and prune
rm -rf ../weavelight-story-0.1
git worktree prune
```

---

## Handling Merge Conflicts

### What is a Merge Conflict?

A **merge conflict** happens when Git can't automatically combine changes.

**Example scenario:**

```
main branch:
- File: mobile/App.tsx
- Line 10: const theme = "light";

Your branch (story/0.1):
- File: mobile/App.tsx
- Line 10: const theme = "dark";

Someone else's branch (merged first):
- File: mobile/App.tsx
- Line 10: const theme = "auto";
```

Git says: "Both of you changed line 10. Which version should I keep?"

---

### How Conflicts Happen

```
Timeline:
1. You create story/0.1 from main
2. Someone else creates story/0.2 from main
3. They merge story/0.2 → main (changes line 10)
4. You try to merge story/0.1 → main (also changes line 10)
5. CONFLICT! 💥
```

---

### Detecting a Conflict

When you try to merge or pull:

```bash
git pull origin main
```

**Output:**
```
Auto-merging mobile/App.tsx
CONFLICT (content): Merge conflict in mobile/App.tsx
Automatic merge failed; fix conflicts and then commit the result.
```

---

### Resolving a Conflict

#### Step 1: Check Which Files Have Conflicts

```bash
git status
```

**Output:**
```
On branch story/0.1-mobile-backend-init
You have unmerged paths.

Unmerged paths:
  both modified:   mobile/App.tsx
```

---

#### Step 2: Open the Conflicted File

```bash
code mobile/App.tsx
```

**What you'll see:**

```tsx
const app = () => {
  <<<<<<< HEAD (your changes)
  const theme = "dark";
  =======
  const theme = "auto";
  >>>>>>> main (incoming changes)

  return <App theme={theme} />;
};
```

**Breaking it down:**
- `<<<<<<< HEAD`: Your changes start here
- `=======`: Separator
- `>>>>>>> main`: Incoming changes end here

---

#### Step 3: Decide What to Keep

You have three options:

**Option A: Keep your changes**
```tsx
const app = () => {
  const theme = "dark";  // ← Keep yours
  return <App theme={theme} />;
};
```

**Option B: Keep their changes**
```tsx
const app = () => {
  const theme = "auto";  // ← Keep theirs
  return <App theme={theme} />;
};
```

**Option C: Combine both (best option usually)**
```tsx
const app = () => {
  // Merge: use auto by default, allow override
  const theme = process.env.THEME || "auto";  // ← Combine
  return <App theme={theme} />;
};
```

**Delete the conflict markers:**
- Remove `<<<<<<< HEAD`
- Remove `=======`
- Remove `>>>>>>> main`

---

#### Step 4: Mark as Resolved

```bash
# Stage the resolved file
git add mobile/App.tsx

# Check status
git status
```

**Output:**
```
On branch story/0.1-mobile-backend-init
All conflicts fixed but you are still merging.

Changes to be committed:
  modified:   mobile/App.tsx
```

---

#### Step 5: Commit the Merge

```bash
git commit -m "merge: resolve conflict in App.tsx theme setting

- Combined theme settings to use env var with fallback
- Preserves both auto-detection and manual override

🤖 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

#### Step 6: Push the Resolution

```bash
git push
```

**Conflict resolved! ✅**

---

### Preventing Conflicts

**Best practices:**

1. **Pull frequently**
   ```bash
   # Start of day
   git pull origin main

   # Before creating PR
   git pull origin main
   ```

2. **Communicate with team**
   - "I'm working on mobile/App.tsx today"
   - Avoid overlapping file changes

3. **Keep stories small**
   - Fewer files changed = fewer conflicts
   - BMAD's one-story-at-a-time helps!

4. **Merge main into your branch regularly**
   ```bash
   # While working on story/0.1
   git checkout story/0.1
   git pull origin main  # Get latest main changes
   # Resolve conflicts early, not at PR time
   ```

---

## Creating Issues and Pull Requests

### GitHub Issues

**Issues** are like to-do items or bug reports for your project.

#### When to Create an Issue

- You found a bug
- You have an idea for a feature
- You need to discuss something
- You want to track work

#### Issue Template for BMAD

```markdown
## Issue Type
- [ ] Bug
- [ ] Feature Request
- [ ] Documentation
- [ ] Question

## Epic/Story Reference
Epic: Epic 0 - Foundation
Story: Story 0.3 - Authentication Flow

## Description
Clear description of the issue.

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Steps to Reproduce
1. Go to login screen
2. Enter invalid email
3. Tap submit
4. App crashes

## Environment
- Device: iPhone 15 Pro Simulator
- iOS: 17.2
- App Version: 0.1.0

## Screenshots
[Attach screenshots if helpful]

## Additional Context
Any other relevant information.
```

#### Creating an Issue via GitHub CLI

```bash
gh issue create --title "Bug: Login crashes with invalid email" --body "$(cat <<'EOF'
## Issue Type
- [x] Bug

## Epic/Story Reference
Epic: Epic 1 - Onboarding
Story: Story 1.3 - Authentication

## Description
App crashes when user enters invalid email format and taps submit.

## Steps to Reproduce
1. Open app
2. Navigate to login screen
3. Enter "notanemail" (no @ symbol)
4. Tap "Submit"
5. App crashes

## Expected Behavior
Show error message: "Please enter a valid email"

## Actual Behavior
App crashes with error:
```
TypeError: Cannot read property 'includes' of undefined
at validateEmail (auth.ts:42)
```

## Environment
- Device: iPhone 15 Pro Simulator
- iOS: 17.2
- Expo SDK: 53
- App Version: 0.1.0

EOF
)" --label "bug,epic-1"
```

---

### Pull Requests (PRs)

**Pull Requests** are proposals to merge code from one branch into another.

#### PR Template for BMAD Stories

```markdown
## Story Information
**Epic:** Epic 0 - Foundation
**Story:** Story 0.1 - Mobile & Backend Initialization
**Story File:** docs/stories/epic-0/story-0.1-mobile-backend-init.md
**Points:** 5

## Summary
Brief 1-2 sentence summary of what this PR does.

## Changes Made
- Created Expo mobile app with TypeScript template
- Created FastAPI backend with health endpoint
- Added environment configuration
- Added README files with setup instructions

## Testing
- [x] Mobile app runs on iOS simulator
- [x] Backend runs on http://localhost:8000
- [x] Health endpoint returns 200 OK
- [x] README instructions work end-to-end
- [x] Unit tests pass (npm test, pytest)
- [x] Linting passes (ESLint, Ruff)

## Screenshots/Videos
[Attach if UI changes]

## Code Review Checklist
- [x] Code follows project style guide
- [x] No hardcoded secrets or API keys
- [x] Error handling implemented
- [x] Documentation updated
- [x] No console.log() left in code
- [x] TypeScript strict mode passes
- [x] Acceptance criteria met

## Acceptance Criteria (from Story)
- [x] Mobile app initialized and runs on iOS simulator
- [x] Backend API initialized and runs locally
- [x] Health endpoint returns 200 OK
- [x] README documents setup process
- [x] All tests pass

## Related Issues
Closes #123

## Deployment Notes
- Requires Node.js 20+ and Python 3.11+
- Run `npm install` and `pip install -r requirements.txt`

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

#### Creating a PR via GitHub CLI

```bash
gh pr create \
  --title "Story 0.1: Mobile & Backend Initialization" \
  --body "$(cat docs/stories/epic-0/story-0.1-mobile-backend-init.md)" \
  --base main \
  --head story/0.1-mobile-backend-init \
  --label "epic-0,story"
```

**Shorter version (interactive):**
```bash
gh pr create
# GitHub CLI will prompt you for title, body, etc.
```

---

#### PR Review Process

```
1. Create PR
   ↓
2. Automated checks run (CI/CD)
   ↓ (passes)
3. Request review
   ↓
4. Reviewer comments
   ↓
5. Address feedback (push new commits)
   ↓
6. Re-request review
   ↓
7. Approved ✅
   ↓
8. Merge to main
   ↓
9. Delete branch
```

---

#### Requesting a Review

```bash
# Request review from someone
gh pr review --request @thejackluo

# Or via GitHub website: "Reviewers" → Select person
```

---

#### Viewing PR Status

```bash
# List all PRs
gh pr list

# View specific PR
gh pr view 42

# Check status (tests passing?)
gh pr status
```

---

## Debugging with Git

### Git History Investigation

#### View Commit History

```bash
# See recent commits
git log --oneline

# Output:
# abc123 feat: added login screen
# def456 fix: fixed authentication bug
# ghi789 docs: updated README
```

**Prettier format:**
```bash
git log --graph --oneline --decorate --all
```

**Output:**
```
* abc123 (HEAD -> story/0.1) feat: added login screen
* def456 fix: fixed authentication bug
* ghi789 (main, origin/main) docs: updated README
```

---

#### View What Changed in a Commit

```bash
# See what changed in the last commit
git show

# See a specific commit
git show abc123

# See just the file names
git show --name-only abc123
```

---

#### Find When a Bug Was Introduced

**Use `git bisect` (binary search for bugs):**

```bash
# Start bisect
git bisect start

# Mark current commit as bad (bug exists)
git bisect bad

# Mark a known good commit (bug didn't exist)
git bisect good ghi789

# Git will checkout commits for you to test
# Run your app, check if bug exists

# If bug exists:
git bisect bad

# If bug doesn't exist:
git bisect good

# Repeat until Git finds the exact commit that introduced the bug

# Output:
# abc123 is the first bad commit
# feat: added login screen

# End bisect
git bisect reset
```

---

#### Find Who Changed a Line

```bash
# See who last modified each line of a file
git blame mobile/App.tsx

# Output:
# abc123 (Jack Luo 2025-12-17 10:30:00) const theme = "dark";
# def456 (Jack Luo 2025-12-17 11:00:00) return <App theme={theme} />;
```

**With line numbers:**
```bash
git blame -L 10,20 mobile/App.tsx  # Lines 10-20 only
```

---

### Undoing Changes

#### Undo Uncommitted Changes

```bash
# Discard changes to a specific file
git checkout -- mobile/App.tsx

# Discard all changes (dangerous!)
git checkout -- .
```

---

#### Undo Staged Changes

```bash
# Unstage a file (keep changes)
git reset mobile/App.tsx

# Unstage all files
git reset
```

---

#### Undo Last Commit (Keep Changes)

```bash
# Undo last commit, keep files staged
git reset --soft HEAD~1

# Undo last commit, unstage files
git reset HEAD~1

# Undo last commit, discard changes (DANGEROUS!)
git reset --hard HEAD~1
```

---

#### Undo a Pushed Commit

**Option A: Revert (safe, creates new commit):**
```bash
# Create a new commit that undoes abc123
git revert abc123

# Push
git push
```

**What happens:**
```
Before: A → B → C → D (bad commit)
After:  A → B → C → D → E (reverts D)
```

**Option B: Reset (dangerous, rewrites history):**
```bash
# Only do this if no one else has pulled your commits!
git reset --hard abc123
git push --force
```

---

### Debugging Strategies

#### 1. Check What Changed Recently

```bash
# Compare your branch to main
git diff main...story/0.1

# Compare two commits
git diff abc123..def456

# Compare staged changes
git diff --staged
```

---

#### 2. Search Commit History

```bash
# Find commits mentioning "authentication"
git log --all --grep="authentication"

# Find commits that changed a specific file
git log -- mobile/App.tsx

# Find commits by author
git log --author="Jack Luo"
```

---

#### 3. Recover Deleted Files

```bash
# Find the commit that deleted the file
git log --all --full-history -- mobile/DeletedFile.tsx

# Restore from that commit
git checkout abc123 -- mobile/DeletedFile.tsx
```

---

#### 4. Stash Work-in-Progress

```bash
# Save current changes without committing
git stash

# List stashes
git stash list

# Apply most recent stash
git stash apply

# Apply and remove from stash list
git stash pop

# Discard stash
git stash drop
```

**Use case:**
```
Scenario: You're working on story/0.1, but need to quickly fix a bug on main

1. git stash                    # Save current work
2. git checkout main            # Switch to main
3. ... fix bug ...
4. git commit -m "fix: urgent bug"
5. git checkout story/0.1       # Back to your story
6. git stash pop                # Restore your work
```

---

## Common Git Problems and Solutions

### Problem 1: "I Committed to the Wrong Branch"

**Scenario:** You meant to commit to `story/0.1` but committed to `main`.

**Solution:**
```bash
# On main (where you accidentally committed)
git log --oneline  # Copy the commit hash (abc123)

# Switch to the correct branch
git checkout story/0.1

# Apply the commit here
git cherry-pick abc123

# Switch back to main
git checkout main

# Remove the wrong commit from main
git reset --hard HEAD~1
```

---

### Problem 2: "I Need to Change My Last Commit Message"

```bash
# If you haven't pushed yet
git commit --amend -m "fix: corrected typo in login validation"

# If you already pushed (dangerous!)
git commit --amend -m "fix: corrected typo in login validation"
git push --force
```

**Warning:** Only use `--force` if no one else has pulled your branch!

---

### Problem 3: "I Pushed a Secret (API Key) by Accident"

**DO NOT just delete the commit and force push!**

The secret is still in Git history. Anyone can see it.

**Solution:**
1. **Immediately** revoke/rotate the secret (change the API key)
2. Remove the secret from code
3. Commit the fix
4. Use a tool like `git-filter-repo` to scrub history (advanced)

**Prevention:**
```bash
# Use .gitignore
echo ".env" >> .gitignore
echo "secrets.json" >> .gitignore
git add .gitignore
git commit -m "chore: ignore secret files"
```

---

### Problem 4: "My Branch is Behind main"

```bash
# Update your branch with latest main
git checkout story/0.1
git pull origin main

# Or use rebase (cleaner history)
git checkout story/0.1
git rebase main
```

**What's the difference?**

**Merge (git pull):**
```
story/0.1: A → B → C → M (merge commit)
main:      A → X → Y ↗
```

**Rebase:**
```
story/0.1: A → X → Y → B → C (replayed commits)
main:      A → X → Y
```

Rebase creates cleaner history but is more complex.

---

### Problem 5: "I Have Uncommitted Changes but Need to Switch Branches"

```bash
# Option A: Stash your changes
git stash
git checkout main
# ... do work on main ...
git checkout story/0.1
git stash pop

# Option B: Commit them temporarily
git add .
git commit -m "WIP: work in progress"
git checkout main
# ... do work on main ...
git checkout story/0.1
git reset HEAD~1  # Undo the WIP commit
```

---

### Problem 6: "Git Says I Have Conflicts but I Don't See Them"

```bash
# Show which files have conflicts
git diff --name-only --diff-filter=U

# Show the actual conflicts
git diff

# If you want to abort the merge
git merge --abort
```

---

### Problem 7: "I Want to Undo Everything and Start Over"

```bash
# Discard ALL local changes (DANGEROUS!)
git reset --hard HEAD

# Delete all untracked files
git clean -fd

# Pull fresh from GitHub
git pull origin main
```

---

## Git Commands Cheat Sheet

### Daily Commands

| Command | What It Does | When to Use |
|---------|--------------|-------------|
| `git status` | Show current state | Every 5 minutes |
| `git add .` | Stage all changes | Before committing |
| `git commit -m "msg"` | Create snapshot | After completing a task |
| `git push` | Upload to GitHub | End of day, before PR |
| `git pull` | Download from GitHub | Start of day |
| `git checkout -b branch` | Create new branch | Starting a story |
| `git checkout main` | Switch to main | After merging a story |

---

### Branch Commands

| Command | What It Does |
|---------|--------------|
| `git branch` | List all branches |
| `git branch -d story/0.1` | Delete local branch |
| `git checkout branch` | Switch to branch |
| `git checkout -b new-branch` | Create and switch |
| `git merge other-branch` | Merge other branch into current |
| `git rebase main` | Replay commits on top of main |

---

### History Commands

| Command | What It Does |
|---------|--------------|
| `git log` | Show commit history |
| `git log --oneline` | Compact history |
| `git log --graph --all` | Visual history tree |
| `git show abc123` | Show commit details |
| `git diff` | Show unstaged changes |
| `git diff --staged` | Show staged changes |
| `git diff main...story/0.1` | Compare branches |
| `git blame file.txt` | Show who changed what |

---

### Undo Commands

| Command | What It Does | Danger Level |
|---------|--------------|--------------|
| `git checkout -- file` | Discard file changes | ⚠️ Medium |
| `git reset file` | Unstage file | ✅ Safe |
| `git reset HEAD~1` | Undo last commit | ⚠️ Medium |
| `git reset --hard HEAD~1` | Undo commit + discard | 🔥 High |
| `git revert abc123` | Create undo commit | ✅ Safe |
| `git clean -fd` | Delete untracked files | 🔥 High |

---

### Remote Commands

| Command | What It Does |
|---------|--------------|
| `git remote -v` | Show remote URLs |
| `git fetch` | Download refs (no merge) |
| `git pull` | Download + merge |
| `git push` | Upload commits |
| `git push -u origin branch` | Push + set tracking |
| `git push --force` | Overwrite remote (DANGER!) |

---

### Stash Commands

| Command | What It Does |
|---------|--------------|
| `git stash` | Save work-in-progress |
| `git stash list` | List all stashes |
| `git stash apply` | Apply latest stash |
| `git stash pop` | Apply + delete stash |
| `git stash drop` | Delete a stash |

---

### Worktree Commands

| Command | What It Does |
|---------|--------------|
| `git worktree add ../path branch` | Create worktree |
| `git worktree list` | List all worktrees |
| `git worktree remove ../path` | Delete worktree |
| `git worktree prune` | Clean up deleted worktrees |

---

## BMAD-Specific Git Workflow

### Story Lifecycle with Git

```
1. Start Story
   git checkout main
   git pull origin main
   git checkout -b story/0.1-mobile-backend-init

2. Implement (dev-story)
   # ... Claude writes code ...
   git add .
   git commit -m "feat: initialize mobile and backend"
   git push -u origin story/0.1-mobile-backend-init

3. Code Review Feedback
   # ... make fixes ...
   git add .
   git commit -m "fix: address code review feedback"
   git push

4. Merge (after approval)
   gh pr merge --squash --delete-branch

5. Cleanup
   git checkout main
   git pull origin main
   # story/0.1 branch auto-deleted

6. Next Story
   git checkout -b story/0.2-database-schema
   # Repeat
```

---

### Epic Lifecycle with Git

```
Epic 0: Foundation (10 stories)
├── story/0.1-mobile-backend-init   ✅ merged to main
├── story/0.2-database-schema       ✅ merged to main
├── story/0.3-authentication        🔄 in PR review
├── story/0.4-row-level-security    🚧 in progress
└── story/0.5-ci-cd                 ⏳ not started

All story branches eventually merge to main
```

---

## Best Practices Summary

### ✅ DO

1. **Commit frequently** - Small, focused commits
2. **Pull before starting** - Always start with latest code
3. **Write good commit messages** - Future you will thank you
4. **Create PRs for review** - Don't merge directly to main
5. **Delete merged branches** - Keep repo clean
6. **Use `.gitignore`** - Never commit secrets or node_modules
7. **One story at a time** - Complete before starting next

### ❌ DON'T

1. **Don't commit secrets** - Use environment variables
2. **Don't force push to main** - Only force push your own branches (if necessary)
3. **Don't commit large files** - Use Git LFS for >50MB files
4. **Don't work directly on main** - Always use feature branches
5. **Don't merge without review** - Code review catches bugs
6. **Don't ignore conflicts** - Resolve them properly
7. **Don't commit broken code** - Tests should pass

---

## Troubleshooting Quick Reference

| Problem | Command | Notes |
|---------|---------|-------|
| Forgot to create branch | `git checkout -b story/0.1` then `git branch -d main` | Move work to correct branch |
| Wrong commit message | `git commit --amend -m "new message"` | Only if not pushed |
| Need to undo changes | `git checkout -- file` | Discards uncommitted changes |
| Merge conflict | Edit file, `git add`, `git commit` | Choose which changes to keep |
| Branch behind main | `git pull origin main` | Update your branch |
| Accidentally pushed secret | Revoke secret immediately! | Then update code |
| Lost commits | `git reflog` then `git checkout abc123` | Git saves deleted commits for ~30 days |

---

## Advanced: Git Aliases (Time Savers)

Add to `~/.gitconfig`:

```ini
[alias]
    # Short status
    s = status -s

    # Pretty log
    l = log --graph --oneline --decorate --all

    # Show files in last commit
    last = show --name-only

    # Undo last commit (keep changes)
    undo = reset HEAD~1

    # Amend without editing message
    amend = commit --amend --no-edit

    # List branches by date
    branches = branch --sort=-committerdate

    # Show word-diff
    wd = diff --word-diff
```

**Usage:**
```bash
git s        # instead of git status -s
git l        # instead of git log --graph --oneline --decorate --all
git undo     # instead of git reset HEAD~1
```

---

## Summary

### The BMAD Git Workflow

```
Daily Rhythm:
1. Morning: git pull origin main
2. Create branch: git checkout -b story/X.X
3. Work: (dev-story workflow)
4. Commit: git add . && git commit -m "message"
5. Push: git push
6. PR: gh pr create
7. Review: Address feedback
8. Merge: gh pr merge --squash
9. Cleanup: git checkout main && git pull
10. Repeat for next story

Key Principles:
- One story = one branch
- Commit frequently
- Always code review
- Keep main stable
- Delete merged branches
```

---

**Next Steps:**
1. Practice basic commands (status, add, commit, push)
2. Create your first story branch
3. Make a commit with a good message
4. Create a PR using the template
5. Understand merge conflicts (you'll encounter them!)

You've got this! 🚀

---

**Related Guides:**
- [BMAD Implementation Guide](bmad-implementation-guide.md) - Story execution workflow
- [Design System Guide](design-system-guide.md) - Frontend development
- [MCP Quick Reference](mcp-quick-reference.md) - AI-assisted development tools

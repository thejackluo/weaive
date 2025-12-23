# Development Agents & Commands Guide

**Purpose:** Quick reference for using development agents during coding sessions
**Last Updated:** 2025-12-23

---

## 🚀 Quick Access Commands

All development agents are now set up and ready to use via Claude Code commands:

| Command | Agent | Purpose |
|---------|-------|---------|
| `/debug-frontend` | Frontend Debugger | Systematic React Native/Expo bug investigation |
| `/debug-backend` | Backend Debugger | Systematic Python/FastAPI bug investigation |
| `/auto-linter` | Code Quality Enforcer | Automated linting and fixing (frontend + backend) |
| `/idea-sync` | Idea-to-Docs Sync | Propagate design changes from exploration to official docs |

---

## 🔍 Frontend Debugger (`/debug-frontend`)

### When to Use

- Blank/white screen or loading stuck
- Wrong data displayed or styling issues
- Navigation/routing errors or crashes
- State management problems (Zustand, TanStack Query)
- Form/input/event handling issues
- API integration or network problems

### How to Use

```
/debug-frontend
```

Then select a bug category or describe your issue:

**Example:**
```
User: /debug-frontend
Agent: [Shows menu]
User: 7 (Custom bug description)
User: The user profile screen shows blank after login. This started happening after I updated the auth flow. iOS only, Android works fine.

Agent: [Executes 7-phase debugging protocol]
1. Intake - Gathers details
2. Trace - Maps component flow
3. Hypothesize - Generates 20+ causes
4. Rank - Selects top 5-8
5. Instrument - Adds strategic logging
6. Test - Reproduces with logs
7. Validate - Confirms root cause + proposes fix
```

### Output

- Clear bug statement
- Reproduction steps
- Component trace (data flow diagram)
- Ranked hypotheses
- Root cause with evidence
- Proposed fix (NOT committed)
- Validation strategy
- Prevention recommendations

### Key Features

- ✅ Methodical 7-phase protocol
- ✅ Evidence-based (no random fixes)
- ✅ Non-destructive (logging only)
- 🚫 Never commits changes
- 🚫 Never mutates data

---

## 🔧 Backend Debugger (`/debug-backend`)

### When to Use

- API endpoints returning errors (401, 500, 4xx, 5xx)
- Database query issues (wrong data, timeouts, performance)
- Async/background job failures
- Authentication/authorization problems
- Third-party API integration issues

### How to Use

```
/debug-backend
```

Then select a bug category or describe your issue:

**Example:**
```
User: /debug-backend
Agent: [Shows menu]
User: 1 (API endpoint error)
User: POST /api/goals returns 500 Internal Server Error. Started after adding RLS policies. Local environment. Stack trace shows 'supabase.auth.get_user() returns None'.

Agent: [Executes 7-phase debugging protocol]
1. Intake - Gathers details
2. Trace - Maps execution path
3. Hypothesize - Generates 20+ causes
4. Rank - Selects top 5-8
5. Instrument - Adds strategic logging
6. Test - Reproduces with logs
7. Validate - Confirms root cause + proposes fix
```

### Output

- Clear bug statement with HTTP status
- Reproduction steps with request payload
- Execution trace (Request → Middleware → Handler → DB → Response)
- Stack trace analysis
- Ranked hypotheses
- Root cause with evidence
- Proposed fix (NOT committed)
- pytest test suggestion
- Prevention recommendations

### Key Features

- ✅ Methodical 7-phase protocol
- ✅ Evidence-based (stack traces, logs)
- ✅ Non-destructive (logging only)
- 🚫 Never commits changes
- 🚫 Never mutates production data

---

## 🛡️ Auto-Linter (`/auto-linter`)

### When to Use

- Before committing code
- After implementing a feature
- When CI/CD linting fails
- To set up pre-commit hooks

### How to Use

```
/auto-linter
```

Then select an option:

**Option 1: Fix All (Recommended)**
```
User: /auto-linter
Agent: [Shows menu]
User: 1 (Run all linters with auto-fix)

Agent:
- Detects context (frontend, backend, or both)
- Runs TypeScript, ESLint, Prettier (frontend)
- Runs Ruff check + format (backend)
- Iterates up to 3 times until clean
- Reports status: ✓ Clean or ✗ N issues

Output:
✅ Backend: Clean
✅ Frontend: Clean
Exit Code: 0
```

**Option 2: Frontend Only**
```
User: /auto-linter
Agent: [Shows menu]
User: 2 (Frontend only)

Agent: Runs TypeScript + ESLint + Prettier
```

**Option 3: Backend Only**
```
User: /auto-linter
Agent: [Shows menu]
User: 3 (Backend only)

Agent: Runs Ruff check + format
```

**Option 4: Setup Pre-Commit Hook**
```
User: /auto-linter
Agent: [Shows menu]
User: 4 (Setup pre-commit hook)

Agent: Installs .git/hooks/pre-commit
Result: Linting runs automatically on every commit
Bypass: git commit --no-verify (emergencies only)
```

### Output

```
## AutoLinter Report

**Backend Status:** ✓ Clean
**Frontend Status:** ✗ 2 issues remaining

### Iterations
- Iteration 1: Fixed 15 issues, 2 remaining
- Iteration 2: Fixed 0 issues, 2 remaining
- Final: ✗ Issues remain

### Remaining Issues
weave-mobile/src/components/Button.tsx:42:10 - unused variable 'handlePress'
weave-api/app/api/goals.py:18:1 - missing return type annotation

### Commands to Fix Manually
cd weave-mobile && npx eslint src/components/Button.tsx --fix
cd weave-api && uv run ruff check app/api/goals.py --fix

**Exit Code:** 1
```

### Key Features

- ✅ Auto-fixes everything possible
- ✅ Iterates up to 3 times
- ✅ Context-aware (frontend, backend, both)
- ✅ Clear file:line references
- ✅ Pre-commit hook support
- ⚡ Fast and deterministic

### Linters Used

**Frontend (weave-mobile/):**
- **TypeScript** (`npx tsc --noEmit`) - Type checking
- **ESLint** (`npx eslint . --fix`) - Code quality + auto-fix
- **Prettier** (`npx prettier --write .`) - Formatting

**Backend (weave-api/):**
- **Ruff Check** (`uv run ruff check . --fix`) - Linting + auto-fix
- **Ruff Format** (`uv run ruff format .`) - Formatting

---

## 📄 Idea-to-Docs Sync (`/idea-sync`)

### When to Use

- Major design updates in `docs/idea/ux.md`
- Feature additions to `docs/idea/mvp.md`
- Architecture changes in `docs/idea/backend.md` or `docs/idea/ai.md`
- Before sprint planning (ensure alignment)
- After design reviews (propagate decisions)

### How to Use

```
/idea-sync
```

Then follow the interactive workflow:

**Example:**
```
User: /idea-sync
Agent: [Shows menu and workflow guide]

User: 1 (Scan docs/idea/ for recent changes)

Agent:
- Scans docs/idea/ for changes since last sync
- Finds 7 changes in ux.md, all tagged [v1.1]
- Shows change summary report

User: 2 (Analyze impact)

Agent:
- Maps changes to affected docs:
  ✅ Update docs/product-roadmap.md (add v1.1 section)
  ✅ Tag 8 stories in docs/epics.md with [v1.1]
  ⏳ Update docs/sprint-status.yaml (wait until v1.1 sprint)
- Shows impact analysis report

User: 3 (Propagate updates)

Agent:
- Updates product-roadmap.md
- Updates epics.md (tags stories, updates ACs)
- Shows git diff for review

User: 4 (Review and commit)

Agent:
- Validates changes
- Drafts commit message
- Commits changes
- Updates frontmatter in idea/ files
```

### Phasing System

| Tag | Action |
|-----|--------|
| **[MVP]** | Update ALL docs immediately (prd, architecture, epics, sprint status) |
| **[v1.1]** | Update roadmap + tag stories (defer implementation) |
| **[v1.2]** | Update roadmap only |
| No tag | Optional roadmap entry |

### Documentation Hierarchy

```
docs/idea/           →  docs/           →  .bmad/bmm/     →  Implementation
(Exploration)           (Strategy)          (Execution)        (Code)

mvp.md               →  prd.md          →  epics/         →  weave-api/
backend.md           →  architecture.md →  stories/       →  weave-mobile/
ai.md                →  product-        →  sprint-status.
ux.md                   roadmap.md         yaml
```

### Key Features

- ✅ Systematic 5-step workflow
- ✅ Phasing-aware (MVP, v1.1, v1.2)
- ✅ Impact analysis with decision matrix
- ✅ Git integration (auto-commit)
- ✅ Resumable (if interrupted)
- ⚠️ Manual approval required before updates

### Best Practices

**✅ DO:**
- Always use phasing tags before running workflow
- Review impact analysis carefully
- Check git diff before committing
- Run workflow weekly to prevent drift

**❌ DON'T:**
- Don't propagate future ideas `[v1.2+]` to stories yet
- Don't skip impact analysis
- Don't defer syncing for more than 2 weeks

---

## 📖 Full Documentation References

For detailed documentation on each agent:

- **Frontend Debugger**: `_bmad/bmm/agents/debug-frontend.md`
- **Backend Debugger**: `_bmad/bmm/agents/debug-backend.md`
- **Auto-Linter**: `_bmad/bmm/agents/auto-linter.md`
- **Idea-to-Docs Sync**: `docs/dev/idea-sync-workflow-guide.md`

---

## 🎯 Common Development Workflows

### Workflow 1: Feature Implementation

```bash
# 1. Implement feature in code
# (weave-mobile/ or weave-api/)

# 2. Run linter to catch issues
/auto-linter → [1] Fix all

# 3. Debug any issues
/debug-frontend  # or /debug-backend

# 4. Commit with confidence
git add .
git commit -m "feat: implement feature X"
# (Pre-commit hook auto-runs linting if installed)
```

### Workflow 2: Bug Investigation

```bash
# 1. Reproduce bug locally
# (note exact steps)

# 2. Run debugger
/debug-frontend  # or /debug-backend
# → Follow 7-phase protocol
# → Get root cause + proposed fix

# 3. Apply fix (manually)
# (debugger shows proposed changes)

# 4. Validate fix
# (run app, test reproduction steps)

# 5. Run linter before commit
/auto-linter → [1] Fix all

# 6. Commit
git add .
git commit -m "fix: resolve bug X"
```

### Workflow 3: Design Updates

```bash
# 1. Update exploration docs
# Edit docs/idea/ux.md, add [v1.1] tags

# 2. Sync to official docs
/idea-sync
# → Scan changes
# → Analyze impact
# → Propagate updates
# → Review and commit

# 3. Implement from updated stories
# (use updated epics/stories as guide)

# 4. Lint and commit
/auto-linter → [1] Fix all
git add .
git commit -m "feat: implement v1.1 UX changes"
```

---

## 💡 Tips & Tricks

### Tip 1: Use Auto-Linter Early and Often

```bash
# Before every commit
/auto-linter → [1] Fix all

# Or install pre-commit hook once
/auto-linter → [4] Setup pre-commit hook
# (runs automatically on every commit)
```

### Tip 2: Debug Systematically

```bash
# Don't guess - use the debugger
# It generates 20+ hypotheses and ranks them

/debug-frontend  # or /debug-backend
# → Follow the 7-phase protocol
# → Get evidence-based root cause
```

### Tip 3: Keep Docs in Sync

```bash
# Run weekly or before sprint planning
/idea-sync

# Use phasing tags in docs/idea/
[MVP] - Must ship now
[v1.1] - Next release
[v1.2] - Future
```

### Tip 4: Combine Commands

```bash
# Typical development session:
1. Implement feature
2. /auto-linter → [1] Fix all
3. /debug-frontend (if issues)
4. Commit

# Weekly workflow:
1. /idea-sync (sync docs)
2. Implement features from updated stories
3. /auto-linter (before commits)
4. /debug-* (as needed)
```

---

## ⚡ Quick Command Reference

```bash
# Debugging
/debug-frontend     # React Native/Expo bugs
/debug-backend      # Python/FastAPI bugs

# Code Quality
/auto-linter        # Lint and fix code

# Documentation
/idea-sync          # Sync idea/ to official docs

# Pre-commit Hook
/auto-linter → [4] Setup pre-commit hook
git commit --no-verify  # Bypass (emergencies only)
```

---

*This guide is a living document. Update as agents evolve.*

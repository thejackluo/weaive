# Weave Debugging Guide

Quick reference for using the Backend and Frontend debuggers as Claude Code subagents.

---

## Quick Start

### Frontend Bug? Use the Frontend Debugger

```bash
# Option 1: Via slash command
/debug-frontend

# Option 2: Via Claude Code Task
Task(description='Debug frontend issue', prompt='...')
```

### Backend Bug? Use the Backend Debugger

```bash
# Option 1: Via slash command
/debug-backend

# Option 2: Via Claude Code Task
Task(description='Debug backend issue', prompt='...')
```

---

## Debugging Workflow

Both debuggers follow the same systematic approach:

### 1. Provide Clear Bug Report

Be specific:
- **What happened?** Error message, screen, API response
- **When?** Always broken, recently broke, intermittent
- **How to reproduce?** Exact steps
- **Environment?** Local, staging, production
- **Context?** Device type, network, recent changes

**Good bug report:**
```
"Clicking 'Submit' on the goal creation form returns a 500 error.
Steps: 1. Open app → 2. Tap 'New Goal' → 3. Fill form → 4. Click Submit
Error: 500 Internal Server Error (no details in response)
Environment: Local (laptop, iOS simulator)
Network: Normal
Changed recently: Just updated FastAPI to latest version"
```

**Bad bug report:**
```
"It's broken"
```

### 2. The Debugger Will:

1. **Read the code** - Trace execution path from start to error
2. **Generate hypotheses** - List 20+ possible causes (ranked by probability)
3. **Add logging** - Instrument code with strategic console/print statements
4. **Test fixes** - Validate each hypothesis in isolation
5. **Summarize findings** - Provide detailed report with root cause

### 3. You Get:

✅ **Clear bug statement** - What's actually wrong (not a guess)
✅ **Code trace** - How the data flows, where it breaks
✅ **Ranked causes** - Most likely issues first
✅ **Root cause** - The actual problem with proof
✅ **Proposed fix** - Code change (not committed, just shown)
✅ **Validation** - Proof the fix works
✅ **Prevention** - How to avoid it next time

---

## Frontend Debugger

### When to Use

- Blank/white screen
- Wrong data displayed
- Navigation errors/crashes
- State management issues (Zustand, TanStack Query)
- Form/input problems
- API integration issues
- Component rendering problems

### Example Usage

**Slash Command:**
```
/debug-frontend

Bug: Goal screen shows blank after navigation

Steps:
1. Open app
2. Navigate to Goals
3. Goal list loads
4. Tap on a goal
5. Detail screen appears blank (should show goal title, description)

Device: iOS simulator (Expo)
Network: Normal (API calls succeed in browser)
```

**What it does:**
- Inspects component hierarchy (GoalScreen → GoalDetail)
- Checks state management (Zustand store, TanStack Query cache)
- Traces data flow (API response → component props → render)
- Uses Playwright or Expo tools to test UI
- Captures screenshots of each step

### Available Tools

- **React DevTools** - Component inspection
- **Playwright** - E2E testing and screenshots
- **Expo CLI** - Simulator logs and debugging
- **Console logs** - All captured for analysis

---

## Backend Debugger

### When to Use

- API endpoint returns error (401, 500, 4xx, 5xx)
- Database queries timing out or returning wrong data
- Background jobs failing silently
- Authentication/authorization issues
- Async operations not completing
- Third-party API integration problems

### Example Usage

**Slash Command:**
```
/debug-backend

Bug: POST /api/goals returns 401 Unauthorized when user is authenticated

Steps:
1. Login successfully (token works on other endpoints)
2. Create goal data
3. POST to /api/goals with auth header
4. Get 401 (should be 201 Created)

Environment: Local development
Error: "401 Unauthorized" (no details)
Recent change: Updated Supabase auth config
```

**What it does:**
- Reads FastAPI route handler
- Traces JWT verification → database lookup → response
- Checks environment variables and auth config
- Tests with curl commands
- Adds Python logging to capture state
- Validates fix with test requests

### Available Tools

- **curl** - Direct API testing
- **pytest** - Python unit test execution
- **PostgreSQL** - Direct database queries
- **Python logging** - State and error capture

---

## Common Bug Patterns

### Frontend

**Pattern: Blank screen after navigation**
- Likely causes: Component not rendering, API fetch not triggering, wrong props
- Debugger will check: useEffect dependencies, component mounting, data loading state

**Pattern: Wrong data displayed**
- Likely causes: Stale cache, state not updated, wrong component receiving props
- Debugger will check: TanStack Query cache, Zustand store, prop drilling

**Pattern: Form submission fails silently**
- Likely causes: Async operation not awaited, error handler missing, network timeout
- Debugger will check: Event handler, API call, error boundary

### Backend

**Pattern: API returns 401 when token is valid**
- Likely causes: Token format wrong, verification middleware broken, expiration check
- Debugger will check: JWT parsing, token validation, middleware order

**Pattern: Database query returns wrong data**
- Likely causes: Query filter wrong, JOIN on wrong column, missing WHERE clause
- Debugger will check: SQL query, parameters, database indexes

**Pattern: Background job fails without error**
- Likely causes: Task queue not running, async/await issue, exception not caught
- Debugger will check: Job definition, error handling, queue status

---

## Expected Output Format

Both debuggers produce structured reports:

```markdown
## Bug Investigation Report

### Bug Statement
[Clear problem description]

### Reproduction Steps
1. [Step 1]
2. [Step 2]
...

### Root Cause Analysis

**Top Hypotheses (Ranked):**
1. [Most likely] - 85% confidence
   - Why: Evidence from code/logs
2. [Second likely] - 10% confidence
   - Why: Evidence from code/logs

**Confirmed Root Cause:**
[The actual issue with proof]

### Code Trace
[Execution path showing where it breaks]

### Proposed Fix
[Code change needed - NOT committed, just shown]

### Validation
✅ Primary test: PASS
✅ Edge case 1: PASS
✅ Edge case 2: PASS
✅ No regressions: PASS

### Prevention
- Add test case
- Update error messages
- Add monitoring
```

---

## Tips for Faster Debugging

1. **Provide exact error messages** - Copy/paste, don't paraphrase
2. **Include reproduction steps** - We'll follow them exactly
3. **Mention recent changes** - New dependencies, code updates, config changes
4. **Be specific about environment** - Which simulator, device, deployed version?
5. **If you have logs** - Share them (debugger will ask if missing)
6. **Time matters** - When did it start breaking? Last commit before break?

---

## Architecture

The debuggers are implemented as:

### BMAD Agents
- Location: `.bmad/bmm/agents/debug-frontend.md` and `debug-backend.md`
- Purpose: Full debugging methodology and persona
- Invoked via: Slash commands or BMAD workflows

### Claude Commands
- Location: `.claude/commands/debug-frontend.md` and `debug-backend.md`
- Purpose: Callable Claude Code subagents
- Invoked via: Task tool with `subagent_type='debug-frontend'` or `'debug-backend'`

---

## Methodology Overview

Both debuggers use this proven workflow:

1. **Intake** - Get clear bug report
2. **Trace** - Read code and map execution
3. **Hypothesize** - Generate 20+ possible causes
4. **Rank** - Order by likelihood and effort
5. **Instrument** - Add strategic logging
6. **Test** - Validate each hypothesis
7. **Validate** - Confirm fix, check side effects
8. **Document** - Prevent future issues

This approach prevents the "random fix" chaos and ensures you understand what was actually wrong.

---

## When NOT to Use (Self-Help Cases)

These debuggers are powerful for complex issues, but for simple cases you might fix faster yourself:

- **Obvious typos** - `useEffect([])` should be `useEffect([value])`
- **Missing imports** - `import { Button } from '@/design-system'`
- **Obvious logic** - `if (user === null)` should have fallback
- **API endpoint not found** - Check that endpoint exists first

---

## Questions?

- Check the CLAUDE.md for project structure and conventions
- Read docs/idea/mvp.md for product context
- Check docs/idea/backend.md for API architecture
- Review design-system-guide.md for UI components


# Claude Code Debugger Subagents - Quick Reference

Two specialized debugging subagents are now available for systematic bug investigation and resolution.

---

## Backend Debugger

**For Python/FastAPI backend issues**

### Invoke via Slash Command
```
/debug-backend
```

### Describe Your Bug
```
Bug: API endpoint /api/goals returns 401 when authenticated
Reproduction:
1. Login with valid credentials
2. Call POST /api/goals with auth header
3. Get 401 Unauthorized (should be 201 Created)

Environment: Local development
Error: No detailed message
Recent changes: Updated Supabase auth config
```

### What It Does

The Backend Debugger will:

1. **Trace the code path** - Read the FastAPI route, follow to database/API call
2. **Generate 20+ hypotheses** - Possible causes ranked by probability
3. **Add logging** - Strategic instrumentation to capture state
4. **Test fixes** - Validate each hypothesis without committing
5. **Provide report** - Root cause with evidence and validation

### Best For

- API endpoints returning errors (401, 500, 4xx, 5xx)
- Database query issues (wrong data, timeouts, performance)
- Async/background job failures
- Authentication/authorization problems
- Third-party API integration issues
- Silent failures with no error messages

### Output Example

```markdown
## Backend Bug Investigation

### Bug Statement
POST /api/goals returns 401 even with valid JWT token

### Ranked Causes
1. JWT verification middleware checking wrong header - 75% likelihood
   Evidence: Code shows checking 'X-Auth-Token' but client sends 'Authorization'
2. Token expired or invalid - 15% likelihood
   Evidence: Token format is correct, expiration is future
3. User not found in database - 10% likelihood
   Evidence: Login succeeded, user record exists

### Confirmed Cause
JWT middleware checking wrong header format. Client sends:
  Authorization: Bearer {token}
But middleware checks:
  X-Auth-Token: {token}

### Proposed Fix
```python
# In middleware: change from
auth_token = request.headers.get('X-Auth-Token')
# To
auth_token = request.headers.get('Authorization', '').replace('Bearer ', '')
```

### Validation
✅ Test with curl: 201 Created - PASS
✅ Edge case (expired token): 401 - PASS
✅ Other endpoints still work: PASS
```

---

## Frontend Debugger

**For React Native/Expo frontend issues**

### Invoke via Slash Command
```
/debug-frontend
```

### Describe Your Bug
```
Bug: Goal detail screen shows blank after navigation

Steps:
1. Open app
2. Navigate to Goals list
3. Click on a goal
4. Detail screen appears but is blank (should show title + description)

Device: iOS simulator
Network: Normal (API calls succeed)
Recent: Just updated TanStack Query to v5
```

### What It Does

The Frontend Debugger will:

1. **Trace component flow** - Read React components, map state and props
2. **Generate 20+ hypotheses** - Possible causes ranked by probability
3. **Add logging** - Strategic instrumentation in components/hooks
4. **Test with tools** - Playwright E2E, Expo CLI, React DevTools
5. **Provide report** - Root cause with UI test validation

### Best For

- Blank/white screens or stuck loading
- Wrong data displayed
- Navigation/routing crashes
- State management issues (Zustand, TanStack Query)
- Form/input/event handling problems
- API integration issues
- Component rendering problems

### Output Example

```markdown
## Frontend Bug Investigation

### Bug Statement
Goal detail screen shows blank after successful navigation and API call

### Reproduction Steps
1. Open app
2. Navigate to Goals
3. Wait for list to load
4. Tap goal item
5. Navigate to detail screen
6. Screen is blank (should show title and description)

### Component Trace
GoalList → onPress → Navigation.push('GoalDetail')
  ↓ (Props passed)
GoalDetail → useQuery([goals, goalId])
  ↓ (Data loaded from cache)
GoalDetail → render with goalData
  ↓ (Issue here)
Display shows blank

### Ranked Causes
1. Stale TanStack Query cache after v5 update - 60% likelihood
   Evidence: Query key changed, cache not cleared
2. useEffect not triggering data refetch - 25% likelihood
   Evidence: Dependency array might be wrong
3. Navigation prop not passing goalId correctly - 15% likelihood
   Evidence: goalId should be in route params

### Confirmed Cause
TanStack Query v5 changed how query caches work. After update, the cache key
doesn't match, so data doesn't display.

### Proposed Fix
```typescript
// In GoalDetail component
const goalId = route.params.goalId;
const { data } = useQuery({
  queryKey: ['goal', goalId],  // Updated key format for v5
  queryFn: () => fetchGoal(goalId),
  staleTime: 1000 * 60 * 5,    // Add stale time config
});
```

### Validation
✅ Manual test: Goal displays correctly - PASS
✅ Navigation back/forward: No blank - PASS
✅ Slow network: Shows loading state - PASS
✅ Other screens: Still work - PASS
```

---

## Debugging Workflow

Both debuggers use the same proven systematic approach:

### Phase 1: Intake
Get a **clear, specific bug report**
- What exactly happened
- How to reproduce it
- Environment details
- When it started

### Phase 2: Ultrathink Code Trace
Read source files and map the execution path
- Where does data come from?
- What happens at each step?
- Where could it fail?

### Phase 3: Hypothesis Generation
List 20+ possible causes
- Don't filter yet, just brainstorm
- Include unlikely ones
- Think about dependencies

### Phase 4: Ranking
Filter and rank by:
- Likelihood given symptoms
- Effort to test
- Impact if true

### Phase 5: Auto-Instrumentation
Add strategic logging
- Without mutating data
- Capture state transitions
- Log API responses

### Phase 6: Test Fixes
For each top hypothesis:
- Propose the fix
- Add logging to validate
- Test in safe environment
- Document results

### Phase 7: Validate & Document
- Confirm fix works
- Test edge cases
- Check for side effects
- Prevent future issues

---

## Tips for Faster Debugging

1. **Be specific** - Copy/paste error messages, don't paraphrase
2. **Include steps** - Exact reproduction steps are golden
3. **Mention context** - Recent changes, dependencies, environment
4. **Provide logs** - If available, share error/console output
5. **Timeline** - When did it start? Last working version?
6. **Frequency** - Every time or intermittent?

---

## Methodology Advantages

### ✅ Systematic
- No random "fixes"
- Clear evidence for root cause
- Prevents debugging circles

### ✅ Non-Destructive
- No commits
- No data mutations
- No unintended side effects

### ✅ Educational
- Learn WHY the bug happened
- Understand execution flow
- Prevent similar bugs

### ✅ Thorough
- Test edge cases
- Check side effects
- Validate fix completely

---

## Common Patterns

### Frontend: Blank Screen After Navigation
Usually caused by:
- Stale cache (TanStack Query)
- Component not re-rendering
- Data loading state wrong
- Props not passed correctly

### Backend: 401 Unauthorized Despite Valid Token
Usually caused by:
- Token header format mismatch
- JWT verification middleware order
- Token expiration check broken
- User lookup failing

### Frontend: Wrong Data Displayed
Usually caused by:
- Component receiving wrong props
- State not updated on data change
- useEffect dependency wrong
- Cache not invalidated

### Backend: Database Query Timeout
Usually caused by:
- Missing index on WHERE column
- Joining large tables without filtering
- Connection pool exhausted
- Query running against wrong database

---

## Files Reference

- **BMAD Agents**: `.bmad/bmm/agents/debug-backend.md` and `debug-frontend.md`
- **Commands**: `.claude/commands/debug-backend.md` and `debug-frontend.md`
- **Guide**: `docs/dev/debugging-guide.md`
- **Reference**: This file (`docs/dev/SUBAGENT_REFERENCE.md`)

---

## Next Steps

1. When you have a bug, run `/debug-backend` or `/debug-frontend`
2. Provide your bug report clearly
3. Let the debugger trace the code
4. Review the ranked hypotheses
5. Validate the proposed fix
6. Implement the fix (it will show you exactly what to change)
7. Test to confirm

---

## Questions?

- Check `docs/dev/debugging-guide.md` for detailed methodology
- Review CLAUDE.md for project conventions and architecture
- Use the design system guide for frontend issues
- Check backend architecture in `docs/idea/backend.md`


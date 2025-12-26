# Personality Greeting Infinite Loop (Maximum Update Depth Exceeded)

**Date Discovered:** 2025-12-25
**Severity:** 🔴 **CRITICAL**
**Status:** ✅ **FIXED**
**Affected Components:** AI Chat UI, Personality System
**Branch with Bug:** `story/6.2` (before commit 26738c6)
**Branch with Fix:** `story/6.2` (commit 26738c6)
**Story Context:** Story 6.1 (AI Chat), Story 6.2 (Personality Integration)

---

## Problem Description

Chat screen crashes on mount with "Maximum update depth exceeded" error. Console shows infinite loop of personality greeting reload:

```
LOG  [PERSONALITY] Personality changed, reloading greeting: Weave
LOG  [PERSONALITY] Personality changed, reloading greeting: Weave
LOG  [PERSONALITY] Personality changed, reloading greeting: Weave
... (repeats 50+ times until crash)
ERROR  Maximum update depth exceeded. This can happen when a component
calls setState inside useEffect, but useEffect either doesn't have a
dependency array, or one of the dependencies changes on every render.
```

**User Impact**: AI chat completely unusable - app crashes immediately when opening chat overlay.

**User Feedback**: "also we have an infinite lop of personality change... this hitting maximum stack very not fgood"

---

## Root Cause Analysis

### The Infinite Loop Cycle

**Buggy Code** (ChatScreen.tsx lines 229-241):

```typescript
// ❌ BUGGY VERSION
const loadInitialGreeting = useCallback(() => {
  // ... greeting logic ...
  setMessages([initialMessage]); // 👈 Updates messages state
}, [personality]);

useEffect(() => {
  if (
    messages.length === 1 &&
    messages[0].id === 'initial-greeting' &&
    personality
  ) {
    console.log('[PERSONALITY] Personality changed, reloading greeting:', personality.name);
    loadInitialGreeting(); // 👈 Calls function that updates messages
  }
}, [personality?.personality_type, personality?.name, messages, loadInitialGreeting]);
//                                                     ^^^^^^^^  ^^^^^^^^^^^^^^^^^^
//                                                     PROBLEM 1   PROBLEM 2
```

**The Loop Sequence**:

1. **Initial Render**: Component mounts, personality loads, effect runs
2. **Effect Condition**: Checks `messages.length === 1` (true), calls `loadInitialGreeting()`
3. **State Update**: `loadInitialGreeting()` calls `setMessages([initialMessage])`
4. **Trigger**: `messages` state changes
5. **Effect Re-runs**: Because `messages` is in dependency array, effect runs again
6. **Condition Still True**: `messages.length === 1` is still true (we just set it to 1 message)
7. **Loop**: Calls `loadInitialGreeting()` again → `setMessages()` again → effect runs again
8. **Crash**: After 50+ iterations, React detects the loop and throws "Maximum update depth exceeded"

### Why Two Dependencies Cause the Loop

**Problem 1: `messages` in dependencies**
- Effect updates `messages` by calling `loadInitialGreeting()`
- This triggers the effect to run again (because `messages` changed)
- Classic infinite loop pattern

**Problem 2: `loadInitialGreeting` in dependencies**
- `loadInitialGreeting` is a `useCallback` that depends on `personality`
- Every time `personality` changes, `loadInitialGreeting` recreates
- This also triggers the effect to run
- Double-triggering with `messages` causes rapid loop

**Why the condition check doesn't prevent the loop**:
```typescript
if (messages.length === 1 && messages[0].id === 'initial-greeting') {
```
This condition is ALWAYS true during the loop:
- We just set messages to `[initialMessage]` (length = 1)
- The message ID is always 'initial-greeting'
- So the condition never becomes false to break the loop

---

## The Fix

**Fixed Code** (ChatScreen.tsx lines 229-244):

```typescript
// ✅ FIXED VERSION
const loadInitialGreeting = useCallback(() => {
  // ... greeting logic ...
  setMessages([initialMessage]);
}, [personality]);

useEffect(() => {
  // Only reload greeting if it's the initial message (no real conversation yet)
  // IMPORTANT: Don't include 'messages' or 'loadInitialGreeting' in dependencies to avoid infinite loop
  // The setMessages call inside loadInitialGreeting would trigger this effect again
  if (
    messages.length === 1 &&
    messages[0].id === 'initial-greeting' &&
    personality // Wait for personality to load
  ) {
    if (__DEV__)
      console.log('[PERSONALITY] Personality changed, reloading greeting:', personality.name);
    loadInitialGreeting();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [personality?.personality_type, personality?.name]);
// ✅ Only depend on personality changes, NOT messages or loadInitialGreeting
```

**Key Changes**:

1. **Removed `messages` from dependencies**: Effect no longer re-runs when messages update
2. **Removed `loadInitialGreeting` from dependencies**: Avoids double-triggering
3. **Added eslint-disable comment**: Suppresses exhaustive-deps warning (intentional)
4. **Added explanatory comment**: Documents why dependencies are limited

**Why This Works**:
- Effect only runs when `personality?.personality_type` or `personality?.name` changes
- When personality changes, we update the greeting (desired behavior)
- When messages update (from loadInitialGreeting), effect does NOT re-run (breaks the loop)
- The condition check (`messages.length === 1`) is still safe because we read from state closure

---

## Code Location

**File**: `weave-mobile/src/components/features/ai-chat/ChatScreen.tsx`

**Affected Lines**:
- Line 173-208: `loadInitialGreeting` function (useCallback)
- Line 229-244: Personality greeting reload effect (useEffect)

**Commit with Fix**: `26738c6`

---

## Diagnosis Steps

### Step 1: Identify the Loop
Open chat screen and watch console:
```
LOG  [PERSONALITY] Personality changed, reloading greeting: Weave
LOG  [PERSONALITY] Personality changed, reloading greeting: Weave
... (repeats)
ERROR  Maximum update depth exceeded
```

### Step 2: Check Effect Dependencies
Add debug log at TOP of effect:
```typescript
useEffect(() => {
  console.log('[EFFECT_DEBUG] Dependencies changed:', {
    personalityType: personality?.personality_type,
    personalityName: personality?.name,
    messagesLength: messages.length,
    loadInitialGreetingRef: loadInitialGreeting,
  });
  // ... rest of effect
}, [personality?.personality_type, personality?.name, messages, loadInitialGreeting]);
```

**Buggy Output**:
```
[EFFECT_DEBUG] Dependencies changed: { personalityType: 'weave', personalityName: 'Weave', messagesLength: 1, loadInitialGreetingRef: [Function] }
[EFFECT_DEBUG] Dependencies changed: { personalityType: 'weave', personalityName: 'Weave', messagesLength: 1, loadInitialGreetingRef: [Function] }
... (infinite loop)
```

Notice `messagesLength: 1` stays the same, but effect keeps running.

### Step 3: Track State Updates
Add log inside `loadInitialGreeting`:
```typescript
const loadInitialGreeting = useCallback(() => {
  console.log('[GREETING] Creating initial message');
  // ... greeting logic ...
  console.log('[GREETING] Calling setMessages');
  setMessages([initialMessage]);
}, [personality]);
```

**Buggy Output**:
```
[GREETING] Creating initial message
[GREETING] Calling setMessages
[EFFECT_DEBUG] Dependencies changed: ...
[GREETING] Creating initial message
[GREETING] Calling setMessages
... (loop)
```

### Step 4: Confirm Fix
After applying fix, console should show:
```
[PERSONALITY] Personality changed, reloading greeting: Weave
(no more logs - effect runs ONCE)
```

---

## Testing the Fix

### Test Case 1: Initial Mount
1. Open AI chat overlay
2. ✅ Verify greeting appears ONCE
3. ✅ Verify no console errors
4. ✅ Verify no repeated "[PERSONALITY]" logs

### Test Case 2: Personality Change
1. Change personality type (e.g., switch from Weave to Dream Self)
2. ✅ Verify greeting updates to match new personality
3. ✅ Verify only ONE "[PERSONALITY]" log appears
4. ✅ Verify no infinite loop

### Test Case 3: Send Message
1. Send a message: "Hello"
2. ✅ Verify greeting does NOT reload
3. ✅ Verify no "[PERSONALITY]" logs (conversation started)
4. ✅ Verify messages array now has 2+ messages

### Test Case 4: Rapid Personality Changes
1. Rapidly toggle personality settings multiple times
2. ✅ Verify greeting updates each time
3. ✅ Verify no loop or crash
4. ✅ Verify performance is smooth

---

## React useEffect Best Practices

### Rule 1: Don't Update Dependencies Inside Effects
**Pattern**:
```typescript
// ❌ BAD: Effect updates a dependency
useEffect(() => {
  setStateA(newValue); // Updates stateA
}, [stateA]); // Effect depends on stateA -> LOOP!

// ✅ GOOD: Effect doesn't update dependencies
useEffect(() => {
  setStateB(newValue); // Updates different state
}, [stateA]); // Safe - stateA not updated in effect
```

### Rule 2: Callbacks in Dependencies Need Stability
**Pattern**:
```typescript
// ❌ BAD: Callback recreates on every render
const callback = () => { /* ... */ };
useEffect(() => {
  callback();
}, [callback]); // callback recreates -> effect runs every render

// ✅ GOOD: Callback memoized with useCallback
const callback = useCallback(() => { /* ... */ }, []);
useEffect(() => {
  callback();
}, [callback]); // callback stable -> effect runs once
```

### Rule 3: Sometimes Fewer Dependencies Are Correct
**Pattern**:
```typescript
// ❌ BAD: Following eslint blindly
useEffect(() => {
  if (stateA && stateB) {
    setStateB(newValue); // Updates stateB inside effect
  }
}, [stateA, stateB]); // stateB causes loop

// ✅ GOOD: Intentionally omit dependencies that cause loops
useEffect(() => {
  if (stateA && stateB) {
    setStateB(newValue);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [stateA]); // Only depend on stateA
```

**When to disable eslint-hook/exhaustive-deps**:
- When including a dependency would cause an infinite loop
- When you intentionally want stale closure values
- When the dependency is stable by design (refs, callbacks with empty deps)

**Always add a comment explaining WHY**.

### Rule 4: Read State in Closures Safely
**Pattern**:
```typescript
// ❌ BAD: Reads state from closure, depends on it
useEffect(() => {
  if (messages.length > 0) {
    console.log(messages[0]);
  }
}, [messages]); // Re-runs every message update

// ✅ GOOD: Reads state from closure, doesn't depend on it
useEffect(() => {
  if (messages.length > 0) {
    console.log(messages[0]); // Safe - reads from closure
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [personality]); // Only runs on personality change
```

React guarantees closure values are from the render that created the closure. This is safe as long as you don't UPDATE the value inside the effect.

---

## Prevention Strategies

### 1. Audit Effects That Update State
**Checklist**:
- [ ] Does this effect call `setState` or `dispatch`?
- [ ] Is the state being updated also in the dependency array?
- [ ] If yes, can I remove it from dependencies?
- [ ] Did I add a comment explaining why?

### 2. Use Separate Effects for Separate Concerns
**Pattern**:
```typescript
// ❌ BAD: One effect handles multiple state updates
useEffect(() => {
  if (conditionA) setStateA(newA);
  if (conditionB) setStateB(newB);
}, [conditionA, conditionB, stateA, stateB]); // Complex dependencies

// ✅ GOOD: Separate effects for separate concerns
useEffect(() => {
  if (conditionA) setStateA(newA);
}, [conditionA]); // Simple dependencies

useEffect(() => {
  if (conditionB) setStateB(newB);
}, [conditionB]); // Simple dependencies
```

### 3. Log Effect Runs in Development
**Pattern**:
```typescript
useEffect(() => {
  if (__DEV__) {
    console.log('[EFFECT_NAME] Running with:', { dep1, dep2 });
  }
  // ... effect logic
}, [dep1, dep2]);
```

This makes infinite loops immediately obvious in console.

### 4. Test for Loops Before Committing
**Checklist**:
- [ ] Open component in dev mode
- [ ] Watch console for repeated logs
- [ ] Interact with component (change state, trigger effects)
- [ ] Check React DevTools "Profiler" for excessive renders
- [ ] No "Maximum update depth" errors

---

## Acceptance Criteria for Resolution

1. ✅ **No Infinite Loop**: Chat screen mounts without repeated logs
2. ✅ **No Crash**: No "Maximum update depth exceeded" error
3. ✅ **Greeting Updates**: Personality changes correctly update greeting
4. ✅ **Single Run**: Effect runs exactly once per personality change
5. ✅ **Performance**: No excessive re-renders (check React DevTools Profiler)
6. ✅ **Console Clean**: No error logs in development or production

---

## Related Issues

- **Streaming Messages Bug**: `docs/bugs/streaming-messages-not-displaying-ui-2025-12-25.md` (same session)
- **React Batching**: Similar state update timing issue
- Story 6.1: AI Chat Implementation
- Story 6.2: Server-Initiated Check-ins (personality integration)
- React Docs: [useEffect Dependencies](https://react.dev/learn/synchronizing-with-effects#specifying-reactive-dependencies)

---

## References

- ChatScreen.tsx: `weave-mobile/src/components/features/ai-chat/ChatScreen.tsx`
- React useEffect: https://react.dev/reference/react/useEffect
- React useCallback: https://react.dev/reference/react/useCallback
- Exhaustive Deps ESLint Rule: https://github.com/facebook/react/issues/14920

---

**Status**: ✅ **FIXED** (commit 26738c6)

**Priority**: 🔴 **CRITICAL** - Blocks all AI chat functionality (immediate crash).

**Commits**:
- Fix: `26738c6 - fix(ai-chat): resolve infinite loop in personality greeting effect`
- Related: `f2e5f78 - fix(ai-chat): resolve streaming messages not displaying in UI`

**Next Steps**:
1. ✅ Fixed - no action needed
2. Monitor for similar loops in other effects
3. Add effect audit to code review checklist

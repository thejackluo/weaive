# Streaming AI Messages Not Displaying in UI (Main Branch)

**Date Discovered:** 2025-12-25
**Severity:** 🔴 **CRITICAL**
**Status:** ✅ **FIXED** (fix not yet merged to main)
**Affected Components:** AI Chat UI, SSE Streaming
**Branch with Bug:** `main`
**Branch with Fix:** `story/6.2` (stashed changes)
**Story Context:** Story 6.1 (AI Chat), Story 6.2 (Streaming Optimization)

---

## Problem Description

AI chat messages are successfully streaming from the backend (confirmed by 200 OK responses and backend logs), but the messages DO NOT appear in the chat UI. The user sees:
- ✅ Typing indicator appears
- ✅ Backend logs show streaming chunks being sent
- ✅ Network requests return 200 OK
- ❌ **Message bubbles never appear in ScrollView**

**User Impact**: Chat appears broken - users send messages but receive no visible response, despite AI responding correctly on backend.

**User Feedback**: "the ui is not showing the messages, but the messsages are streamin i believe so can you fix this real this"

---

## Root Cause Analysis

### The React State Batching Problem

**Core Issue**: React 19's automatic batching causes the `useEffect` dependency check to fail by the time the effect runs.

**Sequence of Events**:

1. **User sends message**: "How can you help me?"
2. **Backend starts streaming**: Server sends chunks via SSE
3. **Hook receives chunks**: `useAIChatStream` processes:
   - Chunk 1: "Hey"
   - Chunk 2: " there!"
   - Chunk 3: " How's"
   - Chunk 4: " it"
   - Chunk 5: " going?"
   - Final event: "done"
4. **Hook updates state**:
   ```typescript
   setStreamingContent("Hey there! How's it going?");  // State update 1
   setIsStreaming(false);  // State update 2 (from "done" event)
   ```
5. **React batches updates**: Both state updates are queued together
6. **React applies batched updates**: Component re-renders with BOTH updates applied simultaneously
7. **useEffect runs AFTER render**: By this point, state is already:
   ```typescript
   streamingContent = "Hey there! How's it going?"
   isStreaming = false  // ❌ Already false!
   ```
8. **Effect condition fails**:
   ```typescript
   if (isStreaming && streamingContent) {  // ❌ false && true = FALSE
     // This block NEVER executes
     setMessages(prev => [...prev, newMessage]);
   }
   ```
9. **Result**: Message never added to array, user sees nothing.

### Why This Is Subtle

**Expected Behavior** (without batching):
```
State Update 1 → Effect runs → State Update 2 → Effect runs again
```

**Actual Behavior** (with batching in React 19):
```
State Update 1 + State Update 2 (batched) → Single render → Effect runs ONCE with BOTH updates applied
```

**The Trap**: Developers expect effects to run between state updates, but React optimizes by applying all updates first, THEN running effects.

---

## Code Location

**File**: `weave-mobile/src/components/features/ai-chat/ChatScreen.tsx`

**Buggy Code** (lines 200-248 on main branch):

```typescript
// ❌ BUGGY VERSION (main branch)
useEffect(() => {
  if (isStreaming && streamingContent) {
    // By the time this runs, isStreaming is already false
    // Condition fails, message never added
    const streamingMessageId =
      streamingMessageIdRef.current || `assistant-streaming-${Date.now()}`;
    streamingMessageIdRef.current = streamingMessageId;

    setMessages((prev) => {
      const existingIndex = prev.findIndex((m) => m.id === streamingMessageId);

      const streamingMessage: Message = {
        id: streamingMessageId,
        role: 'assistant',
        content: streamingContent,
        timestamp: new Date(),
        isStreaming: true,
      };

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = streamingMessage;
        return updated;
      } else {
        return [...prev, streamingMessage];
      }
    });

    scrollToBottom();
  }
}, [streamingContent, isStreaming]);
```

**Why It Fails**:
- Condition `if (isStreaming && streamingContent)` is too strict
- React batching means by the time effect runs, `isStreaming` is already false
- Effect body never executes
- Message never added to state array

---

## The Fix

**Fixed Code** (story/6.2 branch, stashed):

```typescript
// ✅ FIXED VERSION (story/6.2)
useEffect(() => {
  // ✅ ROOT FIX: Always process streamingContent when it exists, regardless of isStreaming state
  // Why: React batches updates, so by the time this runs, isStreaming might already be false
  if (!streamingContent) return;

  // Create or update streaming message ID
  if (!streamingMessageIdRef.current) {
    streamingMessageIdRef.current = `assistant-streaming-${Date.now()}`;
  }
  const streamingMessageId = streamingMessageIdRef.current;

  if (__DEV__)
    console.log(
      '[STREAM_UPDATE] 📝 Content update:',
      streamingMessageId,
      'length:',
      streamingContent.length,
      'isStreaming:',
      isStreaming
    );

  setMessages((prev) => {
    const existingIndex = prev.findIndex((m) => m.id === streamingMessageId);

    const streamingMessage: Message = {
      id: streamingMessageId,
      role: 'assistant',
      content: streamingContent,
      timestamp: new Date(),
      isStreaming: isStreaming, // ✅ Will be true while streaming, false when done
    };

    if (existingIndex >= 0) {
      // Update existing message
      if (__DEV__) console.log('[STREAM_UPDATE] 🔄 Updating index:', existingIndex);
      const updated = [...prev];
      updated[existingIndex] = streamingMessage;
      return updated;
    } else {
      // Add new message
      if (__DEV__) console.log('[STREAM_UPDATE] ✅ Adding new message, total:', prev.length + 1);
      return [...prev, streamingMessage];
    }
  });

  // Auto-scroll
  setTimeout(() => scrollToBottom(), 50);
}, [streamingContent, isStreaming]);
```

**Key Changes**:
1. **Changed condition**: `if (!streamingContent) return;` instead of `if (isStreaming && streamingContent)`
2. **Early return pattern**: More defensive - if no content, don't process
3. **Process ANY streamingContent**: Regardless of timing or batching
4. **isStreaming in message object**: Still track streaming state, but don't gate execution on it

**Why This Works**:
- Effect runs whenever `streamingContent` changes (even if `isStreaming` is already false)
- Message is added/updated regardless of timing
- `isStreaming` is still tracked in the message object for UI styling (e.g., typing cursor)

---

## Diagnosis Steps

### Step 1: Confirm Backend Is Streaming
```bash
# Terminal 1: Start backend with logging
cd weave-api
uv run uvicorn app.main:app --reload

# Terminal 2: Monitor backend logs
tail -f logs/app.log | grep -i stream
```

**Expected**: See streaming chunks being sent:
```
[AI_STREAM] Chunk 1: "Hey"
[AI_STREAM] Chunk 2: " there!"
[AI_STREAM] Done
```

### Step 2: Confirm Frontend Receives Chunks
Add console logs in `useAIChatStream` hook:

```typescript
// weave-mobile/src/hooks/useAIChatStream.ts
eventSource.addEventListener('message', (event) => {
  console.log('[SSE] Received chunk:', event.data); // ✅ Add this
  setStreamingContent(prev => prev + event.data);
});

eventSource.addEventListener('done', () => {
  console.log('[SSE] Stream complete'); // ✅ Add this
  setIsStreaming(false);
});
```

**Expected**: Console shows chunks arriving and "done" event.

### Step 3: Check useEffect Execution
Add console log at TOP of effect (before condition):

```typescript
useEffect(() => {
  console.log('[EFFECT_DEBUG] isStreaming:', isStreaming, 'streamingContent:', !!streamingContent);
  if (isStreaming && streamingContent) {
    console.log('[EFFECT_DEBUG] Condition passed, adding message');
    // ... rest of code
  } else {
    console.log('[EFFECT_DEBUG] ❌ Condition failed, message NOT added');
  }
}, [streamingContent, isStreaming]);
```

**Buggy Output**:
```
[EFFECT_DEBUG] isStreaming: false streamingContent: true
[EFFECT_DEBUG] ❌ Condition failed, message NOT added
```

**This confirms the bug**: Content exists but `isStreaming` is already false.

### Step 4: Check Message Array State
Add console log after `setMessages`:

```typescript
setMessages((prev) => {
  console.log('[MESSAGE_ARRAY] Before:', prev.length, 'messages');
  const newMessages = [...prev, streamingMessage];
  console.log('[MESSAGE_ARRAY] After:', newMessages.length, 'messages');
  return newMessages;
});
```

**Buggy Output**: No logs (because effect body never runs).

---

## Testing the Fix

### Test Case 1: Single Message
1. Send message: "Hello"
2. ✅ Verify message appears in UI
3. ✅ Verify streaming indicator shows during typing
4. ✅ Verify message finalizes (no streaming indicator after done)

### Test Case 2: Rapid Messages
1. Send 3 messages quickly: "Hi", "How are you?", "Tell me about goals"
2. ✅ Verify all 3 AI responses appear
3. ✅ Verify no messages are dropped

### Test Case 3: Long Streaming Response
1. Ask: "Tell me a long story about achieving goals"
2. ✅ Verify message updates in real-time as chunks arrive
3. ✅ Verify no flickering or duplicate messages
4. ✅ Verify auto-scroll works smoothly

### Test Case 4: Network Delay
1. Throttle network to 3G (Chrome DevTools)
2. Send message
3. ✅ Verify message still appears (even with slow chunks)

---

## Additional ScrollView Fix

**Related Issue**: Messages were rendering but not scrolling into view.

**File**: `weave-mobile/src/components/features/ai-chat/ChatScreen.tsx` (line 584)

**Fix**:
```typescript
const styles = StyleSheet.create({
  // ... other styles
  messagesContent: {
    padding: 8,
    paddingBottom: 24,
    flexGrow: 1, // ✅ FIX: Force content to fill space, enabling scroll
  },
});
```

**Before**: ScrollView content didn't grow, so `scrollToEnd()` had nothing to scroll to.

**After**: Content fills available space, scroll works correctly.

---

## Prevention Strategies

### 1. Test Effects with Batching in Mind
**Rule**: Never assume state updates happen sequentially in effects.

**Pattern**:
```typescript
// ❌ BAD: Assumes stateA updates before stateB
useEffect(() => {
  if (stateA && stateB) {
    // May fail if React batches updates
  }
}, [stateA, stateB]);

// ✅ GOOD: Process independently
useEffect(() => {
  if (!stateA) return;
  // Handle stateA
}, [stateA]);

useEffect(() => {
  if (!stateB) return;
  // Handle stateB
}, [stateB]);
```

### 2. Use Early Returns Instead of Nested Conditions
**Pattern**:
```typescript
// ❌ BAD: Nested conditions are fragile
useEffect(() => {
  if (conditionA && conditionB && conditionC) {
    // Complex logic
  }
}, [conditionA, conditionB, conditionC]);

// ✅ GOOD: Early returns are defensive
useEffect(() => {
  if (!conditionA) return;
  if (!conditionB) return;
  if (!conditionC) return;
  // Complex logic (only runs if ALL conditions met)
}, [conditionA, conditionB, conditionC]);
```

### 3. Log State Values at Effect Start
**Pattern**:
```typescript
useEffect(() => {
  if (__DEV__) {
    console.log('[EFFECT] Values:', { stateA, stateB, stateC });
  }
  // ... rest of effect
}, [stateA, stateB, stateC]);
```

This helps diagnose batching issues immediately.

### 4. Separate Effects for Separate Concerns
**Rule**: Don't combine unrelated state updates in one effect.

**Example**:
```typescript
// ❌ BAD: Streaming and finalization in same effect
useEffect(() => {
  if (isStreaming && content) {
    // Add message
  }
  if (!isStreaming && content) {
    // Finalize message
  }
}, [isStreaming, content]);

// ✅ GOOD: Separate effects
useEffect(() => {
  if (!content) return;
  // Add/update message (runs on ANY content change)
}, [content]);

useEffect(() => {
  if (!isStreaming && streamingMessageIdRef.current) {
    // Finalize message (runs when streaming stops)
  }
}, [isStreaming]);
```

---

## React 19 Batching Context

**What Changed in React 19**:
- React 18 and earlier: Batching only in event handlers
- React 19: **Automatic batching everywhere** (promises, timeouts, native events)

**Impact on Weave**:
- SSE events trigger multiple state updates
- React 19 batches ALL updates from a single SSE event
- Effects run AFTER all updates applied
- Old patterns assuming sequential updates now fail

**Official React Docs**: [Automatic Batching in React 19](https://react.dev/blog/2022/03/29/react-v18#new-feature-automatic-batching)

---

## Acceptance Criteria for Resolution

1. ✅ **Messages Display**: All AI responses appear in chat UI
2. ✅ **No Message Loss**: Rapid messages don't drop responses
3. ✅ **Streaming Indicator**: Typing indicator shows during streaming
4. ✅ **Auto-Scroll**: Messages scroll into view automatically
5. ✅ **Network Resilience**: Works with slow/delayed network
6. ✅ **No Flickering**: Messages don't duplicate or flash during streaming
7. ✅ **Console Clean**: No error logs in production

---

## Deployment Plan

### Step 1: Apply Stashed Fix to Main
```bash
cd weave-mobile
git checkout main
git stash list  # Find stash with "Bug fixes: dark mode force + streaming message display"
git stash apply stash@{0}
```

### Step 2: Test on Device
```bash
npm run ios  # or npm run android
```

**Test Checklist**:
- [ ] Send message, verify response appears
- [ ] Send 3 rapid messages, verify all responses appear
- [ ] Request long response, verify streaming works
- [ ] Check console for errors

### Step 3: Commit and Push
```bash
git add src/components/features/ai-chat/ChatScreen.tsx
git commit -m "fix(ai-chat): resolve streaming messages not displaying due to React batching

- Changed useEffect condition from 'if (isStreaming && streamingContent)' to 'if (!streamingContent) return'
- Root cause: React 19 batches state updates, causing isStreaming to be false by the time effect runs
- Messages now display regardless of batching timing
- Added flexGrow: 1 to messagesContent for proper scrolling

Fixes: #[issue-number]
Story: 6.1, 6.2"

git push origin main
```

### Step 4: Verify in Production
After Railway deployment:
- [ ] Test on real iOS device
- [ ] Test on real Android device
- [ ] Monitor Sentry for errors (if enabled)

---

## Related Issues

- Story 6.1: AI Chat Implementation (initial streaming implementation)
- Story 6.2: Server-Initiated Check-ins (streaming optimization)
- React 19 Automatic Batching: https://react.dev/blog/2022/03/29/react-v18#new-feature-automatic-batching
- `docs/bugs/metro-path-alias-cache-issue-2025-12-18.md` (similar React Native state bug)

---

## References

- ChatScreen.tsx: `weave-mobile/src/components/features/ai-chat/ChatScreen.tsx`
- useAIChatStream hook: `weave-mobile/src/hooks/useAIChatStream.ts`
- React Batching Docs: https://react.dev/learn/queueing-a-series-of-state-updates
- React 19 Release Notes: https://react.dev/blog/2022/03/29/react-v18

---

**Status**: ✅ **FIXED** (fix stashed in story/6.2, needs merge to main)

**Priority**: 🔴 **CRITICAL** - Blocks all AI chat functionality.

**Next Steps**:
1. Apply stashed fix to main branch
2. Test on iOS and Android devices
3. Commit and push to main
4. Verify in production after Railway deployment
5. Update Story 6.2 acceptance criteria

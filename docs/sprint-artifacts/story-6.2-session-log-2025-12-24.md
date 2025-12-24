# Session Changes - December 24, 2025

## Overview
This session fixed 6 critical issues with the AI tool execution system:
1. Backend syntax errors preventing server startup
2. Tool trigger patterns too narrow
3. Tool status not updating in UI
4. Personality intro messages not working
5. System message rendering
6. Timestamp timezone offset ("5 hours ago" issue)

---

## Suggested Commits

### Commit 1: fix: backend syntax errors preventing server startup

**Files:**
- `weave-api/app/api/ai_chat_router.py`

**Changes:**
- Line 21: Added `timezone` import: `from datetime import datetime, timezone`
- Line 362: Fixed f-string syntax: Changed nested f-string to string concatenation
  - Before: `f"- Result: {t['result'] if t['success'] else f\"ERROR: {t['error']}\"}"`
  - After: `f"- Result: {t['result'] if t['success'] else 'ERROR: ' + str(t.get('error', 'Unknown error'))}"`
- Line 608: Initialize `assistant_message_id = None` to prevent UnboundLocalError
- Line 672: Fixed f-string syntax (same as line 362)
- Line 809: Safe handling: `str(assistant_message_id) if assistant_message_id else None`

**Why:** F-string syntax errors caused SyntaxError on startup. UnboundLocalError occurred when streaming completed.

---

### Commit 2: feat: add deterministic tool triggering with broad pattern matching

**Files:**
- `weave-api/app/services/tools/tool_trigger_analyzer.py` (NEW FILE - add entire file)

**Why:** Replaces unreliable AI-driven tool calling with deterministic pattern matching. Makes tool triggering accessible with natural conversation patterns.

**Key Features:**
- Identity document triggers: "I am Jack", "traits: ambitious", "my archetype is..."
- Personality triggers: "switch to dream self", "be more casual", "talk supportively"
- Parameter extraction from natural language

---

### Commit 3: fix: personality parameter extraction and preset support

**Files:**
- `weave-api/app/services/tools/tool_trigger_analyzer.py`
- `weave-api/app/services/tools/modify_personality_tool.py`

**Changes in tool_trigger_analyzer.py:**
- Lines 184-214: Rewrote `extract_personality_params` function with cascading if/elif logic
  - Extracts `active_personality` from "dream self" or "weave" mentions
  - Extracts `weave_preset` from style keywords ("casual", "supportive", "concise")
  - Added fallback detection for preset keywords
- Lines 216-231: Tightened personality trigger patterns to only match when extraction succeeds
  - Added style/tone request patterns: "be more casual", "talk supportively"
  - Removed overly broad `r'personality'` pattern

**Changes in modify_personality_tool.py:**
- Lines 67-76: Added `weave_preset` parameter to JSON schema
- Lines 88-123: Updated execute() method signature and docstring to accept preset
- Lines 169-183: Implemented preset database update logic
  - Updates `user_profiles.weave_ai_preset` when preset provided
  - Refreshes personality details after update
  - Graceful error handling (doesn't fail operation if preset update fails)
- Lines 190-198: Enhanced response message to include preset confirmation

**Why:** Previous implementation failed with "Missing required parameters" error. Tool triggers matched but couldn't extract which personality to switch to.

---

### Commit 4: fix: tool status UI transitions and app state invalidation

**Files:**
- `weave-mobile/src/hooks/useAIChatStream.ts`

**Changes:**
- Line 16: Added `import { useQueryClient } from '@tanstack/react-query'`
- Line 63: Initialize `const queryClient = useQueryClient()`
- Lines 215-246: Rewrote tool_result event handling
  - Changed from state-dependent to event-driven updates
  - Uses `findIndex` to locate tool by name and status instead of relying on stale `currentTool` state
  - Added cache invalidation after tool completion:
    - `modify_identity_document` → invalidate 'identity-doc' query
    - `modify_personality` → invalidate 'personality' query
- Lines 247-269: Applied same fix to tool_error event handling

**Why:** Tool status indicators stuck at "starting" forever. React closure issues caused stale state. Cache invalidation ensures UI updates after tool execution.

**Before (broken):**
```typescript
if (currentTool) {
  const updatedTool = { ...currentTool, status: 'completed' };
  // Uses stale currentTool state
}
```

**After (fixed):**
```typescript
const toolName = chunk.tool_name;
setToolExecutions((prev) => {
  const toolIndex = prev.findIndex((t) => t.toolName === toolName && t.status === 'starting');
  if (toolIndex >= 0) {
    const updated = [...prev];
    updated[toolIndex] = { ...prev[toolIndex], status: 'completed' };
    return updated;
  }
  return prev;
});
```

---

### Commit 5: fix: personality data loading and intro message reactivity

**Files:**
- `weave-mobile/src/hooks/usePersonality.ts`
- `weave-mobile/src/components/features/ai-chat/ChatScreen.tsx`
- `weave-api/app/api/ai_chat_router.py`

**Changes in usePersonality.ts:**
- Lines 7-8: Added imports: `useEffect`, `useQuery`, `useQueryClient`
- Line 15: Added `import apiClient from '@/services/apiClient'`
- Lines 67, 75-90: Added TanStack Query to fetch personality from backend on mount
- Lines 92-99: Added useEffect to update local state when query data changes
- Line 125: Added cache invalidation after personality switch
- Line 147: Include `isLoading` in `isSwitching` state

**Changes in ChatScreen.tsx:**
- Line 173: Wrapped `loadInitialGreeting` in `useCallback` with `[personality]` dependency
- Lines 229-241: Added useEffect to reload greeting when personality changes
  - Only reloads if showing initial greeting (prevents overwriting real conversations)
  - Watches `personality?.personality_type` and `personality?.name`

**Changes in ai_chat_router.py:**
- Lines 1036-1081: Added new `GET /api/personality` endpoint
  - Calls `PersonalityService.get_active_personality()`
  - Returns personality details for frontend consumption
  - Includes JWT auth protection

**Why:** Original `usePersonality` hook only held hardcoded default state, never fetched actual data from backend. This caused intro messages to always show "Weave" instead of the user's Dream Self name. The new approach fetches on mount and reactively updates greetings when personality switches.

---

### Commit 6: fix: timestamp timezone offset causing incorrect relative times

**Files:**
- `weave-api/app/api/ai_chat_router.py`

**Changes:**
- Line 21: Added timezone import: `from datetime import datetime, timezone`
- Lines 133-134: `create_conversation()` - Use UTC timestamps
- Lines 173, 178: `save_message()` - Use UTC timestamps
- Line 894: `list_conversations()` meta - Use UTC timestamp
- Line 1072: `get_personality()` meta - Use UTC timestamp
- Line 1138: Admin check-in `last_checkin_at` - Use UTC timestamp
- Line 1150: Admin check-in meta - Use UTC timestamp

**Changed pattern:**
- Before: `datetime.now().isoformat()`
- After: `datetime.now(timezone.utc).isoformat()`

**Why:** Backend was using server local time (varies by deployment region), causing constant timezone offset. Users saw "5 hours ago" for recent messages because server (UTC) and device (local timezone) times didn't match. UTC timestamps ensure consistent calculations across all timezones.

---

## System Message Rendering Issue (Documented, Not Fixed)

**Issue:** System messages (from admin check-in endpoint) not appearing in conversation history.

**Root Cause:** Admin endpoint `/admin/trigger-checkin/{user_id}` creates **new separate conversations** for each system message (line 1069). Frontend loads "most recent conversation" (ChatScreen.tsx:119), so system messages in older conversations don't appear.

**Architecture:**
- System messages ARE supported by the UI (MessageBubble.tsx has gold theme + "✨ Weave checked in" indicator)
- Backend API fetches ALL message roles including "system" (no filtering)
- Frontend maps all roles correctly

**Solution (future work):** System check-ins should append to user's active conversation instead of creating separate threads. Requires refactoring admin endpoint logic.

---

## New Files to Add

These files were created in previous sessions but are untracked:

```bash
git add weave-api/app/services/tools/modify_identity_document_tool.py
git add weave-api/app/services/tools/tool_trigger_analyzer.py
git add weave-mobile/app/(tabs)/settings/tool-testing.tsx
git add weave-mobile/src/components/features/ai-chat/ToolExecutionIndicator.tsx
git add docs/dev/ai-chat-prefetch-strategy.md
```

---

## How to Commit

### Option A: Single comprehensive commit (recommended for speed)

```bash
git add weave-api/app/api/ai_chat_router.py \
        weave-api/app/services/tools/modify_personality_tool.py \
        weave-api/app/services/tools/tool_trigger_analyzer.py \
        weave-mobile/src/hooks/useAIChatStream.ts \
        weave-mobile/src/hooks/usePersonality.ts \
        weave-mobile/src/components/features/ai-chat/ChatScreen.tsx

git commit -m "$(cat <<'EOF'
fix: tool execution system - 6 critical bug fixes

Fixes:
1. Backend f-string syntax errors preventing startup
2. Tool trigger patterns too narrow - broadened for natural conversation
3. Tool status stuck at "starting" - fixed React state closure issues
4. Personality intro messages not working - added backend data fetching
5. Timestamp timezone offset - switched to UTC for consistency
6. Added /api/personality endpoint and weave_preset support

Details:
- ai_chat_router.py: Fixed nested f-strings, added timezone.utc, new personality endpoint
- tool_trigger_analyzer.py: Rewrote personality parameter extraction, broadened patterns
- modify_personality_tool.py: Added weave_preset parameter and database update
- useAIChatStream.ts: Fixed tool status transitions, added cache invalidation
- usePersonality.ts: Added TanStack Query to fetch from backend
- ChatScreen.tsx: Added personality change reactivity for greetings

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

### Option B: Separate commits by feature (6 commits)

Use the commit messages and file lists from sections above. Stage files for each commit individually.

---

## Testing Checklist

After committing:
- [ ] Backend starts without syntax errors
- [ ] Tool execution triggers on natural messages ("I am Jack", "be casual")
- [ ] Tool status indicators transition from "starting" → "completed"
- [ ] Personality intro messages show correct Dream Self name
- [ ] Timestamps show correct relative time (not always "5 hours ago")
- [ ] Cache invalidates after tool execution (identity doc / personality UI updates)

---

## Files Modified This Session

| File | Lines Changed | Type |
|------|---------------|------|
| `weave-api/app/api/ai_chat_router.py` | Multiple sections | Backend API |
| `weave-api/app/services/tools/tool_trigger_analyzer.py` | 184-231 | Backend Tool System |
| `weave-api/app/services/tools/modify_personality_tool.py` | 67-198 | Backend Tool System |
| `weave-mobile/src/hooks/useAIChatStream.ts` | 16, 63, 215-269 | Frontend Hook |
| `weave-mobile/src/hooks/usePersonality.ts` | All (see diff above) | Frontend Hook |
| `weave-mobile/src/components/features/ai-chat/ChatScreen.tsx` | 173, 229-241 | Frontend UI |

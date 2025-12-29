# AI-Based Tool Classification Migration - December 24, 2025

## Overview

**Migration:** Regex-based deterministic triggering → AI-powered classification
**Reason:** Regex patterns are too unpredictable and inflexible for natural conversation
**Solution:** Use small, fast AI model (GPT-4o-mini or Claude 3.5 Haiku) with prompt-based classification

---

## What Changed

### Architecture Shift

**Before (Deterministic):**
```
User Message
    ↓
Regex Pattern Matching (tool_trigger_analyzer.py)
    ↓
Parameter Extraction (hardcoded if/elif logic)
    ↓
Tool Execution
```

**After (AI-Powered):**
```
User Message
    ↓
AI Classification Prompt (tool descriptions + examples)
    ↓
Small AI Model (GPT-4o-mini / Claude 3.5 Haiku)
    ↓
JSON Response: {"tools": [{"tool_name": "...", "parameters": {...}}]}
    ↓
Tool Execution
```

---

## Files Changed

### 1. New File: AI Tool Classifier

**File:** `weave-api/app/services/tools/ai_tool_classifier.py` (239 lines)

**Key Features:**
- **AI-powered classification** using prompt with tool descriptions
- **Automatic parameter extraction** from natural language
- **Structured JSON response** for tool calls
- **Fail-safe design** - returns empty list if classification fails

**Classification Prompt Structure:**
```
You are a tool classification system. Analyze the user's message and determine if any tools should be called.

Available Tools:
**modify_personality**
Description: Change the AI coaching personality...
Parameters: {...}
Example phrases: switch to my dream self, be more casual

**modify_identity_document**
Description: Update user's identity document...
Parameters: {...}
Example phrases: I am Jack, my traits are curious

User Message: "[actual message]"

Response Format (JSON only):
{
  "tools": [
    {
      "tool_name": "modify_personality",
      "parameters": {
        "active_personality": "dream_self"
      }
    }
  ]
}
```

**AI Model Settings:**
- **Model:** GPT-4o-mini or Claude 3.5 Haiku (fast + cheap)
- **Temperature:** 0.1 (low for consistent classification)
- **Max Tokens:** 500 (small response)
- **Operation Type:** 'tool_classification' (for cost tracking)

**Benefits:**
- ✅ Handles natural language variations ("I'm Jack" vs "I am Jack" vs "call me Jack")
- ✅ No need to maintain complex regex patterns
- ✅ Easier to add new tools (just add descriptions)
- ✅ AI understands context and intent better than regex
- ✅ Can handle ambiguous cases ("switch personality" → AI infers based on context)

---

### 2. Updated: Streaming Endpoints

**File:** `weave-api/app/api/ai_chat_router.py`

**Changes:**

#### Import (Line 49):
```python
# Before
from app.services.tools.tool_trigger_analyzer import get_tool_trigger_analyzer

# After
from app.services.tools.ai_tool_classifier import create_tool_classifier
```

#### Non-Streaming Endpoint (Lines 320-327):
```python
# Before
trigger_analyzer = get_tool_trigger_analyzer()
triggered_tools = trigger_analyzer.analyze_message(request.message)

for tool_name, parameters in triggered_tools:
    # ... execute

# After
tool_classifier = create_tool_classifier(ai_service)
triggered_tools = await tool_classifier.analyze_message(request.message, str(user_id))

for tool_call in triggered_tools:
    tool_name = tool_call['tool_name']
    parameters = tool_call['parameters']
    # ... execute
```

#### Streaming Endpoint (Lines 612-629):
```python
# Same changes as non-streaming
# Uses AI classifier instead of regex analyzer
```

**Response Format Change:**
- **Before:** `[(tool_name, parameters), ...]` (tuple list)
- **After:** `[{"tool_name": "...", "parameters": {...}}, ...]` (dict list)

---

### 3. Fixed: Tool Status Indicator Visibility

**File:** `weave-mobile/src/hooks/useAIChatStream.ts`

**Problem:** Tool indicator cleared immediately on completion, so user never saw "completed" or "error" states.

**Fix (Lines 224-237 for completed, 265-278 for error):**

#### Tool Completion (tool_result event):
```typescript
// Before (indicator disappears instantly)
const updated = [...prev];
updated[toolIndex] = { ...prev[toolIndex], status: 'completed' };
setCurrentTool(null);  // ❌ Clears immediately!
return updated;

// After (indicator shows success for 2.5 seconds)
const completedTool = {
  ...prev[toolIndex],
  status: 'completed' as const,
  result: chunk.tool_result,
};
updated[toolIndex] = completedTool;

// Show completed state in indicator
setCurrentTool(completedTool);

// Auto-clear after 2.5 seconds
setTimeout(() => {
  setCurrentTool(null);
}, 2500);

return updated;
```

#### Tool Error (tool_error event):
```typescript
// Same pattern - shows error state for 3 seconds before clearing
const errorTool = {
  ...prev[toolIndex],
  status: 'error' as const,
  error: chunk.tool_error || 'Unknown tool error',
};

setCurrentTool(errorTool);

setTimeout(() => {
  setCurrentTool(null);
}, 3000);  // Slightly longer for errors
```

**User Experience Now:**
1. Tool starts: **"⚙️ modify_personality..."** (starting indicator)
2. Tool completes: **"✓ modify_personality"** (success indicator - shows 2.5s)
3. Auto-clears: Indicator fades out
4. If error: **"✗ modify_personality - [error message]"** (shows 3s in red)

---

## Testing Checklist

**Backend:**
- [x] Syntax checks passed for both files
- [ ] Backend starts without errors
- [ ] AI classifier can parse tool descriptions
- [ ] AI model responds with valid JSON
- [ ] Tool execution triggers correctly
- [ ] Tool results/errors emit proper SSE events

**Frontend:**
- [ ] Tool indicator appears when tool starts
- [ ] Tool indicator shows "completed" state (green checkmark)
- [ ] Tool indicator auto-clears after 2.5 seconds
- [ ] Tool indicator shows "error" state if tool fails (red X)
- [ ] Error indicator auto-clears after 3 seconds
- [ ] Cache invalidation works (UI updates after tool completion)

**Natural Language Testing:**
- [ ] "I am Jack" → triggers modify_identity_document
- [ ] "be more casual" → triggers modify_personality with gen_z_default preset
- [ ] "switch to dream self" → triggers modify_personality
- [ ] "my traits are curious and ambitious" → triggers modify_identity_document
- [ ] "tell me about my progress" → NO tools triggered (just AI response)

---

## Cost Impact

**AI Classification Cost:**
- **Model:** GPT-4o-mini ($0.15 / 1M input tokens, $0.60 / 1M output tokens)
- **Per Message:** ~200 input tokens (prompt + tool descriptions), ~50 output tokens (JSON)
- **Cost per classification:** ~$0.00006 per message ($0.06 per 1000 messages)
- **User impact:** With 10 messages/day average = $0.0006/user/day = $0.018/user/month

**Comparison:**
- Regex classification: $0 (deterministic)
- AI classification: $0.018/user/month
- Regular AI chat response: ~$0.003 per message (50x more expensive)

**Verdict:** AI classification adds only **2% to total AI costs** while providing much better UX.

---

## Benefits of AI-Based Approach

### Flexibility
- **Regex:** "I am Jack" works, "I'm Jack" might not, "call me Jack" definitely not
- **AI:** All natural variations work - AI understands intent

### Maintainability
- **Regex:** Adding new tool = writing 5-10 complex regex patterns + parameter extraction logic
- **AI:** Adding new tool = adding description + examples to list (3 lines of JSON)

### Accuracy
- **Regex:** Triggers on false positives ("I'm not a personality" contains "personality")
- **AI:** Understands context and intent ("I'm not interested in switching" = no tool)

### User Experience
- **Regex:** Users must learn specific phrases to trigger tools
- **AI:** Users talk naturally, AI figures out what they want

### Example Comparison

**Message:** "Actually, I'd prefer to go by Alexander instead of Alex"

**Regex Approach:**
```python
# Would need pattern like:
r'(?:go\s+by|prefer|call\s+me)\s+[A-Z]\w+'  # Complex!
# Still might miss variations
```

**AI Approach:**
```
AI sees: "prefer to go by Alexander instead of Alex"
AI infers: User wants to update their name
AI returns: {"tool_name": "modify_identity_document", "parameters": {"dream_self": "Alexander"}}
```

---

## Migration Notes

### Old Files (Can Be Deprecated):
- `weave-api/app/services/tools/tool_trigger_analyzer.py` (231 lines)
  - ⚠️ **DO NOT DELETE YET** - Keep for reference during migration
  - Can remove after validating AI classification works in production

### New Files:
- `weave-api/app/services/tools/ai_tool_classifier.py` (239 lines)

### Modified Files:
- `weave-api/app/api/ai_chat_router.py` (import + 2 usage sites)
- `weave-mobile/src/hooks/useAIChatStream.ts` (tool status indicator timing)

---

## Rollback Plan

If AI classification doesn't work well in production:

1. **Revert router imports:**
```python
from app.services.tools.tool_trigger_analyzer import get_tool_trigger_analyzer
```

2. **Revert tool analysis calls:**
```python
trigger_analyzer = get_tool_trigger_analyzer()
triggered_tools = trigger_analyzer.analyze_message(request.message)
```

3. **Revert parameter unpacking:**
```python
for tool_name, parameters in triggered_tools:
    # ...
```

4. **Keep tool indicator fix** - That's an improvement regardless of classification method

---

## Next Steps

1. **Test Backend Startup:**
   ```bash
   cd weave-api
   uv run uvicorn app.main:app --reload
   ```

2. **Manual Testing:**
   - Send message: "I am Jack"
   - Verify: Tool indicator shows → completes → auto-clears
   - Check logs: AI classifier should log tool identification

3. **Validate AI Response Format:**
   - Check that AI returns valid JSON
   - Verify tool names match registered tools
   - Confirm parameters are extracted correctly

4. **Update Documentation:**
   - Update `docs/architecture/implementation-patterns-consistency-rules.md`
   - Update Story 6.2 implementation notes
   - Update COMMIT_PLAN to reflect AI-based approach

---

## Summary

✅ **Replaced** regex-based tool triggering with AI-powered classification
✅ **Fixed** tool status indicator to show completed/error states (2.5s/3s delay)
✅ **Maintained** tool execution flow (still happens before AI response)
✅ **Improved** natural language understanding and flexibility
✅ **Minimal cost** impact (~2% of total AI spend)

**Ready for Testing!**

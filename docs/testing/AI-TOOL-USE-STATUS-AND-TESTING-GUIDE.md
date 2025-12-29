# AI Tool Use: Current Status & Testing Guide

**Date:** 2025-12-23
**Branch:** `story/6.2`
**Critical Question:** Can I test AI Tool Use (function calling) in the chat?

---

## Quick Answer

✅ **YES** - AI Tool Use (function calling) is **NOW FULLY IMPLEMENTED**!

**What you CAN test:**
- ✅ Chat with AI (streaming responses, conversation history)
- ✅ Manually switch personality in Settings
- ✅ AI responds with context-enriched messages
- ✅ **AI automatically calling tools during chat** (NEW!)
- ✅ **"Change my personality" → AI executes `modify_personality` tool** (NEW!)
- ✅ **AI performing actions on your behalf** (NEW!)

**Implementation Completed:** 2025-12-23

---

## Current Implementation Status

### ✅ FULLY IMPLEMENTED - Tool Use Integration

#### 1. AI Chat UI (Story 6.1) - **FULLY IMPLEMENTED**
**Location:** `weave-mobile/src/components/features/ai-chat/ChatScreen.tsx`

**Features Working:**
- Full chat interface with message bubbles
- Streaming AI responses with typing indicators
- Conversation history persistence
- Quick action chips ("What should I do today?", etc.)
- Rate limiting UI (10 premium + 40 free messages/day)
- Glassmorphism design with animations

**How to Access:**
1. Start Expo app: `cd weave-mobile && npm start`
2. Navigate: **Tap AI Chat tab** (bottom navigation)
3. Start chatting!

#### 2. Personality Settings - **FULLY IMPLEMENTED**
**Location:** `weave-mobile/app/(tabs)/settings/personality.tsx`

**Features Working:**
- Switch between Dream Self and Weave AI
- Select Weave AI presets (Gen Z, Supportive, Concise)
- Loading states and success alerts
- Database persistence

**How to Access:**
1. Settings tab → **"🤖 AI Personality (Story 6.2)"**
2. Tap personality cards to switch
3. Changes persist across app restarts

#### 3. Tool Infrastructure - **BACKEND READY**
**Location:** `weave-api/app/services/tools/`

**What's Implemented:**
- `ToolRegistry` - Tool registration and execution framework
- `ModifyPersonalityTool` - Tool to switch user personality
- Tool schema generation (OpenAI/Anthropic format)
- Tool execution with error handling

**Registered Tools:**
| Tool Name | Purpose | Parameters |
|-----------|---------|------------|
| `modify_personality` | Switch user's active personality | `active_personality: "dream_self" \| "weave_ai"` |

---

### ✅ What Was IMPLEMENTED (Dec 23, 2025)

#### 1. Base Classes Updated - **COMPLETED**
**Location:** `weave-api/app/services/ai/base.py`

**Changes:**
```python
@dataclass
class AIResponse:
    content: str
    input_tokens: int
    output_tokens: int
    model: str
    cost_usd: float
    provider: str
    cached: bool = False
    run_id: Optional[str] = None
    tool_calls: Optional[list] = None  # ✅ NEW: Tool Use support

class AIProvider(ABC):
    @abstractmethod
    def complete(
        self,
        prompt: str,
        model: str,
        tools: Optional[list] = None,  # ✅ NEW: Tool schemas
        **kwargs
    ) -> AIResponse:
        pass
```

#### 2. OpenAI Provider - **FULL TOOL SUPPORT**
**Location:** `weave-api/app/services/ai/openai_provider.py`

**Implementation:**
```python
def complete(self, prompt: str, model: str = 'gpt-4o-mini', tools: list = None, **kwargs):
    # Build API parameters
    api_params = {...}

    # ✅ Pass tools to OpenAI
    if tools:
        api_params['tools'] = tools
        logger.info(f"🔧 Passing {len(tools)} tools to OpenAI")

    response = self.client.chat.completions.create(**api_params)

    # ✅ Extract tool calls
    tool_calls = None
    if hasattr(message, 'tool_calls') and message.tool_calls:
        tool_calls = [
            {
                'id': tc.id,
                'type': tc.type,
                'function': {
                    'name': tc.function.name,
                    'arguments': tc.function.arguments  # JSON string
                }
            }
            for tc in message.tool_calls
        ]
        logger.info(f"🔧 AI requested {len(tool_calls)} tool call(s)")

    return AIResponse(..., tool_calls=tool_calls)
```

#### 3. Anthropic Provider - **FULL TOOL SUPPORT**
**Location:** `weave-api/app/services/ai/anthropic_provider.py`

**Implementation:**
```python
def complete(self, prompt: str, model: str = 'claude-3-5-sonnet-20241022', tools: list = None, **kwargs):
    request_params = {...}

    # ✅ Pass tools to Anthropic
    if tools:
        request_params['tools'] = tools
        logger.info(f"🔧 Passing {len(tools)} tools to Anthropic")

    response = self.client.messages.create(**request_params)

    # ✅ Extract tool calls from content blocks
    text_content = ""
    tool_calls_list = None

    for block in response.content:
        if block.type == 'text':
            text_content += block.text
        elif block.type == 'tool_use':
            if tool_calls_list is None:
                tool_calls_list = []
            tool_calls_list.append({
                'id': block.id,
                'type': 'tool_use',
                'function': {
                    'name': block.name,
                    'arguments': block.input  # Dict (not JSON string)
                }
            })

    return AIResponse(..., tool_calls=tool_calls_list)
```

#### 4. AIService Integration - **TOOL EXECUTION LOOP**
**Location:** `weave-api/app/services/ai/ai_service.py`

**Implementation:**
```python
from ..tools.tool_registry import get_tool_registry

def generate(self, user_id: str, ...):
    # ✅ Step 1: Get tool schemas
    tool_registry = get_tool_registry()
    tool_schemas = tool_registry.get_tool_schemas() if len(tool_registry) > 0 else None
    if tool_schemas:
        logger.info(f"🔧 {len(tool_schemas)} tools available")

    # ✅ Step 2: Pass tools to provider
    response = provider.complete(
        prompt=enriched_prompt,
        tools=tool_schemas,  # Enable function calling
        module=module,
        **kwargs
    )

    # ✅ Step 3: Execute tool loop if tools were called
    if response.tool_calls:
        response = self._execute_tool_loop(
            user_id=user_id,
            provider=provider,
            initial_response=response,
            enriched_prompt=enriched_prompt,
            module=module,
            **kwargs
        )

    return response

def _execute_tool_loop(self, user_id, provider, initial_response, ...):
    """Execute tools and get natural language response."""
    tool_registry = get_tool_registry()
    tool_results = []

    # Execute each tool
    for tool_call in initial_response.tool_calls:
        tool_name = tool_call['function']['name']

        # Parse arguments (handle both JSON string and dict)
        if isinstance(tool_call['function']['arguments'], str):
            arguments = json.loads(tool_call['function']['arguments'])  # OpenAI
        else:
            arguments = tool_call['function']['arguments']  # Anthropic

        # Execute tool
        result = tool_registry.execute_tool(tool_name, arguments, user_id)
        tool_results.append({...})

    # Build follow-up prompt with tool results
    follow_up_prompt = f"""You previously requested tools:
    {tool_results_text}

    Please provide natural language response."""

    # Send back to AI for wrapping
    final_response = provider.complete(
        prompt=follow_up_prompt,
        module=module,
        tools=None,  # No recursive tool calls
        **kwargs
    )

    # Combine costs from both AI calls
    final_response.cost_usd += initial_response.cost_usd
    final_response.input_tokens += initial_response.input_tokens
    final_response.output_tokens += initial_response.output_tokens

    return final_response
```

**Implemented Components:**
1. ✅ Tool schema passing to AI providers (OpenAI, Anthropic)
2. ✅ Tool call detection in AI responses (normalized format)
3. ✅ Tool execution loop (execute → send results back → get natural language)
4. ✅ Multi-turn conversation handling for tool use
5. ✅ Cost tracking across multiple AI calls
6. ✅ Error handling with fallback responses

---

## How to Test What's Available

### Test 1: Chat with AI (Context-Enriched Responses)

**Objective:** Verify AI chat works with context enrichment

**Steps:**
1. **Start backend:** `cd weave-api && uv run uvicorn app.main:app --reload`
2. **Start Expo:** `cd weave-mobile && npm start`
3. **Navigate to AI Chat:** Tap "AI Chat" tab in bottom navigation
4. **Send a message:** "What should I focus on today?"

**Expected Behavior:**
- ✅ Message appears in chat
- ✅ Typing indicator shows
- ✅ AI response streams in word-by-word
- ✅ Response references your actual data (goals, completions, journal entries)
- ✅ Conversation persists (reload app → history preserved)

**What to Check:**
```typescript
// Backend logs should show:
INFO: ✅ Context built in 287ms for user user_123
INFO: 📊 Found 3 active goals, 12 completions, 5 journal entries
INFO: 🤖 Calling OpenAI GPT-4o-mini for chat response
INFO: ✅ AI response generated in 2.4s (450 tokens)
```

**⚠️ Limitation:** AI will respond with text only, not execute actions

---

### Test 2: Manual Personality Switching

**Objective:** Verify personality switching works in Settings

**Steps:**
1. **Navigate:** Settings → "🤖 AI Personality (Story 6.2)"
2. **Switch to Dream Self:** Tap "Dream Self" card
3. **Wait for loading spinner** (2-3 seconds)
4. **Check for success alert:** "Switched to Dream Self"
5. **Switch to Weave AI:** Tap "Weave AI" card
6. **Select Preset:** Tap "Gen Z Default" (or other preset)
7. **Check success alert:** "Updated to Gen Z Default (Short & Warm)"

**Expected Behavior:**
- ✅ Blue checkmark moves to selected option
- ✅ Success alert shows
- ✅ Database updated (verify with query below)
- ✅ Settings persist across app restarts

**Verify Database Update:**
```bash
cd weave-api
uv run python -c "
from supabase import create_client, Client
import os
supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))
result = supabase.table('user_profiles').select('active_personality, weave_ai_preset').eq('id', 'YOUR_USER_ID').execute()
print(result.data)
"
# Expected: [{'active_personality': 'dream_self', 'weave_ai_preset': 'gen_z_default'}]
```

---

### Test 3: Personality Affects AI Responses

**Objective:** Verify active personality influences AI chat tone

**Steps:**
1. **Set personality to Dream Self** (Settings → Personality)
2. **Go to AI Chat** and send: "What should I focus on today?"
3. **Observe response tone** (personalized, uses identity traits)
4. **Go back to Settings** and switch to **Weave AI + Gen Z Default**
5. **Return to AI Chat** and send same message
6. **Compare response tone** (shorter, casual, text-message style)

**Expected Differences:**
| Personality | Response Style |
|-------------|----------------|
| Dream Self | Personalized, references identity doc traits, speaks as "ideal self" |
| Weave AI (Gen Z) | Short (~60 words), warm, casual, text-message style |
| Weave AI (Supportive) | Encouraging (~80 words), accountability-focused |
| Weave AI (Concise) | Ultra-brief (~40 words), action-oriented |

---

## ✅ NEW: Test AI Tool Use (Function Calling)

### Test 4: AI Tool Use - Personality Switching ✅

**NOW WORKING! Implementation completed Dec 23, 2025**

**How It Works:**
```
User: "Switch my personality to Dream Self"

AI Flow (FULLY IMPLEMENTED):
1. ✅ AI detects intent to change personality
2. ✅ AI calls modify_personality tool: {"active_personality": "dream_self"}
3. ✅ Tool executes → updates user_profiles.active_personality in database
4. ✅ Tool returns success result to AI
5. ✅ AI wraps result in natural language: "I've switched you to Dream Self mode!
   From now on, I'll embody [your ideal self name] and speak with the traits
   you defined in your identity document..."
```

**How to Test:**

**Prerequisites:**
1. ✅ Backend running: `cd weave-api && uv run uvicorn app.main:app --reload`
2. ✅ Mobile app running: `cd weave-mobile && npm start`
3. ✅ User must be logged in with completed onboarding
4. ✅ User must have identity document (dream self name, traits)

**Steps:**
1. **Navigate to AI Chat:** Bottom tab navigation → "AI Chat"
2. **Send personality switch command:** Type one of these:
   - "Switch my personality to Dream Self"
   - "Change my personality to Weave AI"
   - "Switch to Dream Self mode"
   - "Use Weave AI instead"

**Expected Backend Logs:**
```bash
INFO: 🔧 1 tools available: ['modify_personality']
INFO: 🤖 Calling OpenAI GPT-4o-mini with tools
INFO: 🔧 AI requested 1 tool call(s): ['modify_personality']
INFO: 🔧 Executing tool: modify_personality with args: {'active_personality': 'dream_self'}
INFO: ✅ Tool modify_personality executed successfully
INFO: 🔄 Sending tool results back to OpenAIProvider for wrapping...
INFO: ✅ Tool loop complete. Final response: 187 chars, Total cost: $0.000523
```

**Expected Mobile Behavior:**
1. ✅ Your message appears in chat
2. ✅ Typing indicator shows
3. ✅ AI response confirms action taken: "I've switched you to Dream Self mode..."
4. ✅ **Subsequent messages use the new personality**
5. ✅ Conversation persists (reload app → personality switch remembered)

**Verification:**
- Check Settings → Personality → Active personality should be updated
- Send another message → Response style should match new personality
- Backend DB: `SELECT active_personality FROM user_profiles WHERE id = 'your_id'` should show new value

**What to Watch For:**
- 🔧 Emoji in backend logs = tool execution happening
- Total cost should be ~2x normal (two AI calls: tool detection + wrapping)
- Response should confirm action taken, not provide instructions

---

## Additional Tool Use Examples

### Other Commands to Try:

**Personality Switching:**
```
✅ "Switch to Dream Self"
✅ "Use Weave AI instead"
✅ "Change my coaching personality"
✅ "I want to use Dream Self mode"
```

**Testing Edge Cases:**
```
✅ "Switch to invalid_personality" → AI should call tool with invalid value → Tool returns error → AI explains the error
✅ "What's my current personality?" → AI should describe current setting (no tool call needed)
✅ Multiple personality switches in one conversation → Each switch triggers tool execution
```

---

## Troubleshooting Tool Use

### Issue 1: AI Doesn't Call Tool (Responds with Instructions Instead)

**Symptoms:**
```
User: "Switch to Dream Self"
AI: "To switch personalities, go to Settings → Personality..."  ❌
```

**Possible Causes:**
1. Tool registry empty (no tools registered)
2. Backend not passing tools to AI provider
3. AI model doesn't support function calling

**Debug Steps:**
```bash
# Check backend logs for:
INFO: 🔧 1 tools available: ['modify_personality']  # Should see this

# If you see:
INFO: 🔧 0 tools available  # ❌ Problem: tool_registry empty

# Fix: Check tool_registry.py - ModifyPersonalityTool should be registered
```

### Issue 2: Tool Execution Fails

**Symptoms:**
Backend logs show:
```
ERROR: Tool execution failed: modify_personality: [error message]
```

**Possible Causes:**
1. User ID not found in database
2. Invalid active_personality value
3. Database connection error

**Debug Steps:**
- Check user_profiles table exists and has active_personality column
- Verify user is authenticated (JWT token valid)
- Check tool implementation in `modify_personality_tool.py`

### Issue 3: Tool Executes But AI Doesn't Wrap Response

**Symptoms:**
```
INFO: ✅ Tool modify_personality executed successfully
ERROR: Failed to wrap tool results: [error]
```

**Possible Causes:**
1. Second AI call fails (rate limit, API key issue)
2. Provider error during wrapping

**Debug Steps:**
- Check API keys (OpenAI, Anthropic)
- Check rate limits (may have exhausted daily quota)
- Review fallback response returned to user

---

## Architecture Notes

### Tool Execution Flow (IMPLEMENTED Dec 23, 2025)

**File:** `weave-api/app/services/ai/ai_service.py`

**Changes Implemented:**
1. ✅ Import tool registry (`get_tool_registry()`)
2. ✅ Get tool schemas before AI call
3. ✅ Pass schemas to provider (`tools=tool_schemas`)
4. ✅ Detect tool calls in response (`if response.tool_calls:`)
5. ✅ Execute tools (`tool_registry.execute_tool()`)
6. ✅ Send results back to AI (second `provider.complete()` call)
7. ✅ Return final natural language response

**Completed:** Dec 23, 2025
**Files Modified:** 5 files (base.py, openai_provider.py, anthropic_provider.py, bedrock_provider.py, ai_service.py)

**Circular Import Fix:** Lazy imports in `ai_service.py` to avoid circular dependency with tool registry

**Key Resources:**
- OpenAI Function Calling: https://platform.openai.com/docs/guides/function-calling
- Anthropic Tool Use: https://docs.anthropic.com/en/docs/build-with-claude/tool-use

---

## Summary Table

| Feature | Status | Can Test? | Notes |
|---------|--------|-----------|-------|
| AI Chat UI | ✅ Implemented | ✅ Yes | Full chat interface with streaming |
| Context Enrichment | ✅ Implemented | ✅ Yes | AI references your data |
| Personality Settings | ✅ Implemented | ✅ Yes | Manual switching in Settings |
| Personality Affects AI | ✅ Implemented | ✅ Yes | Different tones per personality |
| Tool Infrastructure | ✅ Implemented | ✅ Yes | Tools exist + AI can call them |
| **AI Tool Use** | ✅ **IMPLEMENTED** | ✅ **YES** | **AI can execute actions!** |

---

## Recommendation

**Ready to Test Full AI Tool Use! 🎉**

1. **Follow Test 4 above** - AI Tool Use (Personality Switching)
   - Say "Switch to Dream Self" in chat
   - AI will actually execute the action
   - Watch backend logs for 🔧 tool execution

2. **Also test:**
   - Test 1-3 (chat, manual personality switching, tone differences)
   - Use Site Map to navigate all screens (Settings → Dev Tools → Site Map)
   - Test context enrichment by checking AI responses reference your data

**What Changed:**
- ✅ AI Tool Use fully integrated (Dec 23, 2025)
- ✅ AI can now execute `modify_personality` tool
- ✅ Multi-turn conversation for tool wrapping
- ✅ Ready for production testing

---

## Quick Test Checklist

**What Works Now:**
- [ ] AI Chat UI accessible from bottom tab
- [ ] Send message → AI responds with streaming
- [ ] AI references my goals, completions, journal entries
- [ ] Switch personality in Settings → Dream Self
- [ ] Switch personality in Settings → Weave AI
- [ ] Select Weave AI preset (Gen Z, Supportive, Concise)
- [ ] Personality affects AI response tone
- [ ] Conversation history persists

**What Doesn't Work:**
- [ ] Say "Change my personality" → AI executes it (not implemented)
- [ ] AI automatically performs actions during chat (not implemented)

---

## Next Steps

**Option A: Test What's Available**
- Use manual testing guide above
- Test context enrichment and personality switching
- Accept that AI can't execute actions yet

**Option B: Implement AI Tool Use**
- Follow implementation plan in `story-6.2-frontend-tool-use-status.md`
- Integrate tool registry into `AIService`
- Test function calling with "Change my personality" command

**Option C: Document Gap and Move Forward**
- Mark Story 6.2 as "Context Enrichment Complete"
- Create Story 6.3 for "AI Tool Use Integration"
- Continue with other features

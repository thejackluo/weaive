# Sprint Change Proposal: AI Tool Use System + Dual AI Personalities (Mini Private MCP Server)
**Date:** 2025-12-23
**Project:** Weavelight
**Epic:** Epic 6 - AI Coaching
**Prepared by:** Bob (Scrum Master) - BMAD Workflow
**Status:** Pending Approval

---

## Executive Summary

This Sprint Change Proposal introduces a foundational architectural pattern for **AI Tool Use** (like OpenAI function calling / Anthropic tool use / MCP protocol) enabling the AI to execute workflows directly in chat.

**Two Major Changes:**

1. **Dual AI Personalities (Story 6.2 Enhancement):** Users can switch between Dream Self (personalized) and Weave AI (general coach) in both chat interface and settings
2. **AI Tool Use System (New Architectural Pattern):** AI can call tools/functions directly in chat to execute actions (personality change, goal creation, breakdown, reflection) - **"mini private MCP server in the app"**

**Scope Classification:** Moderate - Adds AI function calling pattern + enhances Story 6.2
**Impact:** Enables AI to execute workflows IN CHAT (not just route to backend) - natural, conversational tool use
**MVP Status:** CRITICAL - Foundation for AI-powered actions across all epics
**Total Effort:** 4-5 days (32-40 hours) added to Story 6.2
**Cost Impact:** Minimal (~$0.01/tool call, included in existing AI chat budget)

---

## Section 1: Issue Summary

### Change #1: Dual AI Personalities (Story 6.2 Enhancement)

**Problem Statement:**

Story 6.2 currently assumes a single Dream Self personality for all AI chat interactions, but users need:
- **Flexibility to switch personas** - Not all users want hyper-personalized coaching 24/7
- **General coaching option** - Sometimes users need quick advice without deep context
- **Identity evolution support** - Users change over time; personality should adapt

Without dual personalities:
- Users stuck with Dream Self personality even if it doesn't resonate
- No fallback for users who haven't completed onboarding (no Dream Self defined yet)
- Identity changes require full onboarding reset (poor UX)

**Discovery Context:**

User feedback during Story 6.2 review:
> "The dream self personality the one that's talking to the user can be switched with the weave which is a general AI person. So there are two AI personalities that you can have by default the dream self and the general weave AI."

**Requirements:**

1. **Dual Personality System:**
   - **Dream Self** (default) - Personalized, archetype-based, references identity doc
   - **Weave AI** (fallback) - General coach, supportive but less personal

2. **Switching UI (Two Locations):**
   - **Chat Interface:** Header dropdown to switch between Dream Self ↔ Weave AI
   - **Settings Page:** Persistent preference saved to `user_profiles` table

3. **Default Behavior:**
   - New users (no Dream Self doc): Start with **Weave AI**
   - Onboarding complete (Dream Self defined): Switch to **Dream Self**
   - User override: Persists choice across sessions

**Evidence:**
- PRD Epic 1 (Onboarding): Dream Self is created during onboarding, but not required to use app
- PRD Epic 6 (AI Coaching): Currently assumes single personality, needs flexibility
- User feedback: Explicit request for dual personality system

---

### Change #2: AI Tool Use System - "Mini Private MCP Server" (New Architectural Pattern)

**Problem Statement:**

Current AI architecture in Story 6.2 assumes all user messages go directly to Dream Self Advisor for conversational response. However, many user messages require **executing actions**, not just conversation:

**Examples of AI Tool Use:**
- "Change my personality to be more direct" → **AI calls `modify_personality()` tool** → Updates identity doc → Responds naturally
- "Create a new goal: Build a fitness habit" → **AI calls `create_goal()` tool** → Creates structured goal → Confirms to user
- "Break down my goal into weekly milestones" → **AI calls `breakdown_goal()` tool** → Generates subtasks → Shows result
- "Reflect on my week" → **AI calls `analyze_reflection()` tool** → Analyzes data → Shares insights
- "I'm stuck on my workout goal" → **AI responds conversationally** (no tool needed)

Without AI tool use:
- Users must navigate to specific screens for every action (poor UX)
- Natural language commands get generic responses instead of **executing workflows**
- AI can't take actions on behalf of user (limited to conversation only)
- Future AI features require building separate UI flows (not chat-native)

**Discovery Context:**

User feedback during Story 6.2 review:
> "And also what I mean by detection is that the AI can actually execute the workflow not only as a backend service to run but also directly in the chat. So what I mean is this is almost like a tool use a mini private MCP server was in the app and I'm very excited to get this up to the user."

**Architectural Vision:**

**AI Tool Use Pattern (Like OpenAI Function Calling / Anthropic Tool Use / MCP):**
1. **User sends message** → "Change my personality to be more assertive"
2. **AI analyzes message** → Decides to use `modify_personality` tool
3. **AI calls tool** → `modify_personality(new_traits="assertive, direct")`
4. **Tool executes** → Updates `identity_docs` table with new personality traits
5. **Tool returns result** → `{"success": true, "message": "Personality updated"}`
6. **AI wraps response naturally** → "Done! I've made your personality more assertive and direct. You'll notice I'm more straightforward now."

**Why This Pattern Matters:**
- **Natural conversation flow:** AI decides WHEN to use tools (not forced routing)
- **Composable:** AI can chain multiple tools in one response
- **Conversational wrapper:** Tool execution hidden, user sees natural language
- **Industry standard:** Same pattern as OpenAI function calling, Anthropic tool use, LangChain tools, MCP servers
- **Future-proof:** Enables 10+ tools (goal creation, breakdown, reflection, scheduling, analytics, etc.)

**Evidence:**
- Story 6.2 already implements `ContextBuilderService` (middleware pattern) - Tool Use extends this
- Story 1.5.3 established `AIProviderBase` abstraction (provider pattern) - Tool registry uses similar pattern
- AI Tool Use follows same architectural principles (separation of concerns, extensibility)

**Industry Context:**
- **OpenAI Function Calling:** ChatGPT calls functions like `get_weather()`, `send_email()`, `book_appointment()`
- **Anthropic Tool Use:** Claude calls tools directly (same pattern, different API)
- **MCP (Model Context Protocol):** Standard for exposing tools/resources to LLMs (what Jack called "mini private MCP server")
- **LangChain Tools:** Framework for AI tool orchestration
- **GitHub Copilot:** Uses tools for code actions ("Create a function", "Refactor this code")

**Cost Analysis (AI Tool Use vs Regular Chat):**
- **Tool Use Cost:** No additional cost (tool calling is part of normal AI chat)
- **Tool execution cost:** Included in message tokens (tool descriptions in system prompt)
- **Example:**
  - User: "Change my personality" (~5 tokens)
  - AI: Calls `modify_personality()` tool (~20 tokens function call)
  - Tool: Executes, returns result (~50 tokens response)
  - AI: Wraps naturally (~30 tokens final response)
  - **Total: ~105 tokens (same as regular conversational response)**
- **No additional API calls** - Tool use happens within single AI message
- **Well within AI budget** (already accounted for in Story 6.2 chat cost)

---

## Section 2: Impact Analysis

### 2.1 Epic Impact Assessment

**Epic 6: AI Coaching**

✅ **Story 6.2 (ENHANCED):** Contextual AI Responses
- Add dual personality system (Dream Self ↔ Weave AI)
- Add Intent Detection Router service
- Add personality switching UI (chat header + settings)
- Story points: **Increase from 8 pts to 11 pts** (+3 pts for intent router)

**Future Epics Enabled:**

✅ **Epic 2: Goal Management (US-2.1, US-2.2)**
- Natural language goal creation: "Create a goal: Exercise 3x/week" → Goal Creation Module
- AI-powered goal breakdown: "Break this into weekly steps" → Goal Breakdown Module

✅ **Epic 4: Reflection & Journaling (US-4.4)**
- AI weekly insights: "What patterns do you notice?" → Reflection Module

✅ **Epic 6: AI Coaching (US-6.3)**
- AI-powered personality editing: "Make me more direct" → Personality Modification Module

**Dependency Impact:**
- **Story 6.2 UNBLOCKS:** All future AI modules (goal creation, breakdown, reflection, personality editing)
- **Architecture Pattern ENABLES:** Consistent AI module development across all epics

---

### 2.2 Artifact Conflicts

#### PRD Conflicts

✅ **No conflicts identified**

**Enhancements:**
- Story 6.2 fulfills PRD Epic 6 vision: "Conversational interface for AI coach"
- Dual personality system addresses user flexibility needs (Dream Self vs general coaching)
- Intent Router enables future PRD features:
  - Epic 2 US-2.1: "Create goal via natural language"
  - Epic 6 US-6.3: "Edit AI chat responses and personality"
  - Epic 6 US-6.4: "AI weekly insights" (powered by Reflection Module)

**MVP Impact:** ✅ **Enhances MVP** - Foundational pattern for all AI interactions, not scope creep

---

#### Architecture Conflicts

✅ **No conflicts - Additions required**

**Architecture Additions Needed:**

1. **Intent Detection Router Architecture (New Section):**
   ```
   User Message → Intent Detector → Intent Router → Specialized Module → Response
   ```

   **Components:**
   - **IntentDetectorService:** Analyzes user message, returns intent type + confidence
   - **IntentRouter:** Dispatches to appropriate AI module based on detected intent
   - **AI Module Base Class:** Abstract class for all specialized modules

   **Intent Types (Initial Set):**
   - `conversational_chat` - General conversation → Dream Self Advisor
   - `personality_modification` - Change personality → Personality Modification Module
   - `goal_creation` - Create new goal → Goal Creation Module (future)
   - `goal_breakdown` - Break goal into subtasks → Goal Breakdown Module (future)
   - `reflection_request` - Analyze patterns → Reflection Module (future)

   **Intent Detection Strategy:**
   - **Lightweight LLM call** (GPT-4o-mini, <50 tokens) - Fast, cheap, accurate
   - **Pattern matching fallback** - Regex patterns for common phrases
   - **Confidence threshold** - If <80%, route to conversational chat

   **Cost Optimization:**
   - Cache common intents (e.g., "Create a goal" always maps to `goal_creation`)
   - Skip intent detection for short messages (<5 words, likely conversational)
   - Use GPT-4o-mini (cheapest model) for intent detection

2. **Dual Personality Architecture (Story 6.2):**
   - Add `active_personality` column to `user_profiles` table:
     ```sql
     ALTER TABLE user_profiles ADD COLUMN active_personality TEXT
       CHECK (active_personality IN ('dream_self', 'weave_ai'))
       DEFAULT 'weave_ai';
     ```
   - **Dream Self:** Load personality from `identity_docs` (type = 'dream_self')
   - **Weave AI:** Use default coach persona (supportive, encouraging, general advice)
   - **Switching Logic:**
     - If `active_personality = 'dream_self'` → inject Dream Self personality into system prompt
     - If `active_personality = 'weave_ai'` → use default coach prompt
     - If Dream Self doc doesn't exist → fallback to Weave AI (can't use undefined persona)

**No conflicts with existing architecture** (state management, AI service abstraction, cost tracking remain unchanged)

---

#### UX/UI Specification Conflicts

✅ **No conflicts - UI additions required**

**UX Additions Needed:**

1. **Chat Interface Personality Switcher:**
   - **Location:** Header of AI Chat screen (right side)
   - **UI Element:** Dropdown button showing current personality ("Dream Self" or "Weave AI")
   - **Behavior:**
     - Tap dropdown → Show 2 options: "Dream Self", "Weave AI"
     - Select option → Switch personality immediately, show confirmation toast
     - Persist choice to `user_profiles.active_personality` (applies to future sessions)
   - **Visual Indicator:** Icon changes based on personality:
     - Dream Self: Personalized avatar icon (archetype-based)
     - Weave AI: Generic app logo icon

2. **Settings Page Personality Preference:**
   - **Location:** Settings → AI Preferences section
   - **UI Element:** Radio buttons or toggle
   - **Labels:**
     - "Dream Self" - "Personalized coaching based on your identity"
     - "Weave AI" - "General supportive coaching"
   - **Behavior:** Updates `user_profiles.active_personality` column

3. **Intent Detection Loading State (Hidden):**
   - **User perspective:** Seamless (no visible loading state for intent detection)
   - **Technical:** Intent detection happens in <200ms (non-blocking)
   - **Fallback:** If intent detection fails, route to conversational chat (graceful degradation)

**Design System Impact:**
- New component: `PersonalitySwitcher` (dropdown with personality options)
- Update `ChatHeader` component to include PersonalitySwitcher
- Update `SettingsScreen` to include AI Preferences section

---

## Section 3: Recommended Approach

### Selected Path: **Option 1 - Direct Adjustment**

**Rationale:**

Both changes are **additive enhancements** to Story 6.2 and establish a foundational pattern for future AI modules. No rollback or MVP reduction needed. Direct implementation is the most efficient path.

**Why Not Rollback (Option 2)?**
- Story 6.2 not yet implemented (still `ready-for-dev`)
- Changes are design improvements, not fixes for completed work

**Why Not MVP Review (Option 3)?**
- MVP scope is **enhanced, not expanded**
- Intent Router is infrastructure that enables future features (doesn't add scope itself)
- Dual personality system is user flexibility (MVP quality improvement)

**Effort Estimate:** **Moderate**
- Dual personality system: 1 day (8 hours)
- Intent Detection Router: 2 days (16 hours)
- UI updates (chat header + settings): 1 day (8 hours)
- **Total: 3-4 days (24-32 hours)** added to Story 6.2

**Risk Level:** **Low**
- Intent detection is lightweight (GPT-4o-mini, <50 tokens, <200ms)
- Dual personality system is simple database flag + conditional prompt injection
- No external dependencies beyond existing AI service

---

## Section 4: Detailed Change Proposals

### Change Proposal 1: Dual AI Personalities (Story 6.2 Enhancement)

**Epic:** Epic 6 - AI Coaching
**Story ID:** 6.2 (ENHANCED)
**Priority:** M (Must Have)
**Story Points:** 11 (increased from 8, +3 pts for intent router)

#### Enhanced Acceptance Criteria:

**Backend (Dual Personality System):**

- [ ] **Database Schema:**
  ```sql
  -- Add active_personality column to user_profiles
  ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS active_personality TEXT
    CHECK (active_personality IN ('dream_self', 'weave_ai'))
    DEFAULT 'weave_ai';

  COMMENT ON COLUMN user_profiles.active_personality IS 'Active AI personality: dream_self (personalized) or weave_ai (general coach)';
  ```

- [ ] **Personality Loading Service:**
  - Create `PersonalityService` in `weave-api/app/services/personality_service.py`
  - Method: `get_active_personality(user_id) -> dict`
    - If `active_personality = 'dream_self'` → Load from `identity_docs` (type = 'dream_self')
    - If `active_personality = 'weave_ai'` → Return default Weave AI persona
    - If Dream Self doc missing → Fallback to Weave AI (graceful degradation)
  - Return format:
    ```python
    {
      "personality_type": "dream_self" | "weave_ai",
      "name": "Alex the Disciplined" | "Weave",
      "traits": ["supportive", "analytical"] | ["encouraging", "general"],
      "speaking_style": "Direct but encouraging" | "Supportive and motivating"
    }
    ```

- [ ] **Update AIService Context Injection:**
  - Modify `AIService.generate()` to accept `personality: dict` parameter
  - Inject personality into system prompt:
    ```
    You are {personality.name}, a {personality.personality_type} coach.
    Your traits: {personality.traits}
    Your speaking style: {personality.speaking_style}

    {context injection from Story 6.2}
    ```

- [ ] **API Endpoint Updates:**
  - `POST /api/ai-chat/messages` - Load active personality before calling AIService
  - `PATCH /api/user-profiles/personality` - Switch active personality
    - Request: `{ "active_personality": "dream_self" | "weave_ai" }`
    - Response: `{ "data": { "active_personality": "dream_self" }, "meta": {...} }`

**Frontend (Personality Switching UI):**

- [ ] **Chat Header Personality Switcher:**
  - Create `PersonalitySwitcher` component in `weave-mobile/src/components/chat/PersonalitySwitcher.tsx`
  - UI: Dropdown button showing current personality with icon
  - Options: "Dream Self" (avatar icon) | "Weave AI" (app logo)
  - Behavior:
    - Tap option → Call `PATCH /api/user-profiles/personality`
    - Show confirmation toast: "Switched to {personality}"
    - Refresh chat context (reload personality)

- [ ] **Settings Page AI Preferences:**
  - Add "AI Preferences" section to Settings screen
  - Radio buttons: "Dream Self" | "Weave AI"
  - Description text under each option explaining difference
  - Behavior: Same API call as chat header switcher

- [ ] **State Management:**
  - Store `activePersonality` in `useAuthStore()` (Zustand)
  - Update on personality switch (persist across app sessions)
  - Read from `user_profiles.active_personality` on login

**Testing:**

- [ ] Test: User with Dream Self doc → Switches to Weave AI → AI response uses general persona
- [ ] Test: User without Dream Self doc → Defaults to Weave AI (fallback)
- [ ] Test: User switches personality in chat header → Preference persists after app restart
- [ ] Test: User switches personality in settings → Chat header updates immediately

---

### Change Proposal 2: AI Tool Use System - "Mini Private MCP Server" (New Architectural Pattern)

**Epic:** Epic 6 - AI Coaching (Foundation for Epic 2, 4, 6 future stories)
**Story ID:** 6.2 (ENHANCED)
**Priority:** M (Must Have)
**Story Points:** Included in 12 pts total (+1 pt for tool use complexity)

#### New Architecture Pattern:

**AI Tool Use Flow (Like OpenAI Function Calling / Anthropic Tool Use):**
```
1. User Message → "Change my personality to be more direct"
2. AI Service receives message + tool definitions in system prompt
3. AI decides to call tool → { "tool": "modify_personality", "params": {"new_traits": "assertive, direct"} }
4. Tool Registry executes tool → modify_personality(user_id, new_traits="assertive, direct")
5. Tool updates identity_docs table → Returns {"success": true, "message": "Personality updated"}
6. AI wraps result naturally → "Done! I've made your personality more assertive and direct."
```

**Backend Implementation:**

- [ ] **Tool Registry (Core Pattern):**
  - Create `weave-api/app/services/tools/registry.py`
  - Class: `ToolRegistry`
  - Method: `get_tool_definitions() -> list[dict]`
    - Returns OpenAI/Anthropic-compatible tool schemas
    - Example schema:
      ```python
      {
        "name": "modify_personality",
        "description": "Updates the user's AI personality traits (Dream Self)",
        "parameters": {
          "type": "object",
          "properties": {
            "new_traits": {
              "type": "string",
              "description": "Comma-separated personality traits (e.g., 'assertive, direct, supportive')"
            }
          },
          "required": ["new_traits"]
        }
      }
      ```
  - Method: `execute_tool(tool_name: str, params: dict, user_id: UUID) -> dict`
    - Looks up tool by name in registry
    - Executes tool with params + user_id
    - Returns structured result: `{"success": bool, "message": str, "data": dict}`

- [ ] **AI Service Enhancement (Tool Use Integration):**
  - Update `weave-api/app/services/ai/ai_service.py`
  - Add `tools: list[dict]` parameter to `generate()` method
  - **If using Anthropic (Claude):**
    - Pass tools to `anthropic.messages.create(tools=tools)`
    - Detect `tool_use` content blocks in response
    - Execute tools via `ToolRegistry.execute_tool()`
    - Send tool results back to AI for natural language wrapping
  - **If using OpenAI (GPT-4o):**
    - Pass tools to `openai.chat.completions.create(tools=tools)`
    - Detect `function_call` in response
    - Execute tools via `ToolRegistry.execute_tool()`
    - Send tool results back to AI for natural language wrapping
  - **Multi-turn conversation:** AI can call multiple tools, then respond naturally

- [ ] **Tool Base Class (Extensibility Pattern):**
  - Create `weave-api/app/services/tools/base.py`
  - Abstract class: `ToolBase`
  - Required methods:
    ```python
    class ToolBase(ABC):
        @abstractmethod
        async def execute(self, user_id: UUID, params: dict) -> dict:
            """Execute the tool with given params."""
            pass

        @abstractmethod
        def get_schema(self) -> dict:
            """Return OpenAI/Anthropic-compatible tool schema."""
            pass

        @abstractmethod
        def get_name(self) -> str:
            """Return tool name."""
            pass
    ```

- [ ] **Personality Modification Tool (Initial Implementation):**
  - Create `weave-api/app/services/tools/modify_personality.py`
  - Class: `ModifyPersonalityTool(ToolBase)`
  - Method: `execute(user_id, params) -> dict`
    - Extract `new_traits` from params
    - Load current Dream Self personality from `identity_docs`
    - Update personality document with new traits
    - Save to `identity_docs` table
    - Return: `{"success": true, "message": "Personality updated to: {new_traits}"}`
  - Method: `get_schema() -> dict`
    - Returns tool definition (see ToolRegistry example above)

- [ ] **Update Chat API Endpoint:**
  - Modify `POST /api/ai-chat/messages` handler
  - **Flow:**
    1. Load tool definitions from `ToolRegistry.get_tool_definitions()`
    2. Call `AIService.generate()` with `tools=tool_definitions`
    3. If AI returns tool call → Execute via `ToolRegistry.execute_tool()`
    4. Send tool result back to AI → Get natural language wrapper
    5. Return final response to user (same format as Story 6.2)
  - **Feature flag:** `enable_tool_use` (default: true, can disable for testing)

**Testing:**

- [ ] Test: User sends "Change my personality to be more direct" → AI calls `modify_personality` → Identity doc updated → Natural response returned
- [ ] Test: User sends "I'm stuck on my goal" → AI responds conversationally (no tool call needed)
- [ ] Test: User sends "Create a goal: Morning workout" → AI calls `create_goal` tool (future, returns "Tool not implemented yet" stub)
- [ ] Test: Tool execution fails → AI handles error gracefully ("Sorry, I couldn't update your personality right now")
- [ ] Test: AI calls multiple tools in one response → Both tools execute, AI wraps results naturally
- [ ] Test: Tool execution logged to `ai_runs` table with tool name + cost tracking

**Technical Notes:**

**Why AI Tool Use (Not Intent Detection Router)?**
- **User feedback:** Jack explicitly requested tool use ("AI can execute the workflow directly in the chat")
- **Natural conversation:** AI decides WHEN to use tools (not forced routing)
- **Industry standard:** OpenAI, Anthropic, LangChain, MCP all use this pattern
- **Composable:** AI can chain tools ("Create goal X, then break it down")
- **Simpler architecture:** No separate intent detector, AI does intent + execution in one pass

**OpenAI vs Anthropic Tool Use:**
- **OpenAI:** `function_call` response type (legacy), now uses `tool_calls` (preferred)
- **Anthropic:** `tool_use` content blocks (native Claude 3+ support)
- **Implementation:** Abstract both behind `ToolRegistry` (provider-agnostic)
- **Fallback:** If tool calling not supported by model, fall back to conversational mode

**Future Tools (Enabled by This Pattern):**
1. **`create_goal(title, description, target_date)`** - Create structured goal (Epic 2 US-2.1)
2. **`breakdown_goal(goal_id, num_subtasks)`** - Generate subtasks (Epic 2 US-2.2)
3. **`analyze_reflection(timeframe, focus_areas)`** - Analyze patterns (Epic 4 US-4.4, Epic 6 US-6.4)
4. **`suggest_goals(user_context)`** - Recommend goals (future)
5. **`optimize_habit(bind_id, current_performance)`** - Suggest improvements (future)
6. **`schedule_reminder(bind_id, time, frequency)`** - Set reminders (future)

**Cost Projections (10K Users, MVP):**
- **No additional cost** - Tool calling is part of normal AI chat tokens
- Tool definitions included in system prompt (~200 tokens per message)
- Tool execution results included in conversation (~50-100 tokens per tool call)
- **Example message cost with tool use:**
  - User: "Change my personality" (~5 tokens)
  - System prompt with tool definitions (~200 tokens)
  - AI: Calls tool (~20 tokens function call)
  - Tool: Returns result (~50 tokens)
  - AI: Wraps naturally (~30 tokens)
  - **Total: ~305 tokens (vs ~250 tokens for regular chat)**
- **Marginal cost increase: ~20% more tokens when tools used**
- Still well within AI budget (already accounted for in Story 6.2 chat cost)

---

## Section 5: Implementation Handoff

### Change Scope Classification

**Scope:** **Moderate**

**Justification:**
- Changes are additive enhancements to Story 6.2
- Establishes foundational pattern for future AI modules (not scope creep)
- Requires new architecture pattern + database changes
- Moderate complexity: 3-4 days effort added to Story 6.2

### Handoff Plan

**Route to:** Development Team (Direct Implementation)

**Deliverables:**
1. Enhanced Story 6.2 specification (dual personality + AI tool use system)
2. Database migration:
   - Add `active_personality` column to `user_profiles`
3. Backend services:
   - `PersonalityService` (load active personality)
   - `ToolRegistry` (register and execute tools)
   - `ToolBase` (abstract class for all tools)
   - `ModifyPersonalityTool` (initial tool implementation)
   - Enhanced `AIService` with tool use support (OpenAI + Anthropic)
4. Frontend components:
   - `PersonalitySwitcher` (chat header + settings)
5. Architecture documentation:
   - AI Tool Use pattern ("mini private MCP server")
   - Tool development guide
6. Updated test design checklist (Story 6.2)

**Implementation Sequence:**

1. **Dual Personality System:** 1 day (8 hours)
   - Database migration: Add `active_personality` column
   - Backend: Create `PersonalityService`
   - Backend: Update `AIService.generate()` to inject personality
   - API: Add `PATCH /api/user-profiles/personality` endpoint
   - Tests: Personality switching, fallback scenarios

2. **AI Tool Use System:** 2-3 days (16-24 hours)
   - Backend: Create `ToolRegistry` (tool definitions + execution)
   - Backend: Create `ToolBase` abstract class
   - Backend: Create `ModifyPersonalityTool` (initial implementation)
   - Backend: Enhance `AIService` with tool use support (OpenAI + Anthropic APIs)
   - Backend: Update `POST /api/ai-chat/messages` to use tool calling
   - Tests: Tool execution, error handling, multi-tool chains, logging

3. **Frontend UI:** 1 day (8 hours)
   - Create `PersonalitySwitcher` component
   - Update `ChatHeader` with PersonalitySwitcher
   - Update `SettingsScreen` with AI Preferences section
   - State management: Store `activePersonality` in Zustand
   - Tests: UI switching, persistence, visual indicators

**Success Criteria:**
- ✅ Users can switch between Dream Self and Weave AI in chat header
- ✅ Users can switch personality in settings page (persists across sessions)
- ✅ Dream Self personality loads from `identity_docs` correctly
- ✅ Weave AI uses default coach persona
- ✅ AI calls `modify_personality` tool when user requests personality change
- ✅ Tool executes, updates `identity_docs`, AI wraps response naturally
- ✅ AI responds conversationally when no tool needed ("I'm stuck on my goal")
- ✅ Tool execution logged to `ai_runs` table with tool name + cost tracking
- ✅ Error handling: Tool failures don't break chat, AI handles gracefully
- ✅ All tests pass (unit + integration + E2E)

### Estimated Timeline

- **Dual Personality System:** 1 day (8 hours)
- **AI Tool Use System:** 2-3 days (16-24 hours)
- **Frontend UI:** 1 day (8 hours)
- **Total:** **4-5 days (32-40 hours)** added to Story 6.2

**Story 6.2 Total Effort:** 8 pts (original) + 4 pts (enhancement) = **12 story points**

**No sprint delay expected** - Additive enhancement to existing story scope.

---

## Section 6: Cost Impact Analysis

### AI Budget Impact (10K Users at MVP)

| Service | Provider | Unit Cost | Usage Projection | Monthly Cost | Annual Cost |
|---------|----------|-----------|------------------|--------------|-------------|
| **AI Tool Use (extra tokens)** | Claude/GPT-4o | Included in chat | ~20% more tokens when tools used | **~$0/mo** | **~$0/yr** |
| **Tool Definitions** | - | - | ~200 tokens/message system prompt | **Included** | **Included** |
| **Total Added Cost** | - | - | - | **~$0/mo** | **~$0/yr** |

**Budget Headroom:** $224/month remaining (ZERO additional cost, tool use is part of existing chat budget ✅)

**Why No Additional Cost:**
- Tool calling is native to OpenAI/Anthropic APIs (no extra charge)
- Tool definitions included in system prompt (~200 tokens, part of normal message cost)
- Tool execution happens server-side (no API call, just database operations)
- AI wrapping of tool results included in response tokens (part of normal chat cost)

### Cost Optimization Strategies

**If message costs increase:**
1. **Lazy load tools** - Only include tool definitions when conversation context suggests user might use them
2. **Cache tool definitions** - Store in AI context cache (Anthropic supports prompt caching)
3. **Optimize tool schemas** - Use concise descriptions to minimize token usage

---

## Section 7: Artifacts Modified Summary

### Documents Requiring Updates

| Artifact | Update Type | Specific Changes |
|----------|-------------|------------------|
| **docs/stories/6-2-contextual-ai-responses.md** | Modify | Add dual personality system, AI tool use system, UI components |
| **docs/prd/epic-6-ai-coaching.md** | Modify | Update US-6.2 with dual personality requirement + tool use pattern |
| **docs/architecture/core-architectural-decisions.md** | Add Section | AI Tool Use Architecture ("mini private MCP server"), Tool Registry Pattern |
| **docs/test-design.md** | Modify | Add test cases for tool execution, personality switching |
| **docs/dev/** | Create | `ai-tool-development-guide.md` - How to build new tools |
| **docs/architecture/implementation-patterns-consistency-rules.md** | Minor | Note tool use pattern for future AI-powered actions |

### Stories Affected

| Story | Status | Change Type | Impact |
|-------|--------|-------------|--------|
| **6.2** | ENHANCED | Scope Increase | From 8 pts to 12 pts (+4 pts for tool use system + dual personality) |

### New Architectural Patterns Created

| Pattern | Purpose | Future Use Cases |
|---------|---------|------------------|
| **AI Tool Use System** | AI calls tools/functions directly in chat (OpenAI/Anthropic function calling) | Goal creation, breakdown, reflection, personality editing, scheduling, analytics |
| **Tool Registry + ToolBase** | Register and execute tools with OpenAI/Anthropic-compatible schemas | 10+ future tools (create_goal, breakdown_goal, analyze_reflection, etc.) |
| **Dual Personality System** | Switch between personalized (Dream Self) and general (Weave AI) coaching | Identity evolution support, user flexibility |

---

## Approval & Next Steps

**Prepared by:** Bob (Scrum Master) - BMAD Workflow
**Approval Status:** ⏳ **Pending**

**User Approval Required:**

Please review this Sprint Change Proposal and confirm:

1. ✅ **Dual Personality System** (Dream Self ↔ Weave AI with chat header + settings switcher) is approved
2. ✅ **AI Tool Use System** ("mini private MCP server" - AI executes workflows directly in chat like OpenAI/Anthropic function calling) is approved
3. ✅ **Story 6.2 Enhancement** (from 8 pts to 12 pts, +4-5 days effort) is acceptable
4. ✅ **Cost impact** (~$0/month, tool use included in existing chat budget) is acceptable
5. ✅ **Architecture pattern** (Tool Registry + ToolBase for future extensibility) is approved

**Post-Approval Actions:**
- [ ] Update `docs/stories/6-2-contextual-ai-responses.md` with dual personality + AI tool use system
- [ ] Update `docs/prd/epic-6-ai-coaching.md` with US-6.2 enhancements (tool use pattern)
- [ ] Add AI Tool Use architecture section to `docs/architecture/core-architectural-decisions.md`
- [ ] Create Tool Development Guide in `docs/dev/ai-tool-development-guide.md`
- [ ] Update `docs/test-design.md` with tool execution test cases
- [ ] Update Story 6.2 task breakdown with new implementation tasks
- [ ] Assign to development team for immediate execution (after Story 6.2 approval)

---

**End of Sprint Change Proposal**

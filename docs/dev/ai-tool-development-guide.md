# AI Tool Development Guide

**Status:** ✅ Active (Story 6.2 - AI Tool Use System)
**Last Updated:** 2025-12-23
**Related:** Sprint Change Proposal `sprint-change-proposal-intent-router-2025-12-23.md`

---

## Overview

The **AI Tool Use System** (introduced in Story 6.2) enables the AI to execute actions directly in chat by calling tools/functions - like a "mini private MCP server" in the app.

**Industry Standard:** Follows OpenAI function calling / Anthropic tool use / MCP (Model Context Protocol) patterns

**Example:**
```
User: "Change my personality to be more direct"
→ AI calls modify_personality(new_traits="assertive, direct")
→ Tool updates identity_docs table
→ AI responds naturally: "Done! I've made you more assertive and direct."
```

**Why This Matters:**
- **Natural UX:** Users say "Create a goal" instead of navigating to Goal Creation screen
- **Composable:** AI can chain tools ("Create goal X, then break it down")
- **Extensible:** Add new tools without changing AI service logic
- **Future-proof:** Same pattern for 10+ tools (goal creation, breakdown, reflection, etc.)

---

## Architecture Overview

### Flow Diagram

```
User Message
    ↓
POST /api/ai-chat/messages
    ↓
1. Load tool definitions from ToolRegistry
    ↓
2. Call AIService.generate(message, tools=tool_definitions)
    ↓
3. AI decides whether to call tool(s)
    ↓
4. If tool call → ToolRegistry.execute_tool(tool_name, params, user_id)
    ↓
5. Tool executes (updates DB, calls APIs, etc.)
    ↓
6. Tool returns result to AI
    ↓
7. AI wraps result naturally ("Done! I've updated your...")
    ↓
Response to User
```

### Core Components

| Component | Purpose | Location |
|-----------|---------|----------|
| **ToolRegistry** | Registers tools, executes tool calls | `weave-api/app/services/tools/registry.py` |
| **ToolBase** | Abstract class for all tools | `weave-api/app/services/tools/base.py` |
| **Individual Tools** | Concrete tool implementations | `weave-api/app/services/tools/*.py` |
| **AIService (Enhanced)** | Handles tool calling with OpenAI/Anthropic | `weave-api/app/services/ai/ai_service.py` |

---

## Creating a New Tool

### Step 1: Define Your Tool Class

Create a new file in `weave-api/app/services/tools/`:

```python
# weave-api/app/services/tools/create_goal.py
from uuid import UUID
from app.services.tools.base import ToolBase
from app.models import Goal
from app.core.database import get_supabase

class CreateGoalTool(ToolBase):
    """Creates a new goal from natural language description."""

    def get_name(self) -> str:
        return "create_goal"

    def get_schema(self) -> dict:
        """Return OpenAI/Anthropic-compatible tool schema."""
        return {
            "name": "create_goal",
            "description": "Create a new goal for the user with a title and optional description",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "The goal title (e.g., 'Build consistent workout habit')"
                    },
                    "description": {
                        "type": "string",
                        "description": "Optional detailed description of the goal"
                    },
                    "target_date": {
                        "type": "string",
                        "format": "date",
                        "description": "Optional target completion date (YYYY-MM-DD format)"
                    }
                },
                "required": ["title"]
            }
        }

    async def execute(self, user_id: UUID, params: dict) -> dict:
        """Execute the tool - create the goal."""
        try:
            # Extract params
            title = params.get("title")
            description = params.get("description", "")
            target_date = params.get("target_date")

            # Validate (max 3 active goals)
            supabase = get_supabase()
            active_goals = supabase.table("goals")\
                .select("id")\
                .eq("user_id", str(user_id))\
                .eq("status", "active")\
                .is_("deleted_at", "null")\
                .execute()

            if len(active_goals.data) >= 3:
                return {
                    "success": False,
                    "message": "You already have 3 active goals. Complete or archive one before creating a new goal.",
                    "data": {"error_code": "GOAL_LIMIT_REACHED"}
                }

            # Create goal
            new_goal = supabase.table("goals").insert({
                "user_id": str(user_id),
                "title": title,
                "description": description,
                "target_date": target_date,
                "status": "active"
            }).execute()

            return {
                "success": True,
                "message": f"Goal created: {title}",
                "data": {
                    "goal_id": new_goal.data[0]["id"],
                    "title": title
                }
            }

        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to create goal: {str(e)}",
                "data": {"error": str(e)}
            }
```

---

### Step 2: Register Your Tool

Add your tool to the `ToolRegistry`:

```python
# weave-api/app/services/tools/registry.py
from app.services.tools.base import ToolBase
from app.services.tools.modify_personality import ModifyPersonalityTool
from app.services.tools.create_goal import CreateGoalTool  # NEW
from uuid import UUID

class ToolRegistry:
    """Central registry for all AI tools."""

    def __init__(self):
        self.tools: dict[str, ToolBase] = {
            "modify_personality": ModifyPersonalityTool(),
            "create_goal": CreateGoalTool(),  # NEW - Add here
        }

    def get_tool_definitions(self) -> list[dict]:
        """Get all tool schemas for AI providers."""
        return [tool.get_schema() for tool in self.tools.values()]

    async def execute_tool(self, tool_name: str, params: dict, user_id: UUID) -> dict:
        """Execute a tool by name."""
        if tool_name not in self.tools:
            return {
                "success": False,
                "message": f"Tool '{tool_name}' not found",
                "data": {"available_tools": list(self.tools.keys())}
            }

        tool = self.tools[tool_name]
        return await tool.execute(user_id, params)
```

---

### Step 3: Test Your Tool

Create tests in `weave-api/tests/test_tools/`:

```python
# weave-api/tests/test_tools/test_create_goal.py
import pytest
from app.services.tools.create_goal import CreateGoalTool

@pytest.mark.asyncio
async def test_create_goal_success(test_user_id):
    """Test successful goal creation."""
    tool = CreateGoalTool()

    result = await tool.execute(
        user_id=test_user_id,
        params={"title": "Morning workout routine"}
    )

    assert result["success"] is True
    assert "Goal created" in result["message"]
    assert result["data"]["title"] == "Morning workout routine"

@pytest.mark.asyncio
async def test_create_goal_limit_reached(test_user_id_with_3_goals):
    """Test goal creation fails when limit reached."""
    tool = CreateGoalTool()

    result = await tool.execute(
        user_id=test_user_id_with_3_goals,
        params={"title": "Another goal"}
    )

    assert result["success"] is False
    assert "GOAL_LIMIT_REACHED" in result["data"]["error_code"]
```

---

### Step 4: Test AI Tool Calling

Integration test to verify AI actually calls your tool:

```python
# weave-api/tests/test_ai_chat_integration.py
@pytest.mark.asyncio
async def test_ai_calls_create_goal_tool(test_client, auth_headers):
    """Test AI calls create_goal tool when user requests it."""

    response = test_client.post(
        "/api/ai-chat/messages",
        json={"message": "Create a new goal: Morning workout routine"},
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()["data"]

    # Verify AI called the tool and goal was created
    assert "Goal created" in data["response"] or "Morning workout" in data["response"]

    # Verify goal exists in database
    goals = test_client.get("/api/goals", headers=auth_headers).json()["data"]
    assert any(g["title"] == "Morning workout routine" for g in goals)
```

---

## Tool Schema Guidelines

### Schema Best Practices

1. **Clear descriptions:**
   ```python
   # ❌ BAD
   "description": "Creates goal"

   # ✅ GOOD
   "description": "Create a new goal for the user with a title and optional description. Users can have max 3 active goals."
   ```

2. **Explicit parameter types:**
   ```python
   "title": {
       "type": "string",
       "description": "The goal title (e.g., 'Build consistent workout habit')"
   }
   ```

3. **Required vs optional:**
   ```python
   "required": ["title"],  # Only required params
   "properties": {
       "title": {...},         # Required
       "description": {...},   # Optional (not in required list)
   }
   ```

4. **Examples in descriptions:**
   ```python
   "new_traits": {
       "type": "string",
       "description": "Comma-separated personality traits (e.g., 'assertive, direct, supportive')"
   }
   ```

### Tool Schema Format (OpenAI/Anthropic Compatible)

```python
{
    "name": "tool_name",
    "description": "Clear description of what this tool does",
    "parameters": {
        "type": "object",
        "properties": {
            "param_name": {
                "type": "string" | "number" | "boolean" | "array" | "object",
                "description": "Clear description with examples",
                "enum": ["option1", "option2"],  # Optional: restrict to specific values
                "format": "date" | "uuid" | "email"  # Optional: semantic type hints
            }
        },
        "required": ["param1", "param2"]
    }
}
```

---

## Tool Implementation Patterns

### Pattern 1: Data Modification Tool

**Use Case:** Update/create/delete database records

**Example:** `modify_personality`, `create_goal`, `delete_goal`

```python
async def execute(self, user_id: UUID, params: dict) -> dict:
    try:
        # 1. Validate inputs
        if not params.get("required_field"):
            return {"success": False, "message": "Missing required field"}

        # 2. Check permissions/limits (e.g., max 3 goals)
        # ... validation logic ...

        # 3. Execute database operation
        result = supabase.table("table_name").insert({...}).execute()

        # 4. Return success
        return {
            "success": True,
            "message": "Operation completed",
            "data": result.data[0]
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed: {str(e)}",
            "data": {"error": str(e)}
        }
```

---

### Pattern 2: Data Retrieval Tool

**Use Case:** Fetch/analyze data for user

**Example:** `get_goal_progress`, `analyze_week_patterns`

```python
async def execute(self, user_id: UUID, params: dict) -> dict:
    try:
        # 1. Extract filters from params
        timeframe = params.get("timeframe", "week")

        # 2. Query database
        data = supabase.table("completions")\
            .select("*")\
            .eq("user_id", str(user_id))\
            .gte("completed_at", calculate_start_date(timeframe))\
            .execute()

        # 3. Process/analyze data
        stats = calculate_statistics(data.data)

        # 4. Return structured result
        return {
            "success": True,
            "message": f"Analyzed {len(data.data)} completions from last {timeframe}",
            "data": stats
        }
    except Exception as e:
        return {"success": False, "message": str(e)}
```

---

### Pattern 3: AI-Powered Analysis Tool

**Use Case:** Call another AI service for complex analysis

**Example:** `analyze_journal_patterns`, `suggest_habit_optimizations`

```python
async def execute(self, user_id: UUID, params: dict) -> dict:
    try:
        # 1. Gather data from database
        journal_entries = fetch_journal_entries(user_id, days=30)

        # 2. Call AI for analysis
        ai_service = AIService()
        analysis = await ai_service.generate(
            user_id=user_id,
            module="pattern_analysis",
            prompt=f"Analyze these journal entries: {journal_entries}",
            model="gpt-4o-mini"
        )

        # 3. Return AI insights
        return {
            "success": True,
            "message": "Pattern analysis complete",
            "data": {
                "insights": analysis["text"],
                "patterns_found": parse_patterns(analysis["text"])
            }
        }
    except Exception as e:
        return {"success": False, "message": str(e)}
```

---

## Error Handling

### Graceful Failure

Tools MUST return structured results even on failure:

```python
# ❌ BAD - Raises exception (breaks AI conversation)
async def execute(self, user_id: UUID, params: dict) -> dict:
    result = supabase.table("goals").insert({...}).execute()
    if not result.data:
        raise ValueError("Goal creation failed")

# ✅ GOOD - Returns error structure (AI can handle gracefully)
async def execute(self, user_id: UUID, params: dict) -> dict:
    try:
        result = supabase.table("goals").insert({...}).execute()
        if not result.data:
            return {
                "success": False,
                "message": "Goal creation failed - database error",
                "data": {"error_code": "DB_INSERT_FAILED"}
            }
        return {"success": True, "message": "Goal created", "data": result.data[0]}
    except Exception as e:
        return {
            "success": False,
            "message": f"Unexpected error: {str(e)}",
            "data": {"error": str(e)}
        }
```

### AI Error Handling

When tool execution fails, AI will naturally wrap the error:

**Tool returns:**
```python
{"success": False, "message": "You already have 3 active goals"}
```

**AI responds:**
```
"I tried to create that goal, but you already have 3 active goals. Would you like to complete or archive one of your existing goals first?"
```

---

## Testing Tools

### Unit Tests

Test tool logic in isolation (mock database):

```python
@pytest.mark.asyncio
async def test_tool_success(test_user_id, mock_supabase):
    tool = MyTool()
    result = await tool.execute(test_user_id, {"param": "value"})

    assert result["success"] is True
    assert "expected message" in result["message"]
```

### Integration Tests

Test tool execution through ToolRegistry:

```python
@pytest.mark.asyncio
async def test_tool_registry_execution(test_user_id):
    registry = ToolRegistry()
    result = await registry.execute_tool(
        tool_name="create_goal",
        params={"title": "Test Goal"},
        user_id=test_user_id
    )

    assert result["success"] is True
```

### End-to-End Tests

Test AI actually calls your tool:

```python
@pytest.mark.asyncio
async def test_ai_calls_tool_e2e(test_client, auth_headers):
    response = test_client.post(
        "/api/ai-chat/messages",
        json={"message": "Create a new goal: Morning workout"},
        headers=auth_headers
    )

    assert response.status_code == 200
    # Verify tool was called and action was performed
    # (Check database, verify response mentions goal creation)
```

---

## Tool Naming Conventions

| Tool Name | Purpose | Verb Pattern |
|-----------|---------|--------------|
| `create_goal` | Create new goal | `create_*` |
| `delete_goal` | Delete existing goal | `delete_*` |
| `modify_personality` | Update personality | `modify_*` |
| `analyze_reflection` | Analyze data | `analyze_*` |
| `get_goal_progress` | Retrieve data | `get_*` |
| `breakdown_goal` | Transform data | `breakdown_*` |

**Use snake_case** for tool names (consistent with API/database naming)

---

## Cost Tracking

### Log Tool Calls to ai_runs

Every tool execution should be logged:

```python
# In ToolRegistry.execute_tool()
await log_ai_run(
    user_id=user_id,
    module=f"tool:{tool_name}",
    provider="tool_execution",
    tokens_used=0,  # No tokens for tool execution itself
    cost_usd=0.0,   # Tool execution is server-side (no API cost)
    context_used=True,
    metadata={
        "tool_name": tool_name,
        "params": params,
        "execution_time_ms": execution_time
    }
)
```

### Tool Call Tracking

Monitor tool usage in `ai_runs` table:

```sql
-- Query tool usage stats
SELECT
    module,
    COUNT(*) as calls,
    AVG(execution_time_ms) as avg_execution_time
FROM ai_runs
WHERE module LIKE 'tool:%'
GROUP BY module
ORDER BY calls DESC;
```

---

## Security Considerations

### 1. Always Validate User Ownership

```python
# ✅ GOOD - Verify user owns the goal
goal = supabase.table("goals")\
    .select("*")\
    .eq("id", goal_id)\
    .eq("user_id", str(user_id))\  # CRITICAL
    .single()\
    .execute()

if not goal.data:
    return {"success": False, "message": "Goal not found or access denied"}

# ❌ BAD - Missing user_id check (security vulnerability)
goal = supabase.table("goals").select("*").eq("id", goal_id).single().execute()
```

### 2. Rate Limiting

Tools that trigger expensive operations (AI calls, external APIs) should check rate limits:

```python
# Check daily limit before executing
daily_count = get_daily_usage(user_id, "goal_creations")
if daily_count >= 10:  # Limit: 10 goal creations/day
    return {
        "success": False,
        "message": "Daily goal creation limit reached (10/day). Try again tomorrow.",
        "data": {"error_code": "RATE_LIMIT_EXCEEDED"}
    }
```

### 3. Input Validation

Never trust tool params directly from AI:

```python
# Validate and sanitize inputs
title = params.get("title", "").strip()
if len(title) < 3 or len(title) > 100:
    return {
        "success": False,
        "message": "Title must be 3-100 characters",
        "data": {"error_code": "INVALID_INPUT"}
    }
```

---

## Available Tools (Current + Planned)

### Current Tools (Story 6.2)

| Tool Name | Purpose | Status |
|-----------|---------|--------|
| `modify_personality` | Update Dream Self personality traits | ✅ Implemented |

### Planned Tools (Future Stories)

| Tool Name | Purpose | Epic | Story |
|-----------|---------|------|-------|
| `create_goal` | Create new goal from natural language | Epic 2 | US-2.1 |
| `breakdown_goal` | Generate subtasks/binds for goal | Epic 2 | US-2.2 |
| `delete_goal` | Delete/archive goal | Epic 2 | US-2.3 |
| `update_goal` | Modify goal title/description/target | Epic 2 | US-2.3 |
| `analyze_reflection` | Analyze journal patterns | Epic 4 | US-4.4 |
| `generate_weekly_insights` | Create weekly pattern report | Epic 6 | US-6.4 |
| `schedule_reminder` | Set bind reminder notifications | Epic 7 | US-7.2 |
| `suggest_goals` | Recommend goals based on behavior | Future | - |
| `optimize_habit` | Suggest timing/frequency adjustments | Future | - |
| `export_data` | Export user data (JSON/CSV) | Future | - |

---

## Advanced Patterns

### Multi-Tool Chains

AI can call multiple tools in sequence:

**User:** "Create a goal for morning workouts, then break it down into daily habits"

**AI Flow:**
1. Calls `create_goal(title="Morning workout routine")` → Goal created (goal_id=123)
2. Calls `breakdown_goal(goal_id=123, num_subtasks=7)` → Subtasks generated
3. Responds: "Done! I've created your 'Morning workout routine' goal and broken it into 7 daily habits..."

**Implementation:** AIService handles multi-turn tool calls automatically (Anthropic/OpenAI support this natively)

---

### Tool Result Formatting

Tools should return results that AI can easily parse and present:

```python
# ✅ GOOD - Structured, AI-friendly result
return {
    "success": True,
    "message": "Goal created successfully",
    "data": {
        "goal_id": "uuid",
        "title": "Morning workout routine",
        "created_binds": 3,
        "bind_titles": ["Gym session", "Protein intake", "Sleep 8 hours"]
    }
}

# ❌ BAD - Unstructured, hard for AI to parse
return {
    "success": True,
    "message": "Goal 'Morning workout routine' (uuid) created with binds: Gym session, Protein intake, Sleep 8 hours"
}
```

---

### Tool Context Awareness

Tools can access full user context if needed:

```python
from app.services.context_builder import ContextBuilderService

async def execute(self, user_id: UUID, params: dict) -> dict:
    # Get user context for smarter tool execution
    context_builder = ContextBuilderService()
    user_context = await context_builder.build_context(user_id)

    # Use context to inform tool logic
    if user_context["metrics"]["current_streak"] > 7:
        # User on hot streak - create more ambitious goal
        ...
```

---

## Performance Optimization

### 1. Fast Tool Execution

Target: <300ms per tool call (user expects instant chat response)

**Optimization strategies:**
- Use database indexes for lookups
- Avoid N+1 queries (use JOINs)
- Cache tool schemas (don't regenerate every request)
- Async/await for parallel operations

### 2. Tool Schema Caching

```python
from functools import lru_cache

class ToolRegistry:
    @lru_cache(maxsize=1)
    def get_tool_definitions(self) -> list[dict]:
        """Cache tool definitions (they don't change frequently)."""
        return [tool.get_schema() for tool in self.tools.values()]
```

### 3. Lazy Tool Loading

Only load tools that are relevant to current conversation:

```python
# Optional optimization (for 50+ tools)
def get_relevant_tools(conversation_context: dict) -> list[dict]:
    """Return only tools relevant to conversation."""
    if "goal" in conversation_context["last_message"].lower():
        return [create_goal, breakdown_goal, delete_goal]
    elif "personality" in conversation_context["last_message"].lower():
        return [modify_personality]
    else:
        return []  # No tools, pure conversation
```

---

## Debugging Tools

### Log Tool Execution

Add detailed logging for debugging:

```python
import logging

logger = logging.getLogger(__name__)

async def execute(self, user_id: UUID, params: dict) -> dict:
    logger.info(f"Tool '{self.get_name()}' called by user {user_id} with params: {params}")

    try:
        result = await self._execute_logic(user_id, params)
        logger.info(f"Tool '{self.get_name()}' succeeded: {result['message']}")
        return result
    except Exception as e:
        logger.error(f"Tool '{self.get_name()}' failed: {str(e)}")
        return {"success": False, "message": str(e)}
```

### Test Tool Directly

Test tools without going through AI:

```bash
# Python REPL testing
cd weave-api
uv run python

>>> from app.services.tools.create_goal import CreateGoalTool
>>> from uuid import UUID
>>> tool = CreateGoalTool()
>>> result = await tool.execute(
...     user_id=UUID("test-user-id"),
...     params={"title": "Test Goal"}
... )
>>> print(result)
```

---

## AI Provider Compatibility

### OpenAI (GPT-4o, GPT-4o-mini)

**Tool Schema Format:** OpenAI function calling

```python
# AIService enhancement for OpenAI
response = openai.chat.completions.create(
    model="gpt-4o",
    messages=[...],
    tools=tool_definitions,  # Pass tool schemas
    tool_choice="auto"       # Let AI decide when to call tools
)

# Detect tool calls
if response.choices[0].message.tool_calls:
    for tool_call in response.choices[0].message.tool_calls:
        tool_name = tool_call.function.name
        tool_params = json.loads(tool_call.function.arguments)

        # Execute tool
        result = await tool_registry.execute_tool(tool_name, tool_params, user_id)

        # Send result back to AI
        # ... continue conversation with tool result
```

---

### Anthropic (Claude 3.7 Sonnet, Claude 3.5 Haiku)

**Tool Schema Format:** Anthropic tool use

```python
# AIService enhancement for Anthropic
response = anthropic.messages.create(
    model="claude-3-7-sonnet-20250219",
    messages=[...],
    tools=tool_definitions,  # Same schemas work for Anthropic!
)

# Detect tool use
for content_block in response.content:
    if content_block.type == "tool_use":
        tool_name = content_block.name
        tool_params = content_block.input

        # Execute tool
        result = await tool_registry.execute_tool(tool_name, tool_params, user_id)

        # Send result back to AI
        # ... continue conversation with tool result
```

**Note:** Both OpenAI and Anthropic use same tool schema format! Your tools work with both providers.

---

## Example: Complete Tool Implementation

### modify_personality Tool (Reference Implementation)

```python
# weave-api/app/services/tools/modify_personality.py
from uuid import UUID
from app.services.tools.base import ToolBase
from app.core.database import get_supabase
import logging

logger = logging.getLogger(__name__)

class ModifyPersonalityTool(ToolBase):
    """Updates the user's Dream Self personality traits."""

    def get_name(self) -> str:
        return "modify_personality"

    def get_schema(self) -> dict:
        return {
            "name": "modify_personality",
            "description": "Updates the user's AI personality traits (Dream Self). Use when user requests personality changes like 'be more direct', 'less formal', 'more encouraging', etc.",
            "parameters": {
                "type": "object",
                "properties": {
                    "new_traits": {
                        "type": "string",
                        "description": "Comma-separated personality traits to apply (e.g., 'assertive, direct, supportive', 'encouraging, gentle, patient')"
                    },
                    "reason": {
                        "type": "string",
                        "description": "Optional: Why the user wants this change (for logging)"
                    }
                },
                "required": ["new_traits"]
            }
        }

    async def execute(self, user_id: UUID, params: dict) -> dict:
        """Execute personality modification."""
        try:
            logger.info(f"Modifying personality for user {user_id}: {params}")

            # 1. Validate input
            new_traits = params.get("new_traits", "").strip()
            if not new_traits:
                return {
                    "success": False,
                    "message": "New traits cannot be empty",
                    "data": {"error_code": "INVALID_INPUT"}
                }

            # 2. Load current Dream Self document
            supabase = get_supabase()
            identity_doc = supabase.table("identity_docs")\
                .select("*")\
                .eq("user_id", str(user_id))\
                .eq("type", "dream_self")\
                .is_("deleted_at", "null")\
                .single()\
                .execute()

            if not identity_doc.data:
                return {
                    "success": False,
                    "message": "No Dream Self personality found. Complete onboarding first.",
                    "data": {"error_code": "DREAM_SELF_NOT_FOUND"}
                }

            # 3. Update personality document
            current_content = identity_doc.data["content"]

            # Parse and update personality section
            updated_content = self._update_personality_traits(
                current_content,
                new_traits
            )

            # 4. Save updated document
            supabase.table("identity_docs")\
                .update({"content": updated_content})\
                .eq("id", identity_doc.data["id"])\
                .execute()

            logger.info(f"Personality updated successfully for user {user_id}")

            return {
                "success": True,
                "message": f"Personality updated with traits: {new_traits}",
                "data": {
                    "new_traits": new_traits,
                    "document_id": identity_doc.data["id"]
                }
            }

        except Exception as e:
            logger.error(f"Personality modification failed for user {user_id}: {str(e)}")
            return {
                "success": False,
                "message": f"Failed to update personality: {str(e)}",
                "data": {"error": str(e)}
            }

    def _update_personality_traits(self, content: dict, new_traits: str) -> dict:
        """Update personality traits in identity document."""
        # Parse new_traits (comma-separated)
        traits_list = [t.strip() for t in new_traits.split(",")]

        # Update content (assuming JSONB structure)
        if "personality" not in content:
            content["personality"] = {}

        content["personality"]["traits"] = traits_list
        content["personality"]["updated_at"] = "2025-12-23T10:00:00Z"

        return content
```

---

## Quick Start Checklist

**To create a new tool:**

- [ ] Create `weave-api/app/services/tools/your_tool.py`
- [ ] Inherit from `ToolBase`
- [ ] Implement `get_name()`, `get_schema()`, `execute()`
- [ ] Register tool in `ToolRegistry.__init__()`
- [ ] Write unit tests in `tests/test_tools/test_your_tool.py`
- [ ] Write integration test in `tests/test_ai_chat_integration.py`
- [ ] Test manually: Send message to AI chat that should trigger your tool
- [ ] Verify tool execution logged to `ai_runs` table
- [ ] Document tool in this guide's "Available Tools" section

---

## References

- **Sprint Change Proposal:** `docs/sprint-artifacts/sprint-change-proposals/sprint-change-proposal-intent-router-2025-12-23.md`
- **Story 6.2 Spec:** `docs/stories/6-2-contextual-ai-responses.md`
- **Architecture:** `docs/architecture/core-architectural-decisions.md` (AI Tool Use section)
- **OpenAI Function Calling Docs:** https://platform.openai.com/docs/guides/function-calling
- **Anthropic Tool Use Docs:** https://docs.anthropic.com/claude/docs/tool-use
- **MCP Protocol:** https://modelcontextprotocol.io/introduction

---

**Last Updated:** 2025-12-23 by Bob (Scrum Master)

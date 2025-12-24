# Implementation Patterns & Consistency Rules

These patterns ensure AI agents and developers write compatible, consistent code.

## Naming Patterns

### Database (Supabase PostgreSQL)
```sql
-- Tables: snake_case, plural
user_profiles, subtask_completions, journal_entries

-- Columns: snake_case
user_id, created_at, local_date, scheduled_for_date

-- Foreign keys: {table}_id
user_id, goal_id, subtask_instance_id

-- Indexes: idx_{table}_{columns}
idx_subtask_completions_user_date
```

### API Endpoints (FastAPI)
```python
# REST: plural nouns, snake_case params
GET  /api/goals
POST /api/goals
GET  /api/goals/{goal_id}
POST /api/journal-entries
GET  /api/daily-aggregates/{local_date}

# Query params: snake_case
?user_id=xxx&local_date=2025-12-16
```

### TypeScript (React Native)
```typescript
// Files: PascalCase for components
GoalCard.tsx, DailyTriad.tsx, JournalEntry.tsx

// Files: camelCase for utilities/hooks
useGoals.ts, apiClient.ts, dateUtils.ts

// Components: PascalCase
function GoalCard() {}

// Variables/functions: camelCase
const userId = "..."
function fetchGoals() {}
```

### Python (FastAPI)
```python
# Files: snake_case
goal_router.py, journal_service.py, ai_models.py

# Functions/variables: snake_case
def get_user_goals():
    user_id = "..."

# Classes: PascalCase
class GoalCreate(BaseModel):
```

## Structure Patterns

### Test Locations
- **Mobile**: Co-located `*.test.tsx` files (Jest + React Native Testing Library)
- **Backend**: `api/tests/` directory (pytest convention)

### Component Organization
- `components/ui/` - Generic reusable UI (Button, Card, Input)
- `components/features/{domain}/` - Feature-specific components

## Format Patterns

### API Response Format
```typescript
// Success response
{ "data": { ... }, "meta": { "timestamp": "2025-12-16T10:00:00Z" } }

// Error response
{ "error": { "code": "GOAL_LIMIT_REACHED", "message": "Maximum 3 active goals allowed" } }

// List response
{ "data": [...], "meta": { "total": 42, "page": 1, "per_page": 20 } }
```

### Date Formats
```typescript
// API/Database: ISO 8601
"2025-12-16T10:30:00Z"  // timestamps with timezone
"2025-12-16"            // local_date (no time)
```

### JSON Field Naming
- **API ↔ Database**: `snake_case` (matches PostgreSQL)
- **TypeScript internal**: `camelCase` (transform at API boundary)

## Communication Patterns

### Event Naming
```typescript
// Pattern: domain.action (snake_case)
"journal.submitted"
"subtask.completed"
"capture.created"
"goal.activated"
```

### State Management Boundaries
```typescript
// TanStack Query: All server data
const { data: goals } = useQuery({ queryKey: ['goals'], ... })

// Zustand: Only shared UI state
const useUIStore = create<UIState>((set) => ({
  activeFilter: 'all',
  isJournalModalOpen: false,
}))

// useState: Component-local only
const [inputValue, setInputValue] = useState('')
```

## Process Patterns

### Authentication & Authorization (Story 0.3)

**ALL protected API endpoints MUST use JWT middleware:**

```python
from app.core.deps import get_current_user, get_optional_user

# Protected endpoint (requires authentication)
@router.get("/api/protected-resource")
async def protected_route(
    user: dict = Depends(get_current_user),  # ← REQUIRED for protected endpoints
    db: Client = Depends(get_supabase_client)
):
    auth_user_id = user["sub"]  # Extract auth.uid from JWT
    # ... rest of logic

# Optional authentication (works with or without token)
@router.get("/api/optional-auth-resource")
async def optional_auth_route(
    user: Optional[dict] = Depends(get_optional_user),  # ← For optional auth
    db: Client = Depends(get_supabase_client)
):
    if user:
        auth_user_id = user["sub"]
        # Authenticated user logic
    else:
        # Anonymous user logic
```

**Key Points:**
- `get_current_user()` - Use for ALL protected endpoints (raises 401 if no token)
- `get_optional_user()` - Use for endpoints that work with or without auth
- Extract user ID: `auth_user_id = user["sub"]`
- JWT automatically verified by middleware (HS256, audience="authenticated")
- Returns 401 for missing/invalid/expired tokens

**❌ NEVER do this:**
```python
# BAD - Placeholder auth (security vulnerability)
auth_user_id = "placeholder_auth_user_id"  # ❌ NEVER use placeholders

# BAD - Manual JWT parsing (use middleware instead)
token = request.headers.get("Authorization")  # ❌ Don't parse manually
```

**Reference Implementation:**
- Middleware: `weave-api/app/core/deps.py:85-220`
- Examples: `weave-api/app/api/user.py`, `weave-api/app/api/goals/router.py`

### Configuration Management (Story 6.1+)

**Use feature config modules for centralized, environment-aware configuration.**

**Pattern:** Create `app/config/{feature}_config.py` for feature-specific settings (rate limits, feature flags, timeouts).

**✅ GOOD - Centralized Config:**
```python
# app/config/ai_chat_config.py
import os
from typing import Optional

class AIChatConfig:
    """AI Chat feature configuration loaded from environment variables."""

    # Rate limits (loaded from .env with defaults)
    FREE_PREMIUM_DAILY_LIMIT: int = int(os.getenv('AI_FREE_PREMIUM_DAILY_LIMIT', '10'))
    FREE_FREE_DAILY_LIMIT: int = int(os.getenv('AI_FREE_FREE_DAILY_LIMIT', '40'))
    FREE_MONTHLY_LIMIT: int = int(os.getenv('AI_FREE_MONTHLY_LIMIT', '500'))
    PRO_MONTHLY_LIMIT: int = int(os.getenv('AI_PRO_MONTHLY_LIMIT', '5000'))

    # Admin bypass
    ADMIN_API_KEY: Optional[str] = os.getenv('AI_ADMIN_KEY', None)

    # Feature flags
    CHECK_IN_ENABLED: bool = os.getenv('AI_CHECK_IN_ENABLED', 'true').lower() == 'true'

    @classmethod
    def validate(cls) -> None:
        """Validate config on startup - catches misconfiguration early."""
        assert cls.FREE_PREMIUM_DAILY_LIMIT > 0, "Limit must be positive"
        assert cls.FREE_MONTHLY_LIMIT >= cls.FREE_PREMIUM_DAILY_LIMIT

# Validate on module import
AIChatConfig.validate()
```

**Usage in Business Logic:**
```python
from app.config.ai_chat_config import AIChatConfig

class TieredRateLimiter:
    def __init__(self, db: SupabaseClient):
        self.db = db
        # Load from config (environment-aware)
        self.free_premium_daily_limit = AIChatConfig.FREE_PREMIUM_DAILY_LIMIT
        self.pro_monthly_limit = AIChatConfig.PRO_MONTHLY_LIMIT

    def check_rate_limit(self, user_id: str):
        # Use instance variables (loaded from config)
        if premium_used >= self.free_premium_daily_limit:
            raise HTTPException(status_code=429, ...)
```

**Setting Config (.env file):**
```bash
# weave-api/.env
AI_FREE_PREMIUM_DAILY_LIMIT=10      # Strict limits in prod
AI_ADMIN_KEY=abc123xyz789           # Generate with: openssl rand -hex 32

# weave-api/.env (dev)
AI_FREE_PREMIUM_DAILY_LIMIT=100     # Higher limits for testing
AI_CHECK_IN_ENABLED=false           # Disable check-ins in dev
```

**❌ BAD - Hardcoded Constants:**
```python
class RateLimiter:
    FREE_DAILY_LIMIT = 10  # ❌ Can't change per environment
    PRO_DAILY_LIMIT = 100  # ❌ Requires code change to adjust
```

**What Goes in Config:**
- ✅ Rate limits (daily, monthly, per-tier)
- ✅ Feature flags (enabled/disabled)
- ✅ Admin bypass keys
- ✅ Timeouts and thresholds
- ✅ Scheduler intervals

**What Stays in Business Logic:**
- ❌ Core algorithms
- ❌ Database queries
- ❌ API response formats

**Key Benefits:**
1. **Environment-specific settings** - Different dev/staging/prod config
2. **No code changes** - Adjust limits via .env only
3. **Type-safe** - Validation catches errors on startup
4. **Single source of truth** - All config in one place
5. **Reusable pattern** - Template for all features

**Reference Implementation:**
- Config module: `weave-api/app/config/ai_chat_config.py`
- Usage: `weave-api/app/services/ai/tiered_rate_limiter.py`
- .env template: `weave-api/.env.example`

**Future Config Modules:**
- `app/config/upload_config.py` - File upload limits
- `app/config/api_config.py` - General API rate limits
- `app/config/feature_flags.py` - Feature toggles

### Error Handling
```typescript
// Error boundaries for crashes
<ErrorBoundary fallback={<CrashScreen />}><App /></ErrorBoundary>

// TanStack Query error states
const { error, isError } = useQuery(...)
if (isError) return <ErrorMessage error={error} />

// FastAPI: HTTPException with consistent format
raise HTTPException(status_code=400, detail={"code": "VALIDATION_ERROR", "message": "..."})
```

### Loading States
```typescript
// TanStack Query provides loading states
const { isLoading, isFetching } = useQuery(...)
if (isLoading) return <GoalCardSkeleton />  // Initial load
// isFetching shows subtle indicator without blocking
```

## Enforcement Guidelines

**All AI Agents MUST:**
1. Use `Depends(get_current_user)` for ALL protected API endpoints (Story 0.3)
2. Use `snake_case` for all database columns and API parameters
3. Use `PascalCase` for React components and their files
4. Use the `{data, error, meta}` response wrapper format
5. Place tests co-located for mobile, in `tests/` for backend
6. Never UPDATE/DELETE from `subtask_completions`
7. Transform `snake_case` ↔ `camelCase` at API boundary only

**Verification:**
- TypeScript strict mode catches naming inconsistencies
- ESLint rules enforce file naming
- Database constraints prevent invalid operations

---

## Development Infrastructure Standardization (Epic 1.5)

**Epic 1.5: Development Infrastructure** established comprehensive patterns for ALL development. Agents implementing ANY story should reference these standards:

### Frontend Standardization (Story 1.5.1)
**When:** Creating screens, navigation flows, or UI components
**Reference:** `docs/stories/1-5-1-navigation-architecture.md`
**Patterns:**
- File-based routing with Expo Router (`app/` directory structure)
- 3-tab navigation: Thread, AI Chat, Dashboard
- Design system component usage (`@/design-system`)
- State management boundaries (TanStack Query, Zustand, useState)

### Backend Standardization (Story 1.5.2)
**When:** Creating API endpoints, database models, or backend services
**Reference:** `docs/stories/1-5-2-backend-standardization.md` + `docs/dev/backend-patterns-guide.md`
**Patterns:**
- API endpoint naming: `GET /api/{resources}`, `POST /api/{resources}`
- Pydantic models: `{Resource}Create`, `{Resource}Response`
- Database conventions: `snake_case`, plural tables, soft delete with `deleted_at`
- Error handling: Standard codes (VALIDATION_ERROR, NOT_FOUND, RATE_LIMIT_EXCEEDED)
- Testing: Pytest fixtures, integration test patterns

**Templates Available:**
- API endpoint template (`scripts/templates/api_router_template.py`)
- Database model template (SQLAlchemy `BaseModel` with timestamps)
- Pydantic schema template (request/response models)

### AI Module Orchestration (Story 1.5.3)

**When:** Implementing AI features (goal breakdown, triad planning, AI chat, insights)

**Reference:** `docs/stories/1-5-3-ai-module-orchestration.md` + `docs/dev/ai-services-guide.md`

**Architecture Flow:**
```
Request → AIOrchestrator (NEW - which product module?)
       → AIModule (NEW - what context to build?)
       → AIService (EXISTS - which AI provider?)
       → AIProvider (EXISTS - API call implementation)
```

**Patterns:**
- **Use AIOrchestrator** for all AI requests (routes to correct product module)
- **Use AI Modules** for product features (Onboarding Coach, Triad Planner, Dream Self Advisor, etc.)
- **Use ContextBuilder** for user state assembly (identity, goals, history, patterns)
- **Use existing AIService** for provider calls (DO NOT bypass orchestrator to call AIService directly)
- Cost tracking and rate limiting handled automatically by existing AIService

**Module → Operation Mapping:**
| Operation Type | Module | Epic/Story Usage |
|----------------|--------|------------------|
| `generate_goal_breakdown` | Onboarding Coach | Stories 1.8, 2.3 |
| `generate_triad` | Triad Planner | Story 4.3 |
| `generate_recap` | Daily Recap | Story 4.3 |
| `chat_response` | Dream Self Advisor | Stories 6.1, 6.2 |
| `generate_weekly_insights` | AI Insights Engine | Story 6.4 |

**Quick Checklist:**
- [ ] Use `AIOrchestrator.execute_ai_operation()` for all AI requests
- [ ] Specify operation_type (maps to correct module)
- [ ] Let module build context automatically (don't manually assemble)
- [ ] Use standard React hooks: `useAIChat()`, `useImageAnalysis()`, `useVoiceTranscription()`
- [ ] DO NOT call AIService directly (use orchestrator)

**Before Writing AI Feature Code:**
1. Read Story 1.5.3 to understand module orchestration
2. Identify which AI module handles your operation
3. Use AIOrchestrator.execute_ai_operation() pattern
4. Use appropriate React Native hook for frontend

---

## 8. AI Tool Execution Patterns

### 8.1 AI-Based Tool Classification (Current Implementation)

**When to Use:** All user-facing tool invocations where natural language understanding is critical

**Architecture:**
```
User Message
    ↓
 AIToolClassifier (AI-powered analysis using GPT-4o-mini/Claude 3.5 Haiku)
    ├─ Analyzes message with prompt containing tool descriptions
    ├─ Identifies which tools (if any) should be called
    └─ Extracts parameters from natural language
    ↓
Tool Execution (async, parallel if multiple tools)
    ├─ Database operations
    ├─ Validation
    └─ Error handling
    ↓
AI Response Formatting
    ├─ Tool results included in context
    └─ Natural language response incorporating results
```

**Key Components:**
- `AIToolClassifier` (weave-api/app/services/tools/ai_tool_classifier.py): AI-powered tool analysis using small models
- `ToolRegistry`: Central registration of all available tools
- Tool execution happens BEFORE main AI response generation

**Cost & Performance:**
- Classification cost: ~$0.00006 per message (~2% of total AI spend)
- Latency: ~100-150ms (small model, low tokens)
- Temperature: 0.1 (consistent classification while maintaining flexibility)

**Example Classification Prompt:**
```python
"""You are a tool classification system. Analyze the user's message and determine if any tools should be called.

Available Tools:

**modify_personality**
Description: Change the AI coaching personality or adjust Weave AI's speaking style
Parameters: {
  "active_personality": "dream_self" | "weave_ai",
  "weave_preset": "gen_z_default" | "supportive_coach" | "concise_mentor"
}
Example phrases: switch to my dream self, be more casual, talk like a supportive coach

User Message: "be more casual"

Response Format (JSON only):
{
  "tools": [
    {
      "tool_name": "modify_personality",
      "parameters": {
        "active_personality": "weave_ai",
        "weave_preset": "gen_z_default"
      }
    }
  ]
}
"""
```

**Benefits:**
- **Natural Language Understanding:** Handles varied phrasings ("I am Jack", "I'm Jack", "call me Jack" all work)
- **Flexible:** No rigid regex patterns to maintain
- **Context-Aware:** AI can infer intent from conversation context
- **Model-Agnostic:** Uses small, fast models (not dependent on main AI provider)

**Decision Rationale:**
Chosen over regex-based deterministic triggering because:
1. **UX Requirement:** Users speak naturally, not in command syntax
2. **Flexibility:** Handles typos, variations, synonyms without code changes
3. **Context Understanding:** AI can use conversation history to infer tool needs
4. **Maintainability:** No regex pattern library to maintain and debug

**Alternative Approaches Considered:**

1. **Regex Pattern Matching (Deterministic)**
   - ❌ Rejected: Too rigid, doesn't handle natural language variations
   - ❌ Rejected: Requires maintaining complex regex patterns for every phrasing
   - Example failure: "I go by Jack" wouldn't match `r'(?:I am|I\'m)\s+[A-Z]\w+'`

2. **AI Function Calling (Main Model)**
   - ❌ Rejected: Higher cost (uses main model, not small classifier)
   - ❌ Rejected: Higher latency (~500ms vs ~100ms)
   - May revisit for complex multi-step reasoning (Story 6.4+)

3. **Hybrid: AI Classification + User Confirmation**
   - ❌ Rejected: Adds UX friction ("Are you sure?")
   - Better to make tools idempotent and allow immediate execution

**When to Use Alternative Patterns:**

- **AI Function Calling (Main Model):** Complex multi-step reasoning where tool selection depends on deep conversation analysis
- **Hybrid Approach:** High-risk operations requiring explicit user confirmation (delete account, clear all data)
- **Deterministic Fallback:** Simple exact-match commands in constrained contexts (e.g., slash commands)

### 8.2 Tool Execution Flow

**Standard Flow:**
1. User sends message via chat interface
2. `AIToolClassifier.analyze_message()` sends message + tool descriptions to small AI model
3. AI returns structured JSON with tools to call and parameters
4. Matching tools executed immediately (before main AI call)
5. Tool results included in main AI context
6. Main AI generates natural language response incorporating results
7. Frontend shows tool status indicators during execution (⚙️ starting → ✓ completed)
8. Cache invalidated after successful tool execution

**Error Handling Flow:**
1. Tool execution fails (validation error, DB error, etc.)
2. Error returned with structured format: `{success: false, error: "code", message: "..."}`
3. Error displayed in UI via ToolExecutionIndicator (❌ error state, 3s timeout)
4. Main AI still generates response (may acknowledge tool failure)
5. User can retry with corrected input

**Concurrency:**
- Multiple tools can trigger from single message
- Tools execute in parallel (no ordering guarantees)
- Main AI response waits for all tools to complete

**Frontend Integration:**
```typescript
// Tool execution events in SSE stream:
// 1. tool_start: { tool_name, parameters }
// 2. tool_result: { tool_name, result }  OR  tool_error: { tool_name, error }
// 3. chunk: { content } - Main AI response chunks
// 4. done: {} - Stream complete

// React hook handles tool status automatically:
const { currentTool, toolExecutions } = useAIChatStream();
// currentTool shows in ToolExecutionIndicator component
```

### 8.3 Tool Development Guidelines

**Creating New Tools:**
1. Create tool class in `weave-api/app/services/tools/[tool_name]_tool.py`
2. Implement `async execute(user_id, parameters)` method
3. Add tool description with parameters and example phrases to `AIToolClassifier._get_tool_descriptions()`
4. Register in `ToolRegistry`
5. Write unit tests (parameter extraction, validation, execution)
6. Write integration tests (chat flow with tool)
7. Test with natural language variations manually

**Tool Description Template:**
```python
{
    "name": "my_tool",
    "description": "Brief description of what this tool does",
    "parameters": {
        "param1": "Description of param1 (required)",
        "param2": "Description of param2 (optional)"
    },
    "examples": [
        "natural phrase 1",
        "natural phrase 2",
        "natural phrase 3"
    ]
}
```

**See:** `docs/dev/ai-services-guide.md` Section 12 for complete guide

### 8.4 Consistency Rules

**DO:**
- ✅ Write clear, natural example phrases in tool descriptions
- ✅ Return structured responses: `{success: bool, data?: dict, error?: str, message?: str}`
- ✅ Register all tools in central `ToolRegistry`
- ✅ Add debug logging for tool classification and execution
- ✅ Write tests for both AI classification accuracy and execution logic
- ✅ Make tools idempotent (safe to call multiple times)
- ✅ Include conversation context in classification when relevant

**DON'T:**
- ❌ Assume AI will extract parameters perfectly (validate in tool code)
- ❌ Return raw strings from tools (use structured dict)
- ❌ Skip parameter validation (check required fields before DB operations)
- ❌ Create tools without example phrases (AI needs reference points)
- ❌ Bypass ToolRegistry (all tools must be centrally registered)
- ❌ Execute tools after main AI response (breaks UX flow - user sees delay)
- ❌ Use overly specific tool names (e.g., "update_user_identity_document_dream_self" vs "modify_identity_document")

### 8.5 Testing Strategy

**Unit Tests:**
- Test AI classification with diverse natural language variations
- Test parameter extraction accuracy
- Test validation logic (required fields, type checking)
- Test error handling (DB errors, validation failures)
- Mock AI responses for deterministic tests

**Integration Tests:**
- Test tool execution in chat flow end-to-end
- Test tool result incorporation in AI response
- Test cache invalidation after tool completion
- Test concurrent tool execution from single message
- Test error recovery (invalid input, then corrected input)

**Manual Testing Checklist:**
- Try 5+ natural language variations per tool
- Test edge cases (typos, ambiguous input, missing parameters)
- Test error recovery (invalid input, then corrected input)
- Test performance (classification should be <150ms, tool execution <200ms)
- Test with different personalities (Dream Self vs Weave AI)

**Example Test Cases for "modify_identity_document":**
```
✅ "I am Jack" → Should extract dream_self="Jack"
✅ "I'm Jack" → Should extract dream_self="Jack"
✅ "call me Jack" → Should extract dream_self="Jack"
✅ "I go by Jack" → Should extract dream_self="Jack"
✅ "my traits are curious and ambitious" → Should extract traits=["curious", "ambitious"]
✅ "I'm a builder archetype" → Should extract archetype="The Builder"
❌ "hello" → Should NOT trigger tool
❌ "what's my name?" → Should NOT trigger tool (query, not statement)
```

### 8.6 Performance Considerations

**Classification Overhead:**
- Small model call: ~100-150ms
- Cost: ~$0.00006 per message (2% of total AI budget)
- Happens in parallel with context building (minimal latency impact)

**Optimization Strategies:**
- Use smallest possible model (GPT-4o-mini, Claude 3.5 Haiku)
- Keep tool descriptions concise (200-300 tokens total)
- Use low temperature (0.1) for consistent classification
- Cache tool descriptions (don't rebuild on every request)
- Execute tools in parallel when multiple tools trigger

**Future Optimizations:**
- Pattern caching: Cache classification results for exact message matches (1 hour TTL)
- Tool batching: Group similar tool calls to reduce DB roundtrips
- Streaming classification: Start tool execution before main AI call completes

---

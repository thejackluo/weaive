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

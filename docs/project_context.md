---
project_name: 'Weave'
user_name: 'Jack'
date: '2025-12-16'
sections_completed: ['technology_stack', 'reference_implementation', 'critical_rules', 'testing', 'ai_cost', 'dangerous_ops', 'initialization']
status: 'complete'
rule_count: 42
optimized_for_llm: true
---

# Project Context for AI Agents

_Critical rules for implementing Weave. Read before writing any code._

**Reference:** See `docs/architecture.md` for complete architectural decisions.

---

## Technology Stack & Versions

| Layer | Technology | Version |
|-------|------------|---------|
| **Mobile** | Expo SDK | 53 |
| | React Native | 0.79 |
| | React | 19 |
| | Expo Router | v5 |
| | Styling | NativeWind |
| | Server State | TanStack Query |
| | UI State | Zustand |
| **Backend** | FastAPI | 0.115+ |
| | Python | 3.11+ |
| **Database** | Supabase PostgreSQL | - |
| | Auth | Supabase Auth |
| | Storage | Supabase Storage |
| **AI** | Routine (90%) | GPT-4o-mini |
| | Complex (10%) | Claude 3.7 Sonnet |

---

## Reference Implementation: Create Goal (End-to-End)

This is your template for all features. Copy this pattern.

### Mobile (React Native + TanStack Query)

```typescript
// hooks/useGoals.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@lib/supabase'
import { apiClient } from '@/lib/api'

interface CreateGoalInput {
  title: string
  description: string
}

export function useCreateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateGoalInput) => {
      // Get auth token from Supabase
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      // Call FastAPI with JWT
      const response = await fetch(`${apiClient.baseURL}/api/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` // CRITICAL: Pass JWT
        },
        body: JSON.stringify({
          title: input.title,
          description: input.description
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to create goal')
      }

      return response.json() // Returns { data, meta }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    }
  })
}

// Usage in component
function CreateGoalScreen() {
  const { mutate, isPending, error } = useCreateGoal()

  const handleSubmit = () => {
    mutate({ title: '...', description: '...' })
  }

  if (error) return <ErrorMessage error={error} />
  // ...
}
```

### Backend (FastAPI + Supabase)

```python
# routers/goals.py
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from app.dependencies import get_current_user, get_supabase

router = APIRouter(prefix="/api/goals", tags=["goals"])

class GoalCreate(BaseModel):
    title: str
    description: str

@router.post("")
async def create_goal(
    goal: GoalCreate,
    user_id: str = Depends(get_current_user),  # JWT verified
    supabase: Client = Depends(get_supabase)
):
    # Insert into Supabase
    result = supabase.table("goals").insert({
        "user_id": user_id,
        "title": goal.title,
        "description": goal.description,
        "status": "active"
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail={
            "code": "INSERT_FAILED",
            "message": "Failed to create goal"
        })

    return {
        "data": result.data[0],
        "meta": {"timestamp": datetime.utcnow().isoformat()}
    }

# dependencies.py
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """Verify Supabase JWT and return user_id"""
    # Supabase verifies JWT automatically
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    user = supabase.auth.get_user(credentials.credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user.id
```

### Testing Pattern

```typescript
// __tests__/useGoals.test.tsx
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCreateGoal } from '@/hooks/useGoals'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

test('creates goal successfully', async () => {
  global.fetch = jest.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: { id: '1', title: 'Test' }, meta: {} })
  }))

  const { result } = renderHook(() => useCreateGoal(), { wrapper: createWrapper() })

  result.current.mutate({ title: 'Test Goal', description: 'Test' })

  await waitFor(() => expect(result.current.isSuccess).toBe(true))
})
```

```python
# tests/test_goals.py
import pytest
from unittest.mock import patch, MagicMock

@pytest.fixture
def mock_supabase():
    mock = MagicMock()
    mock.table().insert().execute.return_value.data = [{
        "id": "test-id",
        "title": "Test Goal"
    }]
    return mock

def test_create_goal(client, mock_supabase):
    with patch('app.dependencies.get_supabase', return_value=mock_supabase):
        response = client.post(
            "/api/goals",
            json={"title": "Test", "description": "Test"},
            headers={"Authorization": "Bearer test-token"}
        )
        assert response.status_code == 200
        assert response.json()["data"]["title"] == "Test Goal"
```

---

## Critical Implementation Rules

### Naming Conventions (NEVER MIX)

**Database (PostgreSQL):**
```sql
-- Tables: snake_case, plural
user_profiles, subtask_completions, journal_entries

-- Columns: snake_case
user_id, created_at, local_date, scheduled_for_date

-- Indexes: idx_{table}_{columns}
idx_subtask_completions_user_date
```

**API (FastAPI):**
```python
# Endpoints: plural nouns
GET  /api/goals
POST /api/goals
GET  /api/goals/{goal_id}

# Query params: snake_case
?user_id=xxx&local_date=2025-12-16
```

**TypeScript (React Native):**
```typescript
// Files: PascalCase for components, camelCase for utils
GoalCard.tsx, useGoals.ts, apiClient.ts

// Variables/functions: camelCase
const userId = "..."
function fetchGoals() {}
```

**Transform at API Boundary (CRITICAL):**
```typescript
// API returns snake_case
{ user_id: "...", created_at: "...", local_date: "..." }

// Transform ONCE at API client to camelCase
{ userId: "...", createdAt: "...", localDate: "..." }

// NEVER mix conventions within a layer
```

### State Management Ownership

| Data Type | Owner | Examples | Rule |
|-----------|-------|----------|------|
| Server data | TanStack Query | Goals, journal, completions | Fetched from API |
| Shared UI state | Zustand | Active filter, modal visibility | Cross-component |
| Local state | useState | Form inputs, toggles | Component-scoped |
| Auth state | Supabase SDK | Session, user object | Built-in |

**TanStack Query Configuration (Mobile):**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false, // CRITICAL for mobile
    },
  },
});
```

### API Response Format

```typescript
// Success
{ "data": { ... }, "meta": { "timestamp": "2025-12-16T10:00:00Z" } }

// Error
{ "error": { "code": "GOAL_LIMIT_REACHED", "message": "Maximum 3 active goals" } }

// List
{ "data": [...], "meta": { "total": 42, "page": 1, "per_page": 20 } }
```

### Immutable Tables (NEVER UPDATE/DELETE)

**`subtask_completions` is append-only:**
```python
# ✅ Correct
supabase.table("subtask_completions").insert({...})

# ❌ FORBIDDEN
supabase.table("subtask_completions").update({...})  # NEVER
supabase.table("subtask_completions").delete()       # NEVER
```

Completions are canonical truth. Use `deleted_at` for soft deletes elsewhere.

### Data Access Decision Tree

1. **Auth or file storage?** → Supabase direct
2. **Simple read/write, no business logic?** → Supabase direct
3. **AI involvement?** → FastAPI
4. **Complex validation or multi-table transaction?** → FastAPI

---

## Testing Essentials

### Test Structure

- **Mobile:** Co-located `*.test.tsx` with Jest + React Native Testing Library
- **Backend:** `api/tests/` directory with pytest

### Mock AI Provider (Use for 99% of tests)

```python
# tests/mocks/ai_providers.py
from unittest.mock import MagicMock

@pytest.fixture
def mock_openai():
    with patch('openai.ChatCompletion.create') as mock:
        mock.return_value = {
            "choices": [{
                "message": {"content": "Mock AI response"}
            }]
        }
        yield mock

# Usage in test
def test_generate_triad(mock_openai):
    result = generate_triad(user_id="test")
    assert result["triad"] == "Mock AI response"
    mock_openai.assert_called_once()
```

**Real API Test (1 token test for status verification):**
```python
@pytest.mark.integration  # Mark as integration test
def test_openai_api_status():
    """Single token test to verify OpenAI API is accessible"""
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": "Hi"}],
        max_tokens=1
    )
    assert response.choices[0].message.content is not None
```

### TanStack Query Test Setup

```typescript
// __tests__/setup.ts
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
)
```

### Test Coverage Minimum

```
✅ All API endpoints: ≥1 test (happy path + 1 error case)
✅ All custom hooks: ≥1 test
✅ Mock AI in tests (except 1 status check test)
⚠️ UI component tests: Optional for MVP
```

---

## AI Cost Control

**Model Selection (Internal Cost Tracking):**

| Use Case | Model | Cost | When |
|----------|-------|------|------|
| Routine (90%) | GPT-4o-mini | $0.15/$0.60 per MTok | Triads, recaps, simple chat |
| Complex (10%) | Claude 3.7 Sonnet | $3/$15 per MTok | Onboarding, coaching |

**Rules:**
- Most screens should NOT call AI
- Batch AI calls around journal time
- Never call AI on render or in loops
- Use `BackgroundTasks` for AI calls >2s

**Reference:** See `docs/analysis/cost-analysis.md` for detailed pricing and budget tracking.

---

## Date Handling (Timezone-Aware)

```typescript
// API/Database: Always ISO 8601
"2025-12-16T10:30:00Z"  // timestamps with timezone
"2025-12-16"            // local_date (no time component)

// Store user timezone in user_profiles
// All dates are user's local calendar day
```

---

## Dangerous Operations Checklist

**NEVER:**
- ❌ UPDATE/DELETE from `subtask_completions`
- ❌ Store server data in Zustand (use TanStack Query)
- ❌ Call AI models on screen render
- ❌ Mix naming conventions (snake_case in TS, camelCase in Python)
- ❌ Use relative dates (always ISO 8601 + timezone)

**ALWAYS:**
- ✅ Transform snake_case ↔ camelCase at API boundary only
- ✅ Validate with Zod before database writes
- ✅ Use signed URLs for file uploads (not direct storage)
- ✅ Pass JWT in `Authorization: Bearer {token}` header
- ✅ Check RLS policies before marking table "production ready"

---

## Project Initialization

```bash
# Mobile (Expo + React Native)
npx create-expo-app weave-mobile --template blank-typescript
cd weave-mobile
npx expo install expo-router expo-linking expo-constants
npm install @supabase/supabase-js nativewind @tanstack/react-query zustand

# Backend (FastAPI + Python)
mkdir weave-api && cd weave-api
uv init
uv add fastapi "uvicorn[standard]" supabase python-dotenv openai anthropic pydantic-settings
```

**Reference:** See `docs/setup/initialization.md` for complete setup guide including Supabase project creation, environment variables, and RLS policies.

---

## Quick Reference Links

- **Architecture:** `docs/architecture.md` - Complete architectural decisions
- **PRD:** `docs/prd.md` - Product requirements and epics
- **Cost Analysis:** `docs/analysis/cost-analysis.md` - AI budget tracking
- **Setup Guide:** `docs/setup/initialization.md` - Detailed scaffolding

---

**Last Updated:** 2025-12-16

# Backend Patterns Guide

**Story 1.5.2: Backend API/Model Standardization**

This guide provides standardized patterns for implementing backend APIs in the Weave project. Following these patterns ensures consistency, maintainability, and quality across all Epic 2-8 implementations.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [API Patterns](#api-patterns)
3. [Database Patterns](#database-patterns)
4. [Pydantic Schemas](#pydantic-schemas)
5. [Service Layer](#service-layer)
6. [Error Handling](#error-handling)
7. [Testing](#testing)
8. [Complete Examples](#complete-examples)
9. [Scaffolding Tools](#scaffolding-tools)

---

## Quick Start

**New to Weave backend?** Start here:

1. **Generate scaffolding** for your resource:
   ```bash
   python scripts/generate_api.py goal
   ```

2. **Register router** in `app/main.py`:
   ```python
   from app.api.goals import router as goals_router
   app.include_router(goals_router)
   ```

3. **Implement endpoint logic** (replace 501 placeholders)

4. **Write tests** (implement `pytest.skip()` cases)

5. **Run tests**:
   ```bash
   uv run pytest tests/test_goals_api.py -v
   ```

---

## API Patterns

### REST Naming Conventions

| Operation | Method | Endpoint | Status | Response |
|-----------|--------|----------|--------|----------|
| List all | GET | `/api/goals` | 200 | `{data: [...], meta: {...}}` |
| Get one | GET | `/api/goals/{id}` | 200 | `{data: {...}, meta: {...}}` |
| Create | POST | `/api/goals` | 201 | `{data: {...}, meta: {...}}` |
| Update | PUT | `/api/goals/{id}` | 200 | `{data: {...}, meta: {...}}` |
| Delete | DELETE | `/api/goals/{id}` | 200 | `{data: {deleted: true}}` |

### Response Format

**All endpoints** must use this format:

```python
# Success (single item)
{
    "data": {
        "id": "uuid",
        "title": "Learn Spanish",
        ...
    },
    "meta": {
        "timestamp": "2025-12-23T10:00:00Z"
    }
}

# Success (list)
{
    "data": [{...}, {...}],
    "meta": {
        "total": 100,
        "page": 1,
        "per_page": 20,
        "timestamp": "2025-12-23T10:00:00Z"
    }
}

# Error
{
    "error": "NOT_FOUND",
    "message": "Goal with ID xxx not found",
    "retryable": false
}
```

### Authentication

**ALL protected endpoints** must use JWT middleware:

```python
from app.core.auth import get_current_user

@router.get("/api/goals")
async def list_goals(user: dict = Depends(get_current_user)):
    auth_user_id = user["sub"]  # Extract user ID from JWT
    # Implementation...
```

❌ **NEVER use placeholder auth:** `auth_user_id = "placeholder..."` is a **CRITICAL SECURITY VULNERABILITY**

### HTTP Status Codes

| Code | Usage | Example |
|------|-------|---------|
| 200 | Success (GET, PUT, DELETE) | Resource retrieved |
| 201 | Created (POST) | Resource created |
| 400 | Validation error | Invalid input |
| 401 | Unauthorized | Missing/invalid JWT |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not found | Resource doesn't exist |
| 429 | Rate limit | Too many requests |
| 500 | Server error | Unexpected error |
| 501 | Not implemented | Endpoint stub |

---

## Database Patterns

### Architecture

**This project uses Supabase (PostgreSQL), NOT SQLAlchemy ORM:**
- **Database tables:** Created via SQL migrations (`supabase/migrations/`)
- **Python models:** Pydantic models for API validation (NOT ORM models)
- **Data access:** Supabase Python client

### Table Naming Conventions

```sql
-- Tables: snake_case, plural
CREATE TABLE user_profiles (...);
CREATE TABLE journal_entries (...);

-- Columns: snake_case
user_id UUID
local_date DATE
scheduled_for_date TIMESTAMPTZ

-- Foreign keys: {table}_id
user_id, goal_id, parent_id

-- Indexes: idx_{table}_{columns}
CREATE INDEX idx_goals_user_id ON goals(user_id);

-- Constraints: {table}_{column}_check
CONSTRAINT goals_status_check CHECK (status IN ('active', 'completed'))
```

### Standard Table Structure

Every table must have:

```sql
CREATE TABLE goals (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign keys
    user_id UUID NOT NULL REFERENCES user_profiles(id),

    -- Resource-specific columns
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',

    -- Standard timestamps (REQUIRED)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL  -- Soft delete
);

-- Auto-update trigger
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Story 0.4)
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_goals" ON goals
    FOR ALL
    USING (user_id IN (
        SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()::text
    ));
```

### Soft Delete Pattern

**DO NOT hard delete user data** - use soft delete:

```python
# Soft delete (set deleted_at timestamp)
supabase.table('goals').update({
    'deleted_at': datetime.utcnow().isoformat()
}).eq('id', goal_id).execute()

# Query active records only
supabase.table('goals').select('*').is_('deleted_at', 'null').execute()
```

---

## Pydantic Schemas

### Schema Naming

```python
# Create schema (POST requests)
class GoalCreate(BaseCreateModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None

# Update schema (PUT requests)
class GoalUpdate(BaseUpdateModel):
    title: Optional[str] = None  # All fields optional
    description: Optional[str] = None

# Response schema (returned by all endpoints)
class GoalResponse(BaseResponseModel):
    id: UUID
    user_id: UUID
    title: str
    description: Optional[str]
    created_at: datetime
    updated_at: datetime
```

### Field Validation

```python
from pydantic import Field, field_validator

class GoalCreate(BaseCreateModel):
    title: str = Field(..., min_length=3, max_length=255)

    @field_validator('title')
    @classmethod
    def validate_title(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Title cannot be empty")
        return v
```

### Base Models

Use base classes for consistency:

```python
from app.models.base import BaseCreateModel, BaseUpdateModel, BaseResponseModel

# Inherit from appropriate base class
class GoalCreate(BaseCreateModel):
    # Only include fields user provides (not id, timestamps)
    pass

class GoalUpdate(BaseUpdateModel):
    # All fields Optional for partial updates
    pass

class GoalResponse(BaseResponseModel):
    # Includes id, created_at, updated_at, deleted_at from base
    pass
```

---

## Service Layer

### Decision Tree

**Default to inline logic in routers.** Only create service classes when:

✅ **Create Service Class When:**
- Complex business logic (>20 lines)
- Multi-table transactions
- Reusable across multiple endpoints
- AI integrations
- External API calls

❌ **Use Inline Logic When:**
- Simple CRUD operations
- Single table operations
- <20 lines of code
- No complex validation

### Example: Inline Logic (Preferred)

```python
@router.get("/api/goals")
async def list_goals(user: dict = Depends(get_current_user)):
    """Simple query - no service needed"""
    auth_user_id = user["sub"]

    response = supabase.table('goals').select('*').eq(
        'user_id', auth_user_id
    ).is_('deleted_at', 'null').execute()

    return {
        "data": response.data,
        "meta": {"timestamp": datetime.utcnow().isoformat() + "Z"}
    }
```

### Example: Service Class (For Complex Logic)

```python
# Only for complex operations like AI goal breakdown
class GoalBreakdownService:
    async def generate_goal_breakdown(self, user_id: str, goal_id: str):
        # 1. Load goal + context (multiple tables)
        # 2. Build AI prompt
        # 3. Call AI service
        # 4. Parse response
        # 5. Create subtasks
        # 6. Return structured breakdown
        pass
```

---

## Error Handling

### Standard Error Codes

Use `ErrorCode` constants from `app.core.errors`:

```python
from app.core.errors import ErrorCode, AppException

# Business logic error
if goal_count >= 3:
    raise AppException(
        code=ErrorCode.GOAL_LIMIT_EXCEEDED,
        message="Maximum 3 active goals allowed",
        status_code=400
    )

# Not found
if not goal:
    raise NotFoundException(resource="Goal", resource_id=goal_id)

# Rate limiting
raise RateLimitException(message="Too many AI requests", retry_after=60)
```

### Error Response Format

All errors use this format:

```python
{
    "error": "GOAL_LIMIT_EXCEEDED",
    "message": "Maximum 3 active goals allowed",
    "retryable": false,
    "details": {
        "current_count": 3,
        "max_allowed": 3
    }
}
```

### Exception Handler Registration

Add to `app/main.py`:

```python
from app.core.errors import (
    AppException,
    app_exception_handler,
    validation_exception_handler,
    generic_exception_handler
)

app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)
```

---

## Testing

### Test Structure

```python
# tests/test_goals_api.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_list_goals_success(auth_headers):
    response = client.get("/api/goals", headers=auth_headers)
    assert response.status_code == 200
    assert "data" in response.json()
    assert "meta" in response.json()
```

### Test Categories

✅ **Happy Path (must have):**
- Successful CRUD operations
- Valid response format
- Authentication working

✅ **Error Cases (must have):**
- 401 Unauthorized
- 404 Not Found
- 400 Validation Error
- Business rule violations

✅ **Security Tests (critical):**
- Users cannot access other users' resources
- RLS policies enforced

### Running Tests

```bash
# All tests
uv run pytest tests/test_goals_api.py -v

# Specific test
uv run pytest tests/test_goals_api.py::test_create_goal_success -v

# With coverage
uv run pytest tests/test_goals_api.py --cov=app.api.goals --cov-report=html
```

### Coverage Targets

- **80%+** for services
- **60%+** for routes
- **90%+** for critical paths (auth, payments)

---

## Complete Examples

### Example 1: Simple CRUD Endpoint

```python
# app/api/goals/router.py
from fastapi import APIRouter, Depends, HTTPException
from app.core.auth import get_current_user
from app.schemas.goal import GoalCreate, GoalResponse
from app.core.errors import ErrorCode

router = APIRouter(prefix="/api/goals", tags=["goals"])

@router.post("/", status_code=201, response_model=dict)
async def create_goal(
    data: GoalCreate,
    user: dict = Depends(get_current_user)
):
    """
    Create new goal

    Epic 2, Story 2.3: Create New Goal
    """
    auth_user_id = user["sub"]

    # Check goal limit (business rule)
    count_response = supabase.table('goals').select(
        'id', count='exact'
    ).eq('user_id', auth_user_id).eq(
        'status', 'active'
    ).is_('deleted_at', 'null').execute()

    if count_response.count >= 3:
        raise HTTPException(
            status_code=400,
            detail={
                "error": ErrorCode.GOAL_LIMIT_EXCEEDED,
                "message": "Maximum 3 active goals allowed",
                "details": {"current": count_response.count, "max": 3}
            }
        )

    # Create goal
    insert_response = supabase.table('goals').insert({
        'user_id': auth_user_id,
        **data.model_dump()
    }).execute()

    return {
        "data": GoalResponse.model_validate(insert_response.data[0]).model_dump(),
        "meta": {"timestamp": datetime.utcnow().isoformat() + "Z"}
    }
```

### Example 2: List with Pagination

```python
@router.get("/", response_model=dict)
async def list_goals(
    user: dict = Depends(get_current_user),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100)
):
    """List user's goals with pagination"""
    auth_user_id = user["sub"]

    # Calculate range
    start = (page - 1) * per_page
    end = page * per_page - 1

    # Query with pagination
    response = supabase.table('goals').select(
        '*', count='exact'
    ).eq('user_id', auth_user_id).is_(
        'deleted_at', 'null'
    ).range(start, end).execute()

    return {
        "data": response.data,
        "meta": {
            "total": response.count,
            "page": page,
            "per_page": per_page,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    }
```

---

## Scaffolding Tools

### Generate New API

```bash
# Generate router, schemas, and tests
python scripts/generate_api.py goal

# Custom plural form
python scripts/generate_api.py journal-entry journal-entries
```

### Generated Files

```
weave-api/
├── app/
│   ├── api/
│   │   └── goals/
│   │       ├── __init__.py
│   │       └── router.py          # API endpoints
│   └── schemas/
│       └── goal.py                # Pydantic models
└── tests/
    └── test_goals_api.py          # Integration tests
```

### Next Steps After Generation

1. **Register router** in `app/main.py`
2. **Implement endpoints** (replace 501 placeholders)
3. **Customize schemas** (add fields, validators)
4. **Write tests** (implement pytest.skip() cases)
5. **Run tests** and validate

---

## Quick Reference

### Common Patterns

```python
# JWT authentication
user: dict = Depends(get_current_user)
auth_user_id = user["sub"]

# Standard response
return {
    "data": {...},
    "meta": {"timestamp": datetime.utcnow().isoformat() + "Z"}
}

# Error handling
raise AppException(
    code=ErrorCode.VALIDATION_ERROR,
    message="Invalid input",
    status_code=400
)

# Soft delete
supabase.table('goals').update({
    'deleted_at': datetime.utcnow().isoformat()
}).eq('id', goal_id).execute()

# Query active records
supabase.table('goals').select('*').is_('deleted_at', 'null').execute()
```

---

## Additional Resources

- **Templates:** `scripts/templates/`
  - `api_router_template.py`
  - `pydantic_schema_template.py`
  - `service_template.py`
  - `test_template.py`

- **Error Utilities:** `weave-api/app/core/errors.py`

- **Base Models:** `weave-api/app/models/base.py`

- **API Endpoint Registry:** `docs/dev/backend-api-integration.md`

- **Architecture Rules:** `docs/architecture/implementation-patterns-consistency-rules.md`

---

## Support

Questions? Check:
1. This guide
2. Template files (`scripts/templates/`)
3. Existing implementations (`app/api/user/`, `app/api/ai/`)
4. CLAUDE.md standardization section

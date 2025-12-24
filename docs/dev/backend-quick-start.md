# Backend Quick Start Guide

**Story 1.5.2 (AC-11): Template Usability Improvements**

Complete step-by-step guide to implementing your first API endpoint using Story 1.5.2 backend standardization patterns.

---

## 📖 Table of Contents

1. [Prerequisites](#prerequisites)
2. [5-Step Process Overview](#5-step-process-overview)
3. [Step-by-Step Walkthrough](#step-by-step-walkthrough)
4. [Common Patterns](#common-patterns)
5. [Troubleshooting](#troubleshooting)
6. [Next Steps](#next-steps)

---

## Prerequisites

Before creating your first API endpoint, ensure these foundation pieces are in place:

### ✅ Foundation Stories Complete

- **Story 0.2:** Database schema exists (tables, columns, RLS policies)
- **Story 0.3:** Authentication flow (JWT middleware, `get_current_user` dependency)
- **Story 0.4:** Row Level Security (RLS policies enforce user data isolation)
- **Story 0.8:** Error handling framework (standardized error codes via Story 1.5.2)

### ✅ Development Environment Ready

```bash
# Backend setup
cd weave-api
uv sync  # Install dependencies

# Test server starts
uv run uvicorn app.main:app --reload
# Should see: INFO:     Uvicorn running on http://127.0.0.1:8000

# Test database connection
# (Supabase credentials in .env)
```

### ✅ Story Requirements Understood

- [ ] Read your story file in `docs/stories/[story-name].md`
- [ ] Understand acceptance criteria
- [ ] Know which API endpoints to create
- [ ] Reviewed `docs/dev/backend-patterns-guide.md`

**Estimated Time:** 30-45 minutes for first endpoint, 15-20 minutes for subsequent endpoints

---

## 5-Step Process Overview

Creating a new API endpoint follows this pattern:

```
1. Generate Scaffold (2 min)     → Run generate_api.py script
   ↓
2. Define Schemas (5 min)         → Edit Pydantic models (Create, Update, Response)
   ↓
3. Implement Router (15 min)      → Replace 501 stubs with business logic
   ↓
4. Write Tests (5 min)            → Replace 501 tests with real integration tests
   ↓
5. Register & Test (3 min)        → Add router to main.py, run tests
```

**Total Time:** ~30 minutes

---

## Step-by-Step Walkthrough

We'll implement the **Goals API** as a complete example (Epic 2, Story 2.1-2.5).

### Step 1: Generate API Scaffold (2 minutes)

Run the scaffolding script to auto-generate boilerplate:

```bash
cd weave-api
python scripts/generate_api.py goal
```

**Output:**
```
✅ Generated API scaffold for 'goal'

Files created:
  - app/api/goals/router.py (5 CRUD endpoints with 501 stubs)
  - app/schemas/goal.py (GoalCreate, GoalUpdate, GoalResponse)
  - tests/test_goals_api.py (5 integration tests)

Next steps:
  1. Define schemas in app/schemas/goal.py
  2. Implement router logic in app/api/goals/router.py
  3. Register router in app/main.py
  4. Run tests: uv run pytest tests/test_goals_api.py -v

See docs/dev/backend-quick-start.md for detailed walkthrough
```

**Files Generated:**
1. **`app/api/goals/router.py`** - FastAPI router with 5 CRUD endpoint stubs
2. **`app/schemas/goal.py`** - Pydantic schemas (GoalCreate, GoalUpdate, GoalResponse)
3. **`tests/test_goals_api.py`** - Integration tests for all endpoints

---

### Step 2: Define Schemas (5 minutes)

Open `app/schemas/goal.py` and define your request/response models:

```python
"""
Pydantic schemas for Goal resource
Epic 2: Goal Management
"""

from pydantic import Field, validator
from typing import Optional
from datetime import datetime
from uuid import UUID

from app.models.base import BaseCreateModel, BaseUpdateModel, BaseResponseModel


class GoalCreate(BaseCreateModel):
    """Schema for creating a new goal"""

    title: str = Field(..., min_length=1, max_length=255, description="Goal title")
    description: Optional[str] = Field(None, max_length=1000, description="Goal description")
    is_quantifiable: bool = Field(False, description="Whether goal has measurable metrics")
    target_value: Optional[float] = Field(None, ge=0, description="Target value for quantifiable goals")
    target_unit: Optional[str] = Field(None, max_length=50, description="Unit of measurement (e.g., 'kg', 'miles')")

    @validator('target_value')
    def validate_target_value(cls, v, values):
        """If goal is quantifiable, target_value is required"""
        if values.get('is_quantifiable') and v is None:
            raise ValueError("target_value required for quantifiable goals")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Run 5K Marathon",
                "description": "Complete a 5K run by end of month",
                "is_quantifiable": True,
                "target_value": 5.0,
                "target_unit": "km"
            }
        }


class GoalUpdate(BaseUpdateModel):
    """Schema for updating an existing goal (partial updates allowed)"""

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    is_quantifiable: Optional[bool] = None
    target_value: Optional[float] = Field(None, ge=0)
    target_unit: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field(None, regex="^(active|archived|completed)$")


class GoalResponse(BaseResponseModel):
    """Schema for goal response"""

    # From BaseResponseModel: id, created_at, updated_at, deleted_at
    user_id: UUID
    title: str
    description: Optional[str]
    is_quantifiable: bool
    target_value: Optional[float]
    target_unit: Optional[str]
    status: str  # "active" | "archived" | "completed"

    # Computed fields (optional)
    bind_count: Optional[int] = Field(None, description="Number of associated binds")
    completion_percentage: Optional[float] = Field(None, ge=0, le=100, description="Goal completion %")

    class Config:
        from_attributes = True  # Allows ORM object conversion
```

**Key Points:**
- **GoalCreate:** All required fields, validation rules, example data
- **GoalUpdate:** All fields optional (supports partial updates via PUT/PATCH)
- **GoalResponse:** Includes computed fields, matches database schema
- **Validation:** Custom validators for business logic (`@validator`)
- **Config:** `from_attributes = True` enables SQLAlchemy object conversion

---

### Step 3: Implement Router Logic (15 minutes)

Open `app/api/goals/router.py` and replace the 501 stubs with real implementation:

#### **3.1: List Goals (GET /api/goals)**

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from datetime import datetime

from app.core.deps import get_current_user, get_supabase_client
from app.core.errors import ErrorCode, NotFoundException, ValidationException
from app.schemas.goal import GoalCreate, GoalUpdate, GoalResponse
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/goals", tags=["goals"])


@router.get("/", response_model=dict)
async def list_goals(
    user: dict = Depends(get_current_user),
    status: str = Query("active", regex="^(active|archived|completed|all)$"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    supabase = Depends(get_supabase_client)
):
    """
    List user's goals with filtering and pagination
    Epic 2, Story 2.1: View Goals List

    Query Parameters:
        status: Filter by status ("active", "archived", "completed", "all")
        page: Page number (default: 1)
        per_page: Items per page (default: 20, max: 100)
    """
    auth_user_id = user["sub"]  # Extract user ID from JWT

    # Get user's internal ID from user_profiles table
    user_profile = supabase.table("user_profiles") \
        .select("id") \
        .eq("auth_user_id", auth_user_id) \
        .single() \
        .execute()

    if not user_profile.data:
        raise NotFoundException(resource="User Profile", resource_id=auth_user_id)

    internal_user_id = user_profile.data["id"]

    # Build query with RLS enforcement
    query = supabase.table("goals") \
        .select("*") \
        .eq("user_id", internal_user_id) \
        .is_("deleted_at", None)  # Exclude soft-deleted goals

    # Apply status filter
    if status != "all":
        query = query.eq("status", status)

    # Apply pagination
    offset = (page - 1) * per_page
    query = query.order("created_at", desc=True) \
                 .range(offset, offset + per_page - 1)

    # Execute query
    response = query.execute()

    # Get total count for pagination metadata
    count_query = supabase.table("goals") \
        .select("id", count="exact") \
        .eq("user_id", internal_user_id) \
        .is_("deleted_at", None)

    if status != "all":
        count_query = count_query.eq("status", status)

    count_response = count_query.execute()
    total_count = count_response.count if count_response.count else 0

    return {
        "data": response.data,
        "meta": {
            "total": total_count,
            "page": page,
            "per_page": per_page,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    }
```

#### **3.2: Get Goal by ID (GET /api/goals/{goal_id})**

```python
@router.get("/{goal_id}", response_model=dict)
async def get_goal(
    goal_id: str,
    user: dict = Depends(get_current_user),
    supabase = Depends(get_supabase_client)
):
    """
    Get goal details by ID with ownership check
    Epic 2, Story 2.2: View Goal Details
    """
    auth_user_id = user["sub"]

    # Get user's internal ID
    user_profile = supabase.table("user_profiles") \
        .select("id") \
        .eq("auth_user_id", auth_user_id) \
        .single() \
        .execute()

    if not user_profile.data:
        raise NotFoundException(resource="User Profile", resource_id=auth_user_id)

    internal_user_id = user_profile.data["id"]

    # Fetch goal with ownership check (RLS enforced)
    response = supabase.table("goals") \
        .select("*") \
        .eq("id", goal_id) \
        .eq("user_id", internal_user_id) \
        .is_("deleted_at", None) \
        .single() \
        .execute()

    if not response.data:
        raise NotFoundException(resource="Goal", resource_id=goal_id)

    return {
        "data": response.data,
        "meta": {
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    }
```

#### **3.3: Create Goal (POST /api/goals)**

```python
@router.post("/", status_code=201, response_model=dict)
async def create_goal(
    data: GoalCreate,
    user: dict = Depends(get_current_user),
    supabase = Depends(get_supabase_client)
):
    """
    Create new goal with AI breakdown (optional)
    Epic 2, Story 2.3: Create New Goal with AI

    Business Rules:
        - Max 3 active goals per user
        - Title must be unique per user
    """
    auth_user_id = user["sub"]

    # Get user's internal ID
    user_profile = supabase.table("user_profiles") \
        .select("id") \
        .eq("auth_user_id", auth_user_id) \
        .single() \
        .execute()

    if not user_profile.data:
        raise NotFoundException(resource="User Profile", resource_id=auth_user_id)

    internal_user_id = user_profile.data["id"]

    # Check goal limit (max 3 active goals)
    active_count = supabase.table("goals") \
        .select("id", count="exact") \
        .eq("user_id", internal_user_id) \
        .eq("status", "active") \
        .is_("deleted_at", None) \
        .execute()

    if active_count.count >= 3:
        raise ValidationException(
            message="Maximum 3 active goals allowed. Archive a goal before creating new one.",
            details={"current_count": active_count.count, "max_allowed": 3}
        )

    # Create goal
    goal_data = {
        "user_id": internal_user_id,
        "title": data.title,
        "description": data.description,
        "is_quantifiable": data.is_quantifiable,
        "target_value": data.target_value,
        "target_unit": data.target_unit,
        "status": "active"  # New goals are always active
    }

    response = supabase.table("goals") \
        .insert(goal_data) \
        .execute()

    if not response.data:
        raise HTTPException(
            status_code=500,
            detail="Failed to create goal"
        )

    logger.info(f"Created goal {response.data[0]['id']} for user {internal_user_id}")

    return {
        "data": response.data[0],
        "meta": {
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    }
```

#### **3.4: Update Goal (PUT /api/goals/{goal_id})**

```python
@router.put("/{goal_id}", response_model=dict)
async def update_goal(
    goal_id: str,
    data: GoalUpdate,
    user: dict = Depends(get_current_user),
    supabase = Depends(get_supabase_client)
):
    """
    Update existing goal (partial updates allowed)
    Epic 2, Story 2.4: Edit Goal
    """
    auth_user_id = user["sub"]

    # Get user's internal ID
    user_profile = supabase.table("user_profiles") \
        .select("id") \
        .eq("auth_user_id", auth_user_id) \
        .single() \
        .execute()

    if not user_profile.data:
        raise NotFoundException(resource="User Profile", resource_id=auth_user_id)

    internal_user_id = user_profile.data["id"]

    # Check goal exists and user owns it
    existing = supabase.table("goals") \
        .select("*") \
        .eq("id", goal_id) \
        .eq("user_id", internal_user_id) \
        .is_("deleted_at", None) \
        .single() \
        .execute()

    if not existing.data:
        raise NotFoundException(resource="Goal", resource_id=goal_id)

    # Build update dict (only include fields that were provided)
    update_data = data.model_dump(exclude_unset=True, exclude_none=True)

    if not update_data:
        raise ValidationException(message="No fields provided to update")

    # Update goal
    response = supabase.table("goals") \
        .update(update_data) \
        .eq("id", goal_id) \
        .execute()

    logger.info(f"Updated goal {goal_id} for user {internal_user_id}")

    return {
        "data": response.data[0],
        "meta": {
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    }
```

#### **3.5: Archive Goal (PUT /api/goals/{goal_id}/archive)**

```python
@router.put("/{goal_id}/archive", response_model=dict)
async def archive_goal(
    goal_id: str,
    user: dict = Depends(get_current_user),
    supabase = Depends(get_supabase_client)
):
    """
    Archive goal (soft delete, status → "archived")
    Epic 2, Story 2.5: Archive Goal
    """
    auth_user_id = user["sub"]

    # Get user's internal ID
    user_profile = supabase.table("user_profiles") \
        .select("id") \
        .eq("auth_user_id", auth_user_id) \
        .single() \
        .execute()

    if not user_profile.data:
        raise NotFoundException(resource="User Profile", resource_id=auth_user_id)

    internal_user_id = user_profile.data["id"]

    # Check goal exists and user owns it
    existing = supabase.table("goals") \
        .select("*") \
        .eq("id", goal_id) \
        .eq("user_id", internal_user_id) \
        .is_("deleted_at", None) \
        .single() \
        .execute()

    if not existing.data:
        raise NotFoundException(resource="Goal", resource_id=goal_id)

    # Archive goal (change status to "archived")
    response = supabase.table("goals") \
        .update({"status": "archived"}) \
        .eq("id", goal_id) \
        .execute()

    logger.info(f"Archived goal {goal_id} for user {internal_user_id}")

    return {
        "data": response.data[0],
        "meta": {
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    }
```

**Key Implementation Patterns:**
- ✅ **JWT Authentication:** Always use `Depends(get_current_user)` for protected endpoints
- ✅ **User ID Extraction:** `auth_user_id = user["sub"]` → lookup in `user_profiles`
- ✅ **RLS Enforcement:** Always filter by `user_id` and `deleted_at IS NULL`
- ✅ **Error Handling:** Use custom exceptions (`NotFoundException`, `ValidationException`)
- ✅ **Response Format:** Always return `{data, meta}` wrapper
- ✅ **Logging:** Log important operations (create, update, delete)
- ✅ **Validation:** Enforce business rules (goal limit, status transitions)

---

### Step 4: Write Tests (5 minutes)

Open `tests/test_goals_api.py` and replace 501 tests with real integration tests:

```python
"""
Integration Tests for Goals API
Epic 2: Goal Management
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# TODO: Replace with real auth fixture from conftest.py
@pytest.fixture
def auth_headers():
    """Mock JWT auth headers for testing"""
    # In real tests, use test user JWT from Story 0.3
    return {"Authorization": "Bearer test-jwt-token"}


def test_list_goals_empty(auth_headers):
    """Test listing goals when user has none"""
    response = client.get("/api/goals", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "meta" in data
    assert data["meta"]["total"] == 0
    assert data["meta"]["page"] == 1


def test_create_goal_success(auth_headers):
    """Test creating a new goal"""
    payload = {
        "title": "Run 5K Marathon",
        "description": "Complete a 5K run by end of month",
        "is_quantifiable": True,
        "target_value": 5.0,
        "target_unit": "km"
    }

    response = client.post("/api/goals", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["data"]["title"] == "Run 5K Marathon"
    assert data["data"]["status"] == "active"
    assert "id" in data["data"]


def test_create_goal_validation_error(auth_headers):
    """Test creating goal with invalid data"""
    payload = {
        "title": "",  # Empty title should fail
        "is_quantifiable": False
    }

    response = client.post("/api/goals", json=payload, headers=auth_headers)
    assert response.status_code == 400
    error = response.json()
    assert error["error"] == "VALIDATION_ERROR"
    assert "retryable" in error


def test_create_goal_limit_exceeded(auth_headers):
    """Test creating goal when 3 active goals already exist"""
    # Create 3 goals first
    for i in range(3):
        payload = {"title": f"Goal {i+1}", "is_quantifiable": False}
        response = client.post("/api/goals", json=payload, headers=auth_headers)
        assert response.status_code == 201

    # 4th goal should fail
    payload = {"title": "Goal 4", "is_quantifiable": False}
    response = client.post("/api/goals", json=payload, headers=auth_headers)
    assert response.status_code == 400
    error = response.json()
    assert error["error"] == "VALIDATION_ERROR"
    assert "3 active goals" in error["message"]


def test_get_goal_not_found(auth_headers):
    """Test getting non-existent goal"""
    response = client.get("/api/goals/non-existent-id", headers=auth_headers)
    assert response.status_code == 404
    error = response.json()
    assert error["error"] == "NOT_FOUND"


def test_update_goal_success(auth_headers):
    """Test updating an existing goal"""
    # Create goal first
    create_payload = {"title": "Original Title", "is_quantifiable": False}
    create_response = client.post("/api/goals", json=create_payload, headers=auth_headers)
    goal_id = create_response.json()["data"]["id"]

    # Update goal
    update_payload = {"title": "Updated Title"}
    response = client.put(f"/api/goals/{goal_id}", json=update_payload, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["data"]["title"] == "Updated Title"


def test_archive_goal_success(auth_headers):
    """Test archiving a goal"""
    # Create goal first
    create_payload = {"title": "Goal to Archive", "is_quantifiable": False}
    create_response = client.post("/api/goals", json=create_payload, headers=auth_headers)
    goal_id = create_response.json()["data"]["id"]

    # Archive goal
    response = client.put(f"/api/goals/{goal_id}/archive", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["data"]["status"] == "archived"
```

**Testing Checklist:**
- ✅ Happy path (success cases)
- ✅ Validation errors (400)
- ✅ Not found errors (404)
- ✅ Business logic errors (goal limit, status transitions)
- ✅ Authentication (401) - tested by FastAPI middleware
- ✅ Authorization (403) - tested by RLS policies

---

### Step 5: Register Router & Test (3 minutes)

#### **5.1: Register Router in main.py**

Open `app/main.py` and add your new router:

```python
from app.api import (
    # ... existing routers ...
    goals,  # Add this import
)

# Register router
app.include_router(goals.router, tags=["goals"])
```

#### **5.2: Run Tests**

```bash
cd weave-api

# Run all tests for your new API
uv run pytest tests/test_goals_api.py -v

# Expected output:
# tests/test_goals_api.py::test_list_goals_empty PASSED
# tests/test_goals_api.py::test_create_goal_success PASSED
# tests/test_goals_api.py::test_create_goal_validation_error PASSED
# tests/test_goals_api.py::test_get_goal_not_found PASSED
# tests/test_goals_api.py::test_update_goal_success PASSED
# tests/test_goals_api.py::test_archive_goal_success PASSED
#
# ========================= 6 passed in 2.34s =========================
```

#### **5.3: Manual Testing**

```bash
# Start development server
uv run uvicorn app.main:app --reload

# Test endpoints with curl or Postman
curl http://localhost:8000/api/goals \
  -H "Authorization: Bearer <your-jwt-token>"
```

#### **5.4: Interactive API Docs**

Open browser: **http://localhost:8000/docs**

- See all endpoints with auto-generated Swagger UI
- Test endpoints directly from browser
- View request/response schemas

---

## Common Patterns

### Pagination

```python
@router.get("/", response_model=dict)
async def list_resources(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100)
):
    offset = (page - 1) * per_page

    response = supabase.table("table_name") \
        .select("*") \
        .range(offset, offset + per_page - 1) \
        .execute()

    # Get total count
    count = supabase.table("table_name") \
        .select("id", count="exact") \
        .execute()

    return {
        "data": response.data,
        "meta": {
            "total": count.count,
            "page": page,
            "per_page": per_page
        }
    }
```

### Filtering

```python
@router.get("/", response_model=dict)
async def list_resources(
    status: Optional[str] = Query(None, regex="^(active|archived)$"),
    search: Optional[str] = Query(None, max_length=100)
):
    query = supabase.table("table_name").select("*")

    if status:
        query = query.eq("status", status)

    if search:
        query = query.ilike("title", f"%{search}%")

    response = query.execute()
    return {"data": response.data}
```

### Sorting

```python
@router.get("/", response_model=dict)
async def list_resources(
    sort_by: str = Query("created_at", regex="^(created_at|title|status)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$")
):
    response = supabase.table("table_name") \
        .select("*") \
        .order(sort_by, desc=(sort_order == "desc")) \
        .execute()

    return {"data": response.data}
```

### Error Handling with app.core.errors

```python
from app.core.errors import (
    ErrorCode,
    AppException,
    ValidationException,
    NotFoundException,
    RateLimitException
)

# Business logic error
if goal_count >= 3:
    raise AppException(
        code=ErrorCode.GOAL_LIMIT_EXCEEDED,
        message="Maximum 3 active goals allowed",
        status_code=400,
        details={"current_count": goal_count}
    )

# Not found
if not resource:
    raise NotFoundException(resource="Goal", resource_id=goal_id)

# Validation error with details
if score < 0 or score > 10:
    raise ValidationException(
        message="Score must be between 0 and 10",
        details={"field": "score", "value": score}
    )

# Rate limiting with retry_after
if ai_calls_today >= 10:
    raise RateLimitException(
        message="Too many AI requests. Try again in 1 hour.",
        retry_after=3600
    )
```

### Service Layer (When to Extract)

**Use inline logic (default):**
- Simple CRUD operations
- <20 lines of code
- Single table operations
- No complex business logic

**Create service class when:**
- Complex business logic (>20 lines)
- Multi-table transactions
- Reusable across multiple endpoints
- AI integrations

**Example Service:**
```python
# app/services/goal_service.py
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

class GoalService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_goal_with_ai_breakdown(
        self, user_id: str, data: GoalCreate
    ) -> dict:
        """Complex operation: Create goal + generate AI breakdown"""
        # Business logic here
        pass
```

---

## Troubleshooting

### Router Not Registered

**Symptom:** 404 Not Found when calling endpoint

**Solution:**
```python
# Check app/main.py
from app.api import goals  # Import missing?
app.include_router(goals.router, tags=["goals"])  # Router registered?
```

### Authentication Failing

**Symptom:** 401 Unauthorized on all endpoints

**Solution:**
```python
# Check import in router
from app.core.deps import get_current_user  # Correct import?

# Check dependency usage
@router.get("/")
async def endpoint(user: dict = Depends(get_current_user)):  # Correct?
    auth_user_id = user["sub"]  # Extract user ID

# Check JWT token format
Authorization: Bearer <valid-jwt-token>
```

### Tests Failing

**Symptom:** pytest errors or assertion failures

**Solution:**
```python
# Check fixtures in conftest.py
@pytest.fixture
def auth_headers():
    return {"Authorization": "Bearer test-token"}

# Check test database setup
# Use test Supabase project or mock database

# Check import paths
from app.main import app  # Correct app import?
```

### Database Errors

**Symptom:** Supabase connection errors or RLS denials

**Solution:**
```bash
# Check environment variables
cat .env | grep SUPABASE
# Should have: SUPABASE_URL, SUPABASE_KEY

# Check RLS policies
# Use Supabase dashboard → Authentication → Policies
# Verify user_id filtering policy exists

# Test RLS directly
npx supabase test db  # Run RLS tests
```

### Import Errors

**Symptom:** `ModuleNotFoundError` or `ImportError`

**Solution:**
```bash
# Reinstall dependencies
uv sync

# Check Python path
echo $PYTHONPATH  # Should include weave-api/

# Check file structure
ls app/api/goals/  # Router file exists?
ls app/schemas/    # Schemas file exists?
```

### Validation Errors Not Showing

**Symptom:** Generic 400 errors instead of specific validation messages

**Solution:**
```python
# Check Pydantic model configuration
class GoalCreate(BaseCreateModel):
    field: str = Field(..., min_length=1)  # Validation defined?

    @validator('field')
    def validate_field(cls, v):  # Custom validator?
        # Validation logic
        return v

# Check exception handler registration (main.py)
from app.core.errors import validation_exception_handler
app.add_exception_handler(RequestValidationError, validation_exception_handler)
```

---

## Next Steps

### For Your Second Endpoint

Now that you've implemented your first endpoint, subsequent endpoints will be faster (15-20 min):

1. **Run scaffolding:** `python scripts/generate_api.py <resource>`
2. **Copy patterns:** Reuse pagination, filtering, error handling from first endpoint
3. **Focus on business logic:** Most boilerplate is already there
4. **Test incrementally:** Write tests as you implement each endpoint

### Learning Resources

- **Backend Patterns Guide:** `docs/dev/backend-patterns-guide.md` - Comprehensive patterns reference
- **API Integration Guide:** `docs/dev/backend-api-integration.md` - 28 endpoint registry with Epic/Story mapping
- **API Error Codes:** `docs/api-error-codes.md` - Complete error code catalog with frontend handling
- **Story 1.5.2 Spec:** `docs/stories/1-5-2-backend-standardization.md` - Full standardization story

### Join the Team

- **Ask questions** in team Slack channel
- **Share learnings** - document patterns you discover
- **Improve templates** - suggest improvements to scaffolding script
- **Update docs** - found a bug? Submit a PR to fix it

---

## Feedback & Improvements

This guide is living documentation. If you:
- Find a confusing section → Create an issue
- Discover a better pattern → Submit a PR
- Hit a new error → Add it to Troubleshooting

**Story 1.5.2 (AC-11)** created this guide. **Your feedback makes it better.**

---

**Questions?** Check `docs/dev/backend-patterns-guide.md` or ask in Slack.

**Ready to implement Epic 2-8 APIs?** You now have everything you need. 🚀

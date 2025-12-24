# Story 1.5.2: Backend API/Model Standardization

**Status:** ready-for-dev
**Epic:** 1.5 - Development Infrastructure
**Priority:** S (Should Have)
**Estimate:** 7-9 story points
**Type:** Infrastructure

---

## Story

**As a** developer
**I want to** have standardized backend patterns and templates
**So that** I can implement Epic 2-8 APIs without making architectural decisions

---

## Overview / Rationale

Backend standardization prevents pattern divergence across 40+ API endpoints and 12+ database models in Epic 2-8. Like Story 1.5.1 established navigation templates, this story establishes backend templates, enabling developers to scaffold new APIs in minutes instead of hours.

**Epic 2-8 will require:**
- 28+ API endpoints across 7 routers
- 12+ database models (goals, subtasks, journal, captures, etc.)
- Consistent auth patterns (JWT + RLS)
- Standard error handling and validation
- Testing infrastructure for all endpoints

**This story establishes:**
1. **API Endpoint Templates** - FastAPI router patterns with auth, validation, error handling
2. **Database Model Conventions** - SQLAlchemy BaseModel with timestamps, soft delete
3. **Pydantic Schema Standards** - Request/response models with consistent naming
4. **Service Layer Decision Tree** - When to create service classes vs inline logic
5. **Error Handling Patterns** - Standard error codes (VALIDATION_ERROR, NOT_FOUND, etc.)
6. **Testing Conventions** - Pytest fixtures, integration test patterns
7. **Scaffolding Scripts** - Generate new API endpoints from templates
8. **28 Endpoint Stubs** - All Epic 2-8 routes returning 501 Not Implemented

**Benefits:**
- **Speed**: Scaffold new endpoints in minutes, not hours
- **Consistency**: All APIs follow same patterns (auth, validation, errors)
- **Quality**: Testing patterns ensure 80%+ coverage
- **Maintainability**: Standard patterns reduce cognitive load

---

## Acceptance Criteria

### AC-1: API Endpoint Standardization

**REST Naming Conventions:**
- [ ] Document REST resource naming: `GET /api/{resources}`, `POST /api/{resources}`, `GET /api/{resources}/{id}`
- [ ] Document query parameter patterns: `?user_id=xxx&local_date=2025-12-21` (snake_case)
- [ ] Document HTTP status codes:
  - 200 (success)
  - 201 (created)
  - 400 (validation error)
  - 401 (unauthorized)
  - 404 (not found)
  - 429 (rate limit exceeded)
  - 500 (internal server error)
  - 501 (not implemented)

**FastAPI Router Template:**
- [ ] Create template file: `scripts/templates/api_router_template.py`
- [ ] Include sections:
  - Imports (FastAPI, Depends, HTTPException, Pydantic models)
  - Auth dependency injection (`user = Depends(get_current_user)`)
  - Request/response Pydantic models
  - Error handling patterns
  - Logging setup
- [ ] Example endpoints:
  - GET list (with pagination, filters)
  - GET by ID (with 404 handling)
  - POST create (with validation)
  - PUT update (with partial updates)
  - DELETE soft delete (set `deleted_at`)

**Response Wrapper Format:**
- [ ] All success responses: `{"data": {...}, "meta": {"timestamp": "..."}}`
- [ ] All error responses: `{"error": {"code": "...", "message": "...", "retryable": bool}}`
- [ ] All list responses: `{"data": [...], "meta": {"total": N, "page": 1, "per_page": 20}}`

**Example Template Structure:**
```python
# scripts/templates/api_router_template.py
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from app.core.auth import get_current_user
from app.schemas.{resource} import {Resource}Create, {Resource}Update, {Resource}Response
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/{resources}", tags=["{resources}"])

@router.get("/", response_model=dict)
async def list_{resources}(
    user: dict = Depends(get_current_user),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100)
):
    """
    List user's {resources}
    Epic X, Story X.X: [Story Name]
    """
    raise HTTPException(
        status_code=501,
        detail={
            "error": "NOT_IMPLEMENTED",
            "message": "This endpoint has not been developed",
            "epic": "Epic X: [Epic Name]",
            "story": "Story X.X: [Story Name]"
        }
    )

@router.post("/", status_code=201, response_model=dict)
async def create_{resource}(
    data: {Resource}Create,
    user: dict = Depends(get_current_user)
):
    """
    Create new {resource}
    Epic X, Story X.X: [Story Name]
    """
    raise HTTPException(
        status_code=501,
        detail={
            "error": "NOT_IMPLEMENTED",
            "message": "This endpoint has not been developed",
            "epic": "Epic X: [Epic Name]",
            "story": "Story X.X: [Story Name]"
        }
    )
```

---

### AC-2: Database Model Standardization

**SQLAlchemy Base Model:**
- [ ] Create `BaseModel` class with common fields:
  - `id` (UUID, primary key)
  - `created_at` (timestamp with timezone)
  - `updated_at` (timestamp with timezone)
  - `deleted_at` (nullable timestamp for soft delete)
- [ ] Document table naming: `snake_case`, plural (e.g., `user_profiles`, `journal_entries`)
- [ ] Document column naming: `snake_case` (e.g., `user_id`, `local_date`, `scheduled_for_date`)
- [ ] Document foreign key naming: `{table}_id` (e.g., `user_id`, `goal_id`)
- [ ] Document index naming: `idx_{table}_{columns}` (e.g., `idx_completions_user_date`)

**Soft Delete Pattern:**
- [ ] Document soft delete convention: Set `deleted_at` timestamp instead of hard DELETE
- [ ] Document query filtering: Exclude `deleted_at IS NOT NULL` records by default
- [ ] Provide soft delete mixin class

**Example Base Model:**
```python
# weave-api/app/models/base.py
from sqlalchemy import Column, String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
import uuid

Base = declarative_base()

class BaseModel(Base):
    __abstract__ = True

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    def soft_delete(self):
        """Mark record as deleted (soft delete)"""
        self.deleted_at = func.now()

    @property
    def is_deleted(self):
        """Check if record is soft deleted"""
        return self.deleted_at is not None
```

---

### AC-3: Pydantic Schema Conventions

**Request/Response Models:**
- [ ] Naming pattern: `{Resource}Create`, `{Resource}Update`, `{Resource}Response`
- [ ] Example: `GoalCreate`, `GoalUpdate`, `GoalResponse`
- [ ] Document field validation patterns:
  - Min/max length for strings
  - Regex patterns for formats (email, phone, etc.)
  - Custom validators for business logic
  - Nested models for related entities
- [ ] Document optional vs required fields (Create vs Update)

**Template File:**
- [ ] Create `scripts/templates/pydantic_schema_template.py`
- [ ] Include:
  - Create schema (all required fields)
  - Update schema (all optional fields for partial updates)
  - Response schema (includes computed fields, relationships)

**Example Schema Template:**
```python
# scripts/templates/pydantic_schema_template.py
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class {Resource}Create(BaseModel):
    """Schema for creating a new {resource}"""
    field1: str = Field(..., min_length=1, max_length=255)
    field2: Optional[str] = Field(None, max_length=500)

    @validator('field1')
    def validate_field1(cls, v):
        # Custom validation logic
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "field1": "Example value",
                "field2": "Optional value"
            }
        }

class {Resource}Update(BaseModel):
    """Schema for updating an existing {resource}"""
    field1: Optional[str] = Field(None, min_length=1, max_length=255)
    field2: Optional[str] = Field(None, max_length=500)

class {Resource}Response(BaseModel):
    """Schema for {resource} response"""
    id: UUID
    field1: str
    field2: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

---

### AC-4: Service Layer Decision Tree

**Decision Tree:**
- [ ] **Inline logic** (default):
  - Simple CRUD operations
  - <20 lines of code
  - Single table operations
  - No complex business logic
  - Example: Get user profile, list goals

- [ ] **Service class**:
  - Complex business logic (>20 lines)
  - Multi-table transactions
  - Reusable across multiple endpoints
  - AI integrations
  - Example: Goal breakdown, triad generation, journal recap

- [ ] Document when NOT to create services (avoid premature abstraction)

**Service Template (when needed):**
- [ ] Create `scripts/templates/service_template.py`
- [ ] Include:
  - Async methods
  - Error handling with custom exceptions
  - Transaction management (commit/rollback)
  - Logging

**Example Service Template:**
```python
# scripts/templates/service_template.py
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.{resource} import {Resource}
from app.schemas.{resource} import {Resource}Create, {Resource}Update
import logging

logger = logging.getLogger(__name__)

class {Resource}Service:
    """Service for {resource} business logic"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_{resource}(self, user_id: str, data: {Resource}Create) -> {Resource}:
        """Create new {resource} with business logic"""
        try:
            # Business logic here
            {resource} = {Resource}(
                user_id=user_id,
                **data.dict()
            )
            self.db.add({resource})
            await self.db.commit()
            await self.db.refresh({resource})
            logger.info(f"Created {resource} {{resource}.id} for user {{user_id}}")
            return {resource}
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating {resource}: {{e}}")
            raise

    async def get_{resource}(self, {resource}_id: str, user_id: str) -> Optional[{Resource}]:
        """Get {resource} by ID with ownership check"""
        # Implementation
        pass
```

---

### AC-5: Error Handling Patterns

**Standard Error Codes:**
- [ ] Document error codes:
  - `VALIDATION_ERROR` - Invalid input data (400)
  - `NOT_FOUND` - Resource not found (404)
  - `UNAUTHORIZED` - Missing/invalid auth (401)
  - `FORBIDDEN` - Insufficient permissions (403)
  - `RATE_LIMIT_EXCEEDED` - Too many requests (429)
  - `INTERNAL_ERROR` - Server error (500)
  - `NOT_IMPLEMENTED` - Endpoint stub (501)

- [ ] Create error response utility: `format_error_response(code, message, retryable=False)`
- [ ] Document HTTP status mapping

**Error Handling Middleware:**
- [ ] Create FastAPI exception handlers for common errors
- [ ] Log errors with request context:
  - user_id
  - endpoint path
  - request_id
  - timestamp
  - error details

**Example Error Utilities:**
```python
# weave-api/app/core/errors.py
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class AppException(Exception):
    """Base exception for application errors"""
    def __init__(self, code: str, message: str, status_code: int = 500, retryable: bool = False):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.retryable = retryable
        super().__init__(message)

def format_error_response(code: str, message: str, retryable: bool = False) -> dict:
    """Standard error response format"""
    return {
        "error": {
            "code": code,
            "message": message,
            "retryable": retryable
        }
    }

async def app_exception_handler(request: Request, exc: AppException):
    """Global exception handler"""
    logger.error(f"AppException: {exc.code} - {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content=format_error_response(exc.code, exc.message, exc.retryable)
    )
```

---

### AC-6: Testing Patterns

**Pytest Fixtures:**
- [ ] Document fixture naming: `{resource}_fixture`, `auth_headers_fixture`
- [ ] Create reusable fixtures in `tests/conftest.py`:
  - Test database setup/teardown
  - Auth headers for authenticated requests
  - Sample data fixtures (user, goal, subtask, etc.)
- [ ] Document test database setup

**Integration Test Template:**
- [ ] Create `tests/test_example_api.py` demonstrating integration test pattern
- [ ] Include:
  - Auth setup
  - API calls (GET, POST, PUT, DELETE)
  - Response validation
  - Error case testing
  - Cleanup
- [ ] Document coverage targets:
  - 80%+ for services
  - 60%+ for routes
  - 90%+ for critical paths (auth, payments)

**Example Test Template:**
```python
# tests/test_{resource}_api.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_list_{resources}_not_implemented(auth_headers):
    """Test that {resources} list endpoint returns 501 Not Implemented"""
    response = client.get("/api/{resources}", headers=auth_headers)
    assert response.status_code == 501
    data = response.json()
    assert data["error"] == "NOT_IMPLEMENTED"
    assert "Epic" in data["epic"]
    assert "Story" in data["story"]

def test_create_{resource}_not_implemented(auth_headers):
    """Test that create {resource} endpoint returns 501 Not Implemented"""
    payload = {
        "field1": "test value",
        "field2": "optional value"
    }
    response = client.post("/api/{resources}", json=payload, headers=auth_headers)
    assert response.status_code == 501
```

---

### AC-7: Scaffolding Scripts

**API Scaffolding Script:**
- [ ] Create `scripts/generate_api.py` to scaffold new API endpoints
- [ ] Input: Resource name (e.g., "goal", "journal", "capture")
- [ ] Output:
  - Router file: `weave-api/app/api/{resource}_router.py`
  - Pydantic schemas: `weave-api/app/schemas/{resource}.py`
  - Test file: `weave-api/tests/test_{resource}_api.py`
  - All files have TODO placeholders for implementation
- [ ] Usage: `python scripts/generate_api.py goal`

**Example Script:**
```python
# scripts/generate_api.py
import sys
import os
from pathlib import Path

def generate_api_files(resource_name: str, resource_plural: str):
    """Generate router, schema, and test files for a new API resource"""
    # Implementation here
    pass

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/generate_api.py <resource_name>")
        sys.exit(1)

    resource_name = sys.argv[1]
    resource_plural = sys.argv[2] if len(sys.argv) > 2 else f"{resource_name}s"
    generate_api_files(resource_name, resource_plural)
```

---

### AC-8: Documentation

**Backend Patterns Guide:**
- [ ] Create `docs/dev/backend-patterns-guide.md`
- [ ] Sections:
  1. API Patterns (REST conventions, response format)
  2. Model Conventions (BaseModel, soft delete, naming)
  3. Pydantic Schemas (Create/Update/Response patterns)
  4. Error Handling (standard codes, middleware)
  5. Testing (fixtures, integration tests, coverage)
  6. Service Layer Decision Tree (when to use services)
  7. Complete Examples (2-3 full implementations)
- [ ] Include code examples for each pattern
- [ ] Link from CLAUDE.md standardization section

**Update Architecture Docs:**
- [ ] Update `docs/architecture/implementation-patterns-consistency-rules.md`
- [ ] Add section: "Backend Standardization (Story 1.5.2)"
- [ ] Link to `docs/dev/backend-patterns-guide.md`

---

### AC-9: API Endpoint Mapping (Pre-Create All Epic 2-8 Routes)

**Approach:** Similar to Story 1.5.1 which pre-created 15+ navigation screens, pre-create all API route stubs for Epic 2-8 with placeholder implementations.

**Complete Endpoint Registry (28 Endpoints):**

#### Epic 2: Goal Management (5 endpoints)
- [ ] `GET /api/goals` - List user's active goals (Story 2.1)
- [ ] `GET /api/goals/{id}` - Get goal details (Story 2.2)
- [ ] `POST /api/goals` - Create new goal with AI (Story 2.3)
- [ ] `PUT /api/goals/{id}` - Edit goal (Story 2.4)
- [ ] `PUT /api/goals/{id}/archive` - Archive goal (Story 2.5)

#### Epic 3: Daily Actions (4 endpoints)
- [ ] `GET /api/subtask-instances?local_date={date}` - Today's binds (Story 3.1)
- [ ] `POST /api/subtask-completions` - Mark bind complete (Story 3.3)
- [ ] `POST /api/captures` - Upload proof (photo/video/timer) (Story 3.3, 3.4)
- [ ] `GET /api/daily-aggregates?local_date={date}` - Daily stats (Story 3.1)

#### Epic 4: Reflection & Journaling (5 endpoints)
- [ ] `POST /api/journal-entries` - Submit daily reflection (Story 4.1)
- [ ] `GET /api/journal-entries` - List past journals (Story 4.5)
- [ ] `GET /api/journal-entries/{date}` - Get specific entry (Story 4.5)
- [ ] `POST /api/ai/recap` - Generate AI feedback (Story 4.3)
- [ ] `PUT /api/ai-artifacts/{id}` - Edit AI feedback (Story 4.4)

#### Epic 5: Progress Visualization (2 endpoints)
- [ ] `GET /api/user-stats` - Overall user metrics (Story 5.1)
- [ ] `GET /api/daily-aggregates?timeframe={7|30|60|90}` - Aggregates for heat map (Story 5.2, 5.3)

#### Epic 6: AI Coaching (3 endpoints)
- [ ] `POST /api/ai/chat` - Send message to Dream Self Advisor (Story 6.1, 6.2)
- [ ] `GET /api/ai/chat/history` - Chat conversation history (Story 6.1)
- [ ] `POST /api/ai/insights` - Trigger weekly insights (Story 6.4)

#### Epic 7: Notifications (4 endpoints)
- [ ] `POST /api/notifications/schedule` - Schedule notification (Story 7.1)
- [ ] `POST /api/notifications/bind-reminder` - Bind reminder (Story 7.2)
- [ ] `POST /api/notifications/reflection-prompt` - Evening prompt (Story 7.3)
- [ ] `POST /api/notifications/streak-recovery` - Recovery nudge (Story 7.4)

#### Epic 8: Settings & Profile (5 endpoints)
- [ ] `GET /api/user/profile` - Get user profile (Story 8.1)
- [ ] `PUT /api/user/profile` - Update profile (Story 8.1)
- [ ] `GET /api/user/export` - Data export (JSON) (Story 8.3)
- [ ] `DELETE /api/user/account` - Soft delete account (Story 8.3)
- [ ] `GET /api/subscriptions` - Subscription status (Story 8.4)

**Placeholder Implementation Pattern:**

Each route returns 501 Not Implemented with Epic/Story reference:

```python
# Example: weave-api/app/api/goals/router.py
from fastapi import APIRouter, Depends, HTTPException
from app.core.auth import get_current_user

router = APIRouter(prefix="/api/goals", tags=["goals"])

@router.get("/")
async def list_goals(user: dict = Depends(get_current_user)):
    """
    List user's active goals
    Epic 2, Story 2.1: View Goals List
    TODO: Implement goal list retrieval
    """
    raise HTTPException(
        status_code=501,
        detail={
            "error": "NOT_IMPLEMENTED",
            "message": "This endpoint has not been developed",
            "epic": "Epic 2: Goal Management",
            "story": "Story 2.1: View Goals List"
        }
    )

@router.get("/{goal_id}")
async def get_goal(goal_id: str, user: dict = Depends(get_current_user)):
    """
    Get goal details by ID
    Epic 2, Story 2.2: View Goal Details
    TODO: Implement goal detail retrieval
    """
    raise HTTPException(
        status_code=501,
        detail={
            "error": "NOT_IMPLEMENTED",
            "message": "This endpoint has not been developed",
            "epic": "Epic 2: Goal Management",
            "story": "Story 2.2: View Goal Details"
        }
    )
```

**Testing Scaffolding:**

For each endpoint, create corresponding test:

```python
# tests/test_goals_api.py
from fastapi.testclient import TestClient
import pytest

def test_list_goals_not_implemented(client: TestClient, auth_headers):
    """Test that goals list endpoint returns 501 Not Implemented"""
    response = client.get("/api/goals", headers=auth_headers)
    assert response.status_code == 501
    data = response.json()
    assert data["error"] == "NOT_IMPLEMENTED"
    assert "Epic 2" in data["epic"]
    assert "Story 2.1" in data["story"]

def test_get_goal_not_implemented(client: TestClient, auth_headers):
    """Test that get goal endpoint returns 501 Not Implemented"""
    response = client.get("/api/goals/test-id", headers=auth_headers)
    assert response.status_code == 501
    data = response.json()
    assert data["error"] == "NOT_IMPLEMENTED"
    assert "Epic 2" in data["epic"]
```

**Documentation:**
- [ ] Create `docs/dev/backend-api-integration.md`
  - Section 1: API Endpoint Registry (complete list with Epic/Story mapping)
  - Section 2: Implementation Checklist (how to replace 501 stub with real logic)
  - Section 3: Testing Patterns (integration test examples)
  - Section 4: Authentication & RLS integration
  - Section 5: Common patterns (pagination, filtering, sorting)

---

## Story Points Breakdown

| Task | Estimate | Rationale |
|------|----------|-----------|
| API templates + docs | 2 pts | FastAPI router template, response format standardization |
| Model/schema templates | 1 pt | BaseModel, Pydantic templates |
| Error handling + service patterns | 1 pt | Error codes, decision tree, middleware |
| Testing conventions + fixtures | 1 pt | Pytest fixtures, integration test template |
| **API endpoint mapping (AC-9)** | **2-3 pts** | **28 endpoint stubs + tests across 7 router files** |
| Backend patterns guide + API integration guide | 1-2 pts | Comprehensive developer documentation (2 guides) |

**Total: 7-9 story points**

---

## Definition of Done

### Functionality
- [ ] All 7 router files created with 28 endpoint stubs (all return 501 Not Implemented)
- [ ] All endpoints include Epic/Story references in error response
- [ ] All endpoints have corresponding pytest tests
- [ ] Auth middleware (`get_current_user`) integrated on all protected routes
- [ ] Standard response format (`{data, meta}`) documented and enforced

### Templates & Scripts
- [ ] API router template created (`scripts/templates/api_router_template.py`)
- [ ] Pydantic schema template created (`scripts/templates/pydantic_schema_template.py`)
- [ ] Service template created (`scripts/templates/service_template.py`)
- [ ] Scaffolding script created (`scripts/generate_api.py`)
- [ ] Error handling utilities created (`app/core/errors.py`)

### Testing
- [ ] All 28 endpoint stubs have tests (verify 501 response)
- [ ] Test fixtures created in `tests/conftest.py`
- [ ] All tests pass (`uv run pytest`)
- [ ] No linting errors (`uv run ruff check .`)

### Documentation
- [ ] `docs/dev/backend-patterns-guide.md` created (comprehensive patterns guide)
- [ ] `docs/dev/backend-api-integration.md` created (API endpoint registry + implementation checklist)
- [ ] `docs/architecture/implementation-patterns-consistency-rules.md` updated with Story 1.5.2 reference
- [ ] `CLAUDE.md` updated with link to backend standardization docs

### Code Review
- [ ] Code reviewed and approved
- [ ] PR includes:
  - Complete endpoint registry (28 endpoints)
  - Sample router file
  - Sample test file
  - Screenshots of 501 responses
- [ ] PR description links to this story
- [ ] All changes committed to `story/1.5.2` branch

---

## Technical Implementation Notes

### File Structure

```
weave-api/
├── app/
│   ├── api/
│   │   ├── goals/
│   │   │   └── router.py           # Epic 2 (5 endpoints)
│   │   ├── binds/
│   │   │   └── router.py           # Epic 3 (4 endpoints)
│   │   ├── journal/
│   │   │   └── router.py           # Epic 4 (5 endpoints)
│   │   ├── stats/
│   │   │   └── router.py           # Epic 5 (2 endpoints)
│   │   ├── ai/
│   │   │   └── router.py           # Epic 6 (3 endpoints)
│   │   ├── notifications/
│   │   │   └── router.py           # Epic 7 (4 endpoints)
│   │   └── user/
│   │       └── router.py           # Epic 8 (5 endpoints)
│   │
│   ├── schemas/
│   │   ├── goal.py
│   │   ├── subtask.py
│   │   ├── journal.py
│   │   └── ...
│   │
│   ├── models/
│   │   └── base.py                 # BaseModel with soft delete
│   │
│   └── core/
│       ├── errors.py               # Error handling utilities
│       └── auth.py                 # get_current_user dependency
│
├── tests/
│   ├── conftest.py                 # Shared fixtures
│   ├── test_goals_api.py
│   ├── test_binds_api.py
│   └── ...
│
├── scripts/
│   ├── generate_api.py             # Scaffolding script
│   └── templates/
│       ├── api_router_template.py
│       ├── pydantic_schema_template.py
│       └── service_template.py
│
└── docs/
    └── dev/
        ├── backend-patterns-guide.md
        └── backend-api-integration.md
```

### Dependencies

All dependencies already installed:
- `fastapi` - Web framework
- `pydantic` - Data validation
- `sqlalchemy` - ORM (if needed)
- `pytest` - Testing
- `httpx` - Test client

### Router Registration

All 7 new routers must be registered in `app/main.py`:

```python
# app/main.py
from app.api.goals import router as goals_router
from app.api.binds import router as binds_router
from app.api.journal import router as journal_router
from app.api.stats import router as stats_router
from app.api.ai import router as ai_router
from app.api.notifications import router as notifications_router
# user router already exists

app.include_router(goals_router)
app.include_router(binds_router)
app.include_router(journal_router)
app.include_router(stats_router)
app.include_router(ai_router)
app.include_router(notifications_router)
```

### Authentication Pattern

All protected endpoints MUST use JWT authentication:

```python
from fastapi import Depends
from app.core.auth import get_current_user

@router.get("/")
async def list_resources(user: dict = Depends(get_current_user)):
    """Protected endpoint - requires valid JWT token"""
    auth_user_id = user["sub"]  # Extract user ID from JWT
    # Implementation...
```

**Critical:** NEVER use placeholder auth (`auth_user_id = "placeholder_..."`). This is a security vulnerability.

---

## Related Stories

**Dependencies:**
- Story 0.3: Authentication Flow (JWT middleware exists)
- Story 0.4: Row Level Security (RLS policies exist)

**Enables:**
- All Epic 2-8 stories (provides backend scaffolding)
- Story 2.1: View Goals List (use goals router stub)
- Story 3.1: Daily Actions (use binds router stub)
- Story 4.1: Daily Reflection (use journal router stub)

**Parallel Work:**
- Story 1.5.1: Navigation Architecture (frontend equivalent)
- Story 1.5.3: AI Module Orchestration (AI services layer)

---

## Success Metrics

**Speed:**
- [ ] New endpoint implementation takes <30 minutes (vs 2+ hours without templates)

**Consistency:**
- [ ] 100% of endpoints use standard response format
- [ ] 100% of endpoints use JWT auth middleware
- [ ] 100% of endpoints have Epic/Story references

**Quality:**
- [ ] All tests pass
- [ ] No linting errors
- [ ] 80%+ test coverage for new code

**Adoption:**
- [ ] Developer uses patterns guide when implementing first Epic 2 story
- [ ] No custom patterns introduced (unless documented)

---

## Notes

**Why 501 Not Implemented?**
- 501 (Not Implemented) is correct for stub endpoints
- 404 (Not Found) is for missing resources, not unimplemented features
- 501 signals to frontend: "Endpoint exists, not ready yet"

**Why Pre-Create All Endpoints?**
- Like Story 1.5.1 pre-created navigation screens
- Provides complete API surface area
- Frontend can integrate against stubs (returns 501, but validates auth/routing)
- Clear checklist: 28 endpoints → 28 implementation tasks

**Service Layer Philosophy:**
- Default to inline logic (avoid premature abstraction)
- Only create services when logic is complex or reusable
- Services are for business logic, not simple CRUD

**Testing Philosophy:**
- Test the contract (API response format), not implementation
- Integration tests > unit tests for API endpoints
- 80%+ coverage for services (complex logic)
- 60%+ coverage for routes (HTTP layer)

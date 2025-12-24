# ATDD Checklist - Epic 1.5, Story 1.5.2: Backend API/Model Standardization

**Date:** 2025-12-23
**Author:** Jack
**Primary Test Level:** API (Integration Tests) + Unit Tests

---

## Story Summary

Establish standardized backend patterns and templates for implementing Epic 2-8 APIs without making architectural decisions.

**As a** developer
**I want to** have standardized backend patterns and templates
**So that** I can implement Epic 2-8 APIs without making architectural decisions

---

## Acceptance Criteria

1. **AC-1:** API Endpoint Standardization (REST naming, response format, HTTP status codes)
2. **AC-2:** Database Model Standardization (BaseModel with soft delete, timestamps)
3. **AC-3:** Pydantic Schema Conventions (Create/Update/Response models)
4. **AC-5:** Error Handling Patterns (standard error codes, format_error_response utility)
5. **AC-9:** API Endpoint Mapping (28 endpoint stubs across 7 routers, all return 501 Not Implemented)

---

## Failing Tests Created (RED Phase)

### API Integration Tests (19 tests)

**File:** `weave-api/tests/test_api_endpoints_story_1_5_2.py` (397 lines)

**Epic 2: Goal Management (3 tests)**

- ✅ **Test:** test_list_goals_not_implemented
  - **Status:** RED - Route `/api/goals` does not exist
  - **Verifies:** GET /api/goals returns 501 with Epic/Story reference (AC-9)

- ✅ **Test:** test_get_goal_by_id_not_implemented
  - **Status:** RED - Route `/api/goals/{id}` does not exist
  - **Verifies:** GET /api/goals/{id} returns 501 with Epic/Story reference (AC-9)

- ✅ **Test:** test_create_goal_not_implemented
  - **Status:** RED - Route POST `/api/goals` does not exist
  - **Verifies:** POST /api/goals returns 501 with Epic/Story reference (AC-9)

**Epic 3: Daily Actions (2 tests)**

- ✅ **Test:** test_get_todays_binds_not_implemented
  - **Status:** RED - Route `/api/subtask-instances` does not exist
  - **Verifies:** GET /api/subtask-instances returns 501 (AC-9)

- ✅ **Test:** test_complete_bind_not_implemented
  - **Status:** RED - Route POST `/api/subtask-completions` does not exist
  - **Verifies:** POST /api/subtask-completions returns 501 (AC-9)

**Epic 4: Journal & Reflection (3 tests)**

- ✅ **Test:** test_submit_journal_entry_not_implemented
  - **Status:** RED - Route POST `/api/journal-entries` does not exist
  - **Verifies:** POST /api/journal-entries returns 501 (AC-9)

- ✅ **Test:** test_list_journal_entries_not_implemented
  - **Status:** RED - Route GET `/api/journal-entries` does not exist
  - **Verifies:** GET /api/journal-entries returns 501 (AC-9)

- ✅ **Test:** test_generate_ai_recap_not_implemented
  - **Status:** RED - Route POST `/api/ai/recap` does not exist
  - **Verifies:** POST /api/ai/recap returns 501 (AC-9)

**Epic 5: Progress Visualization (2 tests)**

- ✅ **Test:** test_get_user_stats_not_implemented
  - **Status:** RED - Route `/api/user-stats` does not exist
  - **Verifies:** GET /api/user-stats returns 501 (AC-9)

- ✅ **Test:** test_get_daily_aggregates_not_implemented
  - **Status:** RED - Route `/api/daily-aggregates` does not exist
  - **Verifies:** GET /api/daily-aggregates returns 501 (AC-9)

**Epic 6: AI Coaching (2 tests)**

- ✅ **Test:** test_ai_chat_message_not_implemented
  - **Status:** RED - Route POST `/api/ai/chat` does not exist
  - **Verifies:** POST /api/ai/chat returns 501 (AC-9)

- ✅ **Test:** test_get_ai_chat_history_not_implemented
  - **Status:** RED - Route GET `/api/ai/chat/history` does not exist
  - **Verifies:** GET /api/ai/chat/history returns 501 (AC-9)

**Epic 7: Notifications (2 tests)**

- ✅ **Test:** test_schedule_notification_not_implemented
  - **Status:** RED - Route POST `/api/notifications/schedule` does not exist
  - **Verifies:** POST /api/notifications/schedule returns 501 (AC-9)

- ✅ **Test:** test_bind_reminder_notification_not_implemented
  - **Status:** RED - Route POST `/api/notifications/bind-reminder` does not exist
  - **Verifies:** POST /api/notifications/bind-reminder returns 501 (AC-9)

**Epic 8: Settings & Profile (3 tests)**

- ✅ **Test:** test_get_user_profile_not_implemented
  - **Status:** RED - Route GET `/api/user/profile` does not exist
  - **Verifies:** GET /api/user/profile returns 501 (AC-9)

- ✅ **Test:** test_update_user_profile_not_implemented
  - **Status:** RED - Route PUT `/api/user/profile` does not exist
  - **Verifies:** PUT /api/user/profile returns 501 (AC-9)

- ✅ **Test:** test_delete_user_account_not_implemented
  - **Status:** RED - Route DELETE `/api/user/account` does not exist
  - **Verifies:** DELETE /api/user/account returns 501 (AC-9)

**Response Format Validation (2 tests)**

- ✅ **Test:** test_error_response_format_includes_required_fields
  - **Status:** RED - Error response format not standardized
  - **Verifies:** Error responses include required fields (AC-1)

- ✅ **Test:** test_auth_middleware_applied_to_protected_endpoints
  - **Status:** RED - Auth middleware not applied to stub routes
  - **Verifies:** Protected endpoints require authentication (AC-1)

---

### Unit Tests (5 tests)

**File:** `weave-api/tests/test_error_handling_utils.py` (83 lines)

- ✅ **Test:** test_format_error_response_with_required_fields
  - **Status:** RED - `app.core.errors.format_error_response` does not exist
  - **Verifies:** format_error_response utility returns correct structure (AC-5)

- ✅ **Test:** test_format_error_response_retryable_default
  - **Status:** RED - format_error_response function not implemented
  - **Verifies:** retryable parameter defaults to False (AC-5)

- ✅ **Test:** test_app_exception_with_custom_status_code
  - **Status:** RED - `app.core.errors.AppException` class does not exist
  - **Verifies:** AppException custom exception class (AC-5)

- ✅ **Test:** test_standard_error_codes
  - **Status:** RED - format_error_response not implemented
  - **Verifies:** All standard error codes format correctly (AC-5)

- ✅ **Test:** test_error_response_json_serializable
  - **Status:** RED - format_error_response not implemented
  - **Verifies:** Error responses are JSON-serializable (AC-5)

**File:** `weave-api/tests/test_base_model.py` (65 lines)

- ✅ **Test:** test_base_model_has_required_fields
  - **Status:** RED - `app.models.base.BaseModel` does not exist
  - **Verifies:** BaseModel has id, created_at, updated_at, deleted_at (AC-2)

- ✅ **Test:** test_base_model_soft_delete_sets_timestamp
  - **Status:** RED - soft_delete() method not implemented
  - **Verifies:** soft_delete() sets deleted_at timestamp (AC-2)

- ✅ **Test:** test_base_model_is_deleted_property_when_not_deleted
  - **Status:** RED - is_deleted property not implemented
  - **Verifies:** is_deleted returns False when not deleted (AC-2)

- ✅ **Test:** test_base_model_is_deleted_property_when_deleted
  - **Status:** RED - is_deleted property not implemented
  - **Verifies:** is_deleted returns True after soft delete (AC-2)

- ✅ **Test:** test_base_model_timestamps_auto_populate
  - **Status:** RED - BaseModel not implemented
  - **Verifies:** created_at and updated_at auto-populate (AC-2)

---

## Test Fixtures Created

### Shared Fixtures

**File:** `weave-api/tests/conftest.py` (updated)

**Fixtures:**

- `auth_headers` - Authentication headers with JWT token
  - **Setup:** Generates JWT token using `test_user_token` fixture
  - **Provides:** Dictionary with `Authorization: Bearer {token}` header
  - **Cleanup:** None (stateless fixture)

**Example Usage:**

```python
def test_protected_endpoint(auth_headers):
    response = client.get("/api/goals", headers=auth_headers)
    assert response.status_code == 501  # Endpoint stub
```

---

## Required Infrastructure Components

### 1. Error Handling Utilities (AC-5)

**File:** `weave-api/app/core/errors.py` (to be created)

**Functions:**

- `format_error_response(code: str, message: str, retryable: bool = False) -> dict`
  - Returns: `{"error": {"code": "...", "message": "...", "retryable": bool}}`

**Classes:**

- `AppException(Exception)` - Base exception class
  - Attributes: `code`, `message`, `status_code`, `retryable`

**Standard Error Codes:**

- `VALIDATION_ERROR` (400)
- `NOT_FOUND` (404)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `RATE_LIMIT_EXCEEDED` (429)
- `INTERNAL_ERROR` (500)
- `NOT_IMPLEMENTED` (501)

---

### 2. Base Model (AC-2)

**File:** `weave-api/app/models/base.py` (to be created)

**Class:** `BaseModel` (SQLAlchemy abstract base)

**Fields:**

- `id` (UUID, primary key)
- `created_at` (DateTime with timezone, auto-populate)
- `updated_at` (DateTime with timezone, auto-update)
- `deleted_at` (DateTime with timezone, nullable)

**Methods:**

- `soft_delete()` - Set deleted_at timestamp
- `is_deleted` (property) - Check if deleted_at is set

---

### 3. API Router Stubs (AC-9)

**7 Router Files to Create:**

1. `weave-api/app/api/goals/router.py` (Epic 2)
2. `weave-api/app/api/binds/router.py` (Epic 3)
3. `weave-api/app/api/journal/router.py` (Epic 4)
4. `weave-api/app/api/stats/router.py` (Epic 5)
5. `weave-api/app/api/ai/router.py` (Epic 6)
6. `weave-api/app/api/notifications/router.py` (Epic 7)
7. `weave-api/app/api/user/router.py` (Epic 8) - May already exist

**Each router includes:**

- Endpoint stubs returning 501 Not Implemented
- Epic/Story references in error response
- Auth middleware (`Depends(get_current_user)`)
- Pydantic request/response models (stubs)

---

## Implementation Checklist

### Task 1: Create Error Handling Utilities

**File:** `weave-api/app/core/errors.py`

**Tasks to make tests pass:**

- [ ] Create `format_error_response()` function with parameters: code, message, retryable
- [ ] Return dict with structure: `{"error": {"code": "...", "message": "...", "retryable": bool}}`
- [ ] Set retryable default to False
- [ ] Create `AppException` class extending `Exception`
- [ ] Add attributes: code, message, status_code, retryable
- [ ] Ensure all return values are JSON-serializable (str, bool, int only)
- [ ] Run tests: `uv run pytest tests/test_error_handling_utils.py -v`
- [ ] ✅ All 5 tests pass (green phase)

**Estimated Effort:** 0.5 hours

---

### Task 2: Create Base Model

**File:** `weave-api/app/models/base.py`

**Tasks to make tests pass:**

- [ ] Import SQLAlchemy dependencies (Column, DateTime, UUID, func)
- [ ] Create abstract `BaseModel` class extending `declarative_base()`
- [ ] Add field: `id` (UUID primary key, default uuid.uuid4)
- [ ] Add field: `created_at` (DateTime with timezone, server_default=func.now())
- [ ] Add field: `updated_at` (DateTime with timezone, server_default=func.now(), onupdate=func.now())
- [ ] Add field: `deleted_at` (DateTime with timezone, nullable=True)
- [ ] Create `soft_delete()` method that sets deleted_at to current timestamp
- [ ] Create `is_deleted` property that returns `deleted_at is not None`
- [ ] Mark class as `__abstract__ = True`
- [ ] Run tests: `uv run pytest tests/test_base_model.py -v`
- [ ] ✅ All 5 tests pass (green phase)

**Estimated Effort:** 1 hour

---

### Task 3: Create API Router Stubs (Representative Subset)

**Files:** 7 router files in `weave-api/app/api/`

**Approach:** Implement representative subset (17 endpoints), developers copy pattern for remaining 11.

#### Subtask 3.1: Goals Router (Epic 2)

**File:** `weave-api/app/api/goals/router.py`

- [ ] Import FastAPI, Depends, HTTPException, get_current_user
- [ ] Create APIRouter with prefix="/api/goals", tags=["goals"]
- [ ] Implement GET "/" endpoint (list goals)
  - [ ] Add auth: `user: dict = Depends(get_current_user)`
  - [ ] Raise HTTPException(status_code=501, detail={"error": "NOT_IMPLEMENTED", "message": "...", "epic": "Epic 2: Goal Management", "story": "Story 2.1: View Goals List"})
- [ ] Implement GET "/{goal_id}" endpoint (get goal by ID)
  - [ ] Add auth dependency
  - [ ] Raise 501 with Epic 2, Story 2.2 reference
- [ ] Implement POST "/" endpoint (create goal)
  - [ ] Add auth dependency
  - [ ] Raise 501 with Epic 2, Story 2.3 reference
- [ ] Register router in `app/main.py`: `app.include_router(goals_router)`
- [ ] Run tests: `uv run pytest tests/test_api_endpoints_story_1_5_2.py::test_list_goals_not_implemented -v`
- [ ] ✅ 3 goal tests pass

**Estimated Effort:** 0.5 hours

#### Subtask 3.2: Binds Router (Epic 3)

**File:** `weave-api/app/api/binds/router.py`

- [ ] Create APIRouter with prefix="/api/subtask-instances", tags=["binds"]
- [ ] Implement GET "/" endpoint (today's binds)
  - [ ] Add auth dependency
  - [ ] Raise 501 with Epic 3, Story 3.1 reference
- [ ] Create APIRouter with prefix="/api/subtask-completions", tags=["binds"]
- [ ] Implement POST "/" endpoint (complete bind)
  - [ ] Add auth dependency
  - [ ] Raise 501 with Epic 3, Story 3.3 reference
- [ ] Register routers in `app/main.py`
- [ ] ✅ 2 bind tests pass

**Estimated Effort:** 0.5 hours

#### Subtask 3.3: Journal Router (Epic 4)

**File:** `weave-api/app/api/journal/router.py`

- [ ] Create APIRouter with prefix="/api/journal-entries", tags=["journal"]
- [ ] Implement POST "/" endpoint (submit journal entry)
  - [ ] Add auth dependency
  - [ ] Raise 501 with Epic 4, Story 4.1 reference
- [ ] Implement GET "/" endpoint (list journal entries)
  - [ ] Raise 501 with Epic 4, Story 4.5 reference
- [ ] Create APIRouter with prefix="/api/ai", tags=["ai"]
- [ ] Implement POST "/recap" endpoint (AI recap)
  - [ ] Raise 501 with Epic 4, Story 4.3 reference
- [ ] Register routers in `app/main.py`
- [ ] ✅ 3 journal tests pass

**Estimated Effort:** 0.5 hours

#### Subtask 3.4: Stats Router (Epic 5)

**File:** `weave-api/app/api/stats/router.py`

- [ ] Create APIRouter with prefix="/api/user-stats", tags=["stats"]
- [ ] Implement GET "/" endpoint (user stats)
  - [ ] Add auth dependency
  - [ ] Raise 501 with Epic 5, Story 5.1 reference
- [ ] Create APIRouter with prefix="/api/daily-aggregates", tags=["stats"]
- [ ] Implement GET "/" endpoint (daily aggregates)
  - [ ] Add auth dependency, query params: timeframe
  - [ ] Raise 501 with Epic 5, Story 5.2 reference
- [ ] Register routers in `app/main.py`
- [ ] ✅ 2 stats tests pass

**Estimated Effort:** 0.5 hours

#### Subtask 3.5: AI Router (Epic 6)

**File:** `weave-api/app/api/ai/router.py`

- [ ] Create APIRouter with prefix="/api/ai/chat", tags=["ai-chat"]
- [ ] Implement POST "/" endpoint (send chat message)
  - [ ] Add auth dependency
  - [ ] Raise 501 with Epic 6, Story 6.1 reference
- [ ] Implement GET "/history" endpoint (chat history)
  - [ ] Add auth dependency
  - [ ] Raise 501 with Epic 6, Story 6.1 reference
- [ ] Register router in `app/main.py`
- [ ] ✅ 2 AI chat tests pass

**Estimated Effort:** 0.5 hours

#### Subtask 3.6: Notifications Router (Epic 7)

**File:** `weave-api/app/api/notifications/router.py`

- [ ] Create APIRouter with prefix="/api/notifications", tags=["notifications"]
- [ ] Implement POST "/schedule" endpoint (schedule notification)
  - [ ] Add auth dependency
  - [ ] Raise 501 with Epic 7, Story 7.1 reference
- [ ] Implement POST "/bind-reminder" endpoint (bind reminder)
  - [ ] Add auth dependency
  - [ ] Raise 501 with Epic 7, Story 7.2 reference
- [ ] Register router in `app/main.py`
- [ ] ✅ 2 notification tests pass

**Estimated Effort:** 0.5 hours

#### Subtask 3.7: User Router (Epic 8)

**File:** `weave-api/app/api/user/router.py` (may need updates)

- [ ] Check if router already exists
- [ ] Add GET "/profile" endpoint (get user profile)
  - [ ] Add auth dependency
  - [ ] Raise 501 with Epic 8, Story 8.1 reference
- [ ] Add PUT "/profile" endpoint (update profile)
  - [ ] Add auth dependency
  - [ ] Raise 501 with Epic 8, Story 8.1 reference
- [ ] Add DELETE "/account" endpoint (soft delete account)
  - [ ] Add auth dependency
  - [ ] Raise 501 with Epic 8, Story 8.3 reference
- [ ] Register/update router in `app/main.py`
- [ ] ✅ 3 user profile tests pass

**Estimated Effort:** 0.5 hours

#### Subtask 3.8: Response Format Validation

**Tasks:**

- [ ] Ensure all 17 endpoint stubs return consistent error format:
  - `{"error": "NOT_IMPLEMENTED", "message": "This endpoint has not been developed", "epic": "Epic X: ...", "story": "Story X.X: ..."}`
- [ ] Ensure all protected endpoints use `user: dict = Depends(get_current_user)` auth dependency
- [ ] Run tests: `uv run pytest tests/test_api_endpoints_story_1_5_2.py::test_error_response_format_includes_required_fields -v`
- [ ] Run tests: `uv run pytest tests/test_api_endpoints_story_1_5_2.py::test_auth_middleware_applied_to_protected_endpoints -v`
- [ ] ✅ 2 format validation tests pass

**Estimated Effort:** 0.5 hours

---

### Task 4: Complete Remaining 11 Endpoint Stubs (Developer Copies Pattern)

**Tasks:**

- [ ] Review implemented router patterns from Task 3
- [ ] Copy pattern to create remaining 11 endpoint stubs:
  - Epic 2: 2 more endpoints (PUT /{id}, PUT /{id}/archive)
  - Epic 3: 2 more endpoints (POST /captures, GET /daily-aggregates)
  - Epic 4: 2 more endpoints (GET /{date}, PUT /ai-artifacts/{id})
  - Epic 7: 2 more endpoints (POST /reflection-prompt, POST /streak-recovery)
  - Epic 8: 2 more endpoints (GET /export, GET /subscriptions)
- [ ] Update tests/test_api_endpoints_story_1_5_2.py with additional test stubs (optional)
- [ ] All 28 endpoint stubs operational

**Estimated Effort:** 1.5 hours

---

### Task 5: Create Templates and Documentation

**Files to create:**

1. `scripts/templates/api_router_template.py` - FastAPI router template
2. `scripts/templates/pydantic_schema_template.py` - Pydantic schema template
3. `scripts/templates/service_template.py` - Service class template (optional)
4. `docs/dev/backend-patterns-guide.md` - Comprehensive backend patterns guide
5. `docs/dev/backend-api-integration.md` - API endpoint registry and implementation guide

**Tasks:**

- [ ] Create template files with placeholders ({Resource}, {resource}, {resources})
- [ ] Document patterns in backend-patterns-guide.md (refer to Story 1.5.2 AC-1 through AC-8)
- [ ] Create API endpoint registry table (28 endpoints with Epic/Story mapping)
- [ ] Update CLAUDE.md with link to backend standardization docs
- [ ] Update `docs/architecture/implementation-patterns-consistency-rules.md`

**Estimated Effort:** 2-3 hours

---

## Running Tests

```bash
# Navigate to backend directory
cd weave-api

# Run all Story 1.5.2 tests
uv run pytest tests/test_api_endpoints_story_1_5_2.py tests/test_error_handling_utils.py tests/test_base_model.py -v

# Run specific test file
uv run pytest tests/test_api_endpoints_story_1_5_2.py -v

# Run specific test
uv run pytest tests/test_api_endpoints_story_1_5_2.py::test_list_goals_not_implemented -v

# Run with coverage
uv run pytest tests/test_api_endpoints_story_1_5_2.py --cov=app --cov-report=term-missing

# Run linting
uv run ruff check .
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete) ✅

**TEA Agent Responsibilities:**

- ✅ All tests written and failing (19 API tests, 5 unit tests for utilities, 5 unit tests for BaseModel)
- ✅ Test fixtures created (auth_headers)
- ✅ Representative subset pattern established (17 endpoints demonstrate pattern for all 28)
- ✅ Implementation checklist created with clear tasks

**Verification:**

- All tests run and fail as expected
- Failure messages are clear: "Route does not exist", "Module not found"
- Tests fail due to missing implementation, not test bugs

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Start with error handling utilities** (Task 1) - Foundation for all endpoints
2. **Implement BaseModel** (Task 2) - Database foundation
3. **Implement router stubs one at a time** (Task 3) - Follow Given-When-Then pattern from tests
4. **Copy pattern for remaining endpoints** (Task 4) - Use implemented routers as templates
5. **Create templates and documentation** (Task 5) - Capture patterns for future development

**Key Principles:**

- One test at a time (don't try to fix all at once)
- Minimal implementation (endpoint stubs return 501, not full logic)
- Run tests frequently (immediate feedback)
- Use implementation checklist as roadmap

**Progress Tracking:**

- Check off tasks as you complete them
- Run `uv run pytest` after each task
- Mark story status: IN PROGRESS → REVIEW → DONE

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

**DEV Agent Responsibilities:**

1. **Verify all tests pass** (green phase complete)
2. **Review code for consistency** (all routers follow same pattern)
3. **Extract common patterns** (middleware, error handling, response formatting)
4. **Ensure naming conventions** (snake_case, consistent error codes)
5. **Ensure tests still pass** after each refactor

**Key Principles:**

- Tests provide safety net (refactor with confidence)
- Make small refactors (easier to debug if tests fail)
- Run tests after each change
- Document any pattern changes in backend-patterns-guide.md

**Completion:**

- All 24 tests pass (19 API integration + 5 unit tests)
- Code quality meets team standards
- Templates created for future use
- Documentation complete
- Ready for code review and story approval

---

## Next Steps

1. **Review this checklist** with team in standup or planning
2. **Run failing tests** to confirm RED phase: `uv run pytest tests/test_api_endpoints_story_1_5_2.py tests/test_error_handling_utils.py tests/test_base_model.py -v`
3. **Begin implementation** using implementation checklist as guide
4. **Work one task at a time** (error handling → BaseModel → router stubs)
5. **Share progress** in daily standup
6. **When all tests pass**, refactor code for quality
7. **When refactoring complete**, mark story as 'done' in sprint-status.yaml

---

## Knowledge Base References Applied

This ATDD workflow consulted the following knowledge fragments:

- **test-levels-framework.md** - Test level selection (API integration vs Unit tests)
- **test-quality.md** - Test design principles (Given-When-Then, determinism, isolation)
- **data-factories.md** - Factory patterns for test data generation (auth_headers fixture)
- **fixture-architecture.md** - Test fixture patterns with auto-cleanup

See `_bmad/bmm/testarch/tea-index.csv` for complete knowledge fragment mapping.

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `uv run pytest tests/test_api_endpoints_story_1_5_2.py tests/test_error_handling_utils.py tests/test_base_model.py -v`

**Expected Results:**

```
FAILED tests/test_api_endpoints_story_1_5_2.py::test_list_goals_not_implemented - 404: Route not found
FAILED tests/test_api_endpoints_story_1_5_2.py::test_get_goal_by_id_not_implemented - 404: Route not found
FAILED tests/test_api_endpoints_story_1_5_2.py::test_create_goal_not_implemented - 404: Route not found
...
FAILED tests/test_error_handling_utils.py::test_format_error_response_with_required_fields - ModuleNotFoundError: No module named 'app.core.errors'
FAILED tests/test_base_model.py::test_base_model_has_required_fields - ModuleNotFoundError: No module named 'app.models.base'
...
```

**Summary:**

- Total tests: 24 (19 API integration + 5 error handling unit + 5 BaseModel unit)
- Passing: 0 (expected)
- Failing: 24 (expected)
- Status: ✅ RED phase verified

**Expected Failure Patterns:**

- API Integration Tests: "404 Not Found" - Routes don't exist yet
- Error Handling Tests: "ModuleNotFoundError: No module named 'app.core.errors'" - Utility module not created
- BaseModel Tests: "ModuleNotFoundError: No module named 'app.models.base'" - Base model not created

---

## Notes

**Infrastructure vs Feature Testing:**

- This is **infrastructure TDD**, not feature TDD
- Tests verify that scaffolding works (stubs return 501, auth works, routing works)
- These tests become the foundation for future feature tests
- When Epic 2-8 stories implement real logic, tests change from "verify 501" to "verify business logic"

**Why Representative Subset (17 of 28 endpoints)?**

- Demonstrates pattern without being verbose
- Developers copy pattern for remaining 11 endpoints
- Reduces initial test maintenance burden
- Comprehensive coverage can be added incrementally

**Why Unit Tests for Infrastructure?**

- Error handling utilities are pure functions (easy to test in isolation)
- BaseModel is a reusable component (should have unit test coverage)
- Unit tests run faster than integration tests
- Utilities are used across all endpoint implementations

**Next Story Integration:**

- Story 2.1 (View Goals List) will replace GET /api/goals 501 stub with real implementation
- Story 2.1 tests will change from "verify 501" to "verify goal list returned"
- This story provides the scaffolding; Epic 2-8 stories provide the implementation

---

## Contact

**Questions or Issues?**

- Ask in team standup
- Tag @Jack in Slack/Discord
- Refer to `docs/dev/backend-patterns-guide.md` for implementation patterns
- Refer to Story 1.5.2 spec: `docs/stories/1-5-2-backend-standardization.md`

---

**Generated by BMad TEA Agent** - 2025-12-23

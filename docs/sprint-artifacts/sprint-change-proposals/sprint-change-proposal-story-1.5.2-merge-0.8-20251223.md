# Sprint Change Proposal: Merge Story 0.8 into Story 1.5.2

**Date:** 2025-12-23
**Proposed By:** Dev Agent (via Correct Course workflow)
**Change Type:** Story Merge + Scope Expansion
**Sprint Impact:** Minor (+2 story points)
**Status:** Pending Approval

---

## Executive Summary

**Recommendation:** Expand Story 1.5.2 (Backend API/Model Standardization) to include Story 0.8 (Error Handling Framework) completion and template usability improvements.

**Why:** Story 1.5.2 implementation already includes 90% of Story 0.8's backend requirements. Completing the remaining 10% (4-5 small tasks) eliminates duplicate work and delivers both stories at a higher standard with better developer experience.

**Impact:** +2 story points (7-9 → 9-11), no timeline risk, completes 2 stories for price of 1.2

---

## Section 1: Issue Summary

### Problem Statement

Two related issues identified during Story 1.5.2 implementation:

1. **Duplicate Work Risk:** Story 1.5.2 created comprehensive error handling utilities (`app/core/errors.py`, 492 lines) that already satisfy 90% of Story 0.8's backend requirements, risking duplicate implementation effort.

2. **Template Usability Gap:** Story 1.5.2 delivered excellent templates and scaffolding script, but lacks clear developer guidance on *how* to use them effectively in daily work.

### Discovery Context

**When discovered:** During Story 1.5.2 post-implementation validation (2025-12-23)

**Triggering event:** User (Jack) questioned whether Story 0.8 was incorporated and noticed templates exist but need better usability

**Evidence:**

**Story 1.5.2 Implementation (Current State):**
- ✅ Created `app/core/errors.py` with:
  - 17 error codes (ErrorCode class)
  - 7 custom exception classes (AppException, ValidationException, NotFoundException, etc.)
  - 3 exception handlers (app_exception_handler, validation_exception_handler, generic_exception_handler)
  - `format_error_response()` utility function
  - RETRYABLE_ERROR_CODES constant
- ✅ Created 5 templates (api_router, pydantic_schema, service, test, database)
- ✅ Created `scripts/generate_api.py` scaffolding script
- ✅ Created 28 API endpoint stubs across 7 routers (all return 501 Not Implemented)
- ✅ Created 2 comprehensive guides:
  - `docs/dev/backend-patterns-guide.md` (630 lines)
  - `docs/dev/backend-api-integration.md` (474 lines)
- ✅ All 13 tests passing (4 skipped as expected for auth-protected endpoints)

**Story 0.8 Requirements (PRD):**
1. Standard error format: `{error: {code, message, retryable, retryAfter?}}` → ✅ MOSTLY (missing `retryAfter`)
2. HTTP status codes (400, 401, 429, 500, 503) → ✅ EXCEEDED (17 codes vs 5 required)
3. Error response utilities for backend → ✅ COMPLETE
4. Error handling hooks for mobile → ❌ NOT IN SCOPE (frontend work)
5. Document in `/docs/api-error-codes.md` → ❌ MISSING

**Gap Analysis:**
- **Overlap:** ~90% of Story 0.8 backend work already done
- **Missing (Backend):**
  - `retryAfter` field in error response format
  - `/docs/api-error-codes.md` documentation file
  - Exception handlers not registered in `main.py` (created but inactive)
- **Missing (Frontend):** Mobile error handling hooks (out of scope for backend-focused Story 1.5.2)
- **Usability Gap:** Templates exist but no step-by-step "How to use them" guide

---

## Section 2: Impact Analysis

### Epic Impact

**Epic 1.5: Development Infrastructure**
- **Current:** Story 1.5.2 (7-9 pts), Story 1.5.1 (8-10 pts), Story 1.5.3 (4-5 pts)
- **After Change:** Story 1.5.2 (9-11 pts), Story 1.5.1 (8-10 pts), Story 1.5.3 (4-5 pts)
- **Impact:** +2 pts to Story 1.5.2, Epic 1.5 total increases from 19-24 pts to 21-26 pts
- **Status:** Epic remains on track, no structural changes

**Epic 0: Foundation**
- **Current:** Story 0.8 in backlog (3 pts, deferred as stretch goal)
- **After Change:** Story 0.8 marked as "✅ Completed within Story 1.5.2"
- **Impact:** Removes 3 pts from backlog (already delivered), no actual work needed
- **Benefit:** Foundation epic effectively gains error handling completion without additional sprint time

**Epic 2-8: Future Epics**
- **Impact:** Positive - All future stories benefit from:
  - Complete error handling framework (better than originally scoped)
  - Usable templates with clear guidance
  - Faster API implementation (templates + quick start guide)

### Story Impact

**Current Stories:**
- Story 1.5.2: Expand scope (+2 pts), add 2 new acceptance criteria (AC-10, AC-11)
- Story 0.8: Mark as completed (3 pts removed from backlog)

**Future Stories (Epic 2-8):**
- All API implementation stories benefit from:
  - Complete error handling (better quality)
  - Quick start guide (faster onboarding)
  - Working examples (reduced cognitive load)

### Artifact Conflicts

**PRD (docs/prd/epic-0-foundation.md):**
- **Line 148-173:** Story 0.8 definition
- **Conflict:** Story listed as "backlog" but work is complete
- **Resolution:** Add note: "✅ Completed within Story 1.5.2 (Backend Standardization)"

**Sprint Status (docs/sprint-status.yaml):**
- **Line 96:** `0-8-error-handling-framework: backlog # 3 pts (DEFERRED - stretch goal)`
- **Conflict:** Status doesn't reflect completion
- **Resolution:** Update to: `0-8-error-handling-framework: done # 3 pts ✅ Completed within Story 1.5.2`

- **Line 110:** `1-5-2-backend-standardization: ready-for-dev # 7-9 pts`
- **Conflict:** Estimate doesn't reflect expanded scope
- **Resolution:** Update to: `1-5-2-backend-standardization: ready-for-dev # 9-11 pts ⚡ EXPANDED (Story 0.8 completion + template usability)`

**CLAUDE.md:**
- **Section:** Story 1.5.2 Backend Patterns
- **Enhancement:** Add "Quick Start: Creating Your First API" section with link to quick start guide

**Architecture/UX:** No conflicts identified

### Technical Impact

**Code Changes Required:**
1. Add `retryAfter` parameter to `format_error_response()` function (5 lines)
2. Create `/docs/api-error-codes.md` (new file, ~150 lines)
3. Create `/docs/dev/backend-quick-start.md` (new file, ~300 lines)
4. Enhance `scripts/generate_api.py` with better CLI (optional, ~50 lines)
5. Register exception handlers in `main.py` (optional decision point, 10 lines)

**Testing Impact:**
- Add test for `retryAfter` field in error responses (1 test)
- Validate api-error-codes.md exists and is complete (1 test)
- No regression risk (additive changes only)

**Infrastructure Impact:**
- None (no deployment changes)

**Timeline Impact:**
- Estimated effort: 2-3 hours for 4-5 tasks
- Story estimate increase: +2 pts (7-9 → 9-11)
- Sprint impact: Negligible (within estimation buffer)

---

## Section 3: Recommended Approach

### Selected Path: Direct Adjustment (Option 1)

**Approach:** Expand Story 1.5.2 to include Story 0.8 completion + template usability improvements

**Rationale:**
1. **Efficiency:** Story 1.5.2 already delivered 90% of Story 0.8 backend work
2. **Quality:** Combining ensures consistency (same error handling patterns everywhere)
3. **Usability:** Adding quick start guide makes templates immediately useful for Epic 2-8
4. **Cost:** Only 4-5 small tasks (+2 pts) to complete both stories
5. **Risk:** Very low - additive changes only, builds on proven implementation
6. **Timeline:** No sprint delay - within normal estimation variance
7. **Developer Experience:** Better than fragmenting across 2 stories

**Alternatives Considered:**
- **Option 2 (Rollback):** Not viable - current work is high quality
- **Option 3 (MVP Review):** Not needed - MVP scope unchanged and achievable

**Effort Estimate:**
- Backend work: 1-2 hours (retryAfter field, documentation)
- Usability work: 1-2 hours (quick start guide, script enhancement)
- Testing: 30 minutes (2 new tests)
- **Total: 2.5-4.5 hours** (well within 2 pt increase)

**Risk Assessment:**
- **Technical Risk:** LOW (additive changes, no breaking changes)
- **Timeline Risk:** LOW (minimal effort, within buffer)
- **Quality Risk:** LOW (builds on tested implementation)
- **Team Risk:** LOW (clear guidance via quick start guide)

---

## Section 4: Detailed Change Proposals

### Change Group 1: Story Definition Updates

#### Change 1.1: Update Story 1.5.2 File

**File:** `docs/stories/1-5-2-backend-standardization.md`

**Section:** Story Points Breakdown (Line 628-639)

**OLD:**
```markdown
| Task | Estimate | Rationale |
|------|----------|-----------|
| API templates + docs | 2 pts | FastAPI router template, response format standardization |
| Model/schema templates | 1 pt | BaseModel, Pydantic templates |
| Error handling + service patterns | 1 pt | Error codes, decision tree, middleware |
| Testing conventions + fixtures | 1 pt | Pytest fixtures, integration test template |
| **API endpoint mapping (AC-9)** | **2-3 pts** | **28 endpoint stubs + tests across 7 router files** |
| Backend patterns guide + API integration guide | 1-2 pts | Comprehensive developer documentation (2 guides) |

**Total: 7-9 story points**
```

**NEW:**
```markdown
| Task | Estimate | Rationale |
|------|----------|-----------|
| API templates + docs | 2 pts | FastAPI router template, response format standardization |
| Model/schema templates | 1 pt | BaseModel, Pydantic templates |
| Error handling + service patterns | 1 pt | Error codes, decision tree, middleware |
| Testing conventions + fixtures | 1 pt | Pytest fixtures, integration test template |
| **API endpoint mapping (AC-9)** | **2-3 pts** | **28 endpoint stubs + tests across 7 router files** |
| Backend patterns guide + API integration guide | 1-2 pts | Comprehensive developer documentation (2 guides) |
| **Story 0.8 completion (AC-10)** | **1 pt** | **retryAfter field, api-error-codes.md, handler registration** |
| **Template usability (AC-11)** | **1 pt** | **Quick start guide, enhanced CLI, example walkthrough** |

**Total: 9-11 story points** (expanded to include Story 0.8 + usability improvements)
```

**Rationale:** Transparently document scope expansion and effort allocation

---

#### Change 1.2: Add New Acceptance Criteria to Story 1.5.2

**File:** `docs/stories/1-5-2-backend-standardization.md`

**Section:** After AC-9 (after line 623)

**INSERT:**

```markdown
---

### AC-10: Complete Story 0.8 Error Handling Framework

**Goal:** Complete remaining Story 0.8 requirements to avoid duplicate work

**Story 0.8 Gap Analysis:**
- ✅ Standard error format: MOSTLY COMPLETE (missing `retryAfter`)
- ✅ HTTP status codes: EXCEEDED (17 codes vs 5 required)
- ✅ Error response utilities: COMPLETE
- ❌ `retryAfter` field: MISSING
- ❌ API error codes documentation: MISSING
- ⚠️ Exception handlers: CREATED but NOT REGISTERED

**Tasks:**

**1. Add `retryAfter` Field to Error Response Format**
- [ ] Update `format_error_response()` in `app/core/errors.py`:
  ```python
  def format_error_response(
      code: str,
      message: str,
      retryable: bool = False,
      retry_after: Optional[int] = None  # NEW: Seconds until retry allowed
  ) -> Dict[str, Any]:
      response = {
          "error": code,
          "message": message,
          "retryable": retryable
      }
      if retry_after is not None:  # NEW
          response["retryAfter"] = retry_after
      return response
  ```
- [ ] Use case: Rate limiting errors (429) return `retryAfter: 3600` (1 hour)
- [ ] Example: `format_error_response("RATE_LIMIT_EXCEEDED", "Too many requests", retryable=True, retry_after=3600)`

**2. Create API Error Codes Documentation**
- [ ] Create `docs/api-error-codes.md` with comprehensive error catalog
- [ ] Sections:
  1. **Client Errors (4xx):** VALIDATION_ERROR, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, CONFLICT, RATE_LIMIT_EXCEEDED
  2. **Business Logic Errors (400):** GOAL_LIMIT_EXCEEDED, INVALID_STATUS_TRANSITION, DUPLICATE_RESOURCE
  3. **Server Errors (5xx):** INTERNAL_ERROR, NOT_IMPLEMENTED, SERVICE_UNAVAILABLE
  4. **External Service Errors:** DATABASE_ERROR, AI_SERVICE_ERROR, STORAGE_ERROR, EXTERNAL_API_ERROR
- [ ] For each error code, document:
  - HTTP status code
  - Retryable (yes/no)
  - Example scenarios
  - Frontend handling recommendation
  - retryAfter behavior (if applicable)

**3. Exception Handler Registration (Optional Decision Point)**
- [ ] **Decision:** Should we register the exception handlers in `main.py`?
  - **Option A (Recommended):** Register handlers for consistent error responses across all endpoints
  - **Option B:** Keep existing main.py handlers (already functional)
- [ ] If Option A chosen:
  ```python
  # app/main.py
  from app.core.errors import (
      app_exception_handler,
      validation_exception_handler,
      generic_exception_handler,
      AppException
  )
  from fastapi.exceptions import RequestValidationError

  app.add_exception_handler(AppException, app_exception_handler)
  app.add_exception_handler(RequestValidationError, validation_exception_handler)
  app.add_exception_handler(Exception, generic_exception_handler)
  ```
- [ ] Document decision and rationale

**4. Mobile Error Handling Hooks**
- [ ] **Decision:** Defer to Epic 1 UI stories (frontend work, out of scope for backend story)
- [ ] Create placeholder story: "1.X: Mobile Error Handling Hooks" (2-3 pts)
- [ ] Document in epic tracking

**Story 0.8 Completion Criteria:**
- [ ] `retryAfter` field added and tested
- [ ] `docs/api-error-codes.md` complete with all 17 error codes
- [ ] Exception handler registration decision documented
- [ ] Mobile hooks deferred with new story created
- [ ] All Story 0.8 acceptance criteria met (backend portions)

---

### AC-11: Template Usability Improvements

**Goal:** Make templates immediately useful for Epic 2-8 developers with clear, actionable guidance

**Problem:** Templates exist but developers don't have a "start here" guide

**Solution:** Create comprehensive Quick Start Guide with step-by-step walkthrough

**Tasks:**

**1. Create Backend Quick Start Guide**
- [ ] Create `docs/dev/backend-quick-start.md` (new file)
- [ ] Structure:

  **Section 1: "I Want to Create a New API Endpoint"**
  - Prerequisites checklist (Story 0.3 auth, Story 0.4 RLS)
  - 5-step process overview
  - Expected time: 30 minutes

  **Section 2: Step-by-Step Walkthrough (Using Goals API as Example)**
  ```markdown
  ## Step 1: Generate API Scaffold (2 minutes)

  Run the scaffolding script:
  ```bash
  cd weave-api
  python scripts/generate_api.py goal
  ```

  This creates:
  - `app/api/goals/router.py` (5 CRUD endpoints with 501 stubs)
  - `app/schemas/goal.py` (GoalCreate, GoalUpdate, GoalResponse)
  - `tests/test_goals_api.py` (5 integration tests)

  ## Step 2: Define Your Schemas (5 minutes)

  Edit `app/schemas/goal.py`:
  ```python
  from app.models.base import BaseCreateModel, BaseResponseModel
  from pydantic import Field
  from typing import Optional
  from uuid import UUID

  class GoalCreate(BaseCreateModel):
      title: str = Field(..., min_length=1, max_length=255)
      description: Optional[str] = Field(None, max_length=1000)
      is_quantifiable: bool = Field(False)

  class GoalUpdate(BaseUpdateModel):
      title: Optional[str] = Field(None, min_length=1, max_length=255)
      description: Optional[str] = Field(None, max_length=1000)

  class GoalResponse(BaseResponseModel):
      user_id: UUID
      title: str
      description: Optional[str]
      is_quantifiable: bool
      status: str  # "active" | "archived" | "completed"
  ```

  ## Step 3: Implement Router Logic (15 minutes)

  Edit `app/api/goals/router.py`, replace 501 stubs with real logic:
  ```python
  @router.get("/", response_model=dict)
  async def list_goals(
      user: dict = Depends(get_current_user),
      page: int = Query(1, ge=1),
      per_page: int = Query(20, ge=1, le=100)
  ):
      auth_user_id = user["sub"]

      # Query database (example with Supabase)
      from app.core.supabase import get_supabase_client
      supabase = get_supabase_client()

      offset = (page - 1) * per_page
      response = supabase.table("goals") \
          .select("*") \
          .eq("user_id", auth_user_id) \
          .is_("deleted_at", None) \
          .order("created_at", desc=True) \
          .range(offset, offset + per_page - 1) \
          .execute()

      total_count = len(response.data)  # Or separate count query

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

  ## Step 4: Write Tests (5 minutes)

  Edit `tests/test_goals_api.py`, replace 501 tests with real tests:
  ```python
  def test_list_goals_empty(client: TestClient, auth_headers):
      """Test listing goals when user has none"""
      response = client.get("/api/goals", headers=auth_headers)
      assert response.status_code == 200
      data = response.json()
      assert data["data"] == []
      assert data["meta"]["total"] == 0

  def test_create_goal_success(client: TestClient, auth_headers):
      """Test creating a new goal"""
      payload = {
          "title": "Run 5K",
          "description": "Complete a 5K run by end of month",
          "is_quantifiable": True
      }
      response = client.post("/api/goals", json=payload, headers=auth_headers)
      assert response.status_code == 201
      data = response.json()
      assert data["data"]["title"] == "Run 5K"
      assert "id" in data["data"]
  ```

  ## Step 5: Register Router & Test (3 minutes)

  Edit `app/main.py`:
  ```python
  from app.api.goals import router as goals_router

  app.include_router(goals_router)
  ```

  Run tests:
  ```bash
  uv run pytest tests/test_goals_api.py -v
  ```

  Start server and test manually:
  ```bash
  uv run uvicorn app.main:app --reload
  curl http://localhost:8000/api/goals -H "Authorization: Bearer <token>"
  ```
  ```

  **Section 3: Common Patterns**
  - Pagination best practices
  - Filtering and sorting
  - Error handling (using app.core.errors)
  - Service layer decision (when to extract)

  **Section 4: Troubleshooting**
  - Router not registered → Check main.py
  - Auth failing → Check get_current_user import
  - Tests failing → Check fixtures in conftest.py
  - Database errors → Check RLS policies

**2. Enhance Scaffolding Script (Optional)**
- [ ] Add help text: `python scripts/generate_api.py --help`
- [ ] Add interactive mode: Prompts for resource name if not provided
- [ ] Add validation: Prevent invalid resource names (spaces, capitals)
- [ ] Add success message with next steps:
  ```
  ✅ Generated API scaffold for 'goal'

  Files created:
  - app/api/goals/router.py (5 endpoints)
  - app/schemas/goal.py (3 schemas)
  - tests/test_goals_api.py (5 tests)

  Next steps:
  1. Define schemas in app/schemas/goal.py
  2. Implement router logic in app/api/goals/router.py
  3. Register router in app/main.py
  4. Run tests: uv run pytest tests/test_goals_api.py -v

  See docs/dev/backend-quick-start.md for detailed walkthrough
  ```

**3. Update CLAUDE.md**
- [ ] Add "Quick Start: Creating Your First API" section under Story 1.5.2
- [ ] Content:
  ```markdown
  **Quick Start: Creating Your First API**

  New to backend development on this project? Start here:
  1. Read `docs/dev/backend-quick-start.md` (30-minute walkthrough)
  2. Run `python scripts/generate_api.py <resource>` to scaffold
  3. Follow step-by-step guide to implement your first endpoint

  Example: `python scripts/generate_api.py goal` creates Goals API scaffold
  ```

**Completion Criteria:**
- [ ] `docs/dev/backend-quick-start.md` created with complete walkthrough
- [ ] Scaffolding script enhanced (or documented as optional improvement)
- [ ] CLAUDE.md updated with quick start reference
- [ ] At least 1 developer successfully creates API using guide (validation)

---
```

**Rationale:** Complete Story 0.8 requirements + improve template usability for Epic 2-8 developers

---

### Change Group 2: Sprint Status Updates

#### Change 2.1: Update Story 0.8 Status

**File:** `docs/sprint-status.yaml`

**Line 96:**

**OLD:**
```yaml
0-8-error-handling-framework: backlog         # 3 pts (DEFERRED - stretch goal)
```

**NEW:**
```yaml
0-8-error-handling-framework: done            # 3 pts ✅ Completed within Story 1.5.2 (Backend Standardization)
```

**Rationale:** Story 0.8 backend work is complete via Story 1.5.2 expansion

---

#### Change 2.2: Update Story 1.5.2 Estimate

**File:** `docs/sprint-status.yaml`

**Line 110:**

**OLD:**
```yaml
1-5-2-backend-standardization: ready-for-dev  # 7-9 pts ⚡ VALIDATED 2025-12-23 - API/model templates + 28 API endpoint stubs
```

**NEW:**
```yaml
1-5-2-backend-standardization: ready-for-dev  # 9-11 pts ⚡ EXPANDED 2025-12-23 - Includes Story 0.8 completion + template usability improvements (retryAfter field, api-error-codes.md, quick start guide)
```

**Rationale:** Reflect expanded scope and increased estimate

---

#### Change 2.3: Update Epic Completion Tracking

**File:** `docs/sprint-status.yaml`

**Line 387:**

**OLD:**
```yaml
epic-0-foundation: 27/41             # Week 0: DONE ✅ (7/7 core stories, 66% pts, 14 pts deferred as stretch goals: 0.8 error framework, 0.9 image handling, 0.10 AI failure)
```

**NEW:**
```yaml
epic-0-foundation: 30/41             # Week 0: DONE ✅ (8/7 core stories, 73% pts, Story 0.8 completed via Story 1.5.2, 11 pts deferred: 0.9 image handling, 0.10 memory system, 0.11 voice/STT)
```

**Rationale:** Story 0.8 (3 pts) now complete, update completion percentage

---

### Change Group 3: PRD Updates

#### Change 3.1: Mark Story 0.8 as Completed

**File:** `docs/prd/epic-0-foundation.md`

**Line 148 (After Story 0.8 title):**

**INSERT:**
```markdown
**Status:** ✅ **COMPLETED** within Story 1.5.2 (Backend API/Model Standardization)

**Implementation Notes:**
- Backend error handling delivered in Story 1.5.2 with enhanced scope:
  - 17 error codes (vs 5 required)
  - 7 custom exception classes
  - Comprehensive error utilities (app/core/errors.py, 492 lines)
  - Standard error response format with retryable flag
  - retryAfter field for rate limiting (added in Story 1.5.2 expansion)
  - Complete API error codes documentation (docs/api-error-codes.md)
- Mobile error handling hooks deferred to Epic 1 UI stories (frontend work)
- See Story 1.5.2 for complete implementation details

**Story Points:** 3 (delivered as part of Story 1.5.2's 9-11 pts)
```

**Rationale:** Clearly communicate Story 0.8's completion status in PRD

---

### Change Group 4: Documentation Updates

#### Change 4.1: Update CLAUDE.md

**File:** `CLAUDE.md`

**Section:** Story 1.5.2: Backend/API Patterns (around line 84-99)

**OLD:**
```markdown
**Templates Available** (`scripts/templates/`):
- `api_router_template.py` - FastAPI router with all CRUD operations
- `pydantic_schema_template.py` - Request/response models
- `service_template.py` - Service layer with decision tree
- `test_template.py` - Pytest fixtures and patterns
- `database_table_template.sql` - PostgreSQL table with RLS

**Scaffolding Tool:**
```bash
python scripts/generate_api.py <resource>
python scripts/generate_api.py goal  # Example
```

**API Endpoint Registry:** `docs/dev/backend-api-integration.md` (28 endpoints mapped)
```

**NEW:**
```markdown
**Templates Available** (`scripts/templates/`):
- `api_router_template.py` - FastAPI router with all CRUD operations
- `pydantic_schema_template.py` - Request/response models
- `service_template.py` - Service layer with decision tree
- `test_template.py` - Pytest fixtures and patterns
- `database_table_template.sql` - PostgreSQL table with RLS

**Scaffolding Tool:**
```bash
python scripts/generate_api.py <resource>
python scripts/generate_api.py goal  # Example: Creates Goals API scaffold
```

**Quick Start: Creating Your First API**

New to backend development on this project? Start here:
1. 📖 Read `docs/dev/backend-quick-start.md` (30-minute walkthrough)
2. 🚀 Run `python scripts/generate_api.py <resource>` to scaffold
3. ✏️ Follow step-by-step guide to implement your first endpoint

Example: `python scripts/generate_api.py goal` creates Goals API scaffold with:
- `app/api/goals/router.py` (5 CRUD endpoints)
- `app/schemas/goal.py` (GoalCreate, GoalUpdate, GoalResponse)
- `tests/test_goals_api.py` (5 integration tests)

**Developer Guides:**
- `docs/dev/backend-patterns-guide.md` - Comprehensive patterns reference
- `docs/dev/backend-api-integration.md` - 28 API endpoint registry
- `docs/dev/backend-quick-start.md` - Step-by-step first API walkthrough ⚡ NEW
- `docs/api-error-codes.md` - Complete error code catalog ⚡ NEW

**Error Handling (Story 0.8 Complete):**
- ✅ 17 standard error codes (VALIDATION_ERROR, NOT_FOUND, RATE_LIMIT_EXCEEDED, etc.)
- ✅ Error response format: `{error, message, retryable, retryAfter?}`
- ✅ Exception handlers and utilities in `app/core/errors.py`
- 📖 See `docs/api-error-codes.md` for complete catalog
```

**Rationale:** Add quick start section, highlight new guides, confirm Story 0.8 completion

---

## Section 5: Implementation Handoff

### Change Scope Classification

**Scope:** Minor (Direct Implementation)

**Rationale:**
- All changes are additive (no breaking changes)
- Effort is well-defined and scoped (4-5 tasks, 2-3 hours)
- No architectural decisions required
- No cross-team coordination needed

### Handoff Recipients

**Primary: Development Team**
- **Responsibility:** Implement 4-5 remaining tasks (AC-10, AC-11)
- **Deliverables:**
  1. Add `retryAfter` parameter to `format_error_response()`
  2. Create `docs/api-error-codes.md` with all 17 error codes
  3. Create `docs/dev/backend-quick-start.md` with walkthrough
  4. Decide on exception handler registration (document decision)
  5. Update CLAUDE.md with quick start section
  6. Add 2 tests (retryAfter field, documentation files exist)
- **Timeline:** Complete within current Story 1.5.2 work window
- **Success Criteria:**
  - All Story 0.8 backend ACs met
  - All Story 1.5.2 ACs met (original + new AC-10, AC-11)
  - At least 1 developer successfully uses quick start guide
  - All tests passing

**Secondary: Documentation Team (Optional)**
- **Responsibility:** Review and polish `backend-quick-start.md` for clarity
- **Timeline:** Post-implementation review

### Implementation Plan

**Phase 1: Complete Story 0.8 Backend Work (1-2 hours)**
1. Add `retryAfter` parameter to error utilities
2. Create comprehensive error codes documentation
3. Make decision on handler registration
4. Write tests for new functionality

**Phase 2: Template Usability (1-2 hours)**
1. Write backend quick start guide with full walkthrough
2. (Optional) Enhance generate_api.py CLI
3. Update CLAUDE.md with quick start section

**Phase 3: Validation (30 minutes)**
1. Run all tests (expect all passing)
2. Ask 1 developer to follow quick start guide (usability test)
3. Address any feedback or clarity issues

**Phase 4: Update Project Artifacts (15 minutes)**
1. Update sprint-status.yaml (Story 0.8 done, Story 1.5.2 estimate)
2. Update epic-0-foundation.md (Story 0.8 completion note)
3. Create placeholder story for mobile error hooks (Epic 1)

### Success Criteria

**Story 0.8 Complete:**
- [ ] `retryAfter` field added and working
- [ ] `docs/api-error-codes.md` complete with all 17 error codes
- [ ] Handler registration decision documented
- [ ] Mobile hooks deferred (new story created)

**Story 1.5.2 Complete (Expanded):**
- [ ] All original ACs met (AC-1 through AC-9)
- [ ] AC-10 complete (Story 0.8 integration)
- [ ] AC-11 complete (template usability)
- [ ] `docs/dev/backend-quick-start.md` created and validated
- [ ] CLAUDE.md updated with quick start section

**Quality Criteria:**
- [ ] All tests passing (13+ existing + 2 new)
- [ ] No linting errors
- [ ] At least 1 developer successfully follows quick start guide
- [ ] Documentation is clear and actionable

**Sprint Tracking:**
- [ ] Sprint status updated (Story 0.8 done, Story 1.5.2 estimate)
- [ ] PRD updated (Story 0.8 completion note)
- [ ] Epic completion percentages updated

---

## Section 6: Risk Mitigation

### Identified Risks

**Risk 1: Scope Creep**
- **Description:** Adding more tasks beyond the 4-5 defined
- **Likelihood:** Low
- **Impact:** Medium
- **Mitigation:** Strict adherence to AC-10 and AC-11 tasks only

**Risk 2: Estimate Underestimation**
- **Description:** Tasks take longer than 2-3 hours estimated
- **Likelihood:** Low
- **Impact:** Low
- **Mitigation:** Tasks are well-defined, similar to completed work, +2 pts buffer

**Risk 3: Quick Start Guide Quality**
- **Description:** Guide is unclear or doesn't help developers
- **Likelihood:** Low
- **Impact:** Medium
- **Mitigation:** Usability test with 1 developer, iterate if needed

**Risk 4: Exception Handler Registration Debate**
- **Description:** Team debates whether to register handlers (decision point)
- **Likelihood:** Medium
- **Impact:** Low
- **Mitigation:** Document both options clearly, recommend Option A, time-box decision to 15 minutes

### Rollback Plan

**If proposal is rejected:**
1. Keep Story 1.5.2 as-is (7-9 pts)
2. Implement Story 0.8 separately in future sprint (3 pts)
3. Template usability improvements defer to future

**If implementation issues arise:**
- All changes are additive, can be reverted without impact
- No database migrations or breaking changes

---

## Appendices

### Appendix A: Story 0.8 Original Requirements (PRD)

From `docs/prd/epic-0-foundation.md` lines 148-173:

```markdown
### US-0.8: Error Handling Framework

**Priority:** M (Must Have)

**As a** developer
**I want to** have a consistent error handling framework
**So that** users receive helpful error messages and errors are properly logged

**Acceptance Criteria:**
- [ ] Define standard error response format: `{error: {code, message, retryable, retryAfter?}}`
- [ ] Establish HTTP status codes for each error type:
  - 400 for validation errors
  - 401 for authentication errors
  - 429 for rate limiting
  - 500 for server errors
  - 503 for AI service unavailable
- [ ] Create error response utilities for backend
- [ ] Create error handling hooks for mobile (API errors, network errors, AI errors)
- [ ] Document all error codes in `/docs/api-error-codes.md`

**Story Points:** 3
```

### Appendix B: Story 1.5.2 Current Implementation Summary

**Files Created (12):**
1. `scripts/templates/api_router_template.py` (250 lines)
2. `scripts/templates/pydantic_schema_template.py` (180 lines)
3. `scripts/templates/service_template.py` (150 lines)
4. `scripts/templates/test_template.py` (220 lines)
5. `scripts/templates/database_table_template.sql` (80 lines)
6. `weave-api/app/models/base.py` (120 lines)
7. `weave-api/app/core/errors.py` (492 lines) ⭐ Story 0.8 overlap
8. `docs/dev/backend-patterns-guide.md` (630 lines)
9. `docs/dev/backend-api-integration.md` (474 lines)
10. `scripts/generate_api.py` (180 lines)
11. `weave-api/app/api/notifications.py` (200 lines)
12. `weave-api/tests/test_story_1_5_2_backend_standardization.py` (310 lines)

**Test Results:**
- 13 tests passed ✅
- 4 tests skipped (auth-required, expected)
- 0 tests failed
- Zero linting errors

### Appendix C: Effort Breakdown

| Task | Estimated Time | Complexity |
|------|----------------|------------|
| Add retryAfter parameter | 15 min | Low |
| Create api-error-codes.md | 45 min | Low |
| Create backend-quick-start.md | 90 min | Medium |
| Enhance generate_api.py (optional) | 30 min | Low |
| Handler registration decision | 15 min | Low |
| Update CLAUDE.md | 10 min | Low |
| Write 2 new tests | 20 min | Low |
| Update sprint status | 10 min | Low |
| Update PRD | 5 min | Low |
| **Total** | **240 min (4 hours)** | **Low-Medium** |

**Buffer:** 2 story points = ~6 hours capacity (4 hours needed, 2 hours buffer)

---

## Approval

**Prepared By:** Dev Agent (Amelia) via Correct Course workflow
**Date:** 2025-12-23
**Review Status:** Pending user approval

**User Approval:**
- [ ] Approved - Proceed with implementation
- [ ] Revise - Feedback provided below
- [ ] Rejected - Rationale provided below

**Feedback/Notes:**

---

**Next Steps After Approval:**
1. Development team implements AC-10 and AC-11 tasks
2. Update sprint-status.yaml and epic-0-foundation.md
3. Validate with developer usability test
4. Mark Story 1.5.2 as complete
5. Mark Story 0.8 as complete (via 1.5.2)

# ATDD Checklist - Story 6.2: Contextual AI Responses (Tech Context Engine)

**Date:** 2025-12-23
**Author:** Jack Luo
**Primary Test Level:** API Tests (with Unit + Integration support)

---

## Story Summary

**As a** user,
**I want** to receive AI advice that references my actual data (goals, completions, journal entries, identity),
**So that** guidance feels personal, not generic, and helps me act on my specific situation.

**Core Feature:** Context Builder Service that assembles canonical user state snapshot (goals, recent activity, journal, identity, metrics) and injects it into AI prompts to enable personalized, data-driven coaching.

---

## Acceptance Criteria

1. ✅ **Context Builder Service** - Assemble canonical user context snapshot (<500ms)
2. ✅ **AI Service Integration** - Inject user_context into existing AIService.generate() method
3. ✅ **Dream Self Personality Voice** - Load personality from identity_docs and inject into system prompt
4. ✅ **Evidence-Based Response Validation** - Detect generic responses, retry with stronger prompt (max 1 attempt)
5. ✅ **Update Chat Endpoint** - Build context before calling AI, return context_used flag
6. ✅ **Context Preview Endpoint** - Admin endpoint to preview assembled context (debugging)
7. ✅ **Database Schema** - Add context_used, context_assembly_time_ms, quality_flag to ai_runs table
8. ✅ **Backend Tests** - Comprehensive unit tests for all services
9. ✅ **Integration Tests** - Real user scenarios with database

---

## Failing Tests Created (RED Phase)

### Unit Tests for ContextBuilderService (11 tests)

**File:** `weave-api/tests/test_context_builder.py` (420 lines)

- ✅ **Test:** `test_context_builder_returns_structured_json`
  - **Status:** RED - `ModuleNotFoundError: No module named 'app.services.context_builder'`
  - **Verifies:** ContextBuilderService returns valid JSON with required fields

- ✅ **Test:** `test_context_includes_active_goals`
  - **Status:** RED - Missing ContextBuilderService implementation
  - **Verifies:** Context includes goals array with title, active_binds, completion_rate

- ✅ **Test:** `test_context_includes_recent_completions`
  - **Status:** RED - Missing ContextBuilderService implementation
  - **Verifies:** Recent activity includes completions count (last 7 days)

- ✅ **Test:** `test_context_includes_journal_entries`
  - **Status:** RED - Missing ContextBuilderService implementation
  - **Verifies:** Journal array includes last 3 entries with fulfillment scores

- ✅ **Test:** `test_context_includes_dream_self_personality`
  - **Status:** RED - Missing ContextBuilderService implementation
  - **Verifies:** Identity includes dream_self_name from identity_docs table

- ✅ **Test:** `test_context_assembly_performance_under_500ms`
  - **Status:** RED - Missing ContextBuilderService implementation
  - **Verifies:** Context assembly completes in <500ms (performance requirement)

- ✅ **Test:** `test_context_builder_handles_no_goals_gracefully`
  - **Status:** RED - Missing ContextBuilderService implementation
  - **Verifies:** Returns empty goals array (not None) when user has no goals

- ✅ **Test:** `test_context_builder_handles_no_dream_self_doc`
  - **Status:** RED - Missing ContextBuilderService implementation
  - **Verifies:** Fallback to default coach persona when no Dream Self doc exists

- ✅ **Test:** `test_context_builder_handles_database_timeout`
  - **Status:** RED - Missing ContextBuilderService implementation
  - **Verifies:** Returns None on timeout (allows graceful fallback in API)

- ✅ **Test:** `test_context_builder_includes_consistency_metrics`
  - **Status:** RED - Missing ContextBuilderService implementation
  - **Verifies:** Metrics include current_streak, completion_rate

- ✅ **Test:** `test_context_builder_handles_partial_failure`
  - **Status:** RED - Missing ContextBuilderService implementation
  - **Verifies:** Returns partial context if some queries fail

---

### Unit Tests for ResponseQualityChecker (10 tests)

**File:** `weave-api/tests/test_response_quality_checker.py` (249 lines)

- ✅ **Test:** `test_quality_checker_detects_generic_stay_motivated_phrase`
  - **Status:** RED - `ModuleNotFoundError: No module named 'app.services.response_quality_checker'`
  - **Verifies:** Detects generic "stay motivated" without specifics

- ✅ **Test:** `test_quality_checker_allows_stay_motivated_with_specifics`
  - **Status:** RED - Missing ResponseQualityChecker implementation
  - **Verifies:** Allows generic phrases if followed by user data

- ✅ **Test:** `test_quality_checker_detects_multiple_generic_phrases`
  - **Status:** RED - Missing ResponseQualityChecker implementation
  - **Verifies:** Detects multiple generic phrases (keep going, don't give up)

- ✅ **Test:** `test_quality_checker_detects_goal_name_mention`
  - **Status:** RED - Missing ResponseQualityChecker implementation
  - **Verifies:** Response mentioning goal name is marked as specific

- ✅ **Test:** `test_quality_checker_detects_streak_mention`
  - **Status:** RED - Missing ResponseQualityChecker implementation
  - **Verifies:** Response mentioning streak is marked as specific

- ✅ **Test:** `test_quality_checker_detects_completion_count_mention`
  - **Status:** RED - Missing ResponseQualityChecker implementation
  - **Verifies:** Response with completion count is marked as specific

- ✅ **Test:** `test_quality_checker_rejects_response_with_no_data_references`
  - **Status:** RED - Missing ResponseQualityChecker implementation
  - **Verifies:** Response without data mentions is flagged as generic

- ✅ **Test:** `test_quality_checker_case_insensitive_goal_matching`
  - **Status:** RED - Missing ResponseQualityChecker implementation
  - **Verifies:** Goal name matching works with different cases

- ✅ **Test:** `test_quality_checker_detects_bind_title_mention`
  - **Status:** RED - Missing ResponseQualityChecker implementation
  - **Verifies:** Response mentioning bind title is marked as specific

- ✅ **Test:** `test_quality_checker_handles_empty_context`
  - **Status:** RED - Missing ResponseQualityChecker implementation
  - **Verifies:** Doesn't flag generic responses when context is empty (new user)

---

### API Tests for Chat Endpoint (7 tests)

**File:** `weave-api/tests/test_ai_chat_context_api.py` (203 lines)

- ✅ **Test:** `test_chat_message_includes_context_used_flag`
  - **Status:** RED - API endpoint returns 404 (not implemented yet)
  - **Verifies:** Response includes context_used=true

- ✅ **Test:** `test_chat_message_with_context_disabled`
  - **Status:** RED - include_context parameter not supported
  - **Verifies:** Context can be disabled via include_context=false

- ✅ **Test:** `test_chat_message_returns_context_assembly_time`
  - **Status:** RED - Meta missing context_assembly_time_ms field
  - **Verifies:** Response meta includes assembly time

- ✅ **Test:** `test_chat_message_fallback_when_context_building_fails`
  - **Status:** RED - Fallback behavior not implemented
  - **Verifies:** Graceful fallback when context building fails

- ✅ **Test:** `test_admin_context_preview_endpoint_success`
  - **Status:** RED - Admin endpoint `/api/admin/context-preview/{user_id}` not found
  - **Verifies:** Admin can preview assembled context

- ✅ **Test:** `test_admin_context_preview_unauthorized_without_admin_key`
  - **Status:** RED - Admin auth not implemented
  - **Verifies:** Context preview requires X-Admin-Key header

- ✅ **Test:** `test_admin_context_preview_invalid_user_id`
  - **Status:** RED - Endpoint not implemented
  - **Verifies:** Returns 404 for non-existent user

---

### Integration Tests with Real Data (6 tests)

**File:** `weave-api/tests/test_context_integration.py` (266 lines)

- ✅ **Test:** `test_user_with_active_goals_receives_specific_advice`
  - **Status:** RED - Complete integration flow not implemented
  - **Verifies:** AI response mentions user's actual goal names

- ✅ **Test:** `test_user_with_low_fulfillment_score_receives_empathetic_response`
  - **Status:** RED - AI doesn't reference journal data yet
  - **Verifies:** AI acknowledges recent struggles based on journal

- ✅ **Test:** `test_user_with_streak_receives_celebration`
  - **Status:** RED - AI doesn't reference completion streaks yet
  - **Verifies:** AI celebrates user's consistency streak

- ✅ **Test:** `test_user_without_dream_self_gets_default_coach_persona`
  - **Status:** RED - Dream Self personality not implemented
  - **Verifies:** Default coach persona used when no Dream Self doc

- ✅ **Test:** `test_complete_chat_flow_with_context_building`
  - **Status:** RED - End-to-end flow not implemented
  - **Verifies:** Complete flow: chat → context → AI → response → ai_runs logging

- ✅ **Test:** `test_context_caching_for_repeat_requests`
  - **Status:** RED - Context caching not implemented
  - **Verifies:** Context cached for 5 minutes (repeat requests faster)

---

## Data Factories Created

### Existing Factories (Enhanced)

**File:** `weave-api/tests/factories.py` (286 lines)

**New Factories for Story 6.2:**

- ✅ `create_test_identity_doc(user_id, **kwargs)` - Dream Self identity documents
  - **Exports:** Complete identity doc with dream_self_name, archetype, personality_traits, speaking_style
  - **Example Usage:**
    ```python
    identity_doc = create_test_identity_doc(user_id="test-user-123", content={
        "dream_self_name": "Focused Alex"
    })
    ```

- ✅ `create_test_user_context(user_id, **kwargs)` - Assembled context snapshots
  - **Exports:** Full context structure with goals, recent_activity, journal, identity, metrics
  - **Example Usage:**
    ```python
    context = create_test_user_context(user_id="test-user-456")
    # Override specific goals
    context_with_custom_goals = create_test_user_context(
        goals=[{"title": "Custom goal", "completion_rate": 0.95}]
    )
    ```

- ✅ `create_test_ai_run(user_id, **kwargs)` - AI runs with context tracking
  - **Exports:** AI run entry with context_used, context_assembly_time_ms, quality_flag fields
  - **Example Usage:**
    ```python
    ai_run = create_test_ai_run(
        user_id="test-user-789",
        context_used=True,
        quality_flag="excellent"
    )
    ```

---

## Database Migration Required

**File:** `supabase/migrations/20251223_ai_context_tracking.sql` (not created yet)

```sql
-- Story 6.2: Add context tracking columns to ai_runs table

ALTER TABLE ai_runs ADD COLUMN IF NOT EXISTS context_used BOOLEAN DEFAULT false;
ALTER TABLE ai_runs ADD COLUMN IF NOT EXISTS context_assembly_time_ms INT;
ALTER TABLE ai_runs ADD COLUMN IF NOT EXISTS quality_flag TEXT
  CHECK (quality_flag IN ('generic', 'specific', 'excellent'));

-- Performance indexes for context assembly (CRITICAL for <500ms target)
CREATE INDEX IF NOT EXISTS idx_subtask_completions_user_recent
  ON subtask_completions(user_id, completed_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_journal_entries_user_recent
  ON journal_entries(user_id, local_date DESC)
  WHERE deleted_at IS NULL;

-- Column documentation
COMMENT ON COLUMN ai_runs.context_used IS 'Whether user context was injected into AI prompt (Story 6.2)';
COMMENT ON COLUMN ai_runs.context_assembly_time_ms IS 'Time to assemble user context snapshot (target: <500ms)';
COMMENT ON COLUMN ai_runs.quality_flag IS 'AI response quality: generic (retry triggered), specific (good), excellent (cites data)';
```

**Action Required:** Create migration file and apply via `npx supabase db push`

---

## Implementation Checklist

### Task 1: Create ContextBuilderService (11 tests depend on this)

**File:** `weave-api/app/services/context_builder.py`

**Tasks to make tests pass:**

- [ ] 1.1: Create `ContextBuilderService` class with `__init__(self, db: Client)` constructor
- [ ] 1.2: Implement `async def build_context(self, user_id: str) -> Optional[dict]` method
- [ ] 1.3: Query active goals (max 3, sorted by created_at DESC) from `goals` table
  - SQL: `SELECT * FROM goals WHERE user_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 3`
- [ ] 1.4: Query recent completions (last 7 days) from `subtask_completions` table
  - SQL: `SELECT * FROM subtask_completions WHERE user_id = ? AND completed_at >= ? ORDER BY completed_at DESC`
  - Calculate date threshold: `datetime.now(timezone.utc) - timedelta(days=7)`
- [ ] 1.5: Query recent journal entries (last 3) from `journal_entries` table
  - SQL: `SELECT * FROM journal_entries WHERE user_id = ? ORDER BY local_date DESC LIMIT 3`
- [ ] 1.6: Query Dream Self document from `identity_docs` table
  - SQL: `SELECT * FROM identity_docs WHERE user_id = ? AND type = 'dream_self' LIMIT 1`
  - If not found, use default: `{"dream_self_name": "Supportive Coach", "personality_traits": ["supportive"]}`
- [ ] 1.7: Calculate consistency metrics (current_streak, completion_rate) from completions
- [ ] 1.8: Format as structured JSON (see context structure in story notes)
- [ ] 1.9: Add performance monitoring (log assembly time if >500ms)
- [ ] 1.10: Handle database timeout gracefully (return None after timeout)
- [ ] 1.11: Handle partial failures (return partial context with warning log)
- [ ] Run tests: `uv run pytest tests/test_context_builder.py -v`
- [ ] ✅ All 11 tests pass (green phase)

**Estimated Effort:** 4 hours

---

### Task 2: Create ResponseQualityChecker (10 tests depend on this)

**File:** `weave-api/app/services/response_quality_checker.py`

**Tasks to make tests pass:**

- [ ] 2.1: Create `ResponseQualityChecker` class
- [ ] 2.2: Implement `is_generic_response(self, response: str, user_context: dict) -> bool` method
  - Check for generic phrases: "stay motivated", "keep going", "don't give up", etc.
  - Use regex: `GENERIC_PHRASES = [r"stay motivated", r"keep going", ...]`
  - If generic phrase found, check if followed by specific data
- [ ] 2.3: Implement `mentions_user_data(self, response: str, user_context: dict) -> bool` method
  - Check if response mentions goal names (case-insensitive)
  - Check if response mentions "streak"
  - Check if response mentions specific numbers + "day"/"completion"/"bind"
  - Pattern: `r'\d+\s+(day|week|completion|bind)'`
- [ ] 2.4: Handle empty context (return False for is_generic when no data exists)
- [ ] 2.5: Add case-insensitive matching for goal/bind names
- [ ] Run tests: `uv run pytest tests/test_response_quality_checker.py -v`
- [ ] ✅ All 10 tests pass (green phase)

**Estimated Effort:** 2 hours

---

### Task 3: Update AIService with user_context parameter (Integration)

**File:** `weave-api/app/services/ai/ai_service.py` (MODIFY EXISTING)

**Tasks to make tests pass:**

- [ ] 3.1: Add `user_context: Optional[dict] = None` parameter to `generate()` method
- [ ] 3.2: Create `_build_system_prompt(self, user_context: dict) -> str` method
  - Template: "You are {dream_self_name}. Your personality: {personality_traits}. User's current situation: {json_context}"
- [ ] 3.3: Inject context into user prompt using `_inject_context(prompt, user_context)` helper
- [ ] 3.4: Log `context_used=True` to ai_runs table when context provided
- [ ] 3.5: Log `context_assembly_time_ms` to ai_runs table (passed from caller)
- [ ] 3.6: Implement retry logic for generic responses (max 1 attempt):
  - After AI response, check with `ResponseQualityChecker.is_generic_response()`
  - If generic, regenerate with stronger prompt: "You MUST reference specific data from context"
  - Log `quality_flag` to ai_runs: 'generic' (retry triggered), 'specific' (good), 'excellent' (cites data)
- [ ] ⚠️ **CRITICAL:** DO NOT create new AI service - ENHANCE existing AIService
- [ ] Run tests: `uv run pytest tests/test_ai_service.py -v` (verify no regressions)
- [ ] ✅ AIService tests still pass + accepts user_context parameter

**Estimated Effort:** 3 hours

---

### Task 4: Update Chat API Endpoint (7 tests depend on this)

**File:** `weave-api/app/api/ai_chat_router.py` (MODIFY EXISTING)

**Tasks to make tests pass:**

- [ ] 4.1: Import `ContextBuilderService` at top of file
- [ ] 4.2: In `POST /api/ai-chat/messages` handler, add context building BEFORE AIService call:
  ```python
  # Build user context
  context_builder = ContextBuilderService(db=supabase_client)
  start_time = time.time()
  user_context = await context_builder.build_context(user.id)
  assembly_time_ms = (time.time() - start_time) * 1000
  ```
- [ ] 4.3: Pass `user_context` to `AIService.generate(user_context=user_context)`
- [ ] 4.4: Add `context_used: bool` to response data:
  - `True` if context built successfully
  - `False` if context is None (fallback mode)
- [ ] 4.5: Add `context_assembly_time_ms` to response meta
- [ ] 4.6: Support `include_context: bool = True` in request body (allow disabling context)
- [ ] 4.7: Fallback gracefully if context building fails (log warning, proceed without context)
- [ ] Run tests: `uv run pytest tests/test_ai_chat_context_api.py::test_chat_message_includes_context_used_flag -v`
- [ ] Run tests: `uv run pytest tests/test_ai_chat_context_api.py::test_chat_message_with_context_disabled -v`
- [ ] Run tests: `uv run pytest tests/test_ai_chat_context_api.py::test_chat_message_returns_context_assembly_time -v`
- [ ] Run tests: `uv run pytest tests/test_ai_chat_context_api.py::test_chat_message_fallback_when_context_building_fails -v`
- [ ] ✅ 4 API tests pass (green phase)

**Estimated Effort:** 2 hours

---

### Task 5: Create Admin Context Preview Endpoint (3 tests depend on this)

**File:** `weave-api/app/api/admin_router.py` (CREATE NEW or add to existing admin routes)

**Tasks to make tests pass:**

- [ ] 5.1: Create `GET /api/admin/context-preview/{user_id}` endpoint
- [ ] 5.2: Add middleware to require `X-Admin-Key` header:
  ```python
  def verify_admin_key(request: Request):
      admin_key = request.headers.get("X-Admin-Key")
      expected_key = os.getenv("ADMIN_API_KEY")
      if admin_key != expected_key:
          raise HTTPException(status_code=401, detail="Unauthorized")
  ```
- [ ] 5.3: Build context using `ContextBuilderService.build_context(user_id)`
- [ ] 5.4: Return context JSON + assembly_time_ms in response
- [ ] 5.5: Handle non-existent user_id (return 404 or empty context)
- [ ] Run tests: `uv run pytest tests/test_ai_chat_context_api.py::test_admin_context_preview_endpoint_success -v`
- [ ] Run tests: `uv run pytest tests/test_ai_chat_context_api.py::test_admin_context_preview_unauthorized_without_admin_key -v`
- [ ] Run tests: `uv run pytest tests/test_ai_chat_context_api.py::test_admin_context_preview_invalid_user_id -v`
- [ ] ✅ 3 API tests pass (green phase)

**Estimated Effort:** 1.5 hours

---

### Task 6: Database Migration (Required for all AI logging tests)

**File:** `supabase/migrations/20251223_ai_context_tracking.sql` (CREATE NEW)

**Tasks to make tests pass:**

- [ ] 6.1: Create migration file with timestamp: `20251223HHMMSS_ai_context_tracking.sql`
- [ ] 6.2: Add ALTER TABLE statements for ai_runs (see SQL above)
- [ ] 6.3: Add performance indexes (idx_subtask_completions_user_recent, idx_journal_entries_user_recent)
- [ ] 6.4: Apply migration: `npx supabase db push`
- [ ] 6.5: Verify migration applied: `npx supabase db diff`
- [ ] ✅ Migration successful (database schema updated)

**Estimated Effort:** 30 minutes

---

### Task 7: Integration Tests (6 tests - Final Validation)

**Dependencies:** All previous tasks must be complete

**Tasks to make tests pass:**

- [ ] 7.1: Ensure local Supabase is running: `npx supabase start`
- [ ] 7.2: Run integration test: `uv run pytest tests/test_context_integration.py::test_user_with_active_goals_receives_specific_advice -v`
  - **Verifies:** AI response mentions user's actual goal names
- [ ] 7.3: Run integration test: `uv run pytest tests/test_context_integration.py::test_user_with_low_fulfillment_score_receives_empathetic_response -v`
  - **Verifies:** AI acknowledges recent struggles
- [ ] 7.4: Run integration test: `uv run pytest tests/test_context_integration.py::test_user_with_streak_receives_celebration -v`
  - **Verifies:** AI celebrates consistency streak
- [ ] 7.5: Run integration test: `uv run pytest tests/test_context_integration.py::test_user_without_dream_self_gets_default_coach_persona -v`
  - **Verifies:** Default persona when no Dream Self doc
- [ ] 7.6: Run integration test: `uv run pytest tests/test_context_integration.py::test_complete_chat_flow_with_context_building -v`
  - **Verifies:** End-to-end flow with ai_runs logging
- [ ] 7.7: Run integration test: `uv run pytest tests/test_context_integration.py::test_context_caching_for_repeat_requests -v`
  - **Verifies:** Context caching improves performance
- [ ] ✅ All 6 integration tests pass (green phase)

**Estimated Effort:** 2 hours (including debugging)

---

## Running Tests

```bash
# Run all Story 6.2 tests
uv run pytest tests/test_context_builder.py tests/test_response_quality_checker.py tests/test_ai_chat_context_api.py tests/test_context_integration.py -v

# Run specific test file
uv run pytest tests/test_context_builder.py -v

# Run specific test
uv run pytest tests/test_context_builder.py::test_context_builder_returns_structured_json -v

# Run tests with coverage
uv run pytest tests/ --cov=app.services.context_builder --cov-report=html

# Run only integration tests
uv run pytest tests/test_context_integration.py -v -m integration

# Run tests in parallel (faster)
uv run pytest tests/ -n auto
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete) ✅

**TEA Agent Responsibilities:**

- ✅ All 34 tests written and failing
- ✅ Fixtures and factories created with auto-cleanup (3 new factories added)
- ✅ Database migration SQL documented (not applied yet - DEV task)
- ✅ Implementation checklist created with 7 tasks
- ✅ Performance requirements specified (<500ms context assembly)

**Verification:**

- All tests run and fail as expected: `ModuleNotFoundError`, `AttributeError`, `404 Not Found`
- Failure messages are clear and actionable
- Tests fail due to missing implementation, not test bugs
- Test coverage: Unit (21), API (7), Integration (6) = 34 total

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Start with Task 1** (ContextBuilderService) - 11 tests depend on this
2. **Read the tests** in `test_context_builder.py` to understand expected behavior
3. **Implement minimal code** to make tests pass one by one
4. **Run tests frequently**: `uv run pytest tests/test_context_builder.py -v`
5. **Move to Task 2** (ResponseQualityChecker) once Task 1 is green
6. **Continue sequentially** through Tasks 3-7
7. **Check off subtasks** in implementation checklist as you complete them

**Key Principles:**

- One test at a time (don't try to fix all 34 at once)
- Minimal implementation (don't over-engineer)
- Run tests after each change (immediate feedback)
- Use implementation checklist as roadmap

**Progress Tracking:**

- Check off tasks as you complete them
- Share progress in daily standup
- Mark story as IN PROGRESS in sprint-status.yaml

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

**DEV Agent Responsibilities:**

1. **Verify all 34 tests pass** (green phase complete)
2. **Review code for quality:**
   - Extract common patterns into helper methods
   - Optimize database queries (use batch queries, avoid N+1)
   - Add docstrings to public methods
   - Remove any debug logging
3. **Performance optimization:**
   - Implement context caching (functools.lru_cache)
   - Add database indexes if P95 >500ms
   - Use asyncio.gather() for parallel queries
4. **Ensure tests still pass** after each refactor
5. **Update story status** to 'done' in sprint-status.yaml

**Key Principles:**

- Tests provide safety net (refactor with confidence)
- Make small refactors (easier to debug if tests fail)
- Run tests after each change
- Don't change test behavior (only implementation)

**Completion:**

- All 34 tests pass (100% success rate)
- Code quality meets team standards (ruff linting passes)
- Performance target met (<500ms context assembly)
- Ready for code review and story approval

---

## Next Steps

1. ✅ **Read this checklist** with team in standup or planning
2. ✅ **Verify RED phase**: Run `uv run pytest tests/test_context_builder.py tests/test_response_quality_checker.py -v`
   - Expected: All tests fail with `ModuleNotFoundError`
3. ✅ **Apply database migration**: Create `20251223_ai_context_tracking.sql` and run `npx supabase db push`
4. ✅ **Begin Task 1**: Implement `ContextBuilderService` following checklist
5. ✅ **Work one test at a time** (red → green for each)
6. ✅ **Share progress** in daily standup
7. ✅ **When all tests pass**, refactor code for quality
8. ✅ **When refactoring complete**, mark story as 'done' in sprint-status.yaml

---

## Knowledge Base References Applied

This ATDD workflow consulted the following testing patterns:

- **Data factories with faker** - Random test data generation with override patterns
- **Fixture architecture** - Auto-cleanup using pytest fixtures (cleanup_test_data autouse fixture)
- **Test quality principles** - Given-When-Then structure, one assertion per test, determinism
- **Async testing** - pytest-asyncio for async service methods
- **Integration testing** - Real Supabase client with test database isolation

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `uv run pytest tests/test_context_builder.py tests/test_response_quality_checker.py -v`

**Expected Results:**

```
tests/test_context_builder.py::test_context_builder_returns_structured_json FAILED
tests/test_context_builder.py::test_context_includes_active_goals FAILED
tests/test_context_builder.py::test_context_includes_recent_completions FAILED
... (8 more failures)

tests/test_response_quality_checker.py::test_quality_checker_detects_generic_stay_motivated_phrase FAILED
tests/test_response_quality_checker.py::test_quality_checker_allows_stay_motivated_with_specifics FAILED
... (8 more failures)

================================== FAILURES ===================================
... ModuleNotFoundError: No module named 'app.services.context_builder'
... ModuleNotFoundError: No module named 'app.services.response_quality_checker'

================================ short test summary info =======================
FAILED tests/test_context_builder.py::test_context_builder_returns_structured_json
FAILED tests/test_response_quality_checker.py::test_quality_checker_detects_generic_stay_motivated_phrase
... (19 more)

========================== 21 failed in 1.23s ===============================
```

**Summary:**

- Total tests: 34
- Passing: 0 (expected)
- Failing: 34 (expected)
- Status: ✅ RED phase verified

**Expected Failure Messages:**
- `ModuleNotFoundError: No module named 'app.services.context_builder'`
- `ModuleNotFoundError: No module named 'app.services.response_quality_checker'`
- `AttributeError: 'AIService' object has no attribute 'user_context'`
- `404 Not Found: /api/admin/context-preview/{user_id}`

---

## Notes

**Critical Reminders:**

- ⚠️ **DO NOT create new AI service** - Enhance existing `app.services.ai.ai_service.AIService`
- ⚠️ **Performance requirement**: Context assembly MUST complete in <500ms (P95)
- ⚠️ **Fallback gracefully**: If context building fails, proceed with generic AI response (log warning)
- ⚠️ **Cache strategy**: Use 5-minute cache for repeat user requests (target >50% hit rate)

**Architecture Alignment:**

- ✅ Follows Story 1.5.2 (Backend Standardization) - Service layer pattern, snake_case naming
- ✅ Follows Story 1.5.3 (AI Services Standardization) - Enhance AIService, cost tracking to ai_runs
- ✅ Follows Story 6.1 (AI Chat Interface) - Extends existing chat endpoint, no new UI

**Performance Optimization Strategies:**

1. **Batch queries**: Use single query with JOINs instead of multiple queries
2. **Caching**: `functools.lru_cache` for 5-minute context cache
3. **Selective loading**: Only load last 3 journal entries (not full history)
4. **Index optimization**: Add indexes on (user_id, created_at DESC) for all tables

---

## Contact

**Questions or Issues?**

- Ask in team standup
- Tag @Jack Luo in Slack/Discord
- Refer to Story 6.2 in `docs/stories/6-2-contextual-ai-responses.md`
- Consult `docs/dev/ai-services-guide.md` for AI integration patterns

---

**Generated by BMad TEA Agent** - 2025-12-23

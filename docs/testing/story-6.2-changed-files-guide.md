# Story 6.2: Changed Files & What to Look For

**Purpose:** Guide to understanding what files changed for Story 6.2 and what to verify in each file.

---

## Summary of Changes

Story 6.2 adds **contextual AI responses** that reference user's actual data. The implementation includes:
- Context Builder Service (assembles user data snapshot)
- AI Service enhancement (injects context into prompts)
- Response Quality Checker (detects generic responses)
- Admin preview endpoint (debugging tool)
- Database schema updates (tracking columns + indexes)
- Personality switching API (Dream Self ↔ Weave AI)

---

## Files Changed

### 🆕 New Files Created

#### 1. `weave-api/app/services/context_builder.py`
**Purpose:** Core service that assembles user context snapshot

**What to Look For:**
- ✅ `build_context(user_id)` method assembles context in <500ms
- ✅ Fetches active goals (max 3, newest first)
- ✅ Fetches recent completions (last 7 days)
- ✅ Fetches journal entries (last 3)
- ✅ Fetches Dream Self identity document
- ✅ Calculates metrics (streaks, completion rates)
- ✅ Returns structured JSON (not raw DB rows)
- ✅ Handles errors gracefully (returns None on failure, not crash)
- ✅ Logs performance timing

**Key Methods:**
- `build_context()` - Main entry point
- `_fetch_goals()` - Gets active goals
- `_fetch_recent_activity()` - Gets completions
- `_fetch_journal_entries()` - Gets journal
- `_fetch_identity()` - Gets Dream Self personality
- `_calculate_metrics()` - Calculates streaks/rates
- `_extract_recent_wins()` - Extracts win messages

**Testing Checklist:**
- [ ] Context structure matches expected format
- [ ] Performance <500ms
- [ ] Handles empty data gracefully (new users)
- [ ] Error handling doesn't crash

---

#### 2. `weave-api/app/services/response_quality_checker.py`
**Purpose:** Detects generic AI responses and triggers retry

**What to Look For:**
- ✅ `check_response()` returns 'generic', 'specific', or 'excellent'
- ✅ Detects generic phrases (stay motivated, keep going, etc.)
- ✅ Checks if response mentions user data (goal names, streaks)
- ✅ `build_retry_prompt()` creates stronger prompt for retry
- ✅ Regex patterns for detecting generic phrases

**Key Methods:**
- `check_response()` - Main quality check
- `is_generic_response()` - Detects generic responses
- `is_excellent_response()` - Detects excellent responses (2+ data references)
- `mentions_user_data()` - Checks for specific data mentions
- `build_retry_prompt()` - Builds retry prompt

**Testing Checklist:**
- [ ] Detects generic responses correctly
- [ ] Allows generic phrases IF followed by specific data
- [ ] Identifies excellent responses (multiple data references)
- [ ] Retry prompt includes strong instructions

---

#### 3. `supabase/migrations/20251223000001_story_6_2_context_tracking.sql`
**Purpose:** Database schema changes for context tracking

**What to Look For:**
- ✅ Adds `context_used` column to `ai_runs` table
- ✅ Adds `context_assembly_time_ms` column to `ai_runs` table
- ✅ Adds `quality_flag` column to `ai_runs` table (CHECK constraint)
- ✅ Adds `active_personality` column to `user_profiles` table
- ✅ Creates performance indexes:
  - `idx_subtask_completions_user_recent` (for completions query)
  - `idx_journal_entries_user_recent` (for journal query)
  - `idx_goals_user_status_recent` (for goals query)
  - `idx_identity_docs_user_type` (for identity query)
- ✅ Column comments/documentation

**Testing Checklist:**
- [ ] Migration runs without errors
- [ ] All columns exist after migration
- [ ] Indexes created successfully
- [ ] CHECK constraints enforce valid values

**Verify Migration:**
```sql
-- Check columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ai_runs' 
AND column_name IN ('context_used', 'context_assembly_time_ms', 'quality_flag');

-- Check indexes exist
SELECT indexname FROM pg_indexes 
WHERE indexname LIKE '%user_recent%' OR indexname LIKE '%user_type%';
```

---

### 📝 Modified Files

#### 4. `weave-api/app/services/ai/ai_service.py`
**Purpose:** Enhanced to accept and use user context

**What Changed:**
- ✅ Added `user_context: Optional[Dict]` parameter to `generate()` method
- ✅ Added `_enrich_prompt_with_context()` method (injects context into prompt)
- ✅ Integrated `ResponseQualityChecker` for generic detection
- ✅ Retry logic: If generic response detected, retry once with stronger prompt
- ✅ Logs `quality_flag` to `ai_runs` table
- ✅ Logs `context_used` flag to `ai_runs` table

**Key Changes to Look For:**

**Line ~117:** Added `user_context` parameter
```python
def generate(
    self,
    user_id: str,
    ...
    user_context: Optional[Dict] = None,  # NEW PARAMETER
    **kwargs
) -> AIResponse:
```

**Line ~150:** Context enrichment
```python
context_used = user_context is not None
enriched_prompt = self._enrich_prompt_with_context(prompt, user_context, module)
```

**Lines ~188-223:** Quality checking + retry logic
```python
quality_flag = 'specific'  # Default
if user_context:
    quality_flag = self.quality_checker.check_response(response.content, user_context)
    
    if quality_flag == 'generic':
        # Retry with stronger prompt (max 1 attempt)
        retry_prompt = self.quality_checker.build_retry_prompt(...)
        retry_response = provider.complete(...)
        # Check retry quality, use if better
```

**Lines ~686-760:** `_enrich_prompt_with_context()` method
- Builds system prompt with Dream Self personality
- Injects user context (goals, activity, metrics, wins)
- Adds instructions to reference specific data

**Testing Checklist:**
- [ ] `user_context` parameter is optional (backward compatible)
- [ ] Context is injected into prompt correctly
- [ ] Generic detection triggers retry
- [ ] Quality flag logged to database
- [ ] Fallback works if context is None

---

#### 5. `weave-api/app/api/ai_router.py`
**Purpose:** AI generation endpoint enhanced with context support

**What Changed:**
- ✅ Added `include_context: bool` field to `AIGenerateRequest` model (default: True)
- ✅ Added `context_used: bool` and `context_assembly_time_ms: Optional[int]` to `AIGenerateResponse` model
- ✅ Builds context before calling AI service (if `include_context=True`)
- ✅ Passes context to `AIService.generate()`
- ✅ Returns context usage flags in response

**Key Changes to Look For:**

**Line ~54:** Request model updated
```python
class AIGenerateRequest(BaseModel):
    ...
    include_context: bool = Field(True, description="Include user context...")
```

**Lines ~67-68:** Response model updated
```python
class AIGenerateResponse(BaseModel):
    ...
    context_used: bool = Field(False, description="Whether user context was injected")
    context_assembly_time_ms: Optional[int] = Field(None, description="Time to assemble context")
```

**Lines ~132-144:** Context building in endpoint
```python
if request.include_context:
    db = get_supabase_client()
    context_builder = ContextBuilderService(db)
    user_context = await context_builder.build_context(user_id)
    context_assembly_time_ms = int((time.time() - start_time) * 1000)
```

**Lines ~153, 169-170:** Context passed to AI service and returned
```python
response = ai_service.generate(
    ...
    user_context=user_context,  # Pass context
    ...
)

return AIGenerateResponse(
    ...
    context_used=user_context is not None,
    context_assembly_time_ms=context_assembly_time_ms,
)
```

**Testing Checklist:**
- [ ] `include_context` parameter works (can disable context)
- [ ] Context building happens before AI call
- [ ] Performance timing is accurate
- [ ] Response includes context flags
- [ ] Graceful fallback if context building fails

---

#### 6. `weave-api/app/api/admin.py`
**Purpose:** Admin endpoint for context preview (debugging tool)

**What Changed:**
- ✅ Added `GET /api/admin/context-preview/{user_id}` endpoint
- ✅ Requires `X-Admin-Key` header (admin authentication)
- ✅ Builds context using `ContextBuilderService`
- ✅ Returns full context JSON + assembly time

**Key Changes to Look For:**

**Lines ~86-154:** New endpoint
```python
@router.get("/context-preview/{user_id}")
async def preview_user_context(
    user_id: str,
    x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key"),
    ...
):
    # Verify admin key
    # Build context
    # Return context + assembly time
```

**Testing Checklist:**
- [ ] Admin key authentication works
- [ ] Returns full context structure
- [ ] Includes assembly time
- [ ] Handles invalid user_id gracefully
- [ ] Returns 401 without admin key

---

#### 7. `weave-api/app/api/user.py`
**Purpose:** Personality switching endpoint

**What Changed:**
- ✅ Added `PATCH /api/user/personality` endpoint
- ✅ Allows switching between 'dream_self' and 'weave_ai' personalities
- ✅ Updates `user_profiles.active_personality` column

**Key Changes to Look For:**

**Lines ~350-355:** Request model
```python
class PersonalitySwitchRequest(BaseModel):
    active_personality: str = Field(
        ...,
        pattern="^(dream_self|weave_ai)$"
    )
```

**Lines ~358-465:** Endpoint implementation
```python
@router.patch("/personality")
async def switch_personality(
    request: PersonalitySwitchRequest,
    ...
):
    # Update user_profiles.active_personality
    # Return personality details
```

**Testing Checklist:**
- [ ] Validates personality type (dream_self or weave_ai)
- [ ] Updates database correctly
- [ ] Returns personality details
- [ ] Handles invalid types (400 error)
- [ ] Requires authentication

---

### 🧪 Test Files Created

#### 8. `weave-api/tests/test_context_builder.py`
**Purpose:** Unit tests for ContextBuilderService

**What to Look For:**
- ✅ Tests context structure (all required fields)
- ✅ Tests performance (<500ms)
- ✅ Tests error handling (timeout, partial failure)
- ✅ Tests empty data scenarios (new users)
- ✅ Tests Dream Self fallback

**Key Test Cases:**
- `test_context_builder_returns_structured_json`
- `test_context_includes_active_goals`
- `test_context_assembly_performance_under_500ms`
- `test_context_builder_handles_no_dream_self_doc`

---

#### 9. `weave-api/tests/test_response_quality_checker.py`
**Purpose:** Unit tests for ResponseQualityChecker

**What to Look For:**
- ✅ Tests generic phrase detection
- ✅ Tests user data mention detection
- ✅ Tests excellent response detection (2+ references)
- ✅ Tests retry prompt building

**Key Test Cases:**
- `test_quality_checker_detects_generic_stay_motivated_phrase`
- `test_quality_checker_allows_stay_motivated_with_specifics`
- `test_quality_checker_detects_goal_name_mention`
- `test_quality_checker_detects_excellent_response`

---

#### 10. `weave-api/tests/test_ai_chat_context_api.py`
**Purpose:** API integration tests for context features

**What to Look For:**
- ✅ Tests context_used flag in response
- ✅ Tests context_assembly_time_ms in response
- ✅ Tests include_context parameter (can disable)
- ✅ Tests fallback when context building fails
- ✅ Tests admin context preview endpoint

**Key Test Cases:**
- `test_chat_message_includes_context_used_flag`
- `test_chat_message_with_context_disabled`
- `test_chat_message_returns_context_assembly_time`
- `test_admin_context_preview_endpoint_success`

---

#### 11. `weave-api/tests/test_context_integration.py`
**Purpose:** End-to-end integration tests

**What to Look For:**
- ✅ Tests full flow: context building → AI generation → response quality
- ✅ Tests with real user data (goals, completions, journal)
- ✅ Tests AI responses mention specific data
- ✅ Tests retry logic triggers correctly

---

#### 12. `weave-api/tests/test_story_6_2_integration.py`
**Purpose:** Comprehensive Story 6.2 integration tests

**What to Look For:**
- ✅ Tests personality switching
- ✅ Tests context building with different user states
- ✅ Tests AI tool use (if implemented)
- ✅ Tests dual personality system

---

## What to Verify During Testing

### 1. Context Building Performance
**Check:** `context_assembly_time_ms` in responses
- ✅ Should be <500ms (target)
- ✅ Check database indexes are created
- ✅ Monitor for slow queries

### 2. Context Structure
**Check:** Admin preview endpoint response
- ✅ All required fields present (goals, activity, journal, identity, metrics)
- ✅ Data is structured (not raw DB rows)
- ✅ Handles empty data gracefully

### 3. AI Response Quality
**Check:** AI responses mention user data
- ✅ Mentions specific goal names
- ✅ References actual streaks/numbers
- ✅ Acknowledges recent completions
- ✅ NOT generic ("stay motivated" without specifics)

### 4. Generic Detection
**Check:** Backend logs and `ai_runs.quality_flag`
- ✅ Generic responses trigger retry
- ✅ Quality flag logged correctly
- ✅ Retry improves response quality

### 5. Database Tracking
**Check:** `ai_runs` table columns
- ✅ `context_used` populated correctly
- ✅ `context_assembly_time_ms` logged
- ✅ `quality_flag` set ('generic', 'specific', 'excellent')

### 6. Personality Switching
**Check:** `user_profiles.active_personality`
- ✅ Can switch between dream_self and weave_ai
- ✅ Preference persists
- ✅ AI uses correct personality voice

### 7. Error Handling
**Check:** Graceful fallbacks
- ✅ Context building failure → proceed without context
- ✅ Invalid user_id → clear error message
- ✅ Missing Dream Self doc → default persona used

---

## Quick Verification Commands

### Check Context Structure
```bash
curl -H "X-Admin-Key: dev_admin_key" \
     http://localhost:8000/api/admin/context-preview/{user_id}
```

### Check AI Response with Context
```bash
curl -X POST http://localhost:8000/api/ai/generate \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer {token}" \
     -d '{
       "prompt": "How am I doing?",
       "module": "chat",
       "include_context": true
     }'
```

### Check Database Columns
```sql
SELECT context_used, context_assembly_time_ms, quality_flag
FROM ai_runs
WHERE user_id = '{user_id}'
ORDER BY created_at DESC
LIMIT 5;
```

### Check Performance Indexes
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('subtask_completions', 'journal_entries', 'goals', 'identity_docs')
AND indexname LIKE '%user_recent%' OR indexname LIKE '%user_type%';
```

---

## Common Issues to Watch For

### ❌ Performance Issues
- **Symptom:** `context_assembly_time_ms` > 500ms
- **Check:** Database indexes created? N+1 queries?
- **Fix:** Verify migration ran, check query plans

### ❌ Generic Responses
- **Symptom:** AI says "stay motivated" without specifics
- **Check:** Context building succeeds? Context injected into prompt?
- **Fix:** Verify context preview endpoint, check AI service logs

### ❌ Missing Context Data
- **Symptom:** Context preview shows empty arrays
- **Check:** User has goals/completions/journal entries?
- **Fix:** Create test data, verify queries work

### ❌ Database Errors
- **Symptom:** Migration fails or columns missing
- **Check:** Migration file syntax, database permissions
- **Fix:** Run migration manually, verify columns exist

---

## Summary

**Core Files Changed:**
1. ✅ `context_builder.py` - NEW: Assembles user context
2. ✅ `response_quality_checker.py` - NEW: Detects generic responses
3. ✅ `ai_service.py` - MODIFIED: Accepts context, enriches prompts
4. ✅ `ai_router.py` - MODIFIED: Builds context, returns flags
5. ✅ `admin.py` - MODIFIED: Adds context preview endpoint
6. ✅ `user.py` - MODIFIED: Adds personality switching
7. ✅ Migration SQL - NEW: Adds columns + indexes

**Key Features:**
- Context assembly (<500ms target)
- Generic response detection + retry
- Dream Self personality injection
- Performance tracking (database logging)
- Admin debugging tools

**Testing Focus:**
- Performance (<500ms)
- Response quality (mentions specific data)
- Error handling (graceful fallbacks)
- Database tracking (columns populated)


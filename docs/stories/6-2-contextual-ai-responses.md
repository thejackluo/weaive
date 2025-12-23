# Story 6.2: Contextual AI Responses (Tech Context Engine)

Status: ready-for-dev

## Story

As a user,
I want to receive AI advice that references my actual data (goals, completions, journal entries, identity),
so that guidance feels personal, not generic, and helps me act on my specific situation.

## Acceptance Criteria

### Backend (Core Context Engine)

1. **Context Builder Service**
   - [ ] Verify no existing ContextBuilderService (check `weave-api/app/services/` for *context*)
   - [ ] Create `ContextBuilderService` in `weave-api/app/services/context_builder.py`
   - [ ] Assemble canonical user context snapshot including:
     - Current active goals (title, binds, progress)
     - Recent completions (last 7 days) with proof types
     - Journal entries (last 3 entries) with fulfillment scores
     - Identity document (archetype, dream self, motivations)
     - Consistency metrics (current streak, completion rate)
     - Recent wins and patterns
   - [ ] Return structured JSON context (NOT raw database dumps)
   - [ ] Context format: `{goals: [...], recent_activity: {...}, identity: {...}, metrics: {...}}`
   - [ ] Performance: <500ms to assemble full context (optimize queries)
   - [ ] Performance monitoring:
     - Log slow context builds (>500ms) to `ai_runs` with `context_assembly_time_ms`
     - Alert if P95 exceeds 500ms (indicates missing indexes or N+1 queries)
     - Track cache hit rate (target >50% for repeat users within 5 minutes)

2. **AI Service Integration (Context Injection)**
   - [ ] Update `AIService` in `weave-api/app/services/ai/ai_service.py` to accept `user_context` parameter
   - [ ] Before calling AI provider, inject user context into system prompt:
     - System prompt template: "You are {dream_self_name}, the user's ideal self. Reference their actual data when giving advice."
     - Context injection: Append structured context to prompt (JSON format for AI parsing)
   - [ ] **DO NOT create new AI service** - enhance existing `AIService.generate()` method
   - [ ] Fallback: If context building fails (timeout/error), proceed with generic AI response + log warning
   - [ ] Error scenario handling:
     - **Timeout (>500ms):** Log warning, return None, proceed without context
     - **Partial failure:** Return partial context (e.g., goals loaded but journal query failed), log which queries failed
     - **Empty context:** Return empty JSON structure (don't skip context injection - AI should know user has no data yet)
     - **DB connection error:** Retry once, then return None and proceed without context

3. **Dream Self Personality Voice**
   - [ ] Load personality document from `identity_docs` table (type = 'dream_self')
   - [ ] Extract voice characteristics: tone, speaking style, key phrases
   - [ ] Inject personality into system prompt: "Speak as {dream_self_name}: {personality_traits}"
   - [ ] If no Dream Self document exists yet, use default coach persona

4. **Evidence-Based Response Validation**
   - [ ] After AI generates response, verify it references user's actual data
   - [ ] Check for generic phrases: "stay motivated", "keep going", "you can do it" (without specifics)
   - [ ] If response is too generic:
     - Regenerate with stronger prompt: "You MUST reference specific data from context"
     - Max 1 retry attempt
     - If still generic, return anyway (better than blocking user)
   - [ ] Log generic responses to `ai_runs` table with `quality_flag = 'generic'`

### API Endpoints

5. **Update Chat Endpoint**
   - [ ] Update `POST /api/ai-chat/messages` to build context before calling AI
   - [ ] Request: `{ message: string, conversation_id?: uuid, include_context: bool (default true) }`
   - [ ] Response (follows Story 6.1 format with added context fields):
   ```json
   {
     "data": {
       "message_id": "uuid",
       "response": "Based on your 10-day streak on 'Morning workout'...",
       "conversation_id": "uuid",
       "context_used": true,
       "tokens_used": 450
     },
     "meta": {
       "timestamp": "2025-12-23T10:00:00Z",
       "context_assembly_time_ms": 287
     }
   }
   ```
   - [ ] Add optional `include_context=false` for testing/debugging (skip context building)

6. **Context Preview Endpoint (Admin/Testing)**
   - [ ] `GET /api/admin/context-preview/{user_id}` - Preview assembled context
   - [ ] Response format:
   ```json
   {
     "data": {
       "context": {
         "user_id": "uuid",
         "goals": [...],
         "recent_activity": {...},
         "journal": [...],
         "identity": {...},
         "metrics": {...}
       },
       "assembly_time_ms": 287
     },
     "meta": {
       "timestamp": "2025-12-23T10:00:00Z"
     }
   }
   ```
   - [ ] Requires `X-Admin-Key` header (admin only)
   - [ ] Useful for debugging context quality

### Database Schema

7. **Track Context Usage**
```sql
-- Add columns to ai_runs table
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
   - [ ] Verify `ai_runs` table RLS policies (if any) cover new columns
   - [ ] Note: `ai_runs` is admin-accessible (not user-facing), no additional RLS needed

### Testing

8. **Backend Tests**
   - [ ] Test: `ContextBuilderService.build_context()` returns structured JSON
   - [ ] Test: Context includes active goals, recent completions, journal entries
   - [ ] Test: Context assembly completes in <500ms
   - [ ] Test: AI response references user's goal names (not generic advice)
   - [ ] Test: Generic response detection triggers retry
   - [ ] Test: Fallback works if context building fails (proceed without context)
   - [ ] Test: Dream Self personality injected into system prompt
   - [ ] Test: Admin preview endpoint returns context snapshot

9. **Integration Tests**
   - [ ] Test: User with 2 active goals + 5 completions → AI response mentions specific goal/bind
   - [ ] Test: User with low fulfillment score → AI response acknowledges recent struggle
   - [ ] Test: User on 10-day streak → AI response celebrates momentum
   - [ ] Test: User with no Dream Self doc → Default coach persona used

## Tasks / Subtasks

- [ ] Task 1: Context Builder Service (AC: #1)
  - [ ] 1.1: Create `ContextBuilderService` class with `build_context(user_id)` method
  - [ ] 1.2: Query active goals (max 3, sorted by created_at DESC)
  - [ ] 1.3: Query recent completions (last 7 days, with proof types)
  - [ ] 1.4: Query recent journal entries (last 3, with fulfillment scores)
  - [ ] 1.5: Query identity document (dream_self personality)
  - [ ] 1.6: Calculate consistency metrics (current streak, completion rate)
  - [ ] 1.7: Format as structured JSON (not raw DB rows)
  - [ ] 1.8: Optimize queries (use JOINs, avoid N+1 queries, add indexes if needed)
  - [ ] 1.9: Add performance monitoring (log assembly time to `ai_runs`)

- [ ] Task 2: AI Service Context Injection (AC: #2)
  - [ ] 2.1: Update `AIService.generate()` to accept optional `user_context: dict` parameter
  - [ ] 2.2: Create system prompt template with context injection
  - [ ] 2.3: Append JSON context to prompt (use structured format for AI parsing)
  - [ ] 2.4: Add fallback: If context missing/None, proceed without it (log warning)
  - [ ] 2.5: Update existing AI calls to pass user_context (chat, Triad, journal feedback)

- [ ] Task 3: Dream Self Personality Integration (AC: #3)
  - [ ] 3.1: Load Dream Self document from `identity_docs` table
  - [ ] 3.2: Parse personality traits (tone, speaking style, key phrases)
  - [ ] 3.3: Inject into system prompt: "Speak as {dream_self_name}: {personality}"
  - [ ] 3.4: Fallback: If no Dream Self doc, use default coach persona ("supportive guide")

- [ ] Task 4: Generic Response Detection & Retry (AC: #4)
  - [ ] 4.1: Create `ResponseQualityChecker` helper class
  - [ ] 4.2: Check for generic phrases: regex patterns for "stay motivated", "keep going", etc.
  - [ ] 4.3: Check if response mentions user's goal/bind names (from context)
  - [ ] 4.4: If too generic: Regenerate with stronger prompt (max 1 retry)
  - [ ] 4.5: Log quality flag to `ai_runs` table ('generic', 'specific', 'excellent')

- [ ] Task 5: Update Chat API Endpoint (AC: #5)
  - [ ] 5.1: Modify `POST /api/ai-chat/messages` handler
  - [ ] 5.2: Before calling AIService, build user context via `ContextBuilderService`
  - [ ] 5.3: Pass context to `AIService.generate(user_context=context)`
  - [ ] 5.4: Return `context_used: true` in response
  - [ ] 5.5: Add optional `include_context=false` param for testing

- [ ] Task 6: Admin Context Preview Endpoint (AC: #6)
  - [ ] 6.1: Create `GET /api/admin/context-preview/{user_id}` endpoint
  - [ ] 6.2: Require `X-Admin-Key` header (admin middleware)
  - [ ] 6.3: Build context via `ContextBuilderService`
  - [ ] 6.4: Return context JSON + assembly time for debugging

- [ ] Task 7: Database Schema Updates (AC: #7)
  - [ ] 7.1: Create migration: Add `context_used`, `context_assembly_time_ms`, `quality_flag` to `ai_runs`
  - [ ] 7.2: Apply migration via `npx supabase db push`

- [ ] Task 8: Backend Unit Tests (AC: #8)
  - [ ] 8.1: Test `ContextBuilderService.build_context()` returns valid JSON
  - [ ] 8.2: Test context includes goals, completions, journal, identity
  - [ ] 8.3: Test performance (<500ms assembly time)
  - [ ] 8.4: Test generic response detection (regex patterns)
  - [ ] 8.5: Test retry logic (max 1 attempt)
  - [ ] 8.6: Test fallback (context building fails → proceed without context)

- [ ] Task 9: Integration Tests (AC: #9)
  - [ ] 9.1: Create test user with 2 goals + 5 completions
  - [ ] 9.2: Send AI chat message → Verify response mentions goal names
  - [ ] 9.3: Create test user with low fulfillment score
  - [ ] 9.4: Send AI chat message → Verify response acknowledges struggle
  - [ ] 9.5: Create test user with 10-day streak
  - [ ] 9.6: Send AI chat message → Verify response celebrates momentum

## Dev Notes

### Architecture Patterns

**Story 1.5.3 Compliance (AI Services Standardization):**
- ⚠️ **CRITICAL:** Enhance existing `AIService` - DO NOT create new AI service
- Add `user_context` parameter to `AIService.generate()` method
- Context injection happens BEFORE calling AI provider (in system prompt)
- Fallback chain unchanged: Sonnet → Haiku → Mini → Deterministic
- Cost tracking: Log `context_used=true` to `ai_runs` table

**Story 6.1 Foundation:**
- Chat infrastructure already built (conversation threads, message storage, rate limiting)
- This story ONLY adds context enrichment (no new chat UI)
- Context Builder is middleware between chat API and AIService

**Story 1.5.2 Compliance (Backend Standardization):**
- Service naming: `ContextBuilderService` (PascalCase class, snake_case file)
- Database: Add columns to existing `ai_runs` table (soft schema changes)
- Testing: Pytest fixtures in `tests/test_context_builder.py`

### Project Structure Notes

**New Files to Create:**

Backend:
- `weave-api/app/services/context_builder.py` (ContextBuilderService class)
- `weave-api/app/services/response_quality_checker.py` (Generic response detection)
- `weave-api/app/tests/test_context_builder.py` (Pytest tests)
- `weave-api/app/tests/test_context_integration.py` (Integration tests)

Database:
- `supabase/migrations/YYYYMMDDHHMMSS_ai_context_tracking.sql`

**Existing Files to Modify:**
- `weave-api/app/services/ai/ai_service.py` - Add `user_context` parameter to `generate()` method
  - Import pattern: `from app.services.context_builder import ContextBuilderService`
- `weave-api/app/api/ai_chat_router.py` - Build context before calling AIService
  - Import pattern: `from app.services.context_builder import ContextBuilderService`
  - Import pattern: `from app.services.ai.ai_service import AIService`
- `weave-api/app/api/triad_router.py` (if exists) - Add context to Triad generation
- `weave-api/app/api/journal_router.py` (if exists) - Add context to journal feedback

**DO NOT Create:**
- ❌ New AI service (use existing `AIService`)
- ❌ New database tables (use existing `ai_runs`)
- ❌ Frontend changes (Story 6.1 already built chat UI)

### Context Builder Design

**Context Structure (JSON):**
```json
{
  "user_id": "uuid",
  "assembled_at": "2025-12-23T10:00:00Z",
  "goals": [
    {
      "id": "uuid",
      "title": "Build consistent workout habit",
      "active_binds": 3,
      "completion_rate": 0.85,
      "current_streak": 7
    }
  ],
  "recent_activity": {
    "completions_last_7_days": 12,
    "proof_types": ["image", "voice", "note"],
    "most_recent_completion": {
      "bind_title": "Morning workout",
      "completed_at": "2025-12-22T08:00:00Z",
      "proof_type": "image"
    }
  },
  "journal": [
    {
      "date": "2025-12-22",
      "fulfillment_score": 8,
      "entry_preview": "Great day! Completed all morning binds...",
      "ai_feedback_received": true
    }
  ],
  "identity": {
    "dream_self_name": "Alex the Disciplined",
    "archetype": "Builder",
    "personality_traits": ["supportive", "analytical", "growth-focused"],
    "speaking_style": "Direct but encouraging, uses data to motivate"
  },
  "metrics": {
    "current_streak": 10,
    "longest_streak": 15,
    "overall_completion_rate": 0.78,
    "goals_completed": 2,
    "days_active": 30
  },
  "recent_wins": [
    "10-day streak achieved",
    "First goal completed: 'Morning routine'",
    "85% consistency on workout bind"
  ]
}
```

**Performance Optimization:**
- Use single query with JOINs (avoid N+1 queries)
- Cache context for 5 minutes using cache key strategy:
  - Cache key format: `context:{user_id}:{last_activity_timestamp}`
  - Invalidate cache on: New completion, new goal created, journal entry added
  - Implementation: Use `functools.lru_cache` for single-server deployments (in-memory)
  - Target cache hit rate: >50% for repeat users within 5 minutes
- Add database indexes:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_subtask_completions_user_recent
    ON subtask_completions(user_id, completed_at DESC);

  CREATE INDEX IF NOT EXISTS idx_journal_entries_user_recent
    ON journal_entries(user_id, local_date DESC);
  ```

### System Prompt Template

**Context-Enriched Prompt:**
```
You are {dream_self_name}, the user's ideal self as defined in their identity document.

Your personality: {personality_traits}
Your speaking style: {speaking_style}

User's Current Situation:
{json_context}

Instructions:
1. Reference specific data from the context above (goal names, bind titles, completion dates).
2. Avoid generic advice like "stay motivated" or "keep going" without specific examples.
3. If the user asks about progress, cite their actual completion rate and streak.
4. If they mention struggling, acknowledge specific recent patterns (e.g., "I see you haven't completed your evening bind in 3 days").
5. Celebrate wins: If they have a streak, mention it. If they completed a tough bind, acknowledge it.

Now respond to the user's message: "{user_message}"
```

**Generic Response Detection (Regex Patterns):**
```python
GENERIC_PHRASES = [
    r"stay motivated",
    r"keep going",
    r"you can do it",
    r"don't give up",
    r"believe in yourself",
    r"one day at a time",
    r"take it slow",
    r"be patient",
    r"trust the process",
    r"stay consistent",  # OK if followed by specific examples
]

def is_generic_response(response: str, user_context: dict) -> bool:
    """Check if response is too generic (doesn't reference user's data)."""
    # Check for generic phrases
    for pattern in GENERIC_PHRASES:
        if re.search(pattern, response, re.IGNORECASE):
            # Check if it's followed by specific data
            if not mentions_user_data(response, user_context):
                return True
    return False

def mentions_user_data(response: str, user_context: dict) -> bool:
    """Check if response mentions specific user data (goal names, bind titles, dates)."""
    goal_names = [g['title'].lower() for g in user_context.get('goals', [])]
    for goal_name in goal_names:
        if goal_name in response.lower():
            return True

    # Check for streak mentions
    if 'streak' in response.lower():
        return True

    # Check for specific dates/numbers
    if re.search(r'\d+\s+(day|week|completion|bind)', response, re.IGNORECASE):
        return True

    return False
```

### Alignment with Unified Project Structure

**Follows:**
- AIProviderBase pattern (existing AIService already uses this)
- Cost tracking (log context usage to `ai_runs` table)
- Rate limiting (no changes - Story 6.1 already handles this)
- Database naming (`snake_case` columns)
- Service layer pattern (ContextBuilderService)

**No Conflicts Detected**

### AI Service Integration (Detailed)

**⚠️ CRITICAL: Enhance existing AIService - DO NOT duplicate!**

**Location:** `weave-api/app/services/ai/ai_service.py`

**Modification:**
```python
# Before (Story 6.1)
async def generate(
    self,
    user_id: UUID,
    user_role: str,
    user_tier: str,
    module: str,
    prompt: str,
    model: str,
    max_tokens: int = 500
) -> dict:
    """Generate AI response with fallback chain."""
    # ... existing logic ...

# After (Story 6.2) - Add user_context parameter
async def generate(
    self,
    user_id: UUID,
    user_role: str,
    user_tier: str,
    module: str,
    prompt: str,
    model: str,
    max_tokens: int = 500,
    user_context: Optional[dict] = None  # NEW PARAMETER
) -> dict:
    """Generate AI response with optional user context."""
    # Build system prompt
    system_prompt = self._build_system_prompt(user_context)

    # Inject context into user prompt if provided
    if user_context:
        enriched_prompt = self._inject_context(prompt, user_context)
    else:
        enriched_prompt = prompt

    # ... existing fallback logic ...
    # Log context_used=True if user_context provided
```

**Usage in Chat API:**
```python
# weave-api/app/api/ai_chat_router.py
@router.post("/messages")
async def send_message(request: ChatMessageCreate, user: User = Depends(get_current_user)):
    # Build user context
    context_builder = ContextBuilderService()
    user_context = await context_builder.build_context(user.id)

    # Call AIService with context
    ai_service = AIService()
    response = await ai_service.generate(
        user_id=user.id,
        user_role=user.role,
        user_tier=user.subscription_tier,
        module='ai_chat_contextual',
        prompt=request.message,
        model='claude-3-7-sonnet-20250219',  # Strong model for quality
        max_tokens=500,
        user_context=user_context  # NEW PARAMETER
    )

    return {"data": {"response": response['text'], "context_used": True}}
```

### References

- [Source: docs/prd/epic-6-ai-coaching.md#US-6.2] - Epic 6.2 requirements
- [Source: docs/stories/6-1-ai-chat-interface.md] - Story 6.1 foundation (chat infrastructure)
- [Source: docs/architecture/core-architectural-decisions.md:719-853] - AI Service Architecture
- [Source: docs/architecture/implementation-patterns-consistency-rules.md:165-217] - Development Infrastructure Standards
- [Source: weave-api/app/services/ai/ai_service.py] - Existing AI service to enhance (DO NOT duplicate)
- [Source: docs/dev/ai-services-guide.md] - AI integration patterns (created by Story 1.5.3)

### Context Builder Performance Requirements

**Target Performance:**
- Context assembly: <500ms (P95)
- Database queries: <200ms total
- JSON serialization: <50ms

**Optimization Strategies:**
1. **Batch Queries:** Use single query with JOINs instead of multiple queries
2. **Caching:** Cache assembled context for 5 minutes (same user, repeated calls)
3. **Selective Loading:** Only load last 3 journal entries (not full history)
4. **Index Optimization:** Add indexes on (user_id, created_at DESC) for all tables

**Monitoring:**
- Log `context_assembly_time_ms` to `ai_runs` table
- Alert if P95 exceeds 500ms (indicates performance degradation)
- Track cache hit rate (should be >50% for repeat users)

### Previous Story Intelligence

**Story 6.1 (AI Chat Interface):**
- Built complete chat infrastructure (conversation threads, messages, rate limiting)
- Integrated existing `AIService` from `app.services.ai`
- Established tiered message limits (10 premium + 40 free per day)
- Created check-in scheduler for proactive engagement

**Key Learnings:**
- DO NOT create new AI service - always use existing `AIService`
- Context enrichment is separate concern from chat UI
- Rate limiting applies to ALL AI services (not just chat)
- Cost tracking is critical (log every AI call to `ai_runs`)

**Story 1.5.3 (AI Services Standardization):**
- Established `AIProviderBase` abstraction
- Created fallback chain pattern (Sonnet → Haiku → Mini)
- Set up cost tracking in `ai_runs` table
- Created `docs/dev/ai-services-guide.md`

**Key Learnings:**
- All AI calls MUST log to `ai_runs` table
- Use `user_context` parameter for context injection (not separate service)
- Fallback gracefully if context building fails
- Monitor cost per interaction (aim for <$0.05/message)

### Git Intelligence Summary

**Recent Work (Last 5 Commits):**
- `d020731`: Mobile lint stuff (linting improvements)
- `8d7ec17`: Merge Eddie's dashboard (collaboration on dashboard features)
- `bb0486c`: Linting issues fixed
- `5a0dc79`: Merge PR #80 dashboard-v2
- `3574d0f`: Test

**Patterns Observed:**
- Frequent linting passes (use `npm run lint` and `uv run ruff check`)
- Collaborative development (merging PRs from teammates)
- Story-based branching (story/X.Y format)

**Actionable Insights:**
- Run linting after each task completion
- Test context building with real user data (not just mocks)
- Create story branch: `story/6.2`

### Latest Technical Information

**Supabase PostgreSQL (Latest):**
- Supports JSONB columns for structured context storage
- Full-text search available (not needed for MVP)
- Row Level Security already enabled (Story 0.4)

**FastAPI (Latest):**
- Async/await support for parallel context queries
- Pydantic v2 for fast JSON serialization
- Background tasks for async context caching

**Python Performance (Latest):**
- `asyncio.gather()` for parallel database queries
- `functools.lru_cache` for in-memory context caching
- `ujson` library for faster JSON parsing (optional optimization)

### Project Context Reference

**Critical Rules from CLAUDE.md:**
1. **Development Infrastructure Standards (Epic 1.5):** MUST follow Story 1.5.2 (backend), 1.5.3 (AI services)
2. **Data Integrity:** Never UPDATE/DELETE from `subtask_completions` (canonical truth)
3. **AI Cost Control:** Log ALL AI calls to `ai_runs` table with cost tracking
4. **State Management:** This is backend-only story (no frontend state changes)
5. **Testing Standards:** Pytest fixtures in `tests/` directory

## Story Completion Status

**Status:** ready-for-dev ✅ **CREATED (2025-12-23)**

**Context Analysis:** ✅ Complete
- Loaded Epic 6.2 requirements from PRD
- Analyzed Story 6.1 foundation (chat infrastructure already built)
- Reviewed architecture patterns (AI services, backend standardization)
- Identified existing AIService to enhance (prevent duplication)
- Extracted context building patterns from similar services

**Developer Guardrails:** ✅ Complete
- Clear acceptance criteria (9 items)
- Detailed task breakdown (9 tasks, 40+ subtasks)
- Architecture compliance requirements
- Performance requirements (< 500ms context assembly)
- Testing requirements with examples
- File structure specifications

**Implementation-Ready:** ✅ Yes
- All dependencies identified (no new NPM/uv packages needed)
- Database schema changes minimal (add 3 columns to `ai_runs`)
- API contracts defined (update existing endpoints)
- Service structure outlined (ContextBuilderService)
- Testing patterns established

**Critical Design Decisions:**
1. ✅ **Enhance AIService** - Add `user_context` parameter (DO NOT create new service)
2. ✅ **Context Structure** - JSON format with goals, activity, journal, identity, metrics
3. ✅ **Generic Detection** - Regex patterns + retry logic (max 1 attempt)
4. ✅ **Performance Target** - <500ms context assembly (P95)
5. ✅ **Caching Strategy** - 5-minute cache for repeat users

**Next Steps:**
1. Run `/bmad:bmm:workflows:dev-story` to implement Story 6.2
2. Run `/bmad:bmm:workflows:code-review` when complete

## Dev Agent Record

### Context Reference

Story created using BMAD Create Story workflow (YOLO mode) - comprehensive context engine analysis completed.

### Agent Model Used

Claude Sonnet 4.5 (global.anthropic.claude-sonnet-4-5-20250929-v1:0)

### Debug Log References

N/A (Story creation, not implementation)

### Completion Notes List

1. Story 6.2 created as natural extension of Story 6.1 (chat infrastructure)
2. Context Builder pattern: Assembles canonical user state snapshot
3. AI Service integration: Enhance existing service (add `user_context` parameter)
4. Generic response detection: Regex patterns + retry logic
5. Performance optimized: <500ms context assembly, database indexes
6. Zero duplication: Reuses existing AIService, ai_runs table, rate limiting
7. Testing comprehensive: Unit tests + integration tests with real user scenarios
8. Admin endpoint: Context preview for debugging/testing
9. Fallback graceful: If context building fails, proceed without context (log warning)
10. Dream Self personality: Inject from identity document into system prompt

### File List

**Files to Create (Backend):**
- `weave-api/app/services/context_builder.py` (ContextBuilderService class)
- `weave-api/app/services/response_quality_checker.py` (Generic detection)
- `weave-api/app/tests/test_context_builder.py` (Pytest unit tests)
- `weave-api/app/tests/test_context_integration.py` (Integration tests)

**Files to Modify (Backend):**
- `weave-api/app/services/ai/ai_service.py` (Add `user_context` parameter)
- `weave-api/app/api/ai_chat_router.py` (Build context before AI call)
- `weave-api/app/api/triad_router.py` (If exists - add context to Triad generation)
- `weave-api/app/api/journal_router.py` (If exists - add context to journal feedback)

**Files to Create (Database):**
- `supabase/migrations/YYYYMMDDHHMMSS_ai_context_tracking.sql` (Add columns to ai_runs)

**Files to Reference:**
- `docs/prd/epic-6-ai-coaching.md` (Epic 6.2 requirements)
- `docs/stories/6-1-ai-chat-interface.md` (Story 6.1 foundation)
- `docs/architecture/core-architectural-decisions.md` (AI patterns)
- `docs/architecture/implementation-patterns-consistency-rules.md` (Standards)
- `docs/dev/ai-services-guide.md` (AI integration guide)
- `weave-api/app/services/ai/ai_service.py` (Existing service to enhance)

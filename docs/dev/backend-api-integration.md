# Backend API Integration Guide

**Story 1.5.2: Backend API/Model Standardization**

Complete reference for all API endpoints across Epic 2-8. Use this guide to understand the full API surface area and implement endpoints systematically.

---

## Table of Contents

1. [Complete Endpoint Registry](#complete-endpoint-registry) ⚡ **UPDATED**
2. [Implementation Checklist](#implementation-checklist)
3. [Testing Patterns](#testing-patterns)
4. [Authentication & RLS](#authentication--rls)
5. [Common Patterns](#common-patterns)

---

## Complete Endpoint Registry

### Overview

**Total Endpoints:** 28 across 7 router modules
**Router Modules:** `goals`, `binds`, `journal`, `stats`, `ai`, `notifications`, `user`

---

### Epic 2: Goal Management (5 endpoints)

**Router:** `app/api/goals/router.py`
**Database Tables:** `goals`, `subtask_templates`

| Method | Endpoint | Epic/Story | Purpose | Status |
|--------|----------|------------|---------|--------|
| GET | `/api/goals` | Epic 2, Story 2.1 | List user's active goals | 📋 Ready for implementation |
| GET | `/api/goals/{id}` | Epic 2, Story 2.2 | Get goal details | 📋 Ready for implementation |
| POST | `/api/goals` | Epic 2, Story 2.3 | Create new goal with AI | 📋 Ready for implementation |
| PUT | `/api/goals/{id}` | Epic 2, Story 2.4 | Edit goal | 📋 Ready for implementation |
| PUT | `/api/goals/{id}/archive` | Epic 2, Story 2.5 | Archive goal | 📋 Ready for implementation |

**Business Rules:**
- Max 3 active goals per user
- Archiving goal soft-deletes subtask instances
- Creating goal with AI calls GoalBreakdownService

**Implementation Notes:**
- Use `GoalBreakdownService` for AI integration (Story 2.3)
- Validate goal limit before creation
- Archive operation sets `is_archived=true`, not hard delete

---

### Epic 3: Daily Actions (4 endpoints)

**Router:** `app/api/binds/router.py`
**Database Tables:** `subtask_instances`, `subtask_completions`, `captures`

| Method | Endpoint | Epic/Story | Purpose | Status |
|--------|----------|------------|---------|--------|
| GET | `/api/binds/today` | Epic 3, Story 3.1 | Get today's binds | ✅ **IMPLEMENTED** (thread-flow branch) |
| POST | `/api/binds/{id}/complete` | Epic 3, Story 3.3 | Mark bind complete | ✅ **IMPLEMENTED** (thread-flow branch) |
| POST | `/api/captures` | Epic 3, Story 3.3 | Upload proof (photo/audio/timer) | 📋 Ready for implementation |
| GET | `/api/daily-aggregates` | Epic 3, Story 3.1 | Daily stats (completion rate) | 📋 Ready for implementation |

**Business Rules:**
- Only complete binds scheduled for today or past
- Captures optional but increase authenticity score
- Daily aggregates compute completion percentage, streak

**Implementation Notes:**
- Binds = subtask_instances scheduled for specific date
- Completions are append-only (no updates/deletes)
- Captures link to completions via `completion_id`

---

### Epic 4: Reflection & Journaling (5 endpoints)

**Router:** `app/api/journal/router.py`
**Database Tables:** `journal_entries`, `ai_artifacts`

| Method | Endpoint | Epic/Story | Purpose | Status |
|--------|----------|------------|---------|--------|
| POST | `/api/journal` | Epic 4, Story 4.1 | Submit daily reflection | ✅ **IMPLEMENTED** (thread-flow branch) |
| GET | `/api/journal` | Epic 4, Story 4.5 | List past journals | 📋 Ready for implementation |
| GET | `/api/journal/{date}` | Epic 4, Story 4.5 | Get specific entry | 📋 Ready for implementation |
| POST | `/api/ai/recap` | Epic 4, Story 4.3 | Generate AI feedback | 📋 Ready for implementation |
| PUT | `/api/ai-artifacts/{id}` | Epic 4, Story 4.4 | Edit AI feedback | 📋 Ready for implementation |

**Business Rules:**
- One journal entry per user per day
- Fulfillment score 0-10 required
- AI recap generated after reflection submission
- AI artifacts editable (user can modify AI output)

**Implementation Notes:**
- Journal entries use `local_date` (user timezone)
- AI recap calls `DailyRecapService`
- AI artifacts stored separately, linked to journal entry

---

### Epic 5: Progress Visualization (2 endpoints)

**Router:** `app/api/stats/router.py`
**Database Tables:** `daily_aggregates`, `user_profiles`

| Method | Endpoint | Epic/Story | Purpose | Status |
|--------|----------|------------|---------|--------|
| GET | `/api/user-stats` | Epic 5, Story 5.1 | Overall user metrics | 📋 Ready for implementation |
| GET | `/api/daily-aggregates` | Epic 5, Story 5.2 | Aggregates for heat map | 📋 Ready for implementation |

**Query Parameters:**
- `?timeframe=7|30|60|90` - Days to include
- `?local_date=YYYY-MM-DD` - Specific date

**Business Rules:**
- Daily aggregates computed nightly (cron job)
- User stats include: total goals, active goals, completion rate, streak
- Heat map shows completion percentage per day

**Implementation Notes:**
- Daily aggregates table pre-computed (not real-time)
- Query by `local_date` for timezone consistency
- Missing days return null (not computed yet)

---

### Epic 6: AI Coaching (3 endpoints)

**Router:** `app/api/ai/router.py`
**Database Tables:** `ai_chat_sessions`, `ai_chat_messages`, `ai_artifacts`

| Method | Endpoint | Epic/Story | Purpose | Status |
|--------|----------|------------|---------|--------|
| POST | `/api/ai/chat` | Epic 6, Story 6.1 | Send message to Dream Self | 📋 Ready for implementation |
| GET | `/api/ai/chat/history` | Epic 6, Story 6.1 | Chat conversation history | 📋 Ready for implementation |
| POST | `/api/ai/insights` | Epic 6, Story 6.4 | Trigger weekly insights | 📋 Ready for implementation |

**Business Rules:**
- Chat sessions maintain context across messages
- Dream Self personality based on user archetype
- Weekly insights generated Sunday night
- Rate limit: 10 AI requests/hour per user

**Implementation Notes:**
- Use `DreamSelfAdvisorService` for chat
- Use `AIInsightsService` for weekly insights
- Sessions expire after 24h of inactivity
- Check `daily_aggregates.ai_request_count` for rate limiting

---

### Epic 7: Notifications (4 endpoints)

**Router:** `app/api/notifications/router.py`
**Database Tables:** `notification_settings`, `notification_log`

| Method | Endpoint | Epic/Story | Purpose | Status |
|--------|----------|------------|---------|--------|
| POST | `/api/notifications/schedule` | Epic 7, Story 7.1 | Schedule notification | 📋 Ready for implementation |
| POST | `/api/notifications/bind-reminder` | Epic 7, Story 7.2 | Bind reminder | 📋 Ready for implementation |
| POST | `/api/notifications/reflection-prompt` | Epic 7, Story 7.3 | Evening prompt | 📋 Ready for implementation |
| POST | `/api/notifications/streak-recovery` | Epic 7, Story 7.4 | Recovery nudge | 📋 Ready for implementation |

**Business Rules:**
- Notifications require Expo Push Notification token
- Users can customize notification times
- Bind reminders sent 30min before scheduled time
- Reflection prompts sent 30min before user's evening time

**Implementation Notes:**
- Use Expo Push Notification service
- Store notification settings in `user_profiles`
- Log all sent notifications for audit trail
- Handle iOS APNs errors gracefully

---

### Epic 8: Settings & Profile (5 endpoints)

**Router:** `app/api/user/router.py`
**Database Tables:** `user_profiles`, `identity_docs`, `subscriptions`

| Method | Endpoint | Epic/Story | Purpose | Status |
|--------|----------|------------|---------|--------|
| GET | `/api/user/profile` | Epic 8, Story 8.1 | Get user profile | ✅ **IMPLEMENTED** (Story 0.3) |
| PUT | `/api/user/profile` | Epic 8, Story 8.1 | Update profile | 📋 Ready for implementation |
| GET | `/api/user/export` | Epic 8, Story 8.3 | Data export (JSON) | 📋 Ready for implementation |
| DELETE | `/api/user/account` | Epic 8, Story 8.3 | Soft delete account | 📋 Ready for implementation |
| GET | `/api/subscriptions` | Epic 8, Story 8.4 | Subscription status | 📋 Ready for implementation |

**Business Rules:**
- Profile updates limited to non-auth fields
- Data export includes all user data (GDPR)
- Account deletion soft-deletes user + all resources
- Free tier limits: 3 goals, 10 AI requests/day

**Implementation Notes:**
- Profile endpoint already exists (Story 0.3)
- Data export generates ZIP with JSON files
- Account deletion cascades to all related tables
- Subscriptions managed via external service (TBD)

---

## Implementation Checklist

### For Each Endpoint

1. **Create Router (if not exists)**
   ```bash
   python scripts/generate_api.py <resource>
   ```

2. **Register in main.py**
   ```python
   from app.api.<resource> import router as <resource>_router
   app.include_router(<resource>_router)
   ```

3. **Replace 501 Placeholder**
   - Remove `HTTPException(501)` stub
   - Implement actual logic
   - Update Epic/Story references in docstring

4. **Add Business Logic**
   - Validate business rules
   - Query database (Supabase)
   - Format response (`{data, meta}`)

5. **Error Handling**
   - Use `ErrorCode` constants
   - Raise appropriate exceptions
   - Log errors with context

6. **Write Tests**
   - Implement `pytest.skip()` cases
   - Test happy path
   - Test error cases
   - Test authentication

7. **Run Tests**
   ```bash
   uv run pytest tests/test_<resource>_api.py -v
   ```

---

## Testing Patterns

### Test Structure

Every endpoint needs:

```python
# Happy path test
def test_create_goal_success(auth_headers):
    response = client.post("/api/goals", json={...}, headers=auth_headers)
    assert response.status_code == 201
    assert "data" in response.json()

# Error case tests
def test_create_goal_unauthorized():
    response = client.post("/api/goals", json={...})
    assert response.status_code == 401

def test_create_goal_validation_error(auth_headers):
    response = client.post("/api/goals", json={}, headers=auth_headers)
    assert response.status_code == 400
    assert response.json()["error"] == "VALIDATION_ERROR"

def test_create_goal_limit_exceeded(auth_headers):
    # Create 3 goals (max)
    for i in range(3):
        client.post("/api/goals", json={...}, headers=auth_headers)

    # 4th should fail
    response = client.post("/api/goals", json={...}, headers=auth_headers)
    assert response.status_code == 400
    assert response.json()["error"] == "GOAL_LIMIT_EXCEEDED"
```

### Running Tests

```bash
# All API tests
uv run pytest tests/ -v

# Specific router
uv run pytest tests/test_goals_api.py -v

# With coverage
uv run pytest tests/ --cov=app.api --cov-report=html
```

---

## Authentication & RLS

### JWT Middleware

**Every protected endpoint** must use:

```python
from app.core.auth import get_current_user

@router.get("/api/goals")
async def list_goals(user: dict = Depends(get_current_user)):
    auth_user_id = user["sub"]
    # Implementation...
```

### RLS Pattern

Database queries automatically enforce RLS:

```python
# Query user's goals (RLS enforces user_id filtering)
response = supabase.table('goals').select('*').execute()

# Manual user_id filter not needed (RLS handles it)
# But explicit filtering is OK for clarity
response = supabase.table('goals').select('*').eq(
    'user_id', auth_user_id
).execute()
```

**RLS policies reference:** Story 0.4 (`supabase/migrations/20251219170656_row_level_security.sql`)

---

## Common Patterns

### Pagination

```python
@router.get("/api/goals")
async def list_goals(
    user: dict = Depends(get_current_user),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100)
):
    start = (page - 1) * per_page
    end = page * per_page - 1

    response = supabase.table('goals').select(
        '*', count='exact'
    ).eq('user_id', auth_user_id).range(start, end).execute()

    return {
        "data": response.data,
        "meta": {
            "total": response.count,
            "page": page,
            "per_page": per_page
        }
    }
```

### Soft Delete

```python
@router.delete("/api/goals/{goal_id}")
async def delete_goal(goal_id: str, user: dict = Depends(get_current_user)):
    # Soft delete (set deleted_at timestamp)
    supabase.table('goals').update({
        'deleted_at': datetime.utcnow().isoformat()
    }).eq('id', goal_id).eq('user_id', auth_user_id).execute()

    return {
        "data": {"deleted": True, "id": goal_id},
        "meta": {"timestamp": datetime.utcnow().isoformat() + "Z"}
    }
```

### Business Rule Validation

```python
@router.post("/api/goals")
async def create_goal(data: GoalCreate, user: dict = Depends(get_current_user)):
    auth_user_id = user["sub"]

    # Check goal limit
    count_response = supabase.table('goals').select(
        'id', count='exact'
    ).eq('user_id', auth_user_id).eq(
        'status', 'active'
    ).is_('deleted_at', 'null').execute()

    if count_response.count >= 3:
        raise AppException(
            code=ErrorCode.GOAL_LIMIT_EXCEEDED,
            message="Maximum 3 active goals allowed",
            status_code=400,
            details={"current": count_response.count, "max": 3}
        )

    # Create goal...
```

### AI Service Integration

```python
@router.post("/api/ai/chat")
async def ai_chat(
    message: str,
    user: dict = Depends(get_current_user)
):
    auth_user_id = user["sub"]

    # Check AI rate limit
    today = date.today().isoformat()
    agg_response = supabase.table('daily_aggregates').select(
        'ai_request_count'
    ).eq('user_id', auth_user_id).eq('local_date', today).single().execute()

    if agg_response.data and agg_response.data['ai_request_count'] >= 10:
        raise RateLimitException(
            message="AI request limit exceeded for today",
            retry_after=86400  # 24 hours
        )

    # Call AI service
    service = DreamSelfAdvisorService(supabase)
    response = await service.chat(auth_user_id, message)

    # Increment AI request count
    supabase.rpc('increment_ai_requests', {
        'p_user_id': auth_user_id,
        'p_local_date': today
    }).execute()

    return {"data": response}
```

---

## Quick Reference

### Endpoint Status Legend

| Icon | Status | Meaning |
|------|--------|---------|
| ✅ | Implemented | Fully functional (ready to use) |
| 📋 | Ready | Templates ready (awaiting implementation) |
| 🚧 | In Progress | Currently being developed |
| ⏸️ | Blocked | Waiting on dependency |

### Implementation Order (Recommended)

1. **Epic 2 (Goals)** - Foundation for all features
2. **Epic 3 (Binds)** - Core daily actions (partially complete)
3. **Epic 4 (Journal)** - Reflection loop (partially complete)
4. **Epic 5 (Stats)** - Progress visualization
5. **Epic 6 (AI Coaching)** - Advanced features
6. **Epic 7 (Notifications)** - Engagement layer
7. **Epic 8 (Settings)** - Profile management (mostly complete)

---

## Additional Resources

- **Backend Patterns Guide:** `docs/dev/backend-patterns-guide.md`
- **Templates:** `scripts/templates/`
- **Scaffolding Script:** `scripts/generate_api.py`
- **Error Handling:** `weave-api/app/core/errors.py`
- **Base Models:** `weave-api/app/models/base.py`
- **Architecture Rules:** `docs/architecture/implementation-patterns-consistency-rules.md`

---

**Last Updated:** 2025-12-23 (Story 1.5.2)

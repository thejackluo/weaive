# API Error Codes

**Story 0.8: Error Handling Framework** (Completed via Story 1.5.2)

Complete reference for all standardized error codes used across Weave backend APIs.

---

## Error Response Format

All API errors follow this standardized format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "retryable": false,
  "retryAfter": 3600,  // Optional: seconds until retry allowed (rate limiting)
  "details": {         // Optional: additional error context
    "field": "email",
    "value": "invalid"
  }
}
```

---

## Client Errors (4xx)

### VALIDATION_ERROR (400)

**HTTP Status:** 400 Bad Request

**Retryable:** No

**Description:** Invalid request data that failed Pydantic validation or business logic validation.

**Example Scenarios:**
- Missing required fields
- Invalid field format (email, phone, date)
- Value out of range (fulfillment_score > 10)
- Invalid enum value

**Frontend Handling:**
- Display validation errors inline on form fields
- Highlight invalid fields in red
- Show specific error message from `details.errors` array
- Do not retry automatically

**Example Response:**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "retryable": false,
  "details": {
    "errors": [
      {
        "field": "fulfillment_score",
        "message": "ensure this value is less than or equal to 10",
        "type": "value_error.number.not_le"
      }
    ]
  }
}
```

---

### UNAUTHORIZED (401)

**HTTP Status:** 401 Unauthorized

**Retryable:** No

**Description:** Missing, invalid, or expired authentication token.

**Example Scenarios:**
- No JWT token provided in Authorization header
- JWT token expired (>7 days old)
- Invalid JWT signature
- JWT token revoked

**Frontend Handling:**
- Redirect to login page
- Clear stored auth token
- Prompt user to re-authenticate
- Do not retry with same token

**retryAfter:** Not applicable

---

### FORBIDDEN (403)

**HTTP Status:** 403 Forbidden

**Retryable:** No

**Description:** Valid authentication but insufficient permissions to access resource.

**Example Scenarios:**
- User trying to access another user's goals
- User trying to perform admin action without admin role
- Row Level Security (RLS) policy denial

**Frontend Handling:**
- Show "Access Denied" message
- Suggest user contact support if unexpected
- Do not retry (permissions won't change)

**retryAfter:** Not applicable

---

### NOT_FOUND (404)

**HTTP Status:** 404 Not Found

**Retryable:** No

**Description:** Requested resource does not exist or has been soft-deleted.

**Example Scenarios:**
- Goal ID not found in database
- Journal entry for date doesn't exist
- Subtask instance not found
- Resource soft-deleted (deleted_at IS NOT NULL)

**Frontend Handling:**
- Show "Not Found" or "This item no longer exists" message
- Remove from local cache if present
- Navigate back to list view
- Do not retry

**Example Response:**
```json
{
  "error": "NOT_FOUND",
  "message": "Goal with ID abc123 not found",
  "retryable": false,
  "details": {
    "resource": "Goal",
    "id": "abc123"
  }
}
```

---

### CONFLICT (409)

**HTTP Status:** 409 Conflict

**Retryable:** No

**Description:** Request conflicts with existing resource state.

**Example Scenarios:**
- Creating goal when 3 active goals already exist
- Duplicate resource creation (same unique constraint)
- Completing a bind that's already completed

**Frontend Handling:**
- Show conflict message clearly
- Suggest resolution (e.g., "Archive a goal first")
- Refresh local data to show current state
- Allow user to manually resolve conflict

**retryAfter:** Not applicable

---

### RATE_LIMIT_EXCEEDED (429)

**HTTP Status:** 429 Too Many Requests

**Retryable:** Yes

**Description:** User exceeded rate limit for API calls (AI, uploads, completions).

**Example Scenarios:**
- 10+ AI calls within 1 hour
- 20+ images uploaded in 1 day
- 50+ transcription requests in 1 day
- 100+ bind completions in 1 day

**Frontend Handling:**
- Show rate limit message with retry time
- Use `retryAfter` field to display countdown timer
- Automatically retry after cooldown period
- Cache failed request to retry later

**retryAfter:** **YES** - Seconds until quota resets (typically 3600 for 1 hour)

**Example Response:**
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many AI requests. Please try again in 1 hour.",
  "retryable": true,
  "retryAfter": 3600,
  "details": {
    "limit": 10,
    "window": "1 hour",
    "reset_at": "2025-12-23T15:00:00Z"
  }
}
```

---

### UNPROCESSABLE_ENTITY (422)

**HTTP Status:** 422 Unprocessable Entity

**Retryable:** No

**Description:** Request is syntactically valid but semantically incorrect.

**Example Scenarios:**
- Valid JSON but business logic violation
- Valid date format but date is in the past when future required
- Valid UUID but references non-existent foreign key

**Frontend Handling:**
- Treat similar to VALIDATION_ERROR
- Show semantic error message
- Guide user to correct the issue
- Do not retry without changes

**retryAfter:** Not applicable

---

## Business Logic Errors (400)

### GOAL_LIMIT_EXCEEDED (400)

**HTTP Status:** 400 Bad Request

**Retryable:** No

**Description:** User trying to create more than 3 active goals (MVP limit).

**Example Scenarios:**
- POST /api/goals when user already has 3 active goals

**Frontend Handling:**
- Show "Maximum 3 active goals" message
- Suggest archiving an existing goal first
- Display current goal count
- Provide "Archive Goal" action

**retryAfter:** Not applicable

---

### INVALID_STATUS_TRANSITION (400)

**HTTP Status:** 400 Bad Request

**Retryable:** No

**Description:** Attempted state transition is not allowed by business rules.

**Example Scenarios:**
- Marking archived goal as active without un-archiving
- Completing a bind that's not scheduled for today
- Submitting journal entry for future date

**Frontend Handling:**
- Show "Invalid action" message
- Explain valid transitions
- Refresh resource state
- Do not retry

**retryAfter:** Not applicable

---

### DUPLICATE_RESOURCE (409)

**HTTP Status:** 409 Conflict

**Retryable:** No

**Description:** Resource with same unique identifier already exists.

**Example Scenarios:**
- Creating goal with same title (if uniqueness enforced)
- Completing same bind twice in same day
- Creating journal entry when one already exists for date

**Frontend Handling:**
- Show "Already exists" message
- Offer to view existing resource
- Suggest editing instead of creating
- Do not retry

**retryAfter:** Not applicable

---

### DEPENDENCY_NOT_MET (400)

**HTTP Status:** 400 Bad Request

**Retryable:** No

**Description:** Required dependency missing before performing action.

**Example Scenarios:**
- Completing bind before creating goal
- Submitting journal without completing onboarding
- Creating subtask for non-existent goal

**Frontend Handling:**
- Show "Complete X first" message
- Guide user through prerequisite steps
- Provide direct link to dependency
- Do not retry until dependency met

**retryAfter:** Not applicable

---

### INVALID_DATE_RANGE (400)

**HTTP Status:** 400 Bad Request

**Retryable:** No

**Description:** Date range query is invalid (start > end, range too large, etc.).

**Example Scenarios:**
- Requesting stats with start_date > end_date
- Requesting >90 days of data (if limit enforced)
- Querying future dates for historical data

**Frontend Handling:**
- Show "Invalid date range" message
- Reset date picker to valid range
- Enforce client-side validation
- Do not retry with same dates

**retryAfter:** Not applicable

---

### INSUFFICIENT_QUOTA (400)

**HTTP Status:** 400 Bad Request

**Retryable:** No (until quota resets)

**Description:** User quota exhausted (images, AI calls, storage).

**Example Scenarios:**
- 5MB image upload quota reached for day
- 20 images uploaded already today
- Storage quota exceeded

**Frontend Handling:**
- Show quota usage (e.g., "18/20 images used today")
- Display quota reset time
- Suggest upgrading plan if applicable
- Cache failed upload for retry tomorrow

**retryAfter:** Could include reset time in details

---

## Server Errors (5xx)

### INTERNAL_ERROR (500)

**HTTP Status:** 500 Internal Server Error

**Retryable:** Yes

**Description:** Unexpected server error that wasn't handled gracefully.

**Example Scenarios:**
- Unhandled exception in business logic
- Database constraint violation
- Python runtime error
- Memory/CPU resource exhaustion

**Frontend Handling:**
- Show "Something went wrong" generic message
- Log error details for debugging
- Retry automatically after 2-5 seconds (exponential backoff)
- Provide "Report Issue" button

**retryAfter:** Not specified (use exponential backoff: 2s, 4s, 8s)

---

### NOT_IMPLEMENTED (501)

**HTTP Status:** 501 Not Implemented

**Retryable:** No

**Description:** Endpoint stub exists but feature not yet developed.

**Example Scenarios:**
- Calling placeholder endpoint from Epic 2-8 before implementation
- Accessing beta feature not yet released

**Frontend Handling:**
- Show "Coming Soon" message with Epic/Story reference
- Display expected release date if available
- Hide feature behind flag if possible
- Do not retry

**Example Response:**
```json
{
  "error": "NOT_IMPLEMENTED",
  "message": "This endpoint has not been developed",
  "retryable": false,
  "details": {
    "epic": "Epic 2: Goal Management",
    "story": "Story 2.1: View Goals List"
  }
}
```

---

### SERVICE_UNAVAILABLE (503)

**HTTP Status:** 503 Service Unavailable

**Retryable:** Yes

**Description:** Service is temporarily down or overloaded (database, AI, storage).

**Example Scenarios:**
- Database connection pool exhausted
- AI service timeout (OpenAI/Anthropic down)
- Supabase Storage unavailable
- Maintenance mode

**Frontend Handling:**
- Show "Service temporarily unavailable" message
- Retry automatically with exponential backoff (5s, 10s, 20s)
- Show "Try again later" if retries fail
- Cache failed request for manual retry

**retryAfter:** Could be included if maintenance window known

---

### GATEWAY_TIMEOUT (504)

**HTTP Status:** 504 Gateway Timeout

**Retryable:** Yes

**Description:** Upstream service did not respond in time.

**Example Scenarios:**
- AI service request timeout (>30 seconds)
- Database query timeout
- External API call timeout

**Frontend Handling:**
- Show "Request timed out" message
- Retry automatically (once)
- Suggest reducing request size if applicable
- Log timeout for performance monitoring

**retryAfter:** Not specified (immediate retry reasonable)

---

## External Service Errors (502/503)

### DATABASE_ERROR (503)

**HTTP Status:** 503 Service Unavailable

**Retryable:** Yes

**Description:** Database connection or query failed.

**Example Scenarios:**
- Supabase connection lost
- Query timeout
- Connection pool exhausted
- Database in read-only mode

**Frontend Handling:**
- Treat same as SERVICE_UNAVAILABLE
- Retry with exponential backoff
- Cache writes to retry later
- Show "Database issue" in dev mode only (generic message in prod)

**retryAfter:** Not specified

---

### AI_SERVICE_ERROR (503)

**HTTP Status:** 503 Service Unavailable

**Retryable:** Yes

**Description:** AI service (OpenAI/Anthropic) unavailable or errored.

**Example Scenarios:**
- OpenAI API down
- Anthropic rate limit hit
- AI model overloaded
- AI request timeout

**Frontend Handling:**
- Show "AI service temporarily unavailable" message
- Fall back to cached AI response if available
- Retry after 10-30 seconds
- Suggest manual action if AI not critical

**retryAfter:** Could be included (typically 60-300 seconds)

**Implementation Notes:**
- Story 0.6 implements fallback chain: OpenAI → Anthropic → Deterministic
- Frontend should rely on backend to handle fallbacks

---

### STORAGE_ERROR (503)

**HTTP Status:** 503 Service Unavailable

**Retryable:** Yes

**Description:** File storage service (Supabase Storage) unavailable.

**Example Scenarios:**
- Supabase Storage down
- Upload timeout
- Storage quota exceeded (backend-side)
- Network interruption during upload

**Frontend Handling:**
- Show "Upload failed" message
- Cache file locally for retry
- Retry automatically after 5-10 seconds
- Provide manual "Retry Upload" button

**retryAfter:** Not specified

---

### EXTERNAL_API_ERROR (502)

**HTTP Status:** 502 Bad Gateway

**Retryable:** Yes

**Description:** External third-party API returned error.

**Example Scenarios:**
- RevenueCat (subscriptions) API down
- Push notification service error
- Email service error
- Analytics service timeout

**Frontend Handling:**
- Show service-specific error message if known
- Retry automatically for critical operations
- Degrade gracefully for non-critical features
- Log error for debugging

**retryAfter:** Not specified

---

## Frontend Integration Guidelines

### Retry Strategy

**Never Retry (retryable: false):**
- VALIDATION_ERROR - User must fix input
- UNAUTHORIZED - User must re-authenticate
- FORBIDDEN - Permissions issue
- NOT_FOUND - Resource doesn't exist
- CONFLICT - User must resolve manually
- NOT_IMPLEMENTED - Feature doesn't exist

**Retry with Backoff (retryable: true):**
- INTERNAL_ERROR - Exponential backoff: 2s, 4s, 8s (max 3 retries)
- SERVICE_UNAVAILABLE - Exponential backoff: 5s, 10s, 20s (max 3 retries)
- GATEWAY_TIMEOUT - Immediate retry once, then 10s backoff
- DATABASE_ERROR - Exponential backoff: 2s, 4s (max 2 retries)
- AI_SERVICE_ERROR - 10s, 30s (max 2 retries, backend handles fallbacks)
- STORAGE_ERROR - 5s, 10s (max 2 retries)
- EXTERNAL_API_ERROR - 5s (max 1 retry)

**Respect retryAfter (Rate Limiting):**
- RATE_LIMIT_EXCEEDED - Wait exactly `retryAfter` seconds before retry
- Display countdown timer to user
- Queue failed request for automatic retry

### Error Display Patterns

**Inline Validation Errors:**
```tsx
// VALIDATION_ERROR
<TextInput error={error.details?.errors?.find(e => e.field === 'email')?.message} />
```

**Toast Notifications:**
```tsx
// Transient errors (network, retryable)
Toast.show({ type: 'error', text: error.message, duration: 3000 });
```

**Modal Dialogs:**
```tsx
// Critical errors requiring user action (UNAUTHORIZED, FORBIDDEN)
<Alert title="Authentication Required" message={error.message} />
```

**Banner Messages:**
```tsx
// System-wide errors (SERVICE_UNAVAILABLE)
<Banner type="warning" message="Service temporarily unavailable. We're working on it!" />
```

---

## Backend Implementation

### Raising Errors

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
        details={"current_count": goal_count, "max_allowed": 3}
    )

# Not found
if not goal:
    raise NotFoundException(resource="Goal", resource_id=goal_id)

# Rate limiting
if ai_calls_today >= 10:
    raise RateLimitException(
        message="Too many AI requests. Try again in 1 hour.",
        retry_after=3600  # 1 hour
    )
```

### Exception Handler Registration

**File:** `app/main.py`

```python
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from app.core.errors import (
    AppException,
    app_exception_handler,
    validation_exception_handler,
    generic_exception_handler
)

app = FastAPI()

# Register exception handlers (Story 0.8 completion)
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)
```

---

## Change Log

- **2025-12-23:** Created via Story 1.5.2 (AC-10) - Merged Story 0.8 Error Handling Framework
- **Initial:** 17 error codes documented with HTTP status, retryability, scenarios, frontend handling, retryAfter behavior

---

## Related Documentation

- **Error Handling Implementation:** `weave-api/app/core/errors.py`
- **Backend Patterns Guide:** `docs/dev/backend-patterns-guide.md`
- **Story 0.8 PRD:** `docs/prd/epic-0-foundation.md` (lines 148-186)
- **Story 1.5.2 Implementation:** `docs/stories/1-5-2-backend-standardization.md`

# Non-Functional Requirements

## Performance Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-P1 | App launch time | <3 seconds | M |
| NFR-P2 | Thread (Home) load time | <1 second | M |
| NFR-P3 | Bind completion response | <500ms | M |
| NFR-P4 | AI chat response (streaming start) | <3 seconds | M |
| NFR-P5 | AI batch job completion | <30 seconds | M |
| NFR-P6 | Image upload time | <5 seconds (10MB max) | S |
| NFR-P7 | Heat map render time | <1 second | S |

## Scalability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-S1 | Concurrent users | 10,000 | M |
| NFR-S2 | Database queries/second | 1,000 | M |
| NFR-S3 | AI requests/hour (system) | 5,000 | M |
| NFR-S4 | Storage per user | 500MB max | S |

## Availability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-A1 | System uptime | 99.5% | M |
| NFR-A2 | Planned maintenance window | <4 hours/month | S |
| NFR-A3 | Unplanned downtime recovery | <1 hour | S |

## Usability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-U1 | Onboarding completion rate | >70% | M |
| NFR-U2 | Bind completion time | <30 seconds | M |
| NFR-U3 | Capture creation time | <10 seconds | M |
| NFR-U4 | Answer "What should I do?" | <10 seconds | M |
| NFR-U5 | Accessibility (WCAG 2.1) | Level AA | S |

## Reliability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-R1 | Data loss prevention | Zero tolerance | M |
| NFR-R2 | Completion event persistence | 100% | M |
| NFR-R3 | Error rate (API) | <0.1% | M |
| NFR-R4 | Crash rate (mobile) | <1% | M |

## Compatibility Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-C1 | iOS version support | iOS 15+ | M |
| NFR-C2 | iPhone models | iPhone X and newer | M |
| NFR-C3 | Screen sizes | 5.8" - 6.7" | M |
| NFR-C4 | Offline mode | Basic read access | S |

## Error Handling Requirements **[NEW - Implementation Readiness]**

**Purpose:** Ensure consistent, user-friendly error handling across all features. Every error scenario must have a defined fallback path.

### Error Response Standard

All API endpoints must return errors in this format:

```json
{
  "error": {
    "code": "GOAL_LIMIT_REACHED",
    "message": "You can have a maximum of 3 active goals. Archive a goal to create a new one.",
    "retryable": false,
    "retryAfter": null
  }
}
```

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `code` | string | Machine-readable error code (UPPER_SNAKE_CASE) | Yes |
| `message` | string | Human-friendly error message (actionable) | Yes |
| `retryable` | boolean | Whether user should retry this request | Yes |
| `retryAfter` | number | Seconds to wait before retry (for rate limits) | No |

### HTTP Status Codes

| Code | Usage | Example Scenarios |
|------|-------|-------------------|
| **400 Bad Request** | Validation errors, malformed input | Goal title >200 chars, invalid timezone, negative fulfillment score |
| **401 Unauthorized** | Missing or invalid auth token | JWT expired, token not provided |
| **403 Forbidden** | Valid auth but insufficient permissions | User A accessing User B's data (RLS violation) |
| **429 Too Many Requests** | Rate limit exceeded | 11th AI message in an hour, >10 goals created per day |
| **500 Internal Server Error** | Unexpected backend failure | Database connection lost, uncaught exception |
| **503 Service Unavailable** | AI provider down or system maintenance | OpenAI API timeout, Anthropic rate limit (after all retries) |

### Common Error Scenarios

| ID | Scenario | HTTP Status | Error Code | User Message | Fallback |
|----|----------|-------------|------------|--------------|----------|
| **ERR-001** | AI timeout (>5s) | 503 | AI_TIMEOUT | "AI is taking longer than usual. Here's a simpler suggestion..." | Template/deterministic response |
| **ERR-002** | Network offline | N/A (client) | NETWORK_OFFLINE | "You're offline. Changes will sync when connected." | Show cached data |
| **ERR-003** | File too large | 400 | FILE_TOO_LARGE | "Image must be under 10MB. Try compressing it." | Reject upload |
| **ERR-004** | Invalid file type | 400 | INVALID_FILE_TYPE | "Only JPEG and PNG images are supported." | Reject upload |
| **ERR-005** | Storage quota exceeded | 400 | STORAGE_QUOTA_EXCEEDED | "You've used all 500MB of storage. Delete old captures to upload more." | Block upload |
| **ERR-006** | Goal limit reached | 400 | GOAL_LIMIT_REACHED | "You can have max 3 active goals. Archive one to create a new goal." | Block creation |
| **ERR-007** | Rate limit (AI chat) | 429 | RATE_LIMIT_EXCEEDED | "You've sent 10 messages this hour. Try again in 37 minutes." | Show countdown timer |
| **ERR-008** | JWT expired | 401 | TOKEN_EXPIRED | "Your session expired. Logging you back in..." | Automatic token refresh |
| **ERR-009** | RLS violation | 403 | ACCESS_DENIED | "You don't have access to this resource." | Redirect to home |
| **ERR-010** | Database unavailable | 500 | DATABASE_ERROR | "Something went wrong. We're fixing it. Try again in a minute." | Show cached data |

### AI Fallback Requirements

**Every AI operation must have a 4-level fallback chain:**

| Level | Type | Implementation | Example (Goal Breakdown) |
|-------|------|----------------|--------------------------|
| **Level 1** | AI Primary | GPT-4o-mini (fast, cheap) | AI generates Q-goals + Binds |
| **Level 2** | AI Secondary | Claude Sonnet (quality) | If OpenAI fails, use Claude |
| **Level 3** | Deterministic | Template or rule-based | Category templates (fitness → exercise binds) |
| **Level 4** | Static | Generic fallback | "Define your goal", "Research first step" |

**User Experience:** Users should never be blocked by AI failure. Level 3/4 fallbacks must always return a usable result.

### Image Upload Error Handling **[Critical]**

| Validation | Error Code | User Message | AC |
|------------|------------|--------------|-----|
| File size >10MB | FILE_TOO_LARGE | "Image is X MB. Max 10MB allowed. Compress and try again." | User sees file size |
| Invalid format (not JPEG/PNG) | INVALID_FILE_TYPE | "Only JPEG and PNG images supported. Your file is X format." | User sees their file type |
| Image dimensions <100x100px | IMAGE_TOO_SMALL | "Image must be at least 100x100 pixels." | User sees dimensions |
| Upload timeout (>30s) | UPLOAD_TIMEOUT | "Upload timed out. Check your connection and try again." | Retry button appears |
| Storage quota exceeded | STORAGE_QUOTA_EXCEEDED | "You've used 500MB storage. Delete old captures to upload." | Link to manage captures |
| Network offline | NETWORK_OFFLINE | "You're offline. Image saved locally and will upload when connected." | Queue for retry |

**Retry Logic:** 3 automatic retries with exponential backoff (1s, 2s, 4s). If all fail, queue for manual retry.

### Error Logging & Monitoring

| Error Type | Log Level | Alert Threshold | Action |
|------------|-----------|-----------------|--------|
| Validation errors (400) | INFO | N/A | Log for analytics |
| Auth errors (401/403) | WARNING | >100/hour | Security review |
| Server errors (500) | ERROR | Any occurrence | Immediate Sentry alert |
| AI errors (503) | WARNING | >10% of requests | Check provider status |
| Client crashes | CRITICAL | >1% crash rate | Emergency fix |

---

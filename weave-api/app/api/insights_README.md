# Insights API Documentation

**Base Path:** `/api/insights`
**Authentication:** Required (JWT Bearer token)
**Version:** MVP (Story 6.4)

## Overview

The Insights API provides AI-generated personalized insights for the Thread home screen and Dashboard. It uses the `mvp_coach` personality (sarcastic but supportive) and analyzes user progress, patterns, and context.

## Endpoints

### GET /api/insights/thread

**Status:** ✅ Implemented (MVP)

Get daily insights for the Thread home screen.

#### Authentication

Requires JWT Bearer token in Authorization header:
```http
Authorization: Bearer <jwt_token>
```

#### Request

```http
GET /api/insights/thread
Host: api.weave.app
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response (200 OK)

```json
{
  "data": {
    "todays_focus": {
      "id": "goal-uuid-123",
      "title": "Get my haircut",
      "reason": "You said you'd do this yesterday. Stop procrastinating."
    },
    "streak_status": {
      "current_streak": 5,
      "milestone_proximity": 2,
      "message": "2 more days until 7-day streak! Keep going."
    },
    "pattern_insight": {
      "pattern_type": "time_of_day",
      "description": "You complete 80% of binds in the morning",
      "suggestion": "Front-load your day with important tasks"
    },
    "quick_win": {
      "id": "bind-uuid-456",
      "title": "10 pushups",
      "reason": "Quick dopamine hit. Takes 2 minutes."
    },
    "ai_message": "5 days strong. Not bad for someone who 'doesn't have time.' Lock in today.",
    "generated_at": "2026-01-02T10:30:00Z"
  },
  "meta": {
    "timestamp": "2026-01-02T10:30:00Z",
    "cached": false
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `data.todays_focus` | object \| null | Suggested focus for today (from yesterday's intention or AI-selected) |
| `data.todays_focus.id` | string | Goal/bind ID |
| `data.todays_focus.title` | string | What to focus on |
| `data.todays_focus.reason` | string | AI explanation (sarcastic/supportive) |
| `data.streak_status` | object | Current streak and milestone proximity |
| `data.streak_status.current_streak` | number | Days of consecutive completions |
| `data.streak_status.milestone_proximity` | number | Days until next milestone (3, 7, 14, 30, 100) |
| `data.streak_status.message` | string | Encouragement message |
| `data.pattern_insight` | object | Detected behavioral pattern |
| `data.pattern_insight.pattern_type` | string | Type: `time_of_day`, `day_of_week`, `bind_type` |
| `data.pattern_insight.description` | string | What the pattern is |
| `data.pattern_insight.suggestion` | string | Actionable recommendation |
| `data.quick_win` | object \| null | Easy task for momentum |
| `data.quick_win.id` | string | Bind ID |
| `data.quick_win.title` | string | Task title |
| `data.quick_win.reason` | string | Why it's a quick win |
| `data.ai_message` | string | Personalized message from mvp_coach personality |
| `data.generated_at` | string | ISO 8601 timestamp |
| `meta.timestamp` | string | Response timestamp |
| `meta.cached` | boolean | Whether response was cached (future feature) |

#### Error Responses

**401 Unauthorized**
```json
{
  "detail": "Not authenticated"
}
```

**500 Internal Server Error**
```json
{
  "detail": {
    "error": "INSIGHTS_GENERATION_FAILED",
    "message": "Failed to generate thread insights. Please try again."
  }
}
```

#### Performance

- **Target:** <1s response time
- **Caching:** Planned for future (1-hour cache)
- **Strategy:** Parallel queries via `ContextBuilderService`

#### Frontend Integration

```typescript
// React hook example
import { useQuery } from '@tanstack/react-query';

export function useThreadInsights() {
  return useQuery({
    queryKey: ['insights', 'thread'],
    queryFn: async () => {
      const token = await getAuthToken();
      const response = await fetch('/api/insights/thread', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch insights');
      return response.json();
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
```

---

### GET /api/insights/dashboard

**Status:** 🚧 NOT IMPLEMENTED (Planned for post-MVP)

Get weekly summary insights for the Dashboard.

#### Response (501 Not Implemented)

```json
{
  "detail": {
    "error": "NOT_IMPLEMENTED",
    "message": "Dashboard insights are planned for post-MVP. Check back soon!"
  }
}
```

#### Frontend Handling

Frontend should gracefully handle 501 and show placeholder UI:

```typescript
const { data, error } = useQuery({
  queryKey: ['insights', 'dashboard'],
  queryFn: fetchDashboardInsights,
  retry: false,
});

if (error?.response?.status === 501) {
  return <PlaceholderInsights message="Coming soon!" />;
}
```

---

## Architecture

### Dependencies

1. **ContextBuilderService** - Gathers user data (goals, completions, streaks, patterns)
2. **ThreadInsightsService** - AI logic for generating insights
3. **AIService** - Cost tracking, rate limiting, model fallback
4. **Personality System** - mvp_coach configuration

### Data Flow

```
Client Request
  ↓
JWT Auth Middleware (extract user_id from token["sub"])
  ↓
GET /api/insights/thread endpoint
  ↓
ContextBuilderService.build_context(user_id)
  → Fetches: active goals, recent completions, streak data, patterns
  ↓
ThreadInsightsService.generate_insights(user_id, context)
  → Runs AI with mvp_coach personality
  → Returns structured insights
  ↓
Response with {data, meta}
```

### AI Personality

**mvp_coach** (Sarcastic but Supportive)
- **Tone:** Direct, slightly sarcastic, no-bullshit
- **Purpose:** Motivate through tough love + genuine encouragement
- **Examples:**
  - "5 days strong. Not bad for someone who 'doesn't have time.'"
  - "You said you'd do this yesterday. Stop procrastinating."
  - "2 more days until 7-day streak! Keep going."

---

## Testing

See `tests/test_insights_api.py` for comprehensive test suite covering:
- Authentication requirements
- Success cases
- Error handling
- Response format validation
- JWT user ID extraction

Run tests:
```bash
cd weave-api
uv run pytest tests/test_insights_api.py -v
```

---

## Future Enhancements

1. **Caching** - Redis cache with 1-hour TTL
2. **Dashboard Insights** - Weekly summary implementation
3. **Real-time Updates** - WebSocket notifications for new insights
4. **Personalization** - Adaptive personality based on user feedback
5. **A/B Testing** - Test different insight types for engagement

---

## Related Documentation

- **Context Builder:** `weave-api/app/services/context_builder.py`
- **Thread Insights Service:** `weave-api/app/services/insights/thread_insights_service.py`
- **AI Service:** `docs/dev/ai-services-guide.md`
- **Personality Config:** `weave-api/app/config/ai_personality_config.py`

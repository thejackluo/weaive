# MVP vs. Scale Architecture Strategy

## AI Model Landscape (December 2025)

| Provider | Model | Input $/MTok | Output $/MTok | Best For |
|----------|-------|--------------|---------------|----------|
| **OpenAI** | GPT-4o-mini | $0.15 | $0.60 | Routine tasks, high volume |
| **OpenAI** | GPT-4o | $2.50 | $10.00 | Complex reasoning |
| **Anthropic** | Claude 3.5 Haiku | $0.80 | $4.00 | Fast, cheap |
| **Anthropic** | Claude 3.7 Sonnet | $3.00 | $15.00 | Balanced quality/cost |
| **Open Source** | Llama 3.1 70B | ~$0.10* | ~$0.30* | Self-hosted at scale |

*Self-hosted costs depend on GPU infrastructure*

## MVP Architecture (Week 1, 2-3 People)

**Philosophy:** Ship fast. Validate core loop. Technical debt is acceptable if it proves the product works.

### MVP Must-Have Components

| Component | MVP Implementation | Notes |
|-----------|-------------------|-------|
| **Auth** | Supabase Auth (built-in) | OAuth + email/password, zero config |
| **Database** | Supabase PostgreSQL | Direct queries, RLS required Sprint 1 |
| **Storage** | Supabase Storage | Signed URLs for proof captures |
| **Backend API** | Python FastAPI (Railway) | Single monolith, no microservices |
| **AI - Routine** | GPT-4o-mini ($0.15/$0.60) | Triad, recap - 90% of calls |
| **AI - Complex** | Claude 3.7 Sonnet | Onboarding, Dream Self chat |
| **Push Notifications** | Expo Push → APNs | Simple, works immediately |
| **Job Queue** | None - sync calls | At <100 users, sync is fine |

### MVP Database (8 Core Tables)

```sql
user_profiles       -- Basic user info + timezone
identity_docs       -- Single version per user (no versioning yet)
goals               -- Max 3 active
subtask_templates   -- Reusable binds
subtask_instances   -- Scheduled for specific dates
subtask_completions -- Immutable completion events
captures            -- Proof (photos, notes)
journal_entries     -- Daily reflections
```

### MVP AI Call Strategy

| Trigger | Model | Approach |
|---------|-------|----------|
| Onboarding | Claude Sonnet | Sync call, 5-10s wait OK |
| Journal → Triad + Recap | GPT-4o-mini | Single sync call |
| Dream Self Chat | GPT-4o-mini | Sync streaming |

**MVP Cost Estimate (100 users, 30 days): ~$40/month**

### Skip for MVP (Add Later)

| Component | Add When | Trigger |
|-----------|----------|---------|
| RLS Policies | **Sprint 1 (before alpha)** | Security requirement - CRITICAL |
| Analytics (PostHog) | 500+ users | Need retention data |
| Error Tracking (Sentry) | 500+ users | Production bugs |
| Job Queue (Redis/BullMQ) | 1K+ users | AI calls >5s |
| Input Hash Caching | 1K+ users | AI costs >$500/mo |
| Derived Views (daily_aggregates) | 1K+ users | Dashboard >500ms |
| Open Source Models | 5K+ users | AI costs >$2K/mo |

## Scale Architecture (10K+ Users)

**Hybrid AI Strategy:**
- **Routine calls (90%)**: Self-hosted Llama 3.1 70B (~$0.10/MTok)
- **Complex calls (10%)**: API (Sonnet/GPT-4o) for quality-critical interactions

**Scale Cost Estimate (10K users): ~$2,100/month** (vs. $4K+ all-API)

## AI Failure Recovery Strategy

**Problem:** AI API outages (OpenAI, Anthropic) would break core features (triad, recap, chat).

**Solution:** Implement fallback chain with graceful degradation.

### Fallback Chain

```
Primary (OpenAI GPT-4o-mini)
    ↓ on failure
Secondary (Anthropic Claude Haiku)
    ↓ on failure
Deterministic Fallback (no AI)
```

### Implementation

```python
# api/app/services/ai_fallback.py
from enum import Enum
from typing import Optional

class AIProvider(Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    DETERMINISTIC = "deterministic"

async def generate_with_fallback(
    prompt: str,
    user_context: dict,
    operation: str  # "triad", "recap", "chat"
) -> tuple[str, AIProvider]:
    """Generate AI response with automatic fallback."""

    # Try OpenAI first
    try:
        response = await call_openai(prompt)
        return response, AIProvider.OPENAI
    except OpenAIError as e:
        log_ai_failure("openai", operation, e)

    # Fallback to Anthropic
    try:
        response = await call_anthropic(prompt)
        return response, AIProvider.ANTHROPIC
    except AnthropicError as e:
        log_ai_failure("anthropic", operation, e)

    # Deterministic fallback
    response = generate_deterministic(operation, user_context)
    return response, AIProvider.DETERMINISTIC
```

### Deterministic Fallbacks

| Operation | Deterministic Behavior |
|-----------|----------------------|
| **Triad** | Select top 3 incomplete binds by frequency + recency |
| **Recap** | Template: "You completed X binds today. Keep going!" |
| **Chat** | "I'm temporarily unavailable. Try again in a few minutes." |

```python
# api/app/services/deterministic_fallback.py
def generate_simple_triad(user_id: str) -> Triad:
    """Generate triad from existing binds without AI."""
    binds = get_user_active_binds(user_id)

    # Rank by: incomplete today + high frequency + recent success
    ranked = sorted(binds, key=lambda b: (
        not b.completed_today,
        b.frequency_score,
        b.recent_completion_rate
    ), reverse=True)

    return Triad(
        tasks=ranked[:3],
        source='deterministic',
        message="Your AI coach is temporarily unavailable. "
                "Here are your top priorities based on your patterns."
    )
```

### User Communication

| Scenario | User Message |
|----------|--------------|
| OpenAI down, Anthropic works | (silent - no notification) |
| Both down, deterministic | Toast: "Using simplified recommendations" |
| Extended outage (>1 hour) | Push: "AI features limited - we're working on it" |

## AI Cost Monitoring

**Problem:** AI costs can spiral without visibility. Budget is $2,500/month at 10K users.

**Solution:** Real-time cost tracking with alerts and auto-throttling.

### Cost Tracking Implementation

```python
# api/app/services/ai_cost_tracker.py
from decimal import Decimal
from datetime import datetime, timedelta

# Pricing per 1M tokens (December 2025)
PRICING = {
    "gpt-4o-mini": {"input": Decimal("0.15"), "output": Decimal("0.60")},
    "gpt-4o": {"input": Decimal("2.50"), "output": Decimal("10.00")},
    "claude-3-5-haiku": {"input": Decimal("0.80"), "output": Decimal("4.00")},
    "claude-3-7-sonnet": {"input": Decimal("3.00"), "output": Decimal("15.00")},
}

async def track_ai_cost(
    user_id: str,
    model: str,
    input_tokens: int,
    output_tokens: int,
    operation: str
) -> Decimal:
    """Track AI cost and return cost in USD."""
    pricing = PRICING.get(model, PRICING["gpt-4o-mini"])

    cost = (
        (Decimal(input_tokens) / 1_000_000) * pricing["input"] +
        (Decimal(output_tokens) / 1_000_000) * pricing["output"]
    )

    await supabase.from_('ai_cost_tracking').insert({
        'user_id': user_id,
        'model': model,
        'operation': operation,
        'input_tokens': input_tokens,
        'output_tokens': output_tokens,
        'cost_usd': float(cost),
        'created_at': datetime.utcnow().isoformat()
    })

    return cost

async def get_daily_cost() -> Decimal:
    """Get total AI cost for today."""
    today = datetime.utcnow().date()
    result = await supabase.from_('ai_cost_tracking') \
        .select('cost_usd') \
        .gte('created_at', today.isoformat()) \
        .execute()

    return sum(Decimal(str(r['cost_usd'])) for r in result.data)
```

### Alert Thresholds

| Threshold | Action |
|-----------|--------|
| 50% of daily budget | Log warning |
| 80% of daily budget | Alert on-call + Slack notification |
| 100% of daily budget | Auto-throttle: cache-only mode |

```python
# api/app/services/ai_throttle.py
DAILY_BUDGET = Decimal("83.33")  # $2,500 / 30 days

async def check_throttle() -> bool:
    """Check if AI should be throttled due to cost."""
    daily_cost = await get_daily_cost()

    if daily_cost >= DAILY_BUDGET:
        log_alert("AI budget exceeded - throttling enabled")
        return True

    if daily_cost >= DAILY_BUDGET * Decimal("0.8"):
        log_warning(f"AI budget at 80%: ${daily_cost}")

    return False
```

### Cost Dashboard Query

```sql
-- Daily cost breakdown by operation
SELECT
    DATE(created_at) as date,
    operation,
    model,
    COUNT(*) as calls,
    SUM(input_tokens) as total_input,
    SUM(output_tokens) as total_output,
    SUM(cost_usd) as total_cost
FROM ai_cost_tracking
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), operation, model
ORDER BY date DESC, total_cost DESC;
```

---

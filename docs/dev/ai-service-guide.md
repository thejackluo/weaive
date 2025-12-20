# AI Service Guide

**Purpose:** Guide for using the AI Service abstraction layer with AWS Bedrock primary provider, fallback chains, cost tracking, and rate limiting.

**Story Reference:** 0.6 - AI Service Abstraction Layer
**Last Updated:** 2025-12-19

---

## Overview

The AI Service provides a unified interface for AI generation across multiple providers with automatic fallback, cost tracking, and budget enforcement.

**Key Features:**
- ✅ **Primary Provider:** AWS Bedrock (best runway with AWS credits)
- ✅ **4-Tier Fallback Chain:** Bedrock → OpenAI → Anthropic → Deterministic (never fails)
- ✅ **Dual Cost Tracking:** Application-wide + per-user
- ✅ **Role-Based Rate Limiting:** Admin unlimited, paid 10/hour, free 10/day
- ✅ **24-Hour Caching:** Instant responses for repeated prompts
- ✅ **Budget Enforcement:** Auto-throttle at $83.33/day total or tier limits
- ✅ **Extensible Templates:** Easy to add new AI modules

---

## Quick Start

### 1. Setup Environment Variables

```bash
# weave-api/.env

# AWS Bedrock (PRIMARY - requires setup)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1

# OpenAI (FALLBACK #1)
OPENAI_API_KEY=sk-...

# Anthropic (FALLBACK #2)
ANTHROPIC_API_KEY=sk-ant-...
```

**Note:** See `docs/dev/aws-bedrock-setup.md` for detailed AWS Bedrock setup instructions.

### 2. Initialize AI Service

```python
from supabase import create_client
from app.services.ai import AIService
import os

# Initialize Supabase client
db = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_KEY')
)

# Initialize AI Service
ai_service = AIService(
    db=db,
    bedrock_region=os.getenv('AWS_REGION', 'us-east-1'),
    openai_key=os.getenv('OPENAI_API_KEY'),
    anthropic_key=os.getenv('ANTHROPIC_API_KEY')
)
```

### 3. Generate AI Response

```python
# Basic usage
response = ai_service.generate(
    user_id='user_profile_uuid',
    user_role='user',  # or 'admin'
    user_tier='free',  # or 'paid'
    module='triad',
    prompt='Generate tomorrow's 3 tasks based on goal: Learn Python',
)

print(response.content)  # AI-generated text
print(f"Cost: ${response.cost_usd:.6f}")
print(f"Provider: {response.provider}")  # 'bedrock', 'openai', 'anthropic', 'deterministic', or 'cache'
print(f"Cached: {response.cached}")
```

---

## Fallback Chain

The AI Service tries providers in order until one succeeds:

```
1. AWS Bedrock (PRIMARY) ──────> Success ✅
   └── Failure ──┐
                 ↓
2. OpenAI (FALLBACK #1) ───────> Success ✅
   └── Failure ──┐
                 ↓
3. Anthropic (FALLBACK #2) ────> Success ✅
   └── Failure ──┐
                 ↓
4. Deterministic (ULTIMATE) ───> Always succeeds ✅
```

**Key Points:**
- **Bedrock** is tried first (primary platform, best runway)
- **OpenAI/Anthropic** are fallback providers
- **Deterministic** never fails, zero cost, uses templates
- All attempts logged to `ai_runs` table with status

---

## Dual Cost Tracking

### Application-Wide Budget

**Limit:** $83.33/day ($2,500/month ÷ 30 days)

```python
# Check total daily cost
total_cost = ai_service.cost_tracker.get_total_daily_cost()
print(f"Total cost today: ${total_cost:.2f} / $83.33")

# Check if budget exceeded
if ai_service.cost_tracker.is_total_budget_exceeded():
    print("⚠️  Application budget exceeded - using deterministic fallback only")
```

**Behavior when exceeded:**
- Skip Bedrock, OpenAI, Anthropic
- Use deterministic provider only (zero cost)
- Warning logged at 80% ($66.66)
- Error logged at 100% ($83.33)

### Per-User Budget

**Limits:**
- Free tier: $0.02/day (~$0.60/month)
- Paid tier: $0.10/day (~$3.00/month)

```python
# Check user's daily cost
user_cost = ai_service.cost_tracker.get_user_daily_cost('user_123')
print(f"User cost today: ${user_cost:.4f}")

# Check if user budget exceeded
if ai_service.cost_tracker.is_user_budget_exceeded('user_123', 'free'):
    print("⚠️  User budget exceeded - throttled")
```

**Behavior when exceeded:**
- User-specific throttle
- Paid providers skipped for that user
- Deterministic fallback only
- Warning at 80% of tier limit

---

## Role-Based Rate Limiting

### Admin Users (Unlimited)

```python
response = ai_service.generate(
    user_id='admin_user_id',
    user_role='admin',  # Admin role bypasses all limits
    user_tier='free',  # Tier doesn't matter for admins
    module='triad',
    prompt='Test prompt'
)
# ✅ No rate limit check, always proceeds
```

**Use cases:**
- Testing AI features
- Customer support debugging
- Development/staging environments

### Paid Users (10 calls/hour)

```python
response = ai_service.generate(
    user_id='paid_user_id',
    user_role='user',
    user_tier='paid',
    module='dream_self',
    prompt='How can I stay motivated?'
)
# ✅ Allowed if < 10 calls in last hour
# ❌ RateLimitError if >= 10 calls
```

### Free Users (10 calls/day - stricter)

```python
response = ai_service.generate(
    user_id='free_user_id',
    user_role='user',
    user_tier='free',
    module='triad',
    prompt='Generate tomorrow's tasks'
)
# ✅ Allowed if < 10 calls today
# ❌ RateLimitError if >= 10 calls
```

### Check Remaining Calls

```python
from app.services.ai import RateLimiter

limiter = RateLimiter(db)
info = limiter.get_user_remaining_calls(
    user_id='user_123',
    user_role='user',
    user_tier='free'
)

print(f"Remaining: {info['remaining']}/{info['limit']} calls")
print(f"Period: {info['period']}")  # 'hour' or 'day'
print(f"Resets at: {info['resets_at']}")
```

---

## Caching

AI responses are cached for 24 hours based on `input_hash` (SHA-256 of prompt + module + model).

```python
# First call - hits Bedrock (costs money)
response1 = ai_service.generate(
    user_id='user_123',
    module='triad',
    prompt='Generate tasks for goal: Learn Spanish'
)
print(response1.cached)  # False
print(response1.cost_usd)  # > 0

# Second call (same prompt within 24 hours) - cache hit
response2 = ai_service.generate(
    user_id='user_123',
    module='triad',
    prompt='Generate tasks for goal: Learn Spanish'
)
print(response2.cached)  # True
print(response2.cost_usd)  # 0.0 (free)
print(response2.provider)  # 'cache'
```

**Cache invalidation:**
- Automatic after 24 hours
- Per-user (user A's cache doesn't affect user B)
- Hash includes module and model (different modules don't share cache)

---

## AI Modules

The AI Service supports multiple AI modules with extensible templates:

### Available Modules

| Module | Purpose | Example Use Case |
|--------|---------|------------------|
| `onboarding` | Goal breakdown during onboarding | User enters "Run a marathon" → AI generates subtasks |
| `triad` | Daily task generation | Generate 3 most important tasks for tomorrow |
| `recap` | Daily reflection summary | Summarize user's progress today |
| `dream_self` | Dream Self chat responses | Answer user's motivational questions |
| `weekly_insights` | Weekly progress analysis | Identify patterns and suggest focus areas |

### Using Modules

```python
# Onboarding: Goal breakdown
response = ai_service.generate(
    user_id='user_123',
    module='onboarding',
    prompt=f'Break down goal: {user_goal}',
    goal_title=user_goal
)

# Triad: Tomorrow's tasks
response = ai_service.generate(
    user_id='user_123',
    module='triad',
    prompt='Generate 3 tasks for tomorrow based on goals and progress',
)

# Recap: Daily summary
response = ai_service.generate(
    user_id='user_123',
    module='recap',
    prompt=f'Summarize progress: {completed_tasks}',
    completed_count=len(completed_tasks),
    proof_count=num_proofs
)

# Dream Self: Chat
response = ai_service.generate(
    user_id='user_123',
    module='dream_self',
    prompt=user_message,
    topic='motivation'
)
```

---

## Extensible Deterministic Templates

When all paid providers fail OR budget is exceeded, the deterministic provider uses templates.

### Adding New Templates

Edit `weave-api/app/services/ai/templates.py`:

```python
# Add new module
TEMPLATES['new_module'] = {
    'default': """Your default template here.

Use {variable_name} for substitution.""",

    'variant1': """Alternative template for special cases.""",
}
```

### Template Variables

```python
# Use template variables
response = ai_service.generate(
    user_id='user_123',
    module='triad',
    variant='default',  # Optional variant
    task_1='Finish report',
    task_2='Gym session',
    task_3='Read 30 minutes'
)
# Variables {task_1}, {task_2}, {task_3} are substituted in template
```

### Listing Available Templates

```python
from app.services.ai.templates import list_modules, list_variants

# Get all modules
modules = list_modules()
print(modules)  # ['onboarding', 'triad', 'recap', 'dream_self', 'weekly_insights']

# Get variants for a module
variants = list_variants('triad')
print(variants)  # ['default', 'no_tasks', 'single_goal', 'maintenance']
```

---

## Model Selection

### Bedrock Models (Primary)

```python
# Default: Claude 3.5 Haiku (fast, cheap)
response = ai_service.generate(
    user_id='user_123',
    module='triad',
    prompt='Generate tasks',
    model='anthropic.claude-3-5-haiku-20241022-v1:0'  # Default
)

# Complex reasoning: Claude 3.7 Sonnet
response = ai_service.generate(
    user_id='user_123',
    module='onboarding',
    prompt='Break down complex goal',
    model='anthropic.claude-3-7-sonnet-20250219-v2:0'  # More expensive, better quality
)
```

### OpenAI Models (Fallback)

```python
# Default: GPT-4o-mini
response = ai_service.generate(
    user_id='user_123',
    module='recap',
    prompt='Summarize progress',
    model='gpt-4o-mini'  # Used if Bedrock fails
)

# Complex: GPT-4o
response = ai_service.generate(
    user_id='user_123',
    module='onboarding',
    prompt='Complex goal breakdown',
    model='gpt-4o'  # Higher quality, more expensive
)
```

### Anthropic Models (Fallback)

```python
# Default: Claude 3.7 Sonnet
response = ai_service.generate(
    user_id='user_123',
    module='dream_self',
    prompt='Motivational chat',
    model='claude-3-7-sonnet-20250219'  # Used if Bedrock + OpenAI fail
)
```

---

## Error Handling

### Rate Limit Errors

```python
from app.services.ai import RateLimitError

try:
    response = ai_service.generate(
        user_id='user_123',
        user_role='user',
        user_tier='free',
        module='triad',
        prompt='Generate tasks'
    )
except RateLimitError as e:
    print(f"Rate limit exceeded: {e.message}")
    print(f"User tier: {e.user_tier}")
    print(f"Limit: {e.limit}")
    print(f"Retry after: {e.retry_after}")
    # Return user-friendly error message
```

### Provider Failures (Handled Automatically)

```python
# No try/except needed - fallback chain handles failures automatically
response = ai_service.generate(
    user_id='user_123',
    module='triad',
    prompt='Generate tasks'
)
# If Bedrock fails → tries OpenAI
# If OpenAI fails → tries Anthropic
# If Anthropic fails → uses Deterministic (always succeeds)
```

---

## Monitoring & Analytics

### Cost Statistics

```python
# Get 7-day cost stats
stats = ai_service.cost_tracker.get_cost_stats(days=7)

print(f"Total cost (7 days): ${stats['total_cost']:.2f}")
print(f"Provider breakdown: {stats['provider_breakdown']}")
print(f"Model breakdown: {stats['model_breakdown']}")

# Example output:
# Total cost (7 days): $12.45
# Provider breakdown: {'bedrock': 10.20, 'openai': 1.80, 'anthropic': 0.45, 'deterministic': 0.0}
# Model breakdown: {'claude-3-5-haiku': 9.50, 'gpt-4o-mini': 1.80, 'claude-3-7-sonnet': 1.15}
```

### Service Statistics

```python
# Get overall service stats
stats = ai_service.get_stats()

print(f"Providers: {stats['providers']}")  # ['bedrock', 'openai', 'anthropic', 'deterministic']
print(f"Total daily cost: ${stats['total_daily_cost']:.2f}")
print(f"Daily budget: ${stats['daily_budget']:.2f}")
print(f"Cost stats: {stats['cost_stats']}")
```

---

## Database Schema

AI Service uses two tables:

### ai_runs

Logs all AI generation attempts (success and failure).

```sql
CREATE TABLE ai_runs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  module TEXT,  -- 'onboarding', 'triad', 'recap', etc.
  input_hash TEXT,  -- SHA-256 for caching
  provider TEXT,  -- 'bedrock', 'openai', 'anthropic', 'deterministic'
  model TEXT,
  status TEXT,  -- 'running', 'success', 'failed'
  input_tokens INT,
  output_tokens INT,
  cost_estimate DECIMAL(10, 6),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### ai_artifacts

Stores editable AI outputs.

```sql
CREATE TABLE ai_artifacts (
  id UUID PRIMARY KEY,
  run_id UUID REFERENCES ai_runs(id),
  user_id UUID REFERENCES user_profiles(id),
  type TEXT,  -- 'message', 'goal_tree', 'triad', etc.
  json JSONB,  -- Flexible storage for different artifact types
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Testing

### Run Unit Tests

```bash
cd weave-api
uv run pytest tests/test_ai_service.py -v
```

### Run Integration Tests (Requires API Keys)

```bash
# Set test credentials
export AWS_ACCESS_KEY_ID=AKIA...
export AWS_SECRET_ACCESS_KEY=...
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...

# Run integration tests
uv run pytest tests/integration/test_ai_service_integration.py -v
```

### Manual Testing

```bash
# Start backend
cd weave-api
uv run uvicorn app.main:app --reload

# Test with curl
curl -X POST http://localhost:8000/api/ai/generate \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "module": "triad",
    "prompt": "Generate 3 tasks for tomorrow"
  }'
```

---

## Troubleshooting

### Issue: "Bedrock provider not initialized"

**Cause:** AWS credentials not configured or Bedrock models not enabled

**Fix:**
1. Check `.env` has `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
2. Follow `docs/dev/aws-bedrock-setup.md` to enable model access
3. Test with: `uv run python -c "import boto3; boto3.client('bedrock-runtime', region_name='us-east-1')"`

### Issue: Rate limit errors for admin users

**Cause:** User role not set to 'admin'

**Fix:**
```python
# Ensure admin users have role='admin' in user_profiles table
response = ai_service.generate(
    user_id='admin_user_id',
    user_role='admin',  # Must be 'admin'
    ...
)
```

### Issue: Budget exceeded but cost is low

**Cause:** Test data in `ai_runs` table with high cost_estimate values

**Fix:**
```sql
-- Check today's cost
SELECT SUM(cost_estimate) FROM ai_runs WHERE DATE(created_at) = CURRENT_DATE;

-- Clear test data
DELETE FROM ai_runs WHERE cost_estimate > 10.0;  -- Remove unrealistic costs
```

### Issue: Cache not working

**Cause:** Prompt or module changed slightly

**Solution:** Cache is sensitive to exact prompt match. Use consistent formatting:
```python
# These are DIFFERENT cache entries:
prompt1 = "Generate tasks"
prompt2 = "generate tasks"  # Different case
prompt3 = "Generate tasks "  # Trailing space

# Normalize prompts before calling AI service:
prompt = user_input.strip().lower()
```

---

## Best Practices

### 1. Use Appropriate Models

- **Routine operations (90%):** Claude 3.5 Haiku (Bedrock) or GPT-4o-mini
- **Complex reasoning (10%):** Claude 3.7 Sonnet (Bedrock) or GPT-4o

### 2. Implement Graceful Degradation

```python
try:
    response = ai_service.generate(...)
except RateLimitError:
    # Show user-friendly message
    return {"message": "You've reached your daily AI limit. Try again tomorrow!"}
```

### 3. Monitor Costs Regularly

```python
# Weekly cost review
stats = ai_service.cost_tracker.get_cost_stats(days=7)
if stats['total_cost'] > 50.0:  # $50 in 7 days = $214/month
    logger.warning(f"High weekly cost: ${stats['total_cost']:.2f}")
```

### 4. Cache Aggressively

Design prompts to be cache-friendly:
```python
# BAD: Unique prompts (never cache hits)
prompt = f"Generate tasks at {datetime.now()}"

# GOOD: Consistent prompts (high cache hit rate)
prompt = f"Generate 3 tasks for tomorrow based on goal: {goal_title}"
```

### 5. Admin Role for Testing

Use admin role liberally in dev/staging to bypass rate limits:
```python
# Development
user_role = 'admin' if os.getenv('ENVIRONMENT') == 'development' else 'user'
```

---

## References

- [AWS Bedrock Setup Guide](./aws-bedrock-setup.md)
- [Story 0.6 Specification](../../stories/0-6-ai-service-abstraction.md)
- [OpenAI API Docs](https://platform.openai.com/docs/)
- [Anthropic API Docs](https://docs.anthropic.com/)
- [AWS Bedrock Docs](https://docs.aws.amazon.com/bedrock/)

---

**Guide Version:** 1.0.0
**Last Updated:** 2025-12-19
**Maintainer:** Weave AI Team

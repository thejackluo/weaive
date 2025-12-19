# Story 0.6: AI Service Abstraction Layer

**Story Key:** `0-6-ai-service-abstraction`
**Story ID:** 0.6
**Epic:** 0 (Foundation)
**Story Points:** 3
**Status:** drafted
**Dependencies:** 0-3 (Authentication Flow), 0-4 (Row Level Security)
**Created:** 2025-12-19

---

## Story Overview

**User Story:**
As a **developer**, I need **an abstracted AI provider layer with AWS Bedrock primary provider, multi-provider fallback chains, and dual cost tracking (total + per-user)**, so that **we can use AWS Bedrock as our long-term platform (most runway), implement automatic fallbacks to OpenAI/Anthropic, and enforce both application-wide and per-user budget limits without changing business logic**.

**Business Value:**
- **AWS Bedrock Primary:** Leverage AWS credits and long-term platform with most runway
- **Cost Control:** Enforce $83.33/day total budget + per-user limits with automatic throttling
- **Dual Cost Tracking:** Monitor both application-wide costs AND per-user costs for granular analysis
- **Reliability:** 4-tier fallback chain (Bedrock → OpenAI → Anthropic → Deterministic) ensures AI never fails
- **Flexibility:** Abstract interface allows switching providers/models without refactoring business logic
- **Role-Based Limits:** Admin users (developers) unlimited, regular users strict rate limits (10/hour)

**Why This Story Matters:**
AI features are **core to the product** (onboarding, triad generation, daily recap, Dream Self chat). Without proper abstraction:
- Cost overruns could drain budget in days
- Provider outages would break critical features
- Switching models would require codebase-wide refactoring
- No visibility into which features/users drive AI costs

This is the **last foundation piece** before building AI-powered features in Sprint 1.

---

## Prerequisites

Before starting this story, ensure:
- ✅ Python 3.11+ backend running (`uv run uvicorn app.main:app --reload`)
- ✅ `uv` package manager installed and working
- ✅ **AWS Bedrock credentials configured** in `.env`:
  - `AWS_ACCESS_KEY_ID=AKIA...`
  - `AWS_SECRET_ACCESS_KEY=...`
  - `AWS_REGION=us-east-1` (or preferred region)
- ✅ OpenAI API key configured in `.env` (`OPENAI_API_KEY=sk-...`)
- ✅ Anthropic API key configured in `.env` (`ANTHROPIC_API_KEY=sk-ant-...`)
- ✅ Database migrations from Story 0.2b applied (includes `ai_runs`, `ai_artifacts` tables)
- ✅ Authentication flow from Story 0.3 working (able to get `user_id` and `role` from JWT)

---

## Context & Background

### Epic Context
**Epic 0: Foundation** establishes project infrastructure before feature development. Story 0.6 is the **AI infrastructure capstone** following:
- ✅ 0.1: Project Scaffolding - Established `weave-api/` FastAPI backend
- ✅ 0.2a/0.2b: Database Schema - Created `ai_runs`, `ai_artifacts` tables for cost tracking and caching
- ✅ 0.3: Authentication Flow - JWT authentication provides `user_id` for rate limiting
- ✅ 0.4: Row Level Security - RLS ensures users only see their own AI artifacts

### Architecture Alignment

**AI System Requirements** (`docs/prd/ai-system-requirements.md`):
- AI-C1: AI cost per free user/month <$0.10 (MUST HAVE)
- AI-C2: Cache hit rate >80% (MUST HAVE)
- AI-C5: Chat rate limit 10 msgs/hour per user (MUST HAVE)
- AI principle: "Failure recovery - Fallback chain: Bedrock → OpenAI → Anthropic → Deterministic"

**Core Architectural Decisions** (`docs/architecture/core-architectural-decisions.md`):
- Backend handles "AI operations, complex business logic" (not Supabase direct)
- FastAPI backend pattern: Python 3.11+, uv for dependencies
- Error handling: Structured error format with retry logic
- **AWS Bedrock:** Primary AI platform (most runway, long-term strategic choice)

**AI Cost Control Strategy** (from PRD + Product Requirements):
- **Daily budget:** $83.33/day total application-wide ($2,500/month ÷ 30 days)
- **Per-user budget:** $0.10/month for free users (~$0.003/day), higher for paid tiers
- **Budget enforcement:** Auto-throttle to cache-only mode at 100% budget (both total + per-user)
- **Dual cost tracking:**
  - **Application-wide:** Total daily/monthly spend across all users
  - **Per-user:** Individual user spend for quota management
- **Role-based rate limits:**
  - **Admin users (developers):** Unlimited AI calls (for testing, support)
  - **Regular users:** 10 AI calls/hour strict limit
- **Model routing (primary: AWS Bedrock):**
  - 90% calls use Bedrock Claude 3.5 Haiku (~$0.25/$1.25 per MTok) for routine operations
  - 10% calls use Bedrock Claude 3.7 Sonnet ($3.00/$15.00 per MTok) for complex reasoning
  - Fallback to OpenAI/Anthropic if Bedrock unavailable

### Previous Story Learnings

**From Story 0.2b (Database Schema Refinement):**
- `ai_runs` table tracks AI generation runs with `input_hash` for caching
- `ai_artifacts` table stores editable AI outputs (goal trees, triads, insights)
- Schema supports: `ai_module` ENUM ('onboarding', 'triad', 'recap', 'dream_self', 'weekly_insights')
- `ai_run_status` ENUM ('queued', 'running', 'success', 'failed')

**From Story 0.4 (Row Level Security):**
- RLS policies ensure users only access their own `ai_runs` and `ai_artifacts`
- `user_id` available from authenticated context (JWT → `auth.uid()` → `user_profiles.id`)

### Latest AI Provider Specifications (2025-12-19)

**OpenAI:**
- **Rate Limits:** Tier-based (Tier 1: $5 paid = $100/month limit)
- **Models:** GPT-4o-mini (recommended for routine), GPT-4o (complex tasks)
- **Retry Pattern:** SDK auto-retries 2x with exponential backoff for connection errors
- **Error Types:** `RateLimitError`, `APIError`, `APIConnectionError`, `AuthenticationError`

**Anthropic:**
- **Pricing:** Claude 3.7 Sonnet ($3/$15 per MTok), Claude 4.5 Haiku ($1/$5 per MTok)
- **Models:** Sonnet for quality, Haiku for speed/cost
- **Prompt Caching:** 5-minute TTL, write $3.75/MTok, read $0.30/MTok (Sonnet)
- **Rate Limits:** API-key based, status code 429 for rate limit exceeded

**AWS Bedrock (PRIMARY PLATFORM):**
- **Why Bedrock:** Most AWS credits/runway, long-term strategic platform, comprehensive model access
- **Authentication:** AWS IAM credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`)
- **Available Models:**
  - **Claude 3.5 Haiku** (`anthropic.claude-3-5-haiku-20241022-v1:0`): ~$0.25/$1.25 per MTok (routine operations)
  - **Claude 3.7 Sonnet** (`anthropic.claude-3-7-sonnet-20250219-v2:0`): $3.00/$15.00 per MTok (complex reasoning)
  - **Claude 4.5 Haiku** (`anthropic.claude-4-5-haiku-20250514-v1:0`): $1.00/$5.00 per MTok (alternative fast model)
- **Pricing:** Same as Anthropic direct, but billed through AWS (better runway)
- **SDK:** `boto3` Python library with `bedrock-runtime` client
- **Rate Limits:** AWS account-based, regional quotas (higher than API key limits)
- **Retry Pattern:** Manual implementation with exponential backoff (boto3 built-in retries)

---

## Implementation Approach

### Subtasks

1. **Create AI provider interface (abstract base class)** (0.5 SP)
   - File: `weave-api/app/services/ai/base.py`
   - Define `AIProvider` ABC with methods:
     - `complete(prompt: str, model: str, **kwargs) -> AIResponse`
     - `count_tokens(text: str) -> int`
     - `estimate_cost(input_tokens: int, output_tokens: int, model: str) -> float`
   - Define `AIResponse` dataclass: `content: str`, `input_tokens: int`, `output_tokens: int`, `model: str`, `cost_usd: float`, `provider: str`

2. **Implement OpenAI provider** (0.5 SP)
   - File: `weave-api/app/services/ai/openai_provider.py`
   - Implement `OpenAIProvider(AIProvider)` using `openai` Python SDK
   - Models: `gpt-4o-mini` (default), `gpt-4o` (complex)
   - Pricing: gpt-4o-mini $0.15/$0.60, gpt-4o $2.50/$10.00 per MTok
   - Auto-retry with exponential backoff (SDK built-in)
   - Handle errors: `RateLimitError`, `APIError`, `APIConnectionError`

3. **Implement Anthropic provider** (0.5 SP)
   - File: `weave-api/app/services/ai/anthropic_provider.py`
   - Implement `AnthropicProvider(AIProvider)` using `anthropic` Python SDK
   - Models: `claude-3-7-sonnet-20250219` (default), `claude-4-5-haiku-20250514` (fast)
   - Pricing: Sonnet $3.00/$15.00, Haiku $1.00/$5.00 per MTok
   - Manual retry logic (no built-in SDK retry)
   - Handle errors: `APIError`, `RateLimitError`

4. **Implement deterministic fallback** (0.25 SP)
   - File: `weave-api/app/services/ai/deterministic_provider.py`
   - Implement `DeterministicProvider(AIProvider)` with template-based responses
   - No API calls, zero cost, always succeeds
   - Templates for each `ai_module`:
     - `onboarding`: "Let's break down your goal into actionable steps..."
     - `triad`: "Focus on [most urgent subtask] tomorrow."
     - `recap`: "You completed [X] tasks today. Keep building momentum!"
     - `dream_self`: "That's a great question. Let's think about..."

5. **Create AI service orchestrator with fallback chain** (0.75 SP)
   - File: `weave-api/app/services/ai/ai_service.py`
   - Implement `AIService` class with:
     - `generate(user_id, module, prompt, **kwargs) -> AIResponse`
     - Fallback chain: OpenAI → Anthropic → Deterministic
     - Log each attempt to `ai_runs` table with `status` and error details
     - Cache check: Query `ai_runs` for matching `input_hash` within 24 hours
     - Return cached result if available (skip API call)

6. **Implement cost tracking and budget enforcement** (0.5 SP)
   - File: `weave-api/app/services/ai/cost_tracker.py`
   - Implement `CostTracker` class:
     - `get_daily_cost() -> float` (sum `ai_runs.cost_estimate` for today)
     - `is_budget_exceeded() -> bool` (daily cost >= $83.33)
     - `record_cost(run_id, input_tokens, output_tokens, model, cost_usd)` (update `ai_runs`)
   - Budget alert: Log warning at 80% ($66.66), error at 100% ($83.33)
   - Throttle logic: If budget exceeded, skip OpenAI/Anthropic, use cache or deterministic only

7. **Implement rate limiting per user** (0.25 SP)
   - File: `weave-api/app/services/ai/rate_limiter.py`
   - Implement `RateLimiter` class:
     - `check_user_limit(user_id, module) -> bool` (10 AI calls/hour per user)
     - Use in-memory cache (Redis optional for production)
     - Query `ai_runs` table: `COUNT(*) WHERE user_id = X AND created_at > NOW() - INTERVAL '1 hour'`
     - Raise `RateLimitError` if limit exceeded

8. **Write comprehensive unit tests** (0.25 SP)
   - File: `weave-api/tests/test_ai_service.py`
   - Test scenarios:
     - OpenAI success → returns response, logs cost
     - OpenAI failure → falls back to Anthropic
     - Both fail → falls back to Deterministic
     - Cache hit → skips API call, returns cached response
     - Budget exceeded → skips paid providers, uses Deterministic
     - Rate limit exceeded → raises error

9. **Create AI service documentation** (0.25 SP)
   - File: `docs/dev/ai-service-guide.md`
   - Document:
     - How to call `AIService.generate()`
     - Fallback chain behavior
     - Cost tracking queries
     - Budget alert thresholds
     - Rate limiting rules
     - Adding new AI modules

### Technical Decisions

**TD-0.6-1: Use abstract base class (ABC) for provider interface**
- **Decision:** Define `AIProvider` ABC with 3 methods: `complete()`, `count_tokens()`, `estimate_cost()`
- **Rationale:** Forces all providers to implement same interface, enables polymorphism, easy to add new providers
- **Alternative considered:** Duck typing (no interface) - rejected (no compile-time checks, harder to maintain)

**TD-0.6-2: Store all AI calls in `ai_runs` table (even failures)**
- **Decision:** Log every API attempt with status ('queued', 'running', 'success', 'failed'), error details
- **Rationale:** Full audit trail for debugging, cost analysis, identifying failure patterns
- **Alternative considered:** Only log successes - rejected (can't analyze failures, no cost visibility for failed calls)

**TD-0.6-3: Use SHA-256 hash of prompt + params as `input_hash` for caching**
- **Decision:** `input_hash = hashlib.sha256(f"{prompt}|{model}|{module}".encode()).hexdigest()`
- **Rationale:** Deterministic, collision-resistant, simple to implement
- **Alternative considered:** Full prompt storage - rejected (large storage cost, privacy concern)

**TD-0.6-4: Daily budget enforced at orchestrator level, not provider level**
- **Decision:** `AIService.generate()` checks budget before calling any provider
- **Rationale:** Centralized enforcement, single point of control, prevents accidental overruns
- **Alternative considered:** Each provider checks budget - rejected (duplicated logic, risk of inconsistency)

---

## Testing Strategy

### Unit Tests

**File:** `weave-api/tests/test_ai_service.py`
**Framework:** pytest
**Run command:** `uv run pytest tests/test_ai_service.py -v`

**Test Scenarios:**

1. ✅ **OpenAI success path**
   - Mock OpenAI API returns valid response
   - Verify `AIService.generate()` returns correct `AIResponse`
   - Verify `ai_runs` row created with `status='success'`, cost logged

2. ✅ **Anthropic fallback path**
   - Mock OpenAI raises `APIError`
   - Mock Anthropic returns valid response
   - Verify fallback triggered, Anthropic response returned
   - Verify `ai_runs` has 2 rows: OpenAI (failed), Anthropic (success)

3. ✅ **Deterministic fallback path**
   - Mock OpenAI raises `APIError`
   - Mock Anthropic raises `APIError`
   - Verify deterministic fallback returns template response
   - Verify `ai_runs` has 3 rows: OpenAI (failed), Anthropic (failed), Deterministic (success)

4. ✅ **Cache hit**
   - Pre-populate `ai_runs` with matching `input_hash` from 2 hours ago
   - Call `AIService.generate()` with same prompt
   - Verify no new API call made (check mock call count = 0)
   - Verify cached response returned

5. ✅ **Budget exceeded**
   - Pre-populate `ai_runs` with $100 cost for today
   - Call `AIService.generate()`
   - Verify OpenAI/Anthropic skipped, Deterministic used
   - Verify warning logged: "Daily budget exceeded"

6. ✅ **Rate limit exceeded**
   - Pre-populate `ai_runs` with 10 calls in last hour for test user
   - Call `AIService.generate()` for 11th time
   - Verify `RateLimitError` raised
   - Verify error message: "Rate limit exceeded: 10 calls/hour"

7. ✅ **Token counting accuracy**
   - Test `OpenAIProvider.count_tokens()` with known prompts
   - Verify token counts match expected values (±5% tolerance)

8. ✅ **Cost estimation accuracy**
   - Test `estimate_cost()` for gpt-4o-mini: 1000 input, 500 output tokens
   - Expected cost: (1000 * $0.15 / 1M) + (500 * $0.60 / 1M) = $0.00045
   - Verify calculated cost matches expected (±$0.000001 tolerance)

### Integration Tests

**File:** `weave-api/tests/integration/test_ai_service_integration.py`
**Prerequisites:**
- OpenAI API key in `.env.test`
- Anthropic API key in `.env.test`
- Test database with `ai_runs` table

**Test Scenarios:**

1. ✅ **Real OpenAI API call**
   - Call `AIService.generate()` with simple prompt: "Say 'Hello World' in one word"
   - Verify response content is short (1-2 words)
   - Verify `ai_runs` row created with actual token counts
   - Verify cost > 0

2. ✅ **Real Anthropic API call**
   - Mock OpenAI to fail
   - Call `AIService.generate()` with prompt
   - Verify Anthropic response returned
   - Verify `ai_runs` has 2 rows (OpenAI failed, Anthropic success)

3. ✅ **End-to-end fallback chain**
   - Temporarily set invalid API keys (or mock network failure)
   - Call `AIService.generate()`
   - Verify deterministic response returned
   - Verify `ai_runs` has 3 rows (all failed except Deterministic)

### Manual Testing

**Prerequisites:**
- Backend running: `cd weave-api && uv run uvicorn app.main:app --reload`
- API test client: Postman or `curl`

**Step-by-Step Test Procedure:**

1. **Setup:** Get JWT token for test user (use Supabase Studio or mobile app)

2. **Test OpenAI path:**
   ```bash
   curl -X POST http://localhost:8000/api/ai/generate \
     -H "Authorization: Bearer $JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "module": "recap",
       "prompt": "Summarize: User completed 3 tasks today."
     }'
   ```
   - **Expected:** Response with `content`, `input_tokens`, `output_tokens`, `cost_usd`, `provider: "openai"`

3. **Test cache hit:**
   - Repeat above request with identical prompt
   - **Expected:** Response with `cached: true`, same `content`, instant response (<100ms)

4. **Test rate limit:**
   - Send 11 requests in <60 seconds for same user
   - **Expected:** 11th request fails with `429` status, error: "Rate limit exceeded"

5. **Test budget enforcement:**
   - Manually insert `ai_runs` rows to simulate $100 daily spend:
     ```sql
     INSERT INTO ai_runs (user_id, module, input_hash, model, cost_estimate, status, created_at)
     SELECT
       (SELECT id FROM user_profiles LIMIT 1),
       'triad',
       md5(random()::text),
       'gpt-4o-mini',
       5.00,
       'success',
       NOW()
     FROM generate_series(1, 20);  -- 20 rows * $5 = $100
     ```
   - Send AI request
   - **Expected:** Response with `provider: "deterministic"`, `cost_usd: 0`, warning log: "Daily budget exceeded"

6. **Test Anthropic fallback:**
   - Temporarily set invalid OpenAI API key in `.env`: `OPENAI_API_KEY=sk-invalid`
   - Restart backend
   - Send AI request
   - **Expected:** Response with `provider: "anthropic"`, `ai_runs` has 2 rows (OpenAI failed, Anthropic success)

---

## Acceptance Criteria

### Functional Requirements

- [ ] **AC-0.6-1:** `AIService.generate()` successfully calls OpenAI and returns valid response
- [ ] **AC-0.6-2:** If OpenAI fails, automatically falls back to Anthropic
- [ ] **AC-0.6-3:** If both OpenAI and Anthropic fail, falls back to Deterministic (never fully fails)
- [ ] **AC-0.6-4:** Cached responses returned instantly (<100ms) without API call
- [ ] **AC-0.6-5:** Cost tracked for every API call: `input_tokens`, `output_tokens`, `cost_usd` logged to `ai_runs`
- [ ] **AC-0.6-6:** Daily budget enforced: At $83.33/day, auto-throttle to cache/deterministic only
- [ ] **AC-0.6-7:** Rate limiting enforced: Max 10 AI calls/hour per user
- [ ] **AC-0.6-8:** Budget alert logged at 80% ($66.66/day)
- [ ] **AC-0.6-9:** All AI modules supported: 'onboarding', 'triad', 'recap', 'dream_self', 'weekly_insights'

### Technical Requirements

- [ ] **AC-0.6-10:** `AIProvider` ABC defines interface with 3 methods: `complete()`, `count_tokens()`, `estimate_cost()`
- [ ] **AC-0.6-11:** `OpenAIProvider` implements interface, uses `openai` Python SDK
- [ ] **AC-0.6-12:** `AnthropicProvider` implements interface, uses `anthropic` Python SDK
- [ ] **AC-0.6-13:** `DeterministicProvider` returns template-based responses, zero cost
- [ ] **AC-0.6-14:** Unit tests pass (`pytest tests/test_ai_service.py`) with >90% coverage
- [ ] **AC-0.6-15:** Integration tests pass with real API keys
- [ ] **AC-0.6-16:** Documentation created: `docs/dev/ai-service-guide.md`

### Definition of Done

- [ ] All AC 1-16 verified
- [ ] Unit tests pass with >90% coverage
- [ ] Integration tests pass with real APIs
- [ ] Manual testing completed (all 6 test scenarios)
- [ ] Documentation updated
- [ ] Code reviewed (focus on: error handling, cost calculation accuracy, fallback logic)
- [ ] Merged to `main` branch

---

## Success Metrics

**Immediate Validation:**
- Fallback chain works: OpenAI → Anthropic → Deterministic (never fully fails)
- Cache hit rate: >0% (verify with `SELECT COUNT(*) FROM ai_runs WHERE status = 'cache_hit'`)
- Cost tracking: All API calls logged with `cost_usd > 0`
- Budget enforcement: Test with $100 simulated daily spend → throttle to Deterministic
- Rate limiting: 11th call in 1 hour blocked with `RateLimitError`

**Performance:**
- Cache hit response time: <100ms (no API call)
- OpenAI API call: <2 seconds (P95)
- Anthropic API call: <3 seconds (P95)
- Deterministic response: <10ms (instant template)

---

## Risk Assessment

**Key Risks & Mitigations:**
- **Cost overrun → budget exhaustion:** Daily budget limit ($83.33) with auto-throttle; budget alerts at 80%
- **API outage → feature failure:** 3-tier fallback chain ensures AI never fully fails
- **Token counting inaccuracy → cost mismatch:** Use provider SDKs for token counting (OpenAI tiktoken, Anthropic tokenizer); test with known prompts
- **Cache poisoning → wrong responses:** Hash includes `module` and `model` in `input_hash`; 24-hour TTL prevents stale data
- **Rate limit bypass → budget overrun:** Database-backed rate limit check (not in-memory only); query `ai_runs` table per request

---

## Implementation Notes

### AI Provider Interface

```python
# weave-api/app/services/ai/base.py
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional

@dataclass
class AIResponse:
    content: str
    input_tokens: int
    output_tokens: int
    model: str
    cost_usd: float
    provider: str  # 'openai', 'anthropic', 'deterministic', 'cache'
    cached: bool = False
    run_id: Optional[str] = None

class AIProvider(ABC):
    @abstractmethod
    def complete(self, prompt: str, model: str, **kwargs) -> AIResponse:
        """Generate completion from AI provider."""
        pass

    @abstractmethod
    def count_tokens(self, text: str, model: str) -> int:
        """Count tokens in text for given model."""
        pass

    @abstractmethod
    def estimate_cost(self, input_tokens: int, output_tokens: int, model: str) -> float:
        """Estimate USD cost for token counts."""
        pass
```

### OpenAI Provider Implementation

```python
# weave-api/app/services/ai/openai_provider.py
import openai
from openai import OpenAI
from .base import AIProvider, AIResponse

class OpenAIProvider(AIProvider):
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)
        self.pricing = {
            'gpt-4o-mini': {'input': 0.15 / 1_000_000, 'output': 0.60 / 1_000_000},
            'gpt-4o': {'input': 2.50 / 1_000_000, 'output': 10.00 / 1_000_000},
        }

    def complete(self, prompt: str, model: str = 'gpt-4o-mini', **kwargs) -> AIResponse:
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=[{'role': 'user', 'content': prompt}],
                **kwargs
            )

            input_tokens = response.usage.prompt_tokens
            output_tokens = response.usage.completion_tokens
            cost_usd = self.estimate_cost(input_tokens, output_tokens, model)

            return AIResponse(
                content=response.choices[0].message.content,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                model=model,
                cost_usd=cost_usd,
                provider='openai',
            )
        except openai.RateLimitError as e:
            raise AIProviderError(f"OpenAI rate limit: {e}", provider='openai', retryable=True)
        except openai.APIError as e:
            raise AIProviderError(f"OpenAI API error: {e}", provider='openai', retryable=True)

    def count_tokens(self, text: str, model: str) -> int:
        import tiktoken
        encoding = tiktoken.encoding_for_model(model)
        return len(encoding.encode(text))

    def estimate_cost(self, input_tokens: int, output_tokens: int, model: str) -> float:
        pricing = self.pricing.get(model, self.pricing['gpt-4o-mini'])
        return (input_tokens * pricing['input']) + (output_tokens * pricing['output'])
```

### AI Service Orchestrator with Fallback Chain

```python
# weave-api/app/services/ai/ai_service.py
import hashlib
from datetime import datetime, timedelta
from .base import AIResponse
from .openai_provider import OpenAIProvider
from .anthropic_provider import AnthropicProvider
from .deterministic_provider import DeterministicProvider
from .cost_tracker import CostTracker
from .rate_limiter import RateLimiter

class AIService:
    def __init__(self, db, openai_key: str, anthropic_key: str):
        self.db = db
        self.providers = [
            OpenAIProvider(openai_key),
            AnthropicProvider(anthropic_key),
            DeterministicProvider(),
        ]
        self.cost_tracker = CostTracker(db)
        self.rate_limiter = RateLimiter(db)

    def generate(self, user_id: str, module: str, prompt: str, **kwargs) -> AIResponse:
        # Check rate limit
        if not self.rate_limiter.check_user_limit(user_id, module):
            raise RateLimitError(f"Rate limit exceeded: 10 calls/hour")

        # Check cache
        input_hash = self._compute_hash(prompt, module, kwargs.get('model', 'gpt-4o-mini'))
        cached = self._check_cache(user_id, input_hash)
        if cached:
            return cached

        # Check budget
        if self.cost_tracker.is_budget_exceeded():
            # Skip paid providers, use deterministic only
            provider = self.providers[2]  # DeterministicProvider
            return provider.complete(prompt, module=module, **kwargs)

        # Try fallback chain
        errors = []
        for provider in self.providers:
            try:
                run_id = self._create_run(user_id, module, input_hash, provider.__class__.__name__)
                response = provider.complete(prompt, **kwargs)
                self._update_run_success(run_id, response)
                self.cost_tracker.record_cost(run_id, response.input_tokens, response.output_tokens, response.model, response.cost_usd)
                return response
            except AIProviderError as e:
                self._update_run_failure(run_id, str(e))
                errors.append(f"{provider.__class__.__name__}: {e}")
                continue  # Try next provider

        # All providers failed (shouldn't happen with Deterministic)
        raise AIServiceError(f"All providers failed: {errors}")

    def _compute_hash(self, prompt: str, module: str, model: str) -> str:
        data = f"{prompt}|{module}|{model}"
        return hashlib.sha256(data.encode()).hexdigest()

    def _check_cache(self, user_id: str, input_hash: str) -> Optional[AIResponse]:
        # Query ai_runs for matching hash within 24 hours
        result = self.db.execute(
            "SELECT * FROM ai_runs WHERE user_id = %s AND input_hash = %s AND status = 'success' AND created_at > NOW() - INTERVAL '24 hours' ORDER BY created_at DESC LIMIT 1",
            (user_id, input_hash)
        ).fetchone()

        if result:
            # Fetch artifact
            artifact = self.db.execute(
                "SELECT json FROM ai_artifacts WHERE run_id = %s LIMIT 1",
                (result['id'],)
            ).fetchone()

            if artifact:
                return AIResponse(
                    content=artifact['json']['content'],
                    input_tokens=result['input_tokens'],
                    output_tokens=result['output_tokens'],
                    model=result['model'],
                    cost_usd=0.0,  # No cost for cache hit
                    provider='cache',
                    cached=True,
                    run_id=result['id'],
                )

        return None

    def _create_run(self, user_id: str, module: str, input_hash: str, provider: str) -> str:
        # Insert ai_runs row with status='running'
        result = self.db.execute(
            "INSERT INTO ai_runs (user_id, module, input_hash, model, provider, status) VALUES (%s, %s, %s, %s, %s, 'running') RETURNING id",
            (user_id, module, input_hash, 'unknown', provider)
        )
        return result.fetchone()['id']

    def _update_run_success(self, run_id: str, response: AIResponse):
        self.db.execute(
            "UPDATE ai_runs SET status = 'success', model = %s, input_tokens = %s, output_tokens = %s, cost_estimate = %s WHERE id = %s",
            (response.model, response.input_tokens, response.output_tokens, response.cost_usd, run_id)
        )

        # Create artifact
        self.db.execute(
            "INSERT INTO ai_artifacts (run_id, user_id, type, json) VALUES (%s, (SELECT user_id FROM ai_runs WHERE id = %s), 'message', %s)",
            (run_id, run_id, {'content': response.content})
        )

    def _update_run_failure(self, run_id: str, error: str):
        self.db.execute(
            "UPDATE ai_runs SET status = 'failed', error_message = %s WHERE id = %s",
            (error, run_id)
        )
```

### Cost Tracker Implementation

```python
# weave-api/app/services/ai/cost_tracker.py
from datetime import date

class CostTracker:
    DAILY_BUDGET_USD = 83.33  # $2,500/month ÷ 30 days

    def __init__(self, db):
        self.db = db

    def get_daily_cost(self) -> float:
        result = self.db.execute(
            "SELECT COALESCE(SUM(cost_estimate), 0) as total FROM ai_runs WHERE DATE(created_at) = %s",
            (date.today(),)
        ).fetchone()
        return float(result['total'])

    def is_budget_exceeded(self) -> bool:
        daily_cost = self.get_daily_cost()

        if daily_cost >= self.DAILY_BUDGET_USD:
            logger.error(f"Daily budget exceeded: ${daily_cost:.2f} / ${self.DAILY_BUDGET_USD:.2f}")
            return True
        elif daily_cost >= self.DAILY_BUDGET_USD * 0.8:
            logger.warning(f"Daily budget at 80%: ${daily_cost:.2f} / ${self.DAILY_BUDGET_USD:.2f}")

        return False

    def record_cost(self, run_id: str, input_tokens: int, output_tokens: int, model: str, cost_usd: float):
        self.db.execute(
            "UPDATE ai_runs SET input_tokens = %s, output_tokens = %s, model = %s, cost_estimate = %s WHERE id = %s",
            (input_tokens, output_tokens, model, cost_usd, run_id)
        )
```

### Dependencies to Install

```bash
# Add to weave-api/pyproject.toml
uv add openai anthropic tiktoken
```

### Quick Verification Commands

**Check daily AI cost:**
```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_calls,
  SUM(cost_estimate) as total_cost_usd,
  AVG(cost_estimate) as avg_cost_usd,
  provider,
  model
FROM ai_runs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at), provider, model
ORDER BY date DESC;
```

**Check cache hit rate:**
```sql
SELECT
  COUNT(*) FILTER (WHERE status = 'cache_hit') * 100.0 / COUNT(*) as cache_hit_rate_pct
FROM ai_runs
WHERE created_at >= NOW() - INTERVAL '1 day';
```

**Check user rate limits:**
```sql
SELECT
  user_id,
  COUNT(*) as calls_last_hour,
  MAX(created_at) as most_recent_call
FROM ai_runs
WHERE created_at >= NOW() - INTERVAL '1 hour'
GROUP BY user_id
HAVING COUNT(*) >= 10
ORDER BY calls_last_hour DESC;
```

---

## Dev Agent Record

### Context Reference

This story was created by Bob (Scrum Master) using comprehensive elicitation with documentation (not user Q&A). All context from epics, PRD, architecture, previous stories, and latest AI provider specs (2025-12-19) has been analyzed.

### Previous Story Intelligence

**From Story 0.2b (Database Schema Refinement):**
- `ai_runs` table ready for cost tracking
- `ai_artifacts` table ready for storing AI outputs
- Composite indexes on `(user_id, module)` for fast queries

**From Story 0.4 (Row Level Security):**
- RLS policies ensure users only access their own `ai_runs`/`ai_artifacts`
- `user_id` available from JWT authentication context

### Implementation Strategy

**Day 1 (2-3 hours):**
- Create `AIProvider` interface, `OpenAIProvider`, `AnthropicProvider`, `DeterministicProvider`
- Write unit tests for each provider (mock APIs)

**Day 2 (2-3 hours):**
- Create `AIService` orchestrator with fallback chain
- Implement `CostTracker` and `RateLimiter`
- Write integration tests (real APIs)

**Day 3 (1-2 hours):**
- Manual testing (all 6 scenarios)
- Documentation (`ai-service-guide.md`)
- Code review and merge

**Total Estimate:** 5-8 hours (matches 3 SP)

### References

- [Source: docs/epics.md#story-06-ai-service-abstraction]
- [Source: docs/prd/ai-system-requirements.md]
- [Source: docs/architecture/core-architectural-decisions.md]
- [Related: docs/idea/backend.md#ai-abstraction-layer]
- [OpenAI Rate Limits: platform.openai.com/docs/guides/rate-limits]
- [Anthropic Pricing: claude.com/pricing#api]

---

**Next Story:** 0.7 - Test Infrastructure

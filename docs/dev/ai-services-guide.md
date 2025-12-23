# AI Services Guide

**Purpose:** Comprehensive guide for implementing AI features across text, image, audio, and AI module orchestration.

**Created:** 2025-12-22 (Story 1.5.3)

---

## Table of Contents

1. [Provider Abstraction](#provider-abstraction)
2. [Text AI Patterns](#text-ai-patterns)
3. [Image AI Patterns](#image-ai-patterns)
4. [Audio AI Patterns](#audio-ai-patterns)
5. [Cost Tracking](#cost-tracking)
6. [Rate Limiting](#rate-limiting)
7. [Frontend Hooks](#frontend-hooks)
8. [AI Module Abstraction](#ai-module-abstraction)
9. [AI Orchestrator](#ai-orchestrator)
10. [Context Builder](#context-builder)
11. [Implementing New AI Modules](#implementing-new-ai-modules)

---

## Provider Abstraction

### AIProviderBase Abstract Class

All AI providers inherit from `AIProviderBase` to ensure consistent patterns:

```python
# weave-api/app/services/ai_provider_base.py
from abc import ABC, abstractmethod
from typing import Dict, Any
from datetime import datetime

class AIProviderBase(ABC):
    """Base class for all AI providers (OpenAI, Anthropic, Gemini, AssemblyAI)"""

    @abstractmethod
    async def call_ai(self, input: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute AI call with input and context"""
        pass

    @abstractmethod
    def estimate_cost(self, input: Dict[str, Any]) -> float:
        """Estimate cost in USD before calling"""
        pass

    @abstractmethod
    def get_provider_name(self) -> str:
        """Return provider identifier (e.g., 'openai-gpt4o-mini')"""
        pass

    async def log_to_ai_runs(
        self,
        user_id: str,
        operation_type: str,
        input_tokens: int,
        output_tokens: int,
        cost_usd: float,
        duration_ms: int
    ):
        """Log AI call to ai_runs table for cost tracking"""
        # Insert into ai_runs table
        pass

    async def check_rate_limit(self, user_id: str, operation_type: str) -> bool:
        """Check if user has exceeded rate limit"""
        # Query daily_aggregates table
        pass
```

### Fallback Chain Pattern

All AI operations use primary → secondary → graceful degradation:

```python
async def execute_with_fallback(operation):
    try:
        # Try primary provider
        return await primary_provider.call_ai(...)
    except ProviderError as e:
        logger.warning(f"Primary provider failed: {e}")
        try:
            # Try secondary provider
            return await secondary_provider.call_ai(...)
        except ProviderError as e:
            logger.error(f"Secondary provider failed: {e}")
            # Graceful degradation
            return get_cached_or_default_response()
```

---

## Text AI Patterns

### Provider Selection

| Use Case | Primary Provider | Fallback | Cost |
|----------|------------------|----------|------|
| **Routine Generation** (Triad, Journal recap) | GPT-4o-mini | Claude 3.7 Sonnet | $0.15/$0.60 per MTok |
| **Complex Reasoning** (Onboarding, Dream Self) | Claude 3.7 Sonnet | GPT-4o | $3.00/$15.00 per MTok |

### Text AI Request Format

```python
# Standard text AI request
request = {
    "messages": [
        {"role": "system", "content": "You are a coaching AI..."},
        {"role": "user", "content": "Help me plan my day"}
    ],
    "context": {
        "user_id": "uuid",
        "operation_type": "generate_triad",
        "identity": {...},
        "goals": [...],
        "history": [...]
    }
}
```

### Text AI Response Format

```python
{
    "text": "Here are your 3 tasks for tomorrow...",
    "provider": "gpt-4o-mini",
    "tokens_used": {
        "input": 1200,
        "output": 350
    },
    "cost_usd": 0.0035,
    "duration_ms": 1850
}
```

---

## Image AI Patterns

### Provider Selection

| Use Case | Primary Provider | Fallback | Cost |
|----------|------------------|----------|------|
| **Proof Validation** | Gemini 3.0 Flash | GPT-4o Vision | ~$0.0005-$0.02 per image |
| **OCR** | Gemini 3.0 Flash | GPT-4o Vision | ~$0.0005-$0.02 per image |
| **Image Classification** | Gemini 3.0 Flash | GPT-4o Vision | ~$0.0005-$0.02 per image |

### Image AI Request Format

```python
{
    "image_url": "https://storage.supabase.co/...",
    "prompt": "Validate this as proof of gym workout completion",
    "operations": ["proof_validation", "ocr", "classification"]
}
```

### Image AI Response Format

```python
{
    "proof_validated": True,
    "extracted_text": "Gold's Gym - Check-in 8:30am",
    "categories": ["gym", "fitness", "indoor"],
    "quality_score": 8,
    "provider": "gemini-3-flash",
    "cost_usd": 0.0005
}
```

---

## Audio AI Patterns

### Provider Selection

| Use Case | Primary Provider | Fallback | Cost |
|----------|------------------|----------|------|
| **Voice Transcription** | AssemblyAI | OpenAI Whisper | $0.15/hr vs $0.36/hr |

### Audio AI Request Format

```python
{
    "audio_file": bytes,
    "format": "m4a",
    "language": "en",
    "duration_sec": 45.2
}
```

### Audio AI Response Format

```python
{
    "transcript": "Today I completed my workout...",
    "confidence": 0.94,
    "duration_sec": 45.2,
    "provider": "assemblyai",
    "cost_usd": 0.0019
}
```

---

## Cost Tracking

### Unified Cost Logging

**ALL AI calls must log to `ai_runs` table:**

```python
# After any AI call
await provider.log_to_ai_runs(
    user_id=user_id,
    operation_type="text_generation",  # or "image_analysis", "transcription"
    input_tokens=1200,
    output_tokens=350,
    model="gpt-4o-mini",
    cost_usd=0.0035,
    duration_ms=1850
)
```

### Cost Calculation

```python
# Per-provider pricing
PROVIDER_COSTS = {
    "gpt-4o-mini": {"input": 0.15, "output": 0.60},  # per MTok
    "claude-3-7-sonnet": {"input": 3.00, "output": 15.00},  # per MTok
    "gemini-3-flash": {"image": 0.0005},  # per image
    "assemblyai": {"audio": 0.15}  # per hour
}

def calculate_cost(provider: str, input: int, output: int) -> float:
    """Calculate cost in USD"""
    costs = PROVIDER_COSTS[provider]
    return (input * costs["input"] + output * costs["output"]) / 1_000_000
```

---

## Rate Limiting

### Rate Limit Configuration

| Operation Type | Limit | Window | Storage |
|----------------|-------|--------|---------|
| **Text AI** | 10 calls | 1 hour | `daily_aggregates.ai_text_count` |
| **Image AI** | 5 analyses | 24 hours | `daily_aggregates.ai_vision_count` |
| **Audio AI** | 50 transcriptions | 24 hours | `daily_aggregates.transcription_count` |

### Rate Limit Check

```python
async def check_rate_limit(user_id: str, operation_type: str):
    """Check if user has exceeded rate limit"""

    # Query today's aggregates
    aggregate = await db.execute(
        select(DailyAggregate)
        .where(DailyAggregate.user_id == user_id)
        .where(DailyAggregate.local_date == today)
    )

    # Check limits
    if operation_type == "text_generation" and aggregate.ai_text_count >= 10:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "RATE_LIMIT_EXCEEDED",
                "message": "Hourly AI chat limit reached (10/10)",
                "retryAfter": seconds_until_next_hour
            }
        )
```

---

## Frontend Hooks

### useAIChat (Text Generation)

```typescript
// weave-mobile/src/hooks/useAIChat.ts
import { useState } from 'react';
import { apiClient } from '@/services/apiClient';

export function useAIChat() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (params: {
    prompt: string;
    context?: Record<string, any>;
  }) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await apiClient.post('/api/ai/chat', {
        message: params.prompt,
        context: params.context
      });

      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generate, isGenerating, error };
}
```

**Usage:**

```tsx
const { generate, isGenerating, error } = useAIChat();

const handleSubmit = async () => {
  const result = await generate({
    prompt: "Help me plan my day",
    context: { goals: userGoals }
  });
  console.log(result.response);
};
```

---

## AI Module Abstraction

### AIModuleBase Abstract Class

**Purpose:** Base class for all AI product features (Onboarding Coach, Triad Planner, etc.)

**Distinction:**
- **AIProviderBase:** HOW to call AI APIs (OpenAI, Anthropic, Gemini)
- **AIModuleBase:** WHAT product features to build (Onboarding, Triad, Chat)

```python
# weave-api/app/services/ai/ai_module_base.py
from abc import ABC, abstractmethod
from typing import Dict, Any
from app.services.ai_provider_base import AIProviderBase

class AIModuleBase(ABC):
    """
    Base class for all AI product modules.

    Modules represent product features (Onboarding, Triad, Recap, Dream Self, Insights)
    that use AI providers to generate outputs.
    """

    def __init__(self, provider: AIProviderBase, context_builder):
        self.provider = provider
        self.context_builder = context_builder

    @abstractmethod
    def get_module_name(self) -> str:
        """Return module identifier (e.g., 'onboarding_coach', 'triad_planner')"""
        pass

    @abstractmethod
    async def execute(
        self,
        user_id: str,
        operation_type: str,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute AI module operation.

        Args:
            user_id: User identifier
            operation_type: Specific operation (e.g., 'generate_goal_breakdown')
            params: Operation-specific parameters

        Returns:
            Structured AI output (validated by module-specific schema)
        """
        pass

    async def build_context(self, user_id: str, operation_type: str) -> Dict[str, Any]:
        """Build user context for AI call using Context Builder"""
        return await self.context_builder.get_context(user_id, operation_type)

    async def validate_output(self, output: Dict[str, Any]) -> bool:
        """Validate AI output against module-specific schema"""
        pass
```

---

## AI Orchestrator

### Central Request Router

**Purpose:** Routes AI requests to the correct module and coordinates all AI operations

```python
# weave-api/app/services/ai/ai_orchestrator.py
from app.services.ai.module_registry import AIModuleRegistry
from app.services.ai.context_builder import ContextBuilder
from app.services.ai_provider_base import AIProviderBase

class AIOrchestrator:
    """
    Central AI orchestrator that:
    1. Routes requests to correct AI module
    2. Coordinates Context Builder
    3. Enforces rate limiting
    4. Logs all AI calls to ai_runs table
    5. Handles fallback chains
    """

    def __init__(
        self,
        module_registry: AIModuleRegistry,
        context_builder: ContextBuilder,
        text_provider: AIProviderBase,
        image_provider: AIProviderBase,
        audio_provider: AIProviderBase
    ):
        self.module_registry = module_registry
        self.context_builder = context_builder
        self.text_provider = text_provider
        self.image_provider = image_provider
        self.audio_provider = audio_provider

    async def execute_ai_operation(
        self,
        user_id: str,
        operation_type: str,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute AI operation.

        Flow:
        1. Check rate limits
        2. Get appropriate module
        3. Build user context
        4. Execute module operation
        5. Log to ai_runs
        6. Return result
        """

        # 1. Check rate limits
        await self._check_rate_limit(user_id, operation_type)

        # 2. Get module
        module = self.module_registry.get_module(operation_type)
        if not module:
            raise ValueError(f"No module registered for operation: {operation_type}")

        # 3. Execute module
        result = await module.execute(user_id, operation_type, params)

        # 4. Log to ai_runs (cost tracking)
        await self._log_ai_run(user_id, operation_type, module, result)

        return result

    async def _check_rate_limit(self, user_id: str, operation_type: str):
        """Check daily_aggregates for rate limit compliance"""
        # Query daily_aggregates.ai_text_count, ai_vision_count, etc.
        pass

    async def _log_ai_run(self, user_id: str, operation_type: str, module, result):
        """Log to ai_runs table with tokens, cost, duration"""
        pass
```

### Module Registry

**Purpose:** Maps operation types to module instances

```python
# weave-api/app/services/ai/module_registry.py
from typing import Dict
from app.services.ai.ai_module_base import AIModuleBase

class AIModuleRegistry:
    """
    Registry for all AI modules.
    Maps operation types to module instances.
    """

    def __init__(self):
        self._modules: Dict[str, AIModuleBase] = {}

    def register_module(self, module: AIModuleBase):
        """Register an AI module"""
        module_name = module.get_module_name()
        self._modules[module_name] = module

    def get_module(self, operation_type: str) -> AIModuleBase:
        """Get module for operation type"""
        operation_module_map = {
            # Onboarding Coach
            'generate_goal_breakdown': 'onboarding_coach',
            'create_identity_doc_v1': 'onboarding_coach',

            # Triad Planner
            'generate_triad': 'triad_planner',

            # Daily Recap
            'generate_recap': 'daily_recap',

            # Dream Self Advisor
            'chat_response': 'dream_self_advisor',

            # AI Insights Engine
            'generate_weekly_insights': 'ai_insights'
        }
        module_name = operation_module_map.get(operation_type)
        return self._modules.get(module_name)
```

---

## Context Builder

### Purpose

Assembles canonical user context for AI calls. Different AI operations need different context:

| Operation | Context Needed |
|-----------|----------------|
| **Onboarding** | Minimal (just user input) |
| **Triad Generation** | Goals + history + journal |
| **Daily Recap** | Today's completions + captures + journal |
| **AI Chat** | Full context (identity + goals + history + patterns) |
| **Weekly Insights** | 30-day history + patterns |

### Implementation

```python
# weave-api/app/services/ai/context_builder.py
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

class ContextBuilder:
    """
    Assembles canonical user context for AI calls.

    Context includes:
    - Identity document (archetype, dream self, motivations)
    - Active goals and Q-goals
    - Recent completions (last 7 days)
    - Journal entries with fulfillment scores
    - Computed metrics (streak, consistency %)
    - User preferences (timezone, coaching strictness)
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_context(
        self,
        user_id: str,
        operation_type: str
    ) -> Dict[str, Any]:
        """
        Build context based on operation type.
        """

        # Base context (all operations)
        context = {
            "user_id": user_id,
            "operation_type": operation_type
        }

        # Operation-specific context
        if operation_type == "generate_triad":
            context.update(await self._get_triad_context(user_id))
        elif operation_type == "generate_recap":
            context.update(await self._get_recap_context(user_id))
        elif operation_type == "chat_response":
            context.update(await self._get_full_context(user_id))
        elif operation_type == "generate_weekly_insights":
            context.update(await self._get_insights_context(user_id))

        return context

    async def _get_triad_context(self, user_id: str) -> Dict[str, Any]:
        """Context for Triad generation: goals + history + today's journal"""
        # Query goals, subtask_completions (last 7 days), journal_entries (today)
        pass

    async def _get_recap_context(self, user_id: str) -> Dict[str, Any]:
        """Context for Daily Recap: today's completions + captures + journal"""
        pass

    async def _get_full_context(self, user_id: str) -> Dict[str, Any]:
        """Full context for AI Chat: identity + goals + history + patterns"""
        pass

    async def _get_insights_context(self, user_id: str) -> Dict[str, Any]:
        """Context for Weekly Insights: 30-day history + patterns"""
        pass
```

---

## Implementing New AI Modules

### The 5 Core AI Modules

**1. Onboarding Coach Module**

```python
# weave-api/app/services/ai/modules/onboarding_coach.py
from app.services.ai.ai_module_base import AIModuleBase

class OnboardingCoachModule(AIModuleBase):
    """
    Epic 1, Story 1.8: Generate goal breakdown from vague input
    Epic 2, Story 2.3: Reused for creating new goals

    Operations:
    - generate_goal_breakdown: Parse goal → Q-goals + binds
    - create_identity_doc_v1: Generate initial identity document
    """

    def get_module_name(self) -> str:
        return "onboarding_coach"

    async def execute(self, user_id: str, operation_type: str, params: Dict[str, Any]) -> Dict[str, Any]:
        if operation_type == "generate_goal_breakdown":
            return await self._generate_goal_breakdown(user_id, params)
        elif operation_type == "create_identity_doc_v1":
            return await self._create_identity_doc(user_id, params)

    async def _generate_goal_breakdown(self, user_id: str, params: Dict[str, Any]) -> Dict[str, Any]:
        # Build context
        context = await self.build_context(user_id, "generate_goal_breakdown")

        # Call AI provider
        prompt = f"""
        Parse the following goal into Q-goals and consistent actions:

        Goal: {params['title']}
        Description: {params['description']}
        Motivation: {params['motivation']}

        Generate 2-4 measurable Q-goals and 3-5 daily/weekly actions.
        """

        result = await self.provider.call_ai(
            input={"messages": [{"role": "user", "content": prompt}]},
            context=context
        )

        # Validate and return structured output
        return {
            "qgoals": result["qgoals"],
            "binds": result["binds"]
        }
```

**2. Triad Planner Module**

```python
class TriadPlannerModule(AIModuleBase):
    """
    Epic 4, Story 4.3: Generate tomorrow's 3-task plan after journal

    Operations:
    - generate_triad: Create 3 tasks for next day
    """

    def get_module_name(self) -> str:
        return "triad_planner"

    async def execute(self, user_id: str, operation_type: str, params: Dict[str, Any]) -> Dict[str, Any]:
        # Build context: goals + history + today's journal
        context = await self.build_context(user_id, "generate_triad")

        # Generate triad
        prompt = f"""
        Based on user's goals and today's reflection, generate 3 tasks for tomorrow.

        Goals: {context['goals']}
        Today's Progress: {context['today_completions']}
        Journal: {context['journal_entry']}

        Generate 3 specific, actionable tasks.
        """

        result = await self.provider.call_ai(...)
        return {"triad_tasks": result["tasks"]}
```

**3. Daily Recap Module**

```python
class DailyRecapModule(AIModuleBase):
    """
    Epic 4, Story 4.3: Generate AI feedback after reflection

    Operations:
    - generate_recap: Create affirming insight + blocker insight + suggestions
    """
    pass
```

**4. Dream Self Advisor Module**

```python
class DreamSelfAdvisorModule(AIModuleBase):
    """
    Epic 6, Story 6.1, 6.2: Conversational AI coaching

    Operations:
    - chat_response: Context-aware coaching conversation
    """
    pass
```

**5. AI Insights Engine Module**

```python
class AIInsightsModule(AIModuleBase):
    """
    Epic 6, Story 6.4: Weekly pattern analysis

    Operations:
    - generate_weekly_insights: Pattern detection, trajectory analysis
    """
    pass
```

---

## Integration with API Endpoints

### Example: Using AI Orchestrator in API Route

```python
# weave-api/app/api/routers/goals.py
from app.services.ai.ai_orchestrator import get_orchestrator

@router.post("/")
async def create_goal(
    goal_data: GoalCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Epic 2, Story 2.3: Create New Goal (AI-Assisted)
    """

    # Get AI orchestrator
    orchestrator = get_orchestrator()

    # Call AI to generate goal breakdown
    ai_result = await orchestrator.execute_ai_operation(
        user_id=str(user.id),
        operation_type="generate_goal_breakdown",
        params={
            "title": goal_data.title,
            "description": goal_data.description,
            "motivation": goal_data.motivation
        }
    )

    # Create goal with AI-generated Q-goals
    goal = Goal(
        user_id=user.id,
        title=goal_data.title,
        description=goal_data.description,
        status="active"
    )
    db.add(goal)
    await db.flush()

    # Create Q-goals from AI output
    for qgoal_data in ai_result["qgoals"]:
        qgoal = QGoal(
            goal_id=goal.id,
            title=qgoal_data["title"],
            metric=qgoal_data["metric"]
        )
        db.add(qgoal)

    await db.commit()
    return {"data": goal.to_dict(), "meta": {...}}
```

---

## AI Module → Story Mapping

| AI Module | Operation Type | Used In Story | Epic |
|-----------|----------------|---------------|------|
| **Onboarding Coach** | `generate_goal_breakdown` | 1.8, 2.3 | 1, 2 |
| | `create_identity_doc_v1` | 1.6, 1.7 | 1 |
| **Triad Planner** | `generate_triad` | 4.3 | 4 |
| **Daily Recap** | `generate_recap` | 4.3 | 4 |
| **Dream Self Advisor** | `chat_response` | 6.1, 6.2 | 6 |
| **AI Insights Engine** | `generate_weekly_insights` | 6.4 | 6 |

---

## Provider Decision Tree

### When to Use Which Provider

```
Text Generation?
├─ Routine/High Volume (Triad, Recap)? → GPT-4o-mini (primary), Claude (fallback)
└─ Complex Reasoning (Onboarding, Chat)? → Claude 3.7 Sonnet (primary), GPT-4o (fallback)

Image Analysis?
└─ All cases → Gemini 3.0 Flash (primary), GPT-4o Vision (fallback)

Audio Transcription?
└─ All cases → AssemblyAI (primary), Whisper (fallback)
```

### Cost Optimization Strategy

1. **Use cheapest provider first:** GPT-4o-mini for 90% of text ops
2. **Cache aggressively:** Store results with `input_hash` (8-hour TTL)
3. **Batch operations:** Journal submission triggers both Recap + Triad (1 context fetch)
4. **Rate limit strictly:** Prevent runaway costs
5. **Monitor daily:** Check `ai_runs` table for cost anomalies

**Budget:** $2,500/month at 10K users = $0.25/user/month

---

## Next Steps

1. **When implementing AI features:**
   - Use AI Orchestrator (don't call providers directly)
   - Reference this guide for module selection
   - Follow cost tracking and rate limiting patterns

2. **When adding new AI modules:**
   - Inherit from `AIModuleBase`
   - Register in `ModuleRegistry`
   - Update operation mapping
   - Add to this guide

3. **Documentation updates:**
   - Keep this file in sync with `docs/dev/backend-api-integration.md`
   - Update `CLAUDE.md` when new patterns emerge

---

## References

- **Backend API Integration:** `docs/dev/backend-api-integration.md` (API endpoints)
- **Backend Patterns Guide:** `docs/dev/backend-patterns-guide.md` (FastAPI patterns)
- **Architecture:** `docs/architecture/core-architectural-decisions.md`
- **AI Architecture:** `docs/idea/ai.md` (lines 79-269 - AI modules detailed spec)

**Created:** 2025-12-22
**Story:** 1.5.3 (AI Services Standardization + AI Orchestration)
**Maintainer:** Development Team

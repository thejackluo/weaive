# Story 1.5.3: AI Services Standardization (Text/Image/Audio) + AI Orchestration

**Status:** ready-for-dev
**Epic:** 1.5 - Development Infrastructure
**Priority:** S (Should Have)
**Estimate:** 6-8 story points
**Type:** Infrastructure

---

## Story

**As a** developer
**I want to** have unified AI service patterns across text, image, and audio with centralized orchestration
**So that** I can implement Epic 2-8 AI features with consistent cost tracking, error handling, and rate limiting

---

## Overview / Rationale

Stories 0.6 (AI Service), 0.9 (Image Service), and 0.11 (Voice STT) implemented text, image, and audio AI integrations separately. This story extracts common patterns into a unified abstraction (`AIProviderBase`) and adds AI module orchestration, ensuring all future AI integrations follow consistent patterns for:

- **Provider abstraction:** Unified interface for all AI modalities (text, image, audio)
- **AI module orchestration:** Product feature modules (Onboarding Coach, Triad Planner, Dream Self Advisor, etc.)
- **Provider fallback chains:** Primary → Secondary → Graceful degradation
- **Cost tracking:** Unified logging to `ai_runs` table
- **Rate limiting:** Check `daily_aggregates` before AI calls
- **Error handling:** Standard loading states, retry logic
- **Frontend hooks:** React Native hooks for all AI modalities
- **Context building:** Canonical user state assembly for AI calls

**Epic 2-8 Benefits:**
- 15+ AI integrations use single pattern
- Cost tracking automatic for all modalities
- Rate limiting enforced consistently
- Frontend developers use standard hooks (`useAIChat`, `useImageAnalysis`, `useVoiceTranscription`)
- AI orchestration routes all requests through unified system

---

## Acceptance Criteria

### AC-1: Unified AI Provider Abstraction

**AIProviderBase Abstract Class:**

```python
# weave-api/app/services/ai_provider_base.py
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class AIProviderBase(ABC):
    """
    Base class for all AI providers (text, image, audio).
    Ensures consistent interface for provider implementations.
    """

    @abstractmethod
    async def call_ai(self, input: Any, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute AI operation.

        Args:
            input: Input data (text, image URL, audio bytes)
            context: User context and operation metadata

        Returns:
            AI response with tokens/cost tracking
        """
        pass

    @abstractmethod
    def estimate_cost(self, input: Any) -> float:
        """
        Estimate cost before calling AI.

        Args:
            input: Input data to analyze

        Returns:
            Estimated cost in USD
        """
        pass

    @abstractmethod
    def get_provider_name(self) -> str:
        """Return provider identifier (e.g., 'gpt-4o-mini', 'gemini-3-flash')"""
        pass

    async def log_to_ai_runs(
        self,
        user_id: str,
        operation_type: str,
        input_tokens: int,
        output_tokens: int,
        cost_usd: float,
        duration_ms: int,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Log AI call to ai_runs table for cost tracking.
        Common implementation provided by base class.
        """
        pass

    async def check_rate_limit(self, user_id: str, operation_type: str) -> bool:
        """
        Check if user has exceeded rate limit.
        Queries daily_aggregates table.

        Returns:
            True if within limit, False if exceeded
        """
        pass
```

**Provider Implementation Pattern:**

- [ ] All AI providers inherit from `AIProviderBase`
- [ ] Implement fallback chain: Primary provider → Secondary provider → Graceful degradation (return None or default)
- [ ] Document provider initialization (API keys, config)
- [ ] Create provider factory: `get_text_provider()`, `get_image_provider()`, `get_audio_provider()`

---

### AC-2: Text AI Standardization

**Text AI Providers:**

- [ ] **Primary:** OpenAI GPT-4o-mini ($0.15/$0.60 per MTok) - 90% of text generation (routine tasks)
- [ ] **Secondary:** Claude 3.7 Sonnet ($3.00/$15.00 per MTok) - Complex reasoning, fallback
- [ ] **Tertiary:** Deterministic/cached responses (when both providers fail)

**Text AI Pattern:**

```python
# Example text provider implementation
class GPT4oMiniProvider(AIProviderBase):
    async def call_ai(self, input: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """
        input: {"messages": [...], "temperature": 0.7, "max_tokens": 500}
        context: {"user_id": "...", "operation_type": "generate_triad", ...}
        """
        # 1. Check rate limit
        if not await self.check_rate_limit(context["user_id"], context["operation_type"]):
            raise RateLimitExceeded()

        # 2. Call OpenAI API
        response = await openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=input["messages"],
            temperature=input.get("temperature", 0.7),
            max_tokens=input.get("max_tokens", 500)
        )

        # 3. Calculate cost
        cost_usd = self.calculate_cost(
            input_tokens=response.usage.prompt_tokens,
            output_tokens=response.usage.completion_tokens
        )

        # 4. Log to ai_runs
        await self.log_to_ai_runs(
            user_id=context["user_id"],
            operation_type=context["operation_type"],
            input_tokens=response.usage.prompt_tokens,
            output_tokens=response.usage.completion_tokens,
            cost_usd=cost_usd,
            duration_ms=context.get("duration_ms", 0),
            metadata={"model": "gpt-4o-mini", "temperature": input.get("temperature")}
        )

        # 5. Return standardized response
        return {
            "text": response.choices[0].message.content,
            "provider": "gpt-4o-mini",
            "tokens_used": {
                "input": response.usage.prompt_tokens,
                "output": response.usage.completion_tokens
            },
            "cost_usd": cost_usd
        }
```

**Documentation:**

- [ ] Document when to use GPT-4o-mini vs Claude (routine vs complex reasoning)
- [ ] Standard request format: `{"messages": [...], "context": {...}}`
- [ ] Standard response format: `{"text": "...", "provider": "gpt-4o-mini", "tokens_used": {...}, "cost_usd": 0.0025}`

---

### AC-3: Image AI Standardization

**Image AI Providers:**

- [ ] **Primary:** Gemini 3.0 Flash (~$0.0005 per image) - Proof validation, OCR, classification
- [ ] **Secondary:** GPT-4o Vision ($5/MTok, ~$0.02 per image) - Fallback for complex analysis
- [ ] **Tertiary:** Store image without AI analysis (graceful degradation)

**Image AI Pattern:**

```python
# Example image provider implementation
class Gemini3FlashProvider(AIProviderBase):
    async def call_ai(self, input: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """
        input: {
            "image_url": "https://...",
            "prompt": "Analyze this image...",
            "operations": ["proof_validation", "ocr", "classification"]
        }
        context: {"user_id": "...", "operation_type": "validate_proof"}
        """
        # Implementation similar to text provider
        pass
```

**Standard Request:**
```python
{
    "image_url": "https://storage.supabase.co/...",
    "prompt": "Validate if this image shows evidence of completing the task",
    "operations": ["proof_validation", "ocr", "classification"]
}
```

**Standard Response:**
```python
{
    "proof_validated": True,
    "extracted_text": "Completed 30 min workout",
    "categories": ["fitness", "exercise", "timer"],
    "quality_score": 85,
    "provider": "gemini-3-flash",
    "cost_usd": 0.0005
}
```

**Documentation:**

- [ ] Document proof validation criteria
- [ ] Document OCR accuracy expectations
- [ ] Document classification taxonomy

---

### AC-4: Audio AI Standardization

**Audio AI Providers:**

- [ ] **Primary:** AssemblyAI ($0.15/hr) - Speech-to-text transcription
- [ ] **Secondary:** OpenAI Whisper API ($0.006/min = $0.36/hr) - Fallback for edge cases
- [ ] **Tertiary:** Store audio without transcript (manual transcription later)

**Audio AI Pattern:**

```python
# Example audio provider implementation
class AssemblyAIProvider(AIProviderBase):
    async def call_ai(self, input: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """
        input: {
            "audio_file": bytes,
            "format": "m4a",
            "language": "en"
        }
        context: {"user_id": "...", "operation_type": "transcribe_journal"}
        """
        # Implementation similar to text provider
        pass
```

**Standard Request:**
```python
{
    "audio_file": b"...",  # Audio bytes
    "format": "m4a",
    "language": "en"
}
```

**Standard Response:**
```python
{
    "transcript": "Today was a great day. I completed all my tasks...",
    "confidence": 0.94,
    "duration_sec": 45.2,
    "provider": "assemblyai",
    "cost_usd": 0.0019
}
```

**Documentation:**

- [ ] Document supported audio formats
- [ ] Document confidence score interpretation
- [ ] Document language support

---

### AC-5: Cost Tracking Standardization

**Unified Cost Logging:**

All AI calls log to `ai_runs` table with:

- [ ] `operation_type`: "text_generation", "image_analysis", "transcription"
- [ ] `provider`: "gpt-4o-mini", "gemini-3-flash", "assemblyai"
- [ ] `input_tokens` (or `image_count`, `audio_duration_sec`)
- [ ] `output_tokens`
- [ ] `model`: Specific model name
- [ ] `cost_usd`: Calculated per-provider pricing
- [ ] `duration_ms`: API call latency

**Cost Calculation Utility:**

```python
# weave-api/app/services/ai/cost_calculator.py
class CostCalculator:
    """Calculate AI costs based on provider pricing."""

    PRICING = {
        "gpt-4o-mini": {"input": 0.15 / 1_000_000, "output": 0.60 / 1_000_000},
        "claude-3.7-sonnet": {"input": 3.00 / 1_000_000, "output": 15.00 / 1_000_000},
        "gemini-3-flash": {"per_image": 0.0005},
        "assemblyai": {"per_hour": 0.15},
        "whisper": {"per_minute": 0.006}
    }

    @staticmethod
    def calculate_text_cost(provider: str, input_tokens: int, output_tokens: int) -> float:
        """Calculate text generation cost."""
        pricing = CostCalculator.PRICING[provider]
        return (input_tokens * pricing["input"]) + (output_tokens * pricing["output"])

    @staticmethod
    def calculate_image_cost(provider: str, image_count: int) -> float:
        """Calculate image analysis cost."""
        return image_count * CostCalculator.PRICING[provider]["per_image"]

    @staticmethod
    def calculate_audio_cost(provider: str, duration_sec: float) -> float:
        """Calculate audio transcription cost."""
        if provider == "assemblyai":
            hours = duration_sec / 3600
            return hours * CostCalculator.PRICING[provider]["per_hour"]
        elif provider == "whisper":
            minutes = duration_sec / 60
            return minutes * CostCalculator.PRICING[provider]["per_minute"]
```

**Documentation:**

- [ ] Document per-provider pricing in `docs/dev/ai-services-guide.md`
- [ ] Create cost monitoring dashboard queries
- [ ] Document cost alerts (e.g., >$100/day)

---

### AC-6: Rate Limiting Patterns

**Rate Limit Checks:**

- [ ] **Before text AI:** Check `daily_aggregates.ai_text_count` (10 calls/hour per user)
- [ ] **Before image AI:** Check `daily_aggregates.ai_vision_count` (5 analyses/day per user)
- [ ] **Before audio AI:** Check `daily_aggregates.transcription_count` (50 transcriptions/day per user)

**Rate Limit Enforcement:**

```python
# Example rate limit check
async def check_text_ai_rate_limit(user_id: str) -> bool:
    """Check if user has exceeded text AI rate limit."""
    today = datetime.now().date()

    # Query daily_aggregates
    aggregate = await db.query(
        "SELECT ai_text_count FROM daily_aggregates WHERE user_id = $1 AND local_date = $2",
        user_id, today
    )

    if aggregate and aggregate["ai_text_count"] >= 10:
        return False  # Rate limit exceeded

    return True  # Within limit
```

**HTTP 429 Response:**

```python
{
    "error": {
        "code": "RATE_LIMIT_EXCEEDED",
        "message": "Daily limit reached (5/5 images)",
        "retryAfter": 22980  # Seconds until midnight in user's timezone
    }
}
```

**Documentation:**

- [ ] Include `Retry-After` header (seconds until midnight user timezone)
- [ ] Document rate limit rules in `docs/dev/ai-services-guide.md`
- [ ] Document how to request rate limit increases

---

### AC-7: React Native Hooks & Frontend Integration

**React Native Hooks:**

```typescript
// weave-mobile/src/hooks/useAIChat.ts
import { useState } from 'react';
import { apiClient } from '@/services/apiClient';

interface AIChatOptions {
  prompt: string;
  context?: Record<string, any>;
}

export function useAIChat() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (options: AIChatOptions) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await apiClient.post('/api/ai/chat', {
        message: options.prompt,
        context: options.context
      });

      return response.data;
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError('Daily AI limit reached. Resets at midnight.');
      } else {
        setError('AI service unavailable. Try again.');
      }
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generate, isGenerating, error };
}
```

```typescript
// weave-mobile/src/hooks/useImageAnalysis.ts
export function useImageAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (imageUri: string, operations: string[]) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Upload image to Supabase Storage
      const imageUrl = await uploadImage(imageUri);

      // Call image analysis API
      const response = await apiClient.post('/api/ai/analyze-image', {
        image_url: imageUrl,
        operations
      });

      return response.data;
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError('Daily image analysis limit reached (5/5).');
      } else {
        setError('Image analysis failed. Try again.');
      }
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { analyze, isAnalyzing, error };
}
```

```typescript
// weave-mobile/src/hooks/useVoiceTranscription.ts
export function useVoiceTranscription() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transcribe = async (audioUri: string) => {
    setIsTranscribing(true);
    setError(null);

    try {
      // Upload audio to Supabase Storage
      const audioUrl = await uploadAudio(audioUri);

      // Call transcription API
      const response = await apiClient.post('/api/ai/transcribe', {
        audio_url: audioUrl
      });

      return response.data;
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError('Daily transcription limit reached (50/50).');
      } else {
        setError('Transcription failed. Try again.');
      }
      throw err;
    } finally {
      setIsTranscribing(false);
    }
  };

  return { transcribe, isTranscribing, error };
}
```

**Hook Requirements:**

- [ ] Create `weave-mobile/src/hooks/useAIChat.ts`
- [ ] Create `weave-mobile/src/hooks/useImageAnalysis.ts`
- [ ] Create `weave-mobile/src/hooks/useVoiceTranscription.ts`
- [ ] Standard loading states: `isGenerating`, `isAnalyzing`, `isTranscribing`
- [ ] Standard error messages: "AI service unavailable. Try again.", "Daily limit reached."
- [ ] Handle HTTP 429 (rate limiting) with user-friendly message
- [ ] Handle network errors with retry prompts

---

### AC-8: Documentation

**AI Services Guide:**

- [ ] Create `docs/dev/ai-services-guide.md`
- [ ] **Sections:**
  1. Provider Abstraction (`AIProviderBase` overview)
  2. Text AI Patterns (GPT-4o-mini vs Claude)
  3. Image AI Patterns (Gemini vs GPT-4o Vision)
  4. Audio AI Patterns (AssemblyAI vs Whisper)
  5. Cost Tracking (pricing, monitoring, alerts)
  6. Rate Limiting (limits per modality, how to check)
  7. Frontend Hooks (`useAIChat`, `useImageAnalysis`, `useVoiceTranscription`)
  8. Provider Decision Tree (when to use which provider)
  9. AI Module Orchestration (NEW)
  10. Context Builder Usage (NEW)
  11. Implementing New AI Modules (NEW)

**Provider Decision Tree:**

| Use Case | Primary Provider | Fallback | Cost |
|----------|------------------|----------|------|
| **Text Generation** (Triad, Journal feedback) | GPT-4o-mini | Claude 3.7 Sonnet | $0.15/$0.60 per MTok |
| **Complex Reasoning** (Onboarding, Dream Self) | Claude 3.7 Sonnet | GPT-4o | $3.00/$15.00 per MTok |
| **Image Analysis** (Proof validation, OCR) | Gemini 3.0 Flash | GPT-4o Vision | $0.0005/image |
| **Voice Transcription** (STT) | AssemblyAI | Whisper API | $0.15/hr |

**Update Architecture Docs:**

- [ ] Update `docs/architecture/core-architectural-decisions.md` with unified AI architecture section
- [ ] Add section: "Unified AI Service Architecture (Story 1.5.3)" with provider fallback diagram
- [ ] Link from `CLAUDE.md` standardization section

---

### AC-9: AI Module Abstraction (5 Product Modules)

**Purpose:** Abstract base class for all AI product features (Onboarding Coach, Triad Planner, etc.)

**AIModuleBase Abstract Class:**

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
    async def execute(self, user_id: str, operation_type: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute AI module operation.

        Args:
            user_id: User identifier
            operation_type: Specific operation (e.g., 'generate_goal_breakdown', 'generate_triad')
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

**5 AI Modules to Implement:**

```python
# 1. Onboarding Coach Module
# weave-api/app/services/ai/modules/onboarding_coach_module.py
class OnboardingCoachModule(AIModuleBase):
    """
    Epic 1, Story 1.8: Generate goal breakdown from vague input
    Epic 2, Story 2.3: Reused for creating new goals

    Operations: 'generate_goal_breakdown', 'create_identity_doc_v1'
    """

    def get_module_name(self) -> str:
        return "onboarding_coach"

    async def execute(self, user_id: str, operation_type: str, params: Dict[str, Any]) -> Dict[str, Any]:
        if operation_type == "generate_goal_breakdown":
            # Build context (minimal for onboarding)
            context = await self.build_context(user_id, operation_type)

            # Call AI provider
            response = await self.provider.call_ai(
                input={
                    "messages": [
                        {"role": "system", "content": "You are an onboarding coach..."},
                        {"role": "user", "content": params["goal_input"]}
                    ],
                    "temperature": 0.7
                },
                context={"user_id": user_id, "operation_type": operation_type}
            )

            # Parse and validate output
            parsed = self.parse_goal_breakdown(response["text"])
            await self.validate_output(parsed)

            return parsed

        elif operation_type == "create_identity_doc_v1":
            # Similar pattern
            pass

    def parse_goal_breakdown(self, text: str) -> Dict[str, Any]:
        """Parse AI response into structured goal breakdown."""
        # Implementation
        pass


# 2. Triad Planner Module
# weave-api/app/services/ai/modules/triad_planner_module.py
class TriadPlannerModule(AIModuleBase):
    """
    Epic 4, Story 4.3: Generate tomorrow's 3-task plan after journal

    Operations: 'generate_triad'
    """

    def get_module_name(self) -> str:
        return "triad_planner"

    async def execute(self, user_id: str, operation_type: str, params: Dict[str, Any]) -> Dict[str, Any]:
        # Build rich context (goals + history + journal)
        context = await self.build_context(user_id, operation_type)

        # Call AI provider with context
        response = await self.provider.call_ai(
            input={
                "messages": [
                    {"role": "system", "content": f"You are a daily planning coach. User's goals: {context['goals']}"},
                    {"role": "user", "content": f"Journal entry: {params['journal_entry']}. Plan tomorrow's 3 tasks."}
                ],
                "temperature": 0.7
            },
            context={"user_id": user_id, "operation_type": operation_type}
        )

        # Parse and validate
        triad = self.parse_triad(response["text"])
        await self.validate_output(triad)

        return triad


# 3. Daily Recap Module
# weave-api/app/services/ai/modules/daily_recap_module.py
class DailyRecapModule(AIModuleBase):
    """
    Epic 4, Story 4.3: Generate AI feedback after reflection

    Operations: 'generate_recap'
    """

    def get_module_name(self) -> str:
        return "daily_recap"

    async def execute(self, user_id: str, operation_type: str, params: Dict[str, Any]) -> Dict[str, Any]:
        # Build context (today's completions + captures + journal)
        context = await self.build_context(user_id, operation_type)

        # Generate recap
        response = await self.provider.call_ai(
            input={
                "messages": [
                    {"role": "system", "content": "Generate daily recap feedback..."},
                    {"role": "user", "content": f"Today: {context['completions']}, Journal: {params['journal_entry']}"}
                ],
                "temperature": 0.8
            },
            context={"user_id": user_id, "operation_type": operation_type}
        )

        return {"recap_text": response["text"], "sentiment": "positive"}


# 4. Dream Self Advisor Module
# weave-api/app/services/ai/modules/dream_self_advisor_module.py
class DreamSelfAdvisorModule(AIModuleBase):
    """
    Epic 6, Story 6.1, 6.2: Conversational AI coaching

    Operations: 'chat_response'
    """

    def get_module_name(self) -> str:
        return "dream_self_advisor"

    async def execute(self, user_id: str, operation_type: str, params: Dict[str, Any]) -> Dict[str, Any]:
        # Build full context (identity + goals + history + patterns)
        context = await self.build_context(user_id, operation_type)

        # Conversational response
        response = await self.provider.call_ai(
            input={
                "messages": params["conversation_history"] + [
                    {"role": "user", "content": params["user_message"]}
                ],
                "temperature": 0.9
            },
            context={"user_id": user_id, "operation_type": operation_type}
        )

        return {"message": response["text"]}


# 5. AI Insights Engine Module
# weave-api/app/services/ai/modules/ai_insights_module.py
class AIInsightsModule(AIModuleBase):
    """
    Epic 6, Story 6.4: Weekly pattern analysis

    Operations: 'generate_weekly_insights'
    """

    def get_module_name(self) -> str:
        return "ai_insights"

    async def execute(self, user_id: str, operation_type: str, params: Dict[str, Any]) -> Dict[str, Any]:
        # Build 30-day context
        context = await self.build_context(user_id, operation_type)

        # Generate insights
        response = await self.provider.call_ai(
            input={
                "messages": [
                    {"role": "system", "content": "Analyze user patterns..."},
                    {"role": "user", "content": f"30-day data: {context['history']}"}
                ],
                "temperature": 0.7
            },
            context={"user_id": user_id, "operation_type": operation_type}
        )

        return {"insights": self.parse_insights(response["text"])}
```

**Module Registry:**

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
            'generate_goal_breakdown': 'onboarding_coach',
            'create_identity_doc_v1': 'onboarding_coach',
            'generate_triad': 'triad_planner',
            'generate_recap': 'daily_recap',
            'chat_response': 'dream_self_advisor',
            'generate_weekly_insights': 'ai_insights'
        }
        module_name = operation_module_map.get(operation_type)
        return self._modules.get(module_name)
```

**Implementation Checklist:**

- [ ] Create `weave-api/app/services/ai/ai_module_base.py`
- [ ] Create 5 module files in `weave-api/app/services/ai/modules/`
  - [ ] `onboarding_coach_module.py`
  - [ ] `triad_planner_module.py`
  - [ ] `daily_recap_module.py`
  - [ ] `dream_self_advisor_module.py`
  - [ ] `ai_insights_module.py`
- [ ] Create `weave-api/app/services/ai/module_registry.py`
- [ ] Implement module registration in `app/main.py` startup
- [ ] Write unit tests for each module (stub implementations OK for infrastructure story)

---

### AC-10: AI Orchestrator (Request Router)

**Purpose:** Central coordinator that routes AI requests to correct module

**AI Orchestrator Implementation:**

```python
# weave-api/app/services/ai/ai_orchestrator.py
from app.services.ai.module_registry import AIModuleRegistry
from app.services.ai.context_builder import ContextBuilder
from app.services.ai_provider_base import AIProviderBase
from typing import Dict, Any

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

        # 3. Execute
        result = await module.execute(user_id, operation_type, params)

        # 4. Log (cost tracking)
        await self._log_ai_run(user_id, operation_type, module, result)

        return result

    async def _check_rate_limit(self, user_id: str, operation_type: str):
        """Check daily_aggregates for rate limit compliance"""
        # Query daily_aggregates.ai_text_count, ai_vision_count, etc.
        # Raise RateLimitExceeded if over limit
        pass

    async def _log_ai_run(self, user_id: str, operation_type: str, module, result):
        """Log to ai_runs table with tokens, cost, duration"""
        # Extract cost/token data from result
        # Insert into ai_runs table
        pass
```

**Context Builder:**

```python
# weave-api/app/services/ai/context_builder.py
from typing import Dict, Any
from datetime import datetime, timedelta

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

    async def get_context(self, user_id: str, operation_type: str) -> Dict[str, Any]:
        """
        Build context based on operation type.

        Different operations need different context:
        - Onboarding: minimal (just user input)
        - Triad: goals + history + journal
        - Recap: today's completions + captures + journal
        - Chat: full context (identity + goals + history + patterns)
        - Insights: 30-day history + patterns
        """

        # Base context (always included)
        context = {
            "user_id": user_id,
            "timestamp": datetime.now().isoformat(),
            "operation_type": operation_type
        }

        # Operation-specific context
        if operation_type in ["generate_goal_breakdown", "create_identity_doc_v1"]:
            # Minimal context for onboarding
            context["identity"] = await self._get_identity_doc(user_id)

        elif operation_type == "generate_triad":
            # Rich context for triad planning
            context["goals"] = await self._get_active_goals(user_id)
            context["history"] = await self._get_recent_completions(user_id, days=7)
            context["journal"] = await self._get_recent_journals(user_id, days=3)

        elif operation_type == "generate_recap":
            # Today's context for recap
            context["completions"] = await self._get_today_completions(user_id)
            context["captures"] = await self._get_today_captures(user_id)
            context["journal"] = await self._get_today_journal(user_id)

        elif operation_type == "chat_response":
            # Full context for chat
            context["identity"] = await self._get_identity_doc(user_id)
            context["goals"] = await self._get_active_goals(user_id)
            context["history"] = await self._get_recent_completions(user_id, days=7)
            context["journal"] = await self._get_recent_journals(user_id, days=7)
            context["patterns"] = await self._get_user_patterns(user_id)

        elif operation_type == "generate_weekly_insights":
            # 30-day context for insights
            context["history"] = await self._get_recent_completions(user_id, days=30)
            context["journals"] = await self._get_recent_journals(user_id, days=30)
            context["patterns"] = await self._get_user_patterns(user_id)

        return context

    async def _get_identity_doc(self, user_id: str) -> Dict[str, Any]:
        """Fetch user's identity document"""
        pass

    async def _get_active_goals(self, user_id: str) -> list:
        """Fetch user's active goals with subtasks"""
        pass

    async def _get_recent_completions(self, user_id: str, days: int) -> list:
        """Fetch recent subtask completions"""
        pass

    async def _get_recent_journals(self, user_id: str, days: int) -> list:
        """Fetch recent journal entries"""
        pass

    async def _get_today_completions(self, user_id: str) -> list:
        """Fetch today's completions"""
        pass

    async def _get_today_captures(self, user_id: str) -> list:
        """Fetch today's captures (photos, notes, audio)"""
        pass

    async def _get_today_journal(self, user_id: str) -> Dict[str, Any]:
        """Fetch today's journal entry"""
        pass

    async def _get_user_patterns(self, user_id: str) -> Dict[str, Any]:
        """Compute user behavior patterns (peak times, consistency, etc.)"""
        pass
```

**Implementation Checklist:**

- [ ] Create `weave-api/app/services/ai/ai_orchestrator.py`
- [ ] Create `weave-api/app/services/ai/context_builder.py`
- [ ] Implement all context builder methods (stub implementations OK for infrastructure)
- [ ] Integrate orchestrator into FastAPI dependency injection
- [ ] Write integration tests for orchestrator flow

**Integration with Existing Stories:**

- [ ] **Story 1.8** (Choose Your First Needle) uses Onboarding Coach module
- [ ] **Story 2.3** (Create New Goal) uses Onboarding Coach module
- [ ] **Story 4.3** (AI Feedback Generation) uses Triad Planner + Daily Recap modules
- [ ] **Story 6.1, 6.2** (AI Chat) uses Dream Self Advisor module
- [ ] **Story 6.4** (Weekly Insights) uses AI Insights Engine module

---

## Story Points Breakdown

| Task | Estimate | Rationale |
|------|----------|-----------|
| **AIProviderBase abstraction** | 1 pt | Abstract class, common methods |
| **Provider standardization (text/image/audio)** | 2 pts | Extract patterns from Stories 0.6, 0.9, 0.11 |
| **AI Module Abstraction (AC-9)** | 1-2 pts | AIModuleBase, 5 module stubs, registry |
| **AI Orchestrator (AC-10)** | 1 pt | Orchestrator + Context Builder |
| **React Native hooks** | 1 pt | 3 hooks with loading/error states |
| **AI services guide (updated)** | 1-2 pts | Comprehensive developer documentation + orchestration sections |

**Total: 6-8 story points** (expanded from 4-5 pts)

---

## Definition of Done

**Functionality:**
- [ ] `AIProviderBase` abstract class implemented and tested
- [ ] Text provider (GPT-4o-mini), image provider (Gemini 3.0 Flash), audio provider (AssemblyAI) all implement `AIProviderBase`
- [ ] Fallback chains functional (Primary → Secondary → Tertiary)
- [ ] `AIModuleBase` abstract class implemented
- [ ] 5 AI modules implemented (stub versions with registry)
- [ ] `AIOrchestrator` routes requests to correct module
- [ ] `ContextBuilder` assembles user context based on operation type
- [ ] Cost tracking logs to `ai_runs` table
- [ ] Rate limiting enforced for all AI modalities
- [ ] React Native hooks (`useAIChat`, `useImageAnalysis`, `useVoiceTranscription`) functional

**Documentation:**
- [ ] `docs/dev/ai-services-guide.md` created with all sections
- [ ] Architecture docs updated with unified AI architecture section
- [ ] Provider decision tree documented
- [ ] All changes committed and pushed

**Code Review:**
- [ ] Code reviewed and approved
- [ ] PR includes examples of using AI hooks
- [ ] PR description links to this story

**Testing:**
- [ ] Unit tests for `AIProviderBase` implementations
- [ ] Unit tests for each AI module (stub implementations)
- [ ] Integration tests for `AIOrchestrator` flow
- [ ] Rate limiting tests (check that 429 errors are returned correctly)
- [ ] Cost calculation tests (verify correct pricing)

---

## Technical Implementation Notes

### File Structure

```
weave-api/
├── app/
│   └── services/
│       ├── ai/
│       │   ├── ai_provider_base.py           # Abstract provider class
│       │   ├── ai_module_base.py             # Abstract module class (AC-9)
│       │   ├── ai_orchestrator.py            # Central orchestrator (AC-10)
│       │   ├── context_builder.py            # User context builder (AC-10)
│       │   ├── module_registry.py            # Module registry (AC-9)
│       │   ├── cost_calculator.py            # Cost calculation utility
│       │   ├── providers/
│       │   │   ├── gpt4o_mini_provider.py    # Text provider (primary)
│       │   │   ├── claude_sonnet_provider.py # Text provider (secondary)
│       │   │   ├── gemini_flash_provider.py  # Image provider (primary)
│       │   │   ├── gpt4o_vision_provider.py  # Image provider (secondary)
│       │   │   ├── assemblyai_provider.py    # Audio provider (primary)
│       │   │   └── whisper_provider.py       # Audio provider (secondary)
│       │   └── modules/
│       │       ├── onboarding_coach_module.py # AC-9
│       │       ├── triad_planner_module.py    # AC-9
│       │       ├── daily_recap_module.py      # AC-9
│       │       ├── dream_self_advisor_module.py # AC-9
│       │       └── ai_insights_module.py      # AC-9

weave-mobile/
└── src/
    └── hooks/
        ├── useAIChat.ts
        ├── useImageAnalysis.ts
        └── useVoiceTranscription.ts
```

### Dependencies

**Python (Backend):**
```bash
# Already installed from Story 0.6, 0.9, 0.11
uv add openai anthropic google-generativeai assemblyai
```

**TypeScript (Frontend):**
```bash
# No new dependencies needed
```

---

## Data Requirements

**Database Changes:**

No new tables required. Uses existing:
- `ai_runs` (Story 0.6) - Cost tracking
- `daily_aggregates` (Story 0.2b) - Rate limiting

**Environment Variables:**

```bash
# Already set from Stories 0.6, 0.9, 0.11
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
ASSEMBLYAI_API_KEY=...
```

---

## Testing Checklist

**Unit Tests:**
- [ ] Test `AIProviderBase` abstract methods
- [ ] Test each provider implementation (text, image, audio)
- [ ] Test fallback chain (primary fails → secondary)
- [ ] Test cost calculation utility
- [ ] Test rate limit checking
- [ ] Test each AI module (stub implementations)
- [ ] Test `AIOrchestrator` routing logic
- [ ] Test `ContextBuilder` context assembly

**Integration Tests:**
- [ ] Test end-to-end text generation (GPT-4o-mini)
- [ ] Test end-to-end image analysis (Gemini 3.0 Flash)
- [ ] Test end-to-end audio transcription (AssemblyAI)
- [ ] Test rate limiting (exceed limit, verify 429 response)
- [ ] Test cost logging (verify `ai_runs` table entries)
- [ ] Test orchestrator flow (request → module → response)

**Frontend Tests:**
- [ ] Test `useAIChat` hook (loading states, error handling)
- [ ] Test `useImageAnalysis` hook (upload + analysis)
- [ ] Test `useVoiceTranscription` hook (upload + transcription)
- [ ] Test rate limiting UI (show message when limit exceeded)

---

## Success Metrics

**Completion Rate:**
- Story completed within 2-3 days
- All acceptance criteria met
- DoD checklist 100% complete

**Quality:**
- Zero console warnings or errors
- All tests passing (unit + integration)
- Documentation complete and reviewed

**Developer Experience:**
- Epic 2-8 stories can use standard AI hooks
- No confusion about which provider to use
- AI orchestration simplifies Epic 2-8 implementation
- Clear cost tracking and rate limiting patterns

**ROI:**
- 25-35% velocity improvement for Epic 2-8 stories (40+ future stories benefit)
- Consistent AI integration patterns across all features
- Simplified cost monitoring and budget control

---

## Notes

**Why Unified Abstraction:**
- Prevents pattern divergence across 15+ AI integrations
- Simplifies provider swapping (e.g., GPT-4o-mini → GPT-4.5)
- Centralizes cost tracking and rate limiting
- Reduces code duplication

**Why AI Module Orchestration:**
- Separates product features (modules) from infrastructure (providers)
- Enables context-aware AI calls (different operations need different context)
- Simplifies Epic 2-8 implementation (use orchestrator, not raw providers)
- Centralizes rate limiting and cost tracking across all AI operations

**Provider Selection Philosophy:**
- **Primary:** Lowest cost, sufficient quality
- **Secondary:** Higher quality, higher cost (fallback only)
- **Tertiary:** Graceful degradation (no AI, store for manual processing)

**Rate Limiting Strategy:**
- Conservative limits for MVP (prevent runaway costs)
- Per-modality limits (text: 10/hr, image: 5/day, audio: 50/day)
- Can adjust post-MVP based on usage patterns

**Cost Tracking Philosophy:**
- Log EVERYTHING to `ai_runs` table
- Enable cost monitoring dashboards
- Alert if daily costs exceed $100

---

## Related Stories

**Depends On:**
- ✅ Story 0.6: AI Service Abstraction (text AI infrastructure)
- ✅ Story 0.9: AI-Powered Image Service (image AI infrastructure)
- ✅ Story 0.11: Voice/STT Infrastructure (audio AI infrastructure)

**Blocks:**
- Story 1.8: Choose Your First Needle (uses Onboarding Coach module)
- Story 2.3: Create New Goal (uses Onboarding Coach module)
- Story 4.3: AI Feedback Generation (uses Triad Planner + Daily Recap modules)
- Story 6.1, 6.2: AI Chat (uses Dream Self Advisor module)
- Story 6.4: Weekly Insights (uses AI Insights Engine module)

**Related:**
- Story 1.5.2: Backend API/Model Standardization (backend patterns for AI endpoints)

---

## Change History

| Date | Author | Change |
|------|--------|--------|
| 2025-12-22 | AI Agent (Scrum Master) | Story created from Epic 1.5 specification |
| 2025-12-22 | AI Agent | Added AC-9 (AI Module Abstraction) and AC-10 (AI Orchestrator) per Sprint Change Proposal |
| 2025-12-22 | AI Agent | Expanded estimate from 4-5 pts to 6-8 pts |

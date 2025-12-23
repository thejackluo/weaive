# Validation Report: Story 1.5.3 (AI Services Standardization + AI Orchestration)

**Date:** 2025-12-22
**Validator:** AI Agent (Story Validation Workflow)
**Story File:** `docs/stories/1-5-3-ai-services-standardization.md`
**Sprint:** Epic 1.5 - Development Infrastructure
**Validation Status:** ❌ **CRITICAL ISSUES FOUND - REQUIRES MAJOR REVISION**

---

## Executive Summary

**Overall Assessment:** Story 1.5.3 contains **5 CRITICAL issues** and **3 MODERATE issues** that must be addressed before implementation.

**Critical Issue Count:** 5

1. ❌ **CRITICAL**: AC-1 proposes `AIProviderBase` but codebase already has `AIProvider` with different interface
2. ❌ **CRITICAL**: AC-1 through AC-6 propose "standardization" of infrastructure already implemented in Stories 0.6, 0.9
3. ❌ **CRITICAL**: Method signature conflicts (`call_ai()` vs existing `complete()`)
4. ❌ **CRITICAL**: Story doesn't acknowledge or integrate with existing `AIService` orchestrator
5. ❌ **CRITICAL**: AC-4 (Audio AI) depends on Story 0.11 which is not yet implemented (status: ready-for-dev)

**Moderate Issue Count:** 3

1. ⚠️ **MODERATE**: AC-7 proposes hooks that partially exist (`useAIChat` already implemented in Story 6.1)
2. ⚠️ **MODERATE**: Story mixes two concerns: refactoring existing code + adding new module layer
3. ⚠️ **MODERATE**: No clarity on how AC-9/AC-10 (new AI Module Orchestration) relates to existing AIService

**Recommendation:** **REWRITE REQUIRED**

This story was written based on Sprint Change Proposal assumptions about what infrastructure "should exist" but doesn't account for what infrastructure **actually exists** in the codebase. The story needs to be refocused entirely on AC-9 and AC-10 (AI Module Orchestration), which are genuinely new features.

---

## Section 1: Story Structure Validation

### ✅ GOOD: Complete Story Structure

Story includes all required sections:
- [x] Story header with status, epic, priority, estimate, type
- [x] User story format ("As a developer, I want to...")
- [x] Overview/Rationale
- [x] Acceptance Criteria (10 ACs)
- [x] Story Points Breakdown
- [x] Definition of Done
- [x] Technical Implementation Notes
- [x] Testing Checklist
- [x] Success Metrics
- [x] Related Stories

**Length:** 1291 lines (comprehensive, appropriate for 6-8 pt infrastructure story)

**Formatting:** Clean markdown with clear sections

---

## Section 2: Critical Technical Issues

### 1. ❌ CRITICAL: Naming Conflict with Existing Base Class

**Issue:** Story proposes creating new `AIProviderBase` abstract class (AC-1, lines 43-115):

```python
# Story 1.5.3 proposes:
class AIProviderBase(ABC):
    async def call_ai(self, input: Any, context: Dict[str, Any]) -> Dict[str, Any]:
        pass

    def estimate_cost(self, input: Any) -> float:
        pass

    def get_provider_name(self) -> str:
        pass
```

**Reality:** Base class already exists at `weave-api/app/services/ai/base.py`:

```python
# Existing AIProvider (Story 0.6, implemented):
class AIProvider(ABC):
    def complete(self, prompt: str, model: str, **kwargs) -> AIResponse:
        """Generate AI completion for the given prompt."""
        pass

    def count_tokens(self, text: str, model: str) -> int:
        """Count tokens in text for the given model."""
        pass

    def estimate_cost(self, input_tokens: int, output_tokens: int, model: str) -> float:
        """Estimate USD cost for token counts."""
        pass
```

**Conflicts:**
- ❌ Different class name: `AIProviderBase` vs `AIProvider`
- ❌ Different method signatures: `call_ai()` vs `complete()`
- ❌ Different input format: `input: Any, context: Dict` vs `prompt: str, model: str, **kwargs`
- ❌ Different response format: `Dict[str, Any]` vs `AIResponse` dataclass

**Evidence:** `weave-api/app/services/ai/__init__.py` exports `AIProvider`:
```python
from .base import AIProvider, AIProviderError, AIResponse

__all__ = [
    "AIProvider",
    "AIResponse",
    "AIProviderError",
    # ...
]
```

**Existing Providers Using AIProvider:**
- `BedrockProvider` (Story 0.6) - AWS Bedrock text generation
- `OpenAIProvider` (Story 0.6) - GPT-4o/GPT-4o-mini
- `AnthropicProvider` (Story 0.6) - Claude 3.7 Sonnet/Haiku
- `DeterministicProvider` (Story 0.6) - Template fallback
- `GeminiVisionProvider` (Story 0.9) - Gemini 3.0 Flash for image analysis
- `OpenAIVisionProvider` (Story 0.9) - GPT-4o Vision fallback

**Impact:** **HIGH** - Creating a new base class with different interface would require rewriting 6 existing providers.

**Correct Approach:**

Story 1.5.3 should **standardize around existing `AIProvider`**, not create new `AIProviderBase`:

```python
# CORRECT: Use existing base class
from app.services.ai.base import AIProvider, AIResponse

class GPT4oMiniProvider(AIProvider):
    """Text provider using existing interface."""

    def complete(self, prompt: str, model: str = 'gpt-4o-mini', **kwargs) -> AIResponse:
        # Implementation using existing method signature
        pass

    def count_tokens(self, text: str, model: str) -> int:
        # Use tiktoken for GPT models
        pass

    def estimate_cost(self, input_tokens: int, output_tokens: int, model: str) -> float:
        # GPT-4o-mini pricing: $0.15/$0.60 per MTok
        pass
```

**Required Changes:**
1. Replace all `AIProviderBase` references with `AIProvider`
2. Update method signatures: `call_ai()` → `complete()`
3. Update input format: `(input, context)` → `(prompt, model, **kwargs)`
4. Update response format: `Dict[str, Any]` → `AIResponse` dataclass
5. Remove `get_provider_name()` and `log_to_ai_runs()` methods (handled by AIService)

---

### 2. ❌ CRITICAL: Duplicate Orchestration - AIService Already Exists

**Issue:** Story proposes creating providers and orchestration that already exist.

**AC-1 through AC-6 claim to "standardize" infrastructure:**
- AC-1: Unified AI Provider Abstraction
- AC-2: Text AI Standardization
- AC-3: Image AI Standardization
- AC-4: Audio AI Standardization
- AC-5: Cost Tracking Standardization
- AC-6: Rate Limiting Patterns

**Reality:** All of this infrastructure already exists at `weave-api/app/services/ai/`:

```
weave-api/app/services/ai/
├── base.py                    # AIProvider abstract class ✅ EXISTS
├── ai_service.py              # Main orchestrator ✅ EXISTS
├── bedrock_provider.py        # Text provider (primary) ✅ EXISTS
├── openai_provider.py         # Text provider (fallback) ✅ EXISTS
├── anthropic_provider.py      # Text provider (fallback) ✅ EXISTS
├── deterministic_provider.py  # Ultimate fallback ✅ EXISTS
├── cost_tracker.py            # Cost tracking ✅ EXISTS
├── rate_limiter.py            # Rate limiting ✅ EXISTS
└── templates.py               # Deterministic templates ✅ EXISTS

weave-api/app/services/images/
├── vision_service.py          # Image orchestrator ✅ EXISTS (Story 0.9)
├── gemini_vision_provider.py  # Image provider (primary) ✅ EXISTS
└── openai_vision_provider.py  # Image provider (fallback) ✅ EXISTS
```

**Existing AIService orchestrator** (from `ai_service.py`):
```python
class AIService:
    """
    Unified AI service with fallback chain and cost controls.

    Features:
    - Automatic fallback on provider failures
    - 24-hour caching with input_hash
    - Dual cost tracking (application-wide + per-user)
    - Role-based rate limiting (admin unlimited, paid 10/hour, free 10/day)
    - Budget enforcement with auto-throttle
    - Comprehensive logging to ai_runs table
    """

    def __init__(
        self,
        db: SupabaseClient,
        bedrock_region: str = 'us-east-1',
        openai_key: Optional[str] = None,
        anthropic_key: Optional[str] = None
    ):
        # Initializes all providers
        # Sets up cost_tracker and rate_limiter
        pass

    def generate(
        self,
        user_id: str,
        user_role: str = 'user',
        user_tier: str = 'free',
        module: str = 'triad',
        prompt: str = '',
        **kwargs
    ) -> AIResponse:
        """
        Generate AI response with automatic fallback chain.

        Already implements:
        - Rate limiting
        - Caching (24-hour)
        - Cost tracking
        - Budget enforcement
        - Fallback chain
        """
        pass
```

**What Story 1.5.3 proposes that already exists:**
- ❌ Provider abstraction (already `AIProvider`)
- ❌ Fallback chains (already in AIService)
- ❌ Cost tracking (already CostTracker)
- ❌ Rate limiting (already RateLimiter)
- ❌ Text providers (already Bedrock/OpenAI/Anthropic)
- ❌ Image providers (already Gemini/OpenAI Vision)

**What Story 1.5.3 proposes that's NEW:**
- ✅ `AIModuleBase` - Product feature abstraction (AC-9)
- ✅ Module-specific context building via `ContextBuilder` (AC-10)
- ✅ Module registry pattern (AC-9)
- ✅ Request routing to modules (AC-10)
- ⚠️ Audio providers (AC-4) - depends on Story 0.11 which isn't done yet

**Impact:** **CRITICAL** - 60% of the story (AC-1 through AC-6) is duplicate work.

**Correct Approach:**

Story 1.5.3 should **build on existing infrastructure**, not replace it:

```python
# CORRECT: New layer on top of existing AIService
from app.services.ai import AIService, AIResponse  # Import existing

class AIModuleBase(ABC):
    """
    NEW: Product feature abstraction (Onboarding Coach, Triad Planner, etc.)
    Uses existing AIService for provider orchestration.
    """

    def __init__(self, ai_service: AIService, context_builder: ContextBuilder):
        self.ai_service = ai_service  # Use existing service
        self.context_builder = context_builder

    @abstractmethod
    async def execute(self, user_id: str, operation_type: str, params: dict) -> dict:
        """Execute module operation using existing AIService."""
        # Build context
        context = await self.context_builder.get_context(user_id, operation_type)

        # Call existing AIService (not a new provider)
        response: AIResponse = self.ai_service.generate(
            user_id=user_id,
            user_role=context.get('role', 'user'),
            user_tier=context.get('tier', 'free'),
            module=self.get_module_name(),
            prompt=self._build_prompt(params, context)
        )

        # Parse and validate
        return self._parse_response(response.content)
```

**Required Changes:**
1. Remove AC-1 (provider abstraction already exists)
2. Update AC-2, AC-3 to acknowledge existing implementations
3. Mark AC-4 (audio) as blocked by Story 0.11
4. Remove AC-5, AC-6 (cost/rate limiting already implemented)
5. Update AC-7 to note `useAIChat` already exists (Story 6.1)
6. Update AC-9, AC-10 to integrate with existing `AIService`
7. Reduce estimate from 6-8 pts to 3-4 pts (only new module layer, not full infrastructure)

---

### 3. ❌ CRITICAL: AC-7 React Hooks Already Partially Implemented

**Issue:** Story proposes creating three React Native hooks (AC-7, lines 411-525):

```typescript
// Story 1.5.3 proposes creating:
// weave-mobile/src/hooks/useAIChat.ts
// weave-mobile/src/hooks/useImageAnalysis.ts
// weave-mobile/src/hooks/useVoiceTranscription.ts
```

**Reality:** Hooks already exist or are in progress:

1. **useAIChat.ts** - ✅ **ALREADY IMPLEMENTED** (Story 6.1):
   ```typescript
   // weave-mobile/src/hooks/useAIChat.ts (exists, 150+ lines)
   export function useAIChat() {
     // Full implementation with:
     // - sendMessage mutation
     // - getUsageStats query
     // - listConversations query
     // - getConversation query
     // - TanStack Query integration
     // - Error handling (429 rate limit, network errors)
     // - Loading states
   }
   ```

2. **useImageAnalysis.ts** - ❌ **MISSING** (needs to be created)

3. **useVoiceTranscription.ts** - ❌ **MISSING** (blocked by Story 0.11)

**Related Hooks Found:**
- `useImageUpload.ts` - Handles image upload to Supabase Storage
- `useImageList.ts` - Lists user's uploaded images
- `useImageDelete.ts` - Deletes images
- `useAIChatStream.ts` - Streaming variant of useAIChat

**Evidence:** Story 6.1 (AI Chat Interface) was implemented with full `useAIChat` hook before Story 1.5.3 infrastructure was created. This violates dependency order:

**Declared Dependencies (Story 1.5.3, lines 1272-1277):**
```markdown
**Blocks:**
- Story 1.8: Choose Your First Needle (uses Onboarding Coach module)
- Story 2.3: Create New Goal (uses Onboarding Coach module)
- Story 4.3: AI Feedback Generation (uses Triad Planner + Daily Recap modules)
- Story 6.1, 6.2: AI Chat (uses Dream Self Advisor module)
- Story 6.4: Weekly Insights (uses AI Insights Engine module)
```

**Reality:** Story 6.1 has status `ready-for-dev` and already has full implementation of `useAIChat`.

**Impact:** **HIGH** - Creates confusion about what needs to be implemented in AC-7.

**Correct Approach:**

AC-7 should be updated to:
1. Acknowledge `useAIChat` already exists (Story 6.1)
2. Create only missing hooks: `useImageAnalysis`, `useVoiceTranscription`
3. Document integration pattern with existing `useAIChat` as reference
4. Reduce AC-7 estimate from 1 pt to 0.5 pts (only 2 hooks, not 3)

---

### 4. ❌ CRITICAL: AC-10 Orchestrator Conflicts with Existing AIService

**Issue:** Story proposes new `AIOrchestrator` class (AC-10, lines 853-935):

```python
# Story 1.5.3 proposes:
class AIOrchestrator:
    """
    Central AI orchestrator that:
    1. Routes requests to correct AI module
    2. Coordinates Context Builder
    3. Enforces rate limiting
    4. Logs all AI calls to ai_runs table
    5. Handles fallback chains
    """
```

**Reality:** `AIService` already orchestrates providers with items 3, 4, 5:

```python
# Existing AIService (ai_service.py):
class AIService:
    """
    Unified AI service with fallback chain and cost controls.

    Features:
    - Automatic fallback on provider failures
    - 24-hour caching with input_hash
    - Dual cost tracking (application-wide + per-user)
    - Role-based rate limiting (admin unlimited, paid 10/hour, free 10/day)
    - Budget enforcement with auto-throttle
    - Comprehensive logging to ai_runs table
    """

    def generate(
        self,
        user_id: str,
        user_role: str = 'user',
        user_tier: str = 'free',
        module: str = 'triad',  # Already has module concept!
        prompt: str = '',
        **kwargs
    ) -> AIResponse:
        # Already implements:
        # ✅ Rate limiting (item 3)
        # ✅ Logging to ai_runs (item 4)
        # ✅ Fallback chains (item 5)
        pass
```

**Overlap Analysis:**

| Feature | Proposed AIOrchestrator | Existing AIService |
|---------|------------------------|-------------------|
| Routes requests | To AI modules ✅ NEW | To AI providers ✅ EXISTS |
| Context Builder | Yes ✅ NEW | No ❌ MISSING |
| Rate limiting | Yes ❌ DUPLICATE | Yes ✅ EXISTS |
| Logs to ai_runs | Yes ❌ DUPLICATE | Yes ✅ EXISTS |
| Fallback chains | Yes ❌ DUPLICATE | Yes ✅ EXISTS |

**Confusion:** Story doesn't explain relationship between:
- `AIOrchestrator` (proposed) - Routes to product modules
- `AIService` (exists) - Routes to AI providers

**Are these the same thing? Different layers? Should AIOrchestrator wrap AIService?**

**Impact:** **CRITICAL** - Without clarifying the relationship, developers will be confused about which to use.

**Correct Approach:**

Option 1: **AIOrchestrator wraps AIService** (recommended):

```python
# CORRECT: AIOrchestrator uses existing AIService for provider calls
class AIOrchestrator:
    """
    NEW: Routes requests to product modules (Triad, Onboarding, etc.)
    Uses existing AIService for provider orchestration.

    Separation of concerns:
    - AIOrchestrator: Product feature routing (which module?)
    - AIModules: Product feature logic (how to call AI?)
    - AIService: Provider routing (which AI provider?)
    - AIProviders: Provider implementation (API calls)
    """

    def __init__(
        self,
        module_registry: ModuleRegistry,
        context_builder: ContextBuilder,
        ai_service: AIService  # Use existing service
    ):
        self.module_registry = module_registry
        self.context_builder = context_builder
        self.ai_service = ai_service  # Delegate to existing infrastructure

    async def execute_ai_operation(
        self,
        user_id: str,
        operation_type: str,
        params: dict
    ) -> dict:
        """
        Route request to correct AI module.

        Flow:
        1. Get module for operation_type (NEW)
        2. Build context (NEW)
        3. Module calls AIService (EXISTING)
        4. AIService handles rate limiting, fallback, cost tracking (EXISTING)
        """
        # Get module
        module = self.module_registry.get_module(operation_type)

        # Build context
        context = await self.context_builder.get_context(user_id, operation_type)

        # Execute module (module uses existing AIService internally)
        result = await module.execute(user_id, operation_type, params, context)

        return result
```

Option 2: **Rename to avoid confusion**:
- Keep `AIService` for direct provider access
- Rename `AIOrchestrator` → `AIModuleRouter` (clearer purpose)

**Required Changes:**
1. Clarify that `AIOrchestrator` is a NEW LAYER on top of existing `AIService`
2. Update AC-10 to show `AIService` as dependency (not replacement)
3. Remove duplicate functionality from `AIOrchestrator` (rate limiting, logging, fallback)
4. Focus `AIOrchestrator` on module routing only
5. Add architectural diagram showing: `Request → AIOrchestrator → AIModule → AIService → AIProvider → API`

---

### 5. ❌ CRITICAL: Story Doesn't Acknowledge Existing Implementation

**Issue:** Story treats infrastructure as if it doesn't exist.

**Story 1.5.3 Overview (lines 19-30):**
> Stories 0.6 (AI Service), 0.9 (Image Service), and 0.11 (Voice STT) implemented text, image, and audio AI integrations **separately**. This story **extracts common patterns** into a unified abstraction (`AIProviderBase`)...

**Reality:** Stories 0.6 and 0.9 **already use unified abstraction**:

**Evidence from Story 0.6 implementation:**
```python
# All providers inherit from same AIProvider base
class BedrockProvider(AIProvider):
    # Implements complete(), count_tokens(), estimate_cost()

class OpenAIProvider(AIProvider):
    # Implements complete(), count_tokens(), estimate_cost()

class AnthropicProvider(AIProvider):
    # Implements complete(), count_tokens(), estimate_cost()
```

**Evidence from Story 0.9 implementation:**
```python
# Image providers also inherit from same base (or similar pattern)
# weave-api/app/services/images/gemini_vision_provider.py
# weave-api/app/services/images/openai_vision_provider.py
```

**The abstraction already exists!**

**What Story 1.5.3 ACTUALLY needs to do:**
1. Verify existing abstraction is sufficient for image/audio (not "extract patterns")
2. Add missing image/audio providers to existing framework
3. Create NEW module orchestration layer (AC-9, AC-10)
4. Document existing patterns (not create new ones)

**Impact:** **CRITICAL** - Story rationale is incorrect, leading to wrong implementation approach.

**Correct Rationale:**

> Stories 0.6, 0.9, 0.11 implemented provider abstraction and orchestration for text and image AI. **Story 1.5.3 adds a new product module orchestration layer** (AC-9, AC-10) on top of existing provider infrastructure, enabling feature-specific AI workflows (Onboarding Coach, Triad Planner, Dream Self Advisor) that build appropriate context before calling providers. Additionally, creates missing React Native hooks (useImageAnalysis, useVoiceTranscription) and documents all patterns.

**Required Changes:**
1. Rewrite Overview/Rationale to acknowledge existing infrastructure
2. Change "extract patterns" → "build on existing patterns"
3. Focus story on NEW functionality (module layer) not refactoring existing code
4. Update all ACs to reference existing components (`AIService`, `AIProvider`)

---

### 6. ❌ CRITICAL: Story 0.11 (Audio AI) Not Yet Implemented

**Issue:** AC-4 (Audio AI Standardization) depends on Story 0.11 which has status `ready-for-dev`.

**From sprint-status.yaml (line 99):**
```yaml
0-11-voice-stt-infrastructure: ready-for-dev  # 5 pts ⚡ NEW (2025-12-21) - AssemblyAI primary + Whisper fallback
```

**Status:** Story 0.11 is **not implemented yet**, only designed.

**Evidence:** No audio providers found in codebase:
- ❌ No `weave-api/app/services/audio/` directory
- ❌ No AssemblyAI provider
- ❌ No Whisper provider
- ❌ No `useVoiceTranscription` hook

**Impact:** **HIGH** - AC-4 cannot be implemented until Story 0.11 is complete.

**Dependency Chain:**
```
Story 0.11 (Voice/STT Infrastructure) [ready-for-dev]
    ↓ BLOCKS
Story 1.5.3 AC-4 (Audio AI Standardization)
    ↓ BLOCKS
Stories using voice transcription (Epic 3, 4)
```

**Correct Approach:**

Option 1: **Remove AC-4 from Story 1.5.3**
- Move AC-4 to Story 0.11 (where audio infrastructure should be created)
- Story 1.5.3 focuses on text/image only
- Reduce estimate: 6-8 pts → 4-5 pts

Option 2: **Make AC-4 explicitly conditional**
- Mark AC-4 as "Blocked by Story 0.11"
- Include in story but implement only after 0.11 is done
- Add to Definition of Done: "AC-4 deferred until Story 0.11 complete"

**Required Changes:**
1. Add dependency note: "AC-4 blocked by Story 0.11 (not yet implemented)"
2. Update Definition of Done to mark AC-4 as conditional
3. Update story points breakdown to note AC-4 is optional for this story
4. Consider moving AC-4 entirely to Story 0.11

---

### 7. ⚠️ MODERATE: Unclear Integration with FastAPI Dependency Injection

**Issue:** AC-9, AC-10 show AI module classes but don't explain FastAPI integration.

**Story shows** (lines 574-850):
```python
# AIModuleBase, 5 modules, ModuleRegistry, AIOrchestrator
# All shown as isolated classes
```

**Missing:** How do these integrate with FastAPI app initialization?

```python
# NOT SHOWN in story: How to wire up in main.py
from app.services.ai.ai_orchestrator import AIOrchestrator
from app.services.ai.module_registry import ModuleRegistry
from app.services.ai.modules import (
    OnboardingCoachModule,
    TriadPlannerModule,
    # ... etc
)

# Need to show:
def create_app():
    app = FastAPI()

    # Initialize orchestrator
    orchestrator = AIOrchestrator(
        module_registry=ModuleRegistry(),
        context_builder=ContextBuilder(db),
        ai_service=ai_service  # Existing AIService
    )

    # Register modules
    orchestrator.register_module(OnboardingCoachModule(...))
    orchestrator.register_module(TriadPlannerModule(...))
    # ...

    # Make available via dependency injection
    app.state.ai_orchestrator = orchestrator

    return app

# Dependency function
def get_ai_orchestrator(request: Request) -> AIOrchestrator:
    return request.app.state.ai_orchestrator
```

**Impact:** **MODERATE** - Developers will be unclear how to initialize and use the orchestrator.

**Required Changes:**
1. Add section: "FastAPI Integration" to AC-10
2. Show initialization code in `app/main.py`
3. Show dependency injection pattern
4. Show example endpoint using orchestrator

---

## Section 3: Moderate Issues

### 8. ⚠️ MODERATE: Missing Package Structure (__init__.py files)

**Issue:** File structure (lines 1113-1144) shows directories but doesn't mention `__init__.py` files:

```
weave-api/app/services/ai/
├── ai_module_base.py
├── ai_orchestrator.py
├── context_builder.py
├── module_registry.py
├── cost_calculator.py
├── providers/           # No __init__.py mentioned
│   ├── gpt4o_mini_provider.py
│   └── ...
└── modules/             # No __init__.py mentioned
    ├── onboarding_coach_module.py
    └── ...
```

**Required for Python packages:**
```
weave-api/app/services/ai/
├── __init__.py          # Export main classes
├── providers/
│   └── __init__.py      # Export all providers
└── modules/
    └── __init__.py      # Export all modules
```

**Impact:** **LOW** - Easy to fix, but omission could cause import errors.

**Required Changes:**
1. Add `__init__.py` files to file structure section
2. Show export pattern:
   ```python
   # app/services/ai/modules/__init__.py
   from .onboarding_coach_module import OnboardingCoachModule
   from .triad_planner_module import TriadPlannerModule
   # ...

   __all__ = [
       "OnboardingCoachModule",
       "TriadPlannerModule",
       # ...
   ]
   ```

---

### 9. ⚠️ MODERATE: Context Builder Implementation Too Sparse

**Issue:** `ContextBuilder` class (lines 939-1040) shows many private methods but all are just `pass`:

```python
class ContextBuilder:
    async def _get_identity_doc(self, user_id: str) -> Dict[str, Any]:
        """Fetch user's identity document"""
        pass  # No implementation guidance

    async def _get_active_goals(self, user_id: str) -> list:
        """Fetch user's active goals with subtasks"""
        pass  # No implementation guidance

    # ... 6 more methods, all just "pass"
```

**Missing:**
- Database queries for each method
- Error handling (what if user has no identity doc?)
- Performance considerations (N+1 queries?)
- Caching strategy (should context be cached?)

**Impact:** **MODERATE** - Developers implementing AC-10 will need to design these queries from scratch.

**Correct Approach:**

Show at least 1-2 example implementations:

```python
async def _get_active_goals(self, user_id: str) -> list:
    """Fetch user's active goals with subtasks."""
    # Query database
    response = self.db.table('goals') \
        .select('*, subtask_templates(*)') \
        .eq('user_id', user_id) \
        .eq('status', 'active') \
        .order('created_at', desc=False) \
        .execute()

    return [
        {
            'id': goal.id,
            'title': goal.title,
            'subtasks': [
                {'id': st.id, 'description': st.description}
                for st in goal.subtask_templates
            ]
        }
        for goal in response.data
    ]

async def _get_recent_completions(self, user_id: str, days: int) -> list:
    """Fetch recent subtask completions."""
    since = datetime.now() - timedelta(days=days)

    response = self.db.table('subtask_completions') \
        .select('*, subtask_templates(description)') \
        .eq('user_id', user_id) \
        .gte('completed_at', since.isoformat()) \
        .order('completed_at', desc=True) \
        .execute()

    return [
        {
            'completed_at': c.completed_at,
            'subtask': c.subtask_templates.description,
            'fulfillment_score': c.fulfillment_score
        }
        for c in response.data
    ]
```

**Required Changes:**
1. Add 2-3 example implementations for `ContextBuilder` methods
2. Document query patterns (using Supabase Python client)
3. Add error handling examples
4. Note that full implementation will be completed in Story 6.2 (Tech Context Engine)

---

### 10. ⚠️ MODERATE: AC-9 Module Implementations Too Abstract

**Issue:** 5 AI modules shown (lines 627-801) but all have just `pass` implementations:

```python
class OnboardingCoachModule(AIModuleBase):
    def get_module_name(self) -> str:
        return "onboarding_coach"

    async def execute(self, user_id: str, operation_type: str, params: Dict[str, Any]):
        if operation_type == "generate_goal_breakdown":
            # Shows some structure but...
            pass  # No real implementation
```

**Expected for Infrastructure Story:**
This is actually **acceptable for an infrastructure story**. The story is creating the **framework**, not implementing every module's business logic.

**However, story should clarify:**
- These are **stub implementations** for infrastructure setup
- Each module will be **fully implemented in its corresponding story**:
  - Onboarding Coach → Stories 1.8, 2.3
  - Triad Planner → Story 4.3
  - Daily Recap → Story 4.3
  - Dream Self Advisor → Stories 6.1, 6.2
  - AI Insights Engine → Story 6.4

**Impact:** **LOW** - Story is infrastructure-focused, stubs are appropriate.

**Required Changes:**
1. Add note to AC-9: "Module implementations are stubs for infrastructure story"
2. Add note: "Full module implementations will be completed in Epic 2-8 stories"
3. Update Definition of Done: "5 AI modules implemented (stub versions with registry)"
4. Clarify that stub = basic structure, not full business logic

---

## Section 4: Minor Issues

### 11. ✅ GOOD: Story Points Breakdown (With Corrections)

**Current Breakdown (lines 1060-1071):**

| Task | Estimate | Rationale |
|------|----------|-----------|
| AIProviderBase abstraction | 1 pt | Abstract class, common methods |
| Provider standardization (text/image/audio) | 2 pts | Extract patterns from Stories 0.6, 0.9, 0.11 |
| AI Module Abstraction (AC-9) | 1-2 pts | AIModuleBase, 5 module stubs, registry |
| AI Orchestrator (AC-10) | 1 pt | Orchestrator + Context Builder |
| React Native hooks | 1 pt | 3 hooks with loading/error states |
| AI services guide (updated) | 1-2 pts | Comprehensive developer documentation |

**Total: 6-8 story points**

**Corrected Breakdown (After Validation):**

| Task | Original Estimate | Corrected Estimate | Rationale |
|------|-------------------|-------------------|-----------|
| ~~AIProviderBase abstraction~~ | ~~1 pt~~ | **0 pts** | ❌ Already exists (AIProvider) |
| ~~Provider standardization~~ | ~~2 pts~~ | **0 pts** | ❌ Already standardized (Stories 0.6, 0.9) |
| AI Module Abstraction (AC-9) | 1-2 pts | **1-2 pts** | ✅ Genuinely new functionality |
| AI Orchestrator (AC-10) | 1 pt | **1-2 pts** | ✅ New, but needs integration with existing AIService (+0-1 pt) |
| React Native hooks | 1 pt | **0.5 pts** | ⚠️ Only 2 hooks needed (useImageAnalysis, useVoiceTranscription) |
| AI services guide | 1-2 pts | **0.5-1 pt** | ⚠️ Documenting existing + new (not creating from scratch) |
| **New: FastAPI Integration** | - | **0.5 pt** | Initialize orchestrator, dependency injection |

**Corrected Total: 3.5-6.5 story points** (down from 6-8 pts)

**Recommendation:** Estimate should be **4-5 story points** after removing duplicate work.

---

### 12. ⚠️ MINOR: Cost Calculator Utility Redundant

**Issue:** AC-5 proposes `CostCalculator` utility (lines 316-351):

```python
# Story 1.5.3 proposes:
class CostCalculator:
    PRICING = {
        "gpt-4o-mini": {"input": 0.15 / 1_000_000, "output": 0.60 / 1_000_000},
        # ...
    }

    @staticmethod
    def calculate_text_cost(provider: str, input_tokens: int, output_tokens: int):
        pass
```

**Reality:** Each provider already implements `estimate_cost()`:

```python
# Existing pattern (from AIProvider base class):
class OpenAIProvider(AIProvider):
    def estimate_cost(self, input_tokens: int, output_tokens: int, model: str) -> float:
        """Estimate USD cost using OpenAI pricing."""
        # Provider-specific pricing logic
        pass
```

**Also exists:** `CostTracker` class handles cost aggregation.

**Impact:** **LOW** - Creating `CostCalculator` would be duplicate code, but harmless if not used.

**Recommendation:** Remove `CostCalculator` from AC-5, reference existing `estimate_cost()` method in each provider.

---

## Section 5: What's Actually New in This Story?

After analyzing conflicts, here's what Story 1.5.3 **genuinely adds**:

### ✅ NEW: AC-9 - AI Module Abstraction

**What it adds:**
- `AIModuleBase` abstract class (product feature layer)
- 5 product modules: Onboarding Coach, Triad Planner, Daily Recap, Dream Self Advisor, AI Insights Engine
- `ModuleRegistry` for module lookup
- Separation of concerns: Modules (product features) vs Providers (AI APIs)

**Value:** Enables Epic 2-8 stories to use high-level modules instead of calling `AIService` directly.

**Status:** ✅ Genuinely new, not duplicate

---

### ✅ NEW: AC-10 - AI Orchestrator (with caveats)

**What it adds:**
- Request routing to product modules (not providers)
- `ContextBuilder` for assembling user state before AI calls
- Operation-to-module mapping
- Module execution flow

**Value:** Centralizes context building and module routing.

**Caveat:** Must integrate with existing `AIService`, not replace it.

**Status:** ✅ Genuinely new, but needs clarification on relationship with AIService

---

### ⚠️ PARTIAL: AC-7 - React Native Hooks

**What it adds:**
- ~~`useAIChat`~~ - ❌ Already exists (Story 6.1)
- `useImageAnalysis` - ✅ Needs to be created
- `useVoiceTranscription` - ⚠️ Blocked by Story 0.11

**Value:** Standard hooks for image/audio AI (text already has hook).

**Status:** ⚠️ Partially new (1-2 hooks, not 3)

---

### ✅ NEW: AC-8 - Documentation

**What it adds:**
- `docs/dev/ai-services-guide.md` (comprehensive AI integration guide)
- Provider decision tree
- Architecture updates

**Value:** Documents existing patterns + new module orchestration.

**Status:** ✅ Genuinely new (documentation doesn't exist yet, needs verification)

---

## Section 6: Recommended Revisions

### Option 1: Major Rewrite (Recommended)

**New Title:** "Story 1.5.3: AI Module Orchestration Layer"

**New Scope:**
- Remove AC-1 through AC-6 (already implemented in Stories 0.6, 0.9)
- Keep AC-9: AI Module Abstraction (NEW)
- Keep AC-10: AI Orchestrator + Context Builder (NEW)
- Update AC-7: Create only missing hooks (useImageAnalysis, useVoiceTranscription)
- Keep AC-8: Documentation (update to document existing + new)
- Add new AC: FastAPI integration

**New Estimate:** 4-5 story points (down from 6-8 pts)

**New Acceptance Criteria:**

1. **AC-1: AI Module Base Class** (was AC-9)
   - Create `AIModuleBase` abstract class
   - Define module interface: `execute()`, `get_module_name()`, `build_context()`
   - Document relationship with existing `AIService`

2. **AC-2: Five Product Modules** (was part of AC-9)
   - Stub implementations for 5 modules
   - Module registry pattern
   - Module-to-operation mapping

3. **AC-3: AI Orchestrator** (was AC-10)
   - Request routing to modules
   - Integration with existing `AIService`
   - Rate limiting coordination (use existing RateLimiter)
   - Cost logging coordination (use existing CostTracker)

4. **AC-4: Context Builder**
   - Assemble user context based on operation type
   - Implement 2-3 example context methods (with queries)
   - Document context schema for each operation

5. **AC-5: FastAPI Integration** (NEW)
   - Initialize orchestrator in `main.py`
   - Dependency injection pattern
   - Example endpoint using orchestrator

6. **AC-6: React Native Hooks** (was AC-7, reduced scope)
   - Create `useImageAnalysis` hook
   - Create `useVoiceTranscription` hook (or mark as blocked by Story 0.11)
   - Document hook pattern (reference existing `useAIChat`)

7. **AC-7: Documentation** (was AC-8)
   - Update `docs/dev/ai-services-guide.md` (add sections 9, 10, 11 for module orchestration)
   - Document existing provider architecture (don't create new docs for what exists)
   - Create architectural diagram showing full stack: Request → Orchestrator → Module → AIService → Provider → API

**New Story Points:** 4-5 pts

---

### Option 2: Minor Adjustments (Keep Structure)

If major rewrite is not feasible, minimum required changes:

1. **AC-1: Update to reference existing `AIProvider`**
   - Change all `AIProviderBase` → `AIProvider`
   - Change `call_ai()` → `complete()`
   - Note: "Standardization already complete (Story 0.6), this AC documents pattern"

2. **AC-2, AC-3: Mark as "documentation only"**
   - Text AI already standardized (Story 0.6)
   - Image AI already standardized (Story 0.9)
   - Change task from "implement" → "document existing patterns"

3. **AC-4: Mark as blocked**
   - "Blocked by Story 0.11 (not yet implemented)"
   - "Defer to Story 0.11 or future story"

4. **AC-5, AC-6: Mark as "use existing"**
   - Cost tracking: Use existing `CostTracker`
   - Rate limiting: Use existing `RateLimiter`
   - Change task from "implement" → "document integration"

5. **AC-7: Update for existing hook**
   - Note: `useAIChat` already exists (Story 6.1)
   - Create only: `useImageAnalysis`, `useVoiceTranscription`

6. **AC-9, AC-10: Add integration guidance**
   - Show how modules use existing `AIService`
   - Show FastAPI initialization
   - Clarify orchestrator purpose (module routing, not provider routing)

7. **Update estimate:** 6-8 pts → 4-5 pts

---

## Section 7: Validation Checklist

### Story Structure
- [x] Story header complete (status, epic, priority, estimate, type)
- [x] User story format present
- [x] Overview/Rationale section
- [x] Acceptance Criteria defined (10 ACs)
- [x] Story Points Breakdown
- [x] Definition of Done
- [x] Technical Implementation Notes
- [x] Testing Checklist
- [x] Related Stories

### Technical Accuracy
- [ ] ❌ **FAIL**: Proposes `AIProviderBase` that conflicts with existing `AIProvider`
- [ ] ❌ **FAIL**: Method signatures don't match existing patterns
- [ ] ❌ **FAIL**: Doesn't acknowledge existing AIService orchestrator
- [x] ✅ **PASS**: AC-9 (AI Modules) is genuinely new functionality
- [ ] ⚠️ **WARNING**: AC-10 (Orchestrator) overlaps with existing AIService

### Dependency Alignment
- [ ] ❌ **FAIL**: Assumes Story 0.11 (Audio AI) is complete but it's not (status: ready-for-dev)
- [x] ✅ **PASS**: Correctly identifies Stories 0.6, 0.9 as dependencies
- [ ] ❌ **FAIL**: Story 6.1 already implemented `useAIChat` before this "infrastructure" story

### Completeness
- [x] ✅ **PASS**: All 10 ACs have detailed descriptions
- [ ] ⚠️ **WARNING**: AC-10 Context Builder methods too sparse (all just "pass")
- [ ] ⚠️ **WARNING**: Missing FastAPI integration details
- [ ] ⚠️ **WARNING**: Missing package structure (__init__.py files)

### Testing Requirements
- [x] ✅ **PASS**: Comprehensive unit test list (lines 1183-1192)
- [x] ✅ **PASS**: Integration test scenarios (lines 1193-1199)
- [x] ✅ **PASS**: Frontend test scenarios (lines 1201-1205)
- [ ] ⚠️ **WARNING**: No tests for orchestrator initialization/startup

### Documentation Requirements
- [x] ✅ **PASS**: Clear documentation plan (AC-8)
- [x] ✅ **PASS**: Provider decision tree included
- [ ] ⚠️ **WARNING**: Doesn't mention updating existing docs vs creating new

### Conflicts with Existing Code
- [ ] ❌ **FAIL**: Multiple naming conflicts (AIProviderBase vs AIProvider)
- [ ] ❌ **FAIL**: Multiple method signature conflicts
- [ ] ❌ **FAIL**: Proposes creating infrastructure that already exists
- [x] ✅ **PASS**: AC-9, AC-10 don't conflict (genuinely new layer)

### Story Points Estimate
- [ ] ❌ **FAIL**: Estimate (6-8 pts) too high for actual new work (should be 4-5 pts)
- [x] ✅ **PASS**: Breakdown shows clear task allocation
- [ ] ⚠️ **WARNING**: Doesn't account for existing implementations

**Overall Validation Score:** 11/23 checks passed (48%)

**Status:** ❌ **STORY NOT READY FOR DEVELOPMENT**

---

## Section 8: Impact Analysis

### Epic 1.5 Impact

**Current Epic 1.5 Status (from sprint-status.yaml):**
- Story 1.5.1: Planned (8-10 pts) - Navigation Architecture
- Story 1.5.2: Planned (7-9 pts) - Backend Standardization + API Mapping
- Story 1.5.3: Planned (6-8 pts) - AI Services Standardization + Orchestration
- **Epic Total:** 21-27 pts

**If Story 1.5.3 revised to 4-5 pts:**
- Epic 1.5 Total: 21-27 pts → **19-24 pts** (-2-3 pts)
- Sprint impact: Minimal (Epic 1.5 not yet started)

### Future Story Impact

**Stories That Depend on Story 1.5.3:**

| Story | Dependency Type | Impact of Issues |
|-------|----------------|------------------|
| 1.8 - Choose Your First Needle | Uses Onboarding Coach module | ⚠️ Needs AC-9 (module layer) |
| 2.3 - Create New Goal | Uses Onboarding Coach module | ⚠️ Needs AC-9 (module layer) |
| 4.3 - AI Feedback Generation | Uses Triad Planner + Daily Recap | ⚠️ Needs AC-9 (module layer) |
| 6.1 - AI Chat | Uses Dream Self Advisor module | ❌ **CONFLICT**: Already implemented without waiting for 1.5.3 |
| 6.2 - Contextual AI Responses | Uses Tech Context Engine | ⚠️ Needs AC-10 (Context Builder) |
| 6.4 - Weekly Insights | Uses AI Insights Engine | ⚠️ Needs AC-9 (module layer) |

**Key Finding:** Story 6.1 was implemented without waiting for Story 1.5.3 infrastructure, suggesting:
1. Story 1.5.3's infrastructure dependencies were not actually required
2. Or Story 6.1 should have waited for 1.5.3 to be complete

---

## Section 9: Required Changes Summary

### High Priority (Must Fix Before Implementation)

1. **Rewrite AC-1**: Change `AIProviderBase` → reference existing `AIProvider`, document existing pattern instead of creating new class *(Effort: 1-2 hours)*

2. **Rewrite Overview/Rationale**: Acknowledge existing infrastructure (Stories 0.6, 0.9 already standardized), focus story on NEW module orchestration layer *(Effort: 30 min)*

3. **Update AC-2, AC-3**: Change from "implement" → "document existing patterns", remove provider implementation examples *(Effort: 1 hour)*

4. **Mark AC-4 as Blocked**: Audio AI depends on Story 0.11 (not yet implemented), defer or mark conditional *(Effort: 15 min)*

5. **Remove AC-5 CostCalculator**: Use existing `CostTracker` and provider `estimate_cost()` methods *(Effort: 15 min)*

6. **Update AC-10 Integration**: Show how `AIOrchestrator` uses existing `AIService`, add architectural diagram *(Effort: 1 hour)*

7. **Add FastAPI Integration Section**: Show initialization in `main.py`, dependency injection pattern *(Effort: 30 min)*

8. **Update Story Points**: Reduce from 6-8 pts → 4-5 pts *(Effort: 5 min)*

**Total Revision Effort:** 4-5 hours

---

### Medium Priority (Should Fix for Clarity)

9. **Update AC-7**: Note `useAIChat` already exists (Story 6.1), create only 2 remaining hooks *(Effort: 15 min)*

10. **Add Context Builder Examples**: Show 2-3 example implementations with database queries *(Effort: 1 hour)*

11. **Clarify Module Stub Implementations**: Add note that modules are stubs for infrastructure story, full logic in Epic 2-8 *(Effort: 10 min)*

12. **Add Package Structure**: Mention `__init__.py` files in file structure section *(Effort: 10 min)*

**Total Revision Effort:** 1.5-2 hours

---

### Low Priority (Nice to Have)

13. **Add Architectural Diagram**: Show full stack (Request → Orchestrator → Module → AIService → Provider → API) *(Effort: 30 min)*

14. **Add Migration Notes**: Document how existing code integrates with new layer *(Effort: 20 min)*

---

## Section 10: Alternative Recommendation - Split Story

### Option: Split into Two Stories

Given the conflicts, consider splitting Story 1.5.3 into:

**Story 1.5.3a: AI Services Documentation (2 pts)**
- Document existing provider infrastructure (Stories 0.6, 0.9)
- Create `docs/dev/ai-services-guide.md`
- Document provider decision tree
- Document cost tracking and rate limiting patterns
- Create missing React Native hooks (useImageAnalysis, useVoiceTranscription)

**Story 1.5.3b: AI Module Orchestration (3 pts)**
- Create `AIModuleBase` abstract class (AC-9)
- Create 5 product module stubs (AC-9)
- Create `ModuleRegistry` (AC-9)
- Create `AIOrchestrator` request router (AC-10)
- Create `ContextBuilder` (AC-10)
- FastAPI integration

**Benefits:**
- Clearer separation: Documentation vs new functionality
- Story 1.5.3a can be done quickly (2 pts, mostly docs)
- Story 1.5.3b focuses on genuinely new code
- Easier to estimate and implement

**Total:** 5 pts (same as revised single story)

---

## Section 11: Validation Recommendations

### Immediate Actions (Before Implementation)

1. **Decision Required:** Choose revision approach:
   - **Option 1:** Major rewrite (focus on AC-9, AC-10 only) - **RECOMMENDED**
   - **Option 2:** Minor adjustments (update all ACs to reference existing code)
   - **Option 3:** Split into 2 stories (documentation + orchestration)

2. **Read Existing Code:** Before revising, implementer should read:
   - `weave-api/app/services/ai/base.py` (existing AIProvider)
   - `weave-api/app/services/ai/ai_service.py` (existing orchestrator)
   - `weave-api/app/services/images/vision_service.py` (image AI pattern)
   - `weave-mobile/src/hooks/useAIChat.ts` (existing hook pattern)

3. **Verify Story 0.11 Status:** Confirm whether audio AI will be implemented before or after Story 1.5.3

4. **Update Sprint Change Proposal:** The Sprint Change Proposal (dated 2025-12-22) that expanded Story 1.5.3 was based on assumptions about infrastructure gaps. Need to update proposal with actual findings.

### Blocked Until

- [ ] Story 1.5.3 rewritten to address critical issues
- [ ] Clarified relationship between `AIOrchestrator` (new) and `AIService` (existing)
- [ ] Decision on Story 0.11 (audio AI) - implement first or defer AC-4?

### Next Steps

1. **Review this validation report** with Product Owner / Tech Lead
2. **Choose revision approach** (Option 1, 2, or 3)
3. **Rewrite story** based on chosen approach
4. **Re-validate** after rewrite
5. **Update sprint-status.yaml** with corrected estimate
6. **Proceed with implementation** only after validation passes

---

## Section 12: Positive Findings

Despite critical issues, Story 1.5.3 has strong elements:

### ✅ GOOD: AC-9 AI Module Abstraction Design

The product module abstraction (AC-9) is well-designed:
- Clear separation of concerns (modules = product features, providers = AI APIs)
- 5 modules correctly mapped to Epic 2-8 stories
- Module registry pattern is clean and extensible
- Abstract base class has appropriate methods

**This part of the story is excellent** and ready for implementation once dependencies are clarified.

---

### ✅ GOOD: Context Builder Concept

The `ContextBuilder` concept (AC-10) addresses a real need:
- Different AI operations need different context (onboarding: minimal, chat: full)
- Centralizes user state assembly (identity + goals + history + patterns)
- Operation-specific context building is smart design

**Implementation details need work** (methods are just "pass"), but the design is sound.

---

### ✅ GOOD: Comprehensive Testing Checklist

Testing section (lines 1181-1205) is thorough:
- Unit tests for each component
- Integration tests for orchestrator flow
- Frontend tests for all hooks
- Rate limiting tests
- Cost calculation tests

**No changes needed** for testing section (once story scope is corrected).

---

### ✅ GOOD: Clear Integration with Epic 2-8

Story clearly identifies which Epic 2-8 stories use which modules:
- Stories 1.8, 2.3 → Onboarding Coach
- Story 4.3 → Triad Planner + Daily Recap
- Stories 6.1, 6.2 → Dream Self Advisor
- Story 6.4 → AI Insights Engine

**This mapping is valuable** and should be preserved in revision.

---

## Appendix A: Existing AI Infrastructure Inventory

### Text AI (Story 0.6) ✅ COMPLETE

**Location:** `weave-api/app/services/ai/`

**Components:**
- `base.py` - `AIProvider` abstract class, `AIResponse` dataclass, `AIProviderError`
- `ai_service.py` - Main orchestrator with 4-tier fallback chain
- `bedrock_provider.py` - AWS Bedrock (primary)
- `openai_provider.py` - GPT-4o, GPT-4o-mini (fallback)
- `anthropic_provider.py` - Claude 3.7 Sonnet, Claude 3.5 Haiku (fallback)
- `deterministic_provider.py` - Template fallback (ultimate)
- `cost_tracker.py` - Dual cost tracking
- `rate_limiter.py` - Role-based rate limiting
- `templates.py` - Deterministic templates

**Features:**
- ✅ Provider abstraction
- ✅ Fallback chains (4-tier)
- ✅ Cost tracking (ai_runs table)
- ✅ Rate limiting (role-based)
- ✅ 24-hour caching (input_hash)
- ✅ Budget enforcement

---

### Image AI (Story 0.9) ✅ COMPLETE

**Location:** `weave-api/app/services/images/`

**Components:**
- `vision_service.py` - Image AI orchestrator
- `gemini_vision_provider.py` - Gemini 3.0 Flash (primary)
- `openai_vision_provider.py` - GPT-4o Vision (fallback)

**Frontend Hooks:**
- `weave-mobile/src/hooks/useImageUpload.ts` - Upload to Supabase Storage
- `weave-mobile/src/hooks/useImageList.ts` - List user images
- `weave-mobile/src/hooks/useImageDelete.ts` - Delete images

**Missing:**
- ❌ `useImageAnalysis.ts` - Hook for AI-powered image analysis (Story 1.5.3 should create this)

---

### Audio AI (Story 0.11) ❌ NOT IMPLEMENTED

**Status:** ready-for-dev (planned but not built)

**From sprint-status.yaml:**
```yaml
0-11-voice-stt-infrastructure: ready-for-dev  # 5 pts ⚡ NEW (2025-12-21)
```

**Expected (when implemented):**
- AssemblyAI provider (primary) - $0.15/hr
- Whisper API provider (fallback) - $0.36/hr
- `useVoiceTranscription` hook

**Current Reality:**
- ❌ No audio service directory
- ❌ No AssemblyAI provider
- ❌ No Whisper provider
- ❌ No voice/transcription hooks

**Impact on Story 1.5.3:**
- AC-4 (Audio AI Standardization) cannot be implemented
- `useVoiceTranscription` hook cannot be created
- Must defer AC-4 or wait for Story 0.11

---

### Chat AI (Story 6.1) ✅ PARTIALLY IMPLEMENTED

**Location:** `weave-mobile/src/hooks/`

**Components:**
- `useAIChat.ts` - Full chat hook with:
  - Send message mutation
  - Get usage stats (tiered: premium/free/monthly)
  - List conversations query
  - Get conversation detail query
  - TanStack Query integration
  - Rate limiting UI (429 handling)
  - Loading states

**Backend:**
- `weave-api/app/api/ai_chat_router.py` - Chat API endpoints
- `weave-api/app/models/ai_chat_models.py` - Pydantic schemas
- `weave-api/app/services/checkin_scheduler.py` - Server-initiated check-ins

**Status:** Story 6.1 status is `ready-for-dev` but code already exists (suggests recent implementation)

**Implication:** Story 6.1 implemented chat WITHOUT waiting for Story 1.5.3 infrastructure, demonstrating:
1. Story 1.5.3 infrastructure may not be strictly required
2. Or Story 6.1 should have waited for 1.5.3 (dependency violation)

---

## Appendix B: Code Example Comparisons

### Provider Interface: Proposed vs Existing

**Story 1.5.3 Proposes (AC-1, lines 48-70):**
```python
class AIProviderBase(ABC):
    @abstractmethod
    async def call_ai(self, input: Any, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute AI operation."""
        pass

    @abstractmethod
    def estimate_cost(self, input: Any) -> float:
        """Estimate cost before calling AI."""
        pass

    @abstractmethod
    def get_provider_name(self) -> str:
        """Return provider identifier"""
        pass

    async def log_to_ai_runs(self, ...):
        """Log AI call to ai_runs table."""
        pass

    async def check_rate_limit(self, user_id: str, operation_type: str):
        """Check if user has exceeded rate limit."""
        pass
```

**Existing Implementation (base.py):**
```python
class AIProvider(ABC):
    @abstractmethod
    def complete(self, prompt: str, model: str, **kwargs) -> AIResponse:
        """Generate AI completion for the given prompt."""
        pass

    @abstractmethod
    def count_tokens(self, text: str, model: str) -> int:
        """Count tokens in text for the given model."""
        pass

    @abstractmethod
    def estimate_cost(self, input_tokens: int, output_tokens: int, model: str) -> float:
        """Estimate USD cost for token counts."""
        pass

# Note: log_to_ai_runs() and check_rate_limit() are NOT in AIProvider
# They're handled by AIService orchestrator (separation of concerns)
```

**Key Differences:**
1. Method names: `call_ai()` vs `complete()`
2. Input format: Generic `input: Any` vs specific `prompt: str, model: str`
3. Response format: `Dict[str, Any]` vs `AIResponse` dataclass
4. Additional methods: Story adds `log_to_ai_runs()`, `check_rate_limit()` (existing has these in AIService)
5. Token counting: Story omits `count_tokens()`, existing includes it

**Which is better?**

**Existing `AIProvider` is better** because:
- ✅ Separation of concerns (providers generate, AIService tracks cost/limits)
- ✅ Token counting for cost estimation
- ✅ Type-safe response with `AIResponse` dataclass
- ✅ Already implemented by 6 providers (working in production)

---

### Orchestrator: Proposed vs Existing

**Story 1.5.3 Proposes (AC-10):**
```python
class AIOrchestrator:
    """Routes requests to correct AI module"""

    def __init__(
        self,
        module_registry: AIModuleRegistry,
        context_builder: ContextBuilder,
        text_provider: AIProviderBase,
        image_provider: AIProviderBase,
        audio_provider: AIProviderBase
    ):
        pass

    async def execute_ai_operation(
        self,
        user_id: str,
        operation_type: str,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        # 1. Check rate limits
        # 2. Get module
        # 3. Execute module
        # 4. Log to ai_runs
        pass
```

**Existing Implementation (ai_service.py):**
```python
class AIService:
    """Unified AI service with fallback chain"""

    def __init__(
        self,
        db: SupabaseClient,
        bedrock_region: str = 'us-east-1',
        openai_key: Optional[str] = None,
        anthropic_key: Optional[str] = None
    ):
        # Initializes all providers
        # Sets up cost_tracker and rate_limiter
        pass

    def generate(
        self,
        user_id: str,
        user_role: str = 'user',
        user_tier: str = 'free',
        module: str = 'triad',  # Already has module concept!
        prompt: str = '',
        **kwargs
    ) -> AIResponse:
        # Already implements:
        # ✅ Rate limiting (item 1)
        # ✅ Provider routing (item 2)
        # ✅ Provider execution (item 3)
        # ✅ Logging to ai_runs (item 4)
        pass
```

**Comparison:**

| Responsibility | Proposed AIOrchestrator | Existing AIService |
|---------------|-------------------------|-------------------|
| Module routing | ✅ Routes to product modules | ❌ No module routing |
| Context building | ✅ ContextBuilder | ❌ No context builder |
| Provider routing | ✅ Routes to providers | ✅ Already does this |
| Rate limiting | ✅ Checks daily_aggregates | ✅ Already does this |
| Cost tracking | ✅ Logs to ai_runs | ✅ Already does this |
| Fallback chains | ✅ Provider fallback | ✅ Already does this |

**Key Insight:**
- **Proposed AIOrchestrator** = Module layer (NEW) + Provider layer (DUPLICATE)
- **Existing AIService** = Provider layer only (EXISTS)
- **Correct design:** AIOrchestrator should use AIService, not replace it

---

## Section 13: Final Validation Verdict

**Validation Status:** ❌ **CRITICAL ISSUES - STORY NOT READY FOR DEVELOPMENT**

**Severity Breakdown:**
- **5 Critical Issues**: Naming conflicts, duplicate infrastructure, missing dependencies, sequencing violations
- **3 Moderate Issues**: Integration gaps, partial implementations, architectural clarity
- **3 Minor Issues**: Package structure, cost calculator redundancy, documentation gaps

**Implementation Risk:** **HIGH** - Implementing as-written would:
1. Create duplicate infrastructure conflicting with existing code
2. Waste 3-4 story points on unnecessary refactoring
3. Introduce naming conflicts requiring major refactoring of Stories 0.6, 0.9
4. Fail to deliver actual value (AC-9, AC-10) due to confusion about scope

**Recommended Path Forward:**

1. **STOP**: Do not implement Story 1.5.3 as currently written
2. **REWRITE**: Focus story exclusively on NEW functionality (AC-9: Modules, AC-10: Orchestrator)
3. **INTEGRATE**: Show how new layer uses existing AIService infrastructure
4. **REDUCE**: Lower estimate from 6-8 pts → 4-5 pts
5. **VALIDATE**: Re-run validation after rewrite
6. **IMPLEMENT**: Only after validation passes

**Estimated Rewrite Time:** 5-7 hours (concentrated effort)

**Validation Sign-Off:** ❌ **REJECTED - REQUIRES REVISION**

---

**✅ Validation Report Complete**

**Generated:** 2025-12-22
**Validator:** AI Agent (Story Validation Workflow)
**Report Location:** `docs/stories/validation-reports/validation-report-story-1.5.3-20251222.md`
**Status:** Report ready for review by Product Owner / Tech Lead

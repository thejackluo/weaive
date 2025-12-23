# Story 1.5.3: AI Module Orchestration Layer

**Status:** ready-for-dev
**Epic:** 1.5 - Development Infrastructure
**Priority:** S (Should Have)
**Estimate:** 4-5 story points
**Type:** Infrastructure

---

## Story

**As a** developer
**I want to** have a product module orchestration layer on top of existing AI provider infrastructure
**So that** I can implement Epic 2-8 AI features with consistent context building, module routing, and standardized patterns

---

## Overview / Rationale

**Existing Infrastructure (Stories 0.6, 0.9):**
- ✅ `AIProvider` abstract class with 6 implementations (Bedrock, OpenAI, Anthropic, Deterministic, Gemini Vision, OpenAI Vision)
- ✅ `AIService` orchestrator with 4-tier fallback chain, cost tracking, rate limiting, 24-hour caching
- ✅ `CostTracker` for dual cost tracking (application-wide + per-user)
- ✅ `RateLimiter` with role-based limits (admin unlimited, paid 10/hour, free 10/day)
- ✅ Text AI and Image AI fully operational

**What This Story Adds:**
This story creates a **new product module orchestration layer** on top of existing provider infrastructure, enabling:

- **AI Module Abstraction:** 5 product feature modules (Onboarding Coach, Triad Planner, Daily Recap, Dream Self Advisor, AI Insights Engine)
- **Module Registry:** Maps operation types to module instances
- **AI Orchestrator:** Routes requests to correct module, coordinates context building
- **Context Builder:** Assembles user state (identity, goals, history, patterns) before AI calls
- **Frontend Hooks:** React Native hooks for image/audio AI (text hook already exists)
- **Documentation:** Comprehensive developer guide with orchestration patterns

**Separation of Concerns:**
```
Request → AIOrchestrator (NEW - which product module?)
       → AIModule (NEW - what context to build?)
       → AIService (EXISTS - which AI provider?)
       → AIProvider (EXISTS - API call implementation)
```

**Epic 2-8 Benefits:**
- 15+ AI integrations use module orchestration (not direct provider calls)
- Context building standardized (different operations need different data)
- Module registry enables dynamic feature loading
- Simplified Epic 2-8 implementation (use orchestrator, not raw AIService)

---

## Acceptance Criteria

### AC-1: AI Module Base Class

**Create `AIModuleBase` Abstract Class:**

```python
# weave-api/app/services/ai/ai_module_base.py
from abc import ABC, abstractmethod
from typing import Dict, Any
from app.services.ai import AIService  # Use existing AIService

class AIModuleBase(ABC):
    """
    Base class for all AI product modules.

    Modules represent product features (Onboarding, Triad, Recap, Dream Self, Insights)
    that use existing AIService for provider orchestration.
    """

    def __init__(self, ai_service: AIService, context_builder):
        """
        Args:
            ai_service: Existing AIService for provider calls
            context_builder: ContextBuilder for user state assembly
        """
        self.ai_service = ai_service  # Use existing service
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

**Implementation Checklist:**
- [ ] Create `weave-api/app/services/ai/ai_module_base.py`
- [ ] Import existing `AIService` (don't create new provider layer)
- [ ] Document relationship: Modules use AIService, AIService uses AIProviders
- [ ] Write unit tests for abstract class interface

---

### AC-2: Five Product Module Implementations

**Create 5 AI Modules (Stub Implementations):**

```python
# 1. Onboarding Coach Module
# weave-api/app/services/ai/modules/onboarding_coach_module.py
from app.services.ai.ai_module_base import AIModuleBase
from app.services.ai import AIService, AIResponse  # Use existing

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
            # Build minimal context (onboarding needs less)
            context = await self.build_context(user_id, operation_type)

            # Call existing AIService (not a new provider)
            response: AIResponse = self.ai_service.generate(
                user_id=user_id,
                user_role=context.get('role', 'user'),
                user_tier=context.get('tier', 'free'),
                module=self.get_module_name(),
                prompt=self._build_prompt(params, context)
            )

            # Parse and validate
            parsed = self._parse_goal_breakdown(response.content)
            await self.validate_output(parsed)

            return parsed

        elif operation_type == "create_identity_doc_v1":
            # Similar pattern
            pass

    def _build_prompt(self, params: dict, context: dict) -> str:
        """Build prompt from params + context"""
        return f"User wants to achieve: {params['goal_input']}. Help them break it down into actionable steps."

    def _parse_goal_breakdown(self, text: str) -> Dict[str, Any]:
        """Parse AI response into structured goal breakdown"""
        # TODO: Implement JSON parsing/extraction
        return {"title": "...", "q_goals": [...], "binds": [...]}


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

        # Call existing AIService with context
        response: AIResponse = self.ai_service.generate(
            user_id=user_id,
            user_role=context.get('role', 'user'),
            user_tier=context.get('tier', 'free'),
            module=self.get_module_name(),
            prompt=self._build_triad_prompt(params, context)
        )

        # Parse and validate
        triad = self._parse_triad(response.content)
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

        # Generate recap using existing AIService
        response: AIResponse = self.ai_service.generate(
            user_id=user_id,
            user_role=context.get('role', 'user'),
            user_tier=context.get('tier', 'free'),
            module=self.get_module_name(),
            prompt=self._build_recap_prompt(params, context)
        )

        return {"recap_text": response.content, "sentiment": "positive"}


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

        # Conversational response using existing AIService
        response: AIResponse = self.ai_service.generate(
            user_id=user_id,
            user_role=context.get('role', 'user'),
            user_tier=context.get('tier', 'free'),
            module=self.get_module_name(),
            prompt=self._build_chat_prompt(params, context)
        )

        return {"message": response.content}


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

        # Generate insights using existing AIService
        response: AIResponse = self.ai_service.generate(
            user_id=user_id,
            user_role=context.get('role', 'user'),
            user_tier=context.get('tier', 'free'),
            module=self.get_module_name(),
            prompt=self._build_insights_prompt(params, context)
        )

        return {"insights": self._parse_insights(response.content)}
```

**Implementation Checklist:**
- [ ] Create `weave-api/app/services/ai/modules/` directory
- [ ] Implement 5 module files (stub versions with registry integration)
- [ ] Each module uses existing `AIService.generate()` method
- [ ] Write unit tests for each module (stub implementations OK)
- [ ] Document operation-to-module mapping

**Note:** These are **stub implementations** for infrastructure setup. Full business logic will be completed in Epic 2-8 stories that use these modules.

---

### AC-3: Module Registry Pattern

**Create Module Registry:**

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
        # Map operation types to modules
        operation_module_map = {
            'generate_goal_breakdown': 'onboarding_coach',
            'create_identity_doc_v1': 'onboarding_coach',
            'generate_triad': 'triad_planner',
            'generate_recap': 'daily_recap',
            'chat_response': 'dream_self_advisor',
            'generate_weekly_insights': 'ai_insights'
        }

        module_name = operation_module_map.get(operation_type)
        if not module_name:
            raise ValueError(f"No module registered for operation: {operation_type}")

        module = self._modules.get(module_name)
        if not module:
            raise ValueError(f"Module not found: {module_name}")

        return module

    def list_modules(self) -> Dict[str, AIModuleBase]:
        """List all registered modules"""
        return self._modules.copy()
```

**Implementation Checklist:**
- [ ] Create `weave-api/app/services/ai/module_registry.py`
- [ ] Implement module registration pattern
- [ ] Add operation-to-module mapping
- [ ] Write unit tests for registry lookup

---

### AC-4: AI Orchestrator (Request Router)

**Create AI Orchestrator:**

```python
# weave-api/app/services/ai/ai_orchestrator.py
from app.services.ai.module_registry import AIModuleRegistry
from app.services.ai.context_builder import ContextBuilder
from app.services.ai import AIService  # Use existing service
from typing import Dict, Any

class AIOrchestrator:
    """
    Central AI orchestrator that routes requests to product modules.

    Separation of concerns:
    - AIOrchestrator: Product feature routing (which module?)
    - AIModules: Product feature logic (how to call AI?)
    - AIService: Provider routing (which AI provider?) [EXISTING]
    - AIProviders: Provider implementation (API calls) [EXISTING]

    Does NOT duplicate existing AIService functionality:
    - Rate limiting → handled by AIService
    - Cost tracking → handled by AIService
    - Fallback chains → handled by AIService
    """

    def __init__(
        self,
        module_registry: AIModuleRegistry,
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
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute AI operation by routing to correct module.

        Flow:
        1. Get module for operation_type (NEW)
        2. Module builds context (NEW)
        3. Module calls AIService.generate() (EXISTING)
        4. AIService handles rate limiting, fallback, cost tracking (EXISTING)
        5. Module parses and validates output (NEW)

        Args:
            user_id: User identifier
            operation_type: Operation type (e.g., 'generate_triad', 'chat_response')
            params: Operation-specific parameters

        Returns:
            Structured AI output from module
        """

        # Get module for this operation
        module = self.module_registry.get_module(operation_type)
        if not module:
            raise ValueError(f"No module registered for operation: {operation_type}")

        # Execute module (module uses existing AIService internally)
        result = await module.execute(user_id, operation_type, params)

        return result
```

**Implementation Checklist:**
- [ ] Create `weave-api/app/services/ai/ai_orchestrator.py`
- [ ] Integrate with existing `AIService` (don't duplicate functionality)
- [ ] Focus orchestrator on module routing only
- [ ] Remove rate limiting, cost tracking, fallback from orchestrator (already in AIService)
- [ ] Write integration tests for orchestrator flow

**Architectural Clarity:**
```
Request → AIOrchestrator.execute_ai_operation()
       → module_registry.get_module(operation_type)  [NEW]
       → module.execute(user_id, operation_type, params)  [NEW]
       → context_builder.get_context(user_id, operation_type)  [NEW]
       → ai_service.generate(user_id, module, prompt)  [EXISTING]
       → rate_limiter.check_limit()  [EXISTING]
       → provider.complete(prompt, model)  [EXISTING]
       → cost_tracker.log_run()  [EXISTING]
```

---

### AC-5: Context Builder Implementation

**Create Context Builder:**

```python
# weave-api/app/services/ai/context_builder.py
from typing import Dict, Any
from datetime import datetime, timedelta
from supabase import Client

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

    Different operations need different context:
    - Onboarding: minimal (just user input)
    - Triad: goals + history + journal
    - Recap: today's completions + captures + journal
    - Chat: full context (identity + goals + history + patterns)
    - Insights: 30-day history + patterns
    """

    def __init__(self, db: Client):
        self.db = db

    async def get_context(self, user_id: str, operation_type: str) -> Dict[str, Any]:
        """
        Build context based on operation type.

        Args:
            user_id: User identifier
            operation_type: Operation type to determine context scope

        Returns:
            Context dictionary with user state
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
        response = self.db.table('identity_docs') \
            .select('*') \
            .eq('user_id', user_id) \
            .single() \
            .execute()

        if response.data:
            return {
                'archetype': response.data.get('archetype'),
                'dream_self': response.data.get('dream_self'),
                'motivations': response.data.get('motivations')
            }
        return {}

    async def _get_active_goals(self, user_id: str) -> list:
        """Fetch user's active goals with subtasks"""
        response = self.db.table('goals') \
            .select('*, subtask_templates(*)') \
            .eq('user_id', user_id) \
            .eq('status', 'active') \
            .order('created_at', desc=False) \
            .execute()

        return [
            {
                'id': goal['id'],
                'title': goal['title'],
                'subtasks': [
                    {'id': st['id'], 'description': st['description']}
                    for st in goal.get('subtask_templates', [])
                ]
            }
            for goal in response.data
        ]

    async def _get_recent_completions(self, user_id: str, days: int) -> list:
        """Fetch recent subtask completions"""
        since = datetime.now() - timedelta(days=days)

        response = self.db.table('subtask_completions') \
            .select('*, subtask_templates(description)') \
            .eq('user_id', user_id) \
            .gte('completed_at', since.isoformat()) \
            .order('completed_at', desc=True) \
            .execute()

        return [
            {
                'completed_at': c['completed_at'],
                'subtask': c['subtask_templates']['description'],
                'fulfillment_score': c.get('fulfillment_score')
            }
            for c in response.data
        ]

    async def _get_recent_journals(self, user_id: str, days: int) -> list:
        """Fetch recent journal entries"""
        since = datetime.now() - timedelta(days=days)

        response = self.db.table('journal_entries') \
            .select('*') \
            .eq('user_id', user_id) \
            .gte('entry_date', since.isoformat()) \
            .order('entry_date', desc=True) \
            .execute()

        return [
            {
                'date': j['entry_date'],
                'content': j.get('journal_text'),
                'fulfillment_score': j.get('fulfillment_score')
            }
            for j in response.data
        ]

    async def _get_today_completions(self, user_id: str) -> list:
        """Fetch today's completions"""
        today = datetime.now().date().isoformat()

        response = self.db.table('subtask_completions') \
            .select('*, subtask_templates(description)') \
            .eq('user_id', user_id) \
            .gte('completed_at', today) \
            .execute()

        return [{'subtask': c['subtask_templates']['description']} for c in response.data]

    async def _get_today_captures(self, user_id: str) -> list:
        """Fetch today's captures (photos, notes, audio)"""
        today = datetime.now().date().isoformat()

        response = self.db.table('captures') \
            .select('*') \
            .eq('user_id', user_id) \
            .gte('captured_at', today) \
            .execute()

        return [{'type': c['capture_type'], 'url': c.get('file_url')} for c in response.data]

    async def _get_today_journal(self, user_id: str) -> Dict[str, Any]:
        """Fetch today's journal entry"""
        today = datetime.now().date().isoformat()

        response = self.db.table('journal_entries') \
            .select('*') \
            .eq('user_id', user_id) \
            .eq('entry_date', today) \
            .single() \
            .execute()

        if response.data:
            return {
                'content': response.data.get('journal_text'),
                'fulfillment_score': response.data.get('fulfillment_score')
            }
        return {}

    async def _get_user_patterns(self, user_id: str) -> Dict[str, Any]:
        """Compute user behavior patterns (peak times, consistency, etc.)"""
        # TODO: Implement pattern analysis
        # - Best completion times
        # - Consistency percentage
        # - Streak length
        # - Goal completion rates
        return {}
```

**Implementation Checklist:**
- [ ] Create `weave-api/app/services/ai/context_builder.py`
- [ ] Implement 2-3 example context methods with Supabase queries
- [ ] Document query patterns (using Supabase Python client)
- [ ] Add error handling for missing data
- [ ] Note that full implementation will be completed in Story 6.2 (Tech Context Engine)

---

### AC-6: FastAPI Integration

**Initialize Orchestrator in FastAPI App:**

```python
# weave-api/app/main.py
from fastapi import FastAPI, Depends
from app.services.ai import AIService  # Existing service
from app.services.ai.ai_orchestrator import AIOrchestrator
from app.services.ai.module_registry import AIModuleRegistry
from app.services.ai.context_builder import ContextBuilder
from app.services.ai.modules import (
    OnboardingCoachModule,
    TriadPlannerModule,
    DailyRecapModule,
    DreamSelfAdvisorModule,
    AIInsightsModule
)

def create_app() -> FastAPI:
    app = FastAPI()

    # Initialize existing AIService
    ai_service = AIService(
        db=get_supabase_client(),
        bedrock_region='us-east-1',
        openai_key=os.getenv('OPENAI_API_KEY'),
        anthropic_key=os.getenv('ANTHROPIC_API_KEY')
    )

    # Initialize context builder
    context_builder = ContextBuilder(db=get_supabase_client())

    # Initialize module registry
    module_registry = AIModuleRegistry()

    # Register modules
    module_registry.register_module(OnboardingCoachModule(ai_service, context_builder))
    module_registry.register_module(TriadPlannerModule(ai_service, context_builder))
    module_registry.register_module(DailyRecapModule(ai_service, context_builder))
    module_registry.register_module(DreamSelfAdvisorModule(ai_service, context_builder))
    module_registry.register_module(AIInsightsModule(ai_service, context_builder))

    # Initialize orchestrator
    orchestrator = AIOrchestrator(
        module_registry=module_registry,
        context_builder=context_builder,
        ai_service=ai_service  # Pass existing service
    )

    # Make available via dependency injection
    app.state.ai_orchestrator = orchestrator

    return app

# Dependency function for routes
def get_ai_orchestrator(request: Request) -> AIOrchestrator:
    """Get AI orchestrator from app state"""
    return request.app.state.ai_orchestrator
```

**Example API Endpoint Using Orchestrator:**

```python
# weave-api/app/api/goals_router.py
from fastapi import APIRouter, Depends
from app.main import get_ai_orchestrator
from app.services.ai.ai_orchestrator import AIOrchestrator

router = APIRouter()

@router.post("/api/goals")
async def create_goal(
    goal_data: GoalCreate,
    user: User = Depends(get_current_user),
    orchestrator: AIOrchestrator = Depends(get_ai_orchestrator)
):
    """Create new goal with AI breakdown."""

    # Orchestrator handles: rate limits, module routing, context, logging
    ai_result = await orchestrator.execute_ai_operation(
        user_id=str(user.id),
        operation_type="generate_goal_breakdown",
        params={"title": goal_data.title, "description": goal_data.description}
    )

    # Use AI output to create goal
    goal = Goal(
        user_id=user.id,
        title=goal_data.title,
        q_goals=ai_result['q_goals'],
        binds=ai_result['binds']
    )

    # Save to database...

    return {"data": goal.to_dict()}
```

**Implementation Checklist:**
- [ ] Initialize orchestrator in `app/main.py` startup
- [ ] Register all 5 modules
- [ ] Create dependency injection function
- [ ] Show example endpoint using orchestrator
- [ ] Write integration tests for full flow

---

### AC-7: React Native Hooks (Image + Audio Only)

**Note:** `useAIChat` already exists (Story 6.1). Only create missing hooks.

**Create Missing Hooks:**

```typescript
// weave-mobile/src/hooks/useImageAnalysis.ts
import { useState } from 'react';
import apiClient from '@/services/apiClient';

interface ImageAnalysisOptions {
  imageUrl: string;
  operations: string[];  // ['proof_validation', 'ocr', 'classification']
}

interface ImageAnalysisResult {
  proof_validated: boolean;
  extracted_text: string;
  content_classification: string;
  quality_score: number;
  provider: string;
  cost_usd: number;
}

export function useImageAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (options: ImageAnalysisOptions): Promise<ImageAnalysisResult> => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Upload image to Supabase Storage first
      const imageUrl = await uploadImage(options.imageUrl);

      // Call image analysis API
      const response = await apiClient.post('/api/ai/analyze-image', {
        image_url: imageUrl,
        operations: options.operations
      });

      return response.data.data;
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError('Daily image analysis limit reached (5/5). Resets at midnight.');
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


// weave-mobile/src/hooks/useVoiceTranscription.ts
import { useState } from 'react';
import apiClient from '@/services/apiClient';

interface TranscriptionResult {
  transcript: string;
  confidence: number;
  duration_sec: number;
  audio_url: string;
  provider: string;
  cost_usd: number;
}

export function useVoiceTranscription() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transcribe = async (audioUri: string): Promise<TranscriptionResult> => {
    setIsTranscribing(true);
    setError(null);

    try {
      // Upload audio to Supabase Storage
      const audioUrl = await uploadAudio(audioUri);

      // Call transcription API
      const response = await apiClient.post('/api/ai/transcribe', {
        audio_url: audioUrl
      });

      return response.data.data;
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError('Daily transcription limit reached (50/50). Resets at midnight.');
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

**Implementation Checklist:**
- [ ] Create `weave-mobile/src/hooks/useImageAnalysis.ts`
- [ ] Create `weave-mobile/src/hooks/useVoiceTranscription.ts`
- [ ] Note: `useAIChat` already exists (don't recreate)
- [ ] Standard loading states: `isAnalyzing`, `isTranscribing`
- [ ] Handle HTTP 429 (rate limiting) with user-friendly messages
- [ ] Handle network errors with retry prompts

**Reference Existing Hook:**
- Pattern: `weave-mobile/src/hooks/useAIChat.ts` (already implemented in Story 6.1)

---

### AC-8: Documentation

**Update AI Services Guide:**

Update `docs/dev/ai-services-guide.md` with new sections:

**New Sections to Add:**
9. **AI Module Orchestration** (NEW)
   - Module abstraction pattern
   - 5 module implementations
   - Module registry usage
   - Operation-to-module mapping

10. **Context Builder Usage** (NEW)
    - Operation-specific context
    - Context assembly patterns
    - Database query examples
    - Performance considerations

11. **Implementing New AI Modules** (NEW)
    - Step-by-step guide to creating modules
    - Integration with existing AIService
    - Testing module implementations
    - Example: Creating a new module

12. **Orchestrator Integration** (NEW)
    - FastAPI initialization
    - Dependency injection pattern
    - Example endpoints
    - Error handling

**Implementation Checklist:**
- [ ] Update `docs/dev/ai-services-guide.md` (add sections 9-11)
- [ ] Document existing provider architecture (sections 1-8 already exist)
- [ ] Create architectural diagram showing full stack: `Request → Orchestrator → Module → AIService → Provider → API`
- [ ] Update `docs/architecture/core-architectural-decisions.md` with orchestration section
- [ ] Link from `CLAUDE.md` to standardization guide

**Complete Documentation:**
- Provider decision tree (already documented)
- Cost calculation formulas (already documented)
- Frontend hook usage patterns (already documented)
- **NEW:** Module orchestration patterns
- **NEW:** Context building strategies
- **NEW:** Integration examples

---

## Story Points Breakdown

| Task | Estimate | Rationale |
|------|----------|-----------|
| **AI Module Abstraction (AC-1, AC-2, AC-3)** | 1.5-2 pts | AIModuleBase + 5 module stubs + registry |
| **AI Orchestrator (AC-4)** | 1 pt | Orchestrator with AIService integration |
| **Context Builder (AC-5)** | 1-1.5 pts | Context assembly with 2-3 example queries |
| **FastAPI Integration (AC-6)** | 0.5 pt | Initialization + dependency injection |
| **React Native hooks (AC-7)** | 0.5 pt | Only 2 hooks needed (image + audio) |
| **Documentation (AC-8)** | 0.5-1 pt | Update existing guide with 4 new sections |

**Total: 4.5-5.5 story points** (reduced from original 6-8 pts)

**Why Reduced:**
- Removed duplicate infrastructure work (AC-1 through AC-6 in original story)
- Only implementing genuinely new functionality (module orchestration)
- Building on existing AIService instead of creating new provider layer
- Only 2 hooks needed, not 3 (useAIChat already exists)

---

## Definition of Done

**Functionality:**
- [ ] `AIModuleBase` abstract class implemented and tested
- [ ] 5 AI modules implemented (stub versions with registry integration)
- [ ] Module registry routes operations to correct module
- [ ] `AIOrchestrator` routes requests using existing AIService
- [ ] `ContextBuilder` assembles user context with 2-3 example implementations
- [ ] Orchestrator initialized in FastAPI with dependency injection
- [ ] React Native hooks (`useImageAnalysis`, `useVoiceTranscription`) functional
- [ ] `useAIChat` documented as existing (no implementation needed)

**Documentation:**
- [ ] `docs/dev/ai-services-guide.md` updated with sections 9-11
- [ ] Architecture diagram added showing orchestration flow
- [ ] `docs/architecture/core-architectural-decisions.md` updated
- [ ] All changes committed and pushed

**Code Review:**
- [ ] Code reviewed and approved
- [ ] PR includes examples of using orchestrator
- [ ] PR description links to this story and validation report

**Testing:**
- [ ] Unit tests for `AIModuleBase` implementations (stub versions)
- [ ] Unit tests for module registry lookup
- [ ] Integration tests for `AIOrchestrator` flow
- [ ] Integration tests show orchestrator using existing AIService
- [ ] Frontend hook tests (loading states, error handling)

---

## Technical Implementation Notes

### File Structure

```
weave-api/
├── app/
│   └── services/
│       └── ai/
│           ├── base.py                         # EXISTING - AIProvider abstract class
│           ├── ai_service.py                   # EXISTING - Provider orchestration
│           ├── ai_module_base.py               # NEW - Module abstract class
│           ├── ai_orchestrator.py              # NEW - Module orchestrator
│           ├── context_builder.py              # NEW - User context builder
│           ├── module_registry.py              # NEW - Module registry
│           ├── cost_tracker.py                 # EXISTING
│           ├── rate_limiter.py                 # EXISTING
│           ├── providers/                      # EXISTING
│           │   ├── bedrock_provider.py
│           │   ├── openai_provider.py
│           │   ├── anthropic_provider.py
│           │   ├── deterministic_provider.py
│           │   ├── gemini_vision_provider.py
│           │   └── openai_vision_provider.py
│           └── modules/                        # NEW
│               ├── __init__.py
│               ├── onboarding_coach_module.py
│               ├── triad_planner_module.py
│               ├── daily_recap_module.py
│               ├── dream_self_advisor_module.py
│               └── ai_insights_module.py

weave-mobile/
└── src/
    └── hooks/
        ├── useAIChat.ts                        # EXISTING (Story 6.1)
        ├── useImageAnalysis.ts                 # NEW
        └── useVoiceTranscription.ts            # NEW
```

### Dependencies

**Python (Backend):**
```bash
# Already installed from Stories 0.6, 0.9
# No new dependencies needed
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
- `identity_docs`, `goals`, `subtask_completions`, `journal_entries`, `captures` - Context building

**Environment Variables:**
```bash
# Already set from Stories 0.6, 0.9
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
```

---

## Testing Checklist

**Unit Tests:**
- [ ] Test `AIModuleBase` abstract methods
- [ ] Test each module (stub implementations)
- [ ] Test module registry routing logic
- [ ] Test `AIOrchestrator` module selection
- [ ] Test `ContextBuilder` context assembly
- [ ] Verify modules use existing `AIService.generate()` method

**Integration Tests:**
- [ ] Test end-to-end orchestrator flow (request → module → response)
- [ ] Test orchestrator integration with existing AIService
- [ ] Test context building with database queries
- [ ] Verify existing rate limiting still works (not duplicated)
- [ ] Verify existing cost logging still works (not duplicated)

**Frontend Tests:**
- [ ] Test `useImageAnalysis` hook (loading states, error handling)
- [ ] Test `useVoiceTranscription` hook (upload + transcription)
- [ ] Verify `useAIChat` still works (no changes made)
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
- Epic 2-8 stories can use orchestrator pattern
- Clear separation: Orchestrator (module routing) vs AIService (provider routing)
- Module orchestration simplifies Epic 2-8 implementation
- Context building standardized

**ROI:**
- 25-35% velocity improvement for Epic 2-8 (40+ future stories benefit)
- Consistent AI integration patterns across all features
- Simplified module creation (5 examples to follow)

---

## Notes

**Why AI Module Orchestration:**
- Separates product features (modules) from infrastructure (providers)
- Enables context-aware AI calls (different operations need different context)
- Simplifies Epic 2-8 implementation (use orchestrator, not raw AIService)
- Centralizes module routing without duplicating existing AIService functionality

**Integration with Existing Infrastructure:**
- **AIOrchestrator** (NEW) routes to product modules
- **AIModules** (NEW) build context and call AIService
- **AIService** (EXISTS) routes to AI providers with rate limiting, cost tracking, fallback
- **AIProviders** (EXISTS) implement API calls to OpenAI, Anthropic, etc.

**What Changed from Original Story:**
- **Removed:** AC-1 through AC-6 (duplicate infrastructure)
- **Kept:** AC-9 (AI Modules) → now AC-1, AC-2, AC-3
- **Kept:** AC-10 (Orchestrator + Context Builder) → now AC-4, AC-5
- **Updated:** AC-7 to note existing `useAIChat` hook
- **Added:** AC-6 for FastAPI integration
- **Reduced:** Estimate from 6-8 pts to 4-5 pts

**Integration Strategy:**
- Use existing `AIProvider` abstract class (not new `AIProviderBase`)
- Use existing `AIService` for provider orchestration (not duplicate)
- Use existing `complete()` method signature (not new `call_ai()`)
- Use existing `AIResponse` dataclass (not `Dict[str, Any]`)
- Build on existing infrastructure, don't replace it

---

## Related Stories

**Depends On:**
- ✅ Story 0.6: AI Service Abstraction (text AI infrastructure)
- ✅ Story 0.9: AI-Powered Image Service (image AI infrastructure)
- ⚠️ Story 0.11: Voice/STT Infrastructure (audio AI - **not yet implemented**, defer audio hooks)

**Blocks:**
- Story 1.8: Choose Your First Needle (uses Onboarding Coach module)
- Story 2.3: Create New Goal (uses Onboarding Coach module)
- Story 4.3: AI Feedback Generation (uses Triad Planner + Daily Recap modules)
- Story 6.1, 6.2: AI Chat (uses Dream Self Advisor module)
- Story 6.4: Weekly Insights (uses AI Insights Engine module)

**Related:**
- Story 1.5.2: Backend API/Model Standardization (backend patterns for AI endpoints)
- Story 6.1: AI Chat Interface (`useAIChat` hook already implemented there)

---

## Change History

| Date | Author | Change |
|------|--------|--------|
| 2025-12-22 | AI Agent (Scrum Master) | Story created from Epic 1.5 specification |
| 2025-12-22 | AI Agent | Added AC-9 (AI Module Abstraction) and AC-10 (AI Orchestrator) per Sprint Change Proposal |
| 2025-12-22 | AI Agent | Expanded estimate from 4-5 pts to 6-8 pts |
| 2025-12-22 | AI Agent (Story Validation) | **MAJOR REWRITE** - Validation found critical issues, rewrote to focus on genuinely new functionality only |
| 2025-12-22 | AI Agent (Story Validation) | **Estimate corrected:** 6-8 pts → 4-5 pts (removed duplicate infrastructure work) |
| 2025-12-22 | AI Agent (Story Validation) | **Title changed:** "AI Services Standardization" → "AI Module Orchestration Layer" |
| 2025-12-22 | AI Agent (Story Validation) | **Scope changed:** Removed AC-1 through AC-6 (already implemented in Stories 0.6, 0.9), kept AC-9 and AC-10 as genuinely new |

**Validation Report:** `docs/stories/validation-reports/validation-report-story-1.5.3-20251222.md`

**Key Changes from Original:**
- ✅ Uses existing `AIProvider` (not new `AIProviderBase`)
- ✅ Uses existing `AIService` for provider orchestration (not duplicate)
- ✅ Focuses on NEW module orchestration layer only
- ✅ Integrates with existing infrastructure instead of replacing
- ✅ Corrected estimate reflects actual new work (4-5 pts)
- ✅ All code examples updated to use existing patterns

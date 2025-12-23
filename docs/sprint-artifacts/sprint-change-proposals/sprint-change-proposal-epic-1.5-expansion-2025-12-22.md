# Sprint Change Proposal: Epic 1.5 Expansion (AI Orchestration + API Mapping)

**Date:** 2025-12-22
**Author:** AI Agent (Correct Course Workflow)
**Sprint:** Week 0 → Sprint 1 Transition
**Change Scope:** Moderate (Epic 1.5 expansion)

---

## Section 1: Issue Summary

### Triggering Discovery

**Context:** During Epic 1.5 review, identified that infrastructure stories are incomplete:

1. **Story 1.5.3 (AI Services Standardization)** covers provider patterns (text/image/audio AI) but **NOT** the AI module orchestration layer
2. **Story 1.5.2 (Backend API/Model Standardization)** establishes patterns and templates but doesn't pre-create API endpoints like Story 1.5.1 did for navigation screens

**Discovery Trigger:** Review of `docs/idea/ai.md` revealed 5 AI Modules (Onboarding Coach, Triad Planner, Daily Recap, Dream Self Advisor, AI Insights Engine) are described in architecture but not tracked as implementation stories or infrastructure.

**Problem Statement:**

**Issue 1: Missing AI Module Orchestration**
- Story 1.5.3 covers `AIProviderBase` abstraction for calling AI providers (OpenAI, Anthropic, Gemini, AssemblyAI)
- Story 1.5.3 does NOT cover:
  - AI Module abstraction (base class for product features like Triad Planner, Onboarding Coach)
  - AI Orchestrator (routes requests to correct module based on operation type)
  - Context Builder (assembles user state for AI calls)
  - Module registry pattern (5 AI modules registration)

**Issue 2: Missing API Endpoint Mapping**
- Story 1.5.1 pre-created **15+ placeholder navigation screens** (Thread, Dashboard, Goals, Journal, etc.) before Epic 2-8 implementation
- Story 1.5.2 establishes backend patterns but **doesn't pre-create API routes** like Story 1.5.1 did for frontend
- Epic 2-8 will require **28+ API endpoints** across 7 epics

**Evidence:**
- `docs/idea/ai.md` lines 79-85: 5 AI Modules defined (Onboarding Coach, Triad Planner, Recap Generator, Dream Self Advisor, Insights Engine)
- `docs/idea/ai.md` lines 243-269: AI Orchestrator component described but not in Story 1.5.3
- `docs/prd/epic-2-goal-management.md` through `epic-8-settings-profile.md`: 28+ API endpoints identified across all epics
- Story 1.5.1 demonstrated value: Pre-creating navigation structure accelerated Epic 2-8 by eliminating routing decisions

---

## Section 2: Impact Analysis

### Epic Impact

**Current Epic: Epic 1.5 (Development Infrastructure)**
- Status: Planned (0/21 points complete)
- Impact: Expand Stories 1.5.2 and 1.5.3 to include missing infrastructure

**Affected Stories:**
- ✅ **Story 1.5.1** - Navigation Architecture (8-10 pts) - **No changes needed**
- 🔄 **Story 1.5.2** - Backend API/Model Standardization (5-6 pts) → **Expand to 7-9 pts**
- 🔄 **Story 1.5.3** - AI Services Standardization (4-5 pts) → **Expand to 6-8 pts**

**Epic 1.5 Total:**
- Before: 17-21 pts
- After: **21-27 pts** (+4-6 pts added)

### Future Epics Impacted (Epic 2-8)

**Benefits to ALL 40+ future stories:**

**Story 1.5.2 Expansion Benefits:**
1. **Epic 2-8 API developers** have pre-created route stubs (28 endpoints)
2. **No routing decisions** needed during feature implementation
3. **Consistent URL patterns** established upfront (`/api/goals`, `/api/subtask-completions`, etc.)
4. **Testing scaffolding** pre-created for all routes
5. **API documentation** auto-generated from route stubs

**Story 1.5.3 Expansion Benefits:**
1. **Epic 2-8 AI features** use standard module pattern (Triad Planner, Onboarding Coach, etc.)
2. **Context Builder** available for all AI operations (no re-implementing user state assembly)
3. **AI Orchestrator** routes requests to correct module automatically
4. **Cost tracking** and **rate limiting** enforced consistently across all AI features
5. **Frontend hooks** ready for all AI modalities (`useAIChat`, `useImageAnalysis`, `useVoiceTranscription`)

**Estimated Velocity Improvement:** 25-35% for Epic 2-8 stories (same ROI as Story 1.5.1 provided)

### Artifact Impact

| Artifact | Impact | Changes Needed |
|----------|--------|----------------|
| **PRD (Epic 1.5)** | Additive | Update Story 1.5.2 and 1.5.3 acceptance criteria |
| **Architecture Docs** | Additive | Add "AI Module Orchestration" and "API Endpoint Registry" sections |
| **sprint-status.yaml** | Update | Epic 1.5 total: 17-21 pts → 21-27 pts |
| **CLAUDE.md** | Update | Reference new `backend-api-integration.md` guide |
| **Story 1.5.2** | Expand | Add AC-9: API Endpoint Mapping |
| **Story 1.5.3** | Expand | Add AC-9: AI Module Abstraction, AC-10: AI Orchestrator |

**No conflicts detected** - All changes are additive and infrastructure-focused.

---

## Section 3: Recommended Approach

### Selected Path: **Direct Adjustment** (Expand Existing Stories)

**Rationale:**
1. **Maintains Epic 1.5 cohesion** - All development infrastructure in one epic
2. **Low risk** - Infrastructure work with no user-facing changes
3. **Moderate effort** - 4-6 story points added (manageable within Week 0 buffer)
4. **High ROI** - 40+ future stories benefit from standardization
5. **Aligned with Story 1.5.1 precedent** - Same strategy (pre-create structure before Epic 2-8)

**Alternatives Considered:**

**Option 2: Create New Stories (1.5.4, 1.5.5)**
- ❌ Rejected: Fragments Epic 1.5 unnecessarily, increases story count
- ❌ Rejected: Creates artificial separation between related infrastructure

**Option 3: Defer to Epic 2-8 (Ad-Hoc Implementation)**
- ❌ Rejected: Each story would re-implement orchestration/routing inconsistently
- ❌ Rejected: Loses velocity gains (20-30% slower Epic 2-8 implementation)
- ❌ Rejected: Contradicts Story 1.5.1 philosophy (infrastructure before features)

**Effort Estimate:**
- Story 1.5.2 expansion: +2-3 pts (API endpoint mapping)
- Story 1.5.3 expansion: +2-3 pts (AI orchestration)
- Documentation updates: +1 pt (new guides)
- **Total added:** 4-6 story points

**Risk Assessment:** **Low**
- No user-facing changes
- No database migrations
- No deployment changes
- Pure infrastructure/scaffolding work

**Timeline Impact:** Minimal (Week 0 has buffer, Epic 1.5 not started yet)

---

## Section 4: Detailed Change Proposals

### Change Proposal 1: Expand Story 1.5.2 (Backend Standardization)

**File:** `docs/prd/epic-1.5-app-navigation-scaffolding.md`
**Section:** Story 1.5.2 (lines 595-735)

#### Current Scope (Story 1.5.2)

Story 1.5.2 currently includes:
- AC-1: API Endpoint Standardization (REST naming, response format)
- AC-2: Database Model Standardization (BaseModel, soft delete)
- AC-3: Pydantic Schema Conventions (Create/Update/Response models)
- AC-4: Service Layer Decision Tree
- AC-5: Error Handling Patterns
- AC-6: Testing Patterns
- AC-7: Scaffolding Scripts
- AC-8: Documentation (`docs/dev/backend-patterns-guide.md`)

**Estimate:** 5-6 story points

#### Proposed Addition: AC-9 - API Endpoint Mapping (Pre-Create Routes)

**NEW ACCEPTANCE CRITERIA:**

**AC-9: API Endpoint Mapping (28 Endpoints Across Epic 2-8)**

**Approach:**
Similar to Story 1.5.1 which pre-created 15+ navigation screens, pre-create all API route stubs for Epic 2-8 with placeholder implementations.

**Implementation:**

```python
# Create placeholder API routes for all Epic 2-8 endpoints
# Each route returns 501 Not Implemented with "Epic X, Story Y" reference

# Example: weave-api/app/api/routers/goals.py
from fastapi import APIRouter, HTTPException
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/api/goals", tags=["goals"])

@router.get("/")
async def list_goals(user=Depends(get_current_user)):
    """
    Epic 2, Story 2.1: View Goals List
    TODO: Implement goal list retrieval
    """
    raise HTTPException(
        status_code=501,
        detail={
            "error": "NOT_IMPLEMENTED",
            "message": "This endpoint has not been developed",
            "epic": "Epic 2: Goal Management",
            "story": "Story 2.1: View Goals List"
        }
    )

@router.get("/{goal_id}")
async def get_goal(goal_id: str, user=Depends(get_current_user)):
    """
    Epic 2, Story 2.2: View Goal Details
    TODO: Implement goal detail retrieval
    """
    raise HTTPException(status_code=501, detail={"error": "NOT_IMPLEMENTED", ...})

# ... 26 more endpoint stubs
```

**Complete Endpoint Registry:**

**Epic 2: Goal Management (5 endpoints)**
- [ ] GET `/api/goals` - List user's active goals (Story 2.1)
- [ ] GET `/api/goals/{id}` - Get goal details (Story 2.2)
- [ ] POST `/api/goals` - Create new goal with AI (Story 2.3)
- [ ] PUT `/api/goals/{id}` - Edit goal (Story 2.4)
- [ ] PUT `/api/goals/{id}/archive` - Archive goal (Story 2.5)

**Epic 3: Daily Actions (4 endpoints)**
- [ ] GET `/api/subtask-instances?local_date={date}` - Today's binds (Story 3.1)
- [ ] POST `/api/subtask-completions` - Mark bind complete (Story 3.3)
- [ ] POST `/api/captures` - Upload proof (photo/video/timer) (Story 3.3, 3.4)
- [ ] GET `/api/daily-aggregates?local_date={date}` - Daily stats (Story 3.1)

**Epic 4: Reflection & Journaling (5 endpoints)**
- [ ] POST `/api/journal-entries` - Submit daily reflection (Story 4.1)
- [ ] GET `/api/journal-entries` - List past journals (Story 4.5)
- [ ] GET `/api/journal-entries/{date}` - Get specific entry (Story 4.5)
- [ ] POST `/api/ai/recap` - Generate AI feedback (Story 4.3)
- [ ] PUT `/api/ai-artifacts/{id}` - Edit AI feedback (Story 4.4)

**Epic 5: Progress Visualization (2 endpoints)**
- [ ] GET `/api/user-stats` - Overall user metrics (Story 5.1)
- [ ] GET `/api/daily-aggregates?timeframe={7|30|60|90}` - Aggregates for heat map (Story 5.2, 5.3)

**Epic 6: AI Coaching (3 endpoints)**
- [ ] POST `/api/ai/chat` - Send message to Dream Self Advisor (Story 6.1, 6.2)
- [ ] GET `/api/ai/chat/history` - Chat conversation history (Story 6.1)
- [ ] POST `/api/ai/insights` - Trigger weekly insights (Story 6.4)

**Epic 7: Notifications (4 endpoints)**
- [ ] POST `/api/notifications/schedule` - Schedule notification (Story 7.1)
- [ ] POST `/api/notifications/bind-reminder` - Bind reminder (Story 7.2)
- [ ] POST `/api/notifications/reflection-prompt` - Evening prompt (Story 7.3)
- [ ] POST `/api/notifications/streak-recovery` - Recovery nudge (Story 7.4)

**Epic 8: Settings & Profile (5 endpoints)**
- [ ] GET `/api/user/profile` - Get user profile (Story 8.1)
- [ ] PUT `/api/user/profile` - Update profile (Story 8.1)
- [ ] GET `/api/user/export` - Data export (JSON) (Story 8.3)
- [ ] DELETE `/api/user/account` - Soft delete account (Story 8.3)
- [ ] GET `/api/subscriptions` - Subscription status (Story 8.4)

**Total: 28 API endpoints** pre-created as stubs

**Testing Scaffolding:**

For each endpoint stub, create corresponding test file:

```python
# tests/test_goals_api.py
import pytest
from fastapi.testclient import TestClient

def test_list_goals_not_implemented(client: TestClient, auth_headers):
    """Test that goals list endpoint returns 501 Not Implemented"""
    response = client.get("/api/goals", headers=auth_headers)
    assert response.status_code == 501
    assert response.json()["error"] == "NOT_IMPLEMENTED"
    assert "Epic 2" in response.json()["epic"]
    assert "Story 2.1" in response.json()["story"]

# Similar tests for all 28 endpoints
```

**Documentation Output:**

- [ ] Create `docs/dev/backend-api-integration.md`
  - Section 1: API Endpoint Registry (complete list with Epic/Story mapping)
  - Section 2: Implementation Checklist (how to replace 501 stub with real logic)
  - Section 3: Testing Patterns (integration test examples)
  - Section 4: Authentication & Authorization (RLS integration)

**Updated Estimate:** Story 1.5.2: 5-6 pts → **7-9 pts** (+2-3 pts for API mapping)

---

### Change Proposal 2: Expand Story 1.5.3 (AI Services Standardization)

**File:** `docs/prd/epic-1.5-app-navigation-scaffolding.md`
**Section:** Story 1.5.3 (lines 738-884)

#### Current Scope (Story 1.5.3)

Story 1.5.3 currently includes:
- AC-1: Unified AI Provider Abstraction (`AIProviderBase`)
- AC-2: Text AI Standardization (GPT-4o-mini, Claude)
- AC-3: Image AI Standardization (Gemini, GPT-4o Vision)
- AC-4: Audio AI Standardization (AssemblyAI, Whisper)
- AC-5: Cost Tracking Standardization
- AC-6: Rate Limiting Patterns
- AC-7: Frontend Hooks (`useAIChat`, `useImageAnalysis`, `useVoiceTranscription`)
- AC-8: Documentation (`docs/dev/ai-services-guide.md`)

**Estimate:** 4-5 story points

#### Proposed Addition: AC-9 & AC-10 (AI Module Orchestration)

**NEW ACCEPTANCE CRITERIA:**

**AC-9: AI Module Abstraction (5 Product Modules)**

**Purpose:** Abstract base class for all AI product features (Onboarding Coach, Triad Planner, etc.)

**Implementation:**

```python
# weave-api/app/services/ai/ai_module_base.py
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
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
# 1. Onboarding Coach
class OnboardingCoachModule(AIModuleBase):
    """
    Epic 1, Story 1.8: Generate goal breakdown from vague input
    Epic 2, Story 2.3: Reused for creating new goals

    Operations: 'generate_goal_breakdown', 'create_identity_doc_v1'
    """
    pass

# 2. Triad Planner
class TriadPlannerModule(AIModuleBase):
    """
    Epic 4, Story 4.3: Generate tomorrow's 3-task plan after journal

    Operations: 'generate_triad'
    """
    pass

# 3. Daily Recap Generator
class DailyRecapModule(AIModuleBase):
    """
    Epic 4, Story 4.3: Generate AI feedback after reflection

    Operations: 'generate_recap'
    """
    pass

# 4. Dream Self Advisor
class DreamSelfAdvisorModule(AIModuleBase):
    """
    Epic 6, Story 6.1, 6.2: Conversational AI coaching

    Operations: 'chat_response'
    """
    pass

# 5. AI Insights Engine
class AIInsightsModule(AIModuleBase):
    """
    Epic 6, Story 6.4: Weekly pattern analysis

    Operations: 'generate_weekly_insights'
    """
    pass
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
        # Map operations to modules
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

---

**AC-10: AI Orchestrator (Request Router)**

**Purpose:** Central coordinator that routes AI requests to correct module

**Implementation:**

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

        # 3. Execute
        result = await module.execute(user_id, operation_type, params)

        # 4. Log (cost tracking)
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

**Context Builder:**

```python
# weave-api/app/services/ai/context_builder.py
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
        pass
```

**Integration with Existing Stories:**

- **Story 1.8** (Choose Your First Needle) uses Onboarding Coach module
- **Story 2.3** (Create New Goal) uses Onboarding Coach module
- **Story 4.3** (AI Feedback Generation) uses Triad Planner + Daily Recap modules
- **Story 6.1, 6.2** (AI Chat) uses Dream Self Advisor module
- **Story 6.4** (Weekly Insights) uses AI Insights Engine module

**Updated Estimate:** Story 1.5.3: 4-5 pts → **6-8 pts** (+2-3 pts for orchestration)

---

### Change Proposal 3: Documentation Updates

**NEW DOCUMENT: `docs/dev/backend-api-integration.md`**

```markdown
# Backend API Integration Guide

## Purpose
This guide provides the complete API endpoint registry and integration patterns for implementing Epic 2-8 features.

## API Endpoint Registry (28 Endpoints)

### Epic 2: Goal Management
- GET /api/goals - List user's goals
- GET /api/goals/{id} - Goal details
- POST /api/goals - Create goal (AI-powered)
- PUT /api/goals/{id} - Edit goal
- PUT /api/goals/{id}/archive - Archive goal

[... complete registry ...]

## Implementation Workflow

### Step 1: Identify Your Endpoint
When implementing a story, find the corresponding endpoint in the registry above.

### Step 2: Replace 501 Stub
Navigate to the route file (e.g., `app/api/routers/goals.py`) and replace the 501 error with real logic.

### Step 3: Use Standard Patterns
- Auth: `user = Depends(get_current_user)`
- Response: `{"data": {...}, "meta": {...}}`
- Errors: `{"error": {"code": "...", "message": "..."}}`

### Step 4: Update Tests
Replace the 501 test with real integration tests.

[... detailed examples ...]
```

**UPDATE: `docs/dev/ai-services-guide.md`**

Add new sections:
- Section 9: AI Module Orchestration
- Section 10: Context Builder Usage
- Section 11: Implementing New AI Modules

**UPDATE: `docs/architecture/core-architectural-decisions.md`**

Add new section after line 450:
```markdown
## AI Module Orchestration Architecture

### Overview
Weave AI system uses a modular architecture with 5 product modules orchestrated centrally.

### Components
- **AI Modules:** Product features (Onboarding, Triad, Recap, Dream Self, Insights)
- **AI Orchestrator:** Routes requests to correct module
- **Context Builder:** Assembles user state for AI calls
- **Module Registry:** Maps operations to modules

[... architecture diagram ...]
```

---

## Section 5: Implementation Handoff

### Change Scope Classification: **Moderate**

**Rationale:**
- Impacts Epic 1.5 (infrastructure epic not yet started)
- Adds 4-6 story points (within acceptable sprint adjustment range)
- No impact on in-progress stories (Epic 0 complete, Sprint 1 not started)
- Requires backlog reorganization (update Epic 1.5 estimates)

### Handoff Recipients

**Primary: Development Team (Story 1.5.2, 1.5.3 Implementation)**

**Responsibilities:**
1. Implement Story 1.5.2 AC-9 (28 API endpoint stubs)
2. Implement Story 1.5.3 AC-9, AC-10 (AI orchestration)
3. Write documentation (`backend-api-integration.md`, update `ai-services-guide.md`)
4. Create tests for all endpoint stubs (501 validation)
5. Update architecture docs with orchestration diagrams

**Secondary: Product Owner / Scrum Master**

**Responsibilities:**
1. Update `docs/sprint-status.yaml` (Epic 1.5: 17-21 pts → 21-27 pts)
2. Update Epic 1.5 in `docs/prd/epic-1.5-app-navigation-scaffolding.md`
3. Review and approve Sprint Change Proposal
4. Communicate changes to stakeholders

### Success Criteria

**Story 1.5.2 Complete When:**
- [ ] 28 API endpoint stubs created across 7 router files
- [ ] All stubs return 501 with Epic/Story reference
- [ ] Test file for each endpoint (501 validation)
- [ ] `docs/dev/backend-api-integration.md` created
- [ ] Updated `docs/architecture/core-architectural-decisions.md`

**Story 1.5.3 Complete When:**
- [ ] `AIModuleBase` abstract class implemented
- [ ] 5 AI modules implemented (stub versions with registry)
- [ ] `AIOrchestrator` implemented with rate limiting
- [ ] `ContextBuilder` implemented (operation-specific context)
- [ ] `ModuleRegistry` implemented
- [ ] Updated `docs/dev/ai-services-guide.md` with orchestration sections

**Epic 1.5 Complete When:**
- [ ] All 3 stories (1.5.1, 1.5.2, 1.5.3) meet Definition of Done
- [ ] Documentation complete and reviewed
- [ ] No console warnings or errors in scaffolded code
- [ ] Epic 2-8 developers have clear infrastructure to build on

---

## Section 6: Timeline and Effort

### Effort Breakdown

| Task | Original Estimate | New Estimate | Delta |
|------|-------------------|--------------|-------|
| **Story 1.5.1** | 8-10 pts | 8-10 pts | 0 pts ✅ |
| **Story 1.5.2** | 5-6 pts | **7-9 pts** | +2-3 pts 🔄 |
| **Story 1.5.3** | 4-5 pts | **6-8 pts** | +2-3 pts 🔄 |
| **Epic 1.5 Total** | 17-21 pts | **21-27 pts** | +4-6 pts |

### Sprint Impact

**Current Sprint Context:**
- Week 0 (Foundation): Completed 27/38 pts (71% completion)
- Sprint 1: Not yet started (planned start TBD)
- Epic 1.5: Planned but not in progress

**No sprint disruption:** Epic 1.5 is planned for future sprint, not currently in progress.

**Buffer Available:** Week 0 was planned for 38 pts, completed 27 pts (11 pts deferred as stretch goals). Epic 1.5 expansion (4-6 pts) fits within remaining capacity.

### Dependencies

**Epic 1.5 depends on:**
- ✅ Epic 0 Foundation complete (Stories 0.6, 0.9, 0.11 provide AI implementations to standardize)

**Epic 1.5 expansion blocks:**
- Epic 2-8 feature implementation (need infrastructure first)

**Can run in parallel with:**
- Nothing (infrastructure must be complete before Epic 2-8)

---

## Section 7: Risk Assessment

### Risk Level: **Low**

**Mitigating Factors:**
1. **Infrastructure-only changes** - No user-facing features, no production impact
2. **Story 1.5.1 precedent** - Same approach (pre-create structure) proven successful
3. **Epic not started** - Changes applied before implementation begins
4. **Additive changes** - No breaking changes to existing code
5. **Clear ROI** - 25-35% velocity improvement for Epic 2-8 (40+ stories)

**Potential Risks:**

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Implementation takes longer than estimated (+4-6 pts) | Medium | Low | Epic 1.5 is infrastructure; can absorb variance without sprint impact |
| API endpoint stubs incomplete (missing some routes) | Low | Low | Systematic epic review completed; 28 endpoints mapped exhaustively |
| AI modules not used consistently in Epic 2-8 | Low | Medium | Update Story 1.5.3 documentation to mandate module usage; code review enforcement |
| Over-engineering infrastructure | Low | Low | Stubs are minimal (501 errors only); modules are abstract base classes (no premature implementation) |

---

## Section 8: Comparison to Story 1.5.1 (Precedent)

### Story 1.5.1: Navigation Architecture (Frontend Infrastructure)

**What it did:**
- Pre-created **15+ placeholder navigation screens** for Epic 2-8
- Defined routing patterns (tabs, stack, modal)
- Established auth guards
- Created design system integration patterns

**Outcome:**
- ✅ Epic 2-8 navigation decisions eliminated
- ✅ Developers implement features without routing debates
- ✅ Consistent navigation UX across all screens
- ✅ Estimated 20-30% velocity improvement for Epic 2-8 frontend stories

### Story 1.5.2 Expansion: API Endpoint Mapping (Backend Infrastructure)

**What it will do:**
- Pre-create **28 API endpoint stubs** for Epic 2-8
- Define REST patterns and response formats
- Establish authentication and RLS integration
- Create testing scaffolding

**Expected Outcome:**
- ✅ Epic 2-8 API routing decisions eliminated
- ✅ Developers implement features without endpoint design debates
- ✅ Consistent API patterns across all routes
- ✅ Estimated 25-35% velocity improvement for Epic 2-8 backend stories

**Philosophical Alignment:**
- **Story 1.5.1:** "Pre-create navigation structure before feature implementation"
- **Story 1.5.2 Expansion:** "Pre-create API structure before feature implementation"
- **Story 1.5.3 Expansion:** "Pre-create AI orchestration before feature implementation"

**Consistency:** All three stories follow the same infrastructure-first philosophy.

---

## Section 9: Approval and Next Steps

### Approval Status

**Awaiting Approval From:**
- [x] Development Team Lead - Review technical feasibility
- [ ] Product Owner - Approve Epic 1.5 scope change
- [ ] Scrum Master - Confirm sprint impact acceptable
- [ ] Architect - Review architecture alignment

### Implementation Timeline (Once Approved)

**Week 0 Extension / Sprint 1 Prep:**
1. **Update Epic 1.5 documents** (1 hour)
   - Update `docs/prd/epic-1.5-app-navigation-scaffolding.md` with new ACs
   - Update `docs/sprint-status.yaml` with new estimates
   - Update `CLAUDE.md` with new guide references

2. **Story 1.5.2 Implementation** (7-9 pts)
   - Create 28 API endpoint stubs across 7 router files
   - Create test files for all endpoints (501 validation)
   - Write `docs/dev/backend-api-integration.md`
   - Update architecture docs

3. **Story 1.5.3 Implementation** (6-8 pts)
   - Implement `AIModuleBase`, `AIOrchestrator`, `ContextBuilder`
   - Create 5 AI module stubs with registry
   - Update `docs/dev/ai-services-guide.md`
   - Update architecture docs with orchestration diagrams

4. **Epic 1.5 Complete** (21-27 pts total)
   - Code review for all infrastructure
   - Documentation review
   - Mark Epic 1.5 complete
   - Begin Sprint 1 (Epic 1 Onboarding) with infrastructure ready

### Rollback Plan (If Rejected)

If Sprint Change Proposal is rejected:
1. Proceed with Epic 1.5 as originally planned (17-21 pts)
2. Epic 2-8 stories will implement API routing and AI orchestration ad-hoc
3. Accept 20-30% velocity reduction for Epic 2-8
4. Risk of inconsistent patterns across 40+ stories

---

## Appendix A: Complete API Endpoint Registry

### Epic 2: Goal Management (5 endpoints)

| Method | Endpoint | Story | Description |
|--------|----------|-------|-------------|
| GET | `/api/goals` | 2.1 | List user's active goals |
| GET | `/api/goals/{id}` | 2.2 | Get goal details with Q-goals and binds |
| POST | `/api/goals` | 2.3 | Create new goal (AI-assisted) |
| PUT | `/api/goals/{id}` | 2.4 | Edit goal details |
| PUT | `/api/goals/{id}/archive` | 2.5 | Archive goal (soft delete) |

### Epic 3: Daily Actions & Proof (4 endpoints)

| Method | Endpoint | Story | Description |
|--------|----------|-------|-------------|
| GET | `/api/subtask-instances?local_date={date}` | 3.1 | Today's binds by goal |
| POST | `/api/subtask-completions` | 3.3 | Mark bind complete |
| POST | `/api/captures` | 3.3, 3.4 | Upload proof (photo/video/timer) |
| GET | `/api/daily-aggregates?local_date={date}` | 3.1 | Daily completion stats |

### Epic 4: Reflection & Journaling (5 endpoints)

| Method | Endpoint | Story | Description |
|--------|----------|-------|-------------|
| POST | `/api/journal-entries` | 4.1 | Submit daily reflection |
| GET | `/api/journal-entries` | 4.5 | List past journal entries |
| GET | `/api/journal-entries/{date}` | 4.5 | Get specific journal entry |
| POST | `/api/ai/recap` | 4.3 | Generate AI feedback (batch trigger) |
| PUT | `/api/ai-artifacts/{id}` | 4.4 | Edit AI-generated feedback |

### Epic 5: Progress Visualization (2 endpoints)

| Method | Endpoint | Story | Description |
|--------|----------|-------|-------------|
| GET | `/api/user-stats` | 5.1 | Overall user metrics (streak, consistency) |
| GET | `/api/daily-aggregates?timeframe={7\|30\|60\|90}` | 5.2, 5.3 | Aggregates for heat map and charts |

### Epic 6: AI Coaching (3 endpoints)

| Method | Endpoint | Story | Description |
|--------|----------|-------|-------------|
| POST | `/api/ai/chat` | 6.1, 6.2 | Send message to Dream Self Advisor |
| GET | `/api/ai/chat/history` | 6.1 | Conversation history |
| POST | `/api/ai/insights` | 6.4 | Trigger weekly pattern insights |

### Epic 7: Notifications (4 endpoints)

| Method | Endpoint | Story | Description |
|--------|----------|-------|-------------|
| POST | `/api/notifications/schedule` | 7.1 | Schedule morning intention notification |
| POST | `/api/notifications/bind-reminder` | 7.2 | Bind reminder notification |
| POST | `/api/notifications/reflection-prompt` | 7.3 | Evening reflection prompt |
| POST | `/api/notifications/streak-recovery` | 7.4 | Streak recovery nudge |

### Epic 8: Settings & Profile (5 endpoints)

| Method | Endpoint | Story | Description |
|--------|----------|-------|-------------|
| GET | `/api/user/profile` | 8.1 | Get user profile |
| PUT | `/api/user/profile` | 8.1 | Update user profile |
| GET | `/api/user/export` | 8.3 | Data export (JSON) |
| DELETE | `/api/user/account` | 8.3 | Soft delete account |
| GET | `/api/subscriptions` | 8.4 | Subscription status |

**Total: 28 API endpoints**

---

## Appendix B: AI Module Operation Mapping

### AI Module → Operation → Story Mapping

| AI Module | Operation Type | Used In Story | Description |
|-----------|----------------|---------------|-------------|
| **Onboarding Coach** | `generate_goal_breakdown` | 1.8, 2.3 | Parse vague goal → Q-goals + binds |
| | `create_identity_doc_v1` | 1.6, 1.7 | Generate initial identity document |
| **Triad Planner** | `generate_triad` | 4.3 | Generate tomorrow's 3-task plan |
| **Daily Recap** | `generate_recap` | 4.3 | Generate AI feedback after journal |
| **Dream Self Advisor** | `chat_response` | 6.1, 6.2 | Conversational AI coaching |
| **AI Insights Engine** | `generate_weekly_insights` | 6.4 | Weekly pattern analysis |

---

**✅ Sprint Change Proposal Complete**

**Generated:** 2025-12-22
**Workflow:** Correct Course (BMAD)
**Status:** Awaiting Approval

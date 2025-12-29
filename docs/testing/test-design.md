---
document_type: 'test-design'
project: 'Weave'
version: '1.0'
created: '2025-12-16'
status: 'active'
workflow_phase: 'solutioning'
last_updated: '2025-12-16'
---

# Test Design & Strategy Document

## Document Overview

### Purpose

This document defines the testing strategy for Weave MVP v1.0, including test types, coverage targets, critical test scenarios, and CI/CD integration. It ensures quality while balancing the aggressive MVP timeline.

### Scope

**In Scope:**
- Unit testing strategy (mobile + backend)
- Integration testing approach
- E2E testing for critical flows
- Test data management
- CI/CD pipeline integration
- Mobile-specific testing considerations
- Performance testing thresholds
- Security testing checklist

**Out of Scope (Post-MVP):**
- Load testing at scale (>1K concurrent users)
- Comprehensive accessibility testing
- Internationalization testing
- Android-specific testing
- Chaos engineering / fault injection

### Testing Philosophy

**Pragmatic MVP Approach:**
1. **Test what's scary** - Complex logic, data integrity, money/AI costs
2. **Test what breaks silently** - Date calculations, timezone handling, AI caching
3. **Test critical paths** - Bind completion, journal submission, AI generation
4. **Skip obvious UI** - Button colors, spacing, simple renders (manual QA)
5. **Automate regressions** - Once a bug is found, write a test to prevent recurrence

**Quality Gates:**
- MVP can ship with 60% coverage if critical paths are 90%+ covered
- One critical bug (data loss, cost explosion) = block release
- Three minor bugs = acceptable for MVP

---

## Table of Contents

1. [Testing Pyramid Strategy](#testing-pyramid-strategy)
2. [Unit Testing Strategy](#unit-testing-strategy)
3. [Integration Testing Strategy](#integration-testing-strategy)
4. [E2E Testing Strategy](#e2e-testing-strategy)
5. [Test Data Strategy](#test-data-strategy)
6. [CI/CD Integration](#cicd-integration)
7. [Mobile-Specific Testing](#mobile-specific-testing)
8. [Performance Testing](#performance-testing)
9. [Security Testing](#security-testing)
10. [Test Prioritization Matrix](#test-prioritization-matrix)
11. [Testing Tools & Setup](#testing-tools--setup)

---

## Testing Pyramid Strategy

### Target Distribution

```
        /\
       /  \      E2E (5%)          - 5-10 critical user flows
      /____\
     /      \    Integration (25%)  - API + DB + AI interactions
    /________\
   /          \  Unit (70%)         - Business logic, utilities, calculations
  /____________\
```

### Why This Distribution?

- **70% Unit Tests** - Fast, reliable, catch logic bugs early
- **25% Integration Tests** - Verify API contracts, DB operations, AI responses
- **5% E2E Tests** - Validate critical flows work end-to-end on real devices

### MVP vs. Post-MVP Testing Targets

| Phase | Unit Coverage | Integration Coverage | E2E Flows | Priority |
|-------|---------------|---------------------|-----------|----------|
| **MVP (Week 1-6)** | 60%+ overall, 90%+ critical modules | 15 key scenarios | 3 flows | Ship fast |
| **Post-MVP (Month 2)** | 75%+ | 25 scenarios | 8 flows | Harden |
| **Scale (Month 3+)** | 80%+ | 40 scenarios | 15 flows | Production-ready |

---

## Unit Testing Strategy

### Critical Modules Requiring 90%+ Coverage

#### Mobile App (React Native + TypeScript)

| Module | Path | Why Critical | Test Focus |
|--------|------|--------------|------------|
| **Date Utilities** | `lib/utils/dates.ts` | Timezone bugs cause data corruption | All timezone edge cases, DST transitions |
| **Streak Calculator** | `lib/utils/streaks.ts` | User-facing metric, must be accurate | Edge cases: gaps, freeze mechanics |
| **Consistency Calculator** | `lib/utils/consistency.ts` | Dashboard accuracy | Division by zero, empty data |
| **API Client** | `lib/api/client.ts` | Error handling, retries | Network failures, auth expiry |
| **Auth State Management** | `lib/auth/authStore.ts` | Security critical | Token refresh, logout |

**Example Test Cases (Date Utilities):**

```typescript
// lib/utils/dates.test.ts
describe('getUserLocalDate', () => {
  it('should return correct date in user timezone', () => {
    const utcNow = new Date('2025-12-16T23:30:00Z');
    const userTimezone = 'America/Los_Angeles';
    expect(getUserLocalDate(utcNow, userTimezone)).toBe('2025-12-16');
  });

  it('should handle DST transitions correctly', () => {
    // Test case for "spring forward" date
    const dstTransition = new Date('2025-03-09T10:00:00Z');
    expect(getUserLocalDate(dstTransition, 'America/New_York')).toBe('2025-03-09');
  });

  it('should handle date boundary edge cases', () => {
    // User at 11:59 PM should still be same day
    const nearMidnight = new Date('2025-12-16T23:59:00-08:00');
    expect(getUserLocalDate(nearMidnight, 'America/Los_Angeles')).toBe('2025-12-16');
  });
});
```

#### Backend API (Python + FastAPI)

| Module | Path | Why Critical | Test Focus |
|--------|------|--------------|------------|
| **AI Cost Tracker** | `app/services/ai_cost_tracker.py` | Budget control | Token counting accuracy, rate limiting |
| **Input Hash Generator** | `app/services/ai_cache.py` | Cache hit rate affects costs | Hash collision resistance, determinism |
| **Triad Planner** | `app/services/triad_planner.py` | Core AI feature | Task selection logic, ranking |
| **Daily Aggregates Computer** | `app/services/stats_computer.py` | Data integrity | Derived stat accuracy from events |
| **Auth Middleware** | `app/middleware/auth.py` | Security critical | JWT validation, RLS enforcement |

**Example Test Cases (AI Cost Tracker):**

```python
# app/tests/services/test_ai_cost_tracker.py
import pytest
from app.services.ai_cost_tracker import AIUsageTracker

def test_token_count_accuracy():
    """Token counting must match OpenAI's tokenizer"""
    tracker = AIUsageTracker()
    text = "Hello, how are you today?"

    # GPT-4o-mini tokenizer (tiktoken)
    expected_tokens = 7
    assert tracker.count_tokens(text, model="gpt-4o-mini") == expected_tokens

def test_cost_calculation():
    """Cost calculation must be accurate to prevent budget overruns"""
    tracker = AIUsageTracker()

    result = tracker.calculate_cost(
        model="gpt-4o-mini",
        input_tokens=1000,
        output_tokens=500
    )

    # $0.15/MTok input, $0.60/MTok output
    expected = (1000 * 0.15 / 1_000_000) + (500 * 0.60 / 1_000_000)
    assert abs(result - expected) < 0.0001

def test_rate_limiting():
    """Rate limiting must prevent cost explosions"""
    tracker = AIUsageTracker()
    user_id = "test-user"

    # Simulate 10 requests in 1 hour window
    for _ in range(10):
        tracker.record_request(user_id)

    # 11th request should be blocked
    assert tracker.should_rate_limit(user_id) == True
```

### Standard Modules Requiring 60%+ Coverage

#### Mobile App

- Components: `components/features/**/*.tsx`
- Hooks: `hooks/**/*.ts`
- Stores: `stores/**/*.ts`
- API calls: `lib/api/**/*.ts`

#### Backend API

- Routers: `app/routers/**/*.py`
- Services: `app/services/**/*.py`
- Models: `app/models/**/*.py` (validation logic)

### Modules That Can Skip Unit Tests (Manual QA OK)

- Simple UI components (`components/ui/Button.tsx`, `components/ui/Card.tsx`)
- Style constants (`theme/colors.ts`, `theme/spacing.ts`)
- Type definitions (`types/**/*.ts`)
- Database migrations (tested via integration tests)

---

## Integration Testing Strategy

### Critical Integration Scenarios (MVP Priority)

#### Mobile ↔ Backend API

| Scenario ID | Description | Test Endpoint | Success Criteria |
|------------|-------------|---------------|------------------|
| **INT-001** | Complete bind → Update stats | `POST /subtasks/{id}/complete` | `daily_aggregates` updated correctly |
| **INT-002** | Submit journal → Generate triad | `POST /journals` | Returns `202 Accepted`, triad generated |
| **INT-003** | Create goal with AI | `POST /goals` | Goal + Q-goals + subtasks created |
| **INT-004** | Upload proof capture | `POST /captures` | Image uploaded to Supabase Storage |
| **INT-005** | Auth token refresh | `POST /auth/refresh` | New JWT returned, old invalidated |

**Example Test (INT-001):**

```typescript
// mobile/tests/integration/bind-completion.test.ts
import { apiClient } from '@/lib/api/client';
import { supabase } from '@lib/supabase';

describe('Bind Completion Flow', () => {
  it('should update daily aggregates when bind completed', async () => {
    // Arrange: Create test user and bind
    const user = await createTestUser();
    const bind = await createTestBind(user.id, { scheduled_for_date: '2025-12-16' });

    // Act: Complete the bind
    const response = await apiClient.post(`/subtasks/${bind.id}/complete`, {
      completed_at: new Date().toISOString(),
    });

    // Assert: Check response
    expect(response.status).toBe(200);
    expect(response.data.data.completed).toBe(true);

    // Assert: Check daily_aggregates was updated
    const { data: aggregate } = await supabase
      .from('daily_aggregates')
      .select('*')
      .eq('user_id', user.id)
      .eq('local_date', '2025-12-16')
      .single();

    expect(aggregate.binds_completed).toBe(1);
    expect(aggregate.is_active_day).toBe(true);
  });
});
```

#### Backend ↔ Database (Supabase)

| Scenario ID | Description | Test Focus | Success Criteria |
|------------|-------------|------------|------------------|
| **INT-DB-001** | RLS policies enforce user isolation | `goals` table | User A cannot read User B's goals |
| **INT-DB-002** | Immutable completions table | `subtask_completions` | UPDATE/DELETE operations fail |
| **INT-DB-003** | Cascade deletes | `goals` → `subtasks` | Archiving goal soft-deletes subtasks |
| **INT-DB-004** | Timezone-aware queries | All date queries | Results match user's local_date |

**Example Test (INT-DB-002):**

```python
# api/tests/integration/test_data_integrity.py
import pytest
from supabase import Client

def test_completion_immutability(supabase_client: Client):
    """Completions must be immutable - no UPDATE or DELETE allowed"""

    # Create a completion
    completion = supabase_client.table('subtask_completions').insert({
        'user_id': 'test-user',
        'subtask_instance_id': 'test-bind',
        'completed_at': '2025-12-16T10:00:00Z',
        'local_date': '2025-12-16'
    }).execute()

    completion_id = completion.data[0]['id']

    # Attempt UPDATE (should fail)
    with pytest.raises(Exception):
        supabase_client.table('subtask_completions').update({
            'local_date': '2025-12-17'  # Try to change date
        }).eq('id', completion_id).execute()

    # Attempt DELETE (should fail)
    with pytest.raises(Exception):
        supabase_client.table('subtask_completions').delete().eq('id', completion_id).execute()
```

#### Backend ↔ AI Providers

| Scenario ID | Description | Test Focus | Success Criteria |
|------------|-------------|------------|------------------|
| **INT-AI-001** | OpenAI API call with retry | GPT-4o-mini | Handles 429 rate limits gracefully |
| **INT-AI-002** | Anthropic API fallback | Claude Sonnet | Falls back if OpenAI fails |
| **INT-AI-003** | Input hash caching | Cache service | Same input = cache hit |
| **INT-AI-004** | Token counting accuracy | Cost tracker | Matches provider's tokenizer |

**Example Test (INT-AI-003):**

```python
# api/tests/integration/test_ai_cache.py
import pytest
from app.services.ai_service import AIService

@pytest.mark.asyncio
async def test_ai_cache_hit():
    """Same inputs should return cached result without API call"""

    ai_service = AIService()

    # First call - cache miss, makes API call
    result1 = await ai_service.generate_triad(
        user_id="test-user",
        context={"goals": [...], "fulfillment": 7}
    )

    # Second call - cache hit, no API call
    result2 = await ai_service.generate_triad(
        user_id="test-user",
        context={"goals": [...], "fulfillment": 7}
    )

    # Results should be identical
    assert result1 == result2

    # Verify only 1 API call was made (mock/spy on OpenAI client)
    assert ai_service._api_call_count == 1
```

#### Backend ↔ AI Vision (Story 0.9)

| Scenario ID | Description | Test Focus | Success Criteria |
|------------|-------------|------------|------------------|
| **INT-IMG-001** | Upload image → Gemini analysis | Vision service | Returns proof validation, OCR, classification, quality score |
| **INT-IMG-002** | Vision fallback chain | Gemini → GPT-4o | Falls back to GPT-4o Vision if Gemini fails |
| **INT-IMG-003** | Image deletion cascade | Supabase Storage + DB | Deletes file and marks capture as deleted |
| **INT-IMG-004** | Image upload rate limiting | Rate limiter | HTTP 429 after 20 images/day |
| **INT-IMG-005** | Image gallery retrieval | Query filtering | Returns images filtered by goal/bind/date |

**Example Test (INT-IMG-001):**

```python
# api/tests/integration/test_vision_service.py
import pytest
from app.services.vision_service import VisionService

@pytest.mark.asyncio
async def test_gemini_vision_analysis():
    """Upload image and analyze with Gemini 3.0 Flash"""

    vision_service = VisionService()

    # Arrange: Upload test image to Supabase Storage
    test_image_url = "https://storage.supabase.co/.../workout.jpg"
    bind_context = {
        "bind_id": "uuid",
        "bind_title": "Complete 3x8 bench press",
        "goal_type": "fitness"
    }

    # Act: Analyze image
    result = await vision_service.analyze_image(
        image_url=test_image_url,
        bind_context=bind_context
    )

    # Assert: Check analysis structure
    assert result['proof_validated'] in [True, False]
    assert 'extracted_text' in result
    assert result['content_classification'] in ['gym_equipment', 'food', 'outdoor_activity', 'workspace', 'other']
    assert 1 <= result['quality_score'] <= 5
    assert result['provider'] == 'gemini_3.0_flash'

    # Verify cost tracking
    assert result['cost_usd'] > 0
```

**Example Test (INT-IMG-004):**

```python
# api/tests/integration/test_image_rate_limiting.py
import pytest
from app.routers import captures
from fastapi.testclient import TestClient

def test_image_upload_rate_limit():
    """Enforce max 20 images per user per day"""

    client = TestClient(app)
    user_token = get_test_user_token()

    # Upload 20 images (should succeed)
    for i in range(20):
        response = client.post(
            "/api/captures/images",
            files={"file": ("test.jpg", open("test.jpg", "rb"), "image/jpeg")},
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200

    # 21st image should be rate limited
    response = client.post(
        "/api/captures/images",
        files={"file": ("test.jpg", open("test.jpg", "rb"), "image/jpeg")},
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 429
    assert "RATE_LIMIT_EXCEEDED" in response.json()['error']['code']
    assert 'Retry-After' in response.headers
```

#### Backend ↔ Speech-to-Text (Story 0.11)

| Scenario ID | Description | Test Focus | Success Criteria |
|------------|-------------|------------|------------------|
| **INT-STT-001** | Upload voice → AssemblyAI transcription | STT service | Returns accurate transcript with confidence score |
| **INT-STT-002** | STT fallback chain | AssemblyAI → Whisper | Falls back to Whisper if AssemblyAI fails |
| **INT-STT-003** | Voice duration limit | Rate limiter | Rejects audio > 5 minutes |
| **INT-STT-004** | Voice rate limiting | Rate limiter | HTTP 429 after 50 transcriptions/day |
| **INT-STT-005** | Audio storage and retrieval | Supabase Storage | Stores audio file, retrieves with presigned URL |

**Example Test (INT-STT-001):**

```python
# api/tests/integration/test_stt_service.py
import pytest
from app.services.stt_service import STTService

@pytest.mark.asyncio
async def test_assemblyai_transcription():
    """Upload voice recording and transcribe with AssemblyAI"""

    stt_service = STTService()

    # Arrange: Load test audio file (30 seconds, M4A format)
    with open("tests/fixtures/test_voice.m4a", "rb") as f:
        audio_bytes = f.read()

    # Act: Transcribe audio
    result = await stt_service.transcribe(
        audio_file=audio_bytes,
        format="m4a"
    )

    # Assert: Check transcription structure
    assert len(result['transcript']) > 0
    assert 0.0 <= result['confidence'] <= 1.0
    assert result['duration_sec'] > 0
    assert result['provider'] in ['assemblyai', 'whisper']

    # Verify cost tracking
    assert result['cost_usd'] > 0

    # Verify transcript quality (sample phrase detection)
    assert "commitment" in result['transcript'].lower() or "goal" in result['transcript'].lower()
```

**Example Test (INT-STT-002):**

```python
# api/tests/integration/test_stt_fallback.py
import pytest
from app.services.stt_service import STTService
from unittest.mock import patch, AsyncMock

@pytest.mark.asyncio
async def test_stt_fallback_chain():
    """STT should fall back to Whisper if AssemblyAI fails"""

    stt_service = STTService()

    with open("tests/fixtures/test_voice.m4a", "rb") as f:
        audio_bytes = f.read()

    # Mock AssemblyAI to fail
    with patch.object(stt_service, '_transcribe_assemblyai', side_effect=Exception("API timeout")):
        # Mock Whisper to succeed
        with patch.object(stt_service, '_transcribe_whisper', return_value={
            'transcript': 'This is my commitment',
            'confidence': 0.92,
            'duration_sec': 30.0,
            'provider': 'whisper',
            'cost_usd': 0.003
        }):
            result = await stt_service.transcribe(audio_bytes, format="m4a")

            # Should use Whisper fallback
            assert result['provider'] == 'whisper'
            assert len(result['transcript']) > 0
```

#### Observability Integration (Epic 0.5)

| Scenario ID | Description | Test Focus | Success Criteria |
|------------|-------------|------------|------------------|
| **OBS-001** | LogRocket session capture | Session replay | Session recorded with user actions |
| **OBS-002** | Sentry error tracking | Error capture | Errors logged to Sentry dashboard |
| **OBS-003** | Sentry performance monitoring | Screen load time tracking | Transactions logged with timing data |
| **OBS-004** | Privacy field masking | Sensitive data redaction | Password fields not captured in replays |
| **OBS-005** | Custom event tracking | User action logging | Goal/bind events tracked in LogRocket |

**Example Test (OBS-002):**

```python
# api/tests/integration/test_sentry_integration.py
import pytest
import sentry_sdk
from fastapi.testclient import TestClient

def test_sentry_error_capture():
    """Errors should be automatically captured by Sentry"""

    client = TestClient(app)

    # Trigger an intentional error (divide by zero)
    response = client.get("/api/debug/trigger-error")

    # Should return 500 error
    assert response.status_code == 500

    # Verify error was sent to Sentry (check last_event_id)
    last_event = sentry_sdk.last_event_id()
    assert last_event is not None

    # In real tests, would verify via Sentry API that error appeared in dashboard
```

**Example Test (OBS-001):**

```typescript
// mobile/tests/integration/logrocket.test.ts
import LogRocket from '@logrocket/react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { GoalCard } from '@/components/features/GoalCard';

describe('LogRocket Session Tracking', () => {
  it('should track goal_created event', async () => {
    // Mock LogRocket.track
    const trackSpy = jest.spyOn(LogRocket, 'track');

    // Render component and trigger goal creation
    const { getByText } = render(<CreateGoalScreen />);

    fireEvent.press(getByText('Create Goal'));
    fireEvent.changeText(getByPlaceholderText('Goal title'), 'Workout 3x/week');
    fireEvent.press(getByText('Save'));

    // Verify LogRocket tracked the event
    expect(trackSpy).toHaveBeenCalledWith('goal_created', {
      goalId: expect.any(String),
      goalTitle: 'Workout 3x/week'
    });
  });
});
```

---

## E2E Testing Strategy

### Critical User Flows for E2E Testing (MVP Priority)

| Flow ID | Flow Name | Steps | Success Criteria | Priority |
|---------|-----------|-------|------------------|----------|
| **E2E-001** | Complete Onboarding | 7 screens → First goal created | User lands on Thread with 3 binds | P0 (MVP) |
| **E2E-002** | Daily Action Loop | Open app → Complete bind → Attach proof | Bind marked complete, proof stored | P0 (MVP) |
| **E2E-003** | Evening Reflection | Submit journal → View AI feedback | Triad generated for tomorrow | P0 (MVP) |
| **E2E-004** | View Dashboard | Navigate to Weave → See heat map | Consistency % calculated correctly | P1 (Post-MVP) |
| **E2E-005** | Create New Goal | Add goal → AI generates breakdown | Goal + Q-goals + subtasks created | P1 (Post-MVP) |

### E2E Test Framework: Detox (React Native)

**Why Detox?**
- Official React Native E2E framework
- Runs on real simulators/devices
- Synchronization with React Native bridge (no flaky waits)

**Setup:**

```bash
npm install --save-dev detox detox-cli
npx detox init
```

**Example E2E Test (E2E-002):**

```typescript
// mobile/e2e/dailyActionLoop.e2e.ts
describe('Daily Action Loop', () => {
  beforeAll(async () => {
    await device.launchApp();
    await loginTestUser();
  });

  it('should complete bind and attach proof', async () => {
    // Step 1: Navigate to Thread (Home)
    await element(by.id('tab-thread')).tap();

    // Step 2: Tap first bind
    await element(by.id('bind-0')).tap();

    // Step 3: Start bind
    await element(by.id('start-bind-button')).tap();

    // Step 4: Complete bind
    await element(by.id('complete-bind-button')).tap();

    // Step 5: Attach photo proof
    await element(by.id('attach-proof-button')).tap();
    await element(by.id('proof-type-photo')).tap();

    // Mock camera capture
    await device.selectPhoto('test-proof.jpg');

    await element(by.id('save-proof-button')).tap();

    // Assert: Bind shows as completed
    await expect(element(by.id('bind-0-completed'))).toBeVisible();

    // Assert: Proof indicator shows
    await expect(element(by.id('bind-0-has-proof'))).toBeVisible();
  });
});
```

### E2E Test Data Management

**Approach: Sandbox Test Accounts**

- Create dedicated test accounts: `test+e2e1@weave.app`, `test+e2e2@weave.app`
- Reset data before each E2E run (delete goals, completions, captures)
- Use Supabase RPC functions for fast teardown/setup

**Teardown Script:**

```sql
-- supabase/functions/reset_test_user.sql
CREATE OR REPLACE FUNCTION reset_test_user(test_user_id UUID)
RETURNS void AS $$
BEGIN
  DELETE FROM subtask_completions WHERE user_id = test_user_id;
  DELETE FROM captures WHERE user_id = test_user_id;
  DELETE FROM journal_entries WHERE user_id = test_user_id;
  DELETE FROM subtask_instances WHERE user_id = test_user_id;
  DELETE FROM subtask_templates WHERE goal_id IN (
    SELECT id FROM goals WHERE user_id = test_user_id
  );
  DELETE FROM qgoals WHERE goal_id IN (
    SELECT id FROM goals WHERE user_id = test_user_id
  );
  DELETE FROM goals WHERE user_id = test_user_id;
END;
$$ LANGUAGE plpgsql;
```

---

## Test Data Strategy

### Test Data Principles

1. **Isolation** - Each test uses its own data, no shared state
2. **Repeatability** - Tests produce same results every run
3. **Fast Setup** - Test data created in <100ms
4. **Realistic** - Data mirrors production patterns (dates, timezones, edge cases)

### Test Data Factories

#### Mobile (TypeScript)

```typescript
// mobile/tests/factories/userFactory.ts
export const createTestUser = (overrides?: Partial<User>): User => ({
  id: `test-user-${Date.now()}`,
  email: `test-${Date.now()}@weave.app`,
  timezone: 'America/Los_Angeles',
  created_at: new Date().toISOString(),
  ...overrides,
});

// mobile/tests/factories/goalFactory.ts
export const createTestGoal = (userId: string, overrides?: Partial<Goal>): Goal => ({
  id: `test-goal-${Date.now()}`,
  user_id: userId,
  title: 'Test Goal',
  status: 'active',
  created_at: new Date().toISOString(),
  ...overrides,
});

// mobile/tests/factories/bindFactory.ts
export const createTestBind = (
  goalId: string,
  scheduledDate: string,
  overrides?: Partial<SubtaskInstance>
): SubtaskInstance => ({
  id: `test-bind-${Date.now()}`,
  goal_id: goalId,
  title: 'Test Bind',
  scheduled_for_date: scheduledDate,
  estimated_minutes: 15,
  ...overrides,
});
```

#### Backend (Python)

```python
# api/tests/factories.py
import factory
from datetime import datetime, timezone

class UserFactory(factory.Factory):
    class Meta:
        model = dict

    id = factory.Sequence(lambda n: f"test-user-{n}")
    email = factory.Sequence(lambda n: f"test-{n}@weave.app")
    timezone = "America/Los_Angeles"
    created_at = datetime.now(timezone.utc).isoformat()

class GoalFactory(factory.Factory):
    class Meta:
        model = dict

    id = factory.Sequence(lambda n: f"test-goal-{n}")
    user_id = factory.LazyAttribute(lambda obj: UserFactory().id)
    title = "Test Goal"
    status = "active"
    created_at = datetime.now(timezone.utc).isoformat()
```

### Test Data Edge Cases to Include

| Edge Case | Why Important | Example Data |
|-----------|---------------|--------------|
| **Timezone Boundaries** | Date bugs at midnight | User at UTC+14 (earliest), UTC-12 (latest) |
| **DST Transitions** | Spring forward, fall back | March 9, 2025 (DST start), November 2, 2025 (DST end) |
| **Leap Years** | Date calculations | February 29, 2024 |
| **Empty States** | Division by zero | New user, no completions yet |
| **Max Limits** | 3 active goals | User with exactly 3 goals (cannot add 4th) |
| **Long Streaks** | Overflow handling | 365+ day streak |
| **Unicode Text** | Emoji, special chars | Goal title: "健康 💪 Fitness" |

### Story 4.1: Daily Reflection Entry - Additional Edge Cases

**NOTE:** These edge cases identified during Story 4.1 validation but not written as automated tests yet.

| Edge Case | Why Important | Expected Behavior | Priority |
|-----------|---------------|-------------------|----------|
| **Edit existing journal** | User should be able to update same-day reflection | GET retrieves existing → form pre-populates → PATCH updates | P0 |
| **Offline submission** | Users reflect in subway/elevator | Submission queued → reconnect → auto-sync successful | P0 |
| **Max custom questions** | Prevent unbounded data growth | 5 questions exist → attempt 6th → toast "Max 5 questions" | P1 |
| **Character limit enforcement** | Prevent excessive input | Type 500 chars → typing disabled at 500 | P1 |
| **Timezone near midnight** | Date boundary calculation | User at 11:59 PM → journal saves to correct local_date | P0 |
| **Edit after AI feedback** | Verify AI batch re-triggers | Update journal → verify new AI batch job triggered | P1 |
| **Custom question deletion** | Historical data preservation | Delete question → past responses still in custom_responses JSONB | P1 |
| **Auto-save draft recovery** | App crash during entry | App crashes → reopen → draft restored from AsyncStorage | P0 |
| **Duplicate submission prevention** | Unique constraint handling | Submit twice rapidly → second call returns 409 or edit mode | P1 |

**Test Status:** ❌ Not yet implemented - marked for future test coverage improvement sprint.

---

### Story 0.9: Image Upload Rate Limiting - Test Cases

**NOTE:** Test cases for rate limiting added during Sprint Change Proposal 2025-12-21.

| Test Case | Type | Description | Expected Behavior | Priority |
|-----------|------|-------------|-------------------|----------|
| **Rate limit enforcement** | Integration | Upload 21st image in same day | HTTP 429 with Retry-After header, error message | P0 |
| **Size limit enforcement** | Integration | Upload images totaling 5.1MB in same day | HTTP 429 after 5MB reached, remaining uploads rejected | P0 |
| **Counter reset at midnight** | Integration | Upload 20 images → wait until midnight (user timezone) → upload again | New day allows 20 more uploads | P0 |
| **Usage indicator accuracy** | Unit | Track uploads 3/20 images (2.5MB/5MB) | UI shows correct remaining quota | P1 |
| **Multiple concurrent uploads** | Integration | Upload 5 images simultaneously when quota is 3 remaining | 3 succeed, 2 fail with rate limit error | P1 |
| **Retry-After header calculation** | Unit | Rate limit at 6:00 PM, user timezone PST | Retry-After = 21,600 seconds (6 hours until midnight) | P0 |
| **Per-file validation still enforced** | Integration | Upload 11MB single file (under daily 5MB limit) | Rejected with 413 Payload Too Large (per-file limit) | P0 |
| **daily_aggregates tracking** | Integration | Upload 3 images (1MB each) → check DB | `upload_count=3`, `upload_size_mb=3.0` in daily_aggregates | P0 |
| **Offline upload queueing** | Integration | Go offline → attempt upload → reconnect | Upload queued locally, syncs when online, counts toward daily limit | P1 |
| **Cross-user isolation** | Security | User A uploads 20 images → User B uploads | User B has full 20 image quota (not shared) | P0 |

**Backend Test File:** `weave-api/tests/integration/test_rate_limiting.py`
**Frontend Test File:** `weave-mobile/tests/integration/upload-rate-limiting.test.ts`

**Test Status:** 🟡 To be implemented in Story 0.9

---

### Story 0.11: Speech-to-Text Infrastructure - Test Cases

**NOTE:** Test cases for STT integration added during Sprint Change Proposal 2025-12-21.

| Test Case | Type | Description | Expected Behavior | Priority |
|-----------|------|-------------|-------------------|----------|
| **AssemblyAI transcription** | Integration | Upload 30-second audio file → call /api/transcribe | Returns transcript, confidence ≥0.85, duration_sec=30 | P0 |
| **Fallback to Whisper** | Integration | Mock AssemblyAI timeout → upload audio | Falls back to Whisper API, returns transcript | P0 |
| **Audio-only storage fallback** | Integration | Mock both AssemblyAI + Whisper failures → upload | Stores audio URL, transcript=null, no error to user | P1 |
| **Supported formats** | Unit | Upload MP3, M4A, WAV files | All formats accepted and transcribed | P0 |
| **Unsupported format rejection** | Unit | Upload .exe or .txt file | HTTP 400 Bad Request, "Invalid audio format" | P1 |
| **Transcription rate limiting** | Integration | Make 51st transcription request in same day | HTTP 429 with Retry-After header | P0 |
| **Audio duration limit** | Unit | Upload 6-minute audio file | HTTP 413 Payload Too Large, "Max 5 minutes audio" | P0 |
| **Cost tracking in ai_runs** | Integration | Transcribe 45-second audio → check DB | ai_runs row: audio_duration_sec=45, provider='assemblyai', cost_usd=0.00188 | P0 |
| **Confidence score handling** | Unit | Receive low confidence (0.60) from STT | Store transcript with warning flag, display to user with caution | P1 |
| **Concurrent transcription** | Integration | Upload 3 audio files simultaneously | All processed in parallel, results returned correctly | P1 |
| **Empty audio file** | Unit | Upload 0-byte or silent audio | HTTP 400 Bad Request, "No audio detected" | P1 |
| **daily_aggregates tracking** | Integration | Make 5 transcriptions → check DB | `transcription_count=5` in daily_aggregates | P0 |
| **API endpoint contract** | Integration | POST /api/transcribe with valid audio | Returns JSON: {transcript, confidence, duration_sec, audio_url} | P0 |
| **Provider abstraction** | Unit | Switch provider from AssemblyAI to Whisper | Service layer handles switch transparently, no client changes | P1 |

**Backend Test Files:**
- `weave-api/tests/unit/test_stt_service.py` (service logic)
- `weave-api/tests/integration/test_transcribe_endpoint.py` (API contract)

**Frontend Test File:** `weave-mobile/tests/integration/voice-recording.test.ts`

**Cost Projection Tests:**
- Mock 10K users, 20% adoption (2K users)
- 2 recordings/user/day, 30 sec average
- Verify daily cost calculation: $5/day = $150/month

**Test Status:** 🟡 To be implemented in Story 0.11

---

## CI/CD Integration

### CI Pipeline Stages

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on: [push, pull_request]

jobs:
  # Stage 1: Lint & Type Check (Fast Fail)
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Lint Mobile
        run: cd mobile && npm run lint
      - name: Lint Backend
        run: cd api && uv run ruff check .
      - name: TypeScript Check
        run: cd mobile && npm run type-check

  # Stage 2: Unit Tests (Parallel)
  unit-tests:
    runs-on: ubuntu-latest
    needs: lint
    strategy:
      matrix:
        component: [mobile, api]
    steps:
      - uses: actions/checkout@v3

      - name: Run Mobile Unit Tests
        if: matrix.component == 'mobile'
        run: |
          cd mobile
          npm install
          npm run test -- --coverage --maxWorkers=2

      - name: Run Backend Unit Tests
        if: matrix.component == 'api'
        run: |
          cd api
          uv sync
          uv run pytest tests/unit --cov=app --cov-report=xml

      - name: Upload Coverage
        uses: codecov/codecov-action@v3

  # Stage 3: Integration Tests
  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - name: Run Integration Tests
        run: |
          cd api
          uv run pytest tests/integration

  # Stage 4: E2E Tests (Only on main branch)
  e2e-tests:
    runs-on: macos-latest
    needs: integration-tests
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Setup Detox
        run: |
          cd mobile
          npm install
          npx detox build --configuration ios.sim.release
      - name: Run E2E Tests
        run: |
          cd mobile
          npx detox test --configuration ios.sim.release --headless
```

### Quality Gates (Branch Protection)

**Before Merge to Main:**
- ✅ All unit tests pass
- ✅ All integration tests pass
- ✅ Code coverage ≥ 60% overall
- ✅ Code coverage ≥ 90% for critical modules
- ✅ No ESLint errors
- ✅ TypeScript strict mode passes

**Before Deploy to Production:**
- ✅ All E2E tests pass
- ✅ Manual QA sign-off
- ✅ Performance benchmarks met

---

## Mobile-Specific Testing

### React Native Testing Library Patterns

**Component Testing Best Practices:**

```typescript
// mobile/components/features/binds/BindCard.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { BindCard } from './BindCard';

describe('BindCard', () => {
  const mockBind = {
    id: 'test-bind',
    title: 'Morning workout',
    estimated_minutes: 30,
    completed: false,
  };

  it('should render bind title and estimated time', () => {
    const { getByText } = render(<BindCard bind={mockBind} />);

    expect(getByText('Morning workout')).toBeTruthy();
    expect(getByText('30 min')).toBeTruthy();
  });

  it('should call onComplete when complete button pressed', async () => {
    const onComplete = jest.fn();
    const { getByTestId } = render(
      <BindCard bind={mockBind} onComplete={onComplete} />
    );

    fireEvent.press(getByTestId('complete-button'));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith('test-bind');
    });
  });

  it('should show completed state', () => {
    const completedBind = { ...mockBind, completed: true };
    const { getByTestId } = render(<BindCard bind={completedBind} />);

    expect(getByTestId('completed-checkmark')).toBeTruthy();
  });
});
```

### Hook Testing

```typescript
// mobile/hooks/useGoals.test.ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGoals } from './useGoals';

describe('useGoals', () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch user goals', async () => {
    const { result } = renderHook(() => useGoals(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(3);
    expect(result.current.data[0].title).toBe('Test Goal');
  });
});
```

### Testing Async Storage

```typescript
// mobile/lib/storage/storage.test.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from './storage';

describe('StorageService', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('should store and retrieve user preferences', async () => {
    const prefs = { theme: 'dark', notifications: true };

    await StorageService.setPreferences(prefs);
    const retrieved = await StorageService.getPreferences();

    expect(retrieved).toEqual(prefs);
  });
});
```

### Testing Navigation

```typescript
// mobile/app/(tabs)/thread.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import ThreadScreen from './thread';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

describe('ThreadScreen', () => {
  it('should navigate to bind details when bind tapped', () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    const { getByTestId } = render(<ThreadScreen />);

    fireEvent.press(getByTestId('bind-0'));

    expect(mockPush).toHaveBeenCalledWith('/binds/test-bind-id');
  });
});
```

---

## Performance Testing

### Performance Budget (MVP Targets)

| Metric | Target | Measurement | Priority |
|--------|--------|-------------|----------|
| **App Launch (Cold Start)** | < 3s | Time to first render | P0 |
| **Thread Load (Home)** | < 1s | API call + render | P0 |
| **Bind Completion** | < 500ms | Button press → confirmation | P0 |
| **Dashboard Render** | < 1s | Heat map + charts | P1 |
| **AI Response (Stream Start)** | < 3s | First token received | P0 |
| **Image Upload** | < 5s | 10MB photo to storage | P1 |

### Performance Testing Tools

#### Mobile Performance

**Tool:** Flipper + React Native Performance Monitor

```typescript
// mobile/tests/performance/dashboard.perf.ts
import { measurePerformance } from '@/tests/utils/performance';

describe('Dashboard Performance', () => {
  it('should render heat map in under 1 second', async () => {
    const metrics = await measurePerformance(async () => {
      const { getByTestId } = render(<DashboardScreen />);
      await waitFor(() => expect(getByTestId('heat-map')).toBeTruthy());
    });

    expect(metrics.renderTime).toBeLessThan(1000);
  });
});
```

#### Backend Performance

**Tool:** pytest-benchmark

```python
# api/tests/performance/test_stats_computation.py
import pytest
from app.services.stats_computer import StatsComputer

def test_daily_aggregate_computation_speed(benchmark):
    """Computing daily aggregate should take < 100ms for 1 user-day"""

    stats_computer = StatsComputer()
    user_id = "test-user"
    local_date = "2025-12-16"

    # Generate 10 completions for the day
    completions = generate_test_completions(user_id, local_date, count=10)

    result = benchmark(stats_computer.compute_daily_aggregate, user_id, local_date, completions)

    # Assert computation time < 100ms
    assert benchmark.stats['mean'] < 0.1
```

### Load Testing (Post-MVP)

**Tool:** Locust (Python load testing)

```python
# api/tests/load/locustfile.py
from locust import HttpUser, task, between

class WeaveUser(HttpUser):
    wait_time = between(1, 5)

    def on_start(self):
        """Login before starting tasks"""
        self.client.post("/auth/login", json={
            "email": "test@weave.app",
            "password": "test123"
        })

    @task(3)
    def get_today_binds(self):
        """Most common operation - view today's binds"""
        self.client.get("/subtasks/today")

    @task(2)
    def complete_bind(self):
        """Second most common - complete a bind"""
        self.client.post("/subtasks/test-bind/complete", json={
            "completed_at": "2025-12-16T10:00:00Z"
        })

    @task(1)
    def submit_journal(self):
        """Less frequent - evening journal"""
        self.client.post("/journals", json={
            "local_date": "2025-12-16",
            "fulfillment_score": 7,
            "reflection": "Good day today"
        })
```

**Run Load Test:**
```bash
locust -f api/tests/load/locustfile.py --host=https://api.weave.app --users 1000 --spawn-rate 10
```

---

## Security Testing

### Security Test Checklist (MVP)

#### Authentication & Authorization

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| **SEC-001** | Attempt to access another user's goals | 403 Forbidden | P0 |
| **SEC-002** | Use expired JWT token | 401 Unauthorized | P0 |
| **SEC-003** | Brute force login (10+ attempts) | Rate limited | P1 |
| **SEC-004** | SQL injection in text fields | Query rejected | P0 |
| **SEC-005** | XSS in journal entries | Input sanitized | P1 |

**Example Test (SEC-001):**

```python
# api/tests/security/test_rls.py
import pytest
from fastapi.testclient import TestClient

def test_user_isolation(client: TestClient):
    """Users must not access other users' data"""

    # Create two users
    user_a_token = login_user("user-a@weave.app")
    user_b_token = login_user("user-b@weave.app")

    # User A creates a goal
    response = client.post("/goals",
        headers={"Authorization": f"Bearer {user_a_token}"},
        json={"title": "User A's Goal"}
    )
    goal_id = response.json()["data"]["id"]

    # User B attempts to access User A's goal
    response = client.get(f"/goals/{goal_id}",
        headers={"Authorization": f"Bearer {user_b_token}"}
    )

    assert response.status_code == 403
    assert "access denied" in response.json()["error"]["message"].lower()
```

#### Input Validation

| Test ID | Test Case | Expected Result | Priority |
|---------|-----------|-----------------|----------|
| **VAL-001** | Goal title > 200 chars | 400 Bad Request | P0 |
| **VAL-002** | Journal with future date | 400 Bad Request | P0 |
| **VAL-003** | Upload 50MB file | 413 Payload Too Large | P0 |
| **VAL-004** | Invalid timezone string | 400 Bad Request | P1 |
| **VAL-005** | Negative fulfillment score | 400 Bad Request | P1 |

**Example Test (VAL-002):**

```python
# api/tests/validation/test_date_validation.py
def test_journal_future_date_rejected(client: TestClient):
    """Cannot create journal entry for future date"""

    future_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")

    response = client.post("/journals",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "local_date": future_date,
            "fulfillment_score": 7,
            "reflection": "Future journal"
        }
    )

    assert response.status_code == 400
    assert "future date" in response.json()["error"]["message"].lower()
```

#### File Upload Security

```python
# api/tests/security/test_file_upload.py
def test_malicious_file_rejected(client: TestClient):
    """Executable files must be rejected"""

    files = {"file": ("malware.exe", b"MZ\x90\x00", "application/x-msdownload")}

    response = client.post("/captures",
        headers={"Authorization": f"Bearer {token}"},
        files=files
    )

    assert response.status_code == 400
    assert "file type not allowed" in response.json()["error"]["message"].lower()
```

### Security Scanning (Post-MVP)

**Tools:**
- **OWASP ZAP** - API security scanning
- **Dependabot** - Dependency vulnerability alerts (GitHub)
- **npm audit** / **pip-audit** - Dependency security checks

```bash
# Run dependency security checks
cd mobile && npm audit
cd api && uv run pip-audit
```

---

## Test Prioritization Matrix

### MVP Testing Priority (Week 1-6)

| Priority | Test Type | Coverage Target | Rationale |
|----------|-----------|-----------------|-----------|
| **P0 (Must Have)** | Unit tests for critical modules | 90%+ | Data integrity, cost control |
| **P0 (Must Have)** | Integration: Bind completion flow | 100% | Core user loop |
| **P0 (Must Have)** | Integration: Journal → AI generation | 100% | Core AI feature |
| **P0 (Must Have)** | Security: RLS policies | 100% | Prevent data leaks |
| **P1 (Should Have)** | Unit tests for standard modules | 60%+ | Code quality |
| **P1 (Should Have)** | E2E: Onboarding flow | 1 test | User acquisition |
| **P1 (Should Have)** | E2E: Daily action loop | 1 test | Core loop validation |
| **P2 (Nice to Have)** | E2E: Dashboard visualization | 1 test | Secondary feature |
| **P2 (Nice to Have)** | Performance tests | Basic benchmarks | Acceptable for MVP |
| **P3 (Post-MVP)** | Load testing | N/A | Not needed at <100 users |
| **P3 (Post-MVP)** | Accessibility testing | N/A | Defer to post-launch |

### Critical Modules Test Coverage Mandate

**These modules MUST have 90%+ coverage before MVP ships:**

1. ✅ `lib/utils/dates.ts` - Date/timezone handling
2. ✅ `lib/utils/streaks.ts` - Streak calculation
3. ✅ `lib/utils/consistency.ts` - Consistency metrics
4. ✅ `app/services/ai_cost_tracker.py` - AI cost control
5. ✅ `app/services/ai_cache.py` - Cache hit rate (cost savings)
6. ✅ `app/services/stats_computer.py` - Derived stat accuracy
7. ✅ `app/middleware/auth.py` - Security enforcement

**Test these modules first. Ship nothing until these are bulletproof.**

---

## Testing Tools & Setup

### Mobile (React Native)

**Test Runner:** Jest + React Native Testing Library

```bash
# Install dependencies
cd mobile
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
```

**Configuration:**

```javascript
// mobile/jest.config.js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThresholds: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
    // Critical modules require 90%
    './lib/utils/dates.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
```

**Run Tests:**

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# Run specific test file
npm test -- dates.test.ts
```

### Backend (Python FastAPI)

**Test Runner:** pytest + pytest-cov

```bash
# Install dependencies
cd api
uv add --dev pytest pytest-cov pytest-asyncio httpx
```

**Configuration:**

```ini
# api/pytest.ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
asyncio_mode = auto

# Coverage settings
addopts =
    --cov=app
    --cov-report=term-missing
    --cov-report=html
    --cov-fail-under=60

# Critical modules require 90% coverage
[coverage:report]
precision = 2
fail_under = 60
exclude_lines =
    pragma: no cover
    def __repr__
    raise AssertionError
    raise NotImplementedError

[coverage:paths]
source =
    app/
```

**Run Tests:**

```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov

# Run specific test file
uv run pytest tests/unit/test_dates.py

# Run integration tests only
uv run pytest tests/integration/

# Watch mode (with pytest-watch)
uv run ptw
```

### E2E (Detox)

```bash
# Install Detox
cd mobile
npm install --save-dev detox detox-cli

# Initialize Detox
npx detox init

# Build app for testing
npx detox build --configuration ios.sim.release

# Run E2E tests
npx detox test --configuration ios.sim.release
```

**Configuration:**

```json
// mobile/.detoxrc.js
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js'
    },
    jest: {
      setupTimeout: 120000
    }
  },
  apps: {
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/Weave.app',
      build: 'xcodebuild -workspace ios/Weave.xcworkspace -scheme Weave -configuration Release -sdk iphonesimulator -derivedDataPath ios/build'
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 15 Pro'
      }
    }
  },
  configurations: {
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release'
    }
  }
};
```

---

## Test Maintenance Strategy

### Test Ownership

- **Unit tests** - Owned by feature developer, updated with code changes
- **Integration tests** - Owned by backend team, reviewed weekly
- **E2E tests** - Owned by QA/PM, updated with new flows
- **Security tests** - Owned by tech lead, reviewed before releases

### Test Review Process

1. **Pre-Commit** - Run unit tests locally before pushing
2. **Pre-Merge** - CI runs all tests, coverage checked
3. **Pre-Deploy** - E2E tests + manual QA sign-off
4. **Post-Deploy** - Smoke tests on production

### Dealing with Flaky Tests

**Policy: Zero tolerance for flaky tests in CI**

If a test fails intermittently:
1. Mark as `.skip()` immediately to unblock CI
2. Investigate root cause within 24 hours
3. Fix or delete - no permanent skips allowed
4. Common causes: Race conditions, hardcoded waits, shared state

**Example Fix:**

```typescript
// ❌ Flaky - hardcoded wait
await new Promise(resolve => setTimeout(resolve, 1000));
expect(element).toBeVisible();

// ✅ Reliable - wait for condition
await waitFor(() => expect(element).toBeVisible(), { timeout: 5000 });
```

---

## Success Criteria & Sign-Off

### MVP Release Criteria (Week 6)

**Automated Tests:**
- ✅ 163+ unit tests passing (60%+ coverage, 90%+ for critical modules)
- ✅ 15+ integration tests passing
- ✅ 3 E2E flows passing (onboarding, daily loop, reflection)
- ✅ 0 security vulnerabilities (high/critical)
- ✅ Performance budgets met (Thread < 1s, Bind < 500ms)

**Manual QA:**
- ✅ Full onboarding flow tested on iPhone 15 Pro, iPhone X
- ✅ Core loop (bind completion + proof) tested for 7 consecutive days
- ✅ AI features tested with real OpenAI/Anthropic calls
- ✅ Push notifications delivered successfully
- ✅ No data loss or corruption in test accounts

**Sign-Off:**
- ✅ Tech Lead approval (code + test coverage)
- ✅ Product Owner approval (features complete)
- ✅ Security review passed (RLS + input validation)

### Post-MVP Testing Roadmap

**Month 2 (Weeks 7-10):**
- Increase unit coverage to 75%
- Add 10 more integration scenarios
- Add 5 more E2E flows
- Implement basic load testing (100 concurrent users)
- Add Sentry error tracking

**Month 3+ (Scale Phase):**
- Increase coverage to 80%
- Full load testing (1K-10K concurrent users)
- Accessibility audit (WCAG 2.1 Level AA)
- Security penetration testing
- Performance profiling (Flamegraphs, memory leaks)

---

## Document Control

### Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-16 | Jack | Initial test strategy created |

### Review Schedule

- **Sprint Review:** Update test plan with new features/learnings
- **Pre-Release:** Full test coverage audit
- **Post-Mortem:** Update strategy based on production bugs

### Approval

| Role | Name | Date | Status |
|------|------|------|--------|
| Tech Lead | Jack | 2025-12-16 | ✅ Approved |
| QA Lead | TBD | - | Pending |

---

**Document Status:** Active
**Next Review:** 2026-01-15
**Owner:** Jack

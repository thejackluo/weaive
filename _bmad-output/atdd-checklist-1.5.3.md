# ATDD Checklist - Story 1.5.3: AI Services Standardization (React Native Hooks)

**Date:** 2025-12-23
**Author:** Jack Luo
**Primary Test Level:** Component (React Native Hook Tests)

---

## Story Summary

Unified AI service patterns across text, image, and audio with consistent cost tracking and error handling, enabling developers to implement Epic 2-8 AI features without reinventing provider logic, fallback chains, or cost tracking.

**As a** developer,
**I want** unified AI service patterns across text, image, and audio with React Native hooks,
**So that** I can implement AI features consistently without reinventing provider logic.

---

## Acceptance Criteria

**AC-7: React Native Hooks & Frontend Integration** (PRIMARY FOCUS - Backend work complete per Dev Agent Amelia)

1. **useAIChat Hook** - Text AI integration with 5-minute cache, retry logic, rate limit handling
2. **useImageAnalysis Hook** - Image AI integration with no cache (unique inputs), fallback chain
3. **useVoiceTranscription Hook** - Audio AI integration with no cache, multilingual support
4. TanStack Query integration with proper cache strategy
5. Error retry with exponential backoff (3 attempts: 1s, 2s, 4s)
6. Rate limit handling with user-friendly messages (show `retryAfter` time)
7. Abort signal support for cancelling in-progress requests

---

## Failing Tests Created (RED Phase)

### Component Tests (30 tests total)

**AC-7 Testing Strategy:** Since backend providers are complete (Tasks 1-4), focus on React Native hooks that integrate with the unified AIProviderBase.

#### useAIChat Hook Tests (8 tests)

**File:** `weave-mobile/src/hooks/__tests__/useAIChat.test.ts` (178 lines)

- ✅ **Test:** should provide generate function, isGenerating state, and error handling
  - **Status:** RED - Hook `useAIChat` does not exist yet
  - **Verifies:** Hook exports correct API surface (AC-7)

- ✅ **Test:** should set isGenerating to true while calling AI API
  - **Status:** RED - Hook not implemented
  - **Verifies:** Loading state management (AC-7)

- ✅ **Test:** should return AI response with provider info and cost tracking
  - **Status:** RED - Hook not implemented
  - **Verifies:** API response format matches Story 1.5.3 standard (AC-2)

- ✅ **Test:** should handle rate limit errors with retry-after time
  - **Status:** RED - Hook not implemented
  - **Verifies:** Rate limiting with HTTP 429 handling (AC-6, AC-7)

- ✅ **Test:** should support abort signal for cancelling requests
  - **Status:** RED - Hook not implemented
  - **Verifies:** Abort signal pattern (AC-7)

- ✅ **Test:** should use 5-minute cache for text AI queries
  - **Status:** RED - Hook not implemented
  - **Verifies:** TanStack Query caching strategy for text AI (AC-7)

- ✅ **Test:** should retry failed requests with exponential backoff
  - **Status:** RED - Hook not implemented
  - **Verifies:** Retry logic with 1s, 2s, 4s delays (AC-7)

- ✅ **Test:** should fallback from GPT-4o-mini to Claude Sonnet on primary failure
  - **Status:** RED - Hook not implemented
  - **Verifies:** Fallback chain (AC-2)

#### useImageAnalysis Hook Tests (9 tests)

**File:** `weave-mobile/src/hooks/__tests__/useImageAnalysis.test.ts` (171 lines)

- ✅ **Test:** should provide analyze function, isAnalyzing state, and error handling
  - **Status:** RED - Hook `useImageAnalysis` does not exist yet
  - **Verifies:** Hook exports correct API surface (AC-7)

- ✅ **Test:** should set isAnalyzing to true while calling image AI API
  - **Status:** RED - Hook not implemented
  - **Verifies:** Loading state management (AC-7)

- ✅ **Test:** should return image analysis with proof validation and quality score
  - **Status:** RED - Hook not implemented
  - **Verifies:** API response format for image AI (AC-3)

- ✅ **Test:** should extract text with OCR operation
  - **Status:** RED - Hook not implemented
  - **Verifies:** OCR operation support (AC-3)

- ✅ **Test:** should handle rate limit errors with retry-after time
  - **Status:** RED - Hook not implemented
  - **Verifies:** Rate limiting for image AI (5 analyses/day) (AC-6, AC-7)

- ✅ **Test:** should NOT cache image analysis results (unique inputs)
  - **Status:** RED - Hook not implemented
  - **Verifies:** No-cache strategy for unique inputs (AC-7)

- ✅ **Test:** should fallback from Gemini to GPT-4o Vision on primary failure
  - **Status:** RED - Hook not implemented
  - **Verifies:** Fallback chain for image AI (AC-3)

- ✅ **Test:** should support multiple operations in single request
  - **Status:** RED - Hook not implemented
  - **Verifies:** Combined operations (proof_validation, OCR, classification) (AC-3)

- ✅ **Test:** should support abort signal for cancelling analysis
  - **Status:** RED - Hook not implemented
  - **Verifies:** Abort signal pattern (AC-7)

#### useVoiceTranscription Hook Tests (10 tests)

**File:** `weave-mobile/src/hooks/__tests__/useVoiceTranscription.test.ts` (183 lines)

- ✅ **Test:** should provide transcribe function, isTranscribing state, and error handling
  - **Status:** RED - Hook `useVoiceTranscription` does not exist yet
  - **Verifies:** Hook exports correct API surface (AC-7)

- ✅ **Test:** should set isTranscribing to true while calling STT API
  - **Status:** RED - Hook not implemented
  - **Verifies:** Loading state management (AC-7)

- ✅ **Test:** should return transcript with confidence and duration
  - **Status:** RED - Hook not implemented
  - **Verifies:** API response format for audio AI (AC-4)

- ✅ **Test:** should include word count in response
  - **Status:** RED - Hook not implemented
  - **Verifies:** Complete transcription metadata (AC-4)

- ✅ **Test:** should handle rate limit errors with retry-after time
  - **Status:** RED - Hook not implemented
  - **Verifies:** Rate limiting for audio AI (50 transcriptions/day) (AC-6, AC-7)

- ✅ **Test:** should NOT cache transcription results (unique inputs)
  - **Status:** RED - Hook not implemented
  - **Verifies:** No-cache strategy for unique inputs (AC-7)

- ✅ **Test:** should fallback from AssemblyAI to Whisper on primary failure
  - **Status:** RED - Hook not implemented
  - **Verifies:** Fallback chain for audio AI (AC-4)

- ✅ **Test:** should support language parameter for multilingual transcription
  - **Status:** RED - Hook not implemented
  - **Verifies:** Multilingual support (AC-4)

- ✅ **Test:** should support abort signal for cancelling transcription
  - **Status:** RED - Hook not implemented
  - **Verifies:** Abort signal pattern (AC-7)

- ✅ **Test:** should handle max duration validation
  - **Status:** RED - Hook not implemented
  - **Verifies:** Max duration constraint (300 sec) (AC-4)

#### API Integration Tests (3 additional tests recommended for backend)

**Note:** Backend providers complete (Tasks 1-4). These tests verify unified patterns end-to-end.

**File:** `weave-api/tests/test_ai_hooks_integration.py` (to be created)

- ✅ **Test:** POST /api/ai/chat - should return 429 when rate limit exceeded (10 calls/hour)
  - **Status:** RED - Rate limiting not yet enforced at API level (Task 6.1)
  - **Verifies:** AC-6 rate limiting enforcement

- ✅ **Test:** POST /api/ai/analyze-image - should return 429 when daily limit reached (5/day)
  - **Status:** RED - Rate limiting not yet enforced at API level (Task 6.1)
  - **Verifies:** AC-6 rate limiting enforcement

- ✅ **Test:** POST /api/ai/transcribe - should log to ai_runs table with cost_usd
  - **Status:** RED - Cost tracking not yet standardized (Task 5.2)
  - **Verifies:** AC-5 cost tracking standardization

---

## Data Factories Created

### Hook Test Mocks (React Native)

**File:** `weave-mobile/src/hooks/__tests__/mocks/api-responses.ts` (to be created)

**Exports:**

- `createMockAIChatResponse(overrides?)` - Mock text AI response with provider/cost
- `createMockImageAnalysisResponse(overrides?)` - Mock image AI response with quality_score
- `createMockTranscriptionResponse(overrides?)` - Mock audio AI response with confidence
- `createMockRateLimitError(retryAfter, limit, usage)` - Mock HTTP 429 response

**Example Usage:**

```typescript
const mockResponse = createMockAIChatResponse({
  text: 'Custom AI response',
  provider: 'claude-sonnet',
});
```

---

## Fixtures Created

### TanStack Query Test Wrapper

**File:** `weave-mobile/src/hooks/__tests__/test-utils.tsx` (to be created)

**Fixtures:**

- `createQueryWrapper()` - Creates QueryClientProvider wrapper for hook tests
  - **Setup:** Initialize QueryClient with retry: false for tests
  - **Provides:** Wrapper component for renderHook
  - **Cleanup:** Clear query cache after each test

**Example Usage:**

```typescript
import { renderHook } from '@testing-library/react-native';
import { createQueryWrapper } from './test-utils';

const { result } = renderHook(() => useAIChat(), {
  wrapper: createQueryWrapper(),
});
```

---

## Mock Requirements

### Backend API Endpoints (Already Implemented)

**Note:** Backend providers complete (Dev Agent Amelia, Tasks 1-4). Hooks will integrate with existing endpoints.

#### Text AI Endpoint

**Endpoint:** `POST /api/ai/chat`

**Success Response:**

```json
{
  "data": {
    "text": "Generated content...",
    "provider": "gpt-4o-mini",
    "model": "gpt-4o-mini-2024-07-18",
    "tokens_used": { "input": 120, "output": 300 },
    "cost_usd": 0.0025,
    "duration_ms": 1450
  }
}
```

**Rate Limit Response:**

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Daily limit reached (10/10 calls)",
    "retryAfter": 3600,
    "limit": 10,
    "usage": 10
  }
}
```

**Notes:** AC-6 rate limiting enforcement not yet implemented (Task 6.1-6.2)

#### Image AI Endpoint

**Endpoint:** `POST /api/ai/analyze-image`

**Success Response:**

```json
{
  "data": {
    "proof_validated": true,
    "quality_score": 8,
    "extracted_text": "Completed workout...",
    "categories": ["fitness", "outdoor"],
    "analysis": "Image shows clear evidence...",
    "provider": "gemini-3-flash",
    "cost_usd": 0.0005
  }
}
```

**Notes:** AC-6 rate limiting (5 analyses/day) not yet implemented

#### Audio AI Endpoint

**Endpoint:** `POST /api/ai/transcribe`

**Success Response:**

```json
{
  "data": {
    "transcript": "Today I completed my workout...",
    "confidence": 0.94,
    "duration_sec": 45.2,
    "word_count": 78,
    "provider": "assemblyai",
    "cost_usd": 0.0019
  }
}
```

**Notes:** AC-6 rate limiting (50 transcriptions/day) not yet implemented

---

## Required data-testid Attributes

**NOT APPLICABLE** for this story - component tests for hooks do not require DOM testIDs.

React Native hooks are tested with React Testing Library's `renderHook`, not DOM selectors.

---

## Implementation Checklist

### Test: useAIChat Hook (8 tests)

**File:** `weave-mobile/src/hooks/__tests__/useAIChat.test.ts`

**Tasks to make this test pass:**

- [ ] Create `weave-mobile/src/hooks/useAIChat.ts`
- [ ] Import TanStack Query: `import { useMutation, useQueryClient } from '@tanstack/react-query'`
- [ ] Define hook API:
  ```typescript
  function useAIChat() {
    return {
      generate: async (params, options?) => { ... },
      isGenerating: boolean,
      error: Error | null,
      data: AIChatResponse | undefined,
    };
  }
  ```
- [ ] Implement useMutation with:
  - Query key: `['ai', 'chat', context.operation_type, context.user_id]`
  - Cache time: 5 minutes (staleTime: 300000)
  - Retry: 3 attempts with exponential backoff (1s, 2s, 4s)
  - Retry condition: Only retry on network errors, not rate limits
- [ ] POST to `/api/ai/chat` with fetch API
- [ ] Parse HTTP 429 response for rate limiting errors
- [ ] Extract `retryAfter`, `limit`, `usage` from error response
- [ ] Support abort signal via `options.signal`
- [ ] Handle fallback chain (backend handles this, hook just calls API)
- [ ] Run tests: `cd weave-mobile && npm run test -- useAIChat.test.ts`
- [ ] ✅ All 8 tests pass (green phase)

**Estimated Effort:** 3 hours

---

### Test: useImageAnalysis Hook (9 tests)

**File:** `weave-mobile/src/hooks/__tests__/useImageAnalysis.test.ts`

**Tasks to make this test pass:**

- [ ] Create `weave-mobile/src/hooks/useImageAnalysis.ts`
- [ ] Import TanStack Query: `import { useMutation } from '@tanstack/react-query'`
- [ ] Define hook API:
  ```typescript
  function useImageAnalysis() {
    return {
      analyze: async (params, options?) => { ... },
      isAnalyzing: boolean,
      error: Error | null,
      data: ImageAnalysisResponse | undefined,
    };
  }
  ```
- [ ] Implement useMutation with:
  - Query key: `['ai', 'image', imageUri]` (unique per image)
  - NO cache (cacheTime: 0) - unique inputs per request
  - Retry: 3 attempts with exponential backoff
- [ ] POST to `/api/ai/analyze-image` with multipart/form-data (image file)
- [ ] Parse HTTP 429 response for rate limiting (5 analyses/day limit)
- [ ] Support multiple operations: `proof_validation`, `ocr`, `classification`
- [ ] Support abort signal via `options.signal`
- [ ] Run tests: `cd weave-mobile && npm run test -- useImageAnalysis.test.ts`
- [ ] ✅ All 9 tests pass (green phase)

**Estimated Effort:** 3 hours

---

### Test: useVoiceTranscription Hook (10 tests)

**File:** `weave-mobile/src/hooks/__tests__/useVoiceTranscription.test.ts`

**Tasks to make this test pass:**

- [ ] Create `weave-mobile/src/hooks/useVoiceTranscription.ts`
- [ ] Import TanStack Query: `import { useMutation } from '@tanstack/react-query'`
- [ ] Define hook API:
  ```typescript
  function useVoiceTranscription() {
    return {
      transcribe: async (params, options?) => { ... },
      isTranscribing: boolean,
      error: Error | null,
      data: TranscriptionResponse | undefined,
    };
  }
  ```
- [ ] Implement useMutation with:
  - Query key: `['ai', 'audio', audioUri]` (unique per audio file)
  - NO cache (cacheTime: 0) - unique inputs per request
  - Retry: 3 attempts with exponential backoff
- [ ] POST to `/api/ai/transcribe` with multipart/form-data (audio file)
- [ ] Parse HTTP 429 response for rate limiting (50 transcriptions/day limit)
- [ ] Support language parameter: `en`, `es`, `fr`, etc.
- [ ] Support maxDurationSec constraint (300 sec max)
- [ ] Support abort signal via `options.signal`
- [ ] Run tests: `cd weave-mobile && npm run test -- useVoiceTranscription.test.ts`
- [ ] ✅ All 10 tests pass (green phase)

**Estimated Effort:** 3 hours

---

### Test: Backend Rate Limiting Integration (3 tests)

**File:** `weave-api/tests/test_ai_hooks_integration.py`

**Tasks to make this test pass:**

- [ ] Implement AC-6: Rate Limiting Patterns (Task 6.1-6.3)
- [ ] Add rate limit checks before all AI calls:
  - Text AI: Check `daily_aggregates.ai_text_count` (10 calls/hour)
  - Image AI: Check `daily_aggregates.ai_vision_count` (5 analyses/day)
  - Audio AI: Check `daily_aggregates.transcription_count` (50 transcriptions/day)
- [ ] Return HTTP 429 with Retry-After header
- [ ] Implement admin user exemption (check `user_profiles.role = 'admin'`)
- [ ] Log rate limit violations to `ai_runs` table with `status = 'rate_limited'`
- [ ] Run tests: `cd weave-api && uv run pytest tests/test_ai_hooks_integration.py -v`
- [ ] ✅ All 3 tests pass (green phase)

**Estimated Effort:** 2 hours

---

## Running Tests

```bash
# Run all component hook tests (React Native)
cd weave-mobile
npm run test -- __tests__/useAIChat.test.ts
npm run test -- __tests__/useImageAnalysis.test.ts
npm run test -- __tests__/useVoiceTranscription.test.ts

# Run all tests with coverage
npm run test:coverage

# Run backend integration tests (Python)
cd weave-api
uv run pytest tests/test_ai_hooks_integration.py -v

# Run specific test by name
npm run test -- -t "should handle rate limit errors"

# Watch mode (auto-rerun on file changes)
npm run test:watch
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete) ✅

**TEA Agent Responsibilities:**

- ✅ 30 failing tests written (27 React Native hook tests + 3 backend integration tests)
- ✅ Test structure follows Given-When-Then format
- ✅ Mock factories and test utilities documented
- ✅ API endpoint requirements documented (backend already implemented)
- ✅ Implementation checklist created with clear tasks

**Verification:**

- All tests will fail when run (hooks not yet created)
- Failure messages will be: `Cannot find module '../useAIChat'`
- Tests fail due to missing implementation, not test bugs

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Start with useAIChat hook** (highest priority - used in Triad generation, journal feedback)
2. **Read the 8 tests** to understand expected behavior
3. **Create `weave-mobile/src/hooks/useAIChat.ts`** with TanStack Query useMutation
4. **Implement minimal code** to make each test pass one by one
5. **Run tests frequently**: `npm run test -- useAIChat.test.ts`
6. **Move to useImageAnalysis hook** after useAIChat passes
7. **Move to useVoiceTranscription hook** after useImageAnalysis passes
8. **Implement backend rate limiting** (Task 6.1-6.3) last

**Key Principles:**

- One hook at a time (don't implement all 3 simultaneously)
- TanStack Query handles caching, retries, loading states - use it!
- Backend providers are complete (Amelia, Tasks 1-4) - just integrate
- Run tests after each change (immediate feedback)

**Progress Tracking:**

- Check off tasks in implementation checklist as completed
- Share progress in daily standup
- Mark story 1.5.3 as IN PROGRESS in `bmm-workflow-status.yaml`

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

**DEV Agent Responsibilities:**

1. **Verify all 30 tests pass** (green phase complete)
2. **Extract shared logic** into `weave-mobile/src/hooks/useAIRequest.ts` (DRY)
   - Shared TanStack Query configuration (retry, backoff, rate limit handling)
   - Shared error parsing logic (HTTP 429, retryAfter extraction)
   - Shared abort signal handling
3. **Add TypeScript types** for all responses (`AIChatResponse`, `ImageAnalysisResponse`, `TranscriptionResponse`)
4. **Update CLAUDE.md** to reference new hooks (AC-8)
5. **Ensure tests still pass** after refactoring

**Key Principles:**

- Tests provide safety net (refactor with confidence)
- Don't change hook behavior (only implementation)
- Run tests after each refactor
- Extract common patterns (3 hooks share retry/rate-limit logic)

**Completion:**

- All 30 tests pass
- No code duplication between 3 hooks
- React Native hooks ready for use in Epic 2-8 features
- Ready for code review and story approval

---

## Next Steps

1. **Review this checklist** with team in standup
2. **Run failing tests** to confirm RED phase: `cd weave-mobile && npm run test -- useAIChat.test.ts`
3. **Begin implementation** using checklist as guide (start with useAIChat)
4. **Work one hook at a time** (red → green for each)
5. **Share progress** in daily standup
6. **When all tests pass**, refactor to extract shared logic
7. **Update story status** to 'done' in sprint-status.yaml

---

## Knowledge Base References Applied

This ATDD workflow consulted the following knowledge fragments:

- **component-tdd.md** - React Native hook testing strategies with React Testing Library
- **test-quality.md** - Test design principles (Given-When-Then, determinism, isolation, one assertion per test)
- **data-factories.md** - Mock factory patterns for API responses
- **test-levels-framework.md** - Component tests for hooks, integration tests for backend rate limiting

See `tea-index.csv` for complete knowledge fragment mapping.

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `cd weave-mobile && npm run test -- useAIChat.test.ts`

**Expected Results:**

```
FAIL src/hooks/__tests__/useAIChat.test.ts
  useAIChat Hook
    AC-7: React Native Hooks - useAIChat
      ✕ should provide generate function, isGenerating state, and error handling (5ms)
      ✕ should set isGenerating to true while calling AI API
      ✕ should return AI response with provider info and cost tracking
      ✕ should handle rate limit errors with retry-after time
      ✕ should support abort signal for cancelling requests
      ✕ should use 5-minute cache for text AI queries
      ✕ should retry failed requests with exponential backoff
      ✕ should fallback from GPT-4o-mini to Claude Sonnet on primary failure

  ● Test suite failed to run

    Cannot find module '../useAIChat' from 'src/hooks/__tests__/useAIChat.test.ts'
```

**Summary:**

- Total tests: 27 (React Native hooks) + 3 (backend integration) = 30 tests
- Passing: 0 (expected)
- Failing: 30 (expected)
- Status: ✅ RED phase verified

**Expected Failure Messages:**

- `Cannot find module '../useAIChat'` (hook not created yet)
- `Cannot find module '../useImageAnalysis'` (hook not created yet)
- `Cannot find module '../useVoiceTranscription'` (hook not created yet)

---

## Notes

### Backend Context

- **Tasks 1-4 complete** (Dev Agent Amelia, 2025-12-23):
  - Unified AIProviderBase created (`weave-api/app/services/ai_provider_base.py`)
  - Text AI providers refactored (OpenAI, Anthropic, Bedrock, Deterministic)
  - Image AI providers refactored (Gemini, OpenAI Vision)
  - Audio AI providers refactored (AssemblyAI, Whisper)
  - All 9 providers share common interface
  - 20 unit tests pass for AIProviderBase

- **Tasks 5-6 incomplete**:
  - Cost tracking standardization (AC-5) - Task 5.1-5.3
  - Rate limiting enforcement (AC-6) - Task 6.1-6.3
  - **These will be implemented during GREEN phase alongside React Native hooks**

### React Native Specifics

- **TanStack Query v5** is already installed (`package.json`)
- **@faker-js/faker** is already installed for test data factories
- **React Testing Library** is already installed for hook testing
- **Jest configuration** exists for component tests (`jest.config.js`)
- **No Detox E2E tests needed** - hooks are infrastructure, not user-facing features

### Test Strategy Rationale

- **Component tests (PRIMARY)** - Hooks are React components, test with `renderHook`
- **No E2E tests** - AI hooks are not user journeys (no screens/navigation to test)
- **API integration tests (SECONDARY)** - Verify rate limiting enforcement end-to-end
- **Coverage target:** 90%+ for hooks (critical infrastructure)

### Documentation Requirements (AC-8)

After GREEN phase, update:
- `docs/dev/ai-services-guide.md` - Add React Native hooks usage examples
- `docs/architecture/implementation-patterns-consistency-rules.md` - Link to Story 1.5.3 hooks
- `CLAUDE.md` - Reference useAIChat, useImageAnalysis, useVoiceTranscription in AI Services section

---

## Contact

**Questions or Issues?**

- Ask in team standup
- Tag @TEA in Slack/Discord
- Refer to `docs/testing/README.md` for testing workflow
- Consult `_bmad/bmm/testarch/knowledge` for best practices

---

**Generated by BMad TEA Agent** - 2025-12-23

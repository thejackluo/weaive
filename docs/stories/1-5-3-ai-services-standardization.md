# Story 1.5.3: AI Services Standardization (Text/Image/Audio)

Status: ready-for-dev

**Epic:** 1.5 - Development Infrastructure
**Story ID:** 1.5.3
**Story Key:** 1-5-3-ai-services-standardization
**Priority:** Should Have (Infrastructure)
**Estimate:** 4-5 story points
**Status:** backlog
**Created:** 2025-12-22

---

## Story

As a **developer**,
I want **unified AI service patterns across text, image, and audio with consistent cost tracking and error handling**,
so that **I can implement Epic 2-8 AI features without reinventing provider logic, fallback chains, or cost tracking**.

---

## Acceptance Criteria

### AC-1: Unified AI Provider Abstraction

**AIProviderBase Abstract Class:**
- [ ] Create `weave-api/app/services/ai_provider_base.py` with abstract base class
- [ ] Abstract methods:
  - `call_ai(input, context) -> dict` - Main AI generation method
  - `estimate_cost(input) -> float` - Pre-call cost estimation
  - `get_provider_name() -> str` - Provider identifier for logging
- [ ] Common methods (implemented in base class):
  - `log_to_ai_runs(operation_type, input_tokens, output_tokens, cost_usd, duration_ms)` - Log all AI calls to `ai_runs` table
  - `check_rate_limit(user_id, operation_type) -> bool` - Check `daily_aggregates` before AI calls
- [ ] All existing AI providers inherit from `AIProviderBase`
- [ ] Fallback chain pattern: Primary → Secondary → Graceful degradation (return None or default)

**Provider Initialization:**
- [ ] All providers initialized from environment variables (API keys, config)
- [ ] Validate API keys on startup (fail fast if missing/invalid)
- [ ] Document provider configuration in `docs/dev/ai-services-guide.md`

---

### AC-2: Text AI Standardization

**Review Existing Implementation:**
- [ ] Examine `weave-api/app/services/ai/base.py` - Does current `AIProvider` satisfy AC-1 requirements?
- [ ] Review existing providers: `openai_provider.py`, `anthropic_provider.py`, `bedrock_provider.py`
- [ ] Check `cost_tracker.py` and `rate_limiter.py` - Do they match AC-5 and AC-6 patterns?

**Providers & Decision Tree:**
- [ ] **Primary:** GPT-4o-mini ($0.15/$0.60/MTok) - Triad generation, daily recap, journal feedback
- [ ] **Secondary:** Claude 3.7 Sonnet ($3.00/$15.00/MTok) - Onboarding, complex reasoning, coaching
- [ ] **Tertiary:** Deterministic/cached (fallback)
- [ ] Document decision tree in AI services guide

**Standardization Tasks:**
- [ ] If existing `ai/base.py` needs changes: Refactor to match unified `AIProviderBase` (AC-1)
- [ ] If already compliant: Document as reference implementation
- [ ] Verify standard request/response format (see "Standard AI Patterns" section below)
- [ ] Maintain backwards compatibility with existing API endpoints

---

### AC-3: Image AI Standardization

**Review Existing Implementation:**
- [ ] Examine `weave-api/app/services/images/vision_service.py` - Current fallback chain
- [ ] Review providers: `gemini_vision_provider.py`, `openai_vision_provider.py`
- [ ] Check if they follow same interface as text AI (polymorphism)

**Providers & Use Cases:**
- [ ] **Primary:** Gemini 3.0 Flash (~$0.0005/image) - Proof validation, OCR, classification
- [ ] **Secondary:** GPT-4o Vision (~$0.02/image) - Complex analysis fallback
- [ ] **Tertiary:** Store without analysis (graceful degradation)

**Standardization Tasks:**
- [ ] Refactor image providers to inherit from unified `AIProviderBase` (AC-1)
- [ ] Align method signatures with text AI pattern (polymorphism)
- [ ] Verify standard request/response format (see "Standard AI Patterns" section below)
- [ ] Test backwards compatibility with `/api/captures/images/analyze` endpoint

---

### AC-4: Audio AI Standardization

**Review Existing Implementation:**
- [ ] Examine `weave-api/app/services/stt/base.py` - Does `STTProvider` match unified pattern?
- [ ] Review providers: `assemblyai_provider.py`, `whisper_provider.py`
- [ ] Check `stt_service.py` fallback chain - Align with text/image patterns

**Providers & Use Cases:**
- [ ] **Primary:** AssemblyAI ($0.15/hr) - Speech-to-text transcription
- [ ] **Secondary:** OpenAI Whisper ($0.006/min) - Fallback for edge cases
- [ ] **Tertiary:** Store without transcript (graceful degradation)

**Standardization Tasks:**
- [ ] Refactor audio providers to inherit from unified `AIProviderBase` (AC-1)
- [ ] Align `STTProvider` interface with text/image AI (polymorphism - same method names where applicable)
- [ ] Verify standard request/response format (see "Standard AI Patterns" section below)
- [ ] Test backwards compatibility with `/api/transcribe` endpoint

---

### AC-5: Cost Tracking Standardization

**Review Existing Implementation:**
- [ ] Check if `weave-api/app/services/ai/cost_tracker.py` already logs to `ai_runs` table
- [ ] Verify logged fields: `operation_type`, `provider`, `model`, `input_tokens`, `output_tokens`, `cost_usd`, `duration_ms`, `user_id`, `timestamp`, `input_hash`
- [ ] Check if image/audio services use same cost tracking pattern

**Standardization Tasks:**
- [ ] Extend cost tracker to support all 3 modalities (text/image/audio)
- [ ] Unified logging format:
  - Text: `input_tokens`, `output_tokens`
  - Image: `image_count`, `quality_score`
  - Audio: `audio_duration_sec`, `confidence`
- [ ] Create/update `weave-api/app/utils/cost_calculator.py` with model-specific pricing

**Model-Specific Pricing Configuration:**
- [ ] Use environment variables for pricing (update without code changes):
  ```bash
  # Text AI
  GPT4O_MINI_INPUT_COST=0.15  # per MTok
  GPT4O_MINI_OUTPUT_COST=0.60
  CLAUDE_SONNET_INPUT_COST=3.00
  CLAUDE_SONNET_OUTPUT_COST=15.00
  
  # Image AI
  GEMINI_FLASH_IMAGE_COST=0.0005  # per image
  GPT4O_VISION_IMAGE_COST=0.02
  
  # Audio AI
  ASSEMBLYAI_COST_PER_HOUR=0.15
  WHISPER_COST_PER_MINUTE=0.006
  ```
- [ ] Cost calculator reads from env: `calculate_cost(model_name, input_data, output_data)`
- [ ] Log warnings on missing price config (fallback to documented defaults)
- [ ] Document pricing in `docs/dev/ai-services-guide.md` (pricing table)

---

### AC-6: Rate Limiting Patterns

**Rate Limit Checks Before AI Calls:**
- [ ] Text AI: Check `daily_aggregates.ai_text_count` (10 calls/hour per user)
- [ ] Image AI: Check `daily_aggregates.ai_vision_count` (5 analyses/day per user)
- [ ] Audio AI: Check `daily_aggregates.transcription_count` (50 transcriptions/day per user)

**Rate Limit Enforcement:**
- [ ] Return HTTP 429 response:
  ```json
  {
    "error": {
      "code": "RATE_LIMIT_EXCEEDED",
      "message": "Daily limit reached (5/5 images)",
      "retryAfter": 22980,
      "limit": 5,
      "usage": 5
    }
  }
  ```
- [ ] Include `Retry-After` header (seconds until midnight user timezone)
- [ ] Log rate limit violations to `ai_runs` table with `status = 'rate_limited'`

**Admin User Exemption:**
- [ ] Admin users (developers) bypass rate limits for testing/support
- [ ] Check `user_profiles.role = 'admin'` before enforcing rate limits
- [ ] Still log admin AI calls for cost tracking

---

### AC-7: React Native Hooks & Frontend Integration

**TanStack Query Integration (Critical for Offline Support):**
- [ ] Query keys:
  - Text: `['ai', 'chat', context.operation_type, context.user_id]`
  - Image: `['ai', 'image', imageUri]` (no cache - unique inputs)
  - Audio: `['ai', 'audio', audioUri]` (no cache - unique inputs)
- [ ] Cache strategy:
  - Text AI: 5min cache (triads change daily, show cached while refetching)
  - Image/Audio: No cache (always fresh, unique inputs per request)
- [ ] Stale-while-revalidate: Text AI only
- [ ] Error retry: 3 attempts, exponential backoff (1s, 2s, 4s)
- [ ] Rate limit handling: `onError` callback shows `retryAfter` time to user

**useAIChat Hook (Text AI):**
- [ ] Create `weave-mobile/src/hooks/useAIChat.ts`
- [ ] API: `const { generate, isGenerating, error, data } = useAIChat();`
- [ ] Usage: `const result = await generate({ prompt: "...", context: {...} });`
- [ ] TanStack Query: Cache 5min, stale-while-revalidate enabled
- [ ] Loading: "Generating..." | Error: "AI unavailable. Retry in {retryAfter}s"

**useImageAnalysis Hook (Image AI):**
- [ ] Create `weave-mobile/src/hooks/useImageAnalysis.ts`
- [ ] API: `const { analyze, isAnalyzing, error } = useImageAnalysis();`
- [ ] Usage: `const result = await analyze({ imageUri: "...", operations: ["proof_validation", "ocr"] });`
- [ ] TanStack Query: No cache (unique inputs)
- [ ] Loading: "Analyzing image..." | Error: "Analysis failed. Try again."

**useVoiceTranscription Hook (Audio AI):**
- [ ] Create `weave-mobile/src/hooks/useVoiceTranscription.ts`
- [ ] API: `const { transcribe, isTranscribing, error } = useVoiceTranscription();`
- [ ] Usage: `const result = await transcribe({ audioUri: "...", language: "en" });`
- [ ] TanStack Query: No cache (unique inputs)
- [ ] Loading: "Transcribing..." | Error: "Transcription failed. Try again."

**Common Hook Patterns:**
- [ ] All use TanStack Query `useMutation` for API calls
- [ ] All handle HTTP 429 (rate limit) - parse `retryAfter` from response
- [ ] All support abort signals - `signal: abortController.signal`
- [ ] All log errors in `__DEV__` mode

---

### AC-8: Documentation

**AI Services Guide (Extend Existing):**
- [ ] Review `docs/dev/ai-service-integration-guide.md` (Story 0.11 learnings)
- [ ] Extend with Story 1.5.3 additions:
  - Unified `AIProviderBase` specification (AC-1)
  - Text AI decision tree (GPT-4o-mini vs Claude)
  - Image AI patterns (Gemini vs GPT-4o Vision)
  - React Native hooks usage (`useAIChat`, `useImageAnalysis`, `useVoiceTranscription`)
  - TanStack Query patterns (caching, offline support, retry logic)
  - Model-specific pricing configuration (environment variables)
- [ ] Rename to: `docs/dev/ai-services-guide.md` (consolidate naming)
- [ ] Add provider decision tree diagram
- [ ] Add complete examples for all 3 modalities
- [ ] Link from `CLAUDE.md` Story 1.5.3 reference

**Update Architecture Docs:**
- [ ] Update `docs/architecture/core-architectural-decisions.md`:
  - Add section: "Unified AI Service Architecture (Story 1.5.3)"
  - Provider fallback diagram (Primary → Secondary → Graceful degradation)
  - Polymorphism pattern (shared interface, DRY)
  - Cost tracking and rate limiting unified patterns
- [ ] Update `docs/architecture/implementation-patterns-consistency-rules.md`:
  - Add Story 1.5.3 AI standardization reference
  - Link to `docs/dev/ai-services-guide.md`

---

### AC-9: Testing

**Unit Tests:**
- [ ] Test unified `AIProviderBase` inheritance for all providers (text/image/audio)
- [ ] Test cost calculation for each provider (GPT-4o-mini, Claude, Gemini, AssemblyAI, Whisper)
- [ ] Test rate limit checks (user hits limit, admin bypasses)
- [ ] Test fallback chain (primary fails → secondary succeeds → tertiary graceful degradation)
- [ ] Test model-specific pricing from environment variables

**Integration Tests:**
- [ ] Test text AI generation: GPT-4o-mini + Claude fallback chain
- [ ] Test image analysis: Gemini + GPT-4o Vision fallback chain
- [ ] Test audio transcription: AssemblyAI + Whisper fallback chain
- [ ] Test rate limiting enforcement (HTTP 429 response with `Retry-After` header)
- [ ] Test graceful degradation (all providers down - store partial results)
- [ ] Test cost logging (verify `ai_runs` table entries)

**React Native Hook Tests:**
- [ ] Test `useAIChat` loading/error states + TanStack Query caching (5min)
- [ ] Test `useImageAnalysis` with no cache (unique inputs)
- [ ] Test `useVoiceTranscription` with no cache (unique inputs)
- [ ] Test abort signal handling (cancel in-progress requests)
- [ ] Test rate limit error UI (parse `retryAfter`, show user-friendly message)

**Backwards Compatibility Tests:**
- [ ] Verify Story 0.6 text AI endpoints still work
- [ ] Verify Story 0.9 image AI endpoint (`/api/captures/images/analyze`) still works
- [ ] Verify Story 0.11 audio endpoint (`/api/transcribe`) still works
- [ ] Verify cost tracking format unchanged
- [ ] Verify rate limiting behavior unchanged

**Coverage Target:** 80%+ for `services/ai/`, `services/images/`, `services/stt/`

---

## Standard AI Patterns (Applies to AC-2, AC-3, AC-4)

**Request Format (Text AI):**
```json
{
  "messages": [{"role": "user", "content": "..."}],
  "context": {
    "user_id": "uuid",
    "operation_type": "triad_generation",
    "max_tokens": 500
  }
}
```

**Response Format (Text AI):**
```json
{
  "text": "Generated content...",
  "provider": "gpt-4o-mini",
  "model": "gpt-4o-mini-2024-07-18",
  "tokens_used": {"input": 120, "output": 300},
  "cost_usd": 0.0025,
  "duration_ms": 1450
}
```

**Request Format (Image AI):**
```json
{
  "image_url": "https://...",
  "prompt": "Analyze this proof image...",
  "operations": ["proof_validation", "ocr", "classification"],
  "max_tokens": 300
}
```

**Response Format (Image AI):**
```json
{
  "proof_validated": true,
  "quality_score": 8,
  "extracted_text": "Completed workout...",
  "categories": ["fitness", "outdoor"],
  "analysis": "Image shows clear evidence...",
  "provider": "gemini-3-flash",
  "cost_usd": 0.0005
}
```

**Request Format (Audio AI):**
```json
{
  "audio_file": "<bytes>",
  "format": "m4a",
  "language": "en",
  "max_duration_sec": 300
}
```

**Response Format (Audio AI):**
```json
{
  "transcript": "Today I completed my workout...",
  "confidence": 0.94,
  "duration_sec": 45.2,
  "word_count": 78,
  "provider": "assemblyai",
  "cost_usd": 0.0019
}
```

---

## Tasks / Subtasks

- [ ] Task 1: Create AIProviderBase abstraction (AC-1)
  - [ ] 1.1: Create `ai_provider_base.py` with abstract methods
  - [ ] 1.2: Implement common methods (`log_to_ai_runs`, `check_rate_limit`)
  - [ ] 1.3: Document provider initialization pattern
- [ ] Task 2: Refactor Text AI services (AC-2)
  - [ ] 2.1: Extract OpenAI logic into `OpenAIProvider` class
  - [ ] 2.2: Extract Claude logic into `ClaudeProvider` class
  - [ ] 2.3: Update existing text AI endpoints to use new providers
  - [ ] 2.4: Test backwards compatibility
- [ ] Task 3: Refactor Image AI services (AC-3)
  - [ ] 3.1: Extract Gemini logic into `GeminiProvider` class
  - [ ] 3.2: Extract GPT-4o Vision logic into `GPT4VisionProvider` class
  - [ ] 3.3: Update existing image AI endpoints
  - [ ] 3.4: Test backwards compatibility
- [ ] Task 4: Refactor Audio AI services (AC-4)
  - [ ] 4.1: Extract AssemblyAI logic into `AssemblyAIProvider` class
  - [ ] 4.2: Extract Whisper logic into `WhisperProvider` class
  - [ ] 4.3: Update existing audio AI endpoints
  - [ ] 4.4: Test backwards compatibility
- [ ] Task 5: Implement cost tracking standardization (AC-5)
  - [ ] 5.1: Create `cost_calculator.py` utility
  - [ ] 5.2: Update all providers to log to `ai_runs` table
  - [ ] 5.3: Verify cost calculations for all providers
- [ ] Task 6: Implement rate limiting patterns (AC-6)
  - [ ] 6.1: Add rate limit checks before all AI calls
  - [ ] 6.2: Return HTTP 429 with user-friendly error
  - [ ] 6.3: Implement admin user exemption
- [ ] Task 7: Create React Native hooks (AC-7)
  - [ ] 7.1: Create `useAIChat.ts` hook
  - [ ] 7.2: Create `useImageAnalysis.ts` hook
  - [ ] 7.3: Create `useVoiceTranscription.ts` hook
  - [ ] 7.4: Test hooks with loading/error states
- [ ] Task 8: Write documentation (AC-8)
  - [ ] 8.1: Extend `docs/dev/ai-service-integration-guide.md` → rename to `ai-services-guide.md`
  - [ ] 8.2: Update architecture docs with unified patterns
  - [ ] 8.3: Link from CLAUDE.md
- [ ] Task 9: Testing (AC-9)
  - [ ] 9.1: Unit tests (provider inheritance, cost calculation, rate limits, fallback chains)
  - [ ] 9.2: Integration tests (text/image/audio with real providers + fallback)
  - [ ] 9.3: React Native hook tests (loading/error states, TanStack Query caching)
  - [ ] 9.4: Backwards compatibility tests (Stories 0.6, 0.9, 0.11 APIs still work)

---

## Dev Notes

### Existing AI Infrastructure (CRITICAL - Read First)

**Text AI Services (Story 0.6) - ✅ EXISTS:**
- **Location:** `weave-api/app/services/ai/`
- **Base:** `base.py` with `AIProvider` abstract class
- **Providers:** `bedrock_provider.py`, `anthropic_provider.py`, `openai_provider.py`, `deterministic_provider.py`
- **Cost tracking:** `cost_tracker.py` logs to `ai_runs` table
- **Rate limiting:** `rate_limiter.py` checks `daily_aggregates`
- **Fallback chain:** Bedrock → OpenAI → Anthropic → Deterministic
- **Task:** Review if `ai/base.py` can serve as unified `AIProviderBase` or needs refactoring

**Image AI Services (Story 0.9) - ✅ EXISTS:**
- **Location:** `weave-api/app/services/images/`
- **Providers:** `gemini_vision_provider.py`, `openai_vision_provider.py`
- **Service:** `vision_service.py` orchestrates fallback (Gemini → GPT-4o Vision)
- **Task:** Refactor to inherit from unified `AIProviderBase` (if needed)

**Audio AI Services (Story 0.11) - ✅ EXISTS:**
- **Location:** `weave-api/app/services/stt/`
- **Base:** `base.py` with `STTProvider` abstract class
- **Providers:** `assemblyai_provider.py`, `whisper_provider.py`
- **Service:** `stt_service.py` orchestrates fallback (AssemblyAI → Whisper)
- **Task:** Align with unified pattern (polymorphism, same interface as text/image)

**Integration Guide - ✅ EXISTS:**
- **Location:** `docs/dev/ai-service-integration-guide.md` (700+ lines, Story 0.11 learnings)
- **Covers:** Environment config, provider abstraction, fallback chains, error handling, graceful degradation
- **Task:** Extend (not replace) with Story 1.5.3 React Native hooks + standardization patterns

**Architecture Alignment:**
- Unified `AIProviderBase` prevents pattern divergence across 15+ Epic 2-8 AI integrations
- Cost tracking standardization ensures per-feature/per-user visibility
- Rate limiting enforcement prevents cost overruns ($83.33/day = $2,500/month budget)

### Refactoring Strategy

**Backwards Compatibility Approach:**
1. Keep existing API endpoints unchanged
2. Refactor internal provider logic to inherit from `AIProviderBase`
3. Test existing functionality (Stories 0.6, 0.9, 0.11 continue to work)
4. New Epic 2-8 features use standardized hooks/patterns

**Migration Path:**
1. **Phase 1 (This story):** Create `AIProviderBase`, refactor existing providers, create hooks
2. **Phase 2 (Epic 2-8 stories):** Use standardized patterns for new AI integrations
3. **Phase 3 (Post-MVP):** Deprecate old patterns, enforce standardization

### Cost Tracking Benefits

**Unified Logging:**
- All AI calls logged to single `ai_runs` table
- Easy cost analysis: `SELECT SUM(cost_usd) FROM ai_runs WHERE operation_type = 'triad_generation'`
- Per-user cost tracking: `SELECT user_id, SUM(cost_usd) FROM ai_runs GROUP BY user_id`
- Provider comparison: `SELECT provider, AVG(cost_usd), AVG(duration_ms) FROM ai_runs GROUP BY provider`

**Budget Enforcement:**
- Application-wide daily budget: $83.33/day ($2,500/month ÷ 30 days)
- Per-user budget: Free users $0.02/day (~$0.60/month), Paid users $0.10/day (~$3.00/month)
- Auto-throttle to cache-only mode at 100% budget

### Rate Limiting Benefits

**User Experience:**
- Clear error messages: "Daily limit reached (5/5 images). Resets in 6 hours 23 minutes."
- Retry-After header enables automatic retry logic
- Admin users bypass limits for testing/support

**Cost Control:**
- Text AI: 10 calls/hour = 240 calls/day max (prevents runaway costs)
- Image AI: 5 analyses/day (controls storage + vision costs)
- Audio AI: 50 transcriptions/day (prevents audio storage bloat)

### Testing Strategy

**Unit Tests:**
- Test each provider class inherits from `AIProviderBase`
- Test cost calculation for all providers
- Test rate limit checks (user hits limit, admin bypasses limit)
- Test fallback chain (primary fails → secondary succeeds)

**Integration Tests:**
- Test existing Story 0.6, 0.9, 0.11 endpoints still work (backwards compatibility)
- Test new React Native hooks with loading/error states
- Test rate limiting enforcement (429 response)

**Manual Testing:**
- Test AI generation with each provider (GPT-4o-mini, Claude, Gemini, AssemblyAI)
- Test fallback chain (disable primary provider, verify secondary works)
- Test rate limiting UI (hit limit, verify error message)

### Project Structure (Polymorphism & DRY)

**Existing Backend Structure (DO NOT CREATE, REFACTOR IF NEEDED):**
```
weave-api/app/services/
├── ai/                                  # ✅ Text AI (Story 0.6)
│   ├── base.py                          # Review: Can this be unified AIProviderBase?
│   ├── openai_provider.py
│   ├── anthropic_provider.py
│   ├── bedrock_provider.py
│   ├── cost_tracker.py                  # Extend for image/audio
│   └── rate_limiter.py                  # Extend for image/audio
├── images/                              # ✅ Image AI (Story 0.9)
│   ├── gemini_vision_provider.py        # Refactor to inherit from unified base
│   ├── openai_vision_provider.py        # Refactor to inherit from unified base
│   └── vision_service.py                # Update fallback chain
├── stt/                                 # ✅ Audio AI (Story 0.11)
│   ├── base.py                          # Align with unified AIProviderBase
│   ├── assemblyai_provider.py           # Refactor to match unified pattern
│   ├── whisper_provider.py              # Refactor to match unified pattern
│   └── stt_service.py                   # Update fallback chain
```

**Files to Create/Modify:**
- [ ] `weave-api/app/services/ai_provider_base.py` - Unified base (IF needed, review `ai/base.py` first)
- [ ] `weave-api/app/utils/cost_calculator.py` - Model-specific pricing utility
- [ ] `weave-mobile/src/hooks/useAIChat.ts` - NEW (Story 1.5.3)
- [ ] `weave-mobile/src/hooks/useImageAnalysis.ts` - NEW (Story 1.5.3)
- [ ] `weave-mobile/src/hooks/useVoiceTranscription.ts` - NEW (Story 1.5.3)

**Polymorphism Pattern:**
- All providers inherit from single `AIProviderBase` (or extend existing `ai/base.py`)
- Shared interface: `call_ai()`, `estimate_cost()`, `get_provider_name()`, `is_available()`
- Fallback chain logic reusable across text/image/audio
- Cost tracking/rate limiting unified for all modalities

### References

- [Source: docs/prd/epic-1.5-app-navigation-scaffolding.md#Story-1.5.3] ✅
- [Existing: weave-api/app/services/ai/] - Text AI implementation (Story 0.6)
- [Existing: weave-api/app/services/images/] - Image AI implementation (Story 0.9)
- [Existing: weave-api/app/services/stt/] - Audio AI implementation (Story 0.11)
- [Existing: docs/dev/ai-service-integration-guide.md] - Integration patterns (Story 0.11)
- [Source: docs/architecture/core-architectural-decisions.md] ✅
- [Source: CLAUDE.md#Story-1.5.3-AI-Service-Patterns] ✅

---

## Dev Agent Record

### Agent Model Used

global.anthropic.claude-sonnet-4-5-20250929-v1:0 (Scrum Master Bob)

### Debug Log References

None yet - story not started

### Completion Notes List

- Story created in YOLO mode by Scrum Master Bob
- Extracted patterns from Stories 0.6, 0.9, 0.11
- Designed unified `AIProviderBase` abstraction
- Created React Native hooks for all 3 AI modalities

### File List

- `docs/stories/1-5-3-ai-services-standardization.md` (this file)

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

**Text AI Providers:**
- [ ] **Primary:** OpenAI GPT-4o-mini ($0.15/$0.60 per MTok) - 90% of text generation (routine operations)
- [ ] **Secondary:** Claude 3.7 Sonnet ($3.00/$15.00 per MTok) - Complex reasoning, fallback for GPT failures
- [ ] **Tertiary:** Deterministic/cached responses (when both providers fail)

**Text AI Decision Tree:**
- [ ] Document when to use GPT-4o-mini vs Claude:
  - GPT-4o-mini: Triad generation, daily recap, journal feedback, simple Q&A
  - Claude 3.7 Sonnet: Onboarding dream self, complex reasoning, nuanced coaching
- [ ] Standard request format:
  ```json
  {
    "messages": [...],
    "context": {
      "user_id": "...",
      "operation_type": "triad_generation",
      "max_tokens": 500
    }
  }
  ```
- [ ] Standard response format:
  ```json
  {
    "text": "Generated content...",
    "provider": "gpt-4o-mini",
    "model": "gpt-4o-mini-2024-07-18",
    "tokens_used": {
      "input": 120,
      "output": 300
    },
    "cost_usd": 0.0025,
    "duration_ms": 1450
  }
  ```

**Refactor Existing Text AI Services:**
- [ ] Update `weave-api/app/services/text_ai_service.py` (from Story 0.6) to inherit from `AIProviderBase`
- [ ] Extract provider-specific logic into separate classes: `OpenAIProvider`, `ClaudeProvider`
- [ ] Maintain backwards compatibility with existing API endpoints

---

### AC-3: Image AI Standardization

**Image AI Providers:**
- [ ] **Primary:** Gemini 3.0 Flash (~$0.0005 per image, free tier: 5 images/day) - Proof validation, OCR, classification
- [ ] **Secondary:** GPT-4o Vision ($5/MTok, ~$0.02 per image) - Fallback for complex image analysis
- [ ] **Tertiary:** Store image without AI analysis (manual review later)

**Image AI Pattern:**
- [ ] Standard request format:
  ```json
  {
    "image_url": "https://...",
    "prompt": "Analyze this proof image for task completion...",
    "operations": ["proof_validation", "ocr", "classification"],
    "max_tokens": 300
  }
  ```
- [ ] Standard response format:
  ```json
  {
    "proof_validated": true,
    "quality_score": 8,
    "extracted_text": "Completed workout at gym...",
    "categories": ["fitness", "outdoor", "workout"],
    "analysis": "Image shows clear evidence of...",
    "provider": "gemini-3-flash",
    "cost_usd": 0.0005
  }
  ```

**Refactor Existing Image AI Services:**
- [ ] Update `weave-api/app/services/image_ai_service.py` (from Story 0.9) to inherit from `AIProviderBase`
- [ ] Extract provider-specific logic into `GeminiProvider`, `GPT4VisionProvider` classes
- [ ] Maintain backwards compatibility with existing `/api/captures/images/analyze` endpoint

---

### AC-4: Audio AI Standardization

**Audio AI Providers:**
- [ ] **Primary:** AssemblyAI ($0.15/hr = $0.0025/min) - Speech-to-text transcription
- [ ] **Secondary:** OpenAI Whisper API ($0.006/min) - Fallback for edge cases or AssemblyAI downtime
- [ ] **Tertiary:** Store audio without transcript (manual transcription later)

**Audio AI Pattern:**
- [ ] Standard request format:
  ```json
  {
    "audio_file": bytes,
    "format": "m4a",
    "language": "en",
    "max_duration_sec": 300
  }
  ```
- [ ] Standard response format:
  ```json
  {
    "transcript": "Today I completed my morning workout...",
    "confidence": 0.94,
    "duration_sec": 45.2,
    "word_count": 78,
    "provider": "assemblyai",
    "cost_usd": 0.0019
  }
  ```

**Refactor Existing Audio AI Services:**
- [ ] Update `weave-api/app/services/stt_service.py` (from Story 0.11) to inherit from `AIProviderBase`
- [ ] Extract provider-specific logic into `AssemblyAIProvider`, `WhisperProvider` classes
- [ ] Maintain backwards compatibility with existing `/api/transcribe` endpoint

---

### AC-5: Cost Tracking Standardization

**Unified Cost Logging:**
- [ ] All AI calls log to `ai_runs` table with:
  - `operation_type`: "text_generation", "image_analysis", "transcription"
  - `provider`: "gpt-4o-mini", "gemini-3-flash", "assemblyai"
  - `model`: Specific model name (e.g., "gpt-4o-mini-2024-07-18")
  - `input_tokens` (for text), `image_count` (for image), `audio_duration_sec` (for audio)
  - `output_tokens` (for text), `quality_score` (for image), `confidence` (for audio)
  - `cost_usd`: Calculated per-provider pricing
  - `duration_ms`: API call latency
  - `user_id`, `timestamp`, `input_hash` (for caching)

**Cost Calculation Utility:**
- [ ] Create `weave-api/app/utils/cost_calculator.py`
- [ ] Function: `calculate_cost(provider, operation_type, input_data, output_data) -> float`
- [ ] Document per-provider pricing:
  - GPT-4o-mini: $0.15/$0.60 per MTok
  - Claude 3.7 Sonnet: $3.00/$15.00 per MTok
  - Gemini 3.0 Flash: ~$0.0005 per image (free tier: 5/day)
  - AssemblyAI: $0.15/hr ($0.0025/min)
  - Whisper API: $0.006/min
- [ ] Update cost on pricing changes via environment variables

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

**Standardized React Native Hooks:**

**useAIChat Hook (Text AI):**
- [ ] Create `weave-mobile/src/hooks/useAIChat.ts`
- [ ] API: `const { generate, isGenerating, error } = useAIChat();`
- [ ] Usage: `const result = await generate({ prompt: "...", context: {...} });`
- [ ] Loading state: "Generating..." (customizable)
- [ ] Error state: "AI service unavailable. Try again." (customizable)
- [ ] Automatic retry on transient failures (3 attempts, exponential backoff)

**useImageAnalysis Hook (Image AI):**
- [ ] Create `weave-mobile/src/hooks/useImageAnalysis.ts`
- [ ] API: `const { analyze, isAnalyzing, error } = useImageAnalysis();`
- [ ] Usage: `const result = await analyze({ imageUri: "...", operations: ["proof_validation", "ocr"] });`
- [ ] Loading state: "Analyzing image..." (customizable)
- [ ] Error state: "Image analysis failed. Try again." (customizable)

**useVoiceTranscription Hook (Audio AI):**
- [ ] Create `weave-mobile/src/hooks/useVoiceTranscription.ts`
- [ ] API: `const { transcribe, isTranscribing, error } = useVoiceTranscription();`
- [ ] Usage: `const result = await transcribe({ audioUri: "...", language: "en" });`
- [ ] Loading state: "Transcribing audio..." (customizable)
- [ ] Error state: "Transcription failed. Try again." (customizable)

**Common Hook Patterns:**
- [ ] All hooks use TanStack Query for caching and retry logic
- [ ] All hooks handle rate limiting (show user-friendly error with retry time)
- [ ] All hooks support abort signals (cancel in-progress requests)
- [ ] All hooks log errors to console (debug mode)

---

### AC-8: Documentation

**AI Services Guide:**
- [ ] Create `docs/dev/ai-services-guide.md` with sections:
  - Provider Abstraction (`AIProviderBase`)
  - Text AI Patterns (GPT-4o-mini vs Claude)
  - Image AI Patterns (Gemini vs GPT-4o Vision)
  - Audio AI Patterns (AssemblyAI vs Whisper)
  - Cost Tracking (unified logging, cost calculation)
  - Rate Limiting (enforcement, admin exemption)
  - Frontend Hooks (`useAIChat`, `useImageAnalysis`, `useVoiceTranscription`)
- [ ] Include provider decision tree (when to use which provider)
- [ ] Include complete integration examples for all 3 modalities
- [ ] Link from `CLAUDE.md` standardization section (Story 1.5.3 reference)

**Update Architecture Docs:**
- [ ] Update `docs/architecture/core-architectural-decisions.md`:
  - Add section: "Unified AI Service Architecture (Story 1.5.3)"
  - Include provider fallback diagram (Primary → Secondary → Graceful degradation)
  - Document cost tracking and rate limiting patterns
- [ ] Update `docs/architecture/implementation-patterns-consistency-rules.md`:
  - Add reference to Story 1.5.3 AI standardization
  - Link to `docs/dev/ai-services-guide.md`

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
  - [ ] 8.1: Create `docs/dev/ai-services-guide.md`
  - [ ] 8.2: Update architecture docs
  - [ ] 8.3: Link from CLAUDE.md

---

## Dev Notes

### Architecture Alignment

**From Epic 1.5 Standardization Goals:**
- Unified AI provider abstraction prevents pattern divergence across 15+ AI integrations in Epic 2-8
- Cost tracking standardization ensures visibility into which features/users drive AI costs
- Rate limiting enforcement prevents cost overruns ($83.33/day budget)

**From Story 0.6 (AI Service Abstraction):**
- AWS Bedrock primary provider pattern (most runway, long-term strategic choice)
- Fallback chain: Bedrock → OpenAI → Anthropic → Deterministic
- Dual cost tracking: Application-wide + per-user
- Role-based rate limits: Admin users unlimited, regular users strict limits

**From Story 0.9 (AI-Powered Image Service):**
- Gemini 3.0 Flash primary for image analysis (58% cheaper than GPT-4o Vision)
- Rate limiting: 5 images/day free tier (controls storage costs at 10 cents/user/day)
- Proof validation, OCR, content classification patterns

**From Story 0.11 (Voice/STT Infrastructure):**
- AssemblyAI primary for transcription (58% cheaper than Whisper API)
- Rate limiting: 50 transcriptions/day, 5 minutes audio length per request
- Provider abstraction pattern (`STTProvider` abstract class)

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

### Project Structure Notes

**Backend Structure:**
```
weave-api/
├── app/
│   ├── services/
│   │   ├── ai_provider_base.py          # NEW - Abstract base class
│   │   ├── text_ai_service.py           # REFACTOR - Use AIProviderBase
│   │   ├── image_ai_service.py          # REFACTOR - Use AIProviderBase
│   │   ├── stt_service.py               # REFACTOR - Use AIProviderBase
│   │   ├── providers/                   # NEW - Provider implementations
│   │   │   ├── openai_provider.py       # GPT-4o-mini, Whisper
│   │   │   ├── claude_provider.py       # Claude 3.7 Sonnet
│   │   │   ├── gemini_provider.py       # Gemini 3.0 Flash
│   │   │   └── assemblyai_provider.py   # AssemblyAI STT
│   ├── utils/
│   │   ├── cost_calculator.py           # NEW - Cost calculation utility
```

**Frontend Structure:**
```
weave-mobile/
├── src/
│   ├── hooks/
│   │   ├── useAIChat.ts                 # NEW - Text AI hook
│   │   ├── useImageAnalysis.ts          # NEW - Image AI hook
│   │   └── useVoiceTranscription.ts     # NEW - Audio AI hook
```

### References

- [Source: docs/prd/epic-1.5-app-navigation-scaffolding.md#Story-1.5.3]
- [Source: docs/stories/epic-0/0-6-ai-service-abstraction.md]
- [Source: docs/stories/epic-0/0-9-ai-powered-image-service.md]
- [Source: docs/stories/epic-0/0-11-voice-stt-infrastructure.md]
- [Source: docs/architecture/core-architectural-decisions.md]
- [Source: CLAUDE.md#Story-1.5.3-AI-Service-Patterns]

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

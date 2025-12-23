# AI Service Integration Guide

**Status:** ✅ Complete - Lessons learned from Story 0.11 (Voice/STT)

**Purpose:** Standardized patterns for integrating third-party AI services (OpenAI, Anthropic, AssemblyAI, etc.) into the Weave backend, with proper environment configuration, fallback chains, and error handling.

---

## Table of Contents

1. [Overview](#overview)
2. [Real-World Case Study: Transcription Service](#real-world-case-study-transcription-service)
3. [The Five Critical Requirements](#the-five-critical-requirements)
4. [Environment Variable Loading Pattern](#environment-variable-loading-pattern)
5. [Provider Abstraction Pattern](#provider-abstraction-pattern)
6. [Database Type Conversions](#database-type-conversions)
7. [Integration Checklist](#integration-checklist)
8. [Common Pitfalls](#common-pitfalls)

---

## Overview

When integrating AI services into Weave, we need to balance:
- **Reliability:** Fallback chains when primary services fail
- **Cost:** Cheaper primary providers with expensive fallbacks
- **Type safety:** Python type hints + Pydantic validation
- **Configuration:** Environment variables properly loaded
- **Error handling:** Graceful degradation when services unavailable

**Key Insight:** Most integration bugs come from environment configuration issues, not the AI service logic itself.

---

## Real-World Case Study: Transcription Service

### What We Built (Story 0.11)

Speech-to-text transcription with dual-provider fallback:
- **Primary:** AssemblyAI ($0.15/hour) - 58% cheaper
- **Fallback:** OpenAI Whisper ($0.006/min) - More expensive but reliable
- **Last resort:** Save audio without transcript (graceful degradation)

### What Went Wrong (And How We Fixed It)

#### Problem 1: "No STT providers available!"
**Symptom:** Backend logs showed both AssemblyAI and Whisper unavailable despite API keys in `.env`

**Root Cause:**
```python
# In assemblyai_provider.py
self.api_key = api_key or os.getenv('ASSEMBLYAI_API_KEY')  # ❌ Returns None

# Why?
# Pydantic Settings loads .env into Settings object, but NOT into os.environ
# os.getenv() reads from process environment, not from Settings
```

**Solution:**
```python
# In app/core/config.py
from dotenv import load_dotenv

# Load .env file explicitly into os.environ BEFORE anything else runs
env_path = Path(__file__).parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(env_path)  # ✅ Now os.getenv() works everywhere
```

**Lesson:** Always use `python-dotenv` to load `.env` into `os.environ` when code uses `os.getenv()` directly.

---

#### Problem 2: "Object of type UUID is not JSON serializable"
**Symptom:** Backend crashed when saving capture record after transcription

**Root Cause:**
```python
# get_user_profile() returns UUID for type safety
user_id, timezone = get_user_profile(user, supabase)

# But Supabase client serializes to JSON before API call
capture_data = {
    'user_id': user_id,  # ❌ UUID object can't be JSON serialized
}
```

**Solution:**
```python
# Convert UUID to string at database boundaries
capture_data = {
    'user_id': str(user_id),  # ✅ JSON-safe
    'type': 'audio',
    'storage_key': storage_key,
}
```

**Lesson:** Keep UUIDs as objects for internal type safety, convert to strings at database/API boundaries.

---

#### Problem 3: "UploadResponse has no attribute 'status_code'"
**Symptom:** Backend crashed checking Supabase Storage upload result

**Root Cause:**
```python
upload_result = supabase.storage.from_('captures').upload(...)
if upload_result.status_code not in [200, 201]:  # ❌ Attribute doesn't exist
```

**Why:** Supabase Storage SDK raises exceptions on failure instead of returning status codes.

**Solution:**
```python
try:
    upload_result = supabase.storage.from_('captures').upload(...)
    # Success - no need to check status
except Exception as upload_error:
    # Failure - handle error
    raise HTTPException(...)
```

**Lesson:** Check SDK documentation for error handling patterns - don't assume HTTP-style responses.

---

#### Problem 4: Missing Settings Configuration
**Symptom:** New environment variable not recognized by Pydantic Settings

**Root Cause:**
```python
# .env file
ASSEMBLYAI_API_KEY=9c7cbcdcbf54475880b59d6a6286d817

# But Settings class didn't declare it
class Settings(BaseSettings):
    OPENAI_API_KEY: str = Field(default="")
    ANTHROPIC_API_KEY: str = Field(default="")
    # ❌ ASSEMBLYAI_API_KEY missing
```

**Solution:**
```python
class Settings(BaseSettings):
    OPENAI_API_KEY: str = Field(default="")
    ANTHROPIC_API_KEY: str = Field(default="")
    ASSEMBLYAI_API_KEY: str = Field(default="", description="AssemblyAI API key (Story 0.11)")  # ✅ Added

    @field_validator("OPENAI_API_KEY", "ANTHROPIC_API_KEY", "ASSEMBLYAI_API_KEY", mode="after")
    @classmethod
    def validate_ai_credentials(cls, v: str, info) -> str:
        """Warn if missing in dev, error in prod."""
        # Validation logic...
```

**Lesson:** Every new environment variable must be declared in Settings class with Field() annotation.

---

## The Five Critical Requirements

### 1. Environment Variable Loading

**✅ CORRECT PATTERN:**
```python
# app/core/config.py (FIRST import in main.py)
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load .env into os.environ BEFORE anything else
env_path = Path(__file__).parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(env_path)

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Declare ALL environment variables
    OPENAI_API_KEY: str = Field(default="")
    ANTHROPIC_API_KEY: str = Field(default="")
    ASSEMBLYAI_API_KEY: str = Field(default="")

settings = Settings()
```

**Why both `load_dotenv()` AND `env_file=".env"`?**
- `load_dotenv()`: Populates `os.environ` for direct `os.getenv()` calls
- `env_file=".env"`: Populates Settings object attributes for `settings.OPENAI_API_KEY`

---

### 2. Provider Abstraction

**Directory Structure:**
```
app/services/
├── stt/                          # Service-specific directory
│   ├── __init__.py               # Exports public API
│   ├── base.py                   # Abstract base + shared types
│   ├── assemblyai_provider.py    # Concrete implementation
│   ├── whisper_provider.py       # Concrete implementation
│   └── stt_service.py            # Orchestrator with fallback chain
```

**Base Interface (`base.py`):**
```python
from abc import ABC, abstractmethod
from dataclasses import dataclass

@dataclass
class TranscriptionResult:
    """Standard result format across all providers."""
    transcript: str
    confidence: float  # 0.0-1.0
    duration_sec: int
    language: str
    provider: str
    cost_usd: float

class STTProviderError(Exception):
    """Provider-specific error with retry metadata."""
    def __init__(self, message: str, provider: str, retryable: bool, error_code: str):
        self.message = message
        self.provider = provider
        self.retryable = retryable  # Should we try next provider?
        self.error_code = error_code
        super().__init__(message)

class STTProvider(ABC):
    """Abstract base for all STT providers."""

    @abstractmethod
    async def transcribe(self, audio_file: bytes, language: str, **kwargs) -> TranscriptionResult:
        """Transcribe audio bytes to text."""
        pass

    @abstractmethod
    def get_cost(self, duration_seconds: int) -> float:
        """Calculate USD cost for given duration."""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """Check if provider is configured (has API key)."""
        pass
```

**Concrete Provider (`assemblyai_provider.py`):**
```python
import os
from .base import STTProvider, TranscriptionResult, STTProviderError

class AssemblyAIProvider(STTProvider):
    def __init__(self, api_key: Optional[str] = None):
        # Read from settings OR os.environ
        self.api_key = api_key or os.getenv('ASSEMBLYAI_API_KEY')
        if not self.api_key:
            raise STTProviderError(
                message="ASSEMBLYAI_API_KEY not configured",
                provider="assemblyai",
                retryable=False,
                error_code="ASSEMBLYAI_API_KEY_MISSING"
            )

    async def transcribe(self, audio_file: bytes, language: str, **kwargs) -> TranscriptionResult:
        try:
            # Provider-specific logic
            result = await aai.transcribe(audio_file)
            return TranscriptionResult(
                transcript=result.text,
                confidence=result.confidence,
                duration_sec=result.duration,
                language=language,
                provider="assemblyai",
                cost_usd=self.get_cost(result.duration)
            )
        except Exception as e:
            raise STTProviderError(
                message=f"AssemblyAI API error: {str(e)}",
                provider="assemblyai",
                retryable="timeout" in str(e).lower(),
                error_code="STT_PRIMARY_UNAVAILABLE"
            )

    def get_cost(self, duration_seconds: int) -> float:
        return round(duration_seconds * 0.00004167, 4)  # $0.15/hour

    def is_available(self) -> bool:
        return bool(self.api_key)
```

**Orchestrator with Fallback (`stt_service.py`):**
```python
import logging
from .base import STTProvider, TranscriptionResult, STTProviderError
from .assemblyai_provider import AssemblyAIProvider
from .whisper_provider import WhisperProvider

logger = logging.getLogger(__name__)

class STTService:
    """Orchestrates provider fallback chain."""

    def __init__(self):
        self.providers = []

        # Try to initialize each provider
        try:
            assemblyai = AssemblyAIProvider()
            if assemblyai.is_available():
                self.providers.append(assemblyai)
                logger.info("✅ AssemblyAI provider added to chain")
        except STTProviderError as e:
            logger.warning(f"⚠️  AssemblyAI unavailable: {e.message}")

        try:
            whisper = WhisperProvider()
            if whisper.is_available():
                self.providers.append(whisper)
                logger.info("✅ Whisper provider added to chain")
        except STTProviderError as e:
            logger.warning(f"⚠️  Whisper unavailable: {e.message}")

        if not self.providers:
            logger.error("❌ No STT providers available! Check API keys.")

    async def transcribe(self, audio_file: bytes, language: str = 'en') -> Optional[TranscriptionResult]:
        """Try each provider in order until one succeeds."""
        for provider in self.providers:
            provider_name = provider.__class__.__name__
            try:
                logger.info(f"Attempting transcription with {provider_name}")
                result = await provider.transcribe(audio_file, language)
                logger.info(f"✅ Success with {provider_name}")
                return result
            except STTProviderError as e:
                logger.error(f"❌ {provider_name} failed: {e.message}")
                if not e.retryable:
                    continue  # Try next provider

        # All providers failed
        logger.error("❌ All providers failed")
        return None  # Graceful degradation
```

---

### 3. Database Type Conversions

**The Pattern:**
```python
# Internal logic: Use typed objects (UUID, datetime, Enum)
user_id: UUID = get_user_profile(user, supabase)
created_at: datetime = datetime.now()
status: GoalStatus = GoalStatus.ACTIVE

# Database boundary: Convert to JSON-safe types
record = {
    'user_id': str(user_id),              # UUID → string
    'created_at': created_at.isoformat(), # datetime → ISO 8601 string
    'status': status.value,               # Enum → string
}
supabase.table('goals').insert(record).execute()
```

**Type Conversion Table:**

| Internal Type | Database Type | Conversion |
|--------------|---------------|------------|
| `UUID` | `TEXT` | `str(uuid_obj)` |
| `datetime` | `TIMESTAMP` | `dt.isoformat()` |
| `Enum` | `TEXT` | `enum_obj.value` |
| `dict` | `JSONB` | Already JSON-safe |
| `list` | `JSONB` | Already JSON-safe |
| `None` | `NULL` | Pass as `None` |

**Why This Matters:**
- Supabase Python SDK uses `httpx` which serializes with `json.dumps()`
- `json.dumps()` doesn't support UUID, datetime, or custom objects
- **Always convert at the boundary**, keep rich types internally

---

### 4. Error Handling and Graceful Degradation

**Three-Tier Error Strategy:**

**Tier 1: Provider Retry Logic**
```python
async def _transcribe_with_retry(self, provider: STTProvider, audio_file: bytes, max_retries: int = 3):
    for attempt in range(max_retries):
        try:
            return await provider.transcribe(audio_file)
        except STTProviderError as e:
            if not e.retryable:
                raise  # Don't retry client errors (4xx)
            if attempt == max_retries - 1:
                raise  # Last attempt, give up
            await asyncio.sleep(2 ** attempt)  # Exponential backoff: 1s, 2s, 4s
```

**Tier 2: Provider Fallback Chain**
```python
async def transcribe(self, audio_file: bytes) -> Optional[TranscriptionResult]:
    for provider in [self.assemblyai, self.whisper]:
        try:
            return await self._transcribe_with_retry(provider, audio_file)
        except STTProviderError:
            continue  # Try next provider
    return None  # All providers failed
```

**Tier 3: Application-Level Graceful Degradation**
```python
# In API endpoint
transcription_result = await stt_service.transcribe(audio_bytes)

if transcription_result:
    # Happy path: Save transcript
    capture_data['content_text'] = transcription_result.transcript
    capture_data['duration_sec'] = transcription_result.duration_sec
else:
    # Degraded path: Save audio without transcript
    capture_data['content_text'] = None
    capture_data['duration_sec'] = None

# Always save the capture (even without transcript)
supabase.table('captures').insert(capture_data).execute()

# Return to client with provider="manual" indicator
return {
    "transcript": transcription_result.transcript if transcription_result else "",
    "provider": transcription_result.provider if transcription_result else "manual",
    "audio_url": signed_url  # Audio playback still works
}
```

**User Experience:**
- ✅ Audio always saves (can play back)
- ✅ Transcript appears if any provider works
- ✅ Empty transcript + "manual" provider = user knows to retry
- ✅ No data loss even when all AI services down

---

### 5. Diagnostic Endpoints

**Always add a status endpoint for debugging:**

```python
@router.get("/transcribe/status", status_code=status.HTTP_200_OK)
async def get_transcription_status():
    """
    Diagnostic endpoint - check provider availability without making API calls.

    Useful for:
    - Debugging "No providers available" errors
    - Verifying environment variable loading
    - Checking which providers are configured
    """
    provider_status = stt_service.get_provider_status()

    return {
        "providers": provider_status,  # {"assemblyai": true, "whisper": false}
        "any_available": any(provider_status.values()),
        "message": "At least one provider required" if not any(provider_status.values()) else "Ready"
    }

# Usage:
# curl http://localhost:8003/api/transcribe/status
# {
#   "providers": {"assemblyai": true, "whisper": true},
#   "any_available": true,
#   "message": "Ready"
# }
```

---

## Integration Checklist

Use this checklist when adding a new AI service:

### Phase 1: Environment Setup
- [ ] Add API key to `.env` file
- [ ] Add API key field to `app/core/config.py` Settings class
- [ ] Add API key to `.env.example` with description
- [ ] Verify `load_dotenv()` is called in `config.py`
- [ ] Add field validator for API key (warn in dev, error in prod)

### Phase 2: Provider Implementation
- [ ] Create service directory: `app/services/{service_name}/`
- [ ] Create base interface: `base.py` with abstract class + shared types
- [ ] Create provider implementations: `{provider_name}_provider.py`
- [ ] Create orchestrator: `{service_name}_service.py` with fallback chain
- [ ] Export public API in `__init__.py`

### Phase 3: Error Handling
- [ ] Define custom exception with `retryable` flag
- [ ] Implement retry logic with exponential backoff
- [ ] Implement provider fallback chain
- [ ] Implement graceful degradation (store partial results)
- [ ] Add comprehensive logging (info, warning, error levels)

### Phase 4: API Integration
- [ ] Convert UUID/datetime to strings at database boundary
- [ ] Handle None/null cases gracefully
- [ ] Wrap storage operations in try-except (don't assume status codes)
- [ ] Return standard API response format: `{"data": {...}, "meta": {...}}`
- [ ] Add diagnostic status endpoint

### Phase 5: Testing & Validation
- [ ] Test with no API keys (should log warnings, not crash)
- [ ] Test with only one provider configured (should use fallback)
- [ ] Test with invalid API keys (should fail gracefully)
- [ ] Test provider fallback chain (simulate primary failure)
- [ ] Test graceful degradation (all providers down)
- [ ] Add startup logs showing provider availability

---

## Common Pitfalls

### ❌ Pitfall 1: Assuming Environment Variables Are Loaded

**Wrong:**
```python
# Assuming .env is automatically loaded
api_key = os.getenv('NEW_SERVICE_API_KEY')  # Returns None!
```

**Right:**
```python
# 1. Add to config.py Settings class
class Settings(BaseSettings):
    NEW_SERVICE_API_KEY: str = Field(default="")

# 2. Load with dotenv at startup
load_dotenv(Path(__file__).parent.parent.parent / ".env")

# 3. Now os.getenv() works
api_key = os.getenv('NEW_SERVICE_API_KEY')
```

---

### ❌ Pitfall 2: Forgetting UUID → String Conversion

**Wrong:**
```python
user_id: UUID = get_user_profile(user, supabase)
supabase.table('captures').insert({'user_id': user_id}).execute()
# TypeError: Object of type UUID is not JSON serializable
```

**Right:**
```python
user_id: UUID = get_user_profile(user, supabase)
supabase.table('captures').insert({'user_id': str(user_id)}).execute()
```

---

### ❌ Pitfall 3: Not Checking Provider Availability

**Wrong:**
```python
# Assumes provider is always available
result = await provider.transcribe(audio)
```

**Right:**
```python
if not provider.is_available():
    logger.warning("Provider not configured")
    return None

result = await provider.transcribe(audio)
```

---

### ❌ Pitfall 4: Missing Graceful Degradation

**Wrong:**
```python
transcription = await stt_service.transcribe(audio)
# Crashes if transcription is None
return {"transcript": transcription.transcript}
```

**Right:**
```python
transcription = await stt_service.transcribe(audio)
return {
    "transcript": transcription.transcript if transcription else "",
    "provider": transcription.provider if transcription else "manual"
}
```

---

### ❌ Pitfall 5: Assuming HTTP-Style Responses

**Wrong:**
```python
result = supabase.storage.upload(file)
if result.status_code != 200:  # AttributeError!
```

**Right:**
```python
try:
    result = supabase.storage.upload(file)
    # Success - no status code to check
except Exception as e:
    # Failure - SDK raises exception
```

---

## Quick Reference: Environment Variable Troubleshooting

**Symptom: "API key not configured" despite being in `.env`**

1. **Check Settings class has field:**
   ```python
   # app/core/config.py
   class Settings(BaseSettings):
       YOUR_API_KEY: str = Field(default="")  # Must be declared
   ```

2. **Check dotenv is loading:**
   ```python
   # app/core/config.py (top of file)
   from dotenv import load_dotenv
   env_path = Path(__file__).parent.parent.parent / ".env"
   load_dotenv(env_path)  # Must be called
   ```

3. **Check .env file path:**
   ```bash
   # From weave-api/ directory
   ls -la .env  # Should exist
   cat .env | grep YOUR_API_KEY  # Should show value
   ```

4. **Check no typos:**
   ```bash
   # .env file (must match exactly)
   YOUR_API_KEY=value123

   # Settings class (must match exactly)
   YOUR_API_KEY: str = Field(...)

   # Provider code (must match exactly)
   os.getenv('YOUR_API_KEY')
   ```

5. **Restart backend:**
   ```bash
   # Environment only loads on startup
   # Ctrl+C to stop, then:
   uv run uvicorn app.main:app --reload
   ```

---

## Summary: The Golden Rules

1. **Environment Variables:**
   - Declare in Settings class
   - Load with dotenv
   - Restart backend after changes

2. **Provider Abstraction:**
   - Base interface + concrete implementations
   - Fallback chain with retry logic
   - Graceful degradation on total failure

3. **Type Conversions:**
   - Keep rich types internally (UUID, datetime)
   - Convert to JSON-safe at database boundary
   - Test with real data

4. **Error Handling:**
   - Provider-level retries
   - Service-level fallbacks
   - Application-level degradation

5. **Debugging:**
   - Add diagnostic endpoints
   - Log provider initialization
   - Log each fallback attempt

---

## Related Documentation

- **Environment Configuration:** `docs/dev/environment-setup.md`
- **Database Patterns:** `docs/architecture/implementation-patterns-consistency-rules.md`
- **Error Handling:** `docs/architecture/error-handling-patterns.md`
- **STT Implementation:** `docs/stories/0-11-voice-stt-infrastructure.md`

---

## Story 1.5.3 Updates: Unified AI Services Architecture

### Overview

Story 1.5.3 introduced unified patterns across all AI modalities (text/image/audio) with:
- **AIProviderBase:** Single abstract class for all AI providers
- **Cost Calculator:** Unified pricing utility with environment variable overrides
- **React Native Hooks:** Standardized hooks for all three modalities
- **Consistent Patterns:** Polymorphism, fallback chains, cost tracking

### Unified AIProviderBase

All AI providers now inherit from `app/services/ai_provider_base.py`:

```python
from app.services.ai_provider_base import AIProviderBase

class MyAIProvider(AIProviderBase):
    def __init__(self, api_key: str, db=None):
        super().__init__(db)  # Initialize base (enables cost tracking)
        self.api_key = api_key
    
    def get_provider_name(self) -> str:
        return "my-provider-name"
    
    def is_available(self) -> bool:
        return self.api_key is not None
    
    # Modality-specific method (complete/analyze_image/transcribe)
    async def complete(self, prompt: str) -> dict:
        # Call AI API
        result = await self.api_client.generate(prompt)
        
        # Log to ai_runs table for cost tracking
        self.log_to_ai_runs(
            user_id=user_id,
            operation_type='text_generation',
            input_tokens=result.input_tokens,
            output_tokens=result.output_tokens,
            cost_usd=result.cost,
            duration_ms=result.duration
        )
        
        return result
```

**Inherited Methods:**
- `log_to_ai_runs()` - Logs all AI calls to `ai_runs` table
- `check_rate_limit()` - Checks user's tier limits (admin users bypass)

### Cost Calculator Utility

**Location:** `app/utils/cost_calculator.py`

Provides model-specific pricing with environment variable overrides:

```python
from app.utils.cost_calculator import (
    calculate_text_cost,
    calculate_image_cost,
    calculate_audio_cost,
    get_pricing_table
)

# Text AI
cost = calculate_text_cost('gpt-4o-mini', input_tokens=1000, output_tokens=500)
# Returns: 0.000450 (= 0.15 * 1000/1M + 0.60 * 500/1M)

# Image AI
cost = calculate_image_cost('gemini-3-flash', image_count=1)
# Returns: 0.0005

# Audio AI
cost = calculate_audio_cost('assemblyai', duration_seconds=60)
# Returns: 0.0025 (= 60 * 0.00004167)
```

**Pricing Configuration (Environment Variables):**

```bash
# Text AI (per million tokens)
GPT4O_MINI_INPUT_COST=0.15
GPT4O_MINI_OUTPUT_COST=0.60
CLAUDE_SONNET_INPUT_COST=3.00
CLAUDE_SONNET_OUTPUT_COST=15.00

# Image AI (per image)
GEMINI_FLASH_IMAGE_COST=0.0005
GPT4O_VISION_IMAGE_COST=0.02

# Audio AI
ASSEMBLYAI_COST_PER_HOUR=0.15
WHISPER_COST_PER_MINUTE=0.006
```

**View pricing table:**
```bash
cd weave-api
uv run python -m app.utils.cost_calculator
```

### Provider Decision Tree

| Use Case | Primary Provider | Fallback | Cost (Input/Output per MTok) |
|----------|------------------|----------|------------------------------|
| **Text Generation** (Triad, Journal) | GPT-4o-mini | Claude 3.7 Sonnet | $0.15/$0.60 → $3.00/$15.00 |
| **Complex Reasoning** (Onboarding) | Claude 3.7 Sonnet | GPT-4o | $3.00/$15.00 → $2.50/$10.00 |
| **Image Analysis** (Proof validation) | Gemini 3.0 Flash | GPT-4o Vision | $0.0005 → $0.02 per image |
| **Voice Transcription** (STT) | AssemblyAI | Whisper | $0.15/hr → $0.006/min |

### React Native Hooks (Story 1.5.3)

#### useAIChat Hook (Text AI)

**Location:** `weave-mobile/src/hooks/useAIChat.ts`

```tsx
import { useAIChat } from '@/hooks/useAIChat';

function TriadScreen() {
  const { generate, isGenerating, error, data } = useAIChat();
  
  const handleGenerate = async () => {
    try {
      const result = await generate({
        prompt: "Generate 3 tasks for my fitness goal today",
        context: {
          user_id: userId,
          operation_type: 'triad_generation',
          max_tokens: 500
        }
      });
      
      console.log(result.text);           // AI-generated text
      console.log(result.provider);       // 'gpt-4o-mini' or 'claude-sonnet'
      console.log(result.cost_usd);       // Cost tracking
      console.log(result.tokens_used);    // {input: 120, output: 300}
      
    } catch (err) {
      if (err.name === 'RateLimitException') {
        alert(`Rate limit reached. Retry in ${err.retryAfter} seconds`);
      }
    }
  };
  
  return (
    <Button onPress={handleGenerate} disabled={isGenerating}>
      {isGenerating ? "Generating..." : "Generate Triad"}
    </Button>
  );
}
```

**Features:**
- ✅ 5-minute TanStack Query cache (stale-while-revalidate)
- ✅ Automatic retry (3 attempts: 1s, 2s, 4s backoff)
- ✅ Rate limit handling (HTTP 429 with `retryAfter`)
- ✅ Abort signal support (`signal: abortController.signal`)

#### useImageAnalysis Hook (Image AI)

**Location:** `weave-mobile/src/hooks/useImageAnalysis.ts`

```tsx
import { useImageAnalysis } from '@/hooks/useImageAnalysis';

function ProofCaptureScreen() {
  const { analyze, isAnalyzing, error, data } = useImageAnalysis();
  
  const handleAnalyze = async (imageUri: string) => {
    const result = await analyze({
      imageUri,
      operations: ['proof_validation', 'ocr'],
      bindDescription: 'Workout at gym with weights'
    });
    
    console.log(result.proof_validated);  // true/false
    console.log(result.quality_score);    // 1-5
    console.log(result.extracted_text);   // OCR text or null
    console.log(result.categories);       // [{label: 'gym', confidence: 0.9}]
    console.log(result.provider);         // 'gemini-3-flash' or 'gpt-4o-vision'
  };
  
  return (
    <Button onPress={() => handleAnalyze(imageUri)}>
      {isAnalyzing ? "Analyzing..." : "Validate Proof"}
    </Button>
  );
}
```

**Features:**
- ✅ NO caching (each image is unique)
- ✅ Automatic retry (3 attempts)
- ✅ Rate limit: 5 images/day (free tier)

#### useVoiceTranscription Hook (Audio AI)

**Location:** `weave-mobile/src/hooks/useVoiceTranscription.ts`

```tsx
import { useVoiceTranscription } from '@/hooks/useVoiceTranscription';

function VoiceRecordScreen() {
  const { transcribe, isTranscribing, error, data } = useVoiceTranscription();
  
  const handleTranscribe = async (audioUri: string) => {
    const result = await transcribe({
      audioUri,
      language: 'en',
      maxDuration: 300
    });
    
    console.log(result.transcript);    // Transcribed text
    console.log(result.confidence);    // 0.0-1.0 accuracy score
    console.log(result.duration_sec);  // Audio duration
    console.log(result.provider);      // 'assemblyai' or 'whisper'
  };
  
  return (
    <Button onPress={() => handleTranscribe(audioUri)}>
      {isTranscribing ? "Transcribing..." : "Transcribe Audio"}
    </Button>
  );
}
```

**Features:**
- ✅ NO caching (each recording is unique)
- ✅ Automatic retry (3 attempts)
- ✅ Rate limit: 50 transcriptions/day (free tier)

### Common Patterns Across All Hooks

**1. Loading States:**
```tsx
{isGenerating && <Text>Generating...</Text>}
{isAnalyzing && <Text>Analyzing image...</Text>}
{isTranscribing && <Text>Transcribing...</Text>}
```

**2. Error Handling:**
```tsx
if (error) {
  if (error.name === 'RateLimitException') {
    return <Text>Rate limit reached. Retry in {error.retryAfter}s</Text>;
  }
  return <Text>Error: {error.message}</Text>;
}
```

**3. Abort Requests:**
```tsx
const abortController = new AbortController();

const result = await generate(request, { signal: abortController.signal });

// Cancel if user navigates away
return () => abortController.abort();
```

### Integration Checklist (Updated for Story 1.5.3)

When integrating a new AI service:

- [ ] **1. Provider Class**
  - [ ] Inherit from `AIProviderBase`
  - [ ] Implement `get_provider_name()` and `is_available()`
  - [ ] Accept optional `db` parameter in `__init__`
  - [ ] Call `super().__init__(db)`
  - [ ] Implement modality-specific method (`complete`/`analyze_image`/`transcribe`)
  - [ ] Call `self.log_to_ai_runs()` after successful API call

- [ ] **2. Cost Tracking**
  - [ ] Add pricing to `app/utils/cost_calculator.py`
  - [ ] Add environment variables for pricing overrides
  - [ ] Test cost calculation with example inputs

- [ ] **3. React Native Hook**
  - [ ] Use TanStack Query `useMutation` pattern
  - [ ] Implement retry with exponential backoff (3 attempts)
  - [ ] Handle HTTP 429 rate limit errors
  - [ ] Support abort signal
  - [ ] Add loading/error states
  - [ ] Write unit tests in `src/hooks/__tests__/`

- [ ] **4. Documentation**
  - [ ] Add to this guide with examples
  - [ ] Update provider decision tree
  - [ ] Document pricing and rate limits

- [ ] **5. Testing**
  - [ ] Unit tests for provider class
  - [ ] Integration tests for fallback chain
  - [ ] React Native hook tests
  - [ ] Cost tracking validation

### Architecture Benefits

**Polymorphism:**
- All providers share common interface (`get_provider_name`, `is_available`, `log_to_ai_runs`)
- Enables generic fallback chain logic

**DRY Principle:**
- Cost tracking written once in `AIProviderBase`
- Rate limiting logic unified across modalities
- Consistent error handling patterns

**Maintainability:**
- Adding new provider = implement 3 methods + add pricing
- Pricing updates via environment variables (no code changes)
- Centralized cost tracking for budget enforcement

---

**Last Updated:** 2025-12-23 (Story 1.5.3 completion - Unified AI Services)
**Next Review:** When adding new AI provider or modality

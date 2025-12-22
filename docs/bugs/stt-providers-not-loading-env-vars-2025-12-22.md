# Bug Report: STT Providers Not Loading Environment Variables

**Date:** 2025-12-22
**Story:** 0.11 - Voice/Speech-to-Text Infrastructure
**Status:** ✅ RESOLVED
**Severity:** High (Feature completely broken)

---

## Symptom

Backend logs showed:
```
⚠️  AssemblyAI provider unavailable: ASSEMBLYAI_API_KEY not configured
⚠️  Whisper provider unavailable: OPENAI_API_KEY not configured
❌ No STT providers available! Check API keys.
```

Despite API keys being present in `.env` file:
```bash
# .env file
OPENAI_API_KEY=sk-proj-...
ASSEMBLYAI_API_KEY=9c7cbcdcbf54...
```

Result: Transcription always returned `provider: "manual"` with empty transcript.

---

## Root Cause

**Pydantic Settings vs os.getenv() Mismatch**

The backend uses two different methods of reading environment variables:

1. **Pydantic Settings** (`app/core/config.py`):
   ```python
   class Settings(BaseSettings):
       model_config = SettingsConfigDict(env_file=".env")
       OPENAI_API_KEY: str = Field(default="")

   settings = Settings()
   # settings.OPENAI_API_KEY ✅ Works
   ```

2. **Direct os.getenv()** (STT providers):
   ```python
   # In assemblyai_provider.py
   self.api_key = os.getenv('ASSEMBLYAI_API_KEY')  # ❌ Returns None
   ```

**The Problem:** Pydantic Settings loads `.env` into the Settings object but does NOT populate `os.environ`. When STT providers use `os.getenv()` directly, they can't see the variables.

---

## Solution

**Add explicit dotenv loading in `app/core/config.py`:**

```python
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file into os.environ BEFORE Settings initialization
env_path = Path(__file__).parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(env_path)
    logging.info(f"✅ Loaded environment from {env_path}")
else:
    logging.warning(f"⚠️  .env file not found at {env_path}")

class Settings(BaseSettings):
    # Now both settings.OPENAI_API_KEY AND os.getenv('OPENAI_API_KEY') work
    ...
```

**Also added missing field:**
```python
class Settings(BaseSettings):
    OPENAI_API_KEY: str = Field(default="")
    ANTHROPIC_API_KEY: str = Field(default="")
    ASSEMBLYAI_API_KEY: str = Field(default="")  # ✅ Added
```

---

## Additional Fixes Required

### 1. UUID Serialization Error
```python
# Wrong
capture_data = {'user_id': user_id}  # UUID object

# Right
capture_data = {'user_id': str(user_id)}  # String
```

### 2. Storage Upload Response Handling
```python
# Wrong
upload_result = supabase.storage.upload(file)
if upload_result.status_code not in [200, 201]:  # AttributeError!

# Right
try:
    upload_result = supabase.storage.upload(file)
    # Success - no status code check needed
except Exception as e:
    # SDK raises exceptions on failure
    raise HTTPException(...)
```

---

## Verification

**After fixes, backend startup shows:**
```
✅ Loaded environment from /path/to/weave-api/.env
✅ AssemblyAI provider initialized
✅ Whisper provider initialized
Added AssemblyAI to provider chain
Added Whisper to provider chain
```

**Diagnostic endpoint:**
```bash
curl http://localhost:8003/api/transcribe/status

# Response:
{
  "providers": {
    "assemblyai": true,
    "whisper": true
  },
  "any_available": true,
  "message": "Transcription available"
}
```

---

## Prevention

### For Future AI Service Integration

**1. Always use the standardized pattern:**
```python
# app/core/config.py
from dotenv import load_dotenv

# Load .env FIRST
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)

class Settings(BaseSettings):
    # Declare ALL environment variables
    NEW_SERVICE_API_KEY: str = Field(default="")
```

**2. Add to Settings class immediately:**
- When adding new `.env` variable
- When adding new AI service
- When adding new external API integration

**3. Test environment loading:**
```bash
# Add diagnostic endpoint
@router.get("/service/status")
async def get_service_status():
    return {
        "api_key_configured": bool(os.getenv('NEW_SERVICE_API_KEY')),
        "provider_available": service.is_available()
    }
```

---

## Related Issues

- Environment variables not loading → Always use `load_dotenv()` in config.py
- "API key not configured" despite being in .env → Check Settings class declares field
- UUID serialization errors → Convert to string at database boundaries
- Storage SDK errors → Use try-except, don't check status codes

---

## Files Modified

- `app/core/config.py` - Added dotenv loading + ASSEMBLYAI_API_KEY field
- `app/api/transcribe.py` - Fixed UUID conversions, storage error handling
- `.env.example` - Added ASSEMBLYAI_API_KEY documentation

---

## References

- **Full Integration Guide:** `docs/dev/ai-service-integration-guide.md`
- **Story Spec:** `docs/stories/0-11-voice-stt-infrastructure.md`
- **Backend Implementation:** `weave-api/app/services/stt/`

---

**Lesson Learned:** When integrating external services that use `os.getenv()`, always verify environment variables are loaded into `os.environ` with `python-dotenv`, not just into Pydantic Settings.

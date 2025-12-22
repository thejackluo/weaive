"""
Story 0.11: Voice/Speech-to-Text API Endpoints

FastAPI router for STT operations:
- POST /api/transcribe: Transcribe audio file with fallback chain
- GET /api/captures/{capture_id}: Retrieve audio capture with signed URL
- DELETE /api/captures/{capture_id}: Delete audio capture
- POST /api/captures/{capture_id}/re-transcribe: Retry transcription

Provider fallback: AssemblyAI → Whisper → Store audio only
"""

import logging
import subprocess
import tempfile
from datetime import datetime
from typing import Optional, Tuple
from uuid import UUID

import imageio_ffmpeg
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel, Field
from supabase import Client

from app.core.deps import get_current_user, get_supabase_client
from app.core.stt_config import (
    DEFAULT_RATE_LIMITS,
    MAX_AUDIO_FILE_SIZE_BYTES,
    MAX_AUDIO_FILE_SIZE_MB,
    AUDIO_CONVERSION_TIMEOUT_SEC,
    SIGNED_URL_EXPIRATION_SEC,
    SUPPORTED_LANGUAGES,
)
from app.services.stt import STTService, TranscriptionResult

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["stt"])

# Initialize STT service (singleton)
stt_service = STTService()


def get_user_profile(user: dict, supabase: Client) -> tuple[UUID, str]:
    """
    Get user profile ID and timezone from JWT payload.

    Converts auth_user_id (from JWT "sub" field) to user_profiles.id
    following the RLS pattern: auth.uid() → user_profiles.id lookup

    Args:
        user: JWT payload from get_current_user dependency
        supabase: Supabase client

    Returns:
        tuple: (profile_id, timezone)

    Raises:
        HTTPException: 404 if user profile not found
    """
    auth_user_id = user["sub"]  # Extract auth_user_id from JWT

    # Look up user_profiles.id from auth_user_id
    profile_response = (
        supabase.table("user_profiles")
        .select("id, timezone")
        .eq("auth_user_id", auth_user_id)
        .single()
        .execute()
    )

    if not profile_response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found. Please complete onboarding first.",
        )

    profile_id = UUID(profile_response.data["id"])
    timezone = profile_response.data.get("timezone", "UTC")

    return profile_id, timezone


# ═══════════════════════════════════════════════════════════════════════
# PYDANTIC MODELS
# ═══════════════════════════════════════════════════════════════════════

class TranscribeResponse(BaseModel):
    """POST /api/transcribe response"""
    transcript: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    duration_sec: int
    language: str
    provider: str
    audio_url: Optional[str] = None


class CaptureResponse(BaseModel):
    """GET /api/captures/{capture_id} response"""
    id: str
    user_id: str
    type: str
    storage_key: str
    content_text: Optional[str] = None
    duration_sec: Optional[int] = None
    goal_id: Optional[str] = None
    subtask_instance_id: Optional[str] = None
    local_date: str
    created_at: str
    audio_url: Optional[str] = None


class ApiResponse(BaseModel):
    """Standard API response wrapper"""
    data: dict
    meta: dict = Field(default_factory=lambda: {"timestamp": datetime.utcnow().isoformat()})


class ErrorResponse(BaseModel):
    """Standard error response"""
    error: dict


# ═══════════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════

async def check_rate_limit(user_id: UUID, supabase, user_timezone: str = "UTC", limits: dict = None):
    """
    Check STT rate limits for user in their local timezone.

    Default limits (configurable via limits parameter):
    - 50 transcription requests per day
    - 300 minutes total audio per day

    Args:
        user_id: User profile ID (UUID)
        supabase: Supabase client
        user_timezone: User's timezone for correct date calculation
        limits: Optional dict with 'max_requests' and 'max_minutes' keys

    Raises:
        HTTPException: 429 if rate limit exceeded
    """
    from datetime import datetime, timedelta
    import pytz

    # Apply default limits or use provided ones
    if limits is None:
        limits = DEFAULT_RATE_LIMITS

    # Calculate local_date in user's timezone
    user_tz = pytz.timezone(user_timezone)
    user_now = datetime.now(user_tz)
    local_date = user_now.date().isoformat()

    # Query daily_aggregates for today's usage (user's local day)
    result = supabase.table('daily_aggregates') \
        .select('stt_request_count, stt_duration_minutes') \
        .eq('user_id', str(user_id)) \
        .eq('local_date', local_date) \
        .maybe_single() \
        .execute()

    if result.data:
        request_count = result.data.get('stt_request_count', 0)
        duration_minutes = result.data.get('stt_duration_minutes', 0)

        # Calculate next reset time (midnight in user's timezone)
        tomorrow = user_now.date() + timedelta(days=1)
        reset_time = user_tz.localize(datetime.combine(tomorrow, datetime.min.time())).isoformat()

        # Check request limit
        if request_count >= limits['max_requests']:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": {
                        "code": "STT_RATE_LIMIT_EXCEEDED",
                        "message": f"Daily transcription limit reached ({request_count}/{limits['max_requests']} requests)",
                        "retryable": False,
                        "retryAfter": reset_time
                    }
                }
            )

        # Check duration limit
        if duration_minutes >= limits['max_minutes']:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": {
                        "code": "STT_RATE_LIMIT_EXCEEDED",
                        "message": f"Daily audio duration limit reached ({duration_minutes:.1f}/{limits['max_minutes']} minutes)",
                        "retryable": False,
                        "retryAfter": reset_time
                    }
                }
            )


async def increment_usage(user_id: str, duration_sec: int, supabase, user_timezone: str = "UTC"):
    """
    Increment STT usage counters atomically using PostgreSQL RPC function.

    Uses database-side function to ensure atomicity and prevent race conditions.
    Requires migration: supabase/migrations/increment_daily_usage.sql

    Args:
        user_id: User profile ID
        duration_sec: Audio duration in seconds
        supabase: Supabase client
        user_timezone: User's timezone for correct date calculation
    """
    from datetime import datetime
    import pytz

    # Calculate local_date in user's timezone (not server timezone!)
    user_tz = pytz.timezone(user_timezone)
    user_now = datetime.now(user_tz)
    local_date = user_now.date().isoformat()

    duration_minutes = duration_sec / 60.0

    # Call PostgreSQL function for atomic increment
    # This function handles INSERT OR UPDATE atomically
    try:
        supabase.rpc('increment_stt_usage', {
            'p_user_id': user_id,
            'p_local_date': local_date,
            'p_duration_minutes': duration_minutes
        }).execute()
    except Exception as e:
        # Fallback to safe upsert if RPC function doesn't exist yet
        logger.warning(f"RPC function not found, using fallback upsert: {e}")

        # Supabase upsert with onConflict (safe, no SQL injection)
        supabase.table('daily_aggregates').upsert({
            'user_id': user_id,
            'local_date': local_date,
            'stt_request_count': 1,
            'stt_duration_minutes': duration_minutes
        }, on_conflict='user_id,local_date').execute()


async def log_ai_run(
    user_id: str,
    provider: str,
    duration_sec: int,
    cost_usd: float,
    confidence_score: float,
    supabase
) -> str:
    """
    Log STT request to ai_runs table for cost tracking.

    Provider mapping:
    - 'whisper' → OpenAI Whisper API (model: whisper-1)
    - 'assemblyai' → AssemblyAI API (independent service, NOT OpenAI)
    - 'manual' → No transcription (user manual entry)

    Args:
        user_id: User profile ID
        provider: STT provider used ('whisper', 'assemblyai', or 'manual')
        duration_sec: Audio duration
        cost_usd: Transcription cost
        confidence_score: Confidence score (0-1.0)
        supabase: Supabase client

    Returns:
        ai_runs record ID
    """
    # Map STT provider to correct model and provider names
    if provider == 'whisper':
        model_name = 'whisper-1'
        provider_name = 'openai'
    elif provider == 'assemblyai':
        model_name = 'assemblyai'
        provider_name = 'assemblyai'  # ✅ FIXED: AssemblyAI is separate service
    else:  # 'manual' or unknown
        model_name = 'manual'
        provider_name = 'manual'

    result = supabase.table('ai_runs').insert({
        'user_id': user_id,
        'module': 'transcription',
        'input_hash': f'audio_{duration_sec}_{confidence_score}',
        'prompt_version': 'stt-v1.0',
        'model': model_name,
        'provider': provider_name,
        'params_json': {
            'stt_provider': provider,  # Original provider name for reference
            'audio_duration_sec': duration_sec,
            'confidence_score': confidence_score
        },
        'status': 'success',
        'cost_estimate': cost_usd,
        'input_tokens': 0,  # STT uses duration-based pricing, not tokens
        'output_tokens': 0,
    }).execute()

    return result.data[0]['id']


async def convert_audio_to_mp3(audio_bytes: bytes, original_filename: str = "audio") -> Tuple[bytes, Optional[str]]:
    """
    Convert audio to MP3 or WAV format using ffmpeg.

    Fixes iOS/Expo Audio compatibility issues where non-standard Apple codecs
    are rejected by Whisper and AssemblyAI APIs.

    Process:
    1. Write audio bytes to temp file (preserves binary integrity)
    2. Try MP3 conversion first (best compression)
    3. Fall back to WAV if MP3 encoding not available
    4. Return converted bytes or original on failure

    Args:
        audio_bytes: Original audio bytes (any format)
        original_filename: Original filename for logging

    Returns:
        tuple: (converted_bytes, error_message)
        - Success: (mp3_bytes or wav_bytes, None)
        - Failure: (original_bytes, error_string)

    Raises:
        Never raises - always returns original bytes on error
    """
    try:
        # Get bundled ffmpeg binary from imageio-ffmpeg package
        # This works cross-platform (Windows, Linux, Mac) without system installation
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        logger.info(f"[FFMPEG] Using ffmpeg binary: {ffmpeg_exe}")
        logger.info(f"[FFMPEG] Converting audio: {len(audio_bytes)} bytes from {original_filename}")

        # Validate audio_bytes before processing
        if not audio_bytes or len(audio_bytes) == 0:
            logger.error("[FFMPEG] Received empty audio_bytes!")
            return audio_bytes, "Empty audio data received"

        # Check magic bytes to verify it's actually audio
        magic_bytes = audio_bytes[:16] if len(audio_bytes) >= 16 else audio_bytes
        logger.info(f"[FFMPEG] Audio magic bytes (hex): {magic_bytes.hex()}")

        # Create temp files - use delete=False and close explicitly for Windows compatibility
        # Windows doesn't allow other processes to open files while Python has them open
        input_file = tempfile.NamedTemporaryFile(suffix='.m4a', delete=False)
        output_file = tempfile.NamedTemporaryFile(suffix='.mp3', delete=False)

        input_path = input_file.name
        output_path = output_file.name
        temp_files_to_cleanup = [input_path, output_path]  # Track all temp files for cleanup

        try:
            # Write input bytes
            logger.info(f"[FFMPEG] Writing {len(audio_bytes)} bytes to temp file: {input_path}")
            bytes_written = input_file.write(audio_bytes)
            input_file.flush()
            logger.info(f"[FFMPEG] Wrote {bytes_written} bytes, flushing and closing...")

            # CRITICAL: Close the file explicitly so ffmpeg can open it (Windows requirement)
            input_file.close()
            output_file.close()

            # Verify temp file was created and has data
            import os
            if not os.path.exists(input_path):
                logger.error(f"[FFMPEG] Temp file doesn't exist after writing: {input_path}")
                return audio_bytes, "Failed to create temp file"

            file_size = os.path.getsize(input_path)
            logger.info(f"[FFMPEG] Temp file verified: {input_path} ({file_size} bytes)")

            if file_size != len(audio_bytes):
                logger.error(f"[FFMPEG] Size mismatch! Expected {len(audio_bytes)}, got {file_size}")
                return audio_bytes, f"Temp file size mismatch: {file_size} != {len(audio_bytes)}"

            logger.info(f"[FFMPEG] Input temp file ready: {input_path}")
            logger.info(f"[FFMPEG] Output temp file ready: {output_path}")

        except Exception as write_error:
            logger.error(f"[FFMPEG] Failed to write temp file: {write_error}")
            try:
                input_file.close()
                output_file.close()
            except Exception:
                pass
            return audio_bytes, f"Temp file write failed: {str(write_error)}"

        # Convert using ffmpeg (optimized for speech transcription)
        ffmpeg_cmd = [
            ffmpeg_exe,                # Use bundled ffmpeg binary
            '-i', input_path,          # Input file
            '-codec:a', 'libmp3lame',  # MP3 encoder
            '-qscale:a', '2',          # High quality (2 = ~192kbps)
            '-ar', '16000',            # 16kHz sample rate (optimal for speech)
            '-ac', '1',                # Mono (reduces file size, good for speech)
            '-y',                      # Overwrite output without asking
            '-loglevel', 'error',      # Only show errors, not version info
            output_path                # Output file
        ]

        logger.info(f"[FFMPEG] Running command: {' '.join(ffmpeg_cmd[:3])}... (full command logged at debug level)")
        logger.debug(f"[FFMPEG] Full command: {' '.join(ffmpeg_cmd)}")

        result = subprocess.run(ffmpeg_cmd, capture_output=True, timeout=AUDIO_CONVERSION_TIMEOUT_SEC, text=True)

        # Check if conversion succeeded
        if result.returncode != 0:
            # Log FULL stderr (no truncation) to see the actual error
            logger.error(f"[FFMPEG] MP3 conversion failed (exit code {result.returncode})")
            logger.error(f"[FFMPEG] STDERR (full): {result.stderr}")
            logger.error(f"[FFMPEG] STDOUT (full): {result.stdout}")

            # Try WAV fallback (doesn't require MP3 encoder)
            logger.info("[FFMPEG] Trying WAV fallback (no encoding required)...")

            import os
            wav_output = output_path.replace('.mp3', '.wav')
            temp_files_to_cleanup.append(wav_output)  # Track WAV file for cleanup

            wav_cmd = [
                ffmpeg_exe,
                '-i', input_path,
                '-ar', '16000',            # 16kHz sample rate
                '-ac', '1',                # Mono
                '-y',
                '-loglevel', 'error',
                wav_output
            ]

            logger.debug(f"[FFMPEG] WAV command: {' '.join(wav_cmd)}")
            wav_result = subprocess.run(wav_cmd, capture_output=True, timeout=AUDIO_CONVERSION_TIMEOUT_SEC, text=True)

            if wav_result.returncode != 0:
                logger.error(f"[FFMPEG] WAV fallback also failed (exit code {wav_result.returncode})")
                logger.error(f"[FFMPEG] WAV STDERR: {wav_result.stderr}")
                # ✅ Cleanup handled by finally block
                error_summary = result.stderr[:200] if result.stderr else "Unknown ffmpeg error"
                return audio_bytes, f"ffmpeg failed (code {result.returncode}): {error_summary}"

            # WAV conversion succeeded!
            logger.info("[FFMPEG] ✅ WAV fallback successful")
            output_path = wav_output  # Use WAV file (cleanup handled by finally)

            # Read converted audio
            with open(output_path, 'rb') as f:
                converted_bytes = f.read()

            logger.info(f"[FFMPEG] ✅ Conversion successful: {len(audio_bytes)} → {len(converted_bytes)} bytes")
            logger.info(f"[FFMPEG] Compression ratio: {len(converted_bytes)/len(audio_bytes)*100:.1f}%")

            return converted_bytes, None

        except subprocess.TimeoutExpired:
            logger.error(f"[FFMPEG] Conversion timeout (>{AUDIO_CONVERSION_TIMEOUT_SEC}s)")
            return audio_bytes, "ffmpeg timeout"

        except Exception as e:
            logger.error(f"[FFMPEG] Unexpected error: {str(e)}", exc_info=True)
            return audio_bytes, f"Conversion error: {str(e)}"

        finally:
            # ✅ GUARANTEED cleanup: Always delete temp files, even on crash/timeout
            import os
            for temp_file in temp_files_to_cleanup:
                try:
                    if os.path.exists(temp_file):
                        os.remove(temp_file)
                        logger.debug(f"[FFMPEG] Cleaned up: {temp_file}")
                except Exception as cleanup_error:
                    logger.warning(f"[FFMPEG] Failed to delete {temp_file}: {cleanup_error}")

    except Exception as outer_error:
        # Outer exception handler (before temp files created)
        logger.error(f"[FFMPEG] Failed before temp file creation: {str(outer_error)}")
        return audio_bytes, f"Pre-processing error: {str(outer_error)}"


# ═══════════════════════════════════════════════════════════════════════
# API ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════

@router.post("/transcribe", response_model=ApiResponse, status_code=status.HTTP_200_OK)
async def transcribe_audio(
    audio: UploadFile = File(..., description="Audio file (MP3, M4A, WAV, FLAC, OGG)"),
    language: str = Form("en", description="Language code (default: en)"),
    capture_id: Optional[str] = Form(None, description="Optional capture ID to link"),
    subtask_instance_id: Optional[str] = Form(None, description="Optional subtask instance ID"),
    goal_id: Optional[str] = Form(None, description="Optional goal ID"),
    user = Depends(get_current_user),
    supabase = Depends(get_supabase_client)
):
    """
    Transcribe audio file with provider fallback chain.

    Process:
    1. Validate audio file (format, size)
    2. Check rate limits (50 requests/day, 300 min/day)
    3. Upload to Supabase Storage
    4. Transcribe with fallback (AssemblyAI → Whisper → None)
    5. Store in captures table
    6. Increment usage counters
    7. Log to ai_runs table

    Args:
        audio: Audio file upload
        language: Language code (default: en)
        capture_id: Optional existing capture ID
        subtask_instance_id: Optional bind linkage
        goal_id: Optional goal linkage
        user: Authenticated user
        supabase: Supabase client

    Returns:
        Transcription result with audio URL

    Raises:
        400: Invalid audio format or too large
        429: Rate limit exceeded
        503: Transcription failed (all providers)
    """
    try:
        # Get user profile ID (auth.uid() → user_profiles.id)
        user_id, user_timezone = get_user_profile(user, supabase)

        # Log received audio metadata for debugging
        logger.info("[TRANSCRIBE] Received audio file:")
        logger.info(f"  - Filename: {audio.filename}")
        logger.info(f"  - Content-Type: {audio.content_type}")
        logger.info(f"  - Size: {audio.size if hasattr(audio, 'size') else 'unknown'} bytes")

        # Validate language code
        if language not in SUPPORTED_LANGUAGES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": {
                        "code": "INVALID_LANGUAGE",
                        "message": f"Language '{language}' not supported. Use ISO 639-1 codes (e.g., 'en', 'es', 'fr')",
                        "retryable": False
                    }
                }
            )

        # Validate audio format
        allowed_types = ['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/wave', 'audio/flac', 'audio/ogg', 'audio/m4a']
        if audio.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": {
                        "code": "INVALID_AUDIO_FORMAT",
                        "message": "Only MP3, M4A, WAV, FLAC, and OGG formats supported",
                        "retryable": False
                    }
                }
            )

        # Read audio file
        audio_bytes = await audio.read()

        # CRITICAL: Log audio_bytes immediately after read
        logger.info(f"[TRANSCRIBE] Read audio file: {len(audio_bytes)} bytes")
        if len(audio_bytes) == 0:
            logger.error("[TRANSCRIBE] ❌ Audio read returned EMPTY bytes!")
            logger.error(f"[TRANSCRIBE] UploadFile details: filename={audio.filename}, content_type={audio.content_type}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": {
                        "code": "EMPTY_AUDIO_FILE",
                        "message": "Audio file is empty or could not be read",
                        "retryable": False
                    }
                }
            )

        # Log first 16 bytes (magic bytes) to verify audio format
        magic_bytes = audio_bytes[:16] if len(audio_bytes) >= 16 else audio_bytes
        logger.info(f"[TRANSCRIBE] Audio magic bytes (hex): {magic_bytes.hex()}")

        # Validate audio size (configured max)
        if len(audio_bytes) > MAX_AUDIO_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": {
                        "code": "AUDIO_TOO_LARGE",
                        "message": f"Audio file too large (max {MAX_AUDIO_FILE_SIZE_MB}MB, got {len(audio_bytes) / (1024*1024):.1f}MB)",
                        "retryable": False
                    }
                }
            )

        # Check rate limits (using user's timezone for accurate daily limits)
        await check_rate_limit(user_id, supabase, user_timezone)

        # Upload to Supabase Storage
        from datetime import datetime
        timestamp = int(datetime.now().timestamp() * 1000)
        storage_key = f"{user_id}/voice_{timestamp}.m4a"

        try:
            supabase.storage.from_('captures').upload(
                path=storage_key,
                file=audio_bytes,
                file_options={"content-type": audio.content_type}
            )
        except Exception as upload_error:
            logger.error(f"Storage upload failed: {str(upload_error)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "error": {
                        "code": "UPLOAD_FAILED",
                        "message": "Failed to upload audio to storage",
                        "retryable": True
                    }
                }
            )

        # Convert audio to MP3 for STT compatibility (fixes iOS/Expo format issues)
        logger.info("[TRANSCRIBE] Converting audio to MP3 format for STT compatibility")
        converted_bytes, conversion_error = await convert_audio_to_mp3(audio_bytes, audio.filename)

        if conversion_error:
            logger.warning(f"[TRANSCRIBE] Audio conversion failed: {conversion_error}, using original bytes")
            # Continue with original bytes (might still work for some formats)
        else:
            logger.info("[TRANSCRIBE] Audio converted successfully, using MP3 for transcription")
            audio_bytes = converted_bytes  # Use converted MP3 for transcription

        # Transcribe with fallback
        logger.info(f"Starting transcription: {len(audio_bytes)} bytes, language={language}")
        logger.info(f"Provider status: {stt_service.get_provider_status()}")

        transcription_result: Optional[TranscriptionResult] = await stt_service.transcribe(
            audio_file=audio_bytes,
            language=language
        )

        if transcription_result:
            logger.info(f"Transcription successful: provider={transcription_result.provider}, length={len(transcription_result.transcript)}")
        else:
            logger.warning("Transcription returned None - all providers failed or unavailable")

        # Store in captures table
        # Calculate local_date in user's timezone (not server timezone)
        from datetime import datetime
        import pytz
        user_tz = pytz.timezone(user_timezone)
        local_date = datetime.now(user_tz).date().isoformat()

        capture_data = {
            'user_id': str(user_id),  # Convert UUID to string for JSON serialization
            'type': 'audio',
            'storage_key': storage_key,
            'content_text': transcription_result.transcript if transcription_result else None,
            'duration_sec': transcription_result.duration_sec if transcription_result else None,
            'goal_id': goal_id,
            'subtask_instance_id': subtask_instance_id,
            'local_date': local_date  # User's local date, not server's
        }

        if capture_id:
            # Update existing capture
            supabase.table('captures').update(capture_data).eq('id', capture_id).execute()
        else:
            # Create new capture
            supabase.table('captures').insert(capture_data).execute()

        # Increment usage counters (using user's timezone for correct daily tracking)
        if transcription_result:
            await increment_usage(str(user_id), transcription_result.duration_sec, supabase, user_timezone)

            # Log to ai_runs (re-enabled after adding 'transcription' to ai_module enum)
            await log_ai_run(
                user_id=str(user_id),  # Convert UUID to string
                provider=transcription_result.provider,
                duration_sec=transcription_result.duration_sec,
                cost_usd=transcription_result.cost_usd,
                confidence_score=transcription_result.confidence,
                supabase=supabase
            )

        # Generate signed URL for audio playback (configured expiration)
        signed_url = supabase.storage.from_('captures').create_signed_url(
            path=storage_key,
            expires_in=SIGNED_URL_EXPIRATION_SEC
        )

        # Build response
        response_data = {
            "transcript": transcription_result.transcript if transcription_result else "",
            "confidence": transcription_result.confidence if transcription_result else 0.0,
            "duration_sec": transcription_result.duration_sec if transcription_result else 0,
            "language": language,
            "provider": transcription_result.provider if transcription_result else "manual",
            "audio_url": signed_url['signedURL']
        }

        return ApiResponse(data=response_data)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": {
                    "code": "STT_ALL_PROVIDERS_FAILED",
                    "message": "Transcription failed. Audio saved. Retry?",
                    "retryable": True
                }
            }
        )


@router.get("/captures/{capture_id}", response_model=ApiResponse, status_code=status.HTTP_200_OK)
async def get_capture(
    capture_id: UUID,
    user = Depends(get_current_user),
    supabase = Depends(get_supabase_client)
):
    """
    Retrieve audio capture with signed URL.

    Args:
        capture_id: Capture record ID
        user: Authenticated user
        supabase: Supabase client

    Returns:
        Capture record with signed audio URL (1-hour expiration)

    Raises:
        404: Capture not found
        403: User doesn't own capture
    """
    try:
        # Get user profile ID (auth.uid() → user_profiles.id)
        user_id, _ = get_user_profile(user, supabase)

        # Fetch capture (RLS enforces user ownership)
        result = supabase.table('captures').select('*').eq('id', str(capture_id)).single().execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": {"code": "CAPTURE_NOT_FOUND", "message": "Capture not found"}}
            )

        capture = result.data

        # Generate signed URL for audio playback (configured expiration)
        signed_url = None
        if capture['storage_key']:
            signed_result = supabase.storage.from_('captures').create_signed_url(
                path=capture['storage_key'],
                expires_in=SIGNED_URL_EXPIRATION_SEC
            )
            signed_url = signed_result['signedURL']

        # Build response
        response_data = {
            "id": capture['id'],
            "user_id": capture['user_id'],
            "type": capture['type'],
            "storage_key": capture['storage_key'],
            "content_text": capture.get('content_text'),
            "duration_sec": capture.get('duration_sec'),
            "goal_id": capture.get('goal_id'),
            "subtask_instance_id": capture.get('subtask_instance_id'),
            "local_date": capture['local_date'],
            "created_at": capture['created_at'],
            "audio_url": signed_url
        }

        return ApiResponse(data=response_data)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get capture error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": {"code": "INTERNAL_ERROR", "message": "Failed to retrieve capture"}}
        )


@router.delete("/captures/{capture_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_capture(
    capture_id: UUID,
    user = Depends(get_current_user),
    supabase = Depends(get_supabase_client)
):
    """
    Delete audio capture (Storage + Database).

    Cascading cleanup:
    1. Delete from Supabase Storage
    2. Delete from captures table

    Args:
        capture_id: Capture record ID
        user: Authenticated user
        supabase: Supabase client

    Raises:
        404: Capture not found
        403: User doesn't own capture
    """
    try:
        # Get user profile ID (auth.uid() → user_profiles.id)
        user_id, _ = get_user_profile(user, supabase)

        # Fetch capture (RLS enforces user ownership)
        result = supabase.table('captures').select('storage_key').eq('id', str(capture_id)).single().execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": {"code": "CAPTURE_NOT_FOUND", "message": "Capture not found"}}
            )

        storage_key = result.data['storage_key']

        # Delete from Storage
        if storage_key:
            supabase.storage.from_('captures').remove([storage_key])

        # Delete from Database
        supabase.table('captures').delete().eq('id', str(capture_id)).execute()

        return None  # 204 No Content

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete capture error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": {"code": "INTERNAL_ERROR", "message": "Failed to delete capture"}}
        )


@router.post("/captures/{capture_id}/re-transcribe", response_model=ApiResponse, status_code=status.HTTP_200_OK)
async def re_transcribe_capture(
    capture_id: UUID,
    provider: Optional[str] = Form(None, description="Optional provider: 'assemblyai' or 'whisper'"),
    user = Depends(get_current_user),
    supabase = Depends(get_supabase_client)
):
    """
    Re-transcribe audio capture (retry with different provider).

    Free retry policy:
    - First re-transcription is complementary (doesn't count against daily limit)
    - Subsequent retries count against daily limit

    Args:
        capture_id: Capture record ID
        provider: Optional provider override ('assemblyai' or 'whisper')
        user: Authenticated user
        supabase: Supabase client

    Returns:
        Updated capture with new transcript

    Raises:
        404: Capture not found
        403: User doesn't own capture
        503: Re-transcription failed
    """
    try:
        # Get user profile ID (auth.uid() → user_profiles.id)
        user_id, user_timezone = get_user_profile(user, supabase)

        # Fetch capture (RLS enforces user ownership)
        result = supabase.table('captures').select('*').eq('id', str(capture_id)).single().execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": {"code": "CAPTURE_NOT_FOUND", "message": "Capture not found"}}
            )

        capture = result.data
        storage_key = capture['storage_key']

        # Check retry count (first retry is free, subsequent retries count against limits)
        retry_count = capture.get('metadata_json', {}).get('retry_count', 0)

        if retry_count > 0:
            # Not first retry - check rate limits
            logger.info(f"[RE-TRANSCRIBE] Retry #{retry_count + 1} - checking rate limits")
            await check_rate_limit(user_id, supabase, user_timezone)
        else:
            # First retry is complementary
            logger.info("[RE-TRANSCRIBE] First retry - complementary (no rate limit check)")

        # Download audio from Storage
        audio_data = supabase.storage.from_('captures').download(storage_key)

        # Re-transcribe
        transcription_result: Optional[TranscriptionResult] = await stt_service.transcribe(
            audio_file=audio_data,
            language='en'  # TODO: Support language detection
        )

        if not transcription_result:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={
                    "error": {
                        "code": "STT_ALL_PROVIDERS_FAILED",
                        "message": "Re-transcription failed. All providers unavailable.",
                        "retryable": True
                    }
                }
            )

        # Update captures table with new transcript AND increment retry counter
        update_data = {
            'content_text': transcription_result.transcript,
            'duration_sec': transcription_result.duration_sec,
            'metadata_json': {
                **capture.get('metadata_json', {}),  # Preserve existing metadata
                'retry_count': retry_count + 1  # Increment retry counter
            }
        }

        supabase.table('captures').update(update_data).eq('id', str(capture_id)).execute()

        # Log to ai_runs (re-transcription cost tracking)
        await log_ai_run(
            user_id=str(user_id),  # Convert UUID to string
            provider=transcription_result.provider,
            duration_sec=transcription_result.duration_sec,
            cost_usd=transcription_result.cost_usd,
            confidence_score=transcription_result.confidence,
            supabase=supabase
        )

        # Generate signed URL
        signed_url = supabase.storage.from_('captures').create_signed_url(
            path=storage_key,
            expires_in=SIGNED_URL_EXPIRATION_SEC
        )

        # Build response
        response_data = {
            "id": capture['id'],
            "user_id": capture['user_id'],
            "type": capture['type'],
            "storage_key": storage_key,
            "content_text": transcription_result.transcript,
            "duration_sec": transcription_result.duration_sec,
            "goal_id": capture.get('goal_id'),
            "subtask_instance_id": capture.get('subtask_instance_id'),
            "local_date": capture['local_date'],
            "created_at": capture['created_at'],
            "audio_url": signed_url['signedURL']
        }

        return ApiResponse(data=response_data)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Re-transcribe error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": {"code": "INTERNAL_ERROR", "message": "Re-transcription failed"}}
        )


@router.get("/transcribe/status", status_code=status.HTTP_200_OK)
async def get_transcription_status():
    """
    Get STT service status and provider availability.

    Useful for diagnostics - check which providers are configured.

    Returns:
        Provider status with availability flags
    """
    provider_status = stt_service.get_provider_status()

    return {
        "providers": provider_status,
        "any_available": any(provider_status.values()),
        "message": "At least one provider required for transcription" if not any(provider_status.values()) else "Transcription available"
    }

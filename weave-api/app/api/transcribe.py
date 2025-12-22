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
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel, Field
from supabase import Client

from app.core.deps import get_current_user, get_supabase_client
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

async def check_rate_limit(user_id: UUID, supabase):
    """
    Check STT rate limits for user.

    Limits:
    - 50 transcription requests per day
    - 300 minutes total audio per day

    Args:
        user_id: User profile ID (UUID)
        supabase: Supabase client

    Raises:
        HTTPException: 429 if rate limit exceeded
    """
    from datetime import date

    today = date.today().isoformat()

    # Query daily_aggregates for today's usage
    result = supabase.table('daily_aggregates') \
        .select('stt_request_count, stt_duration_minutes') \
        .eq('user_id', str(user_id)) \
        .eq('local_date', today) \
        .maybe_single() \
        .execute()

    if result.data:
        request_count = result.data.get('stt_request_count', 0)
        duration_minutes = result.data.get('stt_duration_minutes', 0)

        # Check request limit (50/day)
        if request_count >= 50:
            # Calculate next reset time (midnight)
            from datetime import datetime, timedelta
            tomorrow = datetime.now().date() + timedelta(days=1)
            reset_time = datetime.combine(tomorrow, datetime.min.time()).isoformat()

            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": {
                        "code": "STT_RATE_LIMIT_EXCEEDED",
                        "message": f"Daily transcription limit reached ({request_count}/50 requests)",
                        "retryable": False,
                        "retryAfter": reset_time
                    }
                }
            )

        # Check duration limit (300 minutes/day)
        if duration_minutes >= 300:
            from datetime import datetime, timedelta
            tomorrow = datetime.now().date() + timedelta(days=1)
            reset_time = datetime.combine(tomorrow, datetime.min.time()).isoformat()

            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": {
                        "code": "STT_RATE_LIMIT_EXCEEDED",
                        "message": f"Daily audio duration limit reached ({duration_minutes:.1f}/300 minutes)",
                        "retryable": False,
                        "retryAfter": reset_time
                    }
                }
            )


async def increment_usage(user_id: str, duration_sec: int, supabase):
    """
    Increment STT usage counters atomically.

    Args:
        user_id: User profile ID
        duration_sec: Audio duration in seconds
        supabase: Supabase client
    """
    from datetime import date

    today = date.today().isoformat()
    duration_minutes = duration_sec / 60.0

    # Upsert daily_aggregates (increment or create)
    # Note: Supabase doesn't support atomic increment, so we do read-modify-write
    result = supabase.table('daily_aggregates') \
        .select('stt_request_count, stt_duration_minutes') \
        .eq('user_id', user_id) \
        .eq('local_date', today) \
        .maybe_single() \
        .execute()

    if result.data:
        # Update existing record
        new_count = result.data['stt_request_count'] + 1
        new_duration = result.data['stt_duration_minutes'] + duration_minutes

        supabase.table('daily_aggregates') \
            .update({
                'stt_request_count': new_count,
                'stt_duration_minutes': new_duration
            }) \
            .eq('user_id', user_id) \
            .eq('local_date', today) \
            .execute()
    else:
        # Create new record
        supabase.table('daily_aggregates') \
            .insert({
                'user_id': user_id,
                'local_date': today,
                'stt_request_count': 1,
                'stt_duration_minutes': duration_minutes
            }) \
            .execute()


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

    Args:
        user_id: User profile ID
        provider: STT provider used
        duration_sec: Audio duration
        cost_usd: Transcription cost
        confidence_score: Confidence score (0-1.0)
        supabase: Supabase client

    Returns:
        ai_runs record ID
    """
    result = supabase.table('ai_runs').insert({
        'user_id': user_id,
        'operation': 'transcription',
        'model': 'whisper-1' if provider == 'whisper' else 'assemblyai',
        'provider': provider,
        'audio_duration_sec': duration_sec,
        'cost_usd': cost_usd,
        'confidence_score': confidence_score,
        'input_tokens': 0,  # Not applicable for STT
        'output_tokens': 0,  # Not applicable for STT
    }).execute()

    return result.data[0]['id']


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

        # Validate audio format
        allowed_types = ['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/wave', 'audio/flac', 'audio/ogg']
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

        # Validate audio size (25MB max)
        max_size = 25 * 1024 * 1024  # 25MB
        if len(audio_bytes) > max_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": {
                        "code": "AUDIO_TOO_LARGE",
                        "message": f"Audio file too large (max 25MB, got {len(audio_bytes) / (1024*1024):.1f}MB)",
                        "retryable": False
                    }
                }
            )

        # Check rate limits
        await check_rate_limit(user_id, supabase)

        # Upload to Supabase Storage
        from datetime import datetime
        timestamp = int(datetime.now().timestamp() * 1000)
        storage_key = f"{user_id}/voice_{timestamp}.m4a"

        try:
            upload_result = supabase.storage.from_('captures').upload(
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

        # Transcribe with fallback
        transcription_result: Optional[TranscriptionResult] = await stt_service.transcribe(
            audio_file=audio_bytes,
            language=language
        )

        # Store in captures table
        from datetime import date
        today = date.today().isoformat()

        capture_data = {
            'user_id': user_id,
            'type': 'audio',
            'storage_key': storage_key,
            'content_text': transcription_result.transcript if transcription_result else None,
            'duration_sec': transcription_result.duration_sec if transcription_result else None,
            'goal_id': goal_id,
            'subtask_instance_id': subtask_instance_id,
            'local_date': today
        }

        if capture_id:
            # Update existing capture
            capture_result = supabase.table('captures').update(capture_data).eq('id', capture_id).execute()
        else:
            # Create new capture
            capture_result = supabase.table('captures').insert(capture_data).execute()

        capture = capture_result.data[0]

        # Increment usage counters
        if transcription_result:
            await increment_usage(user_id, transcription_result.duration_sec, supabase)

            # Log to ai_runs
            await log_ai_run(
                user_id=user_id,
                provider=transcription_result.provider,
                duration_sec=transcription_result.duration_sec,
                cost_usd=transcription_result.cost_usd,
                confidence_score=transcription_result.confidence,
                supabase=supabase
            )

        # Generate signed URL for audio playback (1-hour expiration)
        signed_url = supabase.storage.from_('captures').create_signed_url(
            path=storage_key,
            expires_in=3600  # 1 hour
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

        # Generate signed URL for audio playback (1-hour expiration)
        signed_url = None
        if capture['storage_key']:
            signed_result = supabase.storage.from_('captures').create_signed_url(
                path=capture['storage_key'],
                expires_in=3600  # 1 hour
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

        # Update captures table
        update_data = {
            'content_text': transcription_result.transcript,
            'duration_sec': transcription_result.duration_sec
        }

        supabase.table('captures').update(update_data).eq('id', str(capture_id)).execute()

        # Log to ai_runs (re-transcription cost tracking)
        await log_ai_run(
            user_id=user_id,
            provider=transcription_result.provider,
            duration_sec=transcription_result.duration_sec,
            cost_usd=transcription_result.cost_usd,
            confidence_score=transcription_result.confidence,
            supabase=supabase
        )

        # Generate signed URL
        signed_url = supabase.storage.from_('captures').create_signed_url(
            path=storage_key,
            expires_in=3600
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

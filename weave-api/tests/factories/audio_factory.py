"""
Test Data Factory for Audio Captures and Transcriptions
Story: 0.11 - Voice/Speech-to-Text Infrastructure

Factory Pattern:
- Uses @faker-js/faker for random data generation
- Supports overrides for specific test scenarios
- Auto-cleanup via fixtures (not in factory)
"""

from datetime import datetime, timezone
from typing import Any, Dict, Optional
from uuid import uuid4


def create_test_audio_capture(user_id: Optional[str] = None, **kwargs: Any) -> Dict[str, Any]:
    """Create a test audio capture fixture.

    Args:
        user_id: User ID who owns this capture (defaults to test user)
        **kwargs: Override default values

    Returns:
        Dict with audio capture data matching captures table schema

    Example:
        >>> capture = create_test_audio_capture(
        ...     user_id="123",
        ...     content_text="I completed my workout today",
        ...     duration_sec=45
        ... )
    """
    capture_id = str(uuid4())
    defaults = {
        "id": capture_id,
        "user_id": user_id or "test-user-123",
        "type": "audio",  # 'photo' | 'audio' | 'text' | 'timer' | 'link'
        "storage_key": f"captures/test-user-123/voice_{datetime.now().timestamp()}.m4a",
        "content_text": "I completed my morning workout today. Felt great and energized.",
        "note": "Quick voice memo after workout",
        "duration_sec": 45,
        "local_date": "2025-12-22",
        "goal_id": None,
        "subtask_instance_id": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        # AI analysis fields (for audio captures, these may be None or minimal)
        "ai_verified": False,
        "ai_analysis": None,
    }
    return {**defaults, **kwargs}


def create_test_transcription_result(**kwargs: Any) -> Dict[str, Any]:
    """Create a test transcription result fixture.

    Args:
        **kwargs: Override default values

    Returns:
        Dict with transcription result data matching TranscriptionResult dataclass

    Example:
        >>> result = create_test_transcription_result(
        ...     provider="assemblyai",
        ...     confidence=0.92
        ... )
    """
    defaults = {
        "transcript": "I completed my morning workout today. Felt great and energized.",
        "confidence": 0.92,
        "duration_sec": 45,
        "language": "en",
        "provider": "assemblyai",  # 'assemblyai' | 'whisper' | 'manual'
        "cost_usd": 0.001875,  # 45 sec * $0.0025/min / 60
    }
    return {**defaults, **kwargs}


def create_test_audio_bytes(duration_sec: int = 10, format: str = "m4a") -> bytes:
    """Generate test audio file bytes (simulated).

    For unit tests, we don't need real audio - just valid byte sequences
    that can pass format validation.

    Args:
        duration_sec: Simulated audio duration
        format: Audio format ('m4a', 'mp3', 'wav')

    Returns:
        Bytes representing audio file

    Example:
        >>> audio = create_test_audio_bytes(duration_sec=30, format="m4a")
        >>> len(audio) > 0
        True
    """
    # Simulate audio file based on format
    if format == "m4a":
        # M4A/AAC container format (simplified simulation)
        return b"ftyp" + b"M4A " + b"fake_audio_data" * (duration_sec * 100)
    elif format == "mp3":
        # MP3 frame header (simplified simulation)
        return b"\xff\xfb" + b"fake_mp3_data" * (duration_sec * 100)
    elif format == "wav":
        # WAV RIFF header (simplified simulation)
        return b"RIFF" + b"fake_wav_data" * (duration_sec * 100)
    else:
        raise ValueError(f"Unsupported format: {format}")


def create_test_audio_file_multipart(
    filename: str = "test_voice.m4a",
    mime_type: str = "audio/x-m4a",
    duration_sec: int = 45,
) -> tuple[str, bytes, str]:
    """Create multipart file tuple for FastAPI file upload tests.

    Args:
        filename: Name of audio file
        mime_type: MIME type of audio
        duration_sec: Duration of audio in seconds

    Returns:
        Tuple (filename, file_bytes, mime_type) for files parameter

    Example:
        >>> files = {'file': create_test_audio_file_multipart()}
        >>> response = client.post('/api/transcribe', files=files)
    """
    format = filename.split(".")[-1]  # Extract format from filename
    audio_bytes = create_test_audio_bytes(duration_sec=duration_sec, format=format)
    return (filename, audio_bytes, mime_type)


def create_test_ai_run_log(**kwargs: Any) -> Dict[str, Any]:
    """Create a test ai_runs log entry for STT cost tracking.

    Args:
        **kwargs: Override default values

    Returns:
        Dict with ai_runs table data for STT operation

    Example:
        >>> ai_run = create_test_ai_run_log(
        ...     user_id="123",
        ...     provider="assemblyai",
        ...     audio_duration_sec=45,
        ...     cost_usd=0.001875
        ... )
    """
    defaults = {
        "id": str(uuid4()),
        "user_id": "test-user-123",
        "operation": "stt_transcribe",
        "model": "assemblyai",  # or 'whisper-1'
        "provider": "assemblyai",  # 'assemblyai' | 'whisper' | 'manual'
        "input_tokens": 0,  # Not applicable for STT
        "output_tokens": 0,  # Not applicable for STT
        "audio_duration_sec": 45,
        "cost_usd": 0.001875,
        "confidence_score": 0.92,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    return {**defaults, **kwargs}


def create_test_daily_aggregates(**kwargs: Any) -> Dict[str, Any]:
    """Create a test daily_aggregates entry with STT usage tracking.

    Args:
        **kwargs: Override default values

    Returns:
        Dict with daily_aggregates table data

    Example:
        >>> aggregates = create_test_daily_aggregates(
        ...     stt_request_count=12,
        ...     stt_duration_minutes=6.5
        ... )
    """
    defaults = {
        "id": str(uuid4()),
        "user_id": "test-user-123",
        "local_date": "2025-12-22",
        "stt_request_count": 12,  # NEW: Count of transcription requests
        "stt_duration_minutes": 6.5,  # NEW: Total audio duration transcribed
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    return {**defaults, **kwargs}


# ============================================================================
# FACTORY HELPER FUNCTIONS
# ============================================================================


def create_audio_captures_batch(count: int, user_id: Optional[str] = None) -> list[Dict[str, Any]]:
    """Create multiple audio capture fixtures at once.

    Args:
        count: Number of captures to create
        user_id: User ID for all captures

    Returns:
        List of capture dicts

    Example:
        >>> captures = create_audio_captures_batch(5, user_id="123")
        >>> len(captures)
        5
    """
    return [create_test_audio_capture(user_id=user_id) for _ in range(count)]


def create_rate_limit_scenario(
    used: int = 40,
    limit: int = 50,
    user_id: Optional[str] = None,
) -> Dict[str, Any]:
    """Create a rate limit test scenario.

    Args:
        used: Number of transcriptions used today
        limit: Daily transcription limit
        user_id: User ID

    Returns:
        Daily aggregates dict with usage counts

    Example:
        >>> # Simulate 80% usage (warning threshold)
        >>> scenario = create_rate_limit_scenario(used=40, limit=50)
        >>> scenario['stt_request_count']
        40
    """
    return create_test_daily_aggregates(
        user_id=user_id or "test-user-123",
        stt_request_count=used,
        stt_duration_minutes=(used * 0.75),  # Avg 45 sec per request
        local_date="2025-12-22",
    )

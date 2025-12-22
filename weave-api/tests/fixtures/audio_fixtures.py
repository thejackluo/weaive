"""
Test Fixtures for Audio/STT Testing
Story: 0.11 - Voice/Speech-to-Text Infrastructure

Fixture Pattern:
- Setup: Prepare resources (create records, mock services)
- Provide: Make resources available to test via `use`
- Cleanup: Auto-delete created data after test completes
"""

import pytest
from unittest.mock import AsyncMock, patch
from uuid import uuid4

from tests.factories.audio_factory import (
    create_test_audio_capture,
    create_test_transcription_result,
    create_test_audio_bytes,
)


# ============================================================================
# AUDIO CAPTURE FIXTURES
# ============================================================================


@pytest.fixture
def audio_capture_fixture(supabase_client, user_fixture):
    """Create audio capture in test database with auto-cleanup.

    Usage:
        async def test_get_audio(client, audio_capture_fixture):
            capture_id = audio_capture_fixture['id']
            response = client.get(f'/api/captures/{capture_id}')
            assert response.status_code == 200

    Returns:
        Dict with capture data (id, storage_key, content_text, etc.)

    Cleanup:
        Automatically deletes capture from database after test
    """
    # Setup: Create audio capture in database
    capture_data = create_test_audio_capture(user_id=user_fixture['id'])

    # Insert into captures table
    result = supabase_client.table('captures').insert(capture_data).execute()
    created_capture = result.data[0]

    # Provide to test
    yield created_capture

    # Cleanup: Delete from database
    supabase_client.table('captures').delete().eq('id', created_capture['id']).execute()


@pytest.fixture
def multiple_audio_captures_fixture(supabase_client, user_fixture):
    """Create multiple audio captures with auto-cleanup.

    Usage:
        async def test_list_captures(client, multiple_audio_captures_fixture):
            captures = multiple_audio_captures_fixture  # List of 5 captures
            response = client.get('/api/captures?type=audio')
            assert len(response.json()['data']) == 5

    Returns:
        List of capture dicts (5 captures)

    Cleanup:
        Automatically deletes all captures after test
    """
    # Setup: Create 5 audio captures
    captures = []
    for i in range(5):
        capture_data = create_test_audio_capture(
            user_id=user_fixture['id'],
            note=f"Test audio capture {i+1}",
            duration_sec=30 + (i * 10),  # Varying durations
        )
        result = supabase_client.table('captures').insert(capture_data).execute()
        captures.append(result.data[0])

    # Provide to test
    yield captures

    # Cleanup: Delete all captures
    for capture in captures:
        supabase_client.table('captures').delete().eq('id', capture['id']).execute()


# ============================================================================
# MOCK STT SERVICE FIXTURES
# ============================================================================


@pytest.fixture
def mock_assemblyai_success():
    """Mock successful AssemblyAI transcription.

    Usage:
        async def test_transcribe(client, mock_assemblyai_success):
            # AssemblyAI will return successful transcription
            response = client.post('/api/transcribe', files=...)
            assert response.status_code == 200

    Returns:
        Mock TranscriptionResult from AssemblyAI
    """
    return create_test_transcription_result(
        provider="assemblyai",
        confidence=0.92,
        cost_usd=0.001875,
    )


@pytest.fixture
def mock_whisper_success():
    """Mock successful Whisper API transcription (fallback).

    Usage:
        async def test_transcribe_fallback(client, mock_whisper_success):
            # Whisper will return successful transcription
            response = client.post('/api/transcribe', files=...)
            assert response.json()['data']['provider'] == 'whisper'

    Returns:
        Mock TranscriptionResult from Whisper
    """
    return create_test_transcription_result(
        provider="whisper",
        confidence=1.0,  # Whisper doesn't provide confidence
        cost_usd=0.0045,  # Whisper is more expensive
    )


@pytest.fixture
def mock_stt_service_with_fallback(mock_assemblyai_success, mock_whisper_success):
    """Mock STT service with realistic fallback behavior.

    Usage:
        async def test_fallback_chain(client, mock_stt_service_with_fallback):
            # First call fails (AssemblyAI), second succeeds (Whisper)
            response = client.post('/api/transcribe', files=...)
            assert response.json()['data']['provider'] == 'whisper'

    Returns:
        Mock service that simulates AssemblyAI failure → Whisper success
    """
    with patch('app.api.transcribe.get_stt_service') as mock_stt:
        mock_service = AsyncMock()
        # Simulate fallback: first call fails, second succeeds
        mock_service.transcribe.side_effect = [
            Exception("AssemblyAI timeout"),  # Primary fails
            mock_whisper_success,  # Fallback succeeds
        ]
        mock_stt.return_value = mock_service
        yield mock_service


# ============================================================================
# RATE LIMITING FIXTURES
# ============================================================================


@pytest.fixture
def daily_aggregates_at_warning_threshold(supabase_client, user_fixture):
    """Create daily_aggregates at 80% usage (warning threshold).

    Usage:
        async def test_rate_limit_warning(client, daily_aggregates_at_warning_threshold):
            # User has 40/50 transcriptions used
            response = client.get('/api/transcribe/usage')
            assert response.json()['warning'] is True

    Returns:
        Dict with daily_aggregates data (40/50 used)

    Cleanup:
        Automatically deletes record after test
    """
    # Setup: Create daily_aggregates with 40/50 used
    aggregates = {
        "id": str(uuid4()),
        "user_id": user_fixture['id'],
        "local_date": "2025-12-22",
        "stt_request_count": 40,
        "stt_duration_minutes": 30.0,
    }

    result = supabase_client.table('daily_aggregates').insert(aggregates).execute()
    created = result.data[0]

    # Provide to test
    yield created

    # Cleanup
    supabase_client.table('daily_aggregates').delete().eq('id', created['id']).execute()


@pytest.fixture
def daily_aggregates_at_limit(supabase_client, user_fixture):
    """Create daily_aggregates at 100% usage (limit reached).

    Usage:
        async def test_rate_limit_exceeded(client, daily_aggregates_at_limit):
            # User has 50/50 transcriptions used
            response = client.post('/api/transcribe', files=...)
            assert response.status_code == 429

    Returns:
        Dict with daily_aggregates data (50/50 used)

    Cleanup:
        Automatically deletes record after test
    """
    # Setup: Create daily_aggregates with 50/50 used (LIMIT)
    aggregates = {
        "id": str(uuid4()),
        "user_id": user_fixture['id'],
        "local_date": "2025-12-22",
        "stt_request_count": 50,
        "stt_duration_minutes": 37.5,
    }

    result = supabase_client.table('daily_aggregates').insert(aggregates).execute()
    created = result.data[0]

    # Provide to test
    yield created

    # Cleanup
    supabase_client.table('daily_aggregates').delete().eq('id', created['id']).execute()


# ============================================================================
# AUDIO FILE FIXTURES
# ============================================================================


@pytest.fixture
def test_audio_file_m4a():
    """Provide test M4A audio file bytes.

    Usage:
        async def test_upload_audio(client, test_audio_file_m4a):
            files = {'file': ('test.m4a', test_audio_file_m4a, 'audio/x-m4a')}
            response = client.post('/api/transcribe', files=files)

    Returns:
        Bytes representing M4A audio file
    """
    return create_test_audio_bytes(duration_sec=45, format="m4a")


@pytest.fixture
def test_audio_file_mp3():
    """Provide test MP3 audio file bytes.

    Returns:
        Bytes representing MP3 audio file
    """
    return create_test_audio_bytes(duration_sec=45, format="mp3")


@pytest.fixture
def test_audio_file_wav():
    """Provide test WAV audio file bytes.

    Returns:
        Bytes representing WAV audio file
    """
    return create_test_audio_bytes(duration_sec=45, format="wav")


@pytest.fixture
def test_audio_file_too_long():
    """Provide test audio file exceeding 5-minute limit.

    Usage:
        async def test_reject_long_audio(client, test_audio_file_too_long):
            files = {'file': ('long.m4a', test_audio_file_too_long, 'audio/x-m4a')}
            response = client.post('/api/transcribe', files=files)
            assert response.status_code == 400
            assert response.json()['error']['code'] == 'AUDIO_TOO_LONG'

    Returns:
        Bytes representing 6-minute audio file
    """
    return create_test_audio_bytes(duration_sec=360, format="m4a")  # 6 minutes


@pytest.fixture
def test_invalid_audio_file():
    """Provide invalid audio file (not audio format).

    Usage:
        async def test_reject_invalid_format(client, test_invalid_audio_file):
            files = {'file': ('invalid.txt', test_invalid_audio_file, 'text/plain')}
            response = client.post('/api/transcribe', files=files)
            assert response.status_code == 400

    Returns:
        Bytes that are not valid audio
    """
    return b"This is not audio data, just plain text"


# ============================================================================
# COST TRACKING FIXTURES
# ============================================================================


@pytest.fixture
def ai_run_log_fixture(supabase_client, user_fixture):
    """Create ai_runs log entry with auto-cleanup.

    Usage:
        async def test_cost_tracking(client, ai_run_log_fixture):
            # ai_runs entry already created
            run_id = ai_run_log_fixture['id']
            # ... verify cost tracking

    Returns:
        Dict with ai_runs log data

    Cleanup:
        Automatically deletes log entry after test
    """
    # Setup: Create ai_runs log
    ai_run = {
        "id": str(uuid4()),
        "user_id": user_fixture['id'],
        "operation": "stt_transcribe",
        "model": "assemblyai",
        "provider": "assemblyai",
        "audio_duration_sec": 45,
        "cost_usd": 0.001875,
        "confidence_score": 0.92,
        "timestamp": "2025-12-22T10:30:00Z",
    }

    result = supabase_client.table('ai_runs').insert(ai_run).execute()
    created = result.data[0]

    # Provide to test
    yield created

    # Cleanup
    supabase_client.table('ai_runs').delete().eq('id', created['id']).execute()

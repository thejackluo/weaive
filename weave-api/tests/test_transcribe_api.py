"""
Integration Tests for Transcribe API
Story: 0.11 - Voice/Speech-to-Text Infrastructure

Tests cover:
- AC-1: Core STT Integration (AssemblyAI + Whisper fallback)
- AC-2: Audio Storage (upload, retrieve, delete)
- AC-3: API Endpoint (POST /api/transcribe)
- AC-5: Rate Limiting (50 transcriptions/day)
- AC-6: Error Handling (error codes, fallbacks)
"""

import io
from unittest.mock import AsyncMock, patch
from uuid import uuid4

import pytest

from app.services.stt.base import TranscriptionResult


# ============================================================================
# FIXTURES
# ============================================================================


@pytest.fixture
def test_audio_bytes():
    """Generate test M4A audio file (simulated)"""
    # In real implementation, this would be actual audio file bytes
    # For now, use mock bytes that can be validated by format checker
    return b"fake_m4a_audio_data_for_testing"


@pytest.fixture
def mock_assemblyai_transcription():
    """Mock successful AssemblyAI transcription"""
    return TranscriptionResult(
        transcript="I completed my morning workout today. Felt great and energized.",
        confidence=0.92,
        duration_sec=45,
        language="en",
        provider="assemblyai",
        cost_usd=0.001875,  # 45 sec * $0.0025/min / 60
    )


@pytest.fixture
def mock_whisper_transcription():
    """Mock successful Whisper API transcription (fallback)"""
    return TranscriptionResult(
        transcript="I completed my morning workout today. Felt great and energized.",
        confidence=1.0,  # Whisper doesn't provide confidence score
        duration_sec=45,
        language="en",
        provider="whisper",
        cost_usd=0.0045,  # 45 sec * $0.006/min / 60
    )


# ============================================================================
# AC-3: POST /api/transcribe - HAPPY PATH
# ============================================================================


@pytest.mark.asyncio
async def test_transcribe_audio_success_with_assemblyai(
    client,
    test_audio_bytes,
    user_fixture,
    mock_assemblyai_transcription,
):
    """
    GIVEN: User uploads valid audio file
    WHEN: POST /api/transcribe is called
    THEN: Audio is transcribed using AssemblyAI (primary provider)
          - Returns transcript with confidence score
          - Stores audio in Supabase Storage
          - Creates capture record with transcript
          - Logs to ai_runs table with cost tracking
          - Increments daily_aggregates.stt_request_count
    """
    with patch('app.api.transcribe.get_stt_service') as mock_stt:
        # Mock STT service to return AssemblyAI success
        mock_service = AsyncMock()
        mock_service.transcribe.return_value = mock_assemblyai_transcription
        mock_stt.return_value = mock_service

        # Prepare upload
        files = {'file': ('voice_note.m4a', test_audio_bytes, 'audio/x-m4a')}
        data = {
            'local_date': '2025-12-22',
            'language': 'en',
        }

        response = client.post(
            '/api/transcribe',
            files=files,
            data=data,
            headers={'Authorization': f'Bearer {user_fixture["token"]}'},
        )

        # THEN: Success response
        assert response.status_code == 200
        result = response.json()

        # Verify response structure
        assert 'data' in result
        assert 'meta' in result

        # Verify transcription data
        data_obj = result['data']
        assert data_obj['transcript'] == "I completed my morning workout today. Felt great and energized."
        assert data_obj['confidence'] == 0.92
        assert data_obj['duration_sec'] == 45
        assert data_obj['language'] == 'en'
        assert data_obj['provider'] == 'assemblyai'
        assert 'audio_url' in data_obj  # Signed URL for playback
        assert data_obj['audio_url'].startswith('https://')


@pytest.mark.asyncio
async def test_transcribe_audio_with_goal_and_subtask_linking(
    client,
    test_audio_bytes,
    user_fixture,
    mock_assemblyai_transcription,
):
    """
    GIVEN: User uploads audio with goal_id and subtask_instance_id
    WHEN: POST /api/transcribe is called
    THEN: Capture is linked to goal and subtask
    """
    with patch('app.api.transcribe.get_stt_service') as mock_stt:
        mock_service = AsyncMock()
        mock_service.transcribe.return_value = mock_assemblyai_transcription
        mock_stt.return_value = mock_service

        files = {'file': ('voice_note.m4a', test_audio_bytes, 'audio/x-m4a')}
        data = {
            'local_date': '2025-12-22',
            'goal_id': str(uuid4()),
            'subtask_instance_id': str(uuid4()),
        }

        response = client.post(
            '/api/transcribe',
            files=files,
            data=data,
            headers={'Authorization': f'Bearer {user_fixture["token"]}'},
        )

        assert response.status_code == 200
        result = response.json()

        # Verify capture is linked
        assert result['data']['goal_id'] == data['goal_id']
        assert result['data']['subtask_instance_id'] == data['subtask_instance_id']


# ============================================================================
# AC-1: STT PROVIDER FALLBACK CHAIN
# ============================================================================


@pytest.mark.asyncio
async def test_transcribe_falls_back_to_whisper_when_assemblyai_fails(
    client,
    test_audio_bytes,
    user_fixture,
    mock_whisper_transcription,
):
    """
    GIVEN: AssemblyAI provider fails (HTTP 503)
    WHEN: POST /api/transcribe is called
    THEN: System automatically falls back to Whisper API (SILENT fallback)
          - User doesn't see error
          - Transcript is returned from Whisper
          - Provider is logged as 'whisper' in ai_runs
    """
    with patch('app.api.transcribe.get_stt_service') as mock_stt:
        # Mock STT service to simulate AssemblyAI failure → Whisper success
        mock_service = AsyncMock()
        mock_service.transcribe.side_effect = [
            Exception("AssemblyAI timeout"),  # First attempt fails
            mock_whisper_transcription,  # Second attempt succeeds with Whisper
        ]
        mock_stt.return_value = mock_service

        files = {'file': ('voice_note.m4a', test_audio_bytes, 'audio/x-m4a')}
        data = {'local_date': '2025-12-22'}

        response = client.post(
            '/api/transcribe',
            files=files,
            data=data,
            headers={'Authorization': f'Bearer {user_fixture["token"]}'},
        )

        # THEN: Success response with Whisper as provider
        assert response.status_code == 200
        result = response.json()
        assert result['data']['provider'] == 'whisper'
        assert result['data']['transcript'] is not None


@pytest.mark.asyncio
async def test_transcribe_stores_audio_only_when_all_providers_fail(
    client,
    test_audio_bytes,
    user_fixture,
):
    """
    GIVEN: Both AssemblyAI and Whisper providers fail
    WHEN: POST /api/transcribe is called
    THEN: Audio is stored without transcript
          - Returns HTTP 503 with error code STT_ALL_PROVIDERS_FAILED
          - Audio URL provided for playback
          - User can retry transcription later
    """
    with patch('app.api.transcribe.get_stt_service') as mock_stt:
        # Mock both providers failing
        mock_service = AsyncMock()
        mock_service.transcribe.side_effect = Exception("All providers failed")
        mock_stt.return_value = mock_service

        files = {'file': ('voice_note.m4a', test_audio_bytes, 'audio/x-m4a')}
        data = {'local_date': '2025-12-22'}

        response = client.post(
            '/api/transcribe',
            files=files,
            data=data,
            headers={'Authorization': f'Bearer {user_fixture["token"]}'},
        )

        # THEN: Error response with audio stored
        assert response.status_code == 503
        result = response.json()
        assert 'error' in result
        assert result['error']['code'] == 'STT_ALL_PROVIDERS_FAILED'
        assert result['error']['message'] == 'Transcription failed. Audio saved. Retry?'
        assert result['error']['retryable'] is True


# ============================================================================
# AC-5: RATE LIMITING
# ============================================================================


@pytest.mark.asyncio
async def test_transcribe_enforces_daily_limit_50_requests(
    client,
    test_audio_bytes,
    user_fixture,
):
    """
    GIVEN: User has reached daily limit (50 transcriptions/day)
    WHEN: POST /api/transcribe is called
    THEN: Returns HTTP 429 with error code STT_RATE_LIMIT_EXCEEDED
          - Includes retry_after timestamp (midnight next day)
          - Includes current usage count (50/50)
    """
    # TODO: Implement test after daily_aggregates.stt_request_count column added
    # For now, this test will fail until migration 20251221000003 is applied

    # Mock daily_aggregates to show limit reached
    with patch('app.api.transcribe.check_rate_limit') as mock_rate_limit:
        mock_rate_limit.return_value = False  # Rate limit exceeded

        files = {'file': ('voice_note.m4a', test_audio_bytes, 'audio/x-m4a')}
        data = {'local_date': '2025-12-22'}

        response = client.post(
            '/api/transcribe',
            files=files,
            data=data,
            headers={'Authorization': f'Bearer {user_fixture["token"]}'},
        )

        # THEN: Rate limit error
        assert response.status_code == 429
        result = response.json()
        assert 'error' in result
        assert result['error']['code'] == 'STT_RATE_LIMIT_EXCEEDED'
        assert result['error']['message'] == 'Daily transcription limit reached (50/50 requests)'
        assert result['error']['retryable'] is False
        assert 'retryAfter' in result['error']  # Timestamp for midnight reset


# ============================================================================
# AC-6: ERROR HANDLING
# ============================================================================


@pytest.mark.asyncio
async def test_transcribe_rejects_audio_too_long(
    client,
    user_fixture,
):
    """
    GIVEN: User uploads audio > 5 minutes (300 seconds)
    WHEN: POST /api/transcribe is called
    THEN: Returns HTTP 400 with error code AUDIO_TOO_LONG
          - Validation happens before upload
          - No storage or transcription costs incurred
    """
    # Mock audio file metadata to indicate 6 minutes duration
    long_audio = b"fake_audio_data_6_minutes"

    files = {'file': ('long_voice.m4a', long_audio, 'audio/x-m4a')}
    data = {'local_date': '2025-12-22', 'duration_sec': 360}  # 6 minutes

    response = client.post(
        '/api/transcribe',
        files=files,
        data=data,
        headers={'Authorization': f'Bearer {user_fixture["token"]}'},
    )

    # THEN: Validation error
    assert response.status_code == 400
    result = response.json()
    assert 'error' in result
    assert result['error']['code'] == 'AUDIO_TOO_LONG'
    assert result['error']['message'] == 'Audio too long (max 5 minutes)'
    assert result['error']['retryable'] is False


@pytest.mark.asyncio
async def test_transcribe_rejects_invalid_audio_format(
    client,
    user_fixture,
):
    """
    GIVEN: User uploads unsupported audio format (e.g., .avi, .txt)
    WHEN: POST /api/transcribe is called
    THEN: Returns HTTP 400 with error code INVALID_AUDIO_FORMAT
          - Only MP3, M4A, WAV supported
    """
    invalid_audio = b"not_real_audio_data"

    files = {'file': ('invalid.avi', invalid_audio, 'video/avi')}
    data = {'local_date': '2025-12-22'}

    response = client.post(
        '/api/transcribe',
        files=files,
        data=data,
        headers={'Authorization': f'Bearer {user_fixture["token"]}'},
    )

    # THEN: Format validation error
    assert response.status_code == 400
    result = response.json()
    assert 'error' in result
    assert result['error']['code'] == 'INVALID_AUDIO_FORMAT'
    assert result['error']['message'] == 'Only MP3, M4A, and WAV formats supported'
    assert result['error']['retryable'] is False


@pytest.mark.asyncio
async def test_transcribe_handles_upload_timeout(
    client,
    test_audio_bytes,
    user_fixture,
):
    """
    GIVEN: Audio upload to Supabase Storage times out (>30 seconds)
    WHEN: POST /api/transcribe is called
    THEN: Returns HTTP 504 with error code UPLOAD_TIMEOUT
          - User can retry upload
    """
    with patch('app.api.transcribe.upload_to_storage') as mock_upload:
        mock_upload.side_effect = TimeoutError("Upload timeout after 30s")

        files = {'file': ('voice_note.m4a', test_audio_bytes, 'audio/x-m4a')}
        data = {'local_date': '2025-12-22'}

        response = client.post(
            '/api/transcribe',
            files=files,
            data=data,
            headers={'Authorization': f'Bearer {user_fixture["token"]}'},
        )

        # THEN: Timeout error
        assert response.status_code == 504
        result = response.json()
        assert 'error' in result
        assert result['error']['code'] == 'UPLOAD_TIMEOUT'
        assert result['error']['message'] == 'Upload timed out. Check connection.'
        assert result['error']['retryable'] is True


# ============================================================================
# AC-2: AUDIO RETRIEVAL & DELETION
# ============================================================================


@pytest.mark.asyncio
async def test_get_audio_capture_with_signed_url(
    client,
    user_fixture,
):
    """
    GIVEN: User has uploaded audio capture
    WHEN: GET /api/captures/{capture_id} is called
    THEN: Returns capture with signed URL (1-hour expiration)
          - URL is time-limited for security
          - Includes transcript if available
    """
    # TODO: Create audio capture in test database first
    # For now, this test will fail until capture record exists

    capture_id = str(uuid4())

    response = client.get(
        f'/api/captures/{capture_id}',
        headers={'Authorization': f'Bearer {user_fixture["token"]}'},
    )

    # THEN: Success response with signed URL
    assert response.status_code == 200
    result = response.json()
    assert 'data' in result
    assert result['data']['id'] == capture_id
    assert result['data']['type'] == 'audio'
    assert 'signed_url' in result['data']
    assert result['data']['signed_url'].startswith('https://')
    assert 'content_text' in result['data']  # Transcript


@pytest.mark.asyncio
async def test_delete_audio_capture_cascades_cleanup(
    client,
    user_fixture,
):
    """
    GIVEN: User has uploaded audio capture
    WHEN: DELETE /api/captures/{capture_id} is called
    THEN: Deletes from both Storage and Database
          - Verifies user ownership before deletion (RLS)
          - Returns success confirmation
    """
    # TODO: Create audio capture in test database first
    # For now, this test will fail until capture record exists

    capture_id = str(uuid4())

    response = client.delete(
        f'/api/captures/{capture_id}',
        headers={'Authorization': f'Bearer {user_fixture["token"]}'},
    )

    # THEN: Successful deletion
    assert response.status_code == 200
    result = response.json()
    assert result['data']['deleted'] is True


@pytest.mark.asyncio
async def test_re_transcribe_capture_with_different_provider(
    client,
    user_fixture,
    mock_whisper_transcription,
):
    """
    GIVEN: User has audio capture with failed/low-confidence transcript
    WHEN: POST /api/captures/{capture_id}/re-transcribe is called
    THEN: Re-runs transcription with optional provider selection
          - First retry is FREE (doesn't count against daily limit)
          - Updates capture.content_text with new transcript
    """
    # TODO: Create audio capture in test database first
    # For now, this test will fail until capture record exists

    capture_id = str(uuid4())

    with patch('app.api.transcribe.get_stt_service') as mock_stt:
        mock_service = AsyncMock()
        mock_service.transcribe.return_value = mock_whisper_transcription
        mock_stt.return_value = mock_service

        response = client.post(
            f'/api/captures/{capture_id}/re-transcribe',
            json={'provider': 'whisper'},  # Explicitly request Whisper
            headers={'Authorization': f'Bearer {user_fixture["token"]}'},
        )

        # THEN: Updated transcript
        assert response.status_code == 200
        result = response.json()
        assert result['data']['content_text'] == mock_whisper_transcription.transcript
        assert result['data']['provider'] == 'whisper'


# ============================================================================
# RLS SECURITY: CROSS-USER ACCESS PREVENTION
# ============================================================================


@pytest.mark.asyncio
async def test_transcribe_prevents_cross_user_audio_access(
    client,
    user_fixture,
):
    """
    GIVEN: User A has uploaded audio capture
    WHEN: User B tries to access User A's capture
    THEN: Returns HTTP 404 (RLS policies prevent access)
          - Capture exists but is invisible to other users
    """
    # TODO: Create captures for two different users
    # For now, this test will fail until RLS policies are verified

    user_a_capture_id = str(uuid4())
    user_b_token = "fake_user_b_token"  # Different user

    response = client.get(
        f'/api/captures/{user_a_capture_id}',
        headers={'Authorization': f'Bearer {user_b_token}'},
    )

    # THEN: Not found (RLS hiding User A's data from User B)
    assert response.status_code == 404


# ============================================================================
# COST TRACKING
# ============================================================================


@pytest.mark.asyncio
async def test_transcribe_logs_cost_to_ai_runs_table(
    client,
    test_audio_bytes,
    user_fixture,
    mock_assemblyai_transcription,
):
    """
    GIVEN: User transcribes audio
    WHEN: POST /api/transcribe completes successfully
    THEN: Logs transcription details to ai_runs table
          - Provider: 'assemblyai' or 'whisper'
          - Audio duration in seconds
          - Cost in USD
          - Confidence score
          - Timestamps
    """
    with patch('app.api.transcribe.get_stt_service') as mock_stt:
        mock_service = AsyncMock()
        mock_service.transcribe.return_value = mock_assemblyai_transcription
        mock_stt.return_value = mock_service

        files = {'file': ('voice_note.m4a', test_audio_bytes, 'audio/x-m4a')}
        data = {'local_date': '2025-12-22'}

        response = client.post(
            '/api/transcribe',
            files=files,
            data=data,
            headers={'Authorization': f'Bearer {user_fixture["token"]}'},
        )

        assert response.status_code == 200

        # TODO: Verify ai_runs table contains log entry
        # Query ai_runs where user_id = user_fixture['id']
        # Assert provider, audio_duration_sec, cost_usd, confidence_score

"""
Unit Tests for STT Service Provider Abstraction
Story: 0.11 - Voice/Speech-to-Text Infrastructure

Tests cover:
- AC-1: STTProvider abstract class
- AC-1: AssemblyAIProvider implementation
- AC-1: WhisperProvider implementation
- AC-1: Fallback chain logic (AssemblyAI → Whisper → Store only)
- AC-1: Retry logic (3 attempts, exponential backoff)
- Cost calculation for both providers
"""

from unittest.mock import AsyncMock, patch

import pytest

from app.services.stt.base import STTProvider, TranscriptionResult

# ============================================================================
# STTProvider ABSTRACT CLASS TESTS
# ============================================================================


def test_stt_provider_abstract_class_cannot_be_instantiated():
    """
    GIVEN: STTProvider is an abstract base class
    WHEN: Attempt to instantiate STTProvider directly
    THEN: Raises TypeError (abstract methods not implemented)
    """
    with pytest.raises(TypeError):
        STTProvider()


def test_stt_provider_requires_transcribe_method():
    """
    GIVEN: Custom STT provider inherits from STTProvider
    WHEN: transcribe() method is not implemented
    THEN: Cannot instantiate provider (abstract method error)
    """

    class IncompleteProvider(STTProvider):
        def get_cost(self, duration_seconds: int) -> float:
            return 0.0

        def is_available(self) -> bool:
            return True

    with pytest.raises(TypeError):
        IncompleteProvider()


def test_stt_provider_requires_all_abstract_methods():
    """
    GIVEN: Custom STT provider inherits from STTProvider
    WHEN: All abstract methods are implemented
    THEN: Provider can be instantiated successfully
    """

    class CompleteProvider(STTProvider):
        def get_provider_name(self) -> str:
            return "test"

        async def transcribe(self, audio_bytes: bytes, language: str = "en") -> TranscriptionResult:
            return TranscriptionResult(
                transcript="Test",
                confidence=1.0,
                duration_sec=10,
                language="en",
                provider="test",
                cost_usd=0.001,
            )

        def get_cost(self, duration_seconds: int) -> float:
            return duration_seconds * 0.0001

        def is_available(self) -> bool:
            return True

    # Should not raise error
    provider = CompleteProvider()
    assert provider is not None
    assert provider.is_available() is True


# ============================================================================
# AssemblyAIProvider TESTS
# ============================================================================


@pytest.mark.asyncio
async def test_assemblyai_provider_transcribe_success():
    """
    GIVEN: AssemblyAI API is available
    WHEN: transcribe() is called with valid audio
    THEN: Returns TranscriptionResult with transcript and confidence score
          - Uploads audio to AssemblyAI
          - Polls for completion
          - Parses response
          - Calculates cost ($0.0025/min)
    """
    from unittest.mock import MagicMock

    from app.services.stt.assemblyai_provider import AssemblyAIProvider

    with (
        patch.dict("os.environ", {"ASSEMBLYAI_API_KEY": "test-key"}),
        patch("app.services.stt.assemblyai_provider.aai") as mock_aai,
        patch("asyncio.to_thread") as mock_to_thread,
    ):
        # Mock AssemblyAI exception types as proper exceptions
        class MockTranscriptError(Exception):
            pass

        mock_aai.types.TranscriptError = MockTranscriptError

        # Mock AssemblyAI upload + poll response (regular Mock, not AsyncMock)
        mock_word = MagicMock()
        mock_word.confidence = 0.92

        mock_transcript = MagicMock()
        mock_transcript.text = "I completed my workout today."
        mock_transcript.audio_duration = 45000  # milliseconds
        mock_transcript.status = "completed"
        mock_transcript.words = [mock_word for _ in range(5)]

        # Mock asyncio.to_thread to return mock_transcript directly
        mock_to_thread.return_value = mock_transcript

        mock_aai.Transcriber.return_value = MagicMock()
        mock_aai.TranscriptStatus.error = "error"
        mock_aai.TranscriptionConfig = MagicMock()

        provider = AssemblyAIProvider()
        audio_bytes = b"fake_audio_data"

        result = await provider.transcribe(audio_bytes, language="en")

        # Assertions
        assert isinstance(result, TranscriptionResult)
        assert result.transcript == "I completed my workout today."
        assert result.confidence == pytest.approx(0.92, rel=1e-6)  # Floating point comparison
        assert result.duration_sec == 45
        assert result.provider == "assemblyai"
        assert result.language == "en"
        assert result.cost_usd == 0.0019  # 45s * $0.00004167 = 0.0019 (rounded to 4 decimals)


@pytest.mark.asyncio
async def test_assemblyai_provider_handles_timeout():
    """
    GIVEN: AssemblyAI API times out (>30 seconds)
    WHEN: transcribe() is called
    THEN: Raises STTProviderError for fallback handling
    """
    from unittest.mock import MagicMock

    from app.services.stt.assemblyai_provider import AssemblyAIProvider
    from app.services.stt.base import STTProviderError

    with (
        patch.dict("os.environ", {"ASSEMBLYAI_API_KEY": "test-key"}),
        patch("app.services.stt.assemblyai_provider.aai") as mock_aai,
        patch("asyncio.to_thread") as mock_to_thread,
    ):
        # Mock exception types
        class MockTranscriptError(Exception):
            pass

        mock_aai.types.TranscriptError = MockTranscriptError

        # Mock asyncio.to_thread to raise timeout
        mock_to_thread.side_effect = TimeoutError("API timeout")

        mock_aai.Transcriber.return_value = MagicMock()
        mock_aai.TranscriptionConfig = MagicMock()

        provider = AssemblyAIProvider()
        audio_bytes = b"fake_audio_data"

        with pytest.raises(STTProviderError):
            await provider.transcribe(audio_bytes)


def test_assemblyai_provider_cost_calculation():
    """
    GIVEN: Audio duration in seconds
    WHEN: get_cost() is called
    THEN: Returns cost in USD ($0.0025 per minute)
    """
    from app.services.stt.assemblyai_provider import AssemblyAIProvider

    with (
        patch.dict("os.environ", {"ASSEMBLYAI_API_KEY": "test-key"}),
        patch("app.services.stt.assemblyai_provider.aai"),
    ):
        provider = AssemblyAIProvider()

    # 60 seconds = 1 minute = $0.0025
    assert provider.get_cost(60) == 0.0025

    # 30 seconds = 0.5 minutes = $0.0013 (rounded to 4 decimal places)
    assert provider.get_cost(30) == 0.0013

    # 300 seconds = 5 minutes = $0.0125
    assert provider.get_cost(300) == 0.0125


def test_assemblyai_provider_is_available_checks_api_key():
    """
    GIVEN: AssemblyAI API key environment variable
    WHEN: is_available() is called
    THEN: Returns True if API key present, raises error if missing
    """
    from app.services.stt.assemblyai_provider import AssemblyAIProvider
    from app.services.stt.base import STTProviderError

    # Test with API key present
    with patch.dict("os.environ", {"ASSEMBLYAI_API_KEY": "fake_key"}):
        provider = AssemblyAIProvider()
        assert provider.is_available() is True

    # Test with API key missing - should raise error during __init__
    with patch.dict("os.environ", {}, clear=True):
        with pytest.raises(STTProviderError, match="ASSEMBLYAI_API_KEY not configured"):
            provider = AssemblyAIProvider()


# ============================================================================
# WhisperProvider TESTS
# ============================================================================


@pytest.mark.asyncio
async def test_whisper_provider_transcribe_success():
    """
    GIVEN: OpenAI Whisper API is available
    WHEN: transcribe() is called with valid audio
    THEN: Returns TranscriptionResult with transcript
          - Uses whisper-1 model
          - Direct transcription (no polling)
          - Detects language automatically
          - Calculates cost ($0.006/min)
    """
    from unittest.mock import MagicMock

    from app.services.stt.whisper_provider import WhisperProvider

    with (
        patch.dict("os.environ", {"OPENAI_API_KEY": "test-key"}),
        patch("app.services.stt.whisper_provider.AsyncOpenAI") as mock_openai_class,
    ):
        # Mock OpenAI Whisper response (regular Mock, not AsyncMock)
        mock_response = MagicMock()
        mock_response.text = "I completed my workout today."
        mock_response.language = "en"
        mock_response.duration = 45

        # Client API is async
        mock_client = AsyncMock()
        mock_client.audio.transcriptions.create.return_value = mock_response
        mock_openai_class.return_value = mock_client

        provider = WhisperProvider()
        audio_bytes = b"fake_audio_data"

        result = await provider.transcribe(audio_bytes, language="en")

        # Assertions
        assert isinstance(result, TranscriptionResult)
        assert result.transcript == "I completed my workout today."
        assert result.confidence == 0.9  # Whisper defaults to 0.9 (no confidence scores provided)
        assert result.duration_sec == 45
        assert result.provider == "whisper"
        assert result.language == "en"
        assert result.cost_usd == pytest.approx(0.0045, rel=1e-6)  # 45s * $0.006/min / 60


def test_whisper_provider_cost_calculation():
    """
    GIVEN: Audio duration in seconds
    WHEN: get_cost() is called
    THEN: Returns cost in USD ($0.006 per minute)
    """
    from app.services.stt.whisper_provider import WhisperProvider

    with patch.dict("os.environ", {"OPENAI_API_KEY": "test-key"}):
        provider = WhisperProvider()

        # 60 seconds = 1 minute = $0.006
        assert provider.get_cost(60) == 0.006

        # 30 seconds = 0.5 minutes = $0.003
        assert provider.get_cost(30) == pytest.approx(0.003, rel=1e-6)

        # 300 seconds = 5 minutes = $0.03
        assert provider.get_cost(300) == 0.03


def test_whisper_provider_is_available_checks_api_key():
    """
    GIVEN: OpenAI API key environment variable
    WHEN: is_available() is called
    THEN: Returns True if API key present, raises error if missing
    """
    from app.services.stt.base import STTProviderError
    from app.services.stt.whisper_provider import WhisperProvider

    # Test with API key present
    with patch.dict("os.environ", {"OPENAI_API_KEY": "fake_key"}):
        provider = WhisperProvider()
        assert provider.is_available() is True

    # Test with API key missing - should raise error during __init__
    with patch.dict("os.environ", {}, clear=True):
        with pytest.raises(STTProviderError, match="OPENAI_API_KEY not configured"):
            provider = WhisperProvider()


# ============================================================================
# FALLBACK CHAIN LOGIC TESTS
# ============================================================================


@pytest.mark.asyncio
async def test_stt_service_uses_assemblyai_as_primary():
    """
    GIVEN: Both AssemblyAI and Whisper are available
    WHEN: STT service is called
    THEN: Attempts AssemblyAI first (primary provider)
    """
    from app.services.stt.stt_service import STTService

    with patch("app.services.stt.stt_service.AssemblyAIProvider") as mock_assemblyai:
        mock_provider = AsyncMock()
        mock_provider.is_available.return_value = True
        mock_provider.transcribe.return_value = TranscriptionResult(
            transcript="Test",
            confidence=0.9,
            duration_sec=10,
            language="en",
            provider="assemblyai",
            cost_usd=0.0004,
        )
        mock_assemblyai.return_value = mock_provider

        service = STTService()
        audio_bytes = b"fake_audio"

        result = await service.transcribe(audio_bytes)

        # AssemblyAI should be called first
        assert result.provider == "assemblyai"
        mock_provider.transcribe.assert_called_once()


@pytest.mark.asyncio
async def test_stt_service_falls_back_to_whisper_on_assemblyai_failure():
    """
    GIVEN: AssemblyAI fails (timeout or 5xx error)
    WHEN: STT service is called
    THEN: Automatically retries with Whisper (SILENT fallback)
          - User doesn't see error from AssemblyAI
          - Returns successful Whisper result
    """
    from app.services.stt.base import STTProviderError
    from app.services.stt.stt_service import STTService

    with (
        patch.dict("os.environ", {"ASSEMBLYAI_API_KEY": "test-key", "OPENAI_API_KEY": "test-key"}),
        patch("app.services.stt.stt_service.AssemblyAIProvider") as mock_assemblyai,
        patch("app.services.stt.stt_service.WhisperProvider") as mock_whisper,
    ):
        # AssemblyAI fails with retryable error
        mock_aai = AsyncMock()
        mock_aai.is_available.return_value = True
        mock_aai.transcribe.side_effect = STTProviderError(
            provider="assemblyai", message="AssemblyAI timeout", retryable=True
        )
        mock_assemblyai.return_value = mock_aai

        # Whisper succeeds
        mock_w = AsyncMock()
        mock_w.is_available.return_value = True
        mock_w.transcribe.return_value = TranscriptionResult(
            transcript="Test",
            confidence=1.0,
            duration_sec=10,
            language="en",
            provider="whisper",
            cost_usd=0.001,
        )
        mock_whisper.return_value = mock_w

        service = STTService()
        audio_bytes = b"fake_audio"

        result = await service.transcribe(audio_bytes)

        # Should fallback to Whisper
        assert result is not None
        assert result.provider == "whisper"
        # AssemblyAI tried 3 times (max_retries default)
        assert mock_aai.transcribe.call_count == 3
        mock_w.transcribe.assert_called_once()  # Fell back to Whisper


@pytest.mark.asyncio
async def test_stt_service_stores_audio_only_when_all_providers_fail():
    """
    GIVEN: Both AssemblyAI and Whisper fail
    WHEN: STT service is called
    THEN: Returns None for API layer to handle
          - API will store audio without transcript
          - User can retry later
    """
    from app.services.stt.base import STTProviderError
    from app.services.stt.stt_service import STTService

    with (
        patch.dict("os.environ", {"ASSEMBLYAI_API_KEY": "test-key", "OPENAI_API_KEY": "test-key"}),
        patch("app.services.stt.stt_service.AssemblyAIProvider") as mock_assemblyai,
        patch("app.services.stt.stt_service.WhisperProvider") as mock_whisper,
    ):
        # Both providers fail with retryable errors
        mock_aai = AsyncMock()
        mock_aai.is_available.return_value = True
        mock_aai.transcribe.side_effect = STTProviderError(
            provider="assemblyai", message="AssemblyAI error", retryable=True
        )
        mock_assemblyai.return_value = mock_aai

        mock_w = AsyncMock()
        mock_w.is_available.return_value = True
        mock_w.transcribe.side_effect = STTProviderError(
            provider="whisper", message="Whisper error", retryable=True
        )
        mock_whisper.return_value = mock_w

        service = STTService()
        audio_bytes = b"fake_audio"

        result = await service.transcribe(audio_bytes)

        # Should return None when all providers fail
        assert result is None
        # Both providers should have been tried with retries
        assert mock_aai.transcribe.call_count == 3  # 3 retries
        assert mock_w.transcribe.call_count == 3  # 3 retries


# ============================================================================
# RETRY LOGIC TESTS
# ============================================================================


@pytest.mark.asyncio
async def test_stt_service_retries_transient_failures_3_times():
    """
    GIVEN: AssemblyAI returns transient error (503)
    WHEN: STT service is called
    THEN: Retries 3 times with exponential backoff (1s, 2s, 4s)
          - Only retries on 5xx errors (not 4xx)
          - After 3 failures, returns None (no fallback provider)
    """
    from app.services.stt.base import STTProviderError
    from app.services.stt.stt_service import STTService

    with (
        patch.dict("os.environ", {"ASSEMBLYAI_API_KEY": "test-key"}),
        patch("app.services.stt.stt_service.AssemblyAIProvider") as mock_assemblyai,
        patch("asyncio.sleep") as mock_sleep,
    ):
        # Mock AssemblyAI to fail 3 times with retryable error
        mock_aai = AsyncMock()
        mock_aai.is_available.return_value = True
        mock_aai.transcribe.side_effect = STTProviderError(
            provider="assemblyai", message="503 Service Unavailable", retryable=True
        )
        mock_assemblyai.return_value = mock_aai

        service = STTService()
        audio_bytes = b"fake_audio"

        result = await service.transcribe(audio_bytes)

        # Should return None after all retries exhausted
        assert result is None

        # Should have retried 3 times
        assert mock_aai.transcribe.call_count == 3

        # Should have used exponential backoff (1s, 2s) - only 2 sleeps for 3 attempts
        assert mock_sleep.call_count == 2
        mock_sleep.assert_any_call(1)
        mock_sleep.assert_any_call(2)


@pytest.mark.asyncio
async def test_stt_service_does_not_retry_client_errors():
    """
    GIVEN: AssemblyAI returns 4xx client error (invalid audio format)
    WHEN: STT service is called
    THEN: Does NOT retry (client error not transient)
          - Immediately skips to next provider or returns None
    """
    from app.services.stt.base import STTProviderError
    from app.services.stt.stt_service import STTService

    with (
        patch.dict("os.environ", {"ASSEMBLYAI_API_KEY": "test-key"}),
        patch("app.services.stt.stt_service.AssemblyAIProvider") as mock_assemblyai,
    ):
        mock_aai = AsyncMock()
        mock_aai.is_available.return_value = True
        mock_aai.transcribe.side_effect = STTProviderError(
            provider="assemblyai", message="400 Bad Request: Invalid audio format", retryable=False
        )
        mock_assemblyai.return_value = mock_aai

        service = STTService()
        audio_bytes = b"fake_audio"

        result = await service.transcribe(audio_bytes)

        # Should return None (no fallback provider configured)
        assert result is None

        # Should NOT retry (only 1 attempt)
        assert mock_aai.transcribe.call_count == 1

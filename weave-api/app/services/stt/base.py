"""
Base STT Provider Interface

Defines abstract base class for all Speech-to-Text providers.
All providers must implement: transcribe(), get_cost(), is_available()

Story: 0.11 - Voice/Speech-to-Text Infrastructure
Story: 1.5.3 - Unified AI Services Standardization
Pattern: Follows app/services/ai/base.py structure for consistency

Story 1.5.3: STTProvider now inherits from AIProviderBase for unified
cost tracking and rate limiting across text/image/audio modalities.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional

from app.services.ai_provider_base import AIProviderBase as _AIProviderBase


@dataclass
class TranscriptionResult:
    """
    Standardized transcription response format across all STT providers.

    Attributes:
        transcript: The transcribed text from audio
        confidence: Confidence score (0.0-1.0), higher = more accurate
        duration_sec: Audio duration in seconds
        language: Detected or specified language code (e.g., 'en', 'es')
        provider: Provider name ('assemblyai', 'whisper', 'manual')
        cost_usd: Estimated cost in USD for this transcription
        audio_url: Optional signed URL to the audio file
        run_id: Database ID of the ai_runs record (if persisted)
    """
    transcript: str
    confidence: float
    duration_sec: int
    language: str
    provider: str
    cost_usd: float
    audio_url: Optional[str] = None
    run_id: Optional[str] = None


class STTProviderError(Exception):
    """
    Base exception for STT provider errors.

    Attributes:
        message: Error description
        provider: Provider that raised the error
        retryable: Whether this error can be retried with another provider
        error_code: Standardized error code for client handling
        original_error: Original exception that caused this error
    """
    def __init__(
        self,
        message: str,
        provider: str,
        retryable: bool = True,
        error_code: str = "STT_ERROR",
        original_error: Optional[Exception] = None
    ):
        self.message = message
        self.provider = provider
        self.retryable = retryable
        self.error_code = error_code
        self.original_error = original_error
        super().__init__(self.message)


class STTProvider(_AIProviderBase, ABC):
    """
    Abstract base class for Speech-to-Text providers.

    Story 1.5.3: Now inherits from AIProviderBase for unified cost tracking
    and rate limiting across all AI modalities (text/image/audio).

    All providers (AssemblyAI, Whisper) must implement these methods
    to ensure consistent interface for the orchestrator.

    Fallback chain: AssemblyAI → Whisper → Store audio only (manual)
    
    Inherited from AIProviderBase:
    - log_to_ai_runs() - Cost tracking
    - check_rate_limit() - Rate limiting
    - get_provider_name() - Provider identification (must implement)
    - is_available() - Availability check (must implement)
    """

    @abstractmethod
    async def transcribe(
        self,
        audio_file: bytes,
        language: str = 'en',
        **kwargs
    ) -> TranscriptionResult:
        """
        Transcribe audio file to text.

        Args:
            audio_file: Audio file bytes (MP3, M4A, WAV, FLAC, OGG)
            language: Language code (default: 'en')
            **kwargs: Additional provider-specific parameters

        Returns:
            TranscriptionResult with transcript, confidence, cost

        Raises:
            STTProviderError: If transcription fails (retryable or not)
        """
        pass

    @abstractmethod
    def get_cost(self, duration_seconds: int) -> float:
        """
        Calculate USD cost for transcribing audio of given duration.

        Uses provider-specific pricing:
        - AssemblyAI: $0.0025/minute = $0.00004167/second
        - Whisper: $0.006/minute = $0.0001/second

        Args:
            duration_seconds: Audio duration in seconds

        Returns:
            Estimated cost in USD (accurate to 4 decimal places)
        """
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """
        Check if provider is available (API key configured, service reachable).

        Used by orchestrator to determine which providers are viable.
        Quick check (doesn't make API calls).

        Returns:
            True if provider can be used, False otherwise
        """
        pass

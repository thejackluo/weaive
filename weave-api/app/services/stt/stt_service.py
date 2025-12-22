"""
STT Service Orchestrator

Coordinates fallback chain between STT providers:
1. AssemblyAI (primary) - 58% cheaper
2. Whisper (fallback) - More expensive but reliable
3. Store audio only (no transcript) - Last resort

Story: 0.11 - Voice/Speech-to-Text Infrastructure
"""

import asyncio
from typing import Optional

from .assemblyai_provider import AssemblyAIProvider
from .base import STTProvider, STTProviderError, TranscriptionResult
from .whisper_provider import WhisperProvider


class STTService:
    """
    STT orchestration service with provider fallback chain.

    Fallback Logic:
    - Try AssemblyAI (primary, cheaper)
    - On failure → Try Whisper (fallback, reliable)
    - On failure → Return None (store audio without transcript)

    Retry Logic:
    - 3 attempts per provider with exponential backoff (1s, 2s, 4s)
    - Only retry on transient errors (timeouts, 5xx)
    - Don't retry on client errors (4xx)
    """

    def __init__(
        self,
        assemblyai_api_key: Optional[str] = None,
        openai_api_key: Optional[str] = None
    ):
        """
        Initialize STT service with providers.

        Args:
            assemblyai_api_key: AssemblyAI API key (from env if None)
            openai_api_key: OpenAI API key (from env if None)
        """
        import logging
        logger = logging.getLogger(__name__)

        # Initialize providers
        try:
            self.assemblyai = AssemblyAIProvider(api_key=assemblyai_api_key)
            logger.info("✅ AssemblyAI provider initialized")
        except STTProviderError as e:
            logger.warning(f"⚠️  AssemblyAI provider unavailable: {e.message}")
            self.assemblyai = None
        except Exception as e:
            logger.error(f"❌ AssemblyAI initialization error: {str(e)}")
            self.assemblyai = None

        try:
            self.whisper = WhisperProvider(api_key=openai_api_key)
            logger.info("✅ Whisper provider initialized")
        except STTProviderError as e:
            logger.warning(f"⚠️  Whisper provider unavailable: {e.message}")
            self.whisper = None
        except Exception as e:
            logger.error(f"❌ Whisper initialization error: {str(e)}")
            self.whisper = None

        # Build provider chain
        self.providers = []
        if self.assemblyai and self.assemblyai.is_available():
            self.providers.append(self.assemblyai)
            logger.info("Added AssemblyAI to provider chain")
        if self.whisper and self.whisper.is_available():
            self.providers.append(self.whisper)
            logger.info("Added Whisper to provider chain")

        if not self.providers:
            logger.error("❌ No STT providers available! Check API keys.")

    async def transcribe(
        self,
        audio_file: bytes,
        language: str = 'en',
        max_retries: int = 3,
        **kwargs
    ) -> Optional[TranscriptionResult]:
        """
        Transcribe audio with fallback chain and retry logic.

        Process:
        1. Try primary provider (AssemblyAI) with retries
        2. On failure → Try fallback provider (Whisper) with retries
        3. On failure → Return None (store audio without transcript)

        Args:
            audio_file: Audio bytes (MP3, M4A, WAV, FLAC, OGG)
            language: Language code (default: 'en')
            max_retries: Max retry attempts per provider (default: 3)
            **kwargs: Additional provider-specific options

        Returns:
            TranscriptionResult on success, None if all providers fail
        """
        if not self.providers:
            # No providers available
            return None

        last_error = None

        import logging
        logger = logging.getLogger(__name__)

        # Try each provider in chain
        for provider in self.providers:
            provider_name = provider.__class__.__name__
            logger.info(f"Attempting transcription with {provider_name}")

            try:
                result = await self._transcribe_with_retry(
                    provider=provider,
                    audio_file=audio_file,
                    language=language,
                    max_retries=max_retries,
                    **kwargs
                )
                logger.info(f"✅ Transcription successful with {provider_name}")
                return result

            except STTProviderError as e:
                last_error = e
                logger.error(f"❌ {provider_name} failed: {e.message} (retryable={e.retryable})")
                # If error is not retryable, skip to next provider
                if not e.retryable:
                    continue
                # Otherwise, try next provider in fallback chain

        # All providers failed
        logger.error(f"❌ All providers failed. Last error: {last_error}")
        return None

    async def _transcribe_with_retry(
        self,
        provider: STTProvider,
        audio_file: bytes,
        language: str,
        max_retries: int,
        **kwargs
    ) -> TranscriptionResult:
        """
        Transcribe with exponential backoff retry logic.

        Retry delays: 1s, 2s, 4s (exponential backoff)

        Args:
            provider: STT provider to use
            audio_file: Audio bytes
            language: Language code
            max_retries: Max retry attempts
            **kwargs: Additional options

        Returns:
            TranscriptionResult on success

        Raises:
            STTProviderError: If all retries fail
        """
        last_error = None

        for attempt in range(max_retries):
            try:
                result = await provider.transcribe(
                    audio_file=audio_file,
                    language=language,
                    **kwargs
                )
                return result

            except STTProviderError as e:
                last_error = e

                # Don't retry if error is not retryable
                if not e.retryable:
                    raise

                # Don't retry on last attempt
                if attempt == max_retries - 1:
                    raise

                # Exponential backoff: 1s, 2s, 4s
                delay = 2 ** attempt
                await asyncio.sleep(delay)

        # Should never reach here, but raise last error if we do
        if last_error:
            raise last_error

        raise STTProviderError(
            message="Transcription failed after all retries",
            provider=provider.__class__.__name__,
            retryable=False,
            error_code="STT_ALL_PROVIDERS_FAILED"
        )

    def get_provider_status(self) -> dict:
        """
        Get availability status of all providers.

        Returns:
            Dict with provider names as keys, availability as values
        """
        return {
            "assemblyai": self.assemblyai.is_available() if self.assemblyai else False,
            "whisper": self.whisper.is_available() if self.whisper else False,
        }

    def estimate_cost(self, duration_seconds: int, provider: str = "assemblyai") -> float:
        """
        Estimate cost for transcribing audio of given duration.

        Args:
            duration_seconds: Audio duration in seconds
            provider: Provider to use for cost estimate (default: assemblyai)

        Returns:
            Estimated cost in USD
        """
        if provider == "assemblyai" and self.assemblyai:
            return self.assemblyai.get_cost(duration_seconds)
        elif provider == "whisper" and self.whisper:
            return self.whisper.get_cost(duration_seconds)
        else:
            # Default to AssemblyAI pricing if provider not found
            return round(duration_seconds * 0.00004167, 4)

"""
OpenAI Whisper STT Provider

Fallback Speech-to-Text provider using OpenAI Whisper API.
Cost: $0.006/minute = $0.0001/second

Story: 0.11 - Voice/Speech-to-Text Infrastructure
API Docs: https://platform.openai.com/docs/guides/speech-to-text
"""

import io
import os
from typing import Optional

from openai import AsyncOpenAI

from .base import STTProvider, STTProviderError, TranscriptionResult


class WhisperProvider(STTProvider):
    """
    OpenAI Whisper implementation of STT provider.

    Features:
    - Multilingual support (99 languages)
    - Automatic language detection
    - High accuracy across languages
    - Direct transcription (no polling)

    Rate Limits: 50 RPM (requests per minute)
    Pricing: $0.006/minute (2.4x more expensive than AssemblyAI)
    Max File Size: 25MB
    """

    def __init__(self, api_key: Optional[str] = None, db=None):
        """
        Initialize Whisper provider.

        Args:
            api_key: OpenAI API key. If None, reads from OPENAI_API_KEY env var.
            db: Supabase client for cost tracking (optional, for AIProviderBase)

        Raises:
            STTProviderError: If API key is not configured
        """
        super().__init__(db)  # Initialize AIProviderBase
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise STTProviderError(
                message="OPENAI_API_KEY not configured",
                provider="whisper",
                retryable=False,
                error_code="OPENAI_API_KEY_MISSING",
            )

        # Initialize async OpenAI client
        self.client = AsyncOpenAI(api_key=self.api_key)

    def get_provider_name(self) -> str:
        """Return provider identifier for logging."""
        return "whisper"

    def is_available(self) -> bool:
        """Check if provider is configured and available."""
        return self.api_key is not None and len(self.api_key) > 0

    async def transcribe(
        self, audio_file: bytes, language: str = "en", **kwargs
    ) -> TranscriptionResult:
        """
        Transcribe audio using OpenAI Whisper API.

        Process:
        1. Upload audio directly to Whisper API
        2. Receive transcription immediately (no polling)
        3. Parse response with language detection

        Args:
            audio_file: Audio bytes (MP3, M4A, WAV, FLAC, OGG)
            language: Language code (default: 'en', optional for Whisper)
            **kwargs: Additional options (prompt, temperature, etc.)

        Returns:
            TranscriptionResult with transcript and language detection

        Raises:
            STTProviderError: If transcription fails
        """
        try:
            import logging

            logger = logging.getLogger(__name__)

            # Log audio file metadata
            logger.info(f"[WHISPER] Received audio bytes: {len(audio_file)} bytes")

            # Check file magic bytes to detect actual format
            magic_bytes = audio_file[:12] if len(audio_file) >= 12 else audio_file
            logger.info(f"[WHISPER] File magic bytes (hex): {magic_bytes.hex()}")

            # Create file-like object from bytes
            # Note: audio_file is now MP3 or WAV format after conversion in transcribe.py
            # Use WAV extension as it's the guaranteed fallback format
            audio_buffer = io.BytesIO(audio_file)
            audio_buffer.name = "audio.wav"  # Whisper needs a filename with extension

            # Call Whisper API
            # Note: Whisper doesn't provide confidence scores, so we default to 0.9
            transcript_response = await self.client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_buffer,
                language=language
                if language != "en"
                else None,  # Optional: let Whisper detect if not English
                response_format="verbose_json",  # Get duration and language info
            )

            # Extract transcript and metadata
            transcript_text = transcript_response.text
            detected_language = transcript_response.language or language
            duration_sec = (
                int(transcript_response.duration) if hasattr(transcript_response, "duration") else 0
            )

            # Calculate cost
            cost = self.get_cost(duration_sec)

            return TranscriptionResult(
                transcript=transcript_text,
                confidence=0.9,  # Whisper doesn't provide confidence, default to high
                duration_sec=duration_sec,
                language=detected_language,
                provider="whisper",
                cost_usd=cost,
            )

        except Exception as e:
            # OpenAI SDK raises generic exceptions
            # Determine if retryable based on error message
            error_str = str(e).lower()
            retryable = any(
                keyword in error_str
                for keyword in ["timeout", "network", "503", "504", "502", "500"]
            )

            raise STTProviderError(
                message=f"Whisper API error: {str(e)}",
                provider="whisper",
                retryable=retryable,
                error_code="STT_ALL_PROVIDERS_FAILED"
                if not retryable
                else "STT_PRIMARY_UNAVAILABLE",
                original_error=e,
            )

    def get_cost(self, duration_seconds: int) -> float:
        """
        Calculate USD cost for Whisper transcription.

        Pricing: $0.006/minute = $0.0001/second

        Args:
            duration_seconds: Audio duration in seconds

        Returns:
            Cost in USD (accurate to 4 decimal places)
        """
        cost_per_second = 0.0001  # $0.006/minute
        return round(duration_seconds * cost_per_second, 4)

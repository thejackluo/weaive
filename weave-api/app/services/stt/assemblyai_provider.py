"""
AssemblyAI STT Provider

Primary Speech-to-Text provider using AssemblyAI API.
Cost: $0.15/hour = $0.0025/minute = $0.00004167/second

Story: 0.11 - Voice/Speech-to-Text Infrastructure
API Docs: https://www.assemblyai.com/docs
"""

import asyncio
import io
import logging
import os
from typing import Optional

import assemblyai as aai

from .base import STTProvider, STTProviderError, TranscriptionResult

logger = logging.getLogger(__name__)


class AssemblyAIProvider(STTProvider):
    """
    AssemblyAI implementation of STT provider.

    Features:
    - Automatic punctuation and capitalization
    - High accuracy (95%+ on clean audio)
    - Confidence scores per word
    - Language detection
    - Async upload + polling model

    Rate Limits: 1000 concurrent transcriptions (generous)
    Pricing: $0.0025/minute (58% cheaper than Whisper)
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize AssemblyAI provider.

        Args:
            api_key: AssemblyAI API key. If None, reads from ASSEMBLYAI_API_KEY env var.

        Raises:
            STTProviderError: If API key is not configured
        """
        self.api_key = api_key or os.getenv("ASSEMBLYAI_API_KEY")
        if not self.api_key:
            raise STTProviderError(
                message="ASSEMBLYAI_API_KEY not configured",
                provider="assemblyai",
                retryable=False,
                error_code="ASSEMBLYAI_API_KEY_MISSING",
            )

        # Configure AssemblyAI SDK
        aai.settings.api_key = self.api_key

    async def transcribe(
        self, audio_file: bytes, language: str = "en", **kwargs
    ) -> TranscriptionResult:
        """
        Transcribe audio using AssemblyAI API.

        Process:
        1. Upload audio file to AssemblyAI
        2. Submit transcription request
        3. Poll for completion (async)
        4. Parse response with confidence score

        Args:
            audio_file: Audio bytes (MP3, M4A, WAV, FLAC, OGG)
            language: Language code (default: 'en')
            **kwargs: Additional options (speaker_labels, punctuate, etc.)

        Returns:
            TranscriptionResult with transcript and confidence

        Raises:
            STTProviderError: If upload, polling, or transcription fails
        """
        try:
            # Log audio file metadata for debugging
            logger.info(f"[ASSEMBLYAI] Received audio bytes: {len(audio_file)} bytes")

            # Check file magic bytes to detect actual format
            magic_bytes = audio_file[:12] if len(audio_file) >= 12 else audio_file
            logger.info(f"[ASSEMBLYAI] File magic bytes (hex): {magic_bytes.hex()}")

            # Wrap bytes in BytesIO with filename (AssemblyAI SDK needs .name for format detection)
            # This matches the pattern used by Whisper provider and is required for proper upload
            # Note: audio_file is now MP3 or WAV format after conversion in transcribe.py
            # Use WAV extension as it's the guaranteed fallback format
            audio_buffer = io.BytesIO(audio_file)
            audio_buffer.name = "audio.wav"  # AssemblyAI will detect format from extension

            logger.info(f"[ASSEMBLYAI] Created BytesIO buffer with name: {audio_buffer.name}")

            # Configure transcription settings
            config = aai.TranscriptionConfig(
                language_code=language,
                punctuate=True,  # Automatic punctuation
                format_text=True,  # Capitalize sentences
            )

            # Create transcriber
            transcriber = aai.Transcriber(config=config)

            # Transcribe (blocks until complete - AssemblyAI SDK handles upload + polling)
            transcript = await asyncio.to_thread(
                transcriber.transcribe,
                audio_buffer,  # Pass BytesIO buffer, not raw bytes
            )

            # Check for errors
            if transcript.status == aai.TranscriptStatus.error:
                raise STTProviderError(
                    message=f"AssemblyAI transcription failed: {transcript.error}",
                    provider="assemblyai",
                    retryable=True,
                    error_code="STT_PRIMARY_UNAVAILABLE",
                )

            # Calculate confidence (average of word confidences)
            confidence = self._calculate_confidence(transcript)

            # Calculate cost
            duration_sec = int(transcript.audio_duration / 1000)  # AssemblyAI returns milliseconds
            cost = self.get_cost(duration_sec)

            return TranscriptionResult(
                transcript=transcript.text,
                confidence=confidence,
                duration_sec=duration_sec,
                language=language,
                provider="assemblyai",
                cost_usd=cost,
            )

        except aai.types.TranscriptError as e:
            raise STTProviderError(
                message=f"AssemblyAI API error: {str(e)}",
                provider="assemblyai",
                retryable=True,
                error_code="STT_PRIMARY_UNAVAILABLE",
                original_error=e,
            )
        except Exception as e:
            # Generic error (network, timeout, etc.)
            raise STTProviderError(
                message=f"AssemblyAI unexpected error: {str(e)}",
                provider="assemblyai",
                retryable=True,
                error_code="STT_PRIMARY_UNAVAILABLE",
                original_error=e,
            )

    def _calculate_confidence(self, transcript: aai.Transcript) -> float:
        """
        Calculate overall confidence score from word-level confidences.

        AssemblyAI provides confidence per word. We average them for overall score.

        Args:
            transcript: AssemblyAI Transcript object

        Returns:
            Confidence score (0.0-1.0)
        """
        if not transcript.words:
            return 0.5  # Default if no word-level data

        # Average confidence across all words
        confidences = [word.confidence for word in transcript.words if word.confidence is not None]
        if not confidences:
            return 0.5

        return sum(confidences) / len(confidences)

    def get_cost(self, duration_seconds: int) -> float:
        """
        Calculate USD cost for AssemblyAI transcription.

        Pricing: $0.15/hour = $0.0025/minute = $0.00004167/second

        Args:
            duration_seconds: Audio duration in seconds

        Returns:
            Cost in USD (accurate to 4 decimal places)
        """
        cost_per_second = 0.00004167  # $0.0025/minute
        return round(duration_seconds * cost_per_second, 4)

    def is_available(self) -> bool:
        """
        Check if AssemblyAI is available (API key configured).

        Quick check without making API calls.

        Returns:
            True if API key is set, False otherwise
        """
        return bool(self.api_key)

"""
Speech-to-Text Services

Provider abstraction for STT operations with fallback chain.

Story: 0.11 - Voice/Speech-to-Text Infrastructure
"""

from .base import STTProvider, TranscriptionResult, STTProviderError
from .assemblyai_provider import AssemblyAIProvider
from .whisper_provider import WhisperProvider
from .stt_service import STTService

__all__ = [
    'STTProvider',
    'TranscriptionResult',
    'STTProviderError',
    'AssemblyAIProvider',
    'WhisperProvider',
    'STTService',
]

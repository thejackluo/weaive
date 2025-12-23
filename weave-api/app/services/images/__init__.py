"""
Image Services Module - AI-powered image analysis and processing

Story: 0.9 - AI-Powered Image Service

Exports:
- VisionService: Main service with provider fallback
- VisionProvider: Abstract base class for vision providers
- GeminiVisionProvider: Gemini 3.0 Flash implementation (primary)
- OpenAIVisionProvider: GPT-4o Vision implementation (fallback)
- VisionAnalysisResult: Standardized analysis result
- VisionProviderError: Provider error exception

Note: Uses lazy imports to avoid hanging on google.generativeai initialization
"""

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .gemini_vision_provider import GeminiVisionProvider
    from .openai_vision_provider import OpenAIVisionProvider
    from .vision_service import (
        VisionAnalysisResult,
        VisionProvider,
        VisionProviderError,
        VisionService,
        calculate_cost,
    )


def __getattr__(name):
    """Lazy import to avoid blocking on module initialization"""
    if name == "VisionService":
        from .vision_service import VisionService

        return VisionService
    elif name == "VisionProvider":
        from .vision_service import VisionProvider

        return VisionProvider
    elif name == "VisionProviderError":
        from .vision_service import VisionProviderError

        return VisionProviderError
    elif name == "VisionAnalysisResult":
        from .vision_service import VisionAnalysisResult

        return VisionAnalysisResult
    elif name == "calculate_cost":
        from .vision_service import calculate_cost

        return calculate_cost
    elif name == "GeminiVisionProvider":
        from .gemini_vision_provider import GeminiVisionProvider

        return GeminiVisionProvider
    elif name == "OpenAIVisionProvider":
        from .openai_vision_provider import OpenAIVisionProvider

        return OpenAIVisionProvider
    raise AttributeError(f"module '{__name__}' has no attribute '{name}'")


__all__ = [
    "VisionService",
    "VisionProvider",
    "VisionProviderError",
    "VisionAnalysisResult",
    "GeminiVisionProvider",
    "OpenAIVisionProvider",
    "calculate_cost",
]

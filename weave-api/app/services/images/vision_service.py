"""
Vision Service - AI-powered image analysis with provider abstraction

Story: 0.9 - AI-Powered Image Service
Provider Pattern: Gemini 3.0 Flash (primary) → GPT-4o Vision (fallback) → Graceful degradation

This service follows the provider abstraction pattern from Story 0.6, enabling:
- Multiple AI vision providers with automatic fallback
- Cost tracking per provider
- Consistent analysis format across providers
- Graceful degradation when AI unavailable
"""

import base64
import logging
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple
from uuid import UUID

logger = logging.getLogger(__name__)


class VisionAnalysisResult:
    """Standardized vision analysis result across all providers"""

    def __init__(
        self,
        provider: str,
        validation_score: int,  # 0-100
        is_verified: bool,  # True if validation_score >= 80
        ocr_text: Optional[str],
        categories: List[Dict[str, any]],  # [{"label": str, "confidence": float}]
        quality_score: int,  # 1-5
        input_tokens: int,
        output_tokens: int,
        cost_usd: float,
        duration_ms: int,
        timestamp: str,
    ):
        self.provider = provider
        self.validation_score = validation_score
        self.is_verified = is_verified
        self.ocr_text = ocr_text
        self.categories = categories
        self.quality_score = quality_score
        self.input_tokens = input_tokens
        self.output_tokens = output_tokens
        self.cost_usd = cost_usd
        self.duration_ms = duration_ms
        self.timestamp = timestamp

    def to_dict(self) -> dict:
        """Convert to JSONB-compatible dictionary for database storage"""
        return {
            "provider": self.provider,
            "validation_score": self.validation_score,
            "is_verified": self.is_verified,
            "ocr_text": self.ocr_text,
            "categories": self.categories,
            "quality_score": self.quality_score,
            "timestamp": self.timestamp,
        }

    def to_ai_run_log(self, user_id: UUID, local_date: str) -> dict:
        """Convert to ai_runs table format for cost tracking"""
        return {
            "user_id": str(user_id),
            "operation_type": "image_analysis",
            "model": self.provider,
            "input_tokens": self.input_tokens,
            "output_tokens": self.output_tokens,
            "cost_usd": self.cost_usd,
            "duration_ms": self.duration_ms,
            "local_date": local_date,
            "status": "success",
        }


class VisionProvider(ABC):
    """Abstract base class for AI vision providers"""

    @abstractmethod
    async def analyze_image(
        self,
        image_bytes: bytes,
        bind_description: Optional[str] = None,
        context: Optional[Dict] = None,
    ) -> VisionAnalysisResult:
        """
        Analyze an image and return structured results

        Args:
            image_bytes: Raw image bytes (JPEG/PNG)
            bind_description: Optional description of expected content (for proof validation)
            context: Optional additional context (goal, user preferences, etc.)

        Returns:
            VisionAnalysisResult with analysis data

        Raises:
            VisionProviderError: If analysis fails
        """
        pass

    @abstractmethod
    def get_provider_name(self) -> str:
        """Return provider identifier (e.g., 'gemini-3-flash-preview')"""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """Check if provider is configured and available"""
        pass


class VisionProviderError(Exception):
    """Raised when vision analysis fails"""

    def __init__(self, provider: str, message: str, retryable: bool = True):
        self.provider = provider
        self.message = message
        self.retryable = retryable
        super().__init__(f"{provider}: {message}")


class VisionService:
    """
    Main vision service with provider fallback chain

    Fallback order:
    1. Gemini 3.0 Flash (primary, lowest cost)
    2. GPT-4o Vision (fallback, higher cost)
    3. Graceful degradation (store image without analysis)
    """

    def __init__(
        self,
        gemini_provider: Optional[VisionProvider] = None,
        openai_provider: Optional[VisionProvider] = None,
    ):
        self.providers = []

        if gemini_provider and gemini_provider.is_available():
            self.providers.append(gemini_provider)
            logger.info("✅ Gemini vision provider available")

        if openai_provider and openai_provider.is_available():
            self.providers.append(openai_provider)
            logger.info("✅ OpenAI vision provider available")

        if not self.providers:
            logger.warning("⚠️ No vision providers available - graceful degradation mode")

    async def analyze_image(
        self,
        image_bytes: bytes,
        bind_description: Optional[str] = None,
        context: Optional[Dict] = None,
    ) -> Tuple[Optional[VisionAnalysisResult], bool]:
        """
        Analyze image with automatic fallback chain

        Returns:
            Tuple of (VisionAnalysisResult or None, success: bool)
            - (result, True) if analysis succeeded
            - (None, False) if all providers failed (graceful degradation)
        """
        if not self.providers:
            logger.warning("No vision providers available - skipping analysis")
            return None, False

        last_error = None

        for provider in self.providers:
            try:
                logger.info(f"Attempting vision analysis with {provider.get_provider_name()}")
                result = await provider.analyze_image(
                    image_bytes,
                    bind_description,
                    context,
                )
                logger.info(f"✅ Vision analysis succeeded with {result.provider}")
                return result, True

            except VisionProviderError as e:
                last_error = e
                logger.warning(f"⚠️ {e.provider} failed: {e.message}")

                if not e.retryable:
                    logger.error(f"Non-retryable error from {e.provider}, skipping remaining providers")
                    break

                continue

        # All providers failed - graceful degradation
        logger.error(
            f"❌ All vision providers failed. Last error: {last_error}. "
            "Image will be stored without AI analysis."
        )
        return None, False


def calculate_cost(
    provider: str,
    input_tokens: int,
    output_tokens: int,
) -> float:
    """
    Calculate cost in USD for vision analysis

    Pricing (as of 2025-12-21):
    - Gemini 3.0 Flash: $0.50/MTok input, $3.00/MTok output
    - GPT-4o Vision: $2.50/MTok input, $10.00/MTok output
    """
    pricing = {
        "gemini-3-flash-preview": {
            "input": 0.50 / 1_000_000,
            "output": 3.00 / 1_000_000,
        },
        "gpt-4o": {
            "input": 2.50 / 1_000_000,
            "output": 10.00 / 1_000_000,
        },
    }

    if provider not in pricing:
        logger.warning(f"Unknown provider {provider} for cost calculation")
        return 0.0

    rates = pricing[provider]
    cost = (input_tokens * rates["input"]) + (output_tokens * rates["output"])
    return round(cost, 4)

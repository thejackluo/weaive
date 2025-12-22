"""
OpenAI Vision Provider - GPT-4o Vision for image analysis (fallback)

Story: 0.9 - AI-Powered Image Service
Model: gpt-4o
Cost: ~$0.05/image (higher than Gemini, used as fallback only)

Capabilities:
- Proof validation (0-100 score)
- OCR text extraction
- Content classification
- Quality scoring (1-5 rating)
"""

import base64
import json
import logging
import os
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional

import openai
from openai import OpenAI, OpenAIError

from .vision_service import (
    VisionAnalysisResult,
    VisionProvider,
    VisionProviderError,
    calculate_cost,
)

logger = logging.getLogger(__name__)


class OpenAIVisionProvider(VisionProvider):
    """GPT-4o Vision provider (fallback)"""

    MODEL_NAME = "gpt-4o"

    # Analysis prompt template (matches Gemini prompt for consistency)
    ANALYSIS_PROMPT = """Analyze this image and provide a detailed assessment.

{bind_context}

Return your analysis as valid JSON with this EXACT structure:
{{
  "validation_score": <number 0-100>,
  "validation_reasoning": "<brief explanation>",
  "ocr_text": "<extracted text or null>",
  "categories": [
    {{"label": "gym|food|outdoor|workspace|social|other", "confidence": <0.0-1.0>}},
    {{"label": "...", "confidence": <0.0-1.0>}}
  ],
  "quality_score": <number 1-5>,
  "quality_reasoning": "<brief explanation of lighting, focus, relevance>"
}}

RULES:
- validation_score: How well does this image match the expected content? 0=completely unrelated, 100=perfect match
- ocr_text: Extract ALL visible text (workout logs, food labels, notes). Return null if no text visible.
- categories: Return top 2 categories with confidence scores
- quality_score: 1=poor (blurry/dark), 3=acceptable, 5=excellent (clear/well-lit/relevant)
- Output MUST be valid JSON only (no markdown, no extra text)
"""

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize OpenAI provider

        Args:
            api_key: OpenAI API key (defaults to OPENAI_API_KEY env var)
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")

        if not self.api_key:
            logger.warning("OPENAI_API_KEY not configured")
            self._client = None
            return

        try:
            self._client = OpenAI(api_key=self.api_key)
            logger.info(f"✅ OpenAI provider initialized: {self.MODEL_NAME}")
        except Exception as e:
            logger.error(f"❌ Failed to initialize OpenAI: {e}")
            self._client = None

    def get_provider_name(self) -> str:
        return self.MODEL_NAME

    def is_available(self) -> bool:
        return self._client is not None

    async def analyze_image(
        self,
        image_bytes: bytes,
        bind_description: Optional[str] = None,
        context: Optional[Dict] = None,
    ) -> VisionAnalysisResult:
        """
        Analyze image with GPT-4o Vision

        Args:
            image_bytes: Raw image bytes (JPEG/PNG)
            bind_description: Optional description of expected content
            context: Optional additional context

        Returns:
            VisionAnalysisResult

        Raises:
            VisionProviderError: If analysis fails
        """
        if not self.is_available():
            raise VisionProviderError(
                self.MODEL_NAME,
                "OpenAI provider not configured (missing OPENAI_API_KEY)",
                retryable=False,
            )

        start_time = time.time()

        try:
            # Build prompt with context
            bind_context = ""
            if bind_description:
                bind_context = f"Expected content: {bind_description}\n"

            prompt = self.ANALYSIS_PROMPT.format(bind_context=bind_context)

            # Encode image as base64 (OpenAI requirement)
            base64_image = base64.b64encode(image_bytes).decode("utf-8")
            image_url = f"data:image/jpeg;base64,{base64_image}"

            # Call OpenAI API
            logger.info("Calling GPT-4o Vision for image analysis")
            response = self._client.chat.completions.create(
                model=self.MODEL_NAME,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {"url": image_url, "detail": "auto"},
                            },
                        ],
                    }
                ],
                max_tokens=1024,
                temperature=0.0,  # Deterministic for consistency
                response_format={"type": "json_object"},  # Force JSON output
            )

            duration_ms = int((time.time() - start_time) * 1000)

            # Extract usage metadata
            usage = response.usage
            input_tokens = usage.prompt_tokens if usage else 560
            output_tokens = usage.completion_tokens if usage else 200

            # Parse response
            response_text = response.choices[0].message.content.strip()

            try:
                analysis = json.loads(response_text)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse OpenAI response as JSON: {response_text[:500]}")
                raise VisionProviderError(
                    self.MODEL_NAME,
                    f"Invalid JSON response from OpenAI: {str(e)}",
                    retryable=True,
                )

            # Validate response structure
            required_fields = ["validation_score", "categories", "quality_score"]
            for field in required_fields:
                if field not in analysis:
                    raise VisionProviderError(
                        self.MODEL_NAME,
                        f"Missing required field in OpenAI response: {field}",
                        retryable=True,
                    )

            # Calculate cost
            cost_usd = calculate_cost(self.MODEL_NAME, input_tokens, output_tokens)

            # Build result
            validation_score = int(analysis["validation_score"])
            result = VisionAnalysisResult(
                provider=self.MODEL_NAME,
                validation_score=validation_score,
                is_verified=validation_score >= 80,
                ocr_text=analysis.get("ocr_text"),
                categories=analysis.get("categories", []),
                quality_score=int(analysis["quality_score"]),
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                cost_usd=cost_usd,
                duration_ms=duration_ms,
                timestamp=datetime.now(timezone.utc).isoformat(),
            )

            logger.info(
                f"✅ OpenAI analysis complete: "
                f"validation={validation_score}, "
                f"quality={result.quality_score}/5, "
                f"cost=${cost_usd:.4f}, "
                f"{duration_ms}ms"
            )

            return result

        except openai.RateLimitError as e:
            # Rate limit exceeded
            raise VisionProviderError(
                self.MODEL_NAME,
                f"Rate limit exceeded: {str(e)}",
                retryable=False,
            )

        except openai.BadRequestError as e:
            # Invalid input (bad image format, etc.)
            raise VisionProviderError(
                self.MODEL_NAME,
                f"Invalid input: {str(e)}",
                retryable=False,
            )

        except OpenAIError as e:
            # Other OpenAI errors
            raise VisionProviderError(
                self.MODEL_NAME,
                f"OpenAI API error: {str(e)}",
                retryable=True,
            )

        except Exception as e:
            # Unexpected errors
            logger.error(f"Unexpected error in OpenAI analysis: {e}", exc_info=True)
            raise VisionProviderError(
                self.MODEL_NAME,
                f"Unexpected error: {str(e)}",
                retryable=True,
            )

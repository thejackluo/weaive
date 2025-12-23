"""
Gemini Vision Provider - Google Gemini 3.0 Flash for image analysis

Story: 0.9 - AI-Powered Image Service
Model: gemini-3-flash-preview
Cost: FREE during preview, then ~$0.02/image after launch

Capabilities:
- Proof validation (0-100 score)
- OCR text extraction
- Content classification (gym, food, outdoor, workspace, social, other)
- Quality scoring (1-5 rating)
"""

import json
import logging
import os
import time
from datetime import datetime, timezone
from typing import Dict, Optional

import google.generativeai as genai
from google.api_core import exceptions as google_exceptions

from .vision_service import (
    VisionAnalysisResult,
    VisionProvider,
    VisionProviderError,
    calculate_cost,
)

logger = logging.getLogger(__name__)


class GeminiVisionProvider(VisionProvider):
    """Gemini vision provider (supports multiple model versions)"""

    # Default model (primary)
    DEFAULT_MODEL = "gemini-3-flash-preview"

    # Analysis prompt template
    ANALYSIS_PROMPT = """Analyze this image and provide a detailed assessment.

{bind_context}

Return your analysis as valid JSON with this EXACT structure (no markdown, just JSON):
{{
  "validation_score": <number 0-100>,
  "validation_reasoning": "<brief explanation>",
  "summary": "<concise 1-2 sentence description of what's in the image>",
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
- summary: 1-2 sentence description of the image content (e.g., "A person at the gym doing bicep curls with dumbbells")
- ocr_text: Extract visible text up to 300 characters max (workout logs, food labels, notes). Summarize if longer. Return null if no text visible.
- categories: Return top 2 categories with confidence scores
- quality_score: 1=poor (blurry/dark), 3=acceptable, 5=excellent (clear/well-lit/relevant)
- Output MUST be valid JSON only (no markdown code blocks, no extra text)
- IMPORTANT: All text must be properly escaped for JSON (newlines as \\n, quotes as \\", etc.)
"""

    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None, db=None):
        """
        Initialize Gemini provider

        Args:
            api_key: Google AI API key (defaults to GOOGLE_AI_API_KEY env var)
            model_name: Model name (defaults to gemini-3-flash-preview)
                       Can be overridden for fallback to gemini-2.5-flash-preview
            db: Supabase client for cost tracking (optional, for AIProviderBase)
        """
        super().__init__(db)  # Initialize AIProviderBase
        self.api_key = api_key or os.getenv("GOOGLE_AI_API_KEY")
        self.model_name = model_name or self.DEFAULT_MODEL

        if not self.api_key:
            logger.warning("GOOGLE_AI_API_KEY not configured")
            self._model = None
            return

        try:
            genai.configure(api_key=self.api_key)
            self._model = genai.GenerativeModel(self.model_name)
            logger.info(f"✅ Gemini provider initialized: {self.model_name}")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Gemini: {e}")
            self._model = None

    def get_provider_name(self) -> str:
        return self.model_name

    def is_available(self) -> bool:
        return self._model is not None

    async def analyze_image(
        self,
        image_bytes: bytes,
        bind_description: Optional[str] = None,
        context: Optional[Dict] = None,
    ) -> VisionAnalysisResult:
        """
        Analyze image with Gemini 3.0 Flash

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
                self.model_name,
                "Gemini provider not configured (missing GOOGLE_AI_API_KEY)",
                retryable=False,
            )

        start_time = time.time()

        try:
            # Build prompt with context
            bind_context = ""
            if bind_description:
                bind_context = f"Expected content: {bind_description}\n"

            prompt = self.ANALYSIS_PROMPT.format(bind_context=bind_context)

            # Prepare image for Gemini
            # Note: Gemini SDK accepts bytes directly
            image_parts = [
                {"mime_type": "image/jpeg", "data": image_bytes},
            ]

            # Call Gemini API
            logger.info("Calling Gemini 3.0 Flash for image analysis")
            response = self._model.generate_content(
                [prompt, image_parts[0]],
                generation_config=genai.types.GenerationConfig(
                    temperature=0.0,  # Deterministic for consistency
                    max_output_tokens=2048,  # Increased for large OCR text
                    response_mime_type="application/json",  # Force valid JSON output
                ),
            )

            duration_ms = int((time.time() - start_time) * 1000)

            # Extract usage metadata
            usage = response.usage_metadata
            input_tokens = usage.prompt_token_count if usage else 560  # Typical image
            output_tokens = usage.candidates_token_count if usage else 200

            # Parse response
            response_text = response.text.strip()

            # Remove markdown code blocks if present
            if response_text.startswith("```json"):
                response_text = response_text.replace("```json", "").replace("```", "").strip()
            elif response_text.startswith("```"):
                response_text = response_text.replace("```", "").strip()

            try:
                analysis = json.loads(response_text)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse Gemini response as JSON: {response_text[:500]}")
                raise VisionProviderError(
                    self.model_name,
                    f"Invalid JSON response from Gemini: {str(e)}",
                    retryable=True,
                )

            # Validate response structure
            # All fields must be present (even if null) to ensure prompt compliance
            required_fields = ["validation_score", "summary", "ocr_text", "categories", "quality_score"]
            for field in required_fields:
                if field not in analysis:
                    raise VisionProviderError(
                        self.model_name,
                        f"Missing required field in Gemini response: {field}",
                        retryable=True,
                    )

            # Calculate cost
            cost_usd = calculate_cost(self.model_name, input_tokens, output_tokens)

            # Build result
            validation_score = int(analysis["validation_score"])
            result = VisionAnalysisResult(
                provider=self.model_name,
                validation_score=validation_score,
                is_verified=validation_score >= 80,
                summary=analysis.get("summary"),  # Extract summary from AI response
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
                f"✅ Gemini analysis complete: "
                f"validation={validation_score}, "
                f"quality={result.quality_score}/5, "
                f"cost=${cost_usd:.4f}, "
                f"{duration_ms}ms"
            )

            return result

        except google_exceptions.ResourceExhausted as e:
            # Rate limit exceeded
            raise VisionProviderError(
                self.model_name,
                f"Rate limit exceeded: {str(e)}",
                retryable=False,
            )

        except google_exceptions.InvalidArgument as e:
            # Invalid input (bad image format, etc.)
            raise VisionProviderError(
                self.model_name,
                f"Invalid input: {str(e)}",
                retryable=False,
            )

        except google_exceptions.GoogleAPIError as e:
            # Other Google API errors
            raise VisionProviderError(
                self.model_name,
                f"Google API error: {str(e)}",
                retryable=True,
            )

        except Exception as e:
            # Unexpected errors
            logger.error(f"Unexpected error in Gemini analysis: {e}", exc_info=True)
            raise VisionProviderError(
                self.model_name,
                f"Unexpected error: {str(e)}",
                retryable=True,
            )

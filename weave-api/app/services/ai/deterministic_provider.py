"""
Deterministic Provider (ULTIMATE FALLBACK)

Implements AIProvider interface with zero-cost, always-succeeds deterministic responses.
Uses extensible template system for high-quality fallback messages.

Never fails. Never costs money. Always provides reasonable default responses.
"""

import logging

from .base import AIProvider, AIResponse
from .templates import get_template

logger = logging.getLogger(__name__)


class DeterministicProvider(AIProvider):
    """
    Deterministic AI provider with extensible templates.

    Features:
    - Zero cost (no API calls)
    - Zero latency (instant responses)
    - Zero failure rate (always succeeds)
    - Extensible template system (easy to add new modules)
    - Quality fallback messages for all AI modules

    Use cases:
    - Ultimate fallback when all paid providers fail
    - Budget exceeded (application-wide or per-user)
    - Development/testing without API costs
    """

    def complete(
        self,
        prompt: str,
        model: str = 'deterministic',
        module: str = 'triad',
        variant: str = 'default',
        **kwargs
    ) -> AIResponse:
        """
        Generate deterministic response from templates.

        Args:
            prompt: User input (used for context but not AI generation)
            model: Ignored (always 'deterministic')
            module: AI module name ('onboarding', 'triad', 'recap', 'dream_self', 'weekly_insights')
            variant: Template variant ('default', 'no_tasks', 'followup', etc.)
            **kwargs: Variables for template substitution

        Returns:
            AIResponse with template content, zero cost
        """
        logger.info(f"Using deterministic fallback for module: {module}, variant: {variant}")

        # Get template with variable substitution
        content = get_template(module, variant, **kwargs)

        # Estimate token count (simple word count approximation)
        word_count = len(content.split())
        estimated_tokens = int(word_count * 1.3)  # 1 word ≈ 1.3 tokens

        logger.info(f"Deterministic response: {len(content)} chars, ~{estimated_tokens} tokens")

        return AIResponse(
            content=content,
            input_tokens=estimated_tokens // 2,  # Approximate split
            output_tokens=estimated_tokens // 2,
            model='deterministic',
            cost_usd=0.0,  # Always free
            provider='deterministic',
        )

    def count_tokens(self, text: str, model: str = 'deterministic') -> int:
        """
        Estimate token count (simple word-based approximation).

        Args:
            text: Input text
            model: Ignored (deterministic has no real model)

        Returns:
            Estimated token count
        """
        # Simple approximation: 1 word ≈ 1.3 tokens
        return int(len(text.split()) * 1.3)

    def estimate_cost(
        self,
        input_tokens: int,
        output_tokens: int,
        model: str = 'deterministic'
    ) -> float:
        """
        Calculate cost (always $0).

        Args:
            input_tokens: Ignored
            output_tokens: Ignored
            model: Ignored

        Returns:
            Always 0.0
        """
        return 0.0

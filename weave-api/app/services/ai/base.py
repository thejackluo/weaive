"""
Base AI Provider Interface

Defines abstract base class for all AI providers, ensuring consistent interface.
All providers must implement: complete(), count_tokens(), estimate_cost()

Story 1.5.3: Refactored to inherit from unified AIProviderBase for shared
cost tracking, rate limiting, and error handling across text/image/audio providers.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional

from app.services.ai_provider_base import AIProviderBase as _AIProviderBase


@dataclass
class AIResponse:
    """
    Standardized AI response format across all providers.

    Attributes:
        content: The AI-generated text response
        input_tokens: Number of tokens in the prompt
        output_tokens: Number of tokens in the response
        model: Model identifier used for generation
        cost_usd: Estimated cost in USD for this generation
        provider: Provider name ('bedrock', 'openai', 'anthropic', 'deterministic', 'cache')
        cached: Whether this response came from cache (no API call)
        run_id: Database ID of the ai_runs record (if persisted)
    """
    content: str
    input_tokens: int
    output_tokens: int
    model: str
    cost_usd: float
    provider: str
    cached: bool = False
    run_id: Optional[str] = None


class AIProviderError(Exception):
    """
    Base exception for AI provider errors.

    Attributes:
        message: Error description
        provider: Provider that raised the error
        retryable: Whether this error can be retried with another provider
        original_error: Original exception that caused this error
    """
    def __init__(
        self,
        message: str,
        provider: str,
        retryable: bool = True,
        original_error: Optional[Exception] = None
    ):
        self.message = message
        self.provider = provider
        self.retryable = retryable
        self.original_error = original_error
        super().__init__(self.message)


class AIProvider(_AIProviderBase, ABC):
    """
    Abstract base class for AI text providers.

    Story 1.5.3: Now inherits from AIProviderBase for unified cost tracking
    and rate limiting across all AI modalities (text/image/audio).

    All providers (Bedrock, OpenAI, Anthropic, Deterministic) must implement
    these three methods to ensure consistent interface for the orchestrator.
    
    Inherited from AIProviderBase:
    - log_to_ai_runs() - Cost tracking
    - check_rate_limit() - Rate limiting
    - get_provider_name() - Provider identification
    - is_available() - Availability check
    """

    @abstractmethod
    def complete(self, prompt: str, model: str, **kwargs) -> AIResponse:
        """
        Generate AI completion for the given prompt.

        Args:
            prompt: User's input text
            model: Model identifier (provider-specific)
            **kwargs: Additional provider-specific parameters

        Returns:
            AIResponse with content, token counts, cost

        Raises:
            AIProviderError: If generation fails (retryable or not)
        """
        pass

    @abstractmethod
    def count_tokens(self, text: str, model: str) -> int:
        """
        Count tokens in text for the given model.

        Token counting is model-specific (different tokenizers for GPT vs Claude).
        Used for cost estimation and validation.

        Args:
            text: Input text to tokenize
            model: Model identifier (affects tokenizer choice)

        Returns:
            Number of tokens
        """
        pass

    @abstractmethod
    def estimate_cost(self, input_tokens: int, output_tokens: int, model: str) -> float:
        """
        Estimate USD cost for token counts.

        Uses provider-specific pricing tables. Should be accurate within 1%.

        Args:
            input_tokens: Number of input tokens (prompt)
            output_tokens: Number of output tokens (response)
            model: Model identifier (affects pricing)

        Returns:
            Estimated cost in USD
        """
        pass

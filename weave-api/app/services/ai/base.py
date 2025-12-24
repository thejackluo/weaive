"""
Base AI Provider Interface

Defines abstract base class for all AI providers, ensuring consistent interface.
All providers must implement: complete(), count_tokens(), estimate_cost()
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional


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
        tool_calls: List of tool calls requested by AI (Story 6.2 Tool Use)
    """
    content: str
    input_tokens: int
    output_tokens: int
    model: str
    cost_usd: float
    provider: str
    cached: bool = False
    run_id: Optional[str] = None
    tool_calls: Optional[list] = None  # Story 6.2: Tool Use support


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


class AIProvider(ABC):
    """
    Abstract base class for AI providers.

    All providers (Bedrock, OpenAI, Anthropic, Deterministic) must implement
    these three methods to ensure consistent interface for the orchestrator.
    """

    @abstractmethod
    def complete(self, prompt: str, model: str, tools: Optional[list] = None, **kwargs) -> AIResponse:
        """
        Generate AI completion for the given prompt.

        Args:
            prompt: User's input text
            model: Model identifier (provider-specific)
            tools: Optional list of tool schemas for function calling (Story 6.2)
            **kwargs: Additional provider-specific parameters

        Returns:
            AIResponse with content, token counts, cost, and optional tool_calls

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

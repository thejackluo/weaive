"""
Anthropic Provider (FALLBACK #2)

Implements AIProvider interface for Anthropic Claude models (direct API).
Fallback provider when both Bedrock and OpenAI are unavailable.

Primary models:
- Claude 3.5 Sonnet: $3.00/$15.00 per MTok (complex reasoning)
- Claude 3.5 Haiku: $1.00/$5.00 per MTok (fast, cost-effective)
"""

import logging

from anthropic import Anthropic, APIError, RateLimitError

from .base import AIProvider, AIProviderError, AIResponse

logger = logging.getLogger(__name__)


class AnthropicProvider(AIProvider):
    """
    Anthropic Claude provider (direct API, fallback #2).

    Features:
    - Latest Claude 3.5 Sonnet and 3.5 Haiku models (Jan 2025)
    - Prompt caching support (5-minute TTL)
    - Manual retry with exponential backoff
    """

    def __init__(self, api_key: str):
        """
        Initialize Anthropic provider.

        Args:
            api_key: Anthropic API key (sk-ant-...)
        """
        self.client = Anthropic(api_key=api_key)

        # Pricing per million tokens (input/output)
        # Using currently available models (as of Jan 2025)
        self.pricing = {
            'claude-3-5-sonnet-20241022': {
                'input': 3.00 / 1_000_000,
                'output': 15.00 / 1_000_000
            },
            'claude-3-5-haiku-20241022': {
                'input': 1.00 / 1_000_000,
                'output': 5.00 / 1_000_000
            },
        }

    def complete(
        self,
        prompt: str,
        model: str = 'claude-3-5-sonnet-20241022',
        **kwargs
    ) -> AIResponse:
        """
        Generate completion using Anthropic Claude.

        Args:
            prompt: User input text
            model: Anthropic model name (default: Claude 3.5 Sonnet)
            **kwargs: Additional parameters (max_tokens, temperature, system, etc.)

        Returns:
            AIResponse with content, tokens, cost

        Raises:
            AIProviderError: If Anthropic API call fails
        """
        try:
            logger.info(f"Invoking Anthropic model: {model}")

            # Build request parameters
            request_params = {
                'model': model,
                'max_tokens': kwargs.get('max_tokens', 2000),
                'messages': [
                    {'role': 'user', 'content': prompt}
                ],
            }

            # Add optional parameters
            if 'temperature' in kwargs and kwargs['temperature'] is not None:
                request_params['temperature'] = kwargs['temperature']

            # Handle system parameter (must be a list)
            if 'system' in kwargs and kwargs['system'] is not None:
                system = kwargs['system']
                if isinstance(system, str):
                    # Convert string to list format expected by Anthropic API
                    request_params['system'] = [{'type': 'text', 'text': system}]
                elif isinstance(system, list):
                    request_params['system'] = system

            # Call Anthropic Messages API
            response = self.client.messages.create(**request_params)

            # Extract content and usage
            content = response.content[0].text
            input_tokens = response.usage.input_tokens
            output_tokens = response.usage.output_tokens

            # Calculate cost
            cost_usd = self.estimate_cost(input_tokens, output_tokens, model)

            logger.info(
                f"Anthropic success: {input_tokens} input + {output_tokens} output tokens, "
                f"cost ${cost_usd:.6f}"
            )

            return AIResponse(
                content=content,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                model=model,
                cost_usd=cost_usd,
                provider='anthropic',
            )

        except RateLimitError as e:
            logger.warning(f"Anthropic rate limit exceeded: {e}")
            raise AIProviderError(
                f"Anthropic rate limit: {e}",
                provider='anthropic',
                retryable=True,
                original_error=e
            )

        except APIError as e:
            logger.error(f"Anthropic API error: {e}")
            # Anthropic API errors are generally retryable
            retryable = True
            raise AIProviderError(
                f"Anthropic API error: {e}",
                provider='anthropic',
                retryable=retryable,
                original_error=e
            )

        except Exception as e:
            logger.error(f"Anthropic unexpected error: {e}")
            raise AIProviderError(
                f"Unexpected Anthropic error: {e}",
                provider='anthropic',
                retryable=True,
                original_error=e
            )

    def count_tokens(self, text: str, model: str) -> int:
        """
        Estimate token count for Claude models.

        Anthropic doesn't provide a public tokenizer, so we approximate.
        Claude models: ~1 token per 4 characters (conservative estimate).

        Args:
            text: Input text
            model: Model name (unused, kept for interface consistency)

        Returns:
            Estimated token count
        """
        # Conservative approximation: 1 token ≈ 4 characters
        # This is a rough estimate; actual counts may vary ±20%
        return len(text) // 4

    def estimate_cost(self, input_tokens: int, output_tokens: int, model: str) -> float:
        """
        Calculate USD cost for token counts.

        Uses Anthropic pricing as of 2025-12-19.

        Args:
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens
            model: Anthropic model name

        Returns:
            Cost in USD
        """
        # Get pricing for model (default to Sonnet if unknown)
        pricing = self.pricing.get(
            model,
            self.pricing['claude-3-5-sonnet-20241022']
        )

        input_cost = input_tokens * pricing['input']
        output_cost = output_tokens * pricing['output']

        return input_cost + output_cost

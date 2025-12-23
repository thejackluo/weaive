"""
OpenAI Provider (FALLBACK #1)

Implements AIProvider interface for OpenAI GPT models.
Fallback provider when Bedrock is unavailable.

Primary models:
- GPT-4o-mini: $0.15/$0.60 per MTok (90% of calls - routine operations)
- GPT-4o: $2.50/$10.00 per MTok (10% of calls - complex reasoning)
"""

import logging

import tiktoken
from openai import APIConnectionError, APIError, OpenAI, RateLimitError

from .base import AIProvider, AIProviderError, AIResponse

logger = logging.getLogger(__name__)


class OpenAIProvider(AIProvider):
    """
    OpenAI GPT provider (fallback when Bedrock unavailable).

    Features:
    - Automatic retries with exponential backoff (SDK built-in)
    - Accurate token counting with tiktoken
    - Latest GPT-4o-mini and GPT-4o models
    """

    def __init__(self, api_key: str, db=None):
        """
        Initialize OpenAI provider.

        Args:
            api_key: OpenAI API key (sk-...)
            db: Supabase client for cost tracking (optional, for AIProviderBase)
        """
        super().__init__(db)  # Initialize AIProviderBase
        self.client = OpenAI(api_key=api_key)
        self.api_key = api_key

        # Pricing per million tokens (input/output)
        self.pricing = {
            'gpt-4o-mini': {
                'input': 0.15 / 1_000_000,
                'output': 0.60 / 1_000_000
            },
            'gpt-4o': {
                'input': 2.50 / 1_000_000,
                'output': 10.00 / 1_000_000
            },
        }
    
    def get_provider_name(self) -> str:
        """Return provider identifier for logging."""
        return "openai"
    
    def is_available(self) -> bool:
        """Check if provider is configured and available."""
        return self.api_key is not None and len(self.api_key) > 0

    def complete(
        self,
        prompt: str,
        model: str = 'gpt-4o-mini',
        **kwargs
    ) -> AIResponse:
        """
        Generate completion using OpenAI.

        Args:
            prompt: User input text
            model: OpenAI model name (default: gpt-4o-mini)
            **kwargs: Additional parameters (temperature, max_tokens, etc.)

        Returns:
            AIResponse with content, tokens, cost

        Raises:
            AIProviderError: If OpenAI API call fails
        """
        try:
            logger.info(f"Invoking OpenAI model: {model}")

            # Call OpenAI Chat Completions API
            response = self.client.chat.completions.create(
                model=model,
                messages=[
                    {'role': 'user', 'content': prompt}
                ],
                temperature=kwargs.get('temperature', 1.0),
                max_tokens=kwargs.get('max_tokens', 2000),
                **{k: v for k, v in kwargs.items() if k not in ['temperature', 'max_tokens']}
            )

            # Extract content and usage
            content = response.choices[0].message.content
            input_tokens = response.usage.prompt_tokens
            output_tokens = response.usage.completion_tokens

            # Calculate cost
            cost_usd = self.estimate_cost(input_tokens, output_tokens, model)

            logger.info(
                f"OpenAI success: {input_tokens} input + {output_tokens} output tokens, "
                f"cost ${cost_usd:.6f}"
            )

            return AIResponse(
                content=content,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                model=model,
                cost_usd=cost_usd,
                provider='openai',
            )

        except RateLimitError as e:
            logger.warning(f"OpenAI rate limit exceeded: {e}")
            raise AIProviderError(
                f"OpenAI rate limit: {e}",
                provider='openai',
                retryable=True,
                original_error=e
            )

        except APIConnectionError as e:
            logger.error(f"OpenAI connection error: {e}")
            raise AIProviderError(
                f"OpenAI connection failed: {e}",
                provider='openai',
                retryable=True,
                original_error=e
            )

        except APIError as e:
            logger.error(f"OpenAI API error: {e}")
            # Some API errors are retryable (5xx), some are not (4xx)
            retryable = e.status_code is None or e.status_code >= 500
            raise AIProviderError(
                f"OpenAI API error: {e}",
                provider='openai',
                retryable=retryable,
                original_error=e
            )

        except Exception as e:
            logger.error(f"OpenAI unexpected error: {e}")
            raise AIProviderError(
                f"Unexpected OpenAI error: {e}",
                provider='openai',
                retryable=True,
                original_error=e
            )

    def count_tokens(self, text: str, model: str) -> int:
        """
        Count tokens using tiktoken (OpenAI's tokenizer).

        Accurate token counting for billing estimation.

        Args:
            text: Input text
            model: OpenAI model name

        Returns:
            Exact token count
        """
        try:
            encoding = tiktoken.encoding_for_model(model)
            return len(encoding.encode(text))
        except KeyError:
            # Model not found in tiktoken, use cl100k_base (GPT-4 default)
            logger.warning(f"Model {model} not in tiktoken, using cl100k_base encoding")
            encoding = tiktoken.get_encoding("cl100k_base")
            return len(encoding.encode(text))
        except Exception as e:
            # Fallback to character-based approximation
            logger.warning(f"tiktoken error: {e}, using character approximation")
            return len(text) // 4

    def estimate_cost(self, input_tokens: int, output_tokens: int, model: str) -> float:
        """
        Calculate USD cost for token counts.

        Uses OpenAI pricing as of 2025-12-19.

        Args:
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens
            model: OpenAI model name

        Returns:
            Cost in USD
        """
        # Get pricing for model (default to gpt-4o-mini if unknown)
        pricing = self.pricing.get(
            model,
            self.pricing['gpt-4o-mini']
        )

        input_cost = input_tokens * pricing['input']
        output_cost = output_tokens * pricing['output']

        return input_cost + output_cost

    def stream(
        self,
        prompt: str,
        model: str = 'gpt-4o-mini',
        **kwargs
    ):
        """
        Generate streaming completion using OpenAI.

        Yields chunks as they arrive from OpenAI's streaming API.

        Args:
            prompt: User input text
            model: OpenAI model name (default: gpt-4o-mini)
            **kwargs: Additional parameters (temperature, max_tokens, etc.)

        Yields:
            Dict with:
            - {'type': 'chunk', 'content': 'text'} - During generation
            - {'type': 'done', 'input_tokens': N, 'output_tokens': M, 'cost_usd': X, 'model': 'model-name'} - Final metadata

        Raises:
            AIProviderError: If OpenAI API call fails
        """
        try:
            logger.info(f"Streaming from OpenAI model: {model}")

            # Call OpenAI Chat Completions API with streaming enabled
            stream = self.client.chat.completions.create(
                model=model,
                messages=[
                    {'role': 'user', 'content': prompt}
                ],
                temperature=kwargs.get('temperature', 1.0),
                max_tokens=kwargs.get('max_tokens', 2000),
                stream=True,  # Enable streaming
                stream_options={"include_usage": True},  # Include token usage in final chunk
                **{k: v for k, v in kwargs.items() if k not in ['temperature', 'max_tokens']}
            )

            # Collect full content and stream chunks
            full_content = []
            input_tokens = 0
            output_tokens = 0

            for chunk in stream:
                # Check if we have content delta
                if chunk.choices and len(chunk.choices) > 0:
                    delta = chunk.choices[0].delta
                    if delta.content:
                        content = delta.content
                        full_content.append(content)
                        yield {'type': 'chunk', 'content': content}

                # Check for usage information (in final chunk with stream_options)
                if hasattr(chunk, 'usage') and chunk.usage:
                    input_tokens = chunk.usage.prompt_tokens
                    output_tokens = chunk.usage.completion_tokens

            # Calculate cost
            cost_usd = self.estimate_cost(input_tokens, output_tokens, model)

            logger.info(
                f"OpenAI streaming success: {input_tokens} input + {output_tokens} output tokens, "
                f"cost ${cost_usd:.6f}"
            )

            # Yield final metadata
            yield {
                'type': 'done',
                'input_tokens': input_tokens,
                'output_tokens': output_tokens,
                'cost_usd': cost_usd,
                'model': model,
            }

        except RateLimitError as e:
            logger.warning(f"OpenAI rate limit exceeded: {e}")
            raise AIProviderError(
                f"OpenAI rate limit: {e}",
                provider='openai',
                retryable=True,
                original_error=e
            )

        except APIConnectionError as e:
            logger.error(f"OpenAI connection error: {e}")
            raise AIProviderError(
                f"OpenAI connection failed: {e}",
                provider='openai',
                retryable=True,
                original_error=e
            )

        except APIError as e:
            logger.error(f"OpenAI API error: {e}")
            retryable = e.status_code is None or e.status_code >= 500
            raise AIProviderError(
                f"OpenAI API error: {e}",
                provider='openai',
                retryable=retryable,
                original_error=e
            )

        except Exception as e:
            logger.error(f"OpenAI unexpected streaming error: {e}")
            raise AIProviderError(
                f"Unexpected OpenAI streaming error: {e}",
                provider='openai',
                retryable=True,
                original_error=e
            )

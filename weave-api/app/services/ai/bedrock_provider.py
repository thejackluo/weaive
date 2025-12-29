"""
AWS Bedrock Provider (PRIMARY AI PLATFORM)

Implements AIProvider interface for AWS Bedrock Runtime.
Uses boto3 to invoke Claude models through AWS infrastructure.

Primary provider for maximum AWS credit runway and long-term scaling.
Pricing same as Anthropic direct, but better runway through AWS credits.
"""

import json
import logging

import boto3
from botocore.exceptions import ClientError

from .base import AIProvider, AIProviderError, AIResponse

logger = logging.getLogger(__name__)


class BedrockProvider(AIProvider):
    """
    AWS Bedrock provider for Claude models.

    Models available (using cross-region inference profiles):
    - Claude 3.5 Haiku: ~$0.25/$1.25 per MTok (primary for routine operations)
    - Claude 3.7 Sonnet: $3.00/$15.00 per MTok (complex reasoning)
    - Claude 4.5 Haiku: $1.00/$5.00 per MTok (alternative fast model)

    Note: AWS Bedrock now requires using inference profile IDs (not direct model IDs).
    Cross-region inference profiles have format: us.anthropic.{model-name}

    Authentication: AWS IAM credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION)
    """

    def __init__(self, region: str = 'us-east-1', db=None):
        """
        Initialize Bedrock provider.

        Args:
            region: AWS region (default us-east-1 for best model availability)
            db: Supabase client for cost tracking (optional, for AIProviderBase)
        """
        super().__init__(db)  # Initialize AIProviderBase
        self.client = boto3.client('bedrock-runtime', region_name=region)
        self.region = region

        # Map user-friendly model names to cross-region inference profile IDs
        self.model_id_map = {
            # User-friendly names → Inference profile IDs
            'claude-3-5-haiku': 'us.anthropic.claude-3-5-haiku-20241022-v1:0',
            'claude-3-7-sonnet': 'us.anthropic.claude-3-7-sonnet-20250219-v2:0',
            'claude-4-5-haiku': 'us.anthropic.claude-4-5-haiku-20250514-v1:0',
            # ✅ Fixed: Added aliases without version suffix (for Story 6.1 compatibility)
            'claude-3-5-haiku-20241022': 'us.anthropic.claude-3-5-haiku-20241022-v1:0',
            'claude-3-haiku-20240307': 'anthropic.claude-3-haiku-20240307-v1:0',  # ✅ Added: Actual Claude 3 Haiku
            'claude-3-7-sonnet-20250219': 'us.anthropic.claude-3-7-sonnet-20250219-v2:0',
            'claude-4-5-haiku-20250514': 'us.anthropic.claude-4-5-haiku-20250514-v1:0',
            # Also accept full inference profile IDs directly
            'us.anthropic.claude-3-5-haiku-20241022-v1:0': 'us.anthropic.claude-3-5-haiku-20241022-v1:0',
            'us.anthropic.claude-3-7-sonnet-20250219-v2:0': 'us.anthropic.claude-3-7-sonnet-20250219-v2:0',
            'us.anthropic.claude-4-5-haiku-20250514-v1:0': 'us.anthropic.claude-4-5-haiku-20250514-v1:0',
            'anthropic.claude-3-haiku-20240307-v1:0': 'anthropic.claude-3-haiku-20240307-v1:0',  # ✅ Added: Direct model ID
        }

        # Pricing per million tokens (input/output)
        # Keys are inference profile IDs
        self.pricing = {
            'us.anthropic.claude-3-5-haiku-20241022-v1:0': {
                'input': 0.25 / 1_000_000,
                'output': 1.25 / 1_000_000
            },
            'us.anthropic.claude-3-7-sonnet-20250219-v2:0': {
                'input': 3.00 / 1_000_000,
                'output': 15.00 / 1_000_000
            },
            'us.anthropic.claude-4-5-haiku-20250514-v1:0': {
                'input': 1.00 / 1_000_000,
                'output': 5.00 / 1_000_000
            },
            # ✅ Added: Claude 3 Haiku pricing (standard single-region model)
            'anthropic.claude-3-haiku-20240307-v1:0': {
                'input': 0.25 / 1_000_000,   # Same as 3.5 Haiku
                'output': 1.25 / 1_000_000
            },
        }

    def get_provider_name(self) -> str:
        """Return provider identifier for logging."""
        return "bedrock"

    def is_available(self) -> bool:
        """Check if provider is configured and available."""
        try:
            # Check if boto3 client is configured with credentials
            self.client.meta.region_name
            return True
        except Exception:
            return False

    def complete(
        self,
        prompt: str,
        model: str = 'claude-3-5-haiku',
        tools: list = None,
        **kwargs
    ) -> AIResponse:
        """
        Generate completion using AWS Bedrock.

        Args:
            prompt: User input text
            model: Model name (default: 'claude-3-5-haiku')
                  Can be user-friendly name like 'claude-3-5-haiku'
                  or full inference profile ID like 'us.anthropic.claude-3-5-haiku-20241022-v1:0'
            **kwargs: Additional parameters (max_tokens, temperature, system, etc.)

        Returns:
            AIResponse with content, tokens, cost

        Raises:
            AIProviderError: If Bedrock API call fails
        """
        try:
            # Map user-friendly model name to inference profile ID
            model_id = self.model_id_map.get(model, model)

            # Prepare request body for Bedrock Messages API
            body = {
                'anthropic_version': 'bedrock-2023-05-31',
                'max_tokens': kwargs.get('max_tokens', 2000),
                'messages': [
                    {'role': 'user', 'content': prompt}
                ],
            }

            # Add optional parameters
            if 'temperature' in kwargs and kwargs['temperature'] is not None:
                body['temperature'] = kwargs['temperature']
            if 'top_p' in kwargs and kwargs['top_p'] is not None:
                body['top_p'] = kwargs['top_p']

            # Handle system parameter (must be a string for Bedrock, unlike Anthropic direct)
            if 'system' in kwargs and kwargs['system'] is not None:
                system = kwargs['system']
                if isinstance(system, str):
                    body['system'] = system
                elif isinstance(system, list) and len(system) > 0:
                    # If it's a list (Anthropic format), extract text
                    body['system'] = system[0].get('text', '') if isinstance(system[0], dict) else str(system[0])

            logger.info(f"Invoking Bedrock model: {model} → {model_id}")

            # Invoke model with inference profile ID
            response = self.client.invoke_model(
                modelId=model_id,
                body=json.dumps(body),
                contentType='application/json',
                accept='application/json',
            )

            # Parse response
            response_body = json.loads(response['body'].read())

            # Extract content (Messages API format)
            content = response_body['content'][0]['text']

            # Extract token usage
            usage = response_body.get('usage', {})
            input_tokens = usage.get('input_tokens', 0)
            output_tokens = usage.get('output_tokens', 0)

            # Calculate cost
            cost_usd = self.estimate_cost(input_tokens, output_tokens, model)

            logger.info(
                f"Bedrock success: {input_tokens} input + {output_tokens} output tokens, "
                f"cost ${cost_usd:.6f}"
            )

            return AIResponse(
                content=content,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                model=model,
                cost_usd=cost_usd,
                provider='bedrock',
            )

        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            error_message = e.response.get('Error', {}).get('Message', str(e))

            logger.error(f"Bedrock ClientError [{error_code}]: {error_message}")

            # Determine if retryable
            retryable = error_code in [
                'ThrottlingException',
                'ServiceUnavailable',
                'InternalServerException'
            ]

            raise AIProviderError(
                f"Bedrock error [{error_code}]: {error_message}",
                provider='bedrock',
                retryable=retryable,
                original_error=e
            )

        except json.JSONDecodeError as e:
            logger.error(f"Bedrock response JSON decode error: {e}")
            raise AIProviderError(
                f"Failed to parse Bedrock response: {e}",
                provider='bedrock',
                retryable=True,
                original_error=e
            )

        except Exception as e:
            logger.error(f"Bedrock unexpected error: {e}")
            raise AIProviderError(
                f"Unexpected Bedrock error: {e}",
                provider='bedrock',
                retryable=True,
                original_error=e
            )

    def count_tokens(self, text: str, model: str) -> int:
        """
        Estimate token count for text.

        Bedrock doesn't provide a built-in tokenizer, so we approximate.
        Claude models: ~1 token per 4 characters (conservative estimate).

        Args:
            text: Input text
            model: Model ID (unused, but kept for interface consistency)

        Returns:
            Estimated token count
        """
        # Conservative approximation: 1 token ≈ 4 characters
        # This matches Anthropic's general guideline for Claude models
        return len(text) // 4

    def estimate_cost(self, input_tokens: int, output_tokens: int, model: str) -> float:
        """
        Calculate USD cost for token counts.

        Uses Bedrock pricing (same as Anthropic direct API).

        Args:
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens
            model: Model name or inference profile ID

        Returns:
            Cost in USD
        """
        # Map user-friendly name to inference profile ID if needed
        model_id = self.model_id_map.get(model, model)

        # Get pricing for model (default to Haiku if unknown)
        pricing = self.pricing.get(
            model_id,
            self.pricing['us.anthropic.claude-3-5-haiku-20241022-v1:0']
        )

        input_cost = input_tokens * pricing['input']
        output_cost = output_tokens * pricing['output']

        return input_cost + output_cost

    def stream(
        self,
        prompt: str,
        model: str = 'claude-3-5-haiku',
        **kwargs
    ):
        """
        Generate streaming completion using AWS Bedrock.

        Yields chunks as they arrive from Bedrock's streaming API.

        Args:
            prompt: User input text
            model: Model name (default: 'claude-3-5-haiku')
            **kwargs: Additional parameters (max_tokens, temperature, system, etc.)

        Yields:
            Dict with:
            - {'type': 'chunk', 'content': 'text'} - During generation
            - {'type': 'done', 'input_tokens': N, 'output_tokens': M, 'cost_usd': X, 'model': 'model-name'} - Final metadata

        Raises:
            AIProviderError: If Bedrock API call fails
        """
        try:
            # Map user-friendly model name to inference profile ID
            model_id = self.model_id_map.get(model, model)

            # Prepare request body for Bedrock Messages API
            body = {
                'anthropic_version': 'bedrock-2023-05-31',
                'max_tokens': kwargs.get('max_tokens', 2000),
                'messages': [
                    {'role': 'user', 'content': prompt}
                ],
            }

            # Add optional parameters
            if 'temperature' in kwargs and kwargs['temperature'] is not None:
                body['temperature'] = kwargs['temperature']
            if 'top_p' in kwargs and kwargs['top_p'] is not None:
                body['top_p'] = kwargs['top_p']

            # Handle system parameter
            if 'system' in kwargs and kwargs['system'] is not None:
                system = kwargs['system']
                if isinstance(system, str):
                    body['system'] = system
                elif isinstance(system, list) and len(system) > 0:
                    body['system'] = system[0].get('text', '') if isinstance(system[0], dict) else str(system[0])

            logger.info(f"Streaming from Bedrock model: {model} → {model_id}")

            # Invoke model with streaming
            response = self.client.invoke_model_with_response_stream(
                modelId=model_id,
                body=json.dumps(body),
                contentType='application/json',
                accept='application/json',
            )

            # Parse streaming response
            full_content = []
            input_tokens = 0
            output_tokens = 0

            # Process event stream
            stream = response.get('body')
            if stream:
                for event in stream:
                    chunk = event.get('chunk')
                    if chunk:
                        chunk_data = json.loads(chunk.get('bytes').decode())

                        # Handle different event types
                        event_type = chunk_data.get('type')

                        if event_type == 'content_block_delta':
                            # Text content chunk
                            delta = chunk_data.get('delta', {})
                            if delta.get('type') == 'text_delta':
                                text = delta.get('text', '')
                                if text:
                                    full_content.append(text)
                                    yield {'type': 'chunk', 'content': text}

                        elif event_type == 'message_start':
                            # Initial message with usage info
                            usage = chunk_data.get('message', {}).get('usage', {})
                            input_tokens = usage.get('input_tokens', 0)

                        elif event_type == 'message_delta':
                            # Final delta with output token count
                            usage = chunk_data.get('usage', {})
                            output_tokens = usage.get('output_tokens', 0)

            # Calculate cost
            cost_usd = self.estimate_cost(input_tokens, output_tokens, model)

            logger.info(
                f"Bedrock streaming success: {input_tokens} input + {output_tokens} output tokens, "
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

        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            error_message = e.response.get('Error', {}).get('Message', str(e))

            logger.error(f"Bedrock streaming ClientError [{error_code}]: {error_message}")

            # Determine if retryable
            retryable = error_code in [
                'ThrottlingException',
                'ServiceUnavailable',
                'InternalServerException'
            ]

            raise AIProviderError(
                f"Bedrock streaming error [{error_code}]: {error_message}",
                provider='bedrock',
                retryable=retryable,
                original_error=e
            )

        except json.JSONDecodeError as e:
            logger.error(f"Bedrock streaming JSON decode error: {e}")
            raise AIProviderError(
                f"Failed to parse Bedrock streaming response: {e}",
                provider='bedrock',
                retryable=True,
                original_error=e
            )

        except Exception as e:
            logger.error(f"Bedrock unexpected streaming error: {e}")
            raise AIProviderError(
                f"Unexpected Bedrock streaming error: {e}",
                provider='bedrock',
                retryable=True,
                original_error=e
            )

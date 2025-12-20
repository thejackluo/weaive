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

    Models available:
    - Claude 3.5 Haiku: ~$0.25/$1.25 per MTok (primary for routine operations)
    - Claude 3.7 Sonnet: $3.00/$15.00 per MTok (complex reasoning)
    - Claude 4.5 Haiku: $1.00/$5.00 per MTok (alternative fast model)

    Authentication: AWS IAM credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION)
    """

    def __init__(self, region: str = 'us-east-1'):
        """
        Initialize Bedrock provider.

        Args:
            region: AWS region (default us-east-1 for best model availability)
        """
        self.client = boto3.client('bedrock-runtime', region_name=region)
        self.region = region

        # Pricing per million tokens (input/output)
        self.pricing = {
            'anthropic.claude-3-5-haiku-20241022-v1:0': {
                'input': 0.25 / 1_000_000,
                'output': 1.25 / 1_000_000
            },
            'anthropic.claude-3-7-sonnet-20250219-v2:0': {
                'input': 3.00 / 1_000_000,
                'output': 15.00 / 1_000_000
            },
            'anthropic.claude-4-5-haiku-20250514-v1:0': {
                'input': 1.00 / 1_000_000,
                'output': 5.00 / 1_000_000
            },
        }

    def complete(
        self,
        prompt: str,
        model: str = 'anthropic.claude-3-5-haiku-20241022-v1:0',
        **kwargs
    ) -> AIResponse:
        """
        Generate completion using AWS Bedrock.

        Args:
            prompt: User input text
            model: Bedrock model ID (default: Claude 3.5 Haiku)
            **kwargs: Additional parameters (max_tokens, temperature, etc.)

        Returns:
            AIResponse with content, tokens, cost

        Raises:
            AIProviderError: If Bedrock API call fails
        """
        try:
            # Prepare request body for Bedrock Messages API
            body = {
                'anthropic_version': 'bedrock-2023-05-31',
                'max_tokens': kwargs.get('max_tokens', 2000),
                'messages': [
                    {'role': 'user', 'content': prompt}
                ],
            }

            # Add optional parameters
            if 'temperature' in kwargs:
                body['temperature'] = kwargs['temperature']
            if 'top_p' in kwargs:
                body['top_p'] = kwargs['top_p']
            if 'system' in kwargs:
                body['system'] = kwargs['system']

            logger.info(f"Invoking Bedrock model: {model}")

            # Invoke model
            response = self.client.invoke_model(
                modelId=model,
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
            model: Bedrock model ID

        Returns:
            Cost in USD
        """
        # Get pricing for model (default to Haiku if unknown)
        pricing = self.pricing.get(
            model,
            self.pricing['anthropic.claude-3-5-haiku-20241022-v1:0']
        )

        input_cost = input_tokens * pricing['input']
        output_cost = output_tokens * pricing['output']

        return input_cost + output_cost

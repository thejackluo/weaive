"""
Streaming Tests for AI Providers

Tests that verify streaming support for OpenAI, Bedrock, and Anthropic providers.

Run: uv run pytest tests/test_streaming.py -v
"""

from unittest.mock import Mock, patch

import pytest

from app.services.ai.anthropic_provider import AnthropicProvider
from app.services.ai.bedrock_provider import BedrockProvider
from app.services.ai.openai_provider import OpenAIProvider


def test_openai_provider_has_stream_method():
    """Verify OpenAI provider has stream() method."""
    provider = OpenAIProvider(api_key='sk-test-key')
    assert hasattr(provider, 'stream'), "OpenAI provider should have stream() method"
    assert callable(provider.stream), "stream() should be callable"


def test_bedrock_provider_has_stream_method():
    """Verify Bedrock provider has stream() method."""
    provider = BedrockProvider(region='us-east-1')
    assert hasattr(provider, 'stream'), "Bedrock provider should have stream() method"
    assert callable(provider.stream), "stream() should be callable"


def test_anthropic_provider_exists():
    """Verify Anthropic provider exists (already has streaming via AI service)."""
    provider = AnthropicProvider(api_key='sk-ant-test-key')
    assert provider is not None, "Anthropic provider should be initialized"


@patch('app.services.ai.openai_provider.OpenAI')
def test_openai_streaming_integration(mock_openai_client):
    """Test OpenAI streaming integration with mocked API."""
    # Create mock stream response
    mock_chunk1 = Mock()
    mock_chunk1.choices = [Mock()]
    mock_chunk1.choices[0].delta = Mock()
    mock_chunk1.choices[0].delta.content = "Hello"
    mock_chunk1.usage = None

    mock_chunk2 = Mock()
    mock_chunk2.choices = [Mock()]
    mock_chunk2.choices[0].delta = Mock()
    mock_chunk2.choices[0].delta.content = " world"
    mock_chunk2.usage = None

    # Final chunk with usage
    mock_chunk3 = Mock()
    mock_chunk3.choices = [Mock()]
    mock_chunk3.choices[0].delta = Mock()
    mock_chunk3.choices[0].delta.content = None
    mock_chunk3.usage = Mock()
    mock_chunk3.usage.prompt_tokens = 10
    mock_chunk3.usage.completion_tokens = 5

    # Mock the streaming response
    mock_stream = [mock_chunk1, mock_chunk2, mock_chunk3]
    mock_client_instance = Mock()
    mock_client_instance.chat.completions.create.return_value = iter(mock_stream)
    mock_openai_client.return_value = mock_client_instance

    # Create provider and test streaming
    provider = OpenAIProvider(api_key='sk-test-key')

    chunks = list(provider.stream(prompt="Test prompt", model='gpt-4o-mini'))

    # Verify we got chunks
    assert len(chunks) > 0, "Should receive streaming chunks"

    # Check for chunk types
    chunk_types = [c['type'] for c in chunks]
    assert 'chunk' in chunk_types, "Should have content chunks"
    assert 'done' in chunk_types, "Should have done event"

    # Verify done event has metadata
    done_chunk = [c for c in chunks if c['type'] == 'done'][0]
    assert 'input_tokens' in done_chunk, "Done event should have input_tokens"
    assert 'output_tokens' in done_chunk, "Done event should have output_tokens"
    assert 'cost_usd' in done_chunk, "Done event should have cost_usd"


@patch('app.services.ai.bedrock_provider.boto3.client')
def test_bedrock_streaming_integration(mock_boto3_client):
    """Test Bedrock streaming integration with mocked API."""
    # Create mock streaming response
    mock_event1 = {
        'chunk': {
            'bytes': b'{"type": "message_start", "message": {"usage": {"input_tokens": 10}}}'
        }
    }

    mock_event2 = {
        'chunk': {
            'bytes': b'{"type": "content_block_delta", "delta": {"type": "text_delta", "text": "Hello"}}'
        }
    }

    mock_event3 = {
        'chunk': {
            'bytes': b'{"type": "content_block_delta", "delta": {"type": "text_delta", "text": " world"}}'
        }
    }

    mock_event4 = {
        'chunk': {
            'bytes': b'{"type": "message_delta", "usage": {"output_tokens": 5}}'
        }
    }

    # Mock the streaming response
    mock_client_instance = Mock()
    mock_response = {
        'body': iter([mock_event1, mock_event2, mock_event3, mock_event4])
    }
    mock_client_instance.invoke_model_with_response_stream.return_value = mock_response
    mock_boto3_client.return_value = mock_client_instance

    # Create provider and test streaming
    provider = BedrockProvider(region='us-east-1')

    chunks = list(provider.stream(prompt="Test prompt", model='claude-3-5-haiku'))

    # Verify we got chunks
    assert len(chunks) > 0, "Should receive streaming chunks"

    # Check for chunk types
    chunk_types = [c['type'] for c in chunks]
    assert 'chunk' in chunk_types, "Should have content chunks"
    assert 'done' in chunk_types, "Should have done event"

    # Verify content chunks
    content_chunks = [c for c in chunks if c['type'] == 'chunk']
    assert len(content_chunks) >= 2, "Should have multiple content chunks"

    # Verify done event has metadata
    done_chunk = [c for c in chunks if c['type'] == 'done'][0]
    assert 'input_tokens' in done_chunk, "Done event should have input_tokens"
    assert 'output_tokens' in done_chunk, "Done event should have output_tokens"
    assert 'cost_usd' in done_chunk, "Done event should have cost_usd"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

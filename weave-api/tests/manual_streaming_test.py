#!/usr/bin/env python3
"""
Manual Streaming Test - Real API Calls with Real-Time Output

This script tests streaming with actual API calls to OpenAI, Bedrock, and Anthropic.
You'll see words appear one-by-one in real-time, demonstrating true streaming.

Prerequisites:
- OpenAI API key in .env (OPENAI_API_KEY)
- AWS credentials configured (for Bedrock)
- Anthropic API key in .env (ANTHROPIC_API_KEY)

Usage:
    cd weave-api
    uv run python tests/manual_streaming_test.py

    # Test specific provider:
    uv run python tests/manual_streaming_test.py --provider openai
    uv run python tests/manual_streaming_test.py --provider bedrock
    uv run python tests/manual_streaming_test.py --provider anthropic
"""

import os
import sys
import time
import argparse
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
from app.services.ai.openai_provider import OpenAIProvider
from app.services.ai.bedrock_provider import BedrockProvider
from app.services.ai.anthropic_provider import AnthropicProvider
from app.services.ai.base import AIProviderError

# Load environment variables
load_dotenv()


def print_colored(text, color_code):
    """Print colored text to terminal."""
    print(f"\033[{color_code}m{text}\033[0m", end='', flush=True)


def test_openai_streaming():
    """Test OpenAI streaming with real API calls."""
    print_colored("\n" + "="*80 + "\n", "1;36")
    print_colored("🤖 Testing OpenAI Streaming (GPT-4o-mini)\n", "1;36")
    print_colored("="*80 + "\n\n", "1;36")

    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print_colored("❌ OPENAI_API_KEY not found in .env\n", "1;31")
        return False

    try:
        provider = OpenAIProvider(api_key=api_key)

        prompt = "Write a haiku about streaming AI responses in real-time. Keep it short and poetic."

        print_colored("💬 Prompt: ", "1;33")
        print(prompt)
        print_colored("\n📝 Streaming response:\n", "1;32")
        print_colored("─" * 80 + "\n", "0;37")

        start_time = time.time()
        full_content = []
        input_tokens = 0
        output_tokens = 0
        cost_usd = 0.0

        # Stream response
        for chunk in provider.stream(prompt=prompt, model='gpt-4o-mini', temperature=0.7):
            if chunk['type'] == 'chunk':
                content = chunk['content']
                full_content.append(content)
                # Print each chunk as it arrives (cyan color)
                print_colored(content, "0;36")
            elif chunk['type'] == 'done':
                input_tokens = chunk['input_tokens']
                output_tokens = chunk['output_tokens']
                cost_usd = chunk['cost_usd']

        elapsed = time.time() - start_time

        print_colored("\n" + "─" * 80 + "\n", "0;37")
        print_colored(f"✅ OpenAI Streaming Success!\n", "1;32")
        print_colored(f"   • Time: {elapsed:.2f}s\n", "0;37")
        print_colored(f"   • Tokens: {input_tokens} in + {output_tokens} out\n", "0;37")
        print_colored(f"   • Cost: ${cost_usd:.6f}\n", "0;37")
        print_colored(f"   • Chunks: {len(full_content)}\n\n", "0;37")

        return True

    except AIProviderError as e:
        print_colored(f"\n❌ OpenAI Error: {e.message}\n", "1;31")
        return False
    except Exception as e:
        print_colored(f"\n❌ Unexpected Error: {e}\n", "1;31")
        return False


def test_bedrock_streaming():
    """Test Bedrock streaming with real API calls."""
    print_colored("\n" + "="*80 + "\n", "1;36")
    print_colored("☁️  Testing Bedrock Streaming (Claude 3.5 Haiku)\n", "1;36")
    print_colored("="*80 + "\n\n", "1;36")

    # Check AWS credentials
    if not os.getenv('AWS_ACCESS_KEY_ID') and not os.getenv('AWS_PROFILE'):
        print_colored("❌ AWS credentials not configured\n", "1;31")
        print_colored("   Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY, or configure AWS_PROFILE\n", "0;37")
        return False

    try:
        provider = BedrockProvider(region='us-east-1')

        prompt = "Write a haiku about AWS cloud services powering AI. Keep it short and elegant."

        print_colored("💬 Prompt: ", "1;33")
        print(prompt)
        print_colored("\n📝 Streaming response:\n", "1;32")
        print_colored("─" * 80 + "\n", "0;37")

        start_time = time.time()
        full_content = []
        input_tokens = 0
        output_tokens = 0
        cost_usd = 0.0

        # Stream response
        for chunk in provider.stream(prompt=prompt, model='claude-3-5-haiku', temperature=0.7):
            if chunk['type'] == 'chunk':
                content = chunk['content']
                full_content.append(content)
                # Print each chunk as it arrives (magenta color)
                print_colored(content, "0;35")
            elif chunk['type'] == 'done':
                input_tokens = chunk['input_tokens']
                output_tokens = chunk['output_tokens']
                cost_usd = chunk['cost_usd']

        elapsed = time.time() - start_time

        print_colored("\n" + "─" * 80 + "\n", "0;37")
        print_colored(f"✅ Bedrock Streaming Success!\n", "1;32")
        print_colored(f"   • Time: {elapsed:.2f}s\n", "0;37")
        print_colored(f"   • Tokens: {input_tokens} in + {output_tokens} out\n", "0;37")
        print_colored(f"   • Cost: ${cost_usd:.6f}\n", "0;37")
        print_colored(f"   • Chunks: {len(full_content)}\n\n", "0;37")

        return True

    except AIProviderError as e:
        print_colored(f"\n❌ Bedrock Error: {e.message}\n", "1;31")
        if "credentials" in str(e).lower():
            print_colored("   Tip: Ensure AWS credentials are configured correctly\n", "0;33")
        return False
    except Exception as e:
        print_colored(f"\n❌ Unexpected Error: {e}\n", "1;31")
        return False


def test_anthropic_streaming():
    """Test Anthropic streaming with real API calls."""
    print_colored("\n" + "="*80 + "\n", "1;36")
    print_colored("🧠 Testing Anthropic Streaming (Claude 3.5 Haiku)\n", "1;36")
    print_colored("="*80 + "\n\n", "1;36")

    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key:
        print_colored("❌ ANTHROPIC_API_KEY not found in .env\n", "1;31")
        return False

    try:
        from anthropic import Anthropic

        provider = AnthropicProvider(api_key=api_key)
        client = provider.client

        prompt = "Write a haiku about AI streaming technology. Keep it concise and thoughtful."

        print_colored("💬 Prompt: ", "1;33")
        print(prompt)
        print_colored("\n📝 Streaming response:\n", "1;32")
        print_colored("─" * 80 + "\n", "0;37")

        start_time = time.time()
        full_content = []
        input_tokens = 0
        output_tokens = 0

        # Use Anthropic's native streaming API
        with client.messages.stream(
            model='claude-3-5-haiku-20241022',
            max_tokens=200,
            temperature=0.7,
            messages=[{'role': 'user', 'content': prompt}]
        ) as stream:
            for text in stream.text_stream:
                full_content.append(text)
                # Print each chunk as it arrives (yellow color)
                print_colored(text, "0;33")

            # Get final message with usage
            final_message = stream.get_final_message()
            input_tokens = final_message.usage.input_tokens
            output_tokens = final_message.usage.output_tokens

        elapsed = time.time() - start_time
        cost_usd = provider.estimate_cost(input_tokens, output_tokens, 'claude-3-5-haiku-20241022')

        print_colored("\n" + "─" * 80 + "\n", "0;37")
        print_colored(f"✅ Anthropic Streaming Success!\n", "1;32")
        print_colored(f"   • Time: {elapsed:.2f}s\n", "0;37")
        print_colored(f"   • Tokens: {input_tokens} in + {output_tokens} out\n", "0;37")
        print_colored(f"   • Cost: ${cost_usd:.6f}\n", "0;37")
        print_colored(f"   • Chunks: {len(full_content)}\n\n", "0;37")

        return True

    except Exception as e:
        print_colored(f"\n❌ Anthropic Error: {e}\n", "1;31")
        return False


def main():
    """Run manual streaming tests."""
    parser = argparse.ArgumentParser(description='Test AI provider streaming with real API calls')
    parser.add_argument(
        '--provider',
        choices=['openai', 'bedrock', 'anthropic', 'all'],
        default='all',
        help='Which provider to test (default: all)'
    )
    args = parser.parse_args()

    print_colored("\n" + "🔥" * 40 + "\n", "1;35")
    print_colored("  REAL-TIME STREAMING TEST\n", "1;35")
    print_colored("  Watch AI responses appear word-by-word!\n", "1;35")
    print_colored("🔥" * 40 + "\n", "1;35")

    results = {}

    if args.provider in ['openai', 'all']:
        results['openai'] = test_openai_streaming()

    if args.provider in ['bedrock', 'all']:
        results['bedrock'] = test_bedrock_streaming()

    if args.provider in ['anthropic', 'all']:
        results['anthropic'] = test_anthropic_streaming()

    # Summary
    print_colored("\n" + "="*80 + "\n", "1;36")
    print_colored("📊 SUMMARY\n", "1;36")
    print_colored("="*80 + "\n", "1;36")

    for provider, success in results.items():
        status = "✅ PASSED" if success else "❌ FAILED"
        color = "1;32" if success else "1;31"
        print_colored(f"{status} - {provider.upper()}\n", color)

    total = len(results)
    passed = sum(results.values())
    print_colored(f"\nTotal: {passed}/{total} providers passed\n\n", "1;37")

    return 0 if all(results.values()) else 1


if __name__ == "__main__":
    sys.exit(main())

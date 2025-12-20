#!/usr/bin/env python3
"""
Manual AI Service Testing Script

Quick script to test AI providers with REAL API calls.
Run: uv run python scripts/test_ai_service.py

Cost per run: ~$0.0003 (all 3 providers with short prompts)
"""

import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

OPENAI_KEY = os.getenv('OPENAI_API_KEY')
ANTHROPIC_KEY = os.getenv('ANTHROPIC_API_KEY')
AWS_ACCESS_KEY = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')


def print_header(title):
    """Print formatted header."""
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)


def test_openai():
    """Test OpenAI provider."""
    if not OPENAI_KEY or OPENAI_KEY == 'your-openai-api-key-here':
        print("\n⚠️  Skipping OpenAI (API key not configured)")
        return None

    from app.services.ai.openai_provider import OpenAIProvider

    print_header("🤖 Testing OpenAI Provider")

    provider = OpenAIProvider(api_key=OPENAI_KEY)

    prompt = "Say 'hello' in exactly one word"
    model = 'gpt-4o-mini'

    print(f"\n📝 Prompt: '{prompt}'")
    print(f"🎯 Model: {model}")
    print(f"💰 Pricing: $0.15/MTok input, $0.60/MTok output")
    print("\n⏳ Calling OpenAI API...")

    try:
        response = provider.complete(prompt, model=model, max_tokens=10)

        print(f"\n✅ SUCCESS!")
        print(f"📄 Response: '{response.content}'")
        print(f"📊 Tokens: {response.input_tokens} in + {response.output_tokens} out")
        print(f"💵 Cost: ${response.cost_usd:.6f}")
        print(f"🏢 Provider: {response.provider}")

        return response

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        return None


def test_anthropic():
    """Test Anthropic provider."""
    if not ANTHROPIC_KEY or ANTHROPIC_KEY == 'your-anthropic-api-key-here':
        print("\n⚠️  Skipping Anthropic (API key not configured)")
        return None

    from app.services.ai.anthropic_provider import AnthropicProvider

    print_header("🧠 Testing Anthropic Provider")

    provider = AnthropicProvider(api_key=ANTHROPIC_KEY)

    prompt = "Say 'hi' in exactly one word"
    model = 'claude-3-5-haiku-20241022'  # Current available model (Jan 2025)

    print(f"\n📝 Prompt: '{prompt}'")
    print(f"🎯 Model: {model}")
    print(f"💰 Pricing: $1.00/MTok input, $5.00/MTok output")
    print("\n⏳ Calling Anthropic API...")

    try:
        response = provider.complete(prompt, model=model, max_tokens=10)

        print(f"\n✅ SUCCESS!")
        print(f"📄 Response: '{response.content}'")
        print(f"📊 Tokens: {response.input_tokens} in + {response.output_tokens} out")
        print(f"💵 Cost: ${response.cost_usd:.6f}")
        print(f"🏢 Provider: {response.provider}")

        return response

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        return None


def test_bedrock():
    """Test AWS Bedrock provider."""
    if not AWS_ACCESS_KEY or not AWS_SECRET_KEY:
        print("\n⚠️  Skipping Bedrock (AWS credentials not configured)")
        return None

    from app.services.ai.bedrock_provider import BedrockProvider

    print_header("☁️  Testing AWS Bedrock Provider")

    provider = BedrockProvider(region=AWS_REGION)

    prompt = "Say 'hey' in exactly one word"
    model = 'claude-3-5-haiku'  # User-friendly name (maps to us.anthropic.claude-3-5-haiku-20241022-v1:0)

    print(f"\n📝 Prompt: '{prompt}'")
    print(f"🎯 Model: {model}")
    print(f"💰 Pricing: $0.25/MTok input, $1.25/MTok output")
    print(f"🌍 Region: {AWS_REGION}")
    print("\n⏳ Calling AWS Bedrock API...")

    try:
        response = provider.complete(prompt, model=model, max_tokens=10)

        print(f"\n✅ SUCCESS!")
        print(f"📄 Response: '{response.content}'")
        print(f"📊 Tokens: {response.input_tokens} in + {response.output_tokens} out")
        print(f"💵 Cost: ${response.cost_usd:.6f}")
        print(f"🏢 Provider: {response.provider}")

        return response

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        return None


def test_deterministic():
    """Test deterministic provider (always free)."""
    from app.services.ai.deterministic_provider import DeterministicProvider

    print_header("🎲 Testing Deterministic Provider (FREE)")

    provider = DeterministicProvider()

    prompt = "test"
    module = 'triad'

    print(f"\n📦 Module: {module}")
    print(f"💰 Cost: $0.00 (always free)")
    print("\n⏳ Generating response...")

    response = provider.complete(
        prompt,
        module=module,
        variant='default',
        task_1='Complete report',
        task_2='Review code',
        task_3='Exercise 30min'
    )

    print(f"\n✅ SUCCESS!")
    print(f"📄 Response:\n{response.content}")
    print(f"💵 Cost: ${response.cost_usd:.6f}")
    print(f"🏢 Provider: {response.provider}")

    return response


def main():
    """Run all provider tests."""
    print("\n" + "🚀 "*20)
    print("AI SERVICE MANUAL TESTING")
    print("🚀 "*20)

    results = {
        'openai': None,
        'anthropic': None,
        'bedrock': None,
        'deterministic': None,
    }

    # Test all providers
    results['openai'] = test_openai()
    results['anthropic'] = test_anthropic()
    results['bedrock'] = test_bedrock()
    results['deterministic'] = test_deterministic()

    # Summary
    print_header("📊 Test Summary")

    total_cost = 0.0
    success_count = 0

    for provider_name, response in results.items():
        if response is None:
            print(f"\n❌ {provider_name.upper()}: Skipped or Failed")
        else:
            print(f"\n✅ {provider_name.upper()}: Success (${response.cost_usd:.6f})")
            total_cost += response.cost_usd
            success_count += 1

    print(f"\n" + "-"*70)
    print(f"💵 Total cost: ${total_cost:.6f}")
    print(f"✅ Successful tests: {success_count}/4")
    print(f"="*70)

    # Cost verification instructions
    if total_cost > 0:
        print("\n📝 NEXT STEPS: Verify cost tracking in database")
        print("\nRun these SQL queries to verify costs were logged:\n")
        print("-- Check recent AI runs")
        print("SELECT provider, model, input_tokens, output_tokens, cost_estimate, created_at")
        print("FROM ai_runs")
        print("WHERE created_at >= NOW() - INTERVAL '5 minutes'")
        print("ORDER BY created_at DESC;")
        print("\n-- Check total daily cost")
        print("SELECT")
        print("  DATE(created_at) as date,")
        print("  COUNT(*) as total_calls,")
        print("  SUM(cost_estimate) as total_cost,")
        print("  provider")
        print("FROM ai_runs")
        print("WHERE DATE(created_at) = CURRENT_DATE")
        print("GROUP BY DATE(created_at), provider;")
        print("\n" + "="*70 + "\n")


if __name__ == '__main__':
    main()

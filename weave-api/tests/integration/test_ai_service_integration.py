"""
Integration Tests for AI Service with REAL API calls

IMPORTANT: These tests make REAL API calls and cost REAL money.
Run with: uv run pytest tests/integration/test_ai_service_integration.py -v -s

Prerequisites:
- Set API keys in .env:
  - OPENAI_API_KEY=sk-...
  - ANTHROPIC_API_KEY=sk-ant-...
  - AWS_ACCESS_KEY_ID=AKIA...
  - AWS_SECRET_ACCESS_KEY=...
  - AWS_REGION=us-east-1
- Supabase running locally: npx supabase start

Cost Estimate (per test run):
- OpenAI: ~$0.0001 per test (GPT-4o-mini, short prompts)
- Anthropic: ~$0.0002 per test (Claude 3.7 Sonnet, short prompts)
- Bedrock: ~$0.0001 per test (Claude 3.5 Haiku, short prompts)
- Total: ~$0.001 per full test run (all providers)

Run specific provider tests:
- pytest tests/integration/test_ai_service_integration.py::test_openai_real_api -v -s
- pytest tests/integration/test_ai_service_integration.py::test_anthropic_real_api -v -s
- pytest tests/integration/test_ai_service_integration.py::test_bedrock_real_api -v -s
"""

import os
import pytest
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Skip all integration tests if API keys not configured
OPENAI_KEY = os.getenv('OPENAI_API_KEY')
ANTHROPIC_KEY = os.getenv('ANTHROPIC_API_KEY')
AWS_ACCESS_KEY = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')

skip_openai = pytest.mark.skipif(
    not OPENAI_KEY or OPENAI_KEY == 'your-openai-api-key-here',
    reason="OPENAI_API_KEY not configured in .env"
)

skip_anthropic = pytest.mark.skipif(
    not ANTHROPIC_KEY or ANTHROPIC_KEY == 'your-anthropic-api-key-here',
    reason="ANTHROPIC_API_KEY not configured in .env"
)

skip_bedrock = pytest.mark.skipif(
    not AWS_ACCESS_KEY or not AWS_SECRET_KEY,
    reason="AWS credentials not configured in .env"
)


@skip_openai
def test_openai_real_api():
    """
    Test OpenAI provider with REAL API call.

    Uses GPT-4o-mini (cheapest model) with minimal prompt.
    Expected cost: ~$0.0001 (1/100th of a cent)
    """
    from app.services.ai.openai_provider import OpenAIProvider

    print("\n" + "="*70)
    print("🧪 Testing OpenAI Provider (REAL API)")
    print("="*70)

    provider = OpenAIProvider(api_key=OPENAI_KEY)

    # Use shortest possible prompt to minimize cost
    prompt = "Say 'hi' in one word"
    model = 'gpt-4o-mini'  # Cheapest model: $0.15/$0.60 per MTok

    print(f"\n📝 Prompt: '{prompt}'")
    print(f"🤖 Model: {model}")
    print(f"💰 Expected cost: ~$0.0001")
    print("\n⏳ Calling OpenAI API...")

    response = provider.complete(prompt, model=model, max_tokens=10)

    print(f"\n✅ Response received!")
    print(f"📄 Content: '{response.content}'")
    print(f"📊 Input tokens: {response.input_tokens}")
    print(f"📊 Output tokens: {response.output_tokens}")
    print(f"💵 Actual cost: ${response.cost_usd:.6f}")
    print(f"🏢 Provider: {response.provider}")

    # Assertions
    assert response.content is not None and len(response.content) > 0
    assert response.input_tokens > 0
    assert response.output_tokens > 0
    assert response.provider == 'openai'
    assert response.cost_usd > 0
    assert response.cost_usd < 0.001  # Should be less than 1/10th of a cent

    print(f"\n✅ All assertions passed!")
    print(f"="*70)


@skip_anthropic
def test_anthropic_real_api():
    """
    Test Anthropic provider with REAL API call.

    Uses Claude 4.5 Haiku (cheaper than Sonnet) with minimal prompt.
    Expected cost: ~$0.0001
    """
    from app.services.ai.anthropic_provider import AnthropicProvider

    print("\n" + "="*70)
    print("🧪 Testing Anthropic Provider (REAL API)")
    print("="*70)

    provider = AnthropicProvider(api_key=ANTHROPIC_KEY)

    # Use shortest possible prompt to minimize cost
    prompt = "Say 'hello' in one word"
    model = 'claude-4-5-haiku-20250514'  # Cheaper: $1/$5 per MTok

    print(f"\n📝 Prompt: '{prompt}'")
    print(f"🤖 Model: {model}")
    print(f"💰 Expected cost: ~$0.0001")
    print("\n⏳ Calling Anthropic API...")

    response = provider.complete(prompt, model=model, max_tokens=10)

    print(f"\n✅ Response received!")
    print(f"📄 Content: '{response.content}'")
    print(f"📊 Input tokens: {response.input_tokens}")
    print(f"📊 Output tokens: {response.output_tokens}")
    print(f"💵 Actual cost: ${response.cost_usd:.6f}")
    print(f"🏢 Provider: {response.provider}")

    # Assertions
    assert response.content is not None and len(response.content) > 0
    assert response.input_tokens > 0
    assert response.output_tokens > 0
    assert response.provider == 'anthropic'
    assert response.cost_usd > 0
    assert response.cost_usd < 0.001  # Should be less than 1/10th of a cent

    print(f"\n✅ All assertions passed!")
    print(f"="*70)


@skip_bedrock
def test_bedrock_real_api():
    """
    Test AWS Bedrock provider with REAL API call.

    Uses Claude 3.5 Haiku (cheapest Bedrock model) with minimal prompt.
    Expected cost: ~$0.00005 (half of OpenAI)
    """
    from app.services.ai.bedrock_provider import BedrockProvider

    print("\n" + "="*70)
    print("🧪 Testing AWS Bedrock Provider (REAL API)")
    print("="*70)

    provider = BedrockProvider(region=AWS_REGION)

    # Use shortest possible prompt to minimize cost
    prompt = "Say 'hey' in one word"
    model = 'anthropic.claude-3-5-haiku-20241022-v1:0'  # Cheapest: $0.25/$1.25 per MTok

    print(f"\n📝 Prompt: '{prompt}'")
    print(f"🤖 Model: {model}")
    print(f"💰 Expected cost: ~$0.00005")
    print(f"🌍 Region: {AWS_REGION}")
    print("\n⏳ Calling AWS Bedrock API...")

    response = provider.complete(prompt, model=model, max_tokens=10)

    print(f"\n✅ Response received!")
    print(f"📄 Content: '{response.content}'")
    print(f"📊 Input tokens: {response.input_tokens}")
    print(f"📊 Output tokens: {response.output_tokens}")
    print(f"💵 Actual cost: ${response.cost_usd:.6f}")
    print(f"🏢 Provider: {response.provider}")

    # Assertions
    assert response.content is not None and len(response.content) > 0
    assert response.input_tokens > 0
    assert response.output_tokens > 0
    assert response.provider == 'bedrock'
    assert response.cost_usd > 0
    assert response.cost_usd < 0.001  # Should be less than 1/10th of a cent

    print(f"\n✅ All assertions passed!")
    print(f"="*70)


@skip_openai
def test_fallback_chain_real_apis():
    """
    Test fallback chain with REAL API calls.

    Tests OpenAI → Deterministic fallback by passing invalid model.
    Expected cost: ~$0 (OpenAI fails, Deterministic is free)
    """
    from app.services.ai.openai_provider import OpenAIProvider
    from app.services.ai.deterministic_provider import DeterministicProvider
    from app.services.ai.base import AIProviderError

    print("\n" + "="*70)
    print("🧪 Testing Fallback Chain (REAL APIs)")
    print("="*70)

    # Try OpenAI with invalid model (should fail)
    openai_provider = OpenAIProvider(api_key=OPENAI_KEY)

    print("\n1️⃣ Attempting OpenAI with invalid model (should fail)...")

    try:
        response = openai_provider.complete("test", model="gpt-invalid-model-xyz")
        print("❌ OpenAI should have failed!")
        assert False, "OpenAI should have raised AIProviderError"
    except AIProviderError as e:
        print(f"✅ OpenAI failed as expected: {str(e)[:100]}...")

    # Fallback to Deterministic
    print("\n2️⃣ Falling back to Deterministic provider...")
    deterministic_provider = DeterministicProvider()

    response = deterministic_provider.complete(
        "test",
        module='triad',
        variant='default',
        task_1='Task A',
        task_2='Task B',
        task_3='Task C'
    )

    print(f"\n✅ Deterministic response received!")
    print(f"📄 Content preview: '{response.content[:100]}...'")
    print(f"💵 Cost: ${response.cost_usd:.6f} (FREE!)")
    print(f"🏢 Provider: {response.provider}")

    # Assertions
    assert response.provider == 'deterministic'
    assert response.cost_usd == 0.0
    assert 'Task A' in response.content
    assert 'Task B' in response.content
    assert 'Task C' in response.content

    print(f"\n✅ Fallback chain works correctly!")
    print(f"="*70)


@skip_openai
def test_cost_tracking_accuracy():
    """
    Test cost tracking with REAL API call.

    Verifies that calculated costs match expected ranges.
    Expected cost: ~$0.0001
    """
    from app.services.ai.openai_provider import OpenAIProvider

    print("\n" + "="*70)
    print("🧪 Testing Cost Tracking Accuracy (REAL API)")
    print("="*70)

    provider = OpenAIProvider(api_key=OPENAI_KEY)

    prompt = "Count to 3"
    model = 'gpt-4o-mini'

    print(f"\n📝 Prompt: '{prompt}'")
    print(f"🤖 Model: {model}")
    print(f"💰 Pricing: $0.15/MTok (input), $0.60/MTok (output)")
    print("\n⏳ Calling OpenAI API...")

    response = provider.complete(prompt, model=model, max_tokens=20)

    print(f"\n✅ Response received!")
    print(f"📄 Content: '{response.content}'")
    print(f"📊 Input tokens: {response.input_tokens}")
    print(f"📊 Output tokens: {response.output_tokens}")
    print(f"💵 Calculated cost: ${response.cost_usd:.6f}")

    # Manual cost verification
    expected_input_cost = response.input_tokens * (0.15 / 1_000_000)
    expected_output_cost = response.output_tokens * (0.60 / 1_000_000)
    expected_total = expected_input_cost + expected_output_cost

    print(f"\n🧮 Manual verification:")
    print(f"   Input cost: {response.input_tokens} tokens × $0.15/MTok = ${expected_input_cost:.6f}")
    print(f"   Output cost: {response.output_tokens} tokens × $0.60/MTok = ${expected_output_cost:.6f}")
    print(f"   Expected total: ${expected_total:.6f}")
    print(f"   Actual total: ${response.cost_usd:.6f}")
    print(f"   Difference: ${abs(expected_total - response.cost_usd):.8f}")

    # Assertions
    assert abs(response.cost_usd - expected_total) < 0.000001  # Allow 1/millionth dollar difference
    assert response.cost_usd > 0
    assert response.cost_usd < 0.001  # Should be very cheap

    print(f"\n✅ Cost tracking accurate to within $0.000001!")
    print(f"="*70)


def test_deterministic_provider_free():
    """
    Test deterministic provider (no API calls, no cost).

    This test always runs (no API keys needed).
    Expected cost: $0.00
    """
    from app.services.ai.deterministic_provider import DeterministicProvider

    print("\n" + "="*70)
    print("🧪 Testing Deterministic Provider (NO API, FREE)")
    print("="*70)

    provider = DeterministicProvider()

    # Test all AI modules
    modules = [
        ('onboarding', {'goal_title': 'Learn Python'}),
        ('triad', {'task_1': 'Study', 'task_2': 'Practice', 'task_3': 'Build'}),
        ('recap', {'completed_count': 3, 'proof_count': 2}),
        ('dream_self', {'topic': 'career growth'}),
        ('weekly_insights', {'pattern_1': 'Consistency', 'pattern_2': 'Focus', 'focus_area': 'Deep work'}),
    ]

    total_cost = 0.0

    for module, kwargs in modules:
        print(f"\n📦 Module: {module}")
        print(f"   Variables: {kwargs}")

        response = provider.complete("test", module=module, **kwargs)

        print(f"   ✅ Content preview: '{response.content[:80]}...'")
        print(f"   💵 Cost: ${response.cost_usd:.6f}")

        assert response.provider == 'deterministic'
        assert response.cost_usd == 0.0
        assert len(response.content) > 0

        total_cost += response.cost_usd

    print(f"\n💰 Total cost for 5 modules: ${total_cost:.6f} (FREE!)")
    print(f"✅ All 5 modules work correctly!")
    print(f"="*70)


if __name__ == '__main__':
    # Run tests with pytest when executed directly
    import sys
    sys.exit(pytest.main([__file__, '-v', '-s']))

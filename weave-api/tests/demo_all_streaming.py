#!/usr/bin/env python3
"""
All Providers Streaming Demo

Tests all three providers (OpenAI, Bedrock, Anthropic) with the same prompt
to compare streaming performance and response quality.

Usage:
    cd weave-api
    uv run python tests/demo_all_streaming.py
"""

import os
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv

from app.services.ai.anthropic_provider import AnthropicProvider
from app.services.ai.bedrock_provider import BedrockProvider
from app.services.ai.openai_provider import OpenAIProvider

load_dotenv()

# Shared prompt for all providers
PROMPT = "Write a short haiku about real-time AI streaming."


def stream_test(provider_name, provider, prompt, model):
    """Test streaming for a single provider."""
    print(f"\n{'='*70}")
    print(f"🤖 {provider_name.upper()} - {model}")
    print(f"{'='*70}\n")
    print("Streaming: ", end='', flush=True)

    start = time.time()
    chunks = []
    full_text = []

    try:
        for chunk in provider.stream(prompt=prompt, model=model, temperature=0.7):
            if chunk['type'] == 'chunk':
                print(chunk['content'], end='', flush=True)
                full_text.append(chunk['content'])
                chunks.append(chunk)
            elif chunk['type'] == 'done':
                elapsed = time.time() - start
                print("\n\n✅ Complete!")
                print(f"   • Time: {elapsed:.2f}s")
                print(f"   • Tokens: {chunk['input_tokens']} in + {chunk['output_tokens']} out")
                print(f"   • Cost: ${chunk['cost_usd']:.6f}")
                print(f"   • Chunks: {len(chunks)}")
                print(f"   • Speed: {len(chunks)/elapsed:.1f} chunks/sec")
                return True, elapsed, len(chunks), chunk['cost_usd']

    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        return False, 0, 0, 0


def main():
    """Run streaming demo for all providers."""
    print("\n" + "🌟"*35)
    print("  REAL-TIME STREAMING COMPARISON")
    print("  Testing OpenAI, Bedrock & Anthropic")
    print("🌟"*35)

    results = []

    # Test OpenAI
    if os.getenv('OPENAI_API_KEY'):
        try:
            provider = OpenAIProvider(api_key=os.getenv('OPENAI_API_KEY'))
            success, time_taken, chunks, cost = stream_test(
                "OpenAI", provider, PROMPT, "gpt-4o-mini"
            )
            results.append(("OpenAI (GPT-4o-mini)", success, time_taken, chunks, cost))
        except Exception as e:
            print(f"\n❌ OpenAI setup failed: {e}")
            results.append(("OpenAI (GPT-4o-mini)", False, 0, 0, 0))
    else:
        print("\n⏭️  Skipping OpenAI (no API key)")

    # Test Bedrock
    if os.getenv('AWS_ACCESS_KEY_ID') or os.getenv('AWS_PROFILE'):
        try:
            provider = BedrockProvider(region='us-east-1')
            success, time_taken, chunks, cost = stream_test(
                "Bedrock", provider, PROMPT, "claude-3-5-haiku"
            )
            results.append(("Bedrock (Claude 3.5 Haiku)", success, time_taken, chunks, cost))
        except Exception as e:
            print(f"\n❌ Bedrock setup failed: {e}")
            results.append(("Bedrock (Claude 3.5 Haiku)", False, 0, 0, 0))
    else:
        print("\n⏭️  Skipping Bedrock (no AWS credentials)")

    # Test Anthropic
    if os.getenv('ANTHROPIC_API_KEY'):
        try:
            provider = AnthropicProvider(api_key=os.getenv('ANTHROPIC_API_KEY'))
            client = provider.client

            print(f"\n{'='*70}")
            print("🧠 ANTHROPIC - Claude 3.5 Haiku")
            print(f"{'='*70}\n")
            print("Streaming: ", end='', flush=True)

            start = time.time()
            chunks = []

            with client.messages.stream(
                model='claude-3-5-haiku-20241022',
                max_tokens=200,
                temperature=0.7,
                messages=[{'role': 'user', 'content': PROMPT}]
            ) as stream:
                for text in stream.text_stream:
                    print(text, end='', flush=True)
                    chunks.append(text)

                final_message = stream.get_final_message()
                input_tokens = final_message.usage.input_tokens
                output_tokens = final_message.usage.output_tokens

            elapsed = time.time() - start
            cost = provider.estimate_cost(input_tokens, output_tokens, 'claude-3-5-haiku-20241022')

            print("\n\n✅ Complete!")
            print(f"   • Time: {elapsed:.2f}s")
            print(f"   • Tokens: {input_tokens} in + {output_tokens} out")
            print(f"   • Cost: ${cost:.6f}")
            print(f"   • Chunks: {len(chunks)}")
            print(f"   • Speed: {len(chunks)/elapsed:.1f} chunks/sec")

            results.append(("Anthropic (Claude 3.5 Haiku)", True, elapsed, len(chunks), cost))

        except Exception as e:
            print(f"\n❌ Anthropic setup failed: {e}")
            results.append(("Anthropic (Claude 3.5 Haiku)", False, 0, 0, 0))
    else:
        print("\n⏭️  Skipping Anthropic (no API key)")

    # Summary Table
    print(f"\n\n{'='*70}")
    print("📊 COMPARISON SUMMARY")
    print(f"{'='*70}")
    print(f"\n{'Provider':<30} {'Status':<10} {'Time':<10} {'Chunks':<10} {'Cost'}")
    print("-"*70)

    for name, success, time_taken, chunks, cost in results:
        status = "✅ PASS" if success else "❌ FAIL"
        time_str = f"{time_taken:.2f}s" if success else "N/A"
        chunks_str = str(chunks) if success else "N/A"
        cost_str = f"${cost:.6f}" if success else "N/A"
        print(f"{name:<30} {status:<10} {time_str:<10} {chunks_str:<10} {cost_str}")

    print()

    # Success rate
    total = len(results)
    passed = sum(1 for _, success, _, _, _ in results if success)
    print(f"\n✨ Result: {passed}/{total} providers streaming successfully!\n")

    return 0 if passed > 0 else 1


if __name__ == "__main__":
    sys.exit(main())

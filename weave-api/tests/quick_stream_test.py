#!/usr/bin/env python3
"""
Quick Streaming Test - Simple real-time streaming demo

This is a minimal script to quickly verify streaming works.
Choose one provider and watch the response stream in real-time!

Usage:
    # Test OpenAI (fastest to set up)
    cd weave-api
    uv run python tests/quick_stream_test.py
"""

import os
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv

load_dotenv()


def test_openai_quick():
    """Quick OpenAI streaming test."""
    from app.services.ai.openai_provider import OpenAIProvider

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ Error: OPENAI_API_KEY not found in .env file")
        print("Add it to weave-api/.env: OPENAI_API_KEY=sk-...")
        return False

    print("\n" + "=" * 60)
    print("🚀 OPENAI STREAMING TEST")
    print("=" * 60 + "\n")

    provider = OpenAIProvider(api_key=api_key)

    prompt = "Count from 1 to 5 slowly, explaining each number."

    print(f"Prompt: {prompt}\n")
    print("Response (streaming):")
    print("-" * 60)

    start = time.time()
    chunks = []

    try:
        for chunk in provider.stream(prompt=prompt, model="gpt-4o-mini"):
            if chunk["type"] == "chunk":
                # Print each word as it arrives
                print(chunk["content"], end="", flush=True)
                chunks.append(chunk)
            elif chunk["type"] == "done":
                elapsed = time.time() - start
                print("\n" + "-" * 60)
                print("\n✅ Success!")
                print(f"   Time: {elapsed:.2f}s")
                print(f"   Tokens: {chunk['input_tokens']} in + {chunk['output_tokens']} out")
                print(f"   Cost: ${chunk['cost_usd']:.6f}")
                print(f"   Chunks received: {len(chunks)}\n")
                return True

    except Exception as e:
        print(f"\n\n❌ Error: {e}\n")
        return False


def test_bedrock_quick():
    """Quick Bedrock streaming test."""
    from app.services.ai.bedrock_provider import BedrockProvider

    print("\n" + "=" * 60)
    print("☁️  BEDROCK STREAMING TEST")
    print("=" * 60 + "\n")

    if not (os.getenv("AWS_ACCESS_KEY_ID") or os.getenv("AWS_PROFILE")):
        print("❌ Error: AWS credentials not configured")
        print("Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env")
        print("Or configure AWS CLI profile")
        return False

    provider = BedrockProvider(region="us-east-1")

    prompt = "Count from 1 to 5 slowly, explaining each number."

    print(f"Prompt: {prompt}\n")
    print("Response (streaming):")
    print("-" * 60)

    start = time.time()
    chunks = []

    try:
        for chunk in provider.stream(prompt=prompt, model="claude-3-5-haiku"):
            if chunk["type"] == "chunk":
                print(chunk["content"], end="", flush=True)
                chunks.append(chunk)
            elif chunk["type"] == "done":
                elapsed = time.time() - start
                print("\n" + "-" * 60)
                print("\n✅ Success!")
                print(f"   Time: {elapsed:.2f}s")
                print(f"   Tokens: {chunk['input_tokens']} in + {chunk['output_tokens']} out")
                print(f"   Cost: ${chunk['cost_usd']:.6f}")
                print(f"   Chunks received: {len(chunks)}\n")
                return True

    except Exception as e:
        print(f"\n\n❌ Error: {e}\n")
        import traceback

        traceback.print_exc()
        return False


def main():
    """Run quick streaming test."""
    print("\n🔥 Quick Streaming Test - Real-Time AI Responses\n")

    # Try OpenAI first (most common)
    if os.getenv("OPENAI_API_KEY"):
        print("Found OpenAI API key, testing OpenAI streaming...")
        success = test_openai_quick()
        if success:
            print("\n✨ Streaming is working perfectly! Words appeared one-by-one, right?\n")
            return 0
        else:
            print("\n⚠️  OpenAI test failed. Check your API key.\n")

    # Try Bedrock if AWS is configured
    if os.getenv("AWS_ACCESS_KEY_ID") or os.getenv("AWS_PROFILE"):
        print("Found AWS credentials, testing Bedrock streaming...")
        success = test_bedrock_quick()
        if success:
            print("\n✨ Streaming is working perfectly! Words appeared one-by-one, right?\n")
            return 0
        else:
            print("\n⚠️  Bedrock test failed. Check your AWS credentials.\n")

    # No providers available
    print("\n❌ No API keys found!")
    print("\nTo test streaming, add to weave-api/.env:")
    print("  OPENAI_API_KEY=sk-...")
    print("  or configure AWS credentials for Bedrock\n")
    return 1


if __name__ == "__main__":
    sys.exit(main())

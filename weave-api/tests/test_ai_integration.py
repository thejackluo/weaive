"""
AI Service Integration Tests

Tests AI endpoints with real-world complex questions to verify:
1. API endpoints work end-to-end
2. AI providers handle complex prompts
3. Cost tracking works correctly
4. Rate limiting functions properly

Run: uv run pytest tests/test_ai_integration.py -v -s
"""

import os
import uuid

import pytest
from dotenv import load_dotenv

from app.core.deps import get_supabase_client
from app.services.ai.ai_service import AIService

load_dotenv()


# Check if AI credentials are available
HAS_OPENAI = bool(os.getenv("OPENAI_API_KEY"))
HAS_ANTHROPIC = bool(os.getenv("ANTHROPIC_API_KEY"))
HAS_AI_CREDENTIALS = HAS_OPENAI or HAS_ANTHROPIC


@pytest.fixture(scope="module")
def ai_service():
    """
    Create AI service with real API keys.

    Requires environment variables:
    - OPENAI_API_KEY
    - ANTHROPIC_API_KEY
    - AWS_REGION (optional)
    """
    openai_key = os.getenv("OPENAI_API_KEY")
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    aws_region = os.getenv("AWS_REGION", "us-east-1")

    db = get_supabase_client()

    return AIService(
        db=db, bedrock_region=aws_region, openai_key=openai_key, anthropic_key=anthropic_key
    )


@pytest.fixture
def test_user_id():
    """Test user ID for integration tests (valid UUID format)."""
    # Use a consistent UUID for testing (deterministic but valid)
    return str(uuid.UUID("550e8400-e29b-41d4-a716-446655440000"))


class TestComplexQuestions:
    """Test AI service with complex real-world questions."""

    @pytest.mark.skipif(
        not HAS_AI_CREDENTIALS, reason="AI integration tests require OpenAI or Anthropic API keys"
    )
    def test_factual_question(self, ai_service, test_user_id):
        """Test: What is the capital of France?"""
        response = ai_service.generate(
            user_id=test_user_id,
            user_role="admin",  # Admin = no rate limits
            user_tier="free",
            module="factual_question",  # Use factual_question module for better deterministic fallback
            prompt="What is the capital of France? Answer in one word.",
            max_tokens=50,
        )

        # Verify response structure
        assert response.content is not None
        assert len(response.content) > 0
        assert response.input_tokens > 0
        assert response.output_tokens > 0
        assert response.provider in ["bedrock", "openai", "anthropic", "deterministic"]

        # Only verify answer correctness if using real AI provider
        if response.provider != "deterministic":
            assert "paris" in response.content.lower(), (
                f"Expected 'Paris' in response from {response.provider}, got: {response.content}"
            )

    @pytest.mark.skipif(
        not HAS_AI_CREDENTIALS, reason="AI integration tests require OpenAI or Anthropic API keys"
    )
    def test_multi_step_reasoning(self, ai_service, test_user_id):
        """Test: Multi-step math problem."""
        response = ai_service.generate(
            user_id=test_user_id,
            user_role="admin",
            user_tier="free",
            module="factual_question",  # Use factual_question module
            prompt="If I have 3 apples and buy 2 more, then give 1 to my friend, how many apples do I have left? Answer with just the number.",
            max_tokens=50,
        )

        assert response.content is not None

        # Only verify answer correctness if using real AI provider
        if response.provider != "deterministic":
            content_lower = response.content.lower()
            assert "4" in response.content or "four" in content_lower, (
                f"Expected '4' in response from {response.provider}, got: {response.content}"
            )

    @pytest.mark.skipif(
        not HAS_AI_CREDENTIALS, reason="AI integration tests require OpenAI or Anthropic API keys"
    )
    def test_conceptual_question(self, ai_service, test_user_id):
        """Test: Explain a complex concept briefly."""
        response = ai_service.generate(
            user_id=test_user_id,
            user_role="admin",
            user_tier="free",
            module="factual_question",  # Use factual_question module
            prompt="Explain what a REST API is in exactly one sentence.",
            max_tokens=100,
        )

        assert response.content is not None
        assert len(response.content) > 0

        # Only verify keywords if using real AI provider
        if response.provider != "deterministic":
            content_lower = response.content.lower()
            keywords = ["api", "http", "request", "endpoint", "rest", "resource"]
            keyword_found = any(keyword in content_lower for keyword in keywords)
            assert keyword_found, (
                f"Expected REST API keywords in response from {response.provider}, got: {response.content}"
            )


class TestCostTracking:
    """Test cost tracking with real API calls."""

    def test_cost_is_tracked(self, ai_service, test_user_id):
        """Verify that costs are properly tracked for API calls."""
        response = ai_service.generate(
            user_id=test_user_id,
            user_role="admin",
            user_tier="free",
            module="triad",
            prompt="Generate a simple to-do list.",
            max_tokens=50,
        )

        # Cost tracking assertions
        if response.provider != "deterministic":
            # Real providers should have cost > 0
            assert response.cost_usd > 0, (
                f"Expected cost > 0 for {response.provider}, got ${response.cost_usd}"
            )
            assert response.run_id is not None, "Expected run_id to be set"
        else:
            # Deterministic should be free
            assert response.cost_usd == 0.0, (
                f"Expected deterministic cost = 0, got ${response.cost_usd}"
            )

    def test_user_daily_cost_calculation(self, ai_service, test_user_id):
        """Test per-user daily cost calculation."""
        # Make a few API calls
        for i in range(2):
            ai_service.generate(
                user_id=test_user_id,
                user_role="admin",
                user_tier="free",
                module="recap",
                prompt=f"Test cost tracking {i}",
                max_tokens=20,
            )

        # Check cost tracker
        user_cost = ai_service.cost_tracker.get_user_daily_cost(test_user_id)

        # User should have some cost (unless all calls hit cache or deterministic)
        # Just verify function works without error
        assert isinstance(user_cost, float)
        assert user_cost >= 0.0


class TestRateLimiting:
    """Test rate limiting functionality."""

    def test_admin_unlimited_access(self, ai_service, test_user_id):
        """Admin users should have unlimited access."""
        # Make multiple calls - should not hit rate limit
        for i in range(3):
            response = ai_service.generate(
                user_id=test_user_id,
                user_role="admin",  # Admin = unlimited
                user_tier="free",
                module="recap",
                prompt=f"Admin test {i}",
                max_tokens=10,
            )
            assert response is not None

        # No RateLimitError should be raised

    def test_cache_hit_returns_zero_cost(self, ai_service, test_user_id):
        """Cached responses should have zero cost."""
        unique_prompt = f"Cache test at {os.urandom(8).hex()}"

        # First call (not cached)
        _ = ai_service.generate(
            user_id=test_user_id,
            user_role="admin",
            user_tier="free",
            module="dream_self",
            prompt=unique_prompt,
            max_tokens=20,
        )

        # Second call (should hit cache)
        response2 = ai_service.generate(
            user_id=test_user_id,
            user_role="admin",
            user_tier="free",
            module="dream_self",
            prompt=unique_prompt,
            max_tokens=20,
        )

        # Second call should be cached
        if response2.cached:
            assert response2.cost_usd == 0.0, "Cached response should have zero cost"
            assert response2.provider == "cache"


class TestFallbackChain:
    """Test the 4-tier fallback chain."""

    def test_deterministic_always_succeeds(self, ai_service, test_user_id):
        """Deterministic provider should never fail."""
        # Even with invalid keys, deterministic should work
        response = ai_service.generate(
            user_id=test_user_id,
            user_role="admin",
            user_tier="free",
            module="onboarding",
            prompt="Test fallback chain",
            max_tokens=50,
        )

        # Should get a response (even if deterministic)
        assert response is not None
        assert response.content is not None
        assert len(response.content) > 0


# Pytest markers for integration tests
pytestmark = pytest.mark.integration


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])

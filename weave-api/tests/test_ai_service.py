"""
AI Service Unit Tests

Tests for AI provider abstraction layer with fallback chains, cost tracking,
rate limiting, and budget enforcement.

Run: uv run pytest tests/test_ai_service.py -v
"""

import pytest
from unittest.mock import Mock, MagicMock, patch
from datetime import datetime, timedelta

from app.services.ai import (
    AIService,
    AIResponse,
    AIProviderError,
    BedrockProvider,
    OpenAIProvider,
    AnthropicProvider,
    DeterministicProvider,
    CostTracker,
    RateLimiter,
    RateLimitError,
)
from app.services.ai.templates import get_template


# Fixtures
@pytest.fixture
def mock_db():
    """Mock Supabase client."""
    db = Mock()
    db.table = Mock(return_value=db)
    db.select = Mock(return_value=db)
    db.insert = Mock(return_value=db)
    db.update = Mock(return_value=db)
    db.eq = Mock(return_value=db)
    db.gte = Mock(return_value=db)
    db.lte = Mock(return_value=db)
    db.order = Mock(return_value=db)
    db.limit = Mock(return_value=db)
    db.execute = Mock(return_value=Mock(data=[], count=0))
    return db


@pytest.fixture
def ai_service(mock_db):
    """AI service with mocked DB."""
    return AIService(
        db=mock_db,
        bedrock_region='us-east-1',
        openai_key='sk-test-openai',
        anthropic_key='sk-ant-test-anthropic'
    )


# Deterministic Provider Tests
def test_deterministic_provider_always_succeeds():
    """Deterministic provider should never fail."""
    provider = DeterministicProvider()

    response = provider.complete(
        prompt="Test prompt",
        module="triad",
        variant="default",
        task_1="Task 1",
        task_2="Task 2",
        task_3="Task 3"
    )

    assert response.provider == "deterministic"
    assert response.cost_usd == 0.0
    assert len(response.content) > 0
    assert "Task 1" in response.content or "task_1" in response.content


def test_deterministic_provider_templates():
    """Test extensible template system."""
    # Test triad default template
    content = get_template('triad', 'default', task_1='Gym', task_2='Code', task_3='Read')
    assert 'Gym' in content
    assert 'Code' in content
    assert 'Read' in content

    # Test recap template
    content = get_template('recap', 'default', completed_count=5, proof_count=3)
    assert '5' in content
    assert '3' in content

    # Test unknown module fallback
    content = get_template('unknown_module', 'default')
    assert 'unknown_module' in content or 'help' in content.lower()


# Cost Tracker Tests
def test_cost_tracker_get_total_daily_cost(mock_db):
    """Test total daily cost calculation."""
    # Mock DB response with cost data
    mock_db.execute.return_value = Mock(data=[
        {'cost_estimate': 0.50},
        {'cost_estimate': 1.20},
        {'cost_estimate': 0.30},
    ])

    tracker = CostTracker(mock_db)
    cost = tracker.get_total_daily_cost()

    assert cost == 2.0


def test_cost_tracker_get_user_daily_cost(mock_db):
    """Test per-user daily cost calculation."""
    mock_db.execute.return_value = Mock(data=[
        {'cost_estimate': 0.01},
        {'cost_estimate': 0.015},
    ])

    tracker = CostTracker(mock_db)
    cost = tracker.get_user_daily_cost('user_123')

    assert cost == 0.025


def test_cost_tracker_is_total_budget_exceeded(mock_db):
    """Test total budget enforcement."""
    tracker = CostTracker(mock_db)

    # Under budget
    mock_db.execute.return_value = Mock(data=[{'cost_estimate': 50.0}])
    assert not tracker.is_total_budget_exceeded()

    # Over budget
    mock_db.execute.return_value = Mock(data=[{'cost_estimate': 100.0}])
    assert tracker.is_total_budget_exceeded()


def test_cost_tracker_is_user_budget_exceeded_free(mock_db):
    """Test free user budget enforcement ($0.02/day)."""
    tracker = CostTracker(mock_db)

    # Under budget
    mock_db.execute.return_value = Mock(data=[{'cost_estimate': 0.01}])
    assert not tracker.is_user_budget_exceeded('user_123', 'free')

    # Over budget
    mock_db.execute.return_value = Mock(data=[{'cost_estimate': 0.03}])
    assert tracker.is_user_budget_exceeded('user_123', 'free')


def test_cost_tracker_is_user_budget_exceeded_paid(mock_db):
    """Test paid user budget enforcement ($0.10/day)."""
    tracker = CostTracker(mock_db)

    # Under budget
    mock_db.execute.return_value = Mock(data=[{'cost_estimate': 0.05}])
    assert not tracker.is_user_budget_exceeded('user_456', 'paid')

    # Over budget
    mock_db.execute.return_value = Mock(data=[{'cost_estimate': 0.15}])
    assert tracker.is_user_budget_exceeded('user_456', 'paid')


# Rate Limiter Tests
def test_rate_limiter_admin_unlimited(mock_db):
    """Admin users should have unlimited access."""
    limiter = RateLimiter(mock_db)

    # Even with many calls, admin should not be limited
    mock_db.execute.return_value = Mock(count=100)

    result = limiter.check_user_limit('admin_user', 'admin', 'free')
    assert result is True  # No exception raised


def test_rate_limiter_paid_hourly_limit(mock_db):
    """Paid users should have 10 calls/hour limit."""
    limiter = RateLimiter(mock_db)

    # Under limit
    mock_db.execute.return_value = Mock(count=5)
    result = limiter.check_user_limit('user_123', 'user', 'paid')
    assert result is True

    # At limit
    mock_db.execute.return_value = Mock(count=10)
    with pytest.raises(RateLimitError) as exc_info:
        limiter.check_user_limit('user_123', 'user', 'paid')

    assert 'hour' in str(exc_info.value).lower()


def test_rate_limiter_free_daily_limit(mock_db):
    """Free users should have 10 calls/day limit."""
    limiter = RateLimiter(mock_db)

    # Under limit
    mock_db.execute.return_value = Mock(count=8)
    result = limiter.check_user_limit('user_456', 'user', 'free')
    assert result is True

    # At limit
    mock_db.execute.return_value = Mock(count=10)
    with pytest.raises(RateLimitError) as exc_info:
        limiter.check_user_limit('user_456', 'user', 'free')

    assert 'day' in str(exc_info.value).lower()


def test_rate_limiter_get_remaining_calls_admin(mock_db):
    """Admin should show unlimited remaining calls."""
    limiter = RateLimiter(mock_db)

    result = limiter.get_user_remaining_calls('admin_user', 'admin', 'free')

    assert result['remaining'] is None
    assert result['limit'] is None
    assert result['period'] == 'unlimited'


def test_rate_limiter_get_remaining_calls_paid(mock_db):
    """Paid users should show hourly remaining calls."""
    limiter = RateLimiter(mock_db)
    mock_db.execute.return_value = Mock(count=7)

    result = limiter.get_user_remaining_calls('user_123', 'user', 'paid')

    assert result['remaining'] == 3  # 10 - 7
    assert result['limit'] == 10
    assert result['period'] == 'hour'


def test_rate_limiter_get_remaining_calls_free(mock_db):
    """Free users should show daily remaining calls."""
    limiter = RateLimiter(mock_db)
    mock_db.execute.return_value = Mock(count=4)

    result = limiter.get_user_remaining_calls('user_456', 'user', 'free')

    assert result['remaining'] == 6  # 10 - 4
    assert result['limit'] == 10
    assert result['period'] == 'day'


# AI Service Integration Tests
def test_ai_service_cache_hit(mock_db):
    """Test cache hit returns cached response without API call."""
    service = AIService(mock_db, openai_key='sk-test')

    # Mock cache hit
    mock_db.execute.return_value = Mock(data=[{
        'id': 'run_123',
        'input_tokens': 100,
        'output_tokens': 50,
        'model': 'gpt-4o-mini',
        'ai_artifacts': [{
            'json': {'content': 'Cached response'}
        }]
    }])

    response = service.generate(
        user_id='user_123',
        user_role='user',
        user_tier='free',
        module='triad',
        prompt='Test prompt'
    )

    assert response.cached is True
    assert response.provider == 'cache'
    assert response.cost_usd == 0.0
    assert response.content == 'Cached response'


def test_ai_service_budget_exceeded_uses_deterministic(mock_db, ai_service):
    """When budget exceeded, should skip paid providers and use deterministic."""
    # Mock budget exceeded
    mock_db.execute.return_value = Mock(data=[{'cost_estimate': 100.0}])

    # Mock rate limiter (pass)
    with patch.object(ai_service.rate_limiter, 'check_user_limit', return_value=True):
        # Mock no cache
        with patch.object(ai_service, '_check_cache', return_value=None):
            # Mock create run
            with patch.object(ai_service, '_create_run', return_value='run_123'):
                response = ai_service.generate(
                    user_id='user_123',
                    user_role='user',
                    user_tier='free',
                    module='triad',
                    prompt='Test prompt',
                    task_1='Task 1',
                    task_2='Task 2',
                    task_3='Task 3'
                )

    assert response.provider == 'deterministic'
    assert response.cost_usd == 0.0


def test_ai_service_rate_limit_blocks_request(mock_db, ai_service):
    """Rate limit should block request before checking cache."""
    # Mock rate limit exceeded
    with patch.object(ai_service.rate_limiter, 'check_user_limit', side_effect=RateLimitError(
        "Rate limit exceeded",
        user_id='user_123',
        user_tier='free',
        limit='10 calls/day'
    )):
        with pytest.raises(RateLimitError):
            ai_service.generate(
                user_id='user_123',
                user_role='user',
                user_tier='free',
                module='triad',
                prompt='Test prompt'
            )


def test_ai_service_fallback_chain(mock_db):
    """Test fallback chain: Bedrock → OpenAI → Anthropic → Deterministic."""
    service = AIService(mock_db, openai_key='sk-test', anthropic_key='sk-ant-test')

    # Mock all paid providers fail
    with patch.object(BedrockProvider, 'complete', side_effect=AIProviderError("Bedrock error", "bedrock")):
        with patch.object(OpenAIProvider, 'complete', side_effect=AIProviderError("OpenAI error", "openai")):
            with patch.object(AnthropicProvider, 'complete', side_effect=AIProviderError("Anthropic error", "anthropic")):
                # Mock rate limiter (pass)
                with patch.object(service.rate_limiter, 'check_user_limit', return_value=True):
                    # Mock no cache
                    with patch.object(service, '_check_cache', return_value=None):
                        # Mock create run
                        with patch.object(service, '_create_run', return_value='run_123'):
                            response = service.generate(
                                user_id='user_123',
                                user_role='user',
                                user_tier='free',
                                module='triad',
                                prompt='Test prompt',
                                task_1='Task 1',
                                task_2='Task 2',
                                task_3='Task 3'
                            )

    # Should fall back to deterministic
    assert response.provider == 'deterministic'
    assert response.cost_usd == 0.0
    assert len(response.content) > 0


# Provider-Specific Tests
def test_openai_provider_token_counting():
    """Test OpenAI token counting with tiktoken."""
    provider = OpenAIProvider(api_key='sk-test')

    text = "This is a test prompt for token counting."
    tokens = provider.count_tokens(text, 'gpt-4o-mini')

    assert tokens > 0
    assert tokens < len(text)  # Should be less than character count


def test_openai_provider_cost_estimation():
    """Test OpenAI cost estimation."""
    provider = OpenAIProvider(api_key='sk-test')

    cost = provider.estimate_cost(1000, 500, 'gpt-4o-mini')

    # gpt-4o-mini: $0.15/$0.60 per MTok
    expected_cost = (1000 * 0.15 / 1_000_000) + (500 * 0.60 / 1_000_000)
    assert abs(cost - expected_cost) < 0.000001


def test_anthropic_provider_cost_estimation():
    """Test Anthropic cost estimation."""
    provider = AnthropicProvider(api_key='sk-ant-test')

    cost = provider.estimate_cost(1000, 500, 'claude-3-7-sonnet-20250219')

    # Claude 3.7 Sonnet: $3.00/$15.00 per MTok
    expected_cost = (1000 * 3.00 / 1_000_000) + (500 * 15.00 / 1_000_000)
    assert abs(cost - expected_cost) < 0.000001


def test_bedrock_provider_cost_estimation():
    """Test Bedrock cost estimation."""
    provider = BedrockProvider(region='us-east-1')

    cost = provider.estimate_cost(1000, 500, 'anthropic.claude-3-5-haiku-20241022-v1:0')

    # Claude 3.5 Haiku: $0.25/$1.25 per MTok
    expected_cost = (1000 * 0.25 / 1_000_000) + (500 * 1.25 / 1_000_000)
    assert abs(cost - expected_cost) < 0.000001


# Input Hash Tests
def test_ai_service_compute_hash():
    """Test input hash computation for caching."""
    service = AIService(Mock())

    hash1 = service._compute_hash("prompt 1", "triad", "gpt-4o-mini")
    hash2 = service._compute_hash("prompt 1", "triad", "gpt-4o-mini")
    hash3 = service._compute_hash("prompt 2", "triad", "gpt-4o-mini")

    # Same input -> same hash
    assert hash1 == hash2

    # Different input -> different hash
    assert hash1 != hash3

    # Hash should be 64 characters (SHA-256)
    assert len(hash1) == 64


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])

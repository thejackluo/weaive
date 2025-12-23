"""
Unit Tests for Unified AIProviderBase

Tests for common AI provider infrastructure (cost tracking, rate limiting, error handling).

Story: 1.5.3 - AI Services Standardization
Run: uv run pytest tests/test_ai_provider_base.py -v
"""

from unittest.mock import Mock

import pytest

from app.services.ai_provider_base import AIProviderBase, AIProviderError


class ConcreteTestProvider(AIProviderBase):
    """Concrete implementation for testing abstract base class."""
    
    def __init__(self, db=None, available=True, provider_name="test-provider"):
        super().__init__(db)
        self._available = available
        self._provider_name = provider_name
    
    def get_provider_name(self) -> str:
        return self._provider_name
    
    def is_available(self) -> bool:
        return self._available


@pytest.fixture
def mock_db():
    """Mock Supabase client with chainable methods."""
    db = Mock()
    
    # Create chainable mock for Supabase query builder pattern
    chain_mock = Mock()
    chain_mock.table = Mock(return_value=chain_mock)
    chain_mock.insert = Mock(return_value=chain_mock)
    chain_mock.execute = Mock(return_value=Mock(data=[{'id': 'test-run-id'}]))
    
    db.table = Mock(return_value=chain_mock)
    
    return db


@pytest.fixture
def provider(mock_db):
    """Create test provider with mocked DB."""
    return ConcreteTestProvider(db=mock_db, available=True, provider_name="gpt-4o-mini")


# Abstract method tests
def test_provider_must_implement_get_provider_name():
    """Concrete providers must implement get_provider_name()."""
    class IncompleteProvider(AIProviderBase):
        def is_available(self) -> bool:
            return True
    
    with pytest.raises(TypeError, match="Can't instantiate abstract class"):
        IncompleteProvider()


def test_provider_must_implement_is_available():
    """Concrete providers must implement is_available()."""
    class IncompleteProvider(AIProviderBase):
        def get_provider_name(self) -> str:
            return "test"
    
    with pytest.raises(TypeError, match="Can't instantiate abstract class"):
        IncompleteProvider()


# Provider identification tests
def test_get_provider_name(provider):
    """Provider should return correct name."""
    assert provider.get_provider_name() == "gpt-4o-mini"


def test_is_available_when_configured(provider):
    """Provider should report available when configured."""
    assert provider.is_available() is True


def test_is_available_when_not_configured():
    """Provider should report unavailable when not configured."""
    provider = ConcreteTestProvider(available=False)
    assert provider.is_available() is False


# Cost tracking tests (log_to_ai_runs)
def test_log_to_ai_runs_success(provider, mock_db):
    """Should log AI call to ai_runs table."""
    run_id = provider.log_to_ai_runs(
        user_id="user-123",
        operation_type="triad_generation",
        input_tokens=120,
        output_tokens=300,
        cost_usd=0.0025,
        duration_ms=1450,
        model="gpt-4o-mini-2024-07-18",
        status="success",
        local_date="2025-12-22",
        input_hash="abc123",
    )
    
    # Verify ai_runs insert was called
    mock_db.table.assert_called_with('ai_runs')
    insert_call = mock_db.insert.call_args
    assert insert_call is not None
    
    # Verify logged data
    logged_data = insert_call[0][0]
    assert logged_data['user_id'] == "user-123"
    assert logged_data['operation_type'] == "triad_generation"
    assert logged_data['provider'] == "gpt-4o-mini"
    assert logged_data['model'] == "gpt-4o-mini-2024-07-18"
    assert logged_data['input_tokens'] == 120
    assert logged_data['output_tokens'] == 300
    assert logged_data['cost_estimate'] == 0.0025
    assert logged_data['duration_ms'] == 1450
    assert logged_data['status'] == "success"
    assert logged_data['local_date'] == "2025-12-22"
    assert logged_data['input_hash'] == "abc123"
    
    # Verify run_id returned
    assert run_id == "test-run-id"


def test_log_to_ai_runs_with_defaults(provider, mock_db):
    """Should use default values for optional parameters."""
    run_id = provider.log_to_ai_runs(
        user_id="user-456",
        operation_type="image_analysis",
        input_tokens=560,
        output_tokens=200,
        cost_usd=0.0005,
        duration_ms=800,
    )
    
    # Verify defaults applied
    logged_data = mock_db.insert.call_args[0][0]
    assert logged_data['model'] == "gpt-4o-mini"  # defaults to get_provider_name()
    assert logged_data['status'] == "success"  # default status
    assert 'local_date' in logged_data  # auto-generated
    assert logged_data['input_hash'] is None  # optional


def test_log_to_ai_runs_without_db():
    """Should handle missing DB gracefully (testing mode)."""
    provider = ConcreteTestProvider(db=None)
    
    run_id = provider.log_to_ai_runs(
        user_id="user-789",
        operation_type="transcription",
        input_tokens=45,
        output_tokens=78,
        cost_usd=0.0019,
        duration_ms=2000,
    )
    
    # Should return None without crashing
    assert run_id is None


def test_log_to_ai_runs_error_handling(provider, mock_db):
    """Should handle database errors gracefully."""
    # Simulate database error
    mock_db.execute.side_effect = Exception("Database connection lost")
    
    run_id = provider.log_to_ai_runs(
        user_id="user-error",
        operation_type="test_op",
        input_tokens=100,
        output_tokens=200,
        cost_usd=0.001,
        duration_ms=500,
    )
    
    # Should fail gracefully without blocking AI operation
    assert run_id is None


# Rate limiting tests (check_rate_limit)
def test_check_rate_limit_admin_bypass(provider):
    """Admin users should bypass rate limits."""
    result = provider.check_rate_limit(
        user_id="admin-user",
        operation_type="triad_generation",
        user_role="admin",
        user_tier="free",
    )
    
    # Admin should always pass
    assert result is True


def test_check_rate_limit_without_db():
    """Should handle missing DB gracefully (fail open)."""
    provider = ConcreteTestProvider(db=None)
    
    result = provider.check_rate_limit(
        user_id="user-no-db",
        operation_type="test_op",
        user_role="user",
        user_tier="free",
    )
    
    # Should fail open (allow request)
    assert result is True


def test_check_rate_limit_normal_user(provider):
    """Normal users should pass rate limit check (delegated to RateLimiter)."""
    result = provider.check_rate_limit(
        user_id="normal-user",
        operation_type="image_analysis",
        user_role="user",
        user_tier="paid",
    )
    
    # Simplified check passes (full implementation in RateLimiter)
    assert result is True


# Error handling tests
def test_ai_provider_error_creation():
    """AIProviderError should capture all error details."""
    original_error = ValueError("Invalid API key")
    
    error = AIProviderError(
        message="Provider authentication failed",
        provider="gpt-4o-mini",
        retryable=False,
        error_code="AUTH_ERROR",
        original_error=original_error,
    )
    
    assert error.message == "Provider authentication failed"
    assert error.provider == "gpt-4o-mini"
    assert error.retryable is False
    assert error.error_code == "AUTH_ERROR"
    assert error.original_error is original_error


def test_ai_provider_error_defaults():
    """AIProviderError should have sensible defaults."""
    error = AIProviderError(
        message="Unknown error",
        provider="test-provider",
    )
    
    assert error.retryable is True  # Default: retryable
    assert error.error_code == "AI_PROVIDER_ERROR"  # Default error code
    assert error.original_error is None  # No original error


# Integration tests
def test_multiple_providers_with_same_base():
    """Multiple providers should work independently."""
    provider_1 = ConcreteTestProvider(provider_name="gpt-4o-mini")
    provider_2 = ConcreteTestProvider(provider_name="claude-3.7-sonnet")
    provider_3 = ConcreteTestProvider(provider_name="gemini-3-flash")
    
    assert provider_1.get_provider_name() == "gpt-4o-mini"
    assert provider_2.get_provider_name() == "claude-3.7-sonnet"
    assert provider_3.get_provider_name() == "gemini-3-flash"
    
    assert all([
        provider_1.is_available(),
        provider_2.is_available(),
        provider_3.is_available(),
    ])


def test_provider_polymorphism():
    """Providers should be polymorphic via base class."""
    providers = [
        ConcreteTestProvider(provider_name="gpt-4o-mini"),
        ConcreteTestProvider(provider_name="claude-3.7-sonnet"),
        ConcreteTestProvider(provider_name="gemini-3-flash"),
    ]
    
    # All providers should share common interface
    for provider in providers:
        assert isinstance(provider, AIProviderBase)
        assert callable(provider.get_provider_name)
        assert callable(provider.is_available)
        assert callable(provider.log_to_ai_runs)
        assert callable(provider.check_rate_limit)

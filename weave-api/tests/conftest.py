"""Pytest configuration and shared fixtures."""

import pytest
from fastapi.testclient import TestClient

from app.main import app

# Import integration test fixtures (for tests/integration/)
try:
    from tests.support.fixtures.database_fixture import (
        clean_test_users,  # noqa: F401
        database_transaction,  # noqa: F401
        test_supabase_client,  # noqa: F401
    )
except ImportError:
    # Fixtures not available if dependencies not installed
    pass


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
def mock_supabase_client():
    """Mock Supabase client for testing without database."""
    # TODO: Implement mock Supabase client
    # This will be used for tests that don't need real database
    pass


def cleanup_test_data():
    """Clean up test data from database between tests.

    This function should:
    1. Truncate test tables (preserve schema)
    2. Reset sequences
    3. Clear any test-specific data

    Usage: Call at the end of each test or in a fixture
    """
    # TODO: Implement cleanup logic when test database is configured
    # Example:
    # - TRUNCATE user_profiles CASCADE;
    # - TRUNCATE goals CASCADE;
    # - Reset sequences to 1
    pass


def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests (require external services)"
    )

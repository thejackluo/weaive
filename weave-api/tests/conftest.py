"""Pytest configuration and shared fixtures."""

import base64
import jwt
import pytest
from datetime import datetime, timedelta
from unittest.mock import MagicMock, Mock
from fastapi.testclient import TestClient
from uuid import uuid4

from app.main import app
from app.core.deps import get_current_user, get_supabase_client

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


# Test JWT secret for generating tokens
TEST_JWT_SECRET = "test-secret-key-for-pytest-only-do-not-use-in-production"

# Test user IDs
TEST_USER_ID = "550e8400-e29b-41d4-a716-446655440000"
ANOTHER_USER_ID = "660e8400-e29b-41d4-a716-446655440001"


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


def create_test_jwt(user_id: str, email: str = "test@example.com") -> str:
    """
    Create a test JWT token for authentication.

    Args:
        user_id: User ID (UUID string)
        email: User email

    Returns:
        str: JWT token
    """
    payload = {
        "sub": user_id,
        "email": email,
        "role": "authenticated",
        "aud": "authenticated",
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=1),
    }
    return jwt.encode(payload, TEST_JWT_SECRET, algorithm="HS256")


@pytest.fixture
def test_user_token() -> str:
    """Generate JWT token for test user."""
    return create_test_jwt(TEST_USER_ID, "testuser@example.com")


@pytest.fixture
def another_user_token() -> str:
    """Generate JWT token for another test user (for testing RLS isolation)."""
    return create_test_jwt(ANOTHER_USER_ID, "anotheruser@example.com")


@pytest.fixture
def authenticated_client(client, test_user_token):
    """
    Create an authenticated test client with JWT token.

    This fixture overrides the get_current_user dependency to bypass
    JWT validation and return a mock user payload.
    """
    def mock_get_current_user():
        return {
            "sub": TEST_USER_ID,
            "email": "testuser@example.com",
            "role": "authenticated",
        }

    app.dependency_overrides[get_current_user] = mock_get_current_user
    yield client
    app.dependency_overrides.clear()


@pytest.fixture
def valid_origin_story_data():
    """Sample valid origin story request data."""
    # Minimal valid base64-encoded JPEG (1x1 pixel)
    sample_photo = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA3wAA="

    # Minimal valid AAC audio
    sample_audio = "data:audio/aac;base64,AAAAGZ0eXBNNEEgAAAAAE00NEFtcDQyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="

    return {
        "photo_base64": sample_photo,
        "audio_base64": sample_audio,
        "audio_duration_seconds": 42,
        "from_text": "You've been feeling scattered — like there's too much to do, but no clear direction.",
        "to_text": "You want to become someone with Clear Direction, High Standards, and Self Aware — someone who acts with purpose.",
    }


@pytest.fixture
def mock_supabase_client():
    """
    Mock Supabase client for testing without database.

    This fixture returns a fully mocked Supabase client with common
    methods stubbed out. Customize the return values in individual tests.
    """
    mock_client = MagicMock()

    # Mock storage methods
    mock_storage = MagicMock()
    mock_bucket = MagicMock()

    # Mock successful upload
    mock_bucket.upload.return_value = {"path": "mock-path"}

    # Mock successful signed URL generation
    mock_bucket.create_signed_url.return_value = {
        "signedURL": "https://mock-storage.supabase.co/signed-url"
    }

    mock_storage.from_.return_value = mock_bucket
    mock_client.storage = mock_storage

    # Mock database methods
    mock_table = MagicMock()
    mock_table.insert.return_value.execute.return_value = {
        "data": [{"id": str(uuid4()), "user_id": TEST_USER_ID}]
    }
    mock_table.select.return_value.eq.return_value.execute.return_value = {"data": []}
    mock_table.update.return_value.eq.return_value.execute.return_value = {"data": []}

    mock_client.table.return_value = mock_table
    mock_client.from_.return_value = mock_table

    return mock_client


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

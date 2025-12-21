"""Pytest configuration and shared fixtures."""

from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock
from uuid import uuid4

import jwt
import pytest
from fastapi.testclient import TestClient

from app.core.deps import get_current_user
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
def authenticated_client(client, test_user_token, mock_supabase_client):
    """
    Create an authenticated test client with JWT token and mock database.

    This fixture overrides both get_current_user and get_supabase_client
    dependencies to bypass JWT validation and use mock database client.
    """
    from app.core.deps import get_supabase_client

    def mock_get_current_user():
        return {
            "sub": TEST_USER_ID,
            "email": "testuser@example.com",
            "role": "authenticated",
        }

    app.dependency_overrides[get_current_user] = mock_get_current_user
    app.dependency_overrides[get_supabase_client] = lambda: mock_supabase_client
    yield client
    app.dependency_overrides.clear()


@pytest.fixture
def valid_origin_story_data():
    """Sample valid origin story request data."""
    # Minimal valid base64-encoded JPEG (104 bytes)
    sample_photo = "data:image/jpeg;base64,/9j/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="

    # Minimal valid AAC audio (112 bytes)
    sample_audio = "data:audio/aac;base64,AAAAGGZ0eXBNNEEgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="

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

    # Track state for origin_stories to enable duplicate detection
    origin_stories_state = []

    # Mock database methods with proper table-specific responses
    def mock_table_call(table_name):
        mock_table = MagicMock()

        # Create mock response objects with .data attribute
        def create_response(data):
            response = MagicMock()
            response.data = data
            return response

        if table_name == "user_profiles":
            # Mock user profile with all required fields
            profile_data = [{
                "id": TEST_USER_ID,
                "auth_user_id": TEST_USER_ID,
                "first_bind_completed_at": None,
                "user_level": 0,
                "preferred_name": "Test User",
                "core_personality": "supportive_direct",
                "identity_traits": ["Clear Direction", "High Standards", "Self Aware"],
                "personality_selected_at": "2025-12-20T10:00:00Z",
                "updated_at": "2025-12-20T10:00:00Z",
            }]
            mock_table.select.return_value.eq.return_value.execute.return_value = create_response(profile_data)

            update_data = [{
                "id": TEST_USER_ID,
                "first_bind_completed_at": datetime.now(timezone.utc).isoformat(),
                "user_level": 1,
            }]
            mock_table.update.return_value.eq.return_value.execute.return_value = create_response(update_data)
        elif table_name == "origin_stories":
            # Mock origin story creation with state tracking
            # SELECT queries return current state
            mock_select = MagicMock()
            mock_select_eq = MagicMock()
            mock_select_eq.execute.return_value = create_response(origin_stories_state[:])
            mock_select.eq.return_value = mock_select_eq
            mock_table.select.return_value = mock_select

            # INSERT adds to state
            def mock_insert_execute():
                origin_data = {
                    "id": str(uuid4()),
                    "user_id": TEST_USER_ID,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
                origin_stories_state.append(origin_data)
                return create_response([origin_data])

            mock_insert = MagicMock()
            mock_insert.execute.side_effect = mock_insert_execute
            mock_table.insert.return_value = mock_insert
        elif table_name == "subtask_instances":
            # Mock bind instance creation
            bind_data = [{
                "id": str(uuid4()),
                "user_id": TEST_USER_ID,
                "status": "done",
            }]
            mock_table.insert.return_value.execute.return_value = create_response(bind_data)
        else:
            # Default mock for other tables
            mock_table.select.return_value.eq.return_value.execute.return_value = create_response([])
            default_insert_data = [{"id": str(uuid4()), "user_id": TEST_USER_ID}]
            mock_table.insert.return_value.execute.return_value = create_response(default_insert_data)
            mock_table.update.return_value.eq.return_value.execute.return_value = create_response([])

        return mock_table

    mock_client.table = mock_table_call
    mock_client.from_ = mock_table_call

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

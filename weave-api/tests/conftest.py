"""Pytest configuration and shared fixtures for integration tests."""

import os
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import MagicMock
from uuid import uuid4

import jwt
import pytest
from dotenv import load_dotenv
from fastapi.testclient import TestClient
from supabase import Client, create_client

from app.core.deps import get_current_user
from app.main import app

# Load test environment variables from .env.test
env_path = Path(__file__).parent.parent / ".env.test"
if env_path.exists():
    load_dotenv(env_path, override=True)  # Override any existing env vars from .env

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

# Import deployment test fixtures (for tests/deployment/)
try:
    from tests.support.factories.deployment_factory import (
        create_test_jwt_for_production,  # noqa: F401
    )
    from tests.support.fixtures.deployment_fixture import (
        http_session,  # noqa: F401
        production_api_url,  # noqa: F401
        production_jwt_secret,  # noqa: F401
        production_supabase_service_key,  # noqa: F401
        production_supabase_url,  # noqa: F401
        railway_env_vars,  # noqa: F401
    )
except ImportError:
    # Fixtures not available if support modules not found
    pass

# Test JWT secret for generating tokens
TEST_JWT_SECRET = "test-secret-key-for-pytest-only-do-not-use-in-production"

# Test user IDs
TEST_USER_ID = "550e8400-e29b-41d4-a716-446655440000"
ANOTHER_USER_ID = "660e8400-e29b-41d4-a716-446655440001"


@pytest.fixture(scope="session")
def supabase_client() -> Client:
    """Create a real Supabase client for integration tests.

    Uses local Supabase instance started with `npx supabase start`.
    Requires .env.test to be configured with local Supabase credentials.

    Returns:
        Supabase client connected to local test database

    Raises:
        pytest.skip: If local Supabase is not configured
    """
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not supabase_key:
        pytest.skip(
            "Supabase test environment not configured. "
            "Setup: npx supabase start, then create .env.test with credentials. "
            "See: docs/dev/test-database-setup.md"
        )

    return create_client(supabase_url, supabase_key)


@pytest.fixture(scope="function")
def client(supabase_client):
    """Create a test client for the FastAPI app with real database.

    Args:
        supabase_client: Supabase client fixture (ensures database is available)

    Returns:
        FastAPI TestClient configured for integration testing
    """
    # FastAPI app will use SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.test
    return TestClient(app)


@pytest.fixture(scope="function")
def cleanup_test_data(supabase_client):
    """Clean up test data after each test function.

    NOTE: No longer autouse=True - tests must explicitly request this fixture
    to enable cleanup. This prevents forced Supabase initialization for all tests.
    It deletes all data from user-owned tables to ensure test isolation.

    Cleanup order matters: delete child records before parent records
    to avoid foreign key constraint violations.

    Args:
        supabase_client: Supabase client fixture

    Yields:
        None (test function runs between setup and cleanup)
    """
    # Setup: Nothing to do before test
    yield  # Test runs here

    # Cleanup: Delete all test data after test completes
    # Order: child tables first, parent tables last
    tables_to_clean = [
        "triad_tasks",  # References daily_aggregates
        "ai_artifacts",  # References ai_runs
        "ai_runs",  # References user_profiles
        "daily_aggregates",  # References user_profiles
        "journal_entries",  # References user_profiles
        "captures",  # References subtask_completions
        "subtask_completions",  # References subtask_instances + user_profiles (IMMUTABLE)
        "subtask_instances",  # References subtask_templates + goals
        "subtask_templates",  # References goals
        "goals",  # References user_profiles
        "identity_docs",  # References user_profiles
        "user_profiles",  # Parent table
    ]

    for table in tables_to_clean:
        try:
            # Delete all rows except a dummy sentinel row (if it exists)
            # Using .neq() to avoid deleting a potential sentinel row
            supabase_client.table(table).delete().neq(
                "id", "00000000-0000-0000-0000-000000000000"
            ).execute()
        except Exception:
            # Ignore errors - table might not exist or might be empty
            # This is expected during early development when not all tables exist
            pass


@pytest.fixture
def mock_supabase_client():
    """
    Mock Supabase client for testing without database.

    This fixture returns a fully mocked Supabase client with common
    methods stubbed out. Customize the return values in individual tests.

    Use this fixture for fast unit tests that should use mocks instead
    of hitting the real database. For integration tests, use the
    `supabase_client` fixture instead.
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
            profile_data = [
                {
                    "id": TEST_USER_ID,
                    "auth_user_id": TEST_USER_ID,
                    "first_bind_completed_at": None,
                    "user_level": 0,
                    "preferred_name": "Test User",
                    "core_personality": "supportive_direct",
                    "identity_traits": ["Clear Direction", "High Standards", "Self Aware"],
                    "personality_selected_at": "2025-12-20T10:00:00Z",
                    "updated_at": "2025-12-20T10:00:00Z",
                }
            ]
            mock_table.select.return_value.eq.return_value.execute.return_value = create_response(
                profile_data
            )

            update_data = [
                {
                    "id": TEST_USER_ID,
                    "first_bind_completed_at": datetime.now(timezone.utc).isoformat(),
                    "user_level": 1,
                }
            ]
            mock_table.update.return_value.eq.return_value.execute.return_value = create_response(
                update_data
            )
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
            bind_data = [
                {
                    "id": str(uuid4()),
                    "user_id": TEST_USER_ID,
                    "status": "done",
                }
            ]
            mock_table.insert.return_value.execute.return_value = create_response(bind_data)
        else:
            # Default mock for other tables
            mock_table.select.return_value.eq.return_value.execute.return_value = create_response(
                []
            )
            default_insert_data = [{"id": str(uuid4()), "user_id": TEST_USER_ID}]
            mock_table.insert.return_value.execute.return_value = create_response(
                default_insert_data
            )
            mock_table.update.return_value.eq.return_value.execute.return_value = create_response(
                []
            )

        return mock_table

    mock_client.table = mock_table_call
    mock_client.from_ = mock_table_call

    return mock_client


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


@pytest.fixture(scope="function")
def test_user(supabase_client):
    """Create a test user profile for integration tests.

    Returns:
        dict: Test user profile with id and auth_user_id
    """
    # Create test user profile
    user_data = {
        "auth_user_id": "test-user-123",
        "email": "test@example.com",
        "created_at": datetime.utcnow().isoformat(),
    }

    response = supabase_client.table("user_profiles").insert(user_data).execute()

    if response.data:
        return response.data[0]
    else:
        pytest.fail("Failed to create test user profile")


@pytest.fixture
def create_auth_token():
    """Create a real JWT token for testing authenticated endpoints.

    This fixture generates valid JWT tokens signed with the SUPABASE_JWT_SECRET
    for realistic integration testing of protected endpoints.

    Returns:
        Function that generates JWT tokens with custom user_id

    Usage:
        def test_protected_endpoint(client, create_auth_token):
            token = create_auth_token(user_id="test-user-123")
            response = client.post(
                "/api/endpoint",
                json={...},
                headers={"Authorization": f"Bearer {token}"}
            )
    """
    jwt_secret = os.getenv("SUPABASE_JWT_SECRET")

    if not jwt_secret:
        pytest.skip(
            "SUPABASE_JWT_SECRET not configured in .env.test. "
            "Add: SUPABASE_JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long"
        )

    def _create_token(user_id: str = "test-user-123", expires_in_hours: int = 24) -> str:
        """Generate a valid JWT token.

        Args:
            user_id: User ID to include in 'sub' claim
            expires_in_hours: Token expiration time (default 24 hours)

        Returns:
            JWT token string
        """
        # Use time.time() for pure Unix timestamps to avoid timezone issues
        now = int(time.time())
        # Set iat to 1 hour ago to avoid any clock skew issues
        issued_at = now - 3600  # 1 hour in seconds
        payload = {
            "sub": user_id,  # User ID (required)
            "aud": "authenticated",  # Supabase audience (required)
            "role": "authenticated",  # User role
            "iss": "supabase",  # Issuer
            "iat": issued_at,  # Issued at (with clock skew buffer)
            "exp": now + (expires_in_hours * 3600),  # Expiration
        }

        token = jwt.encode(payload, jwt_secret, algorithm="HS256")
        return token

    return _create_token


@pytest.fixture(scope="function", autouse=True)
def cleanup_production_test_data(request):
    """Clean up production test data after deployment tests.

    This fixture runs automatically for tests marked with @pytest.mark.deployment.
    It ensures that test data created in production is properly cleaned up.

    ⚠️ WARNING: This fixture ONLY runs for tests in tests/deployment/
    that have @pytest.mark.deployment decorator.

    Cleanup Strategy:
    - Identifies test data by email domain: "*@weave-test.com"
    - Deletes test user profiles and all related data
    - Uses CASCADE delete to remove child records

    Args:
        request: Pytest request fixture (provides test context)

    Yields:
        None (test function runs between setup and cleanup)
    """
    # Setup: Nothing to do before test
    yield  # Test runs here

    # Cleanup: Only run for deployment tests
    if "deployment" not in [marker.name for marker in request.node.iter_markers()]:
        return  # Skip cleanup for non-deployment tests

    # Only attempt cleanup if PRODUCTION_API_URL is configured
    production_api_url = os.getenv("PRODUCTION_API_URL")
    if not production_api_url:
        return  # Skip cleanup if not running against production

    # Cleanup test users (identified by @weave-test.com email)
    # NOTE: This requires a cleanup endpoint in the API or direct database access
    # For now, we document that test data should be manually cleaned periodically
    # TODO: Implement /admin/cleanup-test-data endpoint for automated cleanup
    pass


@pytest.fixture
def complete_test_user(supabase_client):
    """
    Create a test user with COMPLETE data for GDPR export testing.

    This fixture uses the gdpr_test_factory to create a user with:
    - User profile
    - 3 active goals
    - 9 subtask templates (3 per goal)
    - Subtask instances
    - 10 completions
    - 5 journal entries
    - Identity document
    - 3 AI chat messages
    - 3 proof photos in Supabase Storage
    - Daily aggregates
    - Triad tasks

    Used by: test_gdpr_compliance_api.py (Story 9.4)

    Returns:
        dict with user_id, auth_user_id, email, goals, completions, journal_entries, proof_photos
    """
    from tests.support.factories.gdpr_test_factory import create_complete_test_user

    return lambda client: create_complete_test_user(client)


def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests (require external services)"
    )
    config.addinivalue_line(
        "markers", "deployment: marks tests as deployment tests (run against production)"
    )

"""Pytest configuration and shared fixtures for integration tests."""

import pytest
import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
from fastapi.testclient import TestClient

from app.main import app

# Load test environment variables from .env.test
env_path = Path(__file__).parent.parent / ".env.test"
if env_path.exists():
    load_dotenv(env_path)


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


@pytest.fixture(scope="function", autouse=True)
def cleanup_test_data(supabase_client):
    """Clean up test data after each test function.

    This fixture runs automatically (autouse=True) after EVERY test.
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
        "triad_tasks",          # References daily_aggregates
        "ai_artifacts",         # References ai_runs
        "ai_runs",              # References user_profiles
        "daily_aggregates",     # References user_profiles
        "journal_entries",      # References user_profiles
        "captures",             # References subtask_completions
        "subtask_completions",  # References subtask_instances + user_profiles (IMMUTABLE)
        "subtask_instances",    # References subtask_templates + goals
        "subtask_templates",    # References goals
        "goals",                # References user_profiles
        "identity_docs",        # References user_profiles
        "user_profiles",        # Parent table
    ]

    for table in tables_to_clean:
        try:
            # Delete all rows except a dummy sentinel row (if it exists)
            # Using .neq() to avoid deleting a potential sentinel row
            supabase_client.table(table).delete().neq(
                "id", "00000000-0000-0000-0000-000000000000"
            ).execute()
        except Exception as e:
            # Ignore errors - table might not exist or might be empty
            # This is expected during early development when not all tables exist
            pass


@pytest.fixture
def mock_supabase_client():
    """Mock Supabase client for unit tests that don't need real database.

    Use this fixture for fast unit tests that should use mocks instead
    of hitting the real database.

    For integration tests, use the `supabase_client` fixture instead.
    """
    # TODO: Implement mock Supabase client for unit tests
    # Example: Use unittest.mock.MagicMock to mock Supabase responses
    pass

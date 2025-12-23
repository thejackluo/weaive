"""
Database fixtures for integration tests.

Provides Supabase client connections and database setup/teardown.
"""

import pytest
from supabase import Client, create_client

from app.core.config import settings


@pytest.fixture(scope="session")
def test_supabase_client() -> Client:
    """
    Create a Supabase client for integration tests.

    This fixture:
    1. Connects to test database using SUPABASE_URL and SUPABASE_SERVICE_KEY
    2. Provides admin-level access for creating/deleting test data
    3. Lives for entire test session (created once, reused)

    Requirements:
    - SUPABASE_URL must be set in environment
    - SUPABASE_SERVICE_KEY must be set in environment

    Usage:
        def test_something(test_supabase_client):
            result = test_supabase_client.table("users").select("*").execute()
    """
    # Verify required environment variables
    if not settings.SUPABASE_URL:
        pytest.skip("SUPABASE_URL not configured for integration tests")

    if not settings.SUPABASE_SERVICE_KEY:
        pytest.skip("SUPABASE_SERVICE_KEY not configured for integration tests")

    # Create Supabase client with service key (admin access)
    client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

    # Verify connection works
    try:
        # Simple query to test connection
        client.table("user_profiles").select("id").limit(1).execute()
    except Exception as e:
        pytest.skip(f"Failed to connect to Supabase test database: {e}")

    return client


@pytest.fixture
def clean_test_users(test_supabase_client: Client):
    """
    Fixture that ensures test users are cleaned up after test.

    This fixture:
    1. Yields control to test
    2. After test completes, deletes all test users created during test
    3. Uses email pattern matching to identify test users

    Usage:
        def test_something(test_supabase_client, clean_test_users):
            # Create test users
            # They will be auto-cleaned after test
    """
    # Track user IDs created during test
    created_user_ids = []

    yield created_user_ids

    # Cleanup: Delete all tracked users
    if created_user_ids:
        for user_id in created_user_ids:
            try:
                test_supabase_client.table("user_profiles").delete().eq("id", user_id).execute()
            except Exception as e:
                print(f"Warning: Failed to cleanup user {user_id}: {e}")


@pytest.fixture
def database_transaction(test_supabase_client: Client):
    """
    Fixture that wraps test in a database transaction (if supported).

    NOTE: Supabase Python client doesn't support transactions natively.
    This is a placeholder for future implementation using psycopg2 directly.

    For now, tests should manually clean up their data.
    """
    # TODO: Implement transaction support using psycopg2
    # conn = psycopg2.connect(...)
    # conn.autocommit = False
    # yield conn
    # conn.rollback()
    # conn.close()
    pytest.skip("Database transactions not yet implemented")

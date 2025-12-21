"""
User data factory for integration tests.

Provides functions to create test users with random data using faker.
Supports both authenticated and anonymous users.
"""

import uuid
from datetime import datetime, timedelta, timezone

import jwt
from faker import Faker
from supabase import Client

from app.core.config import settings

fake = Faker()


def create_test_user(supabase: Client, overrides: dict = None) -> dict:
    """
    Create a test user in the database with random data.

    Args:
        supabase: Supabase client with admin privileges
        overrides: Optional dict to override default values

    Returns:
        dict with user_id, auth_user_id, display_name, and other user data

    Example:
        user = create_test_user(supabase, {"display_name": "Custom Name"})
        print(user["user_id"])  # UUID of created user
    """
    # Generate random user data matching actual user_profiles schema
    # Only include required fields - let database fill in defaults
    email = fake.email()  # Store for JWT generation but don't insert
    user_data = {
        "auth_user_id": str(uuid.uuid4()),  # Simulated auth.users ID (required)
        "timezone": "America/Los_Angeles",  # Required field (NOT NULL constraint)
    }

    # Apply overrides
    if overrides:
        user_data.update(overrides)

    # Insert into user_profiles table
    # NOTE: In real integration tests, this should also create auth.users entry
    # For now, we only create user_profiles record
    result = supabase.table("user_profiles").insert(user_data).execute()

    if not result.data or len(result.data) == 0:
        raise RuntimeError(f"Failed to create test user: {result}")

    created_user = result.data[0]

    return {
        "user_id": created_user["id"],
        "auth_user_id": user_data["auth_user_id"],
        "email": email,  # Return email for JWT generation (not stored in user_profiles)
        "display_name": created_user.get("display_name", "Test User"),
    }


def create_test_users(supabase: Client, count: int) -> list[dict]:
    """
    Create multiple test users with random data.

    Args:
        supabase: Supabase client with admin privileges
        count: Number of users to create

    Returns:
        List of user dicts with user_id, auth_user_id, email

    Example:
        users = create_test_users(supabase, 5)
        print(len(users))  # 5
    """
    return [create_test_user(supabase) for _ in range(count)]


def create_test_jwt(auth_user_id: str, email: str, expires_in_hours: int = 1) -> str:
    """
    Generate a valid JWT token for testing.

    Args:
        auth_user_id: The auth.users UUID (sub claim)
        email: User's email address
        expires_in_hours: Token expiration time (default 1 hour)

    Returns:
        JWT token string

    Example:
        token = create_test_jwt("user-123", "test@example.com")
        headers = {"Authorization": f"Bearer {token}"}
    """
    if not settings.SUPABASE_JWT_SECRET:
        raise ValueError("SUPABASE_JWT_SECRET not configured in settings")

    now = datetime.now(timezone.utc)
    payload = {
        "sub": auth_user_id,
        "email": email,
        "role": "authenticated",
        "aud": "authenticated",
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=expires_in_hours)).timestamp()),
    }

    token = jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")
    return token


def create_anonymous_jwt(session_id: str = None, expires_in_hours: int = 1) -> str:
    """
    Generate a JWT token for anonymous user (pre-auth onboarding).

    Args:
        session_id: Optional session identifier
        expires_in_hours: Token expiration time (default 1 hour)

    Returns:
        JWT token string for anonymous user

    Example:
        token = create_anonymous_jwt("session-abc123")
        headers = {"Authorization": f"Bearer {token}"}
    """
    if not settings.SUPABASE_JWT_SECRET:
        raise ValueError("SUPABASE_JWT_SECRET not configured in settings")

    now = datetime.now(timezone.utc)
    payload = {
        "sub": session_id or str(uuid.uuid4()),
        "role": "anon",
        "aud": "authenticated",
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=expires_in_hours)).timestamp()),
    }

    token = jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")
    return token


def delete_test_user(supabase: Client, user_id: str) -> bool:
    """
    Delete a test user from the database.

    Args:
        supabase: Supabase client with admin privileges
        user_id: UUID of user to delete

    Returns:
        True if deletion successful, False otherwise

    Example:
        success = delete_test_user(supabase, user["user_id"])
    """
    try:
        supabase.table("user_profiles").delete().eq("id", user_id).execute()
        return True
    except Exception as e:
        print(f"Warning: Failed to delete user {user_id}: {e}")
        return False


def create_identity_bootup_data(overrides: dict = None) -> dict:
    """
    Generate valid identity bootup data for testing.

    Args:
        overrides: Optional dict to override default values

    Returns:
        dict with preferred_name, core_personality, identity_traits

    Example:
        data = create_identity_bootup_data({"preferred_name": "Custom"})
    """
    # Default valid identity bootup data
    data = {
        "preferred_name": fake.first_name(),
        "core_personality": fake.random_element(["supportive_direct", "tough_warm"]),
        "identity_traits": fake.random_sample(
            elements=[
                "Disciplined",
                "Creative",
                "Confident",
                "Calm",
                "Focused",
                "Energetic",
                "Organized",
                "Patient",
                "Resilient",
                "Balanced",
                "Intentional",
                "Present",
            ],
            length=fake.random_int(min=3, max=5),
        ),
    }

    # Apply overrides
    if overrides:
        data.update(overrides)

    return data

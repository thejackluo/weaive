"""
Deployment test data factories.

Provides utilities for generating test data for deployment tests.
"""

import secrets
import jwt
from datetime import datetime, timedelta
from typing import Dict, Optional


def create_test_jwt_for_production(
    user_id: str,
    email: str,
    jwt_secret: str,
    expires_in_hours: int = 1
) -> str:
    """
    Generate a valid JWT token for production testing.
    
    Args:
        user_id: User ID from user_profiles table
        email: User email
        jwt_secret: JWT secret from production environment
        expires_in_hours: Token expiration time in hours
    
    Returns:
        JWT token string
    """
    payload = {
        "sub": user_id,
        "email": email,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=expires_in_hours)
    }
    
    token = jwt.encode(payload, jwt_secret, algorithm="HS256")
    return token


def generate_strong_jwt_secret() -> str:
    """
    Generate a cryptographically strong JWT secret (256-bit).
    
    Returns:
        Base64-encoded random string (32 bytes = 256 bits)
    """
    return secrets.token_urlsafe(32)


def verify_railway_environment_variables(required_vars: list[str], env_vars: Dict[str, str]) -> Dict[str, bool]:
    """
    Check if required environment variables are set.
    
    Args:
        required_vars: List of required environment variable names
        env_vars: Dictionary of environment variables
    
    Returns:
        Dictionary mapping variable names to whether they are set
    """
    results = {}
    for var in required_vars:
        results[var] = var in env_vars and env_vars[var] is not None and env_vars[var] != ""
    
    return results


def create_production_test_user_data(overrides: Optional[Dict] = None) -> Dict:
    """
    Generate test user data for production testing.
    
    Args:
        overrides: Optional dictionary of field overrides
    
    Returns:
        Dictionary with test user data
    """
    data = {
        "email": f"test-{secrets.token_hex(4)}@weave-test.com",
        "preferred_name": "Test User",
        "core_personality": "supportive_direct",
        "identity_traits": ["Disciplined", "Focused", "Intentional"]
    }
    
    if overrides:
        data.update(overrides)
    
    return data


def create_test_goal_data(overrides: Optional[Dict] = None) -> Dict:
    """
    Generate test goal data for production API testing.
    
    Args:
        overrides: Optional dictionary of field overrides
    
    Returns:
        Dictionary with test goal data
    """
    data = {
        "goal_text": f"Test Goal {secrets.token_hex(4)}",
        "goal_type": "habit",
        "target_metric": None,
        "target_value": None
    }
    
    if overrides:
        data.update(overrides)
    
    return data


def create_test_completion_data(subtask_instance_id: str, overrides: Optional[Dict] = None) -> Dict:
    """
    Generate test completion data for production API testing.
    
    Args:
        subtask_instance_id: ID of subtask instance being completed
        overrides: Optional dictionary of field overrides
    
    Returns:
        Dictionary with test completion data
    """
    data = {
        "subtask_instance_id": subtask_instance_id,
        "completed_at": datetime.utcnow().isoformat(),
        "proof_text": "Test completion",
        "proof_image_url": None
    }
    
    if overrides:
        data.update(overrides)
    
    return data


def create_test_journal_entry_data(overrides: Optional[Dict] = None) -> Dict:
    """
    Generate test journal entry data for production API testing.
    
    Args:
        overrides: Optional dictionary of field overrides
    
    Returns:
        Dictionary with test journal entry data
    """
    data = {
        "entry_text": f"Test journal entry {secrets.token_hex(4)}",
        "fulfillment_score": 8,
        "local_date": datetime.utcnow().date().isoformat()
    }
    
    if overrides:
        data.update(overrides)
    
    return data

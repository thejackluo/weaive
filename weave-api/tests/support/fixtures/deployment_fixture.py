"""
Deployment test fixtures.

Provides fixtures for deployment and production testing.
"""

import os
import pytest
import requests
from typing import Dict, Optional


@pytest.fixture(scope="session")
def production_api_url() -> str:
    """
    Get production API base URL from environment variable.
    
    Returns:
        Production API URL (e.g., https://weave-api-production.railway.app)
    
    Raises:
        pytest.skip: If PRODUCTION_API_URL not configured
    """
    url = os.getenv("PRODUCTION_API_URL")
    
    if not url:
        pytest.skip("PRODUCTION_API_URL not configured for deployment tests")
    
    return url.rstrip("/")


@pytest.fixture(scope="session")
def railway_env_vars() -> Dict[str, str]:
    """
    Get Railway environment variables for validation.
    
    Returns:
        Dictionary of environment variables
    
    Note:
        In real deployment tests, this would query Railway API.
        For now, it returns environment variables from current process.
    """
    return dict(os.environ)


@pytest.fixture(scope="session")
def production_jwt_secret() -> str:
    """
    Get production JWT secret from environment.
    
    Returns:
        JWT secret string
    
    Raises:
        pytest.skip: If JWT_SECRET not configured
    """
    secret = os.getenv("JWT_SECRET")
    
    if not secret:
        pytest.skip("JWT_SECRET not configured for deployment tests")
    
    return secret


@pytest.fixture(scope="session")
def production_supabase_url() -> str:
    """
    Get production Supabase URL from environment.
    
    Returns:
        Supabase URL string
    
    Raises:
        pytest.skip: If SUPABASE_URL not configured
    """
    url = os.getenv("SUPABASE_URL")
    
    if not url:
        pytest.skip("SUPABASE_URL not configured for deployment tests")
    
    return url


@pytest.fixture(scope="session")
def production_supabase_service_key() -> str:
    """
    Get production Supabase service key from environment.
    
    Returns:
        Supabase service key string
    
    Raises:
        pytest.skip: If SUPABASE_SERVICE_KEY not configured
    """
    key = os.getenv("SUPABASE_SERVICE_KEY")
    
    if not key:
        pytest.skip("SUPABASE_SERVICE_KEY not configured for deployment tests")
    
    return key


@pytest.fixture
def http_session() -> requests.Session:
    """
    Create HTTP session for making requests to production API.
    
    Returns:
        requests.Session instance
    """
    session = requests.Session()
    session.headers.update({
        "Content-Type": "application/json",
        "Accept": "application/json"
    })
    
    return session

"""Dependency injection for database, AI clients, etc."""

from functools import lru_cache
from typing import Optional

from anthropic import Anthropic
from openai import OpenAI
from supabase import Client, create_client

from app.core.config import settings


@lru_cache(maxsize=1)
def get_supabase_client() -> Optional[Client]:
    """Get Supabase client instance (lazy initialization)."""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        return None
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


@lru_cache(maxsize=1)
def get_openai_client() -> Optional[OpenAI]:
    """Get OpenAI client instance (lazy initialization)."""
    if not settings.OPENAI_API_KEY:
        return None
    return OpenAI(api_key=settings.OPENAI_API_KEY)


@lru_cache(maxsize=1)
def get_anthropic_client() -> Optional[Anthropic]:
    """Get Anthropic client instance (lazy initialization)."""
    if not settings.ANTHROPIC_API_KEY:
        return None
    return Anthropic(api_key=settings.ANTHROPIC_API_KEY)

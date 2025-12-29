"""
AI Chat Data Factories - Story 6.1
Use faker for random test data generation
Supports overrides for specific test scenarios
"""

import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from faker import Faker

fake = Faker()


def create_conversation(
    user_id: Optional[uuid.UUID] = None, initiated_by: str = "user", **overrides
) -> Dict[str, Any]:
    """
    Create a test AI chat conversation.

    Args:
        user_id: Optional user ID (generated if not provided)
        initiated_by: Who started conversation ('user' or 'system')
        **overrides: Override any field

    Returns:
        Dictionary representing conversation data
    """
    conversation = {
        "id": uuid.uuid4(),
        "user_id": user_id or uuid.uuid4(),
        "started_at": fake.date_time_this_month(),
        "last_message_at": fake.date_time_this_week(),
        "initiated_by": initiated_by,
        "conversation_context": {
            "active_goals": fake.random_int(min=1, max=3),
            "recent_completions": fake.random_int(min=0, max=10),
        },
        "deleted_at": None,
    }
    conversation.update(overrides)
    return conversation


def create_conversations(count: int, **kwargs) -> list[Dict[str, Any]]:
    """
    Create multiple test conversations.

    Args:
        count: Number of conversations to create
        **kwargs: Common overrides for all conversations

    Returns:
        List of conversation dictionaries
    """
    return [create_conversation(**kwargs) for _ in range(count)]


def create_message(
    conversation_id: Optional[uuid.UUID] = None, role: str = "user", **overrides
) -> Dict[str, Any]:
    """
    Create a test chat message.

    Args:
        conversation_id: Optional conversation ID (generated if not provided)
        role: Message role ('user', 'assistant', or 'system')
        **overrides: Override any field

    Returns:
        Dictionary representing message data
    """
    message = {
        "id": uuid.uuid4(),
        "conversation_id": conversation_id or uuid.uuid4(),
        "role": role,
        "content": fake.sentence(nb_words=fake.random_int(min=5, max=30)),
        "tokens_used": fake.random_int(min=50, max=500) if role == "assistant" else None,
        "created_at": fake.date_time_this_hour(),
        "deleted_at": None,
    }
    message.update(overrides)
    return message


def create_messages(count: int, **kwargs) -> list[Dict[str, Any]]:
    """
    Create multiple test messages.

    Args:
        count: Number of messages to create
        **kwargs: Common overrides for all messages

    Returns:
        List of message dictionaries
    """
    return [create_message(**kwargs) for _ in range(count)]


def create_user_profile(
    checkin_enabled: bool = True, checkin_deterministic: bool = False, **overrides
) -> Dict[str, Any]:
    """
    Create a test user profile with AI chat settings.

    Args:
        checkin_enabled: Whether check-ins are enabled
        checkin_deterministic: Whether check-ins use exact same time
        **overrides: Override any field

    Returns:
        Dictionary representing user profile data
    """
    user = {
        "id": uuid.uuid4(),
        "auth_user_id": str(uuid.uuid4()),
        "email": fake.email(),
        "display_name": fake.name(),
        "checkin_enabled": checkin_enabled,
        "checkin_timezone": fake.timezone(),
        "checkin_deterministic": checkin_deterministic,
        "last_checkin_at": None,
        # Rate limiting fields (tiered system)
        "ai_premium_messages_today": fake.random_int(min=0, max=10),
        "ai_free_messages_today": fake.random_int(min=0, max=40),
        "ai_messages_this_month": fake.random_int(min=0, max=500),
        "ai_messages_month_reset": datetime.now().date().replace(day=1),
        "subscription_tier": "free",
        "created_at": fake.date_time_this_year(),
    }
    user.update(overrides)
    return user


def create_user_profiles(count: int, **kwargs) -> list[Dict[str, Any]]:
    """
    Create multiple test user profiles.

    Args:
        count: Number of users to create
        **kwargs: Common overrides for all users

    Returns:
        List of user profile dictionaries
    """
    return [create_user_profile(**kwargs) for _ in range(count)]


def create_ai_run(
    user_id: Optional[uuid.UUID] = None, operation_type: str = "chat", **overrides
) -> Dict[str, Any]:
    """
    Create a test AI run record for cost tracking.

    Args:
        user_id: Optional user ID (generated if not provided)
        operation_type: Type of AI operation ('chat', 'triad', 'journal', 'checkin_initiated')
        **overrides: Override any field

    Returns:
        Dictionary representing AI run data
    """
    ai_run = {
        "id": uuid.uuid4(),
        "user_id": user_id or uuid.uuid4(),
        "operation_type": operation_type,
        "model_used": fake.random_element(
            ["claude-3-7-sonnet-20250219", "claude-3-5-haiku-20250219", "gpt-4o-mini"]
        ),
        "input_tokens": fake.random_int(min=100, max=1000),
        "output_tokens": fake.random_int(min=50, max=500),
        "cost_usd": fake.pydecimal(
            left_digits=1, right_digits=4, positive=True, min_value=0.001, max_value=0.5
        ),
        "duration_ms": fake.random_int(min=500, max=3000),
        "created_at": fake.date_time_this_hour(),
    }
    ai_run.update(overrides)
    return ai_run


def create_rate_limited_user(**overrides) -> Dict[str, Any]:
    """
    Create a user who has reached rate limits.

    Returns:
        Dictionary representing rate-limited user
    """
    return create_user_profile(
        ai_premium_messages_today=10,  # Daily premium limit
        ai_free_messages_today=40,  # Daily free limit
        ai_messages_this_month=500,  # Monthly limit
        **overrides,
    )


def create_pro_user(**overrides) -> Dict[str, Any]:
    """
    Create a pro tier user with higher limits.

    Returns:
        Dictionary representing pro user
    """
    return create_user_profile(
        subscription_tier="pro",
        ai_premium_messages_today=50,
        ai_free_messages_today=100,
        ai_messages_this_month=150,
        **overrides,
    )


def create_admin_headers(admin_key: str = "test-admin-key-12345") -> Dict[str, str]:
    """
    Create admin authentication headers for testing.

    Args:
        admin_key: Admin API key

    Returns:
        Dictionary of HTTP headers
    """
    return {
        "X-Admin-Key": admin_key,
        "Content-Type": "application/json",
    }

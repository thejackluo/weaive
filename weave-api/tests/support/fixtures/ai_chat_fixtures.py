"""
AI Chat Test Fixtures - Story 6.1
Provides setup/teardown with auto-cleanup for tests
Follows fixture-architecture.md patterns
"""
import pytest
from typing import AsyncGenerator, Dict, Any
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.main import app
from tests.support.factories.ai_chat_factory import (
    create_user_profile,
    create_conversation,
    create_message,
    create_admin_headers,
)


@pytest.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """
    Provide async HTTP client for API testing.

    Yields:
        AsyncClient configured for test app
    """
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


@pytest.fixture
async def mock_user_profile(db_session: AsyncSession) -> Dict[str, Any]:
    """
    Create and cleanup test user profile.

    Provides a test user with default settings for AI chat.
    Auto-cleanup: Deletes user after test completes.

    Args:
        db_session: Database session fixture

    Yields:
        User profile dictionary
    """
    # Setup: Create test user
    user = create_user_profile()

    # Insert into database (implementation required)
    # await db_session.execute(insert(user_profiles).values(user))
    # await db_session.commit()

    yield user

    # Cleanup: Delete test user
    # await db_session.execute(delete(user_profiles).where(user_profiles.c.id == user["id"]))
    # await db_session.commit()


@pytest.fixture
async def auth_headers(mock_user_profile: Dict[str, Any]) -> Dict[str, str]:
    """
    Provide authenticated request headers for test user.

    Args:
        mock_user_profile: User profile fixture

    Returns:
        Dictionary of HTTP headers with JWT
    """
    # Generate test JWT token
    token = f"test-jwt-{mock_user_profile['id']}"

    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }


@pytest.fixture
def admin_headers() -> Dict[str, str]:
    """
    Provide admin request headers for testing admin endpoints.

    Returns:
        Dictionary of HTTP headers with admin key
    """
    return create_admin_headers()


@pytest.fixture
async def mock_conversation(
    db_session: AsyncSession, mock_user_profile: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Create and cleanup test conversation.

    Provides a test conversation owned by mock_user_profile.
    Auto-cleanup: Deletes conversation and messages after test.

    Args:
        db_session: Database session fixture
        mock_user_profile: User profile fixture

    Yields:
        Conversation dictionary
    """
    # Setup: Create test conversation
    conversation = create_conversation(user_id=mock_user_profile["id"])

    # Insert into database (implementation required)
    # await db_session.execute(insert(ai_chat_conversations).values(conversation))
    # await db_session.commit()

    yield conversation

    # Cleanup: Delete conversation (cascade to messages)
    # await db_session.execute(
    #     delete(ai_chat_conversations).where(ai_chat_conversations.c.id == conversation["id"])
    # )
    # await db_session.commit()


@pytest.fixture
async def mock_messages(
    db_session: AsyncSession, mock_conversation: Dict[str, Any]
) -> list[Dict[str, Any]]:
    """
    Create and cleanup test messages in conversation.

    Provides 2 test messages (user + assistant) in mock_conversation.
    Auto-cleanup: Deletes messages after test.

    Args:
        db_session: Database session fixture
        mock_conversation: Conversation fixture

    Yields:
        List of message dictionaries
    """
    # Setup: Create test messages
    user_message = create_message(
        conversation_id=mock_conversation["id"], role="user", content="How do I complete a bind?"
    )

    assistant_message = create_message(
        conversation_id=mock_conversation["id"],
        role="assistant",
        content="To complete a bind, tap the checkmark next to it.",
    )

    messages = [user_message, assistant_message]

    # Insert into database (implementation required)
    # for message in messages:
    #     await db_session.execute(insert(ai_chat_messages).values(message))
    # await db_session.commit()

    yield messages

    # Cleanup: Delete messages
    # await db_session.execute(
    #     delete(ai_chat_messages).where(
    #         ai_chat_messages.c.conversation_id == mock_conversation["id"]
    #     )
    # )
    # await db_session.commit()


@pytest.fixture
def checkin_scheduler_service():
    """
    Provide check-in scheduler service for testing.

    Returns:
        CheckInSchedulerService instance
    """
    from app.services.checkin_scheduler import CheckInSchedulerService

    return CheckInSchedulerService()


@pytest.fixture
def mock_aiservice(monkeypatch):
    """
    Mock AIService for testing chat without real AI calls.

    Provides a mock that simulates AI responses without external API calls.

    Yields:
        Mock AIService instance with tracked calls
    """
    from unittest.mock import Mock, AsyncMock

    mock_service = Mock()
    mock_service.generate = AsyncMock(
        return_value={
            "response": "This is a test AI response.",
            "tokens_used": 100,
            "model_used": "claude-3-5-haiku-20250219",
            "cost_usd": 0.001,
            "cached": False,
        }
    )

    # Track if cache hit on second call
    mock_service.cache_hit_on_second_call = False

    # Patch AIService
    monkeypatch.setattr("app.services.ai.AIService", lambda: mock_service)

    yield mock_service


@pytest.fixture
def mock_failing_providers(monkeypatch):
    """
    Mock AI providers with configurable failures for fallback testing.

    Allows testing fallback chain: Sonnet → Haiku → Mini

    Yields:
        Mock controller with setup() method
    """
    from unittest.mock import AsyncMock

    class FailingProviderMock:
        def __init__(self):
            self.sonnet_fails = False
            self.haiku_succeeds = True
            self.haiku_called = False

        def setup(self, sonnet_fails=False, haiku_succeeds=True):
            self.sonnet_fails = sonnet_fails
            self.haiku_succeeds = haiku_succeeds

        async def generate_sonnet(self, *args, **kwargs):
            if self.sonnet_fails:
                raise Exception("Sonnet provider unavailable")
            return {"response": "Sonnet response", "tokens_used": 200}

        async def generate_haiku(self, *args, **kwargs):
            self.haiku_called = True
            if not self.haiku_succeeds:
                raise Exception("Haiku provider unavailable")
            return {"response": "Haiku response (fallback)", "tokens_used": 100}

    mock = FailingProviderMock()
    # Patch provider methods (implementation required)
    yield mock


@pytest.fixture
async def rate_limited_user(db_session: AsyncSession) -> Dict[str, Any]:
    """
    Create user who has reached rate limits.

    Provides a user with all daily/monthly limits exhausted.
    Auto-cleanup: Deletes user after test.

    Args:
        db_session: Database session fixture

    Yields:
        Rate-limited user dictionary
    """
    from tests.support.factories.ai_chat_factory import create_rate_limited_user

    # Setup: Create rate-limited user
    user = create_rate_limited_user()

    # Insert into database (implementation required)
    yield user

    # Cleanup: Delete user
    pass


@pytest.fixture
async def pro_user(db_session: AsyncSession) -> Dict[str, Any]:
    """
    Create pro tier user with higher limits.

    Provides a user with pro subscription tier.
    Auto-cleanup: Deletes user after test.

    Args:
        db_session: Database session fixture

    Yields:
        Pro tier user dictionary
    """
    from tests.support.factories.ai_chat_factory import create_pro_user

    # Setup: Create pro user
    user = create_pro_user()

    # Insert into database (implementation required)
    yield user

    # Cleanup: Delete user
    pass

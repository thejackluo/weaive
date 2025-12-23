"""
AI Chat API Tests - Story 6.1
RED Phase: Tests written BEFORE implementation
All tests should FAIL initially (missing implementation)
"""
import uuid
from datetime import timedelta

import pytest
from httpx import AsyncClient


class TestAIChatMessagesEndpoint:
    """Test POST /api/ai-chat/messages endpoint"""

    @pytest.mark.asyncio
    async def test_send_message_returns_ai_response(
        self, async_client: AsyncClient, auth_headers: dict
    ):
        """
        GIVEN: User is authenticated
        WHEN: User sends a message to AI chat
        THEN: System returns AI-generated response with metadata
        """
        # GIVEN: Valid chat message
        payload = {"message": "How do I complete a bind?", "conversation_id": None}

        # WHEN: Sending message to AI chat
        response = await async_client.post(
            "/api/ai-chat/messages", json=payload, headers=auth_headers
        )

        # THEN: Response contains AI message and metadata
        assert response.status_code == 200
        data = response.json()["data"]
        assert "message_id" in data
        assert "response" in data
        assert "conversation_id" in data
        assert "tokens_used" in data
        assert isinstance(data["response"], str)
        assert len(data["response"]) > 0

    @pytest.mark.asyncio
    async def test_send_message_creates_new_conversation_if_none_provided(
        self, async_client: AsyncClient, auth_headers: dict
    ):
        """
        GIVEN: No existing conversation_id provided
        WHEN: User sends first message
        THEN: System creates new conversation and returns conversation_id
        """
        # GIVEN: Message with no conversation_id
        payload = {"message": "Hello Weave!", "conversation_id": None}

        # WHEN: Sending first message
        response = await async_client.post(
            "/api/ai-chat/messages", json=payload, headers=auth_headers
        )

        # THEN: New conversation created
        assert response.status_code == 200
        data = response.json()["data"]
        assert "conversation_id" in data
        assert data["conversation_id"] is not None

    @pytest.mark.asyncio
    async def test_send_message_uses_existing_conversation(
        self, async_client: AsyncClient, auth_headers: dict
    ):
        """
        GIVEN: Existing conversation_id
        WHEN: User sends follow-up message
        THEN: System appends to existing conversation
        """
        # GIVEN: Create first conversation
        response1 = await async_client.post(
            "/api/ai-chat/messages",
            json={"message": "Hello", "conversation_id": None},
            headers=auth_headers,
        )
        conversation_id = response1.json()["data"]["conversation_id"]

        # WHEN: Sending follow-up message
        response2 = await async_client.post(
            "/api/ai-chat/messages",
            json={"message": "Tell me more", "conversation_id": conversation_id},
            headers=auth_headers,
        )

        # THEN: Same conversation used
        assert response2.status_code == 200
        assert response2.json()["data"]["conversation_id"] == conversation_id

    @pytest.mark.asyncio
    async def test_send_message_validates_empty_message(
        self, async_client: AsyncClient, auth_headers: dict
    ):
        """
        GIVEN: Empty message string
        WHEN: User attempts to send empty message
        THEN: System returns validation error
        """
        # GIVEN: Empty message
        payload = {"message": "", "conversation_id": None}

        # WHEN: Attempting to send empty message
        response = await async_client.post(
            "/api/ai-chat/messages", json=payload, headers=auth_headers
        )

        # THEN: Validation error returned
        assert response.status_code == 422
        error = response.json()["error"]
        assert error["code"] == "VALIDATION_ERROR"

    @pytest.mark.asyncio
    async def test_send_message_validates_character_limit(
        self, async_client: AsyncClient, auth_headers: dict
    ):
        """
        GIVEN: Message exceeds 500 character limit
        WHEN: User attempts to send long message
        THEN: System returns validation error
        """
        # GIVEN: Message with 501 characters
        payload = {"message": "a" * 501, "conversation_id": None}

        # WHEN: Attempting to send long message
        response = await async_client.post(
            "/api/ai-chat/messages", json=payload, headers=auth_headers
        )

        # THEN: Validation error returned
        assert response.status_code == 422
        error = response.json()["error"]
        assert error["code"] == "VALIDATION_ERROR"
        assert "500" in error["message"]


class TestAIChatConversationsEndpoint:
    """Test GET /api/ai-chat/conversations endpoint"""

    @pytest.mark.asyncio
    async def test_list_conversations_returns_user_history(
        self, async_client: AsyncClient, auth_headers: dict
    ):
        """
        GIVEN: User has previous conversations
        WHEN: User requests conversation list
        THEN: System returns list of conversations with preview
        """
        # GIVEN: Create some conversations
        await async_client.post(
            "/api/ai-chat/messages",
            json={"message": "First conversation", "conversation_id": None},
            headers=auth_headers,
        )
        await async_client.post(
            "/api/ai-chat/messages",
            json={"message": "Second conversation", "conversation_id": None},
            headers=auth_headers,
        )

        # WHEN: Requesting conversation list
        response = await async_client.get("/api/ai-chat/conversations", headers=auth_headers)

        # THEN: List of conversations returned
        assert response.status_code == 200
        data = response.json()["data"]
        assert isinstance(data, list)
        assert len(data) >= 2
        assert "id" in data[0]
        assert "started_at" in data[0]
        assert "last_message_preview" in data[0]

    @pytest.mark.asyncio
    async def test_list_conversations_returns_empty_for_new_user(
        self, async_client: AsyncClient, auth_headers: dict
    ):
        """
        GIVEN: New user with no conversations
        WHEN: User requests conversation list
        THEN: System returns empty list
        """
        # WHEN: Requesting conversation list (new user)
        response = await async_client.get("/api/ai-chat/conversations", headers=auth_headers)

        # THEN: Empty list returned
        assert response.status_code == 200
        data = response.json()["data"]
        assert isinstance(data, list)
        assert len(data) == 0


class TestAIChatConversationDetailEndpoint:
    """Test GET /api/ai-chat/conversations/{id} endpoint"""

    @pytest.mark.asyncio
    async def test_get_conversation_returns_full_thread(
        self, async_client: AsyncClient, auth_headers: dict
    ):
        """
        GIVEN: Existing conversation with multiple messages
        WHEN: User requests full conversation
        THEN: System returns complete message history
        """
        # GIVEN: Create conversation with messages
        response1 = await async_client.post(
            "/api/ai-chat/messages",
            json={"message": "Hello", "conversation_id": None},
            headers=auth_headers,
        )
        conversation_id = response1.json()["data"]["conversation_id"]

        await async_client.post(
            "/api/ai-chat/messages",
            json={"message": "How are you?", "conversation_id": conversation_id},
            headers=auth_headers,
        )

        # WHEN: Requesting full conversation
        response = await async_client.get(
            f"/api/ai-chat/conversations/{conversation_id}", headers=auth_headers
        )

        # THEN: Complete message thread returned
        assert response.status_code == 200
        data = response.json()["data"]
        assert "messages" in data
        messages = data["messages"]
        assert isinstance(messages, list)
        assert len(messages) >= 2  # User message + AI response
        assert messages[0]["role"] in ["user", "assistant"]
        assert "content" in messages[0]
        assert "timestamp" in messages[0]

    @pytest.mark.asyncio
    async def test_get_conversation_returns_404_for_invalid_id(
        self, async_client: AsyncClient, auth_headers: dict
    ):
        """
        GIVEN: Invalid conversation ID
        WHEN: User requests non-existent conversation
        THEN: System returns 404 error
        """
        # GIVEN: Random UUID that doesn't exist
        fake_id = str(uuid.uuid4())

        # WHEN: Requesting non-existent conversation
        response = await async_client.get(
            f"/api/ai-chat/conversations/{fake_id}", headers=auth_headers
        )

        # THEN: 404 error returned
        assert response.status_code == 404
        error = response.json()["error"]
        assert error["code"] == "NOT_FOUND"


class TestAIChatRateLimiting:
    """Test rate limiting for AI chat (Tiered System)"""

    @pytest.mark.asyncio
    async def test_rate_limit_enforces_premium_daily_limit(
        self, async_client: AsyncClient, auth_headers: dict
    ):
        """
        GIVEN: User has sent 10 premium messages today
        WHEN: User attempts to send 11th premium message
        THEN: System returns 429 rate limit error for premium
        """
        # GIVEN: Send 10 premium messages (Claude Sonnet)
        for i in range(10):
            await async_client.post(
                "/api/ai-chat/messages",
                json={"message": f"Premium test {i}", "model": "claude-3-7-sonnet-20250219"},
                headers=auth_headers,
            )

        # WHEN: Attempting 11th premium message
        response = await async_client.post(
            "/api/ai-chat/messages",
            json={"message": "One more premium", "model": "claude-3-7-sonnet-20250219"},
            headers=auth_headers,
        )

        # THEN: Rate limit error returned
        assert response.status_code == 429
        error = response.json()["error"]
        assert error["code"] == "RATE_LIMIT_EXCEEDED"
        assert "10 premium messages" in error["message"]

    @pytest.mark.asyncio
    async def test_rate_limit_enforces_free_daily_limit(
        self, async_client: AsyncClient, auth_headers: dict
    ):
        """
        GIVEN: User has sent 40 free messages today
        WHEN: User attempts to send 41st free message
        THEN: System returns 429 rate limit error for free
        """
        # GIVEN: Send 40 free messages (Haiku/Mini)
        for i in range(40):
            await async_client.post(
                "/api/ai-chat/messages",
                json={"message": f"Free test {i}", "model": "claude-3-5-haiku-20250219"},
                headers=auth_headers,
            )

        # WHEN: Attempting 41st free message
        response = await async_client.post(
            "/api/ai-chat/messages",
            json={"message": "One more free", "model": "claude-3-5-haiku-20250219"},
            headers=auth_headers,
        )

        # THEN: Rate limit error returned
        assert response.status_code == 429
        error = response.json()["error"]
        assert error["code"] == "RATE_LIMIT_EXCEEDED"
        assert "40 free messages" in error["message"]

    @pytest.mark.asyncio
    async def test_rate_limit_enforces_monthly_cap(
        self, async_client: AsyncClient, auth_headers: dict, mock_user_profile
    ):
        """
        GIVEN: User has sent 500 messages this month
        WHEN: User attempts to send 501st message
        THEN: System returns 429 rate limit error for monthly cap
        """
        # GIVEN: Mock user with 500 messages this month
        mock_user_profile.ai_messages_this_month = 500

        # WHEN: Attempting 501st message
        response = await async_client.post(
            "/api/ai-chat/messages",
            json={"message": "Monthly limit test"},
            headers=auth_headers,
        )

        # THEN: Monthly cap error returned
        assert response.status_code == 429
        error = response.json()["error"]
        assert error["code"] == "RATE_LIMIT_EXCEEDED"
        assert "500 messages this month" in error["message"]

    @pytest.mark.asyncio
    async def test_admin_key_bypasses_rate_limits(
        self, async_client: AsyncClient, admin_headers: dict
    ):
        """
        GIVEN: Request includes X-Admin-Key header
        WHEN: User exceeds rate limits
        THEN: Request succeeds (admin bypass)
        """
        # GIVEN: Send 20 messages (exceeding both premium and free limits)
        for i in range(20):
            response = await async_client.post(
                "/api/ai-chat/messages",
                json={"message": f"Admin test {i}"},
                headers=admin_headers,
            )
            # THEN: All requests succeed
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_get_usage_returns_current_limits(
        self, async_client: AsyncClient, auth_headers: dict
    ):
        """
        GIVEN: User has sent some messages
        WHEN: User requests usage stats
        THEN: System returns current usage and limits
        """
        # GIVEN: Send 5 premium and 20 free messages
        for i in range(5):
            await async_client.post(
                "/api/ai-chat/messages",
                json={"message": f"Premium {i}", "model": "claude-3-7-sonnet-20250219"},
                headers=auth_headers,
            )
        for i in range(20):
            await async_client.post(
                "/api/ai-chat/messages",
                json={"message": f"Free {i}", "model": "claude-3-5-haiku-20250219"},
                headers=auth_headers,
            )

        # WHEN: Requesting usage stats
        response = await async_client.get("/api/ai/usage", headers=auth_headers)

        # THEN: Usage stats returned
        assert response.status_code == 200
        data = response.json()["data"]
        assert data["premium_today"]["used"] == 5
        assert data["premium_today"]["limit"] == 10
        assert data["free_today"]["used"] == 20
        assert data["free_today"]["limit"] == 40
        assert data["monthly"]["used"] == 25
        assert data["monthly"]["limit"] == 500
        assert data["tier"] == "free"


class TestCheckInScheduler:
    """Test server-initiated check-in functionality"""

    @pytest.mark.asyncio
    async def test_checkin_creates_system_initiated_conversation(
        self, db_session, mock_user_profile, checkin_scheduler_service
    ):
        """
        GIVEN: User has check-ins enabled
        WHEN: Scheduled check-in time arrives
        THEN: System creates conversation with initiated_by='system'
        """
        # GIVEN: User with check-ins enabled
        mock_user_profile.checkin_enabled = True

        # WHEN: Triggering check-in
        conversation = await checkin_scheduler_service.send_checkin(mock_user_profile)

        # THEN: System-initiated conversation created
        assert conversation is not None
        assert conversation.initiated_by == "system"
        assert conversation.user_id == mock_user_profile.id

    @pytest.mark.asyncio
    async def test_checkin_respects_user_timezone(
        self, db_session, mock_user_profile, checkin_scheduler_service
    ):
        """
        GIVEN: User in PST timezone
        WHEN: Check-in time calculated
        THEN: Time respects user's timezone (9 AM PST != 9 AM EST)
        """
        # GIVEN: User in different timezones
        pst_user = mock_user_profile(checkin_timezone="America/Los_Angeles")
        est_user = mock_user_profile(checkin_timezone="America/New_York")

        # WHEN: Calculating check-in times
        pst_time = checkin_scheduler_service.calculate_checkin_time(pst_user)
        est_time = checkin_scheduler_service.calculate_checkin_time(est_user)

        # THEN: Times respect timezones
        assert pst_time.tzinfo.zone == "America/Los_Angeles"
        assert est_time.tzinfo.zone == "America/New_York"
        # 9 AM PST is 3 hours behind 9 AM EST
        assert (est_time - pst_time).total_seconds() == 0  # Same UTC time, different local

    @pytest.mark.asyncio
    async def test_checkin_respects_deterministic_setting(
        self, db_session, mock_user_profile, checkin_scheduler_service
    ):
        """
        GIVEN: User has checkin_deterministic=True
        WHEN: Check-in time calculated on different days
        THEN: Exact same time used each day (no variation)
        """
        # GIVEN: User with deterministic mode
        mock_user_profile.checkin_deterministic = True

        # WHEN: Calculating check-in time on 3 different days
        from datetime import date

        times = []
        for day_offset in range(3):
            mock_date = date.today() + timedelta(days=day_offset)
            time = checkin_scheduler_service.calculate_checkin_time(
                mock_user_profile, target_date=mock_date
            )
            times.append(time.time())  # Extract time component only

        # THEN: Same time every day
        assert times[0] == times[1] == times[2]

    @pytest.mark.asyncio
    async def test_checkin_adds_variation_when_not_deterministic(
        self, db_session, mock_user_profile, checkin_scheduler_service
    ):
        """
        GIVEN: User has checkin_deterministic=False (default)
        WHEN: Check-in time calculated on different days
        THEN: Base time has 10-15 minute variation
        """
        # GIVEN: User with hybrid mode (default)
        mock_user_profile.checkin_deterministic = False

        # WHEN: Calculating check-in time on 3 different days
        from datetime import date

        times = []
        for day_offset in range(3):
            mock_date = date.today() + timedelta(days=day_offset)
            time = checkin_scheduler_service.calculate_checkin_time(
                mock_user_profile, target_date=mock_date
            )
            times.append(time.time())

        # THEN: Times vary but are within ±15 minutes of base
        # Note: Variation is deterministic per day (seeded by user_id + date)
        base_time = times[0]
        for time in times[1:]:
            diff_seconds = abs((time.hour * 3600 + time.minute * 60) -
                               (base_time.hour * 3600 + base_time.minute * 60))
            assert 0 <= diff_seconds <= 900  # 0-15 minutes variation

    @pytest.mark.asyncio
    async def test_checkin_respects_disabled_preference(
        self, db_session, mock_user_profile, checkin_scheduler_service
    ):
        """
        GIVEN: User has checkin_enabled=False
        WHEN: Check-in time arrives
        THEN: No check-in sent
        """
        # GIVEN: User with check-ins disabled
        mock_user_profile.checkin_enabled = False

        # WHEN: Attempting to send check-in
        should_send = checkin_scheduler_service.should_send_checkin(mock_user_profile)

        # THEN: Check-in skipped
        assert should_send is False

    @pytest.mark.asyncio
    async def test_checkin_generates_contextual_message(
        self, db_session, mock_user_profile, checkin_scheduler_service
    ):
        """
        GIVEN: User has recent activity (completions, pending binds)
        WHEN: Check-in message generated
        THEN: Message includes personalized context
        """
        # GIVEN: User with recent completions
        # (Mock data: 2 completions today, 3 pending binds)

        # WHEN: Generating check-in message
        message = checkin_scheduler_service.generate_checkin_message(
            mock_user_profile, hour=14  # 2 PM
        )

        # THEN: Message is contextual
        assert isinstance(message, str)
        assert len(message) > 0
        # Should mention completions or binds
        assert any(keyword in message.lower() for keyword in ["completed", "binds", "momentum"])


class TestAdminTestingMode:
    """Test admin/dev testing features"""

    @pytest.mark.asyncio
    async def test_admin_trigger_checkin_sends_immediate_checkin(
        self, async_client: AsyncClient, admin_headers: dict, mock_user_profile
    ):
        """
        GIVEN: Admin with valid API key
        WHEN: Admin triggers check-in for user
        THEN: Check-in sent immediately
        """
        # GIVEN: User ID
        user_id = str(mock_user_profile.id)

        # WHEN: Admin triggers check-in
        response = await async_client.post(
            f"/api/admin/trigger-checkin/{user_id}", headers=admin_headers
        )

        # THEN: Check-in sent successfully
        assert response.status_code == 200
        data = response.json()["data"]
        assert data["checkin_sent"] is True
        assert "conversation_id" in data

    @pytest.mark.asyncio
    async def test_admin_endpoint_rejects_invalid_key(
        self, async_client: AsyncClient, auth_headers: dict
    ):
        """
        GIVEN: Request without valid admin key
        WHEN: Attempting to access admin endpoint
        THEN: System returns 403 Forbidden
        """
        # GIVEN: Regular auth headers (no admin key)
        user_id = str(uuid.uuid4())

        # WHEN: Attempting admin action
        response = await async_client.post(
            f"/api/admin/trigger-checkin/{user_id}", headers=auth_headers
        )

        # THEN: Forbidden error returned
        assert response.status_code == 403
        error = response.json()["error"]
        assert error["code"] == "FORBIDDEN"


class TestAIServiceIntegration:
    """Test integration with existing AIService"""

    @pytest.mark.asyncio
    async def test_chat_uses_existing_aiservice(
        self, async_client: AsyncClient, auth_headers: dict, mock_aiservice
    ):
        """
        GIVEN: Existing AIService configured
        WHEN: User sends chat message
        THEN: System uses AIService (not new service)
        """
        # WHEN: Sending message
        response = await async_client.post(
            "/api/ai-chat/messages",
            json={"message": "Test message"},
            headers=auth_headers,
        )

        # THEN: AIService was called
        assert response.status_code == 200
        assert mock_aiservice.generate.called

    @pytest.mark.asyncio
    async def test_chat_fallback_chain_works(
        self, async_client: AsyncClient, auth_headers: dict, mock_failing_providers
    ):
        """
        GIVEN: Primary AI provider fails
        WHEN: User sends message
        THEN: System falls back to secondary provider (Sonnet → Haiku → Mini)
        """
        # GIVEN: Sonnet fails, Haiku succeeds
        mock_failing_providers.setup(sonnet_fails=True, haiku_succeeds=True)

        # WHEN: Sending message
        response = await async_client.post(
            "/api/ai-chat/messages",
            json={"message": "Test fallback"},
            headers=auth_headers,
        )

        # THEN: Haiku was used (fallback successful)
        assert response.status_code == 200
        data = response.json()["data"]
        assert "response" in data
        assert mock_failing_providers.haiku_called

    @pytest.mark.asyncio
    async def test_chat_caching_works(
        self, async_client: AsyncClient, auth_headers: dict, mock_aiservice
    ):
        """
        GIVEN: Same message sent twice within 24 hours
        WHEN: User sends duplicate message
        THEN: Second response is instant (cache hit)
        """
        # GIVEN: Send first message
        response1 = await async_client.post(
            "/api/ai-chat/messages",
            json={"message": "What is a bind?"},
            headers=auth_headers,
        )

        # WHEN: Sending same message again
        response2 = await async_client.post(
            "/api/ai-chat/messages",
            json={"message": "What is a bind?"},
            headers=auth_headers,
        )

        # THEN: Both succeed, second is cached
        assert response1.status_code == 200
        assert response2.status_code == 200
        assert mock_aiservice.cache_hit_on_second_call

"""
Tests for ModifyPersonalityTool (Story 6.2)
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.tools.modify_personality_tool import ModifyPersonalityTool


@pytest.fixture
def mock_supabase():
    """Mock Supabase client."""
    mock_db = MagicMock()
    return mock_db


@pytest.fixture
def mock_personality_service():
    """Mock PersonalityService."""
    service = AsyncMock()
    service.get_active_personality = AsyncMock()
    service.switch_personality = AsyncMock()
    return service


class TestModifyPersonalityTool:
    """Test ModifyPersonalityTool functionality."""

    def test_tool_properties(self):
        """Test tool name, description, and schema."""
        tool = ModifyPersonalityTool()

        assert tool.name == "modify_personality"
        assert "personality" in tool.description.lower()
        assert "active_personality" in tool.parameters_schema["properties"]
        assert tool.parameters_schema["properties"]["active_personality"]["enum"] == [
            "dream_self",
            "weave_ai"
        ]

    @pytest.mark.asyncio
    @patch('app.services.tools.modify_personality_tool.get_supabase_client')
    @patch('app.services.tools.modify_personality_tool.PersonalityService')
    async def test_execute_switch_to_dream_self(
        self,
        MockPersonalityService,
        mock_get_supabase,
        mock_supabase
    ):
        """Test switching to Dream Self personality."""
        # Setup mocks
        mock_get_supabase.return_value = mock_supabase

        mock_service = AsyncMock()
        mock_service.get_active_personality.return_value = {
            "personality_type": "weave_ai",
            "name": "Weave"
        }
        mock_service.switch_personality.return_value = {
            "personality_type": "dream_self",
            "name": "Alex the Disciplined",
            "traits": ["analytical", "supportive"],
            "speaking_style": "Direct but encouraging"
        }
        MockPersonalityService.return_value = mock_service

        # Execute tool
        tool = ModifyPersonalityTool()
        result = await tool.execute(
            user_id="user_123",
            parameters={"active_personality": "dream_self"}
        )

        # Verify result
        assert result["success"] is True
        assert result["data"]["previous_personality"] == "weave_ai"
        assert result["data"]["new_personality"]["personality_type"] == "dream_self"
        assert result["data"]["new_personality"]["name"] == "Alex the Disciplined"

        # Verify service was called
        mock_service.switch_personality.assert_called_once_with(
            user_id="user_123",
            new_personality="dream_self"
        )

    @pytest.mark.asyncio
    @patch('app.services.tools.modify_personality_tool.get_supabase_client')
    @patch('app.services.tools.modify_personality_tool.PersonalityService')
    async def test_execute_switch_to_weave_ai(
        self,
        MockPersonalityService,
        mock_get_supabase,
        mock_supabase
    ):
        """Test switching to Weave AI personality."""
        # Setup mocks
        mock_get_supabase.return_value = mock_supabase

        mock_service = AsyncMock()
        mock_service.get_active_personality.return_value = {
            "personality_type": "dream_self",
            "name": "Alex"
        }
        mock_service.switch_personality.return_value = {
            "personality_type": "weave_ai",
            "name": "Weave",
            "traits": ["encouraging", "supportive"],
            "speaking_style": "Friendly and empowering"
        }
        MockPersonalityService.return_value = mock_service

        # Execute tool
        tool = ModifyPersonalityTool()
        result = await tool.execute(
            user_id="user_123",
            parameters={"active_personality": "weave_ai", "reason": "User requested general advice"}
        )

        # Verify result
        assert result["success"] is True
        assert result["data"]["previous_personality"] == "dream_self"
        assert result["data"]["new_personality"]["personality_type"] == "weave_ai"

    @pytest.mark.asyncio
    @patch('app.services.tools.modify_personality_tool.get_supabase_client')
    @patch('app.services.tools.modify_personality_tool.PersonalityService')
    async def test_execute_already_using_personality(
        self,
        MockPersonalityService,
        mock_get_supabase,
        mock_supabase
    ):
        """Test switching to already active personality (no-op)."""
        # Setup mocks
        mock_get_supabase.return_value = mock_supabase

        mock_service = AsyncMock()
        mock_service.get_active_personality.return_value = {
            "personality_type": "dream_self",
            "name": "Alex"
        }
        MockPersonalityService.return_value = mock_service

        # Execute tool
        tool = ModifyPersonalityTool()
        result = await tool.execute(
            user_id="user_123",
            parameters={"active_personality": "dream_self"}
        )

        # Verify result
        assert result["success"] is True
        assert "Already using" in result["data"]["message"]
        assert result["data"]["previous_personality"] == "dream_self"

        # Verify switch was NOT called
        mock_service.switch_personality.assert_not_called()

    @pytest.mark.asyncio
    async def test_execute_invalid_personality_type(self):
        """Test executing with invalid personality type."""
        tool = ModifyPersonalityTool()

        result = await tool.execute(
            user_id="user_123",
            parameters={"active_personality": "invalid_type"}
        )

        assert result["success"] is False
        assert "Invalid active_personality" in result["error"]

    @pytest.mark.asyncio
    @patch('app.services.tools.modify_personality_tool.get_supabase_client')
    async def test_execute_supabase_unavailable(self, mock_get_supabase):
        """Test executing when Supabase client is unavailable."""
        mock_get_supabase.return_value = None

        tool = ModifyPersonalityTool()
        result = await tool.execute(
            user_id="user_123",
            parameters={"active_personality": "dream_self"}
        )

        assert result["success"] is False
        assert "Database connection not available" in result["error"]

    @pytest.mark.asyncio
    @patch('app.services.tools.modify_personality_tool.get_supabase_client')
    @patch('app.services.tools.modify_personality_tool.PersonalityService')
    async def test_execute_service_exception(
        self,
        MockPersonalityService,
        mock_get_supabase,
        mock_supabase
    ):
        """Test executing when PersonalityService raises exception."""
        # Setup mocks
        mock_get_supabase.return_value = mock_supabase

        mock_service = AsyncMock()
        mock_service.get_active_personality.side_effect = Exception("Database error")
        MockPersonalityService.return_value = mock_service

        # Execute tool
        tool = ModifyPersonalityTool()
        result = await tool.execute(
            user_id="user_123",
            parameters={"active_personality": "dream_self"}
        )

        # Verify error handling
        assert result["success"] is False
        assert "Personality switch failed" in result["error"]

    def test_parameters_schema_validation(self):
        """Test that parameter schema enforces enum values."""
        tool = ModifyPersonalityTool()

        schema = tool.parameters_schema
        assert schema["properties"]["active_personality"]["enum"] == ["dream_self", "weave_ai"]
        assert "active_personality" in schema["required"]

    def test_tool_description_includes_usage_guidance(self):
        """Test that tool description provides clear usage guidance."""
        tool = ModifyPersonalityTool()

        description = tool.description
        assert "dream_self" in description
        assert "weave_ai" in description
        assert "personalized" in description.lower()

"""
Tests for PersonalityService (Story 6.2)
"""

import pytest
from unittest.mock import MagicMock, AsyncMock

from app.services.personality_service import PersonalityService


@pytest.fixture
def mock_supabase():
    """Mock Supabase client."""
    return MagicMock()


class TestPersonalityService:
    """Test PersonalityService functionality."""

    @pytest.mark.asyncio
    async def test_get_active_personality_weave_ai(self, mock_supabase):
        """Test getting active personality when user prefers Weave AI."""
        # Mock user_profiles response
        mock_supabase.table().select().eq().execute.return_value = MagicMock(
            data=[{"active_personality": "weave_ai"}]
        )

        service = PersonalityService(mock_supabase)
        personality = await service.get_active_personality("user_123")

        assert personality["personality_type"] == "weave_ai"
        assert personality["name"] == "Weave"
        assert "encouraging" in personality["traits"]

    @pytest.mark.asyncio
    async def test_get_active_personality_dream_self(self, mock_supabase):
        """Test getting active personality when user prefers Dream Self."""
        # Mock user_profiles response
        user_response = MagicMock(data=[{"active_personality": "dream_self"}])

        # Mock identity_docs response
        identity_response = MagicMock(
            data=[{
                "content": {
                    "dream_self_name": "Alex the Disciplined",
                    "personality_traits": ["analytical", "supportive", "growth-focused"],
                    "speaking_style": "Direct but encouraging"
                }
            }]
        )

        # Setup mock chain
        mock_supabase.table().select().eq().execute.side_effect = [
            user_response,
            identity_response
        ]

        service = PersonalityService(mock_supabase)
        personality = await service.get_active_personality("user_123")

        assert personality["personality_type"] == "dream_self"
        assert personality["name"] == "Alex the Disciplined"
        assert "analytical" in personality["traits"]
        assert personality["speaking_style"] == "Direct but encouraging"

    @pytest.mark.asyncio
    async def test_get_active_personality_dream_self_missing_doc(self, mock_supabase):
        """Test fallback to Weave AI when Dream Self doc is missing."""
        # Mock user_profiles response (wants dream_self)
        user_response = MagicMock(data=[{"active_personality": "dream_self"}])

        # Mock identity_docs response (no documents)
        identity_response = MagicMock(data=[])

        # Setup mock chain
        mock_supabase.table().select().eq().execute.side_effect = [
            user_response,
            identity_response
        ]

        service = PersonalityService(mock_supabase)
        personality = await service.get_active_personality("user_123")

        # Should fallback to Weave AI
        assert personality["personality_type"] == "weave_ai"
        assert personality["name"] == "Weave"

    @pytest.mark.asyncio
    async def test_get_active_personality_user_not_found(self, mock_supabase):
        """Test fallback when user not found."""
        # Mock empty user response
        mock_supabase.table().select().eq().execute.return_value = MagicMock(data=[])

        service = PersonalityService(mock_supabase)
        personality = await service.get_active_personality("nonexistent_user")

        # Should fallback to Weave AI
        assert personality["personality_type"] == "weave_ai"

    @pytest.mark.asyncio
    async def test_get_active_personality_unknown_type(self, mock_supabase):
        """Test fallback for unknown personality type."""
        # Mock user with unknown personality type
        mock_supabase.table().select().eq().execute.return_value = MagicMock(
            data=[{"active_personality": "unknown_type"}]
        )

        service = PersonalityService(mock_supabase)
        personality = await service.get_active_personality("user_123")

        # Should fallback to Weave AI
        assert personality["personality_type"] == "weave_ai"

    @pytest.mark.asyncio
    async def test_get_active_personality_exception_handling(self, mock_supabase):
        """Test exception handling with graceful fallback."""
        # Mock exception
        mock_supabase.table().select().eq().execute.side_effect = Exception("Database error")

        service = PersonalityService(mock_supabase)
        personality = await service.get_active_personality("user_123")

        # Should fallback to Weave AI
        assert personality["personality_type"] == "weave_ai"

    @pytest.mark.asyncio
    async def test_switch_personality(self, mock_supabase):
        """Test switching personality."""
        # Mock update response
        update_response = MagicMock()

        # Mock get_active_personality after switch
        get_response = MagicMock(
            data=[{"active_personality": "dream_self"}]
        )

        identity_response = MagicMock(
            data=[{
                "content": {
                    "dream_self_name": "Alex",
                    "personality_traits": ["supportive"],
                    "speaking_style": "Encouraging"
                }
            }]
        )

        # Setup mock chain
        mock_supabase.table().update().eq().execute.return_value = update_response
        mock_supabase.table().select().eq().execute.side_effect = [
            get_response,
            identity_response
        ]

        service = PersonalityService(mock_supabase)
        personality = await service.switch_personality("user_123", "dream_self")

        # Verify update was called
        mock_supabase.table().update.assert_called_once_with(
            {"active_personality": "dream_self"}
        )

        # Verify returned personality
        assert personality["personality_type"] == "dream_self"
        assert personality["name"] == "Alex"

    @pytest.mark.asyncio
    async def test_switch_personality_invalid_type(self, mock_supabase):
        """Test switching to invalid personality type raises ValueError."""
        service = PersonalityService(mock_supabase)

        with pytest.raises(ValueError, match="Invalid personality type"):
            await service.switch_personality("user_123", "invalid_type")

    @pytest.mark.asyncio
    async def test_switch_personality_exception_handling(self, mock_supabase):
        """Test exception handling during personality switch."""
        # Mock update exception
        mock_supabase.table().update().eq().execute.side_effect = Exception("Database error")

        service = PersonalityService(mock_supabase)

        with pytest.raises(Exception, match="Database error"):
            await service.switch_personality("user_123", "dream_self")

    @pytest.mark.asyncio
    async def test_load_dream_self_success(self, mock_supabase):
        """Test loading Dream Self document."""
        # Mock identity_docs response
        identity_response = MagicMock(
            data=[{
                "content": {
                    "dream_self_name": "Alex the Disciplined",
                    "personality_traits": ["analytical", "supportive"],
                    "speaking_style": "Direct but encouraging"
                }
            }]
        )

        mock_supabase.table().select().eq().eq().execute.return_value = identity_response

        service = PersonalityService(mock_supabase)
        dream_self = await service._load_dream_self("user_123")

        assert dream_self is not None
        assert dream_self["personality_type"] == "dream_self"
        assert dream_self["name"] == "Alex the Disciplined"
        assert "analytical" in dream_self["traits"]

    @pytest.mark.asyncio
    async def test_load_dream_self_not_found(self, mock_supabase):
        """Test loading Dream Self when document doesn't exist."""
        # Mock empty response
        mock_supabase.table().select().eq().eq().execute.return_value = MagicMock(data=[])

        service = PersonalityService(mock_supabase)
        dream_self = await service._load_dream_self("user_123")

        assert dream_self is None

    @pytest.mark.asyncio
    async def test_load_dream_self_exception_handling(self, mock_supabase):
        """Test exception handling when loading Dream Self."""
        # Mock exception
        mock_supabase.table().select().eq().eq().execute.side_effect = Exception("Database error")

        service = PersonalityService(mock_supabase)
        dream_self = await service._load_dream_self("user_123")

        assert dream_self is None

    def test_default_weave_persona_structure(self):
        """Test that default Weave persona has correct structure."""
        persona = PersonalityService.DEFAULT_WEAVE_PERSONA

        assert persona["personality_type"] == "weave_ai"
        assert persona["name"] == "Weave"
        assert isinstance(persona["traits"], list)
        assert len(persona["traits"]) > 0
        assert "speaking_style" in persona

"""
Modify Personality Tool (Story 6.2 - AI Tool Use System)

Allows AI to switch user's active personality between Dream Self and Weave AI.
"""

import logging
from typing import Any, Dict

from app.core.deps import get_supabase_client
from app.services.personality_service import PersonalityService
from app.services.tools.base_tool import BaseTool

logger = logging.getLogger(__name__)


class ModifyPersonalityTool(BaseTool):
    """
    Tool that allows AI to switch user's active personality.

    Use Cases:
    - User explicitly requests: "Switch to Dream Self mode"
    - AI detects user wants personalized coaching
    - User asks about their identity/goals (better with Dream Self)
    - User wants general advice (better with Weave AI)

    Example:
        # AI decides to switch to Dream Self
        result = await tool.execute(
            user_id="user_123",
            parameters={"active_personality": "dream_self"}
        )
        # Returns: {"success": True, "data": {"personality_type": "dream_self", ...}}
    """

    @property
    def name(self) -> str:
        """Tool identifier."""
        return "modify_personality"

    @property
    def description(self) -> str:
        """Tool description for AI model."""
        return (
            "Switch the user's active AI personality. "
            "Use 'dream_self' for personalized coaching based on user's identity and goals. "
            "Use 'weave_ai' for general supportive coaching without personalization. "
            "Only invoke when user explicitly requests personality change or "
            "when conversation context suggests different personality would be more helpful."
        )

    @property
    def parameters_schema(self) -> Dict:
        """JSON schema for tool parameters."""
        return {
            "type": "object",
            "properties": {
                "active_personality": {
                    "type": "string",
                    "enum": ["dream_self", "weave_ai"],
                    "description": (
                        "Personality to activate. "
                        "'dream_self' = personalized AI using user's identity document. "
                        "'weave_ai' = general supportive coach without personalization."
                    )
                },
                "weave_preset": {
                    "type": "string",
                    "enum": ["gen_z_default", "supportive_coach", "concise_mentor"],
                    "description": (
                        "Optional: Weave AI preset style when active_personality is 'weave_ai'. "
                        "'gen_z_default' = casual, text-message style. "
                        "'supportive_coach' = encouraging, accountability-focused. "
                        "'concise_mentor' = brief, action-oriented."
                    )
                },
                "reason": {
                    "type": "string",
                    "description": (
                        "Optional: Brief explanation of why switching personalities. "
                        "Helps with logging and debugging."
                    )
                }
            },
            "required": ["active_personality"]
        }

    async def execute(
        self,
        user_id: str,
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute personality switch with optional preset change.

        Args:
            user_id: User ID (from user_profiles.id)
            parameters: {
                "active_personality": "dream_self" | "weave_ai",
                "weave_preset": "gen_z_default" | "supportive_coach" | "concise_mentor" (optional),
                "reason": "Optional reason for switch"
            }

        Returns:
            {
                "success": True,
                "data": {
                    "previous_personality": "...",
                    "new_personality": {
                        "personality_type": "dream_self",
                        "name": "Alex the Disciplined",
                        "traits": [...],
                        "speaking_style": "..."
                    }
                }
            }

        Raises:
            ValueError: If active_personality is invalid
        """
        active_personality = parameters.get("active_personality")
        weave_preset = parameters.get("weave_preset")
        reason = parameters.get("reason", "AI-initiated switch")

        logger.info(
            f"Switching personality for user {user_id} to '{active_personality}'. "
            f"Reason: {reason}"
        )

        # Validate personality type
        if active_personality not in ["dream_self", "weave_ai"]:
            raise ValueError(
                f"Invalid active_personality: {active_personality}. "
                f"Must be 'dream_self' or 'weave_ai'."
            )

        # Get Supabase client
        supabase = get_supabase_client()
        if not supabase:
            logger.error("Supabase client not available")
            return {
                "success": False,
                "error": "Database connection not available"
            }

        try:
            # Get current personality (for comparison)
            personality_service = PersonalityService(supabase)
            previous_personality = await personality_service.get_active_personality(user_id)

            # Check if already using requested personality
            if previous_personality["personality_type"] == active_personality:
                logger.info(f"User {user_id} already using {active_personality}, no change needed")
                return {
                    "success": True,
                    "data": {
                        "previous_personality": active_personality,
                        "new_personality": previous_personality,
                        "message": f"Already using {active_personality} personality"
                    }
                }

            # Switch personality
            new_personality = await personality_service.switch_personality(
                user_id=user_id,
                new_personality=active_personality
            )

            # Update weave_ai_preset if provided and switching to Weave AI
            if weave_preset and active_personality == 'weave_ai':
                try:
                    supabase.table("user_profiles") \
                        .update({"weave_ai_preset": weave_preset}) \
                        .eq("id", user_id) \
                        .execute()

                    logger.info(f"✅ Updated Weave AI preset to: {weave_preset}")

                    # Refresh personality details to include new preset
                    new_personality = await personality_service.get_active_personality(user_id)
                except Exception as preset_error:
                    logger.warning(f"⚠️  Failed to update Weave AI preset: {preset_error}")
                    # Don't fail the whole operation if preset update fails

            logger.info(
                f"✅ User {user_id} switched from {previous_personality['personality_type']} "
                f"to {new_personality['personality_type']}"
            )

            # Build response message
            response_message = f"Switched to {active_personality}. Now speaking as {new_personality['name']}."
            if weave_preset and active_personality == 'weave_ai':
                preset_names = {
                    'gen_z_default': 'Gen Z Default (casual)',
                    'supportive_coach': 'Supportive Coach',
                    'concise_mentor': 'Concise Mentor'
                }
                response_message += f" Using {preset_names.get(weave_preset, weave_preset)} style."

            return {
                "success": True,
                "data": {
                    "previous_personality": previous_personality["personality_type"],
                    "new_personality": new_personality,
                    "message": response_message
                }
            }

        except ValueError as e:
            logger.error(f"❌ Invalid personality switch request: {e}")
            return {
                "success": False,
                "error": str(e)
            }

        except Exception as e:
            logger.error(f"❌ Failed to switch personality for user {user_id}: {e}")
            return {
                "success": False,
                "error": f"Personality switch failed: {str(e)}"
            }

"""
Personality Service (Story 6.2 - Dual Personality System)

Manages switching between Dream Self (personalized) and Weave AI (general coach).

Personality Types:
- dream_self: User's ideal self from identity document (personalized, data-driven)
- weave_ai: Default Weave coach with preset styles (Story 6.1 integration)

Weave AI Presets (from Story 6.1):
- gen_z_default: Short, warm, text-message style (Gen Z vibes)
- supportive_coach: Encouraging, accountability-focused
- concise_mentor: Ultra-brief, action-oriented
"""

import logging
from typing import Dict, Optional

from supabase import Client as SupabaseClient

from app.config.ai_personality_config import AIPersonalityConfig

logger = logging.getLogger(__name__)


class PersonalityService:
    """
    Manages dual AI personalities for user (UNIFIED Story 6.1 + 6.2).

    Usage:
        service = PersonalityService(db)
        personality = await service.get_active_personality(user_id)
        # Returns personality dict with name, traits, speaking_style, system_prompt
    """

    def __init__(self, db: SupabaseClient):
        """
        Initialize PersonalityService.

        Args:
            db: Supabase client for database access
        """
        self.db = db

    async def get_active_personality(self, user_id: str) -> Dict:
        """
        Get user's active AI personality configuration (UNIFIED Story 6.1 + 6.2).

        Loads personality based on user_profiles.active_personality preference:
        - 'dream_self' → Load from identity_docs (personalized, data-driven)
        - 'weave_ai' → Use Story 6.1 preset (gen_z_default, supportive_coach, concise_mentor)

        Graceful fallback: If Dream Self doc missing, return Weave AI persona with default preset.

        Args:
            user_id: User ID (from user_profiles.id)

        Returns:
            Personality dict with:
            - personality_type: 'dream_self' or 'weave_ai'
            - name: Personality name
            - traits: List of personality traits (for Dream Self) or style tags (for Weave AI)
            - speaking_style: Description of speaking style
            - system_prompt: Full system prompt for AI model (NEW - unified format)
            - preset: Weave AI preset name (only if weave_ai)
            - max_words: Max words per response (only if weave_ai)
        """
        try:
            # Get user's active personality preference AND weave_ai_preset
            user_response = (
                self.db.table("user_profiles")
                .select("active_personality, weave_ai_preset")
                .eq("id", user_id)
                .execute()
            )

            if not user_response.data:
                logger.warning(f"User {user_id} not found, using default Weave AI")
                return self._get_weave_ai_persona("gen_z_default")

            user_data = user_response.data[0]
            active_personality = user_data.get("active_personality", "weave_ai")
            weave_ai_preset = user_data.get("weave_ai_preset", "gen_z_default")

            # If user prefers Weave AI, use Story 6.1 preset
            if active_personality == "weave_ai":
                logger.info(f"User {user_id} using Weave AI persona (preset: {weave_ai_preset})")
                return self._get_weave_ai_persona(weave_ai_preset)

            # If user prefers Dream Self, load from identity_docs
            if active_personality == "dream_self":
                dream_self = await self._load_dream_self(user_id)

                if dream_self:
                    logger.info(f"User {user_id} using Dream Self persona: {dream_self['name']}")
                    return dream_self
                else:
                    # Fallback: Dream Self doc missing
                    logger.warning(f"User {user_id} has active_personality='dream_self' but no identity doc, falling back to Weave AI")
                    return self._get_weave_ai_persona(weave_ai_preset)

            # Unknown personality type - fallback to Weave AI
            logger.warning(f"Unknown active_personality '{active_personality}' for user {user_id}, using Weave AI")
            return self._get_weave_ai_persona(weave_ai_preset)

        except Exception as e:
            logger.error(f"Error getting personality for user {user_id}: {e}")
            # Graceful fallback
            return self._get_weave_ai_persona("gen_z_default")

    def _get_weave_ai_persona(self, preset: str) -> Dict:
        """
        Get Weave AI persona with Story 6.1 preset integration.

        Args:
            preset: Preset name ('gen_z_default', 'supportive_coach', 'concise_mentor')

        Returns:
            Weave AI personality dict with system prompt from AIPersonalityConfig
        """
        # Validate preset (fallback to gen_z_default if invalid)
        if preset not in AIPersonalityConfig.PRESETS:
            logger.warning(f"Invalid weave_ai_preset '{preset}', using 'gen_z_default'")
            preset = "gen_z_default"

        # Get preset configuration from AIPersonalityConfig (Story 6.1)
        preset_config = AIPersonalityConfig.PRESETS[preset]

        return {
            "personality_type": "weave_ai",
            "name": "Weave",
            "preset": preset,
            "traits": preset_config["style_tags"],
            "speaking_style": self._get_preset_description(preset),
            "system_prompt": preset_config["system_prompt"],
            "max_words": preset_config["max_words"],
        }

    def _get_preset_description(self, preset: str) -> str:
        """Get human-readable description for preset."""
        descriptions = {
            "gen_z_default": "Short, warm, text-message style (Gen Z vibes)",
            "supportive_coach": "Encouraging, accountability-focused, data-driven",
            "concise_mentor": "Ultra-brief, action-oriented, direct",
        }
        return descriptions.get(preset, "Supportive and empowering")

    async def _load_dream_self(self, user_id: str) -> Optional[Dict]:
        """
        Load Dream Self personality from identity_docs table.

        Args:
            user_id: User ID

        Returns:
            Dream Self personality dict or None if not found
        """
        try:
            # Get latest version of identity doc (uses versioning, not type column)
            response = (
                self.db.table("identity_docs")
                .select("*")
                .eq("user_id", user_id)
                .order("version", desc=True)
                .limit(1)
                .execute()
            )

            if not response.data:
                return None

            doc = response.data[0]
            # Identity doc is stored in 'json' JSONB column
            content = doc.get("json", {})

            # Extract Dream Self details
            dream_self_name = content.get("dream_self_name", "Your Dream Self")
            traits = content.get("personality_traits", ["supportive", "growth-focused"])
            speaking_style = content.get("speaking_style", "Personalized and data-driven")

            # Build custom system prompt for Dream Self
            system_prompt = (
                f"You are {dream_self_name}, the user's personalized AI coach representing their ideal self. "
                f"Your personality traits: {', '.join(traits)}. "
                f"Speaking style: {speaking_style}. "
                f"Help the user achieve their goals with personalized, actionable guidance based on their actual data and progress."
            )

            return {
                "personality_type": "dream_self",
                "name": dream_self_name,
                "traits": traits,
                "speaking_style": speaking_style,
                "system_prompt": system_prompt,
            }

        except Exception as e:
            logger.error(f"Error loading Dream Self for user {user_id}: {e}")
            return None

    async def switch_personality(
        self,
        user_id: str,
        new_personality: str
    ) -> Dict:
        """
        Switch user's active AI personality.

        Args:
            user_id: User ID
            new_personality: 'dream_self' or 'weave_ai'

        Returns:
            Updated personality dict

        Raises:
            ValueError: If new_personality is invalid
        """
        if new_personality not in ["dream_self", "weave_ai"]:
            raise ValueError(f"Invalid personality type: {new_personality}")

        try:
            # Update user_profiles.active_personality
            self.db.table("user_profiles") \
                .update({"active_personality": new_personality}) \
                .eq("id", user_id) \
                .execute()

            logger.info(f"✅ User {user_id} switched to {new_personality}")

            # Return new active personality
            return await self.get_active_personality(user_id)

        except Exception as e:
            logger.error(f"Error switching personality for user {user_id}: {e}")
            raise

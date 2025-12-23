"""
Personality Service (Story 6.2 - Dual Personality System)

Manages switching between Dream Self (personalized) and Weave AI (general coach).

Personality Types:
- dream_self: User's ideal self from identity document (personalized, data-driven)
- weave_ai: Default Weave coach (general, supportive, non-personalized)
"""

import logging
from typing import Dict, Optional

from supabase import Client as SupabaseClient

logger = logging.getLogger(__name__)


class PersonalityService:
    """
    Manages dual AI personalities for user.

    Usage:
        service = PersonalityService(db)
        personality = await service.get_active_personality(user_id)
        # Returns personality dict with name, traits, speaking_style
    """

    # Default Weave AI persona (used when active_personality='weave_ai' or Dream Self missing)
    DEFAULT_WEAVE_PERSONA = {
        "personality_type": "weave_ai",
        "name": "Weave",
        "traits": ["encouraging", "supportive", "motivating", "general"],
        "speaking_style": "Friendly and empowering, uses positive reinforcement",
    }

    def __init__(self, db: SupabaseClient):
        """
        Initialize PersonalityService.

        Args:
            db: Supabase client for database access
        """
        self.db = db

    async def get_active_personality(self, user_id: str) -> Dict:
        """
        Get user's active AI personality configuration.

        Loads personality based on user_profiles.active_personality preference:
        - 'dream_self' → Load from identity_docs (type='dream_self')
        - 'weave_ai' → Return default Weave AI persona

        Graceful fallback: If Dream Self doc missing, return Weave AI persona.

        Args:
            user_id: User ID (from user_profiles.id)

        Returns:
            Personality dict with:
            - personality_type: 'dream_self' or 'weave_ai'
            - name: Personality name
            - traits: List of personality traits
            - speaking_style: Description of speaking style
        """
        try:
            # Get user's active personality preference
            user_response = (
                self.db.table("user_profiles")
                .select("active_personality")
                .eq("id", user_id)
                .execute()
            )

            if not user_response.data:
                logger.warning(f"User {user_id} not found, using default Weave AI")
                return self.DEFAULT_WEAVE_PERSONA

            active_personality = user_response.data[0].get("active_personality", "weave_ai")

            # If user prefers Weave AI, return default persona
            if active_personality == "weave_ai":
                logger.info(f"User {user_id} using Weave AI persona")
                return self.DEFAULT_WEAVE_PERSONA

            # If user prefers Dream Self, load from identity_docs
            if active_personality == "dream_self":
                dream_self = await self._load_dream_self(user_id)

                if dream_self:
                    logger.info(f"User {user_id} using Dream Self persona: {dream_self['name']}")
                    return dream_self
                else:
                    # Fallback: Dream Self doc missing
                    logger.warning(f"User {user_id} has active_personality='dream_self' but no identity doc, falling back to Weave AI")
                    return self.DEFAULT_WEAVE_PERSONA

            # Unknown personality type - fallback to Weave AI
            logger.warning(f"Unknown active_personality '{active_personality}' for user {user_id}, using Weave AI")
            return self.DEFAULT_WEAVE_PERSONA

        except Exception as e:
            logger.error(f"Error getting personality for user {user_id}: {e}")
            # Graceful fallback
            return self.DEFAULT_WEAVE_PERSONA

    async def _load_dream_self(self, user_id: str) -> Optional[Dict]:
        """
        Load Dream Self personality from identity_docs table.

        Args:
            user_id: User ID

        Returns:
            Dream Self personality dict or None if not found
        """
        try:
            response = (
                self.db.table("identity_docs")
                .select("*")
                .eq("user_id", user_id)
                .eq("type", "dream_self")
                .execute()
            )

            if not response.data:
                return None

            doc = response.data[0]
            content = doc.get("content", {})

            return {
                "personality_type": "dream_self",
                "name": content.get("dream_self_name", "Your Dream Self"),
                "traits": content.get("personality_traits", ["supportive", "growth-focused"]),
                "speaking_style": content.get("speaking_style", "Personalized and data-driven"),
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

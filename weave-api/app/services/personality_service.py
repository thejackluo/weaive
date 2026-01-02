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
                # Use config file default instead of hardcoded gen_z_default
                return self._get_weave_ai_persona(AIPersonalityConfig.PERSONALITY)

            user_data = user_response.data[0]
            active_personality = user_data.get("active_personality", "weave_ai")
            # Use config file default instead of hardcoded gen_z_default
            weave_ai_preset = user_data.get("weave_ai_preset") or AIPersonalityConfig.PERSONALITY

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
                    # Use config file default if user has no weave_ai_preset set
                    preset = weave_ai_preset or AIPersonalityConfig.PERSONALITY
                    return self._get_weave_ai_persona(preset)

            # Unknown personality type - fallback to Weave AI
            logger.warning(f"Unknown active_personality '{active_personality}' for user {user_id}, using Weave AI")
            preset = weave_ai_preset or AIPersonalityConfig.PERSONALITY
            return self._get_weave_ai_persona(preset)

        except Exception as e:
            logger.error(f"Error getting personality for user {user_id}: {e}")
            # Graceful fallback - use config file default
            return self._get_weave_ai_persona(AIPersonalityConfig.PERSONALITY)

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

        Returns default identity doc if none exists (graceful fallback).

        Args:
            user_id: User ID

        Returns:
            Dream Self personality dict or None if error
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

            # ✅ FIX: Return default identity doc if none exists
            if not response.data:
                logger.info(f"[PERSONALITY] ℹ️ No identity document found for user {user_id}, using default")
                content = self._get_default_identity_document()
            else:
                doc = response.data[0]
                # Identity doc is stored in 'json' JSONB column
                content = doc.get("json", {})
                logger.info(f"[PERSONALITY] ✅ Loaded identity document v{doc.get('version')}")

            # ✅ FIX: Use correct field names (match modify_identity_document_tool schema)
            dream_self_name = content.get("dream_self", "Your Best Self")
            traits = content.get("traits", ["growth-oriented", "consistent"])
            motivations = content.get("motivations", ["Achieve my goals"])
            archetype = content.get("archetype", "The Builder")
            failure_mode = content.get("failure_mode", "Inconsistency")
            coaching_preference = content.get("coaching_preference", "Direct but encouraging")

            # Build custom system prompt for Dream Self
            system_prompt = (
                f"You are {dream_self_name}, the user's personalized AI coach representing their ideal self.\n\n"
                f"**IDENTITY:**\n"
                f"- Archetype: {archetype}\n"
                f"- Core Traits: {', '.join(traits)}\n"
                f"- Motivations: {', '.join(motivations)}\n"
                f"- Failure Mode: {failure_mode}\n"
                f"- Coaching Preference: {coaching_preference}\n\n"
                f"**YOUR ROLE:**\n"
                f"Help the user achieve their goals with personalized, actionable guidance based on their actual data and progress. "
                f"Speak in a style that matches their coaching preference. "
                f"Be aware of their failure mode and help them avoid it. "
                f"Reference their motivations when encouraging them.\n\n"
                f"**GUIDELINES:**\n"
                f"- Always reference specific user data (completions, goals, patterns)\n"
                f"- Match the coaching preference style\n"
                f"- Keep responses under 80 words\n"
                f"- No markdown formatting"
            )

            return {
                "personality_type": "dream_self",
                "name": dream_self_name,
                "traits": traits,
                "speaking_style": coaching_preference,
                "system_prompt": system_prompt,
                "archetype": archetype,
                "motivations": motivations,
                "failure_mode": failure_mode,
            }

        except Exception as e:
            logger.error(f"Error loading Dream Self for user {user_id}: {e}")
            # ✅ Return default instead of None
            logger.info("[PERSONALITY] ⚠️ Falling back to default identity document")
            return self._build_dream_self_from_content(self._get_default_identity_document())

    def _get_default_identity_document(self) -> Dict:
        """
        Get default identity document for users without one.

        This allows Dream Self personality to work out of the box
        with generic but helpful defaults until user customizes.

        Returns:
            Default identity document structure
        """
        return {
            "dream_self": "Your Best Self",
            "traits": ["growth-oriented", "consistent", "self-aware"],
            "motivations": ["Build better habits", "Achieve my goals", "Become my ideal self"],
            "archetype": "The Builder",
            "failure_mode": "Inconsistency and distraction",
            "coaching_preference": "Direct but encouraging feedback"
        }

    def _build_dream_self_from_content(self, content: Dict) -> Dict:
        """
        Build Dream Self personality dict from identity document content.

        Args:
            content: Identity document JSON content

        Returns:
            Dream Self personality dict
        """
        dream_self_name = content.get("dream_self", "Your Best Self")
        traits = content.get("traits", ["growth-oriented"])
        motivations = content.get("motivations", ["Achieve my goals"])
        archetype = content.get("archetype", "The Builder")
        failure_mode = content.get("failure_mode", "Inconsistency")
        coaching_preference = content.get("coaching_preference", "Direct but encouraging")

        system_prompt = (
            f"You are {dream_self_name}, the user's personalized AI coach representing their ideal self.\n\n"
            f"**IDENTITY:**\n"
            f"- Archetype: {archetype}\n"
            f"- Core Traits: {', '.join(traits)}\n"
            f"- Motivations: {', '.join(motivations)}\n"
            f"- Failure Mode: {failure_mode}\n"
            f"- Coaching Preference: {coaching_preference}\n\n"
            f"**YOUR ROLE:**\n"
            f"Help the user achieve their goals with personalized, actionable guidance based on their actual data and progress. "
            f"Speak in a style that matches their coaching preference. "
            f"Be aware of their failure mode and help them avoid it. "
            f"Reference their motivations when encouraging them.\n\n"
            f"**GUIDELINES:**\n"
            f"- Always reference specific user data (completions, goals, patterns)\n"
            f"- Match the coaching preference style\n"
            f"- Keep responses under 80 words\n"
            f"- No markdown formatting"
        )

        return {
            "personality_type": "dream_self",
            "name": dream_self_name,
            "traits": traits,
            "speaking_style": coaching_preference,
            "system_prompt": system_prompt,
            "archetype": archetype,
            "motivations": motivations,
            "failure_mode": failure_mode,
        }

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

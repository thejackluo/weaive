"""
Modify Identity Document Tool (Story 6.2 - AI Tool Use System)

Allows AI to create or update user's identity document (Dream Self profile).
"""

import logging
from typing import Any, Dict

from app.core.deps import get_supabase_client
from app.services.tools.base_tool import BaseTool

logger = logging.getLogger(__name__)


class ModifyIdentityDocumentTool(BaseTool):
    """
    Tool that allows AI to create or update user's identity document.

    Use Cases:
    - User defines their dream self: "My dream self is Alex the Disciplined"
    - User adds traits: "I'm analytical and supportive"
    - User describes motivations: "I want to build financial freedom"
    - User sets coaching preference: "I prefer direct but encouraging feedback"

    Example:
        result = await tool.execute(
            user_id="user_123",
            parameters={
                "dream_self": "Alex the Disciplined",
                "traits": ["analytical", "supportive"],
                "motivations": ["Build financial freedom"]
            }
        )
        # Returns: {"success": True, "data": {"version": 1, "content": {...}}}
    """

    @property
    def name(self) -> str:
        """Tool identifier."""
        return "modify_identity_document"

    @property
    def description(self) -> str:
        """Tool description for AI model."""
        return (
            "Create or update the user's identity document (Dream Self profile). "
            "Use this when user wants to define or change their dream self, traits, "
            "motivations, archetype, or coaching preferences. "
            "This enables personalized AI coaching based on their identity. "
            "All fields are optional - you can update individual fields without affecting others."
        )

    @property
    def parameters_schema(self) -> Dict:
        """JSON schema for tool parameters."""
        return {
            "type": "object",
            "properties": {
                "dream_self": {
                    "type": "string",
                    "description": "User's dream self identity (e.g., 'Alex the Disciplined', 'Sarah the Creative Builder')"
                },
                "traits": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of personality traits (e.g., ['analytical', 'supportive', 'direct'])"
                },
                "motivations": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of core motivations (e.g., ['Build financial freedom', 'Master my craft'])"
                },
                "archetype": {
                    "type": "string",
                    "description": "User archetype (e.g., 'The Builder', 'The Learner', 'The Optimizer')"
                },
                "failure_mode": {
                    "type": "string",
                    "description": "How user fails when off-track (e.g., 'Analysis paralysis', 'Scattered focus')"
                },
                "coaching_preference": {
                    "type": "string",
                    "description": "Preferred coaching style (e.g., 'Direct but encouraging', 'Gentle accountability')"
                }
            },
            "required": []  # All fields optional - partial updates allowed
        }

    async def execute(
        self,
        user_id: str,
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute identity document modification.

        Creates new version of identity document with updated fields.
        Uses versioning pattern: each update creates new row with incremented version.

        Args:
            user_id: User ID (user_profiles.id)
            parameters: {
                "dream_self": Optional[str],
                "traits": Optional[List[str]],
                "motivations": Optional[List[str]],
                "archetype": Optional[str],
                "failure_mode": Optional[str],
                "coaching_preference": Optional[str]
            }

        Returns:
            {
                "success": True,
                "data": {
                    "version": 2,
                    "content": {...},
                    "message": "Identity document updated successfully"
                }
            }
        """
        logger.info(f"[IDENTITY_DOC_TOOL] 📝 Modifying identity document for user {user_id}")

        # Get Supabase client
        supabase = get_supabase_client()
        if not supabase:
            logger.error("Supabase client not available")
            return {
                "success": False,
                "error": "Database connection not available"
            }

        try:
            # Get latest version of identity doc (if exists)
            existing_response = (
                supabase.table("identity_docs")
                .select("*")
                .eq("user_id", user_id)
                .order("version", desc=True)
                .limit(1)
                .execute()
            )

            # Determine next version number
            next_version = 1
            existing_content = {}

            if existing_response.data:
                latest_doc = existing_response.data[0]
                next_version = latest_doc["version"] + 1
                existing_content = latest_doc.get("json", {})
                logger.info(f"[IDENTITY_DOC_TOOL] Found existing doc v{latest_doc['version']}, creating v{next_version}")
            else:
                logger.info("[IDENTITY_DOC_TOOL] No existing doc, creating v1")

            # Merge new fields with existing content (partial update pattern)
            updated_content = {**existing_content}

            # Update only fields that were provided
            for field in ["dream_self", "traits", "motivations", "archetype", "failure_mode", "coaching_preference"]:
                if field in parameters and parameters[field] is not None:
                    updated_content[field] = parameters[field]
                    logger.info(f"[IDENTITY_DOC_TOOL] Updating field: {field}")

            # Insert new version
            insert_response = (
                supabase.table("identity_docs")
                .insert({
                    "user_id": user_id,
                    "version": next_version,
                    "json": updated_content
                })
                .execute()
            )

            if not insert_response.data:
                raise Exception("Failed to insert identity document")

            _ = insert_response.data[0]  # Verify insertion succeeded
            logger.info(f"[IDENTITY_DOC_TOOL] ✅ Created identity doc v{next_version}")

            # If user was using Weave AI, switch them to Dream Self automatically
            profile_response = (
                supabase.table("user_profiles")
                .select("active_personality")
                .eq("id", user_id)
                .single()
                .execute()
            )

            switched_personality = False
            if profile_response.data and profile_response.data.get("active_personality") == "weave_ai":
                supabase.table("user_profiles").update({
                    "active_personality": "dream_self"
                }).eq("id", user_id).execute()
                logger.info("[IDENTITY_DOC_TOOL] ✅ Switched user to Dream Self personality")
                switched_personality = True

            return {
                "success": True,
                "data": {
                    "version": next_version,
                    "content": updated_content,
                    "switched_to_dream_self": switched_personality,
                    "message": (
                        f"Identity document updated (version {next_version}). "
                        + ("Now using Dream Self personality." if switched_personality else "")
                    )
                }
            }

        except Exception as e:
            logger.error(f"[IDENTITY_DOC_TOOL] ❌ Error modifying identity document: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to update identity document"
            }

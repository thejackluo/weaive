"""
AI-Based Tool Classification System

Replaces regex-based deterministic triggering with AI-powered classification.
Uses a small, fast model (GPT-4o-mini or Claude 3.5 Haiku) to:
1. Determine if user's message requires tool execution
2. Identify which tool(s) to call
3. Extract parameters from natural language

Architecture:
User Message → AI Classifier (with tool descriptions) → Tool Selection + Parameters
"""

import logging
import json
from typing import Dict, Any, List
from app.services.ai import AIService

logger = logging.getLogger(__name__)


class AIToolClassifier:
    """
    AI-powered tool classification using prompt-based analysis.

    Uses a small, fast AI model to determine if and which tools should be called
    based on user's natural language input.
    """

    def __init__(self, ai_service: AIService):
        """
        Initialize with AI service for classification.

        Args:
            ai_service: Configured AIService instance
        """
        self.ai_service = ai_service
        self.available_tools = self._get_tool_descriptions()

    def _get_tool_descriptions(self) -> List[Dict[str, Any]]:
        """
        Get descriptions of all available tools for AI classifier.

        Returns list of tool descriptions in format:
        {
            "name": "modify_personality",
            "description": "Changes the AI coaching personality",
            "parameters": ["active_personality", "weave_preset"],
            "examples": ["switch to dream self", "be more casual"]
        }
        """
        return [
            {
                "name": "modify_personality",
                "description": "Change the AI coaching personality (Dream Self or Weave AI) or adjust Weave AI's speaking style",
                "parameters": {
                    "active_personality": "Which personality to use: 'dream_self' or 'weave_ai'",
                    "weave_preset": "Optional style for Weave AI: 'gen_z_default', 'supportive_coach', or 'concise_mentor'"
                },
                "examples": [
                    "switch to my dream self",
                    "use weave ai",
                    "be more casual",
                    "talk like a supportive coach",
                    "be concise and direct"
                ]
            },
            {
                "name": "modify_identity_document",
                "description": "Update user's identity document including dream self name, traits, archetype, motivations, failure mode, or coaching preferences",
                "parameters": {
                    "dream_self": "User's ideal self name",
                    "traits": "List of personality traits",
                    "archetype": "Identity archetype (e.g., 'The Builder', 'The Leader')",
                    "motivations": "List of core motivations",
                    "failure_mode": "What derails the user (e.g., 'Inconsistency', 'Perfectionism')",
                    "coaching_preference": "How user wants to be coached"
                },
                "examples": [
                    "I am Jack",
                    "my traits are curious and ambitious",
                    "my archetype is the builder",
                    "I want financial freedom",
                    "I struggle with consistency",
                    "be direct but encouraging with me"
                ]
            }
        ]

    async def analyze_message(self, user_message: str, user_id: str) -> List[Dict[str, Any]]:
        """
        Analyze user message to determine if tools should be called.

        Args:
            user_message: The user's natural language input
            user_id: User ID for AI service tracking

        Returns:
            List of tool calls in format:
            [
                {
                    "tool_name": "modify_personality",
                    "parameters": {"active_personality": "dream_self"}
                },
                ...
            ]
            Empty list if no tools should be called.
        """
        # Build classification prompt
        classification_prompt = self._build_classification_prompt(user_message)

        try:
            # Use fast, cheap model for classification (GPT-4o-mini or Claude 3.5 Haiku)
            response = await self.ai_service.generate(
                user_id=user_id,
                prompt=classification_prompt,
                max_tokens=500,
                temperature=0.1,  # Low temperature for consistent classification
                model_size='mini',  # Use smallest, fastest model
            )

            # Parse AI response
            tool_calls = self._parse_classification_response(response['content'])

            if __DEV__ := True:
                if tool_calls:
                    logger.info(f"[TOOL_CLASSIFIER] 🎯 AI identified {len(tool_calls)} tool(s): {[t['tool_name'] for t in tool_calls]}")
                else:
                    logger.info(f"[TOOL_CLASSIFIER] ✋ No tools needed for message: {user_message[:50]}")

            return tool_calls

        except Exception as e:
            logger.error(f"[TOOL_CLASSIFIER] ❌ Classification failed: {e}")
            return []  # Fail gracefully - no tools called

    def _build_classification_prompt(self, user_message: str) -> str:
        """
        Build the classification prompt for the AI model.

        Provides tool descriptions and asks AI to determine if tools are needed.
        """
        tools_description = "\n\n".join([
            f"**{tool['name']}**\n"
            f"Description: {tool['description']}\n"
            f"Parameters: {json.dumps(tool['parameters'], indent=2)}\n"
            f"Example phrases: {', '.join(tool['examples'])}"
            for tool in self.available_tools
        ])

        prompt = f"""You are a tool classification system. Analyze the user's message and determine if any tools should be called.

Available Tools:
{tools_description}

User Message: "{user_message}"

Instructions:
1. Determine if the user's message requires calling any of the available tools
2. If YES: Identify which tool(s) and extract the necessary parameters from their message
3. If NO: Return an empty list

Response Format (JSON only):
{{
  "tools": [
    {{
      "tool_name": "modify_personality",
      "parameters": {{
        "active_personality": "dream_self"
      }}
    }}
  ]
}}

Or if no tools needed:
{{
  "tools": []
}}

Respond with ONLY the JSON object, no other text."""

        return prompt

    def _parse_classification_response(self, ai_response: str) -> List[Dict[str, Any]]:
        """
        Parse AI's classification response into structured tool calls.

        Args:
            ai_response: Raw AI response (should be JSON)

        Returns:
            List of tool calls with parameters
        """
        try:
            # Clean response (remove markdown code blocks if present)
            cleaned = ai_response.strip()
            if cleaned.startswith('```'):
                # Remove ```json and ``` markers
                lines = cleaned.split('\n')
                cleaned = '\n'.join(lines[1:-1]) if len(lines) > 2 else cleaned

            # Parse JSON
            parsed = json.loads(cleaned)
            tool_calls = parsed.get('tools', [])

            # Validate structure
            validated_calls = []
            for call in tool_calls:
                if 'tool_name' in call and 'parameters' in call:
                    validated_calls.append({
                        'tool_name': call['tool_name'],
                        'parameters': call['parameters']
                    })
                else:
                    logger.warning(f"[TOOL_CLASSIFIER] ⚠️ Invalid tool call structure: {call}")

            return validated_calls

        except json.JSONDecodeError as e:
            logger.error(f"[TOOL_CLASSIFIER] ❌ Failed to parse AI response as JSON: {e}")
            logger.error(f"Raw response: {ai_response}")
            return []
        except Exception as e:
            logger.error(f"[TOOL_CLASSIFIER] ❌ Unexpected error parsing response: {e}")
            return []



def create_tool_classifier(ai_service: AIService) -> AIToolClassifier:
    """
    Create a tool classifier instance with the provided AI service.

    Args:
        ai_service: Configured AIService instance

    Returns:
        AIToolClassifier instance ready for use
    """
    return AIToolClassifier(ai_service)

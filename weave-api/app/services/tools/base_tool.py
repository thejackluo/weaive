"""
Base Tool Interface (Story 6.2 - AI Tool Use System)

Defines the interface for all AI-callable tools.
Tools enable AI to perform actions like modifying user preferences,
fetching data, or triggering workflows.
"""

import logging
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


class BaseTool(ABC):
    """
    Abstract base class for all AI-callable tools.

    Each tool must implement:
    - name: Unique identifier for the tool
    - description: Human-readable description for AI model
    - parameters_schema: JSON schema defining required/optional parameters
    - execute: Async method that performs the tool's action

    Usage:
        class MyTool(BaseTool):
            @property
            def name(self) -> str:
                return "my_tool"

            @property
            def description(self) -> str:
                return "Does something useful"

            @property
            def parameters_schema(self) -> Dict:
                return {
                    "type": "object",
                    "properties": {
                        "param1": {"type": "string", "description": "..."},
                    },
                    "required": ["param1"]
                }

            async def execute(self, user_id: str, parameters: Dict) -> Dict:
                result = perform_action(parameters["param1"])
                return {"success": True, "data": result}
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """
        Unique tool identifier (e.g., 'modify_personality', 'fetch_goals').

        Returns:
            Tool name in snake_case
        """
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        """
        Human-readable description of what the tool does.

        This description is provided to the AI model to help it
        decide when to invoke the tool.

        Returns:
            Clear, concise description (1-2 sentences)
        """
        pass

    @property
    @abstractmethod
    def parameters_schema(self) -> Dict:
        """
        JSON schema defining tool parameters.

        Must follow JSON Schema format:
        {
            "type": "object",
            "properties": {
                "param_name": {
                    "type": "string|number|boolean|array|object",
                    "description": "Parameter description for AI",
                    "enum": ["option1", "option2"]  # optional
                }
            },
            "required": ["param1", "param2"]  # optional
        }

        Returns:
            JSON schema dict
        """
        pass

    @abstractmethod
    async def execute(
        self,
        user_id: str,
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute the tool's action.

        Args:
            user_id: User ID (from user_profiles.id) for authorization
            parameters: Tool parameters matching parameters_schema

        Returns:
            Execution result dict:
            {
                "success": True/False,
                "data": {...},  # Tool-specific result data
                "error": "..."  # Error message if success=False
            }

        Raises:
            ValueError: If parameters are invalid
            Exception: If execution fails
        """
        pass

    def validate_parameters(self, parameters: Dict[str, Any]) -> bool:
        """
        Validate parameters against schema (optional override).

        Default implementation checks required fields exist.
        Override for custom validation logic.

        Args:
            parameters: Parameters to validate

        Returns:
            True if valid

        Raises:
            ValueError: If validation fails
        """
        required = self.parameters_schema.get("required", [])
        missing = [field for field in required if field not in parameters]

        if missing:
            raise ValueError(
                f"Missing required parameters for {self.name}: {missing}"
            )

        return True

    def to_schema(self) -> Dict:
        """
        Convert tool to OpenAI/Anthropic function calling schema.

        Returns:
            Tool schema dict:
            {
                "name": "tool_name",
                "description": "Tool description",
                "parameters": {...}  # JSON schema
            }
        """
        return {
            "name": self.name,
            "description": self.description,
            "parameters": self.parameters_schema,
        }

    async def safe_execute(
        self,
        user_id: str,
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute tool with error handling and logging.

        This is the recommended method to call tools (instead of execute directly).

        Args:
            user_id: User ID
            parameters: Tool parameters

        Returns:
            Execution result (always returns dict, never raises)
        """
        try:
            logger.info(f"Executing tool '{self.name}' for user {user_id} with params: {parameters}")

            # Validate parameters
            self.validate_parameters(parameters)

            # Execute tool
            result = await self.execute(user_id, parameters)

            logger.info(f"✅ Tool '{self.name}' executed successfully for user {user_id}")
            return result

        except ValueError as e:
            logger.error(f"❌ Invalid parameters for tool '{self.name}': {e}")
            return {
                "success": False,
                "error": f"Invalid parameters: {str(e)}"
            }

        except Exception as e:
            logger.error(f"❌ Tool '{self.name}' execution failed for user {user_id}: {e}")
            return {
                "success": False,
                "error": f"Tool execution failed: {str(e)}"
            }

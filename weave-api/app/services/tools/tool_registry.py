"""
Tool Registry (Story 6.2 - AI Tool Use System)

Central registry for all AI-callable tools. Manages tool registration,
discovery, and execution.
"""

import logging
from typing import Dict, List, Optional

from app.services.tools.base_tool import BaseTool

logger = logging.getLogger(__name__)


class ToolRegistry:
    """
    Registry for AI-callable tools.

    Usage:
        registry = ToolRegistry()
        registry.register(ModifyPersonalityTool())
        registry.register(FetchGoalsTool())

        # Get tool schemas for AI model
        schemas = registry.get_tool_schemas()

        # Execute tool
        result = await registry.execute_tool(
            tool_name="modify_personality",
            user_id="user_123",
            parameters={"active_personality": "dream_self"}
        )
    """

    def __init__(self):
        """Initialize empty tool registry."""
        self._tools: Dict[str, BaseTool] = {}
        logger.info("ToolRegistry initialized")

    def register(self, tool: BaseTool) -> None:
        """
        Register a tool in the registry.

        Args:
            tool: Tool instance to register

        Raises:
            ValueError: If tool with same name already registered
        """
        if tool.name in self._tools:
            raise ValueError(
                f"Tool '{tool.name}' is already registered. "
                f"Use unregister() first to replace it."
            )

        self._tools[tool.name] = tool
        logger.info(f"✅ Registered tool: {tool.name}")

    def unregister(self, tool_name: str) -> None:
        """
        Unregister a tool from the registry.

        Args:
            tool_name: Name of tool to remove

        Raises:
            KeyError: If tool not found
        """
        if tool_name not in self._tools:
            raise KeyError(f"Tool '{tool_name}' not found in registry")

        del self._tools[tool_name]
        logger.info(f"Unregistered tool: {tool_name}")

    def get_tool(self, tool_name: str) -> Optional[BaseTool]:
        """
        Get tool instance by name.

        Args:
            tool_name: Name of tool to retrieve

        Returns:
            Tool instance or None if not found
        """
        return self._tools.get(tool_name)

    def list_tools(self) -> List[str]:
        """
        List all registered tool names.

        Returns:
            List of tool names
        """
        return list(self._tools.keys())

    def get_tool_schemas(self) -> List[Dict]:
        """
        Get tool schemas for AI model (OpenAI/Anthropic format).

        Returns:
            List of tool schemas:
            [
                {
                    "name": "tool_name",
                    "description": "...",
                    "parameters": {...}
                },
                ...
            ]
        """
        return [tool.to_schema() for tool in self._tools.values()]

    async def execute_tool(
        self,
        tool_name: str,
        user_id: str,
        parameters: Dict
    ) -> Dict:
        """
        Execute a registered tool by name.

        Args:
            tool_name: Name of tool to execute
            user_id: User ID for authorization
            parameters: Tool parameters

        Returns:
            Execution result:
            {
                "success": True/False,
                "data": {...},
                "error": "..." # if success=False
            }
        """
        tool = self.get_tool(tool_name)

        if not tool:
            logger.error(f"❌ Tool '{tool_name}' not found in registry")
            return {
                "success": False,
                "error": f"Unknown tool: {tool_name}"
            }

        logger.info(f"Executing tool '{tool_name}' for user {user_id}")
        return await tool.safe_execute(user_id, parameters)

    def __len__(self) -> int:
        """Return number of registered tools."""
        return len(self._tools)

    def __contains__(self, tool_name: str) -> bool:
        """Check if tool is registered."""
        return tool_name in self._tools


# Global tool registry instance
_global_registry: Optional[ToolRegistry] = None


def get_tool_registry() -> ToolRegistry:
    """
    Get the global tool registry instance (singleton pattern).

    Returns:
        Global ToolRegistry instance
    """
    global _global_registry

    if _global_registry is None:
        _global_registry = ToolRegistry()
        logger.info("Created global ToolRegistry instance")

    return _global_registry


def register_default_tools() -> None:
    """
    Register default tools in the global registry.

    This function is called at app startup to register all
    available tools for AI use.
    """
    from app.services.tools.modify_identity_document_tool import ModifyIdentityDocumentTool
    from app.services.tools.modify_personality_tool import ModifyPersonalityTool

    registry = get_tool_registry()

    # Register tools
    registry.register(ModifyPersonalityTool())
    registry.register(ModifyIdentityDocumentTool())

    logger.info(f"✅ Registered {len(registry)} default tools")

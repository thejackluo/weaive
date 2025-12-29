"""
AI Tool Use System (Story 6.2)

Provides tools that AI can invoke during conversation to perform actions.
"""

from app.services.tools.base_tool import BaseTool
from app.services.tools.modify_personality_tool import ModifyPersonalityTool
from app.services.tools.modify_identity_document_tool import ModifyIdentityDocumentTool
from app.services.tools.tool_registry import (
    ToolRegistry,
    get_tool_registry,
    register_default_tools,
)

__all__ = [
    "BaseTool",
    "ModifyPersonalityTool",
    "ModifyIdentityDocumentTool",
    "ToolRegistry",
    "get_tool_registry",
    "register_default_tools",
]

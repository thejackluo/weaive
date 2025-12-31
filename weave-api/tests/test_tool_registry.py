"""
Tests for Tool Registry System (Story 6.2)
"""


import pytest

from app.services.tools.base_tool import BaseTool
from app.services.tools.tool_registry import ToolRegistry


class MockTool(BaseTool):
    """Mock tool for testing."""

    @property
    def name(self) -> str:
        return "mock_tool"

    @property
    def description(self) -> str:
        return "A mock tool for testing"

    @property
    def parameters_schema(self) -> dict:
        return {
            "type": "object",
            "properties": {
                "test_param": {"type": "string", "description": "Test parameter"}
            },
            "required": ["test_param"]
        }

    async def execute(self, user_id: str, parameters: dict) -> dict:
        return {
            "success": True,
            "data": {"result": f"Executed with {parameters['test_param']}"}
        }


class FailingMockTool(BaseTool):
    """Mock tool that always fails."""

    @property
    def name(self) -> str:
        return "failing_tool"

    @property
    def description(self) -> str:
        return "A tool that fails"

    @property
    def parameters_schema(self) -> dict:
        return {
            "type": "object",
            "properties": {
                "param": {"type": "string"}
            },
            "required": ["param"]
        }

    async def execute(self, user_id: str, parameters: dict) -> dict:
        raise Exception("Tool execution failed")


class TestToolRegistry:
    """Test ToolRegistry functionality."""

    def test_register_tool(self):
        """Test registering a tool."""
        registry = ToolRegistry()
        tool = MockTool()

        registry.register(tool)

        assert "mock_tool" in registry
        assert len(registry) == 1
        assert registry.get_tool("mock_tool") == tool

    def test_register_duplicate_tool_raises_error(self):
        """Test that registering duplicate tool name raises ValueError."""
        registry = ToolRegistry()
        tool1 = MockTool()
        tool2 = MockTool()

        registry.register(tool1)

        with pytest.raises(ValueError, match="already registered"):
            registry.register(tool2)

    def test_unregister_tool(self):
        """Test unregistering a tool."""
        registry = ToolRegistry()
        tool = MockTool()

        registry.register(tool)
        assert "mock_tool" in registry

        registry.unregister("mock_tool")
        assert "mock_tool" not in registry
        assert len(registry) == 0

    def test_unregister_nonexistent_tool_raises_error(self):
        """Test that unregistering nonexistent tool raises KeyError."""
        registry = ToolRegistry()

        with pytest.raises(KeyError, match="not found"):
            registry.unregister("nonexistent_tool")

    def test_list_tools(self):
        """Test listing all registered tools."""
        registry = ToolRegistry()
        tool1 = MockTool()

        registry.register(tool1)

        tools = registry.list_tools()
        assert tools == ["mock_tool"]

    def test_get_tool_schemas(self):
        """Test getting tool schemas for AI model."""
        registry = ToolRegistry()
        tool = MockTool()

        registry.register(tool)

        schemas = registry.get_tool_schemas()
        assert len(schemas) == 1
        assert schemas[0]["name"] == "mock_tool"
        assert schemas[0]["description"] == "A mock tool for testing"
        assert "parameters" in schemas[0]

    @pytest.mark.asyncio
    async def test_execute_tool_success(self):
        """Test executing a tool successfully."""
        registry = ToolRegistry()
        tool = MockTool()

        registry.register(tool)

        result = await registry.execute_tool(
            tool_name="mock_tool",
            user_id="user_123",
            parameters={"test_param": "hello"}
        )

        assert result["success"] is True
        assert result["data"]["result"] == "Executed with hello"

    @pytest.mark.asyncio
    async def test_execute_nonexistent_tool(self):
        """Test executing nonexistent tool returns error."""
        registry = ToolRegistry()

        result = await registry.execute_tool(
            tool_name="nonexistent",
            user_id="user_123",
            parameters={}
        )

        assert result["success"] is False
        assert "Unknown tool" in result["error"]

    @pytest.mark.asyncio
    async def test_execute_tool_with_invalid_parameters(self):
        """Test executing tool with missing required parameters."""
        registry = ToolRegistry()
        tool = MockTool()

        registry.register(tool)

        result = await registry.execute_tool(
            tool_name="mock_tool",
            user_id="user_123",
            parameters={}  # Missing required test_param
        )

        assert result["success"] is False
        assert "Missing required parameters" in result["error"]

    @pytest.mark.asyncio
    async def test_execute_tool_handles_exceptions(self):
        """Test that tool execution exceptions are handled gracefully."""
        registry = ToolRegistry()
        failing_tool = FailingMockTool()

        registry.register(failing_tool)

        result = await registry.execute_tool(
            tool_name="failing_tool",
            user_id="user_123",
            parameters={"param": "test"}
        )

        assert result["success"] is False
        assert "Tool execution failed" in result["error"]


class TestBaseTool:
    """Test BaseTool functionality."""

    @pytest.mark.asyncio
    async def test_safe_execute_success(self):
        """Test safe_execute with successful tool."""
        tool = MockTool()

        result = await tool.safe_execute(
            user_id="user_123",
            parameters={"test_param": "value"}
        )

        assert result["success"] is True

    @pytest.mark.asyncio
    async def test_safe_execute_validation_error(self):
        """Test safe_execute handles validation errors."""
        tool = MockTool()

        result = await tool.safe_execute(
            user_id="user_123",
            parameters={}  # Missing required parameter
        )

        assert result["success"] is False
        assert "Invalid parameters" in result["error"]

    @pytest.mark.asyncio
    async def test_safe_execute_execution_error(self):
        """Test safe_execute handles execution errors."""
        tool = FailingMockTool()

        result = await tool.safe_execute(
            user_id="user_123",
            parameters={"param": "test"}
        )

        assert result["success"] is False
        assert "Tool execution failed" in result["error"]

    def test_validate_parameters_success(self):
        """Test parameter validation with valid parameters."""
        tool = MockTool()

        # Should not raise
        assert tool.validate_parameters({"test_param": "value"}) is True

    def test_validate_parameters_missing_required(self):
        """Test parameter validation with missing required field."""
        tool = MockTool()

        with pytest.raises(ValueError, match="Missing required parameters"):
            tool.validate_parameters({})

    def test_to_schema(self):
        """Test converting tool to schema format."""
        tool = MockTool()

        schema = tool.to_schema()

        assert schema["name"] == "mock_tool"
        assert schema["description"] == "A mock tool for testing"
        assert "parameters" in schema
        assert schema["parameters"]["type"] == "object"

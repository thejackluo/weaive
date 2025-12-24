"""
AI Orchestrator (Story 6.2 - AI Tool Use System)

High-level orchestration layer that adds tool calling capability to AIService.
Handles tool invocation flow: AI → Tool Execution → AI with Results.
"""

import json
import logging
import re
from typing import Any, Dict, List, Optional

from app.services.ai.ai_service import AIService
from app.services.ai.base import AIResponse
from app.services.tools import get_tool_registry

logger = logging.getLogger(__name__)


class AIOrchestrator:
    """
    Orchestrates AI generation with tool calling support.

    Wraps AIService and adds:
    - Tool schema injection into prompts
    - Tool call parsing from AI responses
    - Tool execution via ToolRegistry
    - Result feedback loop for final response

    Usage:
        orchestrator = AIOrchestrator(ai_service)
        response = await orchestrator.generate_with_tools(
            user_id="user_123",
            prompt="Switch to Dream Self mode",
            enable_tools=True,
            ...
        )
    """

    def __init__(self, ai_service: AIService):
        """
        Initialize AI Orchestrator.

        Args:
            ai_service: Underlying AIService for generation
        """
        self.ai_service = ai_service
        self.tool_registry = get_tool_registry()

    async def generate_with_tools(
        self,
        user_id: str,
        prompt: str,
        module: str = 'chat',
        enable_tools: bool = True,
        user_context: Optional[Dict] = None,
        max_tool_iterations: int = 3,
        **kwargs
    ) -> AIResponse:
        """
        Generate AI response with optional tool calling.

        Flow:
        1. Inject tool schemas into system prompt
        2. Generate initial AI response
        3. Check for tool calls in response
        4. Execute tools if found
        5. Generate final response with tool results
        6. Repeat up to max_tool_iterations if more tools called

        Args:
            user_id: User ID
            prompt: User's message/prompt
            module: AI module (default: 'chat')
            enable_tools: Whether to enable tool calling
            user_context: Optional user context snapshot
            max_tool_iterations: Max tool call iterations (default: 3)
            **kwargs: Additional AIService.generate() parameters

        Returns:
            Final AIResponse after tool execution(s)
        """
        if not enable_tools or len(self.tool_registry) == 0:
            # No tools available or disabled - use normal generation
            logger.info("Tool calling disabled or no tools available, using standard generation")
            return self.ai_service.generate(
                user_id=user_id,
                prompt=prompt,
                module=module,
                user_context=user_context,
                **kwargs
            )

        # Get tool schemas
        tool_schemas = self.tool_registry.get_tool_schemas()
        logger.info(f"🔧 [AIOrchestrator] Tool calling enabled with {len(tool_schemas)} available tools: {[t['name'] for t in tool_schemas]}")

        # Build tool-augmented prompt
        augmented_prompt = self._build_tool_prompt(prompt, tool_schemas)
        logger.info(f"📝 [AIOrchestrator] Augmented prompt (first 500 chars):\n{augmented_prompt[:500]}...")

        # Track tool execution history
        tool_execution_history = []
        iteration = 0

        while iteration < max_tool_iterations:
            iteration += 1
            logger.info(f"🔄 Tool calling iteration {iteration}/{max_tool_iterations}")

            # Generate AI response
            response = self.ai_service.generate(
                user_id=user_id,
                prompt=augmented_prompt if iteration == 1 else self._build_continuation_prompt(
                    prompt,
                    tool_schemas,
                    tool_execution_history
                ),
                module=module,
                user_context=user_context,
                **kwargs
            )

            # Check for tool calls
            logger.info(f"🔍 [AIOrchestrator] AI response (first 500 chars):\n{response.content[:500]}...")
            tool_calls = self._parse_tool_calls(response.content)
            logger.info(f"🔍 [AIOrchestrator] Parsed {len(tool_calls)} tool call(s) from response")

            if not tool_calls:
                # No tool calls - return final response
                logger.info("✅ No tool calls detected, returning final response")
                return response

            logger.info(f"🛠️  Detected {len(tool_calls)} tool call(s): {[tc['tool'] for tc in tool_calls]}")

            # Execute tools
            tool_results = await self._execute_tools(user_id, tool_calls)

            # Add to history
            tool_execution_history.append({
                "iteration": iteration,
                "tool_calls": tool_calls,
                "tool_results": tool_results
            })

            # Check if all tools succeeded
            all_succeeded = all(result["success"] for result in tool_results)

            if not all_succeeded:
                # Some tools failed - return response with error info
                logger.warning("⚠️  Some tools failed, returning response with error info")
                error_summary = "\n".join([
                    f"- {result['tool_name']}: {result.get('error', 'Unknown error')}"
                    for result in tool_results
                    if not result["success"]
                ])
                response.content += f"\n\n[Tool Execution Errors:\n{error_summary}]"
                return response

            # Continue to next iteration with tool results
            logger.info(f"✅ All tools executed successfully, continuing to iteration {iteration + 1}")

        # Max iterations reached
        logger.warning(f"⚠️  Max tool iterations ({max_tool_iterations}) reached")
        return response

    def _build_tool_prompt(self, user_prompt: str, tool_schemas: List[Dict]) -> str:
        """
        Build prompt with tool schemas injected.

        Args:
            user_prompt: User's message
            tool_schemas: Available tool schemas

        Returns:
            Augmented prompt with tool instructions
        """
        tools_description = "\n\n".join([
            f"**Tool: {tool['name']}**\n"
            f"Description: {tool['description']}\n"
            f"Parameters: {json.dumps(tool['parameters'], indent=2)}"
            for tool in tool_schemas
        ])

        return f"""You have access to the following tools:

{tools_description}

To use a tool, respond with a JSON block in this exact format:
```tool_call
{{
  "tool": "tool_name",
  "parameters": {{
    "param1": "value1",
    "param2": "value2"
  }}
}}
```

You can call multiple tools by including multiple JSON blocks.

IMPORTANT: Only invoke tools when necessary. If you can answer without tools, do so directly.

User's message:
{user_prompt}"""

    def _build_continuation_prompt(
        self,
        original_prompt: str,
        tool_schemas: List[Dict],
        tool_history: List[Dict]
    ) -> str:
        """
        Build continuation prompt with tool execution history.

        Args:
            original_prompt: Original user prompt
            tool_schemas: Available tool schemas
            tool_history: Tool execution history

        Returns:
            Continuation prompt
        """
        history_summary = "\n\n".join([
            f"Iteration {h['iteration']}:\n"
            + "\n".join([
                f"- Called {tc['tool']} with {tc['parameters']}\n"
                f"  Result: {r['data'] if r['success'] else r['error']}"
                for tc, r in zip(h['tool_calls'], h['tool_results'])
            ])
            for h in tool_history
        ])

        return f"""Previous tool executions:

{history_summary}

Based on these tool results, please provide your final response to the user's request:
{original_prompt}

If you need to call more tools, use the same JSON format. Otherwise, provide your final answer."""

    def _parse_tool_calls(self, response_content: str) -> List[Dict]:
        """
        Parse tool calls from AI response.

        Looks for JSON blocks with format:
        ```tool_call
        {"tool": "tool_name", "parameters": {...}}
        ```

        Args:
            response_content: AI response text

        Returns:
            List of tool call dicts:
            [
                {
                    "tool": "modify_personality",
                    "parameters": {"active_personality": "dream_self"}
                },
                ...
            ]
        """
        tool_calls = []

        # Regex to find ```tool_call ... ``` blocks
        pattern = r'```tool_call\s*\n(.*?)\n```'
        matches = re.findall(pattern, response_content, re.DOTALL)

        for match in matches:
            try:
                tool_call = json.loads(match.strip())

                if "tool" in tool_call and "parameters" in tool_call:
                    tool_calls.append(tool_call)
                else:
                    logger.warning(f"Invalid tool call format (missing 'tool' or 'parameters'): {match}")

            except json.JSONDecodeError as e:
                logger.warning(f"Failed to parse tool call JSON: {match} - Error: {e}")

        return tool_calls

    async def _execute_tools(
        self,
        user_id: str,
        tool_calls: List[Dict]
    ) -> List[Dict]:
        """
        Execute multiple tool calls.

        Args:
            user_id: User ID for authorization
            tool_calls: List of tool call dicts

        Returns:
            List of tool execution results:
            [
                {
                    "tool_name": "modify_personality",
                    "success": True,
                    "data": {...}
                },
                ...
            ]
        """
        results = []

        for tool_call in tool_calls:
            tool_name = tool_call["tool"]
            parameters = tool_call["parameters"]

            logger.info(f"Executing tool: {tool_name} with params: {parameters}")

            try:
                result = await self.tool_registry.execute_tool(
                    tool_name=tool_name,
                    user_id=user_id,
                    parameters=parameters
                )

                results.append({
                    "tool_name": tool_name,
                    **result  # Includes success, data, error
                })

            except Exception as e:
                logger.error(f"Tool execution failed: {tool_name} - {e}")
                results.append({
                    "tool_name": tool_name,
                    "success": False,
                    "error": str(e)
                })

        return results
